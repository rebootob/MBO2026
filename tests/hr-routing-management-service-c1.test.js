import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HrRoutingManagementService,
  HrRoutingManagementServiceError,
  TOPOLOGIES,
  validateRoutingDraft,
  previewRoutingPlan
} from '../src/services/hr-routing-management-service.js';
import { D3_PROCESS_CAPABILITY_ID } from '../src/validation/validation-engine.js';

const HR = Object.freeze({ userCode: 'hr_c1', groups: ['hr'] });

function draft(routingKey = 'KEY') {
  return {
    routingKey,
    topology: TOPOLOGIES.M1_ONLY,
    slots: { M1: 'm1_user' },
    scorerPrioritySlots: '1',
    effectiveFrom: '2026-07-01',
    effectiveTo: '',
    businessReason: 'C1 preview'
  };
}

function routeRecord({
  routingKey = 'KEY',
  versionNumber = 1,
  versionStatus = 'DRAFT',
  revision = '1'
} = {}) {
  return {
    $revision: { value: String(revision) },
    Routing_Key: { value: routingKey },
    Version_Key: { value: `${routingKey}#v${versionNumber}` },
    Version_Number: { value: String(versionNumber) },
    Version_Status: { value: versionStatus },
    Route_Pattern: { value: 'PATTERN_1_M1' },
    Routing_Topology: { value: 'M1_ONLY' },
    Effective_From: { value: '2026-07-01' },
    Effective_To: { value: '' },
    Remark: { value: 'Existing C1 route' },
    Scorer_Priority_Slots: { value: '1' },
    Manager_Level1_Approvers: { value: [{ code: 'm1_user' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' }
  };
}

function strictOptions(overrides = {}) {
  return {
    existingVersions: [],
    principal: HR,
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID,
    ...overrides
  };
}

function hasCode(result, code) {
  return result.errors.some(message => message.includes(code));
}

test('C1-SVC-01 NEW preview/validate fails closed without history completeness or exact existing context', () => {
  const result = validateRoutingDraft(draft(), strictOptions());
  assert.equal(result.isValid, false);
  assert.equal(result.candidate, null);
  assert.ok(hasCode(result, 'ROUTING_VERSION_CONTEXT_REQUIRED'));
});

test('C1-SVC-02 NEW preview/validate rejects history proof bound to another Routing_Key', () => {
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      historyCompleteness: { routingKey: 'OTHER', complete: true }
    })
  );
  assert.equal(result.isValid, false);
  assert.ok(hasCode(result, 'ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED'));
});

test('C1-SVC-03 exact complete empty history deterministically produces canonical v1 preview identity', () => {
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      historyCompleteness: { routingKey: 'KEY', complete: true }
    })
  );
  assert.equal(result.isValid, true);
  assert.equal(result.candidate.Version_Key.value, 'KEY#v1');
  assert.equal(result.candidate.Version_Number.value, '1');
  assert.equal(result.candidate.Version_Status.value, 'DRAFT');
  assert.deepEqual(result.versionContext, {
    kind: 'NEW',
    routingKey: 'KEY',
    versionKey: 'KEY#v1',
    versionNumber: 1
  });
});

test('C1-SVC-04 exact complete non-empty history derives max+1 instead of assuming v1', () => {
  const records = [
    routeRecord({ versionNumber: 1 }),
    routeRecord({ versionNumber: 4 }),
    routeRecord({ versionNumber: 2 })
  ];
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      existingVersions: records,
      historyCompleteness: { routingKey: 'KEY', complete: true }
    })
  );
  assert.equal(result.isValid, true);
  assert.equal(result.candidate.Version_Key.value, 'KEY#v5');
  assert.equal(result.candidate.Version_Number.value, '5');
});

test('C1-SVC-05 EXISTING preview preserves exact supplied Version_Key identity without history derivation', () => {
  const records = [routeRecord({ versionNumber: 7, revision: '12' })];
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      existingVersions: records,
      versionContext: { routingKey: 'KEY', versionKey: 'KEY#v7' }
    })
  );
  assert.equal(result.isValid, true);
  assert.equal(result.candidate.Version_Key.value, 'KEY#v7');
  assert.equal(result.candidate.Version_Number.value, '7');
  assert.equal(result.candidate.$revision.value, '12');
  assert.deepEqual(result.versionContext, {
    kind: 'EXISTING',
    routingKey: 'KEY',
    versionKey: 'KEY#v7'
  });
});

test('C1-SVC-06 unknown exact existing Version_Key fails closed', () => {
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      existingVersions: [routeRecord({ versionNumber: 1 })],
      versionContext: { routingKey: 'KEY', versionKey: 'KEY#v999' }
    })
  );
  assert.equal(result.isValid, false);
  assert.ok(hasCode(result, 'ROUTING_VERSION_CONTEXT_NOT_FOUND'));
});

test('C1-SVC-07 existing Version_Key from another Routing_Key fails closed', () => {
  const records = [routeRecord({ routingKey: 'OTHER', versionNumber: 2 })];
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      existingVersions: records,
      versionContext: { routingKey: 'KEY', versionKey: 'OTHER#v2' }
    })
  );
  assert.equal(result.isValid, false);
  assert.ok(hasCode(result, 'ROUTING_VERSION_CONTEXT_ROUTING_KEY_MISMATCH'));
});

test('C1-SVC-08 supplying NEW history proof and EXISTING version context together fails closed as ambiguous', () => {
  const records = [routeRecord({ versionNumber: 1 })];
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      existingVersions: records,
      historyCompleteness: { routingKey: 'KEY', complete: true },
      versionContext: { routingKey: 'KEY', versionKey: 'KEY#v1' }
    })
  );
  assert.equal(result.isValid, false);
  assert.ok(hasCode(result, 'ROUTING_VERSION_CONTEXT_AMBIGUOUS'));
});

test('C1-SVC-09 preview exposes the exact deterministic version context used for validation', () => {
  const preview = previewRoutingPlan({
    principal: HR,
    draft: draft('KEY'),
    existingVersions: [],
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID,
    historyCompleteness: { routingKey: 'KEY', complete: true }
  });
  assert.equal(preview.isValid, true);
  assert.equal(preview.planPayload.Version_Key.value, 'KEY#v1');
  assert.equal(preview.versionContext.versionKey, 'KEY#v1');
});

test('C1-SVC-10 class facade propagates C1 context contract instead of bypassing free-function guard', () => {
  const result = HrRoutingManagementService.validateRoutingDraft({
    principal: HR,
    draft: draft('KEY'),
    records: [],
    kExpected: 1,
    processCapabilityId: D3_PROCESS_CAPABILITY_ID
  });
  assert.equal(result.isValid, false);
  assert.ok(hasCode(result, 'ROUTING_VERSION_CONTEXT_REQUIRED'));
});

test('C1-SVC-11 version-context errors remain typed when raised by strict public helpers', () => {
  const result = validateRoutingDraft(
    draft('KEY'),
    strictOptions({
      versionContext: {}
    })
  );
  assert.equal(result.isValid, false);
  assert.ok(result.errors.some(message => message.startsWith('ROUTING_VERSION_CONTEXT_REQUIRED:')));

  assert.equal(
    new HrRoutingManagementServiceError('X', 'Y') instanceof HrRoutingManagementServiceError,
    true
  );
});
