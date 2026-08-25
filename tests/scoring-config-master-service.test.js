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

// ─────────────────────────────────────────────────────────────────────────────
// 1. CALLER / LIFECYCLE INJECTION & ENTRY CONTRACT TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: valid first-version candidate publishes successfully', async () => {
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

test('Stage 4A: exact operation order is enforced', async () => {
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

test('Stage 4A: caller PUBLISHED rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'PUBLISHED' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A: caller VALIDATED rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'VALIDATED' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A: candidate Config_Status = null rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: null };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A: candidate Config_Status = "" rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: '' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A: candidate Config_Status = DRAFT passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'DRAFT' };
  const res = await service.publishScoringConfig(candidate);
  assert.equal(res.status, 'PUBLISH_VERIFIED');
});

test('Stage 4A: caller Published_By rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Published_By: 'malicious_user' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_PUBLISH_AUDIT_FIELD/
  );
});

test('Stage 4A: caller Published_At rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Published_At: '2026-04-01T00:00:00Z' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_PUBLISH_AUDIT_FIELD/
  );
});

test('Stage 4A: caller Configuration_Hash rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Configuration_Hash: 'fakehash' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A: unsupported supersession rejected before persistence', async () => {
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. DEPENDENCY & DUPLICATE & DOMAIN VALIDATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: missing required repository method fails closed', () => {
  const methods = ['findByMasterKey', 'createValidatedRecord', 'getByRecordId', 'findPublishedByProfileFiscalYear', 'publishRecord'];
  for (const m of methods) {
    const repo = createInMemoryRepo();
    delete repo[m];
    const audit = createInMemoryAuditProvider();
    assert.throws(
      () => new ScoringConfigMasterService({ repository: repo, auditProvider: audit }),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

test('Stage 4A: missing required audit provider method fails closed', () => {
  const methods = ['getPublisherIdentity', 'getPublishedAt'];
  for (const m of methods) {
    const repo = createInMemoryRepo();
    const audit = createInMemoryAuditProvider();
    delete audit[m];
    assert.throws(
      () => new ScoringConfigMasterService({ repository: repo, auditProvider: audit }),
      /TRUSTED_PUBLISHER_INVALID/
    );
  }
});

test('Stage 4A: duplicate master key rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = getValidCandidate();
  await service.publishScoringConfig(candidate);

  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /MASTER_CONFIG_DUPLICATE/
  );
});

test('Stage 4A: malformed findByMasterKey response rejected', async () => {
  for (const badRes of [undefined, 'string', 123, []]) {
    const repo = createInMemoryRepo();
    repo.findByMasterKey = async () => badRes;
    const audit = createInMemoryAuditProvider();
    const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

    await assert.rejects(
      () => service.publishScoringConfig(getValidCandidate()),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

test('Stage 4A: invalid domain config rejected before persistence', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), PartA_Weight: 80, PartB_Weight: 30 }; // weight sum 110
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /INVALID_SCORING_WEIGHTS/
  );
  assert.equal(repo.calls.length, 0);
});

test('Stage 4A: createValidatedRecord missing/invalid ID rejected', async () => {
  for (const invalidId of [undefined, null, '', '   ', NaN, Infinity, -Infinity, {}]) {
    const repo = createInMemoryRepo();
    repo.createValidatedRecord = async () => invalidId;
    const audit = createInMemoryAuditProvider();
    const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

    await assert.rejects(
      () => service.publishScoringConfig(getValidCandidate()),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. INITIAL READ-BACK & TRIPLE HASH TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: wrong Master_Record_Key in read-back rejected', async () => {
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

test('Stage 4A: missing stored Configuration_Hash in read-back rejected', async () => {
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

test('Stage 4A: expected hash != stored hash rejected', async () => {
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

test('Stage 4A: expected hash != recomputed hash rejected', async () => {
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

test('Stage 4A: stored hash != recomputed hash rejected', async () => {
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

test('Stage 4A: status != VALIDATED in read-back rejected', async () => {
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. EFFECTIVE-OVERLAP CONTRACT TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: same-day inclusive boundary overlap rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2027-03-31', // Same day boundary
    Effective_To: '2028-03-31'
  };

  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );
});

test('Stage 4A: contained overlap rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
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

test('Stage 4A: enveloping overlap rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
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

test('Stage 4A: non-overlap earlier passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
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

  const res = await service.publishScoringConfig(candidate);
  assert.equal(res.status, 'PUBLISH_VERIFIED');
});

test('Stage 4A: non-overlap later passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
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

  const res = await service.publishScoringConfig(candidate);
  assert.equal(res.status, 'PUBLISH_VERIFIED');
});

test('Stage 4A: overlap row missing Effective_From rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const invalidRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [invalidRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
  assert.equal(audit.calls.length, 0);
});

test('Stage 4A: overlap row missing Effective_To rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const invalidRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-04-01',
    Effective_To: null
  };
  repo.findPublishedByProfileFiscalYear = async () => [invalidRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
  assert.equal(audit.calls.length, 0);
});

test('Stage 4A: overlap row malformed date rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const invalidRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-02-31',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [invalidRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A: overlap row reversed period rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const invalidRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2027-03-31',
    Effective_To: '2026-04-01'
  };
  repo.findPublishedByProfileFiscalYear = async () => [invalidRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A: overlap row status missing or wrong rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const draftRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.DRAFT,
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [draftRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A: wrong Profile_Code row in overlap response rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const wrongProfileRow = {
    ...getValidCandidate(),
    Profile_Code: 'PROF_JAPANESE_STAFF',
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [wrongProfileRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A: wrong Fiscal_Year row in overlap response rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const wrongFYRow = {
    ...getValidCandidate(),
    Fiscal_Year: 'FY2027',
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [wrongFYRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A: malformed/non-array overlap response rejected', async () => {
  for (const badRes of [null, undefined, {}, 'string', 123]) {
    const repo = createInMemoryRepo();
    repo.findPublishedByProfileFiscalYear = async () => badRes;
    const audit = createInMemoryAuditProvider();
    const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

    await assert.rejects(
      () => service.publishScoringConfig(getValidCandidate()),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. TRUSTED AUDIT & TIMEZONE-AWARE DATETIME TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: audit provider not called before all earlier gates pass', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const existing = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [existing];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );

  assert.equal(audit.calls.length, 0);
});

test('Stage 4A: missing trusted publisher rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('', '2026-04-01T00:00:00Z');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /TRUSTED_PUBLISHER_INVALID/
  );
});

test('Stage 4A: date-only timestamp rejected', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2026-04-01');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /TRUSTED_PUBLISHED_AT_INVALID/
  );
});

test('Stage 4A: valid Z timestamp passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2026-04-01T00:00:00Z');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const res = await service.publishScoringConfig(getValidCandidate());
  assert.equal(res.status, 'PUBLISH_VERIFIED');
  assert.equal(res.publishedAt, '2026-04-01T00:00:00Z');
});

test('Stage 4A: valid offset timestamp passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2026-04-01T09:00:00+09:00');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const res = await service.publishScoringConfig(getValidCandidate());
  assert.equal(res.status, 'PUBLISH_VERIFIED');
  assert.equal(res.publishedAt, '2026-04-01T09:00:00+09:00');
});

test('Stage 4A: valid leap day with offset passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2028-02-29T09:00:00+09:00');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const res = await service.publishScoringConfig(getValidCandidate());
  assert.equal(res.status, 'PUBLISH_VERIFIED');
  assert.equal(res.publishedAt, '2028-02-29T09:00:00+09:00');
});

test('Stage 4A: invalid offset-calendar datetime rejected', async () => {
  const invalidDatetimes = [
    '2026-02-31T00:00:00Z',
    '2026-02-31T00:00:00+09:00',
    '2026-04-31T00:00:00+09:00',
    '2026-04-01T25:00:00+09:00',
    '2026-04-01T00:60:00+09:00',
    '2026-04-01T00:00:60+09:00',
    'not-a-datetime'
  ];
  for (const badDt of invalidDatetimes) {
    const repo = createInMemoryRepo();
    const audit = createInMemoryAuditProvider('usr_admin_01', badDt);
    const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

    await assert.rejects(
      () => service.publishScoringConfig(getValidCandidate()),
      /TRUSTED_PUBLISHED_AT_INVALID/
    );
  }
});

test('Stage 4A: invalid timezone offset rejected', async () => {
  const invalidOffsets = [
    '2026-04-01T00:00:00+24:00',
    '2026-04-01T00:00:00+09:60'
  ];
  for (const badDt of invalidOffsets) {
    const repo = createInMemoryRepo();
    const audit = createInMemoryAuditProvider('usr_admin_01', badDt);
    const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

    await assert.rejects(
      () => service.publishScoringConfig(getValidCandidate()),
      /TRUSTED_PUBLISHED_AT_INVALID/
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PUBLISH PATCH & FINAL EXACT VERIFICATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: publish patch contains lifecycle/audit fields only', async () => {
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

test('Stage 4A: final status != PUBLISHED rejected', async () => {
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

test('Stage 4A: final Master_Record_Key mismatch rejected', async () => {
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

test('Stage 4A: final Configuration_Hash mismatch rejected', async () => {
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

test('Stage 4A: final immutable payload mutation rejected', async () => {
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

test('Stage 4A: final publisher mismatch rejected', async () => {
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

test('Stage 4A: final timestamp mismatch rejected', async () => {
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

test('Stage 4A: final success requires recomputed hash equality', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const res = await service.publishScoringConfig(getValidCandidate());
  assert.equal(res.status, 'PUBLISH_VERIFIED');
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. LIFECYCLE MATRIX & ARCHITECTURE TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('Stage 4A: allowed lifecycle matrix passes', () => {
  assert.equal(validateLifecycleTransition('DRAFT', 'VALIDATED'), true);
  assert.equal(validateLifecycleTransition('VALIDATED', 'PUBLISHED'), true);
  assert.equal(validateLifecycleTransition('PUBLISHED', 'SUPERSEDED'), true);
  assert.equal(validateLifecycleTransition('PUBLISHED', 'RETIRED'), true);
  assert.equal(validateLifecycleTransition('SUPERSEDED', 'RETIRED'), true);
});

test('Stage 4A: invalid/reverse/direct jumps fail', () => {
  assert.throws(() => validateLifecycleTransition('DRAFT', 'PUBLISHED'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('VALIDATED', 'DRAFT'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('PUBLISHED', 'DRAFT'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('RETIRED', 'PUBLISHED'), /INVALID_LIFECYCLE_TRANSITION/);
});

test('Stage 4A: service has no Kintone/network/filesystem/Git runtime dependency', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const result = await service.publishScoringConfig(getValidCandidate());
  assert.equal(result.status, 'PUBLISH_VERIFIED');
});
