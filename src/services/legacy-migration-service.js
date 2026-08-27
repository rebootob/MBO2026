/**
 * Legacy 8-App Migration Dry-Run Engine (Gate 3 Real Contract Migration Pipeline)
 * Historical apps: 283, 305, 307, 310, 640, 643, 715, 716
 */

import { readString, unwrapField } from '../core/kintone-normalizer.js';

export const LEGACY_APP_PROFILE_MAP = {
  283: 'PROF_STAFF_CHIEF',
  305: 'PROF_SECTION_MGR',
  307: 'PROF_DGM',
  310: 'PROF_ASST_MGR',
  640: 'PROF_GM',
  643: 'PROF_SENIOR_MGR',
  715: 'PROF_VP',
  716: 'PROF_JAPANESE_STAFF'
};

export class LegacyMigrationService {
  /**
   * Normalizes raw Drop_down_year values (e.g. "FY'2021" -> "FY2021").
   * Returns null if unresolved. NO hardcoded fallback!
   */
  static normalizeFiscalYear(rawFyStr) {
    if (!rawFyStr || typeof rawFyStr !== 'string') return null;
    const clean = rawFyStr.trim().replace(/['\s]/g, '').toUpperCase();
    if (/^FY\d{4}$/.test(clean)) return clean;
    if (/^\d{4}$/.test(clean)) return `FY${clean}`;
    return null;
  }

  /**
   * Resolves Employee_Code from legacy Text_name via authoritative mapping table.
   */
  static resolveEmployeeIdentity(legacyName, employeeMappings = {}) {
    if (!legacyName || typeof legacyName !== 'string') {
      return { status: 'EMPLOYEE_MAPPING_NOT_FOUND', employeeCode: null };
    }
    const cleanName = legacyName.trim();
    const match = employeeMappings[cleanName];

    if (!match) {
      return { status: 'EMPLOYEE_MAPPING_NOT_FOUND', employeeCode: null };
    }
    if (Array.isArray(match)) {
      if (match.length === 1) return { status: 'EMPLOYEE_MAPPED', employeeCode: match[0] };
      return { status: 'EMPLOYEE_MAPPING_AMBIGUOUS', employeeCode: null };
    }
    return { status: 'EMPLOYEE_MAPPED', employeeCode: String(match).trim() };
  }

  /**
   * Executes real-contract dry-run migration pipeline on provided legacy records.
   */
  static executeDryRunMigration({ legacyRecordsMap = {}, employeeMappings = {}, migrationBatchId = 'BATCH_DRY_RUN_001' }) {
    const migrationTime = new Date().toISOString();
    let totalSourceRecords = 0;
    const inventory = [];

    let countSkippedUnresolvedFY = 0;
    let countSkippedUnresolvedIdentity = 0;

    // 1. Inventory & Map
    for (const [appIdStr, records] of Object.entries(legacyRecordsMap)) {
      const appId = parseInt(appIdStr, 10);
      if (!Array.isArray(records)) continue;
      totalSourceRecords += records.length;

      const targetProfileCode = LEGACY_APP_PROFILE_MAP[appId] || 'UNKNOWN_PROFILE';

      for (const rec of records) {
        const rawFy = readString(rec, 'Drop_down_year') || readString(rec, 'Fiscal_Year');
        const fy = this.normalizeFiscalYear(rawFy);

        const legacyName = readString(rec, 'Text_name') || readString(rec, 'Employee_Name');
        const identityRes = this.resolveEmployeeIdentity(legacyName, employeeMappings);

        // Detect all attachment fields dynamically
        const fileFields = [];
        for (const [key, val] of Object.entries(rec)) {
          if (key.toLowerCase().includes('attachment') || key.toLowerCase().includes('file')) {
            const unwrapped = unwrapField(val);
            if (Array.isArray(unwrapped) && unwrapped.length > 0) {
              fileFields.push({ fieldCode: key, files: unwrapped });
            }
          }
        }

        inventory.push({
          sourceAppId: appId,
          sourceRecordId: readString(rec, '$id') || readString(rec, 'Record_ID') || '1',
          sourceRevision: readString(rec, '$revision') || '1',
          sourceFiscalYear: fy,
          legacyName,
          employeeCode: identityRes.employeeCode,
          identityStatus: identityRes.status,
          targetProfileCode,
          fileFields,
          rawRecord: rec
        });
      }
    }

    // 2. Normalize & Group into Logical MBOs by {FiscalYear, EmployeeCode}
    const logicalGroups = new Map();
    const reviewRequiredGroups = [];

    for (const item of inventory) {
      if (!item.sourceFiscalYear) {
        countSkippedUnresolvedFY++;
        continue;
      }
      if (!item.employeeCode) {
        countSkippedUnresolvedIdentity++;
        continue;
      }

      const groupKey = `${item.sourceFiscalYear}::${item.employeeCode}`;
      if (!logicalGroups.has(groupKey)) {
        logicalGroups.set(groupKey, []);
      }
      logicalGroups.get(groupKey).push(item);
    }

    // 3. Merge & Validate Candidates
    const candidates = [];
    let mergedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const [groupKey, groupItems] of logicalGroups.entries()) {
      if (groupItems.length > 1) {
        // Check for conflicting business fields
        const firstProfile = groupItems[0].targetProfileCode;
        const profileConflict = groupItems.some(i => i.targetProfileCode !== firstProfile);

        if (profileConflict) {
          reviewRequiredGroups.push({ groupKey, reason: 'PROFILE_CONFLICT', items: groupItems });
          failedCount += groupItems.length;
          continue;
        }

        mergedCount += groupItems.length - 1;
      }

      try {
        const primary = groupItems[0];
        const rec = primary.rawRecord;

        // Build target objective fields (slots 1..4)
        const objectives = [];
        for (let i = 1; i <= 4; i++) {
          const title = readString(rec, `Text_area_action_plan_obj${i}`);
          const weight = readString(rec, `weight_a_obj${i}`);
          if (title || weight) {
            objectives.push({
              slotIndex: i,
              title,
              weight: Number(weight || 0),
              difficultyProvenance: readString(rec, `dif_level_obj${i}`),
              actualResult: readString(rec, `Text_area_actual_result_obj${i}`),
              scoreApp1: readString(rec, `score_app1_obj${i}`),
              scoreApp2: readString(rec, `score_app2_obj${i}`),
              achieveApp1: readString(rec, `app1_achieve_obj${i}`),
              achieveApp2: readString(rec, `app2_achieve_obj${i}`)
            });
          }
        }

        const provenanceList = groupItems.map(item => ({
          sourceAppId: item.sourceAppId,
          sourceRecordId: item.sourceRecordId,
          sourceRevision: item.sourceRevision,
          sourceFiscalYear: item.sourceFiscalYear,
          legacyName: item.legacyName,
          migrationBatchId,
          migrationTime,
          verificationStatus: 'VERIFIED_NORMALIZED',
          attachmentProvenance: item.fileFields.length > 0 ? 'ATTACHMENT_TRANSFER_PENDING' : 'NONE',
          attachedFiles: item.fileFields
        }));

        candidates.push({
          targetRecordKey: `${primary.sourceFiscalYear}-${primary.employeeCode}`,
          Fiscal_Year: primary.sourceFiscalYear,
          Employee_Code: primary.employeeCode,
          Employee_Name: primary.legacyName,
          Profile_Code: primary.targetProfileCode,
          Workflow_Status: 'COMPLETED',
          Is_Migrated_Record: true,
          Objectives: objectives,
          Department_Hoshin_Title: readString(rec, 'Text_area') || 'SOURCE_NOT_AVAILABLE',
          Section_Hoshin_Title: readString(rec, 'Text_area_0') || 'SOURCE_NOT_AVAILABLE',
          Migration_Provenance: JSON.stringify(provenanceList),
          provenance: provenanceList
        });

        successCount++;
      } catch (err) {
        failedCount++;
      }
    }

    const totalSkippedExplained = countSkippedUnresolvedFY + countSkippedUnresolvedIdentity;
    const unexplainedDataLoss = totalSourceRecords - (successCount + mergedCount + totalSkippedExplained + failedCount);

    return {
      status: 'MIGRATION_DRY_RUN_COMPLETE',
      batchId: migrationBatchId,
      counters: {
        SOURCE_RECORDS: totalSourceRecords,
        LOGICAL_MBO_GROUPS: logicalGroups.size,
        SUCCESS: successCount,
        MERGED: mergedCount,
        SKIPPED_EXPLAINED: totalSkippedExplained,
        SKIPPED_UNRESOLVED_FY: countSkippedUnresolvedFY,
        SKIPPED_UNRESOLVED_IDENTITY: countSkippedUnresolvedIdentity,
        FAILED: failedCount,
        UNEXPLAINED_DATA_LOSS: Math.max(0, unexplainedDataLoss),
        TARGET_EXPECTED_COUNT: successCount
      },
      candidates,
      reviewRequiredGroups
    };
  }
}
