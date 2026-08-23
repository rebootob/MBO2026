/**
 * Employee Part A UI Renderer - Spreadsheet Horizontal Grid View
 * 1 Objective = 1 Horizontal Row
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & Horizontal UX Specification
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

    // 1. Header Section (Horizontal Summary)
    root.appendChild(this._renderHeader());

    // 2. Legend / State Indicator Bar
    root.appendChild(this._renderLegend());

    // 3. Rating Guidelines Reference
    root.appendChild(this._renderGuidelines());

    // 4. Hoshin Section (2 Columns Horizontal)
    root.appendChild(this._renderHoshin());

    // 5. Stage Navigation
    root.appendChild(this._renderStageNav());

    // 6. Part A Spreadsheet Grid Table (1 Objective = 1 Row)
    root.appendChild(this._renderSpreadsheetTable());

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
        🔍 Employee Lookup (ค้นหาและดึงข้อมูลพนักงานจาก App 53)
      </div>
      <div style="display: flex; gap: 10px; align-items: center; max-width: 600px;">
        <input type="text" id="mbo-lookup-emp-input" class="mbo-cell-input mbo-field-state-editable" placeholder="กรอกรหัสพนักงาน เช่น 0149..." value="${this._getVal('Employee_Code')}" style="flex: 1;" />
        <button type="button" id="mbo-lookup-btn" style="background: #059669; color: white; border: none; padding: 0 16px; height: 36px; border-radius: 4px; font-weight: 600; cursor: pointer;">
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
      <div class="mbo-profile-grid-horizontal">
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Emp. ID</span>
          <div class="mbo-profile-value" id="mbo-header-emp-code" title="${this._getVal('Employee_Code')}">${this._getVal('Employee_Code') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Name - Surname</span>
          <div class="mbo-profile-value" id="mbo-header-emp-name" title="${this._getVal('Employee_Name')}">${this._getVal('Employee_Name') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Section</span>
          <div class="mbo-profile-value" id="mbo-header-emp-section" title="${this._getVal('Employee_Section')}">${this._getVal('Employee_Section') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Position</span>
          <div class="mbo-profile-value" id="mbo-header-emp-position" title="${this._getVal('Employee_Position')}">${this._getVal('Employee_Position') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Department</span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept" title="${this._getVal('Employee_Department')}">${this._getVal('Employee_Department') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">Start Date</span>
          <div class="mbo-profile-value" id="mbo-header-emp-start-date" title="${this._getVal('Employee_Start_Date')}">${this._getVal('Employee_Start_Date') || '-'}</div>
        </div>
      </div>
    `;
    return card;
  }

  _renderLegend() {
    const card = document.createElement('div');
    card.className = 'mbo-legend-card';
    card.innerHTML = `
      <div class="mbo-legend-title">📌 สถานะช่องข้อมูล:</div>
      <div class="mbo-legend-items">
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-editable">🟢 กรอกได้</span>
          <span>(ขั้นตอนนี้)</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-required">🟡 ต้องกรอก</span>
          <span>(ยังว่างอยู่)</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-system">🔵 ข้อมูลจากระบบ</span>
          <span>(App 53 / Hoshin)</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-locked">⚪ ระบบล็อก</span>
          <span>(อ่านอย่างเดียว)</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-error">🔴 ไม่ถูกต้อง</span>
          <span>(ผิดเงื่อนไข)</span>
        </div>
      </div>
    `;
    return card;
  }

  _renderGuidelines() {
    const box = document.createElement('div');
    box.className = 'mbo-guideline-card';
    box.innerHTML = `
      <div class="mbo-guideline-title">📖 Rating Scale Guidelines (เกณฑ์อ้างอิงจากแบบฟอร์มเดิม)</div>
      <div class="mbo-guideline-grid">
        <div class="mbo-guideline-item">
          <strong>Difficulty Level [1-4]:</strong>
          Level 4: Challenging | Level 3: Difficult | Level 2: Achievable normal | Level 1: Easily achievable
        </div>
        <div class="mbo-guideline-item">
          <strong>Achievement Level [1-5]:</strong>
          Level 5: Remarkable | Level 4: Exceeding | Level 3: Fully meet | Level 2: Partially meet | Level 1: Rarely meet
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
          <span>Department's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Dept. Manager) [🔵 ระบบ]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${this._getVal('Department_Hoshin') || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>Section's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Sect. Manager) [🔵 ระบบ]</span>
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
        1. Set up Objectives ${isObj ? '🔥 [Active]' : (isMid || isSelf ? '✅' : '')}
      </div>
      <div class="mbo-stage-step ${step2Class}">
        2. Mid-Year Progress ${isMid ? '🔥 [Active]' : (isSelf ? '✅' : (isObj ? '🔒' : ''))}
      </div>
      <div class="mbo-stage-step ${step3Class}">
        3. Year-End Self Evaluation ${isSelf ? '🔥 [Active]' : '🔒'}
      </div>
    `;
    return nav;
  }

  _renderSpreadsheetTable() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
    const count = isNaN(countVal) ? 2 : Math.min(Math.max(countVal, 2), 10);
    const isObjEditable = this.isEditable && this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT;

    // Header bar
    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>Part A : MBO Spreadsheet Grid (1 Objective = 1 Horizontal Row)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>Number of Objectives:</span>
        ${isObjEditable ? `
          <select id="mbo-obj-count-select" class="mbo-cell-select" style="width: 65px; height: 28px; font-size: 13px; padding: 2px 6px; background: #ffffff;">
            ${[2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        ` : `<strong>${count} Objectives</strong>`}
      </div>
    `;
    container.appendChild(bar);

    const table = document.createElement('table');
    table.className = 'mbo-grid-table';

    if (this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT) {
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">#</th>
            <th style="width: 32%;">
              Objectives (Expected result & target) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระบุเป้าหมายและผลลัพธ์ที่คาดหวัง]</span>
            </th>
            <th style="width: 32%;">
              Action Plan (Activities to achieve obj.) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระบุกิจกรรมและแผนงานเพื่อบรรลุเป้าหมาย]</span>
            </th>
            <th style="width: 18%;">
              Additional agreement / Comment
              <span class="th-sub">[ข้อตกลงเพิ่มเติม]</span>
            </th>
            <th style="width: 95px; text-align: center;">
              Weight (%) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[น้ำหนัก]</span>
            </th>
            <th style="width: 180px;">
              Difficulty Level [1-4] <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระดับความยาก]</span>
            </th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: count }, (_, idx) => this._renderObjectiveInputRow(idx + 1)).join('')}
        </tbody>
      `;
    } else if (this.stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">#</th>
            <th style="width: 25%;">
              Objective & Target <span style="color:#64748b;">[🔒 บันทึกแล้ว]</span>
              <span class="th-sub">[เป้าหมายที่ตั้งไว้]</span>
            </th>
            <th style="width: 140px;">
              Progress (%) <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ความคืบหน้า 0-100%]</span>
            </th>
            <th style="width: 22%;">
              Periodical Review by Appraisee
              <span class="th-sub">[บันทึกทบทวนผลงานกลางปี]</span>
            </th>
            <th style="width: 22%;">
              Current Result
              <span class="th-sub">[ผลสำเร็จปัจจุบัน]</span>
            </th>
            <th style="width: 22%;">
              Issue / Risk & Next Action
              <span class="th-sub">[ปัญหา อุปสรรค และแนวทางแก้ไข]</span>
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
              Objective & Target <span style="color:#64748b;">[🔒 บันทึกแล้ว]</span>
              <span class="th-sub">[เป้าหมายที่ตั้งไว้]</span>
            </th>
            <th style="width: 20%;">
              Mid-Year Summary <span style="color:#64748b;">[🔒 บันทึกแล้ว]</span>
              <span class="th-sub">[ผลทบทวนกลางปี]</span>
            </th>
            <th style="width: 26%;">
              Actual Result & Achievement <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ผลการปฏิบัติงานจริงเมื่อสิ้นสุดรอบประเมิน]</span>
            </th>
            <th style="width: 170px;">
              Self Achievement [1-5] <span style="color:#dc2626;">*</span>
              <span class="th-sub">[ระดับผลสำเร็จตามเกณฑ์]</span>
            </th>
            <th style="width: 20%;">
              Self Comment / Reflection
              <span class="th-sub">[ความเห็นประกอบการประเมินตนเอง]</span>
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
            <th style="width: 24%;">Objective & Action Plan</th>
            <th style="width: 80px; text-align: center;">Weight %</th>
            <th style="width: 90px; text-align: center;">Difficulty</th>
            <th style="width: 20%;">Mid-Year Review & Progress</th>
            <th style="width: 24%;">Actual Result</th>
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

  _renderObjectiveInputRow(i) {
    const isObjEditable = this.isEditable && this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT;
    const objVal = this._getVal(`Objective_${i}`);
    const actVal = this._getVal(`Action_Plan_${i}`);
    const addVal = this._getVal(`Additional_Agreement_${i}`);
    const wVal = this._getVal(`Weight_${i}`);
    const diffVal = this._getVal(`Difficulty_${i}`) || '3';

    return `
      <tr>
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="Indicate expected result and target...">${objVal}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="Indicate activities to achieve objective...">${actVal}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="Any agreement / comment...">${addVal}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </td>
        <td style="vertical-align: middle; text-align: center;">
          <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${wVal}" ${!isObjEditable ? 'readonly' : ''} style="text-align: center;" placeholder="30" />
          <span class="mbo-cell-tag" data-target="Weight_${i}"></span>
        </td>
        <td style="vertical-align: middle;">
          ${isObjEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Difficulty_${i}">
              <option value="1" ${diffVal === '1' ? 'selected' : ''}>1 : Normal</option>
              <option value="2" ${diffVal === '2' ? 'selected' : ''}>2 : Moderate</option>
              <option value="3" ${diffVal === '3' ? 'selected' : ''}>3 : Difficult</option>
              <option value="4" ${diffVal === '4' ? 'selected' : ''}>4 : Challenging</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${diffVal}" readonly />
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
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${objVal || '(No objective)'}</div>
          <div style="font-size: 12px; color: #475569; white-space: pre-wrap;">${actVal || ''}</div>
          <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: #0369a1;">Weight: ${wVal}%</div>
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
          <textarea class="mbo-cell-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Review notes...">${revVal}</textarea>
          <span class="mbo-cell-tag" data-target="Periodical_Review_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Milestone results...">${resVal}</textarea>
          <span class="mbo-cell-tag" data-target="MidYear_Result_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="Risks / next action...">${riskVal}</textarea>
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
          <div style="font-weight: 700; color: #0f172a;">${objVal || '(No objective)'}</div>
          <div style="margin-top: 4px; font-size: 11px; font-weight: 700; color: #0369a1;">Weight: ${wVal}%</div>
        </td>
        <td>
          <div style="font-size: 12px; font-weight: 600; color: #0369a1;">Mid-Year: ${prog}%</div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px; white-space: pre-wrap;">${midRes || '-'}</div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} placeholder="Summary of actual results...">${actResult}</textarea>
          <span class="mbo-cell-tag" data-target="Actual_Result_${i}"></span>
        </td>
        <td style="vertical-align: middle;">
          ${isSelfEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Self_Achievement_${i}">
              <option value="1" ${selfAch === '1' ? 'selected' : ''}>1 : Rarely meet</option>
              <option value="2" ${selfAch === '2' ? 'selected' : ''}>2 : Partially meet</option>
              <option value="3" ${selfAch === '3' ? 'selected' : ''}>3 : Fully meet</option>
              <option value="4" ${selfAch === '4' ? 'selected' : ''}>4 : Exceeded</option>
              <option value="5" ${selfAch === '5' ? 'selected' : ''}>5 : Remarkable</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${selfAch}" readonly />
          `}
          <span class="mbo-cell-tag" data-target="Self_Achievement_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? 'readonly' : ''} placeholder="Self reflection...">${selfComment}</textarea>
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
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${objVal || '-'}</div>
          <div style="font-size: 12px; color: #475569; white-space: pre-wrap;">${actVal || ''}</div>
        </td>
        <td style="text-align: center; vertical-align: middle; font-weight: 700;">${wVal}%</td>
        <td style="text-align: center; vertical-align: middle;">Level ${diffVal}</td>
        <td>
          <div style="font-size: 12px; font-weight: 700; color: #0369a1;">Progress: ${prog}%</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">${midRes || '-'}</div>
        </td>
        <td>
          <div style="font-size: 12px; color: #0f172a; white-space: pre-wrap;">${actResult || '-'}</div>
        </td>
        <td style="text-align: center; vertical-align: middle; font-weight: 700; color: #b45309;">Level ${selfAch}</td>
      </tr>
    `;
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

    input.classList.remove(
      'mbo-field-state-editable',
      'mbo-field-state-required-empty',
      'mbo-field-state-locked',
      'mbo-field-state-error'
    );

    const tagEl = root.querySelector(`.mbo-cell-tag[data-target="${code}"]`);

    if (isReadonly) {
      input.classList.add('mbo-field-state-locked');
      if (tagEl) tagEl.innerHTML = '<span style="color: #64748b;">⚪ [ล็อก]</span>';
    } else {
      if (isRequired && !val) {
        input.classList.add('mbo-field-state-required-empty');
        if (tagEl) tagEl.innerHTML = '<span style="color: #854d0e;">🟡 [ต้องกรอก]</span>';
      } else {
        input.classList.add('mbo-field-state-editable');
        if (tagEl) tagEl.innerHTML = '<span style="color: #166534;">🟢 [กรอกได้]</span>';
      }
    }
  }

  _updateTotalWeightDisplay() {
    const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
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
