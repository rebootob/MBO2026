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
let approvalQueryCount = 0;
let app795QueryCount = 0;
let triggerApprovalFetchError = false;
let singleRecordGetCount = 0;
let triggerSingleRecordGetError = false;

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
    app795QueryCount++;
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
  if (params?.app === 794 && params?.id !== undefined) {
    singleRecordGetCount++;
    if (triggerSingleRecordGetError) {
      throw new Error('Kintone API network error during single record revalidation');
    }
    const reqIdStr = String(params.id);
    if (reqIdStr === '9999') {
      return { record: null };
    }
    if (reqIdStr === '902') {
      return {
        record: {
          $id: { value: '902' },
          Fiscal_Year: { value: 'FY2026' },
          Employee_Code: { value: '0118' },
          Employee_Name: { value: 'Somchai' },
          Status: { value: '02 Waiting Appraiser 1' },
          Record_Key: { value: 'FY2026-0118' },
          Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'other_user', name: 'Other User' }] },
          Manager_User: { value: [{ code: 'vassana' }] },
          First_Manager_User: { value: [{ code: 'vassana' }] },
          GM_User: { value: [{ code: 'vassana' }] }
        }
      };
    }
    return {
      record: {
        $id: { value: reqIdStr },
        Fiscal_Year: { value: 'FY2026' },
        Employee_Code: { value: '0118' },
        Employee_Name: { value: 'Somchai' },
        Status: { value: '02 Waiting Appraiser 1' },
        Record_Key: { value: 'FY2026-0118' },
        Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'vassana', name: 'Vassana' }] },
        Manager_User: { value: [{ code: 'vassana' }] },
        First_Manager_User: { value: [{ code: 'vassana' }] },
        GM_User: { value: [{ code: 'vassana' }] }
      }
    };
  }
  if (params?.app === 794 || (params?.query && (params.query.includes('Fiscal_Year') || params.query.includes('Assignee')))) {
    if (params?.query && params.query.includes('Assignee in (LOGINUSER())')) {
      approvalQueryCount++;
      if (triggerApprovalFetchError) {
        throw new Error('Kintone API network error during approval fetch');
      }
      return {
        records: [
          {
            $id: { value: '901' },
            Fiscal_Year: { value: 'FY2026' },
            Employee_Code: { value: '0044' },
            Employee_Name: { value: 'Vassana' },
            Status: { value: '02 Waiting Appraiser 1' },
            Record_Key: { value: 'FY2026-0044' },
            Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'vassana', name: 'Vassana' }] }
          },
          {
            $id: { value: '902' },
            Fiscal_Year: { value: 'FY2026' },
            Employee_Code: { value: '0118' },
            Employee_Name: { value: 'Somchai' },
            Status: { value: '02 Waiting Appraiser 1' },
            Record_Key: { value: 'FY2026-0118' },
            Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'other_user', name: 'Other User' }] }
          }
        ]
      };
    }
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

  // 4g-5. D1 My Approval Tasks Home Index Integration assertions
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  requireLoginCalled = false;
  approvalQueryCount = 0;
  app795QueryCount = 0;
  triggerApprovalFetchError = false;

  const dedicatedHomeHost = createMockElement('div');
  dedicatedHomeHost.className = 'gaia-app-wrapper';
  currentActiveHost = dedicatedHomeHost;

  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));

  // 1 & 8. DEDICATED Index resolves bound Employee_Code and invokes 0 mboLoginGate calls
  const homeCtx = getCurrentEmployeeSelfContext();
  assert.ok(homeCtx && homeCtx.mode === 'DEDICATED' && homeCtx.employeeCode === '0044', 'Index must resolve dedicated context for vassana');
  assert.equal(requireLoginCalled, false, 'Valid DEDICATED Index must introduce 0 mboLoginGate calls');

  // Corrective A: DEDICATED normal Index renders My MBO container & title
  const dedicatedMyMboContainer = dedicatedHomeHost.querySelector('[data-mbo-custom-index]');
  assert.ok(dedicatedMyMboContainer, 'DEDICATED Index must render My MBO container [data-mbo-custom-index]');
  const dedicatedMyMboTitle = dedicatedHomeHost.querySelector('[data-mbo-title]');
  assert.ok(dedicatedMyMboTitle && dedicatedMyMboTitle.textContent.includes('MBO ของฉัน / My MBO'), 'DEDICATED Index must render My MBO title [data-mbo-title]');

  // 2. DEDICATED Index triggers App794 query with Assignee in (LOGINUSER())
  assert.equal(approvalQueryCount, 1, 'DEDICATED Index must trigger exactly 1 approval task query with Assignee in (LOGINUSER())');

  // 7. Approval Home path introduces 0 App795 queries
  assert.equal(app795QueryCount, 0, 'Approval Home path must introduce 0 App795 queries');

  // 3 & 4. Truthful count (1) rendered; exact vassana task (#901) rendered; mismatching task (#902) not rendered
  const approvalSection = dedicatedHomeHost.querySelector('.mbo-approval-tasks-section');
  assert.ok(approvalSection, 'DEDICATED Index must render .mbo-approval-tasks-section');
  const h2El = approvalSection.querySelector('h2');
  assert.ok(h2El && h2El.textContent.includes('My Approval Tasks (1)'), 'Must display truthful pending count (1)');
  const links = approvalSection.querySelectorAll('a');
  assert.equal(links.length, 1, 'Must render exactly 1 View Record link for authorized task #901');
  assert.equal(links[0].href, '/k/794/show#record=901', 'Task #901 link must point to /k/794/show#record=901');

  // 5. SHARED renders existing My MBO, performs 0 approval queries and has no approval section
  currentMockUser = { code: 'f1', name: 'Shared F1 User' };
  approvalQueryCount = 0;
  const sharedHomeHost = createMockElement('div');
  sharedHomeHost.className = 'gaia-app-wrapper';
  currentActiveHost = sharedHomeHost;

  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));

  // Corrective B: SHARED Index renders My MBO container & title
  const sharedMyMboContainer = sharedHomeHost.querySelector('[data-mbo-custom-index]');
  assert.ok(sharedMyMboContainer, 'SHARED Index must render My MBO container [data-mbo-custom-index]');
  const sharedMyMboTitle = sharedHomeHost.querySelector('[data-mbo-title]');
  assert.ok(sharedMyMboTitle && sharedMyMboTitle.textContent.includes('MBO ของฉัน / My MBO'), 'SHARED Index must render My MBO title [data-mbo-title]');

  const sharedSection = sharedHomeHost.querySelector('.mbo-approval-tasks-section');
  assert.equal(sharedSection, null, 'SHARED mode must NOT render .mbo-approval-tasks-section');
  assert.equal(approvalQueryCount, 0, 'SHARED mode must perform 0 approval task queries');

  // 6. Dedicated approval fetch error preserves My MBO and exposes no actionable task
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  triggerApprovalFetchError = true;
  const errorHomeHost = createMockElement('div');
  errorHomeHost.className = 'gaia-app-wrapper';
  currentActiveHost = errorHomeHost;

  await indexShowHandler({ type: 'app.record.index.show', appId: 794 });
  await new Promise(r => setTimeout(r, 0));

  // Corrective C: DEDICATED approval-fetch error preserves My MBO container & title
  const errorMyMboContainer = errorHomeHost.querySelector('[data-mbo-custom-index]');
  assert.ok(errorMyMboContainer, 'DEDICATED approval-fetch error must preserve My MBO container [data-mbo-custom-index]');
  const errorMyMboTitle = errorHomeHost.querySelector('[data-mbo-title]');
  assert.ok(errorMyMboTitle && errorMyMboTitle.textContent.includes('MBO ของฉัน / My MBO'), 'DEDICATED approval-fetch error must preserve My MBO title [data-mbo-title]');

  const errorSection = errorHomeHost.querySelector('.mbo-approval-tasks-error-state');
  assert.ok(errorSection, 'Approval fetch failure must render error state .mbo-approval-tasks-error-state');
  const errorDiv = errorSection.children.find(c => c.tagName === 'DIV');
  assert.ok(errorDiv && errorDiv.textContent.includes('Unable to load approval tasks'), 'Error state must display error message');
  assert.equal(errorSection.querySelector('table'), null, 'Error state must expose 0 actionable task rows');
  triggerApprovalFetchError = false;

  // 4g-6. D1 Gate 2 Dedicated Cross-Employee Detail Authority assertions
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  requireLoginCalled = false;
  app795QueryCount = 0;
  singleRecordGetCount = 0;
  triggerSingleRecordGetError = false;

  const detailShowHandler = registeredHandlers.get('app.record.detail.show');
  assert.ok(typeof detailShowHandler === 'function', 'Record show handler must be registered');

  // 1. DEDICATED own Detail still opens through existing path and performs 0 approval revalidation GETs
  const ownDetailHost = createMockElement('div');
  ownDetailHost.className = 'gaia-app-wrapper';
  currentActiveHost = ownDetailHost;

  const ownDetailEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: 456,
    record: {
      $id: { value: '456' },
      Employee_Code: { value: '0044' },
      Status: { value: '01 Draft Objective' }
    }
  };
  const ownDetailRes = await detailShowHandler(ownDetailEvent);
  assert.equal(ownDetailRes, ownDetailEvent, 'Own Detail must return event unchanged');
  assert.equal(singleRecordGetCount, 0, 'DEDICATED own Detail must perform 0 approval revalidation GETs');

  // 2 & 3. DEDICATED cross-employee Detail with fresh STATUS_ASSIGNEE containing exact vassana performs 1 fresh GET and preserves bound context
  const { getActiveUiInstance, setCurrentEmployeeSelfContext } = await import('../src/main-mbo-app.js');
  const prevUiInstance = getActiveUiInstance();
  singleRecordGetCount = 0;
  const authorizedCrossDetailHost = createMockElement('div');
  authorizedCrossDetailHost.className = 'gaia-app-wrapper';
  currentActiveHost = authorizedCrossDetailHost;

  const authorizedCrossEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: 901,
    record: {
      $id: { value: '901' },
      Employee_Code: { value: '0118' },
      Status: { value: '02 Waiting Appraiser 1' }
    }
  };
  const authorizedCrossRes = await detailShowHandler(authorizedCrossEvent);
  assert.equal(authorizedCrossRes, authorizedCrossEvent, 'Authorized Dedicated cross-employee Detail must return event unchanged');
  assert.equal(singleRecordGetCount, 1, 'Authorized Dedicated cross-employee Detail must perform exactly 1 fresh GET');

  const activeCrossUiInstance = getActiveUiInstance();
  assert.ok(activeCrossUiInstance, 'Authorized Dedicated cross-employee Detail must create/activate a UI instance');
  assert.notStrictEqual(activeCrossUiInstance, prevUiInstance, 'Authorized Dedicated cross-employee Detail must create a new active UI instance');
  assert.strictEqual(activeCrossUiInstance.record, authorizedCrossEvent.record, 'Active UI instance must be bound to exact target record object');

  const preservedCtx = getCurrentEmployeeSelfContext();
  assert.ok(preservedCtx && preservedCtx.mode === 'DEDICATED' && preservedCtx.employeeCode === '0044' && preservedCtx.kintoneUserCode === 'vassana',
    'Bound Employee-Self context must remain employeeCode = 0044, kintoneUserCode = vassana');

  // 4 & 5. DEDICATED cross-employee Detail with fresh Assignee mismatch is blocked even if static snapshot fields match vassana
  singleRecordGetCount = 0;
  const mismatchDetailHost = createMockElement('div');
  mismatchDetailHost.className = 'gaia-app-wrapper';
  currentActiveHost = mismatchDetailHost;

  const mismatchDetailEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: 902,
    record: {
      $id: { value: '902' },
      Employee_Code: { value: '0118' },
      Status: { value: '02 Waiting Appraiser 1' },
      Manager_User: { value: [{ code: 'vassana' }] },
      First_Manager_User: { value: [{ code: 'vassana' }] },
      GM_User: { value: [{ code: 'vassana' }] }
    }
  };
  const mismatchDetailRes = await detailShowHandler(mismatchDetailEvent);
  assert.equal(mismatchDetailRes, mismatchDetailEvent, 'Blocked Detail handler must return event after hiding native fields');
  assert.equal(singleRecordGetCount, 1, 'Mismatch revalidation must perform exactly 1 fresh GET');
  assert.ok(mismatchDetailHost.children.length > 0, 'Blocked notice must be rendered when Assignee mismatches');
  assert.notStrictEqual(getActiveUiInstance()?.record, mismatchDetailEvent.record, 'Mismatch Detail must NOT enter UI instance bound to target record');

  // 6A. Fresh revalidation API error fails closed
  singleRecordGetCount = 0;
  triggerSingleRecordGetError = true;
  const apiErrorHost = createMockElement('div');
  apiErrorHost.className = 'gaia-app-wrapper';
  currentActiveHost = apiErrorHost;

  const apiErrorEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: 901,
    record: {
      $id: { value: '901' },
      Employee_Code: { value: '0118' },
      Status: { value: '02 Waiting Appraiser 1' }
    }
  };
  await detailShowHandler(apiErrorEvent);
  assert.equal(singleRecordGetCount, 1, 'API error path must attempt 1 fresh GET');
  assert.ok(apiErrorHost.children.length > 0, 'Blocked notice must be rendered on revalidation API error');
  assert.notStrictEqual(getActiveUiInstance()?.record, apiErrorEvent.record, 'API error Detail must NOT enter UI instance bound to target record');
  triggerSingleRecordGetError = false;

  // 6B. Record not found (404) fails closed
  singleRecordGetCount = 0;
  const missingRecordHost = createMockElement('div');
  missingRecordHost.className = 'gaia-app-wrapper';
  currentActiveHost = missingRecordHost;

  const missingRecordEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: 9999,
    record: {
      $id: { value: '9999' },
      Employee_Code: { value: '0118' },
      Status: { value: '02 Waiting Appraiser 1' }
    }
  };
  await detailShowHandler(missingRecordEvent);
  assert.equal(singleRecordGetCount, 1, 'Missing record path must attempt 1 fresh GET');
  assert.ok(missingRecordHost.children.length > 0, 'Blocked notice must be rendered on missing record revalidation');
  assert.notStrictEqual(getActiveUiInstance()?.record, missingRecordEvent.record, 'Missing record Detail must NOT enter UI instance bound to target record');

  // 7. SHARED cross-employee Detail remains blocked and performs 0 approval revalidation GETs
  currentMockUser = { code: 'f1', name: 'Shared F1 User' };
  singleRecordGetCount = 0;
  const sharedCrossDetailHost = createMockElement('div');
  sharedCrossDetailHost.className = 'gaia-app-wrapper';
  currentActiveHost = sharedCrossDetailHost;

  const sharedCrossDetailEvent = {
    type: 'app.record.detail.show',
    appId: 794,
    recordId: 901,
    record: {
      $id: { value: '901' },
      Employee_Code: { value: '0044' },
      Status: { value: '02 Waiting Appraiser 1' }
    }
  };
  await detailShowHandler(sharedCrossDetailEvent);
  assert.equal(singleRecordGetCount, 0, 'SHARED cross-employee Detail must perform 0 approval revalidation GETs');
  assert.ok(sharedCrossDetailHost.children.length > 0, 'Blocked notice must be rendered for SHARED cross-employee Detail');
  assert.notStrictEqual(getActiveUiInstance()?.record, sharedCrossDetailEvent.record, 'SHARED cross-employee Detail must NOT enter UI instance bound to target record');

  // 8. DEDICATED cross-employee Edit remains blocked and performs 0 approval revalidation GETs
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  requireLoginCalled = false;
  singleRecordGetCount = 0;
  const dedicatedCrossEditHost = createMockElement('div');
  dedicatedCrossEditHost.className = 'gaia-app-wrapper';
  currentActiveHost = dedicatedCrossEditHost;

  const editShowHandler = registeredHandlers.get('app.record.edit.show');
  assert.ok(typeof editShowHandler === 'function', 'Record edit show handler must be registered');

  const dedicatedCrossEditEvent = {
    type: 'app.record.edit.show',
    appId: 794,
    recordId: 901,
    record: {
      $id: { value: '901' },
      Employee_Code: { value: '0118' },
      Status: { value: '02 Waiting Appraiser 1' }
    }
  };
  await editShowHandler(dedicatedCrossEditEvent);
  assert.equal(singleRecordGetCount, 0, 'DEDICATED cross-employee Edit must perform 0 approval revalidation GETs');
  assert.ok(dedicatedCrossEditHost.children.length > 0, 'Blocked notice must be rendered for DEDICATED cross-employee Edit');
  assert.notStrictEqual(getActiveUiInstance()?.record, dedicatedCrossEditEvent.record, 'DEDICATED cross-employee Edit must NOT enter UI instance bound to target record');

  // 9. Gate 2 path introduces 0 App795 queries and valid Dedicated path introduces 0 MBO login-gate calls
  assert.equal(app795QueryCount, 0, 'Gate 2 path must introduce 0 App795 queries');
  assert.equal(requireLoginCalled, false, 'Valid Dedicated path must introduce 0 MBO login-gate calls');


  // 4g-7. D1 Gate 3 Process.Proceed Fresh Assignee Revalidation assertions
  const processProceedHandler = registeredHandlers.get('app.record.detail.process.proceed');
  assert.ok(typeof processProceedHandler === 'function', 'Process proceed handler must be registered');

  // 1. DEDICATED own requester action: 0 revalidation GETs, returns event
  setCurrentEmployeeSelfContext({ mode: 'DEDICATED', employeeCode: '0044', kintoneUserCode: 'vassana' });
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  singleRecordGetCount = 0;

  const dedicatedOwnProcRecord = {
    $id: { value: '456' },
    Employee_Code: { value: '0044' },
    Employee_Name: { value: 'Vassana' },
    Fiscal_Year: { value: 'FY2026' },
    Status: { value: '05 Objective Approved' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_User: { value: [{ code: 'vassana' }] },
    GM_User: { value: [{ code: 'gm_user' }] },
    Requester_User: { value: [{ code: 'vassana' }] }
  };
  const dedicatedOwnProcEvent = {
    type: 'app.record.detail.process.proceed',
    appId: 794,
    recordId: 456,
    record: dedicatedOwnProcRecord,
    action: { value: 'Start Mid-Year' }
  };
  const dedicatedOwnProcRes = await processProceedHandler(dedicatedOwnProcEvent);
  assert.equal(dedicatedOwnProcRes, dedicatedOwnProcEvent, 'DEDICATED own requester action must return event');
  assert.equal(singleRecordGetCount, 0, 'DEDICATED own requester action must perform 0 approval revalidation GETs');

  // 2. SHARED own requester action: 0 revalidation GETs, returns event
  setCurrentEmployeeSelfContext({ mode: 'SHARED', employeeCode: '0044', kintoneUserCode: 'f1' });
  currentMockUser = { code: 'f1', name: 'Shared F1 User' };
  singleRecordGetCount = 0;

  const sharedOwnProcRes = await processProceedHandler(dedicatedOwnProcEvent);
  assert.equal(sharedOwnProcRes, dedicatedOwnProcEvent, 'SHARED own requester action must return event');
  assert.equal(singleRecordGetCount, 0, 'SHARED own requester action must perform 0 approval revalidation GETs');

  // 3. DEDICATED cross-employee valid current Assignee: 1 fresh GET, returns event, preserves context
  setCurrentEmployeeSelfContext({ mode: 'DEDICATED', employeeCode: '0044', kintoneUserCode: 'vassana' });
  currentMockUser = { code: 'vassana', name: 'Ms.Vassana Maenthong' };
  singleRecordGetCount = 0;

  const dedicatedCrossProcRecord = {
    $id: { value: '901' },
    Employee_Code: { value: '0118' },
    Employee_Name: { value: 'Somchai' },
    Fiscal_Year: { value: 'FY2026' },
    Status: { value: '03 Manager Objective Review' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_User: { value: [{ code: 'vassana' }] },
    GM_User: { value: [{ code: 'gm_user' }] },
    Requester_User: { value: [{ code: '0118' }] },
    PartA_Weight: { value: '70' },
    PartB_Weight: { value: '30' }
  };
  const dedicatedCrossProcEvent = {
    type: 'app.record.detail.process.proceed',
    appId: 794,
    recordId: 901,
    record: dedicatedCrossProcRecord,
    action: { value: 'Approve Objective' }
  };
  const dedicatedCrossProcRes = await processProceedHandler(dedicatedCrossProcEvent);
  assert.equal(dedicatedCrossProcRes, dedicatedCrossProcEvent, 'Authorized Dedicated cross-employee process proceed must return event');
  assert.equal(singleRecordGetCount, 1, 'Authorized Dedicated cross-employee process proceed must perform exactly 1 fresh GET');
  const preservedProcCtx = getCurrentEmployeeSelfContext();
  assert.ok(preservedProcCtx && preservedProcCtx.mode === 'DEDICATED', 'Bound Employee-Self mode must remain DEDICATED');
  assert.equal(preservedProcCtx.employeeCode, '0044', 'Bound Employee-Self context employeeCode must remain 0044');
  assert.equal(preservedProcCtx.kintoneUserCode, 'vassana', 'Bound Employee-Self context kintoneUserCode must remain vassana');

  // 4. Fresh Assignee mismatch: 1 fresh GET, returns false
  singleRecordGetCount = 0;
  const mismatchProcRecord = {
    $id: { value: '902' },
    Employee_Code: { value: '0118' },
    Status: { value: '02 Waiting Appraiser 1' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_User: { value: [{ code: 'vassana' }] },
    First_Manager_User: { value: [{ code: 'vassana' }] },
    GM_User: { value: [{ code: 'vassana' }] },
    Requester_User: { value: [{ code: '0118' }] },
    PartA_Weight: { value: '70' },
    PartB_Weight: { value: '30' }
  };
  const mismatchProcEvent = {
    type: 'app.record.detail.process.proceed',
    appId: 794,
    recordId: 902,
    record: mismatchProcRecord,
    action: { value: 'Approve Objective' }
  };
  const mismatchProcRes = await processProceedHandler(mismatchProcEvent);
  assert.equal(mismatchProcRes, false, 'Fresh Assignee mismatch process proceed must fail closed (return false)');
  assert.equal(singleRecordGetCount, 1, 'Fresh Assignee mismatch process proceed must perform exactly 1 fresh GET');

  // 5. Fresh revalidation API failure: 1 attempted GET, returns false
  singleRecordGetCount = 0;
  triggerSingleRecordGetError = true;
  const apiErrProcRes = await processProceedHandler(dedicatedCrossProcEvent);
  assert.equal(apiErrProcRes, false, 'Process proceed on API failure must fail closed (return false)');
  assert.equal(singleRecordGetCount, 1, 'API error path must attempt 1 fresh GET');
  triggerSingleRecordGetError = false;

  // 6. Record missing / malformed revalidation result: 1 fresh GET, returns false
  singleRecordGetCount = 0;
  const missingProcRecord = {
    $id: { value: '9999' },
    Employee_Code: { value: '0118' },
    Status: { value: '02 Waiting Appraiser 1' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_User: { value: [{ code: 'vassana' }] },
    GM_User: { value: [{ code: 'gm_user' }] },
    Requester_User: { value: [{ code: '0118' }] },
    PartA_Weight: { value: '70' },
    PartB_Weight: { value: '30' }
  };
  const missingProcEvent = {
    type: 'app.record.detail.process.proceed',
    appId: 794,
    recordId: 9999,
    record: missingProcRecord,
    action: { value: 'Approve Objective' }
  };
  const missingProcRes = await processProceedHandler(missingProcEvent);
  assert.equal(missingProcRes, false, 'Process proceed on missing record must fail closed (return false)');
  assert.equal(singleRecordGetCount, 1, 'Missing record path must attempt 1 fresh GET');

  // 7. Missing record id (spoof/static Record_ID must not be trusted): 0 GETs, returns false
  singleRecordGetCount = 0;
  const noIdProcEvent = {
    type: 'app.record.detail.process.proceed',
    appId: 794,
    record: {
      Employee_Code: { value: '0118' },
      Status: { value: '02 Waiting Appraiser 1' },
      Record_ID: { value: '901' }
    },
    action: { value: 'Approve' }
  };
  const noIdProcRes = await processProceedHandler(noIdProcEvent);
  assert.equal(noIdProcRes, false, 'Process proceed without native recordId must fail closed (return false) even if Record_ID field is present');
  assert.equal(singleRecordGetCount, 0, 'Spoof Record_ID field must perform 0 approval revalidation GETs');

  // 8. SHARED cross-employee action: 0 GETs, returns false
  setCurrentEmployeeSelfContext({ mode: 'SHARED', employeeCode: '0044', kintoneUserCode: 'f1' });
  currentMockUser = { code: 'f1', name: 'Shared F1 User' };
  singleRecordGetCount = 0;
  const sharedCrossProcRes = await processProceedHandler(dedicatedCrossProcEvent);
  assert.equal(sharedCrossProcRes, false, 'SHARED cross-employee process proceed must fail closed (return false)');
  assert.equal(singleRecordGetCount, 0, 'SHARED cross-employee process proceed must perform 0 approval revalidation GETs');

  // 9. No Employee-Self context regression: 0 GETs, returns event
  setCurrentEmployeeSelfContext(null);
  singleRecordGetCount = 0;
  const noCtxProcRes = await processProceedHandler(dedicatedOwnProcEvent);
  assert.equal(noCtxProcRes, dedicatedOwnProcEvent, 'Process proceed with null context must preserve pre-Gate-3 validation/return behavior');
  assert.equal(singleRecordGetCount, 0, 'Null context must perform 0 approval revalidation GETs');

  // 10. Gate 3 introduces 0 App795 queries and 0 login-gate calls
  assert.equal(app795QueryCount, 0, 'Gate 3 path must introduce 0 App795 queries');
  assert.equal(requireLoginCalled, false, 'Gate 3 path must introduce 0 MBO login-gate calls');


  // 4g-2. Finding R1-C: Registered delete event handler blocks for DEDICATED & SHARED context and abstains when null
  const deleteHandler = registeredHandlers.get('app.record.detail.delete.submit');
  assert.ok(typeof deleteHandler === 'function', 'Delete handler must be registered');

  // Active context (DEDICATED) -> Blocked (returns false)
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
  assert.ok(!navSrc.includes('beforeunload'), 'R4_1_NO_REMOVE_BEFOREUNLOAD_NAV: employee-record-navigation.js must NOT contain onbeforeunload');
  assert.ok(!mainSrc.includes('location.assign') && !mainSrc.includes('location.replace') && !mainSrc.includes('history.back'), 'R4_1_NO_HISTORY_HACKS: main-mbo-app.js must NOT use location.assign/replace/history.back');
  assert.ok(!navSrc.includes('location.assign') && !navSrc.includes('location.replace') && !navSrc.includes('history.back'), 'R4_1_NO_HISTORY_HACKS_NAV: employee-record-navigation.js must NOT use location.assign/replace/history.back');
});

test('HR_ADMIN_RUNTIME_MODE: unmapped user with verified HR_ADMIN_GROUP grants HR_ADMIN without Employee ID or Employee-Self UI', async () => {
  const { setCurrentEmployeeSelfContext, getCurrentEmployeeSelfContext, getActiveUiInstance } = await import('../src/main-mbo-app.js');
  const indexHandler = registeredHandlers.get('app.record.index.show');
  const detailHandler = registeredHandlers.get('app.record.detail.show');
  const createHandler = registeredHandlers.get('app.record.create.show');

  const savedGetLoginUser = globalThis.kintone.getLoginUser;
  const savedApi = globalThis.kintone.api;

  // Mock logged-in user = 'hr' (unmapped in App53)
  globalThis.kintone.getLoginUser = () => ({ code: 'hr', name: 'HR Admin' });

  // Mock kintone.api: App53 mapping empty, groups contains HR_ADMIN_GROUP
  globalThis.kintone.api = async (url, method, params) => {
    if (url.includes('/records.json')) {
      return { records: [] }; // App53 mapping empty
    }
    if (url.includes('/user/groups.json')) {
      return { groups: [{ code: 'HR_ADMIN_GROUP', name: 'HR Admin' }] };
    }
    return {};
  };

  setCurrentEmployeeSelfContext(null);
  const indexEvent = { type: 'app.record.index.show' };

  const preUiInstance = getActiveUiInstance();
  const indexRes = await indexHandler(indexEvent);

  assert.equal(indexRes, indexEvent, 'HR_ADMIN on index must return event unchanged');
  const ctx = getCurrentEmployeeSelfContext();
  assert.ok(ctx, 'HR_ADMIN context must be set');
  assert.equal(ctx.mode, 'HR_ADMIN');
  assert.equal(ctx.kintoneUserCode, 'hr');
  assert.equal(ctx.employeeCode, undefined, 'HR_ADMIN must NOT have employeeCode');

  // Verify Employee-Self UI was NOT activated for HR_ADMIN
  const uiInstance = getActiveUiInstance();
  assert.equal(uiInstance, preUiInstance, 'HR_ADMIN index must NOT activate Employee-Self UI');

  // Test Detail View
  const detailEvent = {
    type: 'app.record.detail.show',
    recordId: 12,
    record: {
      $id: { value: '12' },
      Status: { value: '03 Manager Objective Review' },
      Employee_Code: { value: '0113' }
    }
  };
  const detailRes = await detailHandler(detailEvent);
  assert.equal(detailRes, detailEvent, 'HR_ADMIN on detail must return event unchanged without blocking notice');

  // Test Create View (HR_ADMIN is blocked from Create)
  const createEvent = {
    type: 'app.record.create.show',
    record: {}
  };
  const createRes = await createHandler(createEvent);
  assert.equal(createRes, createEvent);

  // Restore mocks
  globalThis.kintone.getLoginUser = savedGetLoginUser;
  globalThis.kintone.api = savedApi;
});

test('HR_ADMIN_RUNTIME_MODE: username "hr" WITHOUT verified HR_ADMIN_GROUP fails closed to DEDICATED_MAPPING_FAILED', async () => {
  const { setCurrentEmployeeSelfContext, getCurrentEmployeeSelfContext } = await import('../src/main-mbo-app.js');
  const indexHandler = registeredHandlers.get('app.record.index.show');

  const savedGetLoginUser = globalThis.kintone.getLoginUser;
  const savedApi = globalThis.kintone.api;

  globalThis.kintone.getLoginUser = () => ({ code: 'hr', name: 'Unverified HR Username' });

  // Mock kintone.api: App53 mapping empty, groups NON-HR
  globalThis.kintone.api = async (url, method, params) => {
    if (url.includes('/records.json')) return { records: [] };
    if (url.includes('/user/groups.json')) return { groups: [{ code: 'ENGINEERING', name: 'Engineering' }] };
    return {};
  };

  setCurrentEmployeeSelfContext(null);
  const indexEvent = { type: 'app.record.index.show' };

  await indexHandler(indexEvent);

  const ctx = getCurrentEmployeeSelfContext();
  assert.equal(ctx, null, 'Unverified username "hr" must NOT receive HR_ADMIN context');

  // Restore mocks
  globalThis.kintone.getLoginUser = savedGetLoginUser;
  globalThis.kintone.api = savedApi;
});

test('HR_ADMIN_RUNTIME_MODE: group lookup error fails closed to DEDICATED_MAPPING_FAILED', async () => {
  const { setCurrentEmployeeSelfContext, getCurrentEmployeeSelfContext } = await import('../src/main-mbo-app.js');
  const indexHandler = registeredHandlers.get('app.record.index.show');

  const savedGetLoginUser = globalThis.kintone.getLoginUser;
  const savedApi = globalThis.kintone.api;

  globalThis.kintone.getLoginUser = () => ({ code: 'hr', name: 'HR User' });

  // Mock kintone.api: App53 mapping empty, group API throws network error
  globalThis.kintone.api = async (url, method, params) => {
    if (url.includes('/records.json')) return { records: [] };
    if (url.includes('/user/groups.json')) throw new Error('Kintone API HTTP 500 Network Failure');
    return {};
  };

  setCurrentEmployeeSelfContext(null);
  const indexEvent = { type: 'app.record.index.show' };

  await indexHandler(indexEvent);

  const ctx = getCurrentEmployeeSelfContext();
  assert.equal(ctx, null, 'Group lookup error must FAIL CLOSED with null Employee-Self context');

  // Restore mocks
  globalThis.kintone.getLoginUser = savedGetLoginUser;
  globalThis.kintone.api = savedApi;
});
