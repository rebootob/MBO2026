import { kintoneRequest } from '../../src/core/kintone-client.js';

console.log('=== Manager E1 Group Users ===');
const mgrGroup = await kintoneRequest('/v1/group/users.json?code=' + encodeURIComponent('Manager E1_3rRQN0'));
console.log('Manager E1 users:', mgrGroup.users.map(u => ({ code: u.code, name: u.name, email: u.email })));

console.log('\n=== GM E1 Group Users ===');
const gmGroup = await kintoneRequest('/v1/group/users.json?code=' + encodeURIComponent('GM E1_bSNAZ9'));
console.log('GM E1 users:', gmGroup.users.map(u => ({ code: u.code, name: u.name, email: u.email })));

console.log('\n=== App 283 Process Management Actions & Assignees ===');
const proc283 = await kintoneRequest('/k/v1/app/status.json?app=283');
console.log('App 283 States:');
Object.entries(proc283.states).forEach(([stName, stObj]) => {
  if (stName.includes('E1') || stName.includes('1st-') || stName.includes('Review')) {
    console.log(` - State: "${stName}", Assignee:`, JSON.stringify(stObj.assignee));
  }
});
