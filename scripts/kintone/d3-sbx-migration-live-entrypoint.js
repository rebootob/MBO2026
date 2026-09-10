import {
  D3_ALLOWED_WRITE_APP_IDS,
  D3_GUARD_READ_APP_IDS,
  D3_FORBIDDEN_WRITE_APP_IDS,
  executeD3GuardedLiveMigration
} from './d3-sbx-migration-live-runner.js';
import {
  assertD3BindingMatchesRunnerContract,
  createD3FileAuthorizationLedger,
  createD3KintoneIoAdapter
} from './d3-sbx-migration-live-binding.js';

export function createD3BoundMigrationExecutor({
  transport,
  readAppSnapshot,
  authorizationLedgerDirectory
}) {
  assertD3BindingMatchesRunnerContract({
    allowedReadAppIds: D3_GUARD_READ_APP_IDS,
    allowedWriteAppIds: D3_ALLOWED_WRITE_APP_IDS,
    forbiddenWriteAppIds: D3_FORBIDDEN_WRITE_APP_IDS
  });

  const io = createD3KintoneIoAdapter({ transport, readAppSnapshot });
  const authorizationLedger = createD3FileAuthorizationLedger({
    directory: authorizationLedgerDirectory
  });

  return Object.freeze({
    async execute(args) {
      return executeD3GuardedLiveMigration({
        ...args,
        io,
        authorizationLedger
      });
    }
  });
}
