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

  // 3. Action links follow action label rule:
  // - Non-completed ("15 HR Final Check") -> "เปิด MBO / Open MBO" [data-mbo-open-link]
  // - Completed ("16 Completed", "Completed") -> "ดูย้อนหลัง / View History" [data-mbo-history-link]
  const openLinks = customIndex.querySelectorAll('[data-mbo-open-link]');
  assert.equal(openLinks.length, 1, 'Exactly 1 open link for non-completed record');
  assert.equal(openLinks[0].textContent, 'เปิด MBO / Open MBO');
  assert.equal(openLinks[0].href, '/k/794/show#record=301');

  const historyLinks = customIndex.querySelectorAll('[data-mbo-history-link]');
  assert.equal(historyLinks.length, 2, 'Exactly 2 history links for completed records');
  assert.equal(historyLinks[0].textContent, 'ดูย้อนหลัง / View History');
  assert.equal(historyLinks[0].href, '/k/794/show#record=201');
  assert.equal(historyLinks[1].textContent, 'ดูย้อนหลัง / View History');
  assert.equal(historyLinks[1].href, '/k/794/show#record=101');

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

test('DETAIL_EXISTING_RECORD_BACK_TO_MY_MBO_VISIBLE & EDIT_EXISTING_RECORD_BACK_TO_MY_MBO_VISIBLE: Existing Detail and Edit show Back to My MBO bar', async () => {
  const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

  const createMockContainer = () => {
    const children = [];
    const attrMap = new Map();
    const mockContainer = {
      tagName: 'DIV',
      children,
      innerHTML: '',
      appendChild: (c) => { children.push(c); return c; },
      querySelector: (sel) => {
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) return el;
          }
          for (const child of el.children || []) {
            const res = find(child);
            if (res) return res;
          }
          return null;
        };
        return find(mockContainer);
      },
      querySelectorAll: (sel) => {
        const res = [];
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
          }
          for (const child of el.children || []) {
            find(child);
          }
        };
        find(mockContainer);
        return res;
      },
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null
    };
    return mockContainer;
  };

  const origDocument = globalThis.document;
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const children = [];
      const attrMap = new Map();
      return {
        tagName: tag.toUpperCase(),
        children,
        innerHTML: '',
        textContent: '',
        style: {},
        appendChild: (c) => { children.push(c); return c; },
        setAttribute: (k, v) => attrMap.set(k, String(v)),
        getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      };
    }
  };

  const origKintone = globalThis.kintone;
  try {
    globalThis.kintone = {
      app: {
        getHeaderSpaceElement: () => null
      },
      getLoginUser: () => ({ code: '0113' })
    };

    // 1. Detail Existing Record
    const detailContainer = createMockContainer();
    const detailUi = new EmployeePartAUI({
      container: detailContainer,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      }
    });
    detailUi.render();

    const detailNav = detailContainer.querySelector('[data-mbo-back-nav-bar]');
    assert.ok(detailNav, 'Detail existing record must render Back to My MBO bar');
    const detailLink = detailContainer.querySelector('[data-mbo-back-link]');
    assert.ok(detailLink, 'Detail existing record must render Back to My MBO link');
    assert.equal(detailLink.textContent, '← กลับหน้า My MBO / Back to My MBO');
    assert.equal(detailLink.href, '/k/794/');

    // 2. Edit Existing Record
    const editContainer = createMockContainer();
    const editUi = new EmployeePartAUI({
      container: editContainer,
      isCreate: false,
      isEditable: true,
      appId: 794,
      record: {
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      }
    });
    editUi.render();

    const editNav = editContainer.querySelector('[data-mbo-back-nav-bar]');
    assert.ok(editNav, 'Edit existing record must render Back to My MBO bar');
    const editLink = editContainer.querySelector('[data-mbo-back-link]');
    assert.ok(editLink, 'Edit existing record must render Back to My MBO link');
    assert.equal(editLink.textContent, '← กลับหน้า My MBO / Back to My MBO');
    assert.equal(editLink.href, '/k/794/');

    // 3. CREATE_RECORD_BACK_TO_MY_MBO_HIDDEN
    const createContainer = createMockContainer();
    const createUi = new EmployeePartAUI({
      container: createContainer,
      isCreate: true,
      isEditable: true,
      appId: 794,
      record: {}
    });
    createUi.render();

    const createNav = createContainer.querySelector('[data-mbo-back-nav-bar]');
    assert.equal(createNav, null, 'Create record must NOT render Back to My MBO bar');
  } finally {
    globalThis.document = origDocument;
    globalThis.kintone = origKintone;
  }
});

test('COMMENTS_SHORT_PAGE_NEWER_TRUE_CONTINUES: Short page (<10 items) with newer=true MUST continue fetching next page using exact returned count offset', async () => {
  const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

  let getCommentsCallCount = 0;
  const queriedParams = [];
  const mockApiWrapper = {
    getComments: async (appId, recordId, options) => {
      getCommentsCallCount++;
      queriedParams.push({ appId, recordId, options });
      if (options.offset === 0) {
        // Short page 1: returns 4 items (< 10 limit), but newer is true
        return {
          comments: [
            { id: '1', text: 'Comment 1', createdAt: '2026-08-29T10:00:00Z', creator: { name: 'User 1' } },
            { id: '2', text: 'Comment 2', createdAt: '2026-08-29T10:01:00Z', creator: { name: 'User 2' } },
            { id: '3', text: 'Comment 3', createdAt: '2026-08-29T10:02:00Z', creator: { name: 'User 3' } },
            { id: '4', text: 'Comment 4', createdAt: '2026-08-29T10:03:00Z', creator: { name: 'User 4' } }
          ],
          older: false,
          newer: true
        };
      } else {
        // Page 2: offset is 4, returns remaining 3 items, newer is false
        return {
          comments: [
            { id: '5', text: 'Comment 5', createdAt: '2026-08-29T10:04:00Z', creator: { name: 'User 5' } },
            { id: '6', text: 'Comment 6', createdAt: '2026-08-29T10:05:00Z', creator: { name: 'User 6' } },
            { id: '7', text: 'Comment 7', createdAt: '2026-08-29T10:06:00Z', creator: { name: 'User 7' } }
          ],
          older: true,
          newer: false
        };
      }
    }
  };

  const createMockContainer = () => {
    const children = [];
    const attrMap = new Map();
    const mockContainer = {
      tagName: 'DIV',
      children,
      innerHTML: '',
      appendChild: (c) => { children.push(c); return c; },
      querySelector: (sel) => {
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) return el;
          }
          for (const child of el.children || []) {
            const res = find(child);
            if (res) return res;
          }
          return null;
        };
        return find(mockContainer);
      },
      querySelectorAll: (sel) => {
        const res = [];
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
          }
          for (const child of el.children || []) {
            find(child);
          }
        };
        find(mockContainer);
        return res;
      },
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null
    };
    return mockContainer;
  };

  const origDocument = globalThis.document;
  const origKintone = globalThis.kintone;
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const children = [];
      const attrMap = new Map();
      return {
        tagName: tag.toUpperCase(),
        children,
        _innerHTML: '',
        get innerHTML() { return this._innerHTML; },
        set innerHTML(val) {
          this._innerHTML = val;
          if (val === '') children.length = 0;
        },
        textContent: '',
        style: {},
        appendChild: (c) => { children.push(c); return c; },
        setAttribute: (k, v) => attrMap.set(k, String(v)),
        getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null,
        querySelector: (sel) => {
          const search = (el) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (el.getAttribute && el.getAttribute(attr) !== null) return el;
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (el.className === cls || (el.className && el.className.includes(cls))) return el;
            }
            for (const c of el.children || []) {
              const res = search(c);
              if (res) return res;
            }
            return null;
          };
          for (const c of children || []) {
            const res = search(c);
            if (res) return res;
          }
          return null;
        },
        querySelectorAll: (sel) => {
          const res = [];
          const search = (el) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (el.className === cls || (el.className && el.className.includes(cls))) res.push(el);
            }
            for (const c of el.children || []) {
              search(c);
            }
          };
          for (const c of children || []) {
            search(c);
          }
          return res;
        },
        addEventListener: () => {}
      };
    }
  };
  globalThis.kintone = {
    app: { getHeaderSpaceElement: () => null },
    getLoginUser: () => ({ code: '0113' })
  };

  try {
    const container = createMockContainer();
    const ui = new EmployeePartAUI({
      container,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        $id: { value: '501' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: mockApiWrapper
    });

    ui.render();
    await new Promise(r => setTimeout(r, 50));

    assert.equal(getCommentsCallCount, 2, 'Short page with newer=true MUST continue to page 2');
    assert.equal(queriedParams[0].options.offset, 0);
    assert.equal(queriedParams[1].options.offset, 4, 'Page 2 offset must equal actual count 4 of first page');

    const threadList = container.querySelector('[data-mbo-comment-thread]');
    assert.ok(threadList, 'Comment thread list must render');
    assert.equal(threadList.children.length, 7, 'All 7 comments across pages 1 and 2 must render in order');

  } finally {
    globalThis.document = origDocument;
    globalThis.kintone = origKintone;
  }
});

test('COMMENTS_ASC_PAGE1_OLDER_FALSE_NEWER_TRUE_CONTINUES & COMMENTS_ASC_FINAL_PAGE_NEWER_FALSE_STOPS & COMMENTS_MORE_THAN_10_ALL_RENDERED & COMMENTS_EXISTING_DETAIL_LOADS_NATIVE_THREAD & COMMENTS_EXISTING_EDIT_LOADS_NATIVE_THREAD', async () => {
  const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

  let getCommentsCallCount = 0;
  const queriedParams = [];
  const mockApiWrapper = {
    getComments: async (appId, recordId, options) => {
      getCommentsCallCount++;
      queriedParams.push({ appId, recordId, options });
      if (options.offset === 0) {
        return {
          comments: Array.from({ length: 10 }, (_, i) => ({
            id: String(i + 1),
            text: `Comment ${i + 1} content <script>alert("xss")</script>`,
            createdAt: '2026-08-29T10:00:00Z',
            creator: { name: `User ${i + 1}`, code: `00${i + 1}` }
          })),
          older: false,
          newer: true
        };
      } else {
        return {
          comments: [
            { id: '11', text: 'Comment 11 page 2', createdAt: '2026-08-29T10:05:00Z', creator: { name: 'User 11', code: '0011' } },
            { id: '12', text: 'Comment 12 page 2', createdAt: '2026-08-29T10:06:00Z', creator: { name: 'User 12', code: '0012' } },
            { id: '13', text: 'Comment 13 page 2', createdAt: '2026-08-29T10:07:00Z', creator: { name: 'User 13', code: '0013' } },
            { id: '14', text: 'Comment 14 page 2', createdAt: '2026-08-29T10:08:00Z', creator: { name: 'User 14', code: '0014' } },
            { id: '15', text: 'Comment 15 page 2', createdAt: '2026-08-29T10:09:00Z', creator: { name: 'User 15', code: '0015' } }
          ],
          older: true,
          newer: false
        };
      }
    }
  };

  const createMockContainer = () => {
    const children = [];
    const attrMap = new Map();
    const mockContainer = {
      tagName: 'DIV',
      children,
      innerHTML: '',
      appendChild: (c) => { children.push(c); return c; },
      querySelector: (sel) => {
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) return el;
          }
          for (const child of el.children || []) {
            const res = find(child);
            if (res) return res;
          }
          return null;
        };
        return find(mockContainer);
      },
      querySelectorAll: (sel) => {
        const res = [];
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
          }
          for (const child of el.children || []) {
            find(child);
          }
        };
        find(mockContainer);
        return res;
      },
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null
    };
    return mockContainer;
  };

  const origDocument = globalThis.document;
  const origKintone = globalThis.kintone;
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const children = [];
      const attrMap = new Map();
      let clickListener = null;
      return {
        tagName: tag.toUpperCase(),
        children,
        innerHTML: '',
        textContent: '',
        style: {},
        appendChild: (c) => { children.push(c); return c; },
        setAttribute: (k, v) => attrMap.set(k, String(v)),
        getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null,
        querySelector: (sel) => {
          const search = (el) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (el.getAttribute && el.getAttribute(attr) !== null) return el;
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (el.className === cls || (el.className && el.className.includes(cls))) return el;
            }
            for (const c of el.children || []) {
              const res = search(c);
              if (res) return res;
            }
            return null;
          };
          for (const c of children || []) {
            const res = search(c);
            if (res) return res;
          }
          return null;
        },
        querySelectorAll: (sel) => {
          const res = [];
          const search = (el) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (el.className === cls || (el.className && el.className.includes(cls))) res.push(el);
            }
            for (const c of el.children || []) {
              search(c);
            }
          };
          for (const c of children || []) {
            search(c);
          }
          return res;
        },
        addEventListener: (evt, fn) => {
          if (evt === 'click') clickListener = fn;
        },
        _click: async () => {
          if (clickListener) await clickListener();
        }
      };
    }
  };
  globalThis.kintone = {
    app: { getHeaderSpaceElement: () => null },
    getLoginUser: () => ({ code: '0113' })
  };

  try {
    // 1. Existing Detail Record
    const detailContainer = createMockContainer();
    const detailUi = new EmployeePartAUI({
      container: detailContainer,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        $id: { value: '501' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: mockApiWrapper
    });

    detailUi.render();
    await new Promise(r => setTimeout(r, 50));

    // COMMENTS_ASC_PAGE1_OLDER_FALSE_NEWER_TRUE_CONTINUES: Page 1 with older=false must NOT stop pagination
    assert.equal(getCommentsCallCount, 2, 'Must page to page 2 when newer is true on page 1');
    assert.equal(queriedParams[0].appId, 794);
    assert.equal(String(queriedParams[0].recordId), '501');
    assert.equal(queriedParams[0].options.offset, 0);
    assert.equal(queriedParams[1].options.offset, 10);

    // COMMENTS_MORE_THAN_10_ALL_RENDERED
    const threadList = detailContainer.querySelector('[data-mbo-comment-thread]');
    assert.ok(threadList, 'Comment thread list must be rendered');
    assert.equal(threadList.children.length, 15, 'All 15 comments across pages 1 and 2 must be rendered');

    // COMMENTS_TEXT_RENDERED_WITHOUT_HTML_INJECTION & COMMENTS_RENDER_AUTHOR_BODY_TIMESTAMP
    const firstItem = threadList.children[0];
    const authorEl = firstItem.querySelector('[data-mbo-comment-author]');
    const textEl = firstItem.querySelector('[data-mbo-comment-text]');
    assert.equal(authorEl.textContent, 'User 1');
    assert.equal(textEl.textContent, 'Comment 1 content <script>alert("xss")</script>');
    assert.equal(textEl.innerHTML, '', 'InnerHTML must remain empty when using safe textContent');

    // 2. COMMENTS_EXISTING_EDIT_LOADS_NATIVE_THREAD
    getCommentsCallCount = 0;
    const editContainer = createMockContainer();
    const editUi = new EmployeePartAUI({
      container: editContainer,
      isCreate: false,
      isEditable: true,
      appId: 794,
      record: {
        $id: { value: '501' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: mockApiWrapper
    });

    editUi.render();
    await new Promise(r => setTimeout(r, 50));
    assert.equal(getCommentsCallCount, 2, 'Edit mode existing record must also load native comment thread');

  } finally {
    globalThis.document = origDocument;
    globalThis.kintone = origKintone;
  }
});

test('COMMENTS_MORE_THAN_500_NOT_SILENTLY_TRUNCATED: Pagination handles >500 comments without hard cap truncation', async () => {
  const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

  let getCommentsCallCount = 0;
  const mockApiWrapper = {
    getComments: async (appId, recordId, options) => {
      getCommentsCallCount++;
      const pageIndex = Math.floor(options.offset / 10);
      const isLastPage = pageIndex === 51; // 52 pages total = 520 comments
      return {
        comments: Array.from({ length: 10 }, (_, i) => ({
          id: String(pageIndex * 10 + i + 1),
          text: `Comment ${pageIndex * 10 + i + 1}`,
          createdAt: '2026-08-29T10:00:00Z',
          creator: { name: `User ${pageIndex * 10 + i + 1}` }
        })),
        older: pageIndex > 0,
        newer: !isLastPage
      };
    }
  };

  const createMockContainer = () => {
    const children = [];
    const attrMap = new Map();
    const mockContainer = {
      tagName: 'DIV',
      children,
      innerHTML: '',
      appendChild: (c) => { children.push(c); return c; },
      querySelector: (sel) => {
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) return el;
          }
          for (const child of el.children || []) {
            const res = find(child);
            if (res) return res;
          }
          return null;
        };
        return find(mockContainer);
      },
      querySelectorAll: (sel) => {
        const res = [];
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
          }
          for (const child of el.children || []) {
            find(child);
          }
        };
        find(mockContainer);
        return res;
      },
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null
    };
    return mockContainer;
  };

  const origDocument = globalThis.document;
  const origKintone = globalThis.kintone;
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const children = [];
      const attrMap = new Map();
      return {
        tagName: tag.toUpperCase(),
        children,
        innerHTML: '',
        textContent: '',
        style: {},
        appendChild: (c) => { children.push(c); return c; },
        setAttribute: (k, v) => attrMap.set(k, String(v)),
        getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      };
    }
  };
  globalThis.kintone = {
    app: { getHeaderSpaceElement: () => null },
    getLoginUser: () => ({ code: '0113' })
  };

  try {
    const container = createMockContainer();
    const ui = new EmployeePartAUI({
      container,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        $id: { value: '501' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: mockApiWrapper
    });

    ui.render();
    await new Promise(r => setTimeout(r, 100));

    assert.equal(getCommentsCallCount, 52, 'Must page through all 52 pages without silent 500 truncation');
    const threadList = container.querySelector('[data-mbo-comment-thread]');
    assert.ok(threadList, 'Comment thread list must render');
    assert.equal(threadList.children.length, 520, 'All 520 comments must be rendered');
  } finally {
    globalThis.document = origDocument;
    globalThis.kintone = origKintone;
  }
});

test('COMMENTS_REFRESH_RELOADS_THREAD & COMMENTS_REFRESH_PERFORMS_ZERO_RECORD_WRITE: Refresh button actually reloads thread and performs 0 record writes', async () => {
  const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

  let getCommentsCallCount = 0;
  let recordWriteCount = 0;
  let currentCommentDataset = [
    { id: '1', text: 'Initial comment 1', createdAt: '2026-08-29T10:00:00Z', creator: { name: 'User 1' } }
  ];

  const mockApiWrapper = {
    getComments: async () => {
      getCommentsCallCount++;
      return {
        comments: currentCommentDataset,
        older: false,
        newer: false
      };
    },
    updateRecord: async () => { recordWriteCount++; },
    addRecord: async () => { recordWriteCount++; }
  };

  const createMockContainer = () => {
    const children = [];
    const attrMap = new Map();
    const mockContainer = {
      tagName: 'DIV',
      children,
      innerHTML: '',
      appendChild: (c) => { children.push(c); return c; },
      querySelector: (sel) => {
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) return el;
          }
          for (const child of el.children || []) {
            const res = find(child);
            if (res) return res;
          }
          return null;
        };
        return find(mockContainer);
      },
      querySelectorAll: (sel) => {
        const res = [];
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
          }
          for (const child of el.children || []) {
            find(child);
          }
        };
        find(mockContainer);
        return res;
      },
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null
    };
    return mockContainer;
  };

  let refreshBtnElement = null;
  const origDocument = globalThis.document;
  const origKintone = globalThis.kintone;
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const children = [];
      const attrMap = new Map();
      let clickHandler = null;
      const el = {
        tagName: tag.toUpperCase(),
        children,
        _innerHTML: '',
        get innerHTML() { return this._innerHTML; },
        set innerHTML(val) {
          this._innerHTML = val;
          if (val === '') children.length = 0;
        },
        textContent: '',
        style: {},
        appendChild: (c) => { children.push(c); return c; },
        setAttribute: (k, v) => {
          attrMap.set(k, String(v));
          if (k === 'data-mbo-refresh-comments') refreshBtnElement = el;
        },
        getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null,
        querySelector: (sel) => {
          const search = (item) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (item.getAttribute && item.getAttribute(attr) !== null) return item;
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (item.className === cls || (item.className && item.className.includes(cls))) return item;
            }
            for (const c of item.children || []) {
              const res = search(c);
              if (res) return res;
            }
            return null;
          };
          for (const c of children || []) {
            const res = search(c);
            if (res) return res;
          }
          return null;
        },
        querySelectorAll: (sel) => {
          const res = [];
          const search = (item) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (item.getAttribute && item.getAttribute(attr) !== null) res.push(item);
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (item.className === cls || (item.className && item.className.includes(cls))) res.push(item);
            }
            for (const c of item.children || []) {
              search(c);
            }
          };
          for (const c of children || []) {
            search(c);
          }
          return res;
        },
        addEventListener: (evt, fn) => {
          if (evt === 'click') clickHandler = fn;
        },
        _click: async () => {
          if (clickHandler) await clickHandler();
        }
      };
      return el;
    }
  };
  globalThis.kintone = {
    app: { getHeaderSpaceElement: () => null },
    getLoginUser: () => ({ code: '0113' })
  };

  try {
    const container = createMockContainer();
    const ui = new EmployeePartAUI({
      container,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        $id: { value: '501' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: mockApiWrapper
    });

    ui.render();
    await new Promise(r => setTimeout(r, 50));

    assert.equal(getCommentsCallCount, 1, 'Initial render performs 1 GET comments call');
    const threadList1 = container.querySelector('[data-mbo-comment-thread]');
    assert.equal(threadList1.children.length, 1);
    assert.equal(threadList1.children[0].querySelector('[data-mbo-comment-text]').textContent, 'Initial comment 1');

    // Simulate new comment added natively in Kintone right panel
    currentCommentDataset.push({
      id: '2', text: 'New native comment 2', createdAt: '2026-08-29T10:10:00Z', creator: { name: 'User 2' }
    });

    assert.ok(refreshBtnElement, 'Refresh button element must be captured');
    await refreshBtnElement._click();

    assert.equal(getCommentsCallCount, 2, 'Clicking Refresh Comments must invoke a 2nd GET comments call');
    assert.equal(recordWriteCount, 0, 'Refresh action must perform ZERO record writes');

    const threadList2 = container.querySelector('[data-mbo-comment-thread]');
    assert.equal(threadList2.children.length, 2, 'Mirrored thread must update with newly fetched comments');
    assert.equal(threadList2.children[1].querySelector('[data-mbo-comment-text]').textContent, 'New native comment 2');

  } finally {
    globalThis.document = origDocument;
    globalThis.kintone = origKintone;
  }
});

test('COMMENTS_CREATE_PERFORMS_ZERO_COMMENT_GET & COMMENTS_EMPTY_STATE_BILINGUAL & COMMENTS_RETRIEVAL_FAILURE_NON_BLOCKING & COMMENTS_NO_POST_DELETE_REPLY_WRITE: Create performs 0 GET, empty state bilingual, failure non-blocking, 0 write calls', async () => {
  const { EmployeePartAUI } = await import('../src/ui/employee-part-a-ui.js');

  let getCommentsCallCount = 0;
  let writeCallCount = 0;
  const mockApiWrapper = {
    getComments: async () => {
      getCommentsCallCount++;
      return { comments: [], older: false, newer: false };
    },
    postComment: async () => { writeCallCount++; },
    deleteComment: async () => { writeCallCount++; }
  };

  const createMockContainer = () => {
    const children = [];
    const attrMap = new Map();
    const mockContainer = {
      tagName: 'DIV',
      children,
      innerHTML: '',
      appendChild: (c) => { children.push(c); return c; },
      querySelector: (sel) => {
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) return el;
          }
          for (const child of el.children || []) {
            const res = find(child);
            if (res) return res;
          }
          return null;
        };
        return find(mockContainer);
      },
      querySelectorAll: (sel) => {
        const res = [];
        const find = (el) => {
          if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
          }
          for (const child of el.children || []) {
            find(child);
          }
        };
        find(mockContainer);
        return res;
      },
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null
    };
    return mockContainer;
  };

  const origDocument = globalThis.document;
  const origKintone = globalThis.kintone;
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const children = [];
      const attrMap = new Map();
      return {
        tagName: tag.toUpperCase(),
        children,
        innerHTML: '',
        textContent: '',
        style: {},
        appendChild: (c) => { children.push(c); return c; },
        setAttribute: (k, v) => attrMap.set(k, String(v)),
        getAttribute: (k) => attrMap.has(k) ? attrMap.get(k) : null,
        querySelector: (sel) => {
          const search = (el) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (el.getAttribute && el.getAttribute(attr) !== null) return el;
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (el.className === cls || (el.className && el.className.includes(cls))) return el;
            }
            for (const c of el.children || []) {
              const res = search(c);
              if (res) return res;
            }
            return null;
          };
          for (const c of children || []) {
            const res = search(c);
            if (res) return res;
          }
          return null;
        },
        querySelectorAll: (sel) => {
          const res = [];
          const search = (el) => {
            if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (el.getAttribute && el.getAttribute(attr) !== null) res.push(el);
            }
            if (sel.startsWith('.')) {
              const cls = sel.slice(1);
              if (el.className === cls || (el.className && el.className.includes(cls))) res.push(el);
            }
            for (const c of el.children || []) {
              search(c);
            }
          };
          for (const c of children || []) {
            search(c);
          }
          return res;
        },
        addEventListener: () => {}
      };
    }
  };
  globalThis.kintone = {
    app: { getHeaderSpaceElement: () => null },
    getLoginUser: () => ({ code: '0113' })
  };

  try {
    // 1. COMMENTS_CREATE_PERFORMS_ZERO_COMMENT_GET
    const createContainer = createMockContainer();
    const createUi = new EmployeePartAUI({
      container: createContainer,
      isCreate: true,
      isEditable: true,
      appId: 794,
      record: {},
      kintoneApiWrapper: mockApiWrapper
    });
    createUi.render();
    await new Promise(r => setTimeout(r, 50));

    assert.equal(getCommentsCallCount, 0, 'Create screen must perform exactly 0 comment GET calls');
    const createNotice = createContainer.querySelector('[data-mbo-comment-panel]');
    assert.equal(createNotice, null, 'COMMENT_CREATE_MIRROR_ABSENT: Create screen must have 0 comment mirror panel');

    // 2. COMMENTS_EMPTY_STATE_BILINGUAL on existing record with 0 comments
    const emptyContainer = createMockContainer();
    const emptyUi = new EmployeePartAUI({
      container: emptyContainer,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        $id: { value: '502' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: mockApiWrapper
    });
    emptyUi.render();
    await new Promise(r => setTimeout(r, 50));

    assert.equal(getCommentsCallCount, 1, 'Existing record must fetch comments once');
    const emptyNotice = emptyContainer.querySelector('[data-mbo-comment-empty]');
    assert.ok(emptyNotice, 'Existing record with 0 comments must render empty notice');
    assert.ok(emptyNotice.textContent.includes('ยังไม่มีความคิดเห็นสำหรับบันทึกนี้'));
    assert.ok(emptyNotice.textContent.includes('No comments for this record yet.'));

    // 3. COMMENTS_RETRIEVAL_FAILURE_NON_BLOCKING
    const failingApiWrapper = {
      getComments: async () => {
        throw new Error('HTTP 403 Forbidden: Comment access denied');
      }
    };
    const errorContainer = createMockContainer();
    const errorUi = new EmployeePartAUI({
      container: errorContainer,
      isCreate: false,
      isEditable: false,
      appId: 794,
      record: {
        $id: { value: '503' },
        Status: { value: '01 Draft Objective' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      },
      kintoneApiWrapper: failingApiWrapper
    });
    errorUi.render();
    await new Promise(r => setTimeout(r, 50));

    const errorNotice = errorContainer.querySelector('[data-mbo-comment-error]');
    assert.ok(errorNotice, 'Comment retrieval failure must render non-blocking error notice in comment section');
    assert.ok(errorNotice.textContent.includes('HTTP 403 Forbidden'));

    // 4. COMMENTS_NO_POST_DELETE_REPLY_WRITE
    assert.equal(writeCallCount, 0, 'Comment mirror must perform ZERO POST/DELETE/reply comment write calls');

  } finally {
    globalThis.document = origDocument;
    globalThis.kintone = origKintone;
  }
});


