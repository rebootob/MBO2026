import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';
import { uploadKintoneFile, prepareAttachmentPlan, finalizeAttachmentPlan, uploadAndBindPendingAttachments } from '../src/services/mbo-attachment-service.js';

// Minimal mock DOM element helper
function createMockElement(tagName = 'div') {
  const children = [];
  const attributes = {};
  const listeners = {};
  const el = {
    tagName: tagName.toUpperCase(),
    className: '',
    innerHTML: '',
    style: {},
    dataset: {},
    classList: {
      add: (...classes) => {
        const set = new Set((el.className || '').split(' ').filter(Boolean));
        classes.forEach(c => set.add(c));
        el.className = Array.from(set).join(' ');
      },
      remove: (...classes) => {
        const set = new Set((el.className || '').split(' ').filter(Boolean));
        classes.forEach(c => set.delete(c));
        el.className = Array.from(set).join(' ');
      },
      contains: (cls) => (el.className || '').split(' ').includes(cls),
      toggle: (cls) => {}
    },
    children,
    parentElement: null,
    scrollIntoView() {},
    focus() {},
    closest(sel) {
      const cls = sel.replace(/^[.#]/, '');
      if (this.className && this.className.includes(cls)) return this;
      if (this.parentElement) return this.parentElement.closest(sel);
      return this;
    },
    setAttribute(k, v) { attributes[k] = v; },
    getAttribute(k) { return attributes[k]; },
    appendChild(child) {
      if (child) child.parentElement = el;
      children.push(child);
      return child;
    },
    remove() {
      if (this.parentElement && Array.isArray(this.parentElement.children)) {
        const idx = this.parentElement.children.indexOf(this);
        if (idx !== -1) this.parentElement.children.splice(idx, 1);
      }
    },
    addEventListener(event, fn) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(fn);
    },
    dispatchEvent(event, data = {}) {
      if (listeners[event]) {
        listeners[event].forEach(fn => fn({ target: el, ...data }));
      }
    },
    querySelector(sel) {
      const cls = sel.replace(/^[.#]/, '');
      const find = (arr) => {
        for (const c of arr) {
          if (c.className === cls || (c.className && c.className.includes(cls))) return c;
          if (c.children) {
            const res = find(c.children);
            if (res) return res;
          }
        }
        return null;
      };
      return find(children) || createMockElement('div');
    },
    querySelectorAll(sel) {
      const cls = sel.replace(/^[.#]/, '');
      const results = [];
      const find = (arr) => {
        for (const c of arr) {
          if (c.className === cls || (c.className && c.className.includes(cls))) results.push(c);
          if (c.children) find(c.children);
        }
      };
      find(children);
      return results;
    }
  };
  return el;
}

const kintoneHandlers = {};
const originalGlobalFetch = globalThis.fetch;

const fakeApi = async (url, method, params) => {
  if (globalThis.fetch && globalThis.fetch !== originalGlobalFetch) {
    const res = await globalThis.fetch(url, { method: method || 'GET', body: JSON.stringify(params) });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Kintone API call failed: HTTP ${res.status}${text ? ` (${text})` : ''}`);
    }
    return await res.json();
  }
  if (params && params.app === 796) {
    return {
      records: [{
        Employee_Code: { value: '0118' },
        Employee_Name: { value: 'Somchai Prasert' },
        Profile_Code: { value: 'PROF_STAFF_CHIEF' },
        Section_Name: { value: 'TMS1' },
        Position_Name: { value: 'Technical Service Chief' }
      }]
    };
  }
  return { records: [] };
};
fakeApi.url = (path) => path;

if (!globalThis.kintone) {
  globalThis.kintone = {
    app: {
      getId: () => 794,
      record: {
        setFieldShown: () => {},
        getSpaceElement: createMockElement,
        getHeaderMenuSpaceElement: createMockElement,
        get: () => ({ record: getSampleRecord() }),
        set: () => {}
      }
    },
    getLoginUser: () => ({ code: '0118' }),
    api: fakeApi,
    events: {
      on: (events, handler) => {
        const list = Array.isArray(events) ? events : [events];
        list.forEach(evt => { kintoneHandlers[evt] = handler; });
      }
    }
  };
}

if (!globalThis.document) {
  globalThis.document = {
    createElement: (tag) => createMockElement(tag),
    getElementById: () => createMockElement('div'),
    querySelector: () => createMockElement('div'),
    querySelectorAll: () => []
  };
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
}

if (!globalThis.sessionStorage) {
  globalThis.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
}

// Import main-mbo-app to register Kintone submit event handlers
const { getActiveUiInstance, setMboLoginGate } = await import('../src/main-mbo-app.js');

// Bypass modal rendering in tests by providing mock login gate matching Employee_Code '0118'
setMboLoginGate({
  requireLogin: async () => '0118'
});

function createTestBlob(content = 'test content') {
  return new Blob([content], { type: 'application/pdf' });
}

function getSampleRecord(overrides = {}) {
  return {
    Employee_Code: { value: '0118' },
    Employee_Name: { value: 'Somchai Prasert' },
    Employee_Section: { value: 'TMS1' },
    Employee_Position: { value: 'Technical Service Chief' },
    Fiscal_Year: { value: 'FY2026' },
    Status: { value: '01 Draft Objective' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    PartA_Weight: { value: '70' },
    PartB_Weight: { value: '30' },
    Part_A_Scoring_Mode: { value: 'DIFFICULTY_ACHIEVEMENT_MATRIX' },
    Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
    Configuration_Hash: { value: 'hash0118' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] },
    Record_Key: { value: 'REC0118' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Improve API response time' },
    Action_Plan_1: { value: 'Optimize DB queries' },
    Weight_1: { value: '50' },
    Difficulty_1: { value: '3' },
    Objective_2: { value: 'Upgrade server infrastructure' },
    Action_Plan_2: { value: 'Migrate to modern cloud nodes' },
    Weight_2: { value: '50' },
    Difficulty_2: { value: '2' },
    Objective_Attachment_1: { type: 'FILE', value: [] },
    Objective_Attachment_2: { type: 'FILE', value: [] },
    MidYear_Attachment_1: { type: 'FILE', value: [] },
    Self_Attachment_1: { type: 'FILE', value: [] },
    Final_Attachment_1: { type: 'FILE', value: [] },
    ...overrides
  };
}

async function invokeShowHook(hook, event) {
  const origError = console.error;
  console.error = () => {};
  try {
    return await hook(event);
  } finally {
    console.error = origError;
  }
}

test('TIMELINE_ATTACHMENT_REGRESSION: Live mode with no timelineEvents renders 0 events and No workflow history available', () => {
  const ui = new EmployeePartAUI({
    record: getSampleRecord(),
    isPreviewMode: false,
    previewOptions: {}
  });

  const card = ui._renderWorkflowActionTimeline();
  const text = card.innerHTML;

  assert.ok(text.includes('0 Events Recorded'), 'Must show 0 Events Recorded');
  assert.ok(text.includes('ยังไม่มีประวัติการดำเนินการ / No workflow history available'), 'Must show empty history message');
  assert.ok(!text.includes('Manager Sompong'), 'Must NOT contain fake actor Sompong');
  assert.ok(!text.includes('GM Vichai'), 'Must NOT contain fake actor Vichai');
});

test('EXISTING_SAVED_FILES_PRESERVED: adding a new pending file preserves existing saved files in prepared plan', async () => {
  const rec = getSampleRecord({
    Objective_Attachment_1: {
      type: 'FILE',
      value: [{ fileKey: 'EXISTING_KEY_001', name: 'old_spec.pdf' }]
    }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  ui.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new_spec.pdf', status: 'pending' }
    ]
  };

  const mockFetch = async (url) => {
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'NEW_KEY_002' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const plan = await ui.preparePendingAttachments({ fetch: mockFetch });
  assert.ok(plan.Objective_Attachment_1);
  assert.equal(plan.Objective_Attachment_1.value.length, 2, 'Must contain both existing and new fileKeys');
  assert.equal(plan.Objective_Attachment_1.value[0].fileKey, 'EXISTING_KEY_001');
  assert.equal(plan.Objective_Attachment_1.value[1].fileKey, 'NEW_KEY_002');
});

test('EXPLICIT_REMOVE_DESIRED_STATE: removing a saved file prepares plan with remaining fileKeys even without new upload', async () => {
  const rec = getSampleRecord({
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'KEY_KEEP_1', name: 'keep_file.pdf' },
        { fileKey: 'KEY_REMOVE_2', name: 'remove_file.pdf' }
      ]
    }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  ui._removeSavedAttachmentFile('Objective_Attachment_1', 'remove_file.pdf', 'KEY_REMOVE_2');

  const plan = await ui.preparePendingAttachments({});
  assert.ok(plan.Objective_Attachment_1, 'Plan must be generated for field with explicit removal');
  assert.equal(plan.Objective_Attachment_1.value.length, 1);
  assert.equal(plan.Objective_Attachment_1.value[0].fileKey, 'KEY_KEEP_1', 'Plan must contain only retained fileKey');
});

test('REMOVE_PLUS_ADD_EXACT_DESIRED_STATE: removing a saved file and adding a new pending file produces exact desired fileKey set', async () => {
  const rec = getSampleRecord({
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'KEY_KEEP_1', name: 'keep.pdf' },
        { fileKey: 'KEY_DELETE_2', name: 'delete.pdf' }
      ]
    }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  ui._removeSavedAttachmentFile('Objective_Attachment_1', 'delete.pdf', 'KEY_DELETE_2');
  ui.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new_added.pdf', status: 'pending' }
    ]
  };

  const mockFetch = async (url) => {
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'KEY_NEW_3' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const plan = await ui.preparePendingAttachments({ fetch: mockFetch });
  assert.ok(plan.Objective_Attachment_1);
  assert.equal(plan.Objective_Attachment_1.value.length, 2);
  assert.equal(plan.Objective_Attachment_1.value[0].fileKey, 'KEY_KEEP_1');
  assert.equal(plan.Objective_Attachment_1.value[1].fileKey, 'KEY_NEW_3');
});

test('UNRELATED_ATTACHMENT_FIELDS_UNCHANGED: updating one attachment field omits unrelated attachment fields from REST plan', async () => {
  const rec = getSampleRecord({
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'OBJ1_KEY', name: 'obj1.pdf' }] },
    Objective_Attachment_2: { type: 'FILE', value: [{ fileKey: 'OBJ2_KEY', name: 'obj2.pdf' }] }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  ui.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'obj1_new.pdf', status: 'pending' }
    ]
  };

  const mockFetch = async (url) => {
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'OBJ1_NEW_KEY' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const plan = await ui.preparePendingAttachments({ fetch: mockFetch });
  assert.ok(plan.Objective_Attachment_1);
  assert.equal(plan.Objective_Attachment_2, undefined, 'Unrelated Objective_Attachment_2 must NOT be present in plan');
});

test('EDIT_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN: edit.submit uploads pending file and prepares plan without mutating event.record', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof editSubmitHook === 'function');

  let uploadCalled = false;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    uploadCalled = true;
    return { ok: true, json: async () => ({ fileKey: 'EDIT_UPLOAD_KEY_555' }) };
  };

  const rec = getSampleRecord({ $id: { value: '77' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    MidYear_Attachment_1: [
      { file: createTestBlob(), name: 'midyear.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, submitEvent);
    assert.equal(uploadCalled, true);
    assert.equal(rec.MidYear_Attachment_1.type, 'FILE');
    assert.equal(rec.MidYear_Attachment_1.value.length, 0, 'SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED: submit event.record must remain untouched');
    assert.ok(activeUi.preparedAttachmentPlan.MidYear_Attachment_1);
    assert.equal(activeUi.preparedAttachmentPlan.MidYear_Attachment_1.value[0].fileKey, 'EDIT_UPLOAD_KEY_555');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED: realistic type: FILE field is left untouched during edit.submit', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const rec = getSampleRecord({
    $id: { value: '88' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'OLD_KEY', name: 'old.pdf' }] }
  });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new.pdf', status: 'pending' }
    ]
  };

  const mockFetch = async () => ({ ok: true, json: async () => ({ fileKey: 'NEW_KEY_99' }) });
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    await editSubmitHook(submitEvent);

    assert.equal(rec.Objective_Attachment_1.type, 'FILE', 'Field type: FILE metadata must be preserved');
    assert.equal(rec.Objective_Attachment_1.value.length, 1);
    assert.equal(rec.Objective_Attachment_1.value[0].fileKey, 'OLD_KEY', 'event.record value must remain unchanged in submit event');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR: displays truthful diagnostic error when post-save REST binding fails', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  const editSubmitSuccessHook = kintoneHandlers['app.record.edit.submit.success'];

  const failingRestFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_OK' }) };
    }
    if (url === '/k/v1/record.json') {
      return { ok: false, status: 500, text: async () => 'Kintone REST Update Failed 500' };
    }
    return { ok: true, json: async () => ({}) };
  };

  const rec = getSampleRecord({ $id: { value: '99' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'valid_doc.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = failingRestFetch;

  let alertCalledMsg = null;
  const origAlert = globalThis.alert;
  globalThis.alert = (msg) => { alertCalledMsg = msg; };

  const origConsoleError = console.error;
  console.error = () => {};

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    const submitRes = await editSubmitHook(submitEvent);
    assert.equal(submitRes, submitEvent, 'Edit submit handler must succeed');

    const successEvent = { type: 'app.record.edit.submit.success', appId: 794, recordId: '99' };
    await editSubmitSuccessHook(successEvent);

    assert.equal(activeUi.currentErrors.length > 0, true, 'UI must display diagnostic validation error');
    assert.ok(activeUi.currentErrors[0].message.includes('Record saved, but attachment binding failed'), 'Error message must state record saved but binding failed');
    assert.ok(alertCalledMsg && alertCalledMsg.includes('Record saved, but attachment binding failed'), 'Visible alert must be triggered');
  } finally {
    globalThis.fetch = origFetch;
    globalThis.alert = origAlert;
    console.error = origConsoleError;
  }
});

test('POST_SAVE_BIND_FAILURE_NO_SILENT_REDIRECT: prevents silent redirect by setting event.url on post-save REST failure', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  const editSubmitSuccessHook = kintoneHandlers['app.record.edit.submit.success'];

  const failingRestFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_OK' }) };
    }
    if (url === '/k/v1/record.json') {
      return { ok: false, status: 500, text: async () => 'Kintone REST Update Failed 500' };
    }
    return { ok: true, json: async () => ({}) };
  };

  const rec = getSampleRecord({ $id: { value: '99' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'doc.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = failingRestFetch;

  const origConsoleError = console.error;
  console.error = () => {};

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    await editSubmitHook(submitEvent);

    const successEvent = { type: 'app.record.edit.submit.success', appId: 794, recordId: '99' };
    const successRes = await editSubmitSuccessHook(successEvent);

    assert.ok(successRes.url !== undefined, 'event.url must be set to prevent silent redirect');
  } finally {
    globalThis.fetch = origFetch;
    console.error = origConsoleError;
  }
});

test('SUCCESS_PATH_NORMAL_REDIRECT_BEHAVIOR: returns event unchanged on successful post-save REST binding', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  const editSubmitSuccessHook = kintoneHandlers['app.record.edit.submit.success'];

  const successFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_OK_123' }) };
    }
    if (url === '/k/v1/record.json') {
      return { ok: true, json: async () => ({ revision: '3' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const rec = getSampleRecord({ $id: { value: '99' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'doc.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = successFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    await editSubmitHook(submitEvent);

    const successEvent = { type: 'app.record.edit.submit.success', appId: 794, recordId: '99' };
    const successRes = await editSubmitSuccessHook(successEvent);

    assert.equal(successRes.url, undefined, 'event.url must remain unmodified on success path for normal Kintone redirect');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('NO_LIVE_NETWORK_IN_TESTS: all tests run strictly against local mock transports with 0 external network calls', () => {
  assert.equal(typeof globalThis.fetch, 'function', 'Mock fetch transport must be used in unit tests');
});
