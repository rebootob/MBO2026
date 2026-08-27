import test from 'node:test';
import assert from 'node:assert/strict';

import { MboIdentityService } from '../src/services/mbo-identity-service.js';
import { RoutingService } from '../src/services/routing-service.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { resolveProfileCode, resolveProfileScoringConfig } from '../src/profiles/profile-scoring-resolver.js';
import { HoshinService } from '../src/services/hoshin-service.js';
import { AnnualRecordService } from '../src/services/annual-record-service.js';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { MboExportService } from '../src/services/mbo-export-service.js';
import { HrDashboardService } from '../src/services/hr-dashboard-service.js';
import { getCanonicalBaselineMasterConfigs, computeConfigurationHash } from '../src/profiles/scoring-config-master.js';

test('CORE_REAL_RESOLVER_INTEGRATION: complete real-resolver annual lifecycle path across App 794/795/796/797', async () => {
  // 1. Employee Identity Binding
  const userMappings = [
    { Kintone_User_Code: 'somchai_k', Employee_Code: 'EMP100', Account_Status: 'ACTIVE' }
  ];
  const identityRes = MboIdentityService.resolveEmployeeIdentity({
    kintoneUserCode: 'somchai_k',
    userMappings
  });
  assert.equal(identityRes.status, 'IDENTITY_BOUND');
  assert.equal(identityRes.employeeCode, 'EMP100');

  // 2. Real RoutingService App795 Route Resolution with App795 physical fixture
  const mockRoutingApi = {
    getRecords: async (appId, query) => {
      return {
        records: [
          {
            Routing_Key: { value: 'TMG1|g_request' },
            Section_Code: { value: 'TMG1' },
            Section_Name: { value: 'General Admin Section 1' },
            Team_Code: { value: 'g_request' },
            Requester_User: { value: [{ code: 'somchai_k' }] },
            Manager_Level1_Approvers: { value: [{ code: 'mgr_g1' }] },
            GM_Level1_Approvers: { value: [{ code: 'gm_admin' }] }
          }
        ]
      };
    }
  };

  const routeProfile = await RoutingService.validateRequesterAccess(
    795,
    'TMG1',
    'g_request',
    'somchai_k',
    mockRoutingApi,
    'Section Manager'
  );
  assert.equal(routeProfile.Routing_Topology, 'M1_G1');
  assert.equal(routeProfile.Manager_User[0].code, 'mgr_g1');
  assert.equal(routeProfile.GM_User[0].code, 'gm_admin');

  // 3. Employee Lookup & Verified Snapshot Generation from App53 mock
  const mockEmployeeApi = {
    getRecords: async () => ({
      records: [{
        emp_text: { value: 'EMP100' },
        Text: { value: 'Somchai Prasert' },
        Text_0: { value: 'สมชาย ประเสริฐ' },
        Drop_down_0: { value: 'General Admin' },
        Drop_down: { value: 'General Admin Section 1' },
        Text_2: { value: 'Section Manager' }
      }]
    })
  };
  const lookupRes = await EmployeeService.lookupEmployee('EMP100', mockEmployeeApi);
  assert.equal(lookupRes.status, 'EMPLOYEE_FOUND');
  const empSnapshot = lookupRes.employee;

  // 4. Profile Code Resolution from verified employee snapshot
  const profileCode = resolveProfileCode(empSnapshot);
  assert.equal(profileCode, 'PROF_SECTION_MGR');

  // 5. Real App796 Scoring Master Config Resolution
  const masterConfigRecords = getCanonicalBaselineMasterConfigs().map(cfg => ({
    ...cfg,
    Configuration_Hash: computeConfigurationHash(cfg)
  }));
  const authContext = { isAuthenticated: true, userCode: 'somchai_k' };

  const scoringConfig = resolveProfileScoringConfig({
    employeeSnapshot: empSnapshot,
    fiscalYear: 'FY2026',
    effectiveDate: '2026-04-01',
    masterConfigRecords,
    authenticatedContext: authContext
  });
  assert.equal(scoringConfig.Profile_Code, 'PROF_SECTION_MGR');
  assert.equal(scoringConfig.PartA_Weight, 50);

  // 6. Real Hoshin Resolution from App797 Physical Schema Fixture
  const hoshinRecords = [
    {
      Hoshin_Key: 'H101',
      Scope_Type: 'DEPARTMENT',
      Scope_Code: 'General Admin',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY',
      Ready_For_MBO: 'YES',
      Active: 'Active',
      Hoshin_TH: 'นวัตกรรมองค์กร 2569'
    },
    {
      Hoshin_Key: 'H102',
      Scope_Type: 'SECTION',
      Scope_Code: 'General Admin Section 1',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY',
      Ready_For_MBO: 'YES',
      Active: 'Active',
      Hoshin_TH: 'พัฒนาระบบ MBO 2569'
    }
  ];

  const hoshinRes = HoshinService.resolveHoshinForMBO({
    department: 'General Admin',
    section: 'General Admin Section 1',
    fiscalYear: 'FY2026',
    hoshinRecords
  });
  assert.equal(hoshinRes.status, 'READY_FOR_MBO');

  // 7. Annual Record Initialization Payload (App 794)
  const initPayload = AnnualRecordService.buildInitializationPayload('FY2026', empSnapshot);
  assert.equal(initPayload.Record_Key.value, 'FY2026-EMP100');

  // 8. Validation Engine Objectives Verification with REAL Flattened App794 Record Shape on OBJECTIVE_INPUT Stage
  const flattenedRecord = {
    Employee_Code: { value: 'EMP100' },
    Employee_Name: { value: 'Somchai Prasert' },
    Fiscal_Year: { value: 'FY2026' },
    Profile_Code: { value: 'PROF_SECTION_MGR' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 'somchai_k' }] },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Obj 1' }, Action_Plan_1: { value: 'Desc 1' }, Weight_1: { value: '50' }, Difficulty_1: { value: '3' },
    Objective_2: { value: 'Obj 2' }, Action_Plan_2: { value: 'Desc 2' }, Weight_2: { value: '50' }, Difficulty_2: { value: '3' }
  };
  const valResult = ValidationEngine.validate(flattenedRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(valResult.isValid, true);

  // 9. Copy Previous Integrated Candidate Generation with dependencies & preflight
  const authUser = { employeeCode: 'EMP100', kintoneUserCode: 'somchai_k' };
  const priorMbo = {
    Fiscal_Year: { value: 'FY2025' },
    Employee_Code: { value: 'EMP100' },
    Objective_Count: { value: '1' },
    Objective_1: { value: 'Prior Obj' },
    Weight_1: { value: '50' },
    Actual_Result_1: { value: 'Done' }
  };
  const copyRes = AnnualRecordService.generateCopyPreviousCandidate({
    priorYearRecord: priorMbo,
    newFiscalYear: 'FY2026',
    authenticatedUser: authUser,
    userRole: 'EMPLOYEE',
    newRoutingSnapshot: routeProfile,
    newScoringConfig: scoringConfig,
    newHoshinSnapshot: hoshinRes.snapshot,
    duplicatePreflightResult: { checked: true, exists: false }
  });
  assert.equal(copyRes.status, 'COPY_PREVIOUS_CANDIDATE_READY');
  assert.equal(copyRes.planningCandidate.Objective_1.value, 'Prior Obj');
  assert.equal(copyRes.planningCandidate.Profile_Code.value, 'PROF_SECTION_MGR');
  assert.equal(copyRes.planningCandidate.Routing_Topology.value, 'M1_G1');
  assert.equal('Actual_Result_1' in copyRes.planningCandidate, false);

  // 10. Export Projection from real flattened record
  const exportProj = MboExportService.projectPartAExport({
    mboRecord: { ...flattenedRecord, Profile_Code: { value: 'PROF_SECTION_MGR' } }
  });
  assert.equal(exportProj.exportType, 'PART_A_WORKBOOK');
  assert.equal(exportProj.header.partAWeightPercent, 50);

  // 11. HR Dashboard Summary Counts
  const counts = HrDashboardService.computeOverviewCounts([
    { Fiscal_Year: { value: 'FY2026' }, Workflow_Status: { value: 'DRAFT' } }
  ]);
  assert.equal(counts.total, 1);
  assert.equal(counts.draft, 1);
});
