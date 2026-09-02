import fs from 'node:fs';
import path from 'node:path';
import { readString, readNumber, projectApp794Objectives } from '../core/kintone-normalizer.js';
import { MboApprovalTaskService } from './mbo-approval-task-service.js';

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
   * Validates trusted export authorization context against MBO record.
   * Fails closed if exportContext is missing, malformed, cross-employee, or unauthorized.
   * Strictly supports ONLY:
   * 1. { type: 'EMPLOYEE_SELF', employeeCode: '<trusted bound Employee_Code>' }
   * 2. { type: 'APPROVER', context: { mode: 'DEDICATED', kintoneUserCode: '<trusted dedicated principal>' } }
   * All other roles, bare modes, role-less objects, or unauthenticated contexts fail closed.
   * @param {Object} params
   * @param {Object} params.mboRecord - App794 MBO record object
   * @param {Object} params.exportContext - Trusted export authorization context
   * @returns {{ isEmployeeSelf: boolean, isAuthorized: boolean }}
   */
  static validateExportAuthorization({ mboRecord, exportContext }) {
    if (!mboRecord || typeof mboRecord !== 'object') {
      throw new Error('EXPORT_AUTHORIZATION_DENIED: mboRecord is required.');
    }
    if (!exportContext || typeof exportContext !== 'object' || Object.keys(exportContext).length === 0) {
      throw new Error('EXPORT_AUTHORIZATION_DENIED: Trusted exportContext object is required.');
    }

    const recordEmpCode = readString(mboRecord, 'Employee_Code');

    // Shape 1: Exact Supported Employee-Self Context
    if (exportContext.type === 'EMPLOYEE_SELF') {
      const authEmpCode = exportContext.employeeCode;
      if (!authEmpCode || typeof authEmpCode !== 'string' || authEmpCode.trim() === '') {
        throw new Error('EXPORT_AUTHORIZATION_DENIED: Employee-Self trusted employeeCode is required.');
      }
      if (authEmpCode !== recordEmpCode) {
        throw new Error('EXPORT_CROSS_EMPLOYEE_DENIED: Employee-Self cross-employee export operation is denied.');
      }
      return { isEmployeeSelf: true, isAuthorized: true };
    }

    // Shape 2: Exact Supported Approver Context
    if (exportContext.type === 'APPROVER') {
      const dedicatedCtx = exportContext.context;
      if (!dedicatedCtx || typeof dedicatedCtx !== 'object' || dedicatedCtx.mode !== 'DEDICATED') {
        throw new Error('EXPORT_AUTHORIZATION_DENIED: SHARED mode principals are denied approver export authority.');
      }
      if (!MboApprovalTaskService.isAuthorizedAssignee(dedicatedCtx, mboRecord)) {
        throw new Error('EXPORT_AUTHORIZATION_DENIED: Principal is not current authorized Assignee for this record.');
      }
      return { isEmployeeSelf: false, isAuthorized: true };
    }

    // All other context shapes/roles (including HR_ADMIN, TECHNICAL_ADMIN, bare mode, role-less objects, etc.) fail closed
    throw new Error('EXPORT_AUTHORIZATION_DENIED: Unsupported exportContext shape or role.');
  }

  /**
   * Project MBO Record into Part A Export Projection (exact 4-10 objectives).
   */
  static projectPartAExport({ mboRecord, profileCode, exportContext }) {
    if (!mboRecord) throw new Error('mboRecord is required.');

    const authResult = this.validateExportAuthorization({ mboRecord, exportContext });
    const isEmployeeSelf = authResult.isEmployeeSelf;

    const targetProfileCode = profileCode || readString(mboRecord, 'Profile_Code');
    const weighting = this.resolveProfileWeighting(targetProfileCode);

    const rawObjectives = projectApp794Objectives(mboRecord);
    const totalWeight = rawObjectives.reduce((acc, curr) => acc + curr.weight, 0);

    const objectives = rawObjectives.map(obj => {
      const item = {
        slotIndex: obj.slotIndex,
        title: obj.title,
        description: obj.description,
        kpi: obj.kpi,
        target: obj.target,
        measurement: obj.measurement,
        weight: obj.weight,
        progressPercent: obj.progressPercent,
        actualResult: obj.actualResult,
        selfAchievement: obj.selfAchievement,
        selfComment: obj.selfComment
      };

      if (!isEmployeeSelf) {
        item.managerAchievement = obj.managerAchievement;
        item.managerScore = obj.managerScore;
        item.managerComment = obj.managerComment;
        item.gmAchievement = obj.gmAchievement;
        item.gmScore = obj.gmScore;
        item.gmComment = obj.gmComment;
        item.averageScore = obj.averageScore;
      }

      return item;
    });

    const projection = {
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
      objectives
    };

    if (!isEmployeeSelf) {
      projection.summary = {
        rawPartAScore: readNumber(mboRecord, 'PartA_Raw_Score', 0),
        weightedPartAScore: readNumber(mboRecord, 'PartA_Weighted_Score', 0)
      };
    }

    return projection;
  }

  /**
   * Project MBO Record into Combined Part A + Part B Export Projection & PDF Layout.
   */
  static projectCombinedExport({ mboRecord, profileCode, competencyItems = [], exportContext }) {
    const partA = this.projectPartAExport({ mboRecord, profileCode, exportContext });
    const authResult = this.validateExportAuthorization({ mboRecord, exportContext });
    const isEmployeeSelf = authResult.isEmployeeSelf;

    const targetProfileCode = profileCode || readString(mboRecord, 'Profile_Code');
    const weighting = this.resolveProfileWeighting(targetProfileCode);

    const projectedCompetencyItems = (Array.isArray(competencyItems) ? competencyItems : []).map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error('EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED: Competency item must be an object.');
      }

      const ordinal = index + 1;
      let presentationTitle;
      let presentationDescription;

      if (ordinal === 7) {
        const code = String(item.code || '').trim().toUpperCase();
        if (code !== 'COMP_LEAD') {
          throw new Error(`EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED: Competency 7 code must be COMP_LEAD, found '${item.code || ''}'.`);
        }
        if (typeof item.description !== 'string' || item.description.trim() === '') {
          throw new Error('EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED: Competency 7 description must be a nonblank string.');
        }
        presentationTitle = '7. Leadership & People Management';
        presentationDescription = item.description;
      } else if (ordinal === 8) {
        const code = String(item.code || '').trim().toUpperCase();
        if (code !== 'COMP_STRAT') {
          throw new Error(`EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED: Competency 8 code must be COMP_STRAT, found '${item.code || ''}'.`);
        }
        if (typeof item.description !== 'string' || item.description.trim() === '') {
          throw new Error('EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED: Competency 8 description must be a nonblank string.');
        }
        presentationTitle = '8. Strategy & Coaching';
        presentationDescription = item.description;
      } else if (ordinal > 8) {
        throw new Error(`EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED: Competency ordinal ${ordinal} is unsupported.`);
      }

      if (isEmployeeSelf) {
        const safeItem = {};
        const safeKeys = [
          'id', 'competencyId', 'code', 'name', 'title', 'competencyName',
          'description', 'weight', 'weightPercent', 'category', 'group',
          'selfRating', 'selfScore', 'selfComment', 'selfEvaluation', 'selfAchievement',
          'presentationTitle', 'presentationDescription'
        ];
        for (const k of safeKeys) {
          if (k in item) {
            safeItem[k] = item[k];
          }
        }
        if (presentationTitle !== undefined) {
          safeItem.presentationTitle = presentationTitle;
        }
        if (presentationDescription !== undefined) {
          safeItem.presentationDescription = presentationDescription;
        }
        return safeItem;
      }

      const projected = { ...item };
      if (presentationTitle !== undefined) {
        projected.presentationTitle = presentationTitle;
      }
      if (presentationDescription !== undefined) {
        projected.presentationDescription = presentationDescription;
      }
      return projected;
    });

    const projection = {
      exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
      partA,
      partB: {
        partBWeightPercent: weighting.partBWeight,
        competencyItems: projectedCompetencyItems
      }
    };

    if (!isEmployeeSelf) {
      projection.partB.rawPartBScore = readNumber(mboRecord, 'PartB_Raw_Score', 0);
      projection.partB.weightedPartBScore = readNumber(mboRecord, 'PartB_Weighted_Score', 0);
      projection.finalResult = {
        finalWeightedScore: readNumber(mboRecord, 'Final_Score', 0),
        grade: readString(mboRecord, 'Final_Grade')
      };
    }

    return projection;
  }
}
