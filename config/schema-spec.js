const text = (label, options = {}) => ({ type: 'SINGLE_LINE_TEXT', label, required: false, unique: false, defaultValue: '', ...options });
const area = (label) => ({ type: 'MULTI_LINE_TEXT', label, required: false, defaultValue: '' });
const user = (label, required = false) => ({ type: 'USER_SELECT', label, required, defaultValue: [], entities: [] });
const date = (label) => ({ type: 'DATE', label, required: false, defaultValue: '' });
const datetime = (label) => ({ type: 'DATETIME', label, required: false, defaultValue: '' });
const number = (label, options = {}) => ({ type: 'NUMBER', label, required: false, unique: false, minValue: '', maxValue: '', defaultValue: '', ...options });
const file = (label) => ({ type: 'FILE', label, required: false });
const calc = (label, expression) => ({ type: 'CALC', label, expression, hideExpression: true });

const approvalRuleOptions = {
  ALL: { label: 'ALL', index: '0' },
  ANY: { label: 'ANY', index: '1' }
};

export const routingFields = {
  Section_Code: text('Section Code', { required: true, unique: true }),
  Section_Name: text('Section Name', { required: true }),
  Requester_User: user('Requester User', true),
  
  // Target Sequential Routing Model (Single Source of Truth)
  Manager_Level1_Approvers: user('Manager Level 1 Approvers'),
  Manager_Level1_Approval_Rule: { type: 'DROP_DOWN', label: 'Manager Level 1 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  Manager_Level2_Approvers: user('Manager Level 2 Approvers'),
  Manager_Level2_Approval_Rule: { type: 'DROP_DOWN', label: 'Manager Level 2 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  GM_Level1_Approvers: user('GM Level 1 Approvers'),
  GM_Level1_Approval_Rule: { type: 'DROP_DOWN', label: 'GM Level 1 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  GM_Level2_Approvers: user('GM Level 2 Approvers'),
  GM_Level2_Approval_Rule: { type: 'DROP_DOWN', label: 'GM Level 2 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },

  // Metadata & Status
  Active: { type: 'RADIO_BUTTON', label: 'Active', required: true, defaultValue: 'Active', options: { Active: { label: 'Active', index: '0' }, Inactive: { label: 'Inactive', index: '1' } } },
  Effective_From: date('Effective From'),
  Effective_To: date('Effective To'),
  Remark: area('Remark'),

  // [DEPRECATED] Legacy Routing Model (To be removed after full workflow transition)
  First_Manager_User: user('First Manager User (Deprecated)'),
  Manager_User: user('Manager User (Deprecated)'),
  GM_User: user('GM User (Deprecated)')
};

const objectiveCountOptions = {};
for (let n = 2; n <= 10; n++) {
  objectiveCountOptions[String(n)] = { label: String(n), index: String(n - 2) };
}

const weightTerms = [];
const mboPointTerms = [];
for (let i = 1; i <= 10; i++) {
  weightTerms.push(`Weight_${i}`);
  mboPointTerms.push(`MBO_Point_${i}`);
}

export const mboFields = {
  Fiscal_Year: text('Fiscal Year', { required: true }),
  Record_Key: text('Record Key', { required: true, unique: true }),
  Employee_Code: text('Employee Code', { required: true }),
  Employee_Name: text('Employee Name'), Employee_Name_TH: text('Employee Name (Thai)'),
  Employee_Section: text('Employee Section'), Employee_Department: text('Employee Department'),
  Employee_Position: text('Employee Position'), Employee_Email: text('Employee Email'),
  Employee_Start_Date: date('Employee Start Date'), Department_Hoshin: area('Department Hoshin'), Section_Hoshin: area('Section Hoshin'),
  
  // Target Sequential Routing Snapshot
  Requester_User: user('Requester User', true),
  Manager_Level1_Approvers: user('Manager Level 1 Approvers'),
  Manager_Level1_Approval_Rule: { type: 'DROP_DOWN', label: 'Manager Level 1 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  Manager_Level2_Approvers: user('Manager Level 2 Approvers'),
  Manager_Level2_Approval_Rule: { type: 'DROP_DOWN', label: 'Manager Level 2 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  GM_Level1_Approvers: user('GM Level 1 Approvers'),
  GM_Level1_Approval_Rule: { type: 'DROP_DOWN', label: 'GM Level 1 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  GM_Level2_Approvers: user('GM Level 2 Approvers'),
  GM_Level2_Approval_Rule: { type: 'DROP_DOWN', label: 'GM Level 2 Approval Rule', defaultValue: 'ALL', options: approvalRuleOptions },
  Has_Manager_Level2: { type: 'DROP_DOWN', label: 'Has Manager Level 2', defaultValue: 'No', options: { Yes: { label: 'Yes', index: '0' }, No: { label: 'No', index: '1' } } },
  Has_GM_Level2: { type: 'DROP_DOWN', label: 'Has GM Level 2', defaultValue: 'No', options: { Yes: { label: 'Yes', index: '0' }, No: { label: 'No', index: '1' } } },
  Routing_Topology: text('Routing Topology', { defaultValue: 'M1_G1' }),

  // [DEPRECATED] Legacy Routing Snapshot (To be removed after full workflow transition)
  First_Manager_User: user('First Manager User (Deprecated)'),
  Manager_User: user('Manager User (Deprecated)'),
  GM_User: user('GM User (Deprecated)'),

  Objective_Count: { type: 'DROP_DOWN', label: 'Objective Count', required: true, defaultValue: '4', options: objectiveCountOptions },
  Total_Weight: calc('Total Weight', weightTerms.join('+')),
  PartA_Raw_Score: calc('Part A Raw Score', mboPointTerms.join('+')),
  PartA_Weighted_Score: calc('Part A Weighted Score', 'ROUND((PartA_Raw_Score*70)/100, 2)'),
  PartB_Raw_Score: calc('Part B Raw Score (Pending COCE Decision)', '(Competency_Result_1+Competency_Result_2+Competency_Result_3+Competency_Result_4+Competency_Result_5)/5'),
  PartB_Weighted_Score: calc('Part B Weighted Score (Pending COCE Decision)', 'ROUND(PartB_Raw_Score*0.3, 2)'),
  Final_Confidential_Score: calc('Final Confidential Score (Pending COCE Decision)', '((PartA_Weighted_Score+PartB_Weighted_Score)*100)/5')
};

for (let i = 1; i <= 10; i += 1) {
  Object.assign(mboFields, {
    [`Objective_${i}`]: area(`Objective ${i}`), [`Action_Plan_${i}`]: area(`Action Plan ${i}`), [`Additional_Agreement_${i}`]: area(`Additional Agreement ${i}`),
    [`Weight_${i}`]: number(`Weight ${i} (%)`, { minValue: '0', maxValue: '100' }), [`Difficulty_${i}`]: number(`Difficulty ${i}`, { minValue: '1', maxValue: '4' }),
    [`Progress_Percent_${i}`]: number(`Progress ${i} (%)`, { minValue: '0', maxValue: '100' }), [`Periodical_Review_${i}`]: area(`Periodical Review ${i}`),
    [`MidYear_Result_${i}`]: area(`Mid-Year Result ${i}`), [`MidYear_Issue_Risk_${i}`]: area(`Mid-Year Issue / Risk ${i}`), [`MidYear_Next_Action_${i}`]: area(`Mid-Year Next Action ${i}`), [`MidYear_Attachment_${i}`]: file(`Mid-Year Attachment ${i}`),
    [`Actual_Result_${i}`]: area(`Actual Result ${i}`), [`Self_Achievement_${i}`]: number(`Self Achievement ${i}`, { minValue: '1', maxValue: '5' }), [`Self_Comment_${i}`]: area(`Self Comment ${i}`), [`Final_Attachment_${i}`]: file(`Final Attachment ${i}`),
    [`Manager_Achievement_${i}`]: number(`Manager Achievement ${i}`, { minValue: '1', maxValue: '5' }), [`Manager_Objective_Score_${i}`]: number(`Manager Objective Score ${i}`, { minValue: '1', maxValue: '5' }), [`Manager_Comment_${i}`]: area(`Manager Internal Comment ${i}`),
    [`GM_Achievement_${i}`]: number(`GM Achievement ${i}`, { minValue: '1', maxValue: '5' }), [`GM_Objective_Score_${i}`]: number(`GM Objective Score ${i}`, { minValue: '1', maxValue: '5' }), [`GM_Comment_${i}`]: area(`GM Internal Comment ${i}`)
  });
}
