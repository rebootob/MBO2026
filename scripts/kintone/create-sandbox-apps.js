import { kintoneRequest } from '../../src/core/kintone-client.js';

const appDefinitions = [
  { key: 'mboV2AppId', name: 'MBO V2 Sandbox' },
  { key: 'routingMasterAppId', name: 'MBO Routing Master Sandbox' }
];

const created = {};
for (const app of appDefinitions) {
  const response = await kintoneRequest('/k/v1/preview/app.json', {
    method: 'POST',
    body: { name: app.name }
  });
  created[app.key] = Number(response.app);
}

console.log(JSON.stringify(created));
