import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';
import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

const app = sandboxRegistry.mboV2AppId;
assertSandboxWriteTarget(app);

// Check if test record already exists
const existing = await kintoneRequest(`/k/v1/records.json?app=${app}&query=${encodeURIComponent('Record_Key = "FY2026-TEST-0149"')}`);
if (existing.records.length > 0) {
  console.log(`Test record already exists with ID: ${existing.records[0].$id.value}`);
  process.exit(0);
}

// Create a realistic TEST record for Employee 0149
const recordBody = {
  app,
  record: {
    Fiscal_Year: { value: 'FY2026' },
    Record_Key: { value: 'FY2026-TEST-0149' },
    Employee_Code: { value: '0149' },
    Employee_Name: { value: 'Mr.Gritchai Somphonkrang' },
    Employee_Name_TH: { value: 'นายกฤษณ์ชัย สมพลกรัง' },
    Employee_Section: { value: 'TME1' },
    Employee_Department: { value: 'Eco Energy & Textile Machinery' },
    Employee_Position: { value: 'Marketing Chief' },
    Employee_Email: { value: 'gritchai@ttmet.co.th' },
    Employee_Start_Date: { value: '2021-04-01' },
    Requester_User: { value: [{ code: 'admin-form' }] },
    Manager_User: { value: [{ code: 'admin-form' }] },
    GM_User: { value: [{ code: 'admin-form' }] },
    Department_Hoshin: { value: '1. Ensure to follow safety and compliance before starting any activities.\n2. Be the solution provider leader to contribute carbon neutral through the sales force and partners.\n3. Achieve the NPAT 30.7MB' },
    Section_Hoshin: { value: '1. Achieve the Operating Profit of Budget for solar project 5.4 MB.\n2. Prioritize strong safety mindset accident = 0.' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Achieve the Operating Profit of Budget for solar project 5.4 MB (Solar and energy saving)' },
    Action_Plan_1: { value: '- Management Project on Schedule, no Additional cost for Achieve GP, Start Apr 2026\n- Expand our Product to Customers Base on Solar Customers. Start May 2026' },
    Additional_Agreement_1: { value: 'Reviewed and agreed on Q1 milestones.' },
    Weight_1: { value: '60' },
    Difficulty_1: { value: '4' },
    Objective_2: { value: 'Prioritize the strong safety mind and ensuring the safety working environment accident = 0' },
    Action_Plan_2: { value: '- Meeting with TTMET, GRN safety officials before starting the project.\n- Conduct weekly Safety Patrols to prevent accidents.' },
    Additional_Agreement_2: { value: 'Zero safety tolerance policy.' },
    Weight_2: { value: '40' },
    Difficulty_2: { value: '3' }
  }
};

const res = await kintoneRequest('/k/v1/record.json', {
  method: 'POST',
  body: recordBody
});

console.log(`Created TEST MBO Record ID: ${res.id} in Sandbox App ${app}`);
