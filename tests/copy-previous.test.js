import test from 'node:test';
import assert from 'node:assert/strict';
import { AnnualRecordService } from '../src/services/annual-record-service.js';

test('COPY_PREVIOUS_MBO_LOCAL: copies ONLY planning fields and resets evaluation/scores/Hoshin snapshot', () => {
  const priorYearMbo = {
    Fiscal_Year: 'FY2025',
    Record_Key: 'FY2025-EMP001',
    Employee_Code: 'EMP001',
    Employee_Name: 'Somchai Prasert',
    Employee_Department: 'IT',
    Employee_Section: 'Software Dev',
    Objectives: [
      {
        Objective_Title: 'Upgrade Core DB',
        Objective_Description: 'Migrate to PostgreSQL 16',
        KPI: 'System Uptime 99.9%',
        Target: 'Zero downtime cutover',
        Measurement: 'Percent Uptime',
        Weight: 50,
        Planning_Notes: 'Q2 target',
        // Evaluation fields (MUST NOT BE COPIED)
        Actual_Result: 'Achieved 100%',
        Achievement: '100%',
        Self_Score: 4.5,
        Appraiser_Score: 4.8,
        Comments: 'Excellent work'
      }
    ],
    Department_Hoshin_Snapshot: '{"old":"snapshot"}'
  };

  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };

  const result = AnnualRecordService.generateCopyPreviousCandidate({
    priorYearRecord: priorYearMbo,
    newFiscalYear: 'FY2026',
    authenticatedUser: authUser,
    userRole: 'EMPLOYEE'
  });

  assert.equal(result.status, 'COPY_PREVIOUS_CANDIDATE_READY');
  assert.equal(result.newFiscalYear, 'FY2026');
  assert.equal(result.newRecordKey, 'FY2026-EMP001');
  assert.equal(result.copiedObjectivesCount, 1);

  const copiedObj = result.planningCandidate.Objectives[0];
  assert.equal(copiedObj.Objective_Title, 'Upgrade Core DB');
  assert.equal(copiedObj.Weight, 50);
  assert.equal(copiedObj.Planning_Notes, 'Q2 target');
  assert.equal('Actual_Result' in copiedObj, false);
  assert.equal('Self_Score' in copiedObj, false);
  assert.equal('Appraiser_Score' in copiedObj, false);
  assert.equal(result.planningCandidate.Department_Hoshin_Snapshot, null);
});

test('COPY_PREVIOUS_MBO_LOCAL: Employee copying another employee MBO fails closed', () => {
  const priorYearMbo = {
    Fiscal_Year: 'FY2025',
    Employee_Code: 'EMP002'
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

test('COPY_PREVIOUS_MBO_LOCAL: HR copy requires authoritative role context', () => {
  const priorYearMbo = {
    Fiscal_Year: 'FY2025',
    Employee_Code: 'EMP002'
  };
  const authUser = { employeeCode: 'HR001', kintoneUserCode: 'hr_user' };

  // Without authoritative role context -> fails closed
  assert.throws(
    () => AnnualRecordService.generateCopyPreviousCandidate({
      priorYearRecord: priorYearMbo,
      newFiscalYear: 'FY2026',
      authenticatedUser: authUser,
      userRole: 'HR'
    }),
    (err) => err.code === 'COPY_PREVIOUS_UNAUTHORIZED_HR'
  );

  // With verified authoritative role context -> PASS
  const verifiedCtx = { isAuthorizedHR: true };
  const res = AnnualRecordService.generateCopyPreviousCandidate({
    priorYearRecord: priorYearMbo,
    newFiscalYear: 'FY2026',
    authenticatedUser: authUser,
    userRole: 'HR',
    authoritativeRoleContext: verifiedCtx
  });
  assert.equal(res.status, 'COPY_PREVIOUS_CANDIDATE_READY');
});
