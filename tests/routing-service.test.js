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

import { getCanonicalBaselineMasterConfigs } from '../src/profiles/scoring-config-master.js';
import { WORKFLOW_PATH_M1_ONLY, WORKFLOW_PATH_M1_G1, ROUTE_SCENARIOS } from '../src/ui/employee-part-a-ui.js';

// POSITION NORMALIZATION TESTS
test('Position Normalization: DGM, GM, VP canonical normalization', () => {
  assert.equal(RoutingService.normalizePosition('Deputy General Manager'), 'DEPUTY_GENERAL_MANAGER');
  assert.equal(RoutingService.normalizePosition('DGM'), 'DEPUTY_GENERAL_MANAGER');
  assert.equal(RoutingService.normalizePosition('General Manager'), 'GENERAL_MANAGER');
  assert.equal(RoutingService.normalizePosition('General manager'), 'GENERAL_MANAGER');
  assert.equal(RoutingService.normalizePosition('GM'), 'GENERAL_MANAGER');
  assert.equal(RoutingService.normalizePosition('Vice President'), 'VICE_PRESIDENT');
  assert.equal(RoutingService.normalizePosition('VP'), 'VICE_PRESIDENT');

  // Non-executive positions must NOT normalize to executive classes
  assert.equal(RoutingService.normalizePosition('Assistant General Manager'), 'Assistant General Manager');
  assert.equal(RoutingService.normalizePosition('Section Manager'), 'Section Manager');
  assert.equal(RoutingService.normalizePosition('Senior Manager'), 'Senior Manager');
  assert.equal(RoutingService.normalizePosition('Staff'), 'Staff');
});

// M10M-R2 EXECUTIVE DIRECT ROUTING TEST SUITE (TC01 - TC25)

test('M10M-R2 TC01: DGM in normal Section routes to President (POSITION_DGM)', async () => {
  const mockApi = {
    getRecords: async (appId, query) => {
      assert.equal(query.includes('Routing_Key = "POSITION_DGM"'), true);
      return {
        records: [{
          Routing_Key: { value: 'POSITION_DGM' },
          Requester_User: { value: [{ code: 'dgm_user' }] },
          Manager_Level1_Approvers: { value: [{ code: 'somcai_president' }] }
        }]
      };
    }
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMF1', null, 'dgm_user', mockApi, 'Deputy General Manager');
  assert.equal(routing.Matched_Rule, 'POSITION_DGM');
  assert.equal(routing.Routing_Topology, 'M1_ONLY');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'somcai_president');
  assert.equal(routing.GM_User.length, 0);
});

test('M10M-R2 TC02: GM in TMH3 routes to President (POSITION_GM)', async () => {
  const mockApi = {
    getRecords: async (appId, query) => {
      assert.equal(query.includes('Routing_Key = "POSITION_GM"'), true);
      return {
        records: [{
          Routing_Key: { value: 'POSITION_GM' },
          Requester_User: { value: [{ code: 'gm_user' }] },
          Manager_Level1_Approvers: { value: [{ code: 'somcai_president' }] }
        }]
      };
    }
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMH3', null, 'gm_user', mockApi, 'General Manager');
  assert.equal(routing.Matched_Rule, 'POSITION_GM');
  assert.equal(routing.Routing_Topology, 'M1_ONLY');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'somcai_president');
  assert.equal(routing.GM_User.length, 0);
});

test('M10M-R2 TC03: GM in TMG2 CAD routes to President and ignores TMG2|CAD route', async () => {
  let queriedKeys = [];
  const mockApi = {
    getRecords: async (appId, query) => {
      queriedKeys.push(query);
      return {
        records: [{
          Routing_Key: { value: 'POSITION_GM' },
          Requester_User: { value: [{ code: 'gm_user' }] },
          Manager_Level1_Approvers: { value: [{ code: 'somcai_president' }] }
        }]
      };
    }
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMG2', 'CAD', 'gm_user', mockApi, 'General manager');
  assert.equal(routing.Matched_Rule, 'POSITION_GM');
  assert.equal(routing.Routing_Topology, 'M1_ONLY');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'somcai_president');
  assert.equal(queriedKeys.length, 1);
  assert.equal(queriedKeys[0].includes('POSITION_GM'), true);
});

test('M10M-R2 TC04: VP in any Section routes to President (POSITION_VP)', async () => {
  const mockApi = {
    getRecords: async (appId, query) => {
      assert.equal(query.includes('Routing_Key = "POSITION_VP"'), true);
      return {
        records: [{
          Routing_Key: { value: 'POSITION_VP' },
          Requester_User: { value: [{ code: 'vp_user' }] },
          Manager_Level1_Approvers: { value: [{ code: 'somcai_president' }] }
        }]
      };
    }
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMS1', null, 'vp_user', mockApi, 'Vice President');
  assert.equal(routing.Matched_Rule, 'POSITION_VP');
  assert.equal(routing.Routing_Topology, 'M1_ONLY');
  assert.equal(routing.Manager_Level1_Approvers[0].code, 'somcai_president');
});

test('M10M-R2 TC05: Missing POSITION_DGM route in App795 throws APPROVER_NOT_FOUND and fails closed', async () => {
  const mockApi = { getRecords: async () => ({ records: [] }) };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMF1', null, 'dgm_user', mockApi, 'DGM'),
    /APPROVER_NOT_FOUND/
  );
});

test('M10M-R2 TC06: Missing POSITION_GM route in App795 throws APPROVER_NOT_FOUND and fails closed', async () => {
  const mockApi = { getRecords: async () => ({ records: [] }) };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMH3', null, 'gm_user', mockApi, 'GM'),
    /APPROVER_NOT_FOUND/
  );
});

test('M10M-R2 TC07: Missing POSITION_VP route in App795 throws APPROVER_NOT_FOUND and fails closed', async () => {
  const mockApi = { getRecords: async () => ({ records: [] }) };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMS1', null, 'vp_user', mockApi, 'VP'),
    /APPROVER_NOT_FOUND/
  );
});

test('M10M-R2 TC08: Duplicate executive route in App795 throws AMBIGUOUS_ROUTE and fails closed', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [
        { Routing_Key: { value: 'POSITION_GM' } },
        { Routing_Key: { value: 'POSITION_GM' } }
      ]
    })
  };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMH3', null, 'gm_user', mockApi, 'GM'),
    /AMBIGUOUS_ROUTE/
  );
});

test('M10M-R2 TC09: Executive route with empty President destination throws APPROVER_NOT_FOUND', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'POSITION_GM' },
        Manager_Level1_Approvers: { value: [] }
      }]
    })
  };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMH3', null, 'gm_user', mockApi, 'GM'),
    /APPROVER_NOT_FOUND/
  );
});

test('M10M-R2 TC10: Blank Requester_User does NOT authorize ordinary user for executive route', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'POSITION_GM' },
        Requester_User: { value: [] },
        Manager_Level1_Approvers: { value: [{ code: 'president' }] }
      }]
    })
  };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMH3', null, 'ordinary_user', mockApi, 'GM'),
    /ไม่มีสิทธิ์สร้าง MBO/
  );
});

test('M10M-R2 TC11: Executive route has exactly 1 appraiser slot (M1_ONLY)', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'POSITION_GM' },
        Requester_User: { value: [{ code: 'gm_user' }] },
        Manager_Level1_Approvers: { value: [{ code: 'somcai_president' }] }
      }]
    })
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMH3', null, 'gm_user', mockApi, 'GM');
  assert.equal(routing.Routing_Topology, 'M1_ONLY');
  assert.equal(routing.Manager_Level1_Approvers.length, 1);
  assert.equal(routing.Manager_Level2_Approvers.length, 0);
  assert.equal(routing.GM_Level1_Approvers.length, 0);
  assert.equal(routing.GM_Level2_Approvers.length, 0);
});

test('M10M-R2 TC12: President is not duplicated into second appraiser slot (GM_User is empty)', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'POSITION_GM' },
        Requester_User: { value: [{ code: 'gm_user' }] },
        Manager_Level1_Approvers: { value: [{ code: 'somcai_president' }] }
      }]
    })
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMH3', null, 'gm_user', mockApi, 'GM');
  assert.equal(routing.Manager_User[0].code, 'somcai_president');
  assert.equal(routing.GM_User.length, 0);
});

test('M10M-R2 TC13: Single-appraiser path (WORKFLOW_PATH_M1_ONLY) skips technical second-appraiser states (04, 09, 14)', () => {
  assert.equal(WORKFLOW_PATH_M1_ONLY.includes('04 GM Objective Review'), false);
  assert.equal(WORKFLOW_PATH_M1_ONLY.includes('09 GM Mid-Year Review'), false);
  assert.equal(WORKFLOW_PATH_M1_ONLY.includes('14 GM Final Evaluation'), false);
  assert.equal(WORKFLOW_PATH_M1_ONLY.length, 10);
});

test('M10M-R2 TC14: Executive return/resubmit returns to same President stage path', () => {
  assert.equal(WORKFLOW_PATH_M1_ONLY[0], '01 Draft Objective');
  assert.equal(WORKFLOW_PATH_M1_ONLY[1], '03 Manager Objective Review');
  assert.equal(WORKFLOW_PATH_M1_ONLY[2], '05 Objective Approved');
});

test('M10M-R2 TC15: Normal M1_G1 route still follows existing two-appraiser workflow unchanged', () => {
  assert.equal(WORKFLOW_PATH_M1_G1.includes('04 GM Objective Review'), true);
  assert.equal(WORKFLOW_PATH_M1_G1.includes('09 GM Mid-Year Review'), true);
  assert.equal(WORKFLOW_PATH_M1_G1.includes('14 GM Final Evaluation'), true);
  assert.equal(WORKFLOW_PATH_M1_G1.length, 13);
});

test('M10M-R2 TC16: TMG2 CAD resolves TMG2|CAD route for Staff', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'TMG2|CAD' },
        Requester_User: { value: [{ code: 'cad_emp' }] },
        Manager_Level1_Approvers: { value: [{ code: 'phubodin' }] }
      }]
    })
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMG2', 'CAD', 'cad_emp', mockApi, 'Staff');
  assert.equal(routing.Routing_Key, 'TMG2|CAD');
});

test('M10M-R2 TC17: TMG2 Production resolves TMG2|Production route for Staff', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'TMG2|Production' },
        Requester_User: { value: [{ code: 'prod_emp' }] },
        Manager_Level1_Approvers: { value: [{ code: 'prompan' }] }
      }]
    })
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMG2', 'Production', 'prod_emp', mockApi, 'Staff');
  assert.equal(routing.Routing_Key, 'TMG2|Production');
});

test('M10M-R2 TC18: TMG2 Marketing resolves TMG2|Marketing route for Staff', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Routing_Key: { value: 'TMG2|Marketing' },
        Requester_User: { value: [{ code: 'mkt_emp' }] },
        Manager_Level1_Approvers: { value: [{ code: 'mkt_mgr' }] }
      }]
    })
  };
  const routing = await RoutingService.validateRequesterAccess(795, 'TMG2', 'Marketing', 'mkt_emp', mockApi, 'Staff');
  assert.equal(routing.Routing_Key, 'TMG2|Marketing');
});

test('M10M-R2 TC19: TMG2 missing Team throws TEAM_REQUIRED and blocks without API query', async () => {
  let apiCalled = false;
  const mockApi = {
    getRecords: async () => {
      apiCalled = true;
      return { records: [] };
    }
  };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMG2', '', 'emp', mockApi, 'Staff'),
    /TEAM_REQUIRED/
  );
  assert.equal(apiCalled, false);
});

test('M10M-R2 TC20: TMG2 unknown Team throws ROUTE_NOT_FOUND and blocks', async () => {
  const mockApi = { getRecords: async () => ({ records: [] }) };
  await assert.rejects(
    async () => RoutingService.validateRequesterAccess(795, 'TMG2', 'InvalidTeam', 'emp', mockApi, 'Staff'),
    /ROUTE_NOT_FOUND/
  );
});

test('M10M-R2 TC21: PROF_DGM expected appraiser count = 1 in scoring master', () => {
  const configs = getCanonicalBaselineMasterConfigs();
  const dgmConfig = configs.find(c => c.Profile_Code === 'PROF_DGM');
  assert.equal(dgmConfig.Expected_Appraiser_Count, 1);
});

test('M10M-R2 TC22: PROF_GM expected appraiser count = 1 in scoring master', () => {
  const configs = getCanonicalBaselineMasterConfigs();
  const gmConfig = configs.find(c => c.Profile_Code === 'PROF_GM');
  assert.equal(gmConfig.Expected_Appraiser_Count, 1);
});

test('M10M-R2 TC23: PROF_VP expected appraiser count = 1 in scoring master', () => {
  const configs = getCanonicalBaselineMasterConfigs();
  const vpConfig = configs.find(c => c.Profile_Code === 'PROF_VP');
  assert.equal(vpConfig.Expected_Appraiser_Count, 1);
});

test('M10M-R2 TC24: Part A/B remains 50/50 for DGM, GM, and VP profiles', () => {
  const configs = getCanonicalBaselineMasterConfigs();
  const dgm = configs.find(c => c.Profile_Code === 'PROF_DGM');
  const gm = configs.find(c => c.Profile_Code === 'PROF_GM');
  const vp = configs.find(c => c.Profile_Code === 'PROF_VP');
  assert.equal(dgm.PartA_Weight, 50);
  assert.equal(dgm.PartB_Weight, 50);
  assert.equal(gm.PartA_Weight, 50);
  assert.equal(gm.PartB_Weight, 50);
  assert.equal(vp.PartA_Weight, 50);
  assert.equal(vp.PartB_Weight, 50);
});

test('M10M-R2 TC25: Executive Direct displays exactly 1st Appraiser = President and appraiserCount = 1 in UI scenarios', () => {
  const execScenario = ROUTE_SCENARIOS.EXECUTIVE_DIRECT;
  assert.equal(execScenario.appraiserCount, 1);
  assert.equal(execScenario.isRuntimeSupported, true);
  assert.equal(execScenario.topology, 'M1_ONLY');
});
