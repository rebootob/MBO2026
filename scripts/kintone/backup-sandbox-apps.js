import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { assertSandboxWriteTarget, getSandboxAppIds } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const endpoints = {
  fields: '/k/v1/app/form/fields.json?app=',
  layout: '/k/v1/app/form/layout.json?app=',
  views: '/k/v1/app/views.json?app=',
  process: '/k/v1/app/status.json?app=',
  appPermissions: '/k/v1/app/acl.json?app=',
  recordPermissions: '/k/v1/record/acl.json?app=',
  fieldPermissions: '/k/v1/field/acl.json?app=',
  customization: '/k/v1/app/customize.json?app='
};
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

for (const appId of getSandboxAppIds(sandboxRegistry)) {
  assertSandboxWriteTarget(appId);
  const directory = join('backups', `app-${appId}`, timestamp);
  await mkdir(directory, { recursive: true });
  for (const [name, endpoint] of Object.entries(endpoints)) {
    const data = await kintoneRequest(`${endpoint}${appId}`);
    await writeFile(join(directory, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);
  }
}

console.log(`Sandbox configuration backup completed: ${timestamp}`);
