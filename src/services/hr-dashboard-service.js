/**
 * HR Dashboard & Phase Calendar Governance Service (App 800 HR Control Center Integration)
 */

import { readString, readNumber, readUserCodes } from '../core/kintone-normalizer.js';

export class HrDashboardService {
  /**
   * Applies structured multi-criteria filters to MBO record collections.
   * Handles raw Kintone { value } shapes via shared normalizer.
   */
  static filterRecords(records = [], filters = {}) {
    if (!Array.isArray(records)) return [];

    return records.filter(rec => {
      if (!rec) return false;

      if (filters.fiscalYear && readString(rec, 'Fiscal_Year') !== String(filters.fiscalYear).trim()) {
        return false;
      }
      if (filters.division && readString(rec, 'Employee_Division') !== String(filters.division).trim()) {
        return false;
      }
      if (filters.department && readString(rec, 'Employee_Department') !== String(filters.department).trim()) {
        return false;
      }
      if (filters.section && readString(rec, 'Employee_Section') !== String(filters.section).trim()) {
        return false;
      }
      if (filters.team && readString(rec, 'Team') !== String(filters.team).trim()) {
        return false;
      }
      if (filters.position && readString(rec, 'Employee_Position') !== String(filters.position).trim()) {
        return false;
      }
      if (filters.employeeCode && readString(rec, 'Employee_Code') !== String(filters.employeeCode).trim()) {
        return false;
      }
      if (filters.status) {
        const wfStatus = readString(rec, 'Workflow_Status') || readString(rec, 'Config_Status') || readString(rec, 'Status');
        if (wfStatus !== String(filters.status).trim()) return false;
      }
      if (filters.approverUserCode) {
        const searchCode = String(filters.approverUserCode).trim();
        const app1Codes = readUserCodes(rec, 'Appraiser_1_User');
        const app2Codes = readUserCodes(rec, 'Appraiser_2_User');
        const mgrCodes = readUserCodes(rec, 'Manager_User');
        const gmCodes = readUserCodes(rec, 'GM_User');

        const allApprovers = [...app1Codes, ...app2Codes, ...mgrCodes, ...gmCodes];
        if (!allApprovers.includes(searchCode)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Computes overview summary counts for HR Dashboard from Kintone records.
   */
  static computeOverviewCounts(records = []) {
    const counts = {
      total: records.length,
      notStarted: 0,
      draft: 0,
      waitingApproval: 0,
      returned: 0,
      rejected: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      routingError: 0,
      configError: 0,
      missingApprover: 0
    };

    const now = new Date();

    for (const rec of records) {
      const status = readString(rec, 'Workflow_Status') || readString(rec, 'Status');
      const statusUpper = status.toUpperCase();

      if (!statusUpper || statusUpper === 'NOT_STARTED') counts.notStarted++;
      else if (statusUpper.includes('DRAFT')) counts.draft++;
      else if (statusUpper.includes('SUBMITTED') || statusUpper.includes('WAITING') || statusUpper.includes('APPROVAL')) counts.waitingApproval++;
      else if (statusUpper.includes('RETURNED')) counts.returned++;
      else if (statusUpper.includes('REJECTED')) counts.rejected++;
      else if (statusUpper.includes('COMPLETED') || statusUpper.includes('FINISHED')) counts.completed++;
      else counts.inProgress++;

      const hasRoutingErr = readString(rec, 'Has_Routing_Error') === 'true' || statusUpper.includes('ROUTING_ERROR');
      const hasConfigErr = readString(rec, 'Has_Config_Error') === 'true' || statusUpper.includes('CONFIG_ERROR');
      const missingApp = readString(rec, 'Missing_Approver') === 'true';

      if (hasRoutingErr) counts.routingError++;
      if (hasConfigErr) counts.configError++;
      if (missingApp) counts.missingApprover++;

      const dueDateStr = readString(rec, 'Due_Date');
      if (dueDateStr) {
        const due = new Date(dueDateStr);
        if (!isNaN(due.getTime()) && due < now && !statusUpper.includes('COMPLETED')) {
          counts.overdue++;
        }
      }
    }

    return counts;
  }

  /**
   * Phase Calendar Engine: Evaluates stage window availability & countdown messages from App 800 config.
   * Dates gate UI availability & countdown messaging ONLY.
   */
  static evaluatePhaseCalendarWindow({ phaseName, openDate, closeDate, currentDate = new Date() }) {
    const now = new Date(currentDate);
    const open = openDate ? new Date(openDate) : null;
    const close = closeDate ? new Date(closeDate) : null;

    if (open && now < open) {
      const diffMs = open.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / 86400000);
      return {
        phaseName,
        isOpen: false,
        state: 'NOT_OPEN_YET',
        messageTH: `ระยะเวลา ${phaseName} ยังไม่เปิดใช้งาน (จะเปิดในอีก ${diffDays} วัน)`,
        messageEN: `Phase ${phaseName} is not open yet (Opens in ${diffDays} days).`,
        daysRemaining: diffDays
      };
    }

    if (close && now > close) {
      return {
        phaseName,
        isOpen: false,
        state: 'CLOSED',
        messageTH: `ระยะเวลา ${phaseName} สิ้นสุดแล้ว`,
        messageEN: `Phase ${phaseName} has ended.`,
        daysRemaining: 0
      };
    }

    const diffMs = close ? close.getTime() - now.getTime() : Infinity;
    const diffDays = isFinite(diffMs) ? Math.ceil(diffMs / 86400000) : null;

    return {
      phaseName,
      isOpen: true,
      state: 'OPEN',
      messageTH: `ระยะเวลา ${phaseName} เปิดใช้งานอยู่ (เหลือเวลา ${diffDays ?? 'ไม่จำกัด'} วัน)`,
      messageEN: `Phase ${phaseName} is currently open (${diffDays !== null ? diffDays + ' days remaining' : 'Unlimited'}).`,
      daysRemaining: diffDays
    };
  }
}
