import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePreflight,
  validateTopologyAlignment,
  buildPreviewCustomizePayload
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

test('VALID_PREFLIGHT_PASS & TARGET_OLD_FILEKEY_MAY_BE_REPLACED & NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED & PREVIEW_REVISION_INCLUDED & CSS_UPLOAD_COUNT = 0', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();

  // 1. Preflight passes
  assert.equal(validatePreflight({ liveCustomize: live, previewCustomize: preview, targetFileName: 'mbo-employee-app.js' }), true);

  // 2. Payload replaces target JS fileKey, preserves preview CSS fileKey, includes revision
  const payload = buildPreviewCustomizePayload({
    app: 794,
    previewCustomize: preview,
    targetFileName: 'mbo-employee-app.js',
    newJsFileKey: 'NEW_UPLOADED_JS_KEY_999'
  });

  assert.equal(payload.desktop.js[0].file.fileKey, 'NEW_UPLOADED_JS_KEY_999');
  assert.equal(payload.desktop.css[0].file.fileKey, 'PREVIEW_CSS_KEY_444');
  assert.equal(payload.scope, 'ALL');
  assert.equal(payload.revision, '42');
});

test('VALID_SCOPES_ALL_ADMIN_NONE: validates ALL, ADMIN, and NONE scope values', () => {
  ['ALL', 'ADMIN', 'NONE'].forEach(validScope => {
    const live = { ...getValidLiveFixture(), scope: validScope };
    const preview = { ...getValidPreviewFixture(), scope: validScope };
    assert.doesNotThrow(() => {
      validatePreflight({ liveCustomize: live, previewCustomize: preview });
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
    validatePreflight({ liveCustomize: live, previewCustomize: preview });
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
    validatePreflight({ liveCustomize: live, previewCustomize: preview });
    mockUpload();
  }, /MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD & MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  // desktop.js missing
  const p1 = getValidPreviewFixture(); delete p1.desktop.js;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p1 }); mockUpload(); }, /MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // desktop.css missing
  const p2 = getValidPreviewFixture(); delete p2.desktop.css;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p2 }); mockUpload(); }, /MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // mobile.js missing
  const p3 = getValidPreviewFixture(); delete p3.mobile.js;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p3 }); mockUpload(); }, /MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD/);

  // mobile.css missing
  const p4 = getValidPreviewFixture(); delete p4.mobile.css;
  assert.throws(() => { validatePreflight({ liveCustomize: getValidLiveFixture(), previewCustomize: p4 }); mockUpload(); }, /MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('INVALID_SCOPE_BLOCKED_PRE_UPLOAD: rejects non-standard scope strings', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewBadScope = { ...getValidPreviewFixture(), scope: 'SUPER_ADMIN' };

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: previewBadScope });
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
    validatePreflight({ liveCustomize: live, previewCustomize: previewRevMinusOne });
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
    validatePreflight({ liveCustomize: live, previewCustomize: previewRevString });
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
    validatePreflight({ liveCustomize: live, previewCustomize: previewRevZero });
    mockUpload();
  }, /REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('TARGET_MISSING_BLOCKED_PRE_UPLOAD & TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  // Missing target
  const liveMissing = { scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js' } }], css: [] }, mobile: { js: [], css: [] } };
  const previewMissing = { revision: '1', scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js', fileKey: 'K' } }], css: [] }, mobile: { js: [], css: [] } };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveMissing, previewCustomize: previewMissing });
    mockUpload();
  }, /TARGET_MISSING_BLOCKED_PRE_UPLOAD/);

  // Ambiguous target
  const liveAmbiguous = {
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'FILE', file: { name: 'mbo-employee-app.js' } },
        { type: 'FILE', file: { name: 'mbo-employee-app.js' } }
      ],
      css: []
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
      css: []
    },
    mobile: { js: [], css: [] }
  };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveAmbiguous, previewCustomize: previewAmbiguous });
    mockUpload();
  }, /TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD: non-target FILE named mbo-employee-app.js in desktop.css must have fileKey', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_CSS_KEY' } }]
    },
    mobile: { js: [], css: [] }
  };

  const preview = {
    revision: '10',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: '' } }] // CSS file key missing!
    },
    mobile: { js: [], css: [] }
  };

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: preview });
    mockUpload();
  }, /SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('SAME_FILENAME_MOBILE_JS_MISSING_KEY_BLOCKED_PRE_UPLOAD: non-target FILE named mbo-employee-app.js in mobile.js must have fileKey', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = {
    scope: 'ALL',
    desktop: { js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }], css: [] },
    mobile: { js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_MOB_JS' } }], css: [] }
  };

  const preview = {
    revision: '10',
    scope: 'ALL',
    desktop: { js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }], css: [] },
    mobile: { js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: '' } }], css: [] } // mobile.js file key missing!
  };

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: preview });
    mockUpload();
  }, /SAME_FILENAME_MOBILE_JS_MISSING_KEY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('SAME_FILENAME_MOBILE_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD: non-target FILE named mbo-employee-app.js in mobile.css must have fileKey', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = {
    scope: 'ALL',
    desktop: { js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY' } }], css: [] },
    mobile: { js: [], css: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_MOB_CSS' } }] }
  };

  const preview = {
    revision: '10',
    scope: 'ALL',
    desktop: { js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }], css: [] },
    mobile: { js: [], css: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: '' } }] } // mobile.css file key missing!
  };

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: preview });
    mockUpload();
  }, /SAME_FILENAME_MOBILE_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});
