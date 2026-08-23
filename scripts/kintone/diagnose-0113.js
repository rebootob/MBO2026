import { kintoneRequest } from '../../src/core/kintone-client.js';

// 1. Inspect Fiscal_Year field in App 794
const app794Fields = await kintoneRequest('/k/v1/app/form/fields.json?app=794');
console.log('App 794 Fiscal_Year field definition:', JSON.stringify(app794Fields.properties.Fiscal_Year));

// 2. Query App 53 for Employee 0113
const numVal = parseInt('0113', 10);
const q53 = `(Number = "${numVal}" or Number = "0113") limit 2`;
const empRes = await kintoneRequest(`/k/v1/records.json?app=53&query=${encodeURIComponent(q53)}`);
console.log('App 53 search for 0113 result count:', empRes.records.length);
if (empRes.records.length > 0) {
  const emp = empRes.records[0];
  console.log('Employee Profile Found:');
  console.log(' - Number:', emp.Number?.value);
  console.log(' - Name:', emp.Text?.value);
  console.log(' - Name TH:', emp.Text_0?.value);
  console.log(' - Section:', emp.Drop_down?.value);
  console.log(' - Department:', emp.Drop_down_0?.value);
  console.log(' - Position:', emp.Text_2?.value);
  console.log(' - Start Date:', emp.Date?.value);
}

// 3. Query App 795 for TMH2 routing
const q795 = `Section_Code = "TMH2" and Active in ("Active") limit 2`;
const routeRes = await kintoneRequest(`/k/v1/records.json?app=795&query=${encodeURIComponent(q795)}`);
console.log('App 795 search for Section TMH2 count:', routeRes.records.length);

// 4. Query all active sections in App 795
const allRoutes = await kintoneRequest(`/k/v1/records.json?app=795&query=${encodeURIComponent('Active in ("Active")')}`);
console.log('All configured active sections in App 795:', allRoutes.records.map(r => r.Section_Code.value));
