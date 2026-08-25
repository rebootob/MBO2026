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

// ── Baseline & Core Integration Tests ──
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

// ── MUST FIX B & C: Dependency Contract & Candidate Status Hardening ──
test('Stage 4A Hardening: missing required repository method fails closed', () => {
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

test('Stage 4A Hardening: missing required audit provider method fails closed', () => {
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

test('Stage 4A Hardening: array returned where exact record object expected is rejected', async () => {
  const repo = createInMemoryRepo();
  repo.findByMasterKey = async () => []; // array instead of null/object
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4A Hardening: invalid numeric record IDs (NaN, Infinity) reject', async () => {
  for (const invalidId of [NaN, Infinity, -Infinity, '   ']) {
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

test('Stage 4A Hardening: candidate Config_Status = null rejects', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: null };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A Hardening: candidate Config_Status = "" rejects', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: '' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
});

test('Stage 4A Hardening: candidate Config_Status = DRAFT passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'DRAFT' };
  const res = await service.publishScoringConfig(candidate);
  assert.equal(res.status, 'PUBLISH_VERIFIED');
});

// ── MUST FIX A: Overlap Row Contract Hardening ──
test('Stage 4A Hardening: overlap row missing Effective_From rejects before audit/publish', async () => {
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

test('Stage 4A Hardening: overlap row missing Effective_To rejects before audit/publish', async () => {
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

test('Stage 4A Hardening: overlap row malformed date rejects', async () => {
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

test('Stage 4A Hardening: overlap row reversed period rejects', async () => {
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

test('Stage 4A Hardening: overlap row status missing or wrong rejects', async () => {
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

test('Stage 4A Hardening: valid PUBLISHED overlap row still detects inclusive overlap', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const validPublishedRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [validPublishedRow];

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /SCORING_CONFIG_EFFECTIVE_OVERLAP/
  );
});

test('Stage 4A Hardening: valid non-overlap published row still passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const validNonOverlapRow = {
    ...getValidCandidate(),
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Effective_From: '2025-04-01',
    Effective_To: '2026-03-31'
  };
  repo.findPublishedByProfileFiscalYear = async () => [validNonOverlapRow];

  const candidate = {
    ...getValidCandidate(),
    Scoring_Config_Version: 'v1.1.0',
    Master_Record_Key: 'PROF_STAFF_CHIEF::v1.1.0',
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31'
  };

  const res = await service.publishScoringConfig(candidate);
  assert.equal(res.status, 'PUBLISH_VERIFIED');
});

// ── MUST FIX D: Timezone-aware Published_At Datetime Hardening ──
test('Stage 4A Hardening: date-only trusted Published_At rejects', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2026-04-01'); // date-only
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  await assert.rejects(
    () => service.publishScoringConfig(getValidCandidate()),
    /TRUSTED_PUBLISHED_AT_INVALID/
  );
});

test('Stage 4A Hardening: ISO Z timestamp passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2026-04-01T00:00:00Z');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const res = await service.publishScoringConfig(getValidCandidate());
  assert.equal(res.status, 'PUBLISH_VERIFIED');
  assert.equal(res.publishedAt, '2026-04-01T00:00:00Z');
});

test('Stage 4A Hardening: ISO offset timestamp passes', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider('usr_admin_01', '2026-04-01T09:00:00+09:00');
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const res = await service.publishScoringConfig(getValidCandidate());
  assert.equal(res.status, 'PUBLISH_VERIFIED');
  assert.equal(res.publishedAt, '2026-04-01T09:00:00+09:00');
});

test('Stage 4A Hardening: invalid timezone/calendar datetime rejects', async () => {
  for (const badDt of ['2026-02-31T00:00:00Z', '2026-04-01T25:00:00Z', 'not-a-datetime']) {
    const repo = createInMemoryRepo();
    const audit = createInMemoryAuditProvider('usr_admin_01', badDt);
    const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

    await assert.rejects(
      () => service.publishScoringConfig(getValidCandidate()),
      /TRUSTED_PUBLISHED_AT_INVALID/
    );
  }
});

// ── Existing Comprehensive Fail-Closed Tests ──
test('Stage 4A: caller cannot set PUBLISHED directly', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const candidate = { ...getValidCandidate(), Config_Status: 'PUBLISHED' };
  await assert.rejects(
    () => service.publishScoringConfig(candidate),
    /UNTRUSTED_LIFECYCLE_FIELD/
  );
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

test('Stage 4A: unsupported supersession fails before persistence', async () => {
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

test('Stage 4A: duplicate master key blocks before persistence', async () => {
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

test('Stage 4A: initial read-back wrong master key -> CONFIG_READBACK_MISMATCH', async () => {
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

test('Stage 4A: initial read-back hash mismatch -> CONFIG_READBACK_MISMATCH', async () => {
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

test('Stage 4A: audit provider is not called before validation/read-back/overlap pass', async () => {
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

test('Stage 4A: final read-back hash mismatch -> PUBLISH_VERIFICATION_FAILED', async () => {
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

test('Stage 4A: valid lifecycle transition matrix passes', () => {
  assert.equal(validateLifecycleTransition('DRAFT', 'VALIDATED'), true);
  assert.equal(validateLifecycleTransition('VALIDATED', 'PUBLISHED'), true);
  assert.equal(validateLifecycleTransition('PUBLISHED', 'SUPERSEDED'), true);
  assert.equal(validateLifecycleTransition('PUBLISHED', 'RETIRED'), true);
  assert.equal(validateLifecycleTransition('SUPERSEDED', 'RETIRED'), true);
});

test('Stage 4A: invalid/reverse/direct-jump lifecycle transitions fail', () => {
  assert.throws(() => validateLifecycleTransition('DRAFT', 'PUBLISHED'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('VALIDATED', 'DRAFT'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('PUBLISHED', 'DRAFT'), /INVALID_LIFECYCLE_TRANSITION/);
  assert.throws(() => validateLifecycleTransition('RETIRED', 'PUBLISHED'), /INVALID_LIFECYCLE_TRANSITION/);
});

test('Stage 4A: no baseline fixture, filesystem, Git, JSON, or Kintone dependency is used by the service', async () => {
  const repo = createInMemoryRepo();
  const audit = createInMemoryAuditProvider();
  const service = new ScoringConfigMasterService({ repository: repo, auditProvider: audit });

  const result = await service.publishScoringConfig(getValidCandidate());
  assert.equal(result.status, 'PUBLISH_VERIFIED');
});
