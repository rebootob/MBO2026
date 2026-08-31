import test from 'node:test';
import assert from 'node:assert/strict';
import { MboExportService } from '../src/services/mbo-export-service.js';

test('EXPORT_PROFILE_FAIL_CLOSED: resolves exact weighting per Profile_Code and fails closed on unmapped profile', () => {
  assert.equal(MboExportService.resolveProfileWeighting('PROF_STAFF_CHIEF').partAWeight, 70);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_JAPANESE_STAFF').partAWeight, 70);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_ASST_MGR').partAWeight, 60);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_SECTION_MGR').partAWeight, 50);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_SENIOR_MGR').partAWeight, 50);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_DGM').partAWeight, 50);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_GM').partAWeight, 50);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_VP').partAWeight, 50);

  assert.throws(
    () => MboExportService.resolveProfileWeighting('UNKNOWN_PROFILE'),
    /EXPORT_PROFILE_UNRESOLVED/
  );
});

test('EXPORT_OBJECTIVE_CAPACITY: projects exact 4, 5, and 10 objectives without silent truncation or phantom objectives', () => {
  const exportContext = { type: 'EMPLOYEE_SELF', employeeCode: 'EMP001' };

  // 4 Objectives
  const rec4 = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Objective_Count: { value: '4' },
    Objective_1: { value: 'Obj 1' }, Weight_1: { value: '25' },
    Objective_2: { value: 'Obj 2' }, Weight_2: { value: '25' },
    Objective_3: { value: 'Obj 3' }, Weight_3: { value: '25' },
    Objective_4: { value: 'Obj 4' }, Weight_4: { value: '25' }
  };
  const proj4 = MboExportService.projectPartAExport({ mboRecord: rec4, exportContext });
  assert.equal(proj4.objectivesCount, 4);
  assert.equal(proj4.objectives.length, 4);
  assert.equal(proj4.totalWeight, 100);

  // 5 Objectives
  const rec5 = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_ASST_MGR' },
    Objective_Count: { value: '5' },
    Objective_1: { value: 'Obj 1' }, Weight_1: { value: '20' },
    Objective_2: { value: 'Obj 2' }, Weight_2: { value: '20' },
    Objective_3: { value: 'Obj 3' }, Weight_3: { value: '20' },
    Objective_4: { value: 'Obj 4' }, Weight_4: { value: '20' },
    Objective_5: { value: 'Obj 5' }, Weight_5: { value: '20' }
  };
  const proj5 = MboExportService.projectPartAExport({ mboRecord: rec5, exportContext });
  assert.equal(proj5.objectivesCount, 5);
  assert.equal(proj5.objectives.length, 5);
  assert.equal(proj5.totalWeight, 100);

  // 10 Objectives
  const rec10 = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_SECTION_MGR' },
    Objective_Count: { value: '10' }
  };
  for (let i = 1; i <= 10; i++) {
    rec10[`Objective_${i}`] = { value: `Obj ${i}` };
    rec10[`Weight_${i}`] = { value: '10' };
  }
  const proj10 = MboExportService.projectPartAExport({ mboRecord: rec10, exportContext });
  assert.equal(proj10.objectivesCount, 10);
  assert.equal(proj10.objectives.length, 10);
  assert.equal(proj10.totalWeight, 100);
});

test('EXPORT_SECURITY_INVALID_OR_MALFORMED_CONTEXT_FAIL_CLOSED: empty object, role-less context, bare mode, or HR_ADMIN fails closed', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'pattama' }] }
  };

  // 1. Missing or empty object
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec }), /EXPORT_AUTHORIZATION_DENIED/);
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: null }), /EXPORT_AUTHORIZATION_DENIED/);
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: {} }), /EXPORT_AUTHORIZATION_DENIED/);

  // 2. Role-less matching employeeCode
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: { employeeCode: 'EMP001' } }), /EXPORT_AUTHORIZATION_DENIED/);

  // 3. Bare mode DEDICATED current Assignee without type: APPROVER
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: { mode: 'DEDICATED', kintoneUserCode: 'pattama' } }), /EXPORT_AUTHORIZATION_DENIED/);

  // 4. Forged/labeled HR_ADMIN or TECHNICAL_ADMIN
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: { type: 'HR_ADMIN' } }), /EXPORT_AUTHORIZATION_DENIED/);
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: { mode: 'HR_ADMIN' } }), /EXPORT_AUTHORIZATION_DENIED/);
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: { role: 'HR_ADMIN' } }), /EXPORT_AUTHORIZATION_DENIED/);
  assert.throws(() => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: { mode: 'TECHNICAL_ADMIN', kintoneUserCode: 'admin-form' } }), /EXPORT_AUTHORIZATION_DENIED/);
});

test('EXPORT_SECURITY_EMPLOYEE_SELF_CROSS_EMPLOYEE_DENIED: cross-employee export fails closed', () => {
  const mboRec = { Employee_Code: { value: 'EMP001' }, Profile_Code: { value: 'PROF_STAFF_CHIEF' } };
  const crossContext = { type: 'EMPLOYEE_SELF', employeeCode: 'EMP002' };

  assert.throws(
    () => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: crossContext }),
    /EXPORT_CROSS_EMPLOYEE_DENIED/
  );
});

test('EXPORT_SECURITY_EMPLOYEE_SELF_CONFIDENTIAL_FIELDS_OMITTED: Employee-Self projection omits confidential scores, comments, summary, final result & nested Part B evaluator fields', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Objective_Count: { value: '1' },
    Objective_1: { value: 'Obj 1' }, Weight_1: { value: '100' },
    Manager_Achievement_1: { value: '5 - Exceeds' },
    Manager_Objective_Score_1: { value: '100' },
    Manager_Comment_1: { value: 'Secret Manager Comment' },
    GM_Achievement_1: { value: '5 - Exceeds' },
    GM_Objective_Score_1: { value: '100' },
    GM_Comment_1: { value: 'Secret GM Comment' },
    Average_Objective_Score_1: { value: '100' },
    PartA_Raw_Score: { value: '100' },
    PartA_Weighted_Score: { value: '70' },
    PartB_Raw_Score: { value: '90' },
    PartB_Weighted_Score: { value: '27' },
    Final_Score: { value: '97' },
    Final_Grade: { value: 'A' }
  };

  const competencyItems = [{
    id: 'COMP1',
    name: 'Integrity',
    description: 'Acts ethically',
    weight: 10,
    selfRating: '4',
    selfComment: 'My comment',
    managerRating: '5',
    managerComment: 'Secret Manager Remark',
    gmRating: '5',
    gmComment: 'Secret GM Remark',
    score: 95
  }];

  const selfContext = { type: 'EMPLOYEE_SELF', employeeCode: 'EMP001' };

  const projPartA = MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: selfContext });
  assert.equal(projPartA.summary, undefined, 'Summary with raw/weighted scores must be omitted for Employee-Self');
  assert.equal(projPartA.objectives[0].managerAchievement, undefined);
  assert.equal(projPartA.objectives[0].managerScore, undefined);
  assert.equal(projPartA.objectives[0].managerComment, undefined);
  assert.equal(projPartA.objectives[0].gmAchievement, undefined);
  assert.equal(projPartA.objectives[0].gmScore, undefined);
  assert.equal(projPartA.objectives[0].gmComment, undefined);

  const projCombined = MboExportService.projectCombinedExport({ mboRecord: mboRec, competencyItems, exportContext: selfContext });
  assert.equal(projCombined.partB.rawPartBScore, undefined);
  assert.equal(projCombined.partB.weightedPartBScore, undefined);
  assert.equal(projCombined.finalResult, undefined);

  // Assert nested competency items filtering for Employee-Self
  const compItem = projCombined.partB.competencyItems[0];
  assert.equal(compItem.id, 'COMP1');
  assert.equal(compItem.name, 'Integrity');
  assert.equal(compItem.selfRating, '4');
  assert.equal(compItem.selfComment, 'My comment');
  assert.equal(compItem.managerRating, undefined, 'managerRating must be omitted for Employee-Self');
  assert.equal(compItem.managerComment, undefined, 'managerComment must be omitted for Employee-Self');
  assert.equal(compItem.gmRating, undefined, 'gmRating must be omitted for Employee-Self');
  assert.equal(compItem.gmComment, undefined, 'gmComment must be omitted for Employee-Self');
  assert.equal(compItem.score, undefined, 'score must be omitted for Employee-Self');
});

test('EXPORT_SECURITY_SHARED_APPROVER_DENIED: SHARED mode principal as Approver fails closed', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 's1' }] }
  };
  const sharedApproverContext = { type: 'APPROVER', context: { mode: 'SHARED', kintoneUserCode: 's1' } };

  assert.throws(
    () => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: sharedApproverContext }),
    /EXPORT_AUTHORIZATION_DENIED: SHARED mode principals are denied approver export authority/
  );
});

test('EXPORT_SECURITY_DEDICATED_NON_CURRENT_ASSIGNEE_DENIED: non-current Assignee fails closed', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'pattama' }] }
  };

  // Dedicated principal not in Assignee list
  const nonAssigneeContext = { type: 'APPROVER', context: { mode: 'DEDICATED', kintoneUserCode: 'other_user' } };

  assert.throws(
    () => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: nonAssigneeContext }),
    /EXPORT_AUTHORIZATION_DENIED: Principal is not current authorized Assignee for this record/
  );
});

test('EXPORT_SECURITY_STALE_ROUTE_MEMBERSHIP_DENIED: static route member who is NOT current Assignee fails closed', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Manager_User: { value: [{ code: 'stale_manager' }] },
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'current_assignee' }] }
  };

  const staleManagerContext = { type: 'APPROVER', context: { mode: 'DEDICATED', kintoneUserCode: 'stale_manager' } };

  assert.throws(
    () => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: staleManagerContext }),
    /EXPORT_AUTHORIZATION_DENIED: Principal is not current authorized Assignee for this record/
  );
});

test('EXPORT_SECURITY_AUTHORIZED_DEDICATED_ASSIGNEE_ALLOWED: current Assignee exports full evaluation projection', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Objective_Count: { value: '1' },
    Objective_1: { value: 'Obj 1' }, Weight_1: { value: '100' },
    Manager_Achievement_1: { value: '5 - Exceeds' },
    Manager_Objective_Score_1: { value: '100' },
    Manager_Comment_1: { value: 'Good performance' },
    PartA_Raw_Score: { value: '100' },
    PartA_Weighted_Score: { value: '70' },
    PartB_Raw_Score: { value: '90' },
    PartB_Weighted_Score: { value: '27' },
    Final_Score: { value: '97' },
    Final_Grade: { value: 'A' },
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'pattama' }] }
  };

  const approverContext = { type: 'APPROVER', context: { mode: 'DEDICATED', kintoneUserCode: 'pattama' } };

  const projPartA = MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: approverContext });
  assert.equal(projPartA.summary.rawPartAScore, 100);
  assert.equal(projPartA.summary.weightedPartAScore, 70);
  assert.equal(projPartA.objectives[0].managerAchievement, '5 - Exceeds');

  const projCombined = MboExportService.projectCombinedExport({ mboRecord: mboRec, exportContext: approverContext });
  assert.equal(projCombined.partB.rawPartBScore, 90);
  assert.equal(projCombined.partB.weightedPartBScore, 27);
  assert.equal(projCombined.finalResult.finalWeightedScore, 97);
  assert.equal(projCombined.finalResult.grade, 'A');
});

test('EXPORT_SECURITY_TECHNICAL_ADMIN_DENIED: admin-form fails closed for export projection', () => {
  const mboRec = { Employee_Code: { value: 'EMP001' }, Profile_Code: { value: 'PROF_STAFF_CHIEF' } };
  const adminContext = { mode: 'TECHNICAL_ADMIN', kintoneUserCode: 'admin-form' };

  assert.throws(
    () => MboExportService.projectPartAExport({ mboRecord: mboRec, exportContext: adminContext }),
    /EXPORT_AUTHORIZATION_DENIED/
  );
});
