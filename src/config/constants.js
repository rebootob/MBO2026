/**
 * MBO System Constants & Enums
 */

export const BUSINESS_STAGES = {
  OBJECTIVE_INPUT: 'OBJECTIVE_INPUT',
  MIDYEAR_INPUT: 'MIDYEAR_INPUT',
  SELF_EVALUATION: 'SELF_EVALUATION',
  READ_ONLY: 'READ_ONLY',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

export const STATUS_TO_STAGE_MAP = {
  '01 Draft Objective': BUSINESS_STAGES.OBJECTIVE_INPUT,
  '02 First Manager Objective Review': BUSINESS_STAGES.READ_ONLY,
  '03 Manager Objective Review': BUSINESS_STAGES.READ_ONLY,
  '04 GM Objective Review': BUSINESS_STAGES.READ_ONLY,
  '05 Objective Approved': BUSINESS_STAGES.READ_ONLY,
  '06 Employee Mid-Year': BUSINESS_STAGES.MIDYEAR_INPUT,
  '07 First Manager Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '08 Manager Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '09 GM Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '10 Mid-Year Approved': BUSINESS_STAGES.READ_ONLY,
  '11 Employee Self Evaluation': BUSINESS_STAGES.SELF_EVALUATION,
  '12 First Manager Evaluation': BUSINESS_STAGES.READ_ONLY,
  '13 Manager Evaluation': BUSINESS_STAGES.READ_ONLY,
  '14 GM Evaluation': BUSINESS_STAGES.READ_ONLY,
  '15 Evaluation Completed': BUSINESS_STAGES.READ_ONLY,
  '16 Completed': BUSINESS_STAGES.READ_ONLY
};

export const CONFIDENTIAL_FIELDS = [
  'Manager_Achievement_1', 'Manager_Achievement_2', 'Manager_Achievement_3', 'Manager_Achievement_4',
  'GM_Achievement_1', 'GM_Achievement_2', 'GM_Achievement_3', 'GM_Achievement_4',
  'Manager_Comment_1', 'Manager_Comment_2', 'Manager_Comment_3', 'Manager_Comment_4',
  'GM_Comment_1', 'GM_Comment_2', 'GM_Comment_3', 'GM_Comment_4',
  'PartA_Raw_Score', 'PartA_Weighted_Score',
  'Manager_Competency_Rating_1', 'Manager_Competency_Rating_2', 'Manager_Competency_Rating_3', 'Manager_Competency_Rating_4', 'Manager_Competency_Rating_5', 'Manager_Competency_Rating_6',
  'GM_Competency_Rating_1', 'GM_Competency_Rating_2', 'GM_Competency_Rating_3', 'GM_Competency_Rating_4', 'GM_Competency_Rating_5', 'GM_Competency_Rating_6',
  'PartB_Raw_Score', 'PartB_Weighted_Score',
  'Final_Confidential_Score', 'Final_Grade'
];

/**
 * Build deterministic Record Key preserving leading zeroes
 * @param {string} fiscalYear e.g. "FY2026"
 * @param {string} employeeCode e.g. "0149"
 * @returns {string} e.g. "FY2026-0149"
 */
export function buildRecordKey(fiscalYear, employeeCode) {
  const fy = String(fiscalYear || '').trim();
  const emp = String(employeeCode || '').trim();
  if (!fy || !emp) {
    return '';
  }
  return `${fy}-${emp}`;
}
