import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import execSync from 'node:child_process';
import {
  renderHrControlCenterHtml,
  createHrccRuntime,
  DEFAULT_APP_IDS
} from '../src/ui/hr-control-center.js';
import { buildHrccUi } from '../scripts/kintone/build-hrcc-ui.js';

// Helper: Mock DOM element for testing runtime event listeners in Node.js
function createMockElement() {
  const listeners = {};
  const queryMap = {};
  const elem = {
    innerHTML: '',
    value: '',
    disabled: false,
    textContent: '',
    style: {},
    addEventListener(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    async trigger(event) {
      if (listeners[event]) {
        for (const fn of listeners[event]) {
          await fn({ target: elem });
        }
      }
    },
    querySelector(selector) {
      if (queryMap[selector]) return queryMap[selector];
      const newChild = createMockElement();
      queryMap[selector] = newChild;
      return newChild;
    }
  };
  return elem;
}

test('1. Reset panel renders correctly in App800 HRCC HTML', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [],
    allEvaluations: [],
    health: {},
    warnings: [],
    appIds: DEFAULT_APP_IDS
  });

  assert.ok(html.includes('รีเซ็ตรหัสผ่าน MBO / Reset MBO Password'), 'HTML must include bilingual panel title');
  assert.ok(html.includes('id="hrcc-reset-emp-code"'), 'HTML must include Employee Code input');
  assert.ok(html.includes('id="hrcc-reset-emp-confirm"'), 'HTML must include Employee Code confirmation input');
  assert.ok(html.includes('id="hrcc-reset-btn"'), 'HTML must include Reset button');
  assert.ok(html.includes('id="hrcc-reset-feedback"'), 'HTML must include feedback container');
});

test('2. Empty Employee_Code -> blocked with validation error and 0 reset calls', async () => {
  let resetCallCount = 0;
  const mockReset = async () => { resetCallCount++; return { status: 'PASSWORD_RESET' }; };
  const mockHeader = createMockElement();

  const runtime = createHrccRuntime({
    kintoneApi: async () => ({ records: [], totalCount: 0 }),
    onResetMboPassword: mockReset,
    getAppId: () => 800,
    getHeaderSpaceElement: () => mockHeader
  });

  await runtime({});

  const btn = mockHeader.querySelector('#hrcc-reset-btn');
  const codeInput = mockHeader.querySelector('#hrcc-reset-emp-code');
  const confirmInput = mockHeader.querySelector('#hrcc-reset-emp-confirm');
  const feedback = mockHeader.querySelector('#hrcc-reset-feedback');

  codeInput.value = '';
  confirmInput.value = '';

  await btn.trigger('click');

  assert.equal(resetCallCount, 0, 'Zero reset calls when input is empty');
  assert.ok(feedback.innerHTML.includes('กรุณาระบุ Employee Code'), 'Must show validation error for empty input');
});

test('3. Confirmation mismatch -> blocked with validation error and 0 reset calls', async () => {
  let resetCallCount = 0;
  const mockReset = async () => { resetCallCount++; return { status: 'PASSWORD_RESET' }; };
  const mockHeader = createMockElement();

  const runtime = createHrccRuntime({
    kintoneApi: async () => ({ records: [], totalCount: 0 }),
    onResetMboPassword: mockReset,
    getAppId: () => 800,
    getHeaderSpaceElement: () => mockHeader
  });

  await runtime({});

  const btn = mockHeader.querySelector('#hrcc-reset-btn');
  const codeInput = mockHeader.querySelector('#hrcc-reset-emp-code');
  const confirmInput = mockHeader.querySelector('#hrcc-reset-emp-confirm');
  const feedback = mockHeader.querySelector('#hrcc-reset-feedback');

  codeInput.value = 'EMP001';
  confirmInput.value = 'EMP002'; // Mismatch

  await btn.trigger('click');

  assert.equal(resetCallCount, 0, 'Zero reset calls when confirmation mismatches');
  assert.ok(feedback.innerHTML.includes('ไม่ตรงกัน'), 'Must show mismatch validation error');
});

test('4. Valid exact confirmation -> reset core called exactly once with exact Employee_Code', async () => {
  let calledCode = null;
  let resetCallCount = 0;

  const mockReset = async ({ employeeCode }) => {
    resetCallCount++;
    calledCode = employeeCode;
    return { status: 'PASSWORD_RESET', employeeCode };
  };
  const mockHeader = createMockElement();

  const runtime = createHrccRuntime({
    kintoneApi: async () => ({ records: [], totalCount: 0 }),
    onResetMboPassword: mockReset,
    getAppId: () => 800,
    getHeaderSpaceElement: () => mockHeader
  });

  await runtime({});

  const btn = mockHeader.querySelector('#hrcc-reset-btn');
  const codeInput = mockHeader.querySelector('#hrcc-reset-emp-code');
  const confirmInput = mockHeader.querySelector('#hrcc-reset-emp-confirm');
  const feedback = mockHeader.querySelector('#hrcc-reset-feedback');

  codeInput.value = 'EMP001';
  confirmInput.value = 'EMP001';

  await btn.trigger('click');

  assert.equal(resetCallCount, 1, 'Reset core must be called exactly once');
  assert.equal(calledCode, 'EMP001', 'Must pass exact Employee_Code');
  assert.ok(feedback.innerHTML.includes('รีเซ็ตรหัสผ่าน MBO สำเร็จ'), 'Must show success message');
});

test('5. In-flight repeat click -> prevented during active execution', async () => {
  let resetCallCount = 0;
  let resolvePromise;

  const mockReset = async () => {
    resetCallCount++;
    return new Promise(resolve => { resolvePromise = resolve; });
  };
  const mockHeader = createMockElement();

  const runtime = createHrccRuntime({
    kintoneApi: async () => ({ records: [], totalCount: 0 }),
    onResetMboPassword: mockReset,
    getAppId: () => 800,
    getHeaderSpaceElement: () => mockHeader
  });

  await runtime({});

  const btn = mockHeader.querySelector('#hrcc-reset-btn');
  const codeInput = mockHeader.querySelector('#hrcc-reset-emp-code');
  const confirmInput = mockHeader.querySelector('#hrcc-reset-emp-confirm');

  codeInput.value = 'EMP001';
  confirmInput.value = 'EMP001';

  // Trigger first click (pending)
  const p1 = btn.trigger('click');
  assert.equal(resetCallCount, 1, 'First click triggers reset');

  // Trigger second click while in-flight
  const p2 = btn.trigger('click');
  assert.equal(resetCallCount, 1, 'Second click while in-flight must be ignored');

  // Resolve pending reset
  resolvePromise({ status: 'PASSWORD_RESET', employeeCode: 'EMP001' });
  await p1;
  await p2;

  assert.equal(resetCallCount, 1, 'Total reset call count remains 1');
});

test('6. Success copy explicitly distinguishes MBO password from native Kintone/cybozu password', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [],
    allEvaluations: [],
    health: {},
    warnings: [],
    appIds: DEFAULT_APP_IDS
  });

  assert.ok(html.includes('ไม่กระทบและไม่ได้รีเซ็ตรหัสผ่านบัญชี Kintone/cybozu หลักของผู้ใช้'), 'Must explicitly warn that native Kintone/cybozu password is NOT reset');
});

test('7. CREDENTIAL_DENIED and technical failure -> visible fail-closed error', async () => {
  const mockDeniedReset = async () => ({ status: 'CREDENTIAL_DENIED', reason: 'Employee Code not found in App801' });
  const mockHeader = createMockElement();

  const runtime = createHrccRuntime({
    kintoneApi: async () => ({ records: [], totalCount: 0 }),
    onResetMboPassword: mockDeniedReset,
    getAppId: () => 800,
    getHeaderSpaceElement: () => mockHeader
  });

  await runtime({});

  const btn = mockHeader.querySelector('#hrcc-reset-btn');
  const codeInput = mockHeader.querySelector('#hrcc-reset-emp-code');
  const confirmInput = mockHeader.querySelector('#hrcc-reset-emp-confirm');
  const feedback = mockHeader.querySelector('#hrcc-reset-feedback');

  codeInput.value = 'EMP999';
  confirmInput.value = 'EMP999';

  await btn.trigger('click');

  assert.ok(feedback.innerHTML.includes('ไม่สามารถรีเซ็ตรหัสผ่าน MBO ได้'), 'Must render failure error box');
  assert.ok(feedback.innerHTML.includes('Employee Code not found in App801'), 'Must include specific denial reason');
});

test('8. UI never renders password hash, salt, token, or session secrets', async () => {
  const mockResetWithSecrets = async ({ employeeCode }) => ({
    status: 'PASSWORD_RESET',
    employeeCode,
    // Secret values returned maliciously by broken adapter mock
    Password_Hash: 'pbkdf2$100000$secretSalt$secretHashValue',
    Session_Token_Hash: 'secretTokenHash12345'
  });

  const mockHeader = createMockElement();

  const runtime = createHrccRuntime({
    kintoneApi: async () => ({ records: [], totalCount: 0 }),
    onResetMboPassword: mockResetWithSecrets,
    getAppId: () => 800,
    getHeaderSpaceElement: () => mockHeader
  });

  await runtime({});

  const btn = mockHeader.querySelector('#hrcc-reset-btn');
  const codeInput = mockHeader.querySelector('#hrcc-reset-emp-code');
  const confirmInput = mockHeader.querySelector('#hrcc-reset-emp-confirm');
  const feedback = mockHeader.querySelector('#hrcc-reset-feedback');

  codeInput.value = 'EMP001';
  confirmInput.value = 'EMP001';

  await btn.trigger('click');

  const renderedText = feedback.innerHTML;
  assert.equal(renderedText.includes('secretSalt'), false, 'UI must never render salt');
  assert.equal(renderedText.includes('secretHashValue'), false, 'UI must never render password hash');
  assert.equal(renderedText.includes('secretTokenHash12345'), false, 'UI must never render session token hash');
});

test('9. Existing HRCC monitoring, filter, and dashboard behavior remains intact', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [
      { $id: { value: '1' }, Employee_Code: { value: 'EMP001' }, Status: { value: 'COMPLETED' } }
    ],
    allEvaluations: [
      { $id: { value: '1' }, Employee_Code: { value: 'EMP001' }, Status: { value: 'COMPLETED' } }
    ],
    health: { app794Count: 1, routing: { available: true, count: 12 }, scoring: { available: true, count: 8 }, hoshin: { available: true, count: 2 }, archive: { available: true, count: 0 } },
    warnings: [],
    filters: { fy: '', dept: '', sec: '', status: '' },
    appIds: DEFAULT_APP_IDS
  });

  assert.ok(html.includes('MBO 2026 — HR Control Center'), 'Title intact');
  assert.ok(html.includes('System Health & Inventory'), 'Health panel intact');
  assert.ok(html.includes('Filters:'), 'Filters intact');
  assert.ok(html.includes('Total Evaluations'), 'KPI grid intact');
  assert.ok(html.includes('Pipeline Breakdown'), 'Pipeline breakdown intact');
});

test('10. Local App800 build succeeds and generated JS parses as classic script without import/export keywords', async () => {
  await buildHrccUi();

  const bundleJs = fs.readFileSync('dist/hr-control-center-bundle.js', 'utf8');
  assert.equal(/\bimport\b/.test(bundleJs), false, 'Generated JS must not contain import keyword');
  assert.equal(/\bexport\b/.test(bundleJs), false, 'Generated JS must not contain export keyword');

  assert.doesNotThrow(() => {
    new Function(bundleJs);
  }, 'Generated JS bundle must pass real JavaScript syntax parse');
});

test('11. Hybrid Identity / App794 / App53 / routing files are completely untouched', () => {
  const gitStatus = execSync.execSync('git status --porcelain', { encoding: 'utf8' });
  const changedFiles = gitStatus.split('\n').filter(Boolean).map(line => line.slice(3).trim());

  const forbiddenPrefixes = ['src/main-mbo-app.js', 'src/core/mbo-routing-engine.js', 'src/ui/employee-record-navigation.js', 'config/'];
  for (const f of changedFiles) {
    for (const forbidden of forbiddenPrefixes) {
      assert.equal(f.startsWith(forbidden), false, `Forbidden file ${f} must not be modified in this WP`);
    }
  }
});
