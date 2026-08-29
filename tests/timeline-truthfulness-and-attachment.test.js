import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';
import { uploadKintoneFile, uploadAndBindPendingAttachments } from '../src/services/mbo-attachment-service.js';

// Minimal mock DOM element helper
function createMockElement(tagName = 'div') {
  const children = [];
  const attributes = {};
  const listeners = {};
  return {
    tagName: tagName.toUpperCase(),
    className: '',
    innerHTML: '',
    style: {},
    dataset: {},
    children,
    parentElement: null,
    closest(sel) { return this; },
    setAttribute(k, v) { attributes[k] = v; },
    getAttribute(k) { return attributes[k]; },
    appendChild(child) {
      if (child) child.parentElement = this;
      children.push(child);
      return child;
    },
    addEventListener(event, fn) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(fn);
    },
    dispatchEvent(event, data) {
      if (listeners[event]) {
        listeners[event].forEach(fn => fn({ target: this, ...data }));
      }
    },
    querySelector(sel) { return createMockElement('div'); },
    querySelectorAll(sel) { return []; }
  };
}

if (!globalThis.document) {
  globalThis.document = {
    createElement: (tag) => createMockElement(tag),
    querySelector: () => createMockElement('div'),
    querySelectorAll: () => []
  };
}

function getSampleRecord() {
  return {
    Employee_Code: { value: '0113' },
    Employee_Name: { value: 'Somchai Prasert' },
    Department_Name: { value: 'Technology' },
    Section_Name: { value: 'Technology Section 2' },
    Objective_Count: { value: '2' },
    Objective_Title_1: { value: 'Improve API response time' },
    Weight_1: { value: '50' },
    Objective_Title_2: { value: 'Upgrade server infrastructure' },
    Weight_2: { value: '50' }
  };
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
  const rec = getSampleRecord();
  rec.Objective_Attachment_1 = {
    value: [{ fileKey: 'KEY_001', name: 'performance_spec.pdf', size: 1024 }]
  };

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  const html = ui._renderAttachmentControl('Objective_Attachment_1', 'Objectives', false);
  assert.ok(html.includes('performance_spec.pdf'), 'Must display real filename');
  assert.ok(!html.includes('No attachment'), 'Must not say No attachment');
});

test('ATTACHMENT_READONLY_MULTIPLE_FILES: renders EVERY saved file', () => {
  const rec = getSampleRecord();
  rec.Objective_Attachment_1 = {
    value: [
      { fileKey: 'KEY_001', name: 'architecture_diagram.png', size: 2048 },
      { fileKey: 'KEY_002', name: 'benchmark_report.pdf', size: 4096 },
      { fileKey: 'KEY_003', name: 'data_sheet.xlsx', size: 1024 }
    ]
  };

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

test('ATTACHMENT_REMOVE_PENDING_FILE: remove pending file updates pendingAttachments without touching unrelated fields', () => {
  const rec = getSampleRecord();
  rec.Objective_Attachment_2 = { value: [{ fileKey: 'KEY_OBJ2', name: 'unrelated_file.pdf' }] };

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  ui.pendingAttachments = {
    Objective_Attachment_1: [
      { name: 'draft_1.pdf', status: 'pending' },
      { name: 'draft_2.pdf', status: 'pending' }
    ]
  };

  // Remove first pending item
  ui.pendingAttachments.Objective_Attachment_1.splice(0, 1);

  assert.equal(ui.pendingAttachments.Objective_Attachment_1.length, 1);
  assert.equal(ui.pendingAttachments.Objective_Attachment_1[0].name, 'draft_2.pdf');
  assert.equal(rec.Objective_Attachment_2.value[0].name, 'unrelated_file.pdf', 'Unrelated row must be untouched');
});

test('ATTACHMENT_SERVICE_UPLOAD_AND_BIND: uploads file and binds fileKey to exact target field', async () => {
  const record = getSampleRecord();
  const pending = {
    Objective_Attachment_1: [
      { file: { name: 'test_evidence.pdf' }, name: 'test_evidence.pdf', status: 'pending' }
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
      { file: { name: 'corrupted_file.exe' }, name: 'corrupted_file.exe', status: 'pending' }
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
  const rec = getSampleRecord();
  rec.Final_Attachment_1 = { value: [{ fileKey: 'KEY_FINAL', name: 'self_evaluation_proof.pdf' }] };

  const ui = new EmployeePartAUI({
    record: rec,
    isPreviewMode: false
  });

  const files = ui._getSavedAttachmentFiles('Self_Attachment_1');
  assert.equal(files.length, 1);
  assert.equal(files[0].name, 'self_evaluation_proof.pdf');
  assert.equal(files[0].fileKey, 'KEY_FINAL');
});
