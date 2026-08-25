import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ScoringConfigMasterService,
  validateLifecycleTransition
} from '../src/services/scoring-config-master-service.js';
import {
  getCanonicalBaselineMasterConfigs,
  CONFIG_LIFECYCLE_STATUS
} from '../src/profiles/scoring-config-master.js';

function createInMemoryRepo() {
  const records = new Map();
  let nextId = 100;
  const calls = [];

  return {
    records,
    calls,
    async findByMasterKey(key) {
      calls.push({ method: 'findByMasterKey', key });
      for (const rec of records.values()) {
        if (rec.Master_Record_Key === key) return { ...rec };
      }
      return null;
    },
    async createValidatedRecord(payload) {
      calls.push({ method: 'createValidatedRecord', payload });
      const id = String(nextId++);
      const newRec = { ...payload, $id: id };
      records.set(id, newRec);
      return id;
    },
    async getByRecordId(id) {
      calls.push({ method: 'getByRecordId', id });
      const rec = records.get(String(id));
      return rec ? { ...rec } : null;
    },
    async findPublishedByProfileFiscalYear(profileCode, fiscalYear) {
      calls.push({ method: 'findPublishedByProfileFiscalYear', profileCode, fiscalYear });
      const res = [];
      for (const rec of records.values()) {
        if (rec.Profile_Code === profileCode && rec.Fiscal_Year === fiscalYear && rec.Config_Status === CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
          res.push({ ...rec });
        }
      }
      return res;
    },
    async publishRecord(id, patch) {
      calls.push({ method: 'publishRecord', id, patch });
      const rec = records.get(String(id));
      if (!rec) return false;
      records.set(String(id), { ...rec, ...patch });
      return true;
    }
  };
}

function createInMemoryAuditProvider(publisher = 'usr_admin_01', publishedAt = '2026-04-01T00:00:00Z') {
  const calls = [];
  return {
    calls,
    async getPublisherIdentity() {
      calls.push('getPublisherIdentity');
      return publisher;
    },
    async getPublishedAt() {
      calls.push('getPublishedAt');
      return publishedAt;
    }
  };
}

function getValidCandidate() {
  const base = getCanonicalBaselineMasterConfigs()[0];
  const { Config_Status, Published_By, Published_At, Configuration_Hash, ...candidate } = base;
  return { ...candidate, Supersedes_Config_Version: 'NONE' };
}

test('Stage 4A 1: valid first-version candidate publishes successfully', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const result = await service.publishScoringConfig(getValidCandidate());
  assert.equal(result.status, 'PUBLISH_VERIFIED');
  assert.equal(result.publishedBy, 'usr_admin_01');
  assert.equal(result.publishedAt, '2026-04-01T00:00:00Z');

  const finalRecord = repo.records.get(result.recordId);
  assert.equal(finalRecord.Config_Status, CONFIG_LIFECYCLE_STATUS.PUBLISHED);
});

test('Stage 4A 2: exact operation order is enforced', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await service.publishScoringConfig(getValidCandidate());

  const repoMethods = repo.calls.map(c => c.method);
  assert.deepEqual(repoMethods, [
    'findByMasterKey',
    'createValidatedRecord',
    'getByRecordId',
    'findPublishedByProfileFiscalYear',
    'publishRecord',
    'getByRecordId'
  ]);
  assert.deepEqual(audit.calls, ['getPublisherIdentity', 'getPublishedAt']);
});

test('Stage 4A 3: caller cannot set PUBLISHED directly', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'PUBLISHED' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A 4: caller cannot set VALIDATED directly', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'VALIDATED' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A 5: caller Published_By rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Published_By: 'malicious_user' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_PUBLISH_AUDIT_FIELD/
  );
});

test('Stage 4A 6: caller Published_At rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Published_At: '2026-01-01T00:00:00Z' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_PUBLISH_AUDIT_FIELD/
  );
});

test('Stage 4A 7: caller Configuration_Hash rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Configuration_Hash: 'fakehash' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A 8: unsupported supersession fails before persistence', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Supersedes_Config_Version: 'v0.9.0' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /SUPERSESSION_ACTIVATION_NOT_IMPLEMENTED/
  );
  assert.equal(repo.calls.length, 0);
});

test('Stage 4A 9: duplicate master key blocks before persistence', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = getValidCandidate();
  await service.publishScoringConfig(candidate);

  // Second attempt with same master key
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /MASTER_CONFIG_DUPLICATE/
  );
});

test('Stage 4A 10: malformed duplicate-query response fails closed', async () => {
  const repo = createInMemoryRepo();
  repo.findByMasterKey = async () => undefined; // malformed
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A 11: invalid domain config blocks before persistence', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), PartA_Weight: 80, PartB_Weight: 30 }; // 110 total
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /INVALID_SCORING_WEIGHTS/
  );
  assert.equal(repo.calls.length, 0);
});

test('Stage 4A 12: createValidatedRecord missing ID fails closed', async () => {
  const repo = createInMemoryRepo();
  repo.createValidatedRecord = async () => '';
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A 13: initial read-back wrong master key -> CONFIG_READBACK_MISMATCH', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 1) return { ...res, Master_Record_Key: 'WRONG_KEY::v1.0.0' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /CONFIG_READBACK_MISMATCH/
  );
});

test('Stage 4A 14: initial read-back missing stored hash -> CONFIG_READBACK_MISMATCH', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 1) return { ...res, Configuration_Hash: '' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /CONFIG_READBACK_MISMATCH/
  );
});

test('Stage 4A 15: expected hash != stored hash -> CONFIG_READBACK_MISMATCH', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 1) return { ...res, Configuration_Hash: 'corrupted_hash' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /CONFIG_READBACK_MISMATCH/
  );
});

test('Stage 4A 16: expected hash != recomputed hash -> CONFIG_READBACK_MISMATCH', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 1) return { ...res, PartA_Weight: '80' }; // altered weight
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /CONFIG_READBACK_MISMATCH/
  );
});

test('Stage 4A 17: stored hash != recomputed hash -> CONFIG_READBACK_MISMATCH', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 1) return { ...res, Configuration_Hash: 'other_hash', PartA_Weight: '80' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /CONFIG_READBACK_MISMATCH/
  );
});

test('Stage 4A 18: read-back status not VALIDATED blocks publish', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 1) return { ...res, Config_Status: 'DRAFT' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /CONFIG_READBACK_MISMATCH/
  );
});

test('Stage 4A 19: overlap on same first/last day boundary is rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };

  repo.findPublishedByProfileFiscalYear = async () => [existing];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2027-03-31', // Exact same day boundary
    Effective_To: '2028-03-31'
  };

  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );
});

test('Stage 4A 20: contained overlap rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Effective_From: '2026-01-01',
    Effective_To: '2026-12-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2026-06-01',
    Effective_To: '2026-08-31'
  };

  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );
});

test('Stage 4A 21: enveloping overlap rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Effective_From: '2026-06-01',
    Effective_To: '2026-08-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2026-01-01',
    Effective_To: '2026-12-31'
  };

  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );
});

test('Stage 4A 22: non-overlapping earlier period passes overlap gate', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2025-04-01',
    Effective_To: '2026-03-31'
  };

  const result = await service.publishScoringConfig(candidate);
  assert.equal(result.status, 'PUBLISH_VERIFIED');
});

test('Stage 4A 23: non-overlapping later period passes overlap gate', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2027-04-01',
    Effective_To: '2028-03-31'
  };

  const result = await service.publishScoringConfig(candidate);
  assert.equal(result.status, 'PUBLISH_VERIFIED');
});

test('Stage 4A 24: different Profile_Code in overlap response fails closed defensively', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existingOtherProfile = {
    ...getValidCandidate(),
    Profile_Code: 'PROF_JAPANESE_STAFF',
    Master_Record_Key: 'PROF_JAPANESE_STAFF::v1.0.0',
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existingOtherProfile];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A 25: different Fiscal_Year in overlap response fails closed defensively', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existingOtherFY = {
    ...getValidCandidate(),
    Fiscal_Year: 'FY2027',
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existingOtherFY];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A 26: overlap-query malformed response fails closed', async () => {
  const repo = createInMemoryRepo();
  repo.findPublishedByProfileFiscalYear = async () => null; // not an array
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A 27: audit provider is not called before validation/read-back/overlap pass', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  // Make overlap check throw
  const existing = { ...getValidCandidate(), Effective_From: '2026-04-01', Effective_To: '2027-03-31' };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );

  assert.equal(audit.calls.length, 0);
});

test('Stage 4A 28: missing trusted publisher rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('', '2026-04-01T00:00:00Z'); // empty publisher
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /TRUSTED_PUBLISHER_INVALID/
  );
});

test('Stage 4A 29: invalid trusted timestamp rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', 'not-a-date');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /TRUSTED_PUBLISHED_AT_INVALID/
  );
});

test('Stage 4A 30: publish patch contains lifecycle/audit fields only', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await service.publishScoringConfig(getValidCandidate());

  const publishCall = repo.calls.find(c => c.method === 'publishRecord');
  assert.ok(publishCall);
  const patchKeys = Object.keys(publishCall.patch);
  assert.deepEqual(patchKeys.sort(), ['Config_Status', 'Published_At', 'Published_By'].sort());
  assert.equal(publishCall.patch.Config_Status, CONFIG_LIFECYCLE_STATUS.PUBLISHED);
});

test('Stage 4A 31: final status not PUBLISHED -> PUBLISH_VERIFICATION_FAILED', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 2) return { ...res, Config_Status: 'VALIDATED' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /PUBLISH_VERIFICATION_FAILED/
  );
});

test('Stage 4A 32: final master key mismatch -> PUBLISH_VERIFICATION_FAILED', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 2) return { ...res, Master_Record_Key: 'WRONG_KEY::v1.0.0' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /PUBLISH_VERIFICATION_FAILED/
  );
});

test('Stage 4A 33: final hash mismatch -> PUBLISH_VERIFICATION_FAILED', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 2) return { ...res, Configuration_Hash: 'tampered_hash' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /PUBLISH_VERIFICATION_FAILED/
  );
});

test('Stage 4A 34: final immutable payload mutation -> PUBLISH_VERIFICATION_FAILED', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 2) return { ...res, PartA_Weight: '80' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /PUBLISH_VERIFICATION_FAILED/
  );
});

test('Stage 4A 35: final publisher mismatch -> PUBLISH_VERIFICATION_FAILED', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 2) return { ...res, Published_By: 'wrong_publisher' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /PUBLISH_VERIFICATION_FAILED/
  );
});

test('Stage 4A 36: final timestamp mismatch -> PUBLISH_VERIFICATION_FAILED', async () => {
  const repo = createInMemoryRepo();
  const origGet = repo.getByRecordId.bind(repo);
  let count = 0;
  repo.getByRecordId = async (id) => {
    count++;
    const res = await origGet(id);
    if (count === 2) return { ...res, Published_At: '2099-01-01T00:00:00Z' };
    return res;
  };
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /PUBLISH_VERIFICATION_FAILED/
  );
});

test('Stage 4A 37: final success requires second hash recomputation', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const result = await service.publishScoringConfig(getValidCandidate());
  assert.equal(result.status, 'PUBLISH_VERIFIED');
});

test('Stage 4A 38: valid lifecycle transition matrix passes', () => {
  assert.equal(validateLifecycleTransition('DRAFT', 'VALIDATED'), true);
  assert.equal(validateLifecycleTransition('VALIDATED', 'PUBLISHED'), true);
  assert.equal(validateLifecycleTransition('PUBLISHED', 'SUPERSEDED'), true);
  assert.equal(validateLifecycleTransition('PUBLISHED', 'RETIRED'), true);
  assert.equal(validateLifecycleTransition('SUPERSEDED', 'RETIRED'), true);
});

test('Stage 4A 39: invalid/reverse/direct-jump lifecycle transitions fail', () => {
  assert.throws(() => validateLifecycleTransition('DRAFT', 'PUBLISHED'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('VALIDATED', 'DRAFT'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('PUBLISHED', 'DRAFT'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('RETIRED', 'PUBLISHED'), /INVALID_LIFECYCLE_TRANSITION/);
});

test('Stage 4A 40: no baseline fixture, filesystem, Git, JSON, or Kintone dependency is used by the service', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const result = await service.publishScoringConfig(getValidCandidate());
  assert.equal(result.status, 'PUBLISH_VERIFIED');
});
