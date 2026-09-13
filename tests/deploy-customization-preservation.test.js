import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  validatePreflight,
  validateTopologyAlignment,
  validateReleaseManifest,
  validatePrebuildSourceManifest,
  buildPreviewCustomizePayload,
  prepareDeploymentArtifacts,
  executeDeployCustomUi,
  validateApp794DeployTargetBinding,
  gitBlobSha,
  getCurrentGitHead,
  isWorktreeClean,
  formatSanitizedUploadError,
  formatSanitizedDownloadError,
  validatePreviewReadback,
  validatePreviewStability,
  pollApp794DeployStatus,
  validateCustomizationConvergence,
  validateLiveStability,
  verifyTargetContentIdentity,
  sanitizeTopologyForEvidence,
  getApp794DeployRequestOptions
} from '../scripts/kintone/deploy-custom-ui.js';
import {
  APP794_CUSTOMIZATION_DEPLOY_WORK_PACKAGE,
  APP794_CUSTOMIZATION_DEPLOY_STAGE,
  APP794_CUSTOMIZATION_DEPLOY_OPERATION,
  APP794_MBO_V2_APP_ID,
  validateApp794CustomizationDeployAuthorization,
  assertApp794CustomizationDeployAuthorization
} from '../src/core/sandbox-write-guard.js';

// Standard valid live & preview fixtures matching real App794 topology
const getValidLiveFixture = () => ({
  scope: 'ALL',
  desktop: {
    js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY_111' } }],
    css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY_222' } }]
  },
  mobile: { js: [], css: [] }
});

const getValidPreviewFixture = () => ({
  revision: '42',
  scope: 'ALL',
  desktop: {
    js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY_333' } }],
    css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY_444' } }]
  },
  mobile: { js: [], css: [] }
});

const getValidManifestFixture = () => {
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';
  return {
    appId: 794,
    sourceCommit: currentHead,
    expectedJsBlobSha: 'JS_BLOB_SHA_1111',
    expectedCssBlobSha: 'CSS_BLOB_SHA_2222',
    expectedScope: 'ALL',
    expectedTopology: {
      desktopJsCount: 1,
      desktopCssCount: 1,
      mobileJsCount: 0,
      mobileCssCount: 0
    }
  };
};

test('GIT_BLOB_SHA_EXACT_BYTES_CRLF_DIFFERS_FROM_LF', () => {
  const lfContent = 'console.log("hello world");\n';
  const crlfContent = 'console.log("hello world");\r\n';

  const lfHash = gitBlobSha(lfContent);
  const crlfHash = gitBlobSha(crlfContent);

  assert.notEqual(lfHash, crlfHash, 'CRLF and LF bytes must produce different Git blob SHA identities');
  assert.equal(typeof lfHash, 'string');
  assert.equal(lfHash.length, 40);
  assert.equal(typeof crlfHash, 'string');
  assert.equal(crlfHash.length, 40);
});

test('ATOMIC_JS_CSS_PAIR_REQUIRED & CSS_CANDIDATE_REPLACED_NOT_PRESERVED', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  const manifest = getValidManifestFixture();
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // 1. Preflight passes for atomic JS + CSS target pair with valid manifest
  assert.equal(validatePreflight({
    liveCustomize: live,
    previewCustomize: preview,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    releaseManifest: manifest,
    candidateJsBlobSha: 'JS_BLOB_SHA_1111',
    candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
    currentGitHead: currentHead
  }), true);

  // 2. Payload replaces BOTH target JS fileKey AND target CSS fileKey
  const payload = buildPreviewCustomizePayload({
    app: 794,
    previewCustomize: preview,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: 'NEW_UPLOADED_JS_KEY_999',
    newCssFileKey: 'NEW_UPLOADED_CSS_KEY_888'
  });

  assert.equal(payload.desktop.js[0].file.fileKey, 'NEW_UPLOADED_JS_KEY_999');
  assert.equal(payload.desktop.css[0].file.fileKey, 'NEW_UPLOADED_CSS_KEY_888');
  assert.equal(payload.scope, 'ALL');
  assert.equal(payload.revision, '42');
  assert.deepEqual(payload.mobile.js, []);
  assert.deepEqual(payload.mobile.css, []);
});

test('PREBUILD_SOURCE_GATE_PROOF: validatePrebuildSourceManifest runs before candidate build and before network GET', () => {
  const currentHead = '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // 1. Missing releaseManifest -> MISSING_RELEASE_MANIFEST_BLOCKED_BEFORE_BUILD_AND_NETWORK
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: null,
      currentGitHead: currentHead,
      worktreeClean: true
    });
  }, /MISSING_RELEASE_MANIFEST_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  // 2. Source commit mismatch -> SOURCE_COMMIT_MISMATCH_BLOCKED_BEFORE_BUILD_AND_NETWORK
  const badManifest = { ...getValidManifestFixture(), sourceCommit: 'ffffffffffffffffffffffffffffffffffffffff' };
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: badManifest,
      currentGitHead: currentHead,
      worktreeClean: true
    });
  }, /SOURCE_COMMIT_MISMATCH_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  // 3. Short source commit SHA -> SHORT_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK
  const shortManifest = { ...getValidManifestFixture(), sourceCommit: currentHead.slice(0, 7) };
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: shortManifest,
      currentGitHead: currentHead,
      worktreeClean: true
    });
  }, /SHORT_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  // 4. Malformed source commit SHA -> MALFORMED_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK
  const malformedManifest = { ...getValidManifestFixture(), sourceCommit: '8f3774ab47625c95495eb1b41464d22a01273ccZ' };
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: malformedManifest,
      currentGitHead: currentHead,
      worktreeClean: true
    });
  }, /MALFORMED_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  // 5. Dirty worktree -> DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK
  const validManifest = { ...getValidManifestFixture(), sourceCommit: currentHead };
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: validManifest,
      currentGitHead: currentHead,
      worktreeClean: false
    });
  }, /DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  // 6. Exact clean source state -> PASS PRE-BUILD GATE
  assert.equal(validatePrebuildSourceManifest({
    releaseManifest: validManifest,
    currentGitHead: currentHead,
    worktreeClean: true
  }), true);
});

test('PURE_DIRTY_STATE_FALSE_BLOCKS & PURE_CLEAN_STATE_TRUE_PASSES & FOCUSED_TESTS_CLEAN_CHECKOUT_SAFE', () => {
  const currentHead = '8f3774ab47625c95495eb1b41464d22a01273cc9';
  const manifest = { ...getValidManifestFixture(), sourceCommit: currentHead };

  // Pure inputs test 1: worktreeClean = false MUST block deterministically
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: manifest,
      currentGitHead: currentHead,
      worktreeClean: false
    });
  }, /DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  // Pure inputs test 2: worktreeClean = true MUST pass deterministically
  assert.equal(validatePrebuildSourceManifest({
    releaseManifest: manifest,
    currentGitHead: currentHead,
    worktreeClean: true
  }), true);

  // Sanity check helper function exists and returns boolean
  const cleanResult = isWorktreeClean();
  assert.equal(typeof cleanResult, 'boolean');
});

test('CALLER_GIT_HEAD_OVERRIDE_NOT_ACCEPTED_IN_LIVE_PATH & UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE', async () => {
  const currentHead = getCurrentGitHead();
  assert.ok(currentHead, 'Current repository HEAD must be resolvable for this test');

  // 1. Live path blocks before network when authorization is missing, regardless of caller currentGitHead override
  const fakeManifest = { ...getValidManifestFixture(), sourceCommit: 'ffffffffffffffffffffffffffffffffffffffff' };
  await assert.rejects(
    async () => executeDeployCustomUi({ isBuildOnly: false, releaseManifest: fakeManifest, currentGitHead: 'ffffffffffffffffffffffffffffffffffffffff' }),
    /APP794 DEPLOY BLOCKED/
  );

  // 2. Unresolvable Git HEAD directly blocks preflight / validation
  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: getValidManifestFixture(),
      currentGitHead: null,
      worktreeClean: true
    });
  }, /UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_BUILD_AND_NETWORK/);

  assert.throws(() => {
    validatePrebuildSourceManifest({
      releaseManifest: getValidManifestFixture(),
      currentGitHead: 'invalid-head',
      worktreeClean: true
    });
  }, /UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_BUILD_AND_NETWORK/);
});

test('SHORT_SOURCE_SHA_BLOCKED & MALFORMED_SOURCE_SHA_BLOCKED & PREFIX_SOURCE_SHA_BLOCKED & EXACT_FULL_SOURCE_SHA_PASS', () => {
  const fullSha = '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // 1. Exact full 40-character SHA -> PASS
  const validManifest = { ...getValidManifestFixture(), sourceCommit: fullSha };
  assert.equal(validateReleaseManifest({
    manifest: validManifest,
    candidateJsBlobSha: 'JS_BLOB_SHA_1111',
    candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
    currentGitHead: fullSha
  }), true);

  // 2. Short SHA (e.g. 7-character prefix) -> SHORT_SOURCE_SHA_BLOCKED
  const shortManifest = { ...getValidManifestFixture(), sourceCommit: fullSha.slice(0, 7) };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: shortManifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: fullSha
    });
  }, /SHORT_SOURCE_SHA_BLOCKED/);

  // 3. Malformed SHA (non-hex chars) -> MALFORMED_SOURCE_SHA_BLOCKED
  const malformedManifest = { ...getValidManifestFixture(), sourceCommit: '8f3774ab47625c95495eb1b41464d22a01273ccZ' };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: malformedManifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: fullSha
    });
  }, /MALFORMED_SOURCE_SHA_BLOCKED/);

  // 4. Prefix matching when SHA length is 40 but differs -> PREFIX_SOURCE_SHA_BLOCKED
  const differentFullSha = '8f3774ab47625c95495eb1b41464d22a01273c00';
  const prefixManifest = { ...getValidManifestFixture(), sourceCommit: differentFullSha };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: prefixManifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: fullSha
    });
  }, /MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('MISSING_RELEASE_MANIFEST_BLOCKED_PRE_UPLOAD & MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();

  // 1. Missing release manifest in Live mode -> BLOCK
  assert.throws(() => {
    validateReleaseManifest({
      manifest: null,
      candidateJsBlobSha: 'JS',
      candidateCssBlobSha: 'CSS',
      isBuildOnly: false
    });
  }, /MISSING_RELEASE_MANIFEST_BLOCKED_PRE_UPLOAD/);

  // 2. Missing sourceCommit -> BLOCK
  const m1 = getValidManifestFixture(); delete m1.sourceCommit;
  assert.throws(() => {
    validateReleaseManifest({ manifest: m1, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
  }, /MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest sourceCommit field is missing/);

  // 3. Missing expectedJsBlobSha -> BLOCK
  const m2 = getValidManifestFixture(); delete m2.expectedJsBlobSha;
  assert.throws(() => {
    validateReleaseManifest({ manifest: m2, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
  }, /MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedJsBlobSha field is missing/);

  // 4. Missing expectedCssBlobSha -> BLOCK
  const m3 = getValidManifestFixture(); delete m3.expectedCssBlobSha;
  assert.throws(() => {
    validateReleaseManifest({ manifest: m3, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
  }, /MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedCssBlobSha field is missing/);

  // 5. Missing expectedScope -> BLOCK
  const m4 = getValidManifestFixture(); delete m4.expectedScope;
  assert.throws(() => {
    validateReleaseManifest({ manifest: m4, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
  }, /MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedScope field is missing/);

  // 6. Missing expectedTopology -> BLOCK
  const m5 = getValidManifestFixture(); delete m5.expectedTopology;
  assert.throws(() => {
    validateReleaseManifest({ manifest: m5, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
  }, /MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD: Manifest expectedTopology object is missing/);
});

test('MANIFEST_APP_ID_MISMATCH_BLOCKED_PRE_UPLOAD & MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD', () => {
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // 1. Manifest App ID != 794 -> BLOCK
  const mBadApp = { ...getValidManifestFixture(), appId: 795 };
  assert.throws(() => {
    validateReleaseManifest({ manifest: mBadApp, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead });
  }, /MANIFEST_APP_ID_MISMATCH_BLOCKED_PRE_UPLOAD/);

  // 2. Manifest sourceCommit does not match repository HEAD -> BLOCK
  const mBadCommit = { ...getValidManifestFixture(), sourceCommit: 'ffffffffffffffffffffffffffffffffffffffff' };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: mBadCommit,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
  }, /MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD & MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // 1. Manifest expectedScope does not match live/preview scope -> BLOCK
  const mBadScope = { ...getValidManifestFixture(), expectedScope: 'ADMIN' };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: mBadScope,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      liveCustomize: live,
      previewCustomize: preview,
      currentGitHead: currentHead
    });
  }, /MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD/);

  // 2. Manifest expectedTopology does not match preview topology -> BLOCK
  const mBadTop = {
    ...getValidManifestFixture(),
    expectedTopology: { desktopJsCount: 2, desktopCssCount: 1, mobileJsCount: 0, mobileCssCount: 0 }
  };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: mBadTop,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      liveCustomize: live,
      previewCustomize: preview,
      currentGitHead: currentHead
    });
  }, /MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD & CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD & EXACT_RELEASE_MANIFEST_PASS', () => {
  const manifest = getValidManifestFixture();
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // 1. Exact manifest and candidate pair -> PASS
  assert.equal(validateReleaseManifest({
    manifest,
    candidateJsBlobSha: 'JS_BLOB_SHA_1111',
    candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
    liveCustomize: getValidLiveFixture(),
    previewCustomize: getValidPreviewFixture(),
    currentGitHead: currentHead
  }), true);

  // 2. Candidate JS mismatch -> BLOCK
  assert.throws(() => {
    validateReleaseManifest({
      manifest,
      candidateJsBlobSha: 'BAD_JS_HASH',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
  }, /JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD/);

  // 3. Candidate CSS mismatch -> BLOCK
  assert.throws(() => {
    validateReleaseManifest({
      manifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'BAD_CSS_HASH',
      currentGitHead: currentHead
    });
  }, /CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD & TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // Missing target CSS
  const liveMissingCss = getValidLiveFixture();
  const previewMissingCss = getValidPreviewFixture();
  previewMissingCss.desktop.css = [];

  assert.throws(() => {
    validatePreflight({
      liveCustomize: liveMissingCss,
      previewCustomize: previewMissingCss,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD/);

  // Ambiguous target CSS
  const liveAmbiguousCss = getValidLiveFixture();
  const previewAmbiguousCss = getValidPreviewFixture();
  previewAmbiguousCss.desktop.css = [
    { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K1' } },
    { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }
  ];

  assert.throws(() => {
    validatePreflight({
      liveCustomize: liveAmbiguousCss,
      previewCustomize: previewAmbiguousCss,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('BUILD_ONLY_ZERO_NETWORK & DEPLOY_ENTRYPOINT_SCOPE_REGRESSION', async () => {
  // 1. prepareDeploymentArtifacts runs locally with 0 network calls and holds app, fullJs, cssContent, jsBlobSha, cssBlobSha
  const artifacts = await prepareDeploymentArtifacts({ appId: 794 });
  assert.equal(artifacts.app, 794);
  assert.equal(typeof artifacts.fullJs, 'string');
  assert.ok(artifacts.fullJs.length > 0);
  assert.equal(typeof artifacts.cssContent, 'string');

  // 2. executeDeployCustomUi in build-only mode executes cleanly with zero Kintone network calls
  const buildResult = await executeDeployCustomUi({ isBuildOnly: true, appId: 794 });
  assert.equal(buildResult.app, 794);
  assert.equal(buildResult.buildOnly, true);
  assert.equal(typeof buildResult.fullJs, 'string');
  assert.equal(typeof buildResult.cssContent, 'string');
  assert.equal(typeof buildResult.jsBlobSha, 'string');
  assert.equal(typeof buildResult.cssBlobSha, 'string');

  // 3. executeDeployCustomUi in live mode without authorization blocks before network operations
  await assert.rejects(
    async () => executeDeployCustomUi({ isBuildOnly: false, releaseManifest: getValidManifestFixture() }),
    /APP794 DEPLOY BLOCKED/
  );

  // 4. executeDeployCustomUi with supplied appId != 794 blocks immediately
  await assert.rejects(
    async () => executeDeployCustomUi({ isBuildOnly: false, appId: 795, releaseManifest: getValidManifestFixture() }),
    /APP794 DEPLOY BLOCKED/
  );
});

test('validateApp794DeployTargetBinding enforces strict App 794 binding across options and registry target drift', () => {
  // 1. registry.mboV2AppId = 795 -> BLOCK
  assert.throws(
    () => validateApp794DeployTargetBinding({}, { mboV2AppId: 795 }),
    /APP794 DEPLOY BLOCKED: Target App ID in sandbox-apps.json \(795\) must be exactly 794/
  );

  // 2. missing / malformed registry target -> BLOCK
  assert.throws(
    () => validateApp794DeployTargetBinding({}, {}),
    /APP794 DEPLOY BLOCKED: Target App ID in sandbox-apps.json \(undefined\) must be exactly 794/
  );
  assert.throws(
    () => validateApp794DeployTargetBinding({}, { mboV2AppId: '794' }),
    /APP794 DEPLOY BLOCKED: Target App ID in sandbox-apps.json \(794\) must be exactly 794/
  );
  assert.throws(
    () => validateApp794DeployTargetBinding({}, null),
    /APP794 DEPLOY BLOCKED: Missing or invalid sandbox registry object/
  );

  // 3. options.appId != 794 -> BLOCK
  assert.throws(
    () => validateApp794DeployTargetBinding({ appId: 795 }, { mboV2AppId: 794 }),
    /APP794 DEPLOY BLOCKED: Supplied options.appId \(795\) must be exactly 794/
  );

  // 4. exact registry.mboV2AppId = 794 -> PASS target-binding layer
  assert.equal(validateApp794DeployTargetBinding({}, { mboV2AppId: 794 }), 794);
  assert.equal(validateApp794DeployTargetBinding({ appId: 794 }, { mboV2AppId: 794 }), 794);
});

test('VALID_SCOPES_ALL_ADMIN_NONE: validates ALL, ADMIN, and NONE scope values', () => {
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';
  ['ALL', 'ADMIN', 'NONE'].forEach(validScope => {
    const live = { ...getValidLiveFixture(), scope: validScope };
    const preview = { ...getValidPreviewFixture(), scope: validScope };
    const manifest = { ...getValidManifestFixture(), expectedScope: validScope };
    assert.doesNotThrow(() => {
      validatePreflight({
        liveCustomize: live,
        previewCustomize: preview,
        releaseManifest: manifest,
        candidateJsBlobSha: 'JS_BLOB_SHA_1111',
        candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
        currentGitHead: currentHead
      });
    });
  });
});

test('MISSING_DESKTOP_OBJECT_BLOCKED_PRE_UPLOAD & ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  delete preview.desktop;

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /MISSING_DESKTOP_OBJECT_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD & ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  delete preview.mobile;

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const m = getValidManifestFixture();
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // desktop.js missing
  const p1 = getValidPreviewFixture(); delete p1.desktop.js;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p1, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead }); mockUpload(); }, /MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // desktop.css missing
  const p2 = getValidPreviewFixture(); delete p2.desktop.css;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p2, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead }); mockUpload(); }, /MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // mobile.js missing
  const p3 = getValidPreviewFixture(); delete p3.mobile.js;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p3, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead }); mockUpload(); }, /MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // mobile.css missing
  const p4 = getValidPreviewFixture(); delete p4.mobile.css;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p4, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead }); mockUpload(); }, /MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('INVALID_SCOPE_BLOCKED_PRE_UPLOAD: rejects non-standard scope strings', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = getValidLiveFixture();
  const previewBadScope = { ...getValidPreviewFixture(), scope: 'SUPER_ADMIN' };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewBadScope,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /INVALID_SCOPE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD: rejects -1 revision', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = getValidLiveFixture();
  const previewRevMinusOne = { ...getValidPreviewFixture(), revision: -1 };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewRevMinusOne,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('REVISION_NON_NUMERIC_BLOCKED_PRE_UPLOAD: rejects non-numeric revision strings', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = getValidLiveFixture();
  const previewRevString = { ...getValidPreviewFixture(), revision: 'invalid-rev' };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewRevString,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /REVISION_NON_NUMERIC_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD: rejects 0 or negative revision values', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = getValidLiveFixture();
  const previewRevZero = { ...getValidPreviewFixture(), revision: 0 };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewRevZero,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: currentHead
    });
    mockUpload();
  }, /REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('TARGET_MISSING_BLOCKED_PRE_UPLOAD & TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const m = getValidManifestFixture();
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  // Missing target JS
  const liveMissing = { scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js' } }], css: [{ type: 'FILE', file: { name: 'mbo-employee.css' } }] }, mobile: { js: [], css: [] } };
  const previewMissing = { revision: '1', scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js', fileKey: 'K' } }], css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }] }, mobile: { js: [], css: [] } };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveMissing, previewCustomize: previewMissing, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead });
    mockUpload();
  }, /TARGET_MISSING_BLOCKED_PRE_UPLOAD/);

  // Ambiguous target JS
  const liveAmbiguous = {
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'mbo-employee-app.js' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css' } }]
    },
    mobile: { js: [], css: [] }
  };
  const previewAmbiguous = {
    revision: '1',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K1' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K2' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K3' } }]
    },
    mobile: { js: [], css: [] }
  };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveAmbiguous, previewCustomize: previewAmbiguous, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead });
    mockUpload();
  }, /TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD: non-target FILE named mbo-employee-app.js in desktop.css must have fileKey', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const m = getValidManifestFixture();
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  const live = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_CSS_KEY' } }, { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS2' } }]
    },
    mobile: { js: [], css: [] }
  };

  const preview = {
    revision: '10',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: '' } }, { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS2' } }]
    },
    mobile: { js: [], css: [] }
  };

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: preview, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222', currentGitHead: currentHead });
    mockUpload();
  }, /SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('DISCOVERY_MODE_TRUE & WRITE_ALLOWED_APPS_EMPTY & PROTECTED_APPS_HARD_BLOCKED', async () => {
  const { DISCOVERY_MODE, WRITE_ALLOWED_APPS, PROTECTED_APP_IDS, assertSandboxWriteTarget } = await import('../src/core/sandbox-write-guard.js');
  assert.equal(DISCOVERY_MODE, true);
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.ok(PROTECTED_APP_IDS.includes(53));
  assert.ok(PROTECTED_APP_IDS.includes(283));

  // Protected 53 and 283 block
  assert.throws(() => assertSandboxWriteTarget(53), /PROTECTED PRODUCTION APP/);
  assert.throws(() => assertSandboxWriteTarget(283), /PROTECTED PRODUCTION APP/);
});

test('kintoneRequest bypassDiscovery option is required for write operations during Discovery Mode', async () => {
  const { kintoneRequest } = await import('../src/core/kintone-client.js');

  // Without bypassDiscovery: true, PUT/POST/DELETE fail with Discovery Phase Write Blocked
  await assert.rejects(
    async () => kintoneRequest('/k/v1/preview/app/customize.json', { method: 'PUT', body: {} }),
    /DISCOVERY PHASE WRITE BLOCKED/
  );

  await assert.rejects(
    async () => kintoneRequest('/k/v1/preview/app/deploy.json', { method: 'POST', body: {} }),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('getApp794DeployRequestOptions grants narrow bypassDiscovery ONLY to exact authorized App 794 Preview PUT and Deploy POST operations', async () => {
  const { getApp794DeployRequestOptions } = await import('../scripts/kintone/deploy-custom-ui.js');

  // 1. Exact authorized PUT preview/app/customize.json -> bypassDiscovery: true
  const putOpts = getApp794DeployRequestOptions('/k/v1/preview/app/customize.json', 'PUT', { app: 794 });
  assert.equal(putOpts.method, 'PUT');
  assert.equal(putOpts.bypassDiscovery, true);
  assert.deepEqual(putOpts.body, { app: 794 });

  // 2. Exact authorized POST preview/app/deploy.json -> bypassDiscovery: true
  const postOpts = getApp794DeployRequestOptions('/k/v1/preview/app/deploy.json', 'POST', { apps: [{ app: 794 }] });
  assert.equal(postOpts.method, 'POST');
  assert.equal(postOpts.bypassDiscovery, true);
  assert.deepEqual(postOpts.body, { apps: [{ app: 794 }] });

  // 3. Unrelated endpoints or wrong methods -> bypassDiscovery: false (fail-closed)
  const forbiddenCases = [
    { path: '/k/v1/preview/app/customize.json', method: 'POST' },
    { path: '/k/v1/preview/app/customize.json', method: 'DELETE' },
    { path: '/k/v1/preview/app/customize.json', method: 'GET' },
    { path: '/k/v1/app/customize.json', method: 'PUT' },
    { path: '/k/v1/app/customize.json', method: 'POST' },
    { path: '/k/v1/preview/app/deploy.json', method: 'PUT' },
    { path: '/k/v1/preview/app/deploy.json', method: 'GET' },
    { path: '/k/v1/record.json', method: 'POST' },
    { path: '/k/v1/preview/app/form/fields.json', method: 'PUT' },
    { path: '/k/v1/app/acl.json', method: 'PUT' }
  ];

  for (const c of forbiddenCases) {
    const opts = getApp794DeployRequestOptions(c.path, c.method);
    assert.equal(opts.method, c.method);
    assert.equal(opts.bypassDiscovery, false, `Expected bypassDiscovery: false for ${c.method} ${c.path}`);
  }
});

test('REQUIREMENT_A_REAL_TOPOLOGY_PASS: JS = mbo-employee-app.js, CSS = "mbo-employee.css" -> PASS', () => {
  const live = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };
  const preview = {
    revision: '66',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };
  const manifest = getValidManifestFixture();
  const head = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  assert.equal(validatePreflight({
    liveCustomize: live,
    previewCustomize: preview,
    releaseManifest: manifest,
    candidateJsBlobSha: 'JS_BLOB_SHA_1111',
    candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
    currentGitHead: head
  }), true);
});

test('REQUIREMENT_B_HISTORICAL_SPACED_CSS_FAIL_CLOSED: CSS = "mbo-employee .css" with erroneous space -> FAIL CLOSED', () => {
  const live = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee .css', fileKey: 'LIVE_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };
  const preview = {
    revision: '66',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee .css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };
  const manifest = getValidManifestFixture();
  const head = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: manifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: head
    });
  }, /TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD/);
});

test('REQUIREMENT_C_DUPLICATE_CSS_FAIL_CLOSED: multiple matching CSS entries -> FAIL CLOSED', () => {
  const live = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
      css: [
        { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY_1' } },
        { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY_2' } }
      ]
    },
    mobile: { js: [], css: [] }
  };
  const preview = {
    revision: '66',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [
        { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY_1' } },
        { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY_2' } }
      ]
    },
    mobile: { js: [], css: [] }
  };
  const manifest = getValidManifestFixture();
  const head = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: manifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: head
    });
  }, /TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD/);
});

test('REQUIREMENT_D_MISSING_CSS_FAIL_CLOSED: zero matching CSS entries -> FAIL CLOSED', () => {
  const live = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
      css: []
    },
    mobile: { js: [], css: [] }
  };
  const preview = {
    revision: '66',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: []
    },
    mobile: { js: [], css: [] }
  };
  const manifest = getValidManifestFixture();
  const head = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: manifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: head
    });
  }, /TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD/);
});

test('REQUIREMENT_E_PRESERVE_UNRELATED_ENTRIES: payload replaces JS/CSS target fileKeys while retaining unrelated entries and fileKeys', () => {
  const preview = {
    revision: '66',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'URL', url: 'https://example.com/vendor.js' },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'OLD_JS_KEY' } }
      ],
      css: [
        { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'OLD_CSS_KEY' } },
        { type: 'FILE', file: { name: 'unrelated.css', fileKey: 'RETAINED_CSS_KEY' } }
      ]
    },
    mobile: { js: [], css: [] }
  };

  const payload = buildPreviewCustomizePayload({
    app: 794,
    previewCustomize: preview,
    newJsFileKey: 'NEW_JS_KEY_123',
    newCssFileKey: 'NEW_CSS_KEY_456'
  });

  assert.equal(payload.desktop.js[0].type, 'URL');
  assert.equal(payload.desktop.js[0].url, 'https://example.com/vendor.js');
  assert.equal(payload.desktop.js[1].file.fileKey, 'NEW_JS_KEY_123');

  assert.equal(payload.desktop.css[0].file.fileKey, 'NEW_CSS_KEY_456');
  assert.equal(payload.desktop.css[1].file.fileKey, 'RETAINED_CSS_KEY');
});

test('BLOCKER_A_AUTHORIZATION_CONTRACT_IDENTITY: Correct D3 contract accepted; historical MBO-P03-WP-002C and STAGE_D1 rejected; wrong App ID rejected before network', () => {
  const validAuth = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'TEST_AUTH_D3_ID_001'
  };
  const validReq = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794
  };

  // Correct D3 contract passes validation
  assert.equal(validateApp794CustomizationDeployAuthorization(validAuth, validReq), true);

  // Historical workPackageId rejected
  assert.throws(
    () => validateApp794CustomizationDeployAuthorization(
      { ...validAuth, workPackageId: 'MBO-P03-WP-002C' },
      { ...validReq, workPackageId: 'MBO-P03-WP-002C' }
    ),
    /Work package must be exactly D3-SBX-DEPLOY-01/
  );

  // Historical stage rejected
  assert.throws(
    () => validateApp794CustomizationDeployAuthorization(
      { ...validAuth, stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY' },
      { ...validReq, stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY' }
    ),
    /Stage must be exactly STAGE_D3_APP794_CUSTOMIZATION_DEPLOY/
  );

  // Wrong App ID rejected before network
  assert.throws(
    () => validateApp794CustomizationDeployAuthorization(
      { ...validAuth, appId: 795 },
      { ...validReq, appId: 795 }
    ),
    /Target App ID must be exactly 794/
  );
  assert.throws(
    () => validateApp794CustomizationDeployAuthorization(
      { ...validAuth, appId: 53 },
      { ...validReq, appId: 53 }
    ),
    /permanent PROTECTED PRODUCTION APP/
  );
});

test('BLOCKER_B_AUTHORIZATION_CONSUMPTION: Not consumed during local validation/build/read preflight; consumed at upload boundary; replay rejected; invalid auth causes zero network', async () => {
  const currentHead = getCurrentGitHead();
  const authId = `AUTH_CONSUME_TEST_${Date.now()}`;
  const authConfig = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: authId
  };
  const requestConfig = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794
  };

  let networkCalls = 0;
  const mockNetwork = () => { networkCalls++; throw new Error('NETWORK_CALLED'); };

  // 1. Invalid authorization causes ZERO network and ZERO writes
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: { ...authConfig, activeWindow: false },
      requestConfig,
      kintoneRequest: mockNetwork,
      uploadFile: mockNetwork
    }),
    /One-time write window is CLOSED/
  );
  assert.equal(networkCalls, 0, 'Zero network calls when authConfig is invalid');

  // 2. Authorization is NOT consumed during preflight when preflight throws
  const badLiveFixture = { ...getValidLiveFixture(), scope: 'SUPER_ADMIN' };
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig,
      requestConfig,
      releaseManifest: { ...getValidManifestFixture(), sourceCommit: currentHead },
      kintoneRequest: async (path) => {
        if (path.includes('/k/v1/app/customize.json')) return badLiveFixture;
        if (path.includes('/k/v1/preview/app/customize.json')) return getValidPreviewFixture();
        return {};
      },
      uploadFile: mockNetwork
    }),
    /INVALID_SCOPE_BLOCKED_PRE_UPLOAD/
  );

  // Verify authId is still NOT consumed and can still validate
  assert.equal(validateApp794CustomizationDeployAuthorization(authConfig, requestConfig), true);

  // 3. Authorization IS consumed exactly at upload boundary
  let uploadCalled = false;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig,
      requestConfig,
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path.includes('/k/v1/preview/app/customize.json')) return getValidPreviewFixture();
        return {};
      },
      uploadFile: async () => {
        uploadCalled = true;
        throw new Error('STOP_AT_UPLOAD');
      }
    }),
    /STOP_AT_UPLOAD/
  );

  assert.equal(uploadCalled, true, 'Upload boundary was reached');

  // 4. Authorization replay is rejected fail-closed
  assert.throws(
    () => validateApp794CustomizationDeployAuthorization(authConfig, requestConfig),
    /APP794 DEPLOY BLOCKED: Authorization has already been consumed/
  );
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(authConfig, requestConfig),
    /APP794 DEPLOY BLOCKED: Authorization has already been consumed/
  );

  // Replay in executeDeployCustomUi blocks BEFORE any network call
  let replayNetworkCalls = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig,
      requestConfig,
      releaseManifest: { ...getValidManifestFixture(), sourceCommit: currentHead },
      kintoneRequest: async () => { replayNetworkCalls++; return {}; },
      uploadFile: async () => { replayNetworkCalls++; return 'key'; }
    }),
    /APP794 DEPLOY BLOCKED: Authorization has already been consumed/
  );
  assert.equal(replayNetworkCalls, 0, 'Replay causes zero network calls');
});

test('BLOCKER_C_UPLOAD_ERROR_SANITIZATION: JS upload max 1, CSS upload max 1, upload failure sanitized and zero retry', async () => {
  const currentHead = getCurrentGitHead();

  // 1. formatSanitizedUploadError redacts tokens, passwords, cookies, fileKeys, credentials
  const rawLeakError = {
    status: 400,
    data: {
      code: 'CB_VA01',
      message: 'Invalid upload: bearer secret_token_123 password=super_secret fileKey=file_leak_999 cookie: session_id_abc'
    }
  };
  const sanitized = formatSanitizedUploadError(rawLeakError, 'mbo-employee-app.js');
  assert.ok(sanitized.includes('HTTP 400'), 'Preserves safe status');
  assert.ok(sanitized.includes('CODE CB_VA01'), 'Preserves safe code');
  assert.ok(!sanitized.includes('secret_token_123'), 'Redacts bearer token');
  assert.ok(!sanitized.includes('super_secret'), 'Redacts password');
  assert.ok(!sanitized.includes('file_leak_999'), 'Redacts fileKey');
  assert.ok(!sanitized.includes('session_id_abc'), 'Redacts cookie');
  assert.ok(sanitized.includes('[REDACTED]'), 'Includes redaction marker');

  // 2. JS upload max 1, zero retry on failure, zero CSS upload, zero PUT
  let jsUploadCount = 0;
  let cssUploadCount = 0;
  let putCount = 0;
  const authId = `AUTH_UPLOAD_JS_FAIL_${Date.now()}`;

  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: authId
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (opts?.method === 'PUT') putCount++;
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path.includes('/k/v1/preview/app/customize.json')) return getValidPreviewFixture();
        return {};
      },
      uploadFile: async (filename) => {
        if (filename === 'mbo-employee-app.js') {
          jsUploadCount++;
          throw { status: 500, data: { code: 'GAIA_RE01', message: 'Internal server error token=secret_123' } };
        }
        if (filename === 'mbo-employee.css') {
          cssUploadCount++;
          return 'CSS_KEY';
        }
      }
    }),
    (err) => {
      assert.ok(err.message.includes('UPLOAD_FAILED: mbo-employee-app.js'));
      assert.ok(!err.message.includes('secret_123'), 'Sanitizes error message');
      return true;
    }
  );

  assert.equal(jsUploadCount, 1, 'JS upload attempted exactly once');
  assert.equal(cssUploadCount, 0, 'CSS upload was never called');
  assert.equal(putCount, 0, 'PUT was never called');

  // 3. CSS upload max 1, zero retry on failure, zero PUT
  let jsUploadCount2 = 0;
  let cssUploadCount2 = 0;
  let putCount2 = 0;
  const authId2 = `AUTH_UPLOAD_CSS_FAIL_${Date.now()}`;

  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: authId2
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (opts?.method === 'PUT') putCount2++;
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path.includes('/k/v1/preview/app/customize.json')) return getValidPreviewFixture();
        return {};
      },
      uploadFile: async (filename) => {
        if (filename === 'mbo-employee-app.js') {
          jsUploadCount2++;
          return 'NEW_JS_KEY_1';
        }
        if (filename === 'mbo-employee.css') {
          cssUploadCount2++;
          throw { status: 502, data: { code: 'GAIA_BG01', message: 'Bad Gateway' } };
        }
      }
    }),
    /UPLOAD_FAILED: mbo-employee.css/
  );

  assert.equal(jsUploadCount2, 1, 'JS upload exactly once');
  assert.equal(cssUploadCount2, 1, 'CSS upload attempted exactly once');
  assert.equal(putCount2, 0, 'PUT was never called');
});

test('BLOCKER_D_PREVIEW_READBACK_BEFORE_DEPLOY: PUT max 1, PUT failure causes zero deploy POST and zero retry; preview read-back mismatch blocks deploy POST', async () => {
  const currentHead = getCurrentGitHead();

  // 1. PUT failure causes zero deploy POST and zero retry
  let putCount = 0;
  let deployPostCount = 0;
  const authId = `AUTH_PUT_FAIL_${Date.now()}`;

  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: authId
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') {
          putCount++;
          throw { status: 400, data: { message: 'PUT rejected' } };
        }
        if (path.includes('/k/v1/preview/app/customize.json')) return getValidPreviewFixture();
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCount++;
          return {};
        }
        return {};
      },
      uploadFile: async (name) => `UPLOADED_${name}`
    }),
    /UPLOAD_FAILED: preview-customize-put/
  );

  assert.equal(putCount, 1, 'PUT attempted exactly once');
  assert.equal(deployPostCount, 0, 'Deploy POST was NEVER called');

  // 2. Preview read-back validation: pure helper tests
  const baseline = getValidPreviewFixture();
  const validReadback = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'KEY_JS_NEW' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'KEY_CSS_NEW' } }]
    },
    mobile: { js: [], css: [] }
  };

  // Exact preview passes
  assert.equal(validatePreviewReadback({
    previewCustomize: validReadback,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: 'KEY_JS_NEW',
    newCssFileKey: 'KEY_CSS_NEW',
    baselinePreview: baseline,
    expectedScope: 'ALL'
  }), true);

  // Topology count mismatch fails closed
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: { ...validReadback, desktop: { ...validReadback.desktop, js: [] } },
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      newJsFileKey: 'KEY_JS_NEW',
      newCssFileKey: 'KEY_CSS_NEW',
      baselinePreview: baseline
    }),
    /PREVIEW_READBACK_MISMATCH: Topology count mismatch/
  );

  // Missing target JS fails closed (count preserved with other file)
  const baselineOtherJs = {
    ...baseline,
    desktop: { ...baseline.desktop, js: [{ type: 'FILE', file: { name: 'other.js', fileKey: 'K' } }] }
  };
  const readbackOtherJs = {
    ...validReadback,
    desktop: { ...validReadback.desktop, js: [{ type: 'FILE', file: { name: 'other.js', fileKey: 'K' } }] }
  };
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: readbackOtherJs,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      newJsFileKey: 'KEY_JS_NEW',
      newCssFileKey: 'KEY_CSS_NEW',
      baselinePreview: baselineOtherJs
    }),
    /PREVIEW_READBACK_MISMATCH: Target JS "mbo-employee-app.js" is missing/
  );

  // Duplicate target JS fails closed
  const baselineDupJs = {
    ...baseline,
    desktop: {
      ...baseline.desktop,
      js: [
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K1' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K2' } }
      ]
    }
  };
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: {
        ...validReadback,
        desktop: {
          ...validReadback.desktop,
          js: [
            { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'KEY_JS_NEW' } },
            { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'KEY_JS_NEW' } }
          ]
        }
      },
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      newJsFileKey: 'KEY_JS_NEW',
      newCssFileKey: 'KEY_CSS_NEW',
      baselinePreview: baselineDupJs
    }),
    /PREVIEW_READBACK_MISMATCH: Target JS "mbo-employee-app.js" is duplicated/
  );

  // Target fileKey differing from upload key passes preview readback (content identity is verified via raw bytes)
  assert.equal(validatePreviewReadback({
    previewCustomize: {
      ...validReadback,
      desktop: {
        ...validReadback.desktop,
        js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'DIFFERENT_STORED_JS_KEY' } }]
      }
    },
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: 'UPLOAD_TOKEN_KEY',
    newCssFileKey: 'KEY_CSS_NEW',
    baselinePreview: baseline
  }), true);

  // Missing preview target JS fileKey fails closed
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: {
        ...validReadback,
        desktop: {
          ...validReadback.desktop,
          js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: '' } }]
        }
      },
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline
    }),
    /PREVIEW_READBACK_MISMATCH: Target JS "mbo-employee-app.js" is missing preview fileKey/
  );

  // Missing preview target CSS fileKey fails closed
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: {
        ...validReadback,
        desktop: {
          ...validReadback.desktop,
          css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: '' } }]
        }
      },
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline
    }),
    /PREVIEW_READBACK_MISMATCH: Target CSS "mbo-employee.css" is missing preview fileKey/
  );

  // Retained entry drift in preview read-back fails closed
  const baselineWithVendor = {
    revision: '42',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'URL', url: 'https://cdn.example.com/vendor.js' },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'OLD_JS_KEY' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'OLD_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };
  const driftedReadback = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'URL', url: 'https://cdn.example.com/drifted-vendor.js' },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'KEY_JS_NEW' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'KEY_CSS_NEW' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: driftedReadback,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      newJsFileKey: 'KEY_JS_NEW',
      newCssFileKey: 'KEY_CSS_NEW',
      baselinePreview: baselineWithVendor
    }),
    /PREVIEW_READBACK_MISMATCH: Retained desktop.js\[0\] URL changed/
  );

  // 3. In executeDeployCustomUi: Preview content identity mismatch blocks deploy POST
  let postDeployAttempts = 0;
  const authId2 = `AUTH_READBACK_MISMATCH_${Date.now()}`;

  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: authId2
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return {};
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_STORED_JS_KEY' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_STORED_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          postDeployAttempts++;
          return {};
        }
        return {};
      },
      uploadFile: async (name) => (name === 'mbo-employee-app.js' ? 'UPLOAD_JS_KEY' : 'UPLOAD_CSS_KEY'),
      downloadFile: async (fileKey, filename) => {
        // Return mismatched bytes to prove content check stops deploy POST
        return Buffer.from('mismatched-content-bytes');
      }
    }),
    /PREVIEW_CONTENT_IDENTITY_MISMATCH/
  );

  assert.equal(postDeployAttempts, 0, 'Deploy POST was strictly BLOCKED due to preview content identity mismatch');
});

test('BLOCKER_E_BOUNDED_EXACT_APP_DEPLOY_POLLING: Exact App794 required, FAIL/CANCEL stops, malformed status stops, timeout stops, deploy POST max 1', async () => {
  // 1. Success on check 2
  let pollChecks = 0;
  const pollSuccess = await pollApp794DeployStatus({
    app: 794,
    maxChecks: 5,
    delayMs: 0,
    kintoneRequest: async () => {
      pollChecks++;
      if (pollChecks === 1) return { apps: [{ app: '794', status: 'PROCESSING' }] };
      return { apps: [{ app: '794', status: 'SUCCESS' }] };
    }
  });
  assert.equal(pollSuccess.status, 'SUCCESS');
  assert.equal(pollSuccess.checks, 2);

  // 2. Missing App 794 in polling response fails closed
  await assert.rejects(
    async () => pollApp794DeployStatus({
      app: 794,
      maxChecks: 3,
      delayMs: 0,
      kintoneRequest: async () => ({ apps: [{ app: '795', status: 'SUCCESS' }] })
    }),
    /DEPLOY_STATUS_APP_MISSING: Deployment status response does not contain App 794/
  );

  // 3. FAIL terminal status fails closed immediately
  await assert.rejects(
    async () => pollApp794DeployStatus({
      app: 794,
      maxChecks: 5,
      delayMs: 0,
      kintoneRequest: async () => ({ apps: [{ app: '794', status: 'FAIL' }] })
    }),
    /DEPLOY_TERMINAL_FAIL: Deploy for App 794 reached terminal status FAIL/
  );

  // 4. CANCEL terminal status fails closed immediately
  await assert.rejects(
    async () => pollApp794DeployStatus({
      app: 794,
      maxChecks: 5,
      delayMs: 0,
      kintoneRequest: async () => ({ apps: [{ app: '794', status: 'CANCEL' }] })
    }),
    /DEPLOY_TERMINAL_FAIL: Deploy for App 794 reached terminal status CANCEL/
  );

  // 5. Malformed status fails closed immediately
  await assert.rejects(
    async () => pollApp794DeployStatus({
      app: 794,
      maxChecks: 5,
      delayMs: 0,
      kintoneRequest: async () => ({ apps: [{ app: '794', status: 'QUEUED_UNKNOWN' }] })
    }),
    /DEPLOY_STATUS_MALFORMED: Unknown or invalid status "QUEUED_UNKNOWN" for App 794/
  );

  // 6. Polling timeout fails closed
  await assert.rejects(
    async () => pollApp794DeployStatus({
      app: 794,
      maxChecks: 2,
      delayMs: 0,
      kintoneRequest: async () => ({ apps: [{ app: '794', status: 'PROCESSING' }] })
    }),
    /DEPLOY_POLL_TIMEOUT: Deploy status polling timed out after 2 checks/
  );
});

test('BLOCKER_F_FINAL_CONVERGENCE: LIVE/PREVIEW convergence passes; LIVE mismatch stops; PREVIEW mismatch stops; retained entries preserved', () => {
  const baseline = getValidPreviewFixture();
  const validTargetLive = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'CONVERGED_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'CONVERGED_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };
  const validTargetPreview = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'CONVERGED_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'CONVERGED_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };

  // 1. Exact LIVE/PREVIEW convergence passes
  const res = validateCustomizationConvergence({
    liveCustomize: validTargetLive,
    previewCustomize: validTargetPreview,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: 'CONVERGED_JS_KEY',
    newCssFileKey: 'CONVERGED_CSS_KEY',
    baselinePreview: baseline,
    expectedScope: 'ALL'
  });
  assert.equal(res.converged, true);
  assert.equal(typeof res.topologyHash, 'string');
  assert.equal(res.topologyHash.length, 64);
  assert.ok(!JSON.stringify(res).includes('CONVERGED_JS_KEY'), 'Zero raw fileKeys in published convergence evidence');

  // 2. Final LIVE scope mismatch fails closed
  assert.throws(
    () => validateCustomizationConvergence({
      liveCustomize: { ...validTargetLive, scope: 'ADMIN' },
      previewCustomize: validTargetPreview,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      newJsFileKey: 'CONVERGED_JS_KEY',
      newCssFileKey: 'CONVERGED_CSS_KEY',
      baselinePreview: baseline,
      expectedScope: 'ALL'
    }),
    /FINAL_CONVERGENCE_MISMATCH: Live scope "ADMIN" does not match expected scope "ALL"/
  );

  // 3. Final PREVIEW scope mismatch fails closed
  assert.throws(
    () => validateCustomizationConvergence({
      liveCustomize: validTargetLive,
      previewCustomize: { ...validTargetPreview, scope: 'NONE' },
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      newJsFileKey: 'CONVERGED_JS_KEY',
      newCssFileKey: 'CONVERGED_CSS_KEY',
      baselinePreview: baseline,
      expectedScope: 'ALL'
    }),
    /FINAL_CONVERGENCE_MISMATCH/
  );

  // 4. Live target fileKey differing from upload key passes structural convergence (bytes verified via download)
  const convDiffKey = validateCustomizationConvergence({
    liveCustomize: {
      ...validTargetLive,
      desktop: {
        ...validTargetLive.desktop,
        js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_STORED_LIVE_KEY' } }]
      }
    },
    previewCustomize: validTargetPreview,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    newJsFileKey: 'UPLOAD_TOKEN_KEY',
    newCssFileKey: 'CONVERGED_CSS_KEY',
    baselinePreview: baseline,
    expectedScope: 'ALL'
  });
  assert.equal(convDiffKey.converged, true);

  // 5. Missing Live target JS fileKey fails closed
  assert.throws(
    () => validateCustomizationConvergence({
      liveCustomize: {
        ...validTargetLive,
        desktop: {
          ...validTargetLive.desktop,
          js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: '' } }]
        }
      },
      previewCustomize: validTargetPreview,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline,
      expectedScope: 'ALL'
    }),
    /FINAL_CONVERGENCE_MISMATCH: Live desktop.js target JS "mbo-employee-app.js" is missing fileKey/
  );

  // 6. Live target content mismatch fails closed
  assert.throws(
    () => validateCustomizationConvergence({
      liveCustomize: validTargetLive,
      previewCustomize: validTargetPreview,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline,
      expectedScope: 'ALL',
      liveJsContent: Buffer.from('mismatched-live-bytes'),
      expectedJsSha256: 'cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3',
      expectedJsByteLength: 640471
    }),
    /LIVE_CONTENT_IDENTITY_MISMATCH/
  );
});

test('FULL_E2E_MOCK_EXECUTION: Zero real network, deploy POST max 1, PUT max 1, upload max 1 each, full convergence', async () => {
  const currentHead = getCurrentGitHead();
  const authId = `AUTH_FULL_E2E_TEST_${Date.now()}`;

  let getLiveCalls = 0;
  let getPreviewCalls = 0;
  let jsUploadCalls = 0;
  let cssUploadCalls = 0;
  let putPreviewCalls = 0;
  let deployPostCalls = 0;
  let deployPollCalls = 0;
  const downloadCalls = [];

  const initialLive = getValidLiveFixture();
  const initialPreview = getValidPreviewFixture();

  const uploadedJsKey = 'UPLOADED_JS_KEY_888';
  const uploadedCssKey = 'UPLOADED_CSS_KEY_999';
  const previewStoredJsKey = 'PREVIEW_STORED_JS_KEY_123';
  const previewStoredCssKey = 'PREVIEW_STORED_CSS_KEY_456';
  const liveStoredJsKey = 'LIVE_STORED_JS_KEY_789';
  const liveStoredCssKey = 'LIVE_STORED_CSS_KEY_012';

  const updatedPreview = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: previewStoredJsKey } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: previewStoredCssKey } }]
    },
    mobile: { js: [], css: [] }
  };

  const finalLive = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: liveStoredJsKey } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: liveStoredCssKey } }]
    },
    mobile: { js: [], css: [] }
  };

  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  const result = await executeDeployCustomUi({
    isBuildOnly: false,
    authConfig: {
      workPackageId: 'D3-SBX-DEPLOY-01',
      stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
      operation: 'APP794_CUSTOMIZATION_DEPLOY',
      appId: 794,
      activeWindow: true,
      explicitUserAuthorization: true,
      authorizationId: authId
    },
    requestConfig: {
      workPackageId: 'D3-SBX-DEPLOY-01',
      stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
      operation: 'APP794_CUSTOMIZATION_DEPLOY',
      appId: 794
    },
    releaseManifest: {
      ...getValidManifestFixture(),
      sourceCommit: currentHead,
      expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
      expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
    },
    pollDelayMs: 0,
    sleep: () => Promise.resolve(),
    uploadFile: async (name) => {
      if (name === 'mbo-employee-app.js') {
        jsUploadCalls++;
        return uploadedJsKey;
      }
      if (name === 'mbo-employee.css') {
        cssUploadCalls++;
        return uploadedCssKey;
      }
      throw new Error(`Unexpected upload: ${name}`);
    },
    downloadFile: async (fileKey, filename) => {
      downloadCalls.push({ fileKey, filename });
      if (filename === 'mbo-employee-app.js') {
        return canonicalJsBuf;
      }
      if (filename === 'mbo-employee.css') {
        return canonicalCssBuf;
      }
      throw new Error(`Unexpected download: ${filename}`);
    },
    kintoneRequest: async (path, opts) => {
      if (path === '/k/v1/app/customize.json?app=794') {
        getLiveCalls++;
        return (deployPostCalls > 0) ? finalLive : initialLive;
      }
      if (path === '/k/v1/preview/app/customize.json?app=794') {
        getPreviewCalls++;
        return (putPreviewCalls > 0) ? updatedPreview : initialPreview;
      }
      if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') {
        putPreviewCalls++;
        return { revision: '43' };
      }
      if (path === '/k/v1/preview/app/deploy.json' && opts?.method === 'POST') {
        deployPostCalls++;
        return {};
      }
      if (path.startsWith('/k/v1/preview/app/deploy.json?apps[0]=794')) {
        deployPollCalls++;
        return { apps: [{ app: '794', status: 'SUCCESS' }] };
      }
      throw new Error(`Unexpected request: ${path}`);
    }
  });

  // Strict operational accounting assertions
  assert.equal(result.deployed, true);
  assert.equal(result.converged, true);
  assert.equal(result.app, 794);
  assert.equal(typeof result.topologyHash, 'string');
  assert.equal(result.topologyHash.length, 64);
  assert.ok(!JSON.stringify(result).includes(uploadedJsKey), 'No raw JS fileKey exposed');
  assert.ok(!JSON.stringify(result).includes(uploadedCssKey), 'No raw CSS fileKey exposed');
  assert.ok(!JSON.stringify(result).includes(previewStoredJsKey), 'No stored preview JS fileKey exposed');
  assert.ok(!JSON.stringify(result).includes(liveStoredJsKey), 'No stored live JS fileKey exposed');

  assert.equal(jsUploadCalls, 1, 'JS upload called exactly once');
  assert.equal(cssUploadCalls, 1, 'CSS upload called exactly once');
  assert.equal(putPreviewCalls, 1, 'Preview PUT called exactly once');
  assert.equal(deployPostCalls, 1, 'Deploy POST called exactly once');
  assert.equal(deployPollCalls, 1, 'Deploy status polling succeeded');
  assert.equal(getLiveCalls, 3, 'Live customization read at preflight, final convergence, and stability check');
  assert.equal(getPreviewCalls, 5, 'Preview read at preflight, read-back, preview stability check, final convergence, and final stability check');
  assert.equal(downloadCalls.length, 6, 'Target files downloaded: 2 in Preview verification + 4 in final convergence');
  assert.equal(downloadCalls.filter(d => d.filename === 'mbo-employee-app.js').length, 3, '3 JS downloads (1 preview + 1 live + 1 final preview)');
  assert.equal(downloadCalls.filter(d => d.filename === 'mbo-employee.css').length, 3, '3 CSS downloads (1 preview + 1 live + 1 final preview)');
});

test('REGRESSION_FINDING_2: CALLER_ARTIFACT_OVERRIDE_CANNOT_BYPASS_IDENTITY_GUARD', async () => {
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';
  const authConfig = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: `AUTH_ARTIFACT_BYPASS_${Date.now()}`
  };
  const requestConfig = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794
  };

  // 1. Caller attempt to supply options.artifacts to live entrypoint MUST be rejected fail-closed
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      artifacts: {
        app: 794,
        fullJs: 'console.log("spoofed-js");',
        cssContent: 'body { color: red; }',
        jsBlobSha: 'fake_spoofed_js_hash_12345678901234567890',
        cssBlobSha: 'fake_spoofed_css_hash_12345678901234567890'
      },
      authConfig,
      requestConfig,
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: 'fake_spoofed_js_hash_12345678901234567890',
        expectedCssBlobSha: 'fake_spoofed_css_hash_12345678901234567890'
      }
    }),
    /CALLER_ARTIFACT_OVERRIDE_BLOCKED: Caller cannot supply artifact overrides in live deployment entrypoint; identity must be verified from disk/
  );

  // 2. Identity MUST be verified from actual artifact bytes on disk:
  // Manifest expecting spoofed hashes is rejected against actual disk bytes even without options.artifacts
  let networkCalls = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig,
      requestConfig,
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: 'ffffffffffffffffffffffffffffffffffffffff',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path.includes('/k/v1/preview/app/customize.json')) return getValidPreviewFixture();
        return {};
      },
      uploadFile: async () => { networkCalls++; return 'key'; }
    }),
    /JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD/
  );
  assert.equal(networkCalls, 0, 'Zero write network calls when disk artifact does not match expected manifest');
});

test('REGRESSION_FINDING_3: CALLER_CLEAN_OVERRIDE_CANNOT_BYPASS_DIRTY_WORKTREE_GUARD', async () => {
  const currentHead = getCurrentGitHead() || '8f3774ab47625c95495eb1b41464d22a01273cc9';
  const authConfig = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: `AUTH_WORKTREE_BYPASS_${Date.now()}`
  };
  const requestConfig = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794
  };

  // 1. Caller attempt to declare worktreeClean: true in live entrypoint MUST be rejected fail-closed
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      worktreeClean: true,
      authConfig,
      requestConfig,
      releaseManifest: { ...getValidManifestFixture(), sourceCommit: currentHead }
    }),
    /CALLER_WORKTREE_CLEAN_OVERRIDE_BLOCKED: Caller cannot declare worktree clean in live deployment entrypoint; actual Git worktree status inspection is required/
  );

  // 2. Caller attempt to pass worktreeClean: false in live entrypoint is also rejected (no caller override allowed)
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      worktreeClean: false,
      authConfig,
      requestConfig,
      releaseManifest: { ...getValidManifestFixture(), sourceCommit: currentHead }
    }),
    /CALLER_WORKTREE_CLEAN_OVERRIDE_BLOCKED: Caller cannot declare worktree clean in live deployment entrypoint; actual Git worktree status inspection is required/
  );

  // 3. validatePrebuildSourceManifest with dirty worktree fails closed
  assert.throws(
    () => validatePrebuildSourceManifest({
      releaseManifest: { ...getValidManifestFixture(), sourceCommit: currentHead },
      currentGitHead: currentHead,
      worktreeClean: false
    }),
    /DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK/
  );
});

test('TARGET_CONTENT_IDENTITY_VERIFICATION: Keys differ, but bytes/hash/size match => passes; Keys match, but bytes mismatch => STOP fail-closed', () => {
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');
  const jsSha = crypto.createHash('sha256').update(canonicalJsBuf).digest('hex');
  const cssSha = crypto.createHash('sha256').update(canonicalCssBuf).digest('hex');

  // 1. Exact bytes match passes verification regardless of what fileKey was used
  const jsRes = verifyTargetContentIdentity({
    content: canonicalJsBuf,
    expectedSha256: jsSha,
    expectedByteLength: canonicalJsBuf.length,
    targetFileName: 'mbo-employee-app.js',
    location: 'Preview'
  });
  assert.equal(jsRes.verified, true);
  assert.equal(jsRes.sha256, jsSha);
  assert.equal(jsRes.byteLength, canonicalJsBuf.length);

  const cssRes = verifyTargetContentIdentity({
    content: canonicalCssBuf,
    expectedSha256: cssSha,
    expectedByteLength: canonicalCssBuf.length,
    targetFileName: 'mbo-employee.css',
    location: 'Preview'
  });
  assert.equal(cssRes.verified, true);
  assert.equal(cssRes.sha256, cssSha);
  assert.equal(cssRes.byteLength, canonicalCssBuf.length);

  // 2. Keys match but content bytes mismatch => STOP fail-closed
  const corruptedJs = Buffer.from(canonicalJsBuf);
  corruptedJs[0] = corruptedJs[0] ^ 0xff;
  assert.throws(
    () => verifyTargetContentIdentity({
      content: corruptedJs,
      expectedSha256: jsSha,
      expectedByteLength: canonicalJsBuf.length,
      targetFileName: 'mbo-employee-app.js',
      location: 'Preview'
    }),
    /PREVIEW_CONTENT_IDENTITY_MISMATCH/
  );

  // 3. Byte length mismatch => STOP fail-closed
  const truncatedJs = canonicalJsBuf.subarray(0, 100);
  assert.throws(
    () => verifyTargetContentIdentity({
      content: truncatedJs,
      expectedSha256: jsSha,
      expectedByteLength: canonicalJsBuf.length,
      targetFileName: 'mbo-employee-app.js',
      location: 'Live'
    }),
    /LIVE_CONTENT_IDENTITY_MISMATCH/
  );

  // 4. Empty or malformed content => STOP fail-closed
  assert.throws(
    () => verifyTargetContentIdentity({
      content: null,
      expectedSha256: jsSha,
      expectedByteLength: canonicalJsBuf.length,
      targetFileName: 'mbo-employee-app.js',
      location: 'Preview'
    }),
    /PREVIEW_CONTENT_IDENTITY_MISMATCH: Downloaded content for mbo-employee-app.js in Preview is empty or malformed/
  );
  assert.throws(
    () => verifyTargetContentIdentity({
      content: 'not a buffer',
      expectedSha256: jsSha,
      expectedByteLength: canonicalJsBuf.length,
      targetFileName: 'mbo-employee-app.js',
      location: 'Preview'
    }),
    /PREVIEW_CONTENT_IDENTITY_MISMATCH/
  );
});

test('PREVIEW_CONTENT_MISMATCH_INDEPENDENTLY_BLOCKS_DEPLOY_POST: JS or CSS content mismatch independently causes deploy POST = 0', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  // Subtest A: Preview JS content mismatch causes deploy POST = 0
  let deployPostCountA = 0;
  let cssDownloadCalledA = false;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_PREVIEW_JS_MISMATCH_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return {};
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_KEY_JS' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_KEY_CSS' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCountA++;
          return {};
        }
        return {};
      },
      uploadFile: async () => 'UPLOAD_KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') {
          return Buffer.from('corrupted-preview-js');
        }
        if (filename === 'mbo-employee.css') {
          cssDownloadCalledA = true;
          return canonicalCssBuf;
        }
      }
    }),
    /PREVIEW_CONTENT_IDENTITY_MISMATCH/
  );
  assert.equal(deployPostCountA, 0, 'Deploy POST was NOT called when Preview JS content mismatched');
  assert.equal(cssDownloadCalledA, false, 'CSS download was NOT called after JS content mismatch failed closed');

  // Subtest B: Preview CSS content mismatch causes deploy POST = 0
  let deployPostCountB = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_PREVIEW_CSS_MISMATCH_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return {};
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_KEY_JS' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_KEY_CSS' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCountB++;
          return {};
        }
        return {};
      },
      uploadFile: async () => 'UPLOAD_KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') {
          return canonicalJsBuf;
        }
        if (filename === 'mbo-employee.css') {
          return Buffer.from('corrupted-preview-css');
        }
      }
    }),
    /PREVIEW_CONTENT_IDENTITY_MISMATCH/
  );
  assert.equal(deployPostCountB, 0, 'Deploy POST was NOT called when Preview CSS content mismatched');
});

test('DOWNLOAD_ERROR_STOPS_WITH_ZERO_RETRY: Preview JS or CSS download failure causes immediate fail-closed and deploy POST = 0', async () => {
  const currentHead = getCurrentGitHead();

  // Subtest A: JS download failure
  let jsDownloadAttemptsA = 0;
  let deployPostCountA = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_DL_JS_FAIL_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return {};
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_KEY_JS' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_KEY_CSS' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCountA++;
          return {};
        }
        return {};
      },
      uploadFile: async () => 'UPLOAD_KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') {
          jsDownloadAttemptsA++;
          throw { status: 500, data: { code: 'GAIA_RE01', message: 'Internal Server Error' } };
        }
      }
    }),
    /DOWNLOAD_FAILED: mbo-employee-app.js - HTTP 500/
  );
  assert.equal(jsDownloadAttemptsA, 1, 'Download attempted exactly once (zero retry)');
  assert.equal(deployPostCountA, 0, 'Deploy POST was NEVER called');

  // Subtest B: CSS download failure
  let cssDownloadAttemptsB = 0;
  let deployPostCountB = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_DL_CSS_FAIL_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return {};
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_KEY_JS' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_KEY_CSS' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCountB++;
          return {};
        }
        return {};
      },
      uploadFile: async () => 'UPLOAD_KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') {
          return fs.readFileSync('dist/mbo-employee-app.js');
        }
        if (filename === 'mbo-employee.css') {
          cssDownloadAttemptsB++;
          throw { status: 404, data: { code: 'CB_NO02', message: 'File not found' } };
        }
      }
    }),
    /DOWNLOAD_FAILED: mbo-employee.css - HTTP 404/
  );
  assert.equal(cssDownloadAttemptsB, 1, 'Download attempted exactly once (zero retry)');
  assert.equal(deployPostCountB, 0, 'Deploy POST was NEVER called');
});

test('PREVIEW_STABILITY_DRIFT_STOPS_BEFORE_DEPLOY_POST: Revision, fileKey, scope, or topology drift after download stops deploy POST', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  const createStabilityDriftTest = async (getDriftedStability) => {
    let deployPostCalls = 0;
    let previewReadCount = 0;
    await assert.rejects(
      async () => executeDeployCustomUi({
        isBuildOnly: false,
        authConfig: {
          workPackageId: 'D3-SBX-DEPLOY-01',
          stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
          operation: 'APP794_CUSTOMIZATION_DEPLOY',
          appId: 794,
          activeWindow: true,
          explicitUserAuthorization: true,
          authorizationId: `AUTH_STABILITY_${Date.now()}_${Math.random()}`
        },
        requestConfig: {
          workPackageId: 'D3-SBX-DEPLOY-01',
          stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
          operation: 'APP794_CUSTOMIZATION_DEPLOY',
          appId: 794
        },
        releaseManifest: {
          ...getValidManifestFixture(),
          sourceCommit: currentHead,
          expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
          expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
        },
        kintoneRequest: async (path, opts) => {
          if (path.includes('/k/v1/app/customize.json')) return getValidLiveFixture();
          if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return {};
          if (path.includes('/k/v1/preview/app/customize.json')) {
            previewReadCount++;
            if (previewReadCount === 1) return getValidPreviewFixture();
            if (previewReadCount === 2) {
              return {
                revision: '43',
                scope: 'ALL',
                desktop: {
                  js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
                  css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
                },
                mobile: { js: [], css: [] }
              };
            }
            if (previewReadCount === 3) {
              return getDriftedStability();
            }
          }
          if (path.includes('/k/v1/preview/app/deploy.json')) {
            deployPostCalls++;
            return {};
          }
          return {};
        },
        uploadFile: async () => 'UPLOAD_KEY',
        downloadFile: async (fileKey, filename) => {
          if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
          if (filename === 'mbo-employee.css') return canonicalCssBuf;
        }
      }),
      /PREVIEW_STABILITY_DRIFT/
    );
    assert.equal(deployPostCalls, 0, 'Deploy POST was NEVER called on stability drift');
  };

  // Subtest A: Revision drift
  await createStabilityDriftTest(() => ({
    revision: '44',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  }));

  // Subtest B: Target JS fileKey drift
  await createStabilityDriftTest(() => ({
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'DRIFTED_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  }));

  // Subtest C: Target CSS fileKey drift
  await createStabilityDriftTest(() => ({
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'DRIFTED_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  }));

  // Subtest D: Scope drift
  await createStabilityDriftTest(() => ({
    revision: '43',
    scope: 'ADMIN',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  }));

  // Subtest E: Topology entry count drift
  await createStabilityDriftTest(() => ({
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } },
        { type: 'FILE', file: { name: 'extra.js', fileKey: 'EXTRA_KEY' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  }));
});

test('FINAL_CONVERGENCE_CONTENT_MISMATCH_OR_DRIFT_FAILS: Live or Preview byte mismatch or post-download stability drift causes convergence to fail', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  // Subtest A: Live JS content mismatch during final convergence
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_CONV_LIVE_JS_FAIL_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      pollDelayMs: 0,
      sleep: () => Promise.resolve(),
      uploadFile: async () => 'KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js' && fileKey === 'LIVE_JS_KEY') {
          return Buffer.from('corrupted-live-js');
        }
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path === '/k/v1/app/customize.json?app=794') {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json?apps[0]=794')) {
          return { apps: [{ app: '794', status: 'SUCCESS' }] };
        }
        return {};
      }
    }),
    /LIVE_CONTENT_IDENTITY_MISMATCH/
  );

  // Subtest B: Live revision drift during final stability check
  let liveReadCount = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_CONV_LIVE_REV_DRIFT_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      pollDelayMs: 0,
      sleep: () => Promise.resolve(),
      uploadFile: async () => 'KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path === '/k/v1/app/customize.json?app=794') {
          liveReadCount++;
          if (liveReadCount === 1) return getValidLiveFixture();
          if (liveReadCount === 2) {
            return {
              revision: '43',
              scope: 'ALL',
              desktop: {
                js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
                css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
              },
              mobile: { js: [], css: [] }
            };
          }
          if (liveReadCount === 3) {
            return {
              revision: '44', // DRIFTED
              scope: 'ALL',
              desktop: {
                js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
                css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
              },
              mobile: { js: [], css: [] }
            };
          }
        }
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json?apps[0]=794')) {
          return { apps: [{ app: '794', status: 'SUCCESS' }] };
        }
        return {};
      }
    }),
    /FINAL_CONVERGENCE_DRIFT: Live revision drifted from "43" to "44"/
  );
});

test('DIFFERENT_FILEKEYS_WITH_MATCHING_BYTES_PASS_DEPLOYMENT: Keys differ across upload, preview, and live, but bytes match canonical => PASS', async () => {
  const currentHead = getCurrentGitHead();
  const authId = `AUTH_DIFF_KEYS_TEST_${Date.now()}`;

  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  const uploadJsToken = 'UPLOAD_TOKEN_JS_AAA';
  const uploadCssToken = 'UPLOAD_TOKEN_CSS_BBB';
  const previewInternalJsKey = 'PREVIEW_INTERNAL_JS_CCC';
  const previewInternalCssKey = 'PREVIEW_INTERNAL_CSS_DDD';
  const liveInternalJsKey = 'LIVE_INTERNAL_JS_EEE';
  const liveInternalCssKey = 'LIVE_INTERNAL_CSS_FFF';

  let deployPostCalls = 0;
  const downloadedKeys = [];

  const previewCustomization = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: previewInternalJsKey } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: previewInternalCssKey } }]
    },
    mobile: { js: [], css: [] }
  };

  const liveCustomization = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: liveInternalJsKey } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: liveInternalCssKey } }]
    },
    mobile: { js: [], css: [] }
  };

  const result = await executeDeployCustomUi({
    isBuildOnly: false,
    authConfig: {
      workPackageId: 'D3-SBX-DEPLOY-01',
      stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
      operation: 'APP794_CUSTOMIZATION_DEPLOY',
      appId: 794,
      activeWindow: true,
      explicitUserAuthorization: true,
      authorizationId: authId
    },
    requestConfig: {
      workPackageId: 'D3-SBX-DEPLOY-01',
      stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
      operation: 'APP794_CUSTOMIZATION_DEPLOY',
      appId: 794
    },
    releaseManifest: {
      ...getValidManifestFixture(),
      sourceCommit: currentHead,
      expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
      expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
    },
    pollDelayMs: 0,
    sleep: () => Promise.resolve(),
    uploadFile: async (name) => (name === 'mbo-employee-app.js' ? uploadJsToken : uploadCssToken),
    downloadFile: async (fileKey, filename) => {
      downloadedKeys.push(fileKey);
      if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
      if (filename === 'mbo-employee.css') return canonicalCssBuf;
    },
    kintoneRequest: async (path, opts) => {
      if (path === '/k/v1/app/customize.json?app=794') {
        return (deployPostCalls > 0) ? liveCustomization : getValidLiveFixture();
      }
      if (path === '/k/v1/preview/app/customize.json?app=794') {
        return previewCustomization;
      }
      if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') {
        return { revision: '43' };
      }
      if (path === '/k/v1/preview/app/deploy.json' && opts?.method === 'POST') {
        deployPostCalls++;
        return {};
      }
      if (path.startsWith('/k/v1/preview/app/deploy.json?apps[0]=794')) {
        return { apps: [{ app: '794', status: 'SUCCESS' }] };
      }
      return {};
    }
  });

  assert.equal(result.deployed, true);
  assert.equal(result.converged, true);
  assert.equal(deployPostCalls, 1);
  assert.ok(downloadedKeys.includes(previewInternalJsKey), 'Preview internal JS key was downloaded');
  assert.ok(downloadedKeys.includes(previewInternalCssKey), 'Preview internal CSS key was downloaded');
  assert.ok(downloadedKeys.includes(liveInternalJsKey), 'Live internal JS key was downloaded');
  assert.ok(downloadedKeys.includes(liveInternalCssKey), 'Live internal CSS key was downloaded');
});

test('BLOCKER_1_DEPLOY_POST_TRANSPORT_CONTRACT: getApp794DeployRequestOptions provides authorized bypass, object body, and single serialization', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  let capturedDeployPostOpts = null;
  let deployPostAttempts = 0;

  const previewCustomization = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_KEY_JS' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_KEY_CSS' } }]
    },
    mobile: { js: [], css: [] }
  };

  const result = await executeDeployCustomUi({
    isBuildOnly: false,
    authConfig: {
      workPackageId: 'D3-SBX-DEPLOY-01',
      stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
      operation: 'APP794_CUSTOMIZATION_DEPLOY',
      appId: 794,
      activeWindow: true,
      explicitUserAuthorization: true,
      authorizationId: `AUTH_DEPLOY_CONTRACT_${Date.now()}`
    },
    requestConfig: {
      workPackageId: 'D3-SBX-DEPLOY-01',
      stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
      operation: 'APP794_CUSTOMIZATION_DEPLOY',
      appId: 794
    },
    releaseManifest: {
      ...getValidManifestFixture(),
      sourceCommit: currentHead,
      expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
      expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
    },
    pollDelayMs: 0,
    sleep: () => Promise.resolve(),
    uploadFile: async () => 'KEY',
    downloadFile: async (fileKey, filename) => {
      if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
      if (filename === 'mbo-employee.css') return canonicalCssBuf;
    },
    kintoneRequest: async (path, opts) => {
      if (path === '/k/v1/app/customize.json?app=794') return getValidLiveFixture();
      if (path === '/k/v1/preview/app/customize.json?app=794') return previewCustomization;
      if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return { revision: '43' };
      if (path === '/k/v1/preview/app/deploy.json' && opts?.method === 'POST') {
        deployPostAttempts++;
        capturedDeployPostOpts = opts;
        return {};
      }
      if (path.startsWith('/k/v1/preview/app/deploy.json?apps[0]=794')) {
        return { apps: [{ app: '794', status: 'SUCCESS' }] };
      }
      return {};
    }
  });

  assert.equal(result.deployed, true);
  assert.equal(deployPostAttempts, 1);
  assert.ok(capturedDeployPostOpts, 'Deploy POST options were captured');
  assert.equal(capturedDeployPostOpts.method, 'POST');
  assert.equal(capturedDeployPostOpts.bypassDiscovery, true, 'Deploy POST must have bypassDiscovery: true');
  assert.equal(typeof capturedDeployPostOpts.body, 'object', 'Deploy POST body must be an object');
  assert.notEqual(typeof capturedDeployPostOpts.body, 'string', 'Deploy POST body must NOT be a pre-serialized string');
  assert.deepEqual(capturedDeployPostOpts.body, { apps: [{ app: 794, revision: '43' }] });

  // Verify serialization contract identical to default client (kintoneRequest in src/core/kintone-client.js):
  // Default client does: ...(body === undefined ? {} : { body: JSON.stringify(body) })
  const clientSerializedBody = JSON.stringify(capturedDeployPostOpts.body);
  assert.equal(typeof clientSerializedBody, 'string');
  const deserialized = JSON.parse(clientSerializedBody);
  assert.deepEqual(deserialized, { apps: [{ app: 794, revision: '43' }] });
  assert.equal(deserialized.apps[0].app, 794);
  assert.equal(deserialized.apps[0].revision, '43');
});

test('BLOCKER_1_DEPLOY_POST_FAILURE_SANITIZED_AND_ZERO_RETRY: deploy POST failure records sanitized error, zero retry, and does not poll further', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  let deployPostAttempts = 0;
  let pollAttempts = 0;

  const previewCustomization = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'SERVER_KEY_JS' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'SERVER_KEY_CSS' } }]
    },
    mobile: { js: [], css: [] }
  };

  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_DEPLOY_FAIL_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: {
        ...getValidManifestFixture(),
        sourceCommit: currentHead,
        expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
        expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61'
      },
      uploadFile: async () => 'KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path === '/k/v1/app/customize.json?app=794') return getValidLiveFixture();
        if (path === '/k/v1/preview/app/customize.json?app=794') return previewCustomization;
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return { revision: '43' };
        if (path === '/k/v1/preview/app/deploy.json' && opts?.method === 'POST') {
          deployPostAttempts++;
          throw {
            status: 502,
            data: {
              code: 'GAIA_RE01',
              message: 'Bad Gateway token=secret_token_123 password=secret_pw_456 fileKey=secret_key_789'
            }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json?apps[0]=794')) {
          pollAttempts++;
          return { apps: [{ app: '794', status: 'SUCCESS' }] };
        }
        return {};
      }
    }),
    (err) => {
      assert.match(err.message, /UPLOAD_FAILED: preview-deploy-post/);
      assert.match(err.message, /HTTP 502/);
      assert.match(err.message, /CODE GAIA_RE01/);
      assert.match(err.message, /Bad Gateway/);
      assert.doesNotMatch(err.message, /secret_token_123/);
      assert.doesNotMatch(err.message, /secret_pw_456/);
      assert.doesNotMatch(err.message, /secret_key_789/);
      return true;
    }
  );

  assert.equal(deployPostAttempts, 1, 'Deploy POST was attempted exactly once (zero retry)');
  assert.equal(pollAttempts, 0, 'Deploy status polling was NEVER called after deploy POST failure');
});

test('BLOCKER_2_RETAINED_FILE_KEY_DRIFT_BEFORE_DEPLOY_STOPS_WITH_ZERO_DEPLOY_POST', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  const baselineWithRetained = {
    revision: '42',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'RETAINED_VENDOR_KEY_ORIG' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };

  const manifestWithRetained = {
    ...getValidManifestFixture(),
    sourceCommit: currentHead,
    expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
    expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61',
    expectedTopology: {
      desktopJsCount: 2,
      desktopCssCount: 1,
      mobileJsCount: 0,
      mobileCssCount: 0
    }
  };

  // Subtest A: Step 13 preview readback retained FILE key changed vs baselinePreview => deploy POST = 0
  let deployPostCallsA = 0;
  let previewCallCountA = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_RETAINED_READBACK_DRIFT_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: manifestWithRetained,
      uploadFile: async () => 'NEW_KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return baselineWithRetained;
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return { revision: '43' };
        if (path.includes('/k/v1/preview/app/customize.json')) {
          previewCallCountA++;
          if (previewCallCountA === 1) {
            return baselineWithRetained;
          }
          // Readback has drifted fileKey for retained-vendor.js
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [
                { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'DRIFTED_VENDOR_KEY' } },
                { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'NEW_KEY_JS' } }
              ],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'NEW_KEY_CSS' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCallsA++;
          return {};
        }
        return {};
      }
    }),
    /PREVIEW_READBACK_MISMATCH: Retained desktop.js\[0\] FILE key changed/
  );
  assert.equal(deployPostCallsA, 0, 'Deploy POST was NEVER called on retained fileKey drift during readback');

  // Subtest B: Step 13 stability check retained FILE key drifted after download => deploy POST = 0
  let deployPostCallsB = 0;
  let previewReadCountB = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_RETAINED_STABILITY_DRIFT_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: manifestWithRetained,
      uploadFile: async () => 'NEW_KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path.includes('/k/v1/app/customize.json')) return baselineWithRetained;
        if (path === '/k/v1/preview/app/customize.json' && opts?.method === 'PUT') return { revision: '43' };
        if (path.includes('/k/v1/preview/app/customize.json')) {
          previewReadCountB++;
          if (previewReadCountB === 1) return baselineWithRetained;
          if (previewReadCountB === 2) {
            // Readback before download: valid
            return {
              revision: '43',
              scope: 'ALL',
              desktop: {
                js: [
                  { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'RETAINED_VENDOR_KEY_ORIG' } },
                  { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'NEW_KEY_JS' } }
                ],
                css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'NEW_KEY_CSS' } }]
              },
              mobile: { js: [], css: [] }
            };
          }
          if (previewReadCountB === 3) {
            // Post-download stability read: retained fileKey drifted
            return {
              revision: '43',
              scope: 'ALL',
              desktop: {
                js: [
                  { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'DRIFTED_VENDOR_KEY_POST_DL' } },
                  { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'NEW_KEY_JS' } }
                ],
                css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'NEW_KEY_CSS' } }]
              },
              mobile: { js: [], css: [] }
            };
          }
        }
        if (path.includes('/k/v1/preview/app/deploy.json')) {
          deployPostCallsB++;
          return {};
        }
        return {};
      }
    }),
    /PREVIEW_STABILITY_DRIFT: Retained desktop.js\[0\] FILE key drifted/
  );
  assert.equal(deployPostCallsB, 0, 'Deploy POST was NEVER called on retained fileKey drift during stability check');
});

test('BLOCKER_2_RETAINED_FILE_KEY_DRIFT_IN_CONVERGENCE_AND_STABILITY_FAILS', async () => {
  const currentHead = getCurrentGitHead();
  const canonicalJsBuf = fs.readFileSync('dist/mbo-employee-app.js');
  const canonicalCssBuf = fs.readFileSync('dist/mbo-employee.css');

  const baselineWithRetained = {
    revision: '42',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'RETAINED_VENDOR_KEY_ORIG' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };

  const manifestWithRetained = {
    ...getValidManifestFixture(),
    sourceCommit: currentHead,
    expectedJsBlobSha: '6a29a0e652ab8bb210589583b2a2ebfa2754aafa',
    expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61',
    expectedTopology: {
      desktopJsCount: 2,
      desktopCssCount: 1,
      mobileJsCount: 0,
      mobileCssCount: 0
    }
  };

  // Subtest A: Step 16 finalLive retained FILE key changed vs baselinePreview => convergence fails
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_CONV_RETAINED_LIVE_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: manifestWithRetained,
      pollDelayMs: 0,
      sleep: () => Promise.resolve(),
      uploadFile: async () => 'KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path === '/k/v1/app/customize.json?app=794') {
          // Live customization has drifted fileKey for retained-vendor.js
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [
                { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'DRIFTED_LIVE_VENDOR_KEY' } },
                { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }
              ],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [
                { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'RETAINED_VENDOR_KEY_ORIG' } },
                { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }
              ],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json?apps[0]=794')) {
          return { apps: [{ app: '794', status: 'SUCCESS' }] };
        }
        return {};
      }
    }),
    /FINAL_CONVERGENCE_MISMATCH: Live retained desktop.js\[0\] FILE key changed/
  );

  // Subtest B: Step 16 finalLive stability check retained FILE key drifted after download => fails
  let liveReadCountB = 0;
  await assert.rejects(
    async () => executeDeployCustomUi({
      isBuildOnly: false,
      authConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794,
        activeWindow: true,
        explicitUserAuthorization: true,
        authorizationId: `AUTH_CONV_RETAINED_LIVE_STAB_${Date.now()}`
      },
      requestConfig: {
        workPackageId: 'D3-SBX-DEPLOY-01',
        stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
        operation: 'APP794_CUSTOMIZATION_DEPLOY',
        appId: 794
      },
      releaseManifest: manifestWithRetained,
      pollDelayMs: 0,
      sleep: () => Promise.resolve(),
      uploadFile: async () => 'KEY',
      downloadFile: async (fileKey, filename) => {
        if (filename === 'mbo-employee-app.js') return canonicalJsBuf;
        if (filename === 'mbo-employee.css') return canonicalCssBuf;
      },
      kintoneRequest: async (path, opts) => {
        if (path === '/k/v1/app/customize.json?app=794') {
          liveReadCountB++;
          if (liveReadCountB === 1) return baselineWithRetained;
          if (liveReadCountB === 2) {
            return {
              revision: '43',
              scope: 'ALL',
              desktop: {
                js: [
                  { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'RETAINED_VENDOR_KEY_ORIG' } },
                  { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }
                ],
                css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
              },
              mobile: { js: [], css: [] }
            };
          }
          if (liveReadCountB === 3) {
            // Retained key drifted in post-download stability read
            return {
              revision: '43',
              scope: 'ALL',
              desktop: {
                js: [
                  { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'DRIFTED_LIVE_VENDOR_KEY_POST_DL' } },
                  { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }
                ],
                css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY' } }]
              },
              mobile: { js: [], css: [] }
            };
          }
        }
        if (path.includes('/k/v1/preview/app/customize.json')) {
          return {
            revision: '43',
            scope: 'ALL',
            desktop: {
              js: [
                { type: 'FILE', file: { name: 'retained-vendor.js', fileKey: 'RETAINED_VENDOR_KEY_ORIG' } },
                { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }
              ],
              css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } }]
            },
            mobile: { js: [], css: [] }
          };
        }
        if (path.includes('/k/v1/preview/app/deploy.json?apps[0]=794')) {
          return { apps: [{ app: '794', status: 'SUCCESS' }] };
        }
        return {};
      }
    }),
    /FINAL_CONVERGENCE_DRIFT: Live retained desktop.js\[0\] FILE key drifted/
  );
});

test('BLOCKER_2_RETAINED_URL_ORDER_TYPE_DRIFT_IS_BLOCKED: URL, order, or type drift in retained entries fails closed', () => {
  const baseline = {
    revision: '42',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'URL', url: 'https://cdn.example.com/lib.js' },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K_JS' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K_CSS' } }]
    },
    mobile: { js: [], css: [] }
  };

  // 1. Retained URL drifted in validatePreviewReadback
  const readbackDriftedUrl = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'URL', url: 'https://cdn.example.com/drifted-lib.js' },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K_JS_NEW' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K_CSS_NEW' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: readbackDriftedUrl,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline
    }),
    /PREVIEW_READBACK_MISMATCH: Retained desktop.js\[0\] URL changed/
  );

  // 2. Retained order drifted (target and retained swapped) in validatePreviewReadback
  const readbackDriftedOrder = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K_JS_NEW' } },
        { type: 'URL', url: 'https://cdn.example.com/lib.js' }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K_CSS_NEW' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: readbackDriftedOrder,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline
    }),
    /PREVIEW_READBACK_MISMATCH: Retained desktop.js\[0\] order changed/
  );

  // 3. Retained type drifted (URL changed to FILE) in validatePreviewReadback
  const readbackDriftedType = {
    revision: '43',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'lib.js', fileKey: 'KEY_LIB' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K_JS_NEW' } }
      ],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K_CSS_NEW' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(
    () => validatePreviewReadback({
      previewCustomize: readbackDriftedType,
      targetFileName: 'mbo-employee-app.js',
      targetCssFileName: 'mbo-employee.css',
      baselinePreview: baseline
    }),
    /PREVIEW_READBACK_MISMATCH: Retained desktop.js\[0\] type changed/
  );

  // 4. Retained URL drifted in validatePreviewStability
  assert.throws(
    () => validatePreviewStability(
      baseline,
      {
        ...baseline,
        desktop: {
          js: [
            { type: 'URL', url: 'https://cdn.example.com/drifted.js' },
            { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K_JS' } }
          ],
          css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K_CSS' } }]
        }
      }
    ),
    /PREVIEW_STABILITY_DRIFT: desktop.js\[0\] URL drifted/
  );

  // 5. Retained type drifted in validateLiveStability
  assert.throws(
    () => validateLiveStability(
      baseline,
      {
        ...baseline,
        desktop: {
          js: [
            { type: 'FILE', file: { name: 'lib.js', fileKey: 'K_LIB' } },
            { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K_JS' } }
          ],
          css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K_CSS' } }]
        }
      }
    ),
    /FINAL_CONVERGENCE_DRIFT: Live desktop.js\[0\] type drifted/
  );
});

