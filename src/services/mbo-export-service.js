/**
 * MBO Export Projection Service (Gate 2 Excel + PDF Export)
 * Maps App 794 MBO records and scoring configurations into structured export projections
 * matching approved historical Part A & Part B form specifications.
 */

import fs from 'node:fs';
import path from 'node:path';

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
   * Resolves Part A & Part B weighting by Profile Code / Position.
   */
  static resolveProfileWeighting(profileCodeOrPosition) {
    const code = String(profileCodeOrPosition || '').toUpperCase();
    if (code.includes('STAFF') || code.includes('CHIEF') || code.includes('OPERATIONAL')) {
      return { profileFamily: 'STAFF_CHIEF', partAWeight: 70, partBWeight: 30 };
    }
    if (code.includes('ASST') || code.includes('ASSISTANT') || code.includes('SPECIALIST')) {
      return { profileFamily: 'ASSISTANT_MANAGER', partAWeight: 60, partBWeight: 40 };
    }
    return { profileFamily: 'MANAGER_GM', partAWeight: 50, partBWeight: 50 };
  }

  /**
   * Project MBO Record into Part A Export Projection (dynamic 5-10 objectives).
   */
  static projectPartAExport({ mboRecord, profileCode }) {
    if (!mboRecord) throw new Error('mboRecord is required.');
    const weighting = this.resolveProfileWeighting(profileCode || mboRecord.Employee_Position);

    const rawObjectives = mboRecord.Objectives || mboRecord.objectives || [];
    const objectives = [];

    for (let i = 0; i < Math.min(Math.max(rawObjectives.length, 5), 10); i++) {
      const obj = rawObjectives[i] || {};
      objectives.push({
        itemIndex: i + 1,
        title: obj.Objective_Title || obj.Title || '',
        description: obj.Objective_Description || obj.Description || '',
        kpi: obj.KPI || '',
        target: obj.Target || '',
        measurement: obj.Measurement || '',
        weight: Number(obj.Weight || 0),
        actualResult: obj.Actual_Result || '',
        achievement: obj.Achievement || '',
        selfScore: Number(obj.Self_Score || 0),
        appraiserScore: Number(obj.Appraiser_Score || obj.Appraiser_1_Score || 0)
      });
    }

    const totalWeight = objectives.reduce((acc, curr) => acc + curr.weight, 0);

    return {
      exportType: 'PART_A_WORKBOOK',
      header: {
        employeeCode: String(mboRecord.Employee_Code || ''),
        employeeName: String(mboRecord.Employee_Name || ''),
        employeeNameTH: String(mboRecord.Employee_Name_TH || ''),
        department: String(mboRecord.Employee_Department || ''),
        section: String(mboRecord.Employee_Section || ''),
        position: String(mboRecord.Employee_Position || ''),
        fiscalYear: String(mboRecord.Fiscal_Year || ''),
        profileFamily: weighting.profileFamily,
        partAWeightPercent: weighting.partAWeight
      },
      hoshin: {
        departmentHoshinTitle: String(mboRecord.Department_Hoshin_Title || ''),
        sectionHoshinTitle: String(mboRecord.Section_Hoshin_Title || '')
      },
      objectivesCount: objectives.length,
      totalWeight,
      objectives,
      summary: {
        rawPartAScore: Number(mboRecord.PartA_Raw_Score || 0),
        weightedPartAScore: Number(mboRecord.PartA_Weighted_Score || 0)
      }
    };
  }

  /**
   * Project MBO Record into Combined Part A + Part B Export Projection & PDF Layout.
   */
  static projectCombinedExport({ mboRecord, profileCode, competencyItems = [] }) {
    const partA = this.projectPartAExport({ mboRecord, profileCode });
    const weighting = this.resolveProfileWeighting(profileCode || mboRecord.Employee_Position);

    return {
      exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
      partA,
      partB: {
        partBWeightPercent: weighting.partBWeight,
        competencyItems,
        rawPartBScore: Number(mboRecord.PartB_Raw_Score || 0),
        weightedPartBScore: Number(mboRecord.PartB_Weighted_Score || 0)
      },
      finalResult: {
        finalWeightedScore: Number(mboRecord.Final_Score || 0),
        grade: String(mboRecord.Final_Grade || '')
      }
    };
  }
}
