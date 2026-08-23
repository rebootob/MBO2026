import { kintoneRequest } from '../../src/core/kintone-client.js';

console.log('=== 1. App 53 Lookup for 0149 ===');
const numVal = parseInt('0149', 10);
const q53 = `(Number = "${numVal}" or Number = "0149") limit 2`;
const empRes = await kintoneRequest(`/k/v1/records.json?app=53&query=${encodeURIComponent(q53)}`);
console.log('App 53 search result count:', empRes.records.length);
if (empRes.records.length > 0) {
  const emp = empRes.records[0];
  console.log('Profile:');
  console.log(' - Employee Code (Number):', emp.Number?.value);
  console.log(' - Name:', emp.Text?.value);
  console.log(' - Name TH:', emp.Text_0?.value);
  console.log(' - Section:', emp.Drop_down?.value);
  console.log(' - Department:', emp.Drop_down_0?.value);
  console.log(' - Position:', emp.Text_2?.value);
  console.log(' - Start Date:', emp.Date?.value);
  console.log(' - Dept Hoshin:', emp.Text_area?.value?.substring(0, 50));
  console.log(' - Sec Hoshin:', emp.Text_area_0?.value?.substring(0, 50));
}

console.log('\n=== 2. App 283 (Legacy PMS) Historical Records for TME1 / 0149 ===');
try {
  const q283_emp = `Number = "0149" or Number = "149" or Number = 149 limit 5`;
  const emp283 = await kintoneRequest(`/k/v1/records.json?app=283&query=${encodeURIComponent(q283_emp)}`);
  console.log('App 283 records for 0149:', emp283.records.length);
  if (emp283.records.length > 0) {
    console.log('Sample App 283 Record for 0149:');
    const r = emp283.records[0];
    console.log(' - $id:', r.$id?.value);
    console.log(' - User fields in record:');
    Object.keys(r).forEach(k => {
      if (r[k]?.type === 'USER_SELECT' || r[k]?.type === 'MODIFIER' || r[k]?.type === 'CREATOR' || k.toLowerCase().includes('user') || k.toLowerCase().includes('manager') || k.toLowerCase().includes('gm') || k.toLowerCase().includes('name')) {
        console.log(`    ${k} (${r[k].type}):`, JSON.stringify(r[k].value));
      }
    });
  }

  const q283_all = `limit 1`;
  const all283 = await kintoneRequest(`/k/v1/records.json?app=283&query=${encodeURIComponent(q283_all)}`);
  if (all283.records.length > 0) {
    console.log('App 283 sample field codes:', Object.keys(all283.records[0]));
    const r0 = all283.records[0];
    Object.keys(r0).forEach(k => {
      if (r0[k]?.type === 'USER_SELECT' || r0[k]?.type === 'ORGANIZATION_SELECT' || r0[k]?.type === 'GROUP_SELECT') {
        console.log(`  [${r0[k].type}] ${k}:`, JSON.stringify(r0[k].value));
      }
    });
  }
} catch (e) {
  console.error('Error querying App 283:', e.message);
}

console.log('\n=== 3. Query Kintone Users / Groups ===');
try {
  const usersRes = await kintoneRequest('/v1/users.json?size=100');
  console.log('Users total count:', usersRes.users?.length);
  const relevantUsers = usersRes.users?.filter(u => 
    u.code.toLowerCase().includes('e1') || 
    u.code.toLowerCase().includes('tme') || 
    u.code.toLowerCase().includes('mgr') || 
    u.code.toLowerCase().includes('gm') || 
    u.code.toLowerCase().includes('admin') || 
    u.name.toLowerCase().includes('gritchai') ||
    u.code.includes('0149') ||
    u.code.includes('149') ||
    u.code.toLowerCase().includes('somphonkrang')
  );
  console.log('Relevant Users found:');
  relevantUsers?.forEach(u => {
    console.log(` - code: "${u.code}", name: "${u.name}", email: "${u.email}", valid: ${u.valid}`);
  });

  const groupsRes = await kintoneRequest('/v1/groups.json?size=100');
  console.log('Groups total count:', groupsRes.groups?.length);
  groupsRes.groups?.forEach(g => {
    console.log(` - group code: "${g.code}", name: "${g.name}"`);
  });
} catch (e) {
  console.error('Error querying users/groups:', e.message);
}
