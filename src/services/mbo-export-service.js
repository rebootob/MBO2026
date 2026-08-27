/**
 * MBO Export Projection Service (Gate 2 Excel + PDF Export)
 */

import fs from 'node:fs';
import path from 'node:path';
import { readString, readNumber, projectApp794Objectives } from '../core/kintone-normalizer.js';

export const PROFILE_WEIGHT_MAP = {
  PROF_STAFF_CHIEF: { profileFamily: 'STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
  PROF_JAPANESE_STAFF: { profileFamily: 'STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
  PROF_ASST_MGR: { profileFamily: 'ASSISTANT_MANAGER', partAWeight: 60, partBWeight: 40 },
  PROF_SECTION_MGR: { profileFamily: 'MANAGEMENT', partAWeight: 50, partBWeight: 50 },
  PROF_SENIOR_MGR: { profileFamily: 'MANAGEMENT', partAWeight: 50, partBWeight: 50 },
  PROF_DGM: { profileFamily: 'MANAGEMENT', partAWeight: 50, partBWeight: 50 },
  PROF_GM: { profileFamily: 'EXECUTIVE', partAWeight: 50, partBWeight: 50 },
  PROF_VP: { profileFamily: 'EXECUTIVE', partAWeight: 50, partBWeight: 50 }
};

export class MboExportService {
  /**
   * Checks local availability of binary Excel templates in repository workspace.
   */
  static checkTemplateBinaryAssets(baseDir = process.cwd()) {
    const candidatePaths = [
      path.join(baseDir, 'app info', 'data', 'PMS_Staff & Chief_PART_A.xlsx'),
      path.join(baseDir, 'exp', 'PMS_Staff & Chief_PART_A.xlsx')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return { status: 'AVAILABLE', path: p };
      }
    }
    return { status: 'MISSING_LOCAL', path: null };
  }

  /**
   * Resolves Part A & Part B weighting strictly by Profile_Code.
   * Fails closed with EXPORT_PROFILE_UNRESOLVED if profile is missing/unknown.
   */
  static resolveProfileWeighting(profileCode) {
    const code = String(profileCode || '').trim().toUpperCase();
    if (!code || !PROFILE_WEIGHT_MAP[code]) {
      throw new Error(`EXPORT_PROFILE_UNRESOLVED: Profile_Code '${profileCode}' is missing or unmapped.`);
    }
    return PROFILE_WEIGHT_MAP[code];
  }

  /**
   * Project MBO Record into Part A Export Projection (exact 4-10 objectives).
   */
  static projectPartAExport({ mboRecord, profileCode }) {
    if (!mboRecord) throw new Error('mboRecord is required.');

    const targetProfileCode = profileCode || readString(mboRecord, 'Profile_Code');
    const weighting = this.resolveProfileWeighting(targetProfileCode);

    const objectives = projectApp794Objectives(mboRecord);
    const totalWeight = objectives.reduce((acc, curr) => acc + curr.weight, 0);

    return {
      exportType: 'PART_A_WORKBOOK',
      header: {
        employeeCode: readString(mboRecord, 'Employee_Code'),
        employeeName: readString(mboRecord, 'Employee_Name'),
        employeeNameTH: readString(mboRecord, 'Employee_Name_TH'),
        department: readString(mboRecord, 'Employee_Department'),
        section: readString(mboRecord, 'Employee_Section'),
        position: readString(mboRecord, 'Employee_Position'),
        fiscalYear: readString(mboRecord, 'Fiscal_Year'),
        profileCode: targetProfileCode,
        profileFamily: weighting.profileFamily,
        partAWeightPercent: weighting.partAWeight
      },
      hoshin: {
        departmentHoshinTitle: readString(mboRecord, 'Department_Hoshin_Title') || readString(mboRecord, 'Department_Hoshin'),
        sectionHoshinTitle: readString(mboRecord, 'Section_Hoshin_Title') || readString(mboRecord, 'Section_Hoshin')
      },
      objectivesCount: objectives.length,
      totalWeight,
      objectives,
      summary: {
        rawPartAScore: readNumber(mboRecord, 'PartA_Raw_Score', 0),
        weightedPartAScore: readNumber(mboRecord, 'PartA_Weighted_Score', 0)
      }
    };
  }

  /**
   * Project MBO Record into Combined Part A + Part B Export Projection & PDF Layout.
   */
  static projectCombinedExport({ mboRecord, profileCode, competencyItems = [] }) {
    const partA = this.projectPartAExport({ mboRecord, profileCode });
    const targetProfileCode = profileCode || readString(mboRecord, 'Profile_Code');
    const weighting = this.resolveProfileWeighting(targetProfileCode);

    return {
      exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
      partA,
      partB: {
        partBWeightPercent: weighting.partBWeight,
        competencyItems,
        rawPartBScore: readNumber(mboRecord, 'PartB_Raw_Score', 0),
        weightedPartBScore: readNumber(mboRecord, 'PartB_Weighted_Score', 0)
      },
      finalResult: {
        finalWeightedScore: readNumber(mboRecord, 'Final_Score', 0),
        grade: readString(mboRecord, 'Final_Grade')
      }
    };
  }
}
