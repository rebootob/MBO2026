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
      const escaped = String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      this._escapedHTML = escaped;
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

test('CREATE_COMMENT_GET_COUNT = 0: On Create screen, comment GET count is strictly 0', async () => {
  setupMockDocument();
  let getCommentsCallCount = 0;
  const mockApi = {
    getComments: async () => {
      getCommentsCallCount++;
      return { comments: [] };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const panel = mirror.renderNativeCommentMirror({ appId: 794, recordId: null, isCreate: true });

  assert.equal(getCommentsCallCount, 0, 'On Create screen, comment GET count must be strictly 0');
  assert.ok(panel.getAttribute('data-mbo-comment-panel') !== null);
  const createNotice = panel.querySelector('[data-mbo-comment-create-notice]');
  assert.ok(createNotice, 'On Create screen, unpersisted comment notice is rendered');
  assert.ok(createNotice.textContent.includes('ยังไม่มีความคิดเห็น (คำขอใหม่ที่ยังไม่ได้บันทึก)'));
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

  // Wait for load
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

test('COMMENT_SHORT_PAGE_NEWER_TRUE_CONTINUES & COMMENT_FINAL_NEWER_FALSE_STOPS', async () => {
  setupMockDocument();
  let pageRequests = [];
  const mockApi = {
    getComments: async (appId, recordId, options) => {
      pageRequests.push(options);
      if (options.offset === 0) {
        // Page 1: returns short page (2 comments) but newer: true -> MUST CONTINUE!
        return {
          comments: [
            { id: '1', creator: { name: 'A' }, text: 'First' },
            { id: '2', creator: { name: 'B' }, text: 'Second' }
          ],
          newer: true
        };
      }
      // Page 2: offset = 2, returns 1 comment with newer: false -> STOP!
      return {
        comments: [
          { id: '3', creator: { name: 'C' }, text: 'Third' }
        ],
        newer: false
      };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const comments = await mirror.fetchRecordComments(794, '123');

  assert.equal(pageRequests.length, 2, 'Must fetch 2 pages because newer === true on page 1');
  assert.equal(pageRequests[0].offset, 0);
  assert.equal(pageRequests[1].offset, 2, 'Offset must increment by actual comments.length (2)');
  assert.equal(comments.length, 3, 'Total comments retrieved must be 3');
});

test('COMMENT_OVER_10_PASS & COMMENT_OVER_500_PASS: Pages through multiple pages truthfully up to newer: false', async () => {
  setupMockDocument();
  let callCount = 0;
  const mockApi = {
    getComments: async (appId, recordId, options) => {
      callCount++;
      const currentOffset = options.offset;
      if (currentOffset < 500) {
        const pageComments = Array.from({ length: 50 }, (_, i) => ({
          id: String(currentOffset + i + 1),
          creator: { name: `User ${currentOffset + i + 1}` },
          text: `Comment ${currentOffset + i + 1}`
        }));
        return { comments: pageComments, newer: true };
      }
      // Final page at offset 500
      const lastComments = Array.from({ length: 25 }, (_, i) => ({
        id: String(500 + i + 1),
        creator: { name: `User ${500 + i + 1}` },
        text: `Comment ${500 + i + 1}`
      }));
      return { comments: lastComments, newer: false };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const comments = await mirror.fetchRecordComments(794, '456');

  assert.equal(callCount, 11, 'Must execute 11 API calls for 525 total comments');
  assert.equal(comments.length, 525, 'Total comments retrieved must equal 525');
  assert.equal(comments[0].id, '1');
  assert.equal(comments[524].id, '525');
});

test('COMMENT_REFRESH_REFETCH_PASS: Refresh button triggers real API re-fetch', async () => {
  setupMockDocument();
  let fetchCount = 0;
  const mockApi = {
    getComments: async () => {
      fetchCount++;
      return {
        comments: [
          { id: String(fetchCount), creator: { name: 'User' }, text: `Fetch #${fetchCount}` }
        ],
        newer: false
      };
    }
  };

  const mirror = new EmployeeCommentMirror({ kintoneApiWrapper: mockApi });
  const panel = mirror.renderNativeCommentMirror({ appId: 794, recordId: '123', isCreate: false });

  await new Promise(r => setTimeout(r, 50));
  assert.equal(fetchCount, 1, 'Initial load must trigger 1 fetch');

  const refreshBtn = panel.querySelector('[data-mbo-comment-refresh]');
  assert.ok(refreshBtn, 'Refresh button must be rendered');

  refreshBtn.click();

  await new Promise(r => setTimeout(r, 50));
  assert.equal(fetchCount, 2, 'Clicking refresh button must trigger second fetch');

  const textEl = panel.querySelector('[data-mbo-comment-text]');
  assert.equal(textEl.textContent, 'Fetch #2', 'Comment text must update to reflect new fetch payload');
});

test('COMMENT_SAFE_TEXT_RENDER_PASS & COMMENT_WRITE_COUNT = 0: HTML tags in comment body are stored safely in textContent; 0 write calls', async () => {
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
  assert.equal(authorEl.textContent, '<script>alert("xss")</script>', 'Author textContent must be exact unparsed text');
  assert.equal(authorEl._escapedHTML, '&lt;script&gt;alert("xss")&lt;/script&gt;', 'Author HTML escaping must be verified');

  const textEl = panel.querySelector('[data-mbo-comment-text]');
  assert.equal(textEl.textContent, '<b>Dangerous HTML</b> & <img src=x onerror=alert(1)>', 'Comment textContent must be exact unparsed text');
  assert.equal(textEl._escapedHTML, '&lt;b&gt;Dangerous HTML&lt;/b&gt; &amp; &lt;img src=x onerror=alert(1)&gt;', 'Comment text HTML escaping must be verified');

  assert.equal(postCount, 0, 'Comment POST count must be strictly 0');
  assert.equal(deleteCount, 0, 'Comment DELETE count must be strictly 0');
});

test('EmployeePartAUI comment delegation test: _renderNativeCommentMirror delegates to EmployeeCommentMirror', async () => {
  setupMockDocument();
  let getCommentsCalled = false;
  const mockApi = {
    getComments: async () => {
      getCommentsCalled = true;
      return { comments: [], newer: false };
    }
  };

  const container = createMockElement('div');
  const ui = new EmployeePartAUI({
    container,
    isCreate: false,
    kintoneApiWrapper: mockApi,
    record: { $id: { value: '999' }, Status: { value: '01 Draft Objective' } }
  });

  const section = ui._renderNativeCommentMirror();
  assert.ok(section, 'Must return comment section element');

  await new Promise(r => setTimeout(r, 50));
  assert.equal(getCommentsCalled, true, 'Delegated EmployeeCommentMirror must invoke getComments');
});
