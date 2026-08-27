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

export const SOURCE_TO_TARGET_FIELD_MAP = {
  Drop_down_year: 'Fiscal_Year',
  Fiscal_Year: 'Fiscal_Year',
  Text_name: 'Employee_Name',
  Employee_Name: 'Employee_Name',
  Text_area: 'Department_Hoshin_Title',
  Text_area_0: 'Section_Hoshin_Title',
  Text_area_action_plan_obj1: 'Objective_1',
  Text_area_action_plan_obj2: 'Objective_2',
  Text_area_action_plan_obj3: 'Objective_3',
  Text_area_action_plan_obj4: 'Objective_4',
  weight_a_obj1: 'Weight_1',
  weight_a_obj2: 'Weight_2',
  weight_a_obj3: 'Weight_3',
  weight_a_obj4: 'Weight_4',
  Text_area_actual_result_obj1: 'Actual_Result_1',
  Text_area_actual_result_obj2: 'Actual_Result_2',
  Text_area_actual_result_obj3: 'Actual_Result_3',
  Text_area_actual_result_obj4: 'Actual_Result_4',
  dif_level_obj1: 'Difficulty_1',
  dif_level_obj2: 'Difficulty_2',
  dif_level_obj3: 'Difficulty_3',
  dif_level_obj4: 'Difficulty_4'
};

/**
 * Type-safe canonical normalization with recursively sorted object keys.
 */
export function canonicalNormalize(val) {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'object') {
    return { __type: typeof val, val: String(val).trim() };
  }
  if (Array.isArray(val)) {
    return val.map(canonicalNormalize);
  }
  const sortedObj = {};
  const keys = Object.keys(val).sort();
  for (const k of keys) {
    sortedObj[k] = canonicalNormalize(val[k]);
  }
  return sortedObj;
}

/**
 * Deterministic, collision-safe JSON serializer.
 */
export function canonicalSerialize(val) {
  return JSON.stringify(canonicalNormalize(val));
}

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
   * Computes expected target value for a source field.
   */
  static computeExpectedTargetValue(sourceFieldCode, sourceValue) {
    if (!sourceValue || typeof sourceValue !== 'string') return '';
    const cleanVal = sourceValue.trim();

    if (sourceFieldCode === 'Drop_down_year' || sourceFieldCode === 'Fiscal_Year') {
      return this.normalizeFiscalYear(cleanVal) || cleanVal;
    }
    return cleanVal;
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
   * Full projection deep equivalence comparator using type-safe collision-safe canonical serialization.
   */
  static areDuplicateItemsEquivalent(itemA, itemB) {
    if (itemA.targetProfileCode !== itemB.targetProfileCode) return false;
    const recA = itemA.rawRecord;
    const recB = itemB.rawRecord;

    const allKeys = new Set([...Object.keys(recA), ...Object.keys(recB)]);

    for (const key of allKeys) {
      if (key.startsWith('$')) continue; // Ignore system fields like $id, $revision

      const valA = canonicalSerialize(unwrapField(recA[key]));
      const valB = canonicalSerialize(unwrapField(recB[key]));

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

        // Build independent source field coverage set
        const nonEmptySourceFieldCodes = [];
        for (const [key, val] of Object.entries(rec)) {
          const unwrapped = unwrapField(val);
          const str = (unwrapped !== null && unwrapped !== undefined) ? String(unwrapped).trim() : '';
          if (str !== '') {
            nonEmptySourceFieldCodes.push(key);
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
          nonEmptySourceFieldCodes,
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
        let allEquivalent = true;
        for (let i = 1; i < groupItems.length; i++) {
          if (!this.areDuplicateItemsEquivalent(groupItems[0], groupItems[i])) {
            allEquivalent = false;
            break;
          }
        }

        if (!allEquivalent) {
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

        // Count populated objective slots (1..4)
        let populatedSlots = 0;
        for (let i = 1; i <= 4; i++) {
          const title = readString(rec, `Text_area_action_plan_obj${i}`);
          const weight = readString(rec, `weight_a_obj${i}`);
          if (title || weight) populatedSlots = i;
        }
        const objCount = Math.max(populatedSlots, 1);

        // Build target write-ready physical candidate with REAL App794 flattened fields (NO Objectives array!)
        const targetRecordKey = `${primary.sourceFiscalYear}-${primary.employeeCode}`;
        const candidateObj = {
          Record_Key: targetRecordKey,
          Fiscal_Year: primary.sourceFiscalYear,
          Employee_Code: primary.employeeCode,
          Employee_Name: primary.legacyName,
          Profile_Code: primary.targetProfileCode,
          Workflow_Status: 'COMPLETED',
          Is_Migrated_Record: true,
          Objective_Count: String(objCount),
          Department_Hoshin_Title: readString(rec, 'Text_area') || 'SOURCE_NOT_AVAILABLE',
          Section_Hoshin_Title: readString(rec, 'Text_area_0') || 'SOURCE_NOT_AVAILABLE'
        };

        // Populate physical slots 1..4
        for (let i = 1; i <= 4; i++) {
          candidateObj[`Objective_${i}`] = readString(rec, `Text_area_action_plan_obj${i}`);
          candidateObj[`Weight_${i}`] = readString(rec, `weight_a_obj${i}`);
          candidateObj[`Actual_Result_${i}`] = readString(rec, `Text_area_actual_result_obj${i}`);
          candidateObj[`Difficulty_${i}`] = readString(rec, `dif_level_obj${i}`);
        }

        // Execute independent field-coverage audit & value verification
        let groupUnexplainedLoss = 0;

        const provenanceList = groupItems.map(item => {
          const itemRec = item.rawRecord;
          const fieldBucketAudit = [];
          const historicalFields = {};
          const reconciledEntriesMap = new Map();
          const invalidReconciliation = [];

          for (const fCode of item.nonEmptySourceFieldCodes) {
            const unwrappedVal = unwrapField(itemRec[fCode]);
            const strVal = (unwrappedVal !== null && unwrappedVal !== undefined) ? String(unwrappedVal).trim() : '';

            const actualTargetCode = SOURCE_TO_TARGET_FIELD_MAP[fCode];

            if (actualTargetCode) {
              const expectedTargetVal = LegacyMigrationService.computeExpectedTargetValue(fCode, strVal);
              const actualTargetVal = candidateObj[actualTargetCode];
              const mappingVerified = (actualTargetVal !== undefined && String(actualTargetVal).trim() === String(expectedTargetVal).trim());

              if (!mappingVerified) {
                invalidReconciliation.push(fCode);
              }

              const entry = {
                sourceFieldCode: fCode,
                bucket: 'MAPPED_TO_TARGET',
                sourceValue: strVal,
                targetFieldCode: actualTargetCode,
                expectedTargetValue: expectedTargetVal,
                actualTargetValue: actualTargetVal,
                mappingRule: `SOURCE_TO_TARGET_FIELD_MAP[${fCode}] -> ${actualTargetCode}`,
                mappingVerified
              };

              fieldBucketAudit.push(entry);
              reconciledEntriesMap.set(fCode, entry);
            } else if (fCode.toLowerCase().includes('attachment') || fCode.toLowerCase().includes('file')) {
              const entry = {
                sourceFieldCode: fCode,
                bucket: 'ATTACHMENT_TRANSFER_PENDING',
                sourceValue: strVal,
                explainedReason: 'ATTACHMENT_TRANSFER_PENDING_UNTIL_UPLOAD'
              };
              fieldBucketAudit.push(entry);
              reconciledEntriesMap.set(fCode, entry);
            } else if (fCode.startsWith('$')) {
              const entry = {
                sourceFieldCode: fCode,
                bucket: 'SKIPPED_EXPLAINED',
                sourceValue: strVal,
                explainedReason: 'KINTONE_SYSTEM_METADATA'
              };
              fieldBucketAudit.push(entry);
              reconciledEntriesMap.set(fCode, entry);
            } else {
              historicalFields[fCode] = strVal;
              const entry = {
                sourceFieldCode: fCode,
                bucket: 'PRESERVED_IN_PROVENANCE',
                sourceValue: strVal,
                provenancePath: `provenance.historicalFields.${fCode}`
              };
              fieldBucketAudit.push(entry);
              reconciledEntriesMap.set(fCode, entry);
            }
          }

          // Count missing, ambiguous duplicate, and invalid reconciliation entries
          const missingReconciliation = item.nonEmptySourceFieldCodes.filter(c => !reconciledEntriesMap.has(c));
          const itemLoss = missingReconciliation.length + invalidReconciliation.length;
          groupUnexplainedLoss += itemLoss;

          return {
            sourceAppId: item.sourceAppId,
            sourceRecordId: item.sourceRecordId,
            sourceRecordIdStatus: item.sourceRecordIdStatus,
            sourceRevision: item.sourceRevision,
            sourceRevisionStatus: item.sourceRevisionStatus,
            sourceFiscalYear: item.sourceFiscalYear,
            legacyName: item.legacyName,
            migrationBatchId,
            migrationTime,
            verificationStatus: itemLoss === 0 ? 'VERIFIED_NORMALIZED' : 'RECONCILIATION_UNEXPLAINED_LOSS',
            attachmentProvenance: item.fileFields.length > 0 ? 'ATTACHMENT_TRANSFER_PENDING' : 'NONE',
            attachedFiles: item.fileFields,
            historicalFields,
            fieldBucketAudit,
            coverageProof: {
              totalNonEmptyFields: item.nonEmptySourceFieldCodes.length,
              reconciledFieldsCount: reconciledEntriesMap.size,
              missingReconciliationCount: missingReconciliation.length,
              invalidReconciliationCount: invalidReconciliation.length,
              unexplainedFieldLoss: itemLoss
            }
          };
        });

        totalUnexplainedFieldLoss += groupUnexplainedLoss;

        candidateObj.Migration_Provenance = JSON.stringify(provenanceList);
        candidateObj.provenance = provenanceList;

        candidates.push(candidateObj);
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
