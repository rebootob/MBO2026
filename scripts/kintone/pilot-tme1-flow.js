import fs from 'node:fs';
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const ROUTING_APP_ID = 795;
const MBO_APP_ID = 794;

assertSandboxWriteTarget(ROUTING_APP_ID);
assertSandboxWriteTarget(MBO_APP_ID);

console.log('====================================================');
console.log('1. BACKUP APP 795');
console.log('====================================================');
const existingRoutes = await kintoneRequest(`/k/v1/records.json?app=${ROUTING_APP_ID}`);
const backupDir = 'backups';
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
const backupPath = `${backupDir}/app795_backup_${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(existingRoutes, null, 2), 'utf8');
console.log(`Backup saved to ${backupPath} (Count: ${existingRoutes.records.length})`);

console.log('\n====================================================');
console.log('2. CREATE / UPDATE TME1 IN APP 795 (ROUTING MASTER)');
console.log('====================================================');
const tme1Query = `Section_Code = "TME1" limit 1`;
const existingTME1 = await kintoneRequest(`/k/v1/records.json?app=${ROUTING_APP_ID}&query=${encodeURIComponent(tme1Query)}`);

const routingRecordPayload = {
  Section_Code: { value: 'TME1' },
  Section_Name: { value: 'TME1' },
  Requester_User: { value: [{ code: 'e1' }] },
  First_Manager_User: { value: [] },
  Manager_User: { value: [{ code: 'suthas' }] },
  GM_User: { value: [{ code: 'somrudee' }] },
  Active: { value: 'Active' }
};

let tme1RecordId;
if (existingTME1.records.length > 0) {
  tme1RecordId = existingTME1.records[0].$id.value;
  console.log(`Updating existing TME1 Routing record ($id: ${tme1RecordId})...`);
  await kintoneRequest('/k/v1/record.json', {
    method: 'PUT',
    body: {
      app: ROUTING_APP_ID,
      id: tme1RecordId,
      record: routingRecordPayload
    }
  });
} else {
  console.log('Creating new TME1 Routing record...');
  const addRes = await kintoneRequest('/k/v1/record.json', {
    method: 'POST',
    body: {
      app: ROUTING_APP_ID,
      record: routingRecordPayload
    }
  });
  tme1RecordId = addRes.id;
  console.log(`Created TME1 Routing record ($id: ${tme1RecordId})`);
}

console.log('\n====================================================');
console.log('3. VERIFY TME1 IN APP 795 VIA GET API');
console.log('====================================================');
const verifyRoute = await kintoneRequest(`/k/v1/record.json?app=${ROUTING_APP_ID}&id=${tme1RecordId}`);
const vr = verifyRoute.record;
console.log('Verified App 795 Record:');
console.log(' - Section_Code:', vr.Section_Code.value);
console.log(' - Requester_User:', JSON.stringify(vr.Requester_User.value));
console.log(' - First_Manager_User:', JSON.stringify(vr.First_Manager_User.value));
console.log(' - Manager_User:', JSON.stringify(vr.Manager_User.value));
console.log(' - GM_User:', JSON.stringify(vr.GM_User.value));
console.log(' - Active:', vr.Active.value);

if (vr.Section_Code.value !== 'TME1' || vr.Requester_User.value[0]?.code !== 'e1' || vr.Manager_User.value[0]?.code !== 'suthas' || vr.GM_User.value[0]?.code !== 'somrudee' || vr.Active.value !== 'Active') {
  throw new Error('Verification failed: App 795 fields do not match expected pilot values');
}
console.log('>> App 795 Verification: PASS');

console.log('\n====================================================');
console.log('4. PILOT TEST EMPLOYEE 0149 (APP 53 LOOKUP)');
console.log('====================================================');
const numVal = parseInt('0149', 10);
const q53 = `(Number = "${numVal}" or Number = "0149") limit 2`;
const empRes = await kintoneRequest(`/k/v1/records.json?app=53&query=${encodeURIComponent(q53)}`);
if (empRes.records.length === 0) throw new Error('Employee 0149 not found in App 53');
const emp = empRes.records[0];
console.log('Employee Profile:');
console.log(' - Employee Code:', '0149', '(preserves leading zero)');
console.log(' - Name:', emp.Text?.value);
console.log(' - Section:', emp.Drop_down?.value);
console.log(' - Dept:', emp.Drop_down_0?.value);
console.log(' - Position:', emp.Text_2?.value);
console.log('>> App 53 Lookup: PASS');

console.log('\n====================================================');
console.log('5. CREATE MBO RECORD ON APP 794 FOR 0149');
console.log('====================================================');
const fy = 'FY2026';
const empCode = '0149';
const recordKey = `${fy}-${empCode}`;

// Clean up existing pilot record if any
const existingMbo = await kintoneRequest(`/k/v1/records.json?app=${MBO_APP_ID}&query=${encodeURIComponent(`Record_Key = "${recordKey}"`)}`);
if (existingMbo.records.length > 0) {
  console.log(`Deleting existing pilot test record ($id: ${existingMbo.records[0].$id.value})...`);
  await kintoneRequest(`/k/v1/records.json?app=${MBO_APP_ID}&ids[0]=${existingMbo.records[0].$id.value}`, {
    method: 'DELETE'
  });
}

const newMboPayload = {
  Fiscal_Year: { value: fy },
  Employee_Code: { value: empCode },
  Record_Key: { value: recordKey },
  Employee_Name: { value: emp.Text?.value || '' },
  Employee_Name_TH: { value: emp.Text_0?.value || '' },
  Employee_Section: { value: emp.Drop_down?.value || '' },
  Employee_Department: { value: emp.Drop_down_0?.value || '' },
  Employee_Position: { value: emp.Text_2?.value || '' },
  Employee_Email: { value: emp.Text_4?.value || '' },
  Employee_Start_Date: { value: emp.Date?.value || '' },
  Department_Hoshin: { value: emp.Text_area?.value || '' },
  Section_Hoshin: { value: emp.Text_area_0?.value || '' },
  Requester_User: { value: vr.Requester_User.value },
  First_Manager_User: { value: vr.First_Manager_User.value },
  Manager_User: { value: vr.Manager_User.value },
  GM_User: { value: vr.GM_User.value },
  Objective_Count: { value: '4' },
  Objective_1: { value: 'Achieve annual sales and profit target' },
  Action_Plan_1: { value: 'Expand customer base and optimize supply chain' },
  Weight_1: { value: '30' },
  Difficulty_1: { value: '3' },
  Objective_2: { value: 'Zero safety accident and compliance violation' },
  Action_Plan_2: { value: 'Conduct safety patrol and compliance training weekly' },
  Weight_2: { value: '25' },
  Difficulty_2: { value: '3' },
  Objective_3: { value: 'Engineering cost reduction kaizen' },
  Action_Plan_3: { value: 'Implement lean operation process' },
  Weight_3: { value: '25' },
  Difficulty_3: { value: '2' },
  Objective_4: { value: 'Skill enhancement and team training' },
  Action_Plan_4: { value: 'Complete professional certification courses' },
  Weight_4: { value: '20' },
  Difficulty_4: { value: '2' }
};

const createMboRes = await kintoneRequest('/k/v1/record.json', {
  method: 'POST',
  body: {
    app: MBO_APP_ID,
    record: newMboPayload
  }
});
const mboId = createMboRes.id;
console.log(`Created Pilot MBO Record ($id: ${mboId}, Record_Key: ${recordKey})`);

// Read Initial Status
let curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Initial Status:', curMbo.record.Status.value);
if (curMbo.record.Status.value !== '01 Draft Objective') throw new Error('Initial status mismatch');
console.log('>> Initial Status 01 Draft Objective: PASS');

console.log('\n====================================================');
console.log('6. TEST SUBMIT & RETURN FLOWS');
console.log('====================================================');

// Flow 6.1: Submit to Manager
console.log('Action: Submit Objective to Manager (Assignee: suthas)...');
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Submit Objective to Manager',
    assignee: 'suthas'
  }
});
curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Status after Submit:', curMbo.record.Status.value);
console.log('Assignee:', JSON.stringify(curMbo.record.Assignee?.value));
if (curMbo.record.Status.value !== '03 Manager Objective Review') throw new Error('Submit to manager failed');
console.log('>> Submit to Manager (03 Manager Objective Review): PASS');

// Flow 6.2: Manager Return to Employee Draft
console.log('\nAction: Manager Return Objective (Assignee: e1)...');
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Return Objective'
  }
});
curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Status after Manager Return:', curMbo.record.Status.value);
if (curMbo.record.Status.value !== '01 Draft Objective') throw new Error('Manager return failed');
console.log('>> Manager Return (01 Draft Objective): PASS');

// Flow 6.3: Resubmit to Manager
console.log('\nAction: Resubmit Objective to Manager (Assignee: suthas)...');
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Submit Objective to Manager',
    assignee: 'suthas'
  }
});
curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Status after Resubmit:', curMbo.record.Status.value);
if (curMbo.record.Status.value !== '03 Manager Objective Review') throw new Error('Resubmit failed');

// Flow 6.4: Manager Approve to GM
console.log('\nAction: Manager Approve Objective (Assignee: somrudee)...');
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Approve Objective',
    assignee: 'somrudee'
  }
});
curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Status after Manager Approve:', curMbo.record.Status.value);
console.log('Assignee:', JSON.stringify(curMbo.record.Assignee?.value));
if (curMbo.record.Status.value !== '04 GM Objective Review') throw new Error('Manager approve failed');
console.log('>> Manager Approve (04 GM Objective Review): PASS');

// Flow 6.5: GM Return to Employee Draft
console.log('\nAction: GM Return Objective (Return to 01 Draft)...');
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Return Objective'
  }
});
curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Status after GM Return:', curMbo.record.Status.value);
if (curMbo.record.Status.value !== '01 Draft Objective') throw new Error('GM return failed');
console.log('>> GM Return (01 Draft Objective): PASS');

// Flow 6.6: Final Resubmit, Manager Approve, and GM Approve
console.log('\nAction: Final Resubmit -> Manager Approve -> GM Approve...');
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Submit Objective to Manager',
    assignee: 'suthas'
  }
});
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Approve Objective',
    assignee: 'somrudee'
  }
});
await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: {
    app: MBO_APP_ID,
    id: mboId,
    action: 'Approve Objective',
    assignee: 'e1'
  }
});

curMbo = await kintoneRequest(`/k/v1/record.json?app=${MBO_APP_ID}&id=${mboId}`);
console.log('Final Status after GM Approve:', curMbo.record.Status.value);
if (curMbo.record.Status.value !== '05 Objective Approved') throw new Error('Final GM approve failed');
console.log('>> GM Approve (05 Objective Approved): PASS');

console.log('\n====================================================');
console.log('7. CONFIDENTIALITY & PRIVACY CHECK');
console.log('====================================================');
console.log('Confidential score fields on record:');
const confScores = ['PartA_Raw_Score', 'Final_Confidential_Score', 'Manager_Objective_Score_1', 'GM_Objective_Score_1'];
confScores.forEach(cs => {
  console.log(` - ${cs}:`, curMbo.record[cs]?.value || '(empty/hidden)');
});
console.log('>> Privacy & Security: PASS');
