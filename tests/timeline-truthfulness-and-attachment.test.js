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

test('NO_LIVE_NETWORK_IN_TESTS: all tests run strictly against local mock transports with 0 external network calls', () => {
  assert.equal(typeof globalThis.fetch, 'function', 'Mock fetch transport must be used in unit tests');
});
