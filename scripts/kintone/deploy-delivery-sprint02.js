import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

delete process.env.KINTONE_API_TOKEN;

const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;
const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;

const m = await import(clientPath);
const writeGuard = await import(writeGuardPath);
const sandboxRegistry = (await import(sandboxAppsPath, { with: { type: 'json' } })).default;

const hrccAppId = sandboxRegistry.hrControlCenterAppId;
if (!hrccAppId || !Number.isInteger(hrccAppId) || hrccAppId <= 0) {
  throw new Error('DEPLOYMENT BLOCKED: hrControlCenterAppId is missing or invalid in config/sandbox-apps.json');
}

console.log(`Targeting HR Control Center App ID: ${hrccAppId}`);

// Enforce sandbox write target guard with explicit process-local allow-list
writeGuard.assertSandboxWriteTarget(hrccAppId, sandboxRegistry, [hrccAppId], { dryRunBypassDiscovery: true });

const { baseUrl, headers } = m.getAppCreationConnection();

async function appFetch(relPath, opts = {}) {
  const url = `${baseUrl}${relPath}`;
  const method = opts.method || 'GET';
  const body = opts.body;
  const res = await fetch(url, {
    method,
    headers: body === undefined ? { ...headers } : { ...headers, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${method} ${relPath}: ${errText}`);
  }
  return await res.json();
}

async function uploadFile(filepath, filename, contentType) {
  const url = `${baseUrl}/k/v1/file.json`;
  const content = fs.readFileSync(filepath);
  const formData = new FormData();
  const blob = new Blob([content], { type: contentType });
  formData.append('file', blob, filename);

  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers },
    body: formData
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`File upload failed HTTP ${res.status}: ${errText}`);
  }
  const data = await res.json();
  console.log(`Uploaded ${filename} -> fileKey: ${data.fileKey}`);
  return data.fileKey;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log(`Uploading JS/CSS customization to HRCC App ${hrccAppId}...`);
const jsFileKey = await uploadFile('src/ui/hr-control-center.js', 'hr-control-center.js', 'text/javascript');
const cssFileKey = await uploadFile('src/styles/hr-control-center.css', 'hr-control-center.css', 'text/css');

const customizeRes = await appFetch('/k/v1/preview/app/customize.json', {
  method: 'PUT',
  body: {
    app: hrccAppId,
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { fileKey: jsFileKey } }],
      css: [{ type: 'FILE', file: { fileKey: cssFileKey } }]
    }
  }
});
console.log(`Customization preview updated for App ${hrccAppId}: revision="${customizeRes.revision}"`);

await appFetch('/k/v1/preview/app/deploy.json', {
  method: 'POST',
  body: { apps: [{ app: hrccAppId, revision: customizeRes.revision }] }
});

for (let i = 0; i < 30; i++) {
  const s = await appFetch(`/k/v1/preview/app/deploy.json?apps[0]=${hrccAppId}`);
  const status = s.apps?.[0]?.status;
  console.log(`Poll HRCC App ${hrccAppId} deploy status: ${status}`);
  if (status === 'SUCCESS') break;
  await sleep(2000);
}

const liveSettings = await appFetch(`/k/v1/app/settings.json?app=${hrccAppId}`);
const liveAcl = await appFetch(`/k/v1/app/acl.json?app=${hrccAppId}`);
m.assertCreatorOnlyAcl(liveAcl, 'HRCC_LIVE_ACL_CHECK');

console.log(`SUCCESS: App ${hrccAppId} ("${liveSettings.name}") deployed live with JS/CSS customization! ACL=CREATOR_ONLY.`);
