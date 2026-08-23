
(function() {
  'use strict';

  /**
 * Central Configuration & Constants for TTMET MBO V2
 */

const APP_CONFIG = {
  DEFAULT_FISCAL_YEAR: 'FY2026',
  APP_53_EMPLOYEE_MASTER_ID: 53,
  APP_283_LEGACY_PMS_ID: 283
};

const WORKFLOW_STATUS = {
  DRAFT_OBJECTIVE: '01 Draft Objective',
  FIRST_MANAGER_OBJECTIVE: '02 First Manager Objective Review',
  MANAGER_OBJECTIVE: '03 Manager Objective Review',
  GM_OBJECTIVE: '04 GM Objective Review',
  OBJECTIVE_APPROVED: '05 Objective Approved',
  EMPLOYEE_MIDYEAR: '06 Employee Mid-Year',
  FIRST_MANAGER_MIDYEAR: '07 First Manager Mid-Year Review',
  MANAGER_MIDYEAR: '08 Manager Mid-Year Review',
  GM_MIDYEAR: '09 GM Mid-Year Review',
  MIDYEAR_COMPLETED: '10 Mid-Year Completed',
  EMPLOYEE_SELF_EVAL: '11 Employee Self Evaluation',
  FIRST_MANAGER_FINAL: '12 First Manager Final Evaluation',
  MANAGER_FINAL: '13 Manager Final Evaluation',
  GM_FINAL: '14 GM Final Evaluation',
  HR_FINAL_CHECK: '15 HR Final Check',
  COMPLETED: '16 Completed'
};

const BUSINESS_STAGES = {
  OBJECTIVE_INPUT: 'OBJECTIVE_INPUT',
  MIDYEAR_INPUT: 'MIDYEAR_INPUT',
  SELF_EVALUATION: 'SELF_EVALUATION',
  READ_ONLY: 'READ_ONLY',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

const STATUS_TO_STAGE_MAP = {
  '': BUSINESS_STAGES.OBJECTIVE_INPUT,
  'Not started': BUSINESS_STAGES.OBJECTIVE_INPUT,
  [WORKFLOW_STATUS.DRAFT_OBJECTIVE]: BUSINESS_STAGES.OBJECTIVE_INPUT,
  [WORKFLOW_STATUS.FIRST_MANAGER_OBJECTIVE]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MANAGER_OBJECTIVE]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.GM_OBJECTIVE]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.OBJECTIVE_APPROVED]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.EMPLOYEE_MIDYEAR]: BUSINESS_STAGES.MIDYEAR_INPUT,
  [WORKFLOW_STATUS.FIRST_MANAGER_MIDYEAR]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MANAGER_MIDYEAR]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.GM_MIDYEAR]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MIDYEAR_COMPLETED]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.EMPLOYEE_SELF_EVAL]: BUSINESS_STAGES.SELF_EVALUATION,
  [WORKFLOW_STATUS.FIRST_MANAGER_FINAL]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.MANAGER_FINAL]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.GM_FINAL]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.HR_FINAL_CHECK]: BUSINESS_STAGES.READ_ONLY,
  [WORKFLOW_STATUS.COMPLETED]: BUSINESS_STAGES.READ_ONLY
};

const CONFIDENTIAL_FIELDS = [
  'PartA_Raw_Score', 'PartA_Weighted_Score', 'PartB_Raw_Score', 'PartB_Weighted_Score', 'Final_Confidential_Score',
  'Manager_Achievement_1', 'Manager_Objective_Score_1', 'Manager_Comment_1',
  'Manager_Achievement_2', 'Manager_Objective_Score_2', 'Manager_Comment_2',
  'Manager_Achievement_3', 'Manager_Objective_Score_3', 'Manager_Comment_3',
  'Manager_Achievement_4', 'Manager_Objective_Score_4', 'Manager_Comment_4',
  'GM_Achievement_1', 'GM_Objective_Score_1', 'GM_Comment_1',
  'GM_Achievement_2', 'GM_Objective_Score_2', 'GM_Comment_2',
  'GM_Achievement_3', 'GM_Objective_Score_3', 'GM_Comment_3',
  'GM_Achievement_4', 'GM_Objective_Score_4', 'GM_Comment_4',
  'Average_Objective_Score_1', 'MBO_Point_1',
  'Average_Objective_Score_2', 'MBO_Point_2',
  'Average_Objective_Score_3', 'MBO_Point_3',
  'Average_Objective_Score_4', 'MBO_Point_4',
  'Manager_Competency_Rating_1', 'GM_Competency_Rating_1', 'Manager_Competency_Comment_1', 'GM_Competency_Comment_1', 'Competency_Result_1',
  'Manager_Competency_Rating_2', 'GM_Competency_Rating_2', 'Manager_Competency_Comment_2', 'GM_Competency_Comment_2', 'Competency_Result_2',
  'Manager_Competency_Rating_3', 'GM_Competency_Rating_3', 'Manager_Competency_Comment_3', 'GM_Competency_Comment_3', 'Competency_Result_3',
  'Manager_Competency_Rating_4', 'GM_Competency_Rating_4', 'Manager_Competency_Comment_4', 'GM_Competency_Comment_4', 'Competency_Result_4',
  'Manager_Competency_Rating_5', 'GM_Competency_Rating_5', 'Manager_Competency_Comment_5', 'GM_Competency_Comment_5', 'Competency_Result_5',
  'Manager_Competency_Rating_6', 'GM_Competency_Rating_6', 'Manager_Competency_Comment_6', 'GM_Competency_Comment_6', 'Competency_Result_6'
];


  /**
 * Central Validation Engine for TTMET MBO V2
 */



class ValidationEngine {
  /**
   * Validate entire record based on current business stage
   */
  static validate(record, stage) {
    const errors = [];

    if (!record) {
      errors.push('ไม่พบข้อมูลแบบประเมิน MBO');
      return { isValid: false, errors };
    }

    if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      errors.push('ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)');
      return { isValid: false, errors };
    }

    // A. Employee Validation (Basic fields)
    const empCode = this._val(record.Employee_Code);
    if (!empCode) {
      errors.push('กรุณาระบุรหัสพนักงาน (Employee Code)');
    }

    const fy = this._val(record.Fiscal_Year);
    if (!fy) {
      errors.push('กรุณาระบุปีประเมิน (Fiscal Year)');
    }

    // B. Objectives Validation
    const countVal = parseInt(this._val(record.Objective_Count) || '2', 10);
    const count = isNaN(countVal) ? 2 : countVal;
    if (count < 2 || count > 4) {
      errors.push('จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 4 ข้อ');
    }

    let totalWeight = 0;
    for (let i = 1; i <= count; i++) {
      const obj = this._val(record[`Objective_${i}`]);
      const act = this._val(record[`Action_Plan_${i}`]);
      const wVal = parseFloat(this._val(record[`Weight_${i}`]) || '0');
      const diffVal = parseInt(this._val(record[`Difficulty_${i}`]) || '0', 10);

      if (!obj) {
        errors.push(`กรุณากรอก Objective ${i} ให้ครบถ้วน`);
      }
      if (!act) {
        errors.push(`กรุณากรอก Action Plan ${i} ให้ครบถ้วน`);
      }
      if (isNaN(wVal) || wVal <= 0) {
        errors.push(`กรุณาระบุน้ำหนัก Weight ${i} มากกว่า 0%`);
      } else {
        totalWeight += wVal;
      }
      if (isNaN(diffVal) || diffVal < 1 || diffVal > 4) {
        errors.push(`Difficulty Level ${i} ต้องอยู่ระหว่าง 1 ถึง 4`);
      }
    }

    if (Math.round(totalWeight) !== 100) {
      errors.push(`ผลรวม Weight ต้องเท่ากับ 100% (ปัจจุบัน: ${totalWeight}%)`);
    }

    // C. Mid-Year Validation (if in Mid-Year or later)
    if (stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      for (let i = 1; i <= count; i++) {
        const progVal = parseFloat(this._val(record[`Progress_Percent_${i}`]));
        const currentResult = this._val(record[`MidYear_Result_${i}`]);
        const periodical = this._val(record[`Periodical_Review_${i}`]);

        if (isNaN(progVal) || progVal < 0 || progVal > 100) {
          errors.push(`กรุณาระบุ Progress % ${i} ระหว่าง 0 ถึง 100%`);
        }
        if (!currentResult && !periodical) {
          errors.push(`กรุณากรอกผลการดำเนินงาน Mid-Year หรือ Periodical Review ของ Objective ${i}`);
        }
      }
    }

    // D. Self Evaluation Validation (if in Self Evaluation stage)
    if (stage === BUSINESS_STAGES.SELF_EVALUATION) {
      for (let i = 1; i <= count; i++) {
        const actual = this._val(record[`Actual_Result_${i}`]);
        const selfAchVal = parseInt(this._val(record[`Self_Achievement_${i}`]) || '0', 10);

        if (!actual) {
          errors.push(`กรุณากรอก Actual Result สำหรับ Objective ${i}`);
        }
        if (isNaN(selfAchVal) || selfAchVal < 1 || selfAchVal > 5) {
          errors.push(`กรุณาระบุ Self Achievement Level ${i} (1-5)`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static _val(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) {
      return field.value !== null && field.value !== undefined ? String(field.value).trim() : '';
    }
    return String(field).trim();
  }
}


  /**
 * Employee Part A UI Renderer
 */



class EmployeePartAUI {
  constructor(options = {}) {
    this.container = options.container;
    this.record = options.record || {};
    this.stage = options.stage || BUSINESS_STAGES.READ_ONLY;
    this.isEditable = options.isEditable || false;
    this.onFieldChange = options.onFieldChange || (() => {});
    this.onLookupEmployee = options.onLookupEmployee || (() => {});
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'mbo-root';

    if (this.stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      root.appendChild(this._renderErrorBanner('ไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)'));
      this.container.appendChild(root);
      return;
    }

    // 1. Header Section
    root.appendChild(this._renderHeader());

    // 2. Hoshin Section
    root.appendChild(this._renderHoshin());

    // 3. Stage Navigation
    root.appendChild(this._renderStageNav());

    // 4. Part A Objectives Section
    root.appendChild(this._renderPartA());

    this.container.appendChild(root);
    this._updateTotalWeightDisplay();
  }

  _renderErrorBanner(msg) {
    const banner = document.createElement('div');
    banner.className = 'mbo-alert-banner mbo-alert-error';
    banner.innerHTML = `⚠️ <span>${msg}</span>`;
    return banner;
  }

  _renderHeader() {
    const card = document.createElement('div');
    card.className = 'mbo-header-card';

    const fy = this._getVal('Fiscal_Year') || 'FY2026';
    const status = this._getVal('Status') || 'Draft Objective';

    card.innerHTML = `
      <div class="mbo-title-bar">
        <h1 class="mbo-main-title">
          Management By Objectives for Staff & Chief
          <span class="mbo-fy-badge">${fy}</span>
        </h1>
        <div class="mbo-status-badge">${status}</div>
      </div>
      <div class="mbo-profile-grid">
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Emp. ID</span>
          <div class="mbo-profile-value" id="mbo-header-emp-code">${this._getVal('Employee_Code') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Name - Surname</span>
          <div class="mbo-profile-value" id="mbo-header-emp-name">${this._getVal('Employee_Name') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Section</span>
          <div class="mbo-profile-value" id="mbo-header-emp-section">${this._getVal('Employee_Section') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Position</span>
          <div class="mbo-profile-value" id="mbo-header-emp-position">${this._getVal('Employee_Position') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Department</span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept">${this._getVal('Employee_Department') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Start Date</span>
          <div class="mbo-profile-value" id="mbo-header-emp-start-date">${this._getVal('Employee_Start_Date') || '-'}</div>
        </div>
      </div>
    `;
    return card;
  }

  _renderHoshin() {
    const grid = document.createElement('div');
    grid.className = 'mbo-hoshin-grid';

    grid.innerHTML = `
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">Department's Hoshin</h2>
        <div class="mbo-hoshin-content">${this._getVal('Department_Hoshin') || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">Section's Hoshin</h2>
        <div class="mbo-hoshin-content">${this._getVal('Section_Hoshin') || '(No Section Hoshin set)'}</div>
      </div>
    `;
    return grid;
  }

  _renderStageNav() {
    const nav = document.createElement('div');
    nav.className = 'mbo-stage-nav';

    const isObj = this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT;
    const isMid = this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;
    const isSelf = this.stage === BUSINESS_STAGES.SELF_EVALUATION;

    const step1Class = isObj ? 'active' : 'completed';
    const step2Class = isMid ? 'active' : (isSelf ? 'completed' : 'locked');
    const step3Class = isSelf ? 'active' : 'locked';

    nav.innerHTML = `
      <div class="mbo-stage-step ${step1Class}">1. Set up Objectives & Action Plan</div>
      <div class="mbo-stage-step ${step2Class}">2. Mid-Year Progress & Review</div>
      <div class="mbo-stage-step ${step3Class}">3. Year-End Self Evaluation</div>
    `;
    return nav;
  }

  _renderPartA() {
    const partContainer = document.createElement('div');

    const countVal = parseInt(this._getVal('Objective_Count') || '2', 10);
    const count = isNaN(countVal) ? 2 : Math.min(Math.max(countVal, 2), 4);

    const header = document.createElement('div');
    header.className = 'mbo-part-header';
    header.innerHTML = `
      <span>PART A : MBO (Management By Objectives)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>Number of Objectives:</span>
        ${this.isEditable && this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT ? `
          <select id="mbo-obj-count-select" class="mbo-select" style="width: 70px; height: 30px; font-size: 13px; padding: 2px 6px;">
            <option value="2" ${count === 2 ? 'selected' : ''}>2</option>
            <option value="3" ${count === 3 ? 'selected' : ''}>3</option>
            <option value="4" ${count === 4 ? 'selected' : ''}>4</option>
          </select>
        ` : `<strong>${count} Objectives</strong>`}
      </div>
    `;
    partContainer.appendChild(header);

    // Render Objective cards
    for (let i = 1; i <= count; i++) {
      partContainer.appendChild(this._renderObjectiveCard(i));
    }

    // Total Weight Summary
    partContainer.appendChild(this._renderWeightSummary());

    return partContainer;
  }

  _renderObjectiveCard(i) {
    const card = document.createElement('div');
    card.className = 'mbo-objective-card';

    const isObjEditable = this.isEditable && this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT;
    const isMidEditable = this.isEditable && this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;
    const isSelfEditable = this.isEditable && this.stage === BUSINESS_STAGES.SELF_EVALUATION;

    const objVal = this._getVal(`Objective_${i}`);
    const actVal = this._getVal(`Action_Plan_${i}`);
    const addVal = this._getVal(`Additional_Agreement_${i}`);
    const wVal = this._getVal(`Weight_${i}`);
    const diffVal = this._getVal(`Difficulty_${i}`) || '3';

    card.innerHTML = `
      <div class="mbo-obj-title">
        <span>📌 Objective ${i}</span>
      </div>

      <div class="mbo-field-group">
        <label class="mbo-field-label">Objective <span class="req">*</span></label>
        <textarea class="mbo-textarea mbo-field" data-code="Objective_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="Indicate expected result and target...">${objVal}</textarea>
      </div>

      <div class="mbo-field-group">
        <label class="mbo-field-label">Action Plan <span class="req">*</span></label>
        <textarea class="mbo-textarea mbo-field" data-code="Action_Plan_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="Indicate activities to achieve objective...">${actVal}</textarea>
      </div>

      <div class="mbo-field-group">
        <label class="mbo-field-label">Additional Agreement / Comment</label>
        <textarea class="mbo-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="Any specific agreement...">${addVal}</textarea>
      </div>

      <div class="mbo-row-2col">
        <div class="mbo-field-group">
          <label class="mbo-field-label">Weight (%) <span class="req">*</span></label>
          <input type="number" min="1" max="100" class="mbo-input mbo-field mbo-weight-input" data-code="Weight_${i}" value="${wVal}" ${!isObjEditable ? 'readonly' : ''} placeholder="e.g. 30" />
        </div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">Difficulty Level [1-4] <span class="req">*</span></label>
          ${isObjEditable ? `
            <select class="mbo-select mbo-field" data-code="Difficulty_${i}">
              <option value="1" ${diffVal === '1' ? 'selected' : ''}>1 (Normal)</option>
              <option value="2" ${diffVal === '2' ? 'selected' : ''}>2 (Moderate)</option>
              <option value="3" ${diffVal === '3' ? 'selected' : ''}>3 (Challenging)</option>
              <option value="4" ${diffVal === '4' ? 'selected' : ''}>4 (Highly Difficult)</option>
            </select>
          ` : `
            <input type="text" class="mbo-input" value="Difficulty Level: ${diffVal}" readonly />
          `}
        </div>
      </div>
    `;

    // Render Mid-Year block if Stage is Mid-Year or later
    if (this.stage === BUSINESS_STAGES.MIDYEAR_INPUT || this.stage === BUSINESS_STAGES.SELF_EVALUATION || this.stage === BUSINESS_STAGES.READ_ONLY) {
      const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || '0', 10);
      const midBlock = document.createElement('div');
      midBlock.className = 'mbo-midyear-block';
      midBlock.innerHTML = `
        <div style="font-weight: 700; color: #0369a1; margin-bottom: 8px; font-size: 14px;">⏳ Mid-Year Review (Objective ${i})</div>
        <div class="mbo-field-group">
          <div style="display: flex; justify-content: space-between;">
            <label class="mbo-field-label">Progress (%): <strong>${prog}%</strong></label>
          </div>
          ${isMidEditable ? `
            <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width:100%; cursor:pointer;" />
          ` : ''}
          <div class="mbo-progress-bar-container">
            <div class="mbo-progress-bar-fill" style="width: ${prog}%;"></div>
          </div>
        </div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">Periodical Review by Appraisee</label>
          <textarea class="mbo-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Review notes by appraisee...">${this._getVal(`Periodical_Review_${i}`)}</textarea>
        </div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">Current Result</label>
          <textarea class="mbo-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Current milestone achievements...">${this._getVal(`MidYear_Result_${i}`)}</textarea>
        </div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">Issue / Risk & Next Action</label>
          <textarea class="mbo-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Risks or next steps...">${this._getVal(`MidYear_Issue_Risk_${i}`)}</textarea>
        </div>
      `;
      card.appendChild(midBlock);
    }

    // Render Self Evaluation block if Stage is Self Evaluation or later
    if (this.stage === BUSINESS_STAGES.SELF_EVALUATION || this.stage === BUSINESS_STAGES.READ_ONLY) {
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '3';
      const selfBlock = document.createElement('div');
      selfBlock.className = 'mbo-selfeval-block';
      selfBlock.innerHTML = `
        <div style="font-weight: 700; color: #6d28d9; margin-bottom: 8px; font-size: 14px;">🎯 Year-End Self Evaluation (Objective ${i})</div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">Actual Result <span class="req">*</span></label>
          <textarea class="mbo-textarea mbo-field" data-code="Actual_Result_${i}" ${!isSelfEditable ? 'readonly' : ''} placeholder="Summary of actual results achieved...">${this._getVal(`Actual_Result_${i}`)}</textarea>
        </div>
        <div class="mbo-row-2col">
          <div class="mbo-field-group">
            <label class="mbo-field-label">Self Achievement Level [1-5] <span class="req">*</span></label>
            ${isSelfEditable ? `
              <select class="mbo-select mbo-field" data-code="Self_Achievement_${i}">
                <option value="1" ${selfAch === '1' ? 'selected' : ''}>1 (Far Below Target)</option>
                <option value="2" ${selfAch === '2' ? 'selected' : ''}>2 (Below Target)</option>
                <option value="3" ${selfAch === '3' ? 'selected' : ''}>3 (Met Target)</option>
                <option value="4" ${selfAch === '4' ? 'selected' : ''}>4 (Exceeded Target)</option>
                <option value="5" ${selfAch === '5' ? 'selected' : ''}>5 (Far Exceeded Target)</option>
              </select>
            ` : `
              <input type="text" class="mbo-input" value="Self Achievement: ${selfAch}" readonly />
            `}
          </div>
          <div class="mbo-field-group">
            <label class="mbo-field-label">Self Comment</label>
            <input type="text" class="mbo-input mbo-field" data-code="Self_Comment_${i}" value="${this._getVal(`Self_Comment_${i}`)}" ${!isSelfEditable ? 'readonly' : ''} placeholder="Self reflection..." />
          </div>
        </div>
      `;
      card.appendChild(selfBlock);
    }

    // Attach event listeners
    card.querySelectorAll('.mbo-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const code = e.target.dataset.code;
        const val = e.target.value;
        this._setVal(code, val);
        this.onFieldChange(code, val);
        if (code.startsWith('Weight_')) {
          this._updateTotalWeightDisplay();
        }
        if (code.startsWith('Progress_Percent_')) {
          const fill = e.target.closest('.mbo-midyear-block')?.querySelector('.mbo-progress-bar-fill');
          if (fill) fill.style.width = `${val}%`;
          const lbl = e.target.closest('.mbo-field-group')?.querySelector('label strong');
          if (lbl) lbl.textContent = `${val}%`;
        }
      });
    });

    return card;
  }

  _renderWeightSummary() {
    const summary = document.createElement('div');
    summary.id = 'mbo-weight-summary-box';
    summary.className = 'mbo-weight-summary valid';
    summary.innerHTML = `
      <div class="mbo-weight-text" id="mbo-weight-calc-text">Total Weight: 0%</div>
      <div class="mbo-weight-status" id="mbo-weight-calc-status">Checking...</div>
    `;
    return summary;
  }

  _updateTotalWeightDisplay() {
    const countVal = parseInt(this._getVal('Objective_Count') || '2', 10);
    const count = isNaN(countVal) ? 2 : countVal;

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

    txt.textContent = `Total Weight: ${parts.join(' + ')} = ${total}%`;
    if (Math.round(total) === 100) {
      box.className = 'mbo-weight-summary valid';
      st.innerHTML = '✅ สมบูรณ์ (Total Weight เท่ากับ 100%)';
    } else {
      box.className = 'mbo-weight-summary invalid';
      st.innerHTML = `⚠️ ต้องเท่ากับ 100% (ขาด/เกิน ${Math.abs(100 - total)}%)`;
    }
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
    if (!this.record[code]) {
      this.record[code] = { value: val };
    } else if (typeof this.record[code] === 'object') {
      this.record[code].value = val;
    } else {
      this.record[code] = val;
    }
  }
}


  /**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */







(function () {
  'use strict';

  if (typeof kintone === 'undefined') return;

  const MBO_APP_ID = kintone.app.getId();
  const ROUTING_APP_ID = 795;

  function hideAllNativeFields(record) {
    // Hide all configured custom fields from native form
    Object.keys(record).forEach(code => {
      try {
        kintone.app.record.setFieldShown(code, false);
      } catch (e) {
        // ignore system fields that cannot be hidden
      }
    });
  }

  function getBusinessStage(record) {
    const status = record?.Status?.value || '';
    if (STATUS_TO_STAGE_MAP[status] !== undefined) {
      return STATUS_TO_STAGE_MAP[status];
    }
    return BUSINESS_STAGES.CONFIGURATION_ERROR;
  }

  // Hook 1: Record Show (Detail, Edit, Create)
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show', 'app.record.create.show'], function (event) {
    const record = event.record;
    const isCreate = event.type === 'app.record.create.show';
    const isEdit = event.type === 'app.record.edit.show';
    const isDetail = event.type === 'app.record.detail.show';

    hideAllNativeFields(record);

    const headerSpace = kintone.app.record.getHeaderSpaceElement();
    if (!headerSpace) return event;

    const stage = getBusinessStage(record);

    const ui = new EmployeePartAUI({
      container: headerSpace,
      record: record,
      stage: stage,
      isEditable: isCreate || isEdit,
      onFieldChange: (code, val) => {
        // sync to record state
      }
    });

    ui.render();
    return event;
  });

  // Hook 2: Record Submit (Create & Edit)
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], function (event) {
    const record = event.record;
    const stage = getBusinessStage(record);

    // Always ensure Record_Key is generated: FY + Code
    const fy = record.Fiscal_Year?.value || 'FY2026';
    const code = record.Employee_Code?.value || '';
    if (fy && code) {
      record.Record_Key.value = `${fy}-${code}`;
    }

    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      event.error = validation.errors.join('\n');
      return event;
    }

    return event;
  });

  // Hook 3: Process Action (Workflow Proceed)
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const record = event.record;
    const stage = getBusinessStage(record);

    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      alert('⚠️ ไม่สามารถดำเนินการได้ เนื่องจากข้อมูลยังไม่ครบถ้วน:\n\n' + validation.errors.join('\n'));
      return false; // Cancel transition
    }

    return event;
  });

})();


})();
