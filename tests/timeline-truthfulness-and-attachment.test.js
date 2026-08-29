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

test('ATTACHMENT_SERVICE_PREPARE_AND_FINALIZE: prepares plan with uploaded fileKeys and finalizes via Update Record REST API', async () => {
  const record = getSampleRecord();
  const pending = {
    Objective_Attachment_1: [
      { file: createTestBlob(), name: 'test_evidence.pdf', status: 'pending' }
    ]
  };

  let fileUploadCalled = false;
  let restUpdateCalled = false;

  const mockFetch = async (url, opts) => {
    if (url === '/k/v1/file.json') {
      fileUploadCalled = true;
      assert.equal(opts.method, 'POST');
      return { ok: true, json: async () => ({ fileKey: 'MOCK_UPLOAD_FILEKEY_123' }) };
    }
    if (url === '/k/v1/record.json') {
      restUpdateCalled = true;
      assert.equal(opts.method, 'PUT');
      const body = JSON.parse(opts.body);
      assert.equal(body.app, 794);
      assert.equal(body.id, '100');
      assert.equal(body.record.Objective_Attachment_1.value[0].fileKey, 'MOCK_UPLOAD_FILEKEY_123');
      return { ok: true, json: async () => ({ revision: '2' }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  const plan = await prepareAttachmentPlan(record, pending, { fetch: mockFetch });
  assert.equal(fileUploadCalled, true);
  assert.equal(record.Objective_Attachment_1.value.length, 0, 'Prepare step must NOT mutate record field during submit!');

  const result = await finalizeAttachmentPlan(794, 100, plan, { fetch: mockFetch });
  assert.equal(restUpdateCalled, true);
  assert.equal(result.updated, true);
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
    async () => prepareAttachmentPlan(record, pending, { fetch: mockFetch }),
    /Attachment upload failed for field Objective_Attachment_1/
  );

  assert.equal(pending.Objective_Attachment_1[0].status, 'error');
});

test('ATTACHMENT_SELF_FINAL_FALLBACK_REGRESSION: Self_Attachment_ fallback to Final_Attachment_ preserves existing behavior', () => {
  const rec = getSampleRecord({
    Final_Attachment_1: { type: 'FILE', value: [{ fileKey: 'KEY_FINAL', name: 'self_evaluation_proof.pdf' }] }
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

test('CREATE_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION: create.submit with 0 pending files leaves event.record attachment fields unchanged', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const createSubmitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof createSubmitHook === 'function');

  const rec = getSampleRecord();
  await invokeShowHook(showHook, { type: 'app.record.create.show', record: rec });

  const activeUi = getActiveUiInstance();
  assert.ok(activeUi);
  activeUi.isEmployeeVerified = true;

  const submitEvent = { type: 'app.record.create.submit', record: rec };
  const res = await createSubmitHook(submitEvent);

  assert.equal(res, submitEvent);
  assert.equal(rec.Objective_Attachment_1.type, 'FILE');
  assert.equal(rec.Objective_Attachment_1.value.length, 0);
  assert.equal(activeUi.preparedAttachmentPlan, null);
});

test('EDIT_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION: edit.submit with 0 pending files leaves event.record attachment fields unchanged', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const editSubmitHook = kintoneHandlers['app.record.edit.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof editSubmitHook === 'function');

  const rec = getSampleRecord({ $id: { value: '10' } });
  await invokeShowHook(showHook, { type: 'app.record.edit.show', record: rec });

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

test('CREATE_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN: create.submit uploads pending file and prepares plan without mutating event.record', async () => {
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

    assert.equal(res, submitEvent);
    assert.equal(uploadCalled, true);

    // SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED
    assert.equal(rec.Objective_Attachment_1.type, 'FILE');
    assert.equal(rec.Objective_Attachment_1.value.length, 0, 'event.record.Objective_Attachment_1 must NOT be mutated in submit event!');

    // Prepared plan check
    assert.ok(activeUi.preparedAttachmentPlan);
    assert.equal(activeUi.preparedAttachmentPlan.Objective_Attachment_1.value[0].fileKey, 'FILEKEY_HANDLER_CREATE_101');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('CREATE_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD: create.submit.success finalizes attachment binding via Update Record REST API', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const createSubmitHook = kintoneHandlers['app.record.create.submit'];
  const createSubmitSuccessHook = kintoneHandlers['app.record.create.submit.success'];
  assert.ok(typeof createSubmitSuccessHook === 'function');

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

  const rec = getSampleRecord();
  await invokeShowHook(showHook, { type: 'app.record.create.show', record: rec });

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
    const submitEvent = { type: 'app.record.create.submit', record: rec };
    await createSubmitHook(submitEvent);

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
  assert.ok(typeof editSubmitSuccessHook === 'function');

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

test('POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR: displays truthful diagnostic error when post-save REST binding fails', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const createSubmitHook = kintoneHandlers['app.record.create.submit'];
  const createSubmitSuccessHook = kintoneHandlers['app.record.create.submit.success'];

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

  const rec = getSampleRecord();
  await invokeShowHook(showHook, { type: 'app.record.create.show', record: rec });

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

  const origConsoleError = console.error;
  console.error = () => {};

  try {
    const submitEvent = { type: 'app.record.create.submit', record: rec };
    await createSubmitHook(submitEvent);

    const successEvent = { type: 'app.record.create.submit.success', appId: 794, recordId: '99' };
    const successRes = await createSubmitSuccessHook(successEvent);

    assert.equal(successRes, successEvent, 'Submit success handler must return event');
    assert.equal(activeUi.currentErrors.length > 0, true, 'UI must display diagnostic validation error');
    assert.ok(activeUi.currentErrors[0].message.includes('Record saved, but attachment binding failed'), 'Error message must state record saved but binding failed');
  } finally {
    globalThis.fetch = origFetch;
    console.error = origConsoleError;
  }
});
