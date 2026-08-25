import test from 'node:test';
import assert from 'node:assert/strict';
import { RoutingService } from '../src/services/routing-service.js';

test('Routing Topology: M1_G1 when Manager L2 and GM L2 are blank (Pilot TME1, Default Rule ALL)', async () => {
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
  assert.equal(routing.Has_Manager_Level2, 'No');
  assert.equal(routing.Has_GM_Level2, 'No');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'suthas');
  assert.equal(routing.Manager_Level1_Approval_Rule, 'ALL');
  assert.equal(routing.GM_Level1_Approvers[0].code, 'somrudee');
  assert.equal(routing.GM_Level1_Approval_Rule, 'ALL');
});

test('Routing Topology: M1_M2_G1 when Manager L2 is present and GM L2 is blank', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 'f1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'kritsada' }] },
        Manager_Level1_Approval_Rule: { value: 'ALL' },
        Manager_Level2_Approvers: { value: [{ code: 'weerakul' }] },
        Manager_Level2_Approval_Rule: { value: 'ALL' },
        GM_Level1_Approvers: { value: [{ code: 'nagase' }] },
        GM_Level1_Approval_Rule: { value: 'ALL' },
        GM_Level2_Approvers: { value: [] },
        GM_Level2_Approval_Rule: { value: 'ALL' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMF1', null, 'f1', mockApi);
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
        Manager_Level1_Approval_Rule: { value: 'ALL' },
        Manager_Level2_Approvers: { value: [] },
        Manager_Level2_Approval_Rule: { value: 'ALL' },
        GM_Level1_Approvers: { value: [{ code: 'tsuchihira' }] },
        GM_Level1_Approval_Rule: { value: 'ALL' },
        GM_Level2_Approvers: { value: [{ code: 'morita' }] },
        GM_Level2_Approval_Rule: { value: 'ANY' }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMT1', null, 't1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_G1_G2');
  assert.equal(routing.Has_Manager_Level2, 'No');
  assert.equal(routing.Has_GM_Level2, 'Yes');
  assert.equal(routing.GM_Level2_Approval_Rule, 'ANY');
});

test('Routing Topology: M1_M2_G1_G2 full 4-stage sequential approval with defaults', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Requester_User: { value: [{ code: 's1' }] },
        Manager_Level1_Approvers: { value: [{ code: 'mgr1' }, { code: 'mgr1_alt' }] },
        Manager_Level2_Approvers: { value: [{ code: 'mgr2' }] },
        GM_Level1_Approvers: { value: [{ code: 'gm1' }] },
        GM_Level2_Approvers: { value: [{ code: 'gm2' }] }
      }]
    })
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMS1', null, 's1', mockApi);
  assert.equal(routing.Routing_Topology, 'M1_M2_G1_G2');
  assert.equal(routing.Has_Manager_Level2, 'Yes');
  assert.equal(routing.Has_GM_Level2, 'Yes');
  assert.equal(routing.Manager_Level1_Approvers.length, 2);
  assert.equal(routing.Manager_Level1_Approval_Rule, 'ALL');
  assert.equal(routing.GM_Level2_Approval_Rule, 'ALL');
});

test('M10F-R1: TMG1 exact route success', async () => {
  let queryCount = 0;
  let lastQuery = '';
  const mockApi = {
    getRecords: async (appId, query) => {
      queryCount++;
      lastQuery = query;
      return {
        records: [{
          Routing_Key: { value: 'TMG1|CAD' },
          Requester_User: { value: [{ code: 'g_request' }] },
          Manager_Level1_Approvers: { value: [{ code: 'm1' }] }
        }]
      };
    }
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMG1', 'CAD', 'g_request', mockApi);
  assert.equal(queryCount, 1);
  assert.equal(lastQuery.includes('Routing_Key = "TMG1|CAD"'), true);
  assert.equal(routing.Routing_Key, 'TMG1|CAD');
});

test('M10F-R1: TMG2 exact route success', async () => {
  let queryCount = 0;
  let lastQuery = '';
  const mockApi = {
    getRecords: async (appId, query) => {
      queryCount++;
      lastQuery = query;
      return {
        records: [{
          Routing_Key: { value: 'TMG2|Production' },
          Requester_User: { value: [{ code: 'g_request' }] },
          Manager_Level1_Approvers: { value: [{ code: 'm2' }] }
        }]
      };
    }
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMG2', 'Production', 'g_request', mockApi);
  assert.equal(queryCount, 1);
  assert.equal(lastQuery.includes('Routing_Key = "TMG2|Production"'), true);
  assert.equal(routing.Routing_Key, 'TMG2|Production');
});

test('M10F-R1: TMG1 missing Team fails closed without API query', async () => {
  let apiCalled = false;
  const mockApi = {
    getRecords: async () => {
      apiCalled = true;
      return { records: [] };
    }
  };

  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMG1', null, 'g_request', mockApi),
    /Team is required for employee in section TMG1/
  );
  assert.equal(apiCalled, false);
});

test('M10F-R1: TMG2 missing Team fails closed without API query', async () => {
  let apiCalled = false;
  const mockApi = {
    getRecords: async () => {
      apiCalled = true;
      return { records: [] };
    }
  };

  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMG2', '', 'g_request', mockApi),
    /Team is required for employee in section TMG2/
  );
  assert.equal(apiCalled, false);
});

test('M10F-R1: TMG exact route missing fails closed and PROVES NO section fallback query occurs', async () => {
  let queryCount = 0;
  const queriedQueries = [];
  const mockApi = {
    getRecords: async (appId, query) => {
      queryCount++;
      queriedQueries.push(query);
      return { records: [] };
    }
  };

  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMG1', 'InvalidTeam', 'g_request', mockApi),
    /ไม่พบการตั้งค่า Routing สำหรับ Section TMG1 \/ Team InvalidTeam/
  );

  // MUST PROVE queryCount === 1 and NO fallback query was performed
  assert.equal(queryCount, 1);
  assert.equal(queriedQueries.length, 1);
  assert.equal(queriedQueries[0].includes('Routing_Key = "TMG1|InvalidTeam"'), true);
  assert.equal(queriedQueries.some(q => q.includes('Section_Code = "TMG1"')), false);
});

test('M10F-R1: Non-TMG route remains section-only', async () => {
  let queriedQuery = '';
  const mockApi = {
    getRecords: async (appId, query) => {
      queriedQuery = query;
      return {
        records: [{
          Routing_Key: { value: 'TMF1' },
          Requester_User: { value: [{ code: 'f1' }] },
          Manager_Level1_Approvers: { value: [{ code: 'kritsada' }] }
        }]
      };
    }
  };

  const routing = await RoutingService.validateRequesterAccess(795, 'TMF1', null, 'f1', mockApi);
  assert.equal(queriedQuery.includes('Routing_Key = "TMF1"'), true);
  assert.equal(routing.Routing_Key, 'TMF1');
});

test('M10F-R1: Duplicate exact TMG route fails closed', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [
        { Requester_User: { value: [{ code: 'u1' }] } },
        { Requester_User: { value: [{ code: 'u2' }] } }
      ]
    })
  };

  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMG1', 'Admin', 'u1', mockApi),
    /พบข้อมูล Routing ซ้ำซ้อนสำหรับ Routing Key TMG1\|Admin/
  );
});
