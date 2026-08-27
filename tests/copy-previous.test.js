import test from 'node:test';
import assert from 'node:assert/strict';
import { AnnualRecordService } from '../src/services/annual-record-service.js';

test('COPY_PREVIOUS_REAL_APP794_SHAPE: copies physical planning fields to flattened App 794 candidate and excludes evaluation fields', () => {
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
    newHoshinSnapshot: { Hoshin_Fiscal_Year: 'FY2026', Department_Hoshin_Snapshot: '{"new":"snapshot"}' },
    duplicatePreflightResult: { checked: true, exists: false }
  });

  assert.equal(result.status, 'COPY_PREVIOUS_CANDIDATE_READY');
  assert.equal(result.newFiscalYear, 'FY2026');
  assert.equal(result.newRecordKey, 'FY2026-EMP001');
  assert.equal(result.copiedObjectivesCount, 1);

  const cand = result.planningCandidate;
  assert.equal(cand.Objective_1.value, 'Upgrade Core DB');
  assert.equal(cand.Weight_1.value, '50');
  assert.equal('Actual_Result_1' in cand, false);
  assert.equal('Self_Achievement_1' in cand, false);
  assert.equal('Objectives' in cand, false); // No non-physical Objectives array!
  assert.equal(cand.Department_Hoshin_Snapshot.value, '{"new":"snapshot"}');
});

test('COPY_PREVIOUS_DEPENDENCY_FAIL_CLOSED: fails closed if any required current-year dependency is missing', () => {
  const priorYearMbo = {
    Fiscal_Year: { value: 'FY2025' },
    Employee_Code: { value: 'EMP001' }
  };
  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };

  // Missing routing
  assert.throws(
    () => AnnualRecordService.generateCopyPreviousCandidate({
      priorYearRecord: priorYearMbo,
      newFiscalYear: 'FY2026',
      authenticatedUser: authUser,
      userRole: 'EMPLOYEE',
      newRoutingSnapshot: null,
      newScoringConfig: {},
      newHoshinSnapshot: {},
      duplicatePreflightResult: { checked: true, exists: false }
    }),
    (err) => err.code === 'COPY_PREVIOUS_MISSING_DEPENDENCY'
  );
});

test('COPY_PREVIOUS_DUPLICATE_PREFLIGHT: fails closed if duplicate preflight unchecked or duplicate exists', () => {
  const priorYearMbo = {
    Fiscal_Year: { value: 'FY2025' },
    Employee_Code: { value: 'EMP001' }
  };
  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };

  // Duplicate exists -> fails closed
  assert.throws(
    () => AnnualRecordService.generateCopyPreviousCandidate({
      priorYearRecord: priorYearMbo,
      newFiscalYear: 'FY2026',
      authenticatedUser: authUser,
      userRole: 'EMPLOYEE',
      newRoutingSnapshot: {},
      newScoringConfig: {},
      newHoshinSnapshot: {},
      duplicatePreflightResult: { checked: true, exists: true }
    }),
    (err) => err.code === 'COPY_PREVIOUS_DUPLICATE_EXISTS'
  );
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
      userRole: 'EMPLOYEE',
      newRoutingSnapshot: {},
      newScoringConfig: {},
      newHoshinSnapshot: {},
      duplicatePreflightResult: { checked: true, exists: false }
    }),
    (err) => err.code === 'COPY_PREVIOUS_UNAUTHORIZED'
  );
});
