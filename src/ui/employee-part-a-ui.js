/**
 * Employee Part A UI Renderer with Field State Highlights
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & UX Field State Specification
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

    // 1. Header Section (Profile)
    root.appendChild(this._renderHeader());

    // 2. Legend / State Indicator Bar (คำอธิบายสถานะช่องข้อมูล)
    root.appendChild(this._renderLegend());

    // 3. Rating Guidelines Reference
    root.appendChild(this._renderGuidelines());

    // 4. Hoshin Section (2 Columns)
    root.appendChild(this._renderHoshin());

    // 5. Stage Navigation
    root.appendChild(this._renderStageNav());

    // 6. Part A Objectives Section
    root.appendChild(this._renderPartA());

    this.container.appendChild(root);
    this._updateTotalWeightDisplay();
    this._refreshAllFieldHighlights(root);
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
        <input type="text" id="mbo-lookup-emp-input" class="mbo-input mbo-field-state-editable" placeholder="กรอกรหัสพนักงาน เช่น 0149..." value="${this._getVal('Employee_Code')}" style="flex: 1;" />
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

    const fy = this._getVal('Fiscal_Year') || "FY'2026";
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
          <span class="mbo-profile-label">Emp. ID <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <div class="mbo-profile-value" id="mbo-header-emp-code">${this._getVal('Employee_Code') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Name - Surname <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <div class="mbo-profile-value" id="mbo-header-emp-name">${this._getVal('Employee_Name') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Section <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <div class="mbo-profile-value" id="mbo-header-emp-section">${this._getVal('Employee_Section') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Position <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <div class="mbo-profile-value" id="mbo-header-emp-position">${this._getVal('Employee_Position') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Department <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept">${this._getVal('Employee_Department') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Start Date <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <div class="mbo-profile-value" id="mbo-header-emp-start-date">${this._getVal('Employee_Start_Date') || '-'}</div>
        </div>
      </div>
    `;
    return card;
  }

  _renderLegend() {
    const card = document.createElement('div');
    card.className = 'mbo-legend-card';
    card.innerHTML = `
      <div class="mbo-legend-title">
        📌 <strong>คำอธิบายสถานะช่องข้อมูล (Field State Key)</strong>
      </div>
      <div class="mbo-legend-items">
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-editable">✏️ สีเขียวอ่อน</span>
          <span>กรอกได้ในขั้นตอนนี้</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-required">⚠️ สีเหลืองอ่อน</span>
          <span>จำเป็นต้องกรอก (ยังว่างอยู่)</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-system">🏢 สีฟ้าอ่อน</span>
          <span>ข้อมูลอ้างอิงจากระบบ (App 53 / Hoshin)</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-locked">🔒 สีเทาอ่อน</span>
          <span>ระบบล็อก / อ่านอย่างเดียว</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-error">❌ สีแดงอ่อน</span>
          <span>ข้อมูลไม่ครบหรือผิดเงื่อนไข</span>
        </div>
      </div>
    `;
    return card;
  }

  _renderGuidelines() {
    const box = document.createElement('div');
    box.className = 'mbo-guideline-card';
    box.innerHTML = `
      <div class="mbo-guideline-title">📖 Rating Scale Guidelines (เกณฑ์ระดับความยากและระดับผลงานจากแบบฟอร์มเดิม)</div>
      <div class="mbo-guideline-grid">
        <div class="mbo-guideline-item">
          <strong>Difficulty Level [1-4]:</strong><br/>
          • <strong>Level 4:</strong> Challenging obj. requires sustainable effort and resources<br/>
          • <strong>Level 3:</strong> Difficult obj. with much effort<br/>
          • <strong>Level 2:</strong> Achievable obj. normal circumstances<br/>
          • <strong>Level 1:</strong> Objective easily achievable
        </div>
        <div class="mbo-guideline-item">
          <strong>Achievement Level [1-5]:</strong><br/>
          • <strong>Level 5:</strong> Make remarkable / highest achievement result<br/>
          • <strong>Level 4:</strong> Present exceeding expected achievement result<br/>
          • <strong>Level 3:</strong> Fully meet expected achievement result<br/>
          • <strong>Level 2:</strong> Partially meet expected achievement result<br/>
          • <strong>Level 1:</strong> Rarely meet expected achievement result
        </div>
      </div>
    `;
    return box;
  }

  _renderHoshin() {
    const grid = document.createElement('div');
    grid.className = 'mbo-hoshin-grid';

    grid.innerHTML = `
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>Department's Hoshin <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <span class="mbo-hoshin-subtitle">(Set up by Dept. Manager)</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${this._getVal('Department_Hoshin') || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>Section's Hoshin <span class="mbo-state-badge mbo-badge-system">🏢 ข้อมูลจากระบบ</span></span>
          <span class="mbo-hoshin-subtitle">(Set up by Sect. Manager)</span>
        </h2>
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
      <div class="mbo-stage-step ${step1Class}">
        1. Set up Objectives & Action Plan ${isObj ? '🔥 [ขั้นตอนปัจจุบัน]' : (isMid || isSelf ? '✅' : '')}
      </div>
      <div class="mbo-stage-step ${step2Class}">
        2. Mid-Year Progress & Review ${isMid ? '🔥 [ขั้นตอนปัจจุบัน]' : (isSelf ? '✅' : (isObj ? '🔒' : ''))}
      </div>
      <div class="mbo-stage-step ${step3Class}">
        3. Year-End Self Evaluation ${isSelf ? '🔥 [ขั้นตอนปัจจุบัน]' : '🔒'}
      </div>
    `;
    return nav;
  }

  _renderPartA() {
    const partContainer = document.createElement('div');

    const countVal = parseInt(this._getVal('Objective_Count') || '2', 10);
    const count = isNaN(countVal) ? 2 : Math.min(Math.max(countVal, 2), 4);

    const isObjEditable = this.isEditable && this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT;

    const header = document.createElement('div');
    header.className = 'mbo-part-header';
    header.innerHTML = `
      <span>Part A : MBO (Management By Objectives)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>Number of Objectives:</span>
        ${isObjEditable ? `
          <select id="mbo-obj-count-select" class="mbo-select" style="width: 70px; height: 30px; font-size: 13px; padding: 2px 6px; background: #ffffff;">
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
        ${isObjEditable ? '<span class="mbo-state-badge mbo-badge-editable">✏️ กรอกได้ในขั้นตอนนี้</span>' : '<span class="mbo-state-badge mbo-badge-locked">🔒 บันทึกเป้าหมายแล้ว (ระบบล็อก)</span>'}
      </div>

      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Objectives (Indicate expected result and target) <span class="req">*</span>
            <span class="mbo-field-state-tag" data-target="Objective_${i}"></span>
          </span>
          <span class="mbo-field-hint">[ระบุเป้าหมายและผลลัพธ์ที่ต้องการ]</span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="Indicate expected result and target...">${objVal}</textarea>
      </div>

      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Action Plan (Indicate activities to be carried out) <span class="req">*</span>
            <span class="mbo-field-state-tag" data-target="Action_Plan_${i}"></span>
          </span>
          <span class="mbo-field-hint">[ระบุกิจกรรมและแผนงานเพื่อบรรลุเป้าหมาย]</span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="Indicate activities to achieve objective...">${actVal}</textarea>
      </div>

      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Additional agreement / Comment
            <span class="mbo-field-state-tag" data-target="Additional_Agreement_${i}"></span>
          </span>
          <span class="mbo-field-hint">[ข้อตกลงเพิ่มเติมหรือความเห็น]</span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="Any specific agreement...">${addVal}</textarea>
      </div>

      <div class="mbo-row-2col">
        <div class="mbo-field-group">
          <label class="mbo-field-label">
            <span>Weight [A] (%) <span class="req">*</span>
              <span class="mbo-field-state-tag" data-target="Weight_${i}"></span>
            </span>
            <span class="mbo-field-hint">[น้ำหนักร้อยละ]</span>
          </label>
          <input type="number" min="1" max="100" class="mbo-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${wVal}" ${!isObjEditable ? 'readonly' : ''} placeholder="e.g. 30" />
        </div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">
            <span>Difficulty Level [1-4] <span class="req">*</span>
              <span class="mbo-field-state-tag" data-target="Difficulty_${i}"></span>
            </span>
            <span class="mbo-field-hint">[ระดับความยาก]</span>
          </label>
          ${isObjEditable ? `
            <select class="mbo-select mbo-field" data-code="Difficulty_${i}">
              <option value="1" ${diffVal === '1' ? 'selected' : ''}>Level 1 : Objective easily achievable</option>
              <option value="2" ${diffVal === '2' ? 'selected' : ''}>Level 2 : Achievable obj. normal circumstances</option>
              <option value="3" ${diffVal === '3' ? 'selected' : ''}>Level 3 : Difficult obj. with much effort</option>
              <option value="4" ${diffVal === '4' ? 'selected' : ''}>Level 4 : Challenging obj. requires sustainable effort</option>
            </select>
          ` : `
            <input type="text" class="mbo-input mbo-field-state-locked" value="Difficulty Level: ${diffVal}" readonly />
          `}
        </div>
      </div>
    `;

    // Render Mid-Year block
    const isMidActiveOrPast = this.stage === BUSINESS_STAGES.MIDYEAR_INPUT || this.stage === BUSINESS_STAGES.SELF_EVALUATION || this.stage === BUSINESS_STAGES.READ_ONLY;
    const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || '0', 10);
    const midBlock = document.createElement('div');
    midBlock.className = `mbo-midyear-block ${!isMidEditable ? 'section-locked' : ''}`;
    midBlock.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #0369a1; font-size: 14px;">⏳ Periodical Review by Appraisee (Mid-Year Progress for Objective ${i})</div>
        ${isMidEditable ? '<span class="mbo-state-badge mbo-badge-editable">✏️ กรอกได้ในขั้นตอนนี้</span>' : (isMidActiveOrPast ? '<span class="mbo-state-badge mbo-badge-locked">🔒 ผ่านขั้นตอนแล้ว (ระบบล็อก)</span>' : '<span class="mbo-state-badge mbo-badge-locked">🔒 ยังไม่ถึงขั้นตอนนี้</span>')}
      </div>
      <div class="mbo-field-group">
        <div style="display: flex; justify-content: space-between;">
          <label class="mbo-field-label">
            <span>Progress (%): <strong>${prog}%</strong></span>
          </label>
        </div>
        ${isMidEditable ? `
          <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width:100%; cursor:pointer;" />
        ` : ''}
        <div class="mbo-progress-bar-container">
          <div class="mbo-progress-bar-fill" style="width: ${prog}%;"></div>
        </div>
      </div>
      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Periodical Review / Notes by Appraisee
            <span class="mbo-field-state-tag" data-target="Periodical_Review_${i}"></span>
          </span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Review notes by appraisee...">${this._getVal(`Periodical_Review_${i}`)}</textarea>
      </div>
      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Current Result
            <span class="mbo-field-state-tag" data-target="MidYear_Result_${i}"></span>
          </span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Current milestone achievements...">${this._getVal(`MidYear_Result_${i}`)}</textarea>
      </div>
      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Issue / Risk & Next Action
            <span class="mbo-field-state-tag" data-target="MidYear_Issue_Risk_${i}"></span>
          </span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Risks or next steps...">${this._getVal(`MidYear_Issue_Risk_${i}`)}</textarea>
      </div>
    `;
    card.appendChild(midBlock);

    // Render Self Evaluation block
    const isSelfActiveOrPast = this.stage === BUSINESS_STAGES.SELF_EVALUATION || this.stage === BUSINESS_STAGES.READ_ONLY;
    const selfAch = this._getVal(`Self_Achievement_${i}`) || '3';
    const selfBlock = document.createElement('div');
    selfBlock.className = `mbo-selfeval-block ${!isSelfEditable ? 'section-locked' : ''}`;
    selfBlock.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #b45309; font-size: 14px;">🎯 Year-End Self Evaluation (Objective ${i})</div>
        ${isSelfEditable ? '<span class="mbo-state-badge mbo-badge-editable">✏️ กรอกได้ในขั้นตอนนี้</span>' : (isSelfActiveOrPast ? '<span class="mbo-state-badge mbo-badge-locked">🔒 บันทึกแล้ว (ระบบล็อก)</span>' : '<span class="mbo-state-badge mbo-badge-locked">🔒 ยังไม่ถึงขั้นตอนนี้</span>')}
      </div>
      <div class="mbo-field-group">
        <label class="mbo-field-label">
          <span>Actual Result & Achievement <span class="req">*</span>
            <span class="mbo-field-state-tag" data-target="Actual_Result_${i}"></span>
          </span>
          <span class="mbo-field-hint">[ผลการปฏิบัติงานจริงเมื่อสิ้นสุดรอบประเมิน]</span>
        </label>
        <textarea class="mbo-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} placeholder="Summary of actual results achieved...">${this._getVal(`Actual_Result_${i}`)}</textarea>
      </div>
      <div class="mbo-row-2col">
        <div class="mbo-field-group">
          <label class="mbo-field-label">
            <span>Achievement Level [1-5] <span class="req">*</span>
              <span class="mbo-field-state-tag" data-target="Self_Achievement_${i}"></span>
            </span>
            <span class="mbo-field-hint">[ระดับผลสำเร็จตามเกณฑ์]</span>
          </label>
          ${isSelfEditable ? `
            <select class="mbo-select mbo-field" data-code="Self_Achievement_${i}">
              <option value="1" ${selfAch === '1' ? 'selected' : ''}>Level 1 : Rarely meet expected achievement result</option>
              <option value="2" ${selfAch === '2' ? 'selected' : ''}>Level 2 : Partially meet expected achievement result</option>
              <option value="3" ${selfAch === '3' ? 'selected' : ''}>Level 3 : Fully meet expected achievement result</option>
              <option value="4" ${selfAch === '4' ? 'selected' : ''}>Level 4 : Present exceeding expected achievement result</option>
              <option value="5" ${selfAch === '5' ? 'selected' : ''}>Level 5 : Make remarkable / highest achievement result</option>
            </select>
          ` : `
            <input type="text" class="mbo-input mbo-field-state-locked" value="Self Achievement: Level ${selfAch}" readonly />
          `}
        </div>
        <div class="mbo-field-group">
          <label class="mbo-field-label">
            <span>Self Comment / Reflection
              <span class="mbo-field-state-tag" data-target="Self_Comment_${i}"></span>
            </span>
            <span class="mbo-field-hint">[ความเห็นประกอบการประเมินตนเอง]</span>
          </label>
          <input type="text" class="mbo-input mbo-field" data-code="Self_Comment_${i}" value="${this._getVal(`Self_Comment_${i}`)}" ${!isSelfEditable ? 'readonly' : ''} placeholder="Self reflection..." />
        </div>
      </div>
    `;
    card.appendChild(selfBlock);

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
        this._refreshSingleFieldHighlight(e.target, root);

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

    // Remove old classes
    input.classList.remove(
      'mbo-field-state-editable',
      'mbo-field-state-required-empty',
      'mbo-field-state-locked',
      'mbo-field-state-error'
    );

    const tagEl = root.querySelector(`.mbo-field-state-tag[data-target="${code}"]`);

    if (isReadonly) {
      input.classList.add('mbo-field-state-locked');
      if (tagEl) tagEl.innerHTML = '<span class="mbo-state-badge mbo-badge-locked">🔒 ระบบล็อก</span>';
    } else {
      if (isRequired && !val) {
        input.classList.add('mbo-field-state-required-empty');
        if (tagEl) tagEl.innerHTML = '<span class="mbo-state-badge mbo-badge-required">⚠️ จำเป็นต้องกรอก</span>';
      } else {
        input.classList.add('mbo-field-state-editable');
        if (tagEl) tagEl.innerHTML = '<span class="mbo-state-badge mbo-badge-editable">✏️ กรอกได้</span>';
      }
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
      st.innerHTML = `❌ ไม่ถูกต้อง: ผลรวมต้องเท่ากับ 100% (ขาด/เกิน ${Math.abs(100 - total)}%)`;
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
