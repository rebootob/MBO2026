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
    throw new Error('TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Live customization is missing or invalid.');
  }
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Preview customization is missing or invalid.');
  }

  if (liveCustomize.scope !== previewCustomize.scope) {
    throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Scope mismatch between live (${liveCustomize.scope}) and preview (${previewCustomize.scope}).`);
  }

  const compareEntries = (liveList = [], previewList = [], sectionName) => {
    if (liveList.length !== previewList.length) {
      throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: ${sectionName} entry count mismatch between live (${liveList.length}) and preview (${previewList.length}).`);
    }
    for (let i = 0; i < liveList.length; i++) {
      const l = liveList[i];
      const p = previewList[i];
      if (l.type !== p.type) {
        throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] type mismatch between live (${l.type}) and preview (${p.type}).`);
      }
      if (l.type === 'URL') {
        if (l.url !== p.url) {
          throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] URL mismatch between live (${l.url}) and preview (${p.url}).`);
        }
      } else if (l.type === 'FILE') {
        if (l.file?.name !== p.file?.name) {
          throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] FILE name mismatch between live (${l.file?.name}) and preview (${p.file?.name}).`);
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

export function validatePreflight({ liveCustomize, previewCustomize, targetFileName = 'mbo-employee-app.js' }) {
  if (!liveCustomize || typeof liveCustomize !== 'object') {
    throw new Error('TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Live customization is missing or invalid.');
  }
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Preview customization is missing or invalid.');
  }

  // 1. Scope must be non-empty string and match between live & preview
  if (!liveCustomize.scope || typeof liveCustomize.scope !== 'string' || liveCustomize.scope.trim() === '') {
    throw new Error('MISSING_SCOPE_BLOCKED_PRE_UPLOAD: Live customization scope is missing or blank.');
  }
  if (!previewCustomize.scope || typeof previewCustomize.scope !== 'string' || previewCustomize.scope.trim() === '') {
    throw new Error('MISSING_SCOPE_BLOCKED_PRE_UPLOAD: Preview customization scope is missing or blank.');
  }
  if (liveCustomize.scope !== previewCustomize.scope) {
    throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Scope mismatch between live (${liveCustomize.scope}) and preview (${previewCustomize.scope}).`);
  }

  // 2. Preview revision must be present and non-empty
  const revStr = previewCustomize.revision !== null && previewCustomize.revision !== undefined ? String(previewCustomize.revision).trim() : '';
  if (!revStr) {
    throw new Error('MISSING_REVISION_BLOCKED_PRE_UPLOAD: Preview customization revision is missing or blank.');
  }

  // 3. Entry validation (supported types, URLs, file names, retained fileKeys)
  const validateEntryList = (list = [], sectionName, isPreview = false) => {
    if (!Array.isArray(list)) {
      throw new Error(`MALFORMED_ENTRY_BLOCKED_PRE_UPLOAD: ${sectionName} is not an array.`);
    }
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || typeof e !== 'object') {
        throw new Error(`MALFORMED_ENTRY_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] is invalid.`);
      }
      if (!['URL', 'FILE'].includes(e.type)) {
        throw new Error(`UNSUPPORTED_ENTRY_TYPE_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] has unsupported type "${e.type}".`);
      }
      if (e.type === 'URL') {
        if (!e.url || typeof e.url !== 'string' || e.url.trim() === '') {
          throw new Error(`MALFORMED_URL_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] has missing or empty url.`);
        }
      } else if (e.type === 'FILE') {
        if (!e.file || typeof e.file !== 'object' || !e.file.name || typeof e.file.name !== 'string' || e.file.name.trim() === '') {
          throw new Error(`MALFORMED_FILE_NAME_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] has missing or empty file.name.`);
        }
        if (isPreview && e.file.name !== targetFileName) {
          if (!e.file.fileKey || typeof e.file.fileKey !== 'string' || e.file.fileKey.trim() === '') {
            throw new Error(`MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD: ${sectionName}[${i}] (${e.file.name}) is missing preview fileKey.`);
          }
        }
      }
    }
  };

  validateEntryList(liveCustomize.desktop?.js, 'live desktop.js');
  validateEntryList(liveCustomize.desktop?.css, 'live desktop.css');
  validateEntryList(liveCustomize.mobile?.js, 'live mobile.js');
  validateEntryList(liveCustomize.mobile?.css, 'live mobile.css');

  validateEntryList(previewCustomize.desktop?.js, 'preview desktop.js', true);
  validateEntryList(previewCustomize.desktop?.css, 'preview desktop.css', true);
  validateEntryList(previewCustomize.mobile?.js, 'preview mobile.js', true);
  validateEntryList(previewCustomize.mobile?.css, 'preview mobile.css', true);

  // 4. Topology alignment
  validateTopologyAlignment(liveCustomize, previewCustomize);

  // 5. Require exactly ONE target entry matching targetFileName in preview desktop JS
  const previewDesktopJs = previewCustomize.desktop?.js || [];
  const targetEntries = previewDesktopJs.filter(e => e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

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
        throw new Error(`MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD: Missing fileKey for FILE entry ${entry.file?.name || 'unknown'}.`);
      }
      return { type: 'FILE', file: { fileKey } };
    }
    throw new Error(`UNSUPPORTED_ENTRY_TYPE_BLOCKED_PRE_UPLOAD: Unsupported type ${entry.type}`);
  });
}

export function buildPreviewCustomizePayload({ app, previewCustomize, targetFileName = 'mbo-employee-app.js', newJsFileKey }) {
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('PREVIEW_CUSTOMIZATION_MISSING: previewCustomize is required.');
  }
  if (!previewCustomize.scope || typeof previewCustomize.scope !== 'string' || previewCustomize.scope.trim() === '') {
    throw new Error('MISSING_SCOPE_BLOCKED_PRE_UPLOAD: previewCustomize.scope is missing.');
  }

  const revStr = previewCustomize.revision !== null && previewCustomize.revision !== undefined ? String(previewCustomize.revision).trim() : '';
  if (!revStr) {
    throw new Error('MISSING_REVISION_BLOCKED_PRE_UPLOAD: previewCustomize.revision is missing.');
  }

  const desktopJs = previewCustomize.desktop?.js || [];
  const targetEntries = desktopJs.filter(e => e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

  const normalizedDesktopJs = normalizeCustomizeEntries(desktopJs, targetFileName, newJsFileKey);
  const normalizedDesktopCss = normalizeCustomizeEntries(previewCustomize.desktop?.css, null, null);
  const normalizedMobileJs = normalizeCustomizeEntries(previewCustomize.mobile?.js, null, null);
  const normalizedMobileCss = normalizeCustomizeEntries(previewCustomize.mobile?.css, null, null);

  return {
    app,
    scope: previewCustomize.scope,
    revision: previewCustomize.revision,
    desktop: {
      js: normalizedDesktopJs,
      css: normalizedDesktopCss
    },
    mobile: {
      js: normalizedMobileJs,
      css: normalizedMobileCss
    }
  };
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

  // PREFLIGHT: FULL DETERMINISTIC VALIDATION BEFORE ANY UPLOAD!
  validatePreflight({ liveCustomize, previewCustomize, targetFileName: 'mbo-employee-app.js' });

  // ONLY AFTER PREFLIGHT PASSES: Upload replacement JS target ONLY (do NOT upload CSS!)
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
