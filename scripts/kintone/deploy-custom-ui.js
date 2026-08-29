import fs from 'node:fs';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { assertSandboxWriteTarget, assertApp794CustomizationDeployAuthorization } from '../../src/core/sandbox-write-guard.js';
import { buildMboUi } from './build-mbo-ui.js';

const VALID_SCOPES = new Set(['ALL', 'ADMIN', 'NONE']);

export function gitBlobSha(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8');
  const header = Buffer.from(`blob ${buf.length}\0`, 'utf8');
  const store = Buffer.concat([header, buf]);
  return crypto.createHash('sha1').update(store).digest('hex');
}

export function getCurrentGitHead() {
  try {
    const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    if (/^[0-9a-f]{40}$/i.test(head)) {
      return head;
    }
    return null;
  } catch {
    return null;
  }
}

export function isWorktreeClean() {
  try {
    const rawStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (!rawStatus) return true;

    const lines = rawStatus.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const code = line.slice(0, 2);
      const filePath = line.slice(3).trim().replace(/^"/, '').replace(/"$/, '');

      if (!code.includes('?')) {
        return false;
      }

      if (
        filePath.startsWith('src/') ||
        filePath.startsWith('scripts/') ||
        filePath.startsWith('tests/') ||
        filePath.startsWith('config/') ||
        filePath === 'package.json' ||
        filePath === 'package-lock.json'
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

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

  let fullJs = fs.readFileSync(targetOutfile, 'utf8');
  if (fullJs.length === 0) {
    await new Promise(r => setTimeout(r, 50));
    fullJs = fs.readFileSync(targetOutfile, 'utf8');
  }

  let cssContent = fs.readFileSync('dist/mbo-employee.css', 'utf8');
  if (cssContent.length === 0) {
    await new Promise(r => setTimeout(r, 50));
    cssContent = fs.readFileSync('dist/mbo-employee.css', 'utf8');
  }

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

  const jsBlobSha = gitBlobSha(fullJs);
  const cssBlobSha = gitBlobSha(cssContent);

  return {
    app: targetApp,
    fullJs,
    cssContent,
    jsBlobSha,
    cssBlobSha
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

export function validateReleaseManifest({
  manifest,
  candidateJsBlobSha,
  candidateCssBlobSha,
  liveCustomize,
  previewCustomize,
  currentGitHead = getCurrentGitHead(),
  isBuildOnly = false,
  checkWorktreeClean = false
}) {
  if (isBuildOnly && !manifest) {
    return true;
  }

  if (!manifest || typeof manifest !== 'object') {
    throw new Error('MISSING_RELEASE_MANIFEST_BLOCKED_PRE_UPLOAD: Release manifest object is required in Live mode.');
  }

  const {
    appId,
    sourceCommit,
    expectedJsBlobSha,
    expectedCssBlobSha,
    expectedScope,
    expectedTopology
  } = manifest;

  if (appId === undefined || appId === null || appId !== 794) {
    throw new Error(`MANIFEST_APP_ID_MISMATCH_BLOCKED_PRE_UPLOAD: Manifest appId (${appId}) must be integer 794.`);
  }

  if (!sourceCommit || typeof sourceCommit !== 'string' || sourceCommit.trim() === '') {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest sourceCommit field is missing or empty.');
  }

  const trimmedSourceCommit = sourceCommit.trim();
  if (trimmedSourceCommit.length < 40) {
    throw new Error(`SHORT_SOURCE_SHA_BLOCKED: Manifest sourceCommit "${sourceCommit}" must be an exact 40-character hexadecimal Git SHA.`);
  }

  if (trimmedSourceCommit.length > 40 || !/^[0-9a-f]{40}$/i.test(trimmedSourceCommit)) {
    throw new Error(`MALFORMED_SOURCE_SHA_BLOCKED: Manifest sourceCommit "${sourceCommit}" is not a valid 40-character hexadecimal Git SHA.`);
  }

  if (!currentGitHead || typeof currentGitHead !== 'string' || currentGitHead.trim() === '') {
    throw new Error('UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE: Cannot resolve repository Git HEAD before Live execution.');
  }

  const trimmedHead = currentGitHead.trim();
  if (trimmedHead.length !== 40 || !/^[0-9a-f]{40}$/i.test(trimmedHead)) {
    throw new Error(`UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE: Current repository Git HEAD "${currentGitHead}" is not a valid 40-character SHA.`);
  }

  const lowerSourceSha = trimmedSourceCommit.toLowerCase();
  const lowerHeadSha = trimmedHead.toLowerCase();

  if (lowerSourceSha !== lowerHeadSha) {
    if (lowerHeadSha.startsWith(lowerSourceSha) || lowerSourceSha.startsWith(lowerHeadSha)) {
      throw new Error(`PREFIX_SOURCE_SHA_BLOCKED: Prefix or partial SHA matching is forbidden. Manifest sourceCommit (${sourceCommit}) must exactly equal full repository HEAD (${currentGitHead}).`);
    }
    throw new Error(`MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD: Manifest sourceCommit (${sourceCommit}) does not match exact repository HEAD (${currentGitHead}).`);
  }

  if (checkWorktreeClean && !isWorktreeClean()) {
    throw new Error('DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_OR_UPLOAD: Working tree has uncommitted or untracked changes before Live execution.');
  }

  if (!expectedJsBlobSha || typeof expectedJsBlobSha !== 'string' || expectedJsBlobSha.trim() === '') {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedJsBlobSha field is missing or empty.');
  }

  if (!expectedCssBlobSha || typeof expectedCssBlobSha !== 'string' || expectedCssBlobSha.trim() === '') {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedCssBlobSha field is missing or empty.');
  }

  if (!expectedScope || typeof expectedScope !== 'string' || expectedScope.trim() === '') {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedScope field is missing or empty.');
  }

  if (!expectedTopology || typeof expectedTopology !== 'object') {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedTopology object is missing.');
  }

  const { desktopJsCount, desktopCssCount, mobileJsCount, mobileCssCount } = expectedTopology;
  if (
    typeof desktopJsCount !== 'number' ||
    typeof desktopCssCount !== 'number' ||
    typeof mobileJsCount !== 'number' ||
    typeof mobileCssCount !== 'number'
  ) {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedTopology counts must be numbers.');
  }

  // 1. Candidate JS/CSS blob identity check
  if (candidateJsBlobSha && candidateJsBlobSha !== expectedJsBlobSha) {
    throw new Error(`JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD: Candidate JS blob SHA (${candidateJsBlobSha}) does not match expected manifest JS blob SHA (${expectedJsBlobSha}).`);
  }

  if (candidateCssBlobSha && candidateCssBlobSha !== expectedCssBlobSha) {
    throw new Error(`CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD: Candidate CSS blob SHA (${candidateCssBlobSha}) does not match expected manifest CSS blob SHA (${expectedCssBlobSha}).`);
  }

  // 2. Expected Scope check
  if (liveCustomize && liveCustomize.scope !== expectedScope) {
    throw new Error(`MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD: Live scope (${liveCustomize.scope}) does not match manifest expectedScope (${expectedScope}).`);
  }
  if (previewCustomize && previewCustomize.scope !== expectedScope) {
    throw new Error(`MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD: Preview scope (${previewCustomize.scope}) does not match manifest expectedScope (${expectedScope}).`);
  }

  // 3. Expected Topology check
  if (previewCustomize) {
    const pDesktopJs = previewCustomize.desktop?.js?.length || 0;
    const pDesktopCss = previewCustomize.desktop?.css?.length || 0;
    const pMobileJs = previewCustomize.mobile?.js?.length || 0;
    const pMobileCss = previewCustomize.mobile?.css?.length || 0;

    if (
      pDesktopJs !== desktopJsCount ||
      pDesktopCss !== desktopCssCount ||
      pMobileJs !== mobileJsCount ||
      pMobileCss !== mobileCssCount
    ) {
      throw new Error(`MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD: Preview topology (${pDesktopJs}/${pDesktopCss}/${pMobileJs}/${pMobileCss}) does not match manifest expectedTopology (${desktopJsCount}/${desktopCssCount}/${mobileJsCount}/${mobileCssCount}).`);
    }
  }

  return true;
}

export function validatePreflight({
  liveCustomize,
  previewCustomize,
  targetFileName = 'mbo-employee-app.js',
  targetCssFileName = 'mbo-employee.css',
  releaseManifest = null,
  candidateJsBlobSha = null,
  candidateCssBlobSha = null,
  currentGitHead = getCurrentGitHead(),
  isBuildOnly = false,
  checkWorktreeClean = false
}) {
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

  // 4. Require exactly ONE target JS entry in preview.desktop.js
  const previewDesktopJs = previewCustomize.desktop.js;
  const targetJsEntries = previewDesktopJs.filter(e => e && e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetJsEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetJsEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

  const exactTargetJsEntry = targetJsEntries[0];

  // 4b. Require exactly ONE target CSS entry in preview.desktop.css
  const previewDesktopCss = previewCustomize.desktop.css;
  const targetCssEntries = previewDesktopCss.filter(e => e && e.type === 'FILE' && e.file?.name === targetCssFileName);

  if (targetCssEntries.length === 0) {
    throw new Error(`TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetCssFileName} in preview customization.`);
  }
  if (targetCssEntries.length > 1) {
    throw new Error(`TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetCssFileName} in preview customization.`);
  }

  const exactTargetCssEntry = targetCssEntries[0];

  const targetEntriesList = [exactTargetJsEntry, exactTargetCssEntry];

  // 5. Entry structural & fileKey validation across all lists
  const validateEntryList = (list, sectionName, isPreview = false) => {
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
          const isTarget = targetEntriesList.includes(e);
          if (!isTarget) {
            if (!e.file.fileKey || typeof e.file.fileKey !== 'string' || e.file.fileKey.trim() === '') {
              let errCode = 'MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD';
              if (e.file.name === targetFileName || e.file.name === targetCssFileName) {
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

  validateEntryList(previewCustomize.desktop.js, 'preview desktop.js', true);
  validateEntryList(previewCustomize.desktop.css, 'preview desktop.css', true);
  validateEntryList(previewCustomize.mobile.js, 'preview mobile.js', true);
  validateEntryList(previewCustomize.mobile.css, 'preview mobile.css', true);

  // 6. Topology alignment
  validateTopologyAlignment(liveCustomize, previewCustomize);

  // 7. Mandatory release manifest validation in Live mode
  validateReleaseManifest({
    manifest: releaseManifest,
    candidateJsBlobSha,
    candidateCssBlobSha,
    liveCustomize,
    previewCustomize,
    currentGitHead,
    isBuildOnly,
    checkWorktreeClean
  });

  return true;
}

export function normalizeCustomizeEntries(entries = [], targetEntryRef = null, newFileKey = null) {
  return entries.map(entry => {
    if (entry.type === 'URL') {
      return { type: 'URL', url: entry.url };
    }
    if (entry.type === 'FILE') {
      const isTarget = targetEntryRef && entry === targetEntryRef;
      const fileKey = isTarget ? newFileKey : entry.file?.fileKey;
      if (!fileKey) {
        throw new Error(`MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD: Missing fileKey for FILE entry ${entry.file?.name || 'unknown'}.`);
      }
      return { type: 'FILE', file: { fileKey } };
    }
    throw new Error(`UNSUPPORTED_ENTRY_TYPE_BLOCKED_PRE_UPLOAD: Unsupported type ${entry.type}`);
  });
}

export function buildPreviewCustomizePayload({
  app,
  previewCustomize,
  targetFileName = 'mbo-employee-app.js',
  targetCssFileName = 'mbo-employee.css',
  newJsFileKey,
  newCssFileKey
}) {
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
  const targetJsEntries = desktopJs.filter(e => e && e.type === 'FILE' && e.file?.name === targetFileName);

  if (targetJsEntries.length === 0) {
    throw new Error(`TARGET_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetFileName} in preview customization.`);
  }
  if (targetJsEntries.length > 1) {
    throw new Error(`TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetFileName} in preview customization.`);
  }

  const exactTargetJsEntry = targetJsEntries[0];

  const desktopCss = previewCustomize.desktop.css;
  const targetCssEntries = desktopCss.filter(e => e && e.type === 'FILE' && e.file?.name === targetCssFileName);

  if (targetCssEntries.length === 0) {
    throw new Error(`TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD: Expected desktop FILE entry named ${targetCssFileName} in preview customization.`);
  }
  if (targetCssEntries.length > 1) {
    throw new Error(`TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD: Found multiple desktop FILE entries named ${targetCssFileName} in preview customization.`);
  }

  const exactTargetCssEntry = targetCssEntries[0];

  if (!newJsFileKey || typeof newJsFileKey !== 'string' || newJsFileKey.trim() === '') {
    throw new Error('MISSING_NEW_JS_FILEKEY_BLOCKED_PRE_UPLOAD: newJsFileKey is required for preview customize payload.');
  }

  if (!newCssFileKey || typeof newCssFileKey !== 'string' || newCssFileKey.trim() === '') {
    throw new Error('MISSING_NEW_CSS_FILEKEY_BLOCKED_PRE_UPLOAD: newCssFileKey is required for preview customize payload.');
  }

  const normalizedDesktopJs = normalizeCustomizeEntries(desktopJs, exactTargetJsEntry, newJsFileKey);
  const normalizedDesktopCss = normalizeCustomizeEntries(desktopCss, exactTargetCssEntry, newCssFileKey);
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

/**
 * Validates target binding across supplied options and registry configuration.
 * Both options.appId (if supplied) and registry.mboV2AppId must be exact integer 794.
 * Fails closed on missing/malformed/drifted target values.
 */
export function validateApp794DeployTargetBinding(options = {}, registry = null) {
  if (options.appId !== undefined && options.appId !== 794) {
    throw new Error(`APP794 DEPLOY BLOCKED: Supplied options.appId (${options.appId}) must be exactly 794.`);
  }

  if (!registry || typeof registry !== 'object') {
    throw new Error('APP794 DEPLOY BLOCKED: Missing or invalid sandbox registry object.');
  }

  const registryAppId = registry.mboV2AppId;
  if (!Number.isInteger(registryAppId) || registryAppId !== 794) {
    throw new Error(`APP794 DEPLOY BLOCKED: Target App ID in sandbox-apps.json (${registryAppId}) must be exactly 794.`);
  }

  return 794;
}

/**
 * Pure helper to construct request options for App 794 customization deploy operations.
 * Only exact authorized App 794 deploy operations (PUT preview/app/customize.json and POST preview/app/deploy.json)
 * receive bypassDiscovery: true. Unrelated paths/methods receive bypassDiscovery: false and fail closed.
 */
export function getApp794DeployRequestOptions(path, method = 'GET', body = undefined) {
  const normalizedPath = String(path || '').trim();
  const normalizedMethod = String(method || '').toUpperCase();

  const isPreviewPut = (normalizedPath === '/k/v1/preview/app/customize.json' && normalizedMethod === 'PUT');
  const isDeployPost = (normalizedPath === '/k/v1/preview/app/deploy.json' && normalizedMethod === 'POST');

  const isAuthorizedBypassWrite = isPreviewPut || isDeployPost;

  const options = {
    method: normalizedMethod,
    bypassDiscovery: isAuthorizedBypassWrite
  };

  if (body !== undefined) {
    options.body = body;
  }

  return options;
}

export async function executeDeployCustomUi(options = {}) {
  const isBuildOnly = options.isBuildOnly ?? process.argv.includes('--build-only');
  const app = 794;

  if (isBuildOnly) {
    if (options.appId !== undefined && options.appId !== 794) {
      throw new Error(`APP794 DEPLOY BLOCKED: Supplied options.appId (${options.appId}) must be exactly 794.`);
    }
    const artifacts = await prepareDeploymentArtifacts({ appId: 794, buildOptions: options.buildOptions });
    console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');
    console.log('[BUILD-ONLY] Candidate bundles built cleanly. Exiting before Kintone upload/API calls.');
    return {
      app: 794,
      fullJs: artifacts.fullJs,
      cssContent: artifacts.cssContent,
      jsBlobSha: artifacts.jsBlobSha,
      cssBlobSha: artifacts.cssBlobSha,
      buildOnly: true
    };
  }

  // Live Mode:
  // 1. Resolve registry target without silent fallback catch
  let sandboxRegistryModule;
  try {
    sandboxRegistryModule = (await import('../../config/sandbox-apps.json', { with: { type: 'json' } })).default;
  } catch (err) {
    throw new Error(`APP794 DEPLOY BLOCKED: Cannot load sandbox-apps.json registry (${err.message}).`);
  }

  // 2. Validate target binding strictly using pure helper
  validateApp794DeployTargetBinding(options, sandboxRegistryModule);

  // 3. Require narrow App794 customization deploy authorization BEFORE any network/upload path
  assertApp794CustomizationDeployAuthorization(options.authConfig, options.requestConfig);

  // 4. Validate write target with literal ephemeral allow-list [794] and dryRunBypassDiscovery
  assertSandboxWriteTarget(794, sandboxRegistryModule, [794], { dryRunBypassDiscovery: true });

  // 5. Live Source Identity & Cleanliness check BEFORE BUILD / UPLOAD:
  // DO NOT accept caller options.currentGitHead in Live mode! Derive strictly internally.
  const gitHead = getCurrentGitHead();
  if (!gitHead || typeof gitHead !== 'string' || gitHead.trim().length !== 40 || !/^[0-9a-f]{40}$/i.test(gitHead.trim())) {
    throw new Error('UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE: Cannot resolve repository Git HEAD before Live execution.');
  }

  if (!isWorktreeClean()) {
    throw new Error('DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_OR_UPLOAD: Working tree has uncommitted or untracked changes before Live execution.');
  }

  // 6. Build exact candidate artifacts
  const artifacts = await prepareDeploymentArtifacts({ appId: 794, buildOptions: options.buildOptions });
  console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');

  // Read live and preview customization
  const { kintoneRequest, getKintoneConnection } = await import('../../src/core/kintone-client.js');

  const liveCustomize = await kintoneRequest(`/k/v1/app/customize.json?app=${app}`);
  const previewCustomize = await kintoneRequest(`/k/v1/preview/app/customize.json?app=${app}`);

  // PREFLIGHT: FULL DETERMINISTIC VALIDATION BEFORE ANY UPLOAD!
  validatePreflight({
    liveCustomize,
    previewCustomize,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    releaseManifest: options.releaseManifest,
    candidateJsBlobSha: artifacts.jsBlobSha,
    candidateCssBlobSha: artifacts.cssBlobSha,
    currentGitHead: gitHead,
    isBuildOnly: false,
    checkWorktreeClean: true
  });

  // Upload candidate JS and candidate CSS
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

  const jsFileKey = await uploadFile('mbo-employee-app.js', artifacts.fullJs, 'text/javascript');
  const cssFileKey = await uploadFile('mbo-employee.css', artifacts.cssContent, 'text/css');

  // Build Preview PUT payload replacing BOTH JS and CSS fileKeys
  const putPayload = buildPreviewCustomizePayload({
    app,
    previewCustomize,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: jsFileKey,
    newCssFileKey: cssFileKey
  });

  // 3. Put Customization to Preview
  await kintoneRequest(
    '/k/v1/preview/app/customize.json',
    getApp794DeployRequestOptions('/k/v1/preview/app/customize.json', 'PUT', putPayload)
  );

  console.log('Customization preview updated.');

  // 4. Deploy Live Sandbox App 794
  await kintoneRequest(
    '/k/v1/preview/app/deploy.json',
    getApp794DeployRequestOptions('/k/v1/preview/app/deploy.json', 'POST', { apps: [{ app }] })
  );

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
