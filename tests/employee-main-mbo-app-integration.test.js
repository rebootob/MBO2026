import test from 'node:test';
import assert from 'node:assert/strict';

const registeredHandlers = new Map();
let currentActiveHost = createMockElement('div');

function createMockElement(tagName = 'div') {
  const children = [];
  const attributes = new Map();
  const style = {};
  const listeners = new Map();

  const element = {
    tagName: tagName.toUpperCase(),
    style,
    children,
    _innerHTML: '',
    _textContent: '',
    firstChild: null,
    href: '',
    target: '',
    type: '',
    className: '',
    dataset: {},

    get children() {
      return children;
    },
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(val) {
      this._innerHTML = String(val);
      if (val === '') {
        children.length = 0;
        this.firstChild = null;
      }
    },
    get textContent() {
      return this._textContent;
    },
    set textContent(val) {
      this._textContent = String(val);
    },

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
        if (sel === 'a' && el.tagName === 'A') return el;
        if (sel === 'h2' && el.tagName === 'H2') return el;
        if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
          const attrName = sel.slice(1, -1);
          if (el.getAttribute && el.getAttribute(attrName) !== null) return el;
        }
        if (sel.startsWith('.') && el.className && el.className.split(' ').includes(sel.slice(1))) {
          return el;
        }
        for (const c of el.children || []) {
          const found = search(c);
          if (found) return found;
        }
        return null;
      };
      return search(this);
    },
    querySelectorAll(sel) {
      const matches = [];
      const search = (el) => {
        if (sel === 'a' && el.tagName === 'A') matches.push(el);
        else if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
          const attrName = sel.slice(1, -1);
          if (el.getAttribute && el.getAttribute(attrName) !== null) matches.push(el);
        } else if (sel.startsWith('.') && el.className && el.className.split(' ').includes(sel.slice(1))) {
          matches.push(el);
        }
        for (const c of el.children || []) {
          search(c);
        }
      };
      search(this);
      return matches;
    },
    remove() {},
    addEventListener(evt, fn) {
      listeners.set(evt, fn);
    },
    dispatchEvent(evt) {
      const fn = listeners.get(evt.type || evt);
      if (fn) fn(evt);
    },
    click() {
      const fn = listeners.get('click');
      if (fn) return fn();
    }
  };

  return element;
}

// Global Kintone setup before main-mbo-app.js is imported
globalThis.document = {
  querySelector: (sel) => {
    if (sel === '.gaia-app-wrapper' || sel === 'body') return currentActiveHost || globalThis.document.body;
    return null;
  },
  querySelectorAll: () => [],
  body: createMockElement('body'),
  createElement: (tag) => createMockElement(tag),
  getElementById: () => null
};

globalThis.location = { href: 'http://localhost/k/794/' };

let currentMockUser = { code: 'f1', name: 'Shared F1 User' };

const mockApiFn = async (url, methodOrParams, optionalParams) => {
  const params = (typeof methodOrParams === 'object' && methodOrParams !== null) ? methodOrParams : optionalParams;
  if (params?.app === 53 || (params?.query && (params.query.includes('emp_text') || params.query.includes('MBO_Kintone_User')))) {
    if (params?.query && params.query.includes('ambiguous_user')) {
      return {
        records: [
          { $id: { value: '456' }, emp_text: { value: '0044' }, Number_0: { value: '1' }, MBO_Kintone_User: [{ code: 'ambiguous_user' }] },
          { $id: { value: '457' }, emp_text: { value: '0045' }, Number_0: { value: '1' }, MBO_Kintone_User: [{ code: 'ambiguous_user' }] }
        ]
      };
    }
    if (params?.query && params.query.includes('invalid_emp_text')) {
      return {
        records: [
          { $id: { value: '458' }, emp_text: { value: 'INVALID_CODE!' }, Number_0: { value: '1' }, MBO_Kintone_User: [{ code: 'invalid_emp_text' }] }
        ]
      };
    }
    if (params?.query && params.query.includes('unknown_dedicated')) {
      return { records: [] };
    }
    if (params?.query && (params.query.includes('vassana') || params.query.includes('0044'))) {
      return {
        records: [{
          $id: { value: '456' },
          Employee_Code: { value: '0044' },
          emp_text: { value: '0044' },
          Number_0: { value: '1' },
          MBO_Kintone_User: { value: [{ code: 'vassana', name: 'Ms.Vassana Maenthong' }] },
          Text: { value: 'Vassana' },
          Text_0: { value: 'วาสนา' },
          Drop_down: { value: 'Industrial Services' },
          Drop_down_0: { value: 'TMF3' },
          Text_2: { value: 'Deputy General Manager' },
          Text_4: { value: 'vassana@example.com' },
          Date: { value: '2015-01-01' }
        }]
      };
    }
    return {
      records: [{
        $id: { value: '501' },
        Employee_Code: { value: '0118' },
        emp_text: { value: '0118' },
        Number_0: { value: '1' },
        MBO_Kintone_User: { value: [{ code: 'f1', name: 'Shared F1 User' }] },
        Text: { value: 'Somchai' },
        Text_0: { value: 'สมชาย' },
        Drop_down: { value: 'Software Engineering' },
        Drop_down_0: { value: 'IT' },
        Text_2: { value: 'Clerk' },
        Text_4: { value: 'somchai@example.com' },
        Date: { value: '2020-01-01' },
        Title_EN: { value: 'Staff' }
      }]
    };
  }
  if (params?.app === 795 || (params?.query && params.query.includes('Section'))) {
    return {
      records: [{
        $id: { value: '701' },
        Section: { value: 'Software Engineering' },
        Requester_User: { value: [{ code: 'f1' }, { code: '0118' }] },
        Manager_Level1_Approvers: { value: [{ code: '0119' }] },
        Manager_Level1_Approval_Rule: { value: 'ANY' },
        Manager_Level2_Approvers: { value: [] },
        Manager_Level2_Approval_Rule: { value: 'ANY' },
        GM_Level1_Approvers: { value: [{ code: '0120' }] },
        GM_Level1_Approval_Rule: { value: 'ANY' },
        GM_Level2_Approvers: { value: [] },
        GM_Level2_Approval_Rule: { value: 'ANY' },
        Has_Manager_Level2: { value: 'NO' },
        Has_GM_Level2: { value: 'NO' },
        Routing_Topology: { value: 'DIRECT' },
        First_Manager_User: { value: [{ code: '0119' }] },
        Manager_User: { value: [{ code: '0119' }] },
        GM_User: { value: [{ code: '0120' }] }
      }]
    };
  }
  if (params?.app === 796 || (params?.query && params.query.includes('Profile_Code'))) {
    return {
      records: [{
        $id: { value: '801' },
        Profile_Code: { value: 'STAFF_OPERATIONAL' },
        Config_Status: { value: 'PUBLISHED' },
        Fiscal_Year: { value: 'FY2026' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' },
        Part_A_Scoring_Mode: { value: 'WEIGHTED_SUM' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        Configuration_Hash: { value: 'abc123hash' }
      }]
    };
  }
  if (params?.app === 794 || (params?.query && params.query.includes('Fiscal_Year'))) {
    return { records: [] };
  }
  return { records: [], comments: [] };
};
mockApiFn.url = (path) => path;

globalThis.kintone = {
  events: {
    on: (eventNames, handler) => {
      const list = Array.isArray(eventNames) ? eventNames : [eventNames];
      list.forEach(name => registeredHandlers.set(name, handler));
    }
  },
  app: {
    getId: () => 794,
    getHeaderSpaceElement: () => currentActiveHost,
    record: {
      getSpaceElement: () => currentActiveHost,
      getHeaderMenuSpaceElement: () => currentActiveHost,
      getHeaderSpaceElement: () => currentActiveHost,
      setFieldShown: () => {},
      set: () => {}
    }
  },
  getLoginUser: () => currentMockUser,
  api: mockApiFn
};

test('REAL_MAIN_MBO_APP_RECORD_SHOW_INTEGRATION_TEST: Executes registered main-mbo-app Kintone event handler path', async () => {
  const { setMboLoginGate } = await import('../src/main-mbo-app.js');

  let sessionMutations = 0;
  let recordWrites = 0;

  const mockGate = {
    requireLogin: () => '0118',
    logout: async () => { sessionMutations++; }
  };
  setMboLoginGate(mockGate);

  const recordShowHandler = registeredHandlers.get('app.record.detail.show');
  assert.ok(recordShowHandler, 'Registered event handler for app.record.detail.show must exist');

  // 1. DETAIL SHOW Integration Proof
  const detailHost = createMockElement('div');
  currentActiveHost = detailHost;

  const detailEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: '101',
    record: {
      $id: { value: '101' },
      Status: { value: '01 Draft Objective' },
      Employee_Code: { value: '0118' },
      Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
      PartA_Weight: { value: '70' },
      PartB_Weight: { value: '30' }
    }
  };

  const detailResult = await recordShowHandler(detailEvent);
  assert.equal(detailResult, detailEvent);

  const detailBackBar = detailHost.querySelector('[data-mbo-back-nav-bar]');
  assert.ok(detailBackBar, 'REAL_MAIN_DETAIL_BACK_VISIBLE: Detail screen must mount Back to My MBO bar via main-mbo-app pipeline');
  const detailBackLink = detailBackBar.querySelector('a');
  assert.equal(detailBackLink.href, '/k/794/', 'REAL_MAIN_BACK_CURRENT_APP_TARGET: Target is /k/794/');

  // 2. EDIT SHOW Integration Proof
  const editHost = createMockElement('div');
  currentActiveHost = editHost;

  const editEvent = {
    type: 'app.record.edit.show',
    appId: 794,
    recordId: '102',
    record: {
      $id: { value: '102' },
      Status: { value: '01 Draft Objective' },
      Employee_Code: { value: '0118' },
      Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
      PartA_Weight: { value: '70' },
      PartB_Weight: { value: '30' }
    }
  };

  const editResult = await recordShowHandler(editEvent);
  assert.equal(editResult, editEvent);

  const editBackBar = editHost.querySelector('[data-mbo-back-nav-bar]');
  assert.ok(editBackBar, 'REAL_MAIN_EDIT_BACK_VISIBLE: Edit screen must mount Back to My MBO bar via main-mbo-app pipeline');

  // Mock native Save & Cancel buttons in document for testing hideNativeSaveCancelControls
  const mockSaveBtn = createMockElement('button');
  mockSaveBtn.className = 'gaia-ui-actionmenu-save';
  mockSaveBtn.style.display = 'block';
  const mockCancelBtn = createMockElement('button');
  mockCancelBtn.className = 'gaia-ui-actionmenu-cancel';
  mockCancelBtn.style.display = 'block';
  globalThis.document.querySelector = (sel) => {
    if (sel === '.gaia-app-wrapper' || sel === 'body') return createMockElement('body');
    if (sel.includes('gaia-ui-actionmenu-cancel') || sel.includes('gaia-argui-app-menu-cancel')) return mockCancelBtn;
    if (sel.includes('gaia-ui-actionmenu-save') || sel.includes('gaia-argui-app-menu-save')) return mockSaveBtn;
    return null;
  };
  globalThis.document.querySelectorAll = (sel) => {
    if (sel.includes('gaia-ui-actionmenu-save')) return [mockSaveBtn];
    if (sel.includes('gaia-ui-actionmenu-cancel')) return [mockCancelBtn];
    return [];
  };

  // 3. CREATE SHOW Integration Proof (Normal successful Create after preflight PASS)
  const createHost = createMockElement('div');
  currentActiveHost = createHost;

  const createRecordFields = [
    'Status', 'Fiscal_Year', 'Employee_Code', 'Employee_Name', 'Employee_Name_TH',
    'Employee_Section', 'Employee_Department', 'Employee_Position', 'Employee_Email',
    'Employee_Start_Date', 'Department_Hoshin', 'Section_Hoshin', 'Record_Key',
    'Manager_Level1_Approvers', 'Manager_Level2_Approvers', 'GM_Level1_Approvers',
    'GM_Level2_Approvers', 'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology',
    'First_Manager_User', 'Manager_User', 'GM_User', 'Requester_User', 'Profile_Code',
    'PartA_Weight', 'PartB_Weight', 'Part_A_Scoring_Mode', 'Competency_Set_Code',
    'Configuration_Hash'
  ];
  const createRecord = {};
  createRecordFields.forEach(f => { createRecord[f] = { value: '' }; });
  createRecord.Status = { value: '01 Draft Objective' };
  for (let i = 1; i <= 10; i++) {
    createRecord[`Objective_Name_${i}`] = { value: '' };
    createRecord[`Objective_Weight_${i}`] = { value: '' };
    createRecord[`Action_Plan_${i}`] = { value: '' };
  }

  const createEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: createRecord
  };

  const createResult = await recordShowHandler(createEvent);
  assert.equal(createResult, createEvent);

  const createBackBar = createHost.querySelector('[data-mbo-back-nav-bar]');
  assert.equal(createBackBar, null, 'REAL_MAIN_CREATE_BACK_ABSENT: Create screen must NOT mount Back bar');

  const createCommentMirror = createHost.querySelector('[data-mbo-comment-panel]');
  assert.equal(createCommentMirror, null, 'COMMENT_CREATE_MIRROR_ABSENT: Create screen must NOT mount Comment mirror');

  // R3 Gap A Assertions: Normal Create continuation after preflight PASS
  assert.equal(createEvent.record.Fiscal_Year.value, 'FY2026', 'R3_NORMAL_CREATE_FY_DEFAULTED: Blank Fiscal_Year must default to FY2026 after preflight PASS');
  assert.equal(createEvent.record.Employee_Code.value, '0118', 'R3_NORMAL_CREATE_AUTOLOAD_CONTINUES: Normal profile autoload continues to populate Employee_Code');
  assert.equal(mockSaveBtn.style.display, 'block', 'R3_NORMAL_CREATE_SAVE_NOT_HIDDEN: Normal successful Create must NOT hide native Save');
  assert.equal(mockCancelBtn.style.display, 'block', 'R3_NORMAL_CREATE_CANCEL_NOT_HIDDEN: Normal successful Create must NOT hide native Cancel');

  // 4. ERROR STATE Integration Proofs (WP2 R4 / R3)
  // 4a. Employee Code Mismatch on Existing Detail Screen
  const mismatchHost = createMockElement('div');
  currentActiveHost = mismatchHost;
  const mismatchEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: '103',
    record: {
      $id: { value: '103' },
      Status: { value: '01 Draft Objective' },
      Employee_Code: { value: 'DIFFERENT_EMP' }
    }
  };
  await recordShowHandler(mismatchEvent);
  const mismatchBackBars = mismatchHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(mismatchBackBars.length, 1, 'R4_ERROR_STATE_DETAIL_BACK_VISIBLE: Access Denied error screen on existing Detail must mount exactly 1 Back bar');
  assert.equal(mismatchBackBars[0].querySelector('a').href, '/k/794/');
  // R3 Gap B Assertion: Detail blocked notice does not hide native actions
  assert.equal(mockSaveBtn.style.display, 'block', 'R3_DETAIL_BLOCKED_SAVE_NOT_HIDDEN: Existing Detail blocked notice must NOT hide native Save');
  assert.equal(mockCancelBtn.style.display, 'block', 'R3_DETAIL_BLOCKED_CANCEL_NOT_HIDDEN: Existing Detail blocked notice must NOT hide native Cancel');

  // 4b. Employee Code Mismatch on Existing Edit Screen
  const mismatchEditHost = createMockElement('div');
  currentActiveHost = mismatchEditHost;
  const mismatchEditEvent = {
    type: 'app.record.edit.show',
    appId: 794,
    recordId: '104',
    record: {
      $id: { value: '104' },
      Status: { value: '01 Draft Objective' },
      Employee_Code: { value: 'DIFFERENT_EMP' }
    }
  };
  await recordShowHandler(mismatchEditEvent);
  const mismatchEditBackBars = mismatchEditHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(mismatchEditBackBars.length, 1, 'R4_ERROR_STATE_EDIT_BACK_VISIBLE: Access Denied error screen on existing Edit must mount exactly 1 Back bar');
  // R3 Gap B Assertion: Edit blocked notice does not hide native actions
  assert.equal(mockSaveBtn.style.display, 'block', 'R3_EDIT_BLOCKED_SAVE_NOT_HIDDEN: Existing Edit blocked notice must NOT hide native Save');
  assert.equal(mockCancelBtn.style.display, 'block', 'R3_EDIT_BLOCKED_CANCEL_NOT_HIDDEN: Existing Edit blocked notice must NOT hide native Cancel');

  // 4c. Create Screen Auth-Required / Gate-Null Error State MUST NOT show Back bar and MUST NOT hide native Save/Cancel
  const createUnauthErrorHost = createMockElement('div');
  currentActiveHost = createUnauthErrorHost;
  const createUnauthErrorEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' },
      Fiscal_Year: { value: '' }
    }
  };
  const origGate = mockGate;
  setMboLoginGate(null);
  await recordShowHandler(createUnauthErrorEvent);
  const createUnauthBackBars = createUnauthErrorHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(createUnauthBackBars.length, 0, 'R4_R2_CREATE_UNAUTH_ERROR_BACK_ABSENT: Error screen before authentication on Create must NOT mount Back bar');
  assert.equal(mockSaveBtn.style.display, 'block', 'R2_UNAUTH_CREATE_SAVE_NOT_HIDDEN: Pre-auth Create error notice must NOT hide native Save');
  assert.equal(mockCancelBtn.style.display, 'block', 'R2_UNAUTH_CREATE_CANCEL_NOT_HIDDEN: Pre-auth Create error notice must NOT hide native Cancel');
  assert.equal(createUnauthErrorEvent.record.Fiscal_Year.value, '', 'R2_UNAUTH_FISCAL_YEAR_CLEAN: Fiscal_Year remains unmutated');
  setMboLoginGate(origGate);

  // 4d. Authenticated Create Fatal Autoload / Duplicate Error State MUST show exactly 1 Back bar, hide native Save/Cancel, and invoke native Cancel on Back click (Fatal Create Clean-Exit R4)
  const createAutoloadFailHost = createMockElement('div');
  currentActiveHost = createAutoloadFailHost;
  const createAutoloadFailEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' },
      Fiscal_Year: { value: '' }
    }
  };
  let kintoneRecordSetCount = 0;
  const origSet = globalThis.kintone.app.record.set;
  globalThis.kintone.app.record.set = () => { kintoneRecordSetCount++; };

  let nativeCancelClickCount = 0;
  mockCancelBtn.click = () => { nativeCancelClickCount++; };

  const savedApi = globalThis.kintone.api;
  let lastQuery = '';
  const mockErrApi = async (path, query) => {
    lastQuery = query || '';
    throw new Error('Simulated duplicate MBO record already exists for Employee 0118 in FY2026');
  };
  mockErrApi.url = (path) => path;
  globalThis.kintone.api = mockErrApi;

  await recordShowHandler(createAutoloadFailEvent);
  const createAutoloadBackBars = createAutoloadFailHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(createAutoloadBackBars.length, 1, 'R4_AUTH_CREATE_FATAL_ERROR_BACK_VISIBLE: Authenticated Create fatal profile resolution error must mount exactly 1 Back bar');
  const createAutoloadBackLink = createAutoloadBackBars[0].querySelector('a');
  assert.equal(createAutoloadBackLink.href, '/k/794/', 'R4_AUTH_CREATE_FATAL_ERROR_BACK_TARGET: Target is /k/794/');
  assert.ok(createAutoloadBackLink.textContent.includes('← กลับหน้า My MBO / Back to My MBO'), 'R4_AUTH_CREATE_FATAL_ERROR_BACK_LABEL: Uses exact bilingual label');
  assert.equal(mockSaveBtn.style.display, 'none', 'FATAL_CREATE_NATIVE_SAVE_HIDDEN: Native Save control must be hidden on terminal fatal Create state');
  assert.equal(mockCancelBtn.style.display, 'none', 'FATAL_CREATE_NATIVE_CANCEL_HIDDEN: Native Cancel control must be hidden on terminal fatal Create state');
  assert.equal(createAutoloadFailEvent.record.Fiscal_Year.value, '', 'R4_FATAL_CREATE_FISCAL_YEAR_UNMUTATED: Fiscal_Year.value must remain blank on duplicate rejection');
  assert.equal(createAutoloadFailEvent.record.Employee_Code, undefined, 'FATAL_CREATE_FORM_STATE_CLEAN: Native record object must remain unmutated by failed autoload');
  assert.equal(kintoneRecordSetCount, 0, 'R4_FATAL_CREATE_KINTONE_RECORD_SET_ZERO: kintone.app.record.set must NOT be called on fatal duplicate rejection');
  globalThis.kintone.app.record.set = origSet;

  // Test R4 Back Click: Must prevent plain navigation and invoke native Cancel exactly once
  let defaultPrevented = false;
  const mockClickEvent = {
    type: 'click',
    preventDefault: () => { defaultPrevented = true; }
  };
  createAutoloadBackLink.dispatchEvent(mockClickEvent);
  assert.equal(defaultPrevented, true, 'R4_BACK_PREVENTS_PLAIN_NAVIGATION: Back link click must prevent default anchor navigation');
  assert.equal(nativeCancelClickCount, 1, 'R4_BACK_INVOKES_NATIVE_CANCEL_EXACTLY_ONCE: Back link click must invoke native Cancel control exactly once');

  // 4e. Missing Native Cancel Button on Fatal Create — Must fail closed without plain navigation or unload suppression
  const createMissingCancelHost = createMockElement('div');
  currentActiveHost = createMissingCancelHost;
  const origQuerySelector = globalThis.document.querySelector;
  globalThis.document.querySelector = (sel) => {
    if (sel === '.gaia-app-wrapper' || sel === 'body') return createMockElement('body');
    return null; // Native cancel missing
  };
  const createMissingCancelEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' },
      Fiscal_Year: { value: '' }
    }
  };
  await recordShowHandler(createMissingCancelEvent);
  const missingCancelBackBars = createMissingCancelHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(missingCancelBackBars.length, 1, 'R4_MISSING_CANCEL_BACK_VISIBLE: Mounts exactly 1 Back bar');
  const missingCancelBackLink = missingCancelBackBars[0].querySelector('a');
  let missingCancelDefaultPrevented = false;
  missingCancelBackLink.dispatchEvent({
    type: 'click',
    preventDefault: () => { missingCancelDefaultPrevented = true; }
  });
  assert.equal(missingCancelDefaultPrevented, true, 'R4_MISSING_CANCEL_FAIL_CLOSED_PREVENTS_NAV: Plain navigation prevented when native cancel is missing');
  globalThis.document.querySelector = origQuerySelector;

  // 4f. Authenticated Create Duplicate Check with Nonblank Fiscal_Year
  const createFailFYHost = createMockElement('div');
  currentActiveHost = createFailFYHost;
  const createFailFYEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' },
      Fiscal_Year: { value: 'FY2025' }
    }
  };
  await recordShowHandler(createFailFYEvent);
  assert.equal(createFailFYEvent.record.Fiscal_Year.value, 'FY2025', 'R4_NONBLANK_FY_PRESERVED: Nonblank Fiscal_Year.value remains FY2025');

  globalThis.kintone.api = savedApi;

  // 4g. DEDICATED Principal Integration Test: Bypasses mboLoginGate.requireLogin and resolves bound Employee_Code
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  let requireLoginCalled = false;
  setMboLoginGate({
    requireLogin: () => {
      requireLoginCalled = true;
      return 'UNEXPECTED_CALL';
    }
  });

  const dedicatedCreateHost = createMockElement('div');
  currentActiveHost = dedicatedCreateHost;
  const dedicatedCreateEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' },
      Fiscal_Year: { value: '' }
    }
  };

  await recordShowHandler(dedicatedCreateEvent);

  const { getCurrentEmployeeSelfContext } = await import('../src/main-mbo-app.js');
  const dedicatedCtx = getCurrentEmployeeSelfContext();
  assert.ok(dedicatedCtx, 'Dedicated Employee-Self context must be set');
  assert.equal(dedicatedCtx.mode, 'DEDICATED', 'Context mode must be DEDICATED');
  assert.equal(dedicatedCtx.employeeCode, '0044', 'Bound employee code must be 0044 for vassana');
  assert.equal(dedicatedCtx.kintoneUserCode, 'vassana', 'Kintone user code must be vassana');
  assert.equal(requireLoginCalled, false, 'DEDICATED mode must NEVER invoke mboLoginGate.requireLogin()');

  // 4g-0. Valid DEDICATED mapping succeeds when mboLoginGate is null
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  setMboLoginGate(null);
  const dedicatedNullGateHost = createMockElement('div');
  dedicatedNullGateHost.className = 'gaia-app-wrapper';
  currentActiveHost = dedicatedNullGateHost;
  const indexShowHandler = registeredHandlers.get('app.record.index.show');
  assert.ok(indexShowHandler, 'Registered event handler for app.record.index.show must exist');
  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));
  const nullGateCtx = getCurrentEmployeeSelfContext();
  assert.ok(nullGateCtx, 'Valid DEDICATED mapping must succeed when mboLoginGate is null');
  assert.equal(nullGateCtx.mode, 'DEDICATED');
  assert.equal(nullGateCtx.employeeCode, '0044');
  assert.equal(nullGateCtx.kintoneUserCode, 'vassana');

  // Restore gate mock with call tracking
  setMboLoginGate({
    requireLogin: () => {
      requireLoginCalled = true;
      return 'UNEXPECTED_CALL';
    }
  });

  // 4g-1. DEDICATED missing mapping fails closed with 0 requireLogin calls
  currentMockUser = { code: 'unknown_dedicated', name: 'Unknown User' };
  requireLoginCalled = false;
  const missingHost = createMockElement('div');
  missingHost.className = 'gaia-app-wrapper';
  currentActiveHost = missingHost;
  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));
  const missingCtx = getCurrentEmployeeSelfContext();
  assert.equal(missingCtx, null, 'Missing dedicated mapping must clear context (null)');
  assert.equal(requireLoginCalled, false, 'Missing dedicated mapping must NEVER invoke mboLoginGate.requireLogin()');

  // 4g-2. DEDICATED ambiguous mapping (>1 records) fails closed with 0 requireLogin calls
  currentMockUser = { code: 'ambiguous_user', name: 'Ambiguous User' };
  requireLoginCalled = false;
  const ambigHost = createMockElement('div');
  ambigHost.className = 'gaia-app-wrapper';
  currentActiveHost = ambigHost;
  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));
  const ambigCtx = getCurrentEmployeeSelfContext();
  assert.equal(ambigCtx, null, 'Ambiguous dedicated mapping must clear context (null)');
  assert.equal(requireLoginCalled, false, 'Ambiguous dedicated mapping must NEVER invoke mboLoginGate.requireLogin()');

  // 4g-3. DEDICATED invalid canonical emp_text fails closed with 0 requireLogin calls
  currentMockUser = { code: 'invalid_emp_text', name: 'Invalid EmpText User' };
  requireLoginCalled = false;
  const invalidHost = createMockElement('div');
  invalidHost.className = 'gaia-app-wrapper';
  currentActiveHost = invalidHost;
  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));
  const invalidCtx = getCurrentEmployeeSelfContext();
  assert.equal(invalidCtx, null, 'Invalid canonical emp_text dedicated mapping must clear context (null)');
  assert.equal(requireLoginCalled, false, 'Invalid canonical emp_text must NEVER invoke mboLoginGate.requireLogin()');

  // 4g-4. Create uses local DEDICATED context and snapshots Requester_User = [{ code: "vassana" }]
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  const dedicatedCreateRecHost = createMockElement('div');
  currentActiveHost = dedicatedCreateRecHost;
  const dedicatedCreateRecEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' },
      Employee_Code: { value: '' },
      Employee_Name: { value: '' },
      Employee_Name_TH: { value: '' },
      Employee_Department: { value: '' },
      Employee_Section: { value: '' },
      Employee_Position: { value: '' },
      Employee_Email: { value: '' },
      Employee_Start_Date: { value: '' },
      Fiscal_Year: { value: '' },
      Record_Key: { value: '' },
      Requester_User: { value: [] },
      Manager_Level1_Approvers: { value: [] },
      Manager_Level1_Approval_Rule: { value: '' },
      GM_Level1_Approvers: { value: [] },
      GM_Level1_Approval_Rule: { value: '' },
      Has_Manager_Level2: { value: '' },
      Has_GM_Level2: { value: '' },
      Routing_Topology: { value: '' },
      First_Manager_User: { value: [] },
      Manager_User: { value: [] },
      GM_User: { value: [] },
      Profile_Code: { value: '' },
      PartA_Weight: { value: '' },
      PartB_Weight: { value: '' },
      Part_A_Scoring_Mode: { value: '' },
      Competency_Set_Code: { value: '' },
      Configuration_Hash: { value: '' }
    }
  };
  await recordShowHandler(dedicatedCreateRecEvent);
  assert.deepEqual(dedicatedCreateRecEvent.record.Requester_User.value, [{ code: 'vassana' }], 'Create through local DEDICATED context must snapshot Requester_User = [{ code: "vassana" }]');


  // 4g-2. Finding R1-C: Registered delete event handler blocks for DEDICATED & SHARED context and abstains when null
  const deleteHandler = registeredHandlers.get('app.record.detail.delete.submit');
  assert.ok(typeof deleteHandler === 'function', 'Delete handler must be registered');

  // Active context (DEDICATED) -> Blocked (returns false)
  const { setCurrentEmployeeSelfContext } = await import('../src/main-mbo-app.js');
  setCurrentEmployeeSelfContext({ mode: 'DEDICATED', employeeCode: '0044', kintoneUserCode: 'vassana' });
  const delEventDedicated = { type: 'app.record.detail.delete.submit', recordId: 10 };
  const resDedicated = deleteHandler(delEventDedicated);
  assert.equal(resDedicated, false, 'Delete submit must be blocked when DEDICATED Employee-Self context exists');

  // Active context (SHARED) -> Blocked (returns false)
  setCurrentEmployeeSelfContext({ mode: 'SHARED', employeeCode: '0118', kintoneUserCode: 'f1' });
  const delEventShared = { type: 'app.record.detail.delete.submit', recordId: 10 };
  const resShared = deleteHandler(delEventShared);
  assert.equal(resShared, false, 'Delete submit must be blocked when SHARED Employee-Self context exists');

  // Null context -> Abstains (returns event)
  setCurrentEmployeeSelfContext(null);
  const delEventNull = { type: 'app.record.detail.delete.submit', recordId: 10 };
  const resNull = deleteHandler(delEventNull);
  assert.equal(resNull, delEventNull, 'Delete submit must abstain (return event unchanged) when no Employee-Self context exists');

  // Restore dedicated context for remaining tests
  setCurrentEmployeeSelfContext(dedicatedCtx);

  globalThis.kintone.api = savedApi;

  assert.equal(sessionMutations, 0, 'REAL_MAIN_AUTH_SESSION_MUTATION = 0');
  assert.equal(recordWrites, 0, 'REAL_MAIN_RECORD_WRITE = 0');

  // 4h. Static Code Inspection: Ensure ZERO forbidden patterns in main-mbo-app.js and employee-record-navigation.js
  const fs = await import('fs');
  const mainSrc = fs.readFileSync('src/main-mbo-app.js', 'utf8');
  const navSrc = fs.readFileSync('src/ui/employee-record-navigation.js', 'utf8');
  assert.ok(!mainSrc.includes('onbeforeunload'), 'R4_1_NO_ONBEFOREUNLOAD: main-mbo-app.js must NOT contain onbeforeunload');
  assert.ok(!navSrc.includes('onbeforeunload'), 'R4_1_NO_ONBEFOREUNLOAD_NAV: employee-record-navigation.js must NOT contain onbeforeunload');
  assert.ok(!mainSrc.includes('beforeunload'), 'R4_1_NO_REMOVE_BEFOREUNLOAD: main-mbo-app.js must NOT add or remove beforeunload listeners');
  assert.ok(!navSrc.includes('beforeunload'), 'R4_1_NO_REMOVE_BEFOREUNLOAD_NAV: employee-record-navigation.js must NOT add or remove beforeunload listeners');
  assert.ok(!mainSrc.includes('location.assign') && !mainSrc.includes('location.replace') && !mainSrc.includes('history.back'), 'R4_1_NO_HISTORY_HACKS: main-mbo-app.js must NOT use location.assign/replace/history.back');
  assert.ok(!navSrc.includes('location.assign') && !navSrc.includes('location.replace') && !navSrc.includes('history.back'), 'R4_1_NO_HISTORY_HACKS_NAV: employee-record-navigation.js must NOT use location.assign/replace/history.back');
});
