import { kintoneRequest } from '../../src/core/kintone-client.js';

const fields = await kintoneRequest('/k/v1/app/form/fields.json?app=795');
console.log('App 795 Fields:');
Object.entries(fields.properties).forEach(([code, prop]) => {
  console.log(` - ${code} (${prop.type}): label="${prop.label}"`);
});

const existing = await kintoneRequest('/k/v1/records.json?app=795');
console.log('App 795 Existing Records count:', existing.records.length);
if (existing.records.length > 0) {
  console.log('Sample Record:', existing.records[0]);
}
