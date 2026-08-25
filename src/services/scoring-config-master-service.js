import {
  canonicalizeScoringConfigPayload,
  validateScoringMasterConfig,
  computeConfigurationHash,
  CONFIG_LIFECYCLE_STATUS
} from '../profiles/scoring-config-master.js';

export function validateLifecycleTransition(currentStatus, nextStatus) {
  const allowed = {
    [CONFIG_LIFECYCLE_STATUS.DRAFT]: [CONFIG_LIFECYCLE_STATUS.VALIDATED],
    [CONFIG_LIFECYCLE_STATUS.VALIDATED]: [CONFIG_LIFECYCLE_STATUS.PUBLISHED],
    [CONFIG_LIFECYCLE_STATUS.PUBLISHED]: [CONFIG_LIFECYCLE_STATUS.SUPERSEDED, CONFIG_LIFECYCLE_STATUS.RETIRED],
    [CONFIG_LIFECYCLE_STATUS.SUPERSEDED]: [CONFIG_LIFECYCLE_STATUS.RETIRED]
  };

  const nextList = allowed[currentStatus];
  if (!nextList || !nextList.includes(nextStatus)) {
    throw new Error(`INVALID_LIFECYCLE_TRANSITION: Cannot transition from '${currentStatus}' to '${nextStatus}'`);
  }

  return true;
}

function isValidIsoDateTime(str) {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  const match = isoRegex.exec(trimmed);
  if (!match) return false;
  const [, year, month, day, hour, minute, second] = match;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const hh = parseInt(hour, 10);
  const mm = parseInt(minute, 10);
  const ss = parseInt(second, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31 || hh > 23 || mm > 59 || ss > 59) return false;
  const dt = new Date(trimmed);
  if (isNaN(dt.getTime())) return false;
  if (trimmed.endsWith('Z')) {
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d || dt.getUTCHours() !== hh || dt.getUTCMinutes() !== mm || dt.getUTCSeconds() !== ss) {
      return false;
    }
  }
  return true;
}

function validateOverlapRow(row, candidateProfile, candidateFiscalYear) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Overlap query item must be a plain object');
  }
  if (row.Profile_Code !== candidateProfile || row.Fiscal_Year !== candidateFiscalYear) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Overlap query item Profile_Code or Fiscal_Year mismatch');
  }
  if (row.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Overlap query item Config_Status must be PUBLISHED');
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof row.Effective_From !== 'string' || !dateRegex.test(row.Effective_From.trim())) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Overlap query item Effective_From invalid');
  }
  if (typeof row.Effective_To !== 'string' || !dateRegex.test(row.Effective_To.trim())) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Overlap query item Effective_To invalid');
  }
  const fromDate = new Date(row.Effective_From.trim());
  const toDate = new Date(row.Effective_To.trim());
  if (
    isNaN(fromDate.getTime()) || fromDate.toISOString().slice(0, 10) !== row.Effective_From.trim() ||
    isNaN(toDate.getTime()) || toDate.toISOString().slice(0, 10) !== row.Effective_To.trim() ||
    fromDate > toDate
  ) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Overlap query item effective date range invalid');
  }
}

export class ScoringConfigMasterService {
  constructor({ repository, auditProvider }) {
    if (!repository || typeof repository !== 'object') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Repository instance is required');
    }

    const requiredRepoMethods = [
      'findByMasterKey',
      'createValidatedRecord',
      'getByRecordId',
      'findPublishedByProfileFiscalYear',
      'publishRecord'
    ];
    for (const m of requiredRepoMethods) {
      if (typeof repository[m] !== 'function') {
        throw new Error(`REPOSITORY_RESPONSE_INVALID: Repository must provide method ${m}`);
      }
    }

    if (!auditProvider || typeof auditProvider !== 'object') {
      throw new Error('TRUSTED_PUBLISHER_INVALID: Audit provider instance is required');
    }

    const requiredAuditMethods = [
      'getPublisherIdentity',
      'getPublishedAt'
    ];
    for (const m of requiredAuditMethods) {
      if (typeof auditProvider[m] !== 'function') {
        throw new Error(`TRUSTED_PUBLISHER_INVALID: Audit provider must provide method ${m}`);
      }
    }

    this.repository = repository;
    this.auditProvider = auditProvider;
  }

  async publishScoringConfig(candidate) {
    if (!candidate || typeof candidate !== 'object') {
      throw new Error('CONFIG_PAYLOAD_INVALID: Candidate object is required');
    }

    // 1. Untrusted field & supersession checks
    if (candidate.Config_Status !== undefined && candidate.Config_Status !== CONFIG_LIFECYCLE_STATUS.DRAFT) {
      throw new Error('UNTRUSTED_LIFECYCLE_FIELD: Candidate Config_Status must be absent or DRAFT only');
    }
    if (candidate.Published_By !== undefined && candidate.Published_By !== null && candidate.Published_By !== '') {
      throw new Error('UNTRUSTED_PUBLISH_AUDIT_FIELD: Candidate cannot specify Published_By');
    }
    if (candidate.Published_At !== undefined && candidate.Published_At !== null && candidate.Published_At !== '') {
      throw new Error('UNTRUSTED_PUBLISH_AUDIT_FIELD: Candidate cannot specify Published_At');
    }
    if (candidate.Configuration_Hash !== undefined && candidate.Configuration_Hash !== null && candidate.Configuration_Hash !== '') {
      throw new Error('UNTRUSTED_LIFECYCLE_FIELD: Candidate cannot specify Configuration_Hash');
    }
    if (candidate.Supersedes_Config_Version !== undefined && candidate.Supersedes_Config_Version !== null && candidate.Supersedes_Config_Version !== 'NONE') {
      throw new Error('SUPERSESSION_ACTIVATION_NOT_IMPLEMENTED: Supersession is not supported in Stage 4A');
    }

    // 2. Canonicalize fields 1-19
    const canonicalImmutable = canonicalizeScoringConfigPayload(candidate);

    // 3. Domain validation
    validateScoringMasterConfig(canonicalImmutable);

    // 4. Duplicate master key query
    const existing = await this.repository.findByMasterKey(canonicalImmutable.Master_Record_Key);
    if (existing === undefined) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: findByMasterKey returned undefined');
    }
    if (existing !== null) {
      if (typeof existing !== 'object' || Array.isArray(existing)) {
        throw new Error('REPOSITORY_RESPONSE_INVALID: findByMasterKey returned non-object');
      }
      throw new Error(`MASTER_CONFIG_DUPLICATE: Key ${canonicalImmutable.Master_Record_Key} already exists`);
    }

    // 5. Expected hash computation
    const expectedHash = computeConfigurationHash(canonicalImmutable);

    // 6. Build validated record payload
    const validatedRecordPayload = {
      ...canonicalImmutable,
      Config_Status: CONFIG_LIFECYCLE_STATUS.VALIDATED,
      Configuration_Hash: expectedHash,
      Published_By: '',
      Published_At: ''
    };

    // 7. Persist validated record
    const recordId = await this.repository.createValidatedRecord(validatedRecordPayload);
    if (recordId === undefined || recordId === null) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: createValidatedRecord returned invalid record ID');
    }
    if (typeof recordId === 'number') {
      if (!isFinite(recordId) || isNaN(recordId)) {
        throw new Error('REPOSITORY_RESPONSE_INVALID: createValidatedRecord returned invalid numeric record ID');
      }
    } else if (typeof recordId === 'string') {
      if (recordId.trim() === '') {
        throw new Error('REPOSITORY_RESPONSE_INVALID: createValidatedRecord returned empty record ID');
      }
    } else {
      throw new Error('REPOSITORY_RESPONSE_INVALID: createValidatedRecord returned non-string/number record ID');
    }

    // 8. Initial read-back
    const readback1 = await this.repository.getByRecordId(recordId);
    if (!readback1 || typeof readback1 !== 'object' || Array.isArray(readback1)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: getByRecordId returned invalid payload');
    }

    if (readback1.Master_Record_Key !== canonicalImmutable.Master_Record_Key) {
      throw new Error('CONFIG_READBACK_MISMATCH: Master_Record_Key mismatch');
    }

    if (readback1.Config_Status !== CONFIG_LIFECYCLE_STATUS.VALIDATED) {
      throw new Error('CONFIG_READBACK_MISMATCH: Status must be VALIDATED');
    }

    let canonicalReadback1;
    try {
      canonicalReadback1 = canonicalizeScoringConfigPayload(readback1);
    } catch {
      throw new Error('CONFIG_READBACK_MISMATCH: Read-back payload immutable fields malformed');
    }

    const readbackHash1 = readback1.Configuration_Hash;
    const computedHash1 = computeConfigurationHash(canonicalReadback1);

    if (!readbackHash1 || readbackHash1 !== expectedHash || computedHash1 !== expectedHash) {
      throw new Error('CONFIG_READBACK_MISMATCH: Triple hash equality failed');
    }

    // 9. Query effective overlap
    const publishedList = await this.repository.findPublishedByProfileFiscalYear(canonicalImmutable.Profile_Code, canonicalImmutable.Fiscal_Year);
    if (!Array.isArray(publishedList)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: findPublishedByProfileFiscalYear must return an array');
    }

    for (const pub of publishedList) {
      validateOverlapRow(pub, canonicalImmutable.Profile_Code, canonicalImmutable.Fiscal_Year);

      const candidateFrom = canonicalImmutable.Effective_From;
      const candidateTo = canonicalImmutable.Effective_To;
      const pubFrom = pub.Effective_From.trim();
      const pubTo = pub.Effective_To.trim();

      if (candidateFrom <= pubTo && pubFrom <= candidateTo) {
        throw new Error('SCORING_CONFIG_EFFECTIVE_OVERLAP: Effective period overlaps with an existing published configuration');
      }
    }

    // 10. Obtain trusted audit metadata after overlap check
    const publisher = await this.auditProvider.getPublisherIdentity();
    if (!publisher || typeof publisher !== 'string' || publisher.trim() === '') {
      throw new Error('TRUSTED_PUBLISHER_INVALID: Trusted publisher identity is empty or invalid');
    }

    const publishedAt = await this.auditProvider.getPublishedAt();
    if (!publishedAt || !isValidIsoDateTime(publishedAt)) {
      throw new Error('TRUSTED_PUBLISHED_AT_INVALID: Trusted published date must be a valid timezone-aware ISO-8601 datetime');
    }

    // 11. Publish patch
    const patch = {
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
      Published_By: publisher.trim(),
      Published_At: publishedAt.trim()
    };
    await this.repository.publishRecord(recordId, patch);

    // 12. Final read-back
    const finalReadback = await this.repository.getByRecordId(recordId);
    if (!finalReadback || typeof finalReadback !== 'object' || Array.isArray(finalReadback)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Final getByRecordId returned invalid payload');
    }

    if (finalReadback.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final status is not PUBLISHED');
    }

    if (finalReadback.Master_Record_Key !== canonicalImmutable.Master_Record_Key) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final Master_Record_Key mismatch');
    }

    if (finalReadback.Published_By !== publisher.trim()) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final Published_By mismatch');
    }

    if (finalReadback.Published_At !== publishedAt.trim()) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final Published_At mismatch');
    }

    let finalCanonical;
    try {
      finalCanonical = canonicalizeScoringConfigPayload(finalReadback);
    } catch {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final immutable fields malformed');
    }

    const finalHash = computeConfigurationHash(finalCanonical);
    if (finalReadback.Configuration_Hash !== expectedHash || finalHash !== expectedHash) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final hash mismatch');
    }

    for (const key of Object.keys(canonicalImmutable)) {
      if (canonicalImmutable[key] !== finalCanonical[key]) {
        throw new Error(`PUBLISH_VERIFICATION_FAILED: Immutable payload field '${key}' mutated`);
      }
    }

    return {
      status: 'PUBLISH_VERIFIED',
      recordId: String(recordId),
      masterRecordKey: canonicalImmutable.Master_Record_Key,
      configurationHash: expectedHash,
      publishedBy: publisher.trim(),
      publishedAt: publishedAt.trim()
    };
  }
}
