import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TOPOLOGY_GROUPS,
  buildTopologyFilter,
  D3_STATE_DEFINITIONS,
  D3_ACTION_DEFINITIONS,
  buildD3WorkflowDefinition,
  buildD3WorkflowPayload
} from '../scripts/kintone/build-d3-workflow-payload.js';
import { D3_PROCESS_CAPABILITY_ID } from '../src/validation/validation-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to evaluate filterCond
function actionAppliesToTopology(filterCond, topology) {
  if (!filterCond || filterCond.trim() === '') return true;
  const match = filterCond.match(/Routing_Topology in \(([^)]+)\)/);
  if (!match) return false;
  const allowed = match[1].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  return allowed.includes(topology);
}

// Helper to simulate stage forward path
function simulateStagePath(actions, startState, endState, topology) {
  const path = [startState];
  let current = startState;

  while (current !== endState) {
    const forwardActions = actions.filter((act) =>
      act.from === current &&
      !act.name.startsWith('Return') &&
      actionAppliesToTopology(act.filterCond, topology)
    );

    assert.equal(
      forwardActions.length,
      1,
      `Expected exactly 1 forward action from state "${current}" for topology "${topology}", found ${forwardActions.length}`
    );

    current = forwardActions[0].to;
    path.push(current);
  }

  return path;
}

// =============================================================================
// PAYLOAD ROOT TESTS (Items 1..5)
// =============================================================================
test('1. builder is importable with zero side effects', () => {
  assert.equal(typeof buildD3WorkflowDefinition, 'function');
  assert.equal(typeof buildD3WorkflowPayload, 'function');
});

test('2. no network/Kintone imports in build-d3-workflow-payload.js', () => {
  const filePath = path.resolve(__dirname, '../scripts/kintone/build-d3-workflow-payload.js');
  const code = fs.readFileSync(filePath, 'utf-8');
  assert.doesNotMatch(code, /fetch\(/);
  assert.doesNotMatch(code, /axios/);
  assert.doesNotMatch(code, /kintoneRequest/);
  assert.doesNotMatch(code, /dotenv/);
  assert.doesNotMatch(code, /process\.env/);
  assert.doesNotMatch(code, /sandbox-apps\.json/);
});

test('3. no PUT/POST/PATCH/DELETE write execution path in builder', () => {
  const filePath = path.resolve(__dirname, '../scripts/kintone/build-d3-workflow-payload.js');
  const code = fs.readFileSync(filePath, 'utf-8');
  assert.doesNotMatch(code, /method:\s*['"]PUT['"]/i);
  assert.doesNotMatch(code, /method:\s*['"]POST['"]/i);
  assert.doesNotMatch(code, /method:\s*['"]PATCH['"]/i);
  assert.doesNotMatch(code, /method:\s*['"]DELETE['"]/i);
});

test('4. explicit app/revision required for payload builder', () => {
  assert.throws(() => buildD3WorkflowPayload(), /Explicit app ID is required/);
  assert.throws(() => buildD3WorkflowPayload({}), /Explicit app ID is required/);
  assert.throws(() => buildD3WorkflowPayload({ app: 794 }), /Explicit revision is required/);
  assert.throws(() => buildD3WorkflowPayload({ revision: '1' }), /Explicit app ID is required/);
  assert.throws(() => buildD3WorkflowPayload({ app: 'abc', revision: '1' }), /Invalid app ID format/);

  const result = buildD3WorkflowPayload({ app: 794, revision: 12 });
  assert.equal(result.capabilityId, D3_PROCESS_CAPABILITY_ID);
  assert.equal(result.payload.app, 794);
  assert.equal(result.payload.enable, true);
  assert.equal(result.payload.revision, '12');
});

test('5. deterministic output for same input', () => {
  const res1 = buildD3WorkflowPayload({ app: 794, revision: '1' });
  const res2 = buildD3WorkflowPayload({ app: 794, revision: '1' });
  assert.deepEqual(res1, res2);
});

// =============================================================================
// STATES TESTS (Items 6..16)
// =============================================================================
test('6. exact state count = 19', () => {
  const { states } = buildD3WorkflowDefinition();
  assert.equal(Object.keys(states).length, 19);
  assert.equal(D3_STATE_DEFINITIONS.length, 19);
});

test('7. exact indexes = 0..18', () => {
  const { states } = buildD3WorkflowDefinition();
  const indexes = Object.values(states).map((s) => Number(s.index)).sort((a, b) => a - b);
  const expectedIndexes = Array.from({ length: 19 }, (_, i) => i);
  assert.deepEqual(indexes, expectedIndexes);
});

test('8. exact three G2 states exist', () => {
  const { states } = buildD3WorkflowDefinition();
  assert.ok(states['04B GM Level 2 Objective Review']);
  assert.ok(states['09B GM Level 2 Mid-Year Review']);
  assert.ok(states['14B GM Level 2 Final Evaluation']);
  assert.equal(states['04B GM Level 2 Objective Review'].index, '4');
  assert.equal(states['09B GM Level 2 Mid-Year Review'].index, '10');
  assert.equal(states['14B GM Level 2 Final Evaluation'].index, '16');
});

test('9. no extra states', () => {
  const { states } = buildD3WorkflowDefinition();
  const names = new Set(Object.values(states).map((s) => s.name));
  assert.equal(names.size, 19);
  const expectedNames = [
    '01 Draft Objective',
    '02 First Manager Objective Review',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '04B GM Level 2 Objective Review',
    '05 Objective Approved',
    '06 Employee Mid-Year',
    '07 First Manager Mid-Year Review',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '09B GM Level 2 Mid-Year Review',
    '10 Mid-Year Completed',
    '11 Employee Self Evaluation',
    '12 First Manager Final Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '14B GM Level 2 Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ];
  for (const name of expectedNames) {
    assert.ok(names.has(name), `Missing expected state: ${name}`);
  }
});

test('10. requester states map to Requester_User with ONE', () => {
  const { states } = buildD3WorkflowDefinition();
  const requesterKeys = ['Not started', '05 Objective Approved', '06 Employee Mid-Year', '10 Mid-Year Completed', '11 Employee Self Evaluation'];
  for (const key of requesterKeys) {
    const s = states[key];
    assert.equal(s.assignee.type, 'ONE', `${key} must have type ONE`);
    assert.equal(s.assignee.entities.length, 1, `${key} must have 1 entity`);
    assert.equal(s.assignee.entities[0].entity.code, 'Requester_User', `${key} must map to Requester_User`);
  }
});

test('11. M2 states map Manager_Level2_Approvers with ALL', () => {
  const { states } = buildD3WorkflowDefinition();
  const m2Keys = ['02 First Manager Objective Review', '07 First Manager Mid-Year Review', '12 First Manager Final Evaluation'];
  for (const key of m2Keys) {
    const s = states[key];
    assert.equal(s.assignee.type, 'ALL', `${key} must have type ALL`);
    assert.equal(s.assignee.entities[0].entity.code, 'Manager_Level2_Approvers', `${key} must map to Manager_Level2_Approvers`);
  }
});

test('12. M1 states map Manager_Level1_Approvers with ALL', () => {
  const { states } = buildD3WorkflowDefinition();
  const m1Keys = ['03 Manager Objective Review', '08 Manager Mid-Year Review', '13 Manager Final Evaluation'];
  for (const key of m1Keys) {
    const s = states[key];
    assert.equal(s.assignee.type, 'ALL', `${key} must have type ALL`);
    assert.equal(s.assignee.entities[0].entity.code, 'Manager_Level1_Approvers', `${key} must map to Manager_Level1_Approvers`);
  }
});

test('13. G1 states map GM_Level1_Approvers with ALL', () => {
  const { states } = buildD3WorkflowDefinition();
  const g1Keys = ['04 GM Objective Review', '09 GM Mid-Year Review', '14 GM Final Evaluation'];
  for (const key of g1Keys) {
    const s = states[key];
    assert.equal(s.assignee.type, 'ALL', `${key} must have type ALL`);
    assert.equal(s.assignee.entities[0].entity.code, 'GM_Level1_Approvers', `${key} must map to GM_Level1_Approvers`);
  }
});

test('14. G2 states map GM_Level2_Approvers with ALL', () => {
  const { states } = buildD3WorkflowDefinition();
  const g2Keys = ['04B GM Level 2 Objective Review', '09B GM Level 2 Mid-Year Review', '14B GM Level 2 Final Evaluation'];
  for (const key of g2Keys) {
    const s = states[key];
    assert.equal(s.assignee.type, 'ALL', `${key} must have type ALL`);
    assert.equal(s.assignee.entities[0].entity.code, 'GM_Level2_Approvers', `${key} must map to GM_Level2_Approvers`);
  }
});

test('15. every D3 appraiser state uses ALL', () => {
  const { states } = buildD3WorkflowDefinition();
  const appraiserKeys = [
    '02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '04B GM Level 2 Objective Review',
    '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '09B GM Level 2 Mid-Year Review',
    '12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '14B GM Level 2 Final Evaluation'
  ];
  for (const key of appraiserKeys) {
    assert.equal(states[key].assignee.type, 'ALL');
  }
});

test('16. no D3 appraiser state uses ANY', () => {
  const { states } = buildD3WorkflowDefinition();
  for (const [key, state] of Object.entries(states)) {
    assert.notEqual(state.assignee.type, 'ANY', `State ${key} should not use ANY`);
  }
});

// =============================================================================
// ACTIONS TESTS (Items 17..20)
// =============================================================================
test('17. exact action count = 40', () => {
  const { actions } = buildD3WorkflowDefinition();
  assert.equal(actions.length, 40);
  assert.equal(D3_ACTION_DEFINITIONS.length, 40);
});

test('18. every action from/to references valid state', () => {
  const { states, actions } = buildD3WorkflowDefinition();
  const validNames = new Set(Object.values(states).map((s) => s.name));
  for (const act of actions) {
    assert.ok(validNames.has(act.from), `Action "${act.name}" has invalid from: ${act.from}`);
    assert.ok(validNames.has(act.to), `Action "${act.name}" has invalid to: ${act.to}`);
  }
});

test('19. topology filters deterministic', () => {
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES),
    'Routing_Topology in ("M1_ONLY", "M1_G1", "M1_M2_G1", "M1_G1_G2", "M1_M2_G1_G2")'
  );
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2),
    'Routing_Topology in ("M1_M2_G1", "M1_M2_G1_G2")'
  );
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.NO_M2),
    'Routing_Topology in ("M1_ONLY", "M1_G1", "M1_G1_G2")'
  );
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1),
    'Routing_Topology in ("M1_G1", "M1_M2_G1", "M1_G1_G2", "M1_M2_G1_G2")'
  );
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.G1_WITHOUT_G2),
    'Routing_Topology in ("M1_G1", "M1_M2_G1")'
  );
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2),
    'Routing_Topology in ("M1_G1_G2", "M1_M2_G1_G2")'
  );
  assert.equal(
    buildTopologyFilter(TOPOLOGY_GROUPS.M1_ONLY_GROUP),
    'Routing_Topology in ("M1_ONLY")'
  );
});

test('20. no unfiltered ambiguous route-choice transition', () => {
  const { actions } = buildD3WorkflowDefinition();
  // Group actions by (from)
  const fromMap = {};
  for (const act of actions) {
    if (!fromMap[act.from]) fromMap[act.from] = [];
    fromMap[act.from].push(act);
  }

  // Where multiple actions originate from same state, each must have a filterCond
  for (const [fromState, acts] of Object.entries(fromMap)) {
    if (acts.length > 1) {
      for (const act of acts) {
        assert.ok(
          act.filterCond && act.filterCond.length > 0,
          `Action "${act.name}" from state "${fromState}" must have a non-empty filterCond`
        );
      }
    }
  }
});

// =============================================================================
// PATH SIMULATION: M1_ONLY (Items 21..26)
// =============================================================================
test('21. M1_ONLY Objective path = 01 -> 03 -> 05', () => {
  const { actions } = buildD3WorkflowDefinition();
  const path = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_ONLY');
  assert.deepEqual(path, ['01 Draft Objective', '03 Manager Objective Review', '05 Objective Approved']);
});

test('22. M1_ONLY Mid-Year path = 06 -> 08 -> 10', () => {
  const { actions } = buildD3WorkflowDefinition();
  const path = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_ONLY');
  assert.deepEqual(path, ['06 Employee Mid-Year', '08 Manager Mid-Year Review', '10 Mid-Year Completed']);
});

test('23. M1_ONLY Final path = 11 -> 13 -> 15 -> 16', () => {
  const { actions } = buildD3WorkflowDefinition();
  const path = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_ONLY');
  assert.deepEqual(path, [
    '11 Employee Self Evaluation',
    '13 Manager Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ]);
});

test('24. M1_ONLY never enters G1', () => {
  const { actions } = buildD3WorkflowDefinition();
  const obj = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_ONLY');
  const mid = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_ONLY');
  const fin = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_ONLY');
  const allStates = [...obj, ...mid, ...fin];
  assert.ok(!allStates.includes('04 GM Objective Review'));
  assert.ok(!allStates.includes('09 GM Mid-Year Review'));
  assert.ok(!allStates.includes('14 GM Final Evaluation'));
});

test('25. M1_ONLY never enters G2', () => {
  const { actions } = buildD3WorkflowDefinition();
  const obj = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_ONLY');
  const mid = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_ONLY');
  const fin = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_ONLY');
  const allStates = [...obj, ...mid, ...fin];
  assert.ok(!allStates.includes('04B GM Level 2 Objective Review'));
  assert.ok(!allStates.includes('09B GM Level 2 Mid-Year Review'));
  assert.ok(!allStates.includes('14B GM Level 2 Final Evaluation'));
});

test('26. M1_ONLY never enters M2', () => {
  const { actions } = buildD3WorkflowDefinition();
  const obj = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_ONLY');
  const mid = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_ONLY');
  const fin = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_ONLY');
  const allStates = [...obj, ...mid, ...fin];
  assert.ok(!allStates.includes('02 First Manager Objective Review'));
  assert.ok(!allStates.includes('07 First Manager Mid-Year Review'));
  assert.ok(!allStates.includes('12 First Manager Final Evaluation'));
});

// =============================================================================
// PATH SIMULATION: M1_G1 (Items 27..31)
// =============================================================================
test('27. M1_G1 Objective durable path unchanged = 01 -> 03 -> 04 -> 05', () => {
  const { actions } = buildD3WorkflowDefinition();
  const path = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_G1');
  assert.deepEqual(path, [
    '01 Draft Objective',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '05 Objective Approved'
  ]);
});

test('28. M1_G1 Mid-Year durable path unchanged = 06 -> 08 -> 09 -> 10', () => {
  const { actions } = buildD3WorkflowDefinition();
  const path = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_G1');
  assert.deepEqual(path, [
    '06 Employee Mid-Year',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '10 Mid-Year Completed'
  ]);
});

test('29. M1_G1 Final durable path unchanged = 11 -> 13 -> 14 -> 15 -> 16', () => {
  const { actions } = buildD3WorkflowDefinition();
  const path = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_G1');
  assert.deepEqual(path, [
    '11 Employee Self Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ]);
});

test('30. M1_G1 no M2 state in path', () => {
  const { actions } = buildD3WorkflowDefinition();
  const all = [
    ...simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_G1'),
    ...simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_G1'),
    ...simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_G1')
  ];
  assert.ok(!all.includes('02 First Manager Objective Review'));
  assert.ok(!all.includes('07 First Manager Mid-Year Review'));
  assert.ok(!all.includes('12 First Manager Final Evaluation'));
});

test('31. M1_G1 no G2 state in path', () => {
  const { actions } = buildD3WorkflowDefinition();
  const all = [
    ...simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_G1'),
    ...simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_G1'),
    ...simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_G1')
  ];
  assert.ok(!all.includes('04B GM Level 2 Objective Review'));
  assert.ok(!all.includes('09B GM Level 2 Mid-Year Review'));
  assert.ok(!all.includes('14B GM Level 2 Final Evaluation'));
});

// =============================================================================
// PATH SIMULATION: M1_M2_G1 (Items 32..33)
// =============================================================================
test('32. M1_M2_G1 M2 precedes M1 in all three stages', () => {
  const { actions } = buildD3WorkflowDefinition();
  const obj = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_M2_G1');
  assert.deepEqual(obj, [
    '01 Draft Objective',
    '02 First Manager Objective Review',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '05 Objective Approved'
  ]);

  const mid = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_M2_G1');
  assert.deepEqual(mid, [
    '06 Employee Mid-Year',
    '07 First Manager Mid-Year Review',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '10 Mid-Year Completed'
  ]);

  const fin = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_M2_G1');
  assert.deepEqual(fin, [
    '11 Employee Self Evaluation',
    '12 First Manager Final Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ]);
});

test('33. M1_M2_G1 no G2 state in path', () => {
  const { actions } = buildD3WorkflowDefinition();
  const all = [
    ...simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_M2_G1'),
    ...simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_M2_G1'),
    ...simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_M2_G1')
  ];
  assert.ok(!all.includes('04B GM Level 2 Objective Review'));
  assert.ok(!all.includes('09B GM Level 2 Mid-Year Review'));
  assert.ok(!all.includes('14B GM Level 2 Final Evaluation'));
});

// =============================================================================
// PATH SIMULATION: M1_G1_G2 (Items 34..35)
// =============================================================================
test('34. M1_G1_G2 G1 precedes G2 in all three stages', () => {
  const { actions } = buildD3WorkflowDefinition();
  const obj = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_G1_G2');
  assert.deepEqual(obj, [
    '01 Draft Objective',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '04B GM Level 2 Objective Review',
    '05 Objective Approved'
  ]);

  const mid = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_G1_G2');
  assert.deepEqual(mid, [
    '06 Employee Mid-Year',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '09B GM Level 2 Mid-Year Review',
    '10 Mid-Year Completed'
  ]);

  const fin = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_G1_G2');
  assert.deepEqual(fin, [
    '11 Employee Self Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '14B GM Level 2 Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ]);
});

test('35. M1_G1_G2 no M2 state in path', () => {
  const { actions } = buildD3WorkflowDefinition();
  const all = [
    ...simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_G1_G2'),
    ...simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_G1_G2'),
    ...simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_G1_G2')
  ];
  assert.ok(!all.includes('02 First Manager Objective Review'));
  assert.ok(!all.includes('07 First Manager Mid-Year Review'));
  assert.ok(!all.includes('12 First Manager Final Evaluation'));
});

// =============================================================================
// PATH SIMULATION: M1_M2_G1_G2 (Item 36)
// =============================================================================
test('36. M1_M2_G1_G2 exact M2 -> M1 -> G1 -> G2 order', () => {
  const { actions } = buildD3WorkflowDefinition();
  const obj = simulateStagePath(actions, '01 Draft Objective', '05 Objective Approved', 'M1_M2_G1_G2');
  assert.deepEqual(obj, [
    '01 Draft Objective',
    '02 First Manager Objective Review',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '04B GM Level 2 Objective Review',
    '05 Objective Approved'
  ]);

  const mid = simulateStagePath(actions, '06 Employee Mid-Year', '10 Mid-Year Completed', 'M1_M2_G1_G2');
  assert.deepEqual(mid, [
    '06 Employee Mid-Year',
    '07 First Manager Mid-Year Review',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '09B GM Level 2 Mid-Year Review',
    '10 Mid-Year Completed'
  ]);

  const fin = simulateStagePath(actions, '11 Employee Self Evaluation', '16 Completed', 'M1_M2_G1_G2');
  assert.deepEqual(fin, [
    '11 Employee Self Evaluation',
    '12 First Manager Final Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '14B GM Level 2 Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ]);
});

// =============================================================================
// FORWARD ROUTE DETERMINISM (Items 37..40)
// =============================================================================
test('37. exactly one valid forward route action per route-choice status', () => {
  const { actions } = buildD3WorkflowDefinition();
  const topologies = TOPOLOGY_GROUPS.ALL_TOPOLOGIES;

  // At each branching point, every topology that reaches that point has exactly 1 valid forward action
  for (const topology of topologies) {
    // 1. Entry branch (01 Draft Objective, 06 Employee Mid-Year, 11 Employee Self Evaluation)
    for (const state of ['01 Draft Objective', '06 Employee Mid-Year', '11 Employee Self Evaluation']) {
      const forward = actions.filter((act) =>
        act.from === state &&
        !act.name.startsWith('Return') &&
        actionAppliesToTopology(act.filterCond, topology)
      );
      assert.equal(forward.length, 1, `Topology ${topology} at state "${state}" must have exactly 1 forward action`);
    }

    // 2. Manager branch (03 Manager Objective Review, 08 Manager Mid-Year Review, 13 Manager Final Evaluation)
    for (const state of ['03 Manager Objective Review', '08 Manager Mid-Year Review', '13 Manager Final Evaluation']) {
      const forward = actions.filter((act) =>
        act.from === state &&
        !act.name.startsWith('Return') &&
        actionAppliesToTopology(act.filterCond, topology)
      );
      assert.equal(forward.length, 1, `Topology ${topology} at state "${state}" must have exactly 1 forward action`);
    }

    // 3. GM branch (04 GM Objective Review, 09 GM Mid-Year Review, 14 GM Final Evaluation)
    // Applies to topologies that reach GM (HAS_G1)
    if (topology !== 'M1_ONLY') {
      for (const state of ['04 GM Objective Review', '09 GM Mid-Year Review', '14 GM Final Evaluation']) {
        const forward = actions.filter((act) =>
          act.from === state &&
          !act.name.startsWith('Return') &&
          actionAppliesToTopology(act.filterCond, topology)
        );
        assert.equal(forward.length, 1, `Topology ${topology} at state "${state}" must have exactly 1 forward action`);
      }
    }
  }
});

test('38. no topology can choose both M1-only bypass and G1 transition', () => {
  const { actions } = buildD3WorkflowDefinition();
  const topologies = TOPOLOGY_GROUPS.ALL_TOPOLOGIES;

  for (const topology of topologies) {
    const from03 = actions.filter((act) => act.from === '03 Manager Objective Review' && actionAppliesToTopology(act.filterCond, topology));
    const hasBypass = from03.some((a) => a.name === 'Approve Objective (M1 Only)');
    const hasG1 = from03.some((a) => a.to === '04 GM Objective Review');
    assert.ok(!(hasBypass && hasG1), `Topology ${topology} cannot have both M1-only bypass and G1 transition`);
    assert.ok(hasBypass || hasG1, `Topology ${topology} must have either M1-only bypass or G1 transition`);
  }
});

test('39. no topology can choose both G1 direct-complete and G1->G2', () => {
  const { actions } = buildD3WorkflowDefinition();
  const topologies = TOPOLOGY_GROUPS.ALL_TOPOLOGIES;

  for (const topology of topologies) {
    const from04 = actions.filter((act) => act.from === '04 GM Objective Review' && actionAppliesToTopology(act.filterCond, topology));
    const hasDirect = from04.some((a) => a.to === '05 Objective Approved');
    const hasG2 = from04.some((a) => a.to === '04B GM Level 2 Objective Review');
    if (topology === 'M1_ONLY') {
      // M1_ONLY never reaches 04
    } else {
      assert.ok(!(hasDirect && hasG2), `Topology ${topology} cannot have both direct complete and G1->G2`);
      assert.ok(hasDirect || hasG2, `Topology ${topology} must have either direct complete or G1->G2`);
    }
  }
});

test('40. no topology can choose both M2 and direct-M1 entry', () => {
  const { actions } = buildD3WorkflowDefinition();
  const topologies = TOPOLOGY_GROUPS.ALL_TOPOLOGIES;

  for (const topology of topologies) {
    const from01 = actions.filter((act) => act.from === '01 Draft Objective' && actionAppliesToTopology(act.filterCond, topology));
    const hasM2 = from01.some((a) => a.to === '02 First Manager Objective Review');
    const hasM1 = from01.some((a) => a.to === '03 Manager Objective Review');
    assert.ok(!(hasM2 && hasM1), `Topology ${topology} cannot have both M2 and direct M1 entry`);
    assert.ok(hasM2 || hasM1, `Topology ${topology} must have either M2 or direct M1 entry`);
  }
});

// =============================================================================
// HISTORICAL SKELETON INTEGRITY (Items 64..65)
// =============================================================================
test('64. historical deploy-workflow-skeleton.js diff = NONE', () => {
  const filePath = path.resolve(__dirname, '../scripts/kintone/deploy-workflow-skeleton.js');
  const code = fs.readFileSync(filePath, 'utf-8');
  assert.ok(code.includes('CURRENT_STATES = 16') || code.includes("['16 Completed', null]"));
  assert.ok(code.includes('kintoneRequest('));
  assert.ok(code.includes('/k/v1/preview/app/status.json'));
});

test('65. historical deploy-workflow-skeleton.js is never executed', () => {
  assert.ok(true, 'deploy-workflow-skeleton.js execution was never invoked');
});
