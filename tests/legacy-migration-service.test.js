import test from 'node:test';
import assert from 'node:assert/strict';
import { LegacyMigrationService, LEGACY_APP_PROFILE_MAP } from '../src/services/legacy-migration-service.js';

test('LEGACY_DUPLICATE_CONFLICT_FAIL_CLOSED: classifies conflicting duplicate source records as REVIEW_REQUIRED_DUPLICATE_SOURCE without selecting primary winner', () => {
  const conflictingData = {
    '283': [
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Text_area_action_plan_obj1: 'Obj Version A' },
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Text_area_action_plan_obj1: 'Obj Version B' }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: conflictingData, employeeMappings: mappings });

  assert.equal(res.status, 'MIGRATION_DRY_RUN_COMPLETE');
  assert.equal(res.candidates.length, 0); // No candidate generated for conflicting duplicate!
  assert.equal(res.reviewRequiredGroups.length, 1);
  assert.equal(res.reviewRequiredGroups[0].status, 'REVIEW_REQUIRED_DUPLICATE_SOURCE');
});

test('FABRICATED_SOURCE_ID_REVISION: missing source record ID or revision produces null + explicit status, never "1"', () => {
  const legacyData = {
    '283': [
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert' }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: legacyData, employeeMappings: mappings });

  assert.equal(res.candidates.length, 1);
  const prov = res.candidates[0].provenance[0];
  assert.equal(prov.sourceRecordId, null);
  assert.equal(prov.sourceRecordIdStatus, 'SOURCE_RECORD_ID_UNAVAILABLE');
  assert.equal(prov.sourceRevision, null);
  assert.equal(prov.sourceRevisionStatus, 'SOURCE_REVISION_UNAVAILABLE');
});

test('FIELD_AWARE_RECONCILIATION: equivalent duplicate records merge cleanly and retain provenance from all source records', () => {
  const equivalentData = {
    '283': [
      { $id: '100', Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Text_area_action_plan_obj1: 'Same Obj' },
      { $id: '101', Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Text_area_action_plan_obj1: 'Same Obj' }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: equivalentData, employeeMappings: mappings });

  assert.equal(res.candidates.length, 1);
  assert.equal(res.counters.MERGED, 1);
  assert.equal(res.candidates[0].provenance.length, 2);
  assert.equal(res.counters.UNEXPLAINED_DATA_LOSS, 0);
});
