import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import { createD3BoundMigrationExecutor } from '../scripts/kintone/d3-sbx-migration-live-entrypoint.js';

test('canonical live entrypoint creation is side-effect free', () => {
  let transportCalls = 0;
  let snapshotReads = 0;
  const executor = createD3BoundMigrationExecutor({
    transport: {
      async request() {
        transportCalls += 1;
        return { revision: '1' };
      }
    },
    async readAppSnapshot() {
      snapshotReads += 1;
      return {};
    },
    authorizationLedgerDirectory: path.resolve('.tmp-d3-preexec-r1-ledger-test')
  });

  assert.equal(typeof executor.execute, 'function');
  assert.equal(transportCalls, 0);
  assert.equal(snapshotReads, 0);
});
