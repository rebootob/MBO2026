/**
 * Employee Part A UI Renderer - Bilingual Spreadsheet Grid
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & Bilingual Specification
 */

import { BUSINESS_STAGES } from '../config/constants.js';
import { ValidationEngine } from '../validation/validation-engine.js';

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

export function getStatusGuidance(status, topology = 'M1_G1') {
  const currentStatus = String(status || '').trim();
  const isM1G1 = topology === 'M1_G1';

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
    '02 First Manager Objective Review': isM1G1 ? firstManagerWarning : {
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
    '07 First Manager Mid-Year Review': isM1G1 ? firstManagerWarning : {
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
    '12 First Manager Final Evaluation': isM1G1 ? firstManagerWarning : {
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
  const currentStatus = String(status || '').trim();

  if (['01 Draft Objective', '02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved'].includes(currentStatus)) {
    return 1; // Objectives
  }
  if (['06 Employee Mid-Year', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed'].includes(currentStatus)) {
    return 2; // Mid-Year
  }
  if (['11 Employee Self Evaluation', '12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check'].includes(currentStatus)) {
    return 3; // Year-End
  }
  if (currentStatus === '16 Completed') {
    return 4; // Completed
  }
  return 1;
}

export class EmployeePartAUI {
  constructor(options = {}) {
    this.container = options.container;
    this.record = options.record || {};
    this.stage = options.stage || BUSINESS_STAGES.READ_ONLY;
    this.isEditable = options.isEditable || false;
    this.isCreate = options.isCreate || false;
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

    // STEP 1: Lookup Banner on Create
    if (this.isCreate) {
      root.appendChild(this._renderLookupSection());
    }

    // Top Status & Workflow Guidance Card (Display-only guidance)
    root.appendChild(this._renderStatusGuidanceCard());

    // STEP 2: Header Section (Horizontal Summary)
    root.appendChild(this._renderHeader());

    // Approval Route Context (Display-only route summary)
    root.appendChild(this._renderRouteContext());

    // Collapsible Legend & Guidelines
    root.appendChild(this._renderCollapsibleLegendAndGuidelines());

    // Custom Error Summary Area (Top of Table)
    const errorSummaryContainer = document.createElement('div');
    errorSummaryContainer.id = 'mbo-error-summary-anchor';
    root.appendChild(errorSummaryContainer);

    // Hoshin Section (2 Columns Horizontal)
    root.appendChild(this._renderHoshin());

    // Stage Navigation (4 Macro Stages)
    root.appendChild(this._renderStageNav());

    // STEP 3: Part A Spreadsheet Grid Table (1 Objective = 1 Row)
    root.appendChild(this._renderSpreadsheetTable());

    this.container.appendChild(root);
    this._updateTotalWeightDisplay();
    this._refreshAllFieldHighlights(root);
    this._bindEvents(root);

    if (this.currentErrors && this.currentErrors.length > 0) {
      this._renderInlineErrors(this.currentErrors);
    }
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
    card.className = 'mbo-workflow-guidance-card';

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const topology = this._getVal('Routing_Topology') || 'M1_G1';
    const guidance = getStatusGuidance(status, topology);

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

    const topology = this._getVal('Routing_Topology') || 'M1_G1';
    const managerUser = this._getValObj('Manager_User');
    const gmUser = this._getValObj('GM_User');
    const firstManagerUser = this._getValObj('First_Manager_User');

    const isM2 = topology.includes('M2') || (firstManagerUser && firstManagerUser.length > 0);

    card.innerHTML = `
      <div class="mbo-route-title">
        <span>🔗 เส้นทางเสนออนุมัติ / Approval Route Summary</span>
        <span class="mbo-route-topology-badge">Topology: ${escapeHtml(topology)}</span>
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

    // Click on summary item jumps to field
    summaryCard.querySelectorAll('.mbo-error-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        this.focusFirstInvalidField([{ field }]);
      });
    });

    summaryAnchor.innerHTML = '';
    summaryAnchor.appendChild(summaryCard);

    // Apply red border & error message to each invalid field
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

  _renderStageNav() {
    const nav = document.createElement('div');
    nav.className = 'mbo-stage-nav';

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const macroStage = getMacroStage(status);

    const isInReview = ['03 Manager Objective Review', '04 GM Objective Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check'].includes(status);

    const step1Class = macroStage === 1 ? 'active' : (macroStage > 1 ? 'completed' : 'locked');
    const step2Class = macroStage === 2 ? 'active' : (macroStage > 2 ? 'completed' : 'locked');
    const step3Class = macroStage === 3 ? 'active' : (macroStage > 3 ? 'completed' : 'locked');
    const step4Class = macroStage === 4 ? 'completed' : 'locked';

    const step1Sub = macroStage === 1 ? (isInReview ? '⏳ [In Review]' : '🔥 [Active]') : (macroStage > 1 ? '✅' : '');
    const step2Sub = macroStage === 2 ? (isInReview ? '⏳ [In Review]' : '🔥 [Active]') : (macroStage > 2 ? '✅' : '🔒');
    const step3Sub = macroStage === 3 ? (isInReview ? '⏳ [In Review]' : '🔥 [Active]') : (macroStage > 3 ? '✅' : '🔒');
    const step4Sub = macroStage === 4 ? '✅ [Completed]' : '🔒';

    nav.innerHTML = `
      <div class="mbo-stage-step ${step1Class}">
        1. ตั้งเป้าหมาย / Objectives ${step1Sub}
      </div>
      <div class="mbo-stage-step ${step2Class}">
        2. ทบทวนกลางปี / Mid-Year ${step2Sub}
      </div>
      <div class="mbo-stage-step ${step3Class}">
        3. ประเมินปลายปี / Year-End ${step3Sub}
      </div>
      <div class="mbo-stage-step ${step4Class}">
        4. เสร็จสิ้น / Completed ${step4Sub}
      </div>
    `;
    return nav;
  }

  _renderSpreadsheetTable() {
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
      <span>STEP 3: Part A : MBO (1 แถว = 1 เป้าหมาย / 1 Objective = 1 Horizontal Row)</span>
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
        <div style="font-size: 18px; margin-bottom: 6px;">🔒 ตารางตั้งเป้าหมายถูกล็อกชั่วคราว / Objective Grid is Locked</div>
        <div style="font-size: 13px;">กรุณาระบุรหัสพนักงานใน <strong>STEP 1</strong> และกดปุ่มค้นหาก่อนเพื่อปลดล็อกการตั้งเป้าหมาย<br/>Please identify and verify employee profile in STEP 1 to unlock objective setup.</div>
      `;
      container.appendChild(lockBanner);
      return container;
    }

    const table = document.createElement('table');
    table.className = 'mbo-grid-table';

    if (isObjectiveStage) {
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">#</th>
            <th style="width: 32%;">
              เป้าหมาย / Objectives (Expected result & target) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระบุเป้าหมายและผลลัพธ์ที่คาดหวัง / Indicate expected result]</span>
            </th>
            <th style="width: 32%;">
              แผนปฏิบัติการ / Action Plan (Activities to achieve obj.) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระบุกิจกรรมและแผนงาน / Indicate activities & plan]</span>
            </th>
            <th style="width: 18%;">
              ข้อตกลงเพิ่มเติม / Additional agreement / Comment
              <span class="th-sub">[ข้อตกลงเพิ่มเติม / Any agreement]</span>
            </th>
            <th style="width: 95px; text-align: center;">
              น้ำหนัก / Weight (%) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[น้ำหนัก %]</span>
            </th>
            <th style="width: 180px;">
              ระดับความยาก / Difficulty Level [1-4] <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระดับความยาก 1-4]</span>
            </th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: count }, (_, idx) => this._renderObjectiveInputRow(idx + 1, isObjEditable)).join('')}
        </tbody>
      `;
    } else if (this.stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">#</th>
            <th style="width: 25%;">
              เป้าหมาย / Objective & Target <span style="color:#64748b;">[🔒 ล็อก]</span>
              <span class="th-sub">[เป้าหมายที่บันทึกไว้ / Saved Objective]</span>
            </th>
            <th style="width: 140px;">
              ความคืบหน้า / Progress (%) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[0 - 100%]</span>
            </th>
            <th style="width: 22%;">
              การทบทวนเป็นระยะ / Periodical Review by Appraisee
              <span class="th-sub">[บันทึกทบทวนผลงาน / Review Notes]</span>
            </th>
            <th style="width: 22%;">
              ผลสำเร็จปัจจุบัน / Current Result
              <span class="th-sub">[ผลสำเร็จปัจจุบัน / Milestone Results]</span>
            </th>
            <th style="width: 22%;">
              ปัญหาและแนวทางแก้ไข / Issue, Risk & Next Action
              <span class="th-sub">[ปัญหา อุปสรรค / Risks & Next Steps]</span>
            </th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: count }, (_, idx) => this._renderMidYearRow(idx + 1)).join('')}
        </tbody>
      `;
    } else if (this.stage === BUSINESS_STAGES.SELF_EVALUATION) {
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">#</th>
            <th style="width: 22%;">
              เป้าหมาย / Objective & Target <span style="color:#64748b;">[🔒 ล็อก]</span>
              <span class="th-sub">[เป้าหมายที่บันทึกไว้ / Saved Objective]</span>
            </th>
            <th style="width: 20%;">
              ผลทบทวนกลางปี / Mid-Year Summary <span style="color:#64748b;">[🔒 ล็อก]</span>
              <span class="th-sub">[ผลทบทวนกลางปี / Mid-Year Review]</span>
            </th>
            <th style="width: 26%;">
              ผลการดำเนินงานจริง / Actual Result & Achievement <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ผลงานจริงเมื่อสิ้นสุดรอบประเมิน / Actual Results]</span>
            </th>
            <th style="width: 170px;">
              ประเมินตนเอง / Self Achievement [1-5] <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระดับผลสำเร็จ 1-5]</span>
            </th>
            <th style="width: 20%;">
              ความคิดเห็นตนเอง / Self Comment / Reflection
              <span class="th-sub">[ความเห็นประเมินตนเอง / Self Reflection]</span>
            </th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: count }, (_, idx) => this._renderSelfEvalRow(idx + 1)).join('')}
        </tbody>
      `;
    } else {
      // Read-Only Summary Mode
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">#</th>
            <th style="width: 24%;">เป้าหมายและแผนงาน / Objective & Action Plan</th>
            <th style="width: 80px; text-align: center;">Weight %</th>
            <th style="width: 90px; text-align: center;">Difficulty</th>
            <th style="width: 20%;">ทบทวนกลางปี / Mid-Year Review</th>
            <th style="width: 24%;">ผลงานจริง / Actual Result</th>
            <th style="width: 90px; text-align: center;">Self Ach.</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: count }, (_, idx) => this._renderReadOnlySummaryRow(idx + 1)).join('')}
        </tbody>
      `;
    }

    container.appendChild(table);

    // Total Weight Summary
    container.appendChild(this._renderWeightSummary());

    return container;
  }

  _renderObjectiveInputRow(i, isObjEditable) {
    const objVal = this._getVal(`Objective_${i}`);
    const actVal = this._getVal(`Action_Plan_${i}`);
    const addVal = this._getVal(`Additional_Agreement_${i}`);
    const wVal = this._getVal(`Weight_${i}`);
    const diffVal = this._getVal(`Difficulty_${i}`) || '3';

    return `
      <tr>
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุเป้าหมายและผลลัพธ์ / Indicate expected result and target...">${escapeHtml(objVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุกิจกรรมและแผนงาน / Indicate activities to achieve objective...">${escapeHtml(actVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="ข้อตกลงเพิ่มเติม / Any agreement or comment...">${escapeHtml(addVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </td>
        <td style="vertical-align: middle; text-align: center;">
          <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${escapeHtml(wVal)}" ${!isObjEditable ? 'readonly' : ''} style="text-align: center;" placeholder="30" />
          <span class="mbo-cell-tag" data-target="Weight_${i}"></span>
        </td>
        <td style="vertical-align: middle;">
          ${isObjEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Difficulty_${i}">
              <option value="1" ${diffVal === '1' ? 'selected' : ''}>1 : Normal (ง่าย)</option>
              <option value="2" ${diffVal === '2' ? 'selected' : ''}>2 : Moderate (ปานกลาง)</option>
              <option value="3" ${diffVal === '3' ? 'selected' : ''}>3 : Difficult (ยาก)</option>
              <option value="4" ${diffVal === '4' ? 'selected' : ''}>4 : Challenging (ท้าทายมาก)</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${escapeHtml(diffVal)}" readonly />
          `}
          <span class="mbo-cell-tag" data-target="Difficulty_${i}"></span>
        </td>
      </tr>
    `;
  }

  _renderMidYearRow(i) {
    const isMidEditable = this.isEditable && this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;
    const objVal = this._getVal(`Objective_${i}`);
    const actVal = this._getVal(`Action_Plan_${i}`);
    const wVal = this._getVal(`Weight_${i}`) || '0';
    const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || '0', 10);
    const revVal = this._getVal(`Periodical_Review_${i}`);
    const resVal = this._getVal(`MidYear_Result_${i}`);
    const riskVal = this._getVal(`MidYear_Issue_Risk_${i}`);

    return `
      <tr>
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${escapeHtml(objVal) || '(No objective)'}</div>
          <div style="font-size: 12px; color: #475569; white-space: pre-wrap;">${escapeHtml(actVal) || ''}</div>
          <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: #0369a1;">Weight: ${escapeHtml(wVal)}%</div>
        </td>
        <td style="vertical-align: middle;">
          <div style="font-weight: 700; text-align: center; margin-bottom: 4px;">${prog}%</div>
          ${isMidEditable ? `
            <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width: 100%; cursor: pointer;" />
          ` : ''}
          <div class="mbo-progress-bar-container">
            <div class="mbo-progress-bar-fill" style="width: ${prog}%;"></div>
          </div>
          <span class="mbo-cell-tag" data-target="Progress_Percent_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="บันทึกทบทวนผลงาน / Review notes...">${escapeHtml(revVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Periodical_Review_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="ผลสำเร็จปัจจุบัน / Milestone results...">${escapeHtml(resVal)}</textarea>
          <span class="mbo-cell-tag" data-target="MidYear_Result_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="ปัญหาและอุปสรรค / Risks & next action...">${escapeHtml(riskVal)}</textarea>
          <span class="mbo-cell-tag" data-target="MidYear_Issue_Risk_${i}"></span>
        </td>
      </tr>
    `;
  }

  _renderSelfEvalRow(i) {
    const isSelfEditable = this.isEditable && this.stage === BUSINESS_STAGES.SELF_EVALUATION;
    const objVal = this._getVal(`Objective_${i}`);
    const wVal = this._getVal(`Weight_${i}`) || '0';
    const prog = this._getVal(`Progress_Percent_${i}`) || '0';
    const midRes = this._getVal(`MidYear_Result_${i}`);
    const actResult = this._getVal(`Actual_Result_${i}`);
    const selfAch = this._getVal(`Self_Achievement_${i}`) || '3';
    const selfComment = this._getVal(`Self_Comment_${i}`);

    return `
      <tr>
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${escapeHtml(objVal) || '(No objective)'}</div>
          <div style="margin-top: 4px; font-size: 11px; font-weight: 700; color: #0369a1;">Weight: ${escapeHtml(wVal)}%</div>
        </td>
        <td>
          <div style="font-size: 12px; font-weight: 600; color: #0369a1;">Mid-Year: ${escapeHtml(prog)}%</div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px; white-space: pre-wrap;">${escapeHtml(midRes) || '-'}</div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} placeholder="ผลงานจริง / Summary of actual results...">${escapeHtml(actResult)}</textarea>
          <span class="mbo-cell-tag" data-target="Actual_Result_${i}"></span>
        </td>
        <td style="vertical-align: middle;">
          ${isSelfEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Self_Achievement_${i}">
              <option value="1" ${selfAch === '1' ? 'selected' : ''}>1 : Rarely meet (ต่ำกว่าเป้า)</option>
              <option value="2" ${selfAch === '2' ? 'selected' : ''}>2 : Partially meet (บางส่วน)</option>
              <option value="3" ${selfAch === '3' ? 'selected' : ''}>3 : Fully meet (ตามเป้า)</option>
              <option value="4" ${selfAch === '4' ? 'selected' : ''}>4 : Exceeded (เกินเป้า)</option>
              <option value="5" ${selfAch === '5' ? 'selected' : ''}>5 : Remarkable (สูงสุด)</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${escapeHtml(selfAch)}" readonly />
          `}
          <span class="mbo-cell-tag" data-target="Self_Achievement_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? 'readonly' : ''} placeholder="ความเห็นประกอบ / Self reflection...">${escapeHtml(selfComment)}</textarea>
          <span class="mbo-cell-tag" data-target="Self_Comment_${i}"></span>
        </td>
      </tr>
    `;
  }

  _renderReadOnlySummaryRow(i) {
    const objVal = this._getVal(`Objective_${i}`);
    const actVal = this._getVal(`Action_Plan_${i}`);
    const wVal = this._getVal(`Weight_${i}`) || '0';
    const diffVal = this._getVal(`Difficulty_${i}`) || '-';
    const prog = this._getVal(`Progress_Percent_${i}`) || '0';
    const midRes = this._getVal(`MidYear_Result_${i}`);
    const actResult = this._getVal(`Actual_Result_${i}`);
    const selfAch = this._getVal(`Self_Achievement_${i}`) || '-';

    return `
      <tr>
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${escapeHtml(objVal) || '-'}</div>
          <div style="font-size: 12px; color: #475569; white-space: pre-wrap;">${escapeHtml(actVal) || ''}</div>
        </td>
        <td style="text-align: center; vertical-align: middle; font-weight: 700;">${escapeHtml(wVal)}%</td>
        <td style="text-align: center; vertical-align: middle;">Level ${escapeHtml(diffVal)}</td>
        <td>
          <div style="font-size: 12px; font-weight: 700; color: #0369a1;">Progress: ${escapeHtml(prog)}%</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">${escapeHtml(midRes) || '-'}</div>
        </td>
        <td>
          <div style="font-size: 12px; color: #0f172a; white-space: pre-wrap;">${escapeHtml(actResult) || '-'}</div>
        </td>
        <td style="text-align: center; vertical-align: middle; font-weight: 700; color: #b45309;">Level ${escapeHtml(selfAch)}</td>
      </tr>
    `;
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
    // Input changes
    root.querySelectorAll('.mbo-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const code = e.target.dataset.code;
        const val = e.target.value;
        this._setVal(code, val);
        this.onFieldChange(code, val);

        // Clear error for this field if corrected
        if (this.currentErrors && this.currentErrors.length > 0) {
          this.currentErrors = this.currentErrors.filter(err => err.field !== code);
          this._renderInlineErrors(this.currentErrors);
        }

        this._refreshSingleFieldHighlight(e.target, root);

        if (code.startsWith('Weight_')) {
          this._updateTotalWeightDisplay();
        }
        if (code.startsWith('Progress_Percent_')) {
          const row = e.target.closest('tr');
          const fill = row?.querySelector('.mbo-progress-bar-fill');
          if (fill) fill.style.width = `${val}%`;
          const lbl = row?.querySelector('td:nth-child(3) div:first-child');
          if (lbl) lbl.textContent = `${val}%`;
        }
      });
    });

    // Objective count selector
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

    // Lookup input change listener (Reset verification if edited)
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

    // Lookup button
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
          const newMsgEl = this.root ? this.root.querySelector('#mbo-lookup-msg') : null;
          if (newMsgEl) {
            const formattedMsg = escapeHtml(err.message || '').replace(/\n/g, '<br/>');
            newMsgEl.innerHTML = `<div style="color: #dc2626; line-height: 1.4; padding: 6px 0;">❌ ${formattedMsg}</div>`;
          }
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
      this.isEmployeeVerified = false;
      this.render();
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

    // If currently in error state, keep it unless value changed or reset
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
