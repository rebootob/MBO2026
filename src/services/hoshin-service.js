/**
 * Hoshin Governance & MBO Integration Service (App 797 Master Integration)
 */

export class HoshinService {
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

    // 1. Filter PUBLISHED records for target FY
    const activeRecords = hoshinRecords.filter(rec => {
      if (!rec || rec.Fiscal_Year !== cleanFY) return false;
      if (rec.Status !== 'PUBLISHED') return false;

      if (rec.Effective_From) {
        const fromDt = new Date(rec.Effective_From);
        if (targetDt < fromDt) return false;
      }
      if (rec.Effective_To) {
        const toDt = new Date(rec.Effective_To);
        if (targetDt > toDt) return false;
      }
      return true;
    });

    // 2. Department Hoshin resolution
    const deptMatches = activeRecords.filter(rec =>
      (rec.Level === 'DEPARTMENT' || rec.Hoshin_Level === 'DEPARTMENT') &&
      (rec.Department === cleanDept || rec.Organization === cleanDept)
    );

    if (deptMatches.length === 0) {
      const draftOrInactive = hoshinRecords.find(rec =>
        (rec.Level === 'DEPARTMENT' || rec.Hoshin_Level === 'DEPARTMENT') &&
        (rec.Department === cleanDept || rec.Organization === cleanDept) &&
        rec.Fiscal_Year === cleanFY
      );
      if (draftOrInactive && draftOrInactive.Status !== 'PUBLISHED') {
        throw new Error(`HOSHIN_NOT_PUBLISHED: Department Hoshin for ${cleanDept} FY ${cleanFY} is in status ${draftOrInactive.Status}.`);
      }
      throw new Error(`NO_DEPARTMENT_HOSHIN: No PUBLISHED Department Hoshin found for ${cleanDept} FY ${cleanFY}.`);
    }

    if (deptMatches.length > 1) {
      throw new Error(`MULTIPLE_ACTIVE_HOSHIN: Multiple active PUBLISHED Department Hoshins found for ${cleanDept} FY ${cleanFY}.`);
    }

    const deptHoshin = deptMatches[0];

    // 3. Section Hoshin resolution
    const sectMatches = activeRecords.filter(rec =>
      (rec.Level === 'SECTION' || rec.Hoshin_Level === 'SECTION') &&
      (rec.Section === cleanSect || rec.Organization === cleanSect)
    );

    if (sectMatches.length === 0) {
      throw new Error(`NO_SECTION_HOSHIN: No PUBLISHED Section Hoshin found for ${cleanSect} FY ${cleanFY}.`);
    }

    if (sectMatches.length > 1) {
      throw new Error(`MULTIPLE_ACTIVE_HOSHIN: Multiple active PUBLISHED Section Hoshins found for ${cleanSect} FY ${cleanSect}.`);
    }

    const sectHoshin = sectMatches[0];

    // 4. Construct immutable snapshot for App 794
    const nowIso = new Date().toISOString();
    return {
      status: 'READY_FOR_MBO',
      snapshot: {
        Hoshin_Fiscal_Year: cleanFY,
        Department_Hoshin_ID: String(deptHoshin.Record_ID || deptHoshin.$id || deptHoshin.Hoshin_ID || ''),
        Department_Hoshin_Title: String(deptHoshin.Title || deptHoshin.Hoshin_Title || ''),
        Department_Hoshin_Snapshot: JSON.stringify(deptHoshin),
        Section_Hoshin_ID: String(sectHoshin.Record_ID || sectHoshin.$id || sectHoshin.Hoshin_ID || ''),
        Section_Hoshin_Title: String(sectHoshin.Title || sectHoshin.Hoshin_Title || ''),
        Section_Hoshin_Snapshot: JSON.stringify(sectHoshin),
        Hoshin_Snapshot_At: nowIso
      }
    };
  }

  /**
   * Generates Copy Previous MBO candidate ensuring prior-year Hoshin snapshot is NEVER reused.
   * New FY Hoshin must be freshly resolved from App 797.
   */
  static generateCopyPreviousHoshinSnapshot({ priorYearRecord, newFiscalYear, newDept, newSection, newHoshinRecords = [] }) {
    if (!priorYearRecord) throw new Error('priorYearRecord is required.');
    // Prior-year Hoshin snapshot is explicitly DISCARDED
    return this.resolveHoshinForMBO({
      department: newDept,
      section: newSection,
      fiscalYear: newFiscalYear,
      hoshinRecords: newHoshinRecords
    });
  }

  /**
   * Preserves historical migration Hoshin snapshot or marks SOURCE_NOT_AVAILABLE.
   */
  static processMigrationHoshinSnapshot(sourceRecord) {
    if (sourceRecord && sourceRecord.Department_Hoshin_Snapshot) {
      return {
        Hoshin_Fiscal_Year: sourceRecord.Hoshin_Fiscal_Year || sourceRecord.Fiscal_Year || '',
        Department_Hoshin_ID: sourceRecord.Department_Hoshin_ID || '',
        Department_Hoshin_Title: sourceRecord.Department_Hoshin_Title || '',
        Department_Hoshin_Snapshot: sourceRecord.Department_Hoshin_Snapshot,
        Section_Hoshin_ID: sourceRecord.Section_Hoshin_ID || '',
        Section_Hoshin_Title: sourceRecord.Section_Hoshin_Title || '',
        Section_Hoshin_Snapshot: sourceRecord.Section_Hoshin_Snapshot || '',
        Hoshin_Snapshot_At: sourceRecord.Hoshin_Snapshot_At || new Date().toISOString()
      };
    }
    return {
      Hoshin_Fiscal_Year: sourceRecord?.Fiscal_Year || '',
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
