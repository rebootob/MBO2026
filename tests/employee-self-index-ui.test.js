import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeeSelfIndexUI } from '../src/ui/employee-self-index-ui.js';
import { MboKintoneLoginGate } from '../src/ui/mbo-kintone-login-gate.js';

function createMockElement(tagName = 'div') {
  const children = [];
  const attributes = new Map();
  const style = {};
  const listeners = new Map();

  return {
    tagName: tagName.toUpperCase(),
    style,
    children,
    innerHTML: '',
    textContent: '',
    firstChild: null,

    setAttribute(key, val) {
      attributes.set(key, String(val));
    },
    hasAttribute(key) {
      return attributes.has(key);
    },
    getAttribute(key) {
      return attributes.has(key) ? attributes.get(key) : null;
    },
    removeAttribute(key) {
      attributes.delete(key);
    },

    appendChild(child) {
      children.push(child);
      if (!this.firstChild) this.firstChild = child;
      return child;
    },
    insertBefore(newChild, refChild) {
      const idx = children.indexOf(refChild);
      if (idx >= 0) {
        children.splice(idx, 0, newChild);
      } else {
        children.unshift(newChild);
      }
      this.firstChild = children[0];
      return newChild;
    },
    querySelector(sel) {
      const search = (el) => {
        if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
          const attrName = sel.slice(1, -1);
          if (el.getAttribute && el.getAttribute(attrName) !== null) return el;
        }
        for (const c of el.children || []) {
          const found = search(c);
          if (found) return found;
        }
        return null;
      };
      for (const c of this.children || []) {
        const found = search(c);
        if (found) return found;
      }
      return null;
    },
    querySelectorAll(sel) {
      const matches = [];
      const search = (el) => {
        if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
          const attrName = sel.slice(1, -1);
          if (el.getAttribute && el.getAttribute(attrName) !== null) {
            matches.push(el);
          }
        }
        for (const c of el.children || []) {
          search(c);
        }
      };
      search(this);
      return matches;
    },
    remove() {
      // noop in mock
    },
    addEventListener(evt, fn) {
      listeners.set(evt, fn);
    },
    click() {
      const fn = listeners.get('click');
      if (fn) return fn();
    }
  };
}

test('Employee-Self Index UI: Renders stable HeaderSpace shell, exactly 1 auth bar, bilingual title, actions and empty state', async () => {
  const headerSpaceEl = createMockElement('div');
  headerSpaceEl.setAttribute('id', 'header-space');

  globalThis.document = {
    querySelector: (sel) => {
      if (sel === '.gaia-header' || sel === '#header-gaia') return createMockElement('div');
      return null;
    },
    body: createMockElement('body'),
    createElement: (tag) => createMockElement(tag)
  };

  globalThis.kintone = {
    app: {
      getHeaderSpaceElement: () => headerSpaceEl
    }
  };

  let logoutCalled = false;
  const mockGate = new MboKintoneLoginGate({
    adapter: {},
    sessionManager: {},
    onReload: () => {}
  });
  mockGate.logout = async () => { logoutCalled = true; };

  const mockApiWrapper = {
    getRecords: async () => ({ records: [] })
  };

  const ui = new EmployeeSelfIndexUI({
    kintoneApiWrapper: mockApiWrapper,
    getMboAppId: () => 794,
    mboLoginGate: mockGate,
    renderBlockedNotice: () => {}
  });

  await ui.render({ type: 'app.record.index.show' }, null, '0113');

  // 1. Stable HeaderSpace Shell created
  const customIndex = headerSpaceEl.querySelector('[data-mbo-custom-index]');
  assert.ok(customIndex, 'Index UI shell must mount inside HeaderSpace');

  // 2. Exactly 1 Auth Bar
  const authBars = customIndex.querySelectorAll('[data-mbo-auth-bar]');
  assert.equal(authBars.length, 1, 'Exactly 1 auth bar must be present inside index shell');

  const authBar = authBars[0];

  // 3. Employee Code displayed
  const empCodeSpan = authBar.children.find(c => c.textContent.includes('0113'));
  assert.ok(empCodeSpan, 'Employee Code must be displayed in auth bar');
  assert.ok(empCodeSpan.textContent.includes('รหัสพนักงาน / Employee Code: 0113'));

  // 4. Change Password & Logout Buttons present
  const actionsContainer = authBar.children.find(c => c.children && c.children.length >= 2);
  assert.ok(actionsContainer, 'Actions container must be present in auth bar');

  const changePwBtn = actionsContainer.children.find(c => c.textContent.includes('Change Password'));
  assert.ok(changePwBtn, 'Change Password button must be present');
  assert.ok(changePwBtn.textContent.includes('เปลี่ยนรหัสผ่าน / Change Password'));

  const logoutBtn = actionsContainer.children.find(c => c.textContent.includes('Logout'));
  assert.ok(logoutBtn, 'Logout button must be present');
  assert.ok(logoutBtn.textContent.includes('ออกจากระบบ / Logout'));

  // 5. Logout action uses gate.logout() path
  await logoutBtn.click();
  assert.equal(logoutCalled, true, 'Logout button must invoke gate.logout() path');

  // 6. My MBO Title is exact
  const titleEl = customIndex.querySelector('[data-mbo-title]');
  assert.ok(titleEl, 'Title element must be rendered');
  assert.equal(titleEl.textContent, 'MBO ของฉัน / My MBO', 'Title must be MBO ของฉัน / My MBO');

  // 7. Create button
  const createBtn = customIndex.querySelector('[data-mbo-create-btn]');
  assert.ok(createBtn, 'Create button element must be rendered');
  assert.equal(createBtn.textContent, '+ สร้าง MBO ใหม่ / Create New MBO');
  assert.equal(createBtn.href, '/k/794/edit');

  // 8. Bilingual Empty State
  const emptyState = customIndex.querySelector('[data-mbo-empty-state]');
  assert.ok(emptyState, 'Empty state container must be rendered when 0 records returned');
  const emptyP = emptyState.children[0];
  assert.ok(emptyP.textContent.includes('ไม่พบบันทึก MBO สำหรับรหัสพนักงาน 0113'));
  assert.ok(emptyP.textContent.includes('No MBO records found for employee code 0113.'));
});

test('Employee-Self Index UI & Delete Guard: Queries exact Employee_Code FY desc, formats statuses correctly, renders history links, zero delete UI, and blocks delete submits', async () => {
  const headerSpaceEl = createMockElement('div');
  headerSpaceEl.setAttribute('id', 'header-space');

  globalThis.document = {
    querySelector: () => null,
    body: createMockElement('body'),
    createElement: (tag) => createMockElement(tag)
  };

  globalThis.kintone = {
    app: {
      getHeaderSpaceElement: () => headerSpaceEl
    }
  };

  let executedQuery = '';
  const mockApiWrapper = {
    getRecords: async (appId, query) => {
      executedQuery = query;
      return {
        records: [
          { $id: { value: '301' }, Fiscal_Year: { value: 'FY2026' }, Record_Key: { value: 'FY2026-0113' }, Status: { value: '15 HR Final Check' } },
          { $id: { value: '201' }, Fiscal_Year: { value: 'FY2025' }, Record_Key: { value: 'FY2025-0113' }, Status: { value: '16 Completed' } },
          { $id: { value: '101' }, Fiscal_Year: { value: 'FY2024' }, Record_Key: { value: 'FY2024-0113' }, Status: { value: 'Completed' } }
        ]
      };
    }
  };

  const ui = new EmployeeSelfIndexUI({
    kintoneApiWrapper: mockApiWrapper,
    getMboAppId: () => 794,
    mboLoginGate: { renderAuthBar: () => {} },
    renderBlockedNotice: () => {}
  });

  await ui.render({ type: 'app.record.index.show' }, null, '0113');

  // 1. Exact Employee_Code query & Fiscal_Year desc
  assert.equal(executedQuery, 'Employee_Code = "0113" order by Fiscal_Year desc');

  const customIndex = headerSpaceEl.querySelector('[data-mbo-custom-index]');
  assert.ok(customIndex, 'Index container must be present');

  // 2. Status formatting rules:
  // - "16 Completed" -> "Completed"
  // - "Completed" -> "Completed"
  // - "15 HR Final Check" -> MUST NOT be "Completed" ("15 HR Final Check")
  const { formatDisplayStatus } = await import('../src/ui/employee-self-index-ui.js');
  assert.equal(formatDisplayStatus('16 Completed'), 'Completed');
  assert.equal(formatDisplayStatus('Completed'), 'Completed');
  assert.equal(formatDisplayStatus('15 HR Final Check'), '15 HR Final Check');
  assert.notEqual(formatDisplayStatus('15 HR Final Check'), 'Completed');

  const statusBadges = customIndex.querySelectorAll('[data-mbo-status-badge]');
  assert.equal(statusBadges.length, 3, 'Exactly 3 status badges rendered');
  assert.equal(statusBadges[0].textContent, '15 HR Final Check', 'FY2026 must render 15 HR Final Check, NOT Completed');
  assert.equal(statusBadges[1].textContent, 'Completed', 'FY2025 (16 Completed) must render Completed');
  assert.equal(statusBadges[2].textContent, 'Completed', 'FY2024 (Completed) must render Completed');

  // 3. Action links are View History ("ดูย้อนหลัง / View History")
  const historyLinks = customIndex.querySelectorAll('[data-mbo-history-link]');
  assert.equal(historyLinks.length, 3, 'Exactly 3 history links for 3 years of records');

  assert.equal(historyLinks[0].textContent, 'ดูย้อนหลัง / View History');
  assert.equal(historyLinks[0].href, '/k/794/show#record=301');

  assert.equal(historyLinks[1].textContent, 'ดูย้อนหลัง / View History');
  assert.equal(historyLinks[1].href, '/k/794/show#record=201');

  assert.equal(historyLinks[2].textContent, 'ดูย้อนหลัง / View History');
  assert.equal(historyLinks[2].href, '/k/794/show#record=101');

  // 4. ZERO Delete UI present
  const allText = JSON.stringify(customIndex);
  assert.equal(allText.includes('Delete'), false, 'Zero Delete action text allowed in My MBO UI');
  assert.equal(allText.includes('ลบ'), false, 'Zero Thai delete text allowed in My MBO UI');

  // 5. DeleteGuardPolicy: Blocks Employee-Self detail/index delete submit using production mboLoginGate shape
  const { DeleteGuardPolicy } = await import('../src/security/delete-guard-policy.js');

  const mockGateAuth = {
    getEmployeeCode: () => '0113'
  };
  const policyAuth = new DeleteGuardPolicy({ mboLoginGate: mockGateAuth });

  const evt1 = { error: null };
  const res1 = policyAuth.evaluateDeleteSubmit(evt1);
  assert.equal(res1, false, 'Employee 0113 delete submit must be blocked (return false)');
  assert.ok(evt1.error.includes('การลบบันทึก MBO ไม่อนุญาตสำหรับพนักงาน'), 'Event error must communicate employee prohibition');

  // 6. DeleteGuardPolicy: When no Employee-Self principal, returns event unchanged without blocking
  const mockGateUnauth = {
    getEmployeeCode: () => null
  };
  const policyUnauth = new DeleteGuardPolicy({ mboLoginGate: mockGateUnauth });

  const evt2 = { error: null };
  const res2 = policyUnauth.evaluateDeleteSubmit(evt2);
  assert.equal(res2, evt2, 'No Employee-Self principal must return event unchanged');
  assert.equal(evt2.error, null, 'No Employee-Self principal must not set error on event');

  // 7. Verify NO getAuthenticatedEmployeeCode method exists on policy instance or gate
  assert.equal(typeof policyAuth.getAuthenticatedEmployeeCode, 'undefined', 'Must NOT add/invent getAuthenticatedEmployeeCode method');
  assert.equal(typeof mockGateAuth.getAuthenticatedEmployeeCode, 'undefined', 'Must NOT invent getAuthenticatedEmployeeCode on gate');
});
