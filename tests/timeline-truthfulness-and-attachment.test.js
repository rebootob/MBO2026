import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';
import { uploadKintoneFile, uploadAndBindPendingAttachments } from '../src/services/mbo-attachment-service.js';

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

const fakeApi = async (url, method, params) => {
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
  requireLogin: async () => ({ code: '0118', employeeCode: '0118', name: 'Somchai Prasert' })
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
    Objective_Attachment_2: { value: [{ fileKey: 'KEY_OBJ2', name: 'unrelated_file.pdf' }] }
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

test('ATTACHMENT_SERVICE_UPLOAD_AND_BIND: uploads file and binds fileKey to exact target field', async () => {
  const record = getSampleRecord();
  const pending = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'test_evidence.pdf', status: 'pending' }
    ]
  };

  const mockFetch = async (url, opts) => {
    assert.equal(url, '/k/v1/file.json');
    assert.equal(opts.method, 'POST');
    assert.equal(opts.headers['X-Requested-With'], 'XMLHttpRequest');
    return {
      ok: true,
      json: async () => ({ fileKey: 'MOCK_UPLOAD_FILEKEY_123' })
    };
  };

  await uploadAndBindPendingAttachments(record, pending, { fetch: mockFetch });

  assert.ok(record.Objective_Attachment_1);
  assert.equal(record.Objective_Attachment_1.value[0].fileKey, 'MOCK_UPLOAD_FILEKEY_123');
  assert.equal(record.Objective_Attachment_1.value[0].name, 'test_evidence.pdf');
});

test('ATTACHMENT_SERVICE_UPLOAD_ERROR_VISIBILITY: fails closed and throws visible error on upload failure', async () => {
  const record = getSampleRecord();
  const pending = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'corrupted_file.exe', status: 'pending' }
    ]
  };

  const mockFetch = async () => {
    return {
      ok: false,
      status: 400,
      text: async () => 'File type not allowed'
    };
  };

  await assert.rejects(
    async () => uploadAndBindPendingAttachments(record, pending, { fetch: mockFetch }),
    /Attachment upload failed for field Objective_Attachment_1/
  );

  assert.equal(pending.Objective_Attachment_1[0].status, 'error');
});

test('ATTACHMENT_SELF_FINAL_FALLBACK_REGRESSION: Self_Attachment_ fallback to Final_Attachment_ preserves existing behavior', () => {
  const rec = getSampleRecord({
    Final_Attachment_1: { value: [{ fileKey: 'KEY_FINAL', name: 'self_evaluation_proof.pdf' }] }
  });

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  const files = ui._getSavedAttachmentFiles('Self_Attachment_1');
  assert.equal(files.length, 1);
  assert.equal(files[0].name, 'self_evaluation_proof.pdf');
  assert.equal(files[0].fileKey, 'KEY_FINAL');
});

test('SUBMIT_HANDLER_PATH_CREATE_ZERO_PENDING_ATTACHMENTS: registered app.record.create.submit handler succeeds without upload', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const createSubmitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof createSubmitHook === 'function');

  const rec = getSampleRecord();
  await invokeShowHook(showHook, { type: 'app.record.create.show', record: rec });

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi, 'activeUiInstance must exist after showHook');
  activeUi.isEmployeeVerified = true;

  const submitEvent = { type: 'app.record.create.submit', record: rec };
  const res = await createSubmitHook(submitEvent);

  assert.equal(res, submitEvent, 'Create submit handler must return submit event cleanly when zero pending files exist');
});

test('SUBMIT_HANDLER_PATH_EDIT_ZERO_PENDING_ATTACHMENTS: registered app.record.edit.submit handler succeeds without upload', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof editSubmitHook === 'function');

  const rec = getSampleRecord({ $id: { value: '10' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi, 'activeUiInstance must exist after showHook');
  activeUi.isEmployeeVerified = true;

  const submitEvent = { type: 'app.record.edit.submit', record: rec };
  const res = await editSubmitHook(submitEvent);

  assert.equal(res, submitEvent, 'Edit submit handler must return submit event cleanly when zero pending files exist');
});

test('SUBMIT_HANDLER_PATH_CREATE_PENDING_ATTACHMENT_UPLOAD_AND_BIND: registered create.submit handler uploads and binds fileKey to event.record', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const createSubmitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof createSubmitHook === 'function');

  let uploadCalled = false;
  const mockFetch = async (url, opts) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    uploadCalled = true;
    assert.equal(url, '/k/v1/file.json');
    return { ok: true, json: async () => ({ fileKey: 'FILEKEY_HANDLER_CREATE_101' }) };
  };

  const rec = getSampleRecord();
  await invokeShowHook(showHook, { type: 'app.record.create.show', record: rec });

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;
  activeUi.pendingAttachments = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'create_doc.pdf', status: 'pending' }
    ]
  };

  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    const submitEvent = { type: 'app.record.create.submit', record: rec };
    const res = await createSubmitHook(submitEvent);

    assert.equal(res, submitEvent, 'Create submit handler must return event object');
    assert.equal(uploadCalled, true, 'Handler must invoke upload for pending attachment');
    assert.ok(rec.Objective_Attachment_1, 'Target field must be bound on submit event.record');
    assert.equal(rec.Objective_Attachment_1.value[0].fileKey, 'FILEKEY_HANDLER_CREATE_101');
    assert.equal(rec.Objective_Attachment_1.value[0].name, 'create_doc.pdf');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('SUBMIT_HANDLER_PATH_EDIT_PENDING_MIDYEAR_ATTACHMENT_UNRELATED_UNTOUCHED: registered edit.submit handler binds target field leaving unrelated fields unchanged', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof editSubmitHook === 'function');

  const mockFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    return { ok: true, json: async () => ({ fileKey: 'FILEKEY_HANDLER_MIDYEAR_555' }) };
  };

  const rec = getSampleRecord({
    $id: { value: '25' },
    Objective_Attachment_1: { value: [{ fileKey: 'PREVIOUS_OBJ_KEY', name: 'previous_objective.pdf' }] }
  });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });

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
    const res = await editSubmitHook(submitEvent);

    assert.equal(res, submitEvent);
    assert.equal(rec.MidYear_Attachment_1.value[0].fileKey, 'FILEKEY_HANDLER_MIDYEAR_555');
    assert.equal(rec.Objective_Attachment_1.value[0].fileKey, 'PREVIOUS_OBJ_KEY', 'Unrelated Objective attachment must remain untouched');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('SUBMIT_HANDLER_PATH_UPLOAD_FAILURE_FAILS_CLOSED: handler returns false and displays validation error when upload fails', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const createSubmitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof createSubmitHook === 'function');

  const failingFetch = async (url) => {
    if (String(url).includes('/k/v1/records.json')) {
      return { ok: true, json: async () => ({ records: [] }) };
    }
    return { ok: false, status: 500, text: async () => 'Kintone Upload Error 500' };
  };

  const rec = getSampleRecord();
  await invokeShowHook(showHook, { type: 'app.record.create.show', record: rec });

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
    const submitEvent = { type: 'app.record.create.submit', record: rec };
    const res = await createSubmitHook(submitEvent);

    assert.equal(res, false, 'Handler must return false to cancel submit on upload failure');
    assert.equal(activeUi.currentErrors.length > 0, true, 'UI must display inline validation error');
    assert.ok(activeUi.currentErrors[0].message.includes('Attachment upload failed'), 'Error message must describe upload failure');
  } finally {
    globalThis.fetch = origFetch;
    console.error = origConsoleError;
  }
});
