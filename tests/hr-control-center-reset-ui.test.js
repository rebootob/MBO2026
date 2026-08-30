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

test('3. Leading or trailing whitespace in Employee_Code -> blocked with 0 reset calls (Strict identity contract)', async () => {
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

  const whitespaceCases = [
    { code: ' EMP001', confirm: ' EMP001', label: 'leading whitespace' },
    { code: 'EMP001 ', confirm: 'EMP001 ', label: 'trailing whitespace' },
    { code: ' EMP001 ', confirm: ' EMP001 ', label: 'both leading & trailing whitespace' },
    { code: '   ', confirm: '   ', label: 'whitespace only' }
  ];

  for (const tc of whitespaceCases) {
    codeInput.value = tc.code;
    confirmInput.value = tc.confirm;

    await btn.trigger('click');

    assert.equal(resetCallCount, 0, `Zero reset calls for ${tc.label}`);
    assert.ok(feedback.innerHTML.includes('ช่องว่างนำหน้าหรือต่อท้าย'), `Must show whitespace validation error for ${tc.label}`);
  }
});

test('4. Invalid-format Employee_Code -> blocked before resetFn with 0 reset calls', async () => {
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

  // Test invalid formats (spaces, special symbols, HTML injection)
  const invalidCodes = ['EMP 001', 'EMP#001', 'EMP<script>', 'EMP/001'];

  for (const invalidCode of invalidCodes) {
    codeInput.value = invalidCode;
    confirmInput.value = invalidCode; // Matching, but invalid format

    await btn.trigger('click');

    assert.equal(resetCallCount, 0, `Zero reset calls for invalid code "${invalidCode}"`);
    assert.ok(feedback.innerHTML.includes('รูปแบบ Employee Code ไม่ถูกต้อง'), `Must show format validation error for "${invalidCode}"`);
  }
});

test('5. Confirmation mismatch -> blocked with validation error and 0 reset calls', async () => {
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

test('6. Valid exact confirmation -> reset core called exactly once with exact Employee_Code', async () => {
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

test('7. In-flight repeat click -> prevented during active execution', async () => {
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

test('8. Default non-injected production path uses bundled MboKintoneAuthAdapter and reaches App801 record update', async () => {
  const kintoneCalls = [];
  const mockKintoneApi = async (path, method, params) => {
    kintoneCalls.push({ path, method, params });
    if (path === '/k/v1/records.json' && method === 'GET') {
      // Return mock App801 record for EMP001
      return {
        records: [
          {
            $id: { value: '101' },
            Employee_Code: { value: 'EMP001' },
            Password_Hash: { value: 'pbkdf2$100000$a1b2c3d4$1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff' },
            Force_Password_Change: { value: 'NO' },
            Account_Status: { value: 'ACTIVE' },
            Credential_Version: { value: 1 }
          }
        ]
      };
    }
    if (path === '/k/v1/record.json' && method === 'PUT') {
      return { revision: '2' };
    }
    return { records: [], totalCount: 0 };
  };

  const mockHeader = createMockElement();

  // Create runtime WITHOUT onResetMboPassword -> exercises defaultResetHandler
  const runtime = createHrccRuntime({
    kintoneApi: mockKintoneApi,
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

  // Verify production default path succeeded cleanly without throwing MboKintoneAuthAdapter is unavailable
  assert.ok(feedback.innerHTML.includes('รีเซ็ตรหัสผ่าน MBO สำเร็จ'), 'Default production path must succeed');

  // Verify exact App801 update request was produced
  const putCalls = kintoneCalls.filter(c => c.method === 'PUT' && c.path === '/k/v1/record.json');
  assert.equal(putCalls.length, 1, 'Exactly 1 PUT request to /k/v1/record.json');
  assert.equal(putCalls[0].params.app, 801, 'Target app for reset update must be App 801');
  assert.equal(putCalls[0].params.id, '101', 'Target record ID must be 101');
  assert.equal(putCalls[0].params.record.Force_Password_Change.value, 'YES', 'Must update Force_Password_Change to YES');

  // Verify 0 write requests were made to App 800, 794, 795, 53
  const forbiddenWrites = kintoneCalls.filter(c => (c.method === 'POST' || c.method === 'PUT' || c.method === 'DELETE') && c.params?.app !== 801);
  assert.equal(forbiddenWrites.length, 0, 'Zero write requests to App 800, 794, 795, or 53');
});

test('9. Success copy explicitly distinguishes MBO password from native Kintone/cybozu password', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [],
    allEvaluations: [],
    health: {},
    warnings: [],
    appIds: DEFAULT_APP_IDS
  });

  assert.ok(html.includes('ไม่กระทบและไม่ได้รีเซ็ตรหัสผ่านบัญชี Kintone/cybozu หลักของผู้ใช้'), 'Must explicitly warn that native Kintone/cybozu password is NOT reset');
});

test('10. CREDENTIAL_DENIED and technical failure -> visible fail-closed error', async () => {
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

test('11. UI never renders password hash, salt, token, or session secrets', async () => {
  const mockResetWithSecrets = async ({ employeeCode }) => ({
    status: 'PASSWORD_RESET',
    employeeCode,
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

test('12. Stale READ-ONLY wording removed from UI badge and source header', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [],
    allEvaluations: [],
    health: {},
    warnings: [],
    appIds: DEFAULT_APP_IDS
  });

  assert.equal(html.includes('SECURE READ-ONLY MVP'), false, 'Stale SECURE READ-ONLY MVP badge must be removed');
  assert.ok(html.includes('SECURE HR CONTROL CENTER'), 'Updated truthful badge SECURE HR CONTROL CENTER must be present');
});

test('13. Existing HRCC monitoring, filter, and dashboard behavior remains intact', () => {
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

test('14. Local App800 build succeeds, generated bundle includes MboKintoneAuthAdapter implementation, and has 0 import/export residue', async () => {
  await buildHrccUi();

  const bundleJs = fs.readFileSync('dist/hr-control-center-bundle.js', 'utf8');
  assert.equal(/\bimport\b/.test(bundleJs), false, 'Generated JS must not contain import keyword');
  assert.equal(/\bexport\b/.test(bundleJs), false, 'Generated JS must not contain export keyword');

  assert.ok(bundleJs.includes('MboKintoneAuthAdapter'), 'Bundle must include MboKintoneAuthAdapter class definition');
  assert.ok(bundleJs.includes('resetMboPassword'), 'Bundle must include resetMboPassword implementation');

  assert.doesNotThrow(() => {
    new Function(bundleJs);
  }, 'Generated JS bundle must pass real JavaScript syntax parse');
});

test('15. Hybrid Identity / App794 / App53 / routing files are completely untouched', () => {
  const gitStatus = execSync.execSync('git status --porcelain', { encoding: 'utf8' });
  const changedFiles = gitStatus.split('\n').filter(Boolean).map(line => line.slice(3).trim());

  const forbiddenPrefixes = ['src/core/mbo-routing-engine.js', 'src/ui/employee-record-navigation.js', 'config/'];
  for (const f of changedFiles) {
    for (const forbidden of forbiddenPrefixes) {
      assert.equal(f.startsWith(forbidden), false, `Forbidden file ${f} must not be modified in this WP`);
    }
  }
});
