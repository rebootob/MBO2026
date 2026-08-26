import fs from 'node:fs';
import path from 'node:path';
import { kintoneRequest } from '../../src/core/kintone-client.js';

console.log('=== M10M-R2A LIVE MASTER SETUP AND VERIFICATION ===\n');

// 1. APP 795 DISCOVERY & BACKUP
console.log('--- Step 1: App 795 Pre-Write Discovery & Backup ---');
const pre795Res = await kintoneRequest('/k/v1/records.json?app=795&query=limit%20100');
const pre795Records = pre795Res.records || [];
const preCount = pre795Records.length;
console.log(`PREWRITE_ACTIVE_ROUTE_COUNT = ${preCount}`);

// Backup App 795
const backup795Path = path.resolve('scratch/app795-prewrite-backup.json');
fs.mkdirSync(path.dirname(backup795Path), { recursive: true });
fs.writeFileSync(backup795Path, JSON.stringify(pre795Records, null, 2), 'utf8');
console.log(`App 795 Backup stored at: ${backup795Path}`);

// Check absent keys
const existingKeys = pre795Records.map(r => r.Routing_Key?.value);
const execKeys = ['POSITION_DGM', 'POSITION_GM', 'POSITION_VP'];
execKeys.forEach(k => {
  const found = existingKeys.includes(k);
  console.log(`Pre-write check: ${k} = ${found ? 'FOUND (UNEXPECTED!)' : 'NOT_FOUND (CONFIRMED)'}`);
  if (found) throw new Error(`PREWRITE_CHECK_FAILED: Key ${k} already exists in App 795!`);
});

// 2. APP 795 SEED EXECUTIVE ROWS
console.log('\n--- Step 2: App 795 Seed Executive Direct Rows ---');
const requesters = [
  { code: 'e1' }, { code: 'f1' }, { code: 'f2' }, { code: 'f3' },
  { code: 'g_request' }, { code: 'tmh' }, { code: 's1' }, { code: 't1' }, { code: 't2' }
];
const presidentApprover = [{ code: 'tsuchihira' }];

const execRowDefs = [
  { key: 'POSITION_DGM', secCode: 'EXECUTIVE', secName: 'Executive Direct DGM' },
  { key: 'POSITION_GM', secCode: 'EXECUTIVE', secName: 'Executive Direct GM' },
  { key: 'POSITION_VP', secCode: 'EXECUTIVE', secName: 'Executive Direct VP' }
];

const createdIds = {};

for (const def of execRowDefs) {
  const recordPayload = {
    app: 795,
    record: {
      Routing_Key: { value: def.key },
      Section_Code: { value: def.secCode },
      Section_Name: { value: def.secName },
      Team: { value: '' },
      Requester_User: { value: requesters },
      Manager_Level1_Approvers: { value: presidentApprover },
      Manager_Level1_Approval_Rule: { value: 'ALL' },
      Manager_Level2_Approvers: { value: [] },
      Manager_Level2_Approval_Rule: { value: 'ANY' },
      GM_Level1_Approvers: { value: [] },
      GM_Level1_Approval_Rule: { value: 'ALL' },
      GM_Level2_Approvers: { value: [] },
      GM_Level2_Approval_Rule: { value: 'ANY' },
      Active: { value: 'Active' },
      Effective_From: { value: '2026-04-01' },
      Effective_To: { value: '2027-03-31' },
      Remark: { value: `M10M-R2A Executive Direct Routing for ${def.key}` }
    }
  };

  const postRes = await kintoneRequest('/k/v1/record.json', {
    method: 'POST',
    body: recordPayload,
    bypassDiscovery: true
  });
  createdIds[def.key] = postRes.id;
  console.log(`Created App 795 row: ${def.key} -> Record ID: ${postRes.id}`);
}

// 3. APP 795 READ-BACK VERIFICATION
console.log('\n--- Step 3: App 795 Post-Write Read-Back Verification ---');
const post795Res = await kintoneRequest('/k/v1/records.json?app=795&query=limit%20100');
const post795Records = post795Res.records || [];
const postCount = post795Records.length;
console.log(`APP795_POSTWRITE_ACTIVE_COUNT = ${postCount} (Expected: ${preCount + 3})`);

if (postCount !== preCount + 3) {
  throw new Error(`APP795_COUNT_MISMATCH: Expected ${preCount + 3} records, got ${postCount}`);
}

for (const def of execRowDefs) {
  const rec = post795Records.find(r => r.Routing_Key?.value === def.key);
  if (!rec) throw new Error(`APP795_READBACK_FAILED: Key ${def.key} not found in post-write query!`);
  const mgrL1 = rec.Manager_Level1_Approvers?.value || [];
  const gmL1 = rec.GM_Level1_Approvers?.value || [];
  const reqs = rec.Requester_User?.value || [];

  console.log(`Read-back ${def.key}:`);
  console.log(` - Record ID: ${rec.$id.value}`);
  console.log(` - Manager_Level1_Approvers: ${JSON.stringify(mgrL1)}`);
  console.log(` - GM_Level1_Approvers: ${JSON.stringify(gmL1)}`);
  console.log(` - Active: ${rec.Active?.value}`);

  if (rec.$id.value !== createdIds[def.key]) {
    throw new Error(`APP795_ID_MISMATCH for ${def.key}`);
  }
  if (mgrL1.length !== 1 || mgrL1[0].code !== 'tsuchihira') {
    throw new Error(`APP795_PRESIDENT_MISMATCH for ${def.key}: Expected tsuchihira`);
  }
  if (gmL1.length !== 0) {
    throw new Error(`APP795_GM_DUPLICATION_ERROR for ${def.key}: GM_Level1_Approvers must be empty []`);
  }
}
console.log('APP795_READBACK = PASS');

// 4. APP 796 SCORING MASTER SETUP & READ-BACK
console.log('\n--- Step 4: App 796 Scoring Master Setup & Read-Back ---');
const pre796Res = await kintoneRequest('/k/v1/records.json?app=796&query=limit%20100');
const pre796Records = pre796Res.records || [];
console.log(`App 796 Total Records: ${pre796Records.length}`);

// Backup App 796
const backup796Path = path.resolve('scratch/app796-prewrite-backup.json');
fs.writeFileSync(backup796Path, JSON.stringify(pre796Records, null, 2), 'utf8');

const dgmRec = pre796Records.find(r => r.Profile_Code?.value === 'PROF_DGM');
const gmRec = pre796Records.find(r => r.Profile_Code?.value === 'PROF_GM');
const vpRec = pre796Records.find(r => r.Profile_Code?.value === 'PROF_VP');

console.log(`PROF_DGM ID ${dgmRec.$id.value}: Appraisers = ${dgmRec.Expected_Appraiser_Count?.value}`);
console.log(`PROF_GM  ID ${gmRec.$id.value}: Appraisers = ${gmRec.Expected_Appraiser_Count?.value}`);
console.log(`PROF_VP  ID ${vpRec.$id.value}: Appraisers = ${vpRec.Expected_Appraiser_Count?.value}`);

if (dgmRec.Expected_Appraiser_Count?.value !== '1') {
  console.log(`Updating App 796 Record ID ${dgmRec.$id.value} (PROF_DGM) to Expected_Appraiser_Count = 1...`);
  await kintoneRequest('/k/v1/record.json', {
    method: 'PUT',
    body: {
      app: 796,
      id: Number(dgmRec.$id.value),
      record: {
        Expected_Appraiser_Count: { value: '1' }
      }
    },
    bypassDiscovery: true
  });
  console.log('App 796 Record ID 6 updated successfully.');
}

const post796Res = await kintoneRequest('/k/v1/records.json?app=796&query=limit%20100');
const post796Records = post796Res.records || [];

const postDgm = post796Records.find(r => r.Profile_Code?.value === 'PROF_DGM');
const postGm = post796Records.find(r => r.Profile_Code?.value === 'PROF_GM');
const postVp = post796Records.find(r => r.Profile_Code?.value === 'PROF_VP');

console.log('Post-write App 796 Read-Back:');
console.log(` - PROF_DGM (ID ${postDgm.$id.value}): Appraisers = ${postDgm.Expected_Appraiser_Count?.value}, PartA = ${postDgm.PartA_Weight?.value}, PartB = ${postDgm.PartB_Weight?.value}`);
console.log(` - PROF_GM  (ID ${postGm.$id.value}): Appraisers = ${postGm.Expected_Appraiser_Count?.value}, PartA = ${postGm.PartA_Weight?.value}, PartB = ${postGm.PartB_Weight?.value}`);
console.log(` - PROF_VP  (ID ${postVp.$id.value}): Appraisers = ${postVp.Expected_Appraiser_Count?.value}, PartA = ${postVp.PartA_Weight?.value}, PartB = ${postVp.PartB_Weight?.value}`);

if (postDgm.Expected_Appraiser_Count?.value !== '1' || postGm.Expected_Appraiser_Count?.value !== '1' || postVp.Expected_Appraiser_Count?.value !== '1') {
  throw new Error('APP796_READBACK_FAILED: All three executive profiles must have Expected_Appraiser_Count = 1');
}
console.log('APP796_READBACK = PASS');

// 5. APP 794 PROCESS MANAGEMENT EXEC DIRECT PATH UPDATE
console.log('\n--- Step 5: App 794 Process Management Single-Appraiser Path ---');
const previewSettings794 = await kintoneRequest('/k/v1/preview/app/settings.json?app=794');
const liveSettings794 = await kintoneRequest('/k/v1/app/settings.json?app=794');
console.log(`App 794 Live Revision: ${liveSettings794.revision}, Preview Revision: ${previewSettings794.revision}`);

const pmPreview = await kintoneRequest('/k/v1/preview/app/status.json?app=794');
const backup794Path = path.resolve('scratch/app794-pm-prewrite-backup.json');
fs.writeFileSync(backup794Path, JSON.stringify(pmPreview, null, 2), 'utf8');

const actionsObj = pmPreview.actions || {};
const actionsArray = Object.values(actionsObj);
console.log(`Current App 794 Preview Actions count: ${actionsArray.length}`);

// Check if M1_ONLY actions already exist
const hasM1OnlyObjAction = actionsArray.some(a => a.from === '03 Manager Objective Review' && a.to === '05 Objective Approved');

if (!hasM1OnlyObjAction) {
  console.log('Adding M1_ONLY single-appraiser actions to App 794 Process Management...');
  // Update existing actions going to GM states to filter out M1_ONLY
  actionsArray.forEach(a => {
    if (a.from === '03 Manager Objective Review' && a.to === '04 GM Objective Review') {
      a.filterCond = 'Routing_Topology != "M1_ONLY"';
    }
    if (a.from === '08 Manager Mid-Year Review' && a.to === '09 GM Mid-Year Review') {
      a.filterCond = 'Routing_Topology != "M1_ONLY"';
    }
    if (a.from === '13 Manager Final Evaluation' && a.to === '14 GM Final Evaluation') {
      a.filterCond = 'Routing_Topology != "M1_ONLY"';
    }
  });

  // Add new M1_ONLY direct actions
  const nextIndex = Math.max(...Object.keys(actionsObj).map(Number)) + 1;

  actionsObj[String(nextIndex)] = {
    name: 'Approve Objective',
    from: '03 Manager Objective Review',
    to: '05 Objective Approved',
    filterCond: 'Routing_Topology = "M1_ONLY"'
  };

  actionsObj[String(nextIndex + 1)] = {
    name: 'Approve Mid-Year Manager',
    from: '08 Manager Mid-Year Review',
    to: '10 Mid-Year Completed',
    filterCond: 'Routing_Topology = "M1_ONLY"'
  };

  actionsObj[String(nextIndex + 2)] = {
    name: 'Approve Final Manager',
    from: '13 Manager Final Evaluation',
    to: '15 HR Final Check',
    filterCond: 'Routing_Topology = "M1_ONLY"'
  };

  const updatePmRes = await kintoneRequest('/k/v1/preview/app/status.json', {
    method: 'PUT',
    body: {
      app: 794,
      enable: pmPreview.enable,
      states: pmPreview.states,
      actions: actionsObj,
      revision: pmPreview.revision
    },
    bypassDiscovery: true
  });
  console.log(`App 794 Preview Status updated. New revision: ${updatePmRes.revision}`);

  // Deploy Preview App 794
  console.log('Deploying App 794 Process Management to live...');
  await kintoneRequest('/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: {
      apps: [{ app: 794, revision: updatePmRes.revision }]
    },
    bypassDiscovery: true
  });

  // Poll status
  let deployed = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statusRes = await kintoneRequest('/k/v1/preview/app/deploy.json?apps[0]=794');
    const appStatus = statusRes.apps?.[0]?.status;
    if (appStatus === 'SUCCESS') {
      deployed = true;
      break;
    }
    if (appStatus === 'FAIL' || appStatus === 'CANCEL') {
      throw new Error(`APP794_DEPLOY_FAILED: Final status ${appStatus}`);
    }
  }

  if (!deployed) throw new Error('APP794_DEPLOY_TIMEOUT');
  console.log('App 794 Process Management deployment SUCCESS!');
} else {
  console.log('App 794 Process Management already contains M1_ONLY actions.');
}

const finalLive794PM = await kintoneRequest('/k/v1/app/status.json?app=794');
const finalLive794Settings = await kintoneRequest('/k/v1/app/settings.json?app=794');

console.log('\nApp 794 Final Live Process Management Verification:');
console.log(` - Live Revision: ${finalLive794Settings.revision}`);
console.log(` - States Count: ${Object.keys(finalLive794PM.states || {}).length}`);
console.log(` - Actions Count: ${Object.keys(finalLive794PM.actions || {}).length}`);

console.log('\n=== M10M-R2A LIVE MASTER SETUP COMPLETE AND VERIFIED PASS ===');


