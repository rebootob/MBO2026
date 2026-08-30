import test from 'node:test';
import assert from 'node:assert/strict';
import { MboIdentityService } from '../src/services/mbo-identity-service.js';
import { RoutingService } from '../src/services/routing-service.js';

// --- FINDING A: CANONICAL APP53 MAPPING RESOLVER TESTS ---

test('D1 Hybrid Identity: Vassana valid dedicated mapping resolves to canonical emp_text 0044', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana', name: 'Ms.Vassana Maenthong' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_BOUND');
  assert.equal(res.employeeCode, '0044');
  assert.equal(res.kintoneUserCode, 'vassana');
  assert.equal(res.recordId, '456');
});

test('Finding A: Account_Status without Number_0 fails closed in canonical resolver', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Account_Status: 'ACTIVE',
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('Finding A: Missing Number_0 fails closed in canonical resolver', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('Finding A: Kintone_User_Code without MBO_Kintone_User fails closed in canonical resolver', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      Kintone_User_Code: 'vassana',
      emp_text: { value: '0044' }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('Finding A: Employee_Code without emp_text fails closed in canonical resolver', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      Employee_Code: '0044',
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_INVALID_CANONICAL_CODE');
});

test('Finding A: USER_SELECT item with only .value but no .code fails closed in canonical resolver', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ value: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('Finding A: Kintone user input with leading/trailing whitespace fails closed in canonical resolver', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: ' vassana ',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
  assert.equal(res.reason, 'KINTONE_USER_CODE_HAS_WHITESPACE');
});

test('Finding A: Selected code comparison is case-sensitive and fails closed on case mismatch', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'Vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('Finding A: Malformed/invalid canonical emp_text fails closed', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '1' },
      emp_text: { value: 'INVALID_EMP_CODE!@#' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_INVALID_CANONICAL_CODE');
});

test('D1 Hybrid Identity: Natta dedicated mapping with blank emp_text fails closed without guessing Number=243', () => {
  const userMappings = [
    {
      $id: { value: '578' },
      Number: { value: 243 },
      Number_0: { value: '1' },
      emp_text: { value: '' },
      Text_4: { value: 'natta@example.com' },
      Text_6: { value: 'VEND-243' },
      MBO_Kintone_User: { value: [{ code: 'natta', name: 'Ms.Natta Niphatthakosolsuk' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'natta',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_INVALID_CANONICAL_CODE');
  assert.equal(res.employeeCode, undefined);
});

test('D1 Hybrid Identity: admin-form technical admin identity is denied from binding Employee-Self', () => {
  const userMappings = [
    {
      $id: { value: '1' },
      Number_0: { value: '1' },
      emp_text: { value: '0001' },
      MBO_Kintone_User: { value: [{ code: 'admin-form' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'admin-form',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
  assert.equal(res.reason, 'TECHNICAL_ADMIN_CANNOT_BIND_EMPLOYEE_SELF');
});

test('D1 Hybrid Identity: inactive mapping (Number_0 = 0) fails closed', () => {
  const userMappings = [
    {
      $id: { value: '456' },
      Number_0: { value: '0' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('D1 Hybrid Identity: USER_SELECT array with >1 users fails closed', () => {
  const userMappings = [
    {
      $id: { value: '100' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }, { code: 'other_user' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_MISSING');
});

test('D1 Hybrid Identity: duplicate active mapping records for same user returns IDENTITY_MAPPING_AMBIGUOUS', () => {
  const userMappings = [
    {
      $id: { value: '101' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    },
    {
      $id: { value: '102' },
      Number_0: { value: '1' },
      emp_text: { value: '0044' },
      MBO_Kintone_User: { value: [{ code: 'vassana' }] }
    }
  ];

  const res = MboIdentityService.resolveDedicatedKintoneUserMapping({
    kintoneUserCode: 'vassana',
    userMappings
  });

  assert.equal(res.status, 'IDENTITY_MAPPING_AMBIGUOUS');
});

// --- FINDING B & D: EFFECTIVE REQUESTER RESOLUTION TESTS ---

test('Finding B: resolveEffectiveRequesterUser rejects invalid or missing mode', () => {
  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'UNKNOWN_MODE',
      kintoneUserCode: 'vassana',
      routeRequesterUsers: [{ code: 'vassana' }]
    });
  }, /INVALID_REQUESTER_MODE/);

  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'dedicated',
      kintoneUserCode: 'vassana',
      routeRequesterUsers: [{ code: 'vassana' }]
    });
  }, /INVALID_REQUESTER_MODE/);
});

test('Finding B: resolveEffectiveRequesterUser rejects whitespace in DEDICATED user code', () => {
  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'DEDICATED',
      kintoneUserCode: ' vassana ',
      routeRequesterUsers: []
    });
  }, /KINTONE_USER_CODE_HAS_WHITESPACE/);
});

test('Finding D: SHARED requester comparison normalizes case for compatibility while unauthorized principal remains denied', () => {
  // Case-insensitive SHARED match (F1 vs f1)
  const sharedCaseInsensitive = RoutingService.resolveEffectiveRequesterUser({
    mode: 'SHARED',
    kintoneUserCode: 'F1', // Uppercase input!
    routeRequesterUsers: [{ code: 'f1' }, { code: 'f2' }] // Lowercase in route
  });
  assert.deepEqual(sharedCaseInsensitive, [{ code: 'f1' }, { code: 'f2' }]);

  // Unauthorized SHARED principal remains denied
  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'SHARED',
      kintoneUserCode: 'unauthorized_user',
      routeRequesterUsers: [{ code: 'f1' }]
    });
  }, /not authorized to create an MBO for this target/);
});

test('D1 Hybrid Identity: resolveEffectiveRequesterUser returns dedicated user in DEDICATED mode and validates SHARED mode', () => {
  const dedicated = RoutingService.resolveEffectiveRequesterUser({
    mode: 'DEDICATED',
    kintoneUserCode: 'vassana',
    routeRequesterUsers: [{ code: 'f1' }]
  });
  assert.deepEqual(dedicated, [{ code: 'vassana' }]);

  const sharedValid = RoutingService.resolveEffectiveRequesterUser({
    mode: 'SHARED',
    kintoneUserCode: 'f1',
    routeRequesterUsers: [{ code: 'f1' }, { code: 'f2' }]
  });
  assert.deepEqual(sharedValid, [{ code: 'f1' }, { code: 'f2' }]);

  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'DEDICATED',
      kintoneUserCode: 'admin-form',
      routeRequesterUsers: []
    });
  }, /Technical admin identity \(admin-form\) cannot create MBO records/);
});

// --- FINDING C & E: OWN-MBO SELF-APPRAISER ELISION TESTS ---

test('D1 Hybrid Identity Mandatory Natta Test: own-MBO self-appraiser elision transforms natta->uchida (M1_G1) to uchida (M1_ONLY)', () => {
  const masterRoute = {
    Routing_Key: 'TMG1|Marketing',
    Manager_Level1_Approvers: [{ code: 'natta' }],
    Manager_User: [{ code: 'natta' }],
    Manager_Level1_Approval_Rule: 'ALL',
    Manager_Level2_Approvers: [],
    First_Manager_User: [],
    GM_Level1_Approvers: [{ code: 'uchida' }],
    GM_User: [{ code: 'uchida' }],
    GM_Level1_Approval_Rule: 'ALL',
    GM_Level2_Approvers: [],
    Has_Manager_Level2: 'No',
    Has_GM_Level2: 'No',
    Routing_Topology: 'M1_G1'
  };

  const effOwnRoute = RoutingService.applyOwnMboSelfAppraiserElision(masterRoute, 'natta', true);

  assert.deepEqual(effOwnRoute.Manager_User, [{ code: 'uchida' }]);
  assert.deepEqual(effOwnRoute.Manager_Level1_Approvers, [{ code: 'uchida' }]);
  assert.equal(effOwnRoute.Manager_Level1_Approval_Rule, 'ALL');
  assert.deepEqual(effOwnRoute.GM_User, []);
  assert.deepEqual(effOwnRoute.GM_Level1_Approvers, []);
  assert.equal(effOwnRoute.Routing_Topology, 'M1_ONLY');
  assert.equal(effOwnRoute.selfAppraiserElided, true);

  // Input master route object MUST NOT be mutated!
  assert.deepEqual(masterRoute.Manager_User, [{ code: 'natta' }]);
  assert.deepEqual(masterRoute.GM_User, [{ code: 'uchida' }]);
  assert.equal(masterRoute.Routing_Topology, 'M1_G1');

  // Subordinate MBO (isOwnMbo = false)
  const effSubordinateRoute = RoutingService.applyOwnMboSelfAppraiserElision(masterRoute, 'natta', false);
  assert.deepEqual(effSubordinateRoute.Manager_User, [{ code: 'natta' }]);
  assert.deepEqual(effSubordinateRoute.GM_User, [{ code: 'uchida' }]);
  assert.equal(effSubordinateRoute.Routing_Topology, 'M1_G1');
});

test('Finding E: generic 3 surviving slots transformation (M1_M2_G1)', () => {
  const master4SlotRoute = {
    Routing_Key: 'GENERIC_4SLOT_3SURVIVE',
    Manager_Level1_Approvers: [{ code: 'user1' }],
    Manager_User: [{ code: 'user1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    Manager_Level2_Approvers: [{ code: 'natta' }], // Self sole occupant of Slot 2!
    First_Manager_User: [{ code: 'natta' }],
    Manager_Level2_Approval_Rule: 'AT_LEAST_ONE',
    GM_Level1_Approvers: [{ code: 'user3' }],
    GM_User: [{ code: 'user3' }],
    GM_Level1_Approval_Rule: 'ANY',
    GM_Level2_Approvers: [{ code: 'user4' }],
    GM_Level2_Approval_Rule: 'ALL',
    Has_Manager_Level2: 'Yes',
    Has_GM_Level2: 'Yes',
    Routing_Topology: 'M1_M2_G1_G2'
  };

  const res = RoutingService.applyOwnMboSelfAppraiserElision(master4SlotRoute, 'natta', true);

  assert.equal(res.selfAppraiserElided, true);
  // Slot 1 (user1) -> Manager_Level1, rule ALL
  assert.deepEqual(res.Manager_Level1_Approvers, [{ code: 'user1' }]);
  assert.deepEqual(res.Manager_User, [{ code: 'user1' }]);
  assert.equal(res.Manager_Level1_Approval_Rule, 'ALL');

  // Slot 2 (natta) dropped. Original Slot 3 (user3) shifted to Manager_Level2, rule ANY
  assert.deepEqual(res.Manager_Level2_Approvers, [{ code: 'user3' }]);
  assert.deepEqual(res.First_Manager_User, [{ code: 'user3' }]);
  assert.equal(res.Manager_Level2_Approval_Rule, 'ANY');

  // Original Slot 4 (user4) shifted to GM_Level1, rule ALL
  assert.deepEqual(res.GM_Level1_Approvers, [{ code: 'user4' }]);
  assert.deepEqual(res.GM_User, [{ code: 'user4' }]);
  assert.equal(res.GM_Level1_Approval_Rule, 'ALL');

  // G2 position empty
  assert.deepEqual(res.GM_Level2_Approvers, []);

  // Topology flags
  assert.equal(res.Routing_Topology, 'M1_M2_G1');
  assert.equal(res.Has_Manager_Level2, 'Yes');
  assert.equal(res.Has_GM_Level2, 'No');

  // Input object MUST NOT be mutated!
  assert.deepEqual(master4SlotRoute.Manager_Level2_Approvers, [{ code: 'natta' }]);
  assert.equal(master4SlotRoute.Routing_Topology, 'M1_M2_G1_G2');
});

test('Finding E: generic 4 surviving slots transformation (M1_M2_G1_G2)', () => {
  const master4SlotRoute = {
    Routing_Key: 'GENERIC_4SLOT_4SURVIVE',
    Manager_Level1_Approvers: [{ code: 'natta' }, { code: 'co_manager' }], // Self shares Slot 1!
    Manager_User: [{ code: 'natta' }, { code: 'co_manager' }],
    Manager_Level1_Approval_Rule: 'ANY',
    Manager_Level2_Approvers: [{ code: 'mgr2' }],
    First_Manager_User: [{ code: 'mgr2' }],
    Manager_Level2_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'gm1' }],
    GM_User: [{ code: 'gm1' }],
    GM_Level1_Approval_Rule: 'AT_LEAST_ONE',
    GM_Level2_Approvers: [{ code: 'gm2' }],
    GM_Level2_Approval_Rule: 'ALL',
    Has_Manager_Level2: 'Yes',
    Has_GM_Level2: 'Yes',
    Routing_Topology: 'M1_M2_G1_G2'
  };

  const res = RoutingService.applyOwnMboSelfAppraiserElision(master4SlotRoute, 'natta', true);

  assert.equal(res.selfAppraiserElided, true);

  // Slot 1 retains co_manager and carries rule ANY
  assert.deepEqual(res.Manager_Level1_Approvers, [{ code: 'co_manager' }]);
  assert.deepEqual(res.Manager_User, [{ code: 'co_manager' }]);
  assert.equal(res.Manager_Level1_Approval_Rule, 'ANY');

  // Slot 2 retains mgr2 and carries rule ALL
  assert.deepEqual(res.Manager_Level2_Approvers, [{ code: 'mgr2' }]);
  assert.deepEqual(res.First_Manager_User, [{ code: 'mgr2' }]);
  assert.equal(res.Manager_Level2_Approval_Rule, 'ALL');

  // Slot 3 retains gm1 and carries rule AT_LEAST_ONE
  assert.deepEqual(res.GM_Level1_Approvers, [{ code: 'gm1' }]);
  assert.deepEqual(res.GM_User, [{ code: 'gm1' }]);
  assert.equal(res.GM_Level1_Approval_Rule, 'AT_LEAST_ONE');

  // Slot 4 retains gm2 and carries rule ALL
  assert.deepEqual(res.GM_Level2_Approvers, [{ code: 'gm2' }]);
  assert.equal(res.GM_Level2_Approval_Rule, 'ALL');

  // Topology flags
  assert.equal(res.Routing_Topology, 'M1_M2_G1_G2');
  assert.equal(res.Has_Manager_Level2, 'Yes');
  assert.equal(res.Has_GM_Level2, 'Yes');

  // Input object MUST NOT be mutated!
  assert.deepEqual(master4SlotRoute.Manager_Level1_Approvers, [{ code: 'natta' }, { code: 'co_manager' }]);
  assert.equal(master4SlotRoute.Routing_Topology, 'M1_M2_G1_G2');
});

test('Finding C: ownMbo=true with missing or whitespace dedicated user fails closed', () => {
  const route = {
    Routing_Key: 'TMF1',
    Manager_User: [{ code: 'natta' }],
    GM_User: [{ code: 'uchida' }],
    Routing_Topology: 'M1_G1'
  };

  assert.throws(() => {
    RoutingService.applyOwnMboSelfAppraiserElision(route, '', true);
  }, /MISSING_DEDICATED_USER_CODE/);

  assert.throws(() => {
    RoutingService.applyOwnMboSelfAppraiserElision(route, ' natta ', true);
  }, /KINTONE_USER_CODE_HAS_WHITESPACE/);
});

test('Finding C: self-appraiser elision uses exact case-sensitive user code comparison', () => {
  const route = {
    Routing_Key: 'TMF1',
    Manager_User: [{ code: 'Natta' }],
    GM_User: [{ code: 'uchida' }],
    Routing_Topology: 'M1_G1'
  };

  const res = RoutingService.applyOwnMboSelfAppraiserElision(route, 'natta', true);
  assert.equal(res.selfAppraiserElided, false);
  assert.deepEqual(res.Manager_User, [{ code: 'Natta' }]);
});

test('Finding C: multi-user slot preserves surviving users in same slot without creating extra workflow level', () => {
  const route = {
    Routing_Key: 'TMG1|Marketing',
    Manager_Level1_Approvers: [{ code: 'natta' }, { code: 'somebody_else' }],
    Manager_User: [{ code: 'natta' }, { code: 'somebody_else' }],
    Manager_Level1_Approval_Rule: 'ANY',
    GM_Level1_Approvers: [{ code: 'uchida' }],
    GM_User: [{ code: 'uchida' }],
    GM_Level1_Approval_Rule: 'ALL',
    Routing_Topology: 'M1_G1'
  };

  const res = RoutingService.applyOwnMboSelfAppraiserElision(route, 'natta', true);

  assert.equal(res.selfAppraiserElided, true);
  assert.deepEqual(res.Manager_User, [{ code: 'somebody_else' }]);
  assert.equal(res.Manager_Level1_Approval_Rule, 'ANY');
  assert.deepEqual(res.GM_User, [{ code: 'uchida' }]);
  assert.equal(res.GM_Level1_Approval_Rule, 'ALL');
  assert.equal(res.Routing_Topology, 'M1_G1');
});

test('Finding C: surviving slot carries non-ALL approval rule when shifted', () => {
  const route = {
    Routing_Key: 'EXEC_ROUTE',
    Manager_Level1_Approvers: [{ code: 'natta' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'uchida' }, { code: 'vice_president' }],
    GM_User: [{ code: 'uchida' }, { code: 'vice_president' }],
    GM_Level1_Approval_Rule: 'AT_LEAST_ONE',
    Routing_Topology: 'M1_G1'
  };

  const res = RoutingService.applyOwnMboSelfAppraiserElision(route, 'natta', true);

  assert.equal(res.selfAppraiserElided, true);
  assert.deepEqual(res.Manager_User, [{ code: 'uchida' }, { code: 'vice_president' }]);
  assert.equal(res.Manager_Level1_Approval_Rule, 'AT_LEAST_ONE');
  assert.equal(res.Routing_Topology, 'M1_ONLY');
});

test('D1 Hybrid Identity: own-MBO with no self appraiser remains unchanged', () => {
  const route = {
    Routing_Key: 'TMF1',
    Manager_User: [{ code: 'f1' }],
    GM_User: [{ code: 'uchida' }],
    Routing_Topology: 'M1_G1'
  };

  const effRoute = RoutingService.applyOwnMboSelfAppraiserElision(route, 'vassana', true);
  assert.equal(effRoute.selfAppraiserElided, false);
  assert.deepEqual(effRoute.Manager_User, [{ code: 'f1' }]);
});

test('D1 Hybrid Identity: own-MBO with only self appraiser fails closed (NO_REMAINING_NON_SELF_APPROVER)', () => {
  const selfOnlyRoute = {
    Routing_Key: 'SOLO',
    Manager_Level1_Approvers: [{ code: 'natta' }],
    Manager_User: [{ code: 'natta' }],
    GM_Level1_Approvers: [],
    GM_User: [],
    Routing_Topology: 'M1_ONLY'
  };

  assert.throws(() => {
    RoutingService.applyOwnMboSelfAppraiserElision(selfOnlyRoute, 'natta', true);
  }, /NO_REMAINING_NON_SELF_APPROVER/);
});
