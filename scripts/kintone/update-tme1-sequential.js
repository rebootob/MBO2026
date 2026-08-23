import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const ROUTING_APP_ID = 795;
assertSandboxWriteTarget(ROUTING_APP_ID);

const tme1Query = `Section_Code = "TME1" limit 1`;
const existingTME1 = await kintoneRequest(`/k/v1/records.json?app=${ROUTING_APP_ID}&query=${encodeURIComponent(tme1Query)}`);
if (existingTME1.records.length === 0) throw new Error('TME1 record not found in App 795');

const tme1Id = existingTME1.records[0].$id.value;
const payload = {
  Section_Code: { value: 'TME1' },
  Section_Name: { value: 'TME1' },
  Requester_User: { value: [{ code: 'e1' }] },
  Manager_Level1_Approvers: { value: [{ code: 'suthas' }] },
  Manager_Level1_Approval_Rule: { value: 'ANY' },
  Manager_Level2_Approvers: { value: [] },
  Manager_Level2_Approval_Rule: { value: 'ANY' },
  GM_Level1_Approvers: { value: [{ code: 'somrudee' }] },
  GM_Level1_Approval_Rule: { value: 'ANY' },
  GM_Level2_Approvers: { value: [] },
  GM_Level2_Approval_Rule: { value: 'ANY' },
  Active: { value: 'Active' }
};

await kintoneRequest('/k/v1/record.json', {
  method: 'PUT',
  body: {
    app: ROUTING_APP_ID,
    id: tme1Id,
    record: payload
  }
});

console.log('TME1 updated with sequential routing in App 795.');

// Verify with GET API
const updated = await kintoneRequest(`/k/v1/record.json?app=${ROUTING_APP_ID}&id=${tme1Id}`);
console.log('Verified App 795 TME1 Record:');
console.log(' - Manager_Level1_Approvers:', JSON.stringify(updated.record.Manager_Level1_Approvers.value));
console.log(' - Manager_Level2_Approvers:', JSON.stringify(updated.record.Manager_Level2_Approvers.value));
console.log(' - GM_Level1_Approvers:', JSON.stringify(updated.record.GM_Level1_Approvers.value));
console.log(' - GM_Level2_Approvers:', JSON.stringify(updated.record.GM_Level2_Approvers.value));
