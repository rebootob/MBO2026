/**
 * HR Dashboard & Phase Calendar Governance Service (App 800 HR Control Center Integration)
 */

export class HrDashboardService {
  /**
   * Applies structured multi-criteria filters to MBO record collections.
   */
  static filterRecords(records = [], filters = {}) {
    if (!Array.isArray(records)) return [];

    return records.filter(rec => {
      if (!rec) return false;

      if (filters.fiscalYear && String(rec.Fiscal_Year || rec.Fiscal_Year?.value || '').trim() !== String(filters.fiscalYear).trim()) {
        return false;
      }
      if (filters.division && String(rec.Employee_Division || rec.Employee_Division?.value || '').trim() !== String(filters.division).trim()) {
        return false;
      }
      if (filters.department && String(rec.Employee_Department || rec.Employee_Department?.value || '').trim() !== String(filters.department).trim()) {
        return false;
      }
      if (filters.section && String(rec.Employee_Section || rec.Employee_Section?.value || '').trim() !== String(filters.section).trim()) {
        return false;
      }
      if (filters.team && String(rec.Team || rec.Team?.value || '').trim() !== String(filters.team).trim()) {
        return false;
      }
      if (filters.position && String(rec.Employee_Position || rec.Employee_Position?.value || '').trim() !== String(filters.position).trim()) {
        return false;
      }
      if (filters.employeeCode && String(rec.Employee_Code || rec.Employee_Code?.value || '').trim() !== String(filters.employeeCode).trim()) {
        return false;
      }
      if (filters.status && String(rec.Workflow_Status || rec.Workflow_Status?.value || rec.Config_Status?.value || '').trim() !== String(filters.status).trim()) {
        return false;
      }
      if (filters.approverUserCode) {
        const app1 = rec.Appraiser_1_User?.value?.[0]?.code || rec.Appraiser_1_User || '';
        const app2 = rec.Appraiser_2_User?.value?.[0]?.code || rec.Appraiser_2_User || '';
        const mgr = rec.Manager_User?.value?.[0]?.code || rec.Manager_User || '';
        const gm = rec.GM_User?.value?.[0]?.code || rec.GM_User || '';
        const searchCode = String(filters.approverUserCode).trim();
        if (app1 !== searchCode && app2 !== searchCode && mgr !== searchCode && gm !== searchCode) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Computes overview summary counts for HR Dashboard.
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
      const status = String(rec.Workflow_Status || rec.Workflow_Status?.value || rec.Status || '').trim().toUpperCase();

      if (!status || status === 'NOT_STARTED') counts.notStarted++;
      else if (status.includes('DRAFT')) counts.draft++;
      else if (status.includes('SUBMITTED') || status.includes('WAITING') || status.includes('APPROVAL')) counts.waitingApproval++;
      else if (status.includes('RETURNED')) counts.returned++;
      else if (status.includes('REJECTED')) counts.rejected++;
      else if (status.includes('COMPLETED') || status.includes('FINISHED')) counts.completed++;
      else counts.inProgress++;

      if (rec.Has_Routing_Error || status.includes('ROUTING_ERROR')) counts.routingError++;
      if (rec.Has_Config_Error || status.includes('CONFIG_ERROR')) counts.configError++;
      if (rec.Missing_Approver) counts.missingApprover++;

      if (rec.Due_Date) {
        const due = new Date(rec.Due_Date);
        if (!isNaN(due.getTime()) && due < now && !status.includes('COMPLETED')) {
          counts.overdue++;
        }
      }
    }

    return counts;
  }

  /**
   * Phase Calendar Engine: Evaluates stage window availability & countdown messages.
   * Dates gate UI availability & countdown messaging ONLY.
   * Does NOT silently execute Kintone process status transitions.
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
