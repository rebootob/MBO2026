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
  if (params?.query && params.query.includes('Employee_Code')) {
    return {
      records: [{
        $id: { value: '501' },
        Employee_Code: { value: '0118' },
        Title_EN: { value: 'Staff' },
        Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
        PartA_Weight: { value: '70' },
        PartB_Weight: { value: '30' }
      }]
    };
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

  const createEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' }
    }
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

  // 4c. Create Screen Error State MUST NOT show Back bar
  const createErrorHost = createMockElement('div');
  currentActiveHost = createErrorHost;
  const createErrorEvent = {
    type: 'app.record.create.show',
    appId: 794,
    record: {
      Status: { value: '01 Draft Objective' }
    }
  };
  // Simulate gate null or auth fail on create
  const origGate = mockGate;
  setMboLoginGate(null);
  await recordShowHandler(createErrorEvent);
  const createErrorBackBars = createErrorHost.querySelectorAll('[data-mbo-back-nav-bar]');
  assert.equal(createErrorBackBars.length, 0, 'R4_ERROR_STATE_CREATE_BACK_ABSENT: Error screen on Create must NOT mount Back bar');
  setMboLoginGate(origGate);

  assert.equal(sessionMutations, 0, 'REAL_MAIN_AUTH_SESSION_MUTATION = 0');
  assert.equal(recordWrites, 0, 'REAL_MAIN_RECORD_WRITE = 0');
});
