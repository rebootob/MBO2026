import test from 'node:test';
import assert from 'node:assert/strict';
import { HoshinService } from '../src/services/hoshin-service.js';

test('HOSHIN_MASTER_GATE: resolves PUBLISHED Department and Section Hoshins for FY2026', () => {
  const hoshinRecords = [
    { Record_ID: '101', Level: 'DEPARTMENT', Department: 'IT', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'Dept Digital Transformation' },
    { Record_ID: '102', Level: 'SECTION', Section: 'Software Dev', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'Sect Agile Delivery' }
  ];

  const res = HoshinService.resolveHoshinForMBO({
    department: 'IT',
    section: 'Software Dev',
    fiscalYear: 'FY2026',
    hoshinRecords
  });

  assert.equal(res.status, 'READY_FOR_MBO');
  assert.equal(res.snapshot.Department_Hoshin_ID, '101');
  assert.equal(res.snapshot.Department_Hoshin_Title, 'Dept Digital Transformation');
  assert.equal(res.snapshot.Section_Hoshin_ID, '102');
  assert.equal(res.snapshot.Section_Hoshin_Title, 'Sect Agile Delivery');
});

test('HOSHIN_MASTER_GATE: NO_DEPARTMENT_HOSHIN when department hoshin is missing', () => {
  const hoshinRecords = [
    { Record_ID: '102', Level: 'SECTION', Section: 'Software Dev', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'Sect Agile Delivery' }
  ];

  assert.throws(
    () => HoshinService.resolveHoshinForMBO({ department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026', hoshinRecords }),
    /NO_DEPARTMENT_HOSHIN/
  );
});

test('HOSHIN_MASTER_GATE: HOSHIN_NOT_PUBLISHED when department hoshin is DRAFT', () => {
  const hoshinRecords = [
    { Record_ID: '101', Level: 'DEPARTMENT', Department: 'IT', Fiscal_Year: 'FY2026', Status: 'DRAFT', Title: 'Draft Hoshin' }
  ];

  assert.throws(
    () => HoshinService.resolveHoshinForMBO({ department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026', hoshinRecords }),
    /HOSHIN_NOT_PUBLISHED/
  );
});

test('HOSHIN_DUAL_LEVEL_GATE: MULTIPLE_ACTIVE_HOSHIN when duplicate published section hoshins exist', () => {
  const hoshinRecords = [
    { Record_ID: '101', Level: 'DEPARTMENT', Department: 'IT', Fiscal_Year: 'FY2026', Status: 'PUBLISHED' },
    { Record_ID: '102', Level: 'SECTION', Section: 'Software Dev', Fiscal_Year: 'FY2026', Status: 'PUBLISHED' },
    { Record_ID: '103', Level: 'SECTION', Section: 'Software Dev', Fiscal_Year: 'FY2026', Status: 'PUBLISHED' }
  ];

  assert.throws(
    () => HoshinService.resolveHoshinForMBO({ department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026', hoshinRecords }),
    /MULTIPLE_ACTIVE_HOSHIN/
  );
});

test('HOSHIN_COPY_FORWARD_GATE: Copy previous MBO discards prior-year hoshin snapshot and resolves NEW FY hoshin', () => {
  const priorMbo = {
    Fiscal_Year: 'FY2025',
    Department_Hoshin_ID: 'OLD_999',
    Department_Hoshin_Title: 'Old 2025 Hoshin'
  };
  const newHoshins = [
    { Record_ID: '201', Level: 'DEPARTMENT', Department: 'IT', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'New 2026 Dept Hoshin' },
    { Record_ID: '202', Level: 'SECTION', Section: 'Software Dev', Fiscal_Year: 'FY2026', Status: 'PUBLISHED', Title: 'New 2026 Sect Hoshin' }
  ];

  const res = HoshinService.generateCopyPreviousHoshinSnapshot({
    priorYearRecord: priorMbo,
    newFiscalYear: 'FY2026',
    newDept: 'IT',
    newSection: 'Software Dev',
    newHoshinRecords: newHoshins
  });

  assert.equal(res.snapshot.Department_Hoshin_ID, '201');
  assert.equal(res.snapshot.Department_Hoshin_Title, 'New 2026 Dept Hoshin');
  assert.notEqual(res.snapshot.Department_Hoshin_ID, 'OLD_999');
});

test('HOSHIN_SNAPSHOT_GATE: migration preserves source hoshin or sets SOURCE_NOT_AVAILABLE without fabricating current hoshin', () => {
  const resAvailable = HoshinService.processMigrationHoshinSnapshot({
    Fiscal_Year: 'FY2022',
    Department_Hoshin_ID: 'H99',
    Department_Hoshin_Title: 'Hist Hoshin',
    Department_Hoshin_Snapshot: '{"id":"H99"}'
  });
  assert.equal(resAvailable.Department_Hoshin_ID, 'H99');

  const resMissing = HoshinService.processMigrationHoshinSnapshot({
    Fiscal_Year: 'FY2022'
  });
  assert.equal(resMissing.Department_Hoshin_ID, 'SOURCE_NOT_AVAILABLE');
});
