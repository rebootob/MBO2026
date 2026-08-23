/**
 * Central Configuration & Constants for TTMET MBO V2
 */

export const APP_CONFIG = {
  DEFAULT_FISCAL_YEAR: 'FY2026',
  APP_53_EMPLOYEE_MASTER_ID: 53,
  APP_283_LEGACY_PMS_ID: 283
};

export const WORKFLOW_STATUS = {
  DRAFT_OBJECTIVE: '01 Draft Objective',
  FIRST_MANAGER_OBJECTIVE: '02 First Manager Objective Review',
  MANAGER_OBJECTIVE: '03 Manager Objective Review',
  GM_OBJECTIVE: '04 GM Objective Review',
  OBJECTIVE_APPROVED: '05 Objective Approved',
  EMPLOYEE_MIDYEAR: '06 Employee Mid-Year',
  FIRST_MANAGER_MIDYEAR: '07 First Manager Mid-Year Review',
  MANAGER_MIDYEAR: '08 Manager Mid-Year Review',
  GM_MIDYEAR: '09 GM Mid-Year Review',
  MIDYEAR_COMPLETED: '10 Mid-Year Completed',
  EMPLOYEE_SELF_EVAL: '11 Employee Self Evaluation',
  FIRST_MANAGER_FINAL: '12 First Manager Final Evaluation',
  MANAGER_FINAL: '13 Manager Final Evaluation',
  GM_FINAL: '14 GM Final Evaluation',
  HR_FINAL_CHECK: '15 HR Final Check',
  COMPLETED: '16 Completed'
};

export const BUSINESS_STAGES = {
  OBJECTIVE_INPUT: 'OBJECTIVE_INPUT',
  MIDYEAR_INPUT: 'MIDYEAR_INPUT',
  SELF_EVALUATION: 'SELF_EVALUATION',
  READ_ONLY: 'READ_ONLY',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

export const STATUS_TO_STAGE_MAP = {
  '': BUSINESS_STAGES.OBJECTIVE_INPUT,
  'Not started': BUSINESS_STAGES.OBJECTIVE_INPUT,
  [WORKFLOW_STATUS.DRAFT_OBJECTIVE]: BUSINESS_STAGES.OBJECTIVE_INPUT,
  [WORKFLOW_STATUS.FIRST_MANAGER_OBJECTIVE]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MANAGER_OBJECTIVE]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.GM_OBJECTIVE]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.OBJECTIVE_APPROVED]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.EMPLOYEE_MIDYEAR]: BUSINESS_STAGES.MIDYEAR_INPUT,
  [WORKFLOW_STATUS.FIRST_MANAGER_MIDYEAR]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MANAGER_MIDYEAR]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.GM_MIDYEAR]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MIDYEAR_COMPLETED]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.EMPLOYEE_SELF_EVAL]: BUSINESS_STAGES.SELF_EVALUATION,
  [WORKFLOW_STATUS.FIRST_MANAGER_FINAL]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MANAGER_FINAL]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.GM_FINAL]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.HR_FINAL_CHECK]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.COMPLETED]: BUSINESS_STAGES.READ_ONLY
};

export const CONFIDENTIAL_FIELDS = [
  'PartA_Raw_Score', 'PartA_Weighted_Score', 'PartB_Raw_Score', 'PartB_Weighted_Score', 'Final_Confidential_Score',
  'Manager_Achievement_1', 'Manager_Objective_Score_1', 'Manager_Comment_1',
  'Manager_Achievement_2', 'Manager_Objective_Score_2', 'Manager_Comment_2',
  'Manager_Achievement_3', 'Manager_Objective_Score_3', 'Manager_Comment_3',
  'Manager_Achievement_4', 'Manager_Objective_Score_4', 'Manager_Comment_4',
  'GM_Achievement_1', 'GM_Objective_Score_1', 'GM_Comment_1',
  'GM_Achievement_2', 'GM_Objective_Score_2', 'GM_Comment_2',
  'GM_Achievement_3', 'GM_Objective_Score_3', 'GM_Comment_3',
  'GM_Achievement_4', 'GM_Objective_Score_4', 'GM_Comment_4',
  'Average_Objective_Score_1', 'MBO_Point_1',
  'Average_Objective_Score_2', 'MBO_Point_2',
  'Average_Objective_Score_3', 'MBO_Point_3',
  'Average_Objective_Score_4', 'MBO_Point_4',
  'Manager_Competency_Rating_1', 'GM_Competency_Rating_1', 'Manager_Competency_Comment_1', 'GM_Competency_Comment_1', 'Competency_Result_1',
  'Manager_Competency_Rating_2', 'GM_Competency_Rating_2', 'Manager_Competency_Comment_2', 'GM_Competency_Comment_2', 'Competency_Result_2',
  'Manager_Competency_Rating_3', 'GM_Competency_Rating_3', 'Manager_Competency_Comment_3', 'GM_Competency_Comment_3', 'Competency_Result_3',
  'Manager_Competency_Rating_4', 'GM_Competency_Rating_4', 'Manager_Competency_Comment_4', 'GM_Competency_Comment_4', 'Competency_Result_4',
  'Manager_Competency_Rating_5', 'GM_Competency_Rating_5', 'Manager_Competency_Comment_5', 'GM_Competency_Comment_5', 'Competency_Result_5',
  'Manager_Competency_Rating_6', 'GM_Competency_Rating_6', 'Manager_Competency_Comment_6', 'GM_Competency_Comment_6', 'Competency_Result_6'
];
