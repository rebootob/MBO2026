import { kintoneRequest } from '../../src/core/kintone-client.js';

console.log('=== 1. App 283 Form Fields ===');
const app283Fields = await kintoneRequest('/k/v1/app/form/fields.json?app=283');
console.log('App 283 Field Codes:', Object.keys(app283Fields.properties));

console.log('\n=== 2. Members of Manager E1 Group ("Manager E1_3rRQN0") ===');
try {
  const mgrGroup = await kintoneRequest('/v1/group/users.json?code=' + encodeURIComponent('Manager E1_3rRQN0'));
  console.log('Manager E1 members:', mgrGroup.users);
} catch (e) {
  console.error('Error fetching Manager E1 users:', e.message);
}

console.log('\n=== 3. Members of GM E1 Group ("GM E1_bSNAZ9") ===');
try {
  const gmGroup = await kintoneRequest('/v1/group/users.json?code=' + encodeURIComponent('GM E1_bSNAZ9'));
  console.log('GM E1 members:', gmGroup.users);
} catch (e) {
  console.error('Error fetching GM E1 users:', e.message);
}

console.log('\n=== 4. Members of Manager HR Group ("Manager HR_x52y75") ===');
try {
  const hrGroup = await kintoneRequest('/v1/group/users.json?code=' + encodeURIComponent('Manager HR_x52y75'));
  console.log('Manager HR members:', hrGroup.users);
} catch (e) {
  console.error('Error fetching HR users:', e.message);
}

console.log('\n=== 5. Query App 283 records for TME1 or Gritchai ===');
try {
  const fields = Object.keys(app283Fields.properties);
  const userField = fields.find(f => app283Fields.properties[f].type === 'USER_SELECT');
  console.log('App 283 User Select field:', userField);
  
  const recs = await kintoneRequest('/k/v1/records.json?app=283&query=' + encodeURIComponent('limit 5'));
  console.log('App 283 sample records count:', recs.records.length);
  if (recs.records.length > 0) {
    const r = recs.records[0];
    console.log('App 283 Record 0 sample values:');
    fields.forEach(f => {
      if (r[f]?.value) {
        console.log(`  ${f} (${r[f].type}):`, JSON.stringify(r[f].value).substring(0, 80));
      }
    });
  }
} catch (e) {
  console.error('Error querying App 283 records:', e.message);
}

console.log('\n=== 6. All Kintone Users ===');
const allUsers = await kintoneRequest('/v1/users.json?size=100');
allUsers.users.forEach(u => {
  console.log(`User: code="${u.code}", name="${u.name}", email="${u.email}"`);
});
