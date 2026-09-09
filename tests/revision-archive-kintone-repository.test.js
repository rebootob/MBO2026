import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RevisionArchiveKintoneRepository,
  RevisionArchiveRepositoryError,
  REVISION_ARCHIVE_APP_ID
} from '../src/services/revision-archive-kintone-repository.js';

test('Repository: requires injected API adapter with getRecords and addRecord', () => {
  assert.throws(
    () => new RevisionArchiveKintoneRepository(null),
    (err) => {
      assert.equal(err instanceof RevisionArchiveRepositoryError, true);
      assert.equal(err.code, 'INJECTED_API_REQUIRED');
      return true;
    }
  );

  assert.throws(
    () => new RevisionArchiveKintoneRepository({ getRecords: () => {} }),
    (err) => {
      assert.equal(err.code, 'INJECTED_API_REQUIRED');
      return true;
    }
  );
});

test('Repository: sets target App ID to 798 and rejects caller-selectable appId overrides', () => {
  const repo = new RevisionArchiveKintoneRepository({
    getRecords: async () => ({ records: [] }),
    addRecord: async () => ({ id: 1 })
  });

  assert.equal(repo.appId, 798);
  assert.equal(REVISION_ARCHIVE_APP_ID, 798);

  // options.appId=799 rejected
  assert.throws(
    () => new RevisionArchiveKintoneRepository(
      { getRecords: async () => {}, addRecord: async () => {} },
      { appId: 799 }
    ),
    (err) => {
      assert.equal(err instanceof RevisionArchiveRepositoryError, true);
      assert.equal(err.code, 'ARCHIVE_APP_ID_OVERRIDE_FORBIDDEN');
      return true;
    }
  );

  // options.appId=798 also rejected as caller-selectable override
  assert.throws(
    () => new RevisionArchiveKintoneRepository(
      { getRecords: async () => {}, addRecord: async () => {} },
      { appId: 798 }
    ),
    (err) => {
      assert.equal(err instanceof RevisionArchiveRepositoryError, true);
      assert.equal(err.code, 'ARCHIVE_APP_ID_OVERRIDE_FORBIDDEN');
      return true;
    }
  );
});

test('Repository: findByArchiveKey queries exact Archive_Key with escaping and normalizes fields', async () => {
  let capturedAppId = null;
  let capturedQuery = null;

  const mockApi = {
    getRecords: async (appId, query) => {
      capturedAppId = appId;
      capturedQuery = query;
      return {
        records: [{
          Archive_Key: { value: 'KEY"123' },
          Source_Record_ID: { value: '456' },
          Source_Record_Key: { value: 'FY2026-001' },
          Fiscal_Year: { value: 'FY2026' },
          Employee_Code: { value: '001' },
          Evaluation_Stage: { value: 'OBJECTIVE' },
          Revision_Number: { value: '1' },
          Previous_Status: { value: '05 Objective Approved' },
          Superseded_By_Revision: { value: '2' },
          Event_Type: { value: 'EVALUATION_REVISION_CREATED' },
          Reason: { value: 'HR reopen approved' },
          Snapshot_JSON: { value: '{"source":{}}' },
          Snapshot_Hash: { value: 'hash123' },
          Archived_By: { value: [{ code: 'hr_admin' }] },
          Archived_At: { value: '2026-04-01T00:00:00.000Z' }
        }]
      };
    },
    addRecord: async () => ({ id: 1 })
  };

  const repo = new RevisionArchiveKintoneRepository(mockApi);
  const results = await repo.findByArchiveKey('KEY"123');

  assert.equal(capturedAppId, 798);
  assert.equal(capturedQuery, 'Archive_Key = "KEY\\"123" limit 5');
  assert.equal(results.length, 1);

  const rec = results[0];
  assert.equal(rec.archiveKey, 'KEY"123');
  assert.equal(rec.sourceRecordId, 456);
  assert.equal(rec.sourceRecordKey, 'FY2026-001');
  assert.equal(rec.fiscalYear, 'FY2026');
  assert.equal(rec.employeeCode, '001');
  assert.equal(rec.evaluationStage, 'OBJECTIVE');
  assert.equal(rec.revisionNumber, 1);
  assert.equal(rec.previousStatus, '05 Objective Approved');
  assert.equal(rec.supersededByRevision, 2);
  assert.equal(rec.eventType, 'EVALUATION_REVISION_CREATED');
  assert.equal(rec.reason, 'HR reopen approved');
  assert.equal(rec.snapshotJson, '{"source":{}}');
  assert.equal(rec.snapshotHash, 'hash123');
  assert.deepEqual(rec.archivedBy, [{ code: 'hr_admin' }]);
  assert.equal(rec.archivedAt, '2026-04-01T00:00:00.000Z');
});

test('Repository: createArchiveRecord calls addRecord with target app 798 and returns created id', async () => {
  let capturedAppId = null;
  let capturedPayload = null;

  const mockApi = {
    getRecords: async () => ({ records: [] }),
    addRecord: async (appId, payload) => {
      capturedAppId = appId;
      capturedPayload = payload;
      return { id: 999, revision: 1 };
    }
  };

  const repo = new RevisionArchiveKintoneRepository(mockApi);
  const payload = { Archive_Key: { value: 'KEY1' } };
  const res = await repo.createArchiveRecord(payload);

  assert.equal(capturedAppId, 798);
  assert.equal(capturedPayload, payload);
  assert.equal(res.id, 999);
  assert.equal(res.revision, 1);
});

test('Repository: readBackExactArchiveRecord succeeds when exactly 1 record matches', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [{
        Archive_Key: { value: 'KEY1' },
        Snapshot_Hash: { value: 'sha123' }
      }]
    }),
    addRecord: async () => ({ id: 1 })
  };

  const repo = new RevisionArchiveKintoneRepository(mockApi);
  const rec = await repo.readBackExactArchiveRecord('KEY1');
  assert.equal(rec.archiveKey, 'KEY1');
  assert.equal(rec.snapshotHash, 'sha123');
});

test('Repository: readBackExactArchiveRecord fails closed with ARCHIVE_READBACK_NOT_FOUND when 0 matches', async () => {
  const mockApi = {
    getRecords: async () => ({ records: [] }),
    addRecord: async () => ({ id: 1 })
  };

  const repo = new RevisionArchiveKintoneRepository(mockApi);
  await assert.rejects(
    async () => repo.readBackExactArchiveRecord('MISSING_KEY'),
    (err) => {
      assert.equal(err instanceof RevisionArchiveRepositoryError, true);
      assert.equal(err.code, 'ARCHIVE_READBACK_NOT_FOUND');
      return true;
    }
  );
});

test('Repository: readBackExactArchiveRecord fails closed with ARCHIVE_DUPLICATE_KEY_CORRUPTION when > 1 matches', async () => {
  const mockApi = {
    getRecords: async () => ({
      records: [
        { Archive_Key: { value: 'DUP_KEY' } },
        { Archive_Key: { value: 'DUP_KEY' } }
      ]
    }),
    addRecord: async () => ({ id: 1 })
  };

  const repo = new RevisionArchiveKintoneRepository(mockApi);
  await assert.rejects(
    async () => repo.readBackExactArchiveRecord('DUP_KEY'),
    (err) => {
      assert.equal(err instanceof RevisionArchiveRepositoryError, true);
      assert.equal(err.code, 'ARCHIVE_DUPLICATE_KEY_CORRUPTION');
      return true;
    }
  );
});

test('Repository Immutability: exposes no update or delete operations', () => {
  const repo = new RevisionArchiveKintoneRepository({
    getRecords: async () => ({ records: [] }),
    addRecord: async () => ({ id: 1 })
  });

  assert.equal(typeof repo.updateArchiveRecord, 'undefined');
  assert.equal(typeof repo.deleteArchiveRecord, 'undefined');
  assert.equal(typeof repo.putRecord, 'undefined');
  assert.equal(typeof repo.deleteRecord, 'undefined');
  assert.equal(typeof repo.updateRecord, 'undefined');
});
