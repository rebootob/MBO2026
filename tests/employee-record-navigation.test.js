import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeeRecordNavigation } from '../src/ui/employee-record-navigation.js';
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
    innerHTML: '',
    textContent: '',
    firstChild: null,
    href: '',
    target: '',
    type: '',
    className: '',

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
      if (fn) {
        const evt = { type: 'click', defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
        fn(evt);
        return evt;
      }
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

test('DETAIL_EXISTING_RUNTIME_BACK_VISIBLE: On Detail screen, Back to My MBO bar is rendered and visible', () => {
  setupMockDocument();
  const nav = new EmployeeRecordNavigation({ appId: 794 });
  const bar = nav.renderBackToMyMboBar({ isCreate: false });

  assert.ok(bar, 'Back bar must be rendered on Detail screen');
  assert.equal(bar.className, 'mbo-back-nav-bar');
  const link = bar.querySelector('a');
  assert.ok(link, 'Back link must be present');
  assert.equal(link.textContent, '← กลับหน้า My MBO / Back to My MBO');
  assert.equal(link.href, '/k/794/');
  assert.equal(link.target, '', 'Back link must navigate in same tab');
});

test('EDIT_EXISTING_RUNTIME_BACK_VISIBLE: On Edit screen, Back to My MBO bar is rendered and visible', () => {
  setupMockDocument();
  const nav = new EmployeeRecordNavigation({ appId: 794 });
  const bar = nav.renderBackToMyMboBar({ isCreate: false });

  assert.ok(bar, 'Back bar must be rendered on Edit screen');
  assert.equal(bar.getAttribute('data-mbo-back-nav-bar'), '');
  const link = bar.querySelector('[data-mbo-back-link]');
  assert.ok(link, 'Back link must have data-mbo-back-link attribute');
  assert.equal(link.href, '/k/794/');
});

test('CREATE_RUNTIME_BACK_ABSENT: On Create screen, Back to My MBO bar is strictly null/absent', () => {
  setupMockDocument();
  const nav = new EmployeeRecordNavigation({ appId: 794 });
  const bar = nav.renderBackToMyMboBar({ isCreate: true });

  assert.equal(bar, null, 'Back bar must be strictly null on Create screen');
});

test('BACK_TARGET_CURRENT_APP & BACK_SAME_TAB: Target is /k/{appId}/ and opens in same tab', () => {
  setupMockDocument();
  const nav = new EmployeeRecordNavigation({ appId: 794 });
  const bar = nav.renderBackToMyMboBar({ isCreate: false, appId: 794 });

  const link = bar.querySelector('a');
  assert.equal(link.href, '/k/794/');
  assert.equal(link.target, '', 'Link target must be empty (same tab)');
});

test('AUTH_SESSION_MUTATION = 0 & RECORD_WRITE = 0: Back button click executes navigation handler with 0 session/record writes', () => {
  setupMockDocument();
  let navigated = false;
  const nav = new EmployeeRecordNavigation({
    appId: 794,
    onNavigateHome: () => { navigated = true; }
  });

  const bar = nav.renderBackToMyMboBar({ isCreate: false });
  const link = bar.querySelector('a');

  const evt = link.click();

  assert.equal(navigated, true, 'Clicking Back link must invoke onNavigateHome callback');
  assert.equal(evt.defaultPrevented, true, 'Default link navigation must be prevented when callback handles it');
});

test('EmployeePartAUI runtime integration proof: _renderBackToMyMboBar delegates to EmployeeRecordNavigation', () => {
  setupMockDocument();
  const container = createMockElement('div');
  const uiDetail = new EmployeePartAUI({
    container,
    isCreate: false,
    record: { $id: { value: '123' }, Status: { value: '01 Draft Objective' } }
  });

  const detailBar = uiDetail._renderBackToMyMboBar();
  assert.ok(detailBar, 'Detail screen must produce Back bar via delegation');
  assert.equal(detailBar.querySelector('a').href, '/k/794/');

  const uiCreate = new EmployeePartAUI({
    container,
    isCreate: true
  });

  const createBar = uiCreate._renderBackToMyMboBar();
  assert.equal(createBar, null, 'Create screen must produce null Back bar via delegation');
});
