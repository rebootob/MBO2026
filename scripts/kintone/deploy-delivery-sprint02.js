import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Helper to validate canonical App800 generated dist artifacts
export function validateHrccBundleArtifacts(opts = {}) {
  const jsPath = opts.jsPath || path.resolve('dist/hr-control-center-bundle.js');
  const cssPath = opts.cssPath || path.resolve('dist/hr-control-center.css');

  if (!fs.existsSync(jsPath)) {
    throw new Error(`CANONICAL ARTIFACT MISSING: ${jsPath} does not exist. Run node scripts/kintone/build-hrcc-ui.js first.`);
  }
  if (!fs.existsSync(cssPath)) {
    throw new Error(`CANONICAL ARTIFACT MISSING: ${cssPath} does not exist. Run node scripts/kintone/build-hrcc-ui.js first.`);
  }

  const jsCode = fs.readFileSync(jsPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath);

  if (!jsCode || jsCode.trim().length === 0) {
    throw new Error(`CANONICAL ARTIFACT INVALID: ${jsPath} is empty.`);
  }
  if (!cssContent || cssContent.length === 0) {
    throw new Error(`CANONICAL ARTIFACT INVALID: ${cssPath} is empty.`);
  }

  if (/\bimport\b/.test(jsCode) || /\bexport\b/.test(jsCode)) {
    throw new Error('CANONICAL ARTIFACT INVALID: Generated JS bundle contains forbidden import/export statements.');
  }

  if (!jsCode.includes('MboKintoneAuthAdapter')) {
    throw new Error('CANONICAL ARTIFACT INVALID: Generated JS bundle is missing MboKintoneAuthAdapter implementation.');
  }

  if (!jsCode.includes('resetMboPassword')) {
    throw new Error('CANONICAL ARTIFACT INVALID: Generated JS bundle is missing resetMboPassword implementation.');
  }

  try {
    new Function(jsCode);
  } catch (err) {
    throw new Error(`CANONICAL ARTIFACT SYNTAX ERROR: ${err.message}`);
  }

  return { jsCode, cssContent, jsPath, cssPath };
}

// Canonical compatibility loader: Always delegates to validateHrccBundleArtifacts() and returns canonical dist JS
export function buildClassicHrccBundle(sourceText, registry = {}) {
  const { jsCode } = validateHrccBundleArtifacts();
  return jsCode;
}

// Least-Privilege App800 ACL Validation Helper
export function assertApp800LeastPrivilegeAcl(aclResponse, contextName = 'APP800_ACL_CHECK') {
  if (!aclResponse || !Array.isArray(aclResponse.rights)) {
    throw new Error(`${contextName} FAILED: Invalid ACL response payload.`);
  }

  const rights = aclResponse.rights;

  // Finding I: Exact principal set validation -> exactly 3 entries required
  if (rights.length !== 3) {
    throw new Error(`${contextName} FAILED: Expected exact App800 principal count 3 (CREATOR, HR_ADMIN_GROUP, everyone), found ${rights.length}. Extra/missing principals prohibited.`);
  }

  const REQUIRED_RIGHT_KEYS = [
    'appEditable',
    'recordViewable',
    'recordAddable',
    'recordEditable',
    'recordDeletable',
    'recordImportable',
    'recordExportable'
  ];

  // Helper to assert all 7 permission properties are strict booleans
  const assertStrictBooleans = (entry, name) => {
    for (const key of REQUIRED_RIGHT_KEYS) {
      if (typeof entry[key] !== 'boolean') {
        throw new Error(`${contextName} FAILED: Permission property "${key}" for ${name} must be an explicit boolean.`);
      }
    }
  };

  // Finding G: CREATOR must be entity.type === 'CREATOR' with all 7 rights strictly true
  const creatorRight = rights.find(r => r.entity?.type === 'CREATOR');
  if (!creatorRight) {
    throw new Error(`${contextName} FAILED: Technical CREATOR permission entry (entity.type === 'CREATOR') missing.`);
  }

  assertStrictBooleans(creatorRight, 'CREATOR');

  for (const key of REQUIRED_RIGHT_KEYS) {
    if (creatorRight[key] !== true) {
      throw new Error(`${contextName} FAILED: CREATOR permission property "${key}" must be true (full technical authority required).`);
    }
  }

  // Finding I: HR_ADMIN_GROUP check (type === 'GROUP', code === 'HR_ADMIN_GROUP')
  const hrRight = rights.find(r => r.entity?.type === 'GROUP' && r.entity?.code === 'HR_ADMIN_GROUP');
  if (!hrRight) {
    throw new Error(`${contextName} FAILED: HR_ADMIN_GROUP permission entry (GROUP HR_ADMIN_GROUP) missing from App800 ACL.`);
  }

  assertStrictBooleans(hrRight, 'HR_ADMIN_GROUP');

  if (hrRight.recordViewable !== true) {
    throw new Error(`${contextName} FAILED: HR_ADMIN_GROUP must have View permission (recordViewable = true).`);
  }

  if (
    hrRight.appEditable !== false ||
    hrRight.recordAddable !== false ||
    hrRight.recordEditable !== false ||
    hrRight.recordDeletable !== false ||
    hrRight.recordImportable !== false ||
    hrRight.recordExportable !== false
  ) {
    throw new Error(`${contextName} FAILED: HR_ADMIN_GROUP permissions must be View-only (privilege elevation detected).`);
  }

  // Finding H: everyone must be present and explicitly denied (type === 'EVERYONE' or code === 'everyone')
  const everyoneRight = rights.find(r => r.entity?.type === 'EVERYONE' || r.entity?.code === 'everyone');
  if (!everyoneRight) {
    throw new Error(`${contextName} FAILED: everyone permission entry missing from App800 ACL.`);
  }

  assertStrictBooleans(everyoneRight, 'everyone');

  for (const key of REQUIRED_RIGHT_KEYS) {
    if (everyoneRight[key] !== false) {
      throw new Error(`${contextName} FAILED: everyone permission property "${key}" must be false (0 privileges allowed).`);
    }
  }
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

  // Load canonical built artifacts directly (no raw-source regex bundle)
  const { jsCode: classicBundle, cssContent } = validateHrccBundleArtifacts();

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

  assertApp800LeastPrivilegeAcl(liveAclAfter, 'HRCC_LIVE_ACL_CHECK');

  if (!liveCustomizeAfter.desktop?.js?.some(j => j.type === 'FILE') || !liveCustomizeAfter.desktop?.css?.some(c => c.type === 'FILE')) {
    throw new Error('DEPLOYMENT VERIFICATION FAILED: Live customization metadata is missing JS/CSS FILE entries.');
  }

  console.log(`SUCCESS: App ${hrccAppId} ("${liveSettingsAfter.name}") deployed live with Classic JS Bundle! ACL=HR_ADMIN_VIEW_ONLY.`);
}

// Auto-run if executed directly as script CLI
if (process.argv[1] && process.argv[1].endsWith('deploy-delivery-sprint02.js')) {
  executeDeploy().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
