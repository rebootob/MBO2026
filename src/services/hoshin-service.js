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
   * Resolves dual-level (Department + Section) PUBLISHED Hoshin records for MBO Creation.
   */
  static resolveHoshinForMBO({ department, section, fiscalYear, effectiveDate = new Date(), hoshinRecords = [] }) {
    if (!department || !section || !fiscalYear) {
      throw new Error('HOSHIN_RESOLUTION_INVALID: department, section, and fiscalYear are required.');
    }

    const cleanDept = String(department).trim();
    const cleanSect = String(section).trim();
    const cleanFY = String(fiscalYear).trim();
    const targetDt = new Date(effectiveDate);

    // 1. Filter records matching FY
    const fyRecords = hoshinRecords.filter(rec => {
      const fy = readString(rec, 'Fiscal_Year');
      return fy === cleanFY;
    });

    // Check status and date range
    const activeRecords = [];
    for (const rec of fyRecords) {
      const canonicalStatus = this.getCanonicalHoshinStatus(rec);

      const effFromStr = readString(rec, 'Effective_From');
      const effToStr = readString(rec, 'Effective_To');

      if (effFromStr || effToStr) {
        const fromDt = effFromStr ? new Date(effFromStr) : null;
        const toDt = effToStr ? new Date(effToStr) : null;
        if ((fromDt && targetDt < fromDt) || (toDt && targetDt > toDt)) {
          if (canonicalStatus === 'PUBLISHED') {
            // Evaluated outside effective period
          }
          continue;
        }
      }

      if (canonicalStatus === 'PUBLISHED') {
        activeRecords.push(rec);
      }
    }

    // 2. Department Hoshin resolution
    const deptMatches = activeRecords.filter(rec => {
      const scopeType = readString(rec, 'Scope_Type') || readString(rec, 'Hoshin_Level') || readString(rec, 'Level');
      const scopeCode = readString(rec, 'Scope_Code');
      const scopeName = readString(rec, 'Scope_Name');
      const deptCode = readString(rec, 'Department_Code') || readString(rec, 'Department');
      const deptName = readString(rec, 'Department_Name');

      return (scopeType === 'DEPARTMENT') &&
        (scopeCode === cleanDept || scopeName === cleanDept || deptCode === cleanDept || deptName === cleanDept);
    });

    if (deptMatches.length === 0) {
      const unpublishedDept = fyRecords.find(rec => {
        const scopeType = readString(rec, 'Scope_Type') || readString(rec, 'Level');
        const deptCode = readString(rec, 'Department_Code') || readString(rec, 'Department');
        const deptName = readString(rec, 'Department_Name');
        return scopeType === 'DEPARTMENT' && (deptCode === cleanDept || deptName === cleanDept);
      });

      if (unpublishedDept) {
        const statusStr = this.getCanonicalHoshinStatus(unpublishedDept);
        if (statusStr !== 'PUBLISHED') {
          throw new Error(`HOSHIN_NOT_PUBLISHED: Department Hoshin for ${cleanDept} FY ${cleanFY} is in status ${statusStr}.`);
        }
      }
      throw new Error(`NO_DEPARTMENT_HOSHIN: No PUBLISHED Department Hoshin found for ${cleanDept} FY ${cleanFY}.`);
    }

    if (deptMatches.length > 1) {
      throw new Error(`MULTIPLE_ACTIVE_HOSHIN: Multiple active PUBLISHED Department Hoshins found for ${cleanDept} FY ${cleanFY}.`);
    }

    const deptHoshin = deptMatches[0];

    // 3. Section Hoshin resolution
    const sectMatches = activeRecords.filter(rec => {
      const scopeType = readString(rec, 'Scope_Type') || readString(rec, 'Level');
      const scopeCode = readString(rec, 'Scope_Code');
      const scopeName = readString(rec, 'Scope_Name');
      const sectCode = readString(rec, 'Section_Code') || readString(rec, 'Section');
      const sectName = readString(rec, 'Section_Name');

      return (scopeType === 'SECTION') &&
        (scopeCode === cleanSect || scopeName === cleanSect || sectCode === cleanSect || sectName === cleanSect);
    });

    if (sectMatches.length === 0) {
      throw new Error(`NO_SECTION_HOSHIN: No PUBLISHED Section Hoshin found for ${cleanSect} FY ${cleanFY}.`);
    }

    if (sectMatches.length > 1) {
      throw new Error(`MULTIPLE_ACTIVE_HOSHIN: Multiple active PUBLISHED Section Hoshins found for ${cleanSect} FY ${cleanFY}.`);
    }

    const sectHoshin = sectMatches[0];

    // 4. Construct clean normalized snapshot for App 794
    const nowIso = new Date().toISOString();
    const deptTitle = readString(deptHoshin, 'Hoshin_TH') || readString(deptHoshin, 'Hoshin_EN') || readString(deptHoshin, 'Title');
    const sectTitle = readString(sectHoshin, 'Hoshin_TH') || readString(sectHoshin, 'Hoshin_EN') || readString(sectHoshin, 'Title');
    const deptId = readString(deptHoshin, 'Record_ID') || String(deptHoshin.$id?.value || deptHoshin.$id || deptHoshin.Hoshin_Key || '');
    const sectId = readString(sectHoshin, 'Record_ID') || String(sectHoshin.$id?.value || sectHoshin.$id || sectHoshin.Hoshin_Key || '');

    return {
      status: 'READY_FOR_MBO',
      snapshot: {
        Hoshin_Fiscal_Year: cleanFY,
        Department_Hoshin_ID: deptId,
        Department_Hoshin_Title: deptTitle,
        Department_Hoshin_Snapshot: JSON.stringify({
          hoshinKey: readString(deptHoshin, 'Hoshin_Key'),
          departmentCode: readString(deptHoshin, 'Department_Code'),
          departmentName: readString(deptHoshin, 'Department_Name'),
          hoshinTH: readString(deptHoshin, 'Hoshin_TH'),
          hoshinEN: readString(deptHoshin, 'Hoshin_EN'),
          version: readString(deptHoshin, 'Version')
        }),
        Section_Hoshin_ID: sectId,
        Section_Hoshin_Title: sectTitle,
        Section_Hoshin_Snapshot: JSON.stringify({
          hoshinKey: readString(sectHoshin, 'Hoshin_Key'),
          sectionCode: readString(sectHoshin, 'Section_Code'),
          sectionName: readString(sectHoshin, 'Section_Name'),
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
