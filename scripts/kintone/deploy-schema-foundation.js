import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';
import { mboFields, routingFields } from '../../config/schema-spec.js';

const withCodes = (properties) => Object.fromEntries(Object.entries(properties).map(([code, definition]) => [code, { ...definition, code }]));
const deployFields = async (app, properties) => { assertSandboxWriteTarget(app); await kintoneRequest('/k/v1/preview/app/form/fields.json', { method: 'POST', body: { app, properties: withCodes(properties) } }); };
await deployFields(sandboxRegistry.routingMasterAppId, routingFields);
await deployFields(sandboxRegistry.mboV2AppId, mboFields);
console.log(`Schema preview fields created: MBO=${Object.keys(mboFields).length}, Routing=${Object.keys(routingFields).length}.`);
