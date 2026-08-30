import test from 'node:test';
import assert from 'node:assert/strict';
import { MboIdentityService } from '../src/services/mbo-identity-service.js';
import { RoutingService } from '../src/services/routing-service.js';

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

test('D1 Hybrid Identity: Natta dedicated mapping with blank emp_text fails closed without guessing Number=243', () => {
  const userMappings = [
    {
      $id: { value: '578' },
      Number: { value: 243 }, // Record number is 243, but emp_text is blank!
      Number_0: { value: '1' },
      emp_text: { value: '' }, // Blank emp_text!
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
  assert.equal(res.employeeCode, undefined, 'Must NEVER return guessed Employee_Code (e.g. 243 or padded string)');
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
      Number_0: { value: '0' }, // Inactive!
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
      MBO_Kintone_User: { value: [{ code: 'vassana' }, { code: 'other_user' }] } // 2 users in array!
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

test('D1 Hybrid Identity: resolveEffectiveRequesterUser returns dedicated user in DEDICATED mode and validates SHARED mode', () => {
  // DEDICATED mode
  const dedicated = RoutingService.resolveEffectiveRequesterUser({
    mode: 'DEDICATED',
    kintoneUserCode: 'vassana',
    routeRequesterUsers: [{ code: 'f1' }]
  });
  assert.deepEqual(dedicated, [{ code: 'vassana' }]);

  // SHARED mode valid
  const sharedValid = RoutingService.resolveEffectiveRequesterUser({
    mode: 'SHARED',
    kintoneUserCode: 'f1',
    routeRequesterUsers: [{ code: 'f1' }, { code: 'f2' }]
  });
  assert.deepEqual(sharedValid, [{ code: 'f1' }, { code: 'f2' }]);

  // SHARED mode unauthorized
  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'SHARED',
      kintoneUserCode: 'unauthorized_user',
      routeRequesterUsers: [{ code: 'f1' }]
    });
  }, /not authorized to create an MBO for this target/);

  // admin-form denied in both modes
  assert.throws(() => {
    RoutingService.resolveEffectiveRequesterUser({
      mode: 'DEDICATED',
      kintoneUserCode: 'admin-form',
      routeRequesterUsers: []
    });
  }, /Technical admin identity \(admin-form\) cannot create MBO records/);
});

test('D1 Hybrid Identity Mandatory Natta Test: own-MBO self-appraiser elision transforms natta->uchida (M1_G1) to uchida (M1_ONLY)', () => {
  const masterRoute = {
    Routing_Key: 'TMG1|Marketing',
    Manager_Level1_Approvers: [{ code: 'natta' }],
    Manager_User: [{ code: 'natta' }],
    Manager_Level2_Approvers: [],
    First_Manager_User: [],
    GM_Level1_Approvers: [{ code: 'uchida' }],
    GM_User: [{ code: 'uchida' }],
    GM_Level2_Approvers: [],
    Has_Manager_Level2: 'No',
    Has_GM_Level2: 'No',
    Routing_Topology: 'M1_G1'
  };

  // Natta's own MBO (isOwnMbo = true)
  const effOwnRoute = RoutingService.applyOwnMboSelfAppraiserElision(masterRoute, 'natta', true);

  assert.deepEqual(effOwnRoute.Manager_User, [{ code: 'uchida' }]);
  assert.deepEqual(effOwnRoute.Manager_Level1_Approvers, [{ code: 'uchida' }]);
  assert.deepEqual(effOwnRoute.GM_User, []);
  assert.deepEqual(effOwnRoute.GM_Level1_Approvers, []);
  assert.equal(effOwnRoute.Routing_Topology, 'M1_ONLY');
  assert.equal(effOwnRoute.selfAppraiserElided, true);

  // Input master route object MUST NOT be mutated!
  assert.deepEqual(masterRoute.Manager_User, [{ code: 'natta' }]);
  assert.deepEqual(masterRoute.GM_User, [{ code: 'uchida' }]);
  assert.equal(masterRoute.Routing_Topology, 'M1_G1');

  // Subordinate / other employee MBO (isOwnMbo = false)
  const effSubordinateRoute = RoutingService.applyOwnMboSelfAppraiserElision(masterRoute, 'natta', false);
  assert.deepEqual(effSubordinateRoute.Manager_User, [{ code: 'natta' }]);
  assert.deepEqual(effSubordinateRoute.GM_User, [{ code: 'uchida' }]);
  assert.equal(effSubordinateRoute.Routing_Topology, 'M1_G1');
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
