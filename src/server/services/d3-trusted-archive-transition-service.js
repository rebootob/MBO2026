import { buildStageLogicalSnapshot } from '../../services/d3-stage-logical-snapshot.js';
import { hashD3Snapshot } from '../../services/d3-snapshot-serializer.js';
import { buildArchiveKey, ARCHIVE_EVENT_TYPES } from '../../services/revision-archive-service.js';
import { D3AttestationVerifier } from './d3-attestation-verifier.js';

export class D3TransitionError extends Error {
  constructor(code, message, details = {}) {
    super(`[D3_TRANSITION_ERROR] ${code}: ${message}`);
    this.name = 'D3TransitionError';
    this.code = code;
    this.details = details;
  }
}

export const D3_STAGE_TRANSITION_SPECS = {
  'Start Mid-Year': {
    action: 'Start Mid-Year',
    expectedFromStatus: '05 Objective Approved',
    expectedTargetStatus: '06 Employee Mid-Year',
    targetStage: 'OBJECTIVE'
  },
  'Start Self Evaluation': {
    action: 'Start Self Evaluation',
    expectedFromStatus: '10 Mid-Year Completed',
    expectedTargetStatus: '11 Employee Self Evaluation',
    targetStage: 'MIDYEAR'
  },
  'Complete': {
    action: 'Complete',
    expectedFromStatus: '15 HR Final Check',
    expectedTargetStatus: '16 Completed',
    targetStage: 'FINAL'
  }
};

export class D3TrustedArchiveTransitionService {
  constructor(options = {}) {
    this.tokenStore = options.tokenStore;
    this.attestationVerifier = options.attestationVerifier || new D3AttestationVerifier();
    this.archiveService = options.archiveService;
    this.privilegedKintoneAdapter = options.privilegedKintoneAdapter;
    this.userOAuthKintoneAdapterFactory = options.userOAuthKintoneAdapterFactory;
    this.attestationAppId = options.attestationAppId || 799;
    this.app794Id = options.app794Id || 794;
    this.app798Id = options.app798Id || 798;
    this.clock = options.clock || (() => new Date().toISOString());
  }

  /**
   * Helper to unwrap field value
   */
  _getFieldVal(fieldObj) {
    if (fieldObj && typeof fieldObj === 'object' && 'value' in fieldObj) {
      return fieldObj.value;
    }
    return fieldObj;
  }

  /**
   * Executes trusted archive and process transition pipeline.
   *
   * @param {object} intent Bounded transition intent
   * @param {string|number} intent.recordId App 794 Record ID
   * @param {string} intent.intendedAction Workflow action (e.g. 'Start Mid-Year')
   * @param {string} intent.sessionBinding Server-derived authenticated session binding
   */
  async executeTrustedTransition({ recordId, intendedAction, sessionBinding }) {
    if (!recordId || Number(recordId) <= 0) {
      throw new D3TransitionError('INVALID_INTENT', 'recordId must be a positive number');
    }
    if (!intendedAction || typeof intendedAction !== 'string') {
      throw new D3TransitionError('INVALID_INTENT', 'intendedAction is required');
    }
    if (!sessionBinding || typeof sessionBinding !== 'string') {
      throw new D3TransitionError('INVALID_INTENT', 'sessionBinding is required');
    }

    const transitionSpec = D3_STAGE_TRANSITION_SPECS[intendedAction];
    if (!transitionSpec) {
      throw new D3TransitionError('UNSUPPORTED_ACTION', `Action "${intendedAction}" is not a governed D3 stage transition`);
    }

    // Step 2: Load SAME backend-held user OAuth authority by sessionBinding
    if (!this.tokenStore) {
      throw new D3TransitionError('TOKEN_STORE_UNAVAILABLE', 'Token store dependency missing');
    }
    const grant = await this.tokenStore.loadGrant(sessionBinding);
    if (!grant || !grant.accessToken) {
      throw new D3TransitionError('OAUTH_GRANT_REQUIRED', 'No valid OAuth grant found for authenticated session');
    }

    if (typeof this.userOAuthKintoneAdapterFactory !== 'function') {
      throw new D3TransitionError('DEPENDENCY_MISSING', 'userOAuthKintoneAdapterFactory is required');
    }
    const userKintone = this.userOAuthKintoneAdapterFactory(grant);

    // Step 3: Authoritative GET App794 through injected user OAuth Kintone adapter
    let app794Record;
    try {
      app794Record = await userKintone.getRecord(this.app794Id, recordId);
    } catch (err) {
      throw new D3TransitionError('APP794_FETCH_FAILED', `Failed authoritative fetch of App 794 record ${recordId}: ${err.message}`);
    }

    if (!app794Record) {
      throw new D3TransitionError('APP794_RECORD_NOT_FOUND', `App 794 record ${recordId} not found`);
    }

    // Step 4: Validate record identity, current status, and Kintone system $revision
    const fetchedRecordId = String(this._getFieldVal(app794Record.$id) || this._getFieldVal(app794Record.Record_ID) || '').trim();
    if (fetchedRecordId && fetchedRecordId !== String(recordId)) {
      throw new D3TransitionError('RECORD_IDENTITY_MISMATCH', `Fetched record ID ${fetchedRecordId} does not match requested ${recordId}`);
    }

    const currentStatus = String(this._getFieldVal(app794Record.Status) || '').trim();
    if (currentStatus !== transitionSpec.expectedFromStatus) {
      throw new D3TransitionError(
        'INVALID_STATUS_PRECONDITION',
        `Current status "${currentStatus}" does not match required pre-status "${transitionSpec.expectedFromStatus}" for action "${intendedAction}"`
      );
    }

    // Lock: APP794_SYSTEM_REVISION_REQUIRED = YES
    // Must require Kintone system: $revision (no fallback to Revision, Revision_Number, "1", etc.)
    // If $revision missing, blank, non-integer, or <= 0: FAIL CLOSED (APP794_REVISION_NOT_RESOLVED)
    const rawRevisionVal = this._getFieldVal(app794Record.$revision);
    if (rawRevisionVal === undefined || rawRevisionVal === null || String(rawRevisionVal).trim() === '') {
      throw new D3TransitionError('APP794_REVISION_NOT_RESOLVED', 'App 794 record missing required system $revision field');
    }
    const parsedRevision = Number(rawRevisionVal);
    if (!Number.isInteger(parsedRevision) || parsedRevision <= 0) {
      throw new D3TransitionError('APP794_REVISION_NOT_RESOLVED', `App 794 system $revision must be a positive integer, got "${rawRevisionVal}"`);
    }
    const preRevision = parsedRevision;

    // Step 5: Build canonical snapshot through shared builder
    const targetStage = transitionSpec.targetStage;
    const logicalSnapshot = buildStageLogicalSnapshot(app794Record, targetStage, currentStatus);

    // Step 6: Compute canonical Snapshot_Hash using existing serializer authority
    const hashResult = hashD3Snapshot(logicalSnapshot);
    const snapshotHash = typeof hashResult === 'string' ? hashResult : hashResult?.sha256;

    // Step 7: Derive Archive_Key using existing buildArchiveKey authority
    const archiveKey = buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      sourceRecordKey: logicalSnapshot.source.Record_Key,
      evaluationStage: logicalSnapshot.stage.Evaluation_Stage,
      revisionNumber: logicalSnapshot.stage.Revision_Number
    });

    // Step 8: Create and verify platform-stamped attestation
    const { nonce, issuedAt, expiresAt } = this.attestationVerifier.generateNonce({
      recordId,
      archiveKey,
      expectedFromStatus: transitionSpec.expectedFromStatus,
      intendedAction,
      expectedTargetStatus: transitionSpec.expectedTargetStatus,
      snapshotHash
    });

    const attestationPayload = this.attestationVerifier.buildAttestationPayload({
      nonce,
      recordId,
      archiveKey,
      expectedFromStatus: transitionSpec.expectedFromStatus,
      intendedAction,
      expectedTargetStatus: transitionSpec.expectedTargetStatus,
      snapshotHash,
      issuedAt,
      expiresAt
    });

    let attestationRecordId;
    try {
      const attestationCreateRes = await userKintone.addRecord(this.attestationAppId, attestationPayload);
      attestationRecordId = attestationCreateRes?.id;
    } catch (err) {
      throw new D3TransitionError('ATTESTATION_CREATE_FAILED', `Failed to write platform-stamped attestation: ${err.message}`);
    }

    if (!attestationRecordId) {
      throw new D3TransitionError('ATTESTATION_CREATE_FAILED', 'Attestation record ID was not returned');
    }

    // Read back attestation record via privileged adapter
    let attestationRecord;
    try {
      attestationRecord = await this.privilegedKintoneAdapter.getRecord(this.attestationAppId, attestationRecordId);
    } catch (err) {
      throw new D3TransitionError('ATTESTATION_READBACK_FAILED', `Failed privileged readback of attestation: ${err.message}`);
    }

    // Step 9: Verify readback and extract platform CREATOR
    const verifyResult = this.attestationVerifier.verifyAttestationReadback(attestationRecord, {
      nonce,
      recordId,
      archiveKey,
      expectedFromStatus: transitionSpec.expectedFromStatus,
      intendedAction,
      expectedTargetStatus: transitionSpec.expectedTargetStatus,
      snapshotHash,
      issuedAt,
      expiresAt
    });

    const actorCode = verifyResult.actorCode;

    // Step 10: Execute App 798 archive via existing RevisionArchiveService
    if (!this.archiveService) {
      throw new D3TransitionError('DEPENDENCY_MISSING', 'archiveService is required');
    }

    let archiveResult;
    try {
      archiveResult = await this.archiveService.archiveStageCompletion({
        sourceRecordKey: logicalSnapshot.source.Record_Key,
        employeeCode: logicalSnapshot.source.Employee_Code,
        fiscalYear: logicalSnapshot.source.Fiscal_Year,
        evaluationStage: targetStage,
        revisionNumber: logicalSnapshot.stage.Revision_Number,
        sourceRecordId: Number(recordId),
        previousStatus: currentStatus,
        actor: { userCode: actorCode },
        archivedAt: typeof this.clock === 'function' ? this.clock() : new Date().toISOString(),
        logicalSnapshot
      });
    } catch (err) {
      throw new D3TransitionError('ARCHIVE_MUTATION_FAILED', `App 798 archive failed: ${err.message}`);
    }

    // Step 11: Verify archive success before transition
    if (!archiveResult || archiveResult.success === false) {
      throw new D3TransitionError('ARCHIVE_MUTATION_FAILED', 'App 798 archive returned unsuccessful result');
    }

    // Step 12: Execute App 794 Process Management transition using SAME retained user OAuth authority
    // Lock: APP794_TRANSITION_EXPECTED_REVISION = REQUIRED
    try {
      const transitionResult = await userKintone.updateRecordStatus({
        app: this.app794Id,
        id: recordId,
        action: intendedAction,
        revision: preRevision
      });

      return {
        status: 'TRANSITION_COMMITTED',
        recordId,
        targetStage,
        previousStatus: currentStatus,
        newStatus: transitionSpec.expectedTargetStatus,
        archiveResult,
        transitionResult
      };
    } catch (transitionErr) {
      // Step 13: Handle ambiguous timeout/failure with readback classification
      // BLIND_TRANSITION_RETRY_AFTER_TIMEOUT = FORBIDDEN
      return await this._reconcileAmbiguousTransition({
        recordId,
        intendedAction,
        expectedFromStatus: transitionSpec.expectedFromStatus,
        expectedTargetStatus: transitionSpec.expectedTargetStatus,
        preRevision,
        userKintone,
        archiveResult,
        error: transitionErr
      });
    }
  }

  /**
   * Reconciles transition outcome when transport times out or fails.
   */
  async _reconcileAmbiguousTransition({
    recordId,
    intendedAction,
    expectedFromStatus,
    expectedTargetStatus,
    preRevision,
    userKintone,
    archiveResult,
    error
  }) {
    let readbackRecord;
    try {
      readbackRecord = await userKintone.getRecord(this.app794Id, recordId);
    } catch (rbErr) {
      throw new D3TransitionError(
        'TRANSITION_RESULT_AMBIGUOUS',
        'Transition failed and authoritative readback is unavailable',
        { originalError: error?.message, readbackError: rbErr?.message }
      );
    }

    const currentStatus = String(this._getFieldVal(readbackRecord.Status) || '').trim();
    const rawRbRevision = this._getFieldVal(readbackRecord.$revision);
    const currentRevision = Number(rawRbRevision);

    // Case 1: Target state was already observed!
    if (currentStatus === expectedTargetStatus) {
      return {
        status: 'TRANSITION_COMMITTED_STATE_OBSERVED',
        recordId,
        previousStatus: expectedFromStatus,
        newStatus: currentStatus,
        archiveResult,
        note: 'Transition succeeded despite initial transport failure/timeout'
      };
    }

    // Case 2: Status is still pre-status and revision unchanged -> not committed, retryable
    if (currentStatus === expectedFromStatus && currentRevision === preRevision) {
      throw new D3TransitionError(
        'TRANSITION_NOT_COMMITTED_RETRYABLE',
        `Transition did not commit. Record remains at status "${currentStatus}" (revision ${currentRevision})`,
        { canRetry: true, recordId, currentStatus, currentRevision }
      );
    }

    // Case 3: State or revision changed unexpectedly
    throw new D3TransitionError(
      'TRANSITION_CONFLICT',
      `Record state is in conflict. Observed status "${currentStatus}" (revision ${currentRevision}), expected "${expectedTargetStatus}"`,
      { recordId, currentStatus, currentRevision, expectedTargetStatus }
    );
  }
}
