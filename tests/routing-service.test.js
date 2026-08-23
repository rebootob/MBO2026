import test from 'node:test';
import assert from 'node:assert/strict';
import { RoutingService } from '../src/services/routing-service.js';

test('Routing Topology: M1_G1 when Manager L2 and GM L2 are blank (Pilot TME1)', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 'e1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'suthas' }] },
        Manager_Level1_Approval_Rule: { value: 'ANY' },
        Manager_Level2_Approvers: { value: [] },
        Manager_Level2_Approval_Rule: { value: 'ANY' },
        GM_Level1_Approvers: { value: [{ code: 'somrudee' }] },
        GM_Level1_Approval_Rule: { value: 'ANY' },
        GM_Level2_Approvers: { value: [] },
        GM_Level2_Approval_Rule: { value: 'ANY' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TME1', 'e1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_G1');
  assert.equal(routing.Has_Manager_Level2, 'No');
  assert.equal(routing.Has_GM_Level2, 'No');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'suthas');
  assert.equal(routing.GM_Level1_Approvers[0].code, 'somrudee');
});

test('Routing Topology: M1_M2_G1 when Manager L2 is present and GM L2 is blank', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 'f1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'kritsada' }] },
        Manager_Level1_Approval_Rule: { value: 'ANY' },
        Manager_Level2_Approvers: { value: [{ code: 'weerakul' }] },
        Manager_Level2_Approval_Rule: { value: 'ALL' },
        GM_Level1_Approvers: { value: [{ code: 'nagase' }] },
        GM_Level1_Approval_Rule: { value: 'ANY' },
        GM_Level2_Approvers: { value: [] },
        GM_Level2_Approval_Rule: { value: 'ANY' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMF1', 'f1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_M2_G1');
  assert.equal(routing.Has_Manager_Level2, 'Yes');
  assert.equal(routing.Has_GM_Level2, 'No');
  assert.equal(routing.Manager_Level2_Approval_Rule, 'ALL');
});

test('Routing Topology: M1_G1_G2 when Manager L2 is blank and GM L2 is present', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 't1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'satit' }] },
        Manager_Level1_Approval_Rule: { value: 'ANY' },
        Manager_Level2_Approvers: { value: [] },
        Manager_Level2_Approval_Rule: { value: 'ANY' },
        GM_Level1_Approvers: { value: [{ code: 'tsuchihira' }] },
        GM_Level1_Approval_Rule: { value: 'ANY' },
        GM_Level2_Approvers: { value: [{ code: 'morita' }] },
        GM_Level2_Approval_Rule: { value: 'ANY' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMT1', 't1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_G1_G2');
  assert.equal(routing.Has_Manager_Level2, 'No');
  assert.equal(routing.Has_GM_Level2, 'Yes');
});

test('Routing Topology: M1_M2_G1_G2 full 4-stage sequential approval', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 's1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'mgr1' }, { code: 'mgr1_alt' }] },
        Manager_Level1_Approval_Rule: { value: 'ANY' },
        Manager_Level2_Approvers: { value: [{ code: 'mgr2' }] },
        Manager_Level2_Approval_Rule: { value: 'ANY' },
        GM_Level1_Approvers: { value: [{ code: 'gm1' }] },
        GM_Level1_Approval_Rule: { value: 'ANY' },
        GM_Level2_Approvers: { value: [{ code: 'gm2' }] },
        GM_Level2_Approval_Rule: { value: 'ALL' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMS1', 's1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_M2_G1_G2');
  assert.equal(routing.Has_Manager_Level2, 'Yes');
  assert.equal(routing.Has_GM_Level2, 'Yes');
  assert.equal(routing.Manager_Level1_Approvers.length, 2);
  assert.equal(routing.GM_Level2_Approval_Rule, 'ALL');
});
