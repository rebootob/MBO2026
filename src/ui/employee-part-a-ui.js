/**
 * Employee Part A & Part B UI Renderer - Evaluation UI V2 (R5 Route-Aware Five-Stage UX)
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & Bilingual Specification
 */

import { BUSINESS_STAGES } from '../config/constants.js';
import { ValidationEngine } from '../validation/validation-engine.js';
import { extractUserCodes, resolveIdentityViewerRole } from './employee-visibility.js';
import {
  parseObjectiveCount,
  COMPETENCIES_LIST,
  getApplicableCompetencies,
  normalizeAppraiserData
} from '../evaluation/appraiser-normalizer.js';
import { AdminDiagnosticModel } from '../admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../admin/admin-support-center.js';

export {
  extractUserCodes,
  resolveIdentityViewerRole,
  parseObjectiveCount,
  COMPETENCIES_LIST,
  getApplicableCompetencies,
  normalizeAppraiserData,
  AdminDiagnosticModel,
  AdminSupportCenterUI
};

export const CANONICAL_TOPOLOGIES = ['M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2', 'M1_ONLY'];

export const WORKFLOW_PATH_M1_ONLY = [
  '01 Draft Objective',
  '03 Manager Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '08 Manager Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '13 Manager Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

export const WORKFLOW_PATH_M1_G1 = [
  '01 Draft Objective',
  '03 Manager Objective Review',
  '04 GM Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '08 Manager Mid-Year Review',
  '09 GM Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '13 Manager Final Evaluation',
  '14 GM Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

export const WORKFLOW_PATH_M1_M2_G1 = [
  '01 Draft Objective',
  '02 First Manager Objective Review',
  '03 Manager Objective Review',
  '04 GM Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '07 First Manager Mid-Year Review',
  '08 Manager Mid-Year Review',
  '09 GM Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '12 First Manager Final Evaluation',
  '13 Manager Final Evaluation',
  '14 GM Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

export const DEFAULT_PHASE_CALENDAR = {
  objectives: { start: '2026-01-01', end: '2026-03-31', label: 'Jan 1 - Mar 31, 2026' },
  midyear: { start: '2026-06-01', end: '2026-07-31', label: 'Jun 1 - Jul 31, 2026' },
  selfEvaluation: { start: '2026-10-01', end: '2026-10-31', label: 'Oct 1 - Oct 31, 2026' },
  appraiserEvaluation: { start: '2026-11-01', end: '2026-11-30', label: 'Nov 1 - Nov 30, 2026' },
  hrFinal: { start: '2026-12-01', end: '2026-12-31', label: 'Dec 1 - Dec 31, 2026' }
};

export const ROUTE_SCENARIOS = {
  CURRENT_STANDARD: {
    id: 'CURRENT_STANDARD',
    labelTH: 'เส้นทางมาตรฐานปัจจุบัน — ผู้ประเมิน 2 คน',
    labelEN: 'Current Standard — 2 Appraisers',
    topology: 'M1_G1',
    appraiserCount: 2,
    isRuntimeSupported: true
  },
  EXTENDED: {
    id: 'EXTENDED',
    labelTH: 'เส้นทางขยาย — ผู้ประเมิน 3 คน',
    labelEN: 'Extended Route — 3 Appraisers',
    topology: 'M1_M2_G1',
    appraiserCount: 3,
    isRuntimeSupported: true
  },
  EXECUTIVE_DIRECT: {
    id: 'EXECUTIVE_DIRECT',
    labelTH: 'เส้นทางผู้บริหารโดยตรง — ผู้ประเมิน 1 คน',
    labelEN: 'Executive Direct — 1 Appraiser',
    topology: 'M1_ONLY',
    appraiserCount: 1,
    isRuntimeSupported: true
  },
  FUTURE_CAPACITY: {
    id: 'FUTURE_CAPACITY',
    labelTH: 'เส้นทางรองรับอนาคต — ผู้ประเมิน 4 คน',
    labelEN: 'Future Capacity — 4 Appraisers',
    topology: 'M1_M2_G1',
    appraiserCount: 4,
    isRuntimeSupported: false,
    badgeText: 'Preview Only'
  }
};

export const EVALUATION_PROFILES = {
  PROF_STAFF_CHIEF: {
    id: 'PROF_STAFF_CHIEF',
    nameTH: 'Staff / Chief (70/30)',
    nameEN: 'Staff / Chief (70/30)',
    partAWeight: 70,
    partBWeight: 30,
    compSetCode: 'COMP_SET_OPERATIONAL_V1'
  },
  PROF_JAPANESE_STAFF: {
    id: 'PROF_JAPANESE_STAFF',
    nameTH: 'Japanese Staff (70/30)',
    nameEN: 'Japanese Staff (70/30)',
    partAWeight: 70,
    partBWeight: 30,
    compSetCode: 'COMP_SET_OPERATIONAL_V1'
  },
  PROF_ASST_MGR: {
    id: 'PROF_ASST_MGR',
    nameTH: 'Assistant Manager (60/40)',
    nameEN: 'Assistant Manager (60/40)',
    partAWeight: 60,
    partBWeight: 40,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_SECTION_MGR: {
    id: 'PROF_SECTION_MGR',
    nameTH: 'Section Manager (50/50)',
    nameEN: 'Section Manager (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_SENIOR_MGR: {
    id: 'PROF_SENIOR_MGR',
    nameTH: 'Senior Manager (50/50)',
    nameEN: 'Senior Manager (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_DGM: {
    id: 'PROF_DGM',
    nameTH: 'DGM (50/50)',
    nameEN: 'DGM (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_GM: {
    id: 'PROF_GM',
    nameTH: 'GM (50/50)',
    nameEN: 'GM (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_VP: {
    id: 'PROF_VP',
    nameTH: 'VP (50/50)',
    nameEN: 'VP (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  }
};

export function normalizeProfileCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') return null;
  const clean = rawCode.trim();
  if (!clean) return null;

  const legacyAliasMap = {
    PROF_STAFF_OPERATIONAL: 'PROF_STAFF_CHIEF',
    PROF_STAFF_JAPANESE: 'PROF_JAPANESE_STAFF',
    PROF_SECT_MGR: 'PROF_SECTION_MGR',
    PROF_SR_MGR: 'PROF_SENIOR_MGR'
  };

  const canonical = legacyAliasMap[clean] || clean;
  return EVALUATION_PROFILES[canonical] ? canonical : null;
}

export function getEvaluationProfile(rawCode) {
  const canonicalCode = normalizeProfileCode(rawCode);
  return canonicalCode ? EVALUATION_PROFILES[canonicalCode] : null;
}

export function calculateDeadlineInfo(startDateIso, endDateIso, nowIso = '2026-06-15', isCompleted = false) {
  if (isCompleted) {
    return {
      status: 'Completed',
      labelTH: 'เสร็จแล้ว',
      labelEN: 'Completed',
      daysTextTH: 'ดำเนินการเสร็จสมบูรณ์เรียบร้อยแล้ว',
      daysTextEN: 'Phase process completed',
      calloutTextTH: 'เสร็จสมบูรณ์',
      calloutTextEN: 'COMPLETED',
      badgeClass: 'mbo-deadline-completed',
      isCompleted: true
    };
  }

  const parseLocalDate = (isoStr) => {
    const s = String(isoStr || '').trim();
    return new Date(s.includes('T') ? s : `${s}T00:00:00`);
  };

  const now = parseLocalDate(nowIso);
  const start = parseLocalDate(startDateIso);
  const end = parseLocalDate(endDateIso);

  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const msPerDay = 86400000;

  if (now < start) {
    const diffDays = Math.round((start - now) / msPerDay);
    return {
      status: 'Upcoming',
      labelTH: 'ยังไม่เปิด',
      labelEN: 'Upcoming',
      daysTextTH: `เริ่มใน ${diffDays} วัน (${startDateIso})`,
      daysTextEN: `Opens in ${diffDays} days (${startDateIso})`,
      calloutTextTH: `เริ่มใน ${diffDays} วัน`,
      calloutTextEN: `Opens in ${diffDays} days`,
      badgeClass: 'mbo-deadline-upcoming',
      isUpcoming: true,
      diffDays
    };
  }

  if (now > end) {
    const overdueDays = Math.round((now - end) / msPerDay);
    return {
      status: 'Overdue',
      labelTH: 'เกินกำหนด',
      labelEN: 'Overdue',
      daysTextTH: `เกินกำหนด ${overdueDays} วัน (ครบกำหนด ${endDateIso})`,
      daysTextEN: `${overdueDays} days overdue (Due ${endDateIso})`,
      calloutTextTH: `เกินกำหนด ${overdueDays} วัน`,
      calloutTextEN: `${overdueDays} DAYS OVERDUE`,
      badgeClass: 'mbo-deadline-overdue',
      isOverdue: true,
      overdueDays
    };
  }

  const remDays = Math.round((end - now) / msPerDay);
  if (remDays === 0) {
    return {
      status: 'Due Today',
      labelTH: 'ครบกำหนดวันนี้',
      labelEN: 'Due Today',
      daysTextTH: `ครบกำหนดวันนี้ (${endDateIso})`,
      daysTextEN: `Due today (${endDateIso})`,
      calloutTextTH: `ครบกำหนดวันนี้`,
      calloutTextEN: `DUE TODAY`,
      badgeClass: 'mbo-deadline-due-today',
      isDueToday: true,
      remDays: 0
    };
  }

  const isDueSoon = remDays >= 1 && remDays <= 7;
  return {
    status: 'Open',
    labelTH: 'กำลังเปิด',
    labelEN: 'Open',
    daysTextTH: `เหลือ ${remDays} วัน (ครบกำหนด ${endDateIso})`,
    daysTextEN: `${remDays} days remaining (Due ${endDateIso})`,
    calloutTextTH: `เหลือ ${remDays} วัน`,
    calloutTextEN: `${remDays} DAYS REMAINING`,
    badgeClass: isDueSoon ? 'mbo-deadline-due-soon' : 'mbo-deadline-open',
    isOpen: true,
    isDueSoon,
    remDays
  };
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatUserDisplay(userArr) {
  if (!userArr || !Array.isArray(userArr) || userArr.length === 0) return '-';
  const u = userArr[0];
  if (typeof u === 'string') return escapeHtml(u);
  if (typeof u === 'object' && u !== null) {
    if (u.name && u.code) return `${escapeHtml(u.name)} (${escapeHtml(u.code)})`;
    if (u.name) return escapeHtml(u.name);
    if (u.code) return escapeHtml(u.code);
  }
  return '-';
}

export function classifyTopologyForUI(topology) {
  if (topology === null || topology === undefined) {
    return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: false, raw: '' };
  }
  const raw = String(topology).trim();
  if (!raw || !CANONICAL_TOPOLOGIES.includes(raw)) {
    return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: false, raw };
  }
  if (raw === 'M1_G1_G2' || raw === 'M1_M2_G1_G2') {
    return { isCanonical: true, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: true, raw };
  }
  return {
    isCanonical: true,
    isSupportedV1: true,
    isM1G1: raw === 'M1_G1',
    isM1M2G1: raw === 'M1_M2_G1',
    isM1Only: raw === 'M1_ONLY',
    isG2: false,
    raw
  };
}

export function getApplicableWorkflowPath(topology = 'M1_G1') {
  const topInfo = classifyTopologyForUI(topology);
  if (!topInfo.isCanonical || !topInfo.isSupportedV1) return null;
  if (topInfo.isM1Only) return WORKFLOW_PATH_M1_ONLY;
  if (topInfo.isM1G1) return WORKFLOW_PATH_M1_G1;
  if (topInfo.isM1M2G1) return WORKFLOW_PATH_M1_M2_G1;
  return null;
}

export function getVisualScreen(status) {
  const currentStatus = String(status || '').trim();

  if (['01 Draft Objective', '02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved'].includes(currentStatus)) {
    return 'objectives'; // Stage 1
  }
  if (['06 Employee Mid-Year', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed'].includes(currentStatus)) {
    return 'midyear'; // Stage 2
  }
  if (currentStatus === '11 Employee Self Evaluation') {
    return 'self_eval'; // Stage 3
  }
  if (['12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(currentStatus)) {
    return 'appraiser_eval'; // Stage 4
  }
  if (['15 HR Final Check', '16 Completed'].includes(currentStatus)) {
    return 'hr_final'; // Stage 5
  }
  return null; // Fail closed for unknown status
}

export function getProcessProgress(status, topology = 'M1_G1') {
  const currentStatus = String(status || '').trim();
  const pathList = getApplicableWorkflowPath(topology);

  if (!pathList) {
    return {
      percent: 0,
      stepIndex: 1,
      label: 'Invalid / Unsupported Topology',
      isMismatch: true,
      mismatchMessage: `Routing topology ("${escapeHtml(String(topology || ''))}") is missing, unrecognized, or unsupported in V1.`
    };
  }

  const idx = pathList.indexOf(currentStatus);
  if (idx === -1) {
    return {
      percent: 0,
      stepIndex: 1,
      label: 'Status Not Applicable to Route',
      isMismatch: true,
      mismatchMessage: `Status "${escapeHtml(currentStatus)}" is not applicable to active ${escapeHtml(String(topology))} route.`
    };
  }

  const percent = Math.round(((idx + 1) / pathList.length) * 100);
  const macroStage = getMacroStage(currentStatus);

  return {
    percent,
    stepIndex: macroStage,
    label: `${macroStage}. Stage Progress (${idx + 1}/${pathList.length}: ${currentStatus})`,
    isMismatch: false,
    mismatchMessage: ''
  };
}

export function getPhaseCalendarStatus(stageKey, currentStatus, nowIso = '2026-06-15', calendar = DEFAULT_PHASE_CALENDAR) {
  const currentStage = getMacroStage(currentStatus);
  const stageMap = { objectives: 1, midyear: 2, selfEvaluation: 3, appraiserEvaluation: 4, hrFinal: 5 };
  const targetStage = stageMap[stageKey] || 1;
  const cal = calendar || DEFAULT_PHASE_CALENDAR;
  const dates = cal[stageKey] || { start: '2026-01-01', end: '2026-12-31', label: 'TBD' };

  const isCompleted = (currentStage > targetStage) || (currentStatus === '16 Completed');
  return calculateDeadlineInfo(dates.start, dates.end, nowIso, isCompleted);
}

export function getStatusGuidance(status, topology) {
  const currentStatus = String(status || '').trim();
  const topInfo = classifyTopologyForUI(topology);

  if (!topInfo.isCanonical) {
    return {
      th: topInfo.raw
        ? `⚠️ แจ้งเตือนคอนฟิก: ข้อมูล Routing Topology ("${escapeHtml(topInfo.raw)}") ไม่ถูกต้องตามระเบียบประเมิน กรุณาติดต่อ HR / Administrator`
        : '⚠️ แจ้งเตือนคอนฟิก: ไม่พบข้อมูล Routing Topology ในระเบียบประเมิน กรุณาติดต่อ HR / Administrator',
      en: topInfo.raw
        ? `⚠️ Configuration warning: Unrecognized Routing Topology ("${escapeHtml(topInfo.raw)}"). Please contact HR / Administrator.`
        : '⚠️ Configuration warning: Routing Topology not specified in record. Please contact HR / Administrator.',
      isWarning: true
    };
  }

  if (topInfo.isG2) {
    return {
      th: `⚠️ แจ้งเตือนคอนฟิก: เส้นทาง ${escapeHtml(topInfo.raw)} ยังไม่เปิดใช้งานในระบบ MBO V1 ปัจจุบัน (รองรับ M1_G1 และ M1_M2_G1 เท่านั้น)`,
      en: `⚠️ Configuration warning: Topology ${escapeHtml(topInfo.raw)} is unsupported in current V1 workflow. Please contact HR / Administrator.`,
      isWarning: true
    };
  }

  const firstManagerWarning = {
    th: '⚠️ แจ้งเตือนคอนฟิก: เส้นทาง M1_G1 ไม่ใช้ First Manager หากพบสถานะนี้ กรุณาติดต่อ HR / Administrator',
    en: '⚠️ Configuration warning: M1_G1 topology does not use First Manager. Please contact HR / Administrator.',
    isWarning: true
  };

  const guidanceMap = {
    '01 Draft Objective': {
      th: 'กรอกเป้าหมายและแผนงานให้สมบูรณ์ (ผลรวมน้ำหนัก 100%) แล้วกดปุ่ม Submit ด้านบน เพื่อส่งให้ Manager พิจารณา',
      en: 'Fill Objectives & Action Plan (Total Weight 100%), then click Submit above for Manager review.',
      isWarning: false
    },
    '02 First Manager Objective Review': topInfo.isM1G1 ? firstManagerWarning : {
      th: 'อยู่ระหว่างการพิจารณาเป้าหมายโดย First Manager / ตรวจสอบเป้าหมายและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under First Manager review for Objectives. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '03 Manager Objective Review': {
      th: 'อยู่ระหว่างการพิจารณาเป้าหมายโดย Manager / ตรวจสอบเป้าหมายและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under Manager review for Objectives. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '04 GM Objective Review': {
      th: 'อยู่ระหว่างการพิจารณาเป้าหมายโดย GM / ตรวจสอบเป้าหมายและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under GM review for Objectives. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '05 Objective Approved': {
      th: 'เป้าหมายได้รับการอนุมัติเรียบร้อยแล้ว รอเริ่มขั้นตอนการทบทวนกลางปี',
      en: 'Objectives Approved. Waiting to start Mid-Year review.',
      isWarning: false
    },
    '06 Employee Mid-Year': {
      th: 'กรอกผลการทบทวนกลางปีและความคืบหน้า แล้วกดปุ่ม Submit ด้านบน เพื่อส่งให้ Manager',
      en: 'Fill Mid-Year progress & review notes, then click Submit above to Manager.',
      isWarning: false
    },
    '07 First Manager Mid-Year Review': topInfo.isM1G1 ? firstManagerWarning : {
      th: 'อยู่ระหว่างการทบทวนกลางปีโดย First Manager / ตรวจสอบความคืบหน้าและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under First Manager Mid-Year review. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '08 Manager Mid-Year Review': {
      th: 'อยู่ระหว่างการทบทวนกลางปีโดย Manager / ตรวจสอบความคืบหน้าและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under Manager Mid-Year review. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '09 GM Mid-Year Review': {
      th: 'อยู่ระหว่างการทบทวนกลางปีโดย GM / ตรวจสอบความคืบหน้าและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under GM Mid-Year review. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '10 Mid-Year Completed': {
      th: 'การทบทวนกลางปีเสร็จสมบูรณ์ รอเริ่มขั้นตอนการประเมินตนเองปลายปี',
      en: 'Mid-Year review completed. Waiting to start Year-End self-evaluation.',
      isWarning: false
    },
    '11 Employee Self Evaluation': {
      th: 'กรอกผลงานจริงและประเมินตนเองปลายปี แล้วกดปุ่ม Submit ด้านบน เพื่อส่งให้ Manager',
      en: 'Fill actual results & self-evaluation, then click Submit above to Manager.',
      isWarning: false
    },
    '12 First Manager Final Evaluation': topInfo.isM1G1 ? firstManagerWarning : {
      th: 'อยู่ระหว่างการประเมินผลงานปลายปีโดย First Manager / ตรวจสอบและประเมินผลผ่านปุ่ม Kintone ด้านบน',
      en: 'Under First Manager Final evaluation. Please evaluate and approve via Kintone buttons above.',
      isWarning: false
    },
    '13 Manager Final Evaluation': {
      th: 'อยู่ระหว่างการประเมินผลงานปลายปีโดย Manager / ตรวจสอบและประเมินผลผ่านปุ่ม Kintone ด้านบน',
      en: 'Under Manager Final evaluation. Please evaluate and approve via Kintone buttons above.',
      isWarning: false
    },
    '14 GM Final Evaluation': {
      th: 'อยู่ระหว่างการประเมินผลงานปลายปีโดย GM / ตรวจสอบและประเมินผลผ่านปุ่ม Kintone ด้านบน',
      en: 'Under GM Final evaluation. Please evaluate and approve via Kintone buttons above.',
      isWarning: false
    },
    '15 HR Final Check': {
      th: 'อยู่ระหว่างการตรวจสอบขั้นสุดท้ายโดย HR Final Check',
      en: 'Under HR Final check and verification.',
      isWarning: false
    },
    '16 Completed': {
      th: 'กระบวนการประเมิน MBO เสร็จสมบูรณ์เรียบร้อยแล้ว',
      en: 'MBO Evaluation process fully completed.',
      isWarning: false
    }
  };

  return guidanceMap[currentStatus] || {
    th: 'สถานะการทำงานปัจจุบัน (ดำเนินการผ่านปุ่ม Kintone ด้านบน)',
    en: 'Current workflow status (Process actions available via Kintone buttons above).',
    isWarning: false
  };
}

export function getMacroStage(status) {
  const screen = getVisualScreen(status);
  switch (screen) {
    case 'objectives': return 1;
    case 'midyear': return 2;
    case 'self_eval': return 3;
    case 'appraiser_eval': return 4;
    case 'hr_final': return 5;
    default: return 1;
  }
}

export class EmployeePartAUI {
  constructor(options = {}) {
    this.container = options.container;
    this.record = options.record || {};
    this.stage = options.stage || BUSINESS_STAGES.READ_ONLY;
    this.isEditable = options.isEditable || false;
    this.isCreate = options.isCreate || false;
    this.appraiserCount = options.appraiserCount || 2;
    this.previewOptions = options.previewOptions || {};
    this.isPreviewMode = Boolean(options.isPreviewMode || options.previewOptions?.isPreviewMode);
    this.loginUserCode = options.loginUserCode || options.previewOptions?.loginUserCode || null;
    this.selectedViewStage = options.selectedViewStage || null;

    const rawSlot = options.activeSlotIndex || options.previewOptions?.activeSlotIndex || 1;
    this.activeSlotIndex = Math.min(Math.max(parseInt(rawSlot, 10), 1), this.appraiserCount);

    this.onFieldChange = options.onFieldChange || (() => {});
    this.onLookupEmployee = options.onLookupEmployee || (() => {});
    this.onEmployeeCodeChanged = options.onEmployeeCodeChanged || (() => {});
    // D1: authenticated Employee_Code bound from MBO Login Gate (page-memory only)
    this.authenticatedEmployeeCode = options.authenticatedEmployeeCode || null;
    this.currentErrors = [];

    this.isEmployeeVerified = !this.isCreate;
  }

  _getResolvedViewerRole() {
    return resolveIdentityViewerRole(this.record, this.loginUserCode, {
      isPreviewMode: this.isPreviewMode,
      previewOptions: this.previewOptions
    });
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'mbo-root';
    this.root = root;

    if (this.stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      root.appendChild(this._renderErrorBanner('ไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)<br/>Unable to identify workflow stage. Please contact HR / Administrator.'));
      this.container.appendChild(root);
      return;
    }

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const currentVisualScreen = getVisualScreen(status);

    if (!currentVisualScreen) {
      root.appendChild(this._renderErrorBanner('ไม่พบข้อมูลสถานะหรือสถานะไม่ถูกต้องตามระเบียบประเมิน (CONFIGURATION / UNKNOWN STATUS ERROR)<br/>Unrecognized status value in record. Please contact HR / Administrator.'));
      this.container.appendChild(root);
      return;
    }

    const currentStageNum = getMacroStage(status);
    const stageMap = { objectives: 1, midyear: 2, self_eval: 3, appraiser_eval: 4, hr_final: 5 };

    if (this.selectedViewStage) {
      const selectedStageNum = stageMap[this.selectedViewStage];
      if (!selectedStageNum || (selectedStageNum > currentStageNum && status !== '16 Completed')) {
        this.selectedViewStage = null;
      }
    }

    const effectiveVisualScreen = this.selectedViewStage || currentVisualScreen;
    const isHistoricalView = Boolean(this.selectedViewStage && effectiveVisualScreen !== currentVisualScreen);
    this.isHistoricalView = isHistoricalView;

    // R3-01: STEP 1 Lookup section is rendered on Create BEFORE fail-closed scoring snapshot validation!
    // D1: skip free-form lookup when Employee_Code is already bound from authenticated session.
    if (this.isCreate && !this.authenticatedEmployeeCode) {
      root.appendChild(this._renderLookupSection());
    }

    // Fail-Closed Snapshot Validation ONLY applies when lookup has succeeded OR on existing saved records (R3-01)
    const shouldValidateSnapshot = !(this.isCreate && !this.isEmployeeVerified);

    if (shouldValidateSnapshot) {
      const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
      const applicableCompList = getApplicableCompetencies(compSetCode);
      if (!applicableCompList) {
        root.appendChild(this._renderErrorBanner(`ไม่พบข้อมูลชุดสมรรถนะ (Competency_Set_Code: "${escapeHtml(compSetCode || 'ว่าง')}") กรุณาติดต่อ HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing Competency_Set_Code in configuration.`));
        this.container.appendChild(root);
        return;
      }

      const partAWeight = parseFloat(this._getVal('PartA_Weight') || this.previewOptions.partAWeight || '');
      const partBWeight = parseFloat(this._getVal('PartB_Weight') || this.previewOptions.partBWeight || '');
      if (isNaN(partAWeight) || isNaN(partBWeight) || (partAWeight + partBWeight) !== 100) {
        root.appendChild(this._renderErrorBanner(`ไม่พบสัดส่วนคะแนนประเมินที่ถูกต้อง (PartA_Weight + PartB_Weight ต้องเท่ากับ 100%) กรุณาติดต่อ HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing PartA_Weight / PartB_Weight ratio configuration.`));
        this.container.appendChild(root);
        return;
      }
    }

    // Admin Support Center Panel (Technical Admin Only)
    this._renderSupportCenterIfAdmin(root, status);

    // Top Overall Process Progress Bar (5 Phases + Route Aware + Phase Calendar)
    root.appendChild(this._renderOverallProgressBar(status));

    // R6-R3: Dismissible Urgency Toast (if due soon, due today, or overdue)
    const urgencyToast = this._renderUrgencyToast(status);
    if (urgencyToast) {
      root.appendChild(urgencyToast);
    }

    // R6-R4: SINGLE PERSISTENT COMPACT STATUS & DEADLINE STRIP
    root.appendChild(this._renderCompactStatusStrip(status));

    // Header Section (Horizontal Summary)
    root.appendChild(this._renderHeader());

    // Approval Route Context
    root.appendChild(this._renderRouteContext());

    // Collapsible Legend & Guidelines
    root.appendChild(this._renderCollapsibleLegendAndGuidelines());

    // Custom Error Summary Area
    const errorSummaryContainer = document.createElement('div');
    errorSummaryContainer.id = 'mbo-error-summary-anchor';
    root.appendChild(errorSummaryContainer);

    // Hoshin Section (2 Columns Horizontal)
    root.appendChild(this._renderHoshin());

    // R6-R6: Historical Stage Review Banner
    if (isHistoricalView) {
      root.appendChild(this._renderHistoryBanner(effectiveVisualScreen, status));
    }

    // Render exact 1 of 5 Visual Screens
    const origStage = this.stage;
    const origEditable = this.isEditable;

    if (isHistoricalView) {
      this.stage = BUSINESS_STAGES.READ_ONLY;
      this.isEditable = false;
    }

    try {
      if (effectiveVisualScreen === 'objectives') {
        root.appendChild(this._renderScreenObjectives());
      } else if (effectiveVisualScreen === 'midyear') {
        root.appendChild(this._renderScreenMidYear());
      } else if (effectiveVisualScreen === 'self_eval') {
        root.appendChild(this._renderScreenSelfEval());
      } else if (effectiveVisualScreen === 'appraiser_eval') {
        const resolvedRole = this._getResolvedViewerRole();
        if (['EMPLOYEE', 'RESTRICTED'].includes(resolvedRole)) {
          const privacyCard = document.createElement('div');
          privacyCard.className = 'mbo-restricted-notice mbo-wide-card';
          privacyCard.style.padding = '24px 20px';
          privacyCard.style.margin = '12px 0';
          privacyCard.style.background = '#f8fafc';
          privacyCard.style.border = '1px solid #cbd5e1';
          privacyCard.style.borderRadius = '8px';
          privacyCard.style.textAlign = 'center';
          privacyCard.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#0f172a; margin-bottom:6px;">
              🔒 อยู่ระหว่างการประเมินโดยผู้ประเมิน / Appraiser Evaluation in progress
            </div>
            <div style="font-size:13px; color:#475569;">
              ข้อมูลรายละเอียดการประเมิน Part A & Part B และผลคะแนนถูกสงวนสิทธิ์สำหรับผู้ประเมินตามลำดับขั้นและ HR<br/>
              Detailed Appraiser Evaluation ratings, comments, and scoring context are restricted to authorized Appraiser and HR reviewers.
            </div>
          `;
          root.appendChild(privacyCard);
        } else {
          root.appendChild(this._renderScreenAppraiserEval());
        }
      } else if (effectiveVisualScreen === 'hr_final') {
        const resolvedRole = this._getResolvedViewerRole();
        if (['EMPLOYEE', 'RESTRICTED'].includes(resolvedRole)) {
          const hrPrivacyCard = document.createElement('div');
          hrPrivacyCard.className = 'mbo-restricted-notice mbo-wide-card';
          hrPrivacyCard.style.padding = '24px 20px';
          hrPrivacyCard.style.margin = '12px 0';
          hrPrivacyCard.style.background = '#f0f9ff';
          hrPrivacyCard.style.border = '1px solid #bae6fd';
          hrPrivacyCard.style.borderRadius = '8px';
          hrPrivacyCard.style.textAlign = 'center';
          hrPrivacyCard.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#0369a1; margin-bottom:6px;">
              🔒 HR กำลังตรวจสอบผลขั้นสุดท้าย / HR Final Review in progress
            </div>
            <div style="font-size:13px; color:#334155;">
              ผลการประเมินสรุปและรายละเอียดขั้นสุดท้ายอยู่ระหว่างการตรวจสอบโดยฝ่ายทรัพยากรบุคคล<br/>
              Final evaluation summary breakdown is restricted to authorized HR reviewers.
            </div>
          `;
          root.appendChild(hrPrivacyCard);
        } else {
          root.appendChild(this._renderScreenHrFinal());
        }
      }
    } finally {
      this.stage = origStage;
      this.isEditable = origEditable;
    }

    // Native Kintone Comment Thread Coexistence Placeholder
    root.appendChild(this._renderNativeCommentPlaceholder());

    // Workflow Action Timeline Frame (Read-Only Lifecycle Audit Trail)
    root.appendChild(this._renderWorkflowActionTimeline());

    this.container.appendChild(root);
    this._updateTotalWeightDisplay();
    this._refreshAllFieldHighlights(root);
    this._bindEvents(root);

    if (this.currentErrors && this.currentErrors.length > 0) {
      this._renderInlineErrors(this.currentErrors);
    }
  }

  _renderHistoryBanner(viewScreenKey, currentStatus) {
    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'self_eval', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiser_eval', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hr_final', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const targetPhase = phases.find(p => p.key === viewScreenKey) || phases[0];
    const banner = document.createElement('div');
    banner.className = 'mbo-history-banner';
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:20px;">📜</span>
        <div>
          <div style="font-weight:700; font-size:13px; color:#1e40af;">
            กำลังดูข้อมูลย้อนหลัง: ${escapeHtml(targetPhase.nameTH)} (${escapeHtml(targetPhase.nameEN)}) — อ่านอย่างเดียว / Read Only
          </div>
          <div style="font-size:11px; color:#3b82f6; margin-top:2px;">
            สถานะปัจจุบันของ Workflow ในระบบ: <strong>[${escapeHtml(currentStatus)}]</strong> (การดูย้อนหลังไม่มีผลต่อสถานะระบบ)
          </div>
        </div>
      </div>
      <button type="button" class="mbo-back-to-current-btn" data-action="back-to-current">
        ↩️ กลับสู่ขั้นตอนปัจจุบัน / Back to Current Phase
      </button>
    `;

    const backBtn = banner.querySelector('[data-action="back-to-current"]');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectedViewStage = null;
        this.render();
      });
    }

    return banner;
  }

  _renderOverallProgressBar(status) {
    const card = document.createElement('div');
    card.className = 'mbo-overall-progress-card';

    const rawTopology = this._getVal('Routing_Topology');
    const prog = getProcessProgress(status, rawTopology);
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';

    if (prog.isMismatch) {
      card.innerHTML = `
        <div style="padding:12px 16px; background:#fffbe6; border:1px solid #ffe58f; border-radius:6px; color:#b45309; font-size:13px; font-weight:700;">
          ⚠️ Route Warning / Status Mismatch: ${escapeHtml(prog.mismatchMessage)}
        </div>
      `;
      return card;
    }

    const phases = [
      { key: 'objectives', calKey: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', calKey: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'self_eval', calKey: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiser_eval', calKey: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hr_final', calKey: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const currentVisualScreen = getVisualScreen(status);
    const effectiveVisualScreen = (this.selectedViewStage && (phases.find(p => p.key === this.selectedViewStage)?.stage <= currentStage || status === '16 Completed'))
      ? this.selectedViewStage
      : currentVisualScreen;
    const isHistoricalView = Boolean(this.selectedViewStage && effectiveVisualScreen !== currentVisualScreen);

    const resolvedRole = this._getResolvedViewerRole();
    const phaseStepsHtml = phases.map(p => {
      const deadline = getPhaseCalendarStatus(p.calKey, status, nowIso, calendar);
      const isCurrentStage = (currentStage === p.stage);
      const isViewedStage = (effectiveVisualScreen === p.key);
      const isReachable = (p.stage <= currentStage || status === '16 Completed') && (resolvedRole !== 'EMPLOYEE' || p.stage <= 3);

      let stepClass = 'mbo-phase-step';
      if (isViewedStage && isHistoricalView) {
        stepClass += ' viewing-history';
      } else if (isCurrentStage) {
        stepClass += ' active';
      } else if (currentStage > p.stage || deadline.status === 'Completed') {
        stepClass += ' completed';
      } else {
        stepClass += ' locked';
      }

      if (isReachable) {
        stepClass += ' clickable';
      }

      let badgeText = `[${escapeHtml(deadline.labelTH)} / ${escapeHtml(deadline.labelEN)}]`;
      if (isViewedStage && isHistoricalView) {
        badgeText = '[ Viewing / กำลังดู ]';
      } else if (isCurrentStage) {
        badgeText = '[ Current / ปัจจุบัน ]';
      }

      const tooltipText = isReachable 
        ? 'คลิกเพื่อดูข้อมูลย้อนหลัง / Click to view history' 
        : (resolvedRole === 'EMPLOYEE' && p.stage >= 4 
            ? 'รายละเอียดสงวนสิทธิ์สำหรับผู้ประเมิน/HR / Restricted to Appraisers/HR' 
            : 'ยังไม่ถึงขั้นตอน / Unreached stage');

      return `
        <div class="${stepClass}" ${isReachable ? `data-stage-key="${p.key}"` : ''} title="${tooltipText}">
          <div style="font-size:12px; font-weight:700;">${escapeHtml(p.nameTH)}</div>
          <div style="font-size:10px; font-weight:600; opacity:0.9;">${escapeHtml(p.nameEN)}</div>
          <div class="mbo-deadline-badge ${isViewedStage && isHistoricalView ? 'mbo-deadline-history' : deadline.badgeClass}">
            ${badgeText}
          </div>
          <div style="font-size:9.5px; margin-top:2px; opacity:0.85;">
            ${escapeHtml(deadline.daysTextEN)}
          </div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="mbo-progress-phases">
        ${phaseStepsHtml}
      </div>
      <div class="mbo-progress-bar-wrap" style="margin-top:10px;">
        <div class="mbo-progress-bar-fill" style="width: ${prog.percent}%;"></div>
      </div>
      <div class="mbo-progress-label" style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>📊 ความคืบหน้าตามเส้นทาง / Route Progress: <strong>${prog.percent}%</strong> (${escapeHtml(prog.label)})</span>
        <span style="font-size:11px; color:#64748b;">📅 Simulated Date: <strong>${escapeHtml(nowIso)}</strong></span>
      </div>
    `;
    card.querySelectorAll('.mbo-phase-step.clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const stageKey = el.getAttribute('data-stage-key');
        if (!stageKey) return;
        const targetPhase = phases.find(p => p.key === stageKey);
        if (!targetPhase) return;
        if (targetPhase.stage <= currentStage || status === '16 Completed') {
          if (targetPhase.key === currentVisualScreen) {
            this.selectedViewStage = null;
          } else {
            this.selectedViewStage = stageKey;
          }
          this.render();
        }
      });
    });

    return card;
  }

  _renderCompactStatusStrip(status) {
    const currentStatus = String(status || '').trim();
    const rawTopology = this._getVal('Routing_Topology');
    const topInfo = classifyTopologyForUI(rawTopology);

    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const activePhase = phases.find(p => p.stage === currentStage) || phases[0];
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';
    const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);

    let bannerClass = 'mbo-urgency-green';
    let pillClass = 'pill-green';
    let icon = '⏳';

    if (deadline.isCompleted) {
      bannerClass = 'mbo-urgency-green';
      pillClass = 'pill-green';
      icon = '✓';
    } else if (deadline.isOverdue) {
      bannerClass = 'mbo-urgency-red mbo-pulse-active';
      pillClass = 'pill-red';
      icon = '🚨';
    } else if (deadline.isDueToday) {
      bannerClass = 'mbo-urgency-orange mbo-pulse-active';
      pillClass = 'pill-orange';
      icon = '⚠️';
    } else if (deadline.isDueSoon || (deadline.remDays >= 1 && deadline.remDays <= 7)) {
      bannerClass = 'mbo-urgency-amber mbo-pulse-active';
      pillClass = 'pill-amber';
      icon = '⏰';
    } else if (deadline.isUpcoming) {
      bannerClass = 'mbo-urgency-neutral';
      pillClass = 'pill-neutral';
      icon = '📅';
    }

    const exactDueDate = calendar[activePhase.key]?.end || 'N/A';
    const statusGuidance = getStatusGuidance(status, rawTopology);

    let actorSummary = '';
    if (['01 Draft Objective', '06 Employee Mid-Year', '11 Employee Self Evaluation'].includes(currentStatus)) {
      actorSummary = '👤 <strong>Action Required: Requester / Employee (พนักงาน):</strong> กรอกข้อมูลแล้วกดส่งเรื่องขออนุมัติ';
    } else if (['02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review'].includes(currentStatus)) {
      actorSummary = '👥 <strong>Action Required: Workflow Approver (ผู้อนุมัติ):</strong> ตรวจสอบและพิจารณาอนุมัติผ่านปุ่ม Kintone';
    } else if (['12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(currentStatus)) {
      actorSummary = '👥 <strong>Action Required: Appraiser (ผู้ประเมิน):</strong> ให้คะแนน Part A & Part B แล้วกดอนุมัติ';
    } else if (currentStatus === '05 Objective Approved') {
      actorSummary = deadline.isUpcoming ? '🔒 <strong>รอเวลา:</strong> อยู่ระหว่างรอเปิดช่วงทบทวนกลางปี' : '🚀 <strong>พร้อมเริ่ม:</strong> พนักงานกดปุ่ม "Start Mid-Year" ใน Kintone';
    } else if (currentStatus === '10 Mid-Year Completed') {
      actorSummary = deadline.isUpcoming ? '🔒 <strong>รอเวลา:</strong> อยู่ระหว่างรอเปิดช่วงประเมินตนเอง' : '🚀 <strong>พร้อมเริ่ม:</strong> พนักงานกดปุ่ม "Start Self Evaluation" ใน Kintone';
    } else if (currentStatus === '15 HR Final Check') {
      actorSummary = '🏛️ <strong>HR Admin:</strong> ตรวจสอบความถูกต้องขั้นสุดท้ายแล้วกดเสร็จสิ้น';
    } else if (currentStatus === '16 Completed') {
      actorSummary = '✓ <strong>เสร็จสมบูรณ์:</strong> การประเมินเสร็จสิ้นเรียบร้อยแล้ว';
    }

    const card = document.createElement('div');
    card.className = 'mbo-compact-status-strip-wrap';
    card.innerHTML = `
      <div class="mbo-urgency-callout mbo-compact-status-strip ${bannerClass}">
        <div class="mbo-urgency-icon">${icon}</div>
        <div class="mbo-urgency-content">
          <div class="mbo-urgency-header-row">
            <div class="mbo-urgency-phase-title">
              📌 ${escapeHtml(activePhase.nameTH)} (${escapeHtml(activePhase.nameEN)}) — <span style="font-weight:600;">[${escapeHtml(currentStatus)}]</span>
            </div>
            <div class="mbo-urgency-badge-pill ${pillClass}">
              ${escapeHtml(deadline.calloutTextTH)} / ${escapeHtml(deadline.calloutTextEN)}
            </div>
          </div>
          <div class="mbo-urgency-sub-date">
            <span>${actorSummary}</span>
            <span style="margin-left:12px; color:#475569;">📅 ครบกำหนด: <strong>${escapeHtml(exactDueDate)}</strong></span>
          </div>
          ${statusGuidance && statusGuidance.isWarning ? `<div style="font-size:11px; font-weight:700; color:#b45309; margin-top:3px;">${escapeHtml(statusGuidance.th)}</div>` : ''}
        </div>
      </div>
    `;

    return card;
  }

  _renderDeadlineUrgencyBanner(status) {
    const card = document.createElement('div');
    card.className = 'mbo-deadline-urgency-container';

    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const activePhase = phases.find(p => p.stage === currentStage) || phases[0];
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';
    const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);

    let bannerClass = 'mbo-urgency-green';
    let icon = '⏳';

    if (deadline.isCompleted) {
      bannerClass = 'mbo-urgency-green';
      icon = '✓';
    } else if (deadline.isOverdue) {
      bannerClass = 'mbo-urgency-red mbo-pulse-active';
      icon = '🚨';
    } else if (deadline.isDueToday) {
      bannerClass = 'mbo-urgency-orange mbo-pulse-active';
      icon = '⚠️';
    } else if (deadline.isDueSoon || (deadline.remDays >= 1 && deadline.remDays <= 7)) {
      bannerClass = 'mbo-urgency-amber mbo-pulse-active';
      icon = '⏰';
    } else if (deadline.isUpcoming) {
      bannerClass = 'mbo-urgency-neutral';
      icon = '📅';
    }

    const exactDueDate = calendar[activePhase.key]?.end || 'N/A';

    card.innerHTML = `
      <div class="mbo-urgency-callout ${bannerClass}">
        <div class="mbo-urgency-icon">${icon}</div>
        <div class="mbo-urgency-content">
          <div class="mbo-urgency-phase-title">
            📌 ขั้นตอนปัจจุบัน / CURRENT PHASE: ${escapeHtml(activePhase.nameTH)} (${escapeHtml(activePhase.nameEN)})
          </div>
          <div class="mbo-urgency-main-number">
            ${escapeHtml(deadline.calloutTextTH)} / ${escapeHtml(deadline.calloutTextEN)}
          </div>
          <div class="mbo-urgency-sub-date">
            📅 กำหนดส่งคงเหลือ / Phase Due Date: <strong>${escapeHtml(exactDueDate)}</strong> (วันที่จำลองประเมิน / Simulated Date: ${escapeHtml(nowIso)})
          </div>
        </div>
      </div>
    `;

    return card;
  }

  _renderUrgencyToast(status) {
    if (this._toastDismissed) return null;

    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const activePhase = phases.find(p => p.stage === currentStage) || phases[0];
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';
    const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);

    const isDueSoon = deadline.isDueSoon || (deadline.remDays >= 1 && deadline.remDays <= 7);
    const isDueToday = deadline.isDueToday;
    const isOverdue = deadline.isOverdue;

    if (!isDueSoon && !isDueToday && !isOverdue) {
      return null;
    }

    const toast = document.createElement('div');
    toast.className = `mbo-urgency-toast ${isOverdue ? 'overdue' : (isDueToday ? 'due-today' : 'due-soon')}`;

    let msgTH = '';
    if (isOverdue) {
      msgTH = `⚠️ เกินกำหนด ${deadline.overdueDays || ''} วัน — กรุณาดำเนินการโดยเร็ว / Please take action as soon as possible.`;
    } else if (isDueToday) {
      msgTH = `⚠️ ครบกำหนดวันนี้ — กรุณาดำเนินการให้เสร็จสิ้นภายในวันนี้ / Due Today! Please complete your action today.`;
    } else {
      msgTH = `⏳ เหลือ ${deadline.remDays} วัน — กรุณาดำเนินการภายในกำหนด / Please complete action before deadline.`;
    }

    const toastBody = document.createElement('div');
    toastBody.className = 'mbo-urgency-toast-body';

    const toastText = document.createElement('div');
    toastText.className = 'mbo-urgency-toast-text';
    toastText.innerHTML = `<strong>${escapeHtml(activePhase.nameTH)}:</strong> ${escapeHtml(msgTH)}`;
    toastBody.appendChild(toastText);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mbo-urgency-toast-close';
    closeBtn.type = 'button';
    closeBtn.textContent = '✕ ปิด / Dismiss';
    closeBtn.addEventListener('click', () => {
      this._toastDismissed = true;
      if (typeof toast.remove === 'function') {
        toast.remove();
      } else if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });

    toastBody.appendChild(closeBtn);
    toast.appendChild(toastBody);

    return toast;
  }

  _renderActorBanner(status) {
    const currentStatus = String(status || '').trim();
    const rawTopology = this._getVal('Routing_Topology');
    const topInfo = classifyTopologyForUI(rawTopology);
    const card = document.createElement('div');
    card.className = 'mbo-actor-banner-card';
    card.style.marginBottom = '14px';

    if (!topInfo.isCanonical || !topInfo.isSupportedV1) {
      card.innerHTML = `
        <div style="background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; border-radius:6px; color:#991b1b; font-size:13px; font-weight:700;">
          ⚠️ Route Warning: Cannot determine stage owner because routing topology is missing, unrecognized, or unsupported in V1 (${escapeHtml(topInfo.raw || 'None')}).
        </div>
      `;
      return card;
    }

    const pathList = getApplicableWorkflowPath(rawTopology);
    if (pathList && !pathList.includes(currentStatus)) {
      card.innerHTML = `
        <div style="background:#fffbe6; border:1px solid #ffe58f; padding:10px 14px; border-radius:6px; color:#b45309; font-size:13px; font-weight:700;">
          ⚠️ Route Mismatch: Status "${escapeHtml(currentStatus)}" is not applicable to active ${escapeHtml(topInfo.raw)} route.
        </div>
      `;
      return card;
    }

    let actorTitle = '';
    let actorDesc = '';
    let badgeColor = '#0284c7';
    let badgeBg = '#e0f2fe';

    if (['01 Draft Objective', '06 Employee Mid-Year', '11 Employee Self Evaluation'].includes(currentStatus)) {
      actorTitle = '👤 Action Required: Requester / Employee (พนักงานผู้รับการประเมิน)';
      actorDesc = 'พนักงานกรอกข้อมูลและบันทึกเป้าหมาย/ผลงานในส่วนที่รับผิดชอบ จากนั้นกดปุ่มส่งเรื่องเพื่อขออนุมัติ';
      badgeColor = '#0284c7'; badgeBg = '#e0f2fe';
    } else if (['02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review'].includes(currentStatus)) {
      actorTitle = '👥 Action Required: Workflow Approver (ผู้บังคับบัญชา / ผู้อนุมัติตามลำดับขั้น)';
      actorDesc = 'ผู้อนุมัติตามลำดับขั้นตรวจสอบความถูกต้องและพิจารณาอนุมัติผ่านปุ่ม Kintone ด้านบน';
      badgeColor = '#b45309'; badgeBg = '#fef3c7';
    } else if (['12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(currentStatus)) {
      actorTitle = '👥 Action Required: Workflow Approver & Scoring Appraisers (ผู้บังคับบัญชา & ผู้ประเมิน)';
      actorDesc = 'ผู้ประเมินให้คะแนน Part A (Objectives) และ Part B (Competencies) พร้อมข้อเสนอแนะ จากนั้นกดปุ่มอนุมัติ';
      badgeColor = '#6d28d9'; badgeBg = '#f3e8ff';
    } else if (currentStatus === '05 Objective Approved') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || '2026-06-15';
      const deadline = calculateDeadlineInfo(calendar.midyear.start, calendar.midyear.end, nowIso, false);

      if (deadline.isUpcoming) {
        actorTitle = '🔒 Waiting Boundary: 05 Objective Approved — ยังไม่ต้องดำเนินการ / No action required yet';
        actorDesc = `เป้าหมายได้รับการอนุมัติเรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาทบทวนกลางปี (Mid-Year opens in ${deadline.diffDays || 0} days on ${calendar.midyear.start})`;
        badgeColor = '#047857'; badgeBg = '#d1fae5';
      } else {
        actorTitle = '🚀 Ready Boundary: 05 Objective Approved — พร้อมเริ่มทบทวนกลางปี / Ready to start Mid-Year';
        actorDesc = `ช่วงเวลาทบทวนกลางปีเปิดแล้ว (พนักงาน Requester เป็นผู้ดำเนินการ: กรุณากดปุ่ม "Start Mid-Year" ในระบบ Kintone เพื่อเข้าสู่ช่วงทบทวนกลางปี)`;
        badgeColor = '#0284c7'; badgeBg = '#e0f2fe';
      }
    } else if (currentStatus === '10 Mid-Year Completed') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || '2026-06-15';
      const deadline = calculateDeadlineInfo(calendar.selfEvaluation.start, calendar.selfEvaluation.end, nowIso, false);

      if (deadline.isUpcoming) {
        actorTitle = '🔒 Waiting Boundary: 10 Mid-Year Completed — ยังไม่ต้องดำเนินการ / No action required yet';
        actorDesc = `การทบทวนกลางปีเสร็จสมบูรณ์เรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาประเมินตนเองปลายปี (Self Evaluation opens in ${deadline.diffDays || 0} days on ${calendar.selfEvaluation.start})`;
        badgeColor = '#047857'; badgeBg = '#d1fae5';
      } else {
        actorTitle = '🚀 Ready Boundary: 10 Mid-Year Completed — พร้อมเริ่มประเมินตนเอง / Ready to start Self Evaluation';
        actorDesc = `ช่วงเวลาประเมินตนเองเปิดแล้ว (พนักงาน Requester เป็นผู้ดำเนินการ: กรุณากดปุ่ม "Start Self Evaluation" ในระบบ Kintone เพื่อเข้าสู่ช่วงประเมินตนเอง)`;
        badgeColor = '#0284c7'; badgeBg = '#e0f2fe';
      }
    } else if (currentStatus === '15 HR Final Check') {
      actorTitle = '🔍 Action Required: HR Final Check (ฝ่ายทรัพยากรบุคคล)';
      actorDesc = 'HR ตรวจสอบความถูกต้องและอนุมัติปิดรอบประเมิน MBO';
      badgeColor = '#0369a1'; badgeBg = '#e0f2fe';
    } else if (currentStatus === '16 Completed') {
      actorTitle = '🎉 Status: Completed — All Evaluation Phases Closed (เสร็จสิ้นสมบูรณ์)';
      actorDesc = 'กระบวนการประเมินเสร็จสมบูรณ์เรียบร้อย ข้อมูลทั้งหมดถูกล็อกถาวรเพื่อใช้อ้างอิง';
      badgeColor = '#15803d'; badgeBg = '#dcfce7';
    }

    card.innerHTML = `
      <div style="background:${badgeBg}; border:1px solid ${badgeColor}; padding:10px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:13.5px; font-weight:700; color:${badgeColor};">${actorTitle}</div>
          <div style="font-size:12px; color:#334155; margin-top:2px;">${actorDesc}</div>
        </div>
        <div style="font-size:11px; font-weight:700; background:#ffffff; color:${badgeColor}; padding:4px 10px; border-radius:12px; border:1px solid ${badgeColor}; white-space:nowrap;">
          Actor-Aware Context
        </div>
      </div>
    `;

    return card;
  }

  _getSavedAttachmentFiles(fieldCode) {
    let recField = this.record[fieldCode];
    if ((!recField || !recField.value || (Array.isArray(recField.value) && recField.value.length === 0)) && fieldCode.startsWith('Self_Attachment_')) {
      const altCode = fieldCode.replace('Self_Attachment_', 'Final_Attachment_');
      recField = this.record[altCode];
    }
    const rawVal = recField ? recField.value : null;
    if (!rawVal) return [];

    if (Array.isArray(rawVal)) {
      return rawVal.map(item => {
        if (item && typeof item === 'object' && item.name) {
          return { name: item.name, fileKey: item.fileKey || '', size: item.size || 0, contentType: item.contentType || '' };
        } else if (typeof item === 'string' && item) {
          return { name: item, fileKey: '', size: 0, contentType: '' };
        }
        return null;
      }).filter(Boolean);
    } else if (typeof rawVal === 'object' && rawVal.name) {
      return [{ name: rawVal.name, fileKey: rawVal.fileKey || '', size: rawVal.size || 0, contentType: rawVal.contentType || '' }];
    } else if (typeof rawVal === 'string' && rawVal) {
      return [{ name: rawVal, fileKey: '', size: 0, contentType: '' }];
    }
    return [];
  }

  _removeSavedAttachmentFile(fieldCode, filename, fileKey) {
    let targetCode = fieldCode;
    if ((!this.record[targetCode] || !this.record[targetCode].value) && targetCode.startsWith('Self_Attachment_')) {
      const altCode = targetCode.replace('Self_Attachment_', 'Final_Attachment_');
      if (this.record[altCode]) targetCode = altCode;
    }
    if (!this.record[targetCode] || !Array.isArray(this.record[targetCode].value)) return;

    this.record[targetCode].value = this.record[targetCode].value.filter(f => {
      if (fileKey && f.fileKey) return f.fileKey !== fileKey;
      if (filename && f.name) return f.name !== filename;
      if (typeof f === 'string') return f !== filename;
      return true;
    });
  }

  _renderAttachmentControl(fieldCode, stageLabel, isEditable) {
    const isPreview = Boolean(this.isPreviewMode || this.previewOptions?.isPreviewMode);

    const savedFiles = this._getSavedAttachmentFiles(fieldCode);
    const pendingFiles = (this.pendingAttachments && this.pendingAttachments[fieldCode]) || [];

    let mockFiles = [];
    if (isPreview && savedFiles.length === 0 && pendingFiles.length === 0 && this.previewOptions?.attachments?.[fieldCode]) {
      const mock = this.previewOptions.attachments[fieldCode];
      if (mock && mock.name) mockFiles = [{ name: mock.name, isPreviewMock: true }];
    }

    const allFilesToDisplay = [
      ...savedFiles.map(f => ({ ...f, isSaved: true })),
      ...pendingFiles.map((f, idx) => ({ ...f, isPending: true, pendingIdx: idx })),
      ...mockFiles
    ];

    if (allFilesToDisplay.length === 0) {
      if (isEditable) {
        return `
          <div class="mbo-attachment-box" data-attachment-box="${escapeHtml(fieldCode)}">
            <label class="mbo-attachment-btn" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; color:#0284c7; background:#e0f2fe; border:1px solid #bae6fd; padding:4px 10px; border-radius:4px;">
              📎 แนบไฟล์ (เลือกได้ / Optional)
              <input type="file" class="mbo-attachment-file-input" data-code="${escapeHtml(fieldCode)}" multiple style="display:none;" />
            </label>
            <div style="font-size:9.5px; color:#64748b; margin-top:2px;">Optional evidence (${escapeHtml(stageLabel)})</div>
          </div>
        `;
      }
      return `<span class="mbo-no-attachment" style="font-size:11px; color:#94a3b8; font-style:italic;">ไม่มีไฟล์แนบ / No attachment</span>`;
    }

    const badgesHtml = allFilesToDisplay.map(f => {
      if (f.isPending) {
        if (f.status === 'error') {
          return `
            <div class="mbo-attachment-badge error-file" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#b91c1c; background:#fef2f2; border:1px solid #fca5a5; padding:3px 8px; border-radius:4px; margin:2px;">
              ⚠️ <span title="${escapeHtml(f.name)}" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(f.name)}</span>
              <span class="mbo-attachment-error-tag" style="font-size:10px; font-weight:700; color:#dc2626;">(อัปโหลดล้มเหลว / Upload failed)</span>
              ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml(fieldCode)}" data-pending-idx="${f.pendingIdx}" style="border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px;">✕</button>` : ''}
            </div>
          `;
        }
        return `
          <div class="mbo-attachment-badge pending-file" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#0369a1; background:#f0f9ff; border:1px dashed #0284c7; padding:3px 8px; border-radius:4px; margin:2px;">
            📎 <span title="${escapeHtml(f.name)}" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(f.name)}</span>
            <span class="mbo-attachment-pending-tag" style="font-size:10px; font-weight:700; color:#0284c7;">(รอบันทึก / Pending save)</span>
            ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml(fieldCode)}" data-pending-idx="${f.pendingIdx}" style="border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px;">✕</button>` : ''}
          </div>
        `;
      }

      const isMock = Boolean(f.isPreviewMock);
      return `
        <div class="mbo-attachment-badge saved-file" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#1e293b; background:#f1f5f9; border:1px solid #cbd5e1; padding:3px 8px; border-radius:4px; margin:2px;">
          📎 <span title="${escapeHtml(f.name)}" style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(f.name)}</span>
          ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml(fieldCode)}" data-filename="${escapeHtml(f.name)}" data-filekey="${escapeHtml(f.fileKey || '')}" style="border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px;">✕</button>` : ''}
        </div>
      `;
    }).join('');

    const addMoreBtnHtml = isEditable ? `
      <label class="mbo-attachment-btn-add" style="cursor:pointer; display:inline-flex; align-items:center; font-size:10.5px; font-weight:600; color:#0284c7; background:#ffffff; border:1px solid #bae6fd; padding:2px 6px; border-radius:4px; margin:2px;">
        + เพิ่มไฟล์ / Add file
        <input type="file" class="mbo-attachment-file-input" data-code="${escapeHtml(fieldCode)}" multiple style="display:none;" />
      </label>
    ` : '';

    return `
      <div class="mbo-attachment-container" data-attachment-container="${escapeHtml(fieldCode)}" style="display:flex; flex-wrap:wrap; align-items:center; gap:2px;">
        ${badgesHtml}
        ${addMoreBtnHtml}
      </div>
    `;
  }

  _renderWorkflowActionTimeline() {
    const card = document.createElement('div');
    card.className = 'mbo-timeline-card';

    const resolvedRole = this._getResolvedViewerRole();
    const isPreview = Boolean(this.isPreviewMode || this.previewOptions?.isPreviewMode);

    let rawEvents = null;
    if (Array.isArray(this.previewOptions?.timelineEvents)) {
      rawEvents = this.previewOptions.timelineEvents;
    } else if (isPreview) {
      rawEvents = [
        { stage: '1. Objectives', actor: '1st Appraiser (ผู้ประเมินลำดับที่ 1)', name: 'Manager Sompong (m01)', action: 'Approved Objectives', time: '14 Feb 2026 • 09:42', outcome: 'approved', commentNotice: false },
        { stage: '1. Objectives', actor: '2nd Appraiser (ผู้ประเมินลำดับที่ 2)', name: 'GM Vichai (g01)', action: 'Returned for Revision', time: '15 Feb 2026 • 10:18', outcome: 'returned', commentNotice: true },
        { stage: '1. Objectives', actor: 'Employee / Requester (พนักงาน)', name: 'Somchai Prasert (0118)', action: 'Resubmitted Objectives', time: '16 Feb 2026 • 08:30', outcome: 'resubmitted', commentNotice: false },
        { stage: '1. Objectives', actor: '2nd Appraiser (ผู้ประเมินลำดับที่ 2)', name: 'GM Vichai (g01)', action: 'Approved Objectives', time: '16 Feb 2026 • 13:05', outcome: 'approved', commentNotice: false },
        { stage: '4. Appraiser Evaluation', actor: '1st Appraiser (ผู้ประเมินลำดับที่ 1)', name: 'Manager Sompong (m01)', action: 'Scoring Completed', time: '20 Nov 2026 • 14:22', outcome: 'approved', commentNotice: false }
      ];
    } else {
      // Live mode without timelineEvents: zero fake events!
      rawEvents = [];
    }

    let events = [...rawEvents];

    if (resolvedRole === 'EMPLOYEE' && events.length > 0) {
      events = events.filter(e => {
        const stageStr = String(e.stage || '').toLowerCase();
        return !stageStr.includes('4.') && !stageStr.includes('5.') && !stageStr.includes('appraiser evaluation') && !stageStr.includes('hr final');
      });
    }

    if (events.length === 0) {
      card.innerHTML = `
        <details open style="cursor:pointer;">
          <summary class="mbo-timeline-title">
            <span>📜 ประวัติการดำเนินการ / Workflow Action Timeline (Read-Only Audit Trail)</span>
            <span style="font-size:11px; font-weight:600; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px;">0 Events Recorded</span>
          </summary>
          <div class="mbo-timeline-empty" style="padding:15px; text-align:center; color:#64748b; font-size:12px; font-style:italic; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-top:10px;">
            ยังไม่มีประวัติการดำเนินการ / No workflow history available
          </div>
        </details>
      `;
      return card;
    }

    const rowsHtml = events.map((e, idx) => {
      const outcomeClass = escapeHtml(e.outcome || 'approved');
      const badgeText = e.outcome === 'returned' ? 'Returned' : (e.outcome === 'resubmitted' ? 'Resubmitted' : 'Approved');
      const isReturned = e.outcome === 'returned';

      return `
        <tr class="${isReturned ? 'returned-row' : ''}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${idx + 1}</td>
          <td><span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 6px; border-radius:4px;">${escapeHtml(e.stage)}</span></td>
          <td style="font-weight:700; color:#1e293b;">${escapeHtml(e.actor)}</td>
          <td style="font-weight:600; color:#0f172a;">${escapeHtml(e.name)}</td>
          <td style="font-weight:600; color:#334155;">${escapeHtml(e.action)}</td>
          <td style="font-size:11.5px; color:#475569; white-space:nowrap;">🕒 ${escapeHtml(e.time)}</td>
          <td style="text-align:center;"><span class="mbo-timeline-badge ${outcomeClass}">${escapeHtml(badgeText)}</span></td>
          <td style="font-size:11px;">${e.commentNotice ? `<span style="color:#dc2626; font-weight:700;">💬 ดูความคิดเห็น / View Comments</span>` : '<span style="color:#94a3b8;">—</span>'}</td>
        </tr>
      `;
    }).join('');

    card.innerHTML = `
      <details open style="cursor:pointer;">
        <summary class="mbo-timeline-title">
          <span>📜 ประวัติการดำเนินการ / Workflow Action Timeline (Read-Only Audit Trail)</span>
          <span style="font-size:11px; font-weight:600; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px;">${events.length} Events Recorded</span>
        </summary>
        <div class="mbo-table-container" style="margin-top:10px;">
          <table class="mbo-timeline-table">
            <thead>
              <tr>
                <th style="width:35px; text-align:center;">#</th>
                <th style="width:17%;">ขั้นตอน / Stage</th>
                <th style="width:20%;">ผู้ดำเนินการ / Actor</th>
                <th style="width:16%;">ชื่อผู้ดำเนินการ / Person</th>
                <th style="width:16%;">การดำเนินการ / Action</th>
                <th style="width:14%;">วัน-เวลา / Date & Time</th>
                <th style="width:12%; text-align:center;">ผลลัพธ์ / Result</th>
                <th style="width:12%;">หมายเหตุ / Comments</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </details>
    `;
    return card;
  }

  _renderNativeCommentPlaceholder() {
    const card = document.createElement('div');
    card.className = 'mbo-native-comment-placeholder';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#0f172a; font-size:13px;">💬 ความคิดเห็นใน Kintone / Kintone Comments (Native Platform)</strong>
          <div style="font-size:11.5px; color:#475569; margin-top:2px;">
            เมื่อมีการส่งกลับให้แก้ไข (Return / Reject) ผู้ประเมินและพนักงานสามารถสื่อสารผ่านช่องทางความคิดเห็นหลักของ Kintone ทางด้านขวามือของหน้าจอ
          </div>
        </div>
        <span style="font-size:10.5px; font-weight:700; background:#e2e8f0; color:#334155; padding:4px 8px; border-radius:4px; white-space:nowrap;">
          Native Platform Coexistence
        </span>
      </div>
    `;
    return card;
  }

  _renderScreenObjectives() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const isObjectiveStage = this.isCreate || this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT || this.stage === BUSINESS_STAGES.NEW_RECORD;
    const isObjEditable = this.isEditable && isObjectiveStage && this.isEmployeeVerified;

    let count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null && this.isCreate === true) {
      count = 4; // True create/new record draft default choice in UI selection
    }

    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: Part A : MBO (การตั้งเป้าหมายผลงาน / Objectives Setup)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>จำนวนเป้าหมาย / Number of Objectives:</span>
        ${isObjEditable ? `
          <select id="mbo-obj-count-select" class="mbo-cell-select" style="width: 65px; height: 28px; font-size: 13px; padding: 2px 6px; background: #ffffff;">
            ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        ` : `<strong>${count} Objectives</strong>`}
      </div>
    `;
    container.appendChild(bar);

    if (this.isCreate && !this.isEmployeeVerified) {
      const lockBanner = document.createElement('div');
      lockBanner.style.padding = '30px 20px';
      lockBanner.style.textAlign = 'center';
      lockBanner.style.background = '#f8fafc';
      lockBanner.style.border = '1px dashed #cbd5e1';
      lockBanner.style.borderRadius = '6px';
      lockBanner.style.margin = '12px 0';
      lockBanner.style.color = '#64748b';
      lockBanner.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 6px;">🔒 ตารางตั้งเป้าหมายถูกล็อกชั่วคราว / Objective Setup is Locked</div>
        <div style="font-size: 13px;">กรุณาระบุรหัสพนักงานใน <strong>STEP 1</strong> และกดปุ่มค้นหาก่อนเพื่อปลดล็อกการตั้งเป้าหมาย<br/>Please identify and verify employee profile in STEP 1 to unlock objective setup.</div>
      `;
      container.appendChild(lockBanner);
      return container;
    }

    const currentStatus = this._getVal('Status') || '01 Draft Objective';
    if (currentStatus === '05 Objective Approved') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const boundaryBanner = document.createElement('div');
      boundaryBanner.style.padding = '16px 20px';
      boundaryBanner.style.background = '#f0fdf4';
      boundaryBanner.style.border = '1px solid #86efac';
      boundaryBanner.style.borderRadius = '6px';
      boundaryBanner.style.margin = '12px 0';
      boundaryBanner.innerHTML = `
        <div style="font-size:15px; font-weight:700; color:#166534; margin-bottom:4px;">🔒 05 Objective Approved — Stage 1 Complete</div>
        <div style="font-size:12.5px; color:#334155;">เป้าหมายได้รับการอนุมัติเรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาทบทวนกลางปี (Mid-Year Start Date: <strong>${escapeHtml(calendar.midyear.start)}</strong>)</div>
      `;
      container.appendChild(boundaryBanner);
    }

    // Desktop Horizontal Spreadsheet Table Layout (R5)
    const table = document.createElement('table');
    table.className = 'mbo-grid-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="width: 28%;">
            เป้าหมายและผลลัพธ์ที่คาดหวัง / Objectives & Target *
            <span class="th-sub">[ระบุเป้าหมาย ตัวชี้วัด และค่าเป้าหมาย]</span>
          </th>
          <th style="width: 28%;">
            แผนปฏิบัติการ / Action Plan *
            <span class="th-sub">[ระบุกิจกรรม ขั้นตอน และระยะเวลาดำเนินการ]</span>
          </th>
          <th style="width: 16%;">
            ข้อตกลงเพิ่มเติม / Additional Agreement
            <span class="th-sub">[ข้อตกลงหรือหมายเหตุเพิ่มเติม]</span>
          </th>
          <th style="width: 7%; text-align: center;">
            น้ำหนัก *
            <span class="th-sub">(Weight %)</span>
          </th>
          <th style="width: 11%; text-align: center;">
            ความยาก *
            <span class="th-sub">[Difficulty 1-4]</span>
          </th>
          <th style="width: 10%; text-align: center;">
            แนบไฟล์ / Attach File
            <span class="th-sub">(Optional)</span>
          </th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const actVal = this._getVal(`Action_Plan_${i}`);
      const addVal = this._getVal(`Additional_Agreement_${i}`);
      const wVal = this._getVal(`Weight_${i}`);
      const diffVal = this._getVal(`Difficulty_${i}`);
      const attachHtml = this._renderAttachmentControl(`Objective_Attachment_${i}`, 'Objectives', isObjEditable);

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุเป้าหมายและผลลัพธ์ที่คาดหวัง...">${escapeHtml(objVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุกิจกรรมและแผนงานเพื่อบรรลุเป้าหมาย...">${escapeHtml(actVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} style="min-height:75px;" placeholder="ข้อตกลงเพิ่มเติม...">${escapeHtml(addVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </td>
        <td style="text-align:center; vertical-align:top;">
          <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${escapeHtml(wVal)}" ${!isObjEditable ? 'readonly' : ''} style="text-align:center; height:36px;" placeholder="30" />
          <span class="mbo-cell-tag" data-target="Weight_${i}"></span>
        </td>
        <td style="vertical-align:top;">
          ${isObjEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Difficulty_${i}" data-required="true" style="height:36px;">
              <option value="" ${!diffVal ? 'selected' : ''}>-- กรุณาเลือกระดับความยาก / Please select --</option>
              <option value="1" ${diffVal === '1' ? 'selected' : ''}>1 : Normal (ง่าย)</option>
              <option value="2" ${diffVal === '2' ? 'selected' : ''}>2 : Moderate (ปานกลาง)</option>
              <option value="3" ${diffVal === '3' ? 'selected' : ''}>3 : Difficult (ยาก)</option>
              <option value="4" ${diffVal === '4' ? 'selected' : ''}>4 : Challenging (ท้าทายมาก)</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="${diffVal ? `Level ${escapeHtml(diffVal)}` : 'ยังไม่ได้ระบุ / Not selected'}" readonly style="height:36px;" />
          `}
          <span class="mbo-cell-tag" data-target="Difficulty_${i}"></span>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
      tbody.appendChild(tr);
    }

    container.appendChild(table);

    // Total Weight Summary
    container.appendChild(this._renderWeightSummary());

    return container;
  }

  _renderScreenMidYear() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const isMidEditable = this.isEditable && this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: ทบทวนกลางปี / Stage 2 — Mid-Year Progress & Review (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Table Layout]</span>
    `;
    container.appendChild(bar);

    const currentStatus = this._getVal('Status') || '06 Employee Mid-Year';
    if (currentStatus === '10 Mid-Year Completed') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const boundaryBanner = document.createElement('div');
      boundaryBanner.style.padding = '24px 20px';
      boundaryBanner.style.textAlign = 'center';
      boundaryBanner.style.background = '#f0fdf4';
      boundaryBanner.style.border = '1px dashed #86efac';
      boundaryBanner.style.borderRadius = '6px';
      boundaryBanner.style.margin = '12px';
      boundaryBanner.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#166534; margin-bottom:6px;">🔒 10 Mid-Year Completed — Stage 2 Complete</div>
        <div style="font-size:13px; color:#334155;">การทบทวนกลางปีเสร็จสมบูรณ์เรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาประเมินตนเองปลายปี (Self Eval Start Date: <strong>${escapeHtml(calendar.selfEvaluation.start)}</strong>)</div>
      `;
      container.appendChild(boundaryBanner);
      return container;
    }

    const table = document.createElement('table');
    table.className = 'mbo-grid-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">#</th>
          <th style="width:22%;">เป้าหมาย & แผนงาน / Objective & Action Plan (Read-Only)</th>
          <th style="width:16%;">ความคืบหน้าของเป้าหมาย / Objective Progress (%)</th>
          <th style="width:17%;">ทบทวนเป็นระยะ / Periodical Review</th>
          <th style="width:17%;">ผลสำเร็จปัจจุบัน / Milestone Result</th>
          <th style="width:16%;">ปัญหาอุปสรรค / Issue & Next Action</th>
          <th style="width:12%; text-align:center;">แนบไฟล์ / Attach File <span class="th-sub">(Optional)</span></th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const actVal = this._getVal(`Action_Plan_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || '0', 10);
      const revVal = this._getVal(`Periodical_Review_${i}`);
      const resVal = this._getVal(`MidYear_Result_${i}`);
      const riskVal = this._getVal(`MidYear_Issue_Risk_${i}`);
      const nextActVal = this._getVal(`MidYear_Next_Action_${i}`);
      const attachHtml = this._renderAttachmentControl(`MidYear_Attachment_${i}`, 'Mid-Year', isMidEditable);

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#1e3a8a; font-size:13px;">#${i} ${escapeHtml(objVal) || '(No title)'}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin:2px 0 4px 0;">Weight: ${escapeHtml(wVal)}%</div>
          <div style="font-size:12px; color:#475569; background:#f8fafc; padding:6px; border-radius:4px;">${escapeHtml(actVal) || '-'}</div>
        </td>
        <td>
          <div style="font-size:10.5px; font-weight:700; color:#0369a1; margin-bottom:2px;">
            ความคืบหน้าของเป้าหมาย / Objective Progress (%)
          </div>
          <div style="font-size:9.5px; color:#64748b; margin-bottom:4px;">
            พนักงานระบุความคืบหน้าปัจจุบัน 0–100% / Employee-reported current progress 0–100%
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            ${isMidEditable ? `
              <input type="number" min="0" max="100" class="mbo-cell-input mbo-field mbo-prog-num" data-code="Progress_Percent_${i}" value="${prog}" style="width:60px; height:28px; font-size:12px; font-weight:700; text-align:center;" />
              <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width:80px;" />
            ` : `
              <strong style="font-size:13px; color:#0369a1;">${prog}%</strong>
            `}
          </div>
          <div class="mbo-progress-bar-container" style="height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
            <div class="mbo-progress-bar-fill" style="width: ${prog}%; height:100%; background:#0284c7;"></div>
          </div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:75px;" placeholder="บันทึกทบทวน...">${escapeHtml(revVal)}</textarea>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:75px;" placeholder="ผลสำเร็จปัจจุบัน...">${escapeHtml(resVal)}</textarea>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:38px; margin-bottom:4px;" placeholder="ปัญหา/อุปสรรค...">${escapeHtml(riskVal)}</textarea>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Next_Action_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:38px;" placeholder="แนวทางแก้ไข...">${escapeHtml(nextActVal)}</textarea>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
      tbody.appendChild(tr);
    }

    container.appendChild(table);
    return container;
  }

  _renderScreenSelfEval() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const isSelfEditable = this.isEditable && this.stage === BUSINESS_STAGES.SELF_EVALUATION;

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: ประเมินตนเองปลายปี / Stage 3 — Self Evaluation (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Table Layout]</span>
    `;
    container.appendChild(bar);

    // Status 10 Boundary check
    const currentStatus = this._getVal('Status') || '11 Employee Self Evaluation';
    if (currentStatus === '10 Mid-Year Completed') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const boundaryBanner = document.createElement('div');
      boundaryBanner.style.padding = '24px 20px';
      boundaryBanner.style.textAlign = 'center';
      boundaryBanner.style.background = '#f0fdf4';
      boundaryBanner.style.border = '1px dashed #86efac';
      boundaryBanner.style.borderRadius = '6px';
      boundaryBanner.style.margin = '12px';
      boundaryBanner.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#166534; margin-bottom:6px;">🔒 10 Mid-Year Completed — Stage 2 Complete</div>
        <div style="font-size:13px; color:#334155;">การทบทวนกลางปีเสร็จสมบูรณ์เรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาประเมินตนเองปลายปี (Self Eval Start Date: <strong>${escapeHtml(calendar.selfEvaluation.start)}</strong>)</div>
      `;
      container.appendChild(boundaryBanner);
      return container;
    }

    const table = document.createElement('table');
    table.className = 'mbo-grid-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">#</th>
          <th style="width:23%;">เป้าหมาย / Objective (Read-Only)</th>
          <th style="width:33%;">ผลการดำเนินงานจริง / Actual Result & Achievement *</th>
          <th style="width:14%;">ประเมินตนเอง / Self Achievement [1-5] *</th>
          <th style="width:18%;">ความคิดเห็นตนเอง / Self Reflection</th>
          <th style="width:12%; text-align:center;">แนบไฟล์ / Attach File <span class="th-sub">(Optional)</span></th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const prog = this._getVal(`Progress_Percent_${i}`) || '0';
      const actResult = this._getVal(`Actual_Result_${i}`);
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '3';
      const selfComment = this._getVal(`Self_Comment_${i}`);
      const attachHtml = this._renderAttachmentControl(`Self_Attachment_${i}`, 'Self Evaluation', isSelfEditable) || this._renderAttachmentControl(`Final_Attachment_${i}`, 'Self Evaluation', isSelfEditable);

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#1e3a8a; font-size:13px;">#${i} ${escapeHtml(objVal) || '(No title)'}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin-top:2px;">Weight: ${escapeHtml(wVal)}% | Mid Progress: ${escapeHtml(prog)}%</div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} style="min-height:80px;" placeholder="สรุปผลงานจริงที่บรรลุเมื่อสิ้นปี...">${escapeHtml(actResult)}</textarea>
        </td>
        <td>
          ${isSelfEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Self_Achievement_${i}" style="height:36px;">
              <option value="1" ${selfAch === '1' ? 'selected' : ''}>1 : Rarely meet</option>
              <option value="2" ${selfAch === '2' ? 'selected' : ''}>2 : Partially meet</option>
              <option value="3" ${selfAch === '3' ? 'selected' : ''}>3 : Fully meet</option>
              <option value="4" ${selfAch === '4' ? 'selected' : ''}>4 : Exceeded</option>
              <option value="5" ${selfAch === '5' ? 'selected' : ''}>5 : Remarkable</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${escapeHtml(selfAch)}" readonly style="height:36px;" />
          `}
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? 'readonly' : ''} style="min-height:80px;" placeholder="ข้อคิดเห็นประกอบการประเมินตนเอง...">${escapeHtml(selfComment)}</textarea>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
      tbody.appendChild(tr);
    }

    container.appendChild(table);
    return container;
  }

  _renderScreenAppraiserEval() {
    const wrap = document.createElement('div');

    const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);
    const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);

    const currentStatus = this._getVal('Status') || '13 Manager Final Evaluation';
    const rawTopology = this._getVal('Routing_Topology') || 'M1_G1';
    const topInfo = classifyTopologyForUI(rawTopology);

    let activeSlot = 1;
    if (this.previewOptions.activeSlotIndex !== undefined && this.previewOptions.activeSlotIndex !== null) {
      activeSlot = parseInt(this.previewOptions.activeSlotIndex, 10);
    } else if (currentStatus === '12 First Manager Final Evaluation') {
      activeSlot = 1;
    } else if (currentStatus === '13 Manager Final Evaluation') {
      activeSlot = topInfo.isM1M2G1 ? 2 : 1;
    } else if (currentStatus === '14 GM Final Evaluation') {
      activeSlot = topInfo.isM1M2G1 ? 3 : 2;
    }

    // Top Appraiser Completion Card
    const compCard = document.createElement('div');
    compCard.className = 'mbo-appraiser-completion-card';
    compCard.innerHTML = `
      <div class="mbo-appraiser-completion-info">
        👥 สถานะการประเมินของผู้ประเมิน / Appraiser Evaluation Completion:
        <strong>${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Complete (${appraiserInfo.completionPercent}%)</strong>
        <div style="font-size:11.5px; font-weight:normal; color:#475569; margin-top:2px;">
          Part A Ratings: <strong>${appraiserInfo.partA.completed}/${appraiserInfo.partA.total}</strong> | Part B Ratings: <strong>${appraiserInfo.partB.completed}/${appraiserInfo.partB.total}</strong>
          | Active Slot: <strong style="color:#0284c7;">Slot ${activeSlot} (${appraiserInfo.slots.find(s => s.slotIndex === activeSlot)?.label || ''})</strong>
        </div>
      </div>
      <div class="mbo-appraiser-slots-pills">
        ${appraiserInfo.slots.map(s => `
          <span class="mbo-appraiser-slot-pill ${s.isCompleted ? 'done' : 'pending'} ${s.slotIndex === activeSlot ? 'active' : ''}">
            ${s.isCompleted ? '✓' : '⏳'} ${escapeHtml(s.label)} ${s.slotIndex === activeSlot ? '(Active)' : ''}
          </span>
        `).join('')}
      </div>
    `;
    wrap.appendChild(compCard);

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      wrap.appendChild(errCard);
      return wrap;
    }

    // PART A Horizontal Matrix Table Container
    const partAContainer = document.createElement('div');
    partAContainer.className = 'mbo-table-container';

    const barA = document.createElement('div');
    barA.className = 'mbo-table-header-bar';
    barA.innerHTML = `
      <span>PART A: การประเมินเป้าหมายผลงาน / Part A Objectives Evaluation (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Appraiser Matrix]</span>
    `;
    partAContainer.appendChild(barA);

    const tableA = document.createElement('table');
    tableA.className = 'mbo-grid-table';

    let slotHeadersHtml = '';
    appraiserInfo.slots.forEach(s => {
      const slotTitle = (s.slotIndex >= 3) ? `${escapeHtml(s.label)} (Preview Logical Slot)` : escapeHtml(s.label);
      const isActiveCol = (s.slotIndex === activeSlot);
      slotHeadersHtml += `<th style="width: 16%; ${isActiveCol ? 'background:#0284c7; color:#ffffff;' : ''}">${slotTitle} ${isActiveCol ? '★ Active' : ''}</th>`;
    });

    tableA.innerHTML = `
      <thead>
        <tr>
          <th class="sticky-col" style="width: 40px; text-align: center;">#</th>
          <th class="sticky-col" style="width: 22%; left: 40px;">เป้าหมาย & แผนงาน / Objective</th>
          <th style="width: 18%;">ผลงานจริง & หลักฐาน / Evidence Context</th>
          ${slotHeadersHtml}
          <th class="sticky-right" style="width: 10%; text-align: center;">คะแนนสรุป / Result</th>
        </tr>
      </thead>
    `;

    const tbodyA = document.createElement('tbody');
    tableA.appendChild(tbodyA);

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const diffVal = this._getVal(`Difficulty_${i}`);
      const actResult = this._getVal(`Actual_Result_${i}`);
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '-';

      const avgScore = this._getVal(`Average_Objective_Score_${i}`);
      const mboPoint = this._getVal(`MBO_Point_${i}`);

      const objAttachHtml = this._renderAttachmentControl(`Objective_Attachment_${i}`, 'Objectives', false);
      const midAttachHtml = this._renderAttachmentControl(`MidYear_Attachment_${i}`, 'Mid-Year', false);
      const selfAttachHtml = this._renderAttachmentControl(`Self_Attachment_${i}`, 'Self Evaluation', false);

      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partARatings[i] || '';
        const itemComment = s.partAComments[i] || '';
        const isSlotEditable = this.isEditable && (s.slotIndex === activeSlot);

        const ratingDataCode = s.slotIndex === 1 ? `Manager_Achievement_${i}` : (s.slotIndex === 2 ? `GM_Achievement_${i}` : '');
        const commentDataCode = s.slotIndex === 1 ? `Manager_Comment_${i}` : (s.slotIndex === 2 ? `GM_Comment_${i}` : '');

        if (isSlotEditable) {
          slotCellsHtml += `
            <td style="background:#f0f9ff; border:2px solid #0284c7;">
              <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:2px;">[EDITABLE / ACTIVE APPRAISER]</div>
              <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:2px;">Rating [1-5]:</div>
              <select class="mbo-cell-select ${ratingDataCode ? 'mbo-field' : ''}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="height:32px; font-size:12px;">
                <option value="" ${!ratingVal ? 'selected' : ''}>-- Select --</option>
                <option value="1" ${ratingVal === '1' ? 'selected' : ''}>1 : Rarely meet</option>
                <option value="2" ${ratingVal === '2' ? 'selected' : ''}>2 : Partially meet</option>
                <option value="3" ${ratingVal === '3' ? 'selected' : ''}>3 : Fully meet</option>
                <option value="4" ${ratingVal === '4' ? 'selected' : ''}>4 : Exceeded</option>
                <option value="5" ${ratingVal === '5' ? 'selected' : ''}>5 : Remarkable</option>
              </select>
              <div style="font-size:11px; font-weight:700; color:#475569; margin:4px 0 2px 0;">Feedback:</div>
              <textarea class="mbo-wide-textarea ${commentDataCode ? 'mbo-field' : ''}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="min-height:45px; font-size:12px;" placeholder="Comment...">${escapeHtml(itemComment)}</textarea>
            </td>
          `;
        } else {
          slotCellsHtml += `
            <td style="background:#f8fafc; color:#334155; font-size:12px;">
              <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:2px;">[READ-ONLY / VISIBLE]</div>
              <strong>Score:</strong> ${ratingVal ? `L${escapeHtml(ratingVal)}` : '<span style="color:#94a3b8;">-</span>'}<br/>
              <div style="margin-top:2px; font-style:italic; color:#475569;">"${escapeHtml(itemComment || 'No comment recorded')}"</div>
            </td>
          `;
        }
      });

      let resultContextHtml = '';
      if (appraiserInfo.isFullyComplete) {
        resultContextHtml = `
          <div style="font-size:11px; color:#166534; background:#f0fdf4; padding:6px; border-radius:4px; border:1px solid #bbf7d0;">
            Avg: <strong>${escapeHtml(avgScore || '-')}</strong><br/>
            Point: <strong>${escapeHtml(mboPoint || '-')}</strong>
          </div>
        `;
      } else {
        resultContextHtml = `
          <div style="font-size:11px; color:#991b1b; background:#fef2f2; padding:6px; border-radius:4px; border:1px solid #fecaca;">
            <span class="mbo-pending-badge">⚠️ Pending</span>
          </div>
        `;
      }

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell sticky-col">${i}</td>
        <td class="sticky-col" style="left:40px;">
          <strong style="color:#0f172a; font-size:13px;">#${i} ${escapeHtml(objVal) || '(No title)'}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin-top:2px;">
            Weight: ${escapeHtml(wVal)}% | Diff: ${diffVal ? `L${escapeHtml(diffVal)}` : 'N/A'} | Self: L${escapeHtml(selfAch)}
          </div>
        </td>
        <td>
          <div style="font-size:12px; color:#334155; background:#f8fafc; padding:6px; border-radius:4px; min-height:50px;">${escapeHtml(actResult) || '-'}</div>
          <div style="margin-top:4px; font-size:9.5px; color:#64748b; display:flex; flex-direction:column; gap:2px;">
            <div>📌 Obj File: ${objAttachHtml}</div>
            <div>📌 Mid File: ${midAttachHtml}</div>
            <div>📌 Self File: ${selfAttachHtml}</div>
          </div>
        </td>
        ${slotCellsHtml}
        <td class="sticky-right" style="vertical-align:middle; text-align:center;">${resultContextHtml}</td>
      `;
      tbodyA.appendChild(tr);
    }

    partAContainer.appendChild(tableA);
    wrap.appendChild(partAContainer);

    // PART B Horizontal Matrix Table Container
    const partBContainer = document.createElement('div');
    partBContainer.className = 'mbo-table-container';

    const barB = document.createElement('div');
    barB.className = 'mbo-table-header-bar';
    barB.innerHTML = `
      <span>PART B: การประเมินสมรรถนะ / Part B Competency Evaluation (${applicableCompList.length} Items)</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[${escapeHtml(compSetCode)}]</span>
    `;
    partBContainer.appendChild(barB);

    const tableB = document.createElement('table');
    tableB.className = 'mbo-grid-table';

    tableB.innerHTML = `
      <thead>
        <tr>
          <th class="sticky-col" style="width: 25%;">สมรรถนะ / Competency Item</th>
          ${slotHeadersHtml}
          <th class="sticky-right" style="width: 12%; text-align: center;">ผลการประเมิน / Result</th>
        </tr>
      </thead>
    `;

    const tbodyB = document.createElement('tbody');
    tableB.appendChild(tbodyB);

    applicableCompList.forEach(comp => {
      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partBRatings[comp.id] || '';
        const itemComment = s.partBComments[comp.id] || '';
        const isSlotEditable = this.isEditable && (s.slotIndex === activeSlot);

        const ratingDataCode = s.slotIndex === 1 ? `Manager_Competency_Rating_${comp.id}` : (s.slotIndex === 2 ? `GM_Competency_Rating_${comp.id}` : '');
        const commentDataCode = s.slotIndex === 1 ? `Manager_Competency_Comment_${comp.id}` : (s.slotIndex === 2 ? `GM_Competency_Comment_${comp.id}` : '');

        if (isSlotEditable) {
          slotCellsHtml += `
            <td style="background:#f0f9ff; border:2px solid #0284c7;">
              <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:2px;">[EDITABLE / ACTIVE APPRAISER]</div>
              <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:2px;">Score [1-5]:</div>
              <select class="mbo-cell-select ${ratingDataCode ? 'mbo-field' : ''}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="height:32px; font-size:12px;">
                <option value="" ${!ratingVal ? 'selected' : ''}>-- Select --</option>
                <option value="1" ${ratingVal === '1' ? 'selected' : ''}>1 : Unsatisfactory</option>
                <option value="2" ${ratingVal === '2' ? 'selected' : ''}>2 : Needs Improvement</option>
                <option value="3" ${ratingVal === '3' ? 'selected' : ''}>3 : Meets Standard</option>
                <option value="4" ${ratingVal === '4' ? 'selected' : ''}>4 : Exceeds Standard</option>
                <option value="5" ${ratingVal === '5' ? 'selected' : ''}>5 : Outstanding</option>
              </select>
              <div style="font-size:11px; font-weight:700; color:#475569; margin:4px 0 2px 0;">Feedback:</div>
              <textarea class="mbo-wide-textarea ${commentDataCode ? 'mbo-field' : ''}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="min-height:40px; font-size:12px;" placeholder="Comment...">${escapeHtml(itemComment)}</textarea>
            </td>
          `;
        } else {
          slotCellsHtml += `
            <td style="background:#f8fafc; color:#334155; font-size:12px;">
              <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:2px;">[READ-ONLY / VISIBLE]</div>
              <strong>Score:</strong> ${ratingVal ? `L${escapeHtml(ratingVal)}` : '<span style="color:#94a3b8;">-</span>'}<br/>
              <div style="margin-top:2px; font-style:italic; color:#475569;">"${escapeHtml(itemComment || 'No comment recorded')}"</div>
            </td>
          `;
        }
      });

      const compResult = this._getVal(`Competency_Result_${comp.id}`);

      let partBResultLabel = '';
      if (comp.isCOCE) {
        partBResultLabel = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
      } else if (appraiserInfo.isFullyComplete) {
        partBResultLabel = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml(compResult || '-')}</span>`;
      } else {
        partBResultLabel = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Pending</span>';
      }

      const tr = document.createElement('tr');
      tr.dataset.compId = String(comp.id);
      tr.innerHTML = `
        <td class="sticky-col">
          <strong style="color:#0f172a; font-size:13px;">${escapeHtml(comp.nameTH)}</strong>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${escapeHtml(comp.desc)}</div>
        </td>
        ${slotCellsHtml}
        <td class="sticky-right" style="vertical-align:middle; text-align:center;">${partBResultLabel}</td>
      `;
      tbodyB.appendChild(tr);
    });

    partBContainer.appendChild(tableB);
    wrap.appendChild(partBContainer);

    // Score Completeness Summary Banner (Fail closed if incomplete R2-03)
    const scoreSummaryCard = document.createElement('div');
    scoreSummaryCard.className = 'mbo-wide-card';
    if (appraiserInfo.isFullyComplete) {
      scoreSummaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; color:#166534; font-size:15px;">✅ สรุปการประเมินสมบูรณ์ / Evaluation Complete</h3>
            <p style="margin:4px 0 0 0; font-size:12.5px; color:#475569;">ผู้ประเมินทุกท่านลงคะแนนครบถ้วนแล้ว (Part A & Part B Required Data Complete)</p>
          </div>
          <div style="font-weight:700; font-size:14px; color:#166534; background:#dcfce7; padding:8px 16px; border-radius:6px;">
            Part A + Part B Verified Complete
          </div>
        </div>
      `;
    } else {
      scoreSummaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; color:#991b1b; font-size:15px;">⏳ อยู่ระหว่างการลงคะแนน / Rating Incomplete</h3>
            <p style="margin:4px 0 0 0; font-size:12.5px; color:#475569;">อยู่ระหว่างการรวบรวมผลประเมินจากผู้ประเมิน (${appraiserInfo.completedCount}/${appraiserInfo.totalCount} Complete Slots)</p>
          </div>
          <div>
            <span class="mbo-pending-badge">⚠️ Combined Result Pending / Incomplete</span>
          </div>
        </div>
      `;
    }
    wrap.appendChild(scoreSummaryCard);

    return wrap;
  }

  _renderScreenHrFinal() {
    const wrap = document.createElement('div');

    const status = this._getVal('Status') || '15 HR Final Check';
    const isCompleted = status === '16 Completed';
    const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);

    const partAWeight = this._getVal('PartA_Weight') || this.previewOptions.partAWeight;
    const partBWeight = this._getVal('PartB_Weight') || this.previewOptions.partBWeight;

    const execSummaryCard = document.createElement('div');
    execSummaryCard.className = 'mbo-wide-card';
    execSummaryCard.style.borderTop = isCompleted ? '4px solid #166534' : '4px solid #0284c7';

    execSummaryCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
        <div>
          <h2 style="margin:0; font-size:17px; color:${isCompleted ? '#166534' : '#0284c7'};">
            ${isCompleted ? '🎉 ผลการประเมินเสร็จสมบูรณ์ / MBO Evaluation Completed' : '🔍 ตรวจสอบขั้นสุดท้ายโดย HR / HR Final Check'}
          </h2>
          <span style="font-size:12px; color:#64748b;">
            ${isCompleted ? 'กระบวนการประเมินเสร็จสิ้นสมบูรณ์และถูกล็อกถาวร' : 'อยู่ระหว่างการตรวจสอบความถูกต้องและอนุมัติปิดรอบประเมินโดย HR'}
          </span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:13px; font-weight:700; padding:4px 12px; border-radius:12px; background:${isCompleted ? '#dcfce7' : '#e0f2fe'}; color:${isCompleted ? '#166534' : '#0369a1'};">
            ${escapeHtml(status)}
          </span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:14px;">
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Appraiser Completion</div>
          <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:2px;">
            ${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Appraisers (${appraiserInfo.completionPercent}%)
          </div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Part A Weight (Objectives)</div>
          <div style="font-size:14px; font-weight:700; color:#0369a1; margin-top:2px;">${escapeHtml(partAWeight)}%</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Part B Weight (Competencies)</div>
          <div style="font-size:14px; font-weight:700; color:#0369a1; margin-top:2px;">${escapeHtml(partBWeight)}%</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Final Result Status</div>
          <div style="font-size:14px; font-weight:700; margin-top:2px;">
            ${appraiserInfo.isFullyComplete ? '<span style="color:#166534;">Verified & Complete</span>' : '<span style="color:#991b1b;">Pending / Incomplete</span>'}
          </div>
        </div>
      </div>
    `;

    wrap.appendChild(execSummaryCard);

    // Read-only Part A & Part B Breakdown (R3-03 Read-Only Result Context)
    const readOnlyBreakdown = this._renderReadOnlyAppraiserBreakdown(appraiserInfo);
    wrap.appendChild(readOnlyBreakdown);

    return wrap;
  }

  _renderReadOnlyAppraiserBreakdown(appraiserInfo) {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';
    const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>📋 รายละเอียดผลประเมินย้อนหลัง / Evaluation Detail Breakdown (Read-Only)</span>
    `;
    container.appendChild(bar);

    const tableA = document.createElement('table');
    tableA.className = 'mbo-grid-table';

    let slotHeadersHtml = '';
    appraiserInfo.slots.forEach(s => {
      slotHeadersHtml += `<th style="width: 16%;">${escapeHtml(s.label)}</th>`;
    });

    tableA.innerHTML = `
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="width: 25%;">Part A Objectives</th>
          <th style="width: 20%;">Actual Result</th>
          ${slotHeadersHtml}
        </tr>
      </thead>
    `;

    const tbodyA = document.createElement('tbody');
    tableA.appendChild(tbodyA);

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const actResult = this._getVal(`Actual_Result_${i}`);

      const mgrScore = this._getVal(`Manager_Objective_Score_${i}`);
      const gmScore = this._getVal(`GM_Objective_Score_${i}`);
      const avgScore = this._getVal(`Average_Objective_Score_${i}`);
      const mboPoint = this._getVal(`MBO_Point_${i}`);

      const midAttachHtml = this._getAttachmentHtml(`MidYear_Attachment_${i}`, this.previewOptions.midyearAttachments?.[i]);
      const selfAttachHtml = this._getAttachmentHtml(`Final_Attachment_${i}`, this.previewOptions.finalAttachments?.[i]);

      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partARatings[i] || '-';
        const commentVal = s.partAComments[i] || '-';
        slotCellsHtml += `
          <td style="font-size:12px;">
            <strong>Rating:</strong> L${escapeHtml(ratingVal)}<br/>
            <span style="color:#475569;">"${escapeHtml(commentVal)}"</span>
          </td>
        `;
      });

      let partAResultContext = '';
      if (appraiserInfo.isFullyComplete) {
        partAResultContext = `
          <div style="font-size:11px; color:#166534; background:#f0fdf4; padding:4px; border-radius:4px; border:1px solid #bbf7d0;">
            Avg: <strong>${escapeHtml(avgScore || '-')}</strong><br/>
            Point: <strong>${escapeHtml(mboPoint || '-')}</strong>
          </div>
        `;
      } else {
        partAResultContext = `
          <div style="font-size:11px; color:#991b1b; background:#fef2f2; padding:4px; border-radius:4px; border:1px solid #fecaca;">
            <span class="mbo-pending-badge">⚠️ Combined Result Pending / Incomplete</span>
          </div>
        `;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#0f172a; font-size:13px;">#${i} ${escapeHtml(objVal)}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700;">Weight: ${escapeHtml(wVal)}%</div>
        </td>
        <td>
          <div style="font-size:12px; color:#334155; background:#f8fafc; padding:4px; border-radius:4px;">${escapeHtml(actResult || '-')}</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Mid: ${midAttachHtml} | Self: ${selfAttachHtml}</div>
        </td>
        ${slotCellsHtml}
        <td style="vertical-align:middle; text-align:center;">${partAResultContext}</td>
      `;
      tbodyA.appendChild(tr);
    }

    container.appendChild(tableA);

    // Part B Competency Summary Table
    const tableB = document.createElement('table');
    tableB.className = 'mbo-grid-table';
    tableB.style.marginTop = '14px';

    tableB.innerHTML = `
      <thead>
        <tr>
          <th style="width: 30%;">Part B Competency Item</th>
          ${slotHeadersHtml}
        </tr>
      </thead>
    `;

    const tbodyB = document.createElement('tbody');
    tableB.appendChild(tbodyB);

    applicableCompList.forEach(comp => {
      const compResult = this._getVal(`Competency_Result_${comp.id}`);

      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partBRatings[comp.id] || '-';
        const commentVal = s.partBComments[comp.id] || '-';
        slotCellsHtml += `
          <td style="font-size:12px;">
            <strong>Score:</strong> L${escapeHtml(ratingVal)}<br/>
            <span style="color:#475569;">"${escapeHtml(commentVal)}"</span>
          </td>
        `;
      });

      let compResultBadge = '';
      if (comp.isCOCE) {
        compResultBadge = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
      } else if (appraiserInfo.isFullyComplete) {
        compResultBadge = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml(compResult || '-')}</span>`;
      } else {
        compResultBadge = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Pending</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong style="color:#0f172a; font-size:13px;">${escapeHtml(comp.nameTH)}</strong>
        </td>
        ${slotCellsHtml}
        <td style="vertical-align:middle; text-align:center;">${compResultBadge}</td>
      `;
      tbodyB.appendChild(tr);
    });

    container.appendChild(tableB);
    return container;
  }

  _getAttachmentHtml(fieldCode, fixtureArr) {
    const fileVal = this.record[fieldCode];
    let realFileList = [];
    if (fileVal && typeof fileVal === 'object' && Array.isArray(fileVal.value)) {
      realFileList = fileVal.value.map(f => f.name || f.fileKey || 'Attachment');
    }

    if (realFileList.length > 0) {
      return realFileList.map(fn => `<span class="mbo-attachment-chip">📄 ${escapeHtml(fn)}</span>`).join(' ');
    }
    if (this.isPreviewMode) {
      const fixtureFiles = fixtureArr || [`Evidence_${fieldCode}.pdf`];
      return fixtureFiles.map(fn => `<span class="mbo-attachment-chip" style="border-style:dashed;">📄 ${escapeHtml(fn)} (Preview)</span>`).join(' ');
    }
    return '<span style="color:#94a3b8; font-size:11px;">No attachment / ไม่มีไฟล์แนบ</span>';
  }

  syncFromDom() {
    if (!this.root) return;
    this.root.querySelectorAll('.mbo-field').forEach(input => {
      const code = input.dataset.code;
      if (code) {
        const val = input.value !== undefined ? input.value : '';
        this._setVal(code, val);
      }
    });
  }

  showValidationErrors(fieldErrors = []) {
    this.currentErrors = fieldErrors;
    this._renderInlineErrors(fieldErrors);
    this.focusFirstInvalidField(fieldErrors);
  }

  clearValidationErrors() {
    this.currentErrors = [];
    if (!this.root) return;
    const summaryAnchor = this.root.querySelector('#mbo-error-summary-anchor');
    if (summaryAnchor) summaryAnchor.innerHTML = '';
    this.root.querySelectorAll('.mbo-field').forEach(input => {
      this._refreshSingleFieldHighlight(input, this.root);
    });
  }

  focusFirstInvalidField(fieldErrors = []) {
    if (!this.root || !fieldErrors || fieldErrors.length === 0) return;
    const firstField = fieldErrors[0].field;
    if (!firstField) return;

    if (firstField === 'Employee_Code' && this.isCreate) {
      const empInput = this.root.querySelector('#mbo-lookup-emp-input');
      if (empInput) {
        empInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => empInput.focus());
      }
      return;
    }

    if (firstField === 'Total_Weight') {
      const weightBox = this.root.querySelector('#mbo-weight-summary-box');
      if (weightBox) {
        weightBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const input = this.root.querySelector(`.mbo-field[data-code="${firstField}"]`);
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => {
        try {
          input.focus();
          if (typeof input.select === 'function') input.select();
        } catch (e) {}
      });
    }
  }

  _renderStatusGuidanceCard() {
    const card = document.createElement('div');

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const rawTopology = this._getVal('Routing_Topology');
    const guidance = getStatusGuidance(status, rawTopology);

    const cardClass = guidance.isWarning ? 'mbo-guidance-warning' : 'mbo-guidance-info';

    card.className = `mbo-workflow-guidance-card ${cardClass}`;
    card.style.marginBottom = '14px';
    card.innerHTML = `
      <div class="mbo-guidance-header">
        <div class="mbo-guidance-status-pill">
          📌 สถานะปัจจุบัน / Current Status: <strong>${escapeHtml(status)}</strong>
        </div>
        <div class="mbo-guidance-notice">
          💡 การส่งเรื่อง / อนุมัติ / ดำเนินการขั้นตอนถัดไป กรุณากดปุ่มสั่งการด้านบนของ Kintone (Process action buttons)
        </div>
      </div>
      <div class="mbo-guidance-body">
        <div class="mbo-guidance-text-th">${escapeHtml(guidance.th)}</div>
        <div class="mbo-guidance-text-en">${escapeHtml(guidance.en)}</div>
      </div>
    `;
    return card;
  }

  _renderRouteContext() {
    const card = document.createElement('div');
    card.className = 'mbo-route-context-card';

    const rawTopology = this._getVal('Routing_Topology');
    const topInfo = classifyTopologyForUI(rawTopology);
    const appCount = Math.min(Math.max(parseInt(this.appraiserCount || 2, 10), 1), 4);

    const requesterUser = this._getValObj('Requester_User');
    const managerUser = this._getValObj('Manager_User');
    const gmUser = this._getValObj('GM_User');
    const firstManagerUser = this._getValObj('First_Manager_User');

    const pos = this._getVal('Employee_Position') || '-';
    const sec = this._getVal('Employee_Section') || '-';
    const team = this._getVal('Team') || '-';
    const routingKey = this._getVal('Routing_Key') || sec;

    let topologyBadgeHtml = '';
    if (!topInfo.isCanonical) {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fef2f2; color: #dc2626;">Technical Details: ⚠️ Unrecognized Topology (${escapeHtml(topInfo.raw || 'Not Specified')})</span>`;
    } else if (topInfo.isG2) {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fffbe6; color: #b45309;">Technical Details: ⚠️ Unsupported in V1 (${escapeHtml(topInfo.raw)})</span>`;
    } else {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge">Technical Details: ${escapeHtml(topInfo.raw)} (${appCount} Slots) | Pos: ${escapeHtml(pos)} | Sec: ${escapeHtml(sec)}${team !== '-' ? ` | Team: ${escapeHtml(team)}` : ''} | Rule: ${escapeHtml(routingKey)} | Source: App795</span>`;
    }

    if (!topInfo.isSupportedV1) {
      card.innerHTML = `
        <div class="mbo-route-title">
          <span>🔗 เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route</span>
          ${topologyBadgeHtml}
        </div>
        <div style="padding: 10px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 4px; font-size: 12.5px; color: #b45309;">
          ⚠️ <strong>ไม่อยู่ในเส้นทางอนุมัติมาตรฐาน V1 / Unsupported V1 Approval Route</strong><br/>
          ${topInfo.isG2
            ? `เส้นทาง ${escapeHtml(topInfo.raw)} ยังไม่เปิดใช้งานในระบบ MBO V1 ปัจจุบัน (รองรับ M1_G1 และ M1_M2_G1 เท่านั้น)`
            : `ข้อมูล Routing Topology (${escapeHtml(topInfo.raw || 'ว่าง')}) ไม่ถูกต้องตามระเบียบประเมิน`}
        </div>
      `;
      return card;
    }

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const macroStage = getMacroStage(status);

    const steps = [
      {
        slotIndex: 0,
        roleTH: 'พนักงาน',
        roleEN: 'Employee',
        userName: formatUserDisplay(requesterUser) !== '-' ? formatUserDisplay(requesterUser) : (this._getVal('Employee_Name') || 'Requester Employee'),
        statusBadge: macroStage === 1 ? 'กำลังดำเนินการ / Current' : 'ตรวจสอบแล้ว / Reviewed'
      },
      {
        slotIndex: 1,
        roleTH: 'ผู้ประเมินลำดับที่ 1',
        roleEN: '1st Appraiser',
        userName: formatUserDisplay(managerUser) !== '-' ? formatUserDisplay(managerUser) : '1st Appraiser',
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      }
    ];

    if (appCount >= 2) {
      steps.push({
        slotIndex: 2,
        roleTH: 'ผู้ประเมินลำดับที่ 2',
        roleEN: '2nd Appraiser',
        userName: formatUserDisplay(gmUser) !== '-' ? formatUserDisplay(gmUser) : '2nd Appraiser',
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      });
    }

    if (appCount >= 3) {
      steps.push({
        slotIndex: 3,
        roleTH: 'ผู้ประเมินลำดับที่ 3',
        roleEN: '3rd Appraiser',
        userName: formatUserDisplay(firstManagerUser) !== '-' ? formatUserDisplay(firstManagerUser) : (this.previewOptions.slot3Name || '3rd Appraiser (Preview)'),
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      });
    }

    if (appCount >= 4) {
      steps.push({
        slotIndex: 4,
        roleTH: 'ผู้ประเมินลำดับที่ 4',
        roleEN: '4th Appraiser',
        userName: this.previewOptions.slot4Name || '4th Appraiser (Preview)',
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      });
    }

    steps.push({
      slotIndex: 5,
      roleTH: 'HR Final Check',
      roleEN: 'HR Final / HR Admin',
      userName: 'ฝ่ายทรัพยากรบุคคล / HR Control Center',
      statusBadge: status === '16 Completed' ? 'เสร็จแล้ว / Completed' : (status === '15 HR Final Check' ? 'กำลังดำเนินการ / Current' : 'รอดำเนินการ / Waiting')
    });

    const routeStepsHtml = steps.map(s => `
      <div class="mbo-route-step ${s.slotIndex === this.activeSlotIndex ? 'active-slot' : ''}">
        <div style="font-size: 11px; font-weight: 700; color: #475569;">${escapeHtml(s.roleTH)} / ${escapeHtml(s.roleEN)}</div>
        <div class="mbo-route-user" style="font-size: 12.5px; font-weight: 700; color: #0f172a; margin: 2px 0;">${escapeHtml(s.userName)}</div>
        <div style="font-size: 10.5px; color: #0284c7; font-weight: 600;">[${escapeHtml(s.statusBadge)}]</div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="mbo-route-title">
        <span>🔗 เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route</span>
        ${topologyBadgeHtml}
      </div>
      <div class="mbo-route-grid">
        ${routeStepsHtml}
      </div>
    `;
    return card;
  }

  _renderCollapsibleLegendAndGuidelines() {
    const card = document.createElement('div');
    card.className = 'mbo-collapsible-card';
    card.innerHTML = `
      <details class="mbo-details" open>
        <summary class="mbo-summary">
          <span>📌 คำอธิบายสถานะช่องข้อมูลและเกณฑ์อ้างอิง / Field Legend & Rating Guidelines</span>
          <span class="mbo-summary-hint">(กดเพื่อซ่อน/แสดง / Click to toggle)</span>
        </summary>
        <div class="mbo-details-body">
          <div class="mbo-legend-row">
            <div class="mbo-legend-title">สถานะช่องข้อมูล / Field State Key:</div>
            <div class="mbo-legend-items">
              <span class="mbo-legend-chip mbo-chip-editable">🟢 กรอกได้ / Editable</span>
              <span class="mbo-legend-chip mbo-chip-required">🟡 ต้องกรอก / Required</span>
              <span class="mbo-legend-chip mbo-chip-system">🔵 ข้อมูลจากระบบ / System Data</span>
              <span class="mbo-legend-chip mbo-chip-locked">⚪ ระบบล็อก / Locked</span>
              <span class="mbo-legend-chip mbo-chip-error">🔴 ไม่ถูกต้อง / Invalid</span>
            </div>
          </div>
          <div class="mbo-guideline-row">
            <div class="mbo-guideline-col">
              <strong>ระดับความยาก / Difficulty Level [1-4]:</strong><br/>
              Level 4: Challenging (ท้าทายมาก) | Level 3: Difficult (ยาก) | Level 2: Achievable normal (ปานกลาง) | Level 1: Easily achievable (ง่าย)
            </div>
            <div class="mbo-guideline-col">
              <strong>ระดับผลงาน / Achievement Level [1-5]:</strong><br/>
              Level 5: Remarkable (สูงสุด) | Level 4: Exceeding (เกินเป้า) | Level 3: Fully meet (ตามเป้า) | Level 2: Partially meet (บางส่วน) | Level 1: Rarely meet (ต่ำกว่าเป้า)
            </div>
          </div>
        </div>
      </details>
    `;
    return card;
  }

  _renderInlineErrors(fieldErrors = []) {
    if (!this.root) return;
    const summaryAnchor = this.root.querySelector('#mbo-error-summary-anchor');
    if (!summaryAnchor) return;

    if (fieldErrors.length === 0) {
      summaryAnchor.innerHTML = '';
      return;
    }

    const errorCount = fieldErrors.length;
    const summaryCard = document.createElement('div');
    summaryCard.className = 'mbo-error-summary-card';

    summaryCard.innerHTML = `
      <div class="mbo-error-summary-header">
        <span>⚠️ พบข้อมูลที่ต้องแก้ไข ${errorCount} รายการ / ${errorCount} items require correction</span>
      </div>
      <div class="mbo-error-summary-list">
        ${fieldErrors.map((err, idx) => `
          <button type="button" class="mbo-error-item-btn" data-field="${escapeHtml(err.field)}">
            <span class="mbo-error-item-num">${idx + 1}</span>
            <div class="mbo-error-item-text">
              <div>${escapeHtml(err.messageTH)}</div>
              <div class="en-sub">${escapeHtml(err.messageEN)}</div>
            </div>
          </button>
        `).join('')}
      </div>
    `;

    summaryCard.querySelectorAll('.mbo-error-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        this.focusFirstInvalidField([{ field }]);
      });
    });

    summaryAnchor.innerHTML = '';
    summaryAnchor.appendChild(summaryCard);

    fieldErrors.forEach(err => {
      if (err.field === 'Total_Weight') {
        const box = this.root.querySelector('#mbo-weight-summary-box');
        if (box) box.className = 'mbo-weight-summary invalid';
        return;
      }

      if (err.field === 'Employee_Code' && this.isCreate) {
        const empInput = this.root.querySelector('#mbo-lookup-emp-input');
        if (empInput) {
          empInput.classList.remove('mbo-field-state-editable');
          empInput.classList.add('mbo-field-state-error');
        }
        return;
      }

      const input = this.root.querySelector(`.mbo-field[data-code="${err.field}"]`);
      if (input) {
        input.classList.remove('mbo-field-state-editable', 'mbo-field-state-required-empty');
        input.classList.add('mbo-field-state-error');

        const tagEl = this.root.querySelector(`.mbo-cell-tag[data-target="${err.field}"]`);
        if (tagEl) {
          const msgThFormatted = escapeHtml(err.messageTH || '').replace(/\n/g, '<br/>');
          const msgEnFormatted = escapeHtml(err.messageEN || '').replace(/\n/g, '<br/>');
          tagEl.innerHTML = `
            <span class="mbo-cell-error-msg">
              ❌ ${msgThFormatted}<br/>
              <span style="opacity: 0.85; font-size: 11px;">${msgEnFormatted}</span>
            </span>
          `;
        }
      }
    });
  }

  _renderErrorBanner(msg) {
    const banner = document.createElement('div');
    banner.className = 'mbo-alert-banner mbo-alert-error';
    banner.innerHTML = `⚠️ <span>${msg}</span>`;
    return banner;
  }

  _renderLookupSection() {
    const box = document.createElement('div');
    box.className = 'mbo-header-card';
    box.style.borderTopColor = this.isEmployeeVerified ? '#059669' : '#0284c7';
    box.style.background = this.isEmployeeVerified ? '#f0fdf4' : '#f0f9ff';

    const empCode = this._getVal('Employee_Code');
    const badgeText = this.isEmployeeVerified
      ? '<span style="color: #059669; font-weight: 700;">✓ ยืนยันข้อมูลพนักงานแล้ว / Employee verified</span>'
      : '<span style="color: #0284c7; font-weight: 600;">(กรุณาระบุรหัสพนักงานและกดค้นหา / Please enter Employee ID)</span>';

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
          STEP 1: ระบุพนักงาน / Identify Employee (App 53)
        </div>
        <div style="font-size: 13px;">${badgeText}</div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; max-width: 650px;">
        <input type="text" id="mbo-lookup-emp-input" class="mbo-cell-input mbo-field-state-editable" placeholder="กรอกรหัสพนักงาน เช่น 0149 / Enter Employee ID..." value="${escapeHtml(empCode)}" style="flex: 1; font-weight: 600;" />
        <button type="button" id="mbo-lookup-btn" style="background: #0284c7; color: white; border: none; padding: 0 18px; height: 36px; border-radius: 4px; font-weight: 600; cursor: pointer;">
          ค้นหาพนักงาน / Search
        </button>
      </div>
      <div id="mbo-lookup-msg" style="font-size: 12px; margin-top: 6px;"></div>
    `;
    return box;
  }

  _getActiveAppraiserSlot(status) {
    if (!status) return null;
    const top = this._getVal('Routing_Topology') || (this.previewOptions?.routeScenario?.topology) || 'M1_G1';

    if (['02 First Manager Objective Review', '07 First Manager Mid-Year Review', '12 First Manager Final Evaluation'].includes(status)) {
      return (top === 'M1_M2_G1' || top === 'M1_M2_G1_G2') ? 1 : null;
    }
    if (['03 Manager Objective Review', '08 Manager Mid-Year Review', '13 Manager Final Evaluation'].includes(status)) {
      if (top === 'M1_ONLY' || top === 'M1_G1' || top === 'M1_G1_G2') return 1;
      if (top === 'M1_M2_G1' || top === 'M1_M2_G1_G2') return 2;
      return 1;
    }
    if (['04 GM Objective Review', '09 GM Mid-Year Review', '14 GM Final Evaluation'].includes(status)) {
      if (top === 'M1_G1' || top === 'M1_G1_G2') return 2;
      if (top === 'M1_M2_G1' || top === 'M1_M2_G1_G2') return 3;
      return null;
    }
    return null;
  }

  _getStageCurrentActor(status) {
    const s = String(status || '').trim();
    if (['01 Draft Objective', '06 Employee Mid-Year', '11 Employee Self Evaluation'].includes(s)) {
      return 'EMPLOYEE';
    }
    if (['02 First Manager Objective Review', '07 First Manager Mid-Year Review', '12 First Manager Final Evaluation'].includes(s)) {
      return 'FIRST_MANAGER';
    }
    if (['03 Manager Objective Review', '08 Manager Mid-Year Review', '13 Manager Final Evaluation'].includes(s)) {
      return 'MANAGER';
    }
    if (['04 GM Objective Review', '09 GM Mid-Year Review', '14 GM Final Evaluation'].includes(s)) {
      return 'GM';
    }
    if (s === '15 HR Final Check') {
      return 'HR';
    }
    return 'NONE';
  }

  _renderSupportCenterIfAdmin(root, status) {
    const loginUser = this.previewOptions?.simulatedLoginUserCode ||
      (this.previewOptions?.viewerRole === 'admin' ? 'admin-form' : '') ||
      (typeof kintone !== 'undefined' ? kintone.getLoginUser()?.code : '');

    if (!AdminDiagnosticModel.isTechnicalAdmin(loginUser)) {
      return;
    }

    const adminCenter = new AdminSupportCenterUI();
    const adminDiv = document.createElement('div');
    adminDiv.className = 'mbo-admin-support-center-wrapper';

    const diagContext = {
      loginUserCode: loginUser,
      requesterUserCodes: extractUserCodes(this._getVal('Requester_User')),
      routingKey: (this._getVal('Section_Code') || '') + (this._getVal('Team') ? '|' + this._getVal('Team') : ''),
      routingResult: { status: 'PASS', topology: this._getVal('Routing_Topology') || 'M1_G1' },
      activeAppraiserSlot: this._getActiveAppraiserSlot(status),
      profileCode: this.evalProfileCode,
      evalProfile: this.evalProfile,
      activeObjCount: this.activeObjCount,
      isObjCountValid: true,
      currentStatus: status,
      currentActor: this._getStageCurrentActor(status),
      resolvedViewerRole: this.resolvedViewerRole,
      record: this.record,
      recordId: this._getVal('$id'),
      mboKey: this._getVal('Record_Key'),
      fiscalYear: this._getVal('Fiscal_Year') || '2026',
      employeeCode: this._getVal('Employee_Code'),
      employeeName: this._getVal('Employee_Name'),
      requesterUser: extractUserCodes(this._getVal('Requester_User')).join(', '),
      appraiser1: extractUserCodes(this._getVal('First_Manager_User')).join(', '),
      appraiser2: extractUserCodes(this._getVal('GM_User')).join(', '),
      sectionCode: this._getVal('Section_Code'),
      teamName: this._getVal('Team')
    };

    adminDiv.innerHTML = adminCenter.renderHtml(diagContext);
    root.appendChild(adminDiv);

    // Bind event handlers for tab switching & diagnostic snapshot
    const tabBtns = adminDiv.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (!tab || tab === 'repair') return;

        tabBtns.forEach(b => {
          b.style.border = '1px solid #475569';
          b.style.color = '#94a3b8';
        });
        e.currentTarget.style.border = '1px solid #3b82f6';
        e.currentTarget.style.color = '#60a5fa';

        const healthTab = adminDiv.querySelector('#admin-tab-content-health');
        const checkTab = adminDiv.querySelector('#admin-tab-content-check');
        const valTab = adminDiv.querySelector('#admin-tab-content-validation');
        const candTab = adminDiv.querySelector('#admin-tab-content-candidate');
        const repairTab = adminDiv.querySelector('#admin-tab-content-repair');

        if (healthTab) healthTab.style.display = (tab === 'health' ? 'block' : 'none');
        if (checkTab) checkTab.style.display = (tab === 'check' ? 'block' : 'none');
        if (valTab) valTab.style.display = (tab === 'validation' ? 'block' : 'none');
        if (candTab) candTab.style.display = (tab === 'candidate' ? 'block' : 'none');
        if (repairTab) repairTab.style.display = (tab === 'repair' ? 'block' : 'none');
      });
    });

    const snapBtn = adminDiv.querySelector('#admin-snapshot-btn');
    const snapOutput = adminDiv.querySelector('#admin-snapshot-output');
    if (snapBtn && snapOutput) {
      snapBtn.addEventListener('click', () => {
        snapOutput.style.display = (snapOutput.style.display === 'none' ? 'block' : 'none');
      });
    }
  }

  _renderHeader() {
    const card = document.createElement('div');
    card.className = 'mbo-header-card';

    const fy = this._getVal('Fiscal_Year') || 'FY2026';
    const status = this.isCreate ? 'NEW RECORD (กำลังสร้าง)' : (this._getVal('Status') || '01 Draft Objective');

    const empCode = this._getVal('Employee_Code');
    const empName = this._getVal('Employee_Name');
    const empSection = this._getVal('Employee_Section');
    const empPosition = this._getVal('Employee_Position');
    const empDept = this._getVal('Employee_Department');
    const empStartDate = this._getVal('Employee_Start_Date');

    card.innerHTML = `
      <div class="mbo-title-bar">
        <h1 class="mbo-main-title">
          แบบประเมินผลการปฏิบัติงาน / Management By Objectives (MBO)
          <span class="mbo-fy-badge">${escapeHtml(fy)}</span>
        </h1>
        <div class="mbo-status-badge">${escapeHtml(status)}</div>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px;">
        STEP 2: ข้อมูลพนักงาน / Employee Information [🔵 ระบบ / System Data]
      </div>
      <div class="mbo-profile-grid-horizontal">
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">รหัส / Emp. ID</span>
          <div class="mbo-profile-value" id="mbo-header-emp-code" title="${escapeHtml(empCode)}">${escapeHtml(empCode) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ชื่อ-นามสกุล / Name</span>
          <div class="mbo-profile-value" id="mbo-header-emp-name" title="${escapeHtml(empName)}">${escapeHtml(empName) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ส่วนงาน / Section</span>
          <div class="mbo-profile-value" id="mbo-header-emp-section" title="${escapeHtml(empSection)}">${escapeHtml(empSection) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ตำแหน่ง / Position</span>
          <div class="mbo-profile-value" id="mbo-header-emp-position" title="${escapeHtml(empPosition)}">${escapeHtml(empPosition) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">แผนก / Department</span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept" title="${escapeHtml(empDept)}">${escapeHtml(empDept) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">วันเริ่มงาน / Start Date</span>
          <div class="mbo-profile-value" id="mbo-header-emp-start-date" title="${escapeHtml(empStartDate)}">${escapeHtml(empStartDate) || '-'}</div>
        </div>
      </div>
    `;
    return card;
  }

  _renderHoshin() {
    const grid = document.createElement('div');
    grid.className = 'mbo-hoshin-grid';

    const deptHoshin = this._getVal('Department_Hoshin');
    const secHoshin = this._getVal('Section_Hoshin');

    grid.innerHTML = `
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>เป้าหมายแผนก / Department's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Dept. Manager) [🔵 ระบบ / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${escapeHtml(deptHoshin) || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>เป้าหมายส่วนงาน / Section's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Sect. Manager) [🔵 ระบบ / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-sec-hoshin-view">${escapeHtml(secHoshin) || '(No Section Hoshin set)'}</div>
      </div>
    `;
    return grid;
  }

  _renderWeightSummary() {
    const summary = document.createElement('div');
    summary.id = 'mbo-weight-summary-box';
    summary.className = 'mbo-weight-summary valid';
    summary.innerHTML = `
      <div class="mbo-weight-text" id="mbo-weight-calc-text">ผลรวมน้ำหนัก / Total Weight: 0%</div>
      <div class="mbo-weight-status" id="mbo-weight-calc-status">Checking...</div>
    `;
    return summary;
  }

  _bindEvents(root) {
    root.querySelectorAll('.mbo-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const code = e.target.dataset.code;
        const val = e.target.value;
        this._setVal(code, val);
        this.onFieldChange(code, val);

        if (this.currentErrors && this.currentErrors.length > 0) {
          this.currentErrors = this.currentErrors.filter(err => err.field !== code);
          this._renderInlineErrors(this.currentErrors);
        }

        this._refreshSingleFieldHighlight(e.target, root);

        if (code.startsWith('Weight_')) {
          this._updateTotalWeightDisplay();
        }
        if (code.startsWith('Progress_Percent_')) {
          const row = e.target.closest('td') || e.target.closest('div');
          const fill = row?.querySelector('.mbo-progress-bar-fill');
          if (fill) fill.style.width = `${val}%`;
          const lbl = row?.querySelector('label strong');
          if (lbl) lbl.textContent = `${val}%`;
        }
      });
    });

    if (this.isPreviewMode) {
      root.querySelectorAll('[data-preview-slot]').forEach(input => {
        input.addEventListener('change', (e) => {
          const slotIdx = e.target.dataset.previewSlot;
          const tagName = e.target.tagName.toLowerCase();
          const val = e.target.value;

          if (!this.previewOptions[`slot${slotIdx}RatingsA`]) this.previewOptions[`slot${slotIdx}RatingsA`] = {};
          if (!this.previewOptions[`slot${slotIdx}CommentsA`]) this.previewOptions[`slot${slotIdx}CommentsA`] = {};
          if (!this.previewOptions[`slot${slotIdx}RatingsB`]) this.previewOptions[`slot${slotIdx}RatingsB`] = {};
          if (!this.previewOptions[`slot${slotIdx}CommentsB`]) this.previewOptions[`slot${slotIdx}CommentsB`] = {};

          const objRow = e.target.closest('[data-obj-index]');
          const compRow = e.target.closest('[data-comp-id]');

          if (objRow) {
            const objIndex = objRow.dataset.objIndex;
            if (tagName === 'select') this.previewOptions[`slot${slotIdx}RatingsA`][objIndex] = val;
            if (tagName === 'textarea') this.previewOptions[`slot${slotIdx}CommentsA`][objIndex] = val;
          } else if (compRow) {
            const compId = compRow.dataset.compId;
            if (tagName === 'select') this.previewOptions[`slot${slotIdx}RatingsB`][compId] = val;
            if (tagName === 'textarea') this.previewOptions[`slot${slotIdx}CommentsB`][compId] = val;
          }
        });
      });
    }

    const countSelect = root.querySelector('#mbo-obj-count-select');
    if (countSelect) {
      countSelect.addEventListener('change', (e) => {
        const count = e.target.value;
        this._setVal('Objective_Count', count);
        this.onFieldChange('Objective_Count', count);
        ValidationEngine.clearInactiveRows(this.record);
        this.render();
      });
    }

    const lookupInput = root.querySelector('#mbo-lookup-emp-input');
    if (lookupInput) {
      lookupInput.addEventListener('input', (e) => {
        const newCode = e.target.value.trim();
        const oldCode = this._getVal('Employee_Code');
        if (newCode !== oldCode) {
          this.isEmployeeVerified = false;
          this.onEmployeeCodeChanged(newCode);
          const msgEl = root.querySelector('#mbo-lookup-msg');
          if (msgEl) msgEl.innerHTML = '<span style="color: #b45309;">⚠️ มีการแก้ไขรหัสพนักงาน กรุณากดค้นหาใหม่ / Employee code changed. Please re-search.</span>';
        }
      });

      lookupInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const lookupBtn = root.querySelector('#mbo-lookup-btn');
          if (lookupBtn) lookupBtn.click();
        }
      });
    }

    const lookupBtn = root.querySelector('#mbo-lookup-btn');
    if (lookupBtn && lookupInput) {
      lookupBtn.addEventListener('click', async () => {
        const code = lookupInput.value.trim();
        const msgEl = root.querySelector('#mbo-lookup-msg');
        if (!code) {
          if (msgEl) msgEl.innerHTML = '<span style="color: #dc2626;">กรุณาระบุรหัสพนักงาน / Please enter Employee ID</span>';
          return;
        }

        if (msgEl) msgEl.innerHTML = '<span style="color: #0369a1;">กำลังค้นหาข้อมูลจาก App 53 และตรวจสอบสิทธิ์... / Searching App 53 & verifying access...</span>';
        try {
          await this.executeLookup(code);
        } catch (err) {
          // Handled inside executeLookup
        }
      });
    }

    // Attachment file input change handler
    root.querySelectorAll('.mbo-attachment-file-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const fieldCode = e.target.dataset.code;
        if (!fieldCode) return;
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (!this.pendingAttachments) this.pendingAttachments = {};
        if (!this.pendingAttachments[fieldCode]) this.pendingAttachments[fieldCode] = [];

        files.forEach(file => {
          this.pendingAttachments[fieldCode].push({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending'
          });
        });

        this._refreshAttachmentControlDisplay(fieldCode, root);
      });
    });

    // Attachment remove button click handler
    root.querySelectorAll('.mbo-attachment-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.mbo-attachment-remove-btn');
        if (!targetBtn) return;
        const fieldCode = targetBtn.dataset.code;
        if (!fieldCode) return;

        const pendingIdxStr = targetBtn.dataset.pendingIdx;
        if (pendingIdxStr !== undefined && pendingIdxStr !== '') {
          const idx = parseInt(pendingIdxStr, 10);
          if (this.pendingAttachments && this.pendingAttachments[fieldCode]) {
            this.pendingAttachments[fieldCode].splice(idx, 1);
          }
        } else {
          const filename = targetBtn.dataset.filename;
          const fileKey = targetBtn.dataset.filekey;
          this._removeSavedAttachmentFile(fieldCode, filename, fileKey);
        }

        this._refreshAttachmentControlDisplay(fieldCode, root);
      });
    });
  }

  _refreshAttachmentControlDisplay(fieldCode, root) {
    const activeRoot = this.root || root || document;
    const stageLabel = fieldCode.startsWith('Objective_') ? 'Objectives' :
                       (fieldCode.startsWith('MidYear_') ? 'Mid-Year' : 'Self Evaluation');
    const container = activeRoot.querySelector(`[data-attachment-container="${fieldCode}"]`) ||
                      activeRoot.querySelector(`[data-attachment-box="${fieldCode}"]`) ||
                      activeRoot.querySelector(`input[data-code="${fieldCode}"]`)?.closest('td, div');

    const isEditable = Boolean(!container || container.querySelector('.mbo-attachment-file-input') || container.querySelector('.mbo-attachment-remove-btn') || activeRoot.querySelector(`input[data-code="${fieldCode}"]`));

    const parentCell = container ? (container.closest('td') || container.parentElement) : null;
    if (parentCell) {
      parentCell.innerHTML = this._renderAttachmentControl(fieldCode, stageLabel, true);
      this._bindEvents(activeRoot);
    } else {
      this.render();
    }
  }

  async preparePendingAttachments(options = {}) {
    const { prepareAttachmentPlan } = await import('../services/mbo-attachment-service.js');
    const targetRecord = options.record || this.record;
    const plan = await prepareAttachmentPlan(targetRecord, this.pendingAttachments || {}, options);
    this.preparedAttachmentPlan = (plan && Object.keys(plan).length > 0) ? plan : null;
    return this.preparedAttachmentPlan;
  }

  async finalizeAttachmentPlan(options = {}) {
    const { finalizeAttachmentPlan } = await import('../services/mbo-attachment-service.js');
    const appId = options.appId || 794;
    const recordId = options.recordId;
    if (!this.preparedAttachmentPlan || Object.keys(this.preparedAttachmentPlan).length === 0) {
      return { updated: false };
    }
    const plan = this.preparedAttachmentPlan;
    const res = await finalizeAttachmentPlan(appId, recordId, plan, options);
    this.preparedAttachmentPlan = null;
    this.pendingAttachments = {};
    return res;
  }

  async uploadPendingAttachments(options = {}) {
    const plan = await this.preparePendingAttachments(options);
    if (options.recordId) {
      return await this.finalizeAttachmentPlan(options);
    }
    return plan;
  }

  async executeLookup(empCode) {
    const code = String(empCode || '').trim();
    if (!code) return;
    // D1: reject if authenticated context is bound and caller tries a different Employee_Code
    if (this.authenticatedEmployeeCode && code !== this.authenticatedEmployeeCode) {
      throw new Error('AUTHENTICATED_EMPLOYEE_CODE_MISMATCH: Employee Self context is locked to the authenticated session. Cannot look up a different employee.');
    }
    this.isEmployeeVerified = false;
    if (typeof this.onEmployeeCodeChanged === 'function') {
      this.onEmployeeCodeChanged(code);
    }
    try {
      await this.onLookupEmployee(code);
      this.isEmployeeVerified = true;
      this.clearValidationErrors();
      this.render();
    } catch (err) {
      this.isEmployeeVerified = false;
      this.render();
      const newMsgEl = this.root ? this.root.querySelector('#mbo-lookup-msg') : null;
      if (newMsgEl) {
        const formattedMsg = escapeHtml(err.message || '').replace(/\n/g, '<br/>');
        newMsgEl.innerHTML = `<div style="color: #dc2626; line-height: 1.4; padding: 6px 0;">❌ ${formattedMsg}</div>`;
      }
      throw err;
    }
  }

  _refreshAllFieldHighlights(root) {
    root.querySelectorAll('.mbo-field').forEach(input => {
      this._refreshSingleFieldHighlight(input, root);
    });
  }

  _refreshSingleFieldHighlight(input, root) {
    const code = input.dataset.code;
    const isReadonly = input.readOnly || input.disabled;
    const val = input.value?.trim() || '';
    const isRequired = input.dataset.required === 'true';

    const isErr = this.currentErrors && this.currentErrors.some(err => err.field === code);

    input.classList.remove(
      'mbo-field-state-editable',
      'mbo-field-state-required-empty',
      'mbo-field-state-locked',
      'mbo-field-state-error'
    );

    const tagEl = root.querySelector(`.mbo-cell-tag[data-target="${code}"]`);

    if (isErr) {
      input.classList.add('mbo-field-state-error');
      return;
    }

    if (isReadonly) {
      input.classList.add('mbo-field-state-locked');
      if (tagEl) tagEl.innerHTML = '<span style="color: #64748b;">⚪ [ล็อก / Locked]</span>';
    } else {
      if (isRequired && !val) {
        input.classList.add('mbo-field-state-required-empty');
        if (tagEl) tagEl.innerHTML = '<span style="color: #854d0e;">🟡 [ต้องกรอก / Required]</span>';
      } else {
        input.classList.add('mbo-field-state-editable');
        if (tagEl) tagEl.innerHTML = '<span style="color: #166534;">🟢 [กรอกได้ / Editable]</span>';
      }
    }
  }

  _updateTotalWeightDisplay() {
    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    const box = document.getElementById('mbo-weight-summary-box');
    const txt = document.getElementById('mbo-weight-calc-text');
    const st = document.getElementById('mbo-weight-calc-status');
    if (!box || !txt || !st) return;

    if (count === null) {
      box.className = 'mbo-weight-summary invalid';
      txt.textContent = 'ผลรวมน้ำหนัก / Total Weight: Invalid Objective_Count (1..10)';
      st.textContent = '❌ Invalid Count';
      return;
    }

    let total = 0;
    const parts = [];
    for (let i = 1; i <= count; i++) {
      const w = parseFloat(this._getVal(`Weight_${i}`) || '0');
      total += isNaN(w) ? 0 : w;
      parts.push(`${w || 0}%`);
    }

    txt.textContent = `ผลรวมน้ำหนัก / Total Weight: ${parts.join(' + ')} = ${total}%`;
    if (Math.round(total) === 100) {
      box.className = 'mbo-weight-summary valid';
      st.innerHTML = '✅ ครบ 100% สมบูรณ์ / Complete (100%)';
    } else {
      box.className = 'mbo-weight-summary invalid';
      st.innerHTML = `❌ ไม่ถูกต้อง: ผลรวมต้องเท่ากับ 100% (ขาด/เกิน ${Math.abs(100 - total)}%) / Must equal 100%`;
    }
  }

  _getValObj(code) {
    const field = this.record[code];
    if (field && typeof field === 'object' && Array.isArray(field.value)) {
      return field.value;
    }
    return [];
  }

  _getVal(code) {
    const field = this.record[code];
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) {
      return field.value !== null && field.value !== undefined ? String(field.value) : '';
    }
    return String(field);
  }

  _setVal(code, val) {
    if (this.record[code] && typeof this.record[code] === 'object') {
      this.record[code].value = val;
    }
  }
}
