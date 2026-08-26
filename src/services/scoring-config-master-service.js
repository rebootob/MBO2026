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

  // ISO-8601 datetime pattern requiring Z or [+-]HH:MM offset
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-])(\d{2}):(\d{2}))$/;
  const match = isoRegex.exec(trimmed);
  if (!match) return false;

  const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr, , tzToken, tzSign, tzHourStr, tzMinStr] = match;

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const second = parseInt(secStr, 10);

  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;

  if (tzSign) {
    const tzHour = parseInt(tzHourStr, 10);
    const tzMin = parseInt(tzMinStr, 10);
    if (tzHour > 23 || tzMin > 59) return false;
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonth = [0, 31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day < 1 || day > daysInMonth[month]) {
    return false;
  }

  const dt = new Date(trimmed);
  if (isNaN(dt.getTime())) return false;

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

    if (typeof readback1.__storageRevision !== 'string' || readback1.__storageRevision !== readback1.__storageRevision.trim() || !/^[1-9]\d*$/.test(readback1.__storageRevision) || !Number.isSafeInteger(Number(readback1.__storageRevision))) {
      throw new Error('CONFIG_READBACK_MISMATCH: Initial read-back missing valid __storageRevision');
    }
    const initialRevision = readback1.__storageRevision;

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
    await this.repository.publishRecord(recordId, patch, initialRevision);

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

    if (finalReadback.Published_At !== publishedAt.trim() && new Date(finalReadback.Published_At).getTime() !== new Date(publishedAt.trim()).getTime()) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final Published_At mismatch');
    }

    if (typeof finalReadback.__storageRevision !== 'string' || finalReadback.__storageRevision !== finalReadback.__storageRevision.trim() || !/^[1-9]\d*$/.test(finalReadback.__storageRevision) || !Number.isSafeInteger(Number(finalReadback.__storageRevision))) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final storage revision missing or invalid');
    }
    const finalRevision = finalReadback.__storageRevision;
    if (Number(finalRevision) <= Number(initialRevision)) {
      throw new Error('PUBLISH_VERIFICATION_FAILED: Final storage revision was not advanced');
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

  async publishSupersedingScoringConfig({ candidate } = {}) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      throw new Error('CONFIG_PAYLOAD_INVALID: Candidate object is required');
    }

    if (typeof this.repository.activateSupersessionAtomically !== 'function') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Repository missing activateSupersessionAtomically method');
    }

    // 1. Candidate must contain a real non-NONE Supersedes_Config_Version
    const supersedesVersion = candidate.Supersedes_Config_Version;
    if (typeof supersedesVersion !== 'string' || supersedesVersion.trim() === '' || supersedesVersion.trim() === 'NONE') {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Supersedes_Config_Version must be a non-empty string and cannot be NONE');
    }
    const cleanSupersedesVersion = supersedesVersion.trim();

    // 2. Candidate cannot supersede itself
    if (candidate.Scoring_Config_Version && candidate.Scoring_Config_Version.trim() === cleanSupersedesVersion) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Candidate cannot supersede itself');
    }

    // 3. Canonicalize & validate candidate 19 immutable fields
    const canonicalImmutable = canonicalizeScoringConfigPayload(candidate);
    validateScoringMasterConfig(canonicalImmutable);

    // 4. Derive/verify Master_Record_Key
    const expectedMasterKey = `${canonicalImmutable.Profile_Code}::${canonicalImmutable.Scoring_Config_Version}`;
    if (canonicalImmutable.Master_Record_Key !== expectedMasterKey) {
      throw new Error(`INVALID_MASTER_RECORD_KEY: Expected ${expectedMasterKey} but got ${canonicalImmutable.Master_Record_Key}`);
    }

    // 5. Reject duplicate new Master_Record_Key
    const existingNewRecord = await this.repository.findByMasterKey(canonicalImmutable.Master_Record_Key);
    if (existingNewRecord) {
      throw new Error(`MASTER_CONFIG_DUPLICATE: Key ${canonicalImmutable.Master_Record_Key} already exists`);
    }

    // 6. Resolve published configs for same Profile/Fiscal Year
    const publishedConfigs = await this.repository.findPublishedByProfileFiscalYear(
      canonicalImmutable.Profile_Code,
      canonicalImmutable.Fiscal_Year
    );
    if (!Array.isArray(publishedConfigs)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: findPublishedByProfileFiscalYear must return array');
    }

    // Must find exactly 1 intended predecessor
    const matchingPredecessors = publishedConfigs.filter(r => r.Scoring_Config_Version === cleanSupersedesVersion);
    if (matchingPredecessors.length !== 1) {
      throw new Error(`SUPERSEDING_PUBLISH_FAILED: Expected exactly 1 published predecessor with version '${cleanSupersedesVersion}', found ${matchingPredecessors.length}`);
    }
    const predecessor = matchingPredecessors[0];

    // Predecessor validations
    if (predecessor.Profile_Code !== canonicalImmutable.Profile_Code) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Predecessor Profile_Code mismatch');
    }
    if (predecessor.Fiscal_Year !== canonicalImmutable.Fiscal_Year) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Predecessor Fiscal_Year mismatch');
    }
    if (predecessor.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Predecessor Config_Status is not PUBLISHED');
    }

    // Validate predecessor payload & hash
    let predCanonical;
    try {
      predCanonical = canonicalizeScoringConfigPayload(predecessor);
    } catch {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Predecessor immutable payload malformed');
    }
    const predRecomputedHash = computeConfigurationHash(predCanonical);
    if (!predecessor.Configuration_Hash || predecessor.Configuration_Hash !== predRecomputedHash) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Predecessor stored Configuration_Hash mismatch with recomputed hash');
    }

    const predecessorRecordId = predecessor.__recordId || predecessor.$id;
    const predecessorRevision = predecessor.__storageRevision || predecessor.$revision;
    if (!predecessorRecordId || !predecessorRevision) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: Predecessor recordId or storageRevision missing');
    }

    // 7. Effective Period Overlap check (must ignore only the target predecessor being superseded)
    for (const pub of publishedConfigs) {
      const pubId = pub.__recordId || pub.$id;
      if (String(pubId) === String(predecessorRecordId)) {
        continue; // ignore exact predecessor being superseded
      }
      validateOverlapRow(pub, canonicalImmutable.Profile_Code, canonicalImmutable.Fiscal_Year);
      const candFrom = new Date(canonicalImmutable.Effective_From);
      const candTo = new Date(canonicalImmutable.Effective_To);
      const pubFrom = new Date(pub.Effective_From.trim());
      const pubTo = new Date(pub.Effective_To.trim());
      if (candFrom <= pubTo && candTo >= pubFrom) {
        throw new Error(`EFFECTIVE_PERIOD_OVERLAP: Candidate overlaps with published config record ID '${pubId}'`);
      }
    }

    // 8. Compute candidate expected hash
    const candidateExpectedHash = computeConfigurationHash(canonicalImmutable);

    // 9. Create new record in VALIDATED using exact repository contract payload
    const validatedPayload = {
      ...canonicalImmutable,
      Config_Status: CONFIG_LIFECYCLE_STATUS.VALIDATED,
      Configuration_Hash: candidateExpectedHash,
      Published_By: '',
      Published_At: ''
    };
    const createdId = await this.repository.createValidatedRecord(validatedPayload);
    if (!createdId) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: createValidatedRecord returned invalid ID');
    }
    const newRecordId = String(createdId);

    // 10. Read back new VALIDATED record and verify triple-hash equality
    const newValidatedRecord = await this.repository.getByRecordId(newRecordId);
    if (!newValidatedRecord || typeof newValidatedRecord !== 'object') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: getByRecordId for new record returned invalid payload');
    }
    if (newValidatedRecord.Config_Status !== CONFIG_LIFECYCLE_STATUS.VALIDATED) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: New record status is not VALIDATED before activation');
    }
    let newCanonical;
    try {
      newCanonical = canonicalizeScoringConfigPayload(newValidatedRecord);
    } catch {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: New record immutable payload malformed');
    }
    const newRecomputedHash = computeConfigurationHash(newCanonical);
    if (newValidatedRecord.Configuration_Hash !== candidateExpectedHash || newRecomputedHash !== candidateExpectedHash) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: New record hash mismatch before activation');
    }

    const newRevision = newValidatedRecord.__storageRevision || newValidatedRecord.$revision;
    if (!newRevision) {
      throw new Error('SUPERSEDING_PUBLISH_FAILED: New record storageRevision missing');
    }

    // 11. Obtain trusted audit metadata
    const publisher = await this.auditProvider.getPublisherIdentity();
    if (!publisher || typeof publisher !== 'string' || publisher.trim() === '') {
      throw new Error('TRUSTED_PUBLISHER_INVALID: Trusted publisher identity is empty or invalid');
    }
    const publishedAt = await this.auditProvider.getPublishedAt();
    if (!publishedAt || !isValidIsoDateTime(publishedAt)) {
      throw new Error('TRUSTED_PUBLISHED_AT_INVALID: Trusted published date must be a valid timezone-aware ISO-8601 datetime');
    }

    // 12. Call repository atomic supersession activation with exact identity tokens
    await this.repository.activateSupersessionAtomically({
      predecessorRecordId: String(predecessorRecordId),
      predecessorRevision: String(predecessorRevision),
      predecessorMasterRecordKey: predecessor.Master_Record_Key,
      predecessorVersion: predecessor.Scoring_Config_Version,
      newRecordId: String(newRecordId),
      newRevision: String(newRevision),
      newMasterRecordKey: canonicalImmutable.Master_Record_Key,
      newVersion: canonicalImmutable.Scoring_Config_Version,
      publishedBy: publisher.trim(),
      publishedAt: publishedAt.trim()
    });

    // 13. Final read-back verification for both old and new records
    const finalOld = await this.repository.getByRecordId(predecessorRecordId);
    const finalNew = await this.repository.getByRecordId(newRecordId);

    if (finalOld.Config_Status !== CONFIG_LIFECYCLE_STATUS.SUPERSEDED) {
      throw new Error('SUPERSEDING_PUBLISH_VERIFICATION_FAILED: Predecessor status is not SUPERSEDED after activation');
    }
    if (finalNew.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
      throw new Error('SUPERSEDING_PUBLISH_VERIFICATION_FAILED: New record status is not PUBLISHED after activation');
    }

    // Verify old immutable payload & hash unchanged
    const finalOldCanonical = canonicalizeScoringConfigPayload(finalOld);
    const finalOldHash = computeConfigurationHash(finalOldCanonical);
    if (finalOld.Configuration_Hash !== predRecomputedHash || finalOldHash !== predRecomputedHash) {
      throw new Error('SUPERSEDING_PUBLISH_VERIFICATION_FAILED: Predecessor immutable payload or hash was mutated during supersession');
    }

    // Verify new immutable payload & hash match
    const finalNewCanonical = canonicalizeScoringConfigPayload(finalNew);
    const finalNewHash = computeConfigurationHash(finalNewCanonical);
    if (finalNew.Configuration_Hash !== candidateExpectedHash || finalNewHash !== candidateExpectedHash) {
      throw new Error('SUPERSEDING_PUBLISH_VERIFICATION_FAILED: New record hash mismatch after activation');
    }

    // Verify exactly 1 current PUBLISHED config exists for Profile/FY (the new record)
    const finalPublishedConfigs = await this.repository.findPublishedByProfileFiscalYear(
      canonicalImmutable.Profile_Code,
      canonicalImmutable.Fiscal_Year
    );
    if (finalPublishedConfigs.length !== 1 || String(finalPublishedConfigs[0].__recordId || finalPublishedConfigs[0].$id) !== String(newRecordId)) {
      throw new Error('SUPERSEDING_PUBLISH_VERIFICATION_FAILED: Query for published configs must return exactly 1 current record (the new record)');
    }

    return {
      status: 'SUPERSESSION_PUBLISH_VERIFIED',
      predecessorRecordId: String(predecessorRecordId),
      newRecordId: String(newRecordId),
      newMasterRecordKey: canonicalImmutable.Master_Record_Key,
      newConfigurationHash: candidateExpectedHash,
      publishedBy: publisher.trim(),
      publishedAt: publishedAt.trim()
    };
  }
}
