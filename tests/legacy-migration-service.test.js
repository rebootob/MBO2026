import test from 'node:test';
import assert from 'node:assert/strict';
import { LegacyMigrationService, LEGACY_APP_PROFILE_MAP } from '../src/services/legacy-migration-service.js';

test('LEGACY_TARGET_APP794_PHYSICAL_SHAPE: candidate contains physical Objective_1..4 fields and does NOT contain logical Objectives array', () => {
  const legacyData = {
    '283': [
      {
        Drop_down_year: "FY'2021",
        Text_name: 'Somchai Prasert',
        Text_area_action_plan_obj1: 'Upgrade DB',
        weight_a_obj1: '50',
        Text_area_actual_result_obj1: 'Achieved 100%',
        dif_level_obj1: '3'
      }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: legacyData, employeeMappings: mappings });

  assert.equal(res.candidates.length, 1);
  const cand = res.candidates[0];

  assert.equal(cand.Record_Key, 'FY2021-EMP001');
  assert.equal(cand.Objective_1, 'Upgrade DB');
  assert.equal(cand.Weight_1, '50');
  assert.equal(cand.Actual_Result_1, 'Achieved 100%');
  assert.equal(cand.Difficulty_1, '3');
  assert.equal('Objectives' in cand, false); // No logical Objectives array!
});

test('LEGACY_SOURCE_TARGET_MAPPING_EVIDENCE: reconciliation entry maps source code to actual target code', () => {
  const legacyData = {
    '283': [
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Text_area_action_plan_obj1: 'Upgrade DB' }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: legacyData, employeeMappings: mappings });

  assert.equal(res.candidates.length, 1);
  const audit = res.candidates[0].provenance[0].fieldBucketAudit;

  const planEntry = audit.find(a => a.sourceFieldCode === 'Text_area_action_plan_obj1');
  assert.equal(planEntry.bucket, 'MAPPED_TO_TARGET');
  assert.equal(planEntry.targetFieldCode, 'Objective_1');

  const fyEntry = audit.find(a => a.sourceFieldCode === 'Drop_down_year');
  assert.equal(fyEntry.targetFieldCode, 'Fiscal_Year');
});

test('LEGACY_FIELD_VALUE_PRESERVATION: extra unknown non-empty historical field stores actual value in provenance.historicalFields', () => {
  const legacyData = {
    '283': [
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Custom_Bonus_Notes: 'Bonus approved 2021' }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: legacyData, employeeMappings: mappings });

  assert.equal(res.candidates.length, 1);
  const prov = res.candidates[0].provenance[0];
  assert.equal(prov.historicalFields.Custom_Bonus_Notes, 'Bonus approved 2021');

  const auditEntry = prov.fieldBucketAudit.find(a => a.sourceFieldCode === 'Custom_Bonus_Notes');
  assert.equal(auditEntry.bucket, 'PRESERVED_IN_PROVENANCE');
  assert.equal(auditEntry.sourceValue, 'Bonus approved 2021');
  assert.equal(res.counters.UNEXPLAINED_FIELD_LOSS, 0);
});

test('LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE: duplicate group with conflict in attachment list requires review', () => {
  const conflictingData = {
    '283': [
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Attachment_File: [{ fileKey: 'K1' }] },
      { Drop_down_year: "FY'2021", Text_name: 'Somchai Prasert', Attachment_File: [{ fileKey: 'K2' }] }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: conflictingData, employeeMappings: mappings });

  assert.equal(res.candidates.length, 0);
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
