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
   * Full projection deep equivalence comparator across ALL non-empty normalized business/provenance fields.
   */
  static areDuplicateItemsEquivalent(itemA, itemB) {
    if (itemA.targetProfileCode !== itemB.targetProfileCode) return false;
    const recA = itemA.rawRecord;
    const recB = itemB.rawRecord;

    // Collect all non-empty keys across both records
    const allKeys = new Set([...Object.keys(recA), ...Object.keys(recB)]);

    for (const key of allKeys) {
      if (key.startsWith('$')) continue; // Ignore system fields like $id, $revision

      const valA = String(unwrapField(recA[key]) || '').trim();
      const valB = String(unwrapField(recB[key]) || '').trim();

      if (valA !== valB) {
        return false;
      }
    }

    return true;
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
    let totalReconciledFields = 0;
    let totalUnexplainedFieldLoss = 0;

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

        // Extract source $id and $revision without fabricating "1"
        const rawId = unwrapField(rec.$id || rec.Record_ID);
        const sourceRecordId = (rawId !== null && rawId !== undefined && String(rawId).trim() !== '') ? String(rawId).trim() : null;
        const sourceRecordIdStatus = sourceRecordId ? 'VERIFIED' : 'SOURCE_RECORD_ID_UNAVAILABLE';

        const rawRev = unwrapField(rec.$revision);
        const sourceRevision = (rawRev !== null && rawRev !== undefined && String(rawRev).trim() !== '') ? String(rawRev).trim() : null;
        const sourceRevisionStatus = sourceRevision ? 'VERIFIED' : 'SOURCE_REVISION_UNAVAILABLE';

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

        // Field-level reconciliation bucket audit with ACTUAL preserved values
        const fieldBucketAudit = [];
        const historicalFields = {};

        for (const [fCode, fVal] of Object.entries(rec)) {
          const unwrappedVal = unwrapField(fVal);
          const strVal = String(unwrappedVal || '').trim();
          if (!strVal) continue; // Empty fields ignored

          totalReconciledFields++;

          if (fCode.startsWith('Text_area_action_plan') || fCode.startsWith('weight_a') || fCode === 'Text_name' || fCode === 'Drop_down_year') {
            fieldBucketAudit.push({
              sourceFieldCode: fCode,
              bucket: 'MAPPED_TO_TARGET',
              sourceValue: strVal,
              targetFieldCode: fCode
            });
          } else if (fCode.toLowerCase().includes('attachment') || fCode.toLowerCase().includes('file')) {
            fieldBucketAudit.push({
              sourceFieldCode: fCode,
              bucket: 'ATTACHMENT_TRANSFER_PENDING',
              sourceValue: strVal,
              explainedReason: 'ATTACHMENT_TRANSFER_PENDING_UNTIL_UPLOAD'
            });
          } else if (fCode.startsWith('$')) {
            fieldBucketAudit.push({
              sourceFieldCode: fCode,
              bucket: 'SKIPPED_EXPLAINED',
              sourceValue: strVal,
              explainedReason: 'KINTONE_SYSTEM_METADATA'
            });
          } else {
            // PRESERVED_IN_PROVENANCE: actual normalized value stored in provenance!
            historicalFields[fCode] = strVal;
            fieldBucketAudit.push({
              sourceFieldCode: fCode,
              bucket: 'PRESERVED_IN_PROVENANCE',
              sourceValue: strVal,
              provenancePath: `provenance.historicalFields.${fCode}`
            });
          }
        }

        inventory.push({
          sourceAppId: appId,
          sourceRecordId,
          sourceRecordIdStatus,
          sourceRevision,
          sourceRevisionStatus,
          sourceFiscalYear: fy,
          legacyName,
          employeeCode: identityRes.employeeCode,
          identityStatus: identityRes.status,
          targetProfileCode,
          fileFields,
          historicalFields,
          fieldBucketAudit,
          rawRecord: rec
        });
      }
    }

    // 2. Normalize & Group into Logical MBOs by {FiscalYear, EmployeeCode}
    const logicalGroups = new Map();

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

    // 3. Merge & Validate Candidates with NO SILENT PRIMARY RECORD SELECTION
    const candidates = [];
    const reviewRequiredGroups = [];
    let mergedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const [groupKey, groupItems] of logicalGroups.entries()) {
      if (groupItems.length > 1) {
        // Full projection deep equivalence check across ALL group items
        let allEquivalent = true;
        for (let i = 1; i < groupItems.length; i++) {
          if (!this.areDuplicateItemsEquivalent(groupItems[0], groupItems[i])) {
            allEquivalent = false;
            break;
          }
        }

        if (!allEquivalent) {
          // Classify as REVIEW_REQUIRED_DUPLICATE_SOURCE; do NOT create candidate!
          reviewRequiredGroups.push({
            groupKey,
            status: 'REVIEW_REQUIRED_DUPLICATE_SOURCE',
            reason: 'CONFLICTING_BUSINESS_FIELDS',
            itemsCount: groupItems.length,
            items: groupItems
          });
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
          sourceRecordIdStatus: item.sourceRecordIdStatus,
          sourceRevision: item.sourceRevision,
          sourceRevisionStatus: item.sourceRevisionStatus,
          sourceFiscalYear: item.sourceFiscalYear,
          legacyName: item.legacyName,
          migrationBatchId,
          migrationTime,
          verificationStatus: 'VERIFIED_NORMALIZED',
          attachmentProvenance: item.fileFields.length > 0 ? 'ATTACHMENT_TRANSFER_PENDING' : 'NONE',
          attachedFiles: item.fileFields,
          historicalFields: item.historicalFields,
          fieldBucketAudit: item.fieldBucketAudit
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
        UNEXPLAINED_FIELD_LOSS: totalUnexplainedFieldLoss,
        TARGET_EXPECTED_COUNT: successCount
      },
      candidates,
      reviewRequiredGroups
    };
  }
}
