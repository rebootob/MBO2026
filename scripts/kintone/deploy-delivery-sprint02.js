import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Helper to build Classic Kintone Browser Bundle from src/ui/hr-control-center.js
export function buildClassicHrccBundle(sourceText, registry = {}) {
  let code = sourceText;

  const registryObjString = JSON.stringify({
    mboV2AppId: registry.mboV2AppId || 794,
    routingMasterAppId: registry.routingMasterAppId || 795,
    scoringConfigMasterAppId: registry.scoringConfigMasterAppId || 796,
    hoshinMasterAppId: registry.hoshinMasterAppId || 797,
    revisionArchiveAppId: registry.revisionArchiveAppId || 798,
    hrControlCenterAppId: registry.hrControlCenterAppId || 800
  });

  // Replace source's export const DEFAULT_APP_IDS declaration directly
  const defaultAppIdsRegex = /export\s+const\s+DEFAULT_APP_IDS\s+=\s+Object\.freeze\([\s\S]*?\);/;
  if (defaultAppIdsRegex.test(code)) {
    code = code.replace(defaultAppIdsRegex, `const DEFAULT_APP_IDS = Object.freeze(${registryObjString});`);
  } else {
    code = `const DEFAULT_APP_IDS = Object.freeze(${registryObjString});\n` + code;
  }

  // Remove remaining ES-module exports
  code = code.replace(/export\s+const\s+/g, 'const ');
  code = code.replace(/export\s+function\s+/g, 'function ');
  code = code.replace(/export\s+async\s+function\s+/g, 'async function ');

  // Wrap in IIFE
  const bundle = `(function() {
  'use strict';
${code}
})();`;

  // Verify no import/export tokens remain
  if (/\bimport\b/.test(bundle) || /\bexport\b/.test(bundle)) {
    throw new Error('BUNDLE BUILD ERROR: Classic bundle contains forbidden import/export statements.');
  }

  // Verify exact declaration count of DEFAULT_APP_IDS is 1
  const declCount = (bundle.match(/const DEFAULT_APP_IDS/g) || []).length;
  if (declCount !== 1) {
    throw new Error(`BUNDLE BUILD ERROR: Expected exactly 1 DEFAULT_APP_IDS declaration, found ${declCount}`);
  }

  // Real JS syntax parse check before returning
  try {
    new Function(bundle);
  } catch (err) {
    throw new Error(`BUNDLE SYNTAX PARSE ERROR: ${err.message}`);
  }

  return bundle;
}

export async function executeDeploy() {
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
      const status = res.status;
      throw new Error(`HTTP ${status} for ${method} ${relPath}: Request failed.`);
    }
    return await res.json();
  }

  async function uploadFileContent(contentBuffer, filename, contentType) {
    const url = `${baseUrl}/k/v1/file.json`;
    const formData = new FormData();
    const blob = new Blob([contentBuffer], { type: contentType });
    formData.append('file', blob, filename);

    const res = await fetch(url, {
      method: 'POST',
      headers: { ...headers },
      body: formData
    });

    if (!res.ok) {
      throw new Error(`File upload failed for ${filename} with HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.fileKey;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const rawSource = fs.readFileSync('src/ui/hr-control-center.js', 'utf8');
  const classicBundle = buildClassicHrccBundle(rawSource, sandboxRegistry);
  const cssContent = fs.readFileSync('src/styles/hr-control-center.css');

  // Validate exact app name
  const liveSettingsBefore = await appFetch(`/k/v1/app/settings.json?app=${hrccAppId}`);
  if (liveSettingsBefore.name !== 'MBO HR Control Center [Sandbox]') {
    throw new Error(`DEPLOYMENT BLOCKED: Expected App ${hrccAppId} name "MBO HR Control Center [Sandbox]", got "${liveSettingsBefore.name}"`);
  }

  console.log(`Uploading Classic JS Bundle & CSS customization to HRCC App ${hrccAppId}...`);
  const jsFileKey = await uploadFileContent(Buffer.from(classicBundle, 'utf8'), 'hr-control-center-bundle.js', 'text/javascript');
  const cssFileKey = await uploadFileContent(cssContent, 'hr-control-center.css', 'text/css');

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

  await appFetch('/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: { apps: [{ app: hrccAppId, revision: customizeRes.revision }] }
  });

  let deploySuccess = false;
  for (let i = 0; i < 30; i++) {
    const s = await appFetch(`/k/v1/preview/app/deploy.json?apps[0]=${hrccAppId}`);
    const status = s.apps?.[0]?.status;
    if (status === 'SUCCESS') {
      deploySuccess = true;
      break;
    }
    await sleep(2000);
  }

  if (!deploySuccess) {
    throw new Error(`DEPLOYMENT FAILED: App ${hrccAppId} deployment status did not reach SUCCESS`);
  }

  const liveSettingsAfter = await appFetch(`/k/v1/app/settings.json?app=${hrccAppId}`);
  const liveAclAfter = await appFetch(`/k/v1/app/acl.json?app=${hrccAppId}`);
  const liveCustomizeAfter = await appFetch(`/k/v1/app/customize.json?app=${hrccAppId}`);

  m.assertCreatorOnlyAcl(liveAclAfter, 'HRCC_LIVE_ACL_CHECK');

  if (!liveCustomizeAfter.desktop?.js?.some(j => j.type === 'FILE') || !liveCustomizeAfter.desktop?.css?.some(c => c.type === 'FILE')) {
    throw new Error('DEPLOYMENT VERIFICATION FAILED: Live customization metadata is missing JS/CSS FILE entries.');
  }

  console.log(`SUCCESS: App ${hrccAppId} ("${liveSettingsAfter.name}") deployed live with Classic JS Bundle! ACL=CREATOR_ONLY.`);
}

// Auto-run if executed directly as script CLI
if (process.argv[1] && process.argv[1].endsWith('deploy-delivery-sprint02.js')) {
  executeDeploy().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
