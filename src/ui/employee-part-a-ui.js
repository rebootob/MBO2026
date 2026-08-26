/**
 * Employee Part A & Part B UI Renderer - Evaluation UI V2 (R3 Corrected)
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & Bilingual Specification
 */

import { BUSINESS_STAGES } from '../config/constants.js';
import { ValidationEngine } from '../validation/validation-engine.js';

export const CANONICAL_TOPOLOGIES = ['M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2'];

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
    return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isG2: false, raw: '' };
  }
  const raw = String(topology).trim();
  if (!raw || !CANONICAL_TOPOLOGIES.includes(raw)) {
    return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isG2: false, raw };
  }
  if (raw === 'M1_G1_G2' || raw === 'M1_M2_G1_G2') {
    return { isCanonical: true, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isG2: true, raw };
  }
  return {
    isCanonical: true,
    isSupportedV1: true,
    isM1G1: raw === 'M1_G1',
    isM1M2G1: raw === 'M1_M2_G1',
    isG2: false,
    raw
  };
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

export function getProcessProgress(status) {
  const currentStatus = String(status || '').trim();
  const progressMap = {
    '01 Draft Objective': { percent: 5, stepIndex: 1, label: '1. Objectives (01 Draft)' },
    '02 First Manager Objective Review': { percent: 10, stepIndex: 1, label: '1. Objectives (02 First Mgr Review)' },
    '03 Manager Objective Review': { percent: 15, stepIndex: 1, label: '1. Objectives (03 Mgr Review)' },
    '04 GM Objective Review': { percent: 20, stepIndex: 1, label: '1. Objectives (04 GM Review)' },
    '05 Objective Approved': { percent: 25, stepIndex: 1, label: '1. Objectives (05 Approved)' },
    '06 Employee Mid-Year': { percent: 30, stepIndex: 2, label: '2. Mid-Year (06 Employee Input)' },
    '07 First Manager Mid-Year Review': { percent: 35, stepIndex: 2, label: '2. Mid-Year (07 First Mgr Review)' },
    '08 Manager Mid-Year Review': { percent: 40, stepIndex: 2, label: '2. Mid-Year (08 Mgr Review)' },
    '09 GM Mid-Year Review': { percent: 45, stepIndex: 2, label: '2. Mid-Year (09 GM Review)' },
    '10 Mid-Year Completed': { percent: 50, stepIndex: 2, label: '2. Mid-Year (10 Completed)' },
    '11 Employee Self Evaluation': { percent: 60, stepIndex: 3, label: '3. Self Evaluation (11 Self Eval)' },
    '12 First Manager Final Evaluation': { percent: 70, stepIndex: 4, label: '4. Appraiser Evaluation (12 First Mgr)' },
    '13 Manager Final Evaluation': { percent: 80, stepIndex: 4, label: '4. Appraiser Evaluation (13 Mgr Final)' },
    '14 GM Final Evaluation': { percent: 90, stepIndex: 4, label: '4. Appraiser Evaluation (14 GM Final)' },
    '15 HR Final Check': { percent: 95, stepIndex: 5, label: '5. HR Final / Completed (15 HR Check)' },
    '16 Completed': { percent: 100, stepIndex: 5, label: '5. HR Final / Completed (16 Completed)' }
  };

  return progressMap[currentStatus] || null;
}

// Normalized Verified Business Competency Definitions (R2-05 Fail-Closed Selection)
export const COMPETENCIES_LIST = [
  { id: 1, nameTH: '1. Adaptability', nameEN: 'Adaptability', desc: 'ปรับตัวอย่างยืดหยุ่น ยอมรับการเปลี่ยนแปลงและเรียนรู้สิ่งใหม่ / Demonstrate flexibility and open-mindedness to organizational changes.' },
  { id: 2, nameTH: '2. Problem Solving', nameEN: 'Problem Solving & Decision Making', desc: 'การแก้ปัญหาและการตัดสินใจอย่างมีหลักการ / Analyze root causes and make effective decisions.' },
  { id: 3, nameTH: '3. Customer Focus', nameEN: 'Customer Focus & Service Excellence', desc: 'การมุ่งเน้นลูกค้าและผู้รับบริการ ส่งมอบบริการที่มีคุณภาพ / Prioritize internal/external customer needs and quality delivery.' },
  { id: 4, nameTH: '4. Additional Value Creation', nameEN: 'Value Creation & Innovation', desc: 'การสร้างมูลค่าเพิ่มและนวัตกรรมใหม่ในงาน / Proactively seek improvements and innovative solutions.' },
  { id: 5, nameTH: '5. Safety Awareness', nameEN: 'Safety & Environmental Awareness', desc: 'ความตระหนักด้านความปลอดภัยและสิ่งแวดล้อม / Adhere to safety standards and environmental responsibility.' },
  { id: 6, nameTH: '6. Compliance / COCE', nameEN: 'Compliance & Code of Conduct (COCE)', desc: 'การปฏิบัติตามกฎระเบียบและจริยธรรมธุรกิจ [Evaluated / Excluded from Score] / Evaluated for compliance but excluded from numerical score weight.', isCOCE: true },
  { id: 7, nameTH: '7. Leadership & People Management', nameEN: 'Leadership & People Management', desc: 'ภาวะผู้นำและการบริหารคน สร้างแรงจูงใจในการทำงาน / Lead, empower, and guide team members effectively.', isManagementOnly: true },
  { id: 8, nameTH: '8. Strategy & Coaching', nameEN: 'Strategy & Coaching / Advising', desc: 'การกำหนดกลยุทธ์และการเป็นพี่เลี้ยงในการพัฒนาทีมงาน / Align with strategic goals and mentor staff.', isManagementOnly: true }
];

export function getApplicableCompetencies(setCode) {
  const code = String(setCode || '').trim();
  if (code === 'COMP_SET_OPERATIONAL_V1') {
    return COMPETENCIES_LIST.filter(c => !c.isManagementOnly); // 6 items
  }
  if (code === 'COMP_SET_MANAGEMENT_V1') {
    return COMPETENCIES_LIST; // 8 items
  }
  return null; // Fail closed for invalid/blank competency set code
}

export function normalizeAppraiserData(record, appraiserCount = 2, previewOptions = {}) {
  const count = Math.min(Math.max(parseInt(appraiserCount || 2, 10), 1), 4);
  const slots = [];

  const getVal = (code) => {
    if (!record) return '';
    const field = record[code];
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) return field.value ?? '';
    return String(field);
  };

  const objCountVal = parseInt(getVal('Objective_Count') || '4', 10);
  const activeObjCount = isNaN(objCountVal) ? 4 : Math.min(Math.max(objCountVal, 2), 10);

  const compSetCode = getVal('Competency_Set_Code') || previewOptions.competencySetCode;
  const applicableCompList = getApplicableCompetencies(compSetCode);

  if (!applicableCompList) {
    return {
      slots: [],
      totalCount: count,
      completedCount: 0,
      completionPercent: 0,
      isFullyComplete: false,
      isInvalidConfig: true
    };
  }

  const slotLabels = ['1st Appraiser', '2nd Appraiser', '3rd Appraiser', '4th Appraiser'];

  let totalRequiredPartARatings = count * activeObjCount;
  let completedRequiredPartARatings = 0;

  let totalRequiredPartBRatings = count * applicableCompList.length;
  let completedRequiredPartBRatings = 0;

  for (let i = 1; i <= count; i++) {
    const label = slotLabels[i - 1];
    const partARatings = {};
    const partBRatings = {};
    const partAComments = {};
    const partBComments = {};

    let slotPartARatedCount = 0;
    let slotPartBRatedCount = 0;

    if (i === 1) {
      // Legacy physical storage: Slot 1 maps to Manager_*
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = getVal(`Manager_Comment_${k}`) || previewOptions.slot1CommentsA?.[k] || '';
        const val = getVal(`Manager_Achievement_${k}`) || previewOptions.slot1RatingsA?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = getVal(`Manager_Competency_Comment_${comp.id}`) || previewOptions.slot1CommentsB?.[comp.id] || '';
        const val = getVal(`Manager_Competency_Rating_${comp.id}`) || previewOptions.slot1RatingsB?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    } else if (i === 2) {
      // Legacy physical storage: Slot 2 maps to GM_*
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = getVal(`GM_Comment_${k}`) || previewOptions.slot2CommentsA?.[k] || '';
        const val = getVal(`GM_Achievement_${k}`) || previewOptions.slot2RatingsA?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = getVal(`GM_Competency_Comment_${comp.id}`) || previewOptions.slot2CommentsB?.[comp.id] || '';
        const val = getVal(`GM_Competency_Rating_${comp.id}`) || previewOptions.slot2RatingsB?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    } else {
      // Slots 3 & 4 (Preview/Logical slots only - MUST NOT ALIAS PHYSICAL FIELDS)
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = previewOptions[`slot${i}CommentsA`]?.[k] || '';
        const val = previewOptions[`slot${i}RatingsA`]?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = previewOptions[`slot${i}CommentsB`]?.[comp.id] || '';
        const val = previewOptions[`slot${i}RatingsB`]?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    }

    completedRequiredPartARatings += slotPartARatedCount;
    completedRequiredPartBRatings += slotPartBRatedCount;

    const isPartAComplete = (slotPartARatedCount === activeObjCount);
    const isPartBComplete = (slotPartBRatedCount === applicableCompList.length);
    const isSlotCompleted = isPartAComplete && isPartBComplete;

    slots.push({
      slotIndex: i,
      label,
      isCompleted: isSlotCompleted,
      isPartAComplete,
      isPartBComplete,
      partARatings,
      partBRatings,
      partAComments,
      partBComments
    });
  }

  const completedCount = slots.filter(s => s.isCompleted).length;
  const completionPercent = Math.round((completedCount / count) * 100);
  const isFullyComplete = (completedCount === count);

  return {
    slots,
    totalCount: count,
    completedCount,
    completionPercent,
    isFullyComplete,
    isInvalidConfig: false,
    partA: {
      completed: completedRequiredPartARatings,
      total: totalRequiredPartARatings,
      isComplete: completedRequiredPartARatings === totalRequiredPartARatings
    },
    partB: {
      completed: completedRequiredPartBRatings,
      total: totalRequiredPartBRatings,
      isComplete: completedRequiredPartBRatings === totalRequiredPartBRatings
    }
  };
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

    // Active slot index is constrained to 1..appraiserCount
    const rawSlot = options.activeSlotIndex || options.previewOptions?.activeSlotIndex || 1;
    this.activeSlotIndex = Math.min(Math.max(parseInt(rawSlot, 10), 1), this.appraiserCount);

    this.onFieldChange = options.onFieldChange || (() => {});
    this.onLookupEmployee = options.onLookupEmployee || (() => {});
    this.onEmployeeCodeChanged = options.onEmployeeCodeChanged || (() => {});
    this.currentErrors = [];

    // Verification state: Create mode starts unverified until lookup succeeds. Edit/Detail starts verified.
    this.isEmployeeVerified = !this.isCreate;
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
    const visualScreen = getVisualScreen(status);

    if (!visualScreen) {
      root.appendChild(this._renderErrorBanner('ไม่พบข้อมูลสถานะหรือสถานะไม่ถูกต้องตามระเบียบประเมิน (CONFIGURATION / UNKNOWN STATUS ERROR)<br/>Unrecognized status value in record. Please contact HR / Administrator.'));
      this.container.appendChild(root);
      return;
    }

    // R3-01: STEP 1 Lookup section is rendered on Create BEFORE fail-closed scoring snapshot validation!
    if (this.isCreate) {
      root.appendChild(this._renderLookupSection());
    }

    // Fail-Closed Snapshot Validation ONLY applies when lookup has succeeded OR on existing saved records (R3-01)
    const shouldValidateSnapshot = !(this.isCreate && !this.isEmployeeVerified);

    if (shouldValidateSnapshot) {
      // Validate Competency Set Code (R2-05 / R3-01 Fail-Closed)
      const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
      const applicableCompList = getApplicableCompetencies(compSetCode);
      if (!applicableCompList) {
        root.appendChild(this._renderErrorBanner(`ไม่พบข้อมูลชุดสมรรถนะ (Competency_Set_Code: "${escapeHtml(compSetCode || 'ว่าง')}") กรุณาติดต่อ HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing Competency_Set_Code in configuration.`));
        this.container.appendChild(root);
        return;
      }

      // Validate PartA / PartB Weights (R2-06 / R3-01 Fail-Closed)
      const partAWeight = parseFloat(this._getVal('PartA_Weight') || this.previewOptions.partAWeight || '');
      const partBWeight = parseFloat(this._getVal('PartB_Weight') || this.previewOptions.partBWeight || '');
      if (isNaN(partAWeight) || isNaN(partBWeight) || (partAWeight + partBWeight) !== 100) {
        root.appendChild(this._renderErrorBanner(`ไม่พบสัดส่วนคะแนนประเมินที่ถูกต้อง (PartA_Weight + PartB_Weight ต้องเท่ากับ 100%) กรุณาติดต่อ HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing PartA_Weight / PartB_Weight ratio configuration.`));
        this.container.appendChild(root);
        return;
      }
    }

    // Top Overall Process Progress Bar (5 Phases: Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final)
    root.appendChild(this._renderOverallProgressBar(status));

    // Top Status & Workflow Guidance Card
    root.appendChild(this._renderStatusGuidanceCard());

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

    // Render exact 1 of 5 Visual Screens
    if (visualScreen === 'objectives') {
      root.appendChild(this._renderScreenObjectives());
    } else if (visualScreen === 'midyear') {
      root.appendChild(this._renderScreenMidYear());
    } else if (visualScreen === 'self_eval') {
      root.appendChild(this._renderScreenSelfEval());
    } else if (visualScreen === 'appraiser_eval') {
      root.appendChild(this._renderScreenAppraiserEval());
    } else if (visualScreen === 'hr_final') {
      root.appendChild(this._renderScreenHrFinal());
    }

    this.container.appendChild(root);
    this._updateTotalWeightDisplay();
    this._refreshAllFieldHighlights(root);
    this._bindEvents(root);

    if (this.currentErrors && this.currentErrors.length > 0) {
      this._renderInlineErrors(this.currentErrors);
    }
  }

  _renderOverallProgressBar(status) {
    const card = document.createElement('div');
    card.className = 'mbo-overall-progress-card';

    const visualScreen = getVisualScreen(status);
    const prog = getProcessProgress(status);

    if (!prog) return card;

    card.innerHTML = `
      <div class="mbo-progress-phases">
        <div class="mbo-phase-step ${visualScreen === 'objectives' ? 'active' : (prog.stepIndex > 1 ? 'completed' : '')}">1. Objectives</div>
        <div class="mbo-phase-step ${visualScreen === 'midyear' ? 'active' : (prog.stepIndex > 2 ? 'completed' : '')}">2. Mid-Year</div>
        <div class="mbo-phase-step ${visualScreen === 'self_eval' ? 'active' : (prog.stepIndex > 3 ? 'completed' : '')}">3. Self Evaluation</div>
        <div class="mbo-phase-step ${visualScreen === 'appraiser_eval' ? 'active' : (prog.stepIndex > 4 ? 'completed' : '')}">4. Appraiser Evaluation</div>
        <div class="mbo-phase-step ${visualScreen === 'hr_final' ? 'active' : (prog.stepIndex > 5 ? 'completed' : '')}">5. HR Final / Completed</div>
      </div>
      <div class="mbo-progress-bar-wrap">
        <div class="mbo-progress-bar-fill" style="width: ${prog.percent}%;"></div>
      </div>
      <div class="mbo-progress-label">
        📊 ความคืบหน้ากระบวนการ / Process Progress: <strong>${prog.percent}%</strong> (${escapeHtml(prog.label)})
      </div>
    `;
    return card;
  }

  _renderScreenObjectives() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 4 : Math.min(Math.max(countVal, 2), 10);

    const isObjectiveStage = this.isCreate || this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT || this.stage === BUSINESS_STAGES.NEW_RECORD;
    const isObjEditable = this.isEditable && isObjectiveStage && this.isEmployeeVerified;

    // Header bar
    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: Part A : MBO (การตั้งเป้าหมายผลงาน / Objectives Setup)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>จำนวนเป้าหมาย / Number of Objectives:</span>
        ${isObjEditable ? `
          <select id="mbo-obj-count-select" class="mbo-cell-select" style="width: 65px; height: 28px; font-size: 13px; padding: 2px 6px; background: #ffffff;">
            ${[2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}</option>`).join('')}
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

    // Wide Card UX for Objectives
    const section = document.createElement('div');
    section.className = 'mbo-wide-card';

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const actVal = this._getVal(`Action_Plan_${i}`);
      const addVal = this._getVal(`Additional_Agreement_${i}`);
      const wVal = this._getVal(`Weight_${i}`);
      const diffVal = this._getVal(`Difficulty_${i}`);

      const objBox = document.createElement('div');
      objBox.style.marginBottom = '16px';
      objBox.style.border = '1px solid #cbd5e1';
      objBox.style.borderRadius = '6px';
      objBox.style.padding = '14px';
      objBox.style.background = '#ffffff';

      objBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">
          <strong style="color:#1e3a8a; font-size:14px;">#${i} เป้าหมายที่ ${i} / Objective #${i}</strong>
        </div>

        <div style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; color:#dc2626; display:block; margin-bottom:4px;">เป้าหมายและผลลัพธ์ที่คาดหวัง / Objectives & Target *:</label>
          <textarea class="mbo-wide-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุเป้าหมายและผลลัพธ์ที่คาดหวัง...">${escapeHtml(objVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </div>

        <div style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; color:#dc2626; display:block; margin-bottom:4px;">แผนปฏิบัติการ / Action Plan *:</label>
          <textarea class="mbo-wide-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุกิจกรรมและแผนงานเพื่อบรรลุเป้าหมาย...">${escapeHtml(actVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </div>

        <div style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; color:#334155; display:block; margin-bottom:4px;">ข้อตกลงเพิ่มเติม / Additional Agreement / Comment:</label>
          <textarea class="mbo-wide-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="ข้อตกลงเพิ่มเติม...">${escapeHtml(addVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#dc2626; display:block; margin-bottom:4px;">น้ำหนัก / Weight (%) *:</label>
            <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${escapeHtml(wVal)}" ${!isObjEditable ? 'readonly' : ''} style="height:36px; width:100%; text-align:center;" placeholder="30" />
            <span class="mbo-cell-tag" data-target="Weight_${i}"></span>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#dc2626; display:block; margin-bottom:4px;">ระดับความยาก / Difficulty Level [1-4] *:</label>
            ${isObjEditable ? `
              <select class="mbo-cell-select mbo-field" data-code="Difficulty_${i}" data-required="true" style="height:36px; width:100%;">
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
          </div>
        </div>
      `;

      section.appendChild(objBox);
    }

    container.appendChild(section);

    // Total Weight Summary
    container.appendChild(this._renderWeightSummary());

    return container;
  }

  _renderScreenMidYear() {
    const isMidEditable = this.isEditable && this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;

    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 4 : Math.min(Math.max(countVal, 2), 10);

    const section = document.createElement('div');
    section.className = 'mbo-wide-card';
    section.innerHTML = `
      <div class="mbo-wide-card-header">
        <span>STEP 3: ทบทวนกลางปี / Stage 2 — Mid-Year Progress & Review (1..${count})</span>
        <span style="font-weight: normal; font-size: 12px; color: #475569;">[ความคืบหน้า และ บันทึกการทบทวนผลงาน / Wide Text UX]</span>
      </div>
    `;

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const actVal = this._getVal(`Action_Plan_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || '0', 10);
      const revVal = this._getVal(`Periodical_Review_${i}`);
      const resVal = this._getVal(`MidYear_Result_${i}`);
      const riskVal = this._getVal(`MidYear_Issue_Risk_${i}`);
      const nextActVal = this._getVal(`MidYear_Next_Action_${i}`);

      const objBox = document.createElement('div');
      objBox.style.marginBottom = '16px';
      objBox.style.border = '1px solid #cbd5e1';
      objBox.style.borderRadius = '6px';
      objBox.style.padding = '14px';
      objBox.style.background = '#ffffff';

      const attachChipsHtml = this._getAttachmentHtml(`MidYear_Attachment_${i}`, this.previewOptions.midyearAttachments?.[i]);

      objBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">
          <strong style="color:#1e3a8a; font-size:14px;">#${i} ${escapeHtml(objVal) || '(No objective title)'}</strong>
          <span style="font-size:12px; font-weight:700; color:#0369a1;">Weight: ${escapeHtml(wVal)}%</span>
        </div>

        <div style="font-size:12px; color:#475569; background:#f8fafc; padding:8px 12px; border-radius:4px; margin-bottom:12px;">
          <strong>Action Plan:</strong> ${escapeHtml(actVal) || '-'}
        </div>

        <div style="margin-bottom:12px; background:#f0f9ff; padding:8px 12px; border-radius:4px; border:1px solid #bae6fd;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:12px; font-weight:700; color:#0369a1;">ความคืบหน้า / Progress: <strong>${prog}%</strong></label>
            ${isMidEditable ? `
              <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width: 200px; cursor: pointer;" />
            ` : ''}
          </div>
          <div class="mbo-progress-bar-container">
            <div class="mbo-progress-bar-fill" style="width: ${prog}%;"></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:12px; margin-bottom:10px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#334155; display:block; margin-bottom:4px;">การทบทวนเป็นระยะ / Periodical Review Notes:</label>
            <textarea class="mbo-wide-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="บันทึกทบทวนผลงาน...">${escapeHtml(revVal)}</textarea>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#334155; display:block; margin-bottom:4px;">ผลสำเร็จปัจจุบัน / Current Milestone Result:</label>
            <textarea class="mbo-wide-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="ผลสำเร็จปัจจุบัน...">${escapeHtml(resVal)}</textarea>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:12px; margin-bottom:10px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#334155; display:block; margin-bottom:4px;">ปัญหาและอุปสรรค / Issue & Risk (MidYear_Issue_Risk_${i}):</label>
            <textarea class="mbo-wide-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="ปัญหาและอุปสรรค...">${escapeHtml(riskVal)}</textarea>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#334155; display:block; margin-bottom:4px;">แนวทางแก้ไขขั้นต่อไป / Next Action Plan (MidYear_Next_Action_${i}):</label>
            <textarea class="mbo-wide-textarea mbo-field" data-code="MidYear_Next_Action_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="แนวทางแก้ไขและแผนขั้นต่อไป...">${escapeHtml(nextActVal)}</textarea>
          </div>
        </div>

        <div class="mbo-attachment-section">
          <div class="mbo-attachment-title">📎 เอกสารแนบทบทวนกลางปี / Mid-Year Evidence Files:</div>
          <div class="mbo-attachment-list">${attachChipsHtml}</div>
          ${isMidEditable && this.isPreviewMode ? `
            <div style="margin-top:6px; font-size:11px; color:#0369a1; background:#e0f2fe; padding:4px 8px; border-radius:4px; display:inline-block;">
              [Preview-Only Upload Simulator] 📁 Select File... (Simulated Control Only - No Kintone Upload Call)
            </div>
          ` : ''}
        </div>
      `;

      section.appendChild(objBox);
    }

    return section;
  }

  _renderScreenSelfEval() {
    const isSelfEditable = this.isEditable && this.stage === BUSINESS_STAGES.SELF_EVALUATION;

    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 4 : Math.min(Math.max(countVal, 2), 10);

    const section = document.createElement('div');
    section.className = 'mbo-wide-card';
    section.innerHTML = `
      <div class="mbo-wide-card-header">
        <span>STEP 3: ประเมินตนเองปลายปี / Stage 3 — Self Evaluation (1..${count})</span>
        <span style="font-weight: normal; font-size: 12px; color: #475569;">[ผลงานจริง ประเมินตนเอง และข้อคิดเห็น / Wide Text UX]</span>
      </div>
    `;

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const prog = this._getVal(`Progress_Percent_${i}`) || '0';
      const midRes = this._getVal(`MidYear_Result_${i}`);
      const actResult = this._getVal(`Actual_Result_${i}`);
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '3';
      const selfComment = this._getVal(`Self_Comment_${i}`);

      const attachChipsHtml = this._getAttachmentHtml(`Final_Attachment_${i}`, this.previewOptions.finalAttachments?.[i]);

      const objBox = document.createElement('div');
      objBox.style.marginBottom = '16px';
      objBox.style.border = '1px solid #cbd5e1';
      objBox.style.borderRadius = '6px';
      objBox.style.padding = '14px';
      objBox.style.background = '#ffffff';

      objBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">
          <strong style="color:#1e3a8a; font-size:14px;">#${i} ${escapeHtml(objVal) || '(No objective title)'}</strong>
          <span style="font-size:12px; font-weight:700; color:#0369a1;">Weight: ${escapeHtml(wVal)}% | Mid-Year Progress: ${escapeHtml(prog)}%</span>
        </div>

        <div style="font-size:12px; color:#475569; background:#f8fafc; padding:8px 12px; border-radius:4px; margin-bottom:12px;">
          <strong>Mid-Year Result Summary:</strong> ${escapeHtml(midRes) || '-'}
        </div>

        <div style="margin-bottom:12px;">
          <label style="font-size:12px; font-weight:700; color:#dc2626; display:block; margin-bottom:4px;">ผลการดำเนินงานจริง / Actual Result & Achievement *:</label>
          <textarea class="mbo-wide-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} placeholder="สรุปผลงานจริงที่บรรลุเมื่อสิ้นปี...">${escapeHtml(actResult)}</textarea>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:12px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#dc2626; display:block; margin-bottom:4px;">ประเมินตนเอง / Self Achievement [1-5] *:</label>
            ${isSelfEditable ? `
              <select class="mbo-cell-select mbo-field" data-code="Self_Achievement_${i}" style="width:100%; height:36px;">
                <option value="1" ${selfAch === '1' ? 'selected' : ''}>1 : Rarely meet (ต่ำกว่าเป้า)</option>
                <option value="2" ${selfAch === '2' ? 'selected' : ''}>2 : Partially meet (บางส่วน)</option>
                <option value="3" ${selfAch === '3' ? 'selected' : ''}>3 : Fully meet (ตามเป้า)</option>
                <option value="4" ${selfAch === '4' ? 'selected' : ''}>4 : Exceeded (เกินเป้า)</option>
                <option value="5" ${selfAch === '5' ? 'selected' : ''}>5 : Remarkable (สูงสุด)</option>
              </select>
            ` : `
              <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${escapeHtml(selfAch)}" readonly style="height:36px;" />
            `}
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#334155; display:block; margin-bottom:4px;">ความคิดเห็นตนเอง / Self Reflection:</label>
            <textarea class="mbo-wide-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? 'readonly' : ''} placeholder="ข้อคิดเห็นประกอบการประเมินตนเอง...">${escapeHtml(selfComment)}</textarea>
          </div>
        </div>

        <div class="mbo-attachment-section">
          <div class="mbo-attachment-title">📎 เอกสารแนบหลักฐานผลงาน / Self Evaluation Evidence Files:</div>
          <div class="mbo-attachment-list">${attachChipsHtml}</div>
          ${isSelfEditable && this.isPreviewMode ? `
            <div style="margin-top:6px; font-size:11px; color:#0369a1; background:#e0f2fe; padding:4px 8px; border-radius:4px; display:inline-block;">
              [Preview-Only Upload Simulator] 📁 Select File... (Simulated Control Only - No Kintone Upload Call)
            </div>
          ` : ''}
        </div>
      `;

      section.appendChild(objBox);
    }

    return section;
  }

  _renderScreenAppraiserEval() {
    const wrap = document.createElement('div');

    const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);
    const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);

    // Top Appraiser Completion Card
    const compCard = document.createElement('div');
    compCard.className = 'mbo-appraiser-completion-card';
    compCard.innerHTML = `
      <div class="mbo-appraiser-completion-info">
        👥 สถานะการประเมินของผู้ประเมิน / Appraiser Evaluation Completion:
        <strong>${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Complete (${appraiserInfo.completionPercent}%)</strong>
        <div style="font-size:11.5px; font-weight:normal; color:#475569; margin-top:2px;">
          Part A Ratings: <strong>${appraiserInfo.partA.completed}/${appraiserInfo.partA.total}</strong> | Part B Ratings: <strong>${appraiserInfo.partB.completed}/${appraiserInfo.partB.total}</strong>
        </div>
      </div>
      <div class="mbo-appraiser-slots-pills">
        ${appraiserInfo.slots.map(s => `
          <span class="mbo-appraiser-slot-pill ${s.isCompleted ? 'done' : 'pending'}">
            ${s.isCompleted ? '✓' : '⏳'} ${escapeHtml(s.label)}
          </span>
        `).join('')}
      </div>
    `;
    wrap.appendChild(compCard);

    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 4 : Math.min(Math.max(countVal, 2), 10);

    // PART A: Objectives Appraiser Evaluation Section
    const partASection = document.createElement('div');
    partASection.className = 'mbo-wide-card';
    partASection.innerHTML = `
      <div class="mbo-wide-card-header">
        <span>PART A: การประเมินเป้าหมายผลงาน / Part A Objectives Evaluation (1..${count})</span>
        <span style="font-weight: normal; font-size: 12px; color: #475569;">[คะแนน 1-5 และข้อเสนอแนะรายเป้าหมาย / Per-Item Ratings & Feedback]</span>
      </div>
    `;

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const diffVal = this._getVal(`Difficulty_${i}`);
      const actResult = this._getVal(`Actual_Result_${i}`);
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '-';

      // Read existing result fields (R2-03 / R3-02)
      const mgrScore = this._getVal(`Manager_Objective_Score_${i}`);
      const gmScore = this._getVal(`GM_Objective_Score_${i}`);
      const avgScore = this._getVal(`Average_Objective_Score_${i}`);
      const mboPoint = this._getVal(`MBO_Point_${i}`);

      // Attachment evidence context (R2-04 / R3-03)
      const midAttachHtml = this._getAttachmentHtml(`MidYear_Attachment_${i}`, this.previewOptions.midyearAttachments?.[i]);
      const selfAttachHtml = this._getAttachmentHtml(`Final_Attachment_${i}`, this.previewOptions.finalAttachments?.[i]);

      const objBox = document.createElement('div');
      objBox.style.marginBottom = '14px';
      objBox.style.border = '1px solid #e2e8f0';
      objBox.style.borderRadius = '6px';
      objBox.style.padding = '12px';
      objBox.style.background = '#ffffff';
      objBox.dataset.objIndex = String(i);

      let slotsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partARatings[i] || '';
        const itemComment = s.partAComments[i] || '';
        const isSlotEditable = this.isPreviewMode ? (s.slotIndex === parseInt(this.activeSlotIndex, 10)) : false;

        const ratingDataCode = s.slotIndex === 1 ? `Manager_Achievement_${i}` : (s.slotIndex === 2 ? `GM_Achievement_${i}` : '');
        const commentDataCode = s.slotIndex === 1 ? `Manager_Comment_${i}` : (s.slotIndex === 2 ? `GM_Comment_${i}` : '');

        const slotTitle = (s.slotIndex >= 3) ? `${escapeHtml(s.label)} (Preview Logical Slot — No Kintone Field)` : escapeHtml(s.label);

        slotsHtml += `
          <div class="mbo-appraiser-slot-box" style="${isSlotEditable ? 'border-color: #3b82f6; background: #f0f9ff;' : ''}">
            <div class="mbo-appraiser-slot-header">
              <span>${slotTitle}</span>
              ${s.isPartAComplete ? '<span style="color:#166534; font-size:11px;">✓ Complete</span>' : '<span style="color:#b45309; font-size:11px;">⏳ Pending</span>'}
            </div>
            <div style="margin-bottom: 6px;">
              <label style="font-size:11px; font-weight:700; color:#475569;">Rating [1-5]:</label>
              <select class="mbo-cell-select ${ratingDataCode ? 'mbo-field' : ''}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} ${!isSlotEditable ? 'disabled' : ''} style="margin-top:2px; width:100%;">
                <option value="" ${!ratingVal ? 'selected' : ''}>-- Select Rating --</option>
                <option value="1" ${ratingVal === '1' ? 'selected' : ''}>1 : Rarely meet</option>
                <option value="2" ${ratingVal === '2' ? 'selected' : ''}>2 : Partially meet</option>
                <option value="3" ${ratingVal === '3' ? 'selected' : ''}>3 : Fully meet</option>
                <option value="4" ${ratingVal === '4' ? 'selected' : ''}>4 : Exceeded</option>
                <option value="5" ${ratingVal === '5' ? 'selected' : ''}>5 : Remarkable</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569;">Feedback / Comment:</label>
              <textarea class="mbo-wide-textarea ${commentDataCode ? 'mbo-field' : ''}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} ${!isSlotEditable ? 'readonly' : ''} style="min-height:50px; margin-top:2px;" placeholder="Appraiser comment for Objective #${i}...">${escapeHtml(itemComment)}</textarea>
            </div>
          </div>
        `;
      });

      // R3-02: Stale Score/Result values MUST NOT look valid when appraisal is incomplete!
      let resultContextHtml = '';
      if (appraiserInfo.isFullyComplete) {
        resultContextHtml = `
          <div style="font-size:11.5px; color:#166534; background:#f0fdf4; padding:4px 8px; border-radius:4px; margin-bottom:8px; border:1px solid #bbf7d0;">
            <strong>Result Context (Read-Only):</strong>
            ${mgrScore ? `1st Score: ${escapeHtml(mgrScore)} | ` : ''}
            ${gmScore ? `2nd Score: ${escapeHtml(gmScore)} | ` : ''}
            Avg Score: <strong>${escapeHtml(avgScore || '-')}</strong> | MBO Point: <strong>${escapeHtml(mboPoint || '-')}</strong>
          </div>
        `;
      } else {
        resultContextHtml = `
          <div style="font-size:11.5px; color:#991b1b; background:#fef2f2; padding:4px 8px; border-radius:4px; margin-bottom:8px; border:1px solid #fecaca;">
            <strong>Combined Result Context:</strong> <span class="mbo-pending-badge">⚠️ Combined Result Pending / Incomplete</span>
            ${(mgrScore || gmScore) ? ` <span style="color:#64748b; font-size:11px;">(Stored Appraiser Context: ${mgrScore ? `1st:${escapeHtml(mgrScore)} ` : ''}${gmScore ? `2nd:${escapeHtml(gmScore)}` : ''})</span>` : ''}
          </div>
        `;
      }

      objBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:#0f172a; font-size:13.5px;">#${i} ${escapeHtml(objVal) || '(No objective title)'}</strong>
          <span style="font-size:12px; font-weight:700; color:#0369a1;">Weight: ${escapeHtml(wVal)}% | Difficulty: ${diffVal ? `Level ${escapeHtml(diffVal)}` : 'ยังไม่ได้ระบุ / Not selected'} | Self Ach: Level ${escapeHtml(selfAch)}</span>
        </div>
        <div style="font-size:12px; color:#475569; background:#f8fafc; padding:6px 10px; border-radius:4px; margin-bottom:8px;">
          <strong>Actual Result:</strong> ${escapeHtml(actResult) || '(No actual result entered)'}
        </div>

        ${resultContextHtml}

        <div class="mbo-appraiser-eval-grid">
          ${slotsHtml}
        </div>

        <div style="margin-top:8px; font-size:11.5px; background:#f8fafc; padding:6px 10px; border-radius:4px; border:1px dashed #cbd5e1;">
          <strong>📎 Attached Evidence Context:</strong>
          <div style="margin-top:2px;">Mid-Year Files: ${midAttachHtml} | Self Eval Files: ${selfAttachHtml}</div>
        </div>
      `;
      partASection.appendChild(objBox);
    }
    wrap.appendChild(partASection);

    // PART B: Competencies Evaluation Section
    const partBSection = document.createElement('div');
    partBSection.className = 'mbo-wide-card';
    partBSection.innerHTML = `
      <div class="mbo-wide-card-header">
        <span>PART B: การประเมินสมรรถนะ / Part B Competency Evaluation (${applicableCompList.length} Items)</span>
        <span style="font-weight: normal; font-size: 12px; color: #475569;">[${escapeHtml(compSetCode)}]</span>
      </div>
    `;

    applicableCompList.forEach(comp => {
      let slotsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partBRatings[comp.id] || '';
        const itemComment = s.partBComments[comp.id] || '';
        const isSlotEditable = this.isPreviewMode ? (s.slotIndex === parseInt(this.activeSlotIndex, 10)) : false;

        const ratingDataCode = s.slotIndex === 1 ? `Manager_Competency_Rating_${comp.id}` : (s.slotIndex === 2 ? `GM_Competency_Rating_${comp.id}` : '');
        const commentDataCode = s.slotIndex === 1 ? `Manager_Competency_Comment_${comp.id}` : (s.slotIndex === 2 ? `GM_Competency_Comment_${comp.id}` : '');

        const slotTitle = (s.slotIndex >= 3) ? `${escapeHtml(s.label)} (Preview Logical Slot — No Kintone Field)` : escapeHtml(s.label);

        slotsHtml += `
          <div class="mbo-appraiser-slot-box" style="${isSlotEditable ? 'border-color: #3b82f6; background: #f0f9ff;' : ''}">
            <div class="mbo-appraiser-slot-header">
              <span>${slotTitle}</span>
            </div>
            <div style="margin-bottom: 6px;">
              <label style="font-size:11px; font-weight:700; color:#475569;">Score [1-5]:</label>
              <select class="mbo-cell-select ${ratingDataCode ? 'mbo-field' : ''}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} ${!isSlotEditable ? 'disabled' : ''} style="margin-top:2px; width:100%;">
                <option value="" ${!ratingVal ? 'selected' : ''}>-- Select Score --</option>
                <option value="1" ${ratingVal === '1' ? 'selected' : ''}>1 : Unsatisfactory</option>
                <option value="2" ${ratingVal === '2' ? 'selected' : ''}>2 : Needs Improvement</option>
                <option value="3" ${ratingVal === '3' ? 'selected' : ''}>3 : Meets Standard</option>
                <option value="4" ${ratingVal === '4' ? 'selected' : ''}>4 : Exceeds Standard</option>
                <option value="5" ${ratingVal === '5' ? 'selected' : ''}>5 : Outstanding</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569;">Competency Feedback / Comment:</label>
              <textarea class="mbo-wide-textarea ${commentDataCode ? 'mbo-field' : ''}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} ${!isSlotEditable ? 'readonly' : ''} style="min-height:45px; margin-top:2px;" placeholder="Competency comment...">${escapeHtml(itemComment)}</textarea>
            </div>
          </div>
        `;
      });

      const compResult = this._getVal(`Competency_Result_${comp.id}`);

      let partBResultLabel = '';
      if (comp.isCOCE) {
        partBResultLabel = '<span class="mbo-coce-badge">Evaluated / Excluded from Score</span>';
      } else if (appraiserInfo.isFullyComplete) {
        partBResultLabel = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml(compResult || '-')}</span>`;
      } else {
        partBResultLabel = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Result: Pending / Incomplete</span>';
      }

      const compCard = document.createElement('div');
      compCard.className = 'mbo-partb-card';
      compCard.dataset.compId = String(comp.id);
      compCard.innerHTML = `
        <div class="mbo-partb-header">
          <div class="mbo-partb-title">${escapeHtml(comp.nameTH)}</div>
          ${partBResultLabel}
        </div>
        <div class="mbo-partb-desc">${escapeHtml(comp.desc)}</div>
        <div class="mbo-appraiser-eval-grid">
          ${slotsHtml}
        </div>
      `;
      partBSection.appendChild(compCard);
    });

    wrap.appendChild(partBSection);

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
            <span class="mbo-pending-badge">⚠️ Result Pending / Incomplete</span>
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
    const section = document.createElement('div');
    section.className = 'mbo-wide-card';
    const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);

    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 4 : Math.min(Math.max(countVal, 2), 10);

    let html = `
      <div class="mbo-wide-card-header">
        <span>📋 รายละเอียดผลประเมินย้อนหลัง / Evaluation Detail Breakdown (Read-Only)</span>
      </div>
      <h3 style="color:#1e3a8a; font-size:14px; margin:12px 0 6px 0;">Part A: Objectives Evaluation</h3>
    `;

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

      let slotsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partARatings[i] || '-';
        const commentVal = s.partAComments[i] || '-';
        slotsHtml += `
          <div style="background:#f8fafc; padding:8px 10px; border-radius:4px; border:1px solid #e2e8f0; font-size:12px;">
            <strong>${escapeHtml(s.label)}:</strong> Rating: Level ${escapeHtml(ratingVal)} | Comment: "${escapeHtml(commentVal)}"
          </div>
        `;
      });

      let partAResultContext = '';
      if (appraiserInfo.isFullyComplete) {
        partAResultContext = `
          <div style="font-size:11.5px; color:#166534; background:#f0fdf4; padding:6px 10px; border-radius:4px; margin-top:8px; border:1px solid #bbf7d0;">
            <strong>Part A Result Context:</strong>
            ${mgrScore ? `1st Score: ${escapeHtml(mgrScore)} | ` : ''}
            ${gmScore ? `2nd Score: ${escapeHtml(gmScore)} | ` : ''}
            Avg Score: <strong>${escapeHtml(avgScore || '-')}</strong> | MBO Point: <strong>${escapeHtml(mboPoint || '-')}</strong>
          </div>
        `;
      } else {
        partAResultContext = `
          <div style="font-size:11.5px; color:#991b1b; background:#fef2f2; padding:6px 10px; border-radius:4px; margin-top:8px; border:1px solid #fecaca;">
            <strong>Part A Result Context:</strong> <span class="mbo-pending-badge">⚠️ Combined Result Pending / Incomplete</span>
            ${(mgrScore || gmScore) ? ` <span style="color:#64748b; font-size:11px;">(Stored Appraiser Context: ${mgrScore ? `1st:${escapeHtml(mgrScore)} ` : ''}${gmScore ? `2nd:${escapeHtml(gmScore)}` : ''})</span>` : ''}
          </div>
        `;
      }

      html += `
        <div style="margin-bottom:10px; padding:10px; border:1px solid #e2e8f0; border-radius:6px;">
          <div style="font-weight:700; color:#0f172a; font-size:13px;">#${i} ${escapeHtml(objVal)} (Weight: ${escapeHtml(wVal)}%)</div>
          <div style="font-size:12px; color:#475569; margin:4px 0 8px 0;">Actual: ${escapeHtml(actResult || '-')}</div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:8px;">${slotsHtml}</div>
          ${partAResultContext}
          <div style="margin-top:6px; font-size:11px; color:#64748b;">📎 Evidence Context: Mid-Year [${midAttachHtml}] | Self Eval [${selfAttachHtml}]</div>
        </div>
      `;
    }

    html += `<h3 style="color:#1e3a8a; font-size:14px; margin:16px 0 6px 0;">Part B: Competency Evaluation</h3>`;

    applicableCompList.forEach(comp => {
      const compResult = this._getVal(`Competency_Result_${comp.id}`);

      let slotsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partBRatings[comp.id] || '-';
        const commentVal = s.partBComments[comp.id] || '-';
        slotsHtml += `
          <div style="background:#f8fafc; padding:6px 10px; border-radius:4px; border:1px solid #e2e8f0; font-size:12px;">
            <strong>${escapeHtml(s.label)}:</strong> Score: Level ${escapeHtml(ratingVal)} | Comment: "${escapeHtml(commentVal)}"
          </div>
        `;
      });

      let compResultBadge = '';
      if (comp.isCOCE) {
        compResultBadge = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
      } else if (appraiserInfo.isFullyComplete) {
        compResultBadge = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml(compResult || '-')}</span>`;
      } else {
        compResultBadge = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Result: Pending / Incomplete</span>';
      }

      html += `
        <div style="margin-bottom:8px; padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:700; color:#0f172a; font-size:12.5px;">${escapeHtml(comp.nameTH)}</div>
            ${compResultBadge}
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:6px; margin-top:6px;">${slotsHtml}</div>
        </div>
      `;
    });

    section.innerHTML = html;
    return section;
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
      // Do NOT sync fields without physical data-code or preview-only slots (R1-02 / R2-02 / R3-04)
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

    const managerUser = this._getValObj('Manager_User');
    const gmUser = this._getValObj('GM_User');
    const firstManagerUser = this._getValObj('First_Manager_User');

    let topologyBadgeHtml = '';
    if (!topInfo.isCanonical) {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fef2f2; color: #dc2626;">Topology: ⚠️ Unrecognized (${escapeHtml(topInfo.raw || 'Not Specified')})</span>`;
    } else if (topInfo.isG2) {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fffbe6; color: #b45309;">Topology: ⚠️ Unsupported in V1 (${escapeHtml(topInfo.raw)})</span>`;
    } else {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge">Topology: ${escapeHtml(topInfo.raw)}</span>`;
    }

    if (!topInfo.isSupportedV1) {
      card.innerHTML = `
        <div class="mbo-route-title">
          <span>🔗 เส้นทางเสนออนุมัติ / Approval Route Summary</span>
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

    const isM2 = topInfo.isM1M2G1 && Array.isArray(firstManagerUser) && firstManagerUser.length > 0;

    card.innerHTML = `
      <div class="mbo-route-title">
        <span>🔗 เส้นทางเสนออนุมัติ / Approval Route Summary</span>
        ${topologyBadgeHtml}
      </div>
      <div class="mbo-route-grid">
        ${isM2 ? `
          <div class="mbo-route-step">
            <span class="mbo-route-role">1st Manager (ผู้บังคับบัญชาชั้นต้น):</span>
            <span class="mbo-route-user">${formatUserDisplay(firstManagerUser)}</span>
          </div>
        ` : ''}
        <div class="mbo-route-step">
          <span class="mbo-route-role">Manager (ผู้จัดการส่วนงาน):</span>
          <span class="mbo-route-user">${formatUserDisplay(managerUser)}</span>
        </div>
        <div class="mbo-route-step">
          <span class="mbo-route-role">GM (ผู้จัดการฝ่าย):</span>
          <span class="mbo-route-user">${formatUserDisplay(gmUser)}</span>
        </div>
        <div class="mbo-route-step">
          <span class="mbo-route-role">HR Final Check:</span>
          <span class="mbo-route-user">HR Final Check (ตรวจสอบขั้นสุดท้าย)</span>
        </div>
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
          const row = e.target.closest('div');
          const fill = row?.querySelector('.mbo-progress-bar-fill');
          if (fill) fill.style.width = `${val}%`;
          const lbl = row?.querySelector('label strong');
          if (lbl) lbl.textContent = `${val}%`;
        }
      });
    });

    // R3-04: Truthful Slot 3/4 Preview Editing in Preview Lab Mode
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

          const objBox = e.target.closest('[data-obj-index]');
          const compBox = e.target.closest('[data-comp-id]');

          if (objBox) {
            const objIndex = objBox.dataset.objIndex;
            if (tagName === 'select') this.previewOptions[`slot${slotIdx}RatingsA`][objIndex] = val;
            if (tagName === 'textarea') this.previewOptions[`slot${slotIdx}CommentsA`][objIndex] = val;
          } else if (compBox) {
            const compId = compBox.dataset.compId;
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
  }

  async executeLookup(empCode) {
    const code = String(empCode || '').trim();
    if (!code) return;
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
      // R3-01: Keep/re-render retryable Lookup UI with error message on lookup failure
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
    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 4 : countVal;

    let total = 0;
    const parts = [];
    for (let i = 1; i <= count; i++) {
      const w = parseFloat(this._getVal(`Weight_${i}`) || '0');
      total += isNaN(w) ? 0 : w;
      parts.push(`${w || 0}%`);
    }

    const box = document.getElementById('mbo-weight-summary-box');
    const txt = document.getElementById('mbo-weight-calc-text');
    const st = document.getElementById('mbo-weight-calc-status');
    if (!box || !txt || !st) return;

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
