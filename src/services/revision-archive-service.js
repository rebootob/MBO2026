/**
 * RevisionArchiveService
 *
 * Local business service for App 798 (Revision Archive) immutable evidence ledger.
 * Governed by locked D3-008 and D3-WP001-R4-R1.
 *
 * App 798 is an immutable event-scoped historical evidence ledger:
 * - STAGE_COMPLETION_SNAPSHOT
 * - EVALUATION_REVISION_CREATED
 * - ROUTE_REASSIGNMENT_PRECHANGE
 *
 * Zero real Kintone execution; works through an injected repository.
 */

import { hashD3Snapshot } from './d3-snapshot-serializer.js';
import {
  RevisionArchiveKintoneRepository,
  RevisionArchiveRepositoryError
} from './revision-archive-kintone-repository.js';

export const ARCHIVE_EVENT_TYPES = Object.freeze({
  STAGE_COMPLETION_SNAPSHOT: 'STAGE_COMPLETION_SNAPSHOT',
  EVALUATION_REVISION_CREATED: 'EVALUATION_REVISION_CREATED',
  ROUTE_REASSIGNMENT_PRECHANGE: 'ROUTE_REASSIGNMENT_PRECHANGE'
});

export const ARCHIVE_EVALUATION_STAGES = Object.freeze({
  OBJECTIVE: 'OBJECTIVE',
  MIDYEAR: 'MIDYEAR',
  FINAL: 'FINAL'
});

export class RevisionArchiveError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'RevisionArchiveError';
    this.code = code;
    this.details = details;
  }
}

function validateKeyComponent(value, componentName) {
  if (value === null || value === undefined || typeof value !== 'string') {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${componentName} must be a non-empty string in Archive_Key.`
    );
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed !== value) {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${componentName} cannot be empty or contain leading/trailing whitespace.`
    );
  }
  if (value.includes('|') || value.includes('\r') || value.includes('\n')) {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${componentName} contains invalid delimiter characters (| or newline).`
    );
  }
  return value;
}

function validatePositiveInteger(value, paramName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${paramName} must be a positive integer, received: ${value}.`
    );
  }
  return num;
}

export function buildArchiveKey({
  eventType,
  sourceRecordKey,
  evaluationStage,
  revisionNumber,
  supersededByRevision,
  stableEventId
}) {
  if (!Object.values(ARCHIVE_EVENT_TYPES).includes(eventType)) {
    throw new RevisionArchiveError(
      'ARCHIVE_UNSUPPORTED_EVENT_TYPE',
      `Unsupported archive event type: ${eventType}.`
    );
  }

  if (!Object.values(ARCHIVE_EVALUATION_STAGES).includes(evaluationStage)) {
    throw new RevisionArchiveError(
      'ARCHIVE_UNSUPPORTED_STAGE',
      `Unsupported evaluation stage: ${evaluationStage}.`
    );
  }

  const cleanKey = validateKeyComponent(sourceRecordKey, 'Source_Record_Key');
  const cleanStage = validateKeyComponent(evaluationStage, 'Evaluation_Stage');
  const cleanRev = validatePositiveInteger(revisionNumber, 'Revision_Number');

  if (eventType === ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT) {
    return `${cleanKey}|${cleanStage}|R${cleanRev}|STAGE_COMPLETION`;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED) {
    const cleanSuperseded = validatePositiveInteger(supersededByRevision, 'Superseded_By_Revision');
    if (cleanSuperseded <= cleanRev) {
      throw new RevisionArchiveError(
        'ARCHIVE_INVALID_KEY_COMPONENT',
        `Superseded_By_Revision (${cleanSuperseded}) must be greater than Revision_Number (${cleanRev}).`
      );
    }
    return `${cleanKey}|${cleanStage}|R${cleanRev}|EVALUATION_REVISION_CREATED|TO_R${cleanSuperseded}`;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE) {
    if (!stableEventId || typeof stableEventId !== 'string' || !stableEventId.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_STABLE_EVENT_ID_REQUIRED',
        'ROUTE_REASSIGNMENT_PRECHANGE requires a non-empty caller-supplied stableEventId.'
      );
    }
    const cleanEventId = validateKeyComponent(stableEventId, 'Stable_Event_ID');
    return `${cleanKey}|${cleanStage}|R${cleanRev}|ROUTE_REASSIGNMENT_PRECHANGE|${cleanEventId}`;
  }

  throw new RevisionArchiveError(
    'ARCHIVE_UNSUPPORTED_EVENT_TYPE',
    `Unhandled event type: ${eventType}`
  );
}

function resolveActorUserCode(actor) {
  if (!actor) {
    throw new RevisionArchiveError('ARCHIVE_ACTOR_NOT_RESOLVED', 'Archive actor is required.');
  }

  let userCode = '';
  if (typeof actor === 'string') {
    userCode = actor.trim();
  } else if (typeof actor === 'object') {
    if (typeof actor.userCode === 'string') {
      userCode = actor.userCode.trim();
    } else if (typeof actor.code === 'string') {
      userCode = actor.code.trim();
    } else {
      throw new RevisionArchiveError(
        'ARCHIVE_ACTOR_NOT_RESOLVED',
        'Archive actor object must specify userCode or code; display name alone is forbidden.'
      );
    }
  } else {
    throw new RevisionArchiveError('ARCHIVE_ACTOR_NOT_RESOLVED', 'Invalid actor type.');
  }

  if (!userCode || userCode.toUpperCase() === 'SYSTEM') {
    throw new RevisionArchiveError(
      'ARCHIVE_ACTOR_NOT_RESOLVED',
      'Archive actor userCode must be a non-empty string and cannot be generic "SYSTEM".'
    );
  }

  return userCode;
}

function resolveReason(eventType, evaluationStage, rawReason) {
  const trimmed = typeof rawReason === 'string' ? rawReason.trim() : '';

  if (eventType === ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT) {
    if (trimmed) return trimmed;
    return `STAGE_COMPLETION_SNAPSHOT:${evaluationStage}`;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED) {
    if (!trimmed) {
      throw new RevisionArchiveError(
        'ARCHIVE_REASON_REQUIRED',
        'EVALUATION_REVISION_CREATED requires an explicit approved business reason.'
      );
    }
    return trimmed;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE) {
    if (!trimmed) {
      throw new RevisionArchiveError(
        'ARCHIVE_REASON_REQUIRED',
        'ROUTE_REASSIGNMENT_PRECHANGE requires an explicit approved reassignment reason.'
      );
    }
    return trimmed;
  }

  return trimmed;
}

function resolveArchivedAt(explicitArchivedAt, clock) {
  if (explicitArchivedAt) {
    if (typeof explicitArchivedAt !== 'string' || !explicitArchivedAt.trim()) {
      throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', 'archivedAt must be a non-empty ISO string.');
    }
    const d = new Date(explicitArchivedAt);
    if (Number.isNaN(d.getTime())) {
      throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', `Invalid date format: ${explicitArchivedAt}`);
    }
    return explicitArchivedAt.trim();
  }

  if (typeof clock === 'function') {
    const d = clock();
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
    if (typeof d === 'string' && !Number.isNaN(new Date(d).getTime())) {
      return d;
    }
  }

  return new Date().toISOString();
}

function validateSnapshotCoherence(logicalSnapshot, request) {
  if (!logicalSnapshot || typeof logicalSnapshot !== 'object') {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Logical snapshot is required and must be a plain object.'
    );
  }

  const { source, stage, profile, route, scoring } = logicalSnapshot;

  if (!source || !stage || !profile || !route || !scoring) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Logical snapshot is missing required core sections (source, stage, profile, route, scoring).'
    );
  }

  if (source.Record_Key !== request.sourceRecordKey) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Record_Key (${source.Record_Key}) does not match request Source_Record_Key (${request.sourceRecordKey}).`
    );
  }

  if (source.Employee_Code !== request.employeeCode) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Employee_Code (${source.Employee_Code}) does not match request Employee_Code (${request.employeeCode}).`
    );
  }

  if (source.Fiscal_Year !== request.fiscalYear) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Fiscal_Year (${source.Fiscal_Year}) does not match request Fiscal_Year (${request.fiscalYear}).`
    );
  }

  if (request.sourceRecordId !== undefined && request.sourceRecordId !== null && request.sourceRecordId !== '') {
    if (String(source.Record_ID) !== String(request.sourceRecordId)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Snapshot source.Record_ID (${source.Record_ID}) does not match request Source_Record_ID (${request.sourceRecordId}).`
      );
    }
  }

  if (stage.Evaluation_Stage !== request.evaluationStage) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot stage.Evaluation_Stage (${stage.Evaluation_Stage}) does not match request Evaluation_Stage (${request.evaluationStage}).`
    );
  }

  if (Number(stage.Revision_Number) !== Number(request.revisionNumber)) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot stage.Revision_Number (${stage.Revision_Number}) does not match request Revision_Number (${request.revisionNumber}).`
    );
  }

  if (!profile.Frozen_Profile_Code || profile.K_expected_Snapshot === undefined || profile.K_expected_Snapshot === null) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot profile section must contain Frozen_Profile_Code and K_expected_Snapshot.'
    );
  }

  if (!route.Effective_Routing_Key || !route.Effective_Route_Version_Key || !Array.isArray(route.Workflow_Appraisers)) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot route section must contain Effective_Routing_Key, Effective_Route_Version_Key, and Workflow_Appraisers array.'
    );
  }

  if (!Array.isArray(scoring.Scorers)) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot scoring section must contain Scorers array.'
    );
  }
}

export class RevisionArchiveService {
  /**
   * @param {RevisionArchiveKintoneRepository|object} repository - Repository instance or injected Kintone API adapter
   * @param {object} [options]
   * @param {function} [options.clock] - Optional injected clock function returning Date or ISO string
   */
  constructor(repository, options = {}) {
    if (!repository) {
      throw new RevisionArchiveError(
        'REPOSITORY_REQUIRED',
        'RevisionArchiveService requires a repository instance or injected Kintone API adapter.'
      );
    }

    if (repository instanceof RevisionArchiveKintoneRepository) {
      this.repository = repository;
    } else {
      this.repository = new RevisionArchiveKintoneRepository(repository, options);
    }

    this.clock = options.clock || null;
  }

  /**
   * Archives a stage completion event.
   */
  async archiveStageCompletion(params) {
    return this._archiveEvent({
      ...params,
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      supersededByRevision: undefined
    });
  }

  /**
   * Archives a controlled reopen revision-created event.
   */
  async archiveEvaluationRevisionCreated(params) {
    const revisionNumber = params.oldRevisionNumber !== undefined ? params.oldRevisionNumber : params.revisionNumber;
    const supersededByRevision = params.newRevisionNumber !== undefined ? params.newRevisionNumber : params.supersededByRevision;

    return this._archiveEvent({
      ...params,
      revisionNumber,
      supersededByRevision,
      eventType: ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED
    });
  }

  /**
   * Archives a pre-change route reassignment event.
   */
  async archiveRouteReassignmentPrechange(params) {
    return this._archiveEvent({
      ...params,
      eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
      supersededByRevision: undefined
    });
  }

  /**
   * Core execution pipeline for immutable archive events.
   * @private
   */
  async _archiveEvent(params) {
    const {
      eventType,
      sourceRecordKey,
      employeeCode,
      fiscalYear,
      evaluationStage,
      revisionNumber,
      supersededByRevision,
      stableEventId,
      sourceRecordId,
      previousStatus,
      actor,
      reason: rawReason,
      archivedAt: explicitArchivedAt,
      logicalSnapshot
    } = params;

    // 1. Validate inputs and construct deterministic Archive_Key
    const archiveKey = buildArchiveKey({
      eventType,
      sourceRecordKey,
      evaluationStage,
      revisionNumber,
      supersededByRevision,
      stableEventId
    });

    const actorUserCode = resolveActorUserCode(actor);
    const reason = resolveReason(eventType, evaluationStage, rawReason);
    const archivedAt = resolveArchivedAt(explicitArchivedAt, this.clock);

    // 2. Validate snapshot coherence & compute deterministic hash
    validateSnapshotCoherence(logicalSnapshot, {
      sourceRecordKey,
      employeeCode,
      fiscalYear,
      evaluationStage,
      revisionNumber,
      sourceRecordId
    });

    const { canonicalJson, sha256 } = hashD3Snapshot(logicalSnapshot);

    // 3. Check for existing record (Idempotency Contract)
    const existingRecords = await this.repository.findByArchiveKey(archiveKey);

    if (existingRecords.length > 1) {
      throw new RevisionArchiveError(
        'ARCHIVE_DUPLICATE_KEY_CORRUPTION',
        `Data corruption: multiple rows (${existingRecords.length}) exist in App 798 for Archive_Key: ${archiveKey}.`
      );
    }

    if (existingRecords.length === 1) {
      const existing = existingRecords[0];

      // Exact logical replay verification:
      // Compare immutable facts (Archived_At is retry timestamp and does not redefine event identity)
      const matchesKey = existing.archiveKey === archiveKey;
      const matchesSourceKey = existing.sourceRecordKey === sourceRecordKey;
      const matchesFy = existing.fiscalYear === fiscalYear;
      const matchesEmp = existing.employeeCode === employeeCode;
      const matchesStage = existing.evaluationStage === evaluationStage;
      const matchesRev = Number(existing.revisionNumber) === Number(revisionNumber);
      const matchesSuperseded = (existing.supersededByRevision || null) === (supersededByRevision ? Number(supersededByRevision) : null);
      const matchesEventType = existing.eventType === eventType;
      const matchesReason = existing.reason === reason;
      const matchesHash = existing.snapshotHash === sha256;
      const matchesJson = existing.snapshotJson === canonicalJson;
      const matchesActor = existing.archivedBy?.[0]?.code === actorUserCode;
      const matchesSourceId = sourceRecordId
        ? Number(existing.sourceRecordId) === Number(sourceRecordId)
        : true;

      const isExactReplay = (
        matchesKey &&
        matchesSourceKey &&
        matchesFy &&
        matchesEmp &&
        matchesStage &&
        matchesRev &&
        matchesSuperseded &&
        matchesEventType &&
        matchesReason &&
        matchesHash &&
        matchesJson &&
        matchesActor &&
        matchesSourceId
      );

      if (isExactReplay) {
        return this._buildVerifiedEvidence({
          archiveKey,
          eventType,
          snapshotHash: sha256,
          idempotentReplay: true,
          recovered: false,
          sourceRecordKey,
          employeeCode,
          fiscalYear,
          evaluationStage,
          revisionNumber: Number(revisionNumber),
          supersededByRevision: supersededByRevision ? Number(supersededByRevision) : null,
          archivedBy: actorUserCode,
          archivedAt: existing.archivedAt
        });
      }

      // Conflict found
      throw new RevisionArchiveError(
        'ARCHIVE_IDEMPOTENCY_CONFLICT',
        `Archive_Key ${archiveKey} already exists with conflicting snapshot or event identity facts.`
      );
    }

    // 4. Record payload mapping
    const recordPayload = {
      Archive_Key: { value: archiveKey },
      Source_Record_Key: { value: sourceRecordKey },
      Fiscal_Year: { value: fiscalYear },
      Employee_Code: { value: employeeCode },
      Evaluation_Stage: { value: evaluationStage },
      Revision_Number: { value: String(revisionNumber) },
      Event_Type: { value: eventType },
      Reason: { value: reason },
      Snapshot_JSON: { value: canonicalJson },
      Snapshot_Hash: { value: sha256 },
      Archived_By: { value: [{ code: actorUserCode }] },
      Archived_At: { value: archivedAt }
    };

    if (sourceRecordId !== undefined && sourceRecordId !== null && sourceRecordId !== '') {
      recordPayload.Source_Record_ID = { value: String(sourceRecordId) };
    }
    if (previousStatus) {
      recordPayload.Previous_Status = { value: String(previousStatus) };
    }
    if (supersededByRevision !== undefined && supersededByRevision !== null && supersededByRevision !== '') {
      recordPayload.Superseded_By_Revision = { value: String(supersededByRevision) };
    }

    // 5. Attempt creation with Uncertain Write Handling
    let createError = null;
    try {
      await this.repository.createArchiveRecord(recordPayload);
    } catch (err) {
      createError = err;
    }

    if (createError) {
      // Handle uncertain transport: check if the row was actually written
      const recoveryRecords = await this.repository.findByArchiveKey(archiveKey);
      if (recoveryRecords.length === 1) {
        const rec = recoveryRecords[0];
        if (rec.snapshotHash === sha256 && rec.snapshotJson === canonicalJson && rec.archivedBy?.[0]?.code === actorUserCode) {
          return this._buildVerifiedEvidence({
            archiveKey,
            eventType,
            snapshotHash: sha256,
            idempotentReplay: false,
            recovered: true,
            sourceRecordKey,
            employeeCode,
            fiscalYear,
            evaluationStage,
            revisionNumber: Number(revisionNumber),
            supersededByRevision: supersededByRevision ? Number(supersededByRevision) : null,
            archivedBy: actorUserCode,
            archivedAt: rec.archivedAt
          });
        }
        throw new RevisionArchiveError(
          'ARCHIVE_IDEMPOTENCY_CONFLICT',
          `Uncertain write recovery found conflicting row for Archive_Key ${archiveKey}.`
        );
      }
      if (recoveryRecords.length > 1) {
        throw new RevisionArchiveError(
          'ARCHIVE_DUPLICATE_KEY_CORRUPTION',
          `Multiple rows found during uncertain write recovery for Archive_Key ${archiveKey}.`
        );
      }
      // Row not found; fail closed with uncertain classification
      throw new RevisionArchiveError(
        'ARCHIVE_TRANSPORT_UNCERTAIN',
        `Failed to create archive row and record not found on read-back: ${createError.message}`,
        createError
      );
    }

    // 6. Create + Read-back verification
    const readBack = await this.repository.readBackExactArchiveRecord(archiveKey);

    if (
      readBack.snapshotHash !== sha256 ||
      readBack.snapshotJson !== canonicalJson ||
      readBack.archiveKey !== archiveKey ||
      readBack.sourceRecordKey !== sourceRecordKey ||
      readBack.evaluationStage !== evaluationStage ||
      Number(readBack.revisionNumber) !== Number(revisionNumber) ||
      readBack.archivedBy?.[0]?.code !== actorUserCode ||
      readBack.archivedAt !== archivedAt
    ) {
      throw new RevisionArchiveError(
        'ARCHIVE_READBACK_VERIFICATION_FAILED',
        `App 798 read-back verification failed for Archive_Key ${archiveKey}: persisted data did not match expected values.`
      );
    }

    return this._buildVerifiedEvidence({
      archiveKey,
      eventType,
      snapshotHash: sha256,
      idempotentReplay: false,
      recovered: false,
      sourceRecordKey,
      employeeCode,
      fiscalYear,
      evaluationStage,
      revisionNumber: Number(revisionNumber),
      supersededByRevision: supersededByRevision ? Number(supersededByRevision) : null,
      archivedBy: actorUserCode,
      archivedAt
    });
  }

  _buildVerifiedEvidence(data) {
    return Object.freeze({
      verified: true,
      serviceVersion: 'D3_V1',
      ...data
    });
  }

  /**
   * Pure verification helper to confirm an evidence object was produced by this service.
   * @param {object} evidence
   * @returns {boolean}
   */
  static validateArchiveEvidence(evidence) {
    if (!evidence || typeof evidence !== 'object') return false;
    if (evidence.verified !== true) return false;
    if (evidence.serviceVersion !== 'D3_V1') return false;
    if (!evidence.archiveKey || typeof evidence.archiveKey !== 'string') return false;
    if (!evidence.snapshotHash || typeof evidence.snapshotHash !== 'string') return false;
    if (!Object.values(ARCHIVE_EVENT_TYPES).includes(evidence.eventType)) return false;
    if (!Object.values(ARCHIVE_EVALUATION_STAGES).includes(evidence.evaluationStage)) return false;
    return true;
  }

  /**
   * Archive-Before-Change gate helper.
   * Fails closed if evidence is missing, invalid, or does not match expected context.
   */
  static assertArchiveBeforeChangeGate(evidence, expectedContext = {}) {
    if (!RevisionArchiveService.validateArchiveEvidence(evidence)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        'Operation blocked: required verified archive evidence was not provided or is invalid.'
      );
    }

    if (expectedContext.sourceRecordKey && evidence.sourceRecordKey !== expectedContext.sourceRecordKey) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence sourceRecordKey (${evidence.sourceRecordKey}) does not match expected (${expectedContext.sourceRecordKey}).`
      );
    }

    if (expectedContext.evaluationStage && evidence.evaluationStage !== expectedContext.evaluationStage) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence evaluationStage (${evidence.evaluationStage}) does not match expected (${expectedContext.evaluationStage}).`
      );
    }

    if (expectedContext.revisionNumber && Number(evidence.revisionNumber) !== Number(expectedContext.revisionNumber)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence revisionNumber (${evidence.revisionNumber}) does not match expected (${expectedContext.revisionNumber}).`
      );
    }

    if (expectedContext.eventType && evidence.eventType !== expectedContext.eventType) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence eventType (${evidence.eventType}) does not match expected (${expectedContext.eventType}).`
      );
    }

    return true;
  }
}
