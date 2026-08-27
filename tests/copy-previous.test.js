import test from 'node:test';
import assert from 'node:assert/strict';
import { AnnualRecordService } from '../src/services/annual-record-service.js';

test('COPY_PREVIOUS_REAL_APP794_SHAPE: copies ONLY physical planning fields from flattened Kintone prior-year record', () => {
  const priorYearMbo = {
    Fiscal_Year: { value: 'FY2025' },
    Record_Key: { value: 'FY2025-EMP001' },
    Employee_Code: { value: 'EMP001' },
    Employee_Name: { value: 'Somchai Prasert' },
    Employee_Department: { value: 'IT' },
    Employee_Section: { value: 'Software Dev' },
    Objective_Count: { value: '1' },
    Objective_1: { value: 'Upgrade Core DB' },
    Weight_1: { value: '50' },
    Progress_Percent_1: { value: '100' },
    Actual_Result_1: { value: 'Achieved 100%' },
    Self_Achievement_1: { value: '100%' },
    Manager_Objective_Score_1: { value: '4.8' },
    Department_Hoshin_Snapshot: { value: '{"old":"snapshot"}' }
  };

  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };

  const result = AnnualRecordService.generateCopyPreviousCandidate({
    priorYearRecord: priorYearMbo,
    newFiscalYear: 'FY2026',
    authenticatedUser: authUser,
    userRole: 'EMPLOYEE',
    newRoutingSnapshot: { topology: 'M1_G1' },
    newScoringConfig: { PartA_Weight: 50 },
    newHoshinSnapshot: { Department_Hoshin_Snapshot: '{"new":"snapshot"}' }
  });

  assert.equal(result.status, 'COPY_PREVIOUS_CANDIDATE_READY');
  assert.equal(result.newFiscalYear, 'FY2026');
  assert.equal(result.newRecordKey, 'FY2026-EMP001');
  assert.equal(result.copiedObjectivesCount, 1);

  const copiedObj = result.planningCandidate.Objectives[0];
  assert.equal(copiedObj.Objective_Title, 'Upgrade Core DB');
  assert.equal(copiedObj.Weight, 50);
  assert.equal('Actual_Result_1' in copiedObj, false);
  assert.equal('Self_Achievement_1' in copiedObj, false);
  assert.equal(result.planningCandidate.Department_Hoshin_Snapshot, '{"new":"snapshot"}');
});

test('COPY_PREVIOUS_REAL_APP794_SHAPE: Employee copying another employee MBO fails closed', () => {
  const priorYearMbo = {
    Fiscal_Year: { value: 'FY2025' },
    Employee_Code: { value: 'EMP002' }
  };
  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };

  assert.throws(
    () => AnnualRecordService.generateCopyPreviousCandidate({
      priorYearRecord: priorYearMbo,
      newFiscalYear: 'FY2026',
      authenticatedUser: authUser,
      userRole: 'EMPLOYEE'
    }),
    (err) => err.code === 'COPY_PREVIOUS_UNAUTHORIZED'
  );
});
