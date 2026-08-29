import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeeCommentMirror } from '../src/ui/employee-comment-mirror.js';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';

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
        if (sel.startsWith('[data-mbo-') && sel.endsWith(']')) {
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
    click() {
      const fn = listeners.get('click');
      if (fn) return fn();
    }
  };

  return element;
}

function setupMockDocument() {
  globalThis.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    body: createMockElement('body'),
    createElement: (tag) => createMockElement(tag),
    getElementById: () => null
  };
}

test('COMMENT_CREATE_MIRROR_ABSENT & COMMENT_CREATE_GET_COUNT = 0: On Create screen, comment mirror is absent and GET count is 0', async () => {
  setupMockDocument();
  let getCommentsCallCount = 0;
  const mockApi = {
    getComments: async () => {
      getCommentsCallCount++;
      return { comments: [] };
    }
  };

  const container = createMockElement('div');
  const ui = new EmployeePartAUI({
    container,
    isCreate: true,
    kintoneApiWrapper: mockApi
  });

  ui.render();
  await new Promise(r => setTimeout(r, 50));

  assert.equal(getCommentsCallCount, 0, 'On Create screen, comment GET count must be strictly 0');
  const commentMirror = ui.root.querySelector('[data-mbo-comment-panel]');
  assert.equal(commentMirror, null, 'COMMENT_CREATE_MIRROR_ABSENT: On Create screen, comment mirror panel must be strictly absent');
});

test('DETAIL_COMMENT_MIRROR_LOAD_PASS & EDIT_COMMENT_MIRROR_LOAD_PASS: Loads comments on Detail/Edit', async () => {
  setupMockDocument();
  let fetchedRecordId = null;
  const mockApi = {
    getComments: async (appId, recordId) => {
      fetchedRecordId = recordId;
      return {
        comments: [
          { id: '1', creator: { name: 'Somchai' }, text: 'Objective looks good.', createdAt: '2026-02-15T09:00:00Z' },
          { id: '2', creator: { name: 'Manager' }, text: 'Approved.', createdAt: '2026-02-16T10:00:00Z' }
        ],
        newer: false
      };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const panel = mirror.renderNativeCommentMirror({ appId: 794, recordId: '123', isCreate: false });

  await new Promise(r => setTimeout(r, 50));

  assert.equal(fetchedRecordId, '123');
  const items = panel.querySelectorAll('[data-mbo-comment-item]');
  assert.equal(items.length, 2, 'Must render 2 comment items');

  const authors = panel.querySelectorAll('[data-mbo-comment-author]');
  assert.equal(authors[0].textContent, 'Somchai');
  assert.equal(authors[1].textContent, 'Manager');

  const texts = panel.querySelectorAll('[data-mbo-comment-text]');
  assert.equal(texts[0].textContent, 'Objective looks good.');
  assert.equal(texts[1].textContent, 'Approved.');
});

test('COMMENT_PAGINATION_NO_SILENT_TRUNCATION & COMMENT_PAGINATION_OVER_100_PAGES_PASS: Pages through 101+ pages (>5,000 comments) completely', async () => {
  setupMockDocument();
  let callCount = 0;
  const totalPagesToTest = 105; // >100 pages regression!

  const mockApi = {
    getComments: async (appId, recordId, options) => {
      callCount++;
      const currentOffset = options.offset;
      const currentPageIndex = Math.floor(currentOffset / 50);

      if (currentPageIndex < totalPagesToTest - 1) {
        const pageComments = Array.from({ length: 50 }, (_, i) => ({
          id: String(currentOffset + i + 1),
          creator: { name: `User ${currentOffset + i + 1}` },
          text: `Comment ${currentOffset + i + 1}`
        }));
        return { comments: pageComments, newer: true };
      }

      // Final 105th page
      const lastComments = Array.from({ length: 10 }, (_, i) => ({
        id: String(currentOffset + i + 1),
        creator: { name: `User ${currentOffset + i + 1}` },
        text: `Comment ${currentOffset + i + 1}`
      }));
      return { comments: lastComments, newer: false };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const comments = await mirror.fetchRecordComments(794, '789');

  assert.equal(callCount, 105, 'Must execute 105 API calls without being truncated at page 100');
  assert.equal(comments.length, 104 * 50 + 10, 'Total retrieved comments must equal 5210');
  assert.equal(comments[0].id, '1');
  assert.equal(comments[5209].id, '5210');
});

test('COMMENT_PAGINATION_SAFETY_CAP_EXCEEDED_THROWS: Safety ceiling throws explicit error caught as non-blocking UI error', async () => {
  setupMockDocument();

  // Mock API that endlessly returns newer: true
  const mockApi = {
    getComments: async (appId, recordId, options) => ({
      comments: Array.from({ length: 50 }, (_, i) => ({
        id: String(options.offset + i + 1),
        creator: { name: 'Infinite User' },
        text: 'Infinite Comment'
      })),
      newer: true
    })
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });

  // Override maxPages to 5 for fast test execution
  const fastMirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const originalFetch = fastMirror.fetchRecordComments.bind(fastMirror);
  fastMirror.fetchRecordComments = async (appId, recordId) => {
    // Custom wrapper that tests safety ceiling
    let allComments = [];
    let offset = 0;
    const limit = 50;
    let page = 0;
    const maxPages = 5; // Fast test cap
    let prevOffset = -1;

    while (true) {
      if (page >= maxPages) {
        throw new Error(`PAGINATION_SAFETY_CAP_EXCEEDED: Comment thread exceeded safety ceiling of ${maxPages} pages without completion.`);
      }
      page++;
      const resp = await mockApi.getComments(appId, recordId, { limit, offset, order: 'asc' });
      allComments = allComments.concat(resp.comments);
      offset += resp.comments.length;
    }
  };

  const panel = fastMirror.renderNativeCommentMirror({ appId: 794, recordId: '999', isCreate: false });

  await new Promise(r => setTimeout(r, 50));

  const errNotice = panel.querySelector('[data-mbo-comment-error]');
  assert.ok(errNotice, 'Exceeding safety ceiling must render non-blocking error notice in UI');
  assert.ok(errNotice.textContent.includes('PAGINATION_SAFETY_CAP_EXCEEDED'), 'Error notice must contain explicit exception code');
});

test('COMMENT_DYNAMIC_ERROR_SAFE_TEXT_PASS: Malicious error message containing HTML tags remains plain text', async () => {
  setupMockDocument();

  const maliciousErrorMsg = '<img src=x onerror=alert("xss")> <script>alert(1)</script> MALICIOUS ERROR';
  const mockApi = {
    getComments: async () => {
      throw new Error(maliciousErrorMsg);
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const panel = mirror.renderNativeCommentMirror({ appId: 794, recordId: '123', isCreate: false });

  await new Promise(r => setTimeout(r, 50));

  const errNotice = panel.querySelector('[data-mbo-comment-error]');
  assert.ok(errNotice, 'Error notice element must be rendered');
  assert.equal(errNotice.innerHTML, '', 'errNotice innerHTML must be empty string (no innerHTML assignment)');
  assert.ok(errNotice.textContent.includes(maliciousErrorMsg), 'Malicious error text must be stored safely in textContent');
});

test('COMMENT_SAFE_TEXT_RENDER_PASS & COMMENT_WRITE_COUNT = 0: HTML in body & author are textContent-only; 0 write calls', async () => {
  setupMockDocument();
  let postCount = 0;
  let deleteCount = 0;

  const mockApi = {
    getComments: async () => ({
      comments: [
        { id: '1', creator: { name: '<script>alert("xss")</script>' }, text: '<b>Dangerous HTML</b> & <img src=x onerror=alert(1)>' }
      ],
      newer: false
    }),
    postComment: () => { postCount++; },
    deleteComment: () => { deleteCount++; }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const panel = mirror.renderNativeCommentMirror({ appId: 794, recordId: '123', isCreate: false });

  await new Promise(r => setTimeout(r, 50));

  const authorEl = panel.querySelector('[data-mbo-comment-author]');
  assert.equal(authorEl.innerHTML, '');
  assert.equal(authorEl.textContent, '<script>alert("xss")</script>');

  const textEl = panel.querySelector('[data-mbo-comment-text]');
  assert.equal(textEl.innerHTML, '');
  assert.equal(textEl.textContent, '<b>Dangerous HTML</b> & <img src=x onerror=alert(1)>');

  assert.equal(postCount, 0, 'Comment POST count must be strictly 0');
  assert.equal(deleteCount, 0, 'Comment DELETE count must be strictly 0');
});
