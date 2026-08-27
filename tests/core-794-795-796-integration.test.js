import test from 'node:test';
import assert from 'node:assert/strict';

import { MboIdentityService } from '../src/services/mbo-identity-service.js';
import { RoutingService } from '../src/services/routing-service.js';
import { PROFILE_CODES } from '../src/profiles/scoring-config-master.js';
import { HoshinService } from '../src/services/hoshin-service.js';
import { AnnualRecordService } from '../src/services/annual-record-service.js';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { MboExportService } from '../src/services/mbo-export-service.js';
import { HrDashboardService } from '../src/services/hr-dashboard-service.js';

test('CORE_794_795_796_INTEGRATION_LOCAL: complete local annual lifecycle path', async () => {
  // 1. Identity Binding
  const userMappings = [
    { Kintone_User_Code: 'somchai_k', Employee_Code: 'EMP100', Account_Status: 'ACTIVE' }
  ];
  const identityRes = MboIdentityService.resolveEmployeeIdentity({
    kintoneUserCode: 'somchai_k',
    userMappings
  });
  assert.equal(identityRes.status, 'IDENTITY_BOUND');
  assert.equal(identityRes.employeeCode, 'EMP100');

  // 2. Routing Normalization (App 795)
  const normPosition = RoutingService.normalizePosition('DGM');
  assert.equal(normPosition, 'DEPUTY_GENERAL_MANAGER');

  // 3. Scoring Profile Resolution (App 796)
  const profileCode = PROFILE_CODES.SECTION_MGR;
  assert.equal(profileCode, 'PROF_SECTION_MGR');

  // 4. Hoshin Resolution (App 797)
  const hoshinRecords = [
    { Record_ID: '1', Level: 'DEPARTMENT', Department: 'General Admin', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'Dept Growth' },
    { Record_ID: '2', Level: 'SECTION', Section: 'General Admin Section 1', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'Sect Efficiency' }
  ];
  const hoshinRes = HoshinService.resolveHoshinForMBO({
    department: 'General Admin',
    section: 'General Admin Section 1',
    fiscalYear: 'FY2026',
    hoshinRecords
  });
  assert.equal(hoshinRes.status, 'READY_FOR_MBO');

  // 5. Annual Record Candidate (App 794)
  const empProfile = {
    Employee_Code: 'EMP100',
    Employee_Name: 'Somchai',
    Employee_Department: 'General Admin',
    Employee_Section: 'General Admin Section 1',
    Employee_Position: 'Section Manager'
  };
  const payload = AnnualRecordService.buildInitializationPayload('FY2026', empProfile);
  assert.equal(payload.Record_Key.value, 'FY2026-EMP100');

  // 6. Objectives Validation
  const objectives = [
    { value: { Objective_Title: { value: 'Obj 1' }, Objective_Description: { value: 'Desc 1' }, KPI: { value: 'KPI 1' }, Target: { value: 'T1' }, Measurement: { value: 'M1' }, Weight: { value: '50' } } },
    { value: { Objective_Title: { value: 'Obj 2' }, Objective_Description: { value: 'Desc 2' }, KPI: { value: 'KPI 2' }, Target: { value: 'T2' }, Measurement: { value: 'M2' }, Weight: { value: '50' } } }
  ];
  const sampleRecord = {
    Employee_Code: { value: 'EMP100' },
    Employee_Name: { value: 'Somchai' },
    Fiscal_Year: { value: 'FY2026' },
    Objectives: { value: objectives }
  };
  const valResult = ValidationEngine.validate(sampleRecord, BUSINESS_STAGES.OBJECTIVES_SUBMISSION);
  assert.equal(valResult.isValid, true);

  // 7. Copy Previous Candidate
  const authUser = { employeeCode: 'EMP100', kintoneUserCode: 'somchai_k' };
  const priorMbo = {
    Fiscal_Year: 'FY2025',
    Employee_Code: 'EMP100',
    Objectives: [
      { Title: 'Old Obj', Weight: 50, Actual_Result: 'Done', Self_Score: 5 }
    ]
  };
  const copyRes = AnnualRecordService.generateCopyPreviousCandidate({
    priorYearRecord: priorMbo,
    newFiscalYear: 'FY2026',
    authenticatedUser: authUser,
    userRole: 'EMPLOYEE'
  });
  assert.equal(copyRes.status, 'COPY_PREVIOUS_CANDIDATE_READY');
  assert.equal('Actual_Result' in copyRes.planningCandidate.Objectives[0], false);

  // 8. Export Projection
  const exportProj = MboExportService.projectPartAExport({
    mboRecord: { ...empProfile, Fiscal_Year: 'FY2026', Objectives: objectives }
  });
  assert.equal(exportProj.exportType, 'PART_A_WORKBOOK');

  // 9. HR Dashboard Projection
  const counts = HrDashboardService.computeOverviewCounts([
    { Fiscal_Year: 'FY2026', Workflow_Status: 'DRAFT' }
  ]);
  assert.equal(counts.total, 1);
});
