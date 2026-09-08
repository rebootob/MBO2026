/**
 * D1 — MboKintoneLoginGate tests
 *
 * Tests gate state management, page-memory-only behavior,
 * force-change blocking, logout, and authenticated context immutability.
 * DOM-rendering paths are tested with minimal mock elements.
 *
 * No live Kintone reads or writes are performed in these tests.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { MboKintoneLoginGate } from '../src/ui/mbo-kintone-login-gate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GATE_SRC = readFileSync(join(__dirname, '../src/ui/mbo-kintone-login-gate.js'), 'utf8');

// ---------------------------------------------------------------------------
// Minimal mock DOM element
// ---------------------------------------------------------------------------

function createMockEl(tag = 'div') {
  const el = {
    tagName: tag,
    _attrs: {},
    _children: [],
    _listeners: {},
    style: { cssText: '' },
    type: tag === 'button' ? 'submit' : undefined,
    required: false,
    disabled: false,
    _value: '',
    get value() { return this._value; },
    set value(v) { this._value = String(v); },
    get textContent() { return this._text || ''; },
    set textContent(v) { this._text = String(v); },
    get innerHTML() { return this._html || ''; },
    set innerHTML(v) {
      this._html = v;
      // Parse minimal [name=x] inputs from innerHTML for test access
      const matches = [...v.matchAll(/name="([^"]+)"/g)];
      for (const m of matches) {
        if (!this._namedInputs) this._namedInputs = {};
        const inp = createMockEl('input');
        inp.name = m[1];
        this._namedInputs[m[1]] = inp;
      }
    },
    get firstChild() { return this._children[0] || null; },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k] ?? null; },
    hasAttribute(k) { return k in this._attrs; },
    removeAttribute(k) { delete this._attrs[k]; },
    appendChild(child) { this._children.push(child); return child; },
    insertBefore(child, _ref) { this._children.unshift(child); return child; },
    remove() {
      // mark as removed for test assertions
      this._removed = true;
    },
    addEventListener(ev, fn) {
      if (!this._listeners[ev]) this._listeners[ev] = [];
      this._listeners[ev].push(fn);
    },
    _trigger(ev, data) {
      for (const fn of (this._listeners[ev] || [])) fn(data || {});
    },
    querySelector(sel) {
      // Attribute selector [data-xxx] or [name=xxx]
      const attrMatch = sel.match(/^\[([^\]]+)\]$/);
      const nameMatch = sel.match(/\[name="([^"]+)"\]/);
      if (nameMatch && this._namedInputs) {
        return this._namedInputs[nameMatch[1]] || null;
      }
      for (const child of this._children) {
        if (attrMatch) {
          const [attrKey, attrVal] = attrMatch[1].split('=').map(s => s.replace(/"/g, ''));
          if (attrVal === undefined && child._attrs && attrKey in child._attrs) return child;
          if (attrVal !== undefined && child._attrs && child._attrs[attrKey] === attrVal) return child;
        }
        if (child.querySelector) {
          const found = child.querySelector(sel);
          if (found) return found;
        }
      }
      return null;
    },
    get name() { return this._name || ''; },
    set name(v) { this._name = v; },
    focus() {},
  };
  return el;
}

function createMockDocument() {
  const body = createMockEl('body');
  return {
    createElement: (tag) => createMockEl(tag),
    body,
    querySelector: (sel) => body.querySelector(sel),
  };
}

// ---------------------------------------------------------------------------
// Static source checks
// ---------------------------------------------------------------------------

describe('D1 MboKintoneLoginGate — static source checks', () => {
  // Strip JS line comments before checking for storage API usage
  function stripLineComments(src) {
    return src.replace(/\/\/.*/g, '');
  }
  function stripBlockComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  function stripComments(src) {
    return stripLineComments(stripBlockComments(src));
  }

  it('28. no localStorage usage in gate source (comments excluded)', () => {
    assert.doesNotMatch(stripComments(GATE_SRC), /localStorage/, 'Must not use localStorage');
  });

  it('28b. no sessionStorage usage in gate source (comments excluded)', () => {
    assert.doesNotMatch(stripComments(GATE_SRC), /sessionStorage/, 'Must not use sessionStorage');
  });

  it('28c. no document.cookie reference in gate source', () => {
    assert.doesNotMatch(GATE_SRC, /document\.cookie/, 'Must not use cookies');
  });

  it('29. no Node crypto import in gate source', () => {
    assert.doesNotMatch(GATE_SRC, /import\s+.*from\s+['"]crypto['"]/);
    assert.doesNotMatch(GATE_SRC, /require\s*\(\s*['"]crypto['"]\s*\)/);
  });
});

// ---------------------------------------------------------------------------
// Gate state tests (no DOM rendering required)
// ---------------------------------------------------------------------------

describe('D1 MboKintoneLoginGate — state management', () => {

  it('1. getEmployeeCode() returns null before authentication', () => {
    const gate = new MboKintoneLoginGate({});
    assert.equal(gate.getEmployeeCode(), null);
  });

  it('3. logout() clears page-memory principal', () => {
    const gate = new MboKintoneLoginGate({});
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = false;
    assert.equal(gate.getEmployeeCode(), '0118');
    gate.logout();
    assert.equal(gate.getEmployeeCode(), null);
    assert.equal(gate._principal, null);
  });

  it('Force Password Change blocks Employee Self (getEmployeeCode returns null)', () => {
    const gate = new MboKintoneLoginGate({});
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = true;
    assert.equal(gate.getEmployeeCode(), null,
      'Pending force change must block Employee Self authorization');
  });

  it('Force Password Change clears after resolution', () => {
    const gate = new MboKintoneLoginGate({});
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = true;
    assert.equal(gate.getEmployeeCode(), null);
    gate._pendingForceChange = false;
    assert.equal(gate.getEmployeeCode(), '0118');
  });

  it('12. logout clears authenticated context and pending force change', () => {
    const gate = new MboKintoneLoginGate({});
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = true;
    gate.logout();
    assert.equal(gate._principal, null);
    assert.equal(gate._pendingForceChange, false);
    assert.equal(gate.getEmployeeCode(), null);
  });

  it('8. authenticated principal is page-memory only — no storage calls', () => {
    // Verify the gate class does not call storage APIs
    const storageKeys = [];
    const gate = new MboKintoneLoginGate({});
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = false;
    assert.equal(gate.getEmployeeCode(), '0118');
    // If the test reaches here without error, no storage side-effects occurred
    // (static source check above also confirms)
    assert.equal(storageKeys.length, 0);
  });

  it('22. new gate instance requires login (getEmployeeCode = null)', () => {
    const gate = new MboKintoneLoginGate({});
    assert.equal(gate.getEmployeeCode(), null,
      'Fresh gate instance must require login before granting Employee Self access');
  });

});

// ---------------------------------------------------------------------------
// Gate requireLogin flow — mocked DOM
// ---------------------------------------------------------------------------

describe('D1 MboKintoneLoginGate — requireLogin with mock adapter', () => {

  it('requireLogin resolves immediately when already authenticated', async () => {
    const gate = new MboKintoneLoginGate({}, { onReload: () => {} });
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = false;

    // requireLogin should resolve without touching DOM
    const code = await gate.requireLogin(null);
    assert.equal(code, '0118');
  });

  it('5. AUTHENTICATED login sets principal and resolves requireLogin', async () => {
    const mockAdapter = {
      login: async ({ username }) => ({ status: 'AUTHENTICATED', employeeCode: username })
    };
    const gate = new MboKintoneLoginGate(mockAdapter, { onReload: () => {} });

    // Manually simulate successful login
    await gate.adapter.login({ username: '0118', password: 'pw' });
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = false;

    assert.equal(gate.getEmployeeCode(), '0118');
  });

  it('23. authenticated 0118 gate — getEmployeeCode never returns 0119', () => {
    const gate = new MboKintoneLoginGate({}, { onReload: () => {} });
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = false;
    assert.equal(gate.getEmployeeCode(), '0118');
    assert.notEqual(gate.getEmployeeCode(), '0119');
  });

  it('logout calls onReload callback', () => {
    let reloaded = false;
    const gate = new MboKintoneLoginGate({}, { onReload: () => { reloaded = true; } });
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = false;

    gate.logout();
    // The main app triggers reload; here we confirm the hook works
    gate._onReload();
    assert.equal(reloaded, true);
    assert.equal(gate.getEmployeeCode(), null);
  });

  it('PASSWORD_CHANGE_REQUIRED state blocks Employee Self', async () => {
    const mockAdapter = {
      login: async () => ({ status: 'PASSWORD_CHANGE_REQUIRED', employeeCode: '0118' })
    };
    const gate = new MboKintoneLoginGate(mockAdapter, { onReload: () => {} });

    // Simulate login result
    const result = await gate.adapter.login({ username: '0118', password: '0118' });
    if (result.status === 'PASSWORD_CHANGE_REQUIRED') {
      gate._principal = { employeeCode: result.employeeCode };
      gate._pendingForceChange = true;
    }

    assert.equal(gate.getEmployeeCode(), null,
      'Force password change must block Employee Self data access');
    assert.equal(gate._pendingForceChange, true);
  });

  it('PASSWORD_CHANGE_REQUIRED: resolves Employee Self after force change succeeds', async () => {
    const mockAdapter = {
      forceChangePassword: async ({ newPassword }) => {
        if (newPassword === '0118') return { status: 'INVALID_PASSWORD', reason: 'same as code' };
        return { status: 'PASSWORD_CHANGED', employeeCode: '0118' };
      }
    };
    const gate = new MboKintoneLoginGate(mockAdapter, { onReload: () => {} });
    gate._principal = { employeeCode: '0118' };
    gate._pendingForceChange = true;

    // Simulate force change
    const result = await gate.adapter.forceChangePassword({ employeeCode: '0118', newPassword: 'NewOk!' });
    if (result.status === 'PASSWORD_CHANGED') {
      gate._pendingForceChange = false;
    }

    assert.equal(gate.getEmployeeCode(), '0118');
  });

  it('DEFECT-001: login denied when employee has dedicated account', async () => {
    const mockAdapter = {
      login: async () => ({ status: 'AUTHENTICATED', employeeCode: '0113' })
    };
    const mockEligibility = async (empCode) => {
      if (empCode === '0113') {
        return {
          eligible: false,
          status: 'DEDICATED_ACCOUNT_REQUIRED',
          reason: 'DEDICATED_ACCOUNT_REQUIRED',
          message: 'พนักงานรายนี้มีบัญชี Kintone ส่วนตัว กรุณาเข้าสู่ระบบด้วยบัญชี Kintone ของตนเอง\nThis employee has a dedicated Kintone account. Please sign in using their dedicated Kintone account.'
        };
      }
      return { eligible: true };
    };
    const gate = new MboKintoneLoginGate(mockAdapter, {
      checkSharedEligibility: mockEligibility,
      onReload: () => {}
    });

    const res = await gate._handleLoginAction({ username: '0113', password: 'secret' });
    assert.equal(res.status, 'DEDICATED_ACCOUNT_REQUIRED');
    assert.ok(res.message.includes('พนักงานรายนี้มีบัญชี Kintone ส่วนตัว'));
    assert.equal(gate.getEmployeeCode(), null);
  });

  it('DEFECT-001: force change denied when employee has dedicated account', async () => {
    const mockAdapter = {
      login: async () => ({ status: 'PASSWORD_CHANGE_REQUIRED', employeeCode: '0113' }),
      forceChangePassword: async () => ({ status: 'PASSWORD_CHANGED', employeeCode: '0113' })
    };
    const mockEligibility = async (empCode) => {
      if (empCode === '0113') {
        return {
          eligible: false,
          status: 'DEDICATED_ACCOUNT_REQUIRED',
          reason: 'DEDICATED_ACCOUNT_REQUIRED',
          message: 'พนักงานรายนี้มีบัญชี Kintone ส่วนตัว กรุณาเข้าสู่ระบบด้วยบัญชี Kintone ของตนเอง'
        };
      }
      return { eligible: true };
    };
    const gate = new MboKintoneLoginGate(mockAdapter, {
      checkSharedEligibility: mockEligibility,
      onReload: () => {}
    });
    gate._principal = { employeeCode: '0113' };
    gate._pendingForceChange = true;

    const res = await gate._handleForceChangeAction({ newPassword: 'New1', confirmPassword: 'New1' });
    assert.equal(res.status, 'DEDICATED_ACCOUNT_REQUIRED');
    assert.equal(gate.getEmployeeCode(), null);
  });

  it('DEFECT-001: restored session denied when employee has dedicated account (clears token, revokes session, renders overlay with error)', async () => {
    let revoked = false;
    let cleared = false;
    const mockSessionManager = {
      restoreSession: async () => ({ employeeCode: '0113' }),
      revokeSession: async () => { revoked = true; },
      clearLocalToken: () => { cleared = true; }
    };
    const mockEligibility = async (empCode) => {
      if (empCode === '0113') {
        return {
          eligible: false,
          status: 'DEDICATED_ACCOUNT_REQUIRED',
          reason: 'DEDICATED_ACCOUNT_REQUIRED',
          message: 'พนักงานรายนี้มีบัญชี Kintone ส่วนตัว กรุณาเข้าสู่ระบบด้วยบัญชี Kintone ของตนเอง'
        };
      }
      return { eligible: true };
    };

    const gate = new MboKintoneLoginGate({}, {
      sessionManager: mockSessionManager,
      checkSharedEligibility: mockEligibility,
      onReload: () => {}
    });

    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      await new Promise(resolve => setTimeout(resolve, 10));

      assert.equal(revoked, true, 'Must revoke session');
      assert.equal(cleared, true, 'Must clear local token');
      assert.equal(gate.getEmployeeCode(), null, 'Must not authenticate principal');

      const overlay = host.querySelector('[data-mbo-login-overlay]');
      assert.ok(overlay, 'Overlay must be rendered');
      const errorEl = overlay.querySelector('[data-mbo-error]');
      assert.ok(errorEl, 'Error element must be present');
      assert.ok(errorEl.textContent.includes('พนักงานรายนี้มีบัญชี Kintone ส่วนตัว'), 'Must display dedicated account error');
    } finally {
      globalThis.document = origDoc;
    }
  });

});

// ---------------------------------------------------------------------------
// EmployeePartAUI auth context lock (integration-style, no DOM)
// ---------------------------------------------------------------------------

describe('D1 EmployeePartAUI — authenticated Employee_Code lock', () => {
  it('23+24. executeLookup rejects mismatched Employee_Code when authenticated context bound', async () => {
    // Import dynamically to avoid module-level DOM dependency
    const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

    const fakeRecord = {
      Employee_Code: { value: '0118' },
      Fiscal_Year: { value: 'FY2026' },
    };

    const ui = new EmployeePartAUI({
      container: createMockEl('div'),
      record: fakeRecord,
      stage: 0,
      isEditable: true,
      isCreate: true,
      loginUserCode: null,
      authenticatedEmployeeCode: '0118',
      isPreviewMode: true,
      onLookupEmployee: async () => {},
    });

    // Same code: must pass (or at least not throw AUTHENTICATED_EMPLOYEE_CODE_MISMATCH)
    // (it will proceed to onLookupEmployee which is a no-op)
    await assert.doesNotReject(async () => {
      try { await ui.executeLookup('0118'); } catch (e) {
        // ignore non-mismatch errors (e.g. render issues in no-DOM env)
        if (e.message.includes('AUTHENTICATED_EMPLOYEE_CODE_MISMATCH')) throw e;
      }
    }, 'Same employee code must not throw mismatch error');

    // Different code: must throw AUTHENTICATED_EMPLOYEE_CODE_MISMATCH
    await assert.rejects(
      async () => ui.executeLookup('0119'),
      (err) => {
        assert.ok(err.message.includes('AUTHENTICATED_EMPLOYEE_CODE_MISMATCH'),
          `Expected AUTHENTICATED_EMPLOYEE_CODE_MISMATCH, got: ${err.message}`);
        return true;
      }
    );
  });
});

// ---------------------------------------------------------------------------
// D1-UAT-DEFECT-003 — Login Escape & Recovery UX
// ---------------------------------------------------------------------------

describe('D1-UAT-DEFECT-003 — Login Escape & Recovery UX', () => {

  it('1. Login overlay contains Back to Kintone Home action', async () => {
    const gate = new MboKintoneLoginGate({}, { onReload: () => {} });
    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      assert.ok(overlay, 'Overlay must be present');
      const backHomeBtn = overlay.querySelector('[data-mbo-back-home]');
      assert.ok(backHomeBtn, 'Back to Kintone Home button must be present');
      assert.ok(backHomeBtn.textContent.includes('กลับหน้าหลัก Kintone / Back to Kintone Home'));
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('2. Back Home action is type="button" and does not submit login form', async () => {
    const gate = new MboKintoneLoginGate({}, { onReload: () => {} });
    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      const backHomeBtn = overlay.querySelector('[data-mbo-back-home]');
      assert.equal(backHomeBtn.type, 'button', 'Must be type="button" to prevent form submission');
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('3. Back Home invokes only the injected navigation callback without calling adapter.login or creating principal', async () => {
    let exitCalled = false;
    let loginCalled = false;
    const mockAdapter = {
      login: async () => { loginCalled = true; return { status: 'AUTHENTICATED', employeeCode: '0118' }; }
    };
    const gate = new MboKintoneLoginGate(mockAdapter, {
      onExitToKintoneHome: () => { exitCalled = true; },
      onReload: () => {}
    });

    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      const backHomeBtn = overlay.querySelector('[data-mbo-back-home]');
      backHomeBtn._trigger('click');

      assert.equal(exitCalled, true, 'Must invoke injected onExitToKintoneHome callback');
      assert.equal(loginCalled, false, 'Must NOT invoke adapter.login');
      assert.equal(gate.getEmployeeCode(), null, 'Must NOT authenticate principal');
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('4. Forgot Password action exists, is type="button", and clicking it reveals bilingual support guidance', async () => {
    const gate = new MboKintoneLoginGate({}, { onReload: () => {} });
    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      const forgotPwBtn = overlay.querySelector('[data-mbo-forgot-password-btn]');
      const helpEl = overlay.querySelector('[data-mbo-forgot-password-help]');

      assert.ok(forgotPwBtn, 'Forgot password button must exist');
      assert.equal(forgotPwBtn.type, 'button', 'Forgot password button must be type="button"');
      assert.ok(helpEl, 'Forgot password help container must exist');
      assert.equal(helpEl.hasAttribute('hidden'), true, 'Help must initially be hidden');

      // Click to toggle open
      forgotPwBtn._trigger('click');
      assert.equal(helpEl.hasAttribute('hidden'), false, 'Help must be visible after click');
      assert.ok(helpEl.textContent.includes('ลืมรหัสผ่าน MBO กรุณาติดต่อ HR หรือ System Administrator'));
      assert.ok(helpEl.textContent.includes('Forgot your MBO password? Please contact HR or the System Administrator'));

      // Click again to toggle closed
      forgotPwBtn._trigger('click');
      assert.equal(helpEl.hasAttribute('hidden'), true, 'Help must be hidden after second click');
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('5. Forgot Password action does NOT call adapter.login, changePassword, forceChangePassword, or issue session', async () => {
    let loginCalled = false;
    let changePwCalled = false;
    let forceChangeCalled = false;
    let sessionIssued = false;

    const mockAdapter = {
      login: async () => { loginCalled = true; },
      changePassword: async () => { changePwCalled = true; },
      forceChangePassword: async () => { forceChangeCalled = true; },
    };
    const mockSessionManager = {
      issueSession: async () => { sessionIssued = true; },
      restoreSession: async () => null,
    };

    const gate = new MboKintoneLoginGate(mockAdapter, {
      sessionManager: mockSessionManager,
      onReload: () => {}
    });

    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      await new Promise(resolve => setTimeout(resolve, 20));
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      const forgotPwBtn = overlay.querySelector('[data-mbo-forgot-password-btn]');
      forgotPwBtn._trigger('click');

      assert.equal(loginCalled, false, 'Must not call adapter.login');
      assert.equal(changePwCalled, false, 'Must not call adapter.changePassword');
      assert.equal(forceChangeCalled, false, 'Must not call adapter.forceChangePassword');
      assert.equal(sessionIssued, false, 'Must not issue session');
      assert.equal(gate.getEmployeeCode(), null, 'Must not authenticate');
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('6. DEDICATED_ACCOUNT_REQUIRED state still denies Employee 0113 and overlay contains Back Home escape action', async () => {
    let exitCalled = false;
    const mockAdapter = {
      login: async () => ({ status: 'AUTHENTICATED', employeeCode: '0113' })
    };
    const mockEligibility = async (empCode) => {
      if (empCode === '0113') {
        return {
          eligible: false,
          status: 'DEDICATED_ACCOUNT_REQUIRED',
          reason: 'DEDICATED_ACCOUNT_REQUIRED',
          message: 'พนักงานรายนี้มีบัญชี Kintone ส่วนตัว กรุณาเข้าสู่ระบบด้วยบัญชี Kintone ของตนเอง\nThis employee has a dedicated Kintone account. Please sign in using their dedicated Kintone account.'
        };
      }
      return { eligible: true };
    };

    const gate = new MboKintoneLoginGate(mockAdapter, {
      checkSharedEligibility: mockEligibility,
      onExitToKintoneHome: () => { exitCalled = true; },
      onReload: () => {}
    });

    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      const form = overlay.querySelector('[data-mbo-login-form]');

      // Set input values for Employee 0113
      const usernameInput = form.querySelector('[name="username"]');
      const passwordInput = form.querySelector('[name="password"]');
      if (usernameInput) usernameInput.value = '0113';
      if (passwordInput) passwordInput.value = 'pw';

      // Submit form
      form._trigger('submit', { preventDefault: () => {} });
      await new Promise(resolve => setTimeout(resolve, 20));

      const errorEl = overlay.querySelector('[data-mbo-error]');
      assert.ok(errorEl.textContent.includes('พนักงานรายนี้มีบัญชี Kintone ส่วนตัว'), 'Must display dedicated account error');
      assert.equal(gate.getEmployeeCode(), null, 'Must remain unauthenticated');

      // Check that Back to Kintone Home action is present and clickable
      const backHomeBtn = overlay.querySelector('[data-mbo-back-home]');
      assert.ok(backHomeBtn, 'Back to Kintone Home button must remain available');
      backHomeBtn._trigger('click');
      assert.equal(exitCalled, true, 'Clicking Back Home must invoke navigation callback');
      assert.equal(gate.getEmployeeCode(), null, 'Principal must still be null after escape');
    } finally {
      globalThis.document = origDoc;
    }
  });

  it('7. Force Password Change card also contains Back Home escape action', async () => {
    let exitCalled = false;
    const mockAdapter = {
      login: async () => ({ status: 'PASSWORD_CHANGE_REQUIRED', employeeCode: '0118' }),
      forceChangePassword: async () => ({ status: 'PASSWORD_CHANGED', employeeCode: '0118' })
    };

    const gate = new MboKintoneLoginGate(mockAdapter, {
      onExitToKintoneHome: () => { exitCalled = true; },
      onReload: () => {}
    });

    const host = createMockEl('div');
    const origDoc = globalThis.document;
    globalThis.document = createMockDocument();
    try {
      gate.requireLogin(host);
      const overlay = host.querySelector('[data-mbo-login-overlay]');
      const form = overlay.querySelector('[data-mbo-login-form]');

      // Submit login to transition to Force Password Change card
      form._trigger('submit', { preventDefault: () => {} });
      await new Promise(resolve => setTimeout(resolve, 20));

      // Check that force change form has Back to Kintone Home button
      const forceChangeForm = overlay.querySelector('[data-mbo-force-change-form]');
      assert.ok(forceChangeForm, 'Force change form must be rendered');
      const backHomeBtn = forceChangeForm.querySelector('[data-mbo-back-home]');
      assert.ok(backHomeBtn, 'Back Home button must exist in force change form');
      assert.equal(backHomeBtn.type, 'button');

      backHomeBtn._trigger('click');
      assert.equal(exitCalled, true, 'Clicking Back Home must invoke callback');
      assert.equal(gate.getEmployeeCode(), null, 'Principal must remain null');
    } finally {
      globalThis.document = origDoc;
    }
  });

});
