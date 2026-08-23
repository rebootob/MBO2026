import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { assertSandboxWriteTarget, getSandboxAppIds } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const appIds = getSandboxAppIds(sandboxRegistry);
if (appIds.length !== 2) throw new Error('Sandbox registry is incomplete; deployment aborted.');
appIds.forEach((appId) => assertSandboxWriteTarget(appId));

await kintoneRequest('/k/v1/preview/app/deploy.json', {
  method: 'POST',
  body: { apps: appIds.map((app) => ({ app })) }
});

console.log(`Sandbox deployment requested for App IDs: ${appIds.join(', ')}.`);
