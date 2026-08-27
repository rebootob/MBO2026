import test from 'node:test';
import assert from 'node:assert/strict';
import { HoshinService } from '../src/services/hoshin-service.js';

test('HOSHIN_CODE_AUTHORITY: code match succeeds for Department and Section', () => {
  const hoshinRecords = [
    {
      Hoshin_Key: 'H1',
      Scope_Type: 'DEPARTMENT',
      Department_Code: 'IT',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'YES', Active: 'Active',
      Hoshin_TH: 'IT Hoshin'
    },
    {
      Hoshin_Key: 'H2',
      Scope_Type: 'SECTION',
      Section_Code: 'Software Dev',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'YES', Active: 'Active',
      Hoshin_TH: 'Sect Hoshin'
    }
  ];

  const res = HoshinService.resolveHoshinForMBO({
    department: 'IT',
    section: 'Software Dev',
    fiscalYear: 'FY2026',
    hoshinRecords
  });

  assert.equal(res.status, 'READY_FOR_MBO');
  assert.equal(res.snapshot.Department_Hoshin_Title, 'IT Hoshin');
});

test('HOSHIN_ORGANIZATION_MISMATCH: throws ORGANIZATION_MISMATCH when department/section codes do not match', () => {
  const hoshinRecords = [
    {
      Hoshin_Key: 'H1',
      Scope_Type: 'DEPARTMENT',
      Department_Code: 'HR', // Wrong code for IT request
      Department_Name: 'IT Department', // Name matches but code is HR
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'YES', Active: 'Active'
    }
  ];

  assert.throws(
    () => HoshinService.resolveHoshinForMBO({ department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026', hoshinRecords }),
    /ORGANIZATION_MISMATCH/
  );
});

test('HOSHIN_EFFECTIVE_DATE_INCLUSIVE: date range comparison is inclusive of calendar date and throws HOSHIN_OUTSIDE_EFFECTIVE_DATE when outside', () => {
  const hoshinRecords = [
    {
      Hoshin_Key: 'H1',
      Scope_Type: 'DEPARTMENT',
      Department_Code: 'IT',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'YES', Active: 'Active',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Hoshin_TH: 'IT Hoshin'
    },
    {
      Hoshin_Key: 'H2',
      Scope_Type: 'SECTION',
      Section_Code: 'Software Dev',
      Fiscal_Year: 'FY2026',
      Hoshin_Status: 'CURRENT_READY', Ready_For_MBO: 'YES', Active: 'Active',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Hoshin_TH: 'Sect Hoshin'
    }
  ];

  // Inside range (late in the day on 2027-03-31)
  const validRes = HoshinService.resolveHoshinForMBO({
    department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026',
    effectiveDate: '2027-03-31T23:59:59Z',
    hoshinRecords
  });
  assert.equal(validRes.status, 'READY_FOR_MBO');

  // Before Effective_From -> throws HOSHIN_OUTSIDE_EFFECTIVE_DATE
  assert.throws(
    () => HoshinService.resolveHoshinForMBO({
      department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026',
      effectiveDate: '2026-03-31',
      hoshinRecords
    }),
    /HOSHIN_OUTSIDE_EFFECTIVE_DATE/
  );

  // After Effective_To -> throws HOSHIN_OUTSIDE_EFFECTIVE_DATE
  assert.throws(
    () => HoshinService.resolveHoshinForMBO({
      department: 'IT', section: 'Software Dev', fiscalYear: 'FY2026',
      effectiveDate: '2027-04-01',
      hoshinRecords
    }),
    /HOSHIN_OUTSIDE_EFFECTIVE_DATE/
  );
});
