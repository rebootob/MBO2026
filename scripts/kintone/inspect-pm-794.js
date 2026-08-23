import { kintoneRequest } from '../../src/core/kintone-client.js';

const pm = await kintoneRequest('/k/v1/app/status.json?app=794');
console.log('=== App 794 Process Management States ===');
Object.entries(pm.states).forEach(([name, state]) => {
  console.log(`State: "${name}", Assignee:`, JSON.stringify(state.assignee));
});
