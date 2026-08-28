import fs from 'node:fs';
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';

const isBuildOnly = process.argv.includes('--build-only');
const isExecutedAsScript = process.argv[1] && (process.argv[1].endsWith('deploy-custom-ui.js') || process.argv[1].endsWith('deploy-custom-ui'));

let app = 794;
if (isExecutedAsScript && !isBuildOnly) {
  const sandboxRegistryModule = (await import('../../config/sandbox-apps.json', { with: { type: 'json' } })).default;
  app = sandboxRegistryModule.mboV2AppId;
  assertSandboxWriteTarget(app);
} else {
  try {
    const registry = JSON.parse(fs.readFileSync('config/sandbox-apps.json', 'utf8'));
    app = registry.mboV2AppId || 794;
  } catch {
    app = 794;
  }
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

// Helper Functions Exported for Unit Testing & Customization Payload Building
export function validateTopologyAlignment(liveCustomize, previewCustomize) {
  if (!liveCustomize || typeof liveCustomize !== 'object') {
    throw new Error('TOPOLOGY_DRIFT_BLOCKED: Live customization is missing or invalid.');
  }
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('TOPOLOGY_DRIFT_BLOCKED: Preview customization is missing or invalid.');
  }

  if (liveCustomize.scope !== previewCustomize.scope) {
    throw new Error(`TOPOLOGY_DRIFT_BLOCKED: Scope mismatch between live (${liveCustomize.scope}) and preview (${previewCustomize.scope}).`);
  }

  const compareEntries = (liveList = [], previewList = [], sectionName) => {
    if (liveList.length !== previewList.length) {
      throw new Error(`TOPOLOGY_DRIFT_BLOCKED: ${sectionName} entry count mismatch between live (${liveList.length}) and preview (${previewList.length}).`);
    }
    for (let i = 0; i < liveList.length; i++) {
      const l = liveList[i];
      const p = previewList[i];
      if (l.type !== p.type) {
        throw new Error(`TOPOLOGY_DRIFT_BLOCKED: ${sectionName}[${i}] type mismatch between live (${l.type}) and preview (${p.type}).`);
      }
      if (l.type === 'URL') {
        if (l.url !== p.url) {
          throw new Error(`TOPOLOGY_DRIFT_BLOCKED: ${sectionName}[${i}] URL mismatch between live (${l.url}) and preview (${p.url}).`);
        }
      } else if (l.type === 'FILE') {
        if (l.file?.name !== p.file?.name) {
          throw new Error(`TOPOLOGY_DRIFT_BLOCKED: ${sectionName}[${i}] FILE name mismatch between live (${l.file?.name}) and preview (${p.file?.name}).`);
        }
      }
    }
  };

  compareEntries(liveCustomize.desktop?.js, previewCustomize.desktop?.js, 'desktop.js');
  compareEntries(liveCustomize.desktop?.css, previewCustomize.desktop?.css, 'desktop.css');
  compareEntries(liveCustomize.mobile?.js, previewCustomize.mobile?.js, 'mobile.js');
  compareEntries(liveCustomize.mobile?.css, previewCustomize.mobile?.css, 'mobile.css');

  return true;
}

export function normalizeCustomizeEntries(entries = [], targetFileName = null, newJsFileKey = null) {
  return entries.map(entry => {
    if (entry.type === 'URL') {
      return { type: 'URL', url: entry.url };
    }
    if (entry.type === 'FILE') {
      const isTarget = targetFileName && entry.file?.name === targetFileName;
      const fileKey = isTarget ? newJsFileKey : entry.file?.fileKey;
      if (!fileKey) {
        throw new Error(`PREVIEW_FILEKEY_SOURCE_MISSING: Missing fileKey for FILE entry ${entry.file?.name || 'unknown'}.`);
      }
      return { type: 'FILE', file: { fileKey } };
    }
    throw new Error(`INVALID_CUSTOMIZATION_ENTRY_TYPE: Unsupported type ${entry.type}`);
  });
}

export function buildPreviewCustomizePayload({ app, previewCustomize, targetFileName = 'mbo-employee-app.js', newJsFileKey }) {
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('PREVIEW_CUSTOMIZATION_MISSING: previewCustomize is required.');
  }

  const desktopJs = previewCustomize.desktop?.js || [];
  const targetEntries = desktopJs.filter(e => e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

  const normalizedDesktopJs = normalizeCustomizeEntries(desktopJs, targetFileName, newJsFileKey);
  const normalizedDesktopCss = normalizeCustomizeEntries(previewCustomize.desktop?.css, null, null);
  const normalizedMobileJs = normalizeCustomizeEntries(previewCustomize.mobile?.js, null, null);
  const normalizedMobileCss = normalizeCustomizeEntries(previewCustomize.mobile?.css, null, null);

  const payload = {
    app,
    scope: previewCustomize.scope || 'ALL',
    desktop: {
      js: normalizedDesktopJs,
      css: normalizedDesktopCss
    },
    mobile: {
      js: normalizedMobileJs,
      css: normalizedMobileCss
    }
  };

  if (previewCustomize.revision !== undefined && previewCustomize.revision !== null) {
    payload.revision = previewCustomize.revision;
  }

  return payload;
}

if (isExecutedAsScript && !isBuildOnly) {
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

  // Read live and preview customization
  const liveCustomize = await kintoneRequest(`/k/v1/app/customize.json?app=${app}`);
  const previewCustomize = await kintoneRequest(`/k/v1/preview/app/customize.json?app=${app}`);

  // Fail closed if live vs preview topology or scope differ unexpectedly
  validateTopologyAlignment(liveCustomize, previewCustomize);

  // Upload replacement JS target ONLY (do NOT upload CSS!)
  const jsFileKey = await uploadFile('mbo-employee-app.js', fullJs, 'text/javascript');

  // Build Preview PUT payload from previewCustomize state using preview fileKeys
  const putPayload = buildPreviewCustomizePayload({
    app,
    previewCustomize,
    targetFileName: 'mbo-employee-app.js',
    newJsFileKey: jsFileKey
  });

  // 3. Put Customization to Preview (preserving non-target preview entries)
  await kintoneRequest('/k/v1/preview/app/customize.json', {
    method: 'PUT',
    body: putPayload
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
}
