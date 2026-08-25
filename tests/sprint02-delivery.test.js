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
import { buildClassicHrccBundle } from '../scripts/kintone/deploy-delivery-sprint02.js';
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



test('Sprint 02R2: Classic HRCC bundle generator creates valid browser JS without import/export keywords', () => {
  const source = fs.readFileSync('src/ui/hr-control-center.js', 'utf8');
  const bundle = buildClassicHrccBundle(source, DEFAULT_APP_IDS);
  assert.equal(/\bimport\b/.test(bundle), false, 'Bundle must not contain import keyword');
  assert.equal(/\bexport\b/.test(bundle), false, 'Bundle must not contain export keyword');
  assert.equal(bundle.includes('DEFAULT_APP_IDS = Object.freeze({"mboV2AppId":794'), true);
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

test('Sprint 02R3: Classic HRCC bundle generator creates exactly 1 DEFAULT_APP_IDS declaration and passes new Function syntax parse', () => {
  const source = fs.readFileSync('src/ui/hr-control-center.js', 'utf8');
  const bundle = buildClassicHrccBundle(source, DEFAULT_APP_IDS);
  const matches = bundle.match(/const DEFAULT_APP_IDS/g);
  assert.equal(matches !== null && matches.length === 1, true, 'Bundle must contain exactly 1 DEFAULT_APP_IDS declaration');
  assert.doesNotThrow(() => {
    new Function(bundle);
  }, 'Bundle must pass real JavaScript syntax compilation/parse check');
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
