import fs from 'node:fs';
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';

const isBuildOnly = process.argv.includes('--build-only');

const sandboxRegistryModule = isBuildOnly
  ? JSON.parse(fs.readFileSync('config/sandbox-apps.json', 'utf8'))
  : (await import('../../config/sandbox-apps.json', { with: { type: 'json' } })).default;

const app = sandboxRegistryModule.mboV2AppId;
if (!isBuildOnly) {
  assertSandboxWriteTarget(app);
}

function cleanEsModules(jsText) {
  return jsText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+\{[\s\S]*?\};?/g, '');
}

// 1. Build Single JS File
const constantsJs = cleanEsModules(fs.readFileSync('src/config/constants.js', 'utf8'));
const fiscalYearEngineJs = cleanEsModules(fs.readFileSync('src/core/fiscal-year-engine.js', 'utf8'));
const scoringConfigMasterJs = cleanEsModules(fs.readFileSync('src/profiles/scoring-config-master.js', 'utf8'));
const profileScoringResolverJs = cleanEsModules(fs.readFileSync('src/profiles/profile-scoring-resolver.js', 'utf8'));
const hostResolverJs = cleanEsModules(fs.readFileSync('src/ui/host-resolver.js', 'utf8'));
const validationJs = cleanEsModules(fs.readFileSync('src/validation/validation-engine.js', 'utf8'));
const employeeServiceJs = cleanEsModules(fs.readFileSync('src/services/employee-service.js', 'utf8'));
const routingServiceJs = cleanEsModules(fs.readFileSync('src/services/routing-service.js', 'utf8'));
const authAdapterJs = cleanEsModules(fs.readFileSync('src/ui/mbo-kintone-auth-adapter.js', 'utf8'));
const loginGateJs = cleanEsModules(fs.readFileSync('src/ui/mbo-kintone-login-gate.js', 'utf8'));
const uiJs = cleanEsModules(fs.readFileSync('src/ui/employee-part-a-ui.js', 'utf8'));
const mainJs = cleanEsModules(fs.readFileSync('src/main-mbo-app.js', 'utf8'));

const fullJs = `
(function() {
  'use strict';

  ${constantsJs}

  ${fiscalYearEngineJs}

  ${scoringConfigMasterJs}

  ${profileScoringResolverJs}

  ${hostResolverJs}

  ${validationJs}

  ${employeeServiceJs}

  ${routingServiceJs}

  ${authAdapterJs}

  ${loginGateJs}

  ${uiJs}

  ${mainJs}

})();
`;

// Validation Gate: Classic Bundle Parse & ES Module Residue Check
try {
  new Function(fullJs);
} catch (err) {
  throw new Error(`CLASSIC_BUNDLE_PARSE FAILED: ${err.message}`);
}

if (/\bimport\b/.test(fullJs)) {
  throw new Error('ES_MODULE_IMPORT_COUNT > 0: Bundle contains import statements');
}

if (/\bexport\b/.test(fullJs)) {
  throw new Error('ES_MODULE_EXPORT_COUNT > 0: Bundle contains export statements');
}

if (/}\s*from\s*['"]/.test(fullJs)) {
  throw new Error('BROKEN_FROM_RESIDUE_COUNT > 0: Bundle contains broken from residue');
}

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/mbo-employee-app.js', fullJs, 'utf8');

const cssContent = fs.readFileSync('src/styles/mbo-employee.css', 'utf8');
fs.writeFileSync('dist/mbo-employee.css', cssContent, 'utf8');

console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');

if (isBuildOnly) {
  console.log('[BUILD-ONLY] Candidate bundles built cleanly. Exiting before Kintone upload/API calls.');
  process.exit(0);
}

// 2. Upload Files to Kintone
const { kintoneRequest, getKintoneConnection } = await import('../../src/core/kintone-client.js');

async function uploadFile(filename, content, contentType) {
  const { baseUrl, headers } = getKintoneConnection();
  const formData = new FormData();
  const blob = new Blob([content], { type: contentType });
  formData.append('file', blob, filename);

  const authHeaders = { ...headers };
  delete authHeaders['Content-Type'];

  const resp = await fetch(`${baseUrl}/k/v1/file.json`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });

  if (!resp.ok) {
    throw new Error(`File upload failed: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json();
  console.log(`Uploaded ${filename} -> fileKey: ${data.fileKey}`);
  return data.fileKey;
}

// Read live customization to preserve non-target entries
const liveCustomize = await kintoneRequest(`/k/v1/app/customize.json?app=${app}`);
const desktopJsEntries = liveCustomize.desktop?.js || [];
const targetEntries = desktopJsEntries.filter(e => e.type === 'FILE' && e.file?.name === 'mbo-employee-app.js');

if (targetEntries.length !== 1) {
  throw new Error(`DEPLOY BLOCKED: Expected exactly 1 desktop FILE entry named mbo-employee-app.js, found ${targetEntries.length}`);
}

const jsFileKey = await uploadFile('mbo-employee-app.js', fullJs, 'text/javascript');

// Replace fileKey for target entry only; preserve desktop CSS, mobile entries, and scope
const updatedDesktopJs = desktopJsEntries.map(entry => {
  if (entry.type === 'FILE' && entry.file?.name === 'mbo-employee-app.js') {
    return { type: 'FILE', file: { fileKey: jsFileKey } };
  }
  return entry;
});

// 3. Put Customization to Preview (preserving non-target entries)
await kintoneRequest('/k/v1/preview/app/customize.json', {
  method: 'PUT',
  body: {
    app,
    scope: liveCustomize.scope || 'ALL',
    desktop: {
      js: updatedDesktopJs,
      css: liveCustomize.desktop?.css || []
    },
    mobile: {
      js: liveCustomize.mobile?.js || [],
      css: liveCustomize.mobile?.css || []
    }
  }
});

console.log('Customization preview updated.');

// 4. Deploy Live Sandbox App 794
await kintoneRequest('/k/v1/preview/app/deploy.json', {
  method: 'POST',
  body: { apps: [{ app }] }
});

console.log(`Live deployment requested for App ${app}. Polling status...`);

// Poll until deployment is complete
let deployed = false;
for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 1500));
  const res = await kintoneRequest(`/k/v1/preview/app/deploy.json?apps[0]=${app}`);
  const status = res.apps?.[0]?.status;
  console.log(`Deployment status check ${i + 1}: ${status}`);
  if (status === 'SUCCESS') {
    deployed = true;
    break;
  }
  if (status === 'FAIL') {
    throw new Error('Sandbox app deployment failed.');
  }
}

if (!deployed) {
  throw new Error('Deployment timeout.');
}

console.log(`MBO V2 Sandbox (App ${app}) Custom UI successfully deployed to LIVE!`);
