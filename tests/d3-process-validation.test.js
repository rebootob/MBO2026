import test from 'node:test';
import assert from 'node:assert/strict';

import { ValidationEngine, D3_PROCESS_CAPABILITY_ID } from '../src/validation/validation-engine.js';
import { validateWorkflowPayload } from '../src/core/workflow-validator.js';
import { assertSandboxWriteTarget } from '../src/core/sandbox-write-guard.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';

// Helper to create a fully valid base D3 record for testing
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
// VALIDATION CAPABILITY (Items 41..45)
// =============================================================================
test('41. no capability => current G2 fail-closed preserved', () => {
  const rec = createValidD3Record('M1_G1_G2', '01 Draft Objective');
  const res = ValidationEngine.validateWorkflowAction(rec, 'Submit Objective to Manager', BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.errors.some((e) => e.includes('G2 UNSUPPORTED CONFIGURATION ERROR')));
});

test('42. wrong capability => G2 fail-closed', () => {
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

test('43. exact D3 capability => G2 validation may proceed', () => {
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

test('44. D3 validation uses new sequential snapshot fields only', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  // Clear sequential snapshot field
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

test('45. D3 validation does not fallback to deprecated route fields', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = []; // empty sequential field
  rec.Manager_User = { value: [{ code: 'legacy_m1' }] }; // populate legacy field

  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  // Must fail on Manager_Level1_Approvers, NOT accept Manager_User
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers'));
});

// =============================================================================
// EXACT ONE / ALL RULES (Items 46..50)
// =============================================================================
test('46. active D3 slot with zero users => fail', () => {
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

test('47. active D3 slot with >1 users => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: 'u1' }, { code: 'u2' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approvers' && fe.messageEN.includes('must have exactly 1 user')));
});

test('48. active D3 slot with exactly one user => pass', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approvers.value = [{ code: 'u1' }];
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
});

test('49. active D3 rule ANY => fail', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approval_Rule.value = 'ANY';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Manager_Level1_Approval_Rule' && fe.messageEN.includes('must be ALL')));
});

test('50. active D3 rule ALL => pass', () => {
  const rec = createValidD3Record('M1_G1', '01 Draft Objective');
  rec.Manager_Level1_Approval_Rule.value = 'ALL';
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
});

// =============================================================================
// G2 ACTION SAFETY (Items 51..55)
// =============================================================================
test('51. G1 direct approval rejected for G2 topology', () => {
  const rec = createValidD3Record('M1_G1_G2', '04 GM Objective Review');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Routing_Topology' && fe.messageEN.includes('Approve to G2 must be used')));
});

test('52. G1->G2 accepted for G2 topology', () => {
  const rec = createValidD3Record('M1_G1_G2', '04 GM Objective Review');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective to G2',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
});

test('53. G1->G2 rejected for non-G2 topology', () => {
  const rec = createValidD3Record('M1_G1', '04 GM Objective Review');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective to G2',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Routing_Topology' && fe.messageEN.includes('allowed only for G2 topologies')));
});

test('54. G2 action requires exact G2 user', () => {
  const rec = createValidD3Record('M1_G1_G2', '04B GM Level 2 Objective Review');
  rec.GM_Level2_Approvers.value = []; // missing G2 user
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective G2',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'GM_Level2_Approvers'));
});

test('55. G2 state on non-G2 topology => fail', () => {
  const rec = createValidD3Record('M1_G1', '04B GM Level 2 Objective Review');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective G2',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Status' && fe.messageEN.includes('valid only for topologies containing GM Level 2')));
});

// =============================================================================
// M1_ONLY ACTION SAFETY (Items 56..60)
// =============================================================================
test('56. exact bypass accepted with capability', () => {
  const rec = createValidD3Record('M1_ONLY', '03 Manager Objective Review');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective (M1 Only)',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
});

test('57. bypass rejected for non-M1_ONLY topology', () => {
  const rec = createValidD3Record('M1_G1', '03 Manager Objective Review');
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective (M1 Only)',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Routing_Topology' && fe.messageEN.includes('allowed only for M1_ONLY topology')));
});

test('58. Objective bypass requires Requester_User', () => {
  const rec = createValidD3Record('M1_ONLY', '03 Manager Objective Review');
  rec.Requester_User.value = []; // missing requester
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Objective (M1 Only)',
    BUSINESS_STAGES.OBJECTIVE_INPUT,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Requester_User'));
});

test('59. Mid-Year bypass requires Requester_User', () => {
  const rec = createValidD3Record('M1_ONLY', '08 Manager Mid-Year Review');
  rec.Requester_User.value = []; // missing requester
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Mid-Year Manager (M1 Only)',
    BUSINESS_STAGES.MID_YEAR_EVAL,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some((fe) => fe.field === 'Requester_User'));
});

test('60. Final bypass does not invent GM requirement', () => {
  const rec = createValidD3Record('M1_ONLY', '13 Manager Final Evaluation');
  // GM slots are not configured or empty
  rec.GM_Level1_Approvers.value = [];
  rec.GM_Level2_Approvers.value = [];
  // Destination is 15 HR Final Check, no Requester or GM required
  rec.Requester_User.value = [];

  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Approve Final Manager (M1 Only)',
    BUSINESS_STAGES.FINAL_EVAL_SELF,
    { processCapabilityId: D3_PROCESS_CAPABILITY_ID }
  );
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

// =============================================================================
// LEGACY / GENERIC REGRESSION (Items 61..63)
// =============================================================================
test('61. current no-capability M1_G1 behavior unchanged', () => {
  const rec = {
    Routing_Topology: { value: 'M1_G1' },
    Status: { value: '01 Draft Objective' },
    Requester_User: { value: [{ code: 'emp' }] },
    Manager_User: { value: [{ code: 'mgr' }] },
    GM_User: { value: [{ code: 'gm' }] }
  };
  const res = ValidationEngine.validateWorkflowAction(
    rec,
    'Submit Objective to Manager',
    BUSINESS_STAGES.OBJECTIVE_INPUT
  );
  assert.equal(res.isValid, true);
});

test('62. generic workflow validator still recognizes ANY', () => {
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
          type: 'ANY', // generic validator must still accept ANY
          entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_Level1_Approvers' } }]
        }
      }
    },
    actions: [{ name: 'Submit', from: 'Draft', to: 'Review', filterCond: '' }]
  };

  // Generic validator throws Discovery Phase write blocked for app 794, proving it reached sandbox guard
  // and did NOT throw "Invalid state" or reject "ANY"
  assert.throws(
    () => validateWorkflowPayload(payloadWithAny, fields),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('63. generic sandbox write guard remains unchanged', () => {
  assert.throws(() => assertSandboxWriteTarget(283), /PROTECTED PRODUCTION APP/);
  assert.throws(() => assertSandboxWriteTarget(794), /DISCOVERY PHASE WRITE BLOCKED/);
});
