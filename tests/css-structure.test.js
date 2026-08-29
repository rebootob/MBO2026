import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('CSS Structure & Scope: Source CSS must be syntactically balanced with 0 unclosed braces and top-level WP2 feature selectors', () => {
  const cssPath = path.resolve('src/styles/mbo-employee.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  let openBraces = 0;
  const selectorDepths = new Map();
  const lines = cssContent.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Record depth BEFORE opening brace on target selectors
    const targetSelectors = [
      '.mbo-back-nav-bar',
      '.mbo-btn-back-home',
      '.mbo-my-mbo-table',
      '.mbo-native-comment-mirror',
      '.mbo-comment-table'
    ];

    targetSelectors.forEach(sel => {
      if (trimmed.startsWith(sel) && trimmed.includes('{')) {
        selectorDepths.set(sel, openBraces);
      }
    });

    for (const ch of line) {
      if (ch === '{') openBraces++;
      if (ch === '}') openBraces--;
    }
  });

  // 1. Overall brace balance must be strictly 0
  assert.equal(openBraces, 0, 'src/styles/mbo-employee.css must have perfectly balanced braces (openBraces === 0)');

  // 2. All target feature selectors must open at top-level scope (depth === 0)
  assert.ok(selectorDepths.has('.mbo-back-nav-bar'), '.mbo-back-nav-bar selector must exist');
  assert.equal(selectorDepths.get('.mbo-back-nav-bar'), 0, '.mbo-back-nav-bar must be defined at top-level scope (depth 0)');

  assert.ok(selectorDepths.has('.mbo-btn-back-home'), '.mbo-btn-back-home selector must exist');
  assert.equal(selectorDepths.get('.mbo-btn-back-home'), 0, '.mbo-btn-back-home must be defined at top-level scope (depth 0)');

  assert.ok(selectorDepths.has('.mbo-my-mbo-table'), '.mbo-my-mbo-table selector must exist');
  assert.equal(selectorDepths.get('.mbo-my-mbo-table'), 0, '.mbo-my-mbo-table must be defined at top-level scope (depth 0)');

  assert.ok(selectorDepths.has('.mbo-native-comment-mirror'), '.mbo-native-comment-mirror selector must exist');
  assert.equal(selectorDepths.get('.mbo-native-comment-mirror'), 0, '.mbo-native-comment-mirror must be defined at top-level scope (depth 0)');

  assert.ok(selectorDepths.has('.mbo-comment-table'), '.mbo-comment-table selector must exist');
  assert.equal(selectorDepths.get('.mbo-comment-table'), 0, '.mbo-comment-table must be defined at top-level scope (depth 0)');
});
