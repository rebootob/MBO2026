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

test('COMMENT_DIRECT_KINTONE_REQUEST_LIMIT = 10 & PRODUCTION_PATH: Direct globalThis.kintone.api GET request uses limit 10', async () => {
  setupMockDocument();
  const origKintone = globalThis.kintone;

  const capturedRequests = [];
  globalThis.kintone = {
    api: async (url, method, params) => {
      capturedRequests.push({ url, method, params });
      return {
        comments: [
          { id: '1', creator: { name: 'User A' }, text: 'Comment 1', createdAt: '2026-08-29T10:00:00Z' }
        ],
        newer: false
      };
    }
  };
  globalThis.kintone.api.url = (path) => `https://ttmet.cybozu.com${path}`;

  try {
    // kintoneApiWrapper is null/absent to force production globalThis.kintone.api path
    const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: null });
    const comments = await mirror.fetchRecordComments(794, 1001);

    assert.equal(capturedRequests.length, 1, 'Exactly 1 kintone.api GET request executed');
    const req = capturedRequests[0];
    assert.equal(req.url, 'https://ttmet.cybozu.com/k/v1/record/comments.json');
    assert.equal(req.method, 'GET');
    assert.equal(req.params.app, 794);
    assert.equal(req.params.record, 1001);
    assert.equal(req.params.order, 'asc');
    assert.equal(req.params.offset, 0);
    assert.equal(req.params.limit, 10, 'CRITICAL: Kintone Get Comments limit MUST be strictly 10');
    assert.equal(comments.length, 1);
  } finally {
    globalThis.kintone = origKintone;
  }
});

test('COMMENT_LIMIT_OVER_10_BLOCKED_BY_TEST: Any limit > 10 is rejected by strict assertion', async () => {
  setupMockDocument();
  let requestedLimit = null;
  const mockApi = {
    getComments: async (appId, recordId, options) => {
      requestedLimit = options.limit;
      return { comments: [], newer: false };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  await mirror.fetchRecordComments(794, 123);

  assert.equal(requestedLimit, 10, 'Requested limit must equal 10');
  assert.ok(requestedLimit <= 10, 'Limit > 10 must be blocked');
});

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

test('DETAIL_COMMENT_MIRROR_LOAD_PASS & EDIT_COMMENT_MIRROR_LOAD_PASS: Loads comments on Detail/Edit with numeric input types', async () => {
  setupMockDocument();
  let fetchedAppId = null;
  let fetchedRecordId = null;
  let fetchedLimit = null;
  const mockApi = {
    getComments: async (appId, recordId, options) => {
      fetchedAppId = appId;
      fetchedRecordId = recordId;
      fetchedLimit = options.limit;
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
  const panel = mirror.renderNativeCommentMirror({ appId: '794', recordId: '123', isCreate: false });

  await new Promise(r => setTimeout(r, 50));

  assert.equal(fetchedAppId, 794, 'appId must be parsed to numeric 794');
  assert.equal(fetchedRecordId, 123, 'recordId must be parsed to numeric 123');
  assert.equal(fetchedLimit, 10, 'limit must equal 10');
  const items = panel.querySelectorAll('[data-mbo-comment-item]');
  assert.equal(items.length, 2, 'Must render 2 comment items');

  const authors = panel.querySelectorAll('[data-mbo-comment-author]');
  assert.equal(authors[0].textContent, 'Somchai');
  assert.equal(authors[1].textContent, 'Manager');

  const texts = panel.querySelectorAll('[data-mbo-comment-text]');
  assert.equal(texts[0].textContent, 'Objective looks good.');
  assert.equal(texts[1].textContent, 'Approved.');
});

test('COMMENT_REFRESH_REFETCH: Clicking Refresh button re-fetches comments thread', async () => {
  setupMockDocument();
  let fetchCount = 0;
  const mockApi = {
    getComments: async () => {
      fetchCount++;
      return {
        comments: [
          { id: String(fetchCount), creator: { name: `User ${fetchCount}` }, text: `Comment ${fetchCount}` }
        ],
        newer: false
      };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const panel = mirror.renderNativeCommentMirror({ appId: 794, recordId: 555, isCreate: false });

  await new Promise(r => setTimeout(r, 50));
  assert.equal(fetchCount, 1, 'Initial load executes 1 fetch');

  const refreshBtn = panel.querySelector('[data-mbo-refresh-comments]');
  assert.ok(refreshBtn, 'Refresh button must be present');

  await refreshBtn.click();
  await new Promise(r => setTimeout(r, 50));

  assert.equal(fetchCount, 2, 'Clicking Refresh button must execute second fetch');
  const author = panel.querySelector('[data-mbo-comment-author]');
  assert.equal(author.textContent, 'User 2');
});

test('COMMENT_INVALID_INPUT_RETURNS_EMPTY_WITHOUT_NETWORK_CALL: Falsy or non-numeric recordId returns empty array without GET call', async () => {
  setupMockDocument();
  let callCount = 0;
  const mockApi = {
    getComments: async () => {
      callCount++;
      return { comments: [] };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const result1 = await mirror.fetchRecordComments(794, null);
  const result2 = await mirror.fetchRecordComments(794, 'abc');
  const result3 = await mirror.fetchRecordComments(794, undefined);

  assert.equal(callCount, 0, 'Invalid input must execute 0 network GET calls');
  assert.deepEqual(result1, []);
  assert.deepEqual(result2, []);
  assert.deepEqual(result3, []);
});

test('COMMENT_PAGINATION_NO_SILENT_TRUNCATION & COMMENT_OVER_100_PAGES_PASS: Pages through 101+ pages using 10-comment pages completely', async () => {
  setupMockDocument();
  let callCount = 0;
  const totalPagesToTest = 105; // 105 pages * 10 comments = 1050 comments!

  const mockApi = {
    getComments: async (appId, recordId, options) => {
      callCount++;
      assert.equal(options.limit, 10, 'Each page request must use limit=10');
      const currentOffset = options.offset;
      const currentPageIndex = Math.floor(currentOffset / 10);

      if (currentPageIndex < totalPagesToTest - 1) {
        const pageComments = Array.from({ length: 10 }, (_, i) => ({
          id: String(currentOffset + i + 1),
          creator: { name: `User ${currentOffset + i + 1}` },
          text: `Comment ${currentOffset + i + 1}`
        }));
        return { comments: pageComments, newer: true };
      }

      const lastComments = Array.from({ length: 4 }, (_, i) => ({
        id: String(currentOffset + i + 1),
        creator: { name: `User ${currentOffset + i + 1}` },
        text: `Comment ${currentOffset + i + 1}`
      }));
      return { comments: lastComments, newer: false };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const comments = await mirror.fetchRecordComments(794, '789');

  assert.equal(callCount, 105, 'Must execute 105 API calls of 10 items without being truncated');
  assert.equal(comments.length, 104 * 10 + 4, 'Total retrieved comments must equal 1044');
  assert.equal(comments[0].id, '1');
  assert.equal(comments[1043].id, '1044');
});

test('COMMENT_PAGINATION_SAFETY_CAP_EXCEEDED_THROWS: Safety ceiling throws explicit error caught as non-blocking UI error', async () => {
  setupMockDocument();

  const mockApi = {
    getComments: async (appId, recordId, options) => ({
      comments: Array.from({ length: 10 }, (_, i) => ({
        id: String(options.offset + i + 1),
        creator: { name: 'Infinite User' },
        text: 'Infinite Comment'
      })),
      newer: true
    })
  };

  const fastMirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  fastMirror.fetchRecordComments = async (appId, recordId) => {
    let allComments = [];
    let offset = 0;
    const limit = 10;
    let page = 0;
    const maxPages = 5;
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
