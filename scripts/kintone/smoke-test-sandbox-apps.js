import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { kintoneRequest } from '../../src/core/kintone-client.js';

for (const appId of [sandboxRegistry.mboV2AppId, sandboxRegistry.routingMasterAppId]) {
  if (!Number.isInteger(appId)) throw new Error('Sandbox registry is incomplete; smoke test aborted.');
  await kintoneRequest(`/k/v1/app.json?id=${appId}`);
}

console.log('Sandbox smoke test passed: Apps 794 and 795 are accessible.');
