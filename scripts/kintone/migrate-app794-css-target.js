import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSandboxWriteTarget, assertApp794CustomizationDeployAuthorization } from '../../src/core/sandbox-write-guard.js';
import { getKintoneConnection, kintoneRequest } from '../../src/core/kintone-client.js';
import { gitBlobSha, getApp794DeployRequestOptions } from './deploy-custom-ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXPECTED_CSS_BLOB_SHA = '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61';
export const EXPECTED_JS_BLOB_SHA = '8958634b92b35f74b58a7a0b2abd09b8b5e93758';
export const LEGACY_CSS_TARGET_NAME = 'mbo-employee .css';
export const CANONICAL_CSS_TARGET_NAME = 'mbo-employee.css';
export const CANONICAL_JS_TARGET_NAME = 'mbo-employee-app.js';
export const TARGET_APP_ID = 794;

const VALID_SCOPES = new Set(['ALL', 'ADMIN', 'NONE']);

/**
 * Pure preflight validator for the migration-only operation.
 * Hard-locks target App to 794, verifies exact legacy filename, exact canonical JS,
 * exact blob hashes, and exact topology.
 */
export function validateMigrationPreflight({
  liveCustomize,
  previewCustomize,
  liveJsBlobSha,
  liveCssBlobSha,
  candidateCssBlobSha,
  appId = TARGET_APP_ID
}) {
  if (appId !== TARGET_APP_ID) {
    throw new Error(`MIGRATION_BLOCKED: appId (${appId}) must be exactly ${TARGET_APP_ID}.`);
  }

  if (!liveCustomize || typeof liveCustomize !== 'object' || !previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('MIGRATION_BLOCKED: Missing live or preview customization.');
  }

  if (!liveCustomize.scope || !previewCustomize.scope || liveCustomize.scope !== previewCustomize.scope) {
    throw new Error('MIGRATION_BLOCKED: Live and preview scope must be identical.');
  }

  if (!VALID_SCOPES.has(liveCustomize.scope)) {
    throw new Error(`MIGRATION_BLOCKED: Invalid scope (${liveCustomize.scope}).`);
  }

  const liveRev = liveCustomize.revision;
  const previewRev = previewCustomize.revision;
  if (!liveRev || !previewRev) {
    throw new Error('MIGRATION_BLOCKED: Revision missing in live or preview customization.');
  }

  // Topology: Desktop JS 1, CSS 1, Mobile JS 0, CSS 0
  const liveJs = liveCustomize.desktop?.js || [];
  const liveCss = liveCustomize.desktop?.css || [];
  const liveMobileJs = liveCustomize.mobile?.js || [];
  const liveMobileCss = liveCustomize.mobile?.css || [];

  const prevJs = previewCustomize.desktop?.js || [];
  const prevCss = previewCustomize.desktop?.css || [];
  const prevMobileJs = previewCustomize.mobile?.js || [];
  const prevMobileCss = previewCustomize.mobile?.css || [];

  if (liveJs.length !== 1 || liveCss.length !== 1 || liveMobileJs.length !== 0 || liveMobileCss.length !== 0) {
    throw new Error(`MIGRATION_BLOCKED: Live topology mismatch (${liveJs.length}/${liveCss.length}/${liveMobileJs.length}/${liveMobileCss.length}).`);
  }

  if (prevJs.length !== 1 || prevCss.length !== 1 || prevMobileJs.length !== 0 || prevMobileCss.length !== 0) {
    throw new Error(`MIGRATION_BLOCKED: Preview topology mismatch (${prevJs.length}/${prevCss.length}/${prevMobileJs.length}/${prevMobileCss.length}).`);
  }

  // Exact filenames
  if (liveJs[0]?.type !== 'FILE' || liveJs[0]?.file?.name !== CANONICAL_JS_TARGET_NAME) {
    throw new Error(`MIGRATION_BLOCKED: Live JS entry must be FILE named "${CANONICAL_JS_TARGET_NAME}".`);
  }
  if (prevJs[0]?.type !== 'FILE' || prevJs[0]?.file?.name !== CANONICAL_JS_TARGET_NAME) {
    throw new Error(`MIGRATION_BLOCKED: Preview JS entry must be FILE named "${CANONICAL_JS_TARGET_NAME}".`);
  }

  if (liveCss[0]?.type !== 'FILE' || liveCss[0]?.file?.name !== LEGACY_CSS_TARGET_NAME) {
    throw new Error(`MIGRATION_BLOCKED: Live CSS entry must be legacy FILE named "${LEGACY_CSS_TARGET_NAME}".`);
  }
  if (prevCss[0]?.type !== 'FILE' || prevCss[0]?.file?.name !== LEGACY_CSS_TARGET_NAME) {
    throw new Error(`MIGRATION_BLOCKED: Preview CSS entry must be legacy FILE named "${LEGACY_CSS_TARGET_NAME}".`);
  }

  // Blob hashes
  if (liveJsBlobSha !== EXPECTED_JS_BLOB_SHA) {
    throw new Error(`MIGRATION_BLOCKED: Live JS blob SHA (${liveJsBlobSha}) does not match expected (${EXPECTED_JS_BLOB_SHA}).`);
  }

  if (liveCssBlobSha !== EXPECTED_CSS_BLOB_SHA) {
    throw new Error(`MIGRATION_BLOCKED: Live CSS blob SHA (${liveCssBlobSha}) does not match expected (${EXPECTED_CSS_BLOB_SHA}).`);
  }

  if (candidateCssBlobSha !== EXPECTED_CSS_BLOB_SHA) {
    throw new Error(`MIGRATION_BLOCKED: Candidate CSS blob SHA (${candidateCssBlobSha}) does not match expected (${EXPECTED_CSS_BLOB_SHA}).`);
  }

  return true;
}

/**
 * Builds the preview customize payload for the migration.
 * Preserves JS untouched (with its existing fileKey), replaces CSS with the new canonical fileKey.
 */
export function buildMigrationPreviewCustomizePayload({
  previewCustomize,
  newCssFileKey,
  app = TARGET_APP_ID
}) {
  if (app !== TARGET_APP_ID) {
    throw new Error(`MIGRATION_PAYLOAD_BLOCKED: App must be ${TARGET_APP_ID}.`);
  }

  if (!newCssFileKey || typeof newCssFileKey !== 'string') {
    throw new Error('MIGRATION_PAYLOAD_BLOCKED: newCssFileKey is required.');
  }

  const existingJsEntry = previewCustomize.desktop?.js?.[0];
  if (!existingJsEntry?.file?.fileKey) {
    throw new Error('MIGRATION_PAYLOAD_BLOCKED: Existing preview JS entry must have a valid fileKey.');
  }

  return {
    app: TARGET_APP_ID,
    scope: previewCustomize.scope,
    desktop: {
      js: [
        {
          type: 'FILE',
          file: {
            fileKey: existingJsEntry.file.fileKey
          }
        }
      ],
      css: [
        {
          type: 'FILE',
          file: {
            fileKey: newCssFileKey
          }
        }
      ]
    },
    mobile: {
      js: [],
      css: []
    },
    revision: previewCustomize.revision
  };
}

/**
 * Executes the one-shot migration:
 * 1. Preflight checks
 * 2. Upload candidate CSS as 'mbo-employee.css' (zero JS upload)
 * 3. PUT preview customization
 * 4. POST deploy
 * 5. Poll until SUCCESS
 * 6. Post-deploy readback and hash verification
 */
export async function executeApp794CssMigration({
  authConfig,
  requestConfig,
  cssFilePath = path.resolve(__dirname, '../../dist/mbo-employee.css')
}) {
  // 1. Guard checks
  const sandboxRegistryModule = (await import('../../config/sandbox-apps.json', { with: { type: 'json' } })).default;
  assertApp794CustomizationDeployAuthorization(authConfig, requestConfig);
  assertSandboxWriteTarget(TARGET_APP_ID, sandboxRegistryModule, [TARGET_APP_ID], { dryRunBypassDiscovery: true });

  // 2. Read candidate CSS file and compute blob
  if (!fs.existsSync(cssFilePath)) {
    throw new Error(`CANDIDATE_CSS_MISSING: Cannot find candidate CSS at ${cssFilePath}`);
  }
  const candidateCssContent = fs.readFileSync(cssFilePath, 'utf8');
  const candidateCssBlobSha = gitBlobSha(candidateCssContent);

  if (candidateCssBlobSha !== EXPECTED_CSS_BLOB_SHA) {
    throw new Error(`CANDIDATE_CSS_BLOB_MISMATCH: Candidate CSS blob (${candidateCssBlobSha}) !== expected (${EXPECTED_CSS_BLOB_SHA}).`);
  }

  // 3. GET current live & preview customization
  const liveCustomize = await kintoneRequest(`/k/v1/app/customize.json?app=${TARGET_APP_ID}`);
  const previewCustomize = await kintoneRequest(`/k/v1/preview/app/customize.json?app=${TARGET_APP_ID}`);

  // 4. Download current live JS and CSS bytes to verify hashes
  const { baseUrl, headers } = getKintoneConnection();

  const liveJsFileKey = liveCustomize.desktop?.js?.[0]?.file?.fileKey;
  const liveCssFileKey = liveCustomize.desktop?.css?.[0]?.file?.fileKey;

  if (!liveJsFileKey || !liveCssFileKey) {
    throw new Error('MIGRATION_BLOCKED: Live JS or CSS fileKey missing in customization.');
  }

  const liveJsResp = await fetch(`${baseUrl}/k/v1/file.json?fileKey=${liveJsFileKey}`, { headers });
  if (!liveJsResp.ok) throw new Error(`Failed to download live JS: ${liveJsResp.status}`);
  const liveJsBuf = Buffer.from(await liveJsResp.arrayBuffer());
  const liveJsBlobSha = gitBlobSha(liveJsBuf);

  const liveCssResp = await fetch(`${baseUrl}/k/v1/file.json?fileKey=${liveCssFileKey}`, { headers });
  if (!liveCssResp.ok) throw new Error(`Failed to download live CSS: ${liveCssResp.status}`);
  const liveCssBuf = Buffer.from(await liveCssResp.arrayBuffer());
  const liveCssBlobSha = gitBlobSha(liveCssBuf);

  // 5. Strict Preflight validation
  validateMigrationPreflight({
    liveCustomize,
    previewCustomize,
    liveJsBlobSha,
    liveCssBlobSha,
    candidateCssBlobSha,
    appId: TARGET_APP_ID
  });

  console.log(`Preflight PASS: App ${TARGET_APP_ID} Live rev=${liveCustomize.revision}, Preview rev=${previewCustomize.revision}`);
  console.log(`Live JS blob verified: ${liveJsBlobSha}`);
  console.log(`Live CSS blob verified: ${liveCssBlobSha}`);

  // 6. Upload ONLY the candidate CSS with canonical name 'mbo-employee.css'
  const formData = new FormData();
  const blob = new Blob([candidateCssContent], { type: 'text/css' });
  formData.append('file', blob, CANONICAL_CSS_TARGET_NAME);

  const uploadHeaders = { ...headers };
  delete uploadHeaders['Content-Type'];

  const uploadResp = await fetch(`${baseUrl}/k/v1/file.json`, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData
  });

  if (!uploadResp.ok) {
    throw new Error(`CSS file upload failed: ${uploadResp.status} ${await uploadResp.text()}`);
  }

  const uploadData = await uploadResp.json();
  const newCssFileKey = uploadData.fileKey;
  console.log(`Uploaded canonical ${CANONICAL_CSS_TARGET_NAME} -> fileKey: ${newCssFileKey}`);

  // 7. PUT Preview customization
  const putPayload = buildMigrationPreviewCustomizePayload({
    previewCustomize,
    newCssFileKey,
    app: TARGET_APP_ID
  });

  await kintoneRequest(
    '/k/v1/preview/app/customize.json',
    getApp794DeployRequestOptions('/k/v1/preview/app/customize.json', 'PUT', putPayload)
  );
  console.log('Preview customization updated with canonical CSS target.');

  // 8. POST Deploy App 794
  await kintoneRequest(
    '/k/v1/preview/app/deploy.json',
    getApp794DeployRequestOptions('/k/v1/preview/app/deploy.json', 'POST', { apps: [{ app: TARGET_APP_ID }] })
  );
  console.log(`Live deployment requested for App ${TARGET_APP_ID}. Polling status...`);

  // 9. Poll deployment completion
  let deployed = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const res = await kintoneRequest(`/k/v1/preview/app/deploy.json?apps[0]=${TARGET_APP_ID}`);
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

  // 10. Post-deploy readback
  const postLive = await kintoneRequest(`/k/v1/app/customize.json?app=${TARGET_APP_ID}`);
  const postPreview = await kintoneRequest(`/k/v1/preview/app/customize.json?app=${TARGET_APP_ID}`);

  const postLiveJsFile = postLive.desktop?.js?.[0]?.file;
  const postLiveCssFile = postLive.desktop?.css?.[0]?.file;

  const postJsResp = await fetch(`${baseUrl}/k/v1/file.json?fileKey=${postLiveJsFile.fileKey}`, { headers });
  const postJsBuf = Buffer.from(await postJsResp.arrayBuffer());
  const postLiveJsBlobSha = gitBlobSha(postJsBuf);

  const postCssResp = await fetch(`${baseUrl}/k/v1/file.json?fileKey=${postLiveCssFile.fileKey}`, { headers });
  const postCssBuf = Buffer.from(await postCssResp.arrayBuffer());
  const postLiveCssBlobSha = gitBlobSha(postCssBuf);

  return {
    appId: TARGET_APP_ID,
    deployed: true,
    preLiveRevision: liveCustomize.revision,
    postLiveRevision: postLive.revision,
    prePreviewRevision: previewCustomize.revision,
    postPreviewRevision: postPreview.revision,
    liveScope: postLive.scope,
    previewScope: postPreview.scope,
    topology: {
      desktopJs: postLive.desktop.js.length,
      desktopCss: postLive.desktop.css.length,
      mobileJs: postLive.mobile.js.length,
      mobileCss: postLive.mobile.css.length
    },
    liveJsFilename: postLiveJsFile?.name,
    liveCssFilename: postLiveCssFile?.name,
    liveJsBlobSha: postLiveJsBlobSha,
    liveCssBlobSha: postLiveCssBlobSha,
    jsMatch: postLiveJsBlobSha === EXPECTED_JS_BLOB_SHA,
    cssMatch: postLiveCssBlobSha === EXPECTED_CSS_BLOB_SHA
  };
}
