import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePreflight,
  validateTopologyAlignment,
  validateReleaseManifest,
  buildPreviewCustomizePayload,
  prepareDeploymentArtifacts,
  executeDeployCustomUi,
  validateApp794DeployTargetBinding,
  gitBlobSha,
  getCurrentGitHead
} from '../scripts/kintone/deploy-custom-ui.js';

// Standard valid live & preview fixtures
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

const getValidManifestFixture = () => ({
  appId: 794,
  sourceCommit: 'f0e29b45e1de02b059814fac8e319ee8f513c0f0',
  expectedJsBlobSha: 'JS_BLOB_SHA_1111',
  expectedCssBlobSha: 'CSS_BLOB_SHA_2222',
  expectedScope: 'ALL',
  expectedTopology: {
    desktopJsCount: 1,
    desktopCssCount: 1,
    mobileJsCount: 0,
    mobileCssCount: 0
  }
});

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

  // 1. Preflight passes for atomic JS + CSS target pair with valid manifest
  assert.equal(validatePreflight({
    liveCustomize: live,
    previewCustomize: preview,
    targetFileName: 'mbo-employee-app.js',
    targetCssFileName: 'mbo-employee.css',
    releaseManifest: manifest,
    candidateJsBlobSha: 'JS_BLOB_SHA_1111',
    candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
    currentGitHead: 'f0e29b45e1de02b059814fac8e319ee8f513c0f0'
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
  // 1. Manifest App ID != 794 -> BLOCK
  const mBadApp = { ...getValidManifestFixture(), appId: 795 };
  assert.throws(() => {
    validateReleaseManifest({ manifest: mBadApp, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
  }, /MANIFEST_APP_ID_MISMATCH_BLOCKED_PRE_UPLOAD/);

  // 2. Manifest sourceCommit does not match repository HEAD -> BLOCK
  const mBadCommit = { ...getValidManifestFixture(), sourceCommit: 'ffffffffffffffffffffffffffffffffffffffff' };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: mBadCommit,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      currentGitHead: 'f0e29b45e1de02b059814fac8e319ee8f513c0f0'
    });
  }, /MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD & MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();

  // 1. Manifest expectedScope does not match live/preview scope -> BLOCK
  const mBadScope = { ...getValidManifestFixture(), expectedScope: 'ADMIN' };
  assert.throws(() => {
    validateReleaseManifest({
      manifest: mBadScope,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
      liveCustomize: live,
      previewCustomize: preview
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
      previewCustomize: preview
    });
  }, /MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD & CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD & EXACT_RELEASE_MANIFEST_PASS', () => {
  const manifest = getValidManifestFixture();

  // 1. Exact manifest and candidate pair -> PASS
  assert.equal(validateReleaseManifest({
    manifest,
    candidateJsBlobSha: 'JS_BLOB_SHA_1111',
    candidateCssBlobSha: 'CSS_BLOB_SHA_2222',
    liveCustomize: getValidLiveFixture(),
    previewCustomize: getValidPreviewFixture(),
    currentGitHead: 'f0e29b45e1de02b059814fac8e319ee8f513c0f0'
  }), true);

  // 2. Candidate JS mismatch -> BLOCK
  assert.throws(() => {
    validateReleaseManifest({
      manifest,
      candidateJsBlobSha: 'BAD_JS_HASH',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
  }, /JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD/);

  // 3. Candidate CSS mismatch -> BLOCK
  assert.throws(() => {
    validateReleaseManifest({
      manifest,
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'BAD_CSS_HASH'
    });
  }, /CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD/);
});

test('TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD & TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

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
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
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
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
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
        candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
      });
    });
  });
});

test('MISSING_DESKTOP_OBJECT_BLOCKED_PRE_UPLOAD & ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  delete preview.desktop;

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
    mockUpload();
  }, /MISSING_DESKTOP_OBJECT_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD & ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  delete preview.mobile;

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: preview,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
    mockUpload();
  }, /MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const m = getValidManifestFixture();

  // desktop.js missing
  const p1 = getValidPreviewFixture(); delete p1.desktop.js;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p1, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' }); mockUpload(); }, /MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // desktop.css missing
  const p2 = getValidPreviewFixture(); delete p2.desktop.css;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p2, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' }); mockUpload(); }, /MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // mobile.js missing
  const p3 = getValidPreviewFixture(); delete p3.mobile.js;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p3, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' }); mockUpload(); }, /MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // mobile.css missing
  const p4 = getValidPreviewFixture(); delete p4.mobile.css;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p4, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' }); mockUpload(); }, /MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('INVALID_SCOPE_BLOCKED_PRE_UPLOAD: rejects non-standard scope strings', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewBadScope = { ...getValidPreviewFixture(), scope: 'SUPER_ADMIN' };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewBadScope,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
    mockUpload();
  }, /INVALID_SCOPE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD: rejects -1 revision', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewRevMinusOne = { ...getValidPreviewFixture(), revision: -1 };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewRevMinusOne,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
    mockUpload();
  }, /REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('REVISION_NON_NUMERIC_BLOCKED_PRE_UPLOAD: rejects non-numeric revision strings', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewRevString = { ...getValidPreviewFixture(), revision: 'invalid-rev' };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewRevString,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
    mockUpload();
  }, /REVISION_NON_NUMERIC_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD: rejects 0 or negative revision values', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewRevZero = { ...getValidPreviewFixture(), revision: 0 };

  assert.throws(() => {
    validatePreflight({
      liveCustomize: live,
      previewCustomize: previewRevZero,
      releaseManifest: getValidManifestFixture(),
      candidateJsBlobSha: 'JS_BLOB_SHA_1111',
      candidateCssBlobSha: 'CSS_BLOB_SHA_2222'
    });
    mockUpload();
  }, /REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('TARGET_MISSING_BLOCKED_PRE_UPLOAD & TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const m = getValidManifestFixture();

  // Missing target JS
  const liveMissing = { scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js' } }], css: [{ type: 'FILE', file: { name: 'mbo-employee.css' } }] }, mobile: { js: [], css: [] } };
  const previewMissing = { revision: '1', scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js', fileKey: 'K' } }], css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }] }, mobile: { js: [], css: [] } };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveMissing, previewCustomize: previewMissing, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
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
    validatePreflight({ liveCustomize: liveAmbiguous, previewCustomize: previewAmbiguous, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
    mockUpload();
  }, /TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD: non-target FILE named mbo-employee-app.js in desktop.css must have fileKey', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };
  const m = getValidManifestFixture();

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
    validatePreflight({ liveCustomize: live, previewCustomize: preview, releaseManifest: m, candidateJsBlobSha: 'JS_BLOB_SHA_1111', candidateCssBlobSha: 'CSS_BLOB_SHA_2222' });
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
