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

export class ScoringConfigMasterService {
  constructor({ repository, auditProvider }) {
    if (!repository || typeof repository !== 'object') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Repository instance is required');
    }
    if (!auditProvider || typeof auditProvider !== 'object') {
      throw new Error('TRUSTED_PUBLISHER_INVALID: Audit provider instance is required');
    }
    this.repository = repository;
    this.auditProvider = auditProvider;
  }

  async publishScoringConfig(candidate) {
    if (!candidate || typeof candidate !== 'object') {
      throw new Error('CONFIG_PAYLOAD_INVALID: Candidate object is required');
    }

    // 1. Untrusted field & supersession checks
    if (candidate.Config_Status !== undefined && candidate.Config_Status !== null && candidate.Config_Status !== '' && candidate.Config_Status !== CONFIG_LIFECYCLE_STATUS.DRAFT) {
      throw new Error('UNTRUSTED_LIFECYCLE_FIELD: Candidate cannot specify non-DRAFT Config_Status');
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
    try {
      validateScoringMasterConfig(canonicalImmutable);
    } catch (err) {
      throw err;
    }

    // 4. Duplicate master key query
    const existing = await this.repository.findByMasterKey(canonicalImmutable.Master_Record_Key);
    if (existing === undefined) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: findByMasterKey returned undefined');
    }
    if (existing !== null) {
      if (typeof existing !== 'object') {
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
    if (recordId === undefined || recordId === null || (typeof recordId !== 'string' && typeof recordId !== 'number') || String(recordId).trim() === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: createValidatedRecord returned invalid record ID');
    }

    // 8. Initial read-back
    const readback1 = await this.repository.getByRecordId(recordId);
    if (!readback1 || typeof readback1 !== 'object') {
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
      if (!pub || typeof pub !== 'object') {
        throw new Error('REPOSITORY_RESPONSE_INVALID: findPublishedByProfileFiscalYear array item invalid');
      }
      if (pub.Profile_Code !== canonicalImmutable.Profile_Code || pub.Fiscal_Year !== canonicalImmutable.Fiscal_Year) {
        throw new Error('REPOSITORY_RESPONSE_INVALID: findPublishedByProfileFiscalYear returned record for different profile/fiscal year');
      }
      const candidateFrom = canonicalImmutable.Effective_From;
      const candidateTo = canonicalImmutable.Effective_To;
      const pubFrom = pub.Effective_From;
      const pubTo = pub.Effective_To;

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
    if (!publishedAt || typeof publishedAt !== 'string' || publishedAt.trim() === '' || isNaN(new Date(publishedAt).getTime())) {
      throw new Error('TRUSTED_PUBLISHED_AT_INVALID: Trusted published date is empty or invalid');
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
    if (!finalReadback || typeof finalReadback !== 'object') {
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
