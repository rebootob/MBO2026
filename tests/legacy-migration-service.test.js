import test from 'node:test';
import assert from 'node:assert/strict';
import { LegacyMigrationService, LEGACY_APP_IDS } from '../src/services/legacy-migration-service.js';

test('GATE3_MIGRATION_DRY_RUN: processes 8 legacy apps and generates dry-run candidates with zero unexplained data loss', () => {
  assert.equal(LEGACY_APP_IDS.length, 8);

  const mockLegacyData = {
    '283': [
      { $id: '1', $revision: '2', Fiscal_Year: 'FY2022', Employee_Code: 'EMP001', Employee_Name: 'Somchai' },
      { $id: '2', $revision: '1', Fiscal_Year: 'FY2022', Employee_Code: 'EMP002', Employee_Name: 'Somsri' }
    ],
    '305': [
      { $id: '10', $revision: '3', Fiscal_Year: 'FY2022', Employee_Code: 'EMP001', Employee_Name: 'Somchai' } // Duplicate FY/Employee to be merged
    ],
    '640': [
      { $id: '99', $revision: '1', Fiscal_Year: '', Employee_Code: '' } // Invalid record to be skipped
    ]
  };

  const result = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: mockLegacyData });

  assert.equal(result.status, 'MIGRATION_DRY_RUN_COMPLETE');
  assert.equal(result.counters.SOURCE_RECORDS, 4);
  assert.equal(result.counters.LOGICAL_MBO_GROUPS, 2);
  assert.equal(result.counters.SUCCESS, 2);
  assert.equal(result.counters.MERGED, 1);
  assert.equal(result.counters.SKIPPED_EXPLAINED, 1);
  assert.equal(result.counters.FAILED, 0);
  assert.equal(result.counters.UNEXPLAINED_DATA_LOSS, 0);

  const emp1Candidate = result.candidates.find(c => c.Employee_Code === 'EMP001');
  assert.ok(emp1Candidate);
  assert.equal(emp1Candidate.provenance.length, 2);
});
