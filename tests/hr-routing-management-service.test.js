import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  HrRoutingManagementService,
  HrRoutingManagementServiceError,
  TOPOLOGIES,
  TOPOLOGY_CONFIGS,
  buildCandidateRecordFromDraft,
  deriveNextVersionNumber,
  validateRoutingDraft
} from '../src/services/hr-routing-management-service.js';
import { D3_PROCESS_CAPABILITY_ID } from '../src/validation/validation-engine.js';

// Preserve and execute the accepted D3-IMP-06 matrix through a test-only
// explicit-authority adapter. The production facade itself has no defaults.
const legacySourceUrl = new URL('./hr-routing-management-service-d3imp06-matrix.source', import.meta.url);
const generatedUrl = new URL('./.generated-hr-routing-management-service-d3imp06-matrix.mjs', import.meta.url);
const legacySource = await fs.readFile(legacySourceUrl, 'utf8');
const transformedLegacySource = legacySource.replaceAll(
  '../src/services/hr-routing-management-service.js',
  './helpers/hr-routing-management-service-d3imp06-test-adapter.js'
);
await fs.writeFile(generatedUrl, transformedLegacySource, 'utf8');
try {
  await import(`${generatedUrl.href}?r1=${Date.now()}`);
} finally {
  await fs.unlink(generatedUrl).catch(() => {});
}

const HR = Object.freeze({ userCode: 'hr_r1_owner_delegate', groups: ['hr'] });
const ADMIN = Object.freeze({ userCode: 'admin_r1_diag', groups: ['admin-form'] });

function routeRecord({
  routingKey = 'KEY',
  versionNumber = 1,
  versionStatus = 'ACTIVE',
  revision = '1',
  effectiveFrom = '2026-01-01',
  effectiveTo = '',
  scorer = '1',
  m1 = 'm1_user'
} = {}) {
  return {
    $id: { value: String(versionNumber) },
    $revision: { value: String(revision) },
    Routing_Key: { value: routingKey },
    Version_Key: { value: `${routingKey}#v${versionNumber}` },
    Version_Number: { value: String(versionNumber) },
    Version_Status: { value: versionStatus },
    Route_Pattern: { value: 'PATTERN_1_M1' },
    Routing_Topology: { value: 'M1_ONLY' },
    Effective_From: { value: effectiveFrom },
    Effective_To: { value: effectiveTo },
    Remark: { value: 'R1 route' },
    Scorer_Priority_Slots: { value: scorer },
    Manager_Level1_Approvers: { value: [{ code: m1 }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' }
  };
}

function rawDraft(routingKey = 'KEY') {
  return {
    Routing_Key: routingKey,
    Route_Pattern: 'PATTERN_1_M1',
    Routing_Topology: 'M1_ONLY',
    Effective_From: '2026-07-01',
    Effective_To: '',
    Remark: 'R1 explicit draft',
    Scorer_Priority_Slots: { value: '1' },
    Manager_Level1_Approvers: { value: [{ code: 'm1_user' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' }
  };
}

function strictValidate(candidate = routeRecord(), overrides = {}) {
  return HrRoutingManagementService.validateRouteCandidate({
    principal: HR,
    routeCandidate: candidate,
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID,
    ...overrides
  });
}

function expectCode(code) {
  return error => error instanceof HrRoutingManagementServiceError && error.code === code;
}

// ---------------------------------------------------------------------------
// D3-IMP-06-R1 targeted corrective tests
// ---------------------------------------------------------------------------

test('R1-01 canonical M2 topology sequence is M2 -> M1 -> G1', () => {
  assert.deepEqual(TOPOLOGY_CONFIGS[TOPOLOGIES.M1_M2_G1].slots, ['M2', 'M1', 'G1']);
  assert.equal(TOPOLOGY_CONFIGS[TOPOLOGIES.M1_M2_G1].label, 'M2 + M1 + G1 (3 Appraisers)');
});

test('R1-02 canonical four-appraiser sequence is M2 -> M1 -> G1 -> G2', () => {
  assert.deepEqual(TOPOLOGY_CONFIGS[TOPOLOGIES.M1_M2_G1_G2].slots, ['M2', 'M1', 'G1', 'G2']);
  assert.equal(TOPOLOGY_CONFIGS[TOPOLOGIES.M1_M2_G1_G2].label, 'M2 + M1 + G1 + G2 (4 Appraisers)');
});

test('R1-03 missing K_expected fails closed', () => {
  assert.throws(
    () => HrRoutingManagementService.validateRouteCandidate({
      principal: HR,
      routeCandidate: routeRecord(),
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }),
    expectCode('ROUTING_K_EXPECTED_REQUIRED')
  );
});

test('R1-04 missing process capability fails closed', () => {
  assert.throws(
    () => HrRoutingManagementService.validateRouteCandidate({
      principal: HR,
      routeCandidate: routeRecord(),
      kExpected: 1
    }),
    expectCode('ROUTING_PROCESS_CAPABILITY_REQUIRED')
  );
});

test('R1-05 missing scorer plan fails closed with SCORER_PLAN_NOT_CONFIGURED', () => {
  const candidate = routeRecord();
  delete candidate.Scorer_Priority_Slots;
  assert.throws(
    () => strictValidate(candidate),
    expectCode('SCORER_PLAN_NOT_CONFIGURED')
  );
});

test('R1-06 draft builder has no implicit slot-1/M1 scorer default', () => {
  assert.throws(
    () => buildCandidateRecordFromDraft({
      routingKey: 'KEY',
      topology: TOPOLOGIES.M1_ONLY,
      slots: { M1: 'm1_user' },
      effectiveFrom: '2026-07-01',
      businessReason: 'No scorer supplied'
    }),
    expectCode('SCORER_PLAN_NOT_CONFIGURED')
  );
});

test('R1-07 validateRoutingDraft never invents system/hr principal', () => {
  const result = validateRoutingDraft({
    routingKey: 'KEY',
    topology: TOPOLOGIES.M1_ONLY,
    slots: { M1: 'm1_user' },
    scorerPrioritySlots: '1',
    effectiveFrom: '2026-07-01',
    businessReason: 'Explicit principal required'
  }, {
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.some(message => message.includes('ROUTING_PRINCIPAL_REQUIRED')));
});

test('R1-08 empty supplied history cannot imply v1 without exact completeness proof', () => {
  assert.throws(
    () => deriveNextVersionNumber([], 'KEY'),
    expectCode('ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED')
  );
});

test('R1-09 history completeness proof must bind the exact Routing_Key', () => {
  assert.throws(
    () => deriveNextVersionNumber([], 'KEY', { routingKey: 'OTHER', complete: true }),
    expectCode('ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED')
  );
});

test('R1-10 complete exact empty history permits deterministic first version 1', () => {
  assert.equal(
    deriveNextVersionNumber([], 'KEY', { routingKey: 'KEY', complete: true }),
    1
  );
});

test('R1-11 complete exact history derives max + 1', () => {
  const records = [
    routeRecord({ versionNumber: 1 }),
    routeRecord({ versionNumber: 3 }),
    routeRecord({ versionNumber: 2 })
  ];
  assert.equal(
    deriveNextVersionNumber(records, 'KEY', { routingKey: 'KEY', complete: true }),
    4
  );
});

test('R1-12 create draft requires explicit exact history completeness proof', () => {
  assert.throws(
    () => HrRoutingManagementService.createDraftRoutePlan({
      principal: HR,
      records: [],
      draftInput: rawDraft('KEY'),
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }),
    expectCode('ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED')
  );
});

test('R1-13 create draft succeeds locally when all explicit authorities are supplied', () => {
  const plan = HrRoutingManagementService.createDraftRoutePlan({
    principal: HR,
    records: [],
    draftInput: rawDraft('KEY'),
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID,
    historyCompleteness: { routingKey: 'KEY', complete: true }
  });
  assert.equal(plan.operation, 'CREATE_DRAFT');
  assert.equal(plan.proposed.Version_Number, 1);
  assert.equal(plan.noMutationExecuted, true);
});

test('R1-14 supersession rejects stale active revision', () => {
  const records = [
    routeRecord({ versionNumber: 1, versionStatus: 'ACTIVE', revision: '10', effectiveFrom: '2026-01-01' }),
    routeRecord({ versionNumber: 2, versionStatus: 'DRAFT', revision: '20', effectiveFrom: '2026-07-01' })
  ];
  assert.throws(
    () => HrRoutingManagementService.createSupersedeRoutePlan({
      principal: HR,
      records,
      activeVersionKey: 'KEY#v1',
      expectedActiveRevision: '9',
      newVersionKey: 'KEY#v2',
      expectedNewRevision: '20',
      effectiveToDate: '2026-06-30',
      businessReason: 'stale active',
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }),
    expectCode('ROUTING_REVISION_CONFLICT')
  );
});

test('R1-15 supersession rejects stale new-draft revision', () => {
  const records = [
    routeRecord({ versionNumber: 1, versionStatus: 'ACTIVE', revision: '10', effectiveFrom: '2026-01-01' }),
    routeRecord({ versionNumber: 2, versionStatus: 'DRAFT', revision: '20', effectiveFrom: '2026-07-01' })
  ];
  assert.throws(
    () => HrRoutingManagementService.createSupersedeRoutePlan({
      principal: HR,
      records,
      activeVersionKey: 'KEY#v1',
      expectedActiveRevision: '10',
      newVersionKey: 'KEY#v2',
      expectedNewRevision: '19',
      effectiveToDate: '2026-06-30',
      businessReason: 'stale draft',
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }),
    expectCode('ROUTING_REVISION_CONFLICT')
  );
});

test('R1-16 supersession rejects cross-Routing_Key activation', () => {
  const records = [
    routeRecord({ routingKey: 'KEY_A', versionNumber: 1, versionStatus: 'ACTIVE', revision: '10', effectiveFrom: '2026-01-01' }),
    routeRecord({ routingKey: 'KEY_B', versionNumber: 2, versionStatus: 'DRAFT', revision: '20', effectiveFrom: '2026-07-01' })
  ];
  assert.throws(
    () => HrRoutingManagementService.createSupersedeRoutePlan({
      principal: HR,
      records,
      activeVersionKey: 'KEY_A#v1',
      expectedActiveRevision: '10',
      newVersionKey: 'KEY_B#v2',
      expectedNewRevision: '20',
      effectiveToDate: '2026-06-30',
      businessReason: 'cross-key forbidden',
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }),
    expectCode('ROUTING_SUPERSESSION_ROUTING_KEY_MISMATCH')
  );
});

test('R1-17 supersession succeeds only with matching exact revisions and Routing_Key', () => {
  const records = [
    routeRecord({ versionNumber: 1, versionStatus: 'ACTIVE', revision: '10', effectiveFrom: '2026-01-01' }),
    routeRecord({ versionNumber: 2, versionStatus: 'DRAFT', revision: '20', effectiveFrom: '2026-07-01' })
  ];
  const plan = HrRoutingManagementService.createSupersedeRoutePlan({
    principal: HR,
    records,
    activeVersionKey: 'KEY#v1',
    expectedActiveRevision: '10',
    newVersionKey: 'KEY#v2',
    expectedNewRevision: '20',
    effectiveToDate: '2026-06-30',
    businessReason: 'valid guarded supersession',
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID
  });
  assert.equal(plan.operation, 'SUPERSEDE_VERSION');
  assert.equal(plan.mutationsPlanned.length, 2);
  assert.equal(plan.noMutationExecuted, true);
});

test('R1-18 admin-form retains preview/validate but no HR mutation authority', () => {
  const candidate = routeRecord();
  const validation = HrRoutingManagementService.validateRouteCandidate({
    principal: ADMIN,
    routeCandidate: candidate,
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID
  });
  assert.equal(validation.isValid, true);
  assert.throws(
    () => HrRoutingManagementService.createDraftRoutePlan({
      principal: ADMIN,
      records: [],
      draftInput: rawDraft('KEY'),
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID,
      historyCompleteness: { routingKey: 'KEY', complete: true }
    }),
    expectCode('ROUTING_HR_AUTHORIZATION_REQUIRED')
  );
});

test('R1-19 internal D3-IMP-06 base is imported only by the strict public facade', async () => {
  const srcRoot = fileURLToPath(new URL('../src/', import.meta.url));
  const marker = 'hr-routing-management-service-d3imp06-base.js';
  const importers = [];

  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.includes('d3imp06-base')) {
        const text = await fs.readFile(full, 'utf8');
        if (text.includes(marker)) importers.push(path.relative(srcRoot, full).replaceAll('\\', '/'));
      }
    }
  }

  await walk(srcRoot);
  assert.deepEqual(importers, ['services/hr-routing-management-service.js']);
});
