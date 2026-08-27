/**
 * Hoshin Governance & MBO Integration Service (App 797 Master Real Schema Adapter)
 */

import { readString, unwrapField } from '../core/kintone-normalizer.js';

export class HoshinService {
  /**
   * Adapts physical App 797 status/active fields into canonical Hoshin status.
   */
  static getCanonicalHoshinStatus(record) {
    if (!record || typeof record !== 'object') return 'INACTIVE';
    const status = readString(record, 'Hoshin_Status');
    const readyForMbo = readString(record, 'Ready_For_MBO');
    const active = readString(record, 'Active');

    if (active === 'Inactive' || status === 'SUPERSEDED') return 'INACTIVE';
    if (status === 'DRAFT') return 'DRAFT';
    if (status === 'CURRENT_READY' && readyForMbo === 'YES' && active === 'Active') return 'PUBLISHED';
    if (status === 'CURRENT_READY' && readyForMbo === 'NO' && active === 'Active') return 'READY';
    return 'INACTIVE';
  }

  /**
   * Strict calendar date parser with real YYYY-MM-DD boundary verification.
   * Returns 'INVALID_DATE' if date string is malformed or invalid calendar date (e.g. 2026-99-99, 2026-02-30).
   */
  static toCalendarDateString(dateInput) {
    if (!dateInput) return null;

    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const parts = trimmed.split('-').map(Number);
        const y = parts[0];
        const m = parts[1];
        const d = parts[2];
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        if (
          dateObj.getUTCFullYear() === y &&
          dateObj.getUTCMonth() === m - 1 &&
          dateObj.getUTCDate() === d
        ) {
          return trimmed;
        }
        return 'INVALID_DATE';
      }
      return 'INVALID_DATE';
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'INVALID_DATE';
    return d.toISOString().slice(0, 10);
  }

  /**
   * Resolves dual-level (Department + Section) PUBLISHED Hoshin records for MBO Creation.
   * Uses real App797 physical fields only (Scope_Type, Scope_Code, Department_Code, Section_Code).
   */
  static resolveHoshinForMBO({ department, section, fiscalYear, effectiveDate = new Date(), hoshinRecords = [] }) {
    if (!department || !section || !fiscalYear) {
      throw new Error('HOSHIN_RESOLUTION_INVALID: department, section, and fiscalYear are required.');
    }

    const cleanDeptCode = String(department).trim();
    const cleanSectCode = String(section).trim();
    const cleanFY = String(fiscalYear).trim();

    const targetCalDate = this.toCalendarDateString(effectiveDate);
    if (!targetCalDate || targetCalDate === 'INVALID_DATE') {
      throw new Error('HOSHIN_INVALID_EFFECTIVE_DATE: Target effective date is invalid.');
    }

    // 1. Filter records matching FY
    const fyRecords = hoshinRecords.filter(rec => readString(rec, 'Fiscal_Year') === cleanFY);

    // 2. Filter scope records using real physical field Scope_Type
    const deptScopeRecords = fyRecords.filter(rec => readString(rec, 'Scope_Type') === 'DEPARTMENT');
    const sectScopeRecords = fyRecords.filter(rec => readString(rec, 'Scope_Type') === 'SECTION');

    // Check organization code authority using Scope_Code / Department_Code / Section_Code
    if (deptScopeRecords.length > 0) {
      const hasCodeMatch = deptScopeRecords.some(rec => {
        const scopeCode = readString(rec, 'Scope_Code');
        const deptCode = readString(rec, 'Department_Code');
        return scopeCode === cleanDeptCode || deptCode === cleanDeptCode;
      });
      if (!hasCodeMatch) {
        throw new Error(`ORGANIZATION_MISMATCH: Department code '${cleanDeptCode}' does not match Hoshin record Scope_Code/Department_Code.`);
      }
    }

    if (sectScopeRecords.length > 0) {
      const hasCodeMatch = sectScopeRecords.some(rec => {
        const scopeCode = readString(rec, 'Scope_Code');
        const sectCode = readString(rec, 'Section_Code');
        return scopeCode === cleanSectCode || sectCode === cleanSectCode;
      });
      if (!hasCodeMatch) {
        throw new Error(`ORGANIZATION_MISMATCH: Section code '${cleanSectCode}' does not match Hoshin record Scope_Code/Section_Code.`);
      }
    }

    // 3. Department Hoshin resolution with calendar-date effective range
    const deptMatches = [];
    let deptOutsideEffectiveDate = false;
    let deptNotPublished = false;

    for (const rec of deptScopeRecords) {
      const scopeCode = readString(rec, 'Scope_Code');
      const deptCode = readString(rec, 'Department_Code');
      const isCodeMatch = (scopeCode === cleanDeptCode || deptCode === cleanDeptCode);

      if (!isCodeMatch) continue;

      const canonicalStatus = this.getCanonicalHoshinStatus(rec);
      if (canonicalStatus !== 'PUBLISHED') {
        deptNotPublished = true;
        continue;
      }

      // Check effective dates strictly
      const rawEffFrom = readString(rec, 'Effective_From');
      const rawEffTo = readString(rec, 'Effective_To');

      const effFromCal = this.toCalendarDateString(rawEffFrom);
      const effToCal = this.toCalendarDateString(rawEffTo);

      if (effFromCal === 'INVALID_DATE' || effToCal === 'INVALID_DATE') {
        throw new Error(`HOSHIN_INVALID_EFFECTIVE_DATE: Department Hoshin for ${cleanDeptCode} has malformed effective date.`);
      }

      if (effFromCal && targetCalDate < effFromCal) {
        deptOutsideEffectiveDate = true;
        continue;
      }
      if (effToCal && targetCalDate > effToCal) {
        deptOutsideEffectiveDate = true;
        continue;
      }

      deptMatches.push(rec);
    }

    if (deptMatches.length === 0) {
      if (deptOutsideEffectiveDate) {
        throw new Error(`HOSHIN_OUTSIDE_EFFECTIVE_DATE: Department Hoshin for ${cleanDeptCode} is outside effective period.`);
      }
      if (deptNotPublished) {
        throw new Error(`HOSHIN_NOT_PUBLISHED: Department Hoshin for ${cleanDeptCode} is not in PUBLISHED status.`);
      }
      throw new Error(`NO_DEPARTMENT_HOSHIN: No PUBLISHED Department Hoshin found for ${cleanDeptCode} FY ${cleanFY}.`);
    }

    if (deptMatches.length > 1) {
      throw new Error(`MULTIPLE_ACTIVE_HOSHIN: Multiple active PUBLISHED Department Hoshins found for ${cleanDeptCode} FY ${cleanFY}.`);
    }

    const deptHoshin = deptMatches[0];

    // 4. Section Hoshin resolution
    const sectMatches = [];
    let sectOutsideEffectiveDate = false;
    let sectNotPublished = false;

    for (const rec of sectScopeRecords) {
      const scopeCode = readString(rec, 'Scope_Code');
      const sectCode = readString(rec, 'Section_Code');
      const isCodeMatch = (scopeCode === cleanSectCode || sectCode === cleanSectCode);

      if (!isCodeMatch) continue;

      const canonicalStatus = this.getCanonicalHoshinStatus(rec);
      if (canonicalStatus !== 'PUBLISHED') {
        sectNotPublished = true;
        continue;
      }

      const rawEffFrom = readString(rec, 'Effective_From');
      const rawEffTo = readString(rec, 'Effective_To');

      const effFromCal = this.toCalendarDateString(rawEffFrom);
      const effToCal = this.toCalendarDateString(rawEffTo);

      if (effFromCal === 'INVALID_DATE' || effToCal === 'INVALID_DATE') {
        throw new Error(`HOSHIN_INVALID_EFFECTIVE_DATE: Section Hoshin for ${cleanSectCode} has malformed effective date.`);
      }

      if (effFromCal && targetCalDate < effFromCal) {
        sectOutsideEffectiveDate = true;
        continue;
      }
      if (effToCal && targetCalDate > effToCal) {
        sectOutsideEffectiveDate = true;
        continue;
      }

      sectMatches.push(rec);
    }

    if (sectMatches.length === 0) {
      if (sectOutsideEffectiveDate) {
        throw new Error(`HOSHIN_OUTSIDE_EFFECTIVE_DATE: Section Hoshin for ${cleanSectCode} is outside effective period.`);
      }
      if (sectNotPublished) {
        throw new Error(`HOSHIN_NOT_PUBLISHED: Section Hoshin for ${cleanSectCode} is not in PUBLISHED status.`);
      }
      throw new Error(`NO_SECTION_HOSHIN: No PUBLISHED Section Hoshin found for ${cleanSectCode} FY ${cleanFY}.`);
    }

    if (sectMatches.length > 1) {
      throw new Error(`MULTIPLE_ACTIVE_HOSHIN: Multiple active PUBLISHED Section Hoshins found for ${cleanSectCode} FY ${cleanFY}.`);
    }

    const sectHoshin = sectMatches[0];

    // 5. Construct clean normalized snapshot using real physical fields Hoshin_TH / Hoshin_EN / Hoshin_Key / $id
    const nowIso = new Date().toISOString();
    const deptTitle = readString(deptHoshin, 'Hoshin_TH') || readString(deptHoshin, 'Hoshin_EN');
    const sectTitle = readString(sectHoshin, 'Hoshin_TH') || readString(sectHoshin, 'Hoshin_EN');
    const deptId = String(deptHoshin.$id?.value || deptHoshin.$id || deptHoshin.Hoshin_Key || '');
    const sectId = String(sectHoshin.$id?.value || sectHoshin.$id || sectHoshin.Hoshin_Key || '');

    return {
      status: 'READY_FOR_MBO',
      snapshot: {
        Hoshin_Fiscal_Year: cleanFY,
        Department_Hoshin_ID: deptId,
        Department_Hoshin_Title: deptTitle,
        Department_Hoshin_Snapshot: JSON.stringify({
          hoshinKey: readString(deptHoshin, 'Hoshin_Key'),
          departmentCode: readString(deptHoshin, 'Department_Code') || readString(deptHoshin, 'Scope_Code'),
          departmentName: readString(deptHoshin, 'Department_Name') || readString(deptHoshin, 'Scope_Name'),
          hoshinTH: readString(deptHoshin, 'Hoshin_TH'),
          hoshinEN: readString(deptHoshin, 'Hoshin_EN'),
          version: readString(deptHoshin, 'Version')
        }),
        Section_Hoshin_ID: sectId,
        Section_Hoshin_Title: sectTitle,
        Section_Hoshin_Snapshot: JSON.stringify({
          hoshinKey: readString(sectHoshin, 'Hoshin_Key'),
          sectionCode: readString(sectHoshin, 'Section_Code') || readString(sectHoshin, 'Scope_Code'),
          sectionName: readString(sectHoshin, 'Section_Name') || readString(sectHoshin, 'Scope_Name'),
          hoshinTH: readString(sectHoshin, 'Hoshin_TH'),
          hoshinEN: readString(sectHoshin, 'Hoshin_EN'),
          version: readString(sectHoshin, 'Version')
        }),
        Hoshin_Snapshot_At: nowIso
      }
    };
  }

  /**
   * Copy Previous MBO resolves NEW fiscal-year Hoshin from App 797, never reuses prior-year snapshot.
   */
  static generateCopyPreviousHoshinSnapshot({ priorYearRecord, newFiscalYear, newDept, newSection, newHoshinRecords = [] }) {
    if (!priorYearRecord) throw new Error('priorYearRecord is required.');
    return this.resolveHoshinForMBO({
      department: newDept,
      section: newSection,
      fiscalYear: newFiscalYear,
      hoshinRecords: newHoshinRecords
    });
  }

  /**
   * Legacy Migration: Preserves historical source Hoshin strings (Text_area / Text_area_0) or marks SOURCE_NOT_AVAILABLE.
   * NEVER resolves App 797 backwards for legacy migration!
   */
  static processMigrationHoshinSnapshot(sourceRecord) {
    const deptText = readString(sourceRecord, 'Text_area') || readString(sourceRecord, 'Department_Hoshin_Title');
    const sectText = readString(sourceRecord, 'Text_area_0') || readString(sourceRecord, 'Section_Hoshin_Title');

    if (deptText || sectText) {
      return {
        Hoshin_Fiscal_Year: readString(sourceRecord, 'Drop_down_year') || readString(sourceRecord, 'Fiscal_Year'),
        Department_Hoshin_ID: 'HISTORICAL_LEGACY_SOURCE',
        Department_Hoshin_Title: deptText || 'SOURCE_NOT_AVAILABLE',
        Department_Hoshin_Snapshot: JSON.stringify({ historicalDepartmentHoshin: deptText }),
        Section_Hoshin_ID: 'HISTORICAL_LEGACY_SOURCE',
        Section_Hoshin_Title: sectText || 'SOURCE_NOT_AVAILABLE',
        Section_Hoshin_Snapshot: JSON.stringify({ historicalSectionHoshin: sectText }),
        Hoshin_Snapshot_At: new Date().toISOString()
      };
    }

    return {
      Hoshin_Fiscal_Year: readString(sourceRecord, 'Fiscal_Year'),
      Department_Hoshin_ID: 'SOURCE_NOT_AVAILABLE',
      Department_Hoshin_Title: 'SOURCE_NOT_AVAILABLE',
      Department_Hoshin_Snapshot: 'SOURCE_NOT_AVAILABLE',
      Section_Hoshin_ID: 'SOURCE_NOT_AVAILABLE',
      Section_Hoshin_Title: 'SOURCE_NOT_AVAILABLE',
      Section_Hoshin_Snapshot: 'SOURCE_NOT_AVAILABLE',
      Hoshin_Snapshot_At: new Date().toISOString()
    };
  }
}
