import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMigrationPreflight,
  buildMigrationPreviewCustomizePayload,
  EXPECTED_CSS_BLOB_SHA,
  EXPECTED_JS_BLOB_SHA,
  LEGACY_CSS_TARGET_NAME,
  CANONICAL_CSS_TARGET_NAME,
  CANONICAL_JS_TARGET_NAME,
  TARGET_APP_ID
} from '../scripts/kintone/migrate-app794-css-target.js';

const getValidLiveFixture = () => ({
  scope: 'ALL',
  revision: '68',
  desktop: {
    js: [{ type: 'FILE', file: { name: CANONICAL_JS_TARGET_NAME, fileKey: 'LIVE_JS_KEY_111' } }],
    css: [{ type: 'FILE', file: { name: LEGACY_CSS_TARGET_NAME, fileKey: 'LIVE_CSS_KEY_222' } }]
  },
  mobile: { js: [], css: [] }
});

const getValidPreviewFixture = () => ({
  scope: 'ALL',
  revision: '68',
  desktop: {
    js: [{ type: 'FILE', file: { name: CANONICAL_JS_TARGET_NAME, fileKey: 'PREVIEW_JS_KEY_333' } }],
    css: [{ type: 'FILE', file: { name: LEGACY_CSS_TARGET_NAME, fileKey: 'PREVIEW_CSS_KEY_444' } }]
  },
  mobile: { js: [], css: [] }
});

test('MIGRATION_PREFLIGHT_PASS: validates exact valid migration state', () => {
  const result = validateMigrationPreflight({
    liveCustomize: getValidLiveFixture(),
    previewCustomize: getValidPreviewFixture(),
    liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
    liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
    candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
    appId: TARGET_APP_ID
  });
  assert.equal(result, true);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if appId !== 794', () => {
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: getValidLiveFixture(),
      previewCustomize: getValidPreviewFixture(),
      liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
      liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      appId: 795
    });
  }, /appId \(795\) must be exactly 794/);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if scope mismatch', () => {
  const preview = getValidPreviewFixture();
  preview.scope = 'ADMIN';
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: getValidLiveFixture(),
      previewCustomize: preview,
      liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
      liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      appId: TARGET_APP_ID
    });
  }, /Live and preview scope must be identical/);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if topology differs', () => {
  const live = getValidLiveFixture();
  live.desktop.js.push({ type: 'FILE', file: { name: 'extra.js' } });
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: live,
      previewCustomize: getValidPreviewFixture(),
      liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
      liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      appId: TARGET_APP_ID
    });
  }, /Live topology mismatch/);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if CSS is already canonical (not legacy)', () => {
  const live = getValidLiveFixture();
  live.desktop.css[0].file.name = CANONICAL_CSS_TARGET_NAME;
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: live,
      previewCustomize: getValidPreviewFixture(),
      liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
      liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      appId: TARGET_APP_ID
    });
  }, /Live CSS entry must be legacy FILE named "mbo-employee .css"/);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if JS blob SHA does not match expected', () => {
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: getValidLiveFixture(),
      previewCustomize: getValidPreviewFixture(),
      liveJsBlobSha: 'WRONG_JS_BLOB_SHA',
      liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      appId: TARGET_APP_ID
    });
  }, /Live JS blob SHA/);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if Live CSS blob SHA does not match expected', () => {
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: getValidLiveFixture(),
      previewCustomize: getValidPreviewFixture(),
      liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
      liveCssBlobSha: 'WRONG_CSS_BLOB_SHA',
      candidateCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      appId: TARGET_APP_ID
    });
  }, /Live CSS blob SHA/);
});

test('MIGRATION_PREFLIGHT_FAIL: blocks if candidate CSS blob SHA does not match expected', () => {
  assert.throws(() => {
    validateMigrationPreflight({
      liveCustomize: getValidLiveFixture(),
      previewCustomize: getValidPreviewFixture(),
      liveJsBlobSha: EXPECTED_JS_BLOB_SHA,
      liveCssBlobSha: EXPECTED_CSS_BLOB_SHA,
      candidateCssBlobSha: 'WRONG_CANDIDATE_CSS_BLOB_SHA',
      appId: TARGET_APP_ID
    });
  }, /Candidate CSS blob SHA/);
});

test('BUILD_MIGRATION_PAYLOAD: preserves JS untouched, updates CSS fileKey, enforces revision and scope', () => {
  const preview = getValidPreviewFixture();
  const payload = buildMigrationPreviewCustomizePayload({
    previewCustomize: preview,
    newCssFileKey: 'NEW_CANONICAL_CSS_FILEKEY_888',
    app: TARGET_APP_ID
  });

  assert.equal(payload.app, 794);
  assert.equal(payload.scope, 'ALL');
  assert.equal(payload.revision, '68');
  assert.equal(payload.desktop.js[0].file.fileKey, 'PREVIEW_JS_KEY_333');
  assert.equal(payload.desktop.css[0].file.fileKey, 'NEW_CANONICAL_CSS_FILEKEY_888');
  assert.deepEqual(payload.mobile.js, []);
  assert.deepEqual(payload.mobile.css, []);
});
