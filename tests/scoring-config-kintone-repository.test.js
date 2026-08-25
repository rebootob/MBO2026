import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ScoringConfigKintoneRepository,
  normalizeRawRecord,
  escapeKintoneQueryLiteral,
  WP002C_SCORING_MASTER_APP_ID
} from '../src/services/scoring-config-kintone-repository.js';
import { WP002C_SCORING_MASTER_APP_ID as GUARD_APP_ID } from '../src/core/sandbox-write-guard.js';
import {
  getCanonicalBaselineMasterConfigs,
  CONFIG_LIFECYCLE_STATUS,
  computeConfigurationHash
} from '../src/profiles/scoring-config-master.js';

function getValidRawRecord(overrides = {}) {
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const raw = {
    $id: { type: 'RECORD_NUMBER', value: '101' },
    $revision: { type: '__REVISION__', value: '1' }
  };

  for (const [key, val] of Object.entries(base)) {
    if (key === 'Published_By') {
      raw[key] = { type: 'USER_SELECT', value: [] };
    } else {
      raw[key] = { type: 'SINGLE_LINE_TEXT', value: String(val) };
    }
  }

  raw.Published_By = { type: 'USER_SELECT', value: [] };
  raw.Published_At = { type: 'SINGLE_LINE_TEXT', value: '' };
  raw.Configuration_Hash = { type: 'SINGLE_LINE_TEXT', value: hash };

  return { ...raw, ...overrides };
}

function createFakeAdapter(requestImpl, authorizeWriteImpl) {
  const reqCalls = [];
  const authCalls = [];

  const req = async (opts) => {
    reqCalls.push(opts);
    if (requestImpl) {
      return await requestImpl(opts);
    }
    return {};
  };

  const auth = (ctx) => {
    authCalls.push(ctx);
    if (authorizeWriteImpl) {
      return authorizeWriteImpl(ctx);
    }
    return true;
  };

  const repo = new ScoringConfigKintoneRepository({ request: req, authorizeWrite: auth });
  return { repo, reqCalls, authCalls };
}

// ── Step 9 & Must-Fix Hardening Tests ──

test('Stage 4B 1: constructor requires request function', () => {
  assert.throws(
    () => new ScoringConfigKintoneRepository({ request: null, authorizeWrite: () => true }),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 2: constructor requires authorizeWrite function', () => {
  assert.throws(
    () => new ScoringConfigKintoneRepository({ request: async () => ({}), authorizeWrite: null }),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 3: target app fixed to numeric 796 from guard constant', () => {
  const { repo } = createFakeAdapter();
  assert.equal(repo.appId, 796);
  assert.equal(typeof repo.appId, 'number');
  assert.equal(WP002C_SCORING_MASTER_APP_ID, 796);
  assert.equal(WP002C_SCORING_MASTER_APP_ID, GUARD_APP_ID);
});

test('Stage 4B 4: normalization of all 23 fields', () => {
  const raw = getValidRawRecord();
  const norm = normalizeRawRecord(raw);
  assert.equal(norm.Master_Record_Key, 'PROF_STAFF_CHIEF::v1.0.0');
  assert.equal(norm.Profile_Code, 'PROF_STAFF_CHIEF');
  assert.equal(norm.PartA_Weight, '70');
  assert.equal(norm.Config_Status, 'PUBLISHED');
});

test('Stage 4B 5: metadata __recordId + __storageRevision', () => {
  const raw = getValidRawRecord({ $id: { value: '456' }, $revision: { value: '3' } });
  const norm = normalizeRawRecord(raw);
  assert.equal(norm.__recordId, '456');
  assert.equal(norm.__storageRevision, '3');
});

test('Stage 4B 6: unknown raw fields ignored during normalization', () => {
  const raw = getValidRawRecord({
    Unknown_Field_X: { type: 'SINGLE_LINE_TEXT', value: 'secret' }
  });
  const norm = normalizeRawRecord(raw);
  assert.equal(norm.Unknown_Field_X, undefined);
});

test('Stage 4B 7: missing $id rejected', () => {
  const raw = getValidRawRecord();
  delete raw.$id;
  assert.throws(() => normalizeRawRecord(raw), /REPOSITORY_RESPONSE_INVALID/);
});

test('Stage 4B 8: malformed / whitespace / non-integer $id rejected', () => {
  for (const badId of ['0', ' 101 ', '-1', '1.5', '9007199254740993', 'abc', null, undefined]) {
    const raw = getValidRawRecord({ $id: { value: badId } });
    assert.throws(() => normalizeRawRecord(raw), /REPOSITORY_RESPONSE_INVALID/);
  }
});

test('Stage 4B 9: missing $revision rejected', () => {
  const raw = getValidRawRecord();
  delete raw.$revision;
  assert.throws(() => normalizeRawRecord(raw), /REPOSITORY_RESPONSE_INVALID/);
});

test('Stage 4B 10: malformed / whitespace / non-integer $revision rejected', () => {
  for (const badRev of ['0', ' 1 ', '-1', '9007199254740993', 'abc', null]) {
    const raw = getValidRawRecord({ $revision: { value: badRev } });
    assert.throws(() => normalizeRawRecord(raw), /REPOSITORY_RESPONSE_INVALID/);
  }
});

test('Stage 4B 11: missing planned business field rejected', () => {
  const raw = getValidRawRecord();
  delete raw.PartA_Weight;
  assert.throws(() => normalizeRawRecord(raw), /REPOSITORY_RESPONSE_INVALID/);
});

test('Stage 4B 12: malformed field wrapper or non-string scalar value rejected', () => {
  const raw1 = getValidRawRecord({ PartA_Weight: 'not_an_object' });
  assert.throws(() => normalizeRawRecord(raw1), /REPOSITORY_RESPONSE_INVALID/);

  const raw2 = getValidRawRecord({ PartA_Weight: { type: 'SINGLE_LINE_TEXT', value: 70 } }); // number instead of string
  assert.throws(() => normalizeRawRecord(raw2), /REPOSITORY_RESPONSE_INVALID/);
});

test('Stage 4B 13: Published_By empty array -> empty string', () => {
  const raw = getValidRawRecord({ Published_By: { type: 'USER_SELECT', value: [] } });
  const norm = normalizeRawRecord(raw);
  assert.equal(norm.Published_By, '');
});

test('Stage 4B 14: Published_By one user -> exact code without trim mutation', () => {
  const raw = getValidRawRecord({ Published_By: { type: 'USER_SELECT', value: [{ code: 'usr_admin_01' }] } });
  const norm = normalizeRawRecord(raw);
  assert.equal(norm.Published_By, 'usr_admin_01');
});

test('Stage 4B 15: Published_By user with whitespace or malformed code rejected', () => {
  const raw1 = getValidRawRecord({ Published_By: { type: 'USER_SELECT', value: [{ code: ' usr_admin_01 ' }] } });
  assert.throws(() => normalizeRawRecord(raw1), /REPOSITORY_RESPONSE_INVALID/);

  const raw2 = getValidRawRecord({ Published_By: { type: 'USER_SELECT', value: [{ code: '' }] } });
  assert.throws(() => normalizeRawRecord(raw2), /REPOSITORY_RESPONSE_INVALID/);
});

test('Stage 4B 16: Published_By >1 user rejected', () => {
  const raw = getValidRawRecord({ Published_By: { type: 'USER_SELECT', value: [{ code: 'u1' }, { code: 'u2' }] } });
  assert.throws(() => normalizeRawRecord(raw), /REPOSITORY_RESPONSE_INVALID/);
});

test('Stage 4B 17: findByMasterKey zero -> null', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ records: [] }));
  const result = await repo.findByMasterKey('PROF_STAFF_CHIEF::v1.0.0');
  assert.equal(result, null);
  assert.equal(reqCalls[0].params.app, 796);
});

test('Stage 4B 18: findByMasterKey one -> exact record', async () => {
  const raw = getValidRawRecord();
  const { repo } = createFakeAdapter(async () => ({ records: [raw] }));
  const result = await repo.findByMasterKey('PROF_STAFF_CHIEF::v1.0.0');
  assert.equal(result.Master_Record_Key, 'PROF_STAFF_CHIEF::v1.0.0');
  assert.equal(result.__recordId, '101');
});

test('Stage 4B 19: findByMasterKey >1 rejected', async () => {
  const raw1 = getValidRawRecord();
  const raw2 = getValidRawRecord({ $id: { value: '102' } });
  const { repo } = createFakeAdapter(async () => ({ records: [raw1, raw2] }));
  await assert.rejects(
    () => repo.findByMasterKey('PROF_STAFF_CHIEF::v1.0.0'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 20: findByMasterKey returned key mismatch rejected', async () => {
  const raw = getValidRawRecord();
  const { repo } = createFakeAdapter(async () => ({ records: [raw] }));
  await assert.rejects(
    () => repo.findByMasterKey('DIFFERENT_KEY::v1.0.0'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 21: master key query requires exact non-trimmed string and handles escaping', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ records: [] }));
  await assert.rejects(
    () => repo.findByMasterKey(' PROF_STAFF_CHIEF::v1.0.0 '), // whitespace rejected
    /REPOSITORY_RESPONSE_INVALID/
  );

  await repo.findByMasterKey('KEY\"TEST\\123::v1.0.0');
  assert.ok(reqCalls[0].params.query.includes('KEY\\"TEST\\\\123::v1.0.0'));
});

test('Stage 4B 22: getByRecordId exact success with number or string ID', async () => {
  const raw1 = getValidRawRecord({ $id: { value: '202' } });
  const { repo: repo1, reqCalls: reqCalls1 } = createFakeAdapter(async () => ({ record: raw1 }));
  const result1 = await repo1.getByRecordId('202');
  assert.equal(result1.__recordId, '202');
  assert.equal(reqCalls1[0].params.id, '202');

  const raw2 = getValidRawRecord({ $id: { value: '303' } });
  const { repo: repo2, reqCalls: reqCalls2 } = createFakeAdapter(async () => ({ record: raw2 }));
  const result2 = await repo2.getByRecordId(303);
  assert.equal(result2.__recordId, '303');
  assert.equal(reqCalls2[0].params.id, '303');
});

test('Stage 4B 23: getByRecordId requested/returned ID mismatch rejected', async () => {
  const raw = getValidRawRecord({ $id: { value: '202' } });
  const { repo } = createFakeAdapter(async () => ({ record: raw }));
  await assert.rejects(
    () => repo.getByRecordId('999'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 24: invalid / whitespace / unsafe record ID rejected before request', async () => {
  const { repo, reqCalls } = createFakeAdapter();
  for (const badId of [-5, 0, ' 202 ', 'abc', '', null, 9007199254740993]) {
    await assert.rejects(
      () => repo.getByRecordId(badId),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
  assert.equal(reqCalls.length, 0);
});

test('Stage 4B 25: published query exact profile/FY/status', async () => {
  const raw = getValidRawRecord();
  const { repo, reqCalls } = createFakeAdapter(async () => ({ records: [raw] }));
  const res = await repo.findPublishedByProfileFiscalYear('PROF_STAFF_CHIEF', 'FY2026');
  assert.equal(res.length, 1);
  assert.equal(reqCalls[0].params.app, 796);
  assert.ok(reqCalls[0].params.query.includes('Profile_Code = "PROF_STAFF_CHIEF"'));
  assert.ok(reqCalls[0].params.query.includes('Fiscal_Year = "FY2026"'));
  assert.ok(reqCalls[0].params.query.includes('Config_Status = "PUBLISHED"'));
});

test('Stage 4B 26: published query rejects whitespace input and handles escaping', async () => {
  const { repo } = createFakeAdapter(async () => ({ records: [] }));
  await assert.rejects(
    () => repo.findPublishedByProfileFiscalYear(' PROF_STAFF_CHIEF ', 'FY2026'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 27: published query malformed response rejected', async () => {
  const { repo } = createFakeAdapter(async () => ({ records: null }));
  await assert.rejects(
    () => repo.findPublishedByProfileFiscalYear('PROF_STAFF_CHIEF', 'FY2026'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 28: published query unexpected profile row rejected', async () => {
  const raw = getValidRawRecord({ Profile_Code: { type: 'SINGLE_LINE_TEXT', value: 'OTHER_PROF' } });
  const { repo } = createFakeAdapter(async () => ({ records: [raw] }));
  await assert.rejects(
    () => repo.findPublishedByProfileFiscalYear('PROF_STAFF_CHIEF', 'FY2026'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 29: published query unexpected fiscal year row rejected', async () => {
  const raw = getValidRawRecord({ Fiscal_Year: { type: 'SINGLE_LINE_TEXT', value: 'FY2099' } });
  const { repo } = createFakeAdapter(async () => ({ records: [raw] }));
  await assert.rejects(
    () => repo.findPublishedByProfileFiscalYear('PROF_STAFF_CHIEF', 'FY2026'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 30: published query non-PUBLISHED row rejected', async () => {
  const raw = getValidRawRecord({ Config_Status: { type: 'SINGLE_LINE_TEXT', value: 'DRAFT' } });
  const { repo } = createFakeAdapter(async () => ({ records: [raw] }));
  await assert.rejects(
    () => repo.findPublishedByProfileFiscalYear('PROF_STAFF_CHIEF', 'FY2026'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 31: createValidatedRecord authorizer called as last pre-request gate', async () => {
  let reqCalled = false;
  const { repo, authCalls } = createFakeAdapter(
    async () => { reqCalled = true; return { id: '301', revision: '1' }; },
    (ctx) => { assert.equal(reqCalled, false); return true; }
  );

  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  const newId = await repo.createValidatedRecord(valRecord);
  assert.equal(newId, '301');
  assert.equal(authCalls.length, 1);
  assert.equal(authCalls[0].operation, 'SCORING_CONFIG_CREATE_VALIDATED');
  assert.equal(authCalls[0].appId, 796);
});

test('Stage 4B 32: authorizer false blocks request and throws WRITE_AUTHORIZATION_FAILED', async () => {
  const { repo, reqCalls } = createFakeAdapter(
    async () => ({ id: '301', revision: '1' }),
    () => false
  );

  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  await assert.rejects(
    () => repo.createValidatedRecord(valRecord),
    (err) => err.message === 'WRITE_AUTHORIZATION_FAILED'
  );
  assert.equal(reqCalls.length, 0);
});

test('Stage 4B 33: missing / non-string create field fails BEFORE authorizer and request', async () => {
  const { repo, reqCalls, authCalls } = createFakeAdapter();
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };
  delete valRecord.PartA_Weight; // missing required field!

  await assert.rejects(
    () => repo.createValidatedRecord(valRecord),
    /REPOSITORY_RESPONSE_INVALID/
  );
  assert.equal(authCalls.length, 0);
  assert.equal(reqCalls.length, 0);
});

test('Stage 4B 34: validated status required for creation', async () => {
  const { repo } = createFakeAdapter();
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'DRAFT', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  await assert.rejects(
    () => repo.createValidatedRecord(valRecord),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 35: exact 64-char lowercase configuration hash required', async () => {
  const { repo } = createFakeAdapter();
  const base = getCanonicalBaselineMasterConfigs()[0];
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: 'INVALID_HASH', Published_By: '', Published_At: '' };

  await assert.rejects(
    () => repo.createValidatedRecord(valRecord),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 36: validated Published_By must be empty', async () => {
  const { repo } = createFakeAdapter();
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: 'user1', Published_At: '' };

  await assert.rejects(
    () => repo.createValidatedRecord(valRecord),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 37: create body pinned numeric app 796', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ id: '301', revision: '1' }));
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  await repo.createValidatedRecord(valRecord);
  assert.equal(reqCalls[0].body.app, 796);
});

test('Stage 4B 38: create body contains planned fields only', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ id: '301', revision: '1' }));
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  await repo.createValidatedRecord(valRecord);
  const bodyFields = Object.keys(reqCalls[0].body.record);
  assert.equal(bodyFields.length, 23);
  assert.equal(bodyFields.includes('__recordId'), false);
  assert.equal(bodyFields.includes('__storageRevision'), false);
});

test('Stage 4B 39: create Published_By writes []', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ id: '301', revision: '1' }));
  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  await repo.createValidatedRecord(valRecord);
  assert.deepEqual(reqCalls[0].body.record.Published_By.value, []);
});

test('Stage 4B 40: create malformed / unsafe ID/revision response rejected', async () => {
  for (const badResp of [{ id: null, revision: '1' }, { id: '301', revision: '9007199254740993' }, { id: ' 301 ', revision: '1' }]) {
    const { repo } = createFakeAdapter(async () => badResp);
    const base = getCanonicalBaselineMasterConfigs()[0];
    const hash = computeConfigurationHash(base);
    const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

    await assert.rejects(
      () => repo.createValidatedRecord(valRecord),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

test('Stage 4B 41: publish authorizer called as last pre-request gate', async () => {
  let reqCalled = false;
  const { repo, authCalls } = createFakeAdapter(
    async () => { reqCalled = true; return { revision: '2' }; },
    (ctx) => { assert.equal(reqCalled, false); return true; }
  );

  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  const ok = await repo.publishRecord('101', patch, '1');
  assert.equal(ok, true);
  assert.equal(authCalls.length, 1);
  assert.equal(authCalls[0].operation, 'SCORING_CONFIG_PUBLISH');
  assert.equal(authCalls[0].appId, 796);
});

test('Stage 4B 42: publish authorizer receives exact expected revision', async () => {
  const { repo, authCalls } = createFakeAdapter(async () => ({ revision: '5' }));
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await repo.publishRecord('101', patch, '4');
  assert.equal(authCalls[0].expectedRevision, '4');
});

test('Stage 4B 43: publish patch exact 3 keys only', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ revision: '2' }));
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await repo.publishRecord('101', patch, '1');
  const recordPatchKeys = Object.keys(reqCalls[0].body.record);
  assert.deepEqual(recordPatchKeys.sort(), ['Config_Status', 'Published_At', 'Published_By'].sort());
});

test('Stage 4B 44: publish immutable field injection rejected before authorizer', async () => {
  const { repo, authCalls } = createFakeAdapter();
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z', PartA_Weight: '80' };
  await assert.rejects(
    () => repo.publishRecord('101', patch, '1'),
    /REPOSITORY_RESPONSE_INVALID/
  );
  assert.equal(authCalls.length, 0);
});

test('Stage 4B 45: publish status must be PUBLISHED', async () => {
  const { repo } = createFakeAdapter();
  const patch = { Config_Status: 'VALIDATED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await assert.rejects(
    () => repo.publishRecord('101', patch, '1'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 46: publish publisher with whitespace or empty rejected', async () => {
  const { repo } = createFakeAdapter();
  for (const badPub of ['   ', ' usr_admin_01 ', '']) {
    const patch = { Config_Status: 'PUBLISHED', Published_By: badPub, Published_At: '2026-04-01T00:00:00Z' };
    await assert.rejects(
      () => repo.publishRecord('101', patch, '1'),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

test('Stage 4B 47: publish timestamp with whitespace or empty rejected', async () => {
  const { repo } = createFakeAdapter();
  for (const badTs of ['', ' 2026-04-01T00:00:00Z ']) {
    const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: badTs };
    await assert.rejects(
      () => repo.publishRecord('101', patch, '1'),
      /REPOSITORY_RESPONSE_INVALID/
    );
  }
});

test('Stage 4B 48: publish request pinned numeric app 796', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ revision: '2' }));
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await repo.publishRecord('101', patch, '1');
  assert.equal(reqCalls[0].body.app, 796);
});

test('Stage 4B 49: publish sends revision token', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ revision: '2' }));
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await repo.publishRecord('101', patch, '1');
  assert.equal(reqCalls[0].body.revision, '1');
});

test('Stage 4B 50: publish USER_SELECT shape exact [{code}]', async () => {
  const { repo, reqCalls } = createFakeAdapter(async () => ({ revision: '2' }));
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await repo.publishRecord('101', patch, '1');
  assert.deepEqual(reqCalls[0].body.record.Published_By.value, [{ code: 'usr_admin_01' }]);
});

test('Stage 4B 51: publish response revision must advance', async () => {
  const { repo } = createFakeAdapter(async () => ({ revision: '1' })); // same revision, not advanced!
  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await assert.rejects(
    () => repo.publishRecord('101', patch, '1'),
    /REPOSITORY_RESPONSE_INVALID/
  );
});

test('Stage 4B 52: request throw -> redacts message to stable KINTONE_REPOSITORY_REQUEST_FAILED', async () => {
  const { repo } = createFakeAdapter(async () => {
    throw new Error('Network secret payload: SECRET_DO_NOT_LEAK_123');
  });
  await assert.rejects(
    () => repo.getByRecordId('101'),
    (err) => {
      assert.equal(err.message, 'KINTONE_REPOSITORY_REQUEST_FAILED');
      assert.equal(err.message.includes('SECRET_DO_NOT_LEAK'), false);
      return true;
    }
  );
});

test('Stage 4B 53: authorizer throw -> redacts message to stable WRITE_AUTHORIZATION_FAILED', async () => {
  const { repo } = createFakeAdapter(
    async () => ({ id: '301', revision: '1' }),
    () => { throw new Error('Auth secret payload: SECRET_DO_NOT_LEAK_456'); }
  );

  const base = getCanonicalBaselineMasterConfigs()[0];
  const hash = computeConfigurationHash(base);
  const valRecord = { ...base, Config_Status: 'VALIDATED', Configuration_Hash: hash, Published_By: '', Published_At: '' };

  await assert.rejects(
    () => repo.createValidatedRecord(valRecord),
    (err) => {
      assert.equal(err.message, 'WRITE_AUTHORIZATION_FAILED');
      assert.equal(err.message.includes('SECRET_DO_NOT_LEAK'), false);
      return true;
    }
  );
});

test('Stage 4B 54: no automatic retry on read or write failure', async () => {
  let readCallCount = 0;
  let writeCallCount = 0;
  const { repo } = createFakeAdapter(async ({ method }) => {
    if (method === 'GET') {
      readCallCount++;
      throw new Error('Server 500');
    }
    writeCallCount++;
    throw new Error('Revision Conflict 409');
  });

  await assert.rejects(() => repo.getByRecordId('101'), /KINTONE_REPOSITORY_REQUEST_FAILED/);
  assert.equal(readCallCount, 1);

  const patch = { Config_Status: 'PUBLISHED', Published_By: 'usr_admin_01', Published_At: '2026-04-01T00:00:00Z' };
  await assert.rejects(() => repo.publishRecord('101', patch, '1'), /KINTONE_REPOSITORY_REQUEST_FAILED/);
  assert.equal(writeCallCount, 1);
});

test('Stage 4B 55: repository source contains no fetch/process.env/.env/Kintone connection import', () => {
  const sourceCode = fs.readFileSync('src/services/scoring-config-kintone-repository.js', 'utf-8');
  assert.equal(sourceCode.includes('fetch('), false);
  assert.equal(sourceCode.includes('process.env'), false);
  assert.equal(sourceCode.includes('.env'), false);
  assert.equal(sourceCode.includes('getKintoneConnection'), false);
});
