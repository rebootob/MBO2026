import crypto from 'node:crypto';

/**
 * Attestation Verifier and Nonce Lifecycle Manager.
 *
 * Implements:
 * - High-entropy nonce generation
 * - Single-use UNCONSUMED / CONSUMED lifecycle with replay rejection
 * - Maximum TTL <= 60 seconds
 * - Full 9-field event-binding envelope
 * - Privileged readback verification
 * - Kintone platform-stamped CREATOR actor extraction (CREATOR.value.code ONLY)
 */

export class D3AttestationError extends Error {
  constructor(code, message) {
    super(`[D3_ATTESTATION_ERROR] ${code}: ${message}`);
    this.name = 'D3AttestationError';
    this.code = code;
  }
}

export const ATTESTATION_MAX_TTL_SECONDS = 60;

export class D3AttestationVerifier {
  constructor(options = {}) {
    this.maxTtlSeconds = Math.min(options.maxTtlSeconds || ATTESTATION_MAX_TTL_SECONDS, 60);
    this.clock = options.clock || (() => Date.now());
    // In-memory nonce tracker: Map<nonce, { status, issuedAt, expiresAt, binding }>
    this.nonceStore = new Map();
  }

  /**
   * Generates a high-entropy server-side cryptographic nonce.
   */
  generateNonce(eventBinding = {}) {
    const nonce = crypto.randomBytes(32).toString('hex');
    const now = this.clock();
    const expiresAt = now + (this.maxTtlSeconds * 1000);
    const issuedAtIso = new Date(now).toISOString();
    const expiresAtIso = new Date(expiresAt).toISOString();

    this.nonceStore.set(nonce, {
      status: 'UNCONSUMED',
      issuedAt: now,
      expiresAt,
      issuedAtIso,
      expiresAtIso,
      binding: { ...eventBinding }
    });

    return {
      nonce,
      issuedAt: issuedAtIso,
      expiresAt: expiresAtIso
    };
  }

  /**
   * Builds the Kintone Attestation App record payload.
   */
  buildAttestationPayload({
    nonce,
    recordId,
    archiveKey,
    expectedFromStatus,
    intendedAction,
    expectedTargetStatus,
    snapshotHash,
    issuedAt,
    expiresAt
  }) {
    if (!nonce || !recordId || !archiveKey || !expectedFromStatus || !intendedAction || !expectedTargetStatus || !snapshotHash || !issuedAt || !expiresAt) {
      throw new D3AttestationError('MISSING_BINDING_FIELD', 'All event binding fields are required');
    }

    return {
      Transaction_Nonce: { value: String(nonce) },
      App794_Record_ID: { value: String(recordId) },
      Archive_Key: { value: String(archiveKey) },
      Expected_From_Status: { value: String(expectedFromStatus) },
      Intended_Action: { value: String(intendedAction) },
      Expected_Target_Status: { value: String(expectedTargetStatus) },
      Snapshot_Hash: { value: String(snapshotHash) },
      Issued_At: { value: String(issuedAt) },
      Expires_At: { value: String(expiresAt) }
    };
  }

  /**
   * Helper to unwrap Kintone field values.
   */
  _getFieldVal(fieldObj) {
    if (fieldObj && typeof fieldObj === 'object' && 'value' in fieldObj) {
      return fieldObj.value;
    }
    return fieldObj;
  }

  /**
   * Consumes a nonce. Fails closed if missing, expired, or already consumed.
   */
  consumeNonce(nonce) {
    const entry = this.nonceStore.get(nonce);
    if (!entry) {
      throw new D3AttestationError('ATTESTATION_NONCE_NOT_FOUND', `Nonce not registered: ${nonce}`);
    }

    if (entry.status === 'CONSUMED') {
      throw new D3AttestationError('ATTESTATION_REPLAY_DETECTED', `Nonce already consumed: ${nonce}`);
    }

    const now = this.clock();
    if (now > entry.expiresAt) {
      throw new D3AttestationError('ATTESTATION_EXPIRED', `Nonce has expired: ${nonce}`);
    }

    entry.status = 'CONSUMED';
    entry.consumedAt = now;
  }

  /**
   * Performs full verification of privileged readback from Attestation App.
   *
   * Enforces:
   * 1. 9-field event binding exact match (including Issued_At and Expires_At)
   * 2. Expiry verification
   * 3. Nonce unconsumed check and consumption
   * 4. Platform CREATOR extraction strictly via CREATOR.value.code
   */
  verifyAttestationReadback(attestationRecord, expectedBinding) {
    if (!attestationRecord || typeof attestationRecord !== 'object') {
      throw new D3AttestationError('ATTESTATION_RECORD_MISSING', 'Attestation record is missing or invalid');
    }

    const nonce = String(this._getFieldVal(attestationRecord.Transaction_Nonce) || '').trim();
    if (!nonce || nonce !== expectedBinding.nonce) {
      throw new D3AttestationError('ATTESTATION_NONCE_MISMATCH', `Expected nonce "${expectedBinding.nonce}", got "${nonce}"`);
    }

    // Check nonce tracking in local store
    const tracked = this.nonceStore.get(nonce);
    if (!tracked) {
      throw new D3AttestationError('ATTESTATION_NONCE_NOT_FOUND', `Nonce not registered: ${nonce}`);
    }
    if (tracked.status === 'CONSUMED') {
      throw new D3AttestationError('ATTESTATION_REPLAY_DETECTED', `Nonce already consumed: ${nonce}`);
    }

    // Check TTL / expiry
    const now = this.clock();
    if (now > tracked.expiresAt) {
      throw new D3AttestationError('ATTESTATION_EXPIRED', `Attestation transaction expired for nonce ${nonce}`);
    }

    // Event binding checks
    const recId = String(this._getFieldVal(attestationRecord.App794_Record_ID) || '').trim();
    if (recId !== String(expectedBinding.recordId)) {
      throw new D3AttestationError('ATTESTATION_RECORD_ID_MISMATCH', `Expected recordId "${expectedBinding.recordId}", got "${recId}"`);
    }

    const archiveKey = String(this._getFieldVal(attestationRecord.Archive_Key) || '').trim();
    if (archiveKey !== expectedBinding.archiveKey) {
      throw new D3AttestationError('ATTESTATION_ARCHIVE_KEY_MISMATCH', `Expected archiveKey "${expectedBinding.archiveKey}", got "${archiveKey}"`);
    }

    const fromStatus = String(this._getFieldVal(attestationRecord.Expected_From_Status) || '').trim();
    if (fromStatus !== expectedBinding.expectedFromStatus) {
      throw new D3AttestationError('ATTESTATION_FROM_STATUS_MISMATCH', `Expected fromStatus "${expectedBinding.expectedFromStatus}", got "${fromStatus}"`);
    }

    const action = String(this._getFieldVal(attestationRecord.Intended_Action) || '').trim();
    if (action !== expectedBinding.intendedAction) {
      throw new D3AttestationError('ATTESTATION_ACTION_MISMATCH', `Expected action "${expectedBinding.intendedAction}", got "${action}"`);
    }

    const targetStatus = String(this._getFieldVal(attestationRecord.Expected_Target_Status) || '').trim();
    if (targetStatus !== expectedBinding.expectedTargetStatus) {
      throw new D3AttestationError('ATTESTATION_TARGET_STATUS_MISMATCH', `Expected targetStatus "${expectedBinding.expectedTargetStatus}", got "${targetStatus}"`);
    }

    const snapshotHash = String(this._getFieldVal(attestationRecord.Snapshot_Hash) || '').trim();
    if (snapshotHash !== expectedBinding.snapshotHash) {
      throw new D3AttestationError('ATTESTATION_SNAPSHOT_HASH_MISMATCH', `Expected snapshotHash "${expectedBinding.snapshotHash}", got "${snapshotHash}"`);
    }

    // Exact Issued_At match against server-tracked issuedAt
    const issuedAt = String(this._getFieldVal(attestationRecord.Issued_At) || '').trim();
    const expectedIssuedAt = String(expectedBinding.issuedAt || tracked.issuedAtIso || '').trim();
    if (!issuedAt || issuedAt !== expectedIssuedAt) {
      throw new D3AttestationError('ATTESTATION_ISSUED_AT_MISMATCH', `Expected Issued_At "${expectedIssuedAt}", got "${issuedAt}"`);
    }

    // Exact Expires_At match against server-tracked expiresAt
    const expiresAt = String(this._getFieldVal(attestationRecord.Expires_At) || '').trim();
    const expectedExpiresAt = String(expectedBinding.expiresAt || tracked.expiresAtIso || '').trim();
    if (!expiresAt || expiresAt !== expectedExpiresAt) {
      throw new D3AttestationError('ATTESTATION_EXPIRES_AT_MISMATCH', `Expected Expires_At "${expectedExpiresAt}", got "${expiresAt}"`);
    }

    // Extract platform CREATOR strictly from CREATOR.value.code ONLY
    // No fallback to Creator, Created_By, Actor_User_Code, etc.
    if (!attestationRecord.CREATOR || typeof attestationRecord.CREATOR !== 'object') {
      throw new D3AttestationError('ATTESTATION_ACTOR_NOT_RESOLVED', 'CREATOR field missing or invalid');
    }
    const creatorVal = attestationRecord.CREATOR.value;
    if (!creatorVal || typeof creatorVal !== 'object') {
      throw new D3AttestationError('ATTESTATION_ACTOR_NOT_RESOLVED', 'CREATOR.value missing or invalid');
    }
    const creatorCode = String(creatorVal.code || '').trim();

    if (!creatorCode || creatorCode.toUpperCase() === 'SYSTEM') {
      throw new D3AttestationError('ATTESTATION_ACTOR_NOT_RESOLVED', `Invalid or unresolvable CREATOR actor: "${creatorCode}"`);
    }

    // Consume nonce immediately upon successful verification to prevent reuse
    this.consumeNonce(nonce);

    return {
      verified: true,
      actorCode: creatorCode,
      nonce,
      snapshotHash
    };
  }
}
