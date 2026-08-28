import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTopologyAlignment,
  normalizeCustomizeEntries,
  buildPreviewCustomizePayload
} from '../scripts/kintone/deploy-custom-ui.js';

test('PREVIEW_FILEKEY_SOURCE & NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED: preview fileKeys are preserved, not live fileKeys', () => {
  const liveCustomize = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'LIVE_JS_KEY_111' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'LIVE_CSS_KEY_222' } }]
    },
    mobile: { js: [], css: [] }
  };

  const previewCustomize = {
    revision: '42',
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'PREVIEW_JS_KEY_333' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'PREVIEW_CSS_KEY_444' } }]
    },
    mobile: { js: [], css: [] }
  };

  // 1. Live vs preview fileKey difference is ALLOWED during topology validation
  assert.doesNotThrow(() => {
    validateTopologyAlignment(liveCustomize, previewCustomize);
  }, 'Live vs preview fileKey differences must be allowed when topology matches');

  // 2. Build payload from preview state
  const payload = buildPreviewCustomizePayload({
    app: 794,
    previewCustomize,
    targetFileName: 'mbo-employee-app.js',
    newJsFileKey: 'NEW_UPLOADED_JS_KEY_999'
  });

  // ONLY_TARGET_JS_FILEKEY_REPLACED
  assert.equal(payload.desktop.js[0].file.fileKey, 'NEW_UPLOADED_JS_KEY_999');

  // NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED (must match PREVIEW_CSS_KEY_444, NOT LIVE_CSS_KEY_222)
  assert.equal(payload.desktop.css[0].file.fileKey, 'PREVIEW_CSS_KEY_444');

  // SCOPE_PRESERVED & PREVIEW_REVISION_INCLUDED
  assert.equal(payload.scope, 'ALL');
  assert.equal(payload.revision, '42');
});

test('URL_ENTRY_ORDER_PRESERVED & MOBILE_ENTRY_ORDER_PRESERVED: preserving URL entries, mobile entries, and ordering', () => {
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

test('LIVE_PREVIEW_TOPOLOGY_DRIFT_BLOCKED: fails closed on topology or scope drift', () => {
  const liveCustomize = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K1' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }]
    },
    mobile: { js: [], css: [] }
  };

  // 1. Count mismatch
  const driftCount = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K1' } }],
      css: [] // CSS missing in preview!
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(() => {
    validateTopologyAlignment(liveCustomize, driftCount);
  }, /TOPOLOGY_DRIFT_BLOCKED/);

  // 2. Type mismatch
  const driftType = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'URL', url: 'https://example.com/js' }], // Changed from FILE to URL
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(() => {
    validateTopologyAlignment(liveCustomize, driftType);
  }, /TOPOLOGY_DRIFT_BLOCKED/);

  // 3. Name mismatch
  const driftName = {
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'other-app.js', fileKey: 'K1' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(() => {
    validateTopologyAlignment(liveCustomize, driftName);
  }, /TOPOLOGY_DRIFT_BLOCKED/);

  // 4. Scope mismatch
  const driftScope = {
    scope: 'ADMIN',
    desktop: {
      js: [{ type: 'FILE', file: { name: 'mbo-employee-app.js', fileKey: 'K1' } }],
      css: [{ type: 'FILE', file: { name: 'mbo-employee.css', fileKey: 'K2' } }]
    },
    mobile: { js: [], css: [] }
  };
  assert.throws(() => {
    validateTopologyAlignment(liveCustomize, driftScope);
  }, /TOPOLOGY_DRIFT_BLOCKED/);
});

test('TARGET_MISSING_BLOCKED & TARGET_AMBIGUOUS_BLOCKED: fails closed if target JS is missing or ambiguous', () => {
  // 1. Missing target
  const missingTarget = {
    scope: 'ALL',
    desktop: { js: [{ type: 'FILE', file: { name: 'other-app.js', fileKey: 'K1' } }], css: [] },
    mobile: { js: [], css: [] }
  };
  assert.throws(() => {
    buildPreviewCustomizePayload({
      app: 794,
      previewCustomize: missingTarget,
      targetFileName: 'mbo-employee-app.js',
      newJsFileKey: 'NEW_KEY'
    });
  }, /TARGET_MISSING_BLOCKED/);

  // 2. Ambiguous (duplicate) target
  const ambiguousTarget = {
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
    buildPreviewCustomizePayload({
      app: 794,
      previewCustomize: ambiguousTarget,
      targetFileName: 'mbo-employee-app.js',
      newJsFileKey: 'NEW_KEY'
    });
  }, /TARGET_AMBIGUOUS_BLOCKED/);
});
