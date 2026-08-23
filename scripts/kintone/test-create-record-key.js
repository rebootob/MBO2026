import { kintoneRequest } from '../../src/core/kintone-client.js';
import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

const app = sandboxRegistry.mboV2AppId;
const query = encodeURIComponent('Record_Key = "FY2026-0149"');
const existing = await kintoneRequest(`/k/v1/records.json?app=${app}&query=${query}`);

if (existing.records.length > 0) {
  console.log('Record FY2026-0149 already exists, ID:', existing.records[0].$id.value);
} else {
  const res = await kintoneRequest('/k/v1/record.json', {
    method: 'POST',
    body: {
      app,
      record: {
        Fiscal_Year: { value: 'FY2026' },
        Record_Key: { value: 'FY2026-0149' },
        Employee_Code: { value: '0149' },
        Employee_Name: { value: 'Mr.Gritchai Somphonkrang' },
        Employee_Section: { value: 'TME1' },
        Employee_Department: { value: 'Eco Energy & Textile Machinery' },
        Employee_Position: { value: 'Marketing Chief' },
        Employee_Email: { value: 'gritchai@ttmet.co.th' },
        Employee_Start_Date: { value: '2021-04-01' },
        Requester_User: { value: [{ code: 'admin-form' }] },
        Manager_User: { value: [{ code: 'admin-form' }] },
        GM_User: { value: [{ code: 'admin-form' }] },
        Department_Hoshin: { value: '1. Safety and compliance.\n2. Solution provider.\n3. NPAT 30.7MB' },
        Section_Hoshin: { value: '1. Solar profit 5.4MB.\n2. Safety accident = 0.' },
        Objective_Count: { value: '2' },
        Objective_1: { value: 'Achieve sales profit for solar project 5.4 MB' },
        Action_Plan_1: { value: 'Expand customer base on solar energy' },
        Weight_1: { value: '60' },
        Difficulty_1: { value: '4' },
        Objective_2: { value: 'Zero safety accident in all site operations' },
        Action_Plan_2: { value: 'Conduct weekly safety patrols' },
        Weight_2: { value: '40' },
        Difficulty_2: { value: '3' }
      }
    }
  });
  console.log('Successfully created record with Record_Key FY2026-0149, ID:', res.id);
}

const check = await kintoneRequest(`/k/v1/records.json?app=${app}&query=${query}`);
console.log('VERIFIED RECORD IN LIVE DB:');
console.log('Record ID:', check.records[0].$id.value);
console.log('Record_Key:', check.records[0].Record_Key.value);
console.log('Employee_Code:', check.records[0].Employee_Code.value);
console.log('Fiscal_Year:', check.records[0].Fiscal_Year.value);
