import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getRecordUiHost } from '../src/ui/host-resolver.js';

test('Regression: Banned API getHeaderSpaceElement must not be present in src files', () => {
  const files = ['src/main-mbo-app.js', 'src/ui/host-resolver.js', 'src/ui/employee-part-a-ui.js'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      assert.equal(
        content.includes('kintone.app.record.getHeaderSpaceElement'),
        false,
        'File ' + f + ' still contains forbidden API kintone.app.record.getHeaderSpaceElement'
      );
    }
  }
});

test('HostResolver: Resolves space element when available', () => {
  const mockSpace = { id: 'mock-space-element' };
  globalThis.kintone = {
    app: {
      record: {
        getSpaceElement: (id) => (id === 'SPACE_HEADER' ? mockSpace : null),
        getHeaderMenuSpaceElement: () => null
      }
    }
  };

  const resolved = getRecordUiHost('SPACE_HEADER');
  assert.equal(resolved, mockSpace);
});

test('HostResolver: Falls back to getHeaderMenuSpaceElement when space is missing', () => {
  const mockHeader = { id: 'mock-header-element' };
  globalThis.kintone = {
    app: {
      record: {
        getSpaceElement: () => null,
        getHeaderMenuSpaceElement: () => mockHeader
      }
    }
  };

  const resolved = getRecordUiHost('SPACE_HEADER');
  assert.equal(resolved, mockHeader);
});

test('HostResolver: Returns null safely without throwing when neither is available', () => {
  globalThis.kintone = {
    app: {
      record: {
        getSpaceElement: () => null,
        getHeaderMenuSpaceElement: () => null
      }
    }
  };

  const resolved = getRecordUiHost('SPACE_HEADER');
  assert.equal(resolved, null);
});
