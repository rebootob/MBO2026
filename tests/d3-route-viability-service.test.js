import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeD3RouteVersion
} from '../src/config/d3-route-contract.js';
import {
  evaluateD3RouteViability,
  D3RouteViabilityError
} from '../src/services/d3-route-viability-service.js';

const U = code => [{ code }];

function routeVersion({
  pattern,
  m1 = [],
  m2 = [],
  g1 = [],
  g2 = [],
  m1Rule = 'ALL',
  m2Rule = 'ALL',
  g1Rule = 'ALL',
  g2Rule = 'ALL',
  scorerPlan = [1]
}) {
  return {
    Routing_Key: { value: 'TME1' },
    Version_Key: { value: 'TME1#v1' },
    Version_Number: { value: '1' },
    Route_Pattern: { value: pattern },
    Manager_Level1_Approvers: { value: m1 },
    Manager_Level1_Approval_Rule: { value: m1Rule },
    Manager_Level2_Approvers: { value: m2 },
    Manager_Level2_Approval_Rule: { value: m2Rule },
    GM_Level1_Approvers: { value: g1 },
    GM_Level1_Approval_Rule: { value: g1Rule },
    GM_Level2_Approvers: { value: g2 },
    GM_Level2_Approval_Rule: { value: g2Rule },
    Scorer_Priority_Slots: { value: scorerPlan }
  };
}

const patternCases = [
  {
    pattern: 'PATTERN_1_M1',
    expectedTopology: 'M1_ONLY',
    expectedOrder: ['m1'],
    fields: { m1: U('m1') }
  },
  {
    pattern: 'PATTERN_2_M1_G1',
    expectedTopology: 'M1_G1',
    expectedOrder: ['m1', 'g1'],
    fields: { m1: U('m1'), g1: U('g1') }
  },
  {
    pattern: 'PATTERN_3A_M2_M1_G1',
    expectedTopology: 'M1_M2_G1',
    expectedOrder: ['m2', 'm1', 'g1'],
    fields: { m2: U('m2'), m1: U('m1'), g1: U('g1') }
  },
  {
    pattern: 'PATTERN_3B_M1_G1_G2',
    expectedTopology: 'M1_G1_G2',
    expectedOrder: ['m1', 'g1', 'g2'],
    fields: { m1: U('m1'), g1: U('g1'), g2: U('g2') }
  },
  {
    pattern: 'PATTERN_4_M2_M1_G1_G2',
    expectedTopology: 'M1_M2_G1_G2',
    expectedOrder: ['m2', 'm1', 'g1', 'g2'],
    fields: { m2: U('m2'), m1: U('m1'), g1: U('g1'), g2: U('g2') }
  }
];

for (const tc of patternCases) {
  test(`D3 route pattern normalizes ${tc.pattern} in canonical business order`, () => {
    const normalized = normalizeD3RouteVersion(
      routeVersion({ pattern: tc.pattern, ...tc.fields })
    );

    assert.equal(normalized.topology, tc.expectedTopology);
    assert.deepEqual(
      normalized.businessSlots.map(slot => slot.user.code),
      tc.expectedOrder
    );
  });
}

test('Both 3-appraiser patterns remain distinct', () => {
  const a = normalizeD3RouteVersion(routeVersion({
    pattern: 'PATTERN_3A_M2_M1_G1',
    m2: U('a'),
    m1: U('b'),
    g1: U('c')
  }));
  const b = normalizeD3RouteVersion(routeVersion({
    pattern: 'PATTERN_3B_M1_G1_G2',
    m1: U('a'),
    g1: U('b'),
    g2: U('c')
  }));

  assert.equal(a.topology, 'M1_M2_G1');
  assert.equal(b.topology, 'M1_G1_G2');
  assert.notEqual(a.routePattern, b.routePattern);
});

test('D3 V1 rejects multiple users in one active sequential slot', () => {
  assert.throws(
    () => normalizeD3RouteVersion(routeVersion({
      pattern: 'PATTERN_2_M1_G1',
      m1: U('m1'),
      g1: [{ code: 'g1a' }, { code: 'g1b' }]
    })),
    error => error.code === 'D3_V1_SLOT_USER_COUNT_INVALID'
  );
});

test('D3 V1 rejects ANY even when slot contains one user', () => {
  assert.throws(
    () => normalizeD3RouteVersion(routeVersion({
      pattern: 'PATTERN_2_M1_G1',
      m1: U('m1'),
      g1: U('g1'),
      g1Rule: 'ANY'
    })),
    error => error.code === 'D3_V1_APPROVAL_RULE_NOT_ALL'
  );
});

test('D3 V1 rejects populated inactive physical slot', () => {
  assert.throws(
    () => normalizeD3RouteVersion(routeVersion({
      pattern: 'PATTERN_2_M1_G1',
      m1: U('m1'),
      m2: U('unexpected'),
      g1: U('g1')
    })),
    error => error.code === 'INACTIVE_ROUTE_SLOT_POPULATED'
  );
});

test('D3 V1 rejects duplicate appraiser identity across sequential slots', () => {
  assert.throws(
    () => normalizeD3RouteVersion(routeVersion({
      pattern: 'PATTERN_2_M1_G1',
      m1: U('same'),
      g1: U('same')
    })),
    error => error.code === 'DUPLICATE_APPRAISER_IDENTITY'
  );
});

test('Self-elision: M1_G1 self at slot 1 compacts to M1_ONLY', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_2_M1_G1',
      m1: U('self'),
      g1: U('g1'),
      scorerPlan: [2]
    }),
    kExpected: 1,
    employeeUserCode: 'self',
    isOwnMbo: true
  });

  assert.equal(result.effectiveRoute.topology, 'M1_ONLY');
  assert.deepEqual(result.effectiveRoute.businessSlots.map(s => s.user.code), ['g1']);
  assert.equal(result.activeScorers[0].user.code, 'g1');
});

test('Self-elision: 4-step remove M2 -> canonical 3B M1_G1_G2', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_4_M2_M1_G1_G2',
      m2: U('self'),
      m1: U('m1'),
      g1: U('g1'),
      g2: U('g2'),
      scorerPlan: [2, 3, 4]
    }),
    kExpected: 2,
    employeeUserCode: 'self',
    isOwnMbo: true
  });

  assert.equal(result.effectiveRoute.routePattern, 'PATTERN_3B_M1_G1_G2');
  assert.equal(result.effectiveRoute.topology, 'M1_G1_G2');
  assert.deepEqual(
    result.effectiveRoute.businessSlots.map(s => s.user.code),
    ['m1', 'g1', 'g2']
  );
});

test('Self-elision: 4-step remove M1 -> canonical 3B and M2 shifts to target M1', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_4_M2_M1_G1_G2',
      m2: U('m2'),
      m1: U('self'),
      g1: U('g1'),
      g2: U('g2'),
      scorerPlan: [1, 3, 4]
    }),
    kExpected: 2,
    employeeUserCode: 'self',
    isOwnMbo: true
  });

  assert.equal(result.effectiveRoute.routePattern, 'PATTERN_3B_M1_G1_G2');
  assert.equal(result.effectiveRoute.businessSlots[0].targetSlot, 'M1');
  assert.equal(result.effectiveRoute.businessSlots[0].user.code, 'm2');
});

test('Self-elision: 4-step remove G1 -> canonical 3A and G2 shifts to target G1', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_4_M2_M1_G1_G2',
      m2: U('m2'),
      m1: U('m1'),
      g1: U('self'),
      g2: U('g2'),
      scorerPlan: [1, 2, 4]
    }),
    kExpected: 2,
    employeeUserCode: 'self',
    isOwnMbo: true
  });

  assert.equal(result.effectiveRoute.routePattern, 'PATTERN_3A_M2_M1_G1');
  assert.equal(result.effectiveRoute.topology, 'M1_M2_G1');
  assert.equal(result.effectiveRoute.businessSlots[2].targetSlot, 'G1');
  assert.equal(result.effectiveRoute.businessSlots[2].user.code, 'g2');
});

test('Self-elision: 4-step remove G2 -> canonical 3A M2_M1_G1', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_4_M2_M1_G1_G2',
      m2: U('m2'),
      m1: U('m1'),
      g1: U('g1'),
      g2: U('self'),
      scorerPlan: [1, 2, 3]
    }),
    kExpected: 2,
    employeeUserCode: 'self',
    isOwnMbo: true
  });

  assert.equal(result.effectiveRoute.routePattern, 'PATTERN_3A_M2_M1_G1');
  assert.deepEqual(
    result.effectiveRoute.businessSlots.map(s => s.user.code),
    ['m2', 'm1', 'g1']
  );
});

test('Self-elision: zero survivors fails with SELF_APPROVAL_ROUTE_CONFLICT', () => {
  assert.throws(
    () => evaluateD3RouteViability({
      routeVersion: routeVersion({
        pattern: 'PATTERN_1_M1',
        m1: U('self'),
        scorerPlan: [1]
      }),
      kExpected: 1,
      employeeUserCode: 'self',
      isOwnMbo: true
    }),
    error =>
      error instanceof D3RouteViabilityError &&
      error.code === 'SELF_APPROVAL_ROUTE_CONFLICT'
  );
});

test('K=1 selects exact HR-authorized scorer at 100%', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_3B_M1_G1_G2',
      m1: U('m1'),
      g1: U('g1'),
      g2: U('g2'),
      scorerPlan: [3, 1]
    }),
    kExpected: 1
  });

  assert.deepEqual(result.activeScorers.map(s => s.user.code), ['g2']);
  assert.deepEqual(result.scorerWeights, [100]);
});

test('K=2 selects first two surviving HR-priority scorers at 50/50', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_4_M2_M1_G1_G2',
      m2: U('m2'),
      m1: U('m1'),
      g1: U('g1'),
      g2: U('g2'),
      scorerPlan: [1, 3, 4]
    }),
    kExpected: 2
  });

  assert.deepEqual(result.activeScorers.map(s => s.user.code), ['m2', 'g1']);
  assert.deepEqual(result.scorerWeights, [50, 50]);
});

test('Scorer priority list provides explicit post-elision fallback without guessing', () => {
  const result = evaluateD3RouteViability({
    routeVersion: routeVersion({
      pattern: 'PATTERN_3A_M2_M1_G1',
      m2: U('self'),
      m1: U('m1'),
      g1: U('g1'),
      scorerPlan: [1, 2, 3]
    }),
    kExpected: 2,
    employeeUserCode: 'self',
    isOwnMbo: true
  });

  assert.deepEqual(result.activeScorers.map(s => s.user.code), ['m1', 'g1']);
});

test('Missing scorer plan fails closed with SCORER_PLAN_NOT_CONFIGURED', () => {
  const rv = routeVersion({
    pattern: 'PATTERN_2_M1_G1',
    m1: U('m1'),
    g1: U('g1')
  });
  rv.Scorer_Priority_Slots = { value: '' };

  assert.throws(
    () => evaluateD3RouteViability({
      routeVersion: rv,
      kExpected: 2
    }),
    error =>
      error instanceof D3RouteViabilityError &&
      error.code === 'SCORER_PLAN_NOT_CONFIGURED'
  );
});

test('Self-elision that leaves too few authorized scorers fails closed', () => {
  assert.throws(
    () => evaluateD3RouteViability({
      routeVersion: routeVersion({
        pattern: 'PATTERN_3A_M2_M1_G1',
        m2: U('self'),
        m1: U('m1'),
        g1: U('g1'),
        scorerPlan: [1, 2]
      }),
      kExpected: 2,
      employeeUserCode: 'self',
      isOwnMbo: true
    }),
    error =>
      error instanceof D3RouteViabilityError &&
      error.code === 'SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION'
  );
});

test('Unsupported K_expected fails closed', () => {
  assert.throws(
    () => evaluateD3RouteViability({
      routeVersion: routeVersion({
        pattern: 'PATTERN_2_M1_G1',
        m1: U('m1'),
        g1: U('g1'),
        scorerPlan: [1, 2]
      }),
      kExpected: 3
    }),
    error =>
      error instanceof D3RouteViabilityError &&
      error.code === 'INVALID_K_EXPECTED'
  );
});
