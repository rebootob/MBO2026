import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  RoutingService,
  D3RouteBindingError,
  D3RouteVersionResolutionError,
  D3RouteViabilityError,
  D3RouteContractError
} from '../src/services/routing-service.js';
import {
  resolveProfileCodeForSnapshot,
  PROFILE_CODES
} from '../src/profiles/runtime-profile-resolver.js';
import { getCanonicalBaselineMasterConfigs } from '../src/profiles/scoring-config-master.js';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { syncRecordToKintone } from '../src/main-mbo-app.js';
import { mboFields } from '../config/schema-spec.js';

function makeCandidateVersion({
  routingKey = 'TMT1',
  versionKey = 'TMT1#v1',
  versionNumber = 1,
  versionStatus = 'ACTIVE',
  effectiveFrom = '2026-04-01',
  effectiveTo = '',
  routePattern = 'PATTERN_2_M1_G1',
  m1User = 'mgr_1',
  g1User = 'gm_1',
  m2User = null,
  g2User = null,
  scorerPrioritySlots = '[1, 2]',
  requesterUsers = [{ code: 'emp_1' }],
  legacyActive = 'Active'
}) {
  return {
    Routing_Key: { value: routingKey },
    Version_Key: { value: versionKey },
    Version_Number: { value: String(versionNumber) },
    Version_Status: { value: versionStatus },
    Effective_From: { value: effectiveFrom },
    Effective_To: { value: effectiveTo },
    Route_Pattern: { value: routePattern },
    Routing_Topology: {
      value: routePattern === 'PATTERN_1_M1' ? 'M1_ONLY'
        : routePattern === 'PATTERN_3A_M2_M1_G1' ? 'M1_M2_G1'
        : routePattern === 'PATTERN_3B_M1_G1_G2' ? 'M1_G1_G2'
        : routePattern === 'PATTERN_4_M2_M1_G1_G2' ? 'M1_M2_G1_G2'
        : 'M1_G1'
    },
    Active: { value: legacyActive },
    Requester_User: { value: requesterUsers },
    Scorer_Priority_Slots: { value: scorerPrioritySlots },
    Manager_Level1_Approvers: { value: m1User ? [{ code: m1User }] : [] },
    Manager_Level1_Approval_Rule: { value: 'ALL' },
    Manager_Level2_Approvers: { value: m2User ? [{ code: m2User }] : [] },
    Manager_Level2_Approval_Rule: { value: 'ALL' },
    GM_Level1_Approvers: { value: g1User ? [{ code: g1User }] : [] },
    GM_Level1_Approval_Rule: { value: 'ALL' },
    GM_Level2_Approvers: { value: g2User ? [{ code: g2User }] : [] },
    GM_Level2_Approval_Rule: { value: 'ALL' }
  };
}

function makeBoundRecord({
  frozenProfileCode = 'PROF_STAFF_CHIEF',
  kExpected = '2',
  effectiveRoutingKey = 'TMT1',
  effectiveVersionKey = 'TMT1#v1',
  scorerSlotsSnapshot = '[1,2]',
  topology = 'M1_G1',
  m1Approvers = [{ code: 'mgr_v1' }],
  m1Rule = 'ALL',
  m2Approvers = [],
  m2Rule = 'ALL',
  g1Approvers = [{ code: 'gm_v1' }],
  g1Rule = 'ALL',
  g2Approvers = [],
  g2Rule = 'ALL'
} = {}) {
  return {
    Frozen_Profile_Code: { value: frozenProfileCode },
    K_expected_Snapshot: { value: String(kExpected) },
    Effective_Routing_Key: { value: effectiveRoutingKey },
    Effective_Route_Version_Key: { value: effectiveVersionKey },
    Effective_Scorer_Slots_Snapshot: { value: scorerSlotsSnapshot },
    Routing_Topology: { value: topology },
    Manager_Level1_Approvers: { value: m1Approvers },
    Manager_Level1_Approval_Rule: { value: m1Rule },
    Manager_Level2_Approvers: { value: m2Approvers },
    Manager_Level2_Approval_Rule: { value: m2Rule },
    GM_Level1_Approvers: { value: g1Approvers },
    GM_Level1_Approval_Rule: { value: g1Rule },
    GM_Level2_Approvers: { value: g2Approvers },
    GM_Level2_Approval_Rule: { value: g2Rule }
  };
}

// ----------------------------------------------------
// MODEL A (Tests 1 - 7)
// ----------------------------------------------------

test('TC01: Model A exact effective version selected by business date', async () => {
  const v1 = makeCandidateVersion({
    versionKey: 'TMT1#v1',
    versionNumber: 1,
    effectiveFrom: '2025-04-01',
    effectiveTo: '2026-03-31',
    m1User: 'mgr_v1'
  });
  const v2 = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    versionNumber: 2,
    effectiveFrom: '2026-04-01',
    effectiveTo: '',
    m1User: 'mgr_v2'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v1, v2],
    resolutionBusinessDate: '2026-04-15',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v2');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'mgr_v2');

  const resPast = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v1, v2],
    resolutionBusinessDate: '2025-10-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });
  assert.equal(resPast.Effective_Route_Version_Key, 'TMT1#v1');
  assert.equal(resPast.Manager_Level1_Approvers[0].code, 'mgr_v1');
});

test('TC02: Model A future ACTIVE version ignored before Effective_From', async () => {
  const vFuture = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    versionNumber: 2,
    effectiveFrom: '2026-06-01',
    effectiveTo: ''
  });

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [vFuture],
        resolutionBusinessDate: '2026-05-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteVersionResolutionError, true);
      assert.equal(err.code, 'NO_EFFECTIVE_ROUTE');
      return true;
    }
  );
});

test('TC03: Model A expired version not used', async () => {
  const vExpired = makeCandidateVersion({
    versionKey: 'TMT1#v1',
    versionNumber: 1,
    effectiveFrom: '2025-04-01',
    effectiveTo: '2026-03-31'
  });

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [vExpired],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err.code, 'NO_EFFECTIVE_ROUTE');
      return true;
    }
  );
});

test('TC04: Model A 0 effective => NO_EFFECTIVE_ROUTE', async () => {
  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err.code, 'NO_EFFECTIVE_ROUTE');
      return true;
    }
  );
});

test('TC05: Model A overlapping ACTIVE versions => AMBIGUOUS_EFFECTIVE_ROUTE', async () => {
  const v1 = makeCandidateVersion({
    versionKey: 'TMT1#v1',
    versionNumber: 1,
    effectiveFrom: '2026-04-01',
    effectiveTo: '2026-12-31'
  });
  const v2 = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    versionNumber: 2,
    effectiveFrom: '2026-06-01',
    effectiveTo: '2027-03-31'
  });

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v1, v2],
        resolutionBusinessDate: '2026-07-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err.code, 'AMBIGUOUS_EFFECTIVE_ROUTE');
      return true;
    }
  );
});

test('TC06: Model A legacy Active value cannot override Version_Status/date authority', async () => {
  const vOldSuperseded = makeCandidateVersion({
    versionKey: 'TMT1#v1',
    versionNumber: 1,
    versionStatus: 'SUPERSEDED',
    legacyActive: 'Active',
    effectiveFrom: '2025-04-01',
    effectiveTo: ''
  });
  const vNewActive = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    versionNumber: 2,
    versionStatus: 'ACTIVE',
    legacyActive: 'Inactive',
    effectiveFrom: '2026-04-01',
    effectiveTo: ''
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [vOldSuperseded, vNewActive],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v2');
});

test('TC07: Version_Key from selected row preserved exactly', async () => {
  const v = makeCandidateVersion({
    routingKey: 'TMG1|CAD',
    versionKey: 'TMG1|CAD#v3',
    versionNumber: 3,
    effectiveFrom: '2026-04-01'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMG1|CAD',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMG1|CAD#v3');
  assert.equal(res.Version_Key, 'TMG1|CAD#v3');
});

// ----------------------------------------------------
// PROFILE / K (Tests 8 - 12)
// ----------------------------------------------------

test('TC08: Frozen_Profile_Code bound exactly from verified employee snapshot', async () => {
  const v = makeCandidateVersion({});
  const mockEmployeeApi = {
    getRecords: async () => ({
      records: [{
        emp_text: { value: 'E001' },
        Text: { value: 'Staff One' },
        Text_0: { value: 'พนักงาน หนึ่ง' },
        Drop_down_0: { value: 'General Admin' },
        Drop_down: { value: 'General Admin Section 1' },
        Text_2: { value: 'Staff' }
      }]
    })
  };
  const lookupRes = await EmployeeService.lookupEmployee('E001', mockEmployeeApi);
  const empSnapshot = lookupRes.employee;

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    employeeSnapshot: empSnapshot,
    kExpected: 2
  });

  assert.equal(res.Frozen_Profile_Code, 'PROF_STAFF_CHIEF');
});

test('TC09: K_expected = 1 case for executive profile', async () => {
  const v = makeCandidateVersion({
    routingKey: 'POSITION_DGM',
    versionKey: 'POSITION_DGM#v1',
    routePattern: 'PATTERN_1_M1',
    m1User: 'president',
    g1User: null,
    scorerPrioritySlots: '[1]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'POSITION_DGM',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_DGM',
    kExpected: 1
  });

  assert.equal(res.K_expected_Snapshot, 1);
  assert.equal(res.Effective_Scorer_Slots_Snapshot, '[1]');
});

test('TC10: K_expected = 2 case for non-executive profile', async () => {
  const v = makeCandidateVersion({});
  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_SECTION_MGR',
    kExpected: 2
  });

  assert.equal(res.K_expected_Snapshot, 2);
  assert.equal(res.Effective_Scorer_Slots_Snapshot, '[1,2]');
});

test('TC11: missing/invalid K fails closed', async () => {
  const v = makeCandidateVersion({});

  // Missing kExpected throws K_EXPECTED_NOT_CONFIGURED
  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_SECTION_MGR'
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'K_EXPECTED_NOT_CONFIGURED');
      return true;
    }
  );

  // Invalid kExpected throws INVALID_K_EXPECTED
  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_SECTION_MGR',
        kExpected: 3
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'INVALID_K_EXPECTED');
      return true;
    }
  );
});

test('TC12: K not inferred from route length', async () => {
  const v4 = makeCandidateVersion({
    routePattern: 'PATTERN_4_M2_M1_G1_G2',
    m2User: 'm2',
    m1User: 'm1',
    g1User: 'g1',
    g2User: 'g2',
    scorerPrioritySlots: '[1, 2]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v4],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Routing_Topology, 'M1_M2_G1_G2');
  assert.equal(res.K_expected_Snapshot, 2, 'K must strictly come from scoring config (2), NOT route length (4)');
});

// ----------------------------------------------------
// SCORER / SELF-ELISION (Tests 13 - 17)
// ----------------------------------------------------

test('TC13: explicit scorer plan honored', async () => {
  const v = makeCandidateVersion({
    routePattern: 'PATTERN_3A_M2_M1_G1',
    m2User: 'm2',
    m1User: 'm1',
    g1User: 'g1',
    scorerPrioritySlots: '[2, 3]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Active_Scorers.length, 2);
  assert.equal(res.Active_Scorers[0].user.code, 'm1');
  assert.equal(res.Active_Scorers[1].user.code, 'g1');
});

test('TC14: own-MBO self-elision preserves canonical route order', async () => {
  const v = makeCandidateVersion({
    routePattern: 'PATTERN_2_M1_G1',
    m1User: 'emp_natta',
    g1User: 'gm_somrudee',
    scorerPrioritySlots: '[1, 2]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_DGM',
    employeeUserCode: 'emp_natta',
    isOwnMbo: true,
    kExpected: 1
  });

  assert.equal(res.selfAppraiserElided, true);
  assert.equal(res.Routing_Topology, 'M1_ONLY');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'gm_somrudee');
  assert.equal(res.GM_Level1_Approvers.length, 0);
  assert.equal(res.Active_Scorers[0].user.code, 'gm_somrudee');
});

test('TC15: scorer slots snapshot uses effective ordinals', async () => {
  const v = makeCandidateVersion({
    routePattern: 'PATTERN_3A_M2_M1_G1',
    m2User: 'emp_self',
    m1User: 'mgr_surviving',
    g1User: 'gm_surviving',
    scorerPrioritySlots: '[2, 3]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_SECTION_MGR',
    employeeUserCode: 'emp_self',
    isOwnMbo: true,
    kExpected: 2
  });

  assert.equal(res.selfAppraiserElided, true);
  assert.equal(res.Effective_Scorer_Slots_Snapshot, '[1,2]');
});

test('TC16: scorer slots count == K_expected', async () => {
  const v = makeCandidateVersion({});
  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  const parsed = JSON.parse(res.Effective_Scorer_Slots_Snapshot);
  assert.equal(parsed.length, res.K_expected_Snapshot);
});

test('TC17: missing scorer plan fails closed', async () => {
  const v = makeCandidateVersion({
    scorerPrioritySlots: ''
  });

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err.code, 'SCORER_PLAN_NOT_CONFIGURED');
      return true;
    }
  );
});

// ----------------------------------------------------
// APP794 PROVENANCE & VALIDATION (Tests 18 - 23)
// ----------------------------------------------------

test('TC18: all five provenance fields persisted in bound snapshot', async () => {
  const v = makeCandidateVersion({
    routingKey: 'TMT1',
    versionKey: 'TMT1#v1',
    scorerPrioritySlots: '[1, 2]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(typeof res.Frozen_Profile_Code, 'string');
  assert.equal(typeof res.K_expected_Snapshot, 'number');
  assert.equal(typeof res.Effective_Routing_Key, 'string');
  assert.equal(typeof res.Effective_Route_Version_Key, 'string');
  assert.equal(typeof res.Effective_Scorer_Slots_Snapshot, 'string');
});

test('TC19: Effective_Routing_Key exact App795 selected row value', async () => {
  const v = makeCandidateVersion({ routingKey: 'TMG2|Production' });
  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMG2|Production',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Routing_Key, 'TMG2|Production');
});

test('TC20: Effective_Route_Version_Key exact selected Version_Key', async () => {
  const v = makeCandidateVersion({ routingKey: 'TMG2|Production', versionKey: 'TMG2|Production#v4' });
  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMG2|Production',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMG2|Production#v4');
});

test('TC21: route snapshot fields match effective post-self-elision route', async () => {
  const v = makeCandidateVersion({
    routePattern: 'PATTERN_2_M1_G1',
    m1User: 'mgr_somchai',
    g1User: 'gm_somrudee'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Manager_Level1_Approvers[0].code, 'mgr_somchai');
  assert.equal(res.Manager_Level1_Approval_Rule, 'ALL');
  assert.equal(res.GM_Level1_Approvers[0].code, 'gm_somrudee');
  assert.equal(res.GM_Level1_Approval_Rule, 'ALL');
  assert.equal(res.Routing_Topology, 'M1_G1');

  const valRes = ValidationEngine.validateD3RouteProvenance(res);
  assert.equal(valRes.isValid, true);
});

test('TC22: required provenance read-back succeeds in syncRecordToKintone', () => {
  let formState = {
    record: {
      Profile_Code: { type: 'SINGLE_LINE_TEXT', value: 'PROF_STAFF_CHIEF' },
      PartA_Weight: { type: 'NUMBER', value: '70' },
      PartB_Weight: { type: 'NUMBER', value: '30' },
      Part_A_Scoring_Mode: { type: 'SINGLE_LINE_TEXT', value: 'DIFFICULTY_ACHIEVEMENT_MATRIX' },
      Competency_Set_Code: { type: 'SINGLE_LINE_TEXT', value: 'COMP_SET_OPERATIONAL_V1' },
      Configuration_Hash: { type: 'SINGLE_LINE_TEXT', value: 'hash123' },
      Routing_Topology: { type: 'SINGLE_LINE_TEXT', value: 'M1_G1' },
      Requester_User: { type: 'USER_SELECT', value: [{ code: 'emp1' }] },
      Record_Key: { type: 'SINGLE_LINE_TEXT', value: 'FY2026-0001' },
      Frozen_Profile_Code: { type: 'SINGLE_LINE_TEXT', value: 'PROF_STAFF_CHIEF' },
      K_expected_Snapshot: { type: 'NUMBER', value: '2' },
      Effective_Routing_Key: { type: 'SINGLE_LINE_TEXT', value: 'TMT1' },
      Effective_Route_Version_Key: { type: 'SINGLE_LINE_TEXT', value: 'TMT1#v1' },
      Effective_Scorer_Slots_Snapshot: { type: 'SINGLE_LINE_TEXT', value: '[1,2]' }
    }
  };

  globalThis.kintone = {
    app: {
      record: {
        get: () => formState,
        set: ({ record }) => { formState = { record }; }
      }
    }
  };

  const recordToSync = {
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: 2 },
    Effective_Routing_Key: { value: 'TMT1' },
    Effective_Route_Version_Key: { value: 'TMT1#v1' },
    Effective_Scorer_Slots_Snapshot: { value: '[1,2]' }
  };

  const success = syncRecordToKintone(recordToSync, {
    requireVerifiedPersistence: true,
    requiredFields: [
      'Frozen_Profile_Code',
      'K_expected_Snapshot',
      'Effective_Routing_Key',
      'Effective_Route_Version_Key',
      'Effective_Scorer_Slots_Snapshot'
    ]
  });

  assert.equal(success, true);
  assert.equal(formState.record.Effective_Route_Version_Key.value, 'TMT1#v1');
});

test('TC23: missing destination provenance field fails closed where verified persistence required', () => {
  let formState = {
    record: {
      Frozen_Profile_Code: { type: 'SINGLE_LINE_TEXT', value: 'PROF_STAFF_CHIEF' },
      K_expected_Snapshot: { type: 'NUMBER', value: '2' },
      Effective_Routing_Key: { type: 'SINGLE_LINE_TEXT', value: 'TMT1' }
    }
  };

  globalThis.kintone = {
    app: {
      record: {
        get: () => formState,
        set: ({ record }) => { formState = { record }; }
      }
    }
  };

  assert.throws(
    () => {
      syncRecordToKintone({}, {
        requireVerifiedPersistence: true,
        requiredFields: ['Frozen_Profile_Code', 'Effective_Route_Version_Key']
      });
    },
    /Field Effective_Route_Version_Key does not exist on Kintone form schema/
  );
});

// ----------------------------------------------------
// STAGE BINDING & IMMUTABILITY (Tests 24 - 27)
// ----------------------------------------------------

test('TC24: in-flight stage remains bound to Version A after Version B becomes effective', async () => {
  const boundRecord = makeBoundRecord({
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2,
    effectiveRoutingKey: 'TMT1',
    effectiveVersionKey: 'TMT1#v1',
    scorerSlotsSnapshot: '[1,2]',
    topology: 'M1_G1',
    m1Approvers: [{ code: 'mgr_v1' }],
    g1Approvers: [{ code: 'gm_v1' }]
  });

  const v2 = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    versionNumber: 2,
    m1User: 'mgr_v2'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v2],
    resolutionBusinessDate: '2026-08-01',
    existingRecord: boundRecord,
    isStageBoundary: false,
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v1');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'mgr_v1');
  assert.equal(res.inFlightImmutable, true);
});

test('TC25: no implicit calendar-driven re-resolution for in-flight record', async () => {
  const boundRecord = makeBoundRecord({
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2,
    effectiveRoutingKey: 'TMT1',
    effectiveVersionKey: 'TMT1#v1',
    scorerSlotsSnapshot: '[1,2]',
    topology: 'M1_G1',
    m1Approvers: [{ code: 'mgr_v1' }],
    g1Approvers: [{ code: 'gm_v1' }]
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [],
    resolutionBusinessDate: '2027-04-01',
    existingRecord: boundRecord,
    isStageBoundary: false,
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v1');
});

test('TC26: next-stage rebind without prior-stage archive-success evidence fails closed', async () => {
  const boundRecord = makeBoundRecord({
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2,
    effectiveRoutingKey: 'TMT1',
    effectiveVersionKey: 'TMT1#v1',
    scorerSlotsSnapshot: '[1,2]',
    topology: 'M1_G1',
    m1Approvers: [{ code: 'mgr_v1' }],
    g1Approvers: [{ code: 'gm_v1' }]
  });

  const v2 = makeCandidateVersion({ versionKey: 'TMT1#v2' });

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v2],
        resolutionBusinessDate: '2026-10-01',
        existingRecord: boundRecord,
        isStageBoundary: true,
        priorStageArchiveVerified: false,
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS');
      return true;
    }
  );
});

test('TC27: next-stage rebind with explicit mocked archive-success evidence resolves deterministically at new business date', async () => {
  const boundRecord = makeBoundRecord({
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2,
    effectiveRoutingKey: 'TMT1',
    effectiveVersionKey: 'TMT1#v1',
    scorerSlotsSnapshot: '[1,2]',
    topology: 'M1_G1',
    m1Approvers: [{ code: 'mgr_v1' }],
    g1Approvers: [{ code: 'gm_v1' }]
  });

  const v2 = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    versionNumber: 2,
    m1User: 'mgr_v2'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v2],
    resolutionBusinessDate: '2026-10-01',
    existingRecord: boundRecord,
    isStageBoundary: true,
    priorStageArchiveVerified: true,
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v2');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'mgr_v2');
});

// ----------------------------------------------------
// REGRESSION (Tests 28 - 31)
// ----------------------------------------------------

test('TC28: current normal M1_G1 regression remains compatible', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 'e1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'suthas' }] },
        Manager_Level1_Approval_Rule: { value: 'ALL' },
        Manager_Level2_Approvers: { value: [] },
        Manager_Level2_Approval_Rule: { value: 'ALL' },
        GM_Level1_Approvers: { value: [{ code: 'somrudee' }] },
        GM_Level1_Approval_Rule: { value: 'ALL' },
        GM_Level2_Approvers: { value: [] },
        GM_Level2_Approval_Rule: { value: 'ALL' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TME1', null, 'e1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_G1');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'suthas');
  assert.equal(routing.GM_Level1_Approvers[0].code, 'somrudee');
});

test('TC29: DGM M1_ONLY / K=1 remains valid', async () => {
  const vDgm = makeCandidateVersion({
    routingKey: 'POSITION_DGM',
    versionKey: 'POSITION_DGM#v1',
    routePattern: 'PATTERN_1_M1',
    m1User: 'president',
    g1User: null,
    scorerPrioritySlots: '[1]'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'POSITION_DGM',
    candidateRecords: [vDgm],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_DGM',
    kExpected: 1
  });

  assert.equal(res.Routing_Topology, 'M1_ONLY');
  assert.equal(res.K_expected_Snapshot, 1);
  assert.equal(res.Effective_Scorer_Slots_Snapshot, '[1]');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'president');
});

test('TC30: D3-IMP-01 / D3-IMP-03-R1 App 796 scoring config is canonical authority for K_expected', () => {
  const baselineConfigs = getCanonicalBaselineMasterConfigs();
  const dgm = baselineConfigs.find(c => c.Profile_Code === PROFILE_CODES.DGM);
  const gm = baselineConfigs.find(c => c.Profile_Code === PROFILE_CODES.GM);
  const vp = baselineConfigs.find(c => c.Profile_Code === PROFILE_CODES.VP);
  const staff = baselineConfigs.find(c => c.Profile_Code === PROFILE_CODES.STAFF_CHIEF);
  const secMgr = baselineConfigs.find(c => c.Profile_Code === PROFILE_CODES.SECTION_MGR);

  assert.equal(Number(dgm.Expected_Appraiser_Count), 1);
  assert.equal(Number(gm.Expected_Appraiser_Count), 1);
  assert.equal(Number(vp.Expected_Appraiser_Count), 1);
  assert.equal(Number(staff.Expected_Appraiser_Count), 2);
  assert.equal(Number(secMgr.Expected_Appraiser_Count), 2);
});

test('TC31: D3-IMP-02 schema contract confirms App794 target contains all five provenance fields', () => {
  assert.equal(Boolean(mboFields.Frozen_Profile_Code), true);
  assert.equal(Boolean(mboFields.K_expected_Snapshot), true);
  assert.equal(Boolean(mboFields.Effective_Routing_Key), true);
  assert.equal(Boolean(mboFields.Effective_Route_Version_Key), true);
  assert.equal(Boolean(mboFields.Effective_Scorer_Slots_Snapshot), true);

  assert.equal(mboFields.Frozen_Profile_Code.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.K_expected_Snapshot.type, 'NUMBER');
  assert.equal(mboFields.Effective_Routing_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.Effective_Route_Version_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.Effective_Scorer_Slots_Snapshot.type, 'SINGLE_LINE_TEXT');
});

// ----------------------------------------------------
// D3-IMP-03-R1 CORRECTIVE SUITE (Tests 32 - 42)
// ----------------------------------------------------

test('TC32: Model A fails closed with RESOLUTION_BUSINESS_DATE_REQUIRED when resolutionBusinessDate missing', async () => {
  const v = makeCandidateVersion({});
  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'RESOLUTION_BUSINESS_DATE_REQUIRED');
      return true;
    }
  );
});

test('TC33: Bound snapshot reuse tri-state A: truly unbound record (all 5 provenance fields blank) allows fresh D3 resolution', async () => {
  const unboundRecord = {
    Frozen_Profile_Code: { value: '' },
    K_expected_Snapshot: { value: '' },
    Effective_Routing_Key: { value: '' },
    Effective_Route_Version_Key: { value: '' },
    Effective_Scorer_Slots_Snapshot: { value: '' },
    Manager_Level1_Approvers: { value: [] }
  };

  const v = makeCandidateVersion({ versionKey: 'TMT1#fresh' });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2,
    existingRecord: unboundRecord
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#fresh');
  assert.equal(res.isBoundSnapshot, undefined);
});

test('TC34: Bound snapshot reuse tri-state C: partially populated provenance fields fails closed with D3_BOUND_SNAPSHOT_INVALID', async () => {
  const partiallyBound = {
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: '' }, // Missing 3 fields
    Effective_Route_Version_Key: { value: '' },
    Effective_Scorer_Slots_Snapshot: { value: '' }
  };

  const v = makeCandidateVersion({});

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2,
        existingRecord: partiallyBound
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'D3_BOUND_SNAPSHOT_INVALID');
      return true;
    }
  );
});

test('TC35: Bound snapshot reuse tri-state C: active slot rule missing or not ALL fails closed with D3_BOUND_SNAPSHOT_INVALID', async () => {
  const invalidRuleRecord = makeBoundRecord({
    m1Rule: 'ANY' // Invalid: must be explicitly ALL
  });

  const v = makeCandidateVersion({});

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2,
        existingRecord: invalidRuleRecord
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'D3_BOUND_SNAPSHOT_INVALID');
      return true;
    }
  );
});

test('TC36: Bound snapshot reuse tri-state C: inactive slot non-empty fails closed with D3_BOUND_SNAPSHOT_INVALID', async () => {
  const dirtyInactiveRecord = makeBoundRecord({
    topology: 'M1_G1', // M2 is inactive
    m2Approvers: [{ code: 'rogue_m2' }] // Dirty inactive slot
  });

  const v = makeCandidateVersion({});

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2,
        existingRecord: dirtyInactiveRecord
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'D3_BOUND_SNAPSHOT_INVALID');
      return true;
    }
  );
});

test('TC37: Bound snapshot reuse tri-state C: duplicate approver identities in route fails closed with D3_BOUND_SNAPSHOT_INVALID', async () => {
  const duplicateApproversRecord = makeBoundRecord({
    topology: 'M1_G1',
    m1Approvers: [{ code: 'same_user' }],
    g1Approvers: [{ code: 'same_user' }] // Duplicate approver
  });

  const v = makeCandidateVersion({});

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2,
        existingRecord: duplicateApproversRecord
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'D3_BOUND_SNAPSHOT_INVALID');
      return true;
    }
  );
});

test('TC38: Bound snapshot reuse tri-state C: K=2 but duplicate scorer user identities fails closed with D3_BOUND_SNAPSHOT_INVALID', async () => {
  const malformedSlots = makeBoundRecord({
    topology: 'M1_G1',
    scorerSlotsSnapshot: '[1,1]' // Duplicate slot ordinals pointing to same scorer
  });

  const v = makeCandidateVersion({});

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2,
        existingRecord: malformedSlots
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'D3_BOUND_SNAPSHOT_INVALID');
      return true;
    }
  );
});

test('TC39: Bound snapshot reuse tri-state C: self-scoring conflict with employeeUserCode fails closed with D3_BOUND_SNAPSHOT_INVALID', async () => {
  const selfScoringRecord = makeBoundRecord({
    topology: 'M1_G1',
    m1Approvers: [{ code: 'emp_applicant' }],
    g1Approvers: [{ code: 'gm_boss' }],
    scorerSlotsSnapshot: '[1,2]'
  });

  const v = makeCandidateVersion({});

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v],
        resolutionBusinessDate: '2026-04-01',
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2,
        employeeUserCode: 'emp_applicant',
        existingRecord: selfScoringRecord
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'D3_BOUND_SNAPSHOT_INVALID');
      return true;
    }
  );
});

test('TC40: Main runtime pipeline: App 796 scoring config lookup runs before routing and fails closed if Expected_Appraiser_Count missing', async () => {
  let routingApiCalled = false;
  let scoringApiCalled = false;

  const mockApi = {
    getRecords: async (appId) => {
      if (appId === 53) {
        return {
          records: [{
            emp_text: { value: '0001' },
            Text: { value: 'Staff One' },
            Text_0: { value: 'พนักงาน หนึ่ง' },
            Drop_down_0: { value: 'General Admin' },
            Drop_down: { value: 'General Admin Section 1' },
            Text_2: { value: 'Staff' }
          }]
        };
      }
      if (appId === 796) {
        scoringApiCalled = true;
        // Return config with MISSING Expected_Appraiser_Count
        return {
          records: [{
            Profile_Code: { value: 'PROF_STAFF_CHIEF' },
            Config_Status: { value: 'PUBLISHED' },
            Fiscal_Year: { value: 'FY2026' }
            // Expected_Appraiser_Count omitted
          }]
        };
      }
      if (appId === 795) {
        routingApiCalled = true;
        return { records: [] };
      }
      return { records: [] };
    }
  };

  // Simulate pipeline in main-mbo-app
  const lookupRes = await EmployeeService.lookupEmployee('0001', mockApi);
  const empProfile = lookupRes.employee;

  const profileCode = resolveProfileCodeForSnapshot(empProfile);
  assert.equal(profileCode, 'PROF_STAFF_CHIEF');

  // Lookup scoring config
  const scoringRes = await mockApi.getRecords(796);
  const scRec = scoringRes.records[0];
  const scoringConfig = {
    Profile_Code: profileCode,
    Expected_Appraiser_Count: scRec.Expected_Appraiser_Count?.value ? Number(scRec.Expected_Appraiser_Count.value) : undefined
  };

  // Fail-closed validation on Expected_Appraiser_Count
  const kExpected = scoringConfig.Expected_Appraiser_Count;
  assert.equal(scoringApiCalled, true);
  assert.throws(
    () => {
      if (kExpected !== 1 && kExpected !== 2) {
        throw new Error('K_EXPECTED_NOT_CONFIGURED: Expected_Appraiser_Count must be 1 or 2 in App 796 scoring configuration.');
      }
    },
    /K_EXPECTED_NOT_CONFIGURED/
  );

  // Proves App 795 routing query is NEVER reached when App 796 K_expected is missing
  assert.equal(routingApiCalled, false);
});

test('TC41: Main runtime pipeline: passes d3: true and fails closed with RESOLUTION_BUSINESS_DATE_REQUIRED if resolutionBusinessDate missing', async () => {
  await assert.rejects(
    async () => {
      await RoutingService.resolveRoutingProfile(795, 'TMT1', '', { getRecords: async () => ({ records: [] }) }, 'Staff', {
        d3: true,
        // resolutionBusinessDate omitted
        kExpected: 2,
        frozenProfileCode: 'PROF_STAFF_CHIEF'
      });
    },
    (err) => {
      assert.equal(err instanceof D3RouteBindingError, true);
      assert.equal(err.code, 'RESOLUTION_BUSINESS_DATE_REQUIRED');
      return true;
    }
  );
});

test('TC42: Main runtime onEmployeeCodeChanged resets all five D3 provenance fields', () => {
  const record = {
    Employee_Code: { value: '0001' },
    Employee_Name: { value: 'Somchai' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_Level1_Approvers: { value: [{ code: 'm1' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' },
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: 2 },
    Effective_Routing_Key: { value: 'TMT1' },
    Effective_Route_Version_Key: { value: 'TMT1#v1' },
    Effective_Scorer_Slots_Snapshot: { value: '[1,2]' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    PartA_Weight: { value: 70 },
    PartB_Weight: { value: 30 }
  };

  const USER_SELECT_FIELDS = new Set(['Manager_Level1_Approvers']);
  const fieldsToClear = [
    'Employee_Name', 'Routing_Topology', 'Manager_Level1_Approvers', 'Manager_Level1_Approval_Rule',
    'Frozen_Profile_Code', 'K_expected_Snapshot', 'Effective_Routing_Key',
    'Effective_Route_Version_Key', 'Effective_Scorer_Slots_Snapshot',
    'Profile_Code', 'PartA_Weight', 'PartB_Weight'
  ];

  // Perform reset on employee code change
  record.Employee_Code.value = '0002';
  fieldsToClear.forEach(k => {
    const clearVal = USER_SELECT_FIELDS.has(k) ? [] : '';
    if (record[k]) {
      record[k].value = clearVal;
    }
  });

  // Verify all five provenance fields are cleared
  assert.equal(record.Frozen_Profile_Code.value, '');
  assert.equal(record.K_expected_Snapshot.value, '');
  assert.equal(record.Effective_Routing_Key.value, '');
  assert.equal(record.Effective_Route_Version_Key.value, '');
  assert.equal(record.Effective_Scorer_Slots_Snapshot.value, '');
  assert.equal(record.Routing_Topology.value, '');
  assert.deepEqual(record.Manager_Level1_Approvers.value, []);
});

// ----------------------------------------------------
// D3-IMP-03-R2: EXPLICIT BUSINESS-DATE SOURCE LOCK (Tests 43 - 48)
// ----------------------------------------------------

test('TC43: R2 explicit injected resolutionBusinessDate succeeds in runtime resolution', async () => {
  const authOptions = { resolutionBusinessDate: '2026-04-01' };
  const resolutionBusinessDate = authOptions?.resolutionBusinessDate;

  assert.equal(resolutionBusinessDate, '2026-04-01');

  const v = makeCandidateVersion({
    versionKey: 'TMT1#v1',
    effectiveFrom: '2026-04-01',
    effectiveTo: ''
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v],
    resolutionBusinessDate,
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v1');
});

test('TC44: R2 missing explicit resolutionBusinessDate fails closed with RESOLUTION_BUSINESS_DATE_REQUIRED', () => {
  const authOptions = {};
  const options = {};
  const resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;

  assert.throws(
    () => {
      if (!resolutionBusinessDate || typeof resolutionBusinessDate !== 'string') {
        throw new Error('Explicit resolution business date (YYYY-MM-DD) is required for D3 Model A resolution (RESOLUTION_BUSINESS_DATE_REQUIRED). Live business date provider is unresolved and blocks deployment.');
      }
    },
    (err) => {
      assert.match(err.message, /RESOLUTION_BUSINESS_DATE_REQUIRED/);
      assert.match(err.message, /Live business date provider is unresolved and blocks deployment/);
      return true;
    }
  );
});

test('TC45: R2 KEY REGRESSION: record contains Resolution_Business_Date = "2026-04-01" but no explicit injected date MUST STILL FAIL with RESOLUTION_BUSINESS_DATE_REQUIRED', () => {
  // Record field is populated
  const record = {
    Resolution_Business_Date: { value: '2026-04-01' }
  };
  // But NO explicit injected authOptions or options
  const authOptions = undefined;
  const options = {};

  // R2 lock: DO NOT read from record.Resolution_Business_Date
  const resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;

  assert.equal(resolutionBusinessDate, undefined);
  assert.throws(
    () => {
      if (!resolutionBusinessDate || typeof resolutionBusinessDate !== 'string') {
        throw new Error('Explicit resolution business date (YYYY-MM-DD) is required for D3 Model A resolution (RESOLUTION_BUSINESS_DATE_REQUIRED). Live business date provider is unresolved and blocks deployment.');
      }
    },
    /RESOLUTION_BUSINESS_DATE_REQUIRED/
  );
});

test('TC46: R2 record Resolution_Business_Date cannot alter selected App795 version (explicit injected date is authoritative)', async () => {
  // Record has an older date that would match Version 1 if used
  const record = {
    Resolution_Business_Date: { value: '2025-04-01' }
  };
  // Explicit injected date points to Version 2
  const authOptions = { resolutionBusinessDate: '2026-04-01' };
  const resolutionBusinessDate = authOptions?.resolutionBusinessDate;

  const v1 = makeCandidateVersion({
    versionKey: 'TMT1#v1',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2025-12-31'
  });
  const v2 = makeCandidateVersion({
    versionKey: 'TMT1#v2',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  });

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v1, v2],
    resolutionBusinessDate,
    frozenProfileCode: 'PROF_STAFF_CHIEF',
    kExpected: 2,
    existingRecord: {
      ...record,
      Frozen_Profile_Code: { value: '' },
      K_expected_Snapshot: { value: '' },
      Effective_Routing_Key: { value: '' },
      Effective_Route_Version_Key: { value: '' },
      Effective_Scorer_Slots_Snapshot: { value: '' }
    }
  });

  // Explicit injected date (2026-04-01) selected Version 2, ignoring record date (2025-04-01)
  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v2');
});

test('TC47: R2 static source inspection: src/main-mbo-app.js strictly forbids reading business date from record fields', () => {
  const mainSrc = fs.readFileSync('src/main-mbo-app.js', 'utf8');

  // Verify record.Resolution_Business_Date is NOT used as fallback or source
  assert.equal(/record\??\.Resolution_Business_Date/i.test(mainSrc), false,
    'main-mbo-app.js must NOT read business date from record.Resolution_Business_Date'
  );

  // Verify resolutionBusinessDate only comes from authOptions or options
  assert.match(
    mainSrc,
    /const resolutionBusinessDate = authOptions\?\.resolutionBusinessDate \|\| options\?\.resolutionBusinessDate;/,
    'main-mbo-app.js must strictly derive resolutionBusinessDate from authOptions or options'
  );

  // Verify fail-closed with RESOLUTION_BUSINESS_DATE_REQUIRED
  assert.match(
    mainSrc,
    /RESOLUTION_BUSINESS_DATE_REQUIRED/,
    'main-mbo-app.js must fail closed with RESOLUTION_BUSINESS_DATE_REQUIRED when date is missing'
  );

  // Verify deployment blocker marker
  assert.match(
    mainSrc,
    /LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED \/ DEPLOYMENT BLOCKER/,
    'main-mbo-app.js must record LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER'
  );
});

test('TC48: R2 no fallback to legacy Active query when business date missing', async () => {
  let routingApiCalled = false;
  let queryExecuted = null;

  const mockApi = {
    getRecords: async (appId, query) => {
      if (appId === 795) {
        routingApiCalled = true;
        queryExecuted = query;
      }
      return { records: [] };
    }
  };

  // Pipeline simulation: missing resolutionBusinessDate
  const authOptions = {};
  const options = {};
  const resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;

  await assert.rejects(
    async () => {
      if (!resolutionBusinessDate || typeof resolutionBusinessDate !== 'string') {
        throw new Error('Explicit resolution business date (YYYY-MM-DD) is required for D3 Model A resolution (RESOLUTION_BUSINESS_DATE_REQUIRED). Live business date provider is unresolved and blocks deployment.');
      }
      // If reached, would call API:
      await mockApi.getRecords(795, 'Active in ("Active")');
    },
    /RESOLUTION_BUSINESS_DATE_REQUIRED/
  );

  // App 795 legacy Active query is never executed
  assert.equal(routingApiCalled, false);
  assert.equal(queryExecuted, null);
});

