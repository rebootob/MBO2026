import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RoutingService,
  D3RouteBindingError,
  D3RouteVersionResolutionError,
  D3RouteViabilityError,
  D3RouteContractError
} from '../src/services/routing-service.js';
import {
  resolveExpectedAppraiserCount,
  resolveProfileCodeForSnapshot,
  PROFILE_CODES
} from '../src/profiles/runtime-profile-resolver.js';
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v2');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'mgr_v2');

  const resPast = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [v1, v2],
    resolutionBusinessDate: '2025-10-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
        frozenProfileCode: 'PROF_STAFF_CHIEF'
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
        frozenProfileCode: 'PROF_STAFF_CHIEF'
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
        frozenProfileCode: 'PROF_STAFF_CHIEF'
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
        frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    employeeSnapshot: empSnapshot
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
    frozenProfileCode: 'PROF_DGM'
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
    frozenProfileCode: 'PROF_SECTION_MGR'
  });

  assert.equal(res.K_expected_Snapshot, 2);
  assert.equal(res.Effective_Scorer_Slots_Snapshot, '[1,2]');
});

test('TC11: missing/invalid K fails closed', async () => {
  const v = makeCandidateVersion({});

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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    isOwnMbo: true
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
    isOwnMbo: true
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
        frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
  });

  assert.equal(res.Effective_Routing_Key, 'TMG2|Production');
});

test('TC20: Effective_Route_Version_Key exact selected Version_Key', async () => {
  const v = makeCandidateVersion({ routingKey: 'TMG2|Production', versionKey: 'TMG2|Production#v4' });
  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMG2|Production',
    candidateRecords: [v],
    resolutionBusinessDate: '2026-04-01',
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
  const boundRecord = {
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: 'TMT1' },
    Effective_Route_Version_Key: { value: 'TMT1#v1' },
    Effective_Scorer_Slots_Snapshot: { value: '[1,2]' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_Level1_Approvers: { value: [{ code: 'mgr_v1' }] },
    GM_Level1_Approvers: { value: [{ code: 'gm_v1' }] }
  };

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
    isStageBoundary: false
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v1');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'mgr_v1');
  assert.equal(res.inFlightImmutable, true);
});

test('TC25: no implicit calendar-driven re-resolution for in-flight record', async () => {
  const boundRecord = {
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: 'TMT1' },
    Effective_Route_Version_Key: { value: 'TMT1#v1' },
    Effective_Scorer_Slots_Snapshot: { value: '[1,2]' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_Level1_Approvers: { value: [{ code: 'mgr_v1' }] },
    GM_Level1_Approvers: { value: [{ code: 'gm_v1' }] }
  };

  const res = await RoutingService.resolveD3RoutingProfile({
    routingKey: 'TMT1',
    candidateRecords: [],
    resolutionBusinessDate: '2027-04-01',
    existingRecord: boundRecord,
    isStageBoundary: false
  });

  assert.equal(res.Effective_Route_Version_Key, 'TMT1#v1');
});

test('TC26: next-stage rebind without prior-stage archive-success evidence fails closed', async () => {
  const boundRecord = {
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: 'TMT1' },
    Effective_Route_Version_Key: { value: 'TMT1#v1' },
    Effective_Scorer_Slots_Snapshot: { value: '[1,2]' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_Level1_Approvers: { value: [{ code: 'mgr_v1' }] },
    GM_Level1_Approvers: { value: [{ code: 'gm_v1' }] }
  };

  const v2 = makeCandidateVersion({ versionKey: 'TMT1#v2' });

  await assert.rejects(
    async () => {
      await RoutingService.resolveD3RoutingProfile({
        routingKey: 'TMT1',
        candidateRecords: [v2],
        resolutionBusinessDate: '2026-10-01',
        existingRecord: boundRecord,
        isStageBoundary: true,
        priorStageArchiveVerified: false
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
  const boundRecord = {
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: 'TMT1' },
    Effective_Route_Version_Key: { value: 'TMT1#v1' },
    Effective_Scorer_Slots_Snapshot: { value: '[1,2]' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_Level1_Approvers: { value: [{ code: 'mgr_v1' }] },
    GM_Level1_Approvers: { value: [{ code: 'gm_v1' }] }
  };

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
    frozenProfileCode: 'PROF_STAFF_CHIEF'
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
    frozenProfileCode: 'PROF_DGM'
  });

  assert.equal(res.Routing_Topology, 'M1_ONLY');
  assert.equal(res.K_expected_Snapshot, 1);
  assert.equal(res.Effective_Scorer_Slots_Snapshot, '[1]');
  assert.equal(res.Manager_Level1_Approvers[0].code, 'president');
});

test('TC30: D3-IMP-01 focused contracts remain PASS', () => {
  assert.equal(resolveExpectedAppraiserCount(PROFILE_CODES.DGM), 1);
  assert.equal(resolveExpectedAppraiserCount(PROFILE_CODES.GM), 1);
  assert.equal(resolveExpectedAppraiserCount(PROFILE_CODES.VP), 1);
  assert.equal(resolveExpectedAppraiserCount(PROFILE_CODES.STAFF_CHIEF), 2);
  assert.equal(resolveExpectedAppraiserCount(PROFILE_CODES.SECTION_MGR), 2);
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
