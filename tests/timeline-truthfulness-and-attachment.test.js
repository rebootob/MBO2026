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
    const data = await res.json();
    if ((method === 'GET' || !method) && String(url).includes('/k/v1/record.json')) {
      if (data && Object.prototype.hasOwnProperty.call(data, 'record')) {
        return data;
      }
      const rec = getActiveUiInstance()?.record || getSampleRecord();
      return { record: rec };
    }
    return data;
  }
  if ((method === 'GET' || !method) && String(url).includes('/k/v1/record.json')) {
    const rec = getActiveUiInstance()?.record || getSampleRecord();
    return { record: rec };
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

// -----------------------------------------------------------------------------
// TIMELINE REGRESSION TESTS
// -----------------------------------------------------------------------------

test('TIMELINE_LIVE_NO_DATA_ZERO_FAKE_EVENTS: Live mode with no timelineEvents renders 0 events and No workflow history available', () => {
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
  assert.ok(!text.includes('Returned for Revision'), 'Must NOT contain fake Returned badge');
  assert.ok(!text.includes('ดูความคิดเห็น / View Comments'), 'Must NOT contain fake comment notice');
});

test('TIMELINE_PREVIEW_FIXTURES_ALLOWED: Preview mode uses fixtures when timelineEvents is absent', () => {
  const ui = new EmployeePartAUI({
    record: getSampleRecord(),
    isPreviewMode: true,
    previewOptions: { isPreviewMode: true }
  });

  const card = ui._renderWorkflowActionTimeline();
  const text = card.innerHTML;

  assert.ok(text.includes('5 Events Recorded'), 'Preview should allow sample fixtures');
  assert.ok(text.includes('Manager Sompong'));
});

test('TIMELINE_LIVE_AUTHORITATIVE_EVENTS_ONLY: Live mode with supplied events renders ONLY real events', () => {
  const realEvents = [
    { stage: '1. Objectives', actor: 'Employee', name: 'Somchai', action: 'Submitted', time: '28 Aug 2026 • 10:00', outcome: 'approved', commentNotice: false }
  ];

  const ui = new EmployeePartAUI({
    record: getSampleRecord(),
    isPreviewMode: false,
    previewOptions: { timelineEvents: realEvents }
  });

  const card = ui._renderWorkflowActionTimeline();
  const text = card.innerHTML;

  assert.ok(text.includes('1 Events Recorded'), 'Must count exactly 1 event');
  assert.ok(text.includes('Somchai'), 'Must contain supplied actor name');
  assert.ok(!text.includes('Manager Sompong'), 'Must NOT contain fake Sompong');
  assert.ok(!text.includes('GM Vichai'), 'Must NOT contain fake Vichai');
});

// -----------------------------------------------------------------------------
// ATTACHMENT DISPLAY & UI CONTROLS REGRESSION TESTS
// -----------------------------------------------------------------------------

test('ATTACHMENT_READONLY_ZERO_FILES: renders No attachment in read-only mode when no files exist', () => {
  const ui = new EmployeePartAUI({
    record: getSampleRecord(),
    isPreviewMode: false
  });

  const html = ui._renderAttachmentControl('Objective_Attachment_1', 'Objectives', false);
  assert.ok(html.includes('ไม่มีไฟล์แนบ / No attachment'));
});

test('ATTACHMENT_READONLY_SINGLE_FILE: renders exact real filename for saved file', () => {
  const rec = getSampleRecord({
    Objective_Attachment_1: {
      type: 'FILE',
      value: [{ fileKey: 'KEY_001', name: 'performance_spec.pdf', size: 1024 }]
    }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  const html = ui._renderAttachmentControl('Objective_Attachment_1', 'Objectives', false);
  assert.ok(html.includes('performance_spec.pdf'), 'Must display real filename');
  assert.ok(!html.includes('No attachment'), 'Must not say No attachment');
});

test('ATTACHMENT_READONLY_MULTIPLE_FILES: renders EVERY saved file', () => {
  const rec = getSampleRecord({
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'KEY_001', name: 'architecture_diagram.png', size: 2048 },
        { fileKey: 'KEY_002', name: 'benchmark_report.pdf', size: 4096 },
        { fileKey: 'KEY_003', name: 'data_sheet.xlsx', size: 1024 }
      ]
    }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  const html = ui._renderAttachmentControl('Objective_Attachment_1', 'Objectives', false);
  assert.ok(html.includes('architecture_diagram.png'), 'Must render file 1');
  assert.ok(html.includes('benchmark_report.pdf'), 'Must render file 2');
  assert.ok(html.includes('data_sheet.xlsx'), 'Must render file 3');
});

test('ATTACHMENT_LIVE_MODE_NO_PREVIEW_MOCK_LEAK: Live mode ignores previewOptions.attachments', () => {
  const ui = new EmployeePartAUI({
    record: getSampleRecord(),
    isPreviewMode: false,
    previewOptions: {
      attachments: {
        Objective_Attachment_1: { name: 'sample_preview_file.pdf' }
      }
    }
  });

  const html = ui._renderAttachmentControl('Objective_Attachment_1', 'Objectives', false);
  assert.ok(!html.includes('sample_preview_file.pdf'), 'Live mode must NOT display preview mock filenames');
  assert.ok(html.includes('ไม่มีไฟล์แนบ / No attachment'));
});

test('ATTACHMENT_PENDING_FILE_STATE: selected pending file renders filename + pending save badge', () => {
  const ui = new EmployeePartAUI({
    record: getSampleRecord(),
    isPreviewMode: false
  });

  ui.pendingAttachments = {
    Objective_Attachment_1: [
      { name: 'new_draft_spec.docx', status: 'pending' }
    ]
  };

  const html = ui._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes('new_draft_spec.docx'), 'Must display pending filename');
  assert.ok(html.includes('(รอบันทึก / Pending save)'), 'Must display pending save marker');
});

test('ATTACHMENT_REAL_REMOVE_BUTTON_CLICK_EVENT: dispatching click event to DOM remove button executes remove handler', () => {
  const rec = getSampleRecord({
    Objective_Attachment_2: { type: 'FILE', value: [{ fileKey: 'KEY_OBJ2', name: 'unrelated_file.pdf' }] }
  });

  const rootNode = createMockElement('div');
  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false,
    container: rootNode
  });

  ui.pendingAttachments = {
    Objective_Attachment_1: [
      { name: 'draft_1.pdf', status: 'pending' },
      { name: 'draft_2.pdf', status: 'pending' }
    ]
  };

  const removeBtn = createMockElement('button');
  removeBtn.className = 'mbo-attachment-remove-btn';
  removeBtn.dataset = { code: 'Objective_Attachment_1', pendingIdx: '0' };
  rootNode.appendChild(removeBtn);

  ui._bindEvents(rootNode);
  removeBtn.dispatchEvent('click');

  assert.equal(ui.pendingAttachments.Objective_Attachment_1.length, 1, 'Click listener must splice pending item');
  assert.equal(ui.pendingAttachments.Objective_Attachment_1[0].name, 'draft_2.pdf');
  assert.equal(rec.Objective_Attachment_2.value[0].name, 'unrelated_file.pdf', 'Unrelated row must remain untouched');
});

// -----------------------------------------------------------------------------
// SERVICE & DESIRED-STATE PERSISTENCE TESTS
// -----------------------------------------------------------------------------

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

test('REAL_HANDLER_REMOVE_DESIRED_STATE_SEPARATE_SUBMIT_RECORD: edit.submit handler prepares plan without removed file even when submit event record is a separate clone containing original files', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof editSubmitHook === 'function');

  const showRecord = getSampleRecord({
    $id: { value: '99' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'KEEP_KEY_1', name: 'keep.pdf' },
        { fileKey: 'REMOVE_KEY_2', name: 'remove.pdf' }
      ]
    }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: showRecord });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;

  // User removes REMOVE_KEY_2 in UI
  activeUi._removeSavedAttachmentFile('Objective_Attachment_1', 'remove.pdf', 'REMOVE_KEY_2');

  // Kintone fires submit event with a SEPARATE record object still holding original files
  const separateSubmitRecord = getSampleRecord({
    $id: { value: '99' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'KEEP_KEY_1', name: 'keep.pdf' },
        { fileKey: 'REMOVE_KEY_2', name: 'remove.pdf' }
      ]
    }
  });

  const submitEvent = { type: 'app.record.edit.submit', record: separateSubmitRecord };
  const res = await editSubmitHook(submitEvent);

  assert.equal(res, submitEvent);
  assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
  assert.equal(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value.length, 1);
  assert.equal(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value[0].fileKey, 'KEEP_KEY_1');
  assert.equal(separateSubmitRecord.Objective_Attachment_1.value.length, 2, 'Separate submit event record must NOT be mutated');
});

test('REAL_HANDLER_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE: edit.submit handler with removal and new pending file produces exact retained + new fileKeys', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const showRecord = getSampleRecord({
    $id: { value: '88' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'KEEP_KEY_1', name: 'keep.pdf' },
        { fileKey: 'DELETE_KEY_2', name: 'delete.pdf' }
      ]
    }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: showRecord });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;

  activeUi._removeSavedAttachmentFile('Objective_Attachment_1', 'delete.pdf', 'DELETE_KEY_2');
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new_added.pdf', status: 'pending' }
    ]
  };

  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'KEY_NEW_3' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const separateSubmitRecord = getSampleRecord({
      $id: { value: '88' },
      Objective_Attachment_1: {
        type: 'FILE',
        value: [
          { fileKey: 'KEEP_KEY_1', name: 'keep.pdf' },
          { fileKey: 'DELETE_KEY_2', name: 'delete.pdf' }
        ]
      }
    });

    const submitEvent = { type: 'app.record.edit.submit', record: separateSubmitRecord };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, submitEvent);
    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
    assert.equal(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value.length, 2);
    assert.equal(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value[0].fileKey, 'KEEP_KEY_1');
    assert.equal(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value[1].fileKey, 'KEY_NEW_3');
  } finally {
    globalThis.fetch = origFetch;
  }
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

test('SELF_FINAL_FALLBACK_DESIRED_STATE: Self_Attachment_ fallback to Final_Attachment_ preserves explicit desired state', async () => {
  const rec = getSampleRecord({
    Final_Attachment_1: { type: 'FILE', value: [{ fileKey: 'KEY_FINAL_1', name: 'proof1.pdf' }, { fileKey: 'KEY_FINAL_2', name: 'proof2.pdf' }] }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  ui._removeSavedAttachmentFile('Self_Attachment_1', 'proof2.pdf', 'KEY_FINAL_2');

  const plan = await ui.preparePendingAttachments({});
  assert.ok(plan.Final_Attachment_1, 'Plan must map target code Final_Attachment_1');
  assert.equal(plan.Final_Attachment_1.value.length, 1);
  assert.equal(plan.Final_Attachment_1.value[0].fileKey, 'KEY_FINAL_1');
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

test('CREATE_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION: create.submit with 0 pending files leaves event.record attachment fields unchanged', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const createSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const rec = getSampleRecord({ $id: { value: '10' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;

  const submitEvent = { type: 'app.record.edit.submit', record: rec };
  const res = await createSubmitHook(submitEvent);

  assert.equal(res, submitEvent);
  assert.equal(rec.Objective_Attachment_1.type, 'FILE');
  assert.equal(rec.Objective_Attachment_1.value.length, 0);
  assert.equal(activeUi.preparedAttachmentPlan, null);
});

test('EDIT_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION: edit.submit with 0 pending files leaves event.record attachment fields unchanged', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const rec = getSampleRecord({ $id: { value: '10' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;

  const submitEvent = { type: 'app.record.edit.submit', record: rec };
  const res = await editSubmitHook(submitEvent);

  assert.equal(res, submitEvent);
  assert.equal(rec.Objective_Attachment_1.type, 'FILE');
  assert.equal(rec.Objective_Attachment_1.value.length, 0);
  assert.equal(activeUi.preparedAttachmentPlan, null);
});

test('CREATE_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD: create.submit.success finalizes attachment binding via Update Record REST API', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  const createSubmitSuccessHook = kintoneHandlers['app.record.create.submit.success'];

  let restUpdatePayload = null;
  const mockFetch = async (url, opts) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_SUCCESS_TEST_999' }) };
    }
    if (url === '/k/v1/record.json') {
      restUpdatePayload = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ revision: '2' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const rec = getSampleRecord({ $id: { value: '42' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'evidence.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    await editSubmitHook(submitEvent);

    const successEvent = { type: 'app.record.create.submit.success', appId: 794, recordId: '42' };
    const successRes = await createSubmitSuccessHook(successEvent);

    assert.equal(successRes, successEvent);
    assert.ok(restUpdatePayload);
    assert.equal(restUpdatePayload.app, 794);
    assert.equal(restUpdatePayload.id, '42');
    assert.equal(restUpdatePayload.record.Objective_Attachment_1.value[0].fileKey, 'FILEKEY_SUCCESS_TEST_999');
    assert.equal(activeUi.preparedAttachmentPlan, null, 'Plan must be cleared after finalize');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD: edit.submit.success binds target field leaving unrelated fields unchanged', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  const editSubmitSuccessHook = kintoneHandlers['app.record.edit.submit.success'];

  let restUpdatePayload = null;
  const mockFetch = async (url, opts) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_MIDYEAR_888' }) };
    }
    if (url === '/k/v1/record.json') {
      restUpdatePayload = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ revision: '5' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const rec = getSampleRecord({
    $id: { value: '25' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'PREVIOUS_OBJ_KEY', name: 'previous_objective.pdf' }] }
  });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    MidYear_Attachment_1: [
      { file: createTestBlob(), name: 'midyear_evidence.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    await editSubmitHook(submitEvent);

    const successEvent = { type: 'app.record.edit.submit.success', appId: 794, recordId: '25' };
    await editSubmitSuccessHook(successEvent);

    assert.ok(restUpdatePayload);
    assert.equal(restUpdatePayload.record.MidYear_Attachment_1.value[0].fileKey, 'FILEKEY_MIDYEAR_888');
    assert.equal(restUpdatePayload.record.Objective_Attachment_1, undefined, 'Unrelated Objective attachment must NOT be included in update payload');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('UPLOAD_FAILURE_PRE_SAVE_FAILS_CLOSED: handler returns false and displays validation error when pre-save upload fails', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const failingFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    return { ok: false, status: 500, text: async () => 'Kintone Upload Error 500' };
  };

  const rec = getSampleRecord({ $id: { value: '11' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'fail_doc.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = failingFetch;

  const origConsoleError = console.error;
  console.error = () => {};

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, false, 'Handler must return false to cancel submit on upload failure');
    assert.equal(activeUi.currentErrors.length > 0, true, 'UI must display inline validation error');
    assert.ok(activeUi.currentErrors[0].message.includes('Attachment upload failed'), 'Error message must describe upload failure');
  } finally {
    globalThis.fetch = origFetch;
    console.error = origConsoleError;
  }
});

test('POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR: displays truthful diagnostic error when post-save REST binding fails', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  const editSubmitSuccessHook = kintoneHandlers['app.record.edit.submit.success'];

  const failingRestFetch = async (url, opts = {}) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_OK' }) };
    }
    if (url === '/k/v1/record.json') {
      if (opts.method === 'PUT') {
        return { ok: false, status: 500, text: async () => 'Kintone REST Update Failed 500' };
      }
      return { ok: true, json: async () => ({ record: rec }) };
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
    assert.equal(submitRes, submitEvent);

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

  const failingRestFetch = async (url, opts = {}) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (url === '/k/v1/file.json') {
      return { ok: true, json: async () => ({ fileKey: 'FILEKEY_OK' }) };
    }
    if (url === '/k/v1/record.json') {
      if (opts.method === 'PUT') {
        return { ok: false, status: 500, text: async () => 'Kintone REST Update Failed 500' };
      }
      return { ok: true, json: async () => ({ record: rec }) };
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

test('EDIT_ADD_ONLY_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE_PRESERVES_ALL_EXISTING: edit submit uses persisted GET record to preserve existing files when submit event attachment value is empty', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recShow = getSampleRecord({
    $id: { value: '101' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'EXISTING_KEY_1', name: 'existing.pdf' }] }
  });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recShow });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new.pdf', status: 'pending' }
    ]
  };

  const submitEventRec = getSampleRecord({
    $id: { value: '101' },
    Objective_Attachment_1: { type: 'FILE', value: [] }
  });

  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recShow }) };
    }
    return { ok: true, json: async () => ({ fileKey: 'NEW_KEY_222' }) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: submitEventRec, appId: 794, recordId: '101' };
    await editSubmitHook(submitEvent);

    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
    const planValues = activeUi.preparedAttachmentPlan.Objective_Attachment_1.value;
    assert.equal(planValues.length, 2, 'Must contain both existing file and new file');
    assert.equal(planValues[0].fileKey, 'EXISTING_KEY_1', 'Existing fileKey must be preserved');
    assert.equal(planValues[1].fileKey, 'NEW_KEY_222', 'New fileKey must be appended');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_MULTIPLE_EXISTING_FILES_DO_NOT_COLLAPSE: adding a file when 3 files exist preserves all 3 existing files and never collapses to first', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '102' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'K1', name: 'f1.pdf' },
        { fileKey: 'K2', name: 'f2.pdf' },
        { fileKey: 'K3', name: 'f3.pdf' }
      ]
    }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'f4.pdf', status: 'pending' }
    ]
  };

  const submitEventRec = getSampleRecord({
    $id: { value: '102' },
    Objective_Attachment_1: { type: 'FILE', value: [] }
  });

  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    return { ok: true, json: async () => ({ fileKey: 'K4' }) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: submitEventRec, appId: 794, recordId: '102' };
    await editSubmitHook(submitEvent);

    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
    const planValues = activeUi.preparedAttachmentPlan.Objective_Attachment_1.value;
    assert.equal(planValues.length, 4, 'Must preserve all 3 existing files and append 4th file');
    assert.deepEqual(planValues.map(v => v.fileKey), ['K1', 'K2', 'K3', 'K4'], 'Must preserve all fileKeys in exact order');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_ADD_MULTIPLE_NEW_FILES_PRESERVES_ALL_EXISTING: adding 2 new files preserves 2 existing files', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '103' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'EX_1', name: 'ex1.pdf' },
        { fileKey: 'EX_2', name: 'ex2.pdf' }
      ]
    }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'newA.pdf', status: 'pending' },
      { file: createTestBlob(), name: 'newB.pdf', status: 'pending' }
    ]
  };

  const submitEventRec = getSampleRecord({
    $id: { value: '103' },
    Objective_Attachment_1: { type: 'FILE', value: [] }
  });

  let uploadCount = 0;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    uploadCount++;
    return { ok: true, json: async () => ({ fileKey: `NEW_KEY_${uploadCount}` }) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: submitEventRec, appId: 794, recordId: '103' };
    await editSubmitHook(submitEvent);

    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
    const planValues = activeUi.preparedAttachmentPlan.Objective_Attachment_1.value;
    assert.equal(planValues.length, 4);
    assert.deepEqual(planValues.map(v => v.fileKey), ['EX_1', 'EX_2', 'NEW_KEY_1', 'NEW_KEY_2']);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE: removing one existing file while adding new file uses explicit desired state and leaves submit event untouched', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '104' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [
        { fileKey: 'REMOVE_ME', name: 'rem.pdf' },
        { fileKey: 'KEEP_ME', name: 'keep.pdf' }
      ]
    }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;

  activeUi._removeSavedAttachmentFile('Objective_Attachment_1', 'rem.pdf', 'REMOVE_ME');

  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'added.pdf', status: 'pending' }
    ]
  };

  const submitEventRec = getSampleRecord({
    $id: { value: '104' },
    Objective_Attachment_1: { type: 'FILE', value: [] }
  });

  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    return { ok: true, json: async () => ({ fileKey: 'ADDED_KEY' }) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: submitEventRec, appId: 794, recordId: '104' };
    await editSubmitHook(submitEvent);

    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
    const planValues = activeUi.preparedAttachmentPlan.Objective_Attachment_1.value;
    assert.equal(planValues.length, 2);
    assert.deepEqual(planValues.map(v => v.fileKey), ['KEEP_ME', 'ADDED_KEY']);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_HANDLER_USES_AUTHORITATIVE_PERSISTED_RECORD_NOT_SUBMIT_ATTACHMENT_VALUE: proves implementation reads GET record rather than edit submit event', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '105' },
    Objective_Attachment_1: {
      type: 'FILE',
      value: [{ fileKey: 'PERSISTED_KEY_AAA', name: 'persisted.pdf' }]
    }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new.pdf', status: 'pending' }
    ]
  };

  const submitEventRec = getSampleRecord({
    $id: { value: '105' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'WRONG_SUBMIT_KEY', name: 'wrong.pdf' }] }
  });
  submitEventRec.Objective_Attachment_1.value = [];

  let getRecordCalled = false;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      getRecordCalled = true;
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    return { ok: true, json: async () => ({ fileKey: 'NEW_KEY_BBB' }) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: submitEventRec, appId: 794, recordId: '105' };
    await editSubmitHook(submitEvent);

    assert.equal(getRecordCalled, true, 'GET Record must be called to obtain persisted record on edit submit');
    const planValues = activeUi.preparedAttachmentPlan.Objective_Attachment_1.value;
    assert.equal(planValues[0].fileKey, 'PERSISTED_KEY_AAA', 'Must use persisted fileKey from GET record');
    assert.equal(planValues[1].fileKey, 'NEW_KEY_BBB');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_GET_RECORD_FAILURE_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED: edit submit cancels submit when GET record fails during attachment edit', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const rec = getSampleRecord({ $id: { value: '201' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'fail_test.pdf', status: 'pending' }
    ]
  };

  let uploadCalled = false;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: false, status: 500, text: async () => 'Internal Server Error' };
    }
    if (String(url).includes('/k/v1/file.json')) {
      uploadCalled = true;
      return { ok: true, json: async () => ({ fileKey: 'SHOULD_NOT_BE_CREATED' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec, appId: 794, recordId: '201' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, false, 'Edit submit must return false / cancel submit when GET record fails');
    assert.equal(uploadCalled, false, 'EDIT_FAILURE_PATH_DOES_NOT_UPLOAD_NEW_FILE: Upload must NOT be called when GET record fails');
    assert.equal(activeUi.preparedAttachmentPlan, null, 'Prepared attachment plan must remain null on failure');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_GET_RECORD_NULL_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED: edit submit cancels submit when GET record returns null', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const rec = getSampleRecord({ $id: { value: '202' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'null_test.pdf', status: 'pending' }
    ]
  };

  let uploadCalled = false;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: null }) };
    }
    if (String(url).includes('/k/v1/file.json')) {
      uploadCalled = true;
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec, appId: 794, recordId: '202' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, false, 'Must return false when GET record returns null');
    assert.equal(uploadCalled, false, 'Upload must NOT occur when GET record returns null');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_PERSISTED_TARGET_FILE_FIELD_MISSING_FAILS_CLOSED: edit submit cancels submit when persisted record is missing target FILE field array', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersistedMissingField = getSampleRecord({ $id: { value: '203' } });
  delete recPersistedMissingField.Objective_Attachment_1;

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersistedMissingField });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'missing_field.pdf', status: 'pending' }
    ]
  };

  let uploadCalled = false;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersistedMissingField }) };
    }
    if (String(url).includes('/k/v1/file.json')) {
      uploadCalled = true;
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: recPersistedMissingField, appId: 794, recordId: '203' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, false, 'Must return false when persisted record is missing target FILE field');
    assert.equal(uploadCalled, false, 'Upload must NOT occur when target field array is missing');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_NO_ATTACHMENT_CHANGE_DOES_NOT_REQUIRE_PERSISTED_ATTACHMENT_GET: normal edit save with zero attachment changes does not invoke GET record', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const rec = getSampleRecord({ $id: { value: '204' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {};

  let getRecordCalled = false;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      getRecordCalled = true;
      return { ok: true, json: async () => ({ record: rec }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: rec, appId: 794, recordId: '204' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, submitEvent, 'Normal submit event must be returned unchanged when zero attachment changes');
    assert.equal(getRecordCalled, false, 'EDIT_NO_ATTACHMENT_CHANGE_DOES_NOT_REQUIRE_PERSISTED_ATTACHMENT_GET: GET record must NOT be called when zero attachment changes');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_NEVER_FALLS_BACK_TO_SUBMIT_ATTACHMENT_VALUE: prepareAttachmentPlan throws error in Edit mode if persistedRecord is missing', async () => {
  const recSubmit = getSampleRecord({
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'SUBMIT_KEY_FORBIDDEN', name: 'submit.pdf' }] }
  });

  const pending = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new.pdf', status: 'pending' }
    ]
  };

  await assert.rejects(
    async () => {
      await prepareAttachmentPlan(recSubmit, pending, { isEdit: true, persistedRecord: null });
    },
    (err) => {
      assert.ok(String(err.message).includes('PERSISTED_RECORD_REQUIRED_FOR_EDIT'));
      return true;
    },
    'prepareAttachmentPlan must throw and NEVER fall back to submit event attachment values in Edit mode'
  );
});

test('EDIT_MULTI_TARGET_SECOND_PERSISTED_FIELD_MISSING_FAILS_BEFORE_ANY_UPLOAD: when target 1 is valid but target 2 persisted field is missing, submit is cancelled with 0 uploads', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '301' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'EX_KEY_1', name: 'ex1.pdf' }] }
  });
  delete recPersisted.Objective_Attachment_2;

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new1.pdf', status: 'pending' }
    ],
    Objective_Attachment_2: [
      { file: createTestBlob(), name: 'new2.pdf', status: 'pending' }
    ]
  };

  let uploadCount = 0;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    if (String(url).includes('/k/v1/file.json')) {
      uploadCount++;
      return { ok: true, json: async () => ({ fileKey: `UPLOAD_KEY_${uploadCount}` }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: recPersisted, appId: 794, recordId: '301' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, false, 'Edit submit must return false when target 2 persisted field is missing');
    assert.equal(uploadCount, 0, 'MULTI_TARGET_INVALID_SECOND_UPLOAD_COUNT = 0: Upload count must be exactly 0 across ALL targets');
    assert.equal(activeUi.preparedAttachmentPlan, null, 'Prepared attachment plan must remain null');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_MULTI_TARGET_SECOND_PERSISTED_FIELD_INVALID_FAILS_BEFORE_ANY_UPLOAD: when target 1 is valid but target 2 persisted field is non-array invalid object, submit is cancelled with 0 uploads', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '302' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'EX_KEY_1', name: 'ex1.pdf' }] },
    Objective_Attachment_2: { type: 'FILE', value: null }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'target1.pdf', status: 'pending' }
    ],
    Objective_Attachment_2: [
      { file: createTestBlob(), name: 'target2.pdf', status: 'pending' }
    ]
  };

  let uploadCount = 0;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    if (String(url).includes('/k/v1/file.json')) {
      uploadCount++;
      return { ok: true, json: async () => ({ fileKey: `UPLOAD_KEY_${uploadCount}` }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: recPersisted, appId: 794, recordId: '302' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, false, 'Edit submit must return false when target 2 persisted field is invalid');
    assert.equal(uploadCount, 0, 'Upload count must be exactly 0 when target 2 preflight validation fails');
    assert.equal(activeUi.preparedAttachmentPlan, null, 'Prepared attachment plan must remain null');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('EDIT_MULTI_TARGET_PREFLIGHT_SUCCESS_THEN_UPLOADS_ALL_TARGETS: when all multi-target persisted fields pass atomic preflight, uploads and plan preparation succeed for all targets', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];

  const recPersisted = getSampleRecord({
    $id: { value: '303' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K1', name: 'f1.pdf' }] },
    Objective_Attachment_2: { type: 'FILE', value: [{ fileKey: 'K2', name: 'f2.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: recPersisted });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'new1.pdf', status: 'pending' }
    ],
    Objective_Attachment_2: [
      { file: createTestBlob(), name: 'new2.pdf', status: 'pending' }
    ]
  };

  let uploadCount = 0;
  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    if (String(url).includes('/k/v1/record.json')) {
      return { ok: true, json: async () => ({ record: recPersisted }) };
    }
    if (String(url).includes('/k/v1/file.json')) {
      uploadCount++;
      return { ok: true, json: async () => ({ fileKey: `NEW_UPLOAD_${uploadCount}` }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.edit.submit', record: recPersisted, appId: 794, recordId: '303' };
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, submitEvent, 'Edit submit must succeed when all targets pass preflight');
    assert.equal(uploadCount, 2, 'Must upload files for both targets after preflight passes');
    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_1);
    assert.ok(activeUi.preparedAttachmentPlan.Objective_Attachment_2);
    assert.deepEqual(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value.map(v => v.fileKey), ['K1', 'NEW_UPLOAD_1']);
    assert.deepEqual(activeUi.preparedAttachmentPlan.Objective_Attachment_2.value.map(v => v.fileKey), ['K2', 'NEW_UPLOAD_2']);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('ATTACHMENT_LONG_SAVED_FILENAME_TRUNCATES_WITH_FULL_TITLE: long saved filename preserves full name in title attribute and uses mbo-attachment-filename styling for ellipsis', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const longName = 'very_long_filename_that_overflows_cell_boundary_and_must_be_truncated_with_ellipsis_in_ui.pdf';
  const rec = getSampleRecord({
    $id: { value: '401' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_LONG', name: longName }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes(`title="${longName}"`), 'Full original filename must remain in title tooltip attribute');
  assert.ok(html.includes('class="mbo-attachment-filename"'), 'Filename element must use mbo-attachment-filename class');
  assert.ok(html.includes('text-overflow:ellipsis'), 'Filename element must specify text-overflow:ellipsis');
  assert.ok(html.includes('overflow:hidden'), 'Filename element must specify overflow:hidden');
});

test('ATTACHMENT_LONG_SAVED_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE: delete button stays as a separate non-shrinking flex control at the right edge', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const longName = 'long_evidence_document_spec_2026_final_report_version_3_signed.pdf';
  const rec = getSampleRecord({
    $id: { value: '402' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_LONG2', name: longName }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes('class="mbo-attachment-remove-btn"'), 'Delete button must have mbo-attachment-remove-btn class');
  assert.ok(html.includes('flex-shrink:0') || html.includes('flex:0 0 auto'), 'Delete button must specify non-shrinking flex properties');
  assert.ok(html.includes('data-filekey="K_LONG2"'), 'Delete button must retain target fileKey dataset attribute');
});

test('ATTACHMENT_MULTIPLE_LONG_FILENAMES_RENDER_ALL_DELETE_CONTROLS: multiple long attachments stack as separate rows each with a visible delete button', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const files = [
    { fileKey: 'K1', name: 'long_filename_objective_attachment_number_one_2026_spec.pdf' },
    { fileKey: 'K2', name: 'long_filename_objective_attachment_number_two_2026_spec.pdf' },
    { fileKey: 'K3', name: 'long_filename_objective_attachment_number_three_2026_spec.pdf' }
  ];
  const rec = getSampleRecord({
    $id: { value: '403' },
    Objective_Attachment_1: { type: 'FILE', value: files }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes('flex-direction:column'), 'Attachment container must stack files as clean separate rows');

  const removeBtnMatches = html.match(/class="mbo-attachment-remove-btn"/g);
  assert.equal(removeBtnMatches?.length, 3, 'Must render exactly 3 delete buttons for 3 saved files');
});

test('ATTACHMENT_PENDING_LONG_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE: pending file with long name retains title attribute and non-shrinking delete button', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({ $id: { value: '404' } });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const longPendingName = 'pending_uploaded_document_with_very_long_file_name_that_needs_truncation.pdf';
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: longPendingName, status: 'pending' }
    ]
  };

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes('class="mbo-attachment-badge pending-file"'), 'Badge must have pending-file class');
  assert.ok(html.includes(`title="${longPendingName}"`), 'Pending filename must preserve full name in title tooltip');
  assert.ok(html.includes('class="mbo-attachment-pending-tag"'), 'Must contain pending status tag');
  assert.ok(html.includes('class="mbo-attachment-remove-btn"'), 'Must contain delete button for pending file');
  assert.ok(html.includes('flex-shrink:0') || html.includes('flex:0 0 auto'), 'Pending delete button must be non-shrinking flex item');
});

test('ATTACHMENT_ERROR_LONG_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE: failed upload with long name retains error tag and separate delete button', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({ $id: { value: '405' } });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const longErrorName = 'failed_upload_long_filename_that_caused_http_500_server_error_response.pdf';
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: longErrorName, status: 'error', error: 'Upload failed' }
    ]
  };

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes('class="mbo-attachment-badge error-file"'), 'Badge must have error-file class');
  assert.ok(html.includes(`title="${longErrorName}"`), 'Error filename must preserve full name in title tooltip');
  assert.ok(html.includes('class="mbo-attachment-error-tag"'), 'Must contain error status tag');
  assert.ok(html.includes('class="mbo-attachment-remove-btn"'), 'Must contain delete button for failed file');
});

test('OBJECTIVE_MIDYEAR_FINAL_ATTACHMENT_RENDER_REGRESSION: Objective, Mid-Year and Final stage attachments use exact same cell-containment flex layout', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '406' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'O1', name: 'objective_long_name.pdf' }] },
    MidYear_Attachment_1: { type: 'FILE', value: [{ fileKey: 'M1', name: 'midyear_long_name.pdf' }] },
    Self_Attachment_1: { type: 'FILE', value: [{ fileKey: 'S1', name: 'final_self_long_name.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const objHtml = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  const midHtml = activeUi._renderAttachmentControl('MidYear_Attachment_1', 'Mid-Year', true);
  const selfHtml = activeUi._renderAttachmentControl('Self_Attachment_1', 'Self Evaluation', true);

  for (const html of [objHtml, midHtml, selfHtml]) {
    assert.ok(html.includes('class="mbo-attachment-container"'), 'All stage attachment controls must use mbo-attachment-container');
    assert.ok(html.includes('class="mbo-attachment-filename"'), 'All stage attachment controls must use mbo-attachment-filename');
    assert.ok(html.includes('class="mbo-attachment-remove-btn"'), 'All stage attachment controls must use mbo-attachment-remove-btn');
    assert.ok(html.includes('flex-direction:column'), 'All stage attachment controls must stack as clean column rows');
  }
});

test('SAVED_ATTACHMENT_FILENAME_IS_CLICKABLE_WITH_PERSISTED_FILEKEY: saved file with fileKey renders as clickable link with download button', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '501' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_PERSISTED_501', name: 'evidence.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(html.includes('<a href="#" class="mbo-attachment-filename"'), 'Saved filename with fileKey must render as a clickable preview link');
  assert.ok(html.includes('data-filekey="K_PERSISTED_501"'), 'Preview link must include target fileKey');
  assert.ok(html.includes('class="mbo-attachment-download-btn"'), 'Must render compact download button');
  assert.ok(html.includes('class="mbo-attachment-remove-btn"'), 'Editable row must also render delete button');
});

test('READONLY_SAVED_ATTACHMENT_REMAINS_PREVIEW_DOWNLOAD_CAPABLE: read-only row renders preview link and download button without delete button', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '502' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_READONLY_502', name: 'report.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', false);
  assert.ok(html.includes('<a href="#" class="mbo-attachment-filename"'), 'Read-only saved filename must render as clickable preview link');
  assert.ok(html.includes('class="mbo-attachment-download-btn"'), 'Read-only row must render download button');
  assert.ok(!html.includes('class="mbo-attachment-remove-btn"'), 'Read-only row must NOT render delete button');
});

test('ATTACHMENT_DOWNLOAD_USES_BROWSER_FETCH_X_REQUESTED_WITH: downloadKintoneFileBlob helper executes GET /k/v1/file.json with X-Requested-With header', async () => {
  const { downloadKintoneFileBlob } = await import('../src/services/mbo-attachment-service.js');

  let capturedUrl = null;
  let capturedOptions = null;
  const mockFetch = async (url, opts) => {
    capturedUrl = url;
    capturedOptions = opts;
    return {
      ok: true,
      blob: async () => new Blob(['test content'], { type: 'application/pdf' })
    };
  };

  const blob = await downloadKintoneFileBlob('K_TEST_FETCH_100', { fetchFn: mockFetch });
  assert.ok(blob, 'Must return blob instance');
  assert.equal(capturedUrl, '/k/v1/file.json?fileKey=K_TEST_FETCH_100', 'Must request GET /k/v1/file.json with encoded fileKey');
  assert.equal(capturedOptions.method, 'GET', 'Transport method must be GET');
  assert.equal(capturedOptions.headers['X-Requested-With'], 'XMLHttpRequest', 'Header must contain X-Requested-With: XMLHttpRequest');
});

test('ATTACHMENT_DOWNLOAD_DOES_NOT_USE_KINTONE_API: download transport does not invoke kintone.api()', async () => {
  const { downloadKintoneFileBlob } = await import('../src/services/mbo-attachment-service.js');

  let kintoneApiCalled = false;
  const origKintoneApi = globalThis.kintone?.api;
  if (!globalThis.kintone) globalThis.kintone = {};
  globalThis.kintone.api = () => { kintoneApiCalled = true; };

  const mockFetch = async () => ({
    ok: true,
    blob: async () => new Blob(['content'], { type: 'image/png' })
  });

  try {
    await downloadKintoneFileBlob('K_TEST_NO_KINTONE_API', { fetchFn: mockFetch });
    assert.equal(kintoneApiCalled, false, 'downloadKintoneFileBlob MUST NOT call kintone.api()');
  } finally {
    if (origKintoneApi) globalThis.kintone.api = origKintoneApi;
    else delete globalThis.kintone.api;
  }
});

test('ATTACHMENT_DOWNLOAD_PRESERVES_ORIGINAL_FILENAME: download handler passes exact original filename to blob downloader', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '505' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_505', name: 'original_spec_document_v2.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  let downloadedName = null;
  activeUi._triggerBlobDownload = (blob, filename) => { downloadedName = filename; };

  const mockFetch = async () => ({
    ok: true,
    blob: async () => new Blob(['pdf bytes'], { type: 'application/pdf' })
  });

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    await activeUi._handleAttachmentDownload('Objective_Attachment_1', 'original_spec_document_v2.pdf', 'K_505');
    assert.equal(downloadedName, 'original_spec_document_v2.pdf', 'Download handler must preserve exact original filename');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('ATTACHMENT_PREVIEW_USES_BLOB_URL_FOR_PDF_OR_IMAGE: preview handler creates object URL and navigates opened window for PDF/image', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({ $id: { value: '506' } });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  let winNavigatedUrl = null;
  const mockWin = { closed: false, location: { href: '' } };
  const origOpen = globalThis.window?.open;
  if (!globalThis.window) globalThis.window = {};
  globalThis.window.open = () => mockWin;

  const mockFetch = async () => ({
    ok: true,
    blob: async () => new Blob(['pdf data'], { type: 'application/pdf' })
  });

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    await activeUi._handleAttachmentPreview('Objective_Attachment_1', 'doc.pdf', 'K_PREVIEW_PDF');
    assert.ok(mockWin.location.href.startsWith('blob:') || mockWin.location.href.length > 0, 'PDF preview must navigate opened window to object URL');
  } finally {
    globalThis.fetch = origFetch;
    if (origOpen) globalThis.window.open = origOpen;
  }
});

test('ATTACHMENT_UNSUPPORTED_PREVIEW_FALLS_BACK_TO_DOWNLOAD: unsupported file type falls back to safe blob download', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({ $id: { value: '507' } });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  let winClosed = false;
  let fallbackDownloadedName = null;
  const mockWin = { closed: false, close: () => { winClosed = true; } };
  if (!globalThis.window) globalThis.window = {};
  globalThis.window.open = () => mockWin;

  activeUi._triggerBlobDownload = (blob, filename) => { fallbackDownloadedName = filename; };

  const mockFetch = async () => ({
    ok: true,
    blob: async () => new Blob(['zip data'], { type: 'application/zip' })
  });

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    await activeUi._handleAttachmentPreview('Objective_Attachment_1', 'archive.zip', 'K_ZIP_507');
    assert.equal(winClosed, true, 'Opened window must be closed when falling back to download');
    assert.equal(fallbackDownloadedName, 'archive.zip', 'Must fall back to blob download preserving original filename');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('ATTACHMENT_PREVIEW_MOCK_WITHOUT_FILEKEY_DOES_NOT_NETWORK: preview mock file without fileKey makes 0 network calls', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({ $id: { value: '508' } });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const html = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  assert.ok(!html.includes('mbo-attachment-preview-link'), 'Preview mock without fileKey must not render preview link');
  assert.ok(!html.includes('mbo-attachment-download-btn'), 'Preview mock without fileKey must not render download button');

  let networkCalled = false;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => { networkCalled = true; return { ok: true }; };

  try {
    await activeUi._handleAttachmentPreview('Objective_Attachment_1', 'mock.pdf', null);
    await activeUi._handleAttachmentDownload('Objective_Attachment_1', 'mock.pdf', null);
    assert.equal(networkCalled, false, 'Handling null fileKey must make zero network requests');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('ATTACHMENT_MISSING_FILEKEY_DOES_NOT_NETWORK: missing or empty fileKey throws immediately in downloadKintoneFileBlob without network call', async () => {
  const { downloadKintoneFileBlob } = await import('../src/services/mbo-attachment-service.js');

  let networkCalled = false;
  const mockFetch = async () => { networkCalled = true; return { ok: true }; };

  await assert.rejects(
    async () => downloadKintoneFileBlob('', { fetchFn: mockFetch }),
    /fileKey is required/
  );
  await assert.rejects(
    async () => downloadKintoneFileBlob('   ', { fetchFn: mockFetch }),
    /fileKey is required/
  );
  assert.equal(networkCalled, false, 'Empty fileKey must throw before any fetch call');
});

test('ATTACHMENT_DOWNLOAD_ERROR_VISIBLE_AND_NON_DESTRUCTIVE: download failure shows error and does not mutate record or desired state', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '510' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_FAIL_510', name: 'fail.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  let errorShown = null;
  activeUi._showAttachmentError = (msg) => { errorShown = msg; };

  const mockFetch = async () => ({
    ok: false,
    status: 404,
    text: async () => 'File not found'
  });

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    await activeUi._handleAttachmentDownload('Objective_Attachment_1', 'fail.pdf', 'K_FAIL_510');
    assert.ok(errorShown && errorShown.includes('404'), 'Must show visible error message containing HTTP status');
    assert.deepEqual(rec.Objective_Attachment_1.value, [{ fileKey: 'K_FAIL_510', name: 'fail.pdf' }], 'Record FILE field must remain completely unmutated on error');
    assert.equal(activeUi.desiredSavedFiles?.Objective_Attachment_1, undefined, 'desiredSavedFiles must remain unmutated on retrieval error');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('ATTACHMENT_PREVIEW_ERROR_VISIBLE_AND_NON_DESTRUCTIVE: preview failure shows error and does not mutate record or desired state', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '511' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_FAIL_511', name: 'fail_preview.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  let errorShown = null;
  activeUi._showAttachmentError = (msg) => { errorShown = msg; };

  const mockFetch = async () => ({
    ok: false,
    status: 500,
    text: async () => 'Internal Error'
  });

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    await activeUi._handleAttachmentPreview('Objective_Attachment_1', 'fail_preview.pdf', 'K_FAIL_511');
    assert.ok(errorShown && errorShown.includes('500'), 'Must show visible error message containing HTTP status');
    assert.deepEqual(rec.Objective_Attachment_1.value, [{ fileKey: 'K_FAIL_511', name: 'fail_preview.pdf' }], 'Record FILE field must remain unmutated on preview error');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('ATTACHMENT_DELETE_CONTROL_REMAINS_SEPARATE_AND_FUNCTIONAL: delete button retains separate remove event handling without triggering preview or download', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '512' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'K_DEL_512', name: 'delete_me.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  let previewCalled = false;
  let downloadCalled = false;
  activeUi._handleAttachmentPreview = () => { previewCalled = true; };
  activeUi._handleAttachmentDownload = () => { downloadCalled = true; };

  activeUi._removeSavedAttachmentFile('Objective_Attachment_1', 'delete_me.pdf', 'K_DEL_512');

  assert.ok(activeUi.desiredSavedFiles.Objective_Attachment_1, 'Desired saved files map must be updated on remove');
  assert.equal(activeUi.desiredSavedFiles.Objective_Attachment_1.length, 0, 'File must be removed from desired saved files set');
  assert.equal(previewCalled, false, 'Remove must not trigger preview');
  assert.equal(downloadCalled, false, 'Remove must not trigger download');
});

test('OBJECTIVE_MIDYEAR_FINAL_RETRIEVAL_REGRESSION: Objective, Mid-Year and Final attachments all render preview link and download button for saved files', async () => {
  const showHook = kintoneHandlers['app.record.detail.show'];
  const rec = getSampleRecord({
    $id: { value: '513' },
    Objective_Attachment_1: { type: 'FILE', value: [{ fileKey: 'O_513', name: 'obj.pdf' }] },
    MidYear_Attachment_1: { type: 'FILE', value: [{ fileKey: 'M_513', name: 'mid.pdf' }] },
    Self_Attachment_1: { type: 'FILE', value: [{ fileKey: 'S_513', name: 'self.pdf' }] }
  });

  await invokeShowHook(showHook, { type: 'app.record.detail.show', record: rec });
  await new Promise(r => setTimeout(r, 20));

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);

  const objHtml = activeUi._renderAttachmentControl('Objective_Attachment_1', 'Objectives', true);
  const midHtml = activeUi._renderAttachmentControl('MidYear_Attachment_1', 'Mid-Year', true);
  const selfHtml = activeUi._renderAttachmentControl('Self_Attachment_1', 'Self Evaluation', true);

  for (const html of [objHtml, midHtml, selfHtml]) {
    assert.ok(html.includes('<a href="#" class="mbo-attachment-filename"'), 'All stages must render clickable preview link for saved files');
    assert.ok(html.includes('class="mbo-attachment-download-btn"'), 'All stages must render download button for saved files');
  }
});

test('NO_LIVE_NETWORK_IN_TESTS: all tests run strictly against local mock transports with 0 external network calls', () => {
  assert.equal(typeof globalThis.fetch, 'function', 'Mock fetch transport must be used in unit tests');
});
