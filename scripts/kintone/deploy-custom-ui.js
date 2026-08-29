import fs from 'node:fs';
import { assertSandboxWriteTarget, assertApp794CustomizationDeployAuthorization } from '../../src/core/sandbox-write-guard.js';
import { buildMboUi } from './build-mbo-ui.js';

const VALID_SCOPES = new Set(['ALL', 'ADMIN', 'NONE']);

/**
 * Prepares production deployment artifacts in memory & dist folder.
 * Validates IIFE syntax and verifies zero ES module import/export residue.
 * Performs NO network/Kintone operations.
 */
export async function prepareDeploymentArtifacts(options = {}) {
  const targetApp = options.appId || 794;
  const buildOptions = options.buildOptions || {};
  const targetOutfile = buildOptions.outfile || 'dist/mbo-employee-app.js';
  await buildMboUi(buildOptions);

  const fullJs = fs.readFileSync(targetOutfile, 'utf8');
  const cssContent = fs.readFileSync('dist/mbo-employee.css', 'utf8');

  // Validation Gate: Classic Bundle Parse & ES Module Residue Check
  try {
    new Function(fullJs);
  } catch (err) {
    throw new Error(`CLASSIC_BUNDLE_PARSE FAILED: ${err.message}`);
  }

  const strippedCode = fullJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  if (/(^|\n)\s*import[\s{]/m.test(strippedCode)) {
    throw new Error('ES_MODULE_IMPORT_COUNT > 0: Bundle contains import statements');
  }

  if (/(^|\n)\s*export[\s{]/m.test(strippedCode)) {
    throw new Error('ES_MODULE_EXPORT_COUNT > 0: Bundle contains export statements');
  }

  return {
    app: targetApp,
    fullJs,
    cssContent
  };
}

function validateContainers(customization, label) {
  if (!customization || typeof customization !== 'object') {
    throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: ${label} customization is missing or invalid.`);
  }
  if (!customization.desktop || typeof customization.desktop !== 'object') {
    throw new Error(`MISSING_DESKTOP_OBJECT_BLOCKED_PRE_UPLOAD: ${label} customization is missing desktop object.`);
  }
  if (!customization.mobile || typeof customization.mobile !== 'object') {
    throw new Error(`MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD: ${label} customization is missing mobile object.`);
  }
  if (!Array.isArray(customization.desktop.js)) {
    throw new Error(`MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD: ${label} customization desktop.js must be an array.`);
  }
  if (!Array.isArray(customization.desktop.css)) {
    throw new Error(`MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD: ${label} customization desktop.css must be an array.`);
  }
  if (!Array.isArray(customization.mobile.js)) {
    throw new Error(`MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD: ${label} customization mobile.js must be an array.`);
  }
  if (!Array.isArray(customization.mobile.css)) {
    throw new Error(`MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD: ${label} customization mobile.css must be an array.`);
  }
}

export function validateTopologyAlignment(liveCustomize, previewCustomize) {
  validateContainers(liveCustomize, 'Live');
  validateContainers(previewCustomize, 'Preview');

  if (liveCustomize.scope !== previewCustomize.scope) {
    throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Scope mismatch between live (${liveCustomize.scope}) and preview (${previewCustomize.scope}).`);
  }

  const compareEntries = (liveList, previewList, sectionName) => {
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

  compareEntries(liveCustomize.desktop.js, previewCustomize.desktop.js, 'desktop.js');
  compareEntries(liveCustomize.desktop.css, previewCustomize.desktop.css, 'desktop.css');
  compareEntries(liveCustomize.mobile.js, previewCustomize.mobile.js, 'mobile.js');
  compareEntries(liveCustomize.mobile.css, previewCustomize.mobile.css, 'mobile.css');

  return true;
}

export function validatePreflight({ liveCustomize, previewCustomize, targetFileName = 'mbo-employee-app.js' }) {
  // 1. Explicit containers & lists
  validateContainers(liveCustomize, 'Live');
  validateContainers(previewCustomize, 'Preview');

  // 2. Strict Kintone scope validation
  if (!liveCustomize.scope || typeof liveCustomize.scope !== 'string' || !VALID_SCOPES.has(liveCustomize.scope)) {
    throw new Error(`INVALID_SCOPE_BLOCKED_PRE_UPLOAD: Live customization scope is invalid (${liveCustomize.scope}).`);
  }
  if (!previewCustomize.scope || typeof previewCustomize.scope !== 'string' || !VALID_SCOPES.has(previewCustomize.scope)) {
    throw new Error(`INVALID_SCOPE_BLOCKED_PRE_UPLOAD: Preview customization scope is invalid (${previewCustomize.scope}).`);
  }
  if (liveCustomize.scope !== previewCustomize.scope) {
    throw new Error(`TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: Scope mismatch between live (${liveCustomize.scope}) and preview (${previewCustomize.scope}).`);
  }

  // 3. Preview revision validation (concurrency protection)
  const rev = previewCustomize.revision;
  if (rev === undefined || rev === null || (typeof rev === 'string' && rev.trim() === '')) {
    throw new Error('MISSING_REVISION_BLOCKED_PRE_UPLOAD: Preview customization revision is missing or blank.');
  }
  if (rev === -1 || rev === '-1') {
    throw new Error('REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD: Preview customization revision -1 disables concurrency protection.');
  }
  const numRev = Number(rev);
  if (isNaN(numRev) || !Number.isInteger(numRev)) {
    throw new Error(`REVISION_NON_NUMERIC_BLOCKED_PRE_UPLOAD: Preview customization revision "${rev}" is non-integer/malformed.`);
  }
  if (numRev <= 0) {
    throw new Error(`REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD: Preview customization revision ${numRev} is not a positive integer.`);
  }

  // 4. Require exactly ONE target entry in preview.desktop.js
  const previewDesktopJs = previewCustomize.desktop.js;
  const targetEntries = previewDesktopJs.filter(e => e && e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

  const exactTargetEntry = targetEntries[0];

  // 5. Entry structural & fileKey validation across all lists
  const validateEntryList = (list, sectionName, isPreview = false, targetEntry = null) => {
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
        if (isPreview) {
          const isExactTarget = (e === targetEntry);
          if (!isExactTarget) {
            if (!e.file.fileKey || typeof e.file.fileKey !== 'string' || e.file.fileKey.trim() === '') {
              let errCode = 'MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD';
              if (e.file.name === targetFileName) {
                if (sectionName.includes('desktop.css')) errCode = 'SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD';
                else if (sectionName.includes('mobile.js')) errCode = 'SAME_FILENAME_MOBILE_JS_MISSING_KEY_BLOCKED_PRE_UPLOAD';
                else if (sectionName.includes('mobile.css')) errCode = 'SAME_FILENAME_MOBILE_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD';
              }
              throw new Error(`${errCode}: ${sectionName}[${i}] (${e.file.name}) is missing preview fileKey.`);
            }
          }
        }
      }
    }
  };

  validateEntryList(liveCustomize.desktop.js, 'live desktop.js');
  validateEntryList(liveCustomize.desktop.css, 'live desktop.css');
  validateEntryList(liveCustomize.mobile.js, 'live mobile.js');
  validateEntryList(liveCustomize.mobile.css, 'live mobile.css');

  validateEntryList(previewCustomize.desktop.js, 'preview desktop.js', true, exactTargetEntry);
  validateEntryList(previewCustomize.desktop.css, 'preview desktop.css', true, exactTargetEntry);
  validateEntryList(previewCustomize.mobile.js, 'preview mobile.js', true, exactTargetEntry);
  validateEntryList(previewCustomize.mobile.css, 'preview mobile.css', true, exactTargetEntry);

  // 6. Topology alignment
  validateTopologyAlignment(liveCustomize, previewCustomize);

  return true;
}

export function normalizeCustomizeEntries(entries = [], targetEntryRef = null, newJsFileKey = null) {
  return entries.map(entry => {
    if (entry.type === 'URL') {
      return { type: 'URL', url: entry.url };
    }
    if (entry.type === 'FILE') {
      const isTarget = targetEntryRef && entry === targetEntryRef;
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
  validateContainers(previewCustomize, 'Preview');

  if (!previewCustomize.scope || typeof previewCustomize.scope !== 'string' || !VALID_SCOPES.has(previewCustomize.scope)) {
    throw new Error(`INVALID_SCOPE_BLOCKED_PRE_UPLOAD: previewCustomize.scope is invalid (${previewCustomize.scope}).`);
  }

  const rev = previewCustomize.revision;
  if (rev === undefined || rev === null || (typeof rev === 'string' && rev.trim() === '')) {
    throw new Error('MISSING_REVISION_BLOCKED_PRE_UPLOAD: previewCustomize.revision is missing.');
  }
  if (rev === -1 || rev === '-1') {
    throw new Error('REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD: previewCustomize.revision -1 disables concurrency protection.');
  }

  const desktopJs = previewCustomize.desktop.js;
  const targetEntries = desktopJs.filter(e => e && e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

  const exactTargetEntry = targetEntries[0];

  const normalizedDesktopJs = normalizeCustomizeEntries(desktopJs, exactTargetEntry, newJsFileKey);
  const normalizedDesktopCss = normalizeCustomizeEntries(previewCustomize.desktop.css, null, null);
  const normalizedMobileJs = normalizeCustomizeEntries(previewCustomize.mobile.js, null, null);
  const normalizedMobileCss = normalizeCustomizeEntries(previewCustomize.mobile.css, null, null);

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

export async function executeDeployCustomUi(options = {}) {
  const isBuildOnly = options.isBuildOnly ?? process.argv.includes('--build-only');

  // If options.appId is supplied and != 794, fail closed immediately
  if (options.appId !== undefined && options.appId !== 794) {
    throw new Error(`APP794 DEPLOY BLOCKED: Supplied options.appId (${options.appId}) must be exactly 794.`);
  }

  if (isBuildOnly) {
    const { fullJs } = await prepareDeploymentArtifacts({ appId: 794, buildOptions: options.buildOptions });
    console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');
    console.log('[BUILD-ONLY] Candidate bundles built cleanly. Exiting before Kintone upload/API calls.');
    return { app: 794, fullJs, buildOnly: true };
  }

  // 1. Resolve registry target without silent fallback catch
  let sandboxRegistryModule;
  try {
    sandboxRegistryModule = (await import('../../config/sandbox-apps.json', { with: { type: 'json' } })).default;
  } catch (err) {
    throw new Error(`APP794 DEPLOY BLOCKED: Cannot load sandbox-apps.json registry (${err.message}).`);
  }

  const registryAppId = sandboxRegistryModule?.mboV2AppId;
  if (!Number.isInteger(registryAppId) || registryAppId !== 794) {
    throw new Error(`APP794 DEPLOY BLOCKED: Target App ID in sandbox-apps.json (${registryAppId}) must be exactly 794.`);
  }

  // 2. Require narrow App794 customization deploy authorization BEFORE any network/upload path
  assertApp794CustomizationDeployAuthorization(options.authConfig, options.requestConfig);

  // 3. Validate write target with literal ephemeral allow-list [794] and dryRunBypassDiscovery
  assertSandboxWriteTarget(794, sandboxRegistryModule, [794], { dryRunBypassDiscovery: true });

  const { fullJs } = await prepareDeploymentArtifacts({ appId: 794, buildOptions: options.buildOptions });
  console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');

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
  return { app, deployed: true };
}

const isExecutedAsScript = process.argv[1] && (process.argv[1].endsWith('deploy-custom-ui.js') || process.argv[1].endsWith('deploy-custom-ui'));
if (isExecutedAsScript) {
  executeDeployCustomUi().catch(err => {
    console.error('DEPLOY FAILED:', err);
    process.exit(1);
  });
}
