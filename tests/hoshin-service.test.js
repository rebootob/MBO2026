import test from 'node:test';
import assert from 'node:assert/strict';
import { HoshinService } from '../src/services/hoshin-service.js';

test('HOSHIN_REAL_SCHEMA_ADAPTER: adapts physical App 797 status/active fields into canonical status', () => {
  const pub = { Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'YES', Active: 'Active' };
  assert.equal(HoshinService.getCanonicalHoshinStatus(pub), 'PUBLISHED');

  const ready = { Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'NO', Active: 'Active' };
  assert.equal(HoshinService.getCanonicalHoshinStatus(ready), 'READY');

  const draft = { Hoshin_Status: 'DRAFT', Active: 'Active' };
  assert.equal(HoshinService.getCanonicalHoshinStatus(draft), 'DRAFT');

  const inactive = { Hoshin_Status: 'SUPERSEDED', Active: 'Inactive' };
  assert.equal(HoshinService.getCanonicalHoshinStatus(inactive), 'INACTIVE');
});

test('HOSHIN_REAL_SCHEMA_ADAPTER: resolves Department and Section Hoshin from real App 797 physical fields', () => {
  const hoshinRecords = [
    {
      Hoshin_Key: 'HOSH_DEPT_001',
      Scope_Type: 'DEPARTMENT',
      Department_Code: 'IT',
      Department_Name: 'IT Department',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY',
      Ready_For_MBO: 'YES',
      Active: 'Active',
      Hoshin_TH: 'ยุทธศาสตร์ IT 2569'
    },
    {
      Hoshin_Key: 'HOSH_SECT_001',
      Scope_Type: 'SECTION',
      Section_Code: 'Software Dev',
      Section_Name: 'Software Dev Section',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY',
      Ready_For_MBO: 'YES',
      Active: 'Active',
      Hoshin_TH: 'เป้าหมายพัฒนาซอฟต์แวร์ 2569'
    }
  ];

  const res = HoshinService.resolveHoshinForMBO({
    department: 'IT',
    section: 'Software Dev',
    fiscalYear: 'FY2026',
    hoshinRecords
  });

  assert.equal(res.status, 'READY_FOR_MBO');
  assert.equal(res.snapshot.Department_Hoshin_Title, 'ยุทธศาสตร์ IT 2569');
  assert.equal(res.snapshot.Section_Hoshin_Title, 'เป้าหมายพัฒนาซอฟต์แวร์ 2569');
});

test('HOSHIN_REAL_SCHEMA_ADAPTER: legacy migration historical hoshin strings (Text_area / Text_area_0) preserved without App 797 lookup', () => {
  const legacyRecord = {
    Drop_down_year: 'FY\'2022',
    Text_area: 'Historical Department Hoshin 2022',
    Text_area_0: 'Historical Section Hoshin 2022'
  };

  const res = HoshinService.processMigrationHoshinSnapshot(legacyRecord);
  assert.equal(res.Department_Hoshin_Title, 'Historical Department Hoshin 2022');
  assert.equal(res.Section_Hoshin_Title, 'Historical Section Hoshin 2022');
  assert.equal(res.Department_Hoshin_ID, 'HISTORICAL_LEGACY_SOURCE');
});
