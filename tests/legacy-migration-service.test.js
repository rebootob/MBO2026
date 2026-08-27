import test from 'node:test';
import assert from 'node:assert/strict';
import { LegacyMigrationService, LEGACY_APP_PROFILE_MAP } from '../src/services/legacy-migration-service.js';

test('LEGACY_MIGRATION_REAL_CONTRACT: maps legacy apps 283,305,307,310,640,643,715,716 to exact Profile_Code values', () => {
  assert.equal(LEGACY_APP_PROFILE_MAP[283], 'PROF_STAFF_CHIEF');
  assert.equal(LEGACY_APP_PROFILE_MAP[305], 'PROF_SECTION_MGR');
  assert.equal(LEGACY_APP_PROFILE_MAP[307], 'PROF_DGM');
  assert.equal(LEGACY_APP_PROFILE_MAP[310], 'PROF_ASST_MGR');
  assert.equal(LEGACY_APP_PROFILE_MAP[640], 'PROF_GM');
  assert.equal(LEGACY_APP_PROFILE_MAP[643], 'PROF_SENIOR_MGR');
  assert.equal(LEGACY_APP_PROFILE_MAP[715], 'PROF_VP');
  assert.equal(LEGACY_APP_PROFILE_MAP[716], 'PROF_JAPANESE_STAFF');
});

test('LEGACY_MIGRATION_REAL_CONTRACT: normalizes Drop_down_year values without hardcoded FY2022 fallback', () => {
  assert.equal(LegacyMigrationService.normalizeFiscalYear("FY'2021"), 'FY2021');
  assert.equal(LegacyMigrationService.normalizeFiscalYear('2025'), 'FY2025');
  assert.equal(LegacyMigrationService.normalizeFiscalYear(''), null);
});

test('LEGACY_MIGRATION_REAL_CONTRACT: resolves Employee_Code from Text_name via authoritative mapping table', () => {
  const mappings = { 'Somchai Prasert': 'EMP001' };
  assert.deepEqual(LegacyMigrationService.resolveEmployeeIdentity('Somchai Prasert', mappings), {
    status: 'EMPLOYEE_MAPPED',
    employeeCode: 'EMP001'
  });
  assert.deepEqual(LegacyMigrationService.resolveEmployeeIdentity('Unknown Person', mappings), {
    status: 'EMPLOYEE_MAPPING_NOT_FOUND',
    employeeCode: null
  });
});

test('LEGACY_MIGRATION_REAL_CONTRACT: classifies attachments as ATTACHMENT_TRANSFER_PENDING instead of PRESERVED', () => {
  const legacyData = {
    '283': [
      {
        $id: '1',
        Drop_down_year: "FY'2021",
        Text_name: 'Somchai Prasert',
        Attachment: [{ fileKey: 'fk1', name: 'evidence.pdf' }]
      }
    ]
  };

  const mappings = { 'Somchai Prasert': 'EMP001' };
  const res = LegacyMigrationService.executeDryRunMigration({ legacyRecordsMap: legacyData, employeeMappings: mappings });

  assert.equal(res.status, 'MIGRATION_DRY_RUN_COMPLETE');
  assert.equal(res.candidates.length, 1);
  assert.equal(res.candidates[0].provenance[0].attachmentProvenance, 'ATTACHMENT_TRANSFER_PENDING');
  assert.equal(res.counters.UNEXPLAINED_DATA_LOSS, 0);
});
