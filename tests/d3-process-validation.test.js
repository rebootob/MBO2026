import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  ValidationEngine,
  D3_PROCESS_CAPABILITY_ID,
  D3_ACTIVE_ROUTE_SLOTS,
  D3_SLOT_FIELD_MAP
} from '../src/validation/validation-engine.js';
import { validateWorkflowPayload } from '../src/core/workflow-validator.js';
import { assertSandboxWriteTarget } from '../src/core/sandbox-write-guard.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { buildD3WorkflowPayload } from '../scripts/kintone/build-d3-workflow-payload.js';

// Helper to create a fully valid base D3 record with distinct approvers
function createValidD3Record(topology = 'M1_G1', status = '01 Draft Objective') {
  return {
    Routing_Topology: { value: topology },
    Status: { value: status },
    Requester_User: { value: [{ code: 'emp01' }] },
    Manager_Level1_Approvers: { value: [{ code: 'm1_user' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' },
    Manager_Level2_Approvers: { value: [{ code: 'm2_user' }] },
    Manager_Level2_Approval_Rule: { value: 'ALL' },
    GM_Level1_Approvers: { value: [{ code: 'g1_user' }] },
    GM_Level1_Approval_Rule: { value: 'ALL' },
    GM_Level2_Approvers: { value: [{ code: 'g2_user' }] },
    GM_Level2_Approval_Rule: { value: 'ALL' }
  };
}

// =============================================================================
// FULL ROUTE — M1_ONLY (Items 1..3)
// =============================================================================
test('1. valid M1 => action can proceed', () => {
  const rec = createValidD3Record('M1_ONLY', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

test('2. invalid M1 => fail', () => {
  const rec = createValidD3Record('M1_ONLY', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers'));
});

test('3. blank G1/G2/M2 does not block M1_ONLY', () => {
  const rec = createValidD3Record('M1_ONLY', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [];
  rec.Manager_Level2_Approval_Rule.value = '';
  rec.GM_Level1_Approvers.value = [];
  rec.GM_Level1_Approval_Rule.value = '';
  rec.GM_Level2_Approvers.value = [];
  rec.GM_Level2_Approval_Rule.value = '';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// FULL ROUTE — M1_G1 (Items 4..8)
// =============================================================================
test('4. valid M1 + G1 => proceed', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

test('5. missing M1 => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers'));
});

test('6. missing G1 while action is still at 01 => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.GM_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level1_Approvers'));
});

test('7. invalid G1 user identity while action at 01 => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.GM_Level1_Approvers.value = [{ code: '' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'GM_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('8. M2/G2 inactive fields not required', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [];
  rec.Manager_Level2_Approval_Rule.value = '';
  rec.GM_Level2_Approvers.value = [];
  rec.GM_Level2_Approval_Rule.value = '';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// FULL ROUTE — M1_M2_G1 (Items 9..13)
// =============================================================================
test('9. valid M2 + M1 + G1 => proceed', () => {
  const rec = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

test('10. missing M2 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level2_Approvers'));
});

test('11. missing M1 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers'));
});

test('12. missing G1 before reaching G1 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  rec.GM_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level1_Approvers'));
});

test('13. G2 inactive field not required', () => {
  const rec = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  rec.GM_Level2_Approvers.value = [];
  rec.GM_Level2_Approval_Rule.value = '';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// FULL ROUTE — M1_G1_G2 (Items 14..18)
// =============================================================================
test('14. valid M1 + G1 + G2 => proceed', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

test('15. missing G2 at initial submit => fail', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  rec.GM_Level2_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level2_Approvers'));
});

test('16. G2 ANY at initial submit => fail', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  rec.GM_Level2_Approval_Rule.value = 'ANY';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some((fe) => fe.field === 'GM_Level2_Approval_Rule' && fe.messageEN.includes('must be ALL'))
  );
});

test('17. malformed G2 user object at initial submit => fail', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  rec.GM_Level2_Approvers.value = [{}];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'GM_Level2_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('18. M2 inactive field not required', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [];
  rec.Manager_Level2_Approval_Rule.value = '';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// FULL ROUTE — M1_M2_G1_G2 (Items 19..24)
// =============================================================================
test('19. all four slots valid => proceed', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

test('20. missing M2 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level2_Approvers'));
});

test('21. missing M1 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers'));
});

test('22. missing G1 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.GM_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level1_Approvers'));
});

test('23. missing G2 => fail', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.GM_Level2_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level2_Approvers'));
});

test('24. malformed any active future slot => fail', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.GM_Level2_Approvers.value = [{ code: '   ' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'GM_Level2_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

// =============================================================================
// EXACT USER IDENTITY (Items 25..33)
// =============================================================================
test('25. exact user identity: [] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('empty')));
});

test('26. exact user identity: [{}] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{}];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('27. exact user identity: [{code:""}] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: '' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('28. exact user identity: [{code:"   "}] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: '   ' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('29. exact user identity: [{name:"User"}] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ name: 'User' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('30. exact user identity: [{code:null}] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: null }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('31. exact user identity: [{code:123}] => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: 123 }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('32. exact user identity: two users => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: 'u1' }, { code: 'u2' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('must have exactly 1 user')
    )
  );
});

test('33. exact user identity: exactly [{code:"u1"}] => pass', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: 'u1' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// RULE (Items 34..36)
// =============================================================================
test('34. active rule ANY => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approval_Rule.value = 'ANY';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approval_Rule' && fe.messageEN.includes('must be ALL')
    )
  );
});

test('35. active rule blank => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approval_Rule.value = '';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approval_Rule' && fe.messageEN.includes('must be ALL')
    )
  );
});

test('36. active rule ALL => pass', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approval_Rule.value = 'ALL';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// DISTINCTNESS (Items 37..40)
// =============================================================================
test('37. M2 and M1 same user => fail', () => {
  const rec = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [{ code: 'u1' }];
  rec.Manager_Level1_Approvers.value = [{ code: 'u1' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('Duplicate appraiser user')
    )
  );
});

test('38. M1 and G1 same user => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: 'u1' }];
  rec.GM_Level1_Approvers.value = [{ code: 'u1' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'GM_Level1_Approvers' && fe.messageEN.includes('Duplicate appraiser user')
    )
  );
});

test('39. G1 and G2 same user => fail', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  rec.GM_Level1_Approvers.value = [{ code: 'u1' }];
  rec.GM_Level2_Approvers.value = [{ code: 'u1' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'GM_Level2_Approvers' && fe.messageEN.includes('Duplicate appraiser user')
    )
  );
});

test('40. all active users distinct => pass', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.Manager_Level2_Approvers.value = [{ code: 'u1' }];
  rec.Manager_Level1_Approvers.value = [{ code: 'u2' }];
  rec.GM_Level1_Approvers.value = [{ code: 'u3' }];
  rec.GM_Level2_Approvers.value = [{ code: 'u4' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// FUTURE-SLOT FAIL-CLOSED (Items 41..43)
// =============================================================================
test('41. M1_G1_G2: initial Submit Objective to Manager fails when future G2 invalid', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  rec.GM_Level2_Approvers.value = [];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level2_Approvers'));
});

test('42. M1_M2_G1_G2: initial Submit Objective to First Manager fails when future G1 invalid', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  rec.GM_Level1_Approvers.value = [{ code: '' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(
    res.fieldErrors.some(
      (fe) => fe.field === 'GM_Level1_Approvers' && fe.messageEN.includes('valid Kintone user object')
    )
  );
});

test('43. same topology passes once all active slots corrected', () => {
  const rec = createValidD3Record('M1_M2_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// ACTION REGRESSION (Items 44..48)
// =============================================================================
test('44. M1_ONLY bypass tests remain PASS', () => {
  const recObj = createValidD3Record('M1_ONLY', '03 Manager Objective Review');
  const resObj = ValidationEngine.validateWorkflowAction(
    recObj,
    'Approve Objective (M1 Only)',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resObj.isValid, true);

  const recMid = createValidD3Record('M1_ONLY', '08 Manager Mid-Year Review');
  const resMid = ValidationEngine.validateWorkflowAction(
    recMid,
    'Approve Mid-Year Manager (M1 Only)',
    BUSINESS_STAGES.MID_YEAR_EVAL,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resMid.isValid, true);

  const recFin = createValidD3Record('M1_ONLY', '13 Manager Final Evaluation');
  const resFin = ValidationEngine.validateWorkflowAction(
    recFin,
    'Approve Final Manager (M1 Only)',
    BUSINESS_STAGES.FINAL_EVAL_SELF,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resFin.isValid, true);
});

test('45. G2 direct-vs-to-G2 safety remains PASS', () => {
  const rec = createValidD3Record('M1_G1_G2', '04 GM Objective Review');
  const resDirect = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resDirect.isValid, false);
  assert.ok(resDirect.fieldErrors.some((fe) => fe.field === 'Routing_Topology'));

  const resToG2 = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective to G2',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resToG2.isValid, true);
});

test('46. M2 entry safety remains PASS', () => {
  const recDirect = createValidD3Record('M1_G1', '01 Draft Objective');
  const resFirstOnDirect = ValidationEngine.validateWorkflowAction(
    recDirect,
    'Submit Objective to First Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resFirstOnDirect.isValid, false);
  assert.ok(resFirstOnDirect.fieldErrors.some((fe) => fe.field === 'Routing_Topology'));

  const recM2 = createValidD3Record('M1_M2_G1', '01 Draft Objective');
  const resDirectOnM2 = ValidationEngine.validateWorkflowAction(
    recM2,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resDirectOnM2.isValid, false);
  assert.ok(resDirectOnM2.fieldErrors.some((fe) => fe.field === 'Routing_Topology'));
});

test('47. Requester handoff checks remain PASS', () => {
  const rec = createValidD3Record('M1_G1', '04 GM Objective Review');
  rec.Requester_User.value = [];
  const resReturn = ValidationEngine.validateWorkflowAction(
    rec,
    'Return Objective',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(resReturn.isValid, false);
  assert.ok(resReturn.fieldErrors.some((fe) => fe.field === 'Requester_User'));
});

test('48. M1_G1 durable path remains PASS', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  const res01 = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res01.isValid, true);

  rec.Status.value = '03 Manager Objective Review';
  const res03 = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res03.isValid, true);

  rec.Status.value = '04 GM Objective Review';
  const res04 = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res04.isValid, true);
});

// =============================================================================
// CAPABILITY REGRESSION (Items 49..52)
// =============================================================================
test('49. no capability G2 still fail-closed', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT
  );
  assert.equal(res.isValid, false);
  assert.ok(res.errors.some((e) => e.includes('G2 UNSUPPORTED CONFIGURATION ERROR')));
});

test('50. wrong capability G2 still fail-closed', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: 'WRONG_CAPABILITY_ID' }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.errors.some((e) => e.includes('G2 UNSUPPORTED CONFIGURATION ERROR')));
});

test('51. exact capability enables D3 path only when full route valid', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
});

test('52. no fallback to deprecated fields', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [];
  rec.Manager_User = { value: [{ code: 'legacy_m1' }] };
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers'));
});

// =============================================================================
// PAYLOAD REGRESSION (Items 53..56)
// =============================================================================
test('53. D3 workflow payload tests remain unchanged PASS', () => {
  const res = buildD3WorkflowPayload({ app: 794, revision: 1 });
  assert.ok(res);
  assert.equal(res.capabilityId, D3_PROCESS_CAPABILITY_ID);
  assert.equal(res.payload.app, 794);
  assert.equal(res.payload.enable, true);
});

test('54. exact state count still 19', () => {
  const res = buildD3WorkflowPayload({ app: 794, revision: 1 });
  const stateKeys = Object.keys(res.payload.states);
  assert.equal(stateKeys.length, 19);
});

test('55. exact action count still 40', () => {
  const res = buildD3WorkflowPayload({ app: 794, revision: 1 });
  assert.equal(res.payload.actions.length, 40);
});

test('56. builder diff should be NONE', () => {
  const builderPath = path.resolve('scripts/kintone/build-d3-workflow-payload.js');
  assert.ok(fs.existsSync(builderPath));
  const content = fs.readFileSync(builderPath, 'utf8');
  assert.ok(content.includes('buildD3WorkflowPayload'));
});

// =============================================================================
// GENERIC REGRESSION (Items 57..58)
// =============================================================================
test('57. workflow-validator ANY compatibility remains PASS', () => {
  const fields = { Manager_Level1_Approvers: 'USER_SELECT' };
  const payloadWithAny = {
    app: 794,
    enable: true,
    states: {
      Draft: { name: 'Draft', index: '0', assignee: { type: 'ONE', entities: [] } },
      Review: {
        name: 'Review',
        index: '1',
        assignee: {
          type: 'ANY',
          entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_Level1_Approvers' } }]
        }
      }
    },
    actions: [{ name: 'Submit', from: 'Draft', to: 'Review', filterCond: '' }]
  };

  assert.throws(
    () => validateWorkflowPayload(payloadWithAny, fields),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('58. generic sandbox write guard remains unchanged', () => {
  assert.throws(() => assertSandboxWriteTarget(283), /PROTECTED PRODUCTION APP/);
  assert.throws(() => assertSandboxWriteTarget(794), /DISCOVERY PHASE WRITE BLOCKED/);
});
