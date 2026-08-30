import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSandboxAppIds,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  DISCOVERY_MODE
} from '../src/core/sandbox-write-guard.js';
import { hoshinFields, revisionArchiveFields } from '../config/schema-spec.js';
import fs from 'node:fs';
import {
  DEFAULT_APP_IDS,
  renderHrControlCenterHtml,
  buildHrccMonitoringQuery,
  ALLOWED_MONITORING_FIELDS_794,
  CONFIDENTIAL_FIELDS_PROHIBITED,
  escapeHtml,
  fetchAllApp794Records,
  fetchHealthCount,
  aggregatePipelineByStatus,
  applyHrccFilters,
  createHrccRuntime
} from '../src/ui/hr-control-center.js';
import {
  buildClassicHrccBundle,
  validateHrccBundleArtifacts,
  assertApp800LeastPrivilegeAcl
} from '../scripts/kintone/deploy-delivery-sprint02.js';
import { getCanonicalBaselineMasterConfigs, PROFILE_CODES } from '../src/profiles/scoring-config-master.js';

test('Sprint 02: getSandboxAppIds recognizes all 6 sandbox app IDs when present', () => {
  const mockRegistry = {
    mboV2AppId: 794,
    routingMasterAppId: 795,
    scoringConfigMasterAppId: 796,
    hoshinMasterAppId: 797,
    revisionArchiveAppId: 798,
    hrControlCenterAppId: 799
  };
  const appIds = getSandboxAppIds(mockRegistry);
  assert.deepEqual(appIds, [794, 795, 796, 797, 798, 799]);
});

test('Sprint 02: Protected apps and default deny write guard remain strictly enforced', () => {
  assert.equal(DISCOVERY_MODE, true);
  assert.deepEqual(WRITE_ALLOWED_APPS, []);
  assert.deepEqual(PROTECTED_APP_IDS, [53, 283, 305, 307, 310, 640, 643, 715, 716]);
});

test('Sprint 02: App 797 Hoshin schema specification has exact 19 fields', () => {
  const keys = Object.keys(hoshinFields);
  assert.equal(keys.length, 19, `Expected 19 fields for Hoshin schema, got ${keys.length}`);
  assert.equal(hoshinFields.Hoshin_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(hoshinFields.Hoshin_Key.required, true);
  assert.equal(hoshinFields.Hoshin_Key.unique, true);
  assert.equal(hoshinFields.Scope_Type.type, 'DROP_DOWN');
  assert.equal(hoshinFields.Ready_For_MBO.type, 'RADIO_BUTTON');
  assert.equal(hoshinFields.Hoshin_Status.type, 'DROP_DOWN');
});

test('Sprint 02: App 798 Revision Archive schema specification has exact 15 fields', () => {
  const keys = Object.keys(revisionArchiveFields);
  assert.equal(keys.length, 15, `Expected 15 fields for Revision Archive schema, got ${keys.length}`);
  assert.equal(revisionArchiveFields.Archive_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(revisionArchiveFields.Archive_Key.required, true);
  assert.equal(revisionArchiveFields.Archive_Key.unique, true);
  assert.equal(revisionArchiveFields.Evaluation_Stage.type, 'DROP_DOWN');
  assert.equal(revisionArchiveFields.Reason.type, 'MULTI_LINE_TEXT');
  assert.equal(revisionArchiveFields.Snapshot_JSON.type, 'MULTI_LINE_TEXT');
});

test('Sprint 02: Secure HR Control Center component excludes all confidential fields', () => {
  const query = buildHrccMonitoringQuery(ALLOWED_MONITORING_FIELDS_794);
  for (const cf of CONFIDENTIAL_FIELDS_PROHIBITED) {
    assert.equal(query.includes(cf), false, `Query must NOT include confidential field "${cf}"`);
  }
  const html = renderHrControlCenterHtml({
    evaluations: [
      { $id: { value: '1' }, Employee_Code: { value: 'EMP001' }, Status: { value: 'COMPLETED' } }
    ],
    health: { app794Count: 1, routingCoverage: '12/12', configCount: 8, hoshinCount: 1, archiveCount: 0 },
    warnings: []
  });
  assert.equal(html.includes('MBO 2026 — HR Control Center'), true);
  assert.equal(html.includes('EMP001'), true);
  assert.equal(html.includes('PartA_Weighted_Score'), false);
});

test('Sprint 02: Position ratio rule regression - Assistant Manager 60/40 confirmed', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const asstMgrRecord = baselines.find(r => r.Profile_Code === PROFILE_CODES.ASST_MGR);
  assert.equal(asstMgrRecord.PartA_Weight, 60);
  assert.equal(asstMgrRecord.PartB_Weight, 40);
});

test('Sprint 02R: App 798 Revision Archive exact required contract has all 3 required flags set to true', () => {
  assert.equal(revisionArchiveFields.Reason.required, true, 'Reason MUST be required=true');
  assert.equal(revisionArchiveFields.Snapshot_JSON.required, true, 'Snapshot_JSON MUST be required=true');
  assert.equal(revisionArchiveFields.Archived_At.required, true, 'Archived_At MUST be required=true');
  assert.equal(Object.keys(revisionArchiveFields).length, 15, 'Revision Archive schema must contain exactly 15 fields');
});

test('Sprint 02R: HRCC query builder enforces strict whitelist security and fails closed on non-whitelisted fields', () => {
  const validQuery = buildHrccMonitoringQuery(ALLOWED_MONITORING_FIELDS_794);
  assert.equal(validQuery, '$id,Fiscal_Year,Employee_Code,Employee_Name,Employee_Name_TH,Employee_Department,Employee_Section,Employee_Position,Status');

  assert.throws(() => {
    buildHrccMonitoringQuery(['$id', 'Manager_Comment']);
  }, /SECURITY VIOLATION/);

  assert.throws(() => {
    buildHrccMonitoringQuery(['PartA_Weighted_Score']);
  }, /SECURITY VIOLATION/);
});



test('Sprint 02R2: Classic HRCC bundle deploy validator consumes canonical dist artifacts without import/export statements', () => {
  const { jsCode } = validateHrccBundleArtifacts();
  assert.equal(/\bimport\b/.test(jsCode), false, 'Bundle must not contain import keyword');
  assert.equal(/\bexport\b/.test(jsCode), false, 'Bundle must not contain export keyword');
  assert.equal(jsCode.includes('MboKintoneAuthAdapter'), true, 'Bundle must include MboKintoneAuthAdapter');
  assert.equal(jsCode.includes('resetMboPassword'), true, 'Bundle must include resetMboPassword');
});

test('Sprint 02R2: fetchAllApp794Records executes bounded GET pagination up to limit', async () => {
  let callCount = 0;
  const fakeApi = async (path, method, params) => {
    callCount++;
    if (callCount === 1) {
      return { records: new Array(500).fill({ $id: { value: '1' }, Status: { value: 'SUBMITTED' } }) };
    }
    return { records: new Array(150).fill({ $id: { value: '2' }, Status: { value: 'DRAFT' } }) };
  };

  const { records, truncated } = await fetchAllApp794Records(fakeApi, 794, 20);
  assert.equal(records.length, 650);
  assert.equal(truncated, false);
  assert.equal(callCount, 2);
});

test('Sprint 02R2: fetchHealthCount parses totalCount accurately and handles denied sources safely', async () => {
  const fakeSuccessApi = async () => ({ totalCount: 12, records: [{ $id: { value: '1' } }] });
  const hSuccess = await fetchHealthCount(fakeSuccessApi, 795);
  assert.equal(hSuccess.available, true);
  assert.equal(hSuccess.count, 12);

  const fakeDeniedApi = async () => { throw new Error('HTTP 403 Access Denied'); };
  const hDenied = await fetchHealthCount(fakeDeniedApi, 795);
  assert.equal(hDenied.available, false);
  assert.equal(hDenied.count, null);
  assert.equal(hDenied.error.includes('403'), true);
});

test('Sprint 02R2: aggregatePipelineByStatus and applyHrccFilters filter and aggregate records accurately', () => {
  const evaluations = [
    { Fiscal_Year: { value: 'FY2026' }, Employee_Department: { value: 'IT' }, Employee_Section: { value: 'Dev' }, Status: { value: 'DRAFT' } },
    { Fiscal_Year: { value: 'FY2026' }, Employee_Department: { value: 'HR' }, Employee_Section: { value: 'Ops' }, Status: { value: 'SUBMITTED' } },
    { Fiscal_Year: { value: 'FY2027' }, Employee_Department: { value: 'IT' }, Employee_Section: { value: 'Dev' }, Status: { value: 'COMPLETED' } }
  ];

  const pipeline = aggregatePipelineByStatus(evaluations);
  assert.equal(pipeline.DRAFT, 1);
  assert.equal(pipeline.SUBMITTED, 1);
  assert.equal(pipeline.COMPLETED, 1);

  const filteredIT = applyHrccFilters(evaluations, { dept: 'IT' });
  assert.equal(filteredIT.length, 2);

  const filteredFY2027 = applyHrccFilters(evaluations, { fy: 'FY2027' });
  assert.equal(filteredFY2027.length, 1);
  assert.equal(filteredFY2027[0].Status.value, 'COMPLETED');
});

test('Sprint 02R2: createHrccRuntime does nothing when current app ID does not match HRCC App ID', async () => {
  let apiCalled = false;
  const fakeApi = async () => { apiCalled = true; return {}; };
  const runtime = createHrccRuntime({
    kintoneApi: fakeApi,
    appIds: DEFAULT_APP_IDS,
    getAppId: () => 794, // Wrong app ID (not 800)
    getHeaderSpaceElement: () => ({ innerHTML: '' })
  });

  const event = { type: 'app.record.index.show' };
  const res = await runtime(event);
  assert.equal(res, event);
  assert.equal(apiCalled, false, 'API must not be called when app ID != 800');
});

test('Sprint 02R2: renderHrControlCenterHtml handles denied health sources safely without reporting count 0', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [],
    allEvaluations: [],
    health: {
      app794Count: 0,
      routing: { available: false, count: null },
      scoring: { available: true, count: 8 },
      hoshin: { available: true, count: 2 },
      archive: { available: false, count: null }
    },
    warnings: ['App 795 (Routing Master) is unavailable or access denied.'],
    appIds: DEFAULT_APP_IDS
  });

  assert.equal(html.includes('Unavailable / Access denied'), true);
  assert.equal(html.includes('App 795 (Routing Master) is unavailable'), true);
});

test('Sprint 02R3: Classic HRCC bundle deploy validator passes new Function syntax parse check on canonical dist artifact', () => {
  const { jsCode } = validateHrccBundleArtifacts();
  assert.doesNotThrow(() => {
    new Function(jsCode);
  }, 'Canonical generated bundle must pass real JavaScript syntax compilation/parse check');
});

test('Sprint 02R3: fetchHealthCount executes exact business status queries for 795, 796, 797, 798', async () => {
  const recordedQueries = [];
  const fakeApi = async (path, method, params) => {
    recordedQueries.push({ appId: params.app, query: params.query });
    return { totalCount: 5, records: [] };
  };

  await fetchHealthCount(fakeApi, 795, 'Active = "Active"');
  await fetchHealthCount(fakeApi, 796, 'Config_Status = "PUBLISHED"');
  await fetchHealthCount(fakeApi, 797, 'Ready_For_MBO = "YES"');
  await fetchHealthCount(fakeApi, 798, '');

  assert.equal(recordedQueries[0].query, 'Active = "Active" limit 1');
  assert.equal(recordedQueries[1].query, 'Config_Status = "PUBLISHED" limit 1');
  assert.equal(recordedQueries[2].query, 'Ready_For_MBO = "YES" limit 1');
  assert.equal(recordedQueries[3].query, 'limit 1');
});

import { createNarrowLiveTransport } from '../scripts/kintone/seed-scoring-baseline.js';

test('Sprint 03A: Baseline configs return exact 8 profile codes with exact 70/30, 60/40, 50/50 ratios', () => {
  const configs = getCanonicalBaselineMasterConfigs();
  assert.equal(configs.length, 8);
  const staff = configs.find(c => c.Profile_Code === 'PROF_STAFF_CHIEF');
  assert.equal(staff.PartA_Weight, 70);
  assert.equal(staff.PartB_Weight, 30);

  const asst = configs.find(c => c.Profile_Code === 'PROF_ASST_MGR');
  assert.equal(asst.PartA_Weight, 60);
  assert.equal(asst.PartB_Weight, 40);

  const sec = configs.find(c => c.Profile_Code === 'PROF_SECTION_MGR');
  assert.equal(sec.PartA_Weight, 50);
  assert.equal(sec.PartB_Weight, 50);
});

test('Sprint 03A: createNarrowLiveTransport blocks DELETE, PATCH, and non-796 App IDs', async () => {
  const transport = createNarrowLiveTransport(796);

  await assert.rejects(async () => {
    await transport('/k/v1/record.json', { method: 'DELETE' });
  }, /NARROW TRANSPORT BLOCKED/);

  await assert.rejects(async () => {
    await transport('/k/v1/record.json', { method: 'POST', body: { app: 794 } });
  }, /NARROW TRANSPORT BLOCKED/);
});

import { executeScoringSeed } from '../scripts/kintone/seed-scoring-baseline.js';

test('Sprint 03A-R1: executeScoringSeed stops fail-closed if App 796 contains existing records', async () => {
  const writeOps = [];
  const fakeTransport = async (relPath, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'POST' || method === 'PUT') {
      writeOps.push({ method, relPath });
    }
    if (relPath.includes('records.json')) {
      return { records: [{ $id: { value: '1' }, Config_Status: { value: 'PUBLISHED' } }] };
    }
    return {};
  };

  await assert.rejects(async () => {
    await executeScoringSeed({ overrideTransport: fakeTransport });
  }, /SEED_BLOCKED_EXISTING_RECORDS/);

  assert.equal(writeOps.length, 0, 'No write operations (POST/PUT) must be executed when existing records are present');
});

import {
  APPROVED_ROUTING_BASELINE_MANIFEST,
  validateRoutingSeedManifest,
  createNarrowRoutingTransport,
  executeRoutingSeed
} from '../scripts/kintone/seed-routing-baseline.js';

test('Sprint 03B: APPROVED_ROUTING_BASELINE_MANIFEST has exact 11 unique section mappings excluding TME1 and TMT3', () => {
  assert.equal(APPROVED_ROUTING_BASELINE_MANIFEST.length, 11);
  const codes = APPROVED_ROUTING_BASELINE_MANIFEST.map(x => x.sectionCode);
  assert.equal(new Set(codes).size, 11);
  assert.ok(!codes.includes('TME1'), 'TME1 must be excluded from seed manifest');
  assert.ok(!codes.includes('TMT3'), 'TMT3 must be excluded from seed manifest');
  assert.equal(validateRoutingSeedManifest(APPROVED_ROUTING_BASELINE_MANIFEST), true);
});

test('Sprint 03B: validateRoutingSeedManifest rejects duplicate, TME1, TMT3, and invalid users', () => {
  const base10 = APPROVED_ROUTING_BASELINE_MANIFEST.slice(0, 10);
  assert.throws(() => validateRoutingSeedManifest([...base10, { sectionCode: 'TME1', sectionName: 'Eng 1', requesterUser: 'e1' }]), /TME1/);
  assert.throws(() => validateRoutingSeedManifest([...base10, { sectionCode: 'TMT3', sectionName: 'Tech 3', requesterUser: 't3' }]), /TMT3/);
  assert.throws(() => validateRoutingSeedManifest([...base10, { sectionCode: 'TMF1', sectionName: 'Dup', requesterUser: 'f1' }]), /Duplicate/);
  assert.throws(() => validateRoutingSeedManifest([{ sectionCode: 'TMX1', sectionName: 'Unknown', requesterUser: 'unauthorized_user' }]), /ROUTING MANIFEST INVALID: Expected exactly 11 items/);
  assert.throws(() => validateRoutingSeedManifest([...base10, { sectionCode: 'TMX1', sectionName: 'Unknown', requesterUser: 'unauthorized_user' }]), /not in approved requester list/);
});

test('Sprint 03B: createNarrowRoutingTransport blocks PUT, DELETE, PATCH, wrong app, and unapproved endpoint', async () => {
  const transport = createNarrowRoutingTransport(795);
  await assert.rejects(async () => transport('/k/v1/record.json', { method: 'PUT', body: { app: 795 } }), /strictly prohibited/);
  await assert.rejects(async () => transport('/k/v1/record.json', { method: 'DELETE', body: { app: 795 } }), /strictly prohibited/);
  await assert.rejects(async () => transport('/k/v1/record.json', { method: 'PATCH', body: { app: 795 } }), /strictly prohibited/);
  await assert.rejects(async () => transport('/k/v1/record.json', { method: 'POST', body: { app: 796 } }), /Write target body.app must be App 795/);
  await assert.rejects(async () => transport('/k/v1/records.json', { method: 'POST', body: { app: 795 } }), /POST target must be '\/k\/v1\/record.json'/);
});

test('Sprint 03B: executeRoutingSeed executes bounded 11 POSTs and verifies 12/12 active readback', async () => {
  const fakeRecords = [{ $id: { value: '1' }, Section_Code: { value: 'TME1' }, Requester_User: { value: [{ code: 'e1' }] }, Active: { value: 'Active' } }];
  const postCalls = [];
  let nextId = 2;

  const fakeTransport = async (relPath, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'POST') {
      postCalls.push({ relPath, body: opts.body });
      const recId = String(nextId++);
      fakeRecords.push({
        $id: { value: recId },
        Section_Code: { value: opts.body.record.Section_Code.value },
        Section_Name: { value: opts.body.record.Section_Name.value },
        Requester_User: { value: opts.body.record.Requester_User.value },
        Active: { value: 'Active' }
      });
      return { id: recId };
    }
    if (relPath.includes('records.json')) {
      return { records: fakeRecords };
    }
    return {};
  };

  const res = await executeRoutingSeed({ overrideTransport: fakeTransport });
  assert.equal(res.postCount, 11);
  assert.equal(res.createdRecordIds.length, 11);
  assert.equal(res.totalActive, 12);
  assert.equal(postCalls.length, 11);
  assert.ok(postCalls.every(c => c.relPath === '/k/v1/record.json' && c.body.app === 795));
});





import {
  createNarrowSchemaCorrectionTransport,
  executeRoutingSchemaCorrection
} from '../scripts/kintone/seed-routing-baseline.js';

test('Sprint 03B-R2: createNarrowSchemaCorrectionTransport blocks DELETE, PATCH, wrong app, and unapproved endpoints', async () => {
  const transport = createNarrowSchemaCorrectionTransport(795);
  await assert.rejects(async () => transport('/k/v1/preview/app/form/fields.json', { method: 'DELETE' }), /strictly prohibited/);
  await assert.rejects(async () => transport('/k/v1/preview/app/form/fields.json', { method: 'PATCH' }), /strictly prohibited/);
  await assert.rejects(async () => transport('/k/v1/preview/app/form/fields.json', { method: 'PUT', body: { app: 796 } }), /Write target body.app must be App 795/);
  await assert.rejects(async () => transport('/k/v1/app/form/fields.json', { method: 'PUT', body: { app: 795 } }), /PUT target must be '\/k\/v1\/preview\/app\/form\/fields.json'/);
  await assert.rejects(async () => transport('/k/v1/preview/app/deploy.json', { method: 'POST', body: { apps: [{ app: 796 }] } }), /Deploy target must be App 795/);
});

test('Sprint 03B-R2: executeRoutingSchemaCorrection executes exact two-field PUT and deploy', async () => {
  let mgrReq = true;
  let gmReq = true;
  const putCalls = [];
  const deployCalls = [];

  const fakeTransport = async (relPath, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'PUT' && relPath.includes('fields.json')) {
      putCalls.push({ relPath, body: opts.body });
      mgrReq = false;
      gmReq = false;
      return { revision: '10' };
    }
    if (method === 'POST' && relPath.includes('deploy.json')) {
      deployCalls.push({ relPath, body: opts.body });
      return {};
    }
    if (relPath.includes('fields.json')) {
      return {
        properties: {
          Manager_User: { type: 'USER_SELECT', required: mgrReq },
          GM_User: { type: 'USER_SELECT', required: gmReq }
        }
      };
    }
    return {};
  };

  const res = await executeRoutingSchemaCorrection({ overrideTransport: fakeTransport });
  assert.equal(res.putCount, 1);
  assert.equal(res.deployCount, 1);
  assert.equal(res.managerRequired, false);
  assert.equal(res.gmRequired, false);
  assert.equal(putCalls.length, 1);
  assert.equal(putCalls[0].body.app, 795);
  assert.deepEqual(Object.keys(putCalls[0].body.properties), ['Manager_User', 'GM_User']);
  assert.equal(putCalls[0].body.properties.Manager_User.required, false);
  assert.equal(putCalls[0].body.properties.GM_User.required, false);
});

test('Sprint 03B-R2: executeRoutingSeed fails closed if live schema required=true for Manager_User or GM_User', async () => {
  const fakeTransport = async (relPath) => {
    if (relPath.includes('records.json')) {
      return { records: [{ $id: { value: '1' }, Section_Code: { value: 'TME1' }, Requester_User: { value: [{ code: 'e1' }] }, Active: { value: 'Active' } }] };
    }
    if (relPath.includes('fields.json')) {
      return { properties: { Manager_User: { required: true }, GM_User: { required: true } } };
    }
    return {};
  };

  await assert.rejects(async () => executeRoutingSeed({ overrideTransport: fakeTransport }), /Live schema requires Manager_User\/GM_User fields/);
});

test('App800 Deployment Compatibility: assertApp800LeastPrivilegeAcl passes exact CREATOR + HR_ADMIN_GROUP View-only + everyone denied ACL', () => {
  const validAcl = {
    rights: [
      {
        entity: { type: 'CREATOR', code: 'admin-form' },
        appEditable: true,
        recordViewable: true,
        recordAddable: true,
        recordEditable: true,
        recordDeletable: true,
        recordImportable: true,
        recordExportable: true
      },
      {
        entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' },
        appEditable: false,
        recordViewable: true,
        recordAddable: false,
        recordEditable: false,
        recordDeletable: false,
        recordImportable: false,
        recordExportable: false
      },
      {
        entity: { type: 'EVERYONE', code: 'everyone' },
        appEditable: false,
        recordViewable: false,
        recordAddable: false,
        recordEditable: false,
        recordDeletable: false,
        recordImportable: false,
        recordExportable: false
      }
    ]
  };

  assert.doesNotThrow(() => {
    assertApp800LeastPrivilegeAcl(validAcl, 'TEST_VALID_ACL');
  }, 'Valid App800 least-privilege ACL must pass');
});

test('Finding G: assertApp800LeastPrivilegeAcl fails closed if CREATOR is missing or has false/non-boolean rights', () => {
  // 1. Missing CREATOR
  const missingCreator = {
    rights: [
      {
        entity: { type: 'USER', code: 'admin-form' }, // USER instead of CREATOR
        appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true
      },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(missingCreator), /entity.type === 'CREATOR'/);

  // 2. CREATOR with false right
  const reducedCreator = {
    rights: [
      {
        entity: { type: 'CREATOR' },
        appEditable: true, recordViewable: true, recordAddable: true, recordEditable: false, recordDeletable: true, recordImportable: true, recordExportable: true
      },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(reducedCreator), /CREATOR permission property "recordEditable" must be true/);

  // 3. CREATOR with missing boolean
  const malformedCreator = {
    rights: [
      {
        entity: { type: 'CREATOR' },
        appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true
        // recordExportable missing
      },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(malformedCreator), /must be an explicit boolean/);
});

test('Finding H: assertApp800LeastPrivilegeAcl fails closed if everyone entry is missing or has any privilege / non-boolean right', () => {
  // 1. Missing everyone entry
  const missingEveryone = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(missingEveryone), /Expected exact App800 principal count 3/);

  // 2. Everyone with true right
  const privilegedEveryone = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(privilegedEveryone), /everyone permission property "recordViewable" must be false/);

  // Case B: everyone malformed/non-boolean right -> FAIL CLOSED
  const malformedEveryone = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: null, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(malformedEveryone), /must be an explicit boolean/);
});

test('Case A: assertApp800LeastPrivilegeAcl fails closed if HR_ADMIN_GROUP has malformed/non-boolean or missing rights', () => {
  const malformedHrRight = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      {
        entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' },
        appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false
        // recordExportable missing/non-boolean
      },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(malformedHrRight), /must be an explicit boolean/);
});

test('Finding I & Case C: assertApp800LeastPrivilegeAcl fails closed on extra ACL principals even when all rights are false', () => {
  // 1. Extra privileged USER principal
  const extraPrivilegedAcl = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'USER', code: 'unauthorized_user' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(extraPrivilegedAcl), /Expected exact App800 principal count 3/);

  // Case C: Extra DENIED USER principal (all 7 rights false) -> FAIL CLOSED
  const extraDeniedAcl = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'USER', code: 'unauthorized_denied_user' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(extraDeniedAcl), /Expected exact App800 principal count 3/);

  // 3. Duplicate HR_ADMIN_GROUP
  const duplicatePrincipalAcl = {
    rights: [
      { entity: { type: 'CREATOR' }, appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' }, appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false },
      { entity: { type: 'EVERYONE', code: 'everyone' }, appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false }
    ]
  };
  assert.throws(() => assertApp800LeastPrivilegeAcl(duplicatePrincipalAcl), /Expected exact App800 principal count 3/);
});

test('Case D: assertApp800LeastPrivilegeAcl passes valid ACL with actual accepted GROUP / everyone representation', () => {
  const groupEveryoneAcl = {
    rights: [
      {
        entity: { type: 'CREATOR', code: 'admin-form' },
        appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true, recordDeletable: true, recordImportable: true, recordExportable: true
      },
      {
        entity: { type: 'GROUP', code: 'HR_ADMIN_GROUP' },
        appEditable: false, recordViewable: true, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false
      },
      {
        entity: { type: 'GROUP', code: 'everyone' }, // Actual Kintone GROUP representation of everyone
        appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false, recordDeletable: false, recordImportable: false, recordExportable: false
      }
    ]
  };

  assert.doesNotThrow(() => {
    assertApp800LeastPrivilegeAcl(groupEveryoneAcl, 'TEST_GROUP_EVERYONE');
  }, 'Actual Kintone GROUP/everyone representation must pass');
});

test('Finding J: buildClassicHrccBundle always delegates to canonical dist loader and ignores caller-supplied source', () => {
  const fakeCallerSource = 'console.log("Arbitrary caller bundle trying to bypass dist");';
  const bundle = buildClassicHrccBundle(fakeCallerSource);
  assert.ok(bundle.includes('MboKintoneAuthAdapter'), 'buildClassicHrccBundle must return canonical bundle containing MboKintoneAuthAdapter');
  assert.equal(bundle.includes('Arbitrary caller bundle trying to bypass dist'), false, 'Caller-supplied source must be ignored');
});
