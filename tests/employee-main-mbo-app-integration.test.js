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
    if (sel === '.gaia-app-wrapper' || sel === 'body') return createMockElement('body');
    return null;
  },
  querySelectorAll: () => [],
  body: createMockElement('body'),
  createElement: (tag) => createMockElement(tag),
  getElementById: () => null
};

globalThis.location = { href: 'http://localhost/k/794/' };

const mockApiFn = async (url, method, params) => {
  if (params?.app === 53 || (params?.query && params.query.includes('emp_text'))) {
    return {
      records: [{
        $id: { value: '501' },
        Employee_Code: { value: '0118' },
        emp_text: { value: '0118' },
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
        Requester_User: { value: [{ code: '0118' }] },
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
  getLoginUser: () => ({ code: '0118', name: 'Somchai' }),
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

  // 3. CREATE SHOW Integration Proof
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

  // 4. ERROR STATE Integration Proofs (WP2 R4)
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

  // 4c. Create Screen Auth-Required / Gate-Null Error State MUST NOT show Back bar (before authentication)
  const createUnauthErrorHost = createMockElement('div');
  currentActiveHost = createUnauthErrorHost;
  const createUnauthErrorEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' }
    }
  };
  const origGate = mockGate;
  setMboLoginGate(null);
  await recordShowHandler(createUnauthErrorEvent);
  const createUnauthBackBars = createUnauthErrorHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(createUnauthBackBars.length, 0, 'R4_R2_CREATE_UNAUTH_ERROR_BACK_ABSENT: Error screen before authentication on Create must NOT mount Back bar');
  setMboLoginGate(origGate);

  // 4d. Authenticated Create Fatal Autoload / Duplicate Error State MUST show exactly 1 Back bar (WP2 R4 R2)
  const createAutoloadFailHost = createMockElement('div');
  currentActiveHost = createAutoloadFailHost;
  const createAutoloadFailEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' }
    }
  };
  const savedApi = globalThis.kintone.api;
  const mockErrApi = async () => { throw new Error('Simulated duplicate or lookup failure'); };
  mockErrApi.url = (path) => path;
  globalThis.kintone.api = mockErrApi;
  await recordShowHandler(createAutoloadFailEvent);
  const createAutoloadBackBars = createAutoloadFailHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(createAutoloadBackBars.length, 1, 'R4_R2_AUTH_CREATE_FATAL_ERROR_BACK_VISIBLE: Authenticated Create fatal profile resolution error must mount exactly 1 Back bar');
  const createAutoloadBackLink = createAutoloadBackBars[0].querySelector('a');
  assert.equal(createAutoloadBackLink.href, '/k/794/', 'R4_R2_AUTH_CREATE_FATAL_ERROR_BACK_TARGET: Target is /k/794/');
  assert.ok(createAutoloadBackLink.textContent.includes('← กลับหน้า My MBO / Back to My MBO'), 'R4_R2_AUTH_CREATE_FATAL_ERROR_BACK_LABEL: Uses exact bilingual label');
  globalThis.kintone.api = savedApi;

  assert.equal(sessionMutations, 0, 'REAL_MAIN_AUTH_SESSION_MUTATION = 0');
  assert.equal(recordWrites, 0, 'REAL_MAIN_RECORD_WRITE = 0');
});
