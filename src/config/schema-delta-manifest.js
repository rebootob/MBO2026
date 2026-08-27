/**
 * Local Schema-Delta Manifest Specification
 * Covers missing physical fields required for final closure across App794, App797, App800, App801.
 * DO NOT DEPLOY IN THIS ROUND.
 */

export const LOCAL_SCHEMA_DELTA_MANIFEST = {
  version: '2.0.0-R1',
  preparedAt: '2026-08-27T07:34:00Z',
  targetApps: {
    App794: {
      appName: 'MBO V2 Sandbox',
      appId: 794,
      missingFields: [
        { code: 'Hoshin_Fiscal_Year', type: 'SINGLE_LINE_TEXT', label: 'Hoshin Fiscal Year', required: false },
        { code: 'Department_Hoshin_ID', type: 'SINGLE_LINE_TEXT', label: 'Department Hoshin ID', required: false },
        { code: 'Department_Hoshin_Title', type: 'SINGLE_LINE_TEXT', label: 'Department Hoshin Title', required: false },
        { code: 'Department_Hoshin_Snapshot', type: 'MULTI_LINE_TEXT', label: 'Department Hoshin Snapshot', required: false },
        { code: 'Section_Hoshin_ID', type: 'SINGLE_LINE_TEXT', label: 'Section Hoshin ID', required: false },
        { code: 'Section_Hoshin_Title', type: 'SINGLE_LINE_TEXT', label: 'Section Hoshin Title', required: false },
        { code: 'Section_Hoshin_Snapshot', type: 'MULTI_LINE_TEXT', label: 'Section Hoshin Snapshot', required: false },
        { code: 'Hoshin_Snapshot_At', type: 'DATETIME', label: 'Hoshin Snapshot At', required: false }
      ]
    },
    App797: {
      appName: 'MBO Hoshin Master',
      appId: 797,
      missingFields: [
        { code: 'Effective_From', type: 'DATE', label: 'Effective From', required: false },
        { code: 'Effective_To', type: 'DATE', label: 'Effective To', required: false }
      ]
    },
    App800: {
      appName: 'MBO HR Control Center',
      appId: 800,
      missingFields: [
        { code: 'Fiscal_Year', type: 'SINGLE_LINE_TEXT', label: 'Fiscal Year', required: true },
        { code: 'Objectives_Open', type: 'DATETIME', label: 'Objectives Open Date', required: false },
        { code: 'Objectives_Close', type: 'DATETIME', label: 'Objectives Close Date', required: false },
        { code: 'MidYear_Open', type: 'DATETIME', label: 'MidYear Open Date', required: false },
        { code: 'MidYear_Close', type: 'DATETIME', label: 'MidYear Close Date', required: false },
        { code: 'Self_Evaluation_Open', type: 'DATETIME', label: 'Self Evaluation Open Date', required: false },
        { code: 'Self_Evaluation_Close', type: 'DATETIME', label: 'Self Evaluation Close Date', required: false },
        { code: 'Appraiser_Evaluation_Open', type: 'DATETIME', label: 'Appraiser Evaluation Open Date', required: false },
        { code: 'Appraiser_Evaluation_Close', type: 'DATETIME', label: 'Appraiser Evaluation Close Date', required: false },
        { code: 'HR_Final_Open', type: 'DATETIME', label: 'HR Final Open Date', required: false },
        { code: 'HR_Final_Close', type: 'DATETIME', label: 'HR Final Close Date', required: false },
        { code: 'Password_Max_Age_Days', type: 'NUMBER', label: 'Password Max Age Days', required: false, defaultValue: '90' },
        { code: 'Failed_Login_Threshold', type: 'NUMBER', label: 'Failed Login Threshold', required: false, defaultValue: '5' },
        { code: 'Lock_Duration_Minutes', type: 'NUMBER', label: 'Lock Duration Minutes', required: false, defaultValue: '30' },
        { code: 'Config_Status', type: 'DROP_DOWN', label: 'Config Status', required: true, options: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }
      ]
    },
    App801: {
      appName: 'MBO Employee Authentication',
      appId: 801,
      missingFields: [
        { code: 'Kintone_User_Code', type: 'SINGLE_LINE_TEXT', label: 'Kintone User Code', required: true },
        { code: 'Password_Expires_At', type: 'DATETIME', label: 'Password Expires At', required: false }
      ]
    }
  }
};
