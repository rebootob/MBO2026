import fs from 'node:fs';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import {
  assertSandboxWriteTarget,
  assertApp794CustomizationDeployAuthorization,
  validateApp794CustomizationDeployAuthorization
} from '../../src/core/sandbox-write-guard.js';
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
 * Pure pre-build source-state validator.
 * Validates manifest existence, appId=794, exact 40-char SHA equality, and worktree cleanliness
 * BEFORE candidate build and BEFORE any Kintone network GET call.
 */
export function validatePrebuildSourceManifest({
  releaseManifest,
  currentGitHead = getCurrentGitHead(),
  worktreeClean = isWorktreeClean(),
  isBuildOnly = false
}) {
  if (isBuildOnly && !releaseManifest) {
    return true;
  }

  if (!releaseManifest || typeof releaseManifest !== 'object') {
    throw new Error('MISSING_RELEASE_MANIFEST_BLOCKED_BEFORE_BUILD_AND_NETWORK: Release manifest object is required in Live mode.');
  }

  const { appId, sourceCommit } = releaseManifest;

  if (appId === undefined || appId === null || appId !== 794) {
    throw new Error(`MANIFEST_APP_ID_MISMATCH_BLOCKED_BEFORE_BUILD_AND_NETWORK: Manifest appId (${appId}) must be integer 794.`);
  }

  if (!sourceCommit || typeof sourceCommit !== 'string' || sourceCommit.trim() === '') {
    throw new Error('MISSING_MANIFEST_FIELD_BLOCKED_BEFORE_BUILD_AND_NETWORK: Manifest sourceCommit field is missing or empty.');
  }

  const trimmedSourceCommit = sourceCommit.trim();
  if (trimmedSourceCommit.length < 40) {
    throw new Error(`SHORT_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK: Manifest sourceCommit "${sourceCommit}" must be an exact 40-character hexadecimal Git SHA.`);
  }

  if (trimmedSourceCommit.length > 40 || !/^[0-9a-f]{40}$/i.test(trimmedSourceCommit)) {
    throw new Error(`MALFORMED_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK: Manifest sourceCommit "${sourceCommit}" is not a valid 40-character hexadecimal Git SHA.`);
  }

  if (!currentGitHead || typeof currentGitHead !== 'string' || currentGitHead.trim() === '') {
    throw new Error('UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_BUILD_AND_NETWORK: Cannot resolve repository Git HEAD before Live execution.');
  }

  const trimmedHead = currentGitHead.trim();
  if (trimmedHead.length !== 40 || !/^[0-9a-f]{40}$/i.test(trimmedHead)) {
    throw new Error(`UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_BUILD_AND_NETWORK: Current repository Git HEAD "${currentGitHead}" is not a valid 40-character SHA.`);
  }

  const lowerSourceSha = trimmedSourceCommit.toLowerCase();
  const lowerHeadSha = trimmedHead.toLowerCase();

  if (lowerSourceSha !== lowerHeadSha) {
    throw new Error(`SOURCE_COMMIT_MISMATCH_BLOCKED_BEFORE_BUILD_AND_NETWORK: Manifest sourceCommit (${sourceCommit}) does not match exact repository HEAD (${currentGitHead}).`);
  }

  if (worktreeClean !== true) {
    throw new Error('DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK: Working tree has uncommitted or untracked changes before Live execution.');
  }

  return true;
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

export const NON_SERVER_ERROR_CODES = Object.freeze(new Set([
  'ECONNRESET',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ERR_HTTP2_STREAM_ERROR',
  'ERR_INVALID_URL',
  'UND_ERR_CONNECT_TIMEOUT'
]));

/**
 * Sanitizes and formats safe diagnostic server metadata from upload/network errors.
 * Preserves HTTP status, safe provider/Kintone error code, and sanitized server message.
 * Strictly redacts tokens, passwords, authorization, cookies, credentials, fileKeys, and secrets.
 * Never propagates raw response bodies containing sensitive data.
 */
export function formatSanitizedUploadError(error, filename = 'file') {
  const GENERIC_FAILURE = `UPLOAD_FAILED: Upload failed for ${filename}.`;

  if (!error || (typeof error !== 'object' && typeof error !== 'string')) {
    return GENERIC_FAILURE;
  }

  // 1. Extract HTTP status if available
  let httpStatus = null;
  const rawStatus = error?.status ?? error?.statusCode ?? error?.response?.status;
  if (typeof rawStatus === 'number' && Number.isInteger(rawStatus) && rawStatus >= 100 && rawStatus <= 599) {
    httpStatus = rawStatus;
  } else if (typeof rawStatus === 'string' && /^[1-5]\d\d$/.test(rawStatus.trim())) {
    httpStatus = parseInt(rawStatus.trim(), 10);
  }

  // 2. Extract safe error code if available
  let safeCode = null;
  const rawCode =
    error?.code ??
    error?.data?.code ??
    error?.response?.data?.code ??
    error?.error?.code ??
    error?.kintoneCode;

  if (typeof rawCode === 'string') {
    const trimmedCode = rawCode.trim();
    if (
      !NON_SERVER_ERROR_CODES.has(trimmedCode) &&
      /^[A-Za-z0-9_.-]{2,64}$/.test(trimmedCode)
    ) {
      safeCode = trimmedCode;
    }
  }

  // 3. Extract and sanitize server message
  let safeMessage = null;
  const explicitServerMessage =
    error?.data?.message ??
    error?.response?.data?.message ??
    error?.error?.message ??
    error?.serverMessage;

  const rawMessage =
    explicitServerMessage ??
    (typeof error?.message === 'string' ? error.message : typeof error === 'string' ? error : null);

  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    let msg = rawMessage.trim();

    if (!httpStatus) {
      const statusMatch = msg.match(/\bHTTP\s+([1-5]\d\d)\b/i);
      if (statusMatch) {
        httpStatus = parseInt(statusMatch[1], 10);
      }
    }

    if (!safeCode) {
      const codeMatches = [...msg.matchAll(/\b([A-Z0-9_]{2,30})\b/g)];
      for (const m of codeMatches) {
        const candidate = m[1];
        if (
          candidate !== 'HTTP' &&
          candidate !== 'CODE' &&
          candidate !== 'MESSAGE' &&
          candidate !== 'UPLOAD' &&
          candidate !== 'FAILED' &&
          !NON_SERVER_ERROR_CODES.has(candidate) &&
          /^[A-Z][A-Z0-9_]+$/.test(candidate) &&
          /[0-9_]/.test(candidate)
        ) {
          safeCode = candidate;
          break;
        }
      }
    }

    // Sanitize: strictly redact tokens, passwords, authorization, cookies, credentials, fileKey, and secrets
    msg = msg
      .replace(/bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]')
      .replace(/basic\s+[a-zA-Z0-9+/=]+/gi, 'Basic [REDACTED]')
      .replace(/(authorization|x-cybozu-[a-z0-9-]+)\s*[:=]\s*[^\s,;]+/gi, '$1: [REDACTED]')
      .replace(/(api[-_]?token|auth[-_]?token|token|password|secret|cookie|session|credential)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
      .replace(/fileKey\s*[:=]\s*["']?[a-zA-Z0-9_\-.]+["']?/gi, 'fileKey=[REDACTED]')
      .replace(/https?:\/\/[^\s]+/gi, (url) => {
        try {
          const parsed = new URL(url);
          return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
        } catch {
          return '[URL]';
        }
      })
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (msg.length > 256) {
      msg = msg.slice(0, 253) + '...';
    }

    if (msg) {
      safeMessage = msg;
    }
  }

  const parts = [];
  if (httpStatus) {
    parts.push(`HTTP ${httpStatus}`);
  }
  if (safeCode) {
    parts.push(`CODE ${safeCode}`);
  }
  if (safeMessage) {
    parts.push(`MESSAGE ${safeMessage}`);
  }

  if (parts.length === 0) {
    return GENERIC_FAILURE;
  }

  return `UPLOAD_FAILED: ${filename} - ${parts.join(' / ')}`;
}

/**
 * Sanitizes and formats safe diagnostic server metadata from download/network errors.
 * Preserves HTTP status, safe provider/Kintone error code, and sanitized server message.
 * Strictly redacts tokens, passwords, authorization, cookies, credentials, fileKeys, and secrets.
 * Never propagates raw response bodies containing sensitive data.
 */
export function formatSanitizedDownloadError(error, filename = 'file') {
  const GENERIC_FAILURE = `DOWNLOAD_FAILED: Download failed for ${filename}.`;

  if (!error || (typeof error !== 'object' && typeof error !== 'string')) {
    return GENERIC_FAILURE;
  }

  let httpStatus = null;
  const rawStatus = error?.status ?? error?.statusCode ?? error?.response?.status;
  if (typeof rawStatus === 'number' && Number.isInteger(rawStatus) && rawStatus >= 100 && rawStatus <= 599) {
    httpStatus = rawStatus;
  } else if (typeof rawStatus === 'string' && /^[1-5]\d\d$/.test(rawStatus.trim())) {
    httpStatus = parseInt(rawStatus.trim(), 10);
  }

  let safeCode = null;
  const rawCode =
    error?.code ??
    error?.data?.code ??
    error?.response?.data?.code ??
    error?.error?.code ??
    error?.kintoneCode;

  if (typeof rawCode === 'string') {
    const trimmedCode = rawCode.trim();
    if (
      !NON_SERVER_ERROR_CODES.has(trimmedCode) &&
      /^[A-Za-z0-9_.-]{2,64}$/.test(trimmedCode)
    ) {
      safeCode = trimmedCode;
    }
  }

  let safeMessage = null;
  const explicitServerMessage =
    error?.data?.message ??
    error?.response?.data?.message ??
    error?.error?.message ??
    error?.serverMessage;

  const rawMessage =
    explicitServerMessage ??
    (typeof error?.message === 'string' ? error.message : typeof error === 'string' ? error : null);

  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    let msg = rawMessage.trim();

    if (!httpStatus) {
      const statusMatch = msg.match(/\bHTTP\s+([1-5]\d\d)\b/i);
      if (statusMatch) {
        httpStatus = parseInt(statusMatch[1], 10);
      }
    }

    if (!safeCode) {
      const codeMatches = [...msg.matchAll(/\b([A-Z0-9_]{2,30})\b/g)];
      for (const m of codeMatches) {
        const candidate = m[1];
        if (
          candidate !== 'HTTP' &&
          candidate !== 'CODE' &&
          candidate !== 'MESSAGE' &&
          candidate !== 'DOWNLOAD' &&
          candidate !== 'FAILED' &&
          !NON_SERVER_ERROR_CODES.has(candidate) &&
          /^[A-Z][A-Z0-9_]+$/.test(candidate) &&
          /[0-9_]/.test(candidate)
        ) {
          safeCode = candidate;
          break;
        }
      }
    }

    msg = msg
      .replace(/bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]')
      .replace(/basic\s+[a-zA-Z0-9+/=]+/gi, 'Basic [REDACTED]')
      .replace(/(authorization|x-cybozu-[a-z0-9-]+)\s*[:=]\s*[^\s,;]+/gi, '$1: [REDACTED]')
      .replace(/(api[-_]?token|auth[-_]?token|token|password|secret|cookie|session|credential)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
      .replace(/fileKey\s*[:=]\s*["']?[a-zA-Z0-9_\-.]+["']?/gi, 'fileKey=[REDACTED]')
      .replace(/https?:\/\/[^\s]+/gi, (url) => {
        try {
          const parsed = new URL(url);
          return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
        } catch {
          return '[URL]';
        }
      })
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (msg.length > 256) {
      msg = msg.slice(0, 253) + '...';
    }

    if (msg) {
      safeMessage = msg;
    }
  }

  const parts = [];
  if (httpStatus) {
    parts.push(`HTTP ${httpStatus}`);
  }
  if (safeCode) {
    parts.push(`CODE ${safeCode}`);
  }
  if (safeMessage) {
    parts.push(`MESSAGE ${safeMessage}`);
  }

  if (parts.length === 0) {
    return GENERIC_FAILURE;
  }

  return `DOWNLOAD_FAILED: ${filename} - ${parts.join(' / ')}`;
}

/**
 * Pure helper to verify downloaded raw byte identity against canonical release artifacts.
 * Compares exact byte length and SHA-256 hash.
 * Upload-key equality is NOT proof of content identity; actual byte comparison is required.
 * Fails closed on mismatch, malformed bytes, or missing content.
 */
export function verifyTargetContentIdentity({
  content,
  expectedSha256,
  expectedByteLength,
  targetFileName = 'file',
  location = 'Preview'
}) {
  if (!content || (!Buffer.isBuffer(content) && !(content instanceof Uint8Array))) {
    throw new Error(`${location.toUpperCase()}_CONTENT_IDENTITY_MISMATCH: Downloaded content for ${targetFileName} in ${location} is empty or malformed.`);
  }

  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const actualByteLength = buf.length;
  const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');

  if (actualByteLength !== expectedByteLength || actualSha256 !== expectedSha256) {
    throw new Error(`${location.toUpperCase()}_CONTENT_IDENTITY_MISMATCH: Content identity verification failed for ${targetFileName} in ${location} (expected size: ${expectedByteLength}, actual: ${actualByteLength}; expected sha256: ${expectedSha256}, actual: ${actualSha256}).`);
  }

  return {
    verified: true,
    sha256: actualSha256,
    byteLength: actualByteLength
  };
}

/**
 * Pure validator for preview metadata stability across content verification.
 * Verifies revision, attached target fileKeys, scope, and topology did not drift.
 */
export function validatePreviewStability(
  initialPreview,
  stabilityPreview,
  targetFileName = 'mbo-employee-app.js',
  targetCssFileName = 'mbo-employee.css'
) {
  if (!stabilityPreview || typeof stabilityPreview !== 'object') {
    throw new Error('PREVIEW_STABILITY_DRIFT: Stability preview customization is missing or invalid.');
  }
  validateContainers(stabilityPreview, 'Preview Stability');

  if (stabilityPreview.revision !== initialPreview.revision) {
    throw new Error(`PREVIEW_STABILITY_DRIFT: Preview revision drifted from "${initialPreview.revision}" to "${stabilityPreview.revision}".`);
  }
  if (stabilityPreview.scope !== initialPreview.scope) {
    throw new Error(`PREVIEW_STABILITY_DRIFT: Preview scope drifted from "${initialPreview.scope}" to "${stabilityPreview.scope}".`);
  }

  const initJs = initialPreview.desktop?.js?.find(e => e?.type === 'FILE' && e.file?.name === targetFileName);
  const stabJs = stabilityPreview.desktop?.js?.find(e => e?.type === 'FILE' && e.file?.name === targetFileName);
  if (!stabJs?.file?.fileKey || stabJs.file.fileKey !== initJs?.file?.fileKey) {
    throw new Error('PREVIEW_STABILITY_DRIFT: Target JS attached fileKey drifted during verification.');
  }

  const initCss = initialPreview.desktop?.css?.find(e => e?.type === 'FILE' && e.file?.name === targetCssFileName);
  const stabCss = stabilityPreview.desktop?.css?.find(e => e?.type === 'FILE' && e.file?.name === targetCssFileName);
  if (!stabCss?.file?.fileKey || stabCss.file.fileKey !== initCss?.file?.fileKey) {
    throw new Error('PREVIEW_STABILITY_DRIFT: Target CSS attached fileKey drifted during verification.');
  }

  try {
    validateTopologyAlignment(initialPreview, stabilityPreview);
  } catch (err) {
    throw new Error(`PREVIEW_STABILITY_DRIFT: Preview topology drifted during verification: ${err.message}`);
  }
  return true;
}

/**
 * Validates App794 PREVIEW customization read-back after preview PUT.
 * Verifies scope, complete topology, exact target JS and CSS pair attachment,
 * and preserves retained entries unchanged without exposing raw fileKeys.
 * Attached fileKeys are validated for non-empty string presence; upload-key equality
 * is not required since content identity is proven via raw byte verification.
 */
export function validatePreviewReadback({
  previewCustomize,
  targetFileName = 'mbo-employee-app.js',
  targetCssFileName = 'mbo-employee.css',
  newJsFileKey,
  newCssFileKey,
  baselinePreview = null,
  expectedScope = 'ALL'
}) {
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('PREVIEW_READBACK_MISMATCH: Missing or malformed preview customization.');
  }

  validateContainers(previewCustomize, 'Preview Readback');

  // 1. Verify exact scope
  if (!previewCustomize.scope || previewCustomize.scope !== expectedScope) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Scope "${previewCustomize.scope}" does not match expected scope "${expectedScope}".`);
  }

  if (baselinePreview && baselinePreview.scope !== previewCustomize.scope) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Scope changed from baseline "${baselinePreview.scope}" to "${previewCustomize.scope}".`);
  }

  // 2. Topology counts
  if (baselinePreview) {
    const pJs = previewCustomize.desktop?.js?.length || 0;
    const bJs = baselinePreview.desktop?.js?.length || 0;
    const pCss = previewCustomize.desktop?.css?.length || 0;
    const bCss = baselinePreview.desktop?.css?.length || 0;
    const pMJs = previewCustomize.mobile?.js?.length || 0;
    const bMJs = baselinePreview.mobile?.js?.length || 0;
    const pMCss = previewCustomize.mobile?.css?.length || 0;
    const bMCss = baselinePreview.mobile?.css?.length || 0;

    if (pJs !== bJs || pCss !== bCss || pMJs !== bMJs || pMCss !== bMCss) {
      throw new Error(`PREVIEW_READBACK_MISMATCH: Topology count mismatch (desktop.js: ${pJs}/${bJs}, desktop.css: ${pCss}/${bCss}, mobile.js: ${pMJs}/${bMJs}, mobile.css: ${pMCss}/${bMCss}).`);
    }
  }

  // 3. Target JS attached exactly once and has non-empty fileKey
  const previewDesktopJs = previewCustomize.desktop.js;
  const targetJsEntries = previewDesktopJs.filter(e => e && e.type === 'FILE' && e.file?.name === targetFileName);
  if (targetJsEntries.length === 0) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Target JS "${targetFileName}" is missing in preview desktop.js.`);
  }
  if (targetJsEntries.length > 1) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Target JS "${targetFileName}" is duplicated in preview desktop.js (count: ${targetJsEntries.length}).`);
  }
  if (!targetJsEntries[0].file?.fileKey || typeof targetJsEntries[0].file.fileKey !== 'string' || !targetJsEntries[0].file.fileKey.trim()) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Target JS "${targetFileName}" is missing preview fileKey.`);
  }

  // 4. Target CSS attached exactly once and has non-empty fileKey
  const previewDesktopCss = previewCustomize.desktop.css;
  const targetCssEntries = previewDesktopCss.filter(e => e && e.type === 'FILE' && e.file?.name === targetCssFileName);
  if (targetCssEntries.length === 0) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Target CSS "${targetCssFileName}" is missing in preview desktop.css.`);
  }
  if (targetCssEntries.length > 1) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Target CSS "${targetCssFileName}" is duplicated in preview desktop.css (count: ${targetCssEntries.length}).`);
  }
  if (!targetCssEntries[0].file?.fileKey || typeof targetCssEntries[0].file.fileKey !== 'string' || !targetCssEntries[0].file.fileKey.trim()) {
    throw new Error(`PREVIEW_READBACK_MISMATCH: Target CSS "${targetCssFileName}" is missing preview fileKey.`);
  }

  // 5. Retained entries remain unchanged and ordering preserved
  if (baselinePreview) {
    const compareRetained = (readbackList, baselineList, sectionName) => {
      for (let i = 0; i < readbackList.length; i++) {
        const r = readbackList[i];
        const b = baselineList[i];
        const isTarget = (
          (sectionName === 'desktop.js' && r.file?.name === targetFileName) ||
          (sectionName === 'desktop.css' && r.file?.name === targetCssFileName)
        );
        if (!isTarget) {
          if (r.type !== b.type) {
            throw new Error(`PREVIEW_READBACK_MISMATCH: Retained ${sectionName}[${i}] type changed (${r.type} vs ${b.type}).`);
          }
          if (r.type === 'URL' && r.url !== b.url) {
            throw new Error(`PREVIEW_READBACK_MISMATCH: Retained ${sectionName}[${i}] URL changed.`);
          }
          if (r.type === 'FILE') {
            if (r.file?.name !== b.file?.name) {
              throw new Error(`PREVIEW_READBACK_MISMATCH: Retained ${sectionName}[${i}] FILE name changed (${r.file?.name} vs ${b.file?.name}).`);
            }
            if (r.file?.fileKey !== b.file?.fileKey) {
              throw new Error(`PREVIEW_READBACK_MISMATCH: Retained ${sectionName}[${i}] FILE key changed.`);
            }
          }
        }
      }
    };

    compareRetained(previewCustomize.desktop.js, baselinePreview.desktop.js, 'desktop.js');
    compareRetained(previewCustomize.desktop.css, baselinePreview.desktop.css, 'desktop.css');
    compareRetained(previewCustomize.mobile.js, baselinePreview.mobile.js, 'mobile.js');
    compareRetained(previewCustomize.mobile.css, baselinePreview.mobile.css, 'mobile.css');
  }

  return true;
}

/**
 * Bounded exact-app deployment status polling.
 * Polls only exact App 794. Accepts only PROCESSING, SUCCESS, FAIL, CANCEL.
 * FAIL, CANCEL, missing App794, malformed status, read error, or timeout fail closed immediately.
 * Zero deploy POST retry. Zero automatic rollback.
 */
export async function pollApp794DeployStatus({
  kintoneRequest,
  app = 794,
  maxChecks = 20,
  delayMs = 1500,
  sleep = (ms) => new Promise(r => setTimeout(r, ms))
}) {
  if (typeof kintoneRequest !== 'function') {
    throw new Error('DEPLOY_STATUS_READ_ERROR: kintoneRequest function is required.');
  }

  if (Number(app) !== 794) {
    throw new Error(`DEPLOY_STATUS_APP_MISMATCH: Polling target must be exactly 794 (got ${app}).`);
  }

  let finalDeployStatus = null;
  let checksCompleted = 0;

  for (let check = 0; check < maxChecks; check += 1) {
    checksCompleted += 1;
    let statusResponse;
    try {
      statusResponse = await kintoneRequest(`/k/v1/preview/app/deploy.json?apps[0]=${app}`);
    } catch {
      throw new Error('DEPLOY_STATUS_READ_ERROR: Failed to read deployment status.');
    }

    if (!statusResponse || typeof statusResponse !== 'object' || !Array.isArray(statusResponse.apps)) {
      throw new Error('DEPLOY_STATUS_MALFORMED: Missing or malformed deploy status response.');
    }

    const exactAppEntry = statusResponse.apps.find(entry => Number(entry?.app) === 794);
    if (!exactAppEntry) {
      throw new Error('DEPLOY_STATUS_APP_MISSING: Deployment status response does not contain App 794.');
    }

    const rawStatus = exactAppEntry.status;
    if (!['PROCESSING', 'SUCCESS', 'FAIL', 'CANCEL'].includes(rawStatus)) {
      throw new Error(`DEPLOY_STATUS_MALFORMED: Unknown or invalid status "${rawStatus}" for App 794.`);
    }

    finalDeployStatus = rawStatus;
    console.log(`Deployment status check ${check + 1}: ${finalDeployStatus}`);

    if (finalDeployStatus === 'SUCCESS') {
      break;
    }

    if (finalDeployStatus === 'FAIL' || finalDeployStatus === 'CANCEL') {
      throw new Error(`DEPLOY_TERMINAL_FAIL: Deploy for App 794 reached terminal status ${finalDeployStatus}.`);
    }

    if (check < maxChecks - 1) {
      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  if (finalDeployStatus !== 'SUCCESS') {
    throw new Error(`DEPLOY_POLL_TIMEOUT: Deploy status polling timed out after ${maxChecks} checks (last status: ${finalDeployStatus ?? 'UNKNOWN'}).`);
  }

  return { status: 'SUCCESS', checks: checksCompleted };
}

/**
 * Sanitizes customization topology for publication/evidence (zero raw fileKeys).
 */
export function sanitizeTopologyForEvidence(customization) {
  if (!customization || typeof customization !== 'object') {
    return null;
  }
  const sanitizeEntries = (entries = []) => entries.map(e => {
    if (!e || typeof e !== 'object') return e;
    if (e.type === 'URL') return { type: 'URL', url: e.url };
    if (e.type === 'FILE') return { type: 'FILE', name: e.file?.name };
    return { type: e.type };
  });

  return {
    scope: customization.scope,
    desktop: {
      js: sanitizeEntries(customization.desktop?.js),
      css: sanitizeEntries(customization.desktop?.css)
    },
    mobile: {
      js: sanitizeEntries(customization.mobile?.js),
      css: sanitizeEntries(customization.mobile?.css)
    }
  };
}

/**
 * Pure validator for live metadata stability across content verification.
 * Verifies revision, attached target fileKeys, scope, and topology did not drift.
 */
export function validateLiveStability(
  initialLive,
  stabilityLive,
  targetFileName = 'mbo-employee-app.js',
  targetCssFileName = 'mbo-employee.css'
) {
  if (!stabilityLive || typeof stabilityLive !== 'object') {
    throw new Error('FINAL_CONVERGENCE_DRIFT: Stability live customization is missing or invalid.');
  }
  validateContainers(stabilityLive, 'Live Stability');

  if (stabilityLive.revision !== initialLive.revision) {
    throw new Error(`FINAL_CONVERGENCE_DRIFT: Live revision drifted from "${initialLive.revision}" to "${stabilityLive.revision}".`);
  }
  if (stabilityLive.scope !== initialLive.scope) {
    throw new Error(`FINAL_CONVERGENCE_DRIFT: Live scope drifted from "${initialLive.scope}" to "${stabilityLive.scope}".`);
  }

  const initJs = initialLive.desktop?.js?.find(e => e?.type === 'FILE' && e.file?.name === targetFileName);
  const stabJs = stabilityLive.desktop?.js?.find(e => e?.type === 'FILE' && e.file?.name === targetFileName);
  if (!stabJs?.file?.fileKey || stabJs.file.fileKey !== initJs?.file?.fileKey) {
    throw new Error('FINAL_CONVERGENCE_DRIFT: Live target JS attached fileKey drifted during verification.');
  }

  const initCss = initialLive.desktop?.css?.find(e => e?.type === 'FILE' && e.file?.name === targetCssFileName);
  const stabCss = stabilityLive.desktop?.css?.find(e => e?.type === 'FILE' && e.file?.name === targetCssFileName);
  if (!stabCss?.file?.fileKey || stabCss.file.fileKey !== initCss?.file?.fileKey) {
    throw new Error('FINAL_CONVERGENCE_DRIFT: Live target CSS attached fileKey drifted during verification.');
  }

  try {
    validateTopologyAlignment(initialLive, stabilityLive);
  } catch (err) {
    throw new Error(`FINAL_CONVERGENCE_DRIFT: Live topology drifted during verification: ${err.message}`);
  }
  return true;
}

/**
 * Validates final LIVE and PREVIEW convergence after deployment SUCCESS.
 * Validates scope, complete topology, exact target JS and CSS pair attachment,
 * preserved retained entries, and optional raw byte content verification.
 * Does NOT require target LIVE/PREVIEW/upload fileKey strings to be identical.
 * Publishes only sanitized hashes/metadata (zero raw fileKeys).
 */
export function validateCustomizationConvergence({
  liveCustomize,
  previewCustomize,
  targetFileName = 'mbo-employee-app.js',
  targetCssFileName = 'mbo-employee.css',
  newJsFileKey,
  newCssFileKey,
  baselinePreview = null,
  expectedScope = 'ALL',
  liveJsContent = null,
  liveCssContent = null,
  previewJsContent = null,
  previewCssContent = null,
  expectedJsSha256 = null,
  expectedJsByteLength = null,
  expectedCssSha256 = null,
  expectedCssByteLength = null
}) {
  if (!liveCustomize || typeof liveCustomize !== 'object') {
    throw new Error('FINAL_CONVERGENCE_MISMATCH: Missing or invalid live customization.');
  }
  if (!previewCustomize || typeof previewCustomize !== 'object') {
    throw new Error('FINAL_CONVERGENCE_MISMATCH: Missing or invalid preview customization.');
  }

  validateContainers(liveCustomize, 'Live Convergence');
  validateContainers(previewCustomize, 'Preview Convergence');

  // 1. Verify scope for both
  if (liveCustomize.scope !== expectedScope) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live scope "${liveCustomize.scope}" does not match expected scope "${expectedScope}".`);
  }
  if (previewCustomize.scope !== expectedScope) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Preview scope "${previewCustomize.scope}" does not match expected scope "${expectedScope}".`);
  }
  if (liveCustomize.scope !== previewCustomize.scope) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live scope "${liveCustomize.scope}" and preview scope "${previewCustomize.scope}" do not converge.`);
  }

  // 2. Validate PREVIEW against baseline & target pair presence
  validatePreviewReadback({
    previewCustomize,
    targetFileName,
    targetCssFileName,
    baselinePreview,
    expectedScope
  });

  // 3. Verify LIVE has exact target JS and CSS pair with valid fileKey
  const liveDesktopJs = liveCustomize.desktop.js;
  const targetLiveJsEntries = liveDesktopJs.filter(e => e && e.type === 'FILE' && e.file?.name === targetFileName);
  if (targetLiveJsEntries.length === 0) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live desktop.js missing target JS "${targetFileName}".`);
  }
  if (targetLiveJsEntries.length > 1) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live desktop.js has multiple entries for "${targetFileName}".`);
  }
  if (!targetLiveJsEntries[0].file?.fileKey || typeof targetLiveJsEntries[0].file.fileKey !== 'string' || !targetLiveJsEntries[0].file.fileKey.trim()) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live desktop.js target JS "${targetFileName}" is missing fileKey.`);
  }

  const liveDesktopCss = liveCustomize.desktop.css;
  const targetLiveCssEntries = liveDesktopCss.filter(e => e && e.type === 'FILE' && e.file?.name === targetCssFileName);
  if (targetLiveCssEntries.length === 0) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live desktop.css missing target CSS "${targetCssFileName}".`);
  }
  if (targetLiveCssEntries.length > 1) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live desktop.css has multiple entries for "${targetCssFileName}".`);
  }
  if (!targetLiveCssEntries[0].file?.fileKey || typeof targetLiveCssEntries[0].file.fileKey !== 'string' || !targetLiveCssEntries[0].file.fileKey.trim()) {
    throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live desktop.css target CSS "${targetCssFileName}" is missing fileKey.`);
  }

  // 4. Verify retained entries in LIVE match baseline
  if (baselinePreview) {
    const compareRetained = (liveList, baselineList, sectionName) => {
      if (liveList.length !== baselineList.length) {
        throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live ${sectionName} count (${liveList.length}) does not match expected (${baselineList.length}).`);
      }
      for (let i = 0; i < liveList.length; i++) {
        const l = liveList[i];
        const b = baselineList[i];
        const isTarget = (
          (sectionName === 'desktop.js' && l.file?.name === targetFileName) ||
          (sectionName === 'desktop.css' && l.file?.name === targetCssFileName)
        );
        if (!isTarget) {
          if (l.type !== b.type) {
            throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live retained ${sectionName}[${i}] type changed (${l.type} vs ${b.type}).`);
          }
          if (l.type === 'URL' && l.url !== b.url) {
            throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live retained ${sectionName}[${i}] URL changed.`);
          }
          if (l.type === 'FILE') {
            if (l.file?.name !== b.file?.name) {
              throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live retained ${sectionName}[${i}] FILE name changed (${l.file?.name} vs ${b.file?.name}).`);
            }
            if (l.file?.fileKey !== b.file?.fileKey) {
              throw new Error(`FINAL_CONVERGENCE_MISMATCH: Live retained ${sectionName}[${i}] FILE key changed.`);
            }
          }
        }
      }
    };

    compareRetained(liveCustomize.desktop.js, baselinePreview.desktop.js, 'desktop.js');
    compareRetained(liveCustomize.desktop.css, baselinePreview.desktop.css, 'desktop.css');
    compareRetained(liveCustomize.mobile.js, baselinePreview.mobile.js, 'mobile.js');
    compareRetained(liveCustomize.mobile.css, baselinePreview.mobile.css, 'mobile.css');
  }

  // 5. Final Live and Preview topology alignment
  validateTopologyAlignment(liveCustomize, previewCustomize);

  // 6. Optional content identity verification if buffers are supplied
  if (liveJsContent !== null && expectedJsSha256 && expectedJsByteLength) {
    verifyTargetContentIdentity({
      content: liveJsContent,
      expectedSha256: expectedJsSha256,
      expectedByteLength: expectedJsByteLength,
      targetFileName,
      location: 'Live'
    });
  }
  if (liveCssContent !== null && expectedCssSha256 && expectedCssByteLength) {
    verifyTargetContentIdentity({
      content: liveCssContent,
      expectedSha256: expectedCssSha256,
      expectedByteLength: expectedCssByteLength,
      targetFileName: targetCssFileName,
      location: 'Live'
    });
  }
  if (previewJsContent !== null && expectedJsSha256 && expectedJsByteLength) {
    verifyTargetContentIdentity({
      content: previewJsContent,
      expectedSha256: expectedJsSha256,
      expectedByteLength: expectedJsByteLength,
      targetFileName,
      location: 'Preview'
    });
  }
  if (previewCssContent !== null && expectedCssSha256 && expectedCssByteLength) {
    verifyTargetContentIdentity({
      content: previewCssContent,
      expectedSha256: expectedCssSha256,
      expectedByteLength: expectedCssByteLength,
      targetFileName: targetCssFileName,
      location: 'Preview'
    });
  }

  const sanitizedLive = sanitizeTopologyForEvidence(liveCustomize);
  const sanitizedPreview = sanitizeTopologyForEvidence(previewCustomize);
  const topologyHash = crypto.createHash('sha256').update(JSON.stringify(sanitizedLive)).digest('hex');

  return {
    converged: true,
    scope: liveCustomize.scope,
    topologyHash,
    sanitizedLive,
    sanitizedPreview
  };
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
  if (options.artifacts !== undefined) {
    throw new Error('CALLER_ARTIFACT_OVERRIDE_BLOCKED: Caller cannot supply artifact overrides in live deployment entrypoint; identity must be verified from disk.');
  }
  if (options.worktreeClean !== undefined) {
    throw new Error('CALLER_WORKTREE_CLEAN_OVERRIDE_BLOCKED: Caller cannot declare worktree clean in live deployment entrypoint; actual Git worktree status inspection is required.');
  }

  // 1. Resolve registry target without silent fallback catch
  let sandboxRegistryModule;
  try {
    sandboxRegistryModule = (await import('../../config/sandbox-apps.json', { with: { type: 'json' } })).default;
  } catch (err) {
    throw new Error(`APP794 DEPLOY BLOCKED: Cannot load sandbox-apps.json registry (${err.message}).`);
  }

  // 2. Validate target binding strictly using pure helper
  validateApp794DeployTargetBinding(options, sandboxRegistryModule);

  // 3. Validate authorization structure BEFORE any network or upload operation, WITHOUT consuming it
  validateApp794CustomizationDeployAuthorization(options.authConfig, options.requestConfig);

  // 4. Validate write target with literal ephemeral allow-list [794] and dryRunBypassDiscovery
  assertSandboxWriteTarget(794, sandboxRegistryModule, [794], { dryRunBypassDiscovery: true });

  // 5. PRE-BUILD SOURCE MANIFEST GATE (BEFORE BUILD AND BEFORE ANY KINTONE GET/NETWORK CALL):
  const gitHead = getCurrentGitHead();
  const clean = isWorktreeClean();

  validatePrebuildSourceManifest({
    releaseManifest: options.releaseManifest,
    currentGitHead: gitHead,
    worktreeClean: clean,
    isBuildOnly: false
  });

  // 6. ONLY AFTER PRE-BUILD GATE PASSES: Build candidate artifacts
  const artifacts = await prepareDeploymentArtifacts({ appId: 794, buildOptions: options.buildOptions });
  console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');

  const canonicalJsBytes = Buffer.from(artifacts.fullJs, 'utf8');
  const canonicalJsSha256 = crypto.createHash('sha256').update(canonicalJsBytes).digest('hex');
  const canonicalJsByteLength = canonicalJsBytes.length;

  const canonicalCssBytes = Buffer.from(artifacts.cssContent, 'utf8');
  const canonicalCssSha256 = crypto.createHash('sha256').update(canonicalCssBytes).digest('hex');
  const canonicalCssByteLength = canonicalCssBytes.length;

  // 7. ONLY AFTER BUILD: Read live and preview customization from Kintone
  const defaultClient = options.kintoneRequest ? null : await import('../../src/core/kintone-client.js');
  const requestFn = options.kintoneRequest || defaultClient.kintoneRequest;

  const liveCustomize = await requestFn(`/k/v1/app/customize.json?app=${app}`);
  const previewCustomize = await requestFn(`/k/v1/preview/app/customize.json?app=${app}`);

  // 8. PREFLIGHT: FULL DETERMINISTIC VALIDATION OF BUILT JS/CSS + SCOPE/TOPOLOGY
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
    checkWorktreeClean: false
  });

  // 9. AUTHORIZATION WRITE BOUNDARY: Consume authorization strictly here, immediately before the first write/upload
  assertApp794CustomizationDeployAuthorization(options.authConfig, options.requestConfig, { consume: true });

  // 10. File upload helper
  async function defaultUploadFile(filename, content, contentType) {
    const { getKintoneConnection } = await import('../../src/core/kintone-client.js');
    const { baseUrl, headers } = getKintoneConnection();
    const formData = new FormData();
    const blob = new Blob([content], { type: contentType });
    formData.append('file', blob, filename);

    const authHeaders = { ...headers };
    delete authHeaders['Content-Type'];

    let resp;
    try {
      const fetchFn = options.fetch || globalThis.fetch;
      resp = await fetchFn(`${baseUrl}/k/v1/file.json`, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      });
    } catch (networkError) {
      throw new Error(formatSanitizedUploadError(networkError, filename));
    }

    if (!resp.ok) {
      let errBody = null;
      try {
        errBody = await resp.json();
      } catch {
        try {
          errBody = await resp.text();
        } catch {
          errBody = null;
        }
      }
      throw new Error(formatSanitizedUploadError({ status: resp.status, data: errBody }, filename));
    }

    let data;
    try {
      data = await resp.json();
    } catch (parseError) {
      throw new Error(formatSanitizedUploadError(parseError, filename));
    }

    if (!data?.fileKey || typeof data.fileKey !== 'string') {
      throw new Error(`UPLOAD_FAILED: ${filename} - missing fileKey in response`);
    }

    console.log(`Uploaded ${filename} successfully.`);
    return data.fileKey;
  }

  const uploadFn = options.uploadFile || defaultUploadFile;

  // Upload JS (max 1 attempt, zero retry)
  let jsFileKey;
  try {
    jsFileKey = await uploadFn('mbo-employee-app.js', artifacts.fullJs, 'text/javascript');
  } catch (jsErr) {
    throw (jsErr instanceof Error && jsErr.message.startsWith('UPLOAD_FAILED:')) ? jsErr : new Error(formatSanitizedUploadError(jsErr, 'mbo-employee-app.js'));
  }

  // Upload CSS (max 1 attempt, zero retry)
  let cssFileKey;
  try {
    cssFileKey = await uploadFn('mbo-employee.css', artifacts.cssContent, 'text/css');
  } catch (cssErr) {
    throw (cssErr instanceof Error && cssErr.message.startsWith('UPLOAD_FAILED:')) ? cssErr : new Error(formatSanitizedUploadError(cssErr, 'mbo-employee.css'));
  }

  // 11. Build Preview PUT payload replacing BOTH JS and CSS fileKeys
  const putPayload = buildPreviewCustomizePayload({
    app,
    previewCustomize,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: jsFileKey,
    newCssFileKey: cssFileKey
  });

  // 12. Put Customization to Preview (max 1 attempt, zero retry)
  try {
    await requestFn(
      '/k/v1/preview/app/customize.json',
      getApp794DeployRequestOptions('/k/v1/preview/app/customize.json', 'PUT', putPayload)
    );
  } catch (putErr) {
    throw new Error(formatSanitizedUploadError(putErr, 'preview-customize-put'));
  }

  console.log('Customization preview updated.');

  // File download helper
  async function defaultDownloadFile(fileKey, filename = 'file') {
    if (!fileKey || typeof fileKey !== 'string' || !fileKey.trim()) {
      throw new Error(`DOWNLOAD_FAILED: Missing fileKey for ${filename}.`);
    }
    const { getKintoneConnection } = await import('../../src/core/kintone-client.js');
    const { baseUrl, headers } = getKintoneConnection();

    let resp;
    try {
      const fetchFn = options.fetch || globalThis.fetch;
      resp = await fetchFn(`${baseUrl}/k/v1/file.json?fileKey=${encodeURIComponent(fileKey)}`, {
        method: 'GET',
        headers
      });
    } catch (networkError) {
      throw new Error(formatSanitizedDownloadError(networkError, filename));
    }

    if (!resp.ok) {
      let errBody = null;
      try {
        errBody = await resp.json();
      } catch {
        try {
          errBody = await resp.text();
        } catch {
          errBody = null;
        }
      }
      throw new Error(formatSanitizedDownloadError({ status: resp.status, data: errBody }, filename));
    }

    try {
      const arrayBuffer = await resp.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (readError) {
      throw new Error(formatSanitizedDownloadError(readError, filename));
    }
  }

  const downloadFn = options.downloadFile || defaultDownloadFile;

  async function safeDownload(fileKey, filename) {
    let content;
    try {
      content = await downloadFn(fileKey, filename);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('DOWNLOAD_FAILED:')) {
        throw err;
      }
      throw new Error(formatSanitizedDownloadError(err, filename));
    }
    if (!content || (!Buffer.isBuffer(content) && !(content instanceof Uint8Array))) {
      throw new Error(`DOWNLOAD_FAILED: ${filename} - empty or invalid binary response`);
    }
    return Buffer.isBuffer(content) ? content : Buffer.from(content);
  }

  // 13. PREVIEW READ-BACK & CONTENT IDENTITY VERIFICATION BEFORE DEPLOY POST
  const previewReadback = await requestFn(`/k/v1/preview/app/customize.json?app=${app}`);
  validatePreviewReadback({
    previewCustomize: previewReadback,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    baselinePreview: previewCustomize,
    expectedScope: options.releaseManifest?.expectedScope || previewCustomize.scope || 'ALL'
  });

  const targetPreviewJsEntry = previewReadback.desktop.js.find(e => e?.type === 'FILE' && e.file?.name === 'mbo-employee-app.js');
  const targetPreviewCssEntry = previewReadback.desktop.css.find(e => e?.type === 'FILE' && e.file?.name === 'mbo-employee.css');

  // Download raw bytes for attached preview targets (max 1 attempt each, zero retry)
  const previewJsBytes = await safeDownload(targetPreviewJsEntry.file.fileKey, 'mbo-employee-app.js');
  verifyTargetContentIdentity({
    content: previewJsBytes,
    expectedSha256: canonicalJsSha256,
    expectedByteLength: canonicalJsByteLength,
    targetFileName: 'mbo-employee-app.js',
    location: 'Preview'
  });

  const previewCssBytes = await safeDownload(targetPreviewCssEntry.file.fileKey, 'mbo-employee.css');
  verifyTargetContentIdentity({
    content: previewCssBytes,
    expectedSha256: canonicalCssSha256,
    expectedByteLength: canonicalCssByteLength,
    targetFileName: 'mbo-employee.css',
    location: 'Preview'
  });

  // Re-read preview metadata immediately after content verification to prove stability (zero-drift)
  const previewStability = await requestFn(`/k/v1/preview/app/customize.json?app=${app}`);
  validatePreviewStability(previewReadback, previewStability);
  console.log('Preview target content identity and stability verified. Proceeding to deploy POST.');

  // 14. DEPLOY POST (EXACTLY ONCE, FAIL-CLOSED BEFORE POST IF ANY STEP ABOVE FAILED)
  const deployPostResult = await requestFn('/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: JSON.stringify({ apps: [{ app, revision: previewStability.revision }] })
  });

  // 15. BOUNDED EXACT-APP DEPLOY POLLING
  const pollResult = await pollApp794DeployStatus({
    kintoneRequest: requestFn,
    app,
    maxChecks: options.maxDeployStatusChecks ?? 20,
    delayMs: options.pollDelayMs ?? 1500,
    sleep: options.sleep
  });

  console.log(`Deploy polling completed successfully (${pollResult.checks} checks).`);

  // 16. FINAL LIVE AND PREVIEW METADATA AND CONTENT CONVERGENCE VERIFICATION
  const finalLive = await requestFn(`/k/v1/app/customize.json?app=${app}`);
  const finalPreview = await requestFn(`/k/v1/preview/app/customize.json?app=${app}`);

  const convergence = validateCustomizationConvergence({
    liveCustomize: finalLive,
    previewCustomize: finalPreview,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    expectedScope: options.releaseManifest?.expectedScope || 'ALL',
    expectedDesktopJsCount: 1,
    expectedDesktopCssCount: 1,
    expectedMobileJsCount: 0,
    expectedMobileCssCount: 0
  });

  const liveTargetJs = finalLive.desktop.js.find(e => e?.type === 'FILE' && e.file?.name === 'mbo-employee-app.js');
  const liveTargetCss = finalLive.desktop.css.find(e => e?.type === 'FILE' && e.file?.name === 'mbo-employee.css');
  const previewFinalJs = finalPreview.desktop.js.find(e => e?.type === 'FILE' && e.file?.name === 'mbo-employee-app.js');
  const previewFinalCss = finalPreview.desktop.css.find(e => e?.type === 'FILE' && e.file?.name === 'mbo-employee.css');

  // Download raw bytes for targets on BOTH Live and Preview (max 1 attempt each, zero retry)
  const liveJsBytes = await safeDownload(liveTargetJs.file.fileKey, 'mbo-employee-app.js');
  verifyTargetContentIdentity({
    content: liveJsBytes,
    expectedSha256: canonicalJsSha256,
    expectedByteLength: canonicalJsByteLength,
    targetFileName: 'mbo-employee-app.js',
    location: 'Live'
  });

  const liveCssBytes = await safeDownload(liveTargetCss.file.fileKey, 'mbo-employee.css');
  verifyTargetContentIdentity({
    content: liveCssBytes,
    expectedSha256: canonicalCssSha256,
    expectedByteLength: canonicalCssByteLength,
    targetFileName: 'mbo-employee.css',
    location: 'Live'
  });

  const previewFinalJsBytes = await safeDownload(previewFinalJs.file.fileKey, 'mbo-employee-app.js');
  verifyTargetContentIdentity({
    content: previewFinalJsBytes,
    expectedSha256: canonicalJsSha256,
    expectedByteLength: canonicalJsByteLength,
    targetFileName: 'mbo-employee-app.js',
    location: 'Preview'
  });

  const previewFinalCssBytes = await safeDownload(previewFinalCss.file.fileKey, 'mbo-employee.css');
  verifyTargetContentIdentity({
    content: previewFinalCssBytes,
    expectedSha256: canonicalCssSha256,
    expectedByteLength: canonicalCssByteLength,
    targetFileName: 'mbo-employee.css',
    location: 'Preview'
  });

  // Re-read metadata to verify stability after download
  const stabilityLive = await requestFn(`/k/v1/app/customize.json?app=${app}`);
  const stabilityPreview = await requestFn(`/k/v1/preview/app/customize.json?app=${app}`);

  validateLiveStability(finalLive, stabilityLive, 'mbo-employee-app.js', 'mbo-employee.css');
  validatePreviewStability(finalPreview, stabilityPreview, 'mbo-employee-app.js', 'mbo-employee.css');

  console.log(`MBO V2 Sandbox (App ${app}) Custom UI successfully deployed to LIVE! (topologyHash: ${convergence.topologyHash})`);

  return {
    app,
    deployed: true,
    converged: true,
    topologyHash: convergence.topologyHash,
    sanitizedLive: convergence.sanitizedLive,
    sanitizedPreview: convergence.sanitizedPreview
  };
}

const isExecutedAsScript = process.argv[1] && (process.argv[1].endsWith('deploy-custom-ui.js') || process.argv[1].endsWith('deploy-custom-ui'));
if (isExecutedAsScript) {
  executeDeployCustomUi().catch(err => {
    console.error('DEPLOY FAILED:', err);
    process.exit(1);
  });
}
