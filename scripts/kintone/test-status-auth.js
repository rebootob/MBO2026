import { getKintoneConnection } from '../../src/core/kintone-client.js';

const conn = getKintoneConnection();
console.log('Base URL:', conn.baseUrl);
console.log('Headers present:', Object.keys(conn.headers));

// Test calling status with Password Auth only (without API token)
const authHeaders = { ...conn.headers };
delete authHeaders['X-Cybozu-API-Token'];

const resp = await fetch(`${conn.baseUrl}/k/v1/record/status.json`, {
  method: 'PUT',
  headers: {
    ...authHeaders,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    app: 794,
    id: 3,
    action: 'Return Objective'
  })
});

console.log('Status code with Password Auth:', resp.status);
const json = await resp.json();
console.log('Response:', json);
