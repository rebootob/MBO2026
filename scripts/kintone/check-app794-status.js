import { kintoneRequest } from '../../src/core/kintone-client.js';

const status794 = await kintoneRequest('/k/v1/app/status.json?app=794');
console.log('App 794 Process Management Enabled:', status794.enable);
console.log('App 794 States:');
Object.entries(status794.states).forEach(([name, st]) => {
  console.log(` - State [index ${st.index}]: "${name}"`);
  console.log(`   Assignee:`, JSON.stringify(st.assignee));
});

console.log('\nApp 794 Actions:');
status794.actions.forEach(a => {
  console.log(` - Action: "${a.name}": "${a.from}" -> "${a.to}" (filter: ${JSON.stringify(a.filterCond)})`);
});
