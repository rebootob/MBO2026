import { kintoneRequest } from '../../src/core/kintone-client.js';

console.log('=== App 795 Fields ===');
const f795 = await kintoneRequest('/k/v1/app/form/fields.json?app=795');
Object.entries(f795.properties).forEach(([code, prop]) => {
  console.log(` - ${code} (${prop.type}): label="${prop.label}"`);
});

console.log('\n=== App 794 Fields ===');
const f794 = await kintoneRequest('/k/v1/app/form/fields.json?app=794');
const routingCodes = Object.keys(f794.properties).filter(k => k.toLowerCase().includes('user') || k.toLowerCase().includes('manager') || k.toLowerCase().includes('gm') || k.toLowerCase().includes('routing') || k.toLowerCase().includes('level'));
console.log('Routing-related fields in 794:', routingCodes);
