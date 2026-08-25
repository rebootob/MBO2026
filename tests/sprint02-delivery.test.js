import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSandboxAppIds,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  DISCOVERY_MODE
} from '../src/core/sandbox-write-guard.js';
import { hoshinFields, revisionArchiveFields } from '../config/schema-spec.js';
import {
  renderHrControlCenterHtml,
  buildHrccMonitoringQuery,
  ALLOWED_MONITORING_FIELDS_794,
  CONFIDENTIAL_FIELDS_PROHIBITED
} from '../src/ui/hr-control-center.js';
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
