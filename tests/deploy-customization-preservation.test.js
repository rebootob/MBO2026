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

test('VALID_PREFLIGHT_PASS & PREVIEW_FILEKEY_SOURCE & ONLY_TARGET_JS_FILEKEY_REPLACED & NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED & PREVIEW_REVISION_INCLUDED', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();

  // 1. Preflight passes
  assert.equal(validatePreflight({ liveCustomize: live, previewCustomize: preview, targetFileName: 'mbo-employee-app.js' }), true);

  // 2. Payload uses preview fileKeys and includes revision
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

test('LIVE_PREVIEW_FILEKEY_DIFFERENCE_ALLOWED: live and preview fileKeys may differ when names match', () => {
  const live = getValidLiveFixture();
  const preview = getValidPreviewFixture();
  // live fileKey != preview fileKey is already in the fixtures!
  assert.equal(validatePreflight({ liveCustomize: live, previewCustomize: preview }), true);
});

test('MISSING_SCOPE_BLOCKED_PRE_UPLOAD: fails closed before upload if scope is missing or blank', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const liveNoScope = { ...getValidLiveFixture(), scope: '' };
  const previewValid = getValidPreviewFixture();

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveNoScope, previewCustomize: previewValid });
    mockUpload();
  }, /MISSING_SCOPE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0, 'Zero remote uploads must occur when scope is missing');

  const liveValid = getValidLiveFixture();
  const previewNoScope = { ...getValidPreviewFixture(), scope: undefined };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveValid, previewCustomize: previewNoScope });
    mockUpload();
  }, /MISSING_SCOPE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0, 'Zero remote uploads must occur when preview scope is missing');
});

test('MISSING_REVISION_BLOCKED_PRE_UPLOAD: fails closed before upload if preview revision is missing', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewNoRev = { ...getValidPreviewFixture(), revision: undefined };

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: previewNoRev });
    mockUpload();
  }, /MISSING_REVISION_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0, 'Zero remote uploads must occur when revision is missing');
});

test('UNSUPPORTED_ENTRY_TYPE_BLOCKED_PRE_UPLOAD: fails closed before upload if entry type is not URL or FILE', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewBadType = getValidPreviewFixture();
  previewBadType.desktop.js.push({ type: 'SCRIPT', name: 'bad.js' });

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: previewBadType });
    mockUpload();
  }, /UNSUPPORTED_ENTRY_TYPE_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MALFORMED_URL_BLOCKED_PRE_UPLOAD: fails closed before upload if URL entry has blank url', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  live.desktop.js.push({ type: 'URL', url: '' });
  const preview = getValidPreviewFixture();
  preview.desktop.js.push({ type: 'URL', url: '' });

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: preview });
    mockUpload();
  }, /MALFORMED_URL_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MALFORMED_FILE_NAME_BLOCKED_PRE_UPLOAD: fails closed before upload if FILE entry has blank name', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewBadName = getValidPreviewFixture();
  previewBadName.desktop.css.push({ type: 'FILE', file: { name: '', fileKey: 'K' } });

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: previewBadName });
    mockUpload();
  }, /MALFORMED_FILE_NAME_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD: fails closed before upload if retained preview FILE has no fileKey', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewNoKey = getValidPreviewFixture();
  previewNoKey.desktop.css[0].file.fileKey = ''; // non-target CSS file key missing!

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: previewNoKey });
    mockUpload();
  }, /MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('TARGET_MISSING_BLOCKED_PRE_UPLOAD & TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD: fails closed before upload on target missing/duplicate', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  // Missing target
  const liveMissing = { scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js' } }], css: [] }, mobile: { js: [], css: [] } };
  const previewMissing = { revision: '1', scope: 'ALL', desktop: { js: [{ type: 'FILE', file: { name: 'other.js', fileKey: 'K' } }], css: [] }, mobile: { js: [], css: [] } };

  assert.throws(() => {
    validatePreflight({ liveCustomize: liveMissing, previewCustomize: previewMissing });
    mockUpload();
  }, /TARGET_MISSING_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);

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

test('TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD: fails closed before upload on count/type/name/scope drift', () => {
  let uploadCalls = 0;
  const mockUpload = () => { uploadCalls++; return 'KEY'; };

  const live = getValidLiveFixture();
  const previewDrift = getValidPreviewFixture();
  previewDrift.desktop.css = []; // CSS missing in preview!

  assert.throws(() => {
    validatePreflight({ liveCustomize: live, previewCustomize: previewDrift });
    mockUpload();
  }, /TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD/);

  assert.equal(uploadCalls, 0);
});

test('URL_ENTRY_ORDER_PRESERVED & MOBILE_ENTRY_ORDER_PRESERVED & CSS_UPLOAD_COUNT = 0', () => {
  const previewCustomize = {
    revision: '5',
    scope: 'ALL',
    desktop: {
      js: [
        { type: 'URL', url: 'https://cdn.example.com/lib.js' },
        { type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY' } }
      ],
      css: [
        { type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY' } },
        { type: 'URL', url: 'https://cdn.example.com/theme.css' }
      ]
    },
    mobile: {
      js: [{ type: 'URL', url: 'https://cdn.example.com/mobile-lib.js' }],
      css: [{ type: 'FILE', file: { name: 'mobile-theme.css', fileKey: 'MOBILE_CSS_KEY' } }]
    }
  };

  const payload = buildPreviewCustomizePayload({
    app: 794,
    previewCustomize,
    targetFileName: 'mbo-employee-app.js',
    newJsFileKey: 'NEW_JS_KEY'
  });

  // Desktop JS order & type
  assert.equal(payload.desktop.js.length, 2);
  assert.equal(payload.desktop.js[0].type, 'URL');
  assert.equal(payload.desktop.js[0].url, 'https://cdn.example.com/lib.js');
  assert.equal(payload.desktop.js[1].type, 'FILE');
  assert.equal(payload.desktop.js[1].file.fileKey, 'NEW_JS_KEY');

  // Desktop CSS order & type
  assert.equal(payload.desktop.css.length, 2);
  assert.equal(payload.desktop.css[0].type, 'FILE');
  assert.equal(payload.desktop.css[0].file.fileKey, 'PREVIEW_CSS_KEY');
  assert.equal(payload.desktop.css[1].type, 'URL');
  assert.equal(payload.desktop.css[1].url, 'https://cdn.example.com/theme.css');

  // Mobile JS/CSS preserved
  assert.equal(payload.mobile.js.length, 1);
  assert.equal(payload.mobile.js[0].url, 'https://cdn.example.com/mobile-lib.js');
  assert.equal(payload.mobile.css.length, 1);
  assert.equal(payload.mobile.css[0].file.fileKey, 'MOBILE_CSS_KEY');
});
