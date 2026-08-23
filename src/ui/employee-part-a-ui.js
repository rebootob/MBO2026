/**
 * Employee Part A UI Renderer
 */

import { BUSINESS_STAGES } from '../config/constants.js';

export class EmployeePartAUI {
  constructor(options = {}) {
    this.container = options.container;
    this.record = options.record || {};
    this.stage = options.stage || BUSINESS_STAGES.READ_ONLY;
    this.isEditable = options.isEditable || false;
    this.isCreate = options.isCreate || false;
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

    // Lookup Banner on Create
    if (this.isCreate) {
      root.appendChild(this._renderLookupSection());
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
    this._bindEvents(root);
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
    box.style.borderTopColor = '#059669';
    box.style.background = '#f0fdf4';
    box.innerHTML = `
      <div style="font-size: 14px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
        🔍 Employee Lookup (ค้นหาและเลือกข้อมูลพนักงานจาก App 53)
      </div>
      <div style="display: flex; gap: 10px; align-items: center; max-width: 600px;">
        <input type="text" id="mbo-lookup-emp-input" class="mbo-input" placeholder="กรอกรหัสพนักงาน เช่น 0149..." value="${this._getVal('Employee_Code')}" style="flex: 1;" />
        <button type="button" id="mbo-lookup-btn" style="background: #059669; color: white; border: none; padding: 0 16px; height: 38px; border-radius: 4px; font-weight: 600; cursor: pointer;">
          ค้นหาพนักงาน
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
    const status = this._getVal('Status') || '01 Draft Objective';

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
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${this._getVal('Department_Hoshin') || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">Section's Hoshin</h2>
        <div class="mbo-hoshin-content" id="mbo-sec-hoshin-view">${this._getVal('Section_Hoshin') || '(No Section Hoshin set)'}</div>
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

  _bindEvents(root) {
    // Input changes
    root.querySelectorAll('.mbo-field').forEach(input => {
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

    // Objective count selector
    const countSelect = root.querySelector('#mbo-obj-count-select');
    if (countSelect) {
      countSelect.addEventListener('change', (e) => {
        const count = e.target.value;
        this._setVal('Objective_Count', count);
        this.onFieldChange('Objective_Count', count);
        this.render();
      });
    }

    // Lookup button
    const lookupBtn = root.querySelector('#mbo-lookup-btn');
    const lookupInput = root.querySelector('#mbo-lookup-emp-input');
    if (lookupBtn && lookupInput) {
      lookupBtn.addEventListener('click', async () => {
        const code = lookupInput.value.trim();
        const msgEl = root.querySelector('#mbo-lookup-msg');
        if (!code) {
          if (msgEl) msgEl.innerHTML = '<span style="color: #dc2626;">กรุณาระบุรหัสพนักงาน</span>';
          return;
        }
        if (msgEl) msgEl.innerHTML = '<span style="color: #0369a1;">กำลังค้นหา...</span>';
        try {
          await this.onLookupEmployee(code);
          if (msgEl) msgEl.innerHTML = '<span style="color: #059669;">✅ พบข้อมูลพนักงานและดึงข้อมูลเรียบร้อยแล้ว</span>';
          this.render();
        } catch (err) {
          if (msgEl) msgEl.innerHTML = `<span style="color: #dc2626;">❌ ${err.message}</span>`;
        }
      });
    }
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
