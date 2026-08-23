
(function() {
  'use strict';

  /**
 * MBO System Constants & Enums
 */

const BUSINESS_STAGES = {
  NEW_RECORD: 'NEW_RECORD',
  OBJECTIVE_INPUT: 'OBJECTIVE_INPUT',
  MIDYEAR_INPUT: 'MIDYEAR_INPUT',
  SELF_EVALUATION: 'SELF_EVALUATION',
  READ_ONLY: 'READ_ONLY',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

const STATUS_TO_STAGE_MAP = {
  '01 Draft Objective': BUSINESS_STAGES.OBJECTIVE_INPUT,
  '02 First Manager Objective Review': BUSINESS_STAGES.READ_ONLY,
  '03 Manager Objective Review': BUSINESS_STAGES.READ_ONLY,
  '04 GM Objective Review': BUSINESS_STAGES.READ_ONLY,
  '05 Objective Approved': BUSINESS_STAGES.READ_ONLY,
  '06 Employee Mid-Year': BUSINESS_STAGES.MIDYEAR_INPUT,
  '07 First Manager Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '08 Manager Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '09 GM Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '10 Mid-Year Approved': BUSINESS_STAGES.READ_ONLY,
  '11 Employee Self Evaluation': BUSINESS_STAGES.SELF_EVALUATION,
  '12 First Manager Evaluation': BUSINESS_STAGES.READ_ONLY,
  '13 Manager Evaluation': BUSINESS_STAGES.READ_ONLY,
  '14 GM Evaluation': BUSINESS_STAGES.READ_ONLY,
  '15 Evaluation Completed': BUSINESS_STAGES.READ_ONLY,
  '16 Completed': BUSINESS_STAGES.READ_ONLY
};

const CONFIDENTIAL_FIELDS = [
  "Manager_Achievement_1",
  "GM_Achievement_1",
  "Manager_Objective_Score_1",
  "GM_Objective_Score_1",
  "Manager_Comment_1",
  "GM_Comment_1",
  "Average_Objective_Score_1",
  "MBO_Point_1",
  "Manager_Achievement_2",
  "GM_Achievement_2",
  "Manager_Objective_Score_2",
  "GM_Objective_Score_2",
  "Manager_Comment_2",
  "GM_Comment_2",
  "Average_Objective_Score_2",
  "MBO_Point_2",
  "Manager_Achievement_3",
  "GM_Achievement_3",
  "Manager_Objective_Score_3",
  "GM_Objective_Score_3",
  "Manager_Comment_3",
  "GM_Comment_3",
  "Average_Objective_Score_3",
  "MBO_Point_3",
  "Manager_Achievement_4",
  "GM_Achievement_4",
  "Manager_Objective_Score_4",
  "GM_Objective_Score_4",
  "Manager_Comment_4",
  "GM_Comment_4",
  "Average_Objective_Score_4",
  "MBO_Point_4",
  "Manager_Achievement_5",
  "GM_Achievement_5",
  "Manager_Objective_Score_5",
  "GM_Objective_Score_5",
  "Manager_Comment_5",
  "GM_Comment_5",
  "Average_Objective_Score_5",
  "MBO_Point_5",
  "Manager_Achievement_6",
  "GM_Achievement_6",
  "Manager_Objective_Score_6",
  "GM_Objective_Score_6",
  "Manager_Comment_6",
  "GM_Comment_6",
  "Average_Objective_Score_6",
  "MBO_Point_6",
  "Manager_Achievement_7",
  "GM_Achievement_7",
  "Manager_Objective_Score_7",
  "GM_Objective_Score_7",
  "Manager_Comment_7",
  "GM_Comment_7",
  "Average_Objective_Score_7",
  "MBO_Point_7",
  "Manager_Achievement_8",
  "GM_Achievement_8",
  "Manager_Objective_Score_8",
  "GM_Objective_Score_8",
  "Manager_Comment_8",
  "GM_Comment_8",
  "Average_Objective_Score_8",
  "MBO_Point_8",
  "Manager_Achievement_9",
  "GM_Achievement_9",
  "Manager_Objective_Score_9",
  "GM_Objective_Score_9",
  "Manager_Comment_9",
  "GM_Comment_9",
  "Average_Objective_Score_9",
  "MBO_Point_9",
  "Manager_Achievement_10",
  "GM_Achievement_10",
  "Manager_Objective_Score_10",
  "GM_Objective_Score_10",
  "Manager_Comment_10",
  "GM_Comment_10",
  "Average_Objective_Score_10",
  "MBO_Point_10",
  "Manager_Competency_Rating_1",
  "GM_Competency_Rating_1",
  "Manager_Competency_Comment_1",
  "GM_Competency_Comment_1",
  "Competency_Result_1",
  "Manager_Competency_Rating_2",
  "GM_Competency_Rating_2",
  "Manager_Competency_Comment_2",
  "GM_Competency_Comment_2",
  "Competency_Result_2",
  "Manager_Competency_Rating_3",
  "GM_Competency_Rating_3",
  "Manager_Competency_Comment_3",
  "GM_Competency_Comment_3",
  "Competency_Result_3",
  "Manager_Competency_Rating_4",
  "GM_Competency_Rating_4",
  "Manager_Competency_Comment_4",
  "GM_Competency_Comment_4",
  "Competency_Result_4",
  "Manager_Competency_Rating_5",
  "GM_Competency_Rating_5",
  "Manager_Competency_Comment_5",
  "GM_Competency_Comment_5",
  "Competency_Result_5",
  "Manager_Competency_Rating_6",
  "GM_Competency_Rating_6",
  "Manager_Competency_Comment_6",
  "GM_Competency_Comment_6",
  "Competency_Result_6",
  "PartA_Raw_Score",
  "PartA_Weighted_Score",
  "PartB_Raw_Score",
  "PartB_Weighted_Score",
  "Final_Confidential_Score",
  "Final_Grade"
];

/**
 * Build deterministic Record Key preserving leading zeroes
 * @param {string} fiscalYear e.g. "FY2026"
 * @param {string} employeeCode e.g. "0149"
 * @returns {string} e.g. "FY2026-0149"
 */
function buildRecordKey(fiscalYear, employeeCode) {
  const fy = String(fiscalYear || '').trim();
  const emp = String(employeeCode || '').trim();
  if (!fy || !emp) {
    return '';
  }
  return `${fy}-${emp}`;
}


  /**
 * Safe Host Resolver for Kintone Record UI
 */

function getRecordUiHost(preferredSpaceId = 'SPACE_HEADER') {
  if (typeof kintone === 'undefined' || !kintone.app || !kintone.app.record) {
    return null;
  }

  // 1. Try specified Space Field
  if (typeof kintone.app.record.getSpaceElement === 'function') {
    const spaceEl = kintone.app.record.getSpaceElement(preferredSpaceId);
    if (spaceEl) return spaceEl;

    // Fallback space IDs
    const fallbackSpaceIds = ['SPACE_HEADER', 'SPACE_MBO_ROOT', 'SPACE_PART_A'];
    for (const id of fallbackSpaceIds) {
      if (id !== preferredSpaceId) {
        const el = kintone.app.record.getSpaceElement(id);
        if (el) return el;
      }
    }
  }

  // 2. Fallback: Record Header Menu Space Element
  if (typeof kintone.app.record.getHeaderMenuSpaceElement === 'function') {
    const menuEl = kintone.app.record.getHeaderMenuSpaceElement();
    if (menuEl) return menuEl;
  }

  return null;
}


  /**
 * Business Rule Validation Engine (Bilingual Thai / English + Field-level errors)
 */



class ValidationEngine {
  /**
   * Validate record against stage business rules
   * @param {Object} record Kintone record object
   * @param {string} stage Current business stage
   * @returns {Object} { isValid: boolean, fieldErrors: Array<{field: string, messageTH: string, messageEN: string, message: string}>, errors: string[] }
   */
  static validate(record, stage) {
    const fieldErrors = [];

    if (!record) {
      fieldErrors.push({
        field: 'RECORD',
        messageTH: 'ไม่พบข้อมูล Record',
        messageEN: 'Record data not found',
        message: 'ไม่พบข้อมูล Record\nRecord data not found'
      });
      return this._formatResult(fieldErrors);
    }

    if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      fieldErrors.push({
        field: 'SYSTEM',
        messageTH: 'ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)',
        messageEN: 'Unable to identify workflow stage. Please contact HR / Administrator.',
        message: 'ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)\nUnable to identify workflow stage. Please contact HR / Administrator.'
      });
      return this._formatResult(fieldErrors);
    }

    if (stage === BUSINESS_STAGES.READ_ONLY) {
      return this._formatResult([]);
    }

    // Common checks
    const empCode = this._val(record.Employee_Code);
    if (!empCode) {
      fieldErrors.push({
        field: 'Employee_Code',
        messageTH: 'กรุณาระบุรหัสพนักงานและกดค้นหา',
        messageEN: 'Please enter Employee Code and search',
        message: 'กรุณาระบุรหัสพนักงานและกดค้นหา\nPlease enter Employee Code and search'
      });
    }

    const empName = this._val(record.Employee_Name);
    if (!empName) {
      fieldErrors.push({
        field: 'Employee_Code',
        messageTH: 'กรุณากดค้นหาและยืนยันข้อมูลพนักงานก่อนบันทึก',
        messageEN: 'Please search and verify employee profile before saving',
        message: 'กรุณากดค้นหาและยืนยันข้อมูลพนักงานก่อนบันทึก\nPlease search and verify employee profile before saving'
      });
    }

    const fy = this._val(record.Fiscal_Year);
    if (!fy) {
      fieldErrors.push({
        field: 'Fiscal_Year',
        messageTH: 'กรุณาระบุรอบการประเมิน (Fiscal Year)',
        messageEN: 'Please enter Fiscal Year',
        message: 'กรุณาระบุรอบการประเมิน (Fiscal Year)\nPlease enter Fiscal Year'
      });
    }

    const objCount = parseInt(this._val(record.Objective_Count) || '4', 10);
    if (isNaN(objCount) || objCount < 2 || objCount > 10) {
      fieldErrors.push({
        field: 'Objective_Count',
        messageTH: 'จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ',
        messageEN: 'Objective Count must be between 2 and 10',
        message: 'จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ\nObjective Count must be between 2 and 10'
      });
      return this._formatResult(fieldErrors);
    }

    // Stage 1: OBJECTIVE_INPUT or NEW_RECORD (Create Submit validates objectives)
    if (stage === BUSINESS_STAGES.OBJECTIVE_INPUT || stage === BUSINESS_STAGES.NEW_RECORD) {
      let totalWeight = 0;

      for (let i = 1; i <= objCount; i++) {
        const obj = this._val(record[`Objective_${i}`]);
        const plan = this._val(record[`Action_Plan_${i}`]);
        const weightVal = this._val(record[`Weight_${i}`]);
        const weight = parseFloat(weightVal || '0');
        const diffVal = this._val(record[`Difficulty_${i}`]);
        const diff = parseInt(diffVal, 10);

        if (!obj) {
          fieldErrors.push({
            field: `Objective_${i}`,
            messageTH: `กรุณาระบุเป้าหมายข้อที่ ${i}`,
            messageEN: `Please enter Objective ${i}`,
            message: `กรุณาระบุเป้าหมายข้อที่ ${i}\nPlease enter Objective ${i}`
          });
        }
        if (!plan) {
          fieldErrors.push({
            field: `Action_Plan_${i}`,
            messageTH: `กรุณาระบุแผนปฏิบัติการข้อที่ ${i}`,
            messageEN: `Please enter Action Plan ${i}`,
            message: `กรุณาระบุแผนปฏิบัติการข้อที่ ${i}\nPlease enter Action Plan ${i}`
          });
        }
        if (!weightVal || isNaN(weight) || weight <= 0 || weight > 100) {
          fieldErrors.push({
            field: `Weight_${i}`,
            messageTH: `กรุณาระบุน้ำหนักข้อที่ ${i} (1 - 100%)`,
            messageEN: `Please enter Weight ${i} (1 - 100%)`,
            message: `กรุณาระบุน้ำหนักข้อที่ ${i} (1 - 100%)\nPlease enter Weight ${i} (1 - 100%)`
          });
        } else {
          totalWeight += weight;
        }
        if (!diffVal || isNaN(diff) || diff < 1 || diff > 4) {
          fieldErrors.push({
            field: `Difficulty_${i}`,
            messageTH: `กรุณาเลือกระดับความยากข้อที่ ${i} (1 - 4)`,
            messageEN: `Please select Difficulty Level ${i} (1 - 4)`,
            message: `กรุณาเลือกระดับความยากข้อที่ ${i} (1 - 4)\nPlease select Difficulty Level ${i} (1 - 4)`
          });
        }
      }

      if (Math.round(totalWeight) !== 100) {
        fieldErrors.push({
          field: 'Total_Weight',
          messageTH: `ผลรวมน้ำหนักต้องเท่ากับ 100% (ปัจจุบันได้ ${totalWeight}%)`,
          messageEN: `Total Weight must equal 100% (Currently ${totalWeight}%)`,
          message: `ผลรวมน้ำหนักต้องเท่ากับ 100% (ปัจจุบันได้ ${totalWeight}%)\nTotal Weight must equal 100% (Currently ${totalWeight}%)`
        });
      }
    }

    // Stage 2: MIDYEAR_INPUT
    if (stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      for (let i = 1; i <= objCount; i++) {
        const progVal = this._val(record[`Progress_Percent_${i}`]);
        const prog = parseFloat(progVal || '0');
        if (progVal === '' || isNaN(prog) || prog < 0 || prog > 100) {
          fieldErrors.push({
            field: `Progress_Percent_${i}`,
            messageTH: `กรุณาระบุความคืบหน้า % ข้อที่ ${i} (0 - 100%)`,
            messageEN: `Please enter Progress % ${i} (0 - 100%)`,
            message: `กรุณาระบุความคืบหน้า % ข้อที่ ${i} (0 - 100%)\nPlease enter Progress % ${i} (0 - 100%)`
          });
        }
      }
    }

    // Stage 3: SELF_EVALUATION
    if (stage === BUSINESS_STAGES.SELF_EVALUATION) {
      for (let i = 1; i <= objCount; i++) {
        const actual = this._val(record[`Actual_Result_${i}`]);
        const achVal = this._val(record[`Self_Achievement_${i}`]);
        const ach = parseInt(achVal, 10);

        if (!actual) {
          fieldErrors.push({
            field: `Actual_Result_${i}`,
            messageTH: `กรุณาระบุผลการดำเนินงานจริงข้อที่ ${i}`,
            messageEN: `Please enter Actual Result ${i}`,
            message: `กรุณาระบุผลการดำเนินงานจริงข้อที่ ${i}\nPlease enter Actual Result ${i}`
          });
        }
        if (!achVal || isNaN(ach) || ach < 1 || ach > 5) {
          fieldErrors.push({
            field: `Self_Achievement_${i}`,
            messageTH: `กรุณาเลือกระดับผลสำเร็จข้อที่ ${i} (1 - 5)`,
            messageEN: `Please select Self Achievement ${i} (1 - 5)`,
            message: `กรุณาเลือกระดับผลสำเร็จข้อที่ ${i} (1 - 5)\nPlease select Self Achievement ${i} (1 - 5)`
          });
        }
      }
    }

    return this._formatResult(fieldErrors);
  }

  static _formatResult(fieldErrors) {
    return {
      isValid: fieldErrors.length === 0,
      fieldErrors: fieldErrors,
      errors: fieldErrors.map(e => e.message)
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
 * Employee Service - Read-only lookup from App 53 (Employee Namelist)
 */

class EmployeeService {
  /**
   * Lookup employee by Employee Code in App 53 (Read-Only)
   * Supports leading zero code input e.g. "0149" -> queries Number in App 53
   * @param {string} empCode
   * @param {Object} kintoneApi
   * @returns {Object} snapshot profile
   */
  static async lookupEmployee(empCode, kintoneApi) {
    const cleanCode = String(empCode || '').trim();
    if (!cleanCode) {
      throw new Error('กรุณาระบุรหัสพนักงาน\nPlease enter Employee Code');
    }

    const numVal = parseInt(cleanCode, 10);
    const query = !isNaN(numVal)
      ? `(Number = "${numVal}" or Number = "${cleanCode}") limit 2`
      : `Number = "${cleanCode}" limit 2`;

    const resp = await kintoneApi.getRecords(53, query);
    const records = resp?.records || [];

    if (records.length === 0) {
      throw new Error(`ไม่พบข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master\nEmployee code ${cleanCode} was not found in Employee Master (App 53)`);
    }

    if (records.length > 1) {
      throw new Error(`พบรหัสพนักงาน ${cleanCode} ซ้ำซ้อนในระบบ Employee Master กรุณาติดต่อ HR / Administrator\nDuplicate employee code ${cleanCode} found. Please contact HR / Administrator.`);
    }

    const emp = records[0];
    return {
      Employee_Code: cleanCode, // Preserve leading zero string representation
      Employee_Name: emp.Text?.value || '',
      Employee_Name_TH: emp.Text_0?.value || '',
      Employee_Section: emp.Drop_down?.value || '',
      Employee_Department: emp.Drop_down_0?.value || '',
      Employee_Position: emp.Text_2?.value || '',
      Employee_Email: emp.Text_4?.value || '',
      Employee_Start_Date: emp.Date?.value || '',
      Department_Hoshin: emp.Text_area?.value || '',
      Section_Hoshin: emp.Text_area_0?.value || ''
    };
  }

  /**
   * Check for duplicate MBO in App 794 for Fiscal Year + Employee Code
   */
  static async checkDuplicateMBO(mboAppId, fiscalYear, empCode, currentRecordId, kintoneApi) {
    const cleanCode = String(empCode || '').trim();
    const cleanFY = String(fiscalYear || '').trim();
    if (!cleanCode || !cleanFY) return;

    let query = `Fiscal_Year = "${cleanFY}" and Employee_Code = "${cleanCode}"`;
    if (currentRecordId) {
      query += ` and $id != "${currentRecordId}"`;
    }

    const resp = await kintoneApi.getRecords(mboAppId, query);
    if (resp?.records?.length > 0) {
      throw new Error(`พนักงานรหัส ${cleanCode} มี MBO สำหรับ ${cleanFY} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้\nEmployee ${cleanCode} already has an MBO record for ${cleanFY}. Duplicate creation is blocked.`);
    }
  }
}


  /**
 * Routing Service - App 795 Routing Master Validator & Topology Resolver
 */

class RoutingService {
  /**
   * Validate current user access and resolve sequential routing topology from App 795
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} loginUserCode
   * @param {Object} kintoneApi
   * @returns {Object} Full Sequential Routing Profile
   */
  static async validateRequesterAccess(routingAppId, sectionCode, loginUserCode, kintoneApi) {
    const cleanSection = String(sectionCode || '').trim();
    if (!cleanSection) {
      throw new Error('ไม่พบข้อมูล Section ของพนักงาน กรุณาตรวจสอบ Employee Master (App 53)\nEmployee section is missing in Employee Master.');
    }

    const query = `Section_Code = "${cleanSection}" and Active in ("Active") limit 2`;
    const resp = await kintoneApi.getRecords(routingAppId, query);
    const records = resp?.records || [];

    if (records.length === 0) {
      throw new Error(`ไม่พบการตั้งค่า Routing สำหรับ Section ${cleanSection} ใน Routing Master (App 795) กรุณาติดต่อ HR / Administrator\nRouting configuration for section ${cleanSection} was not found in Routing Master.`);
    }

    const route = records[0];
    const requesters = route.Requester_User?.value || [];
    const isAuthorized = requesters.some(u => u.code === loginUserCode) || loginUserCode === 'Administrator' || loginUserCode === 'admin-form';

    if (!isAuthorized) {
      throw new Error(`บัญชีนี้ (${loginUserCode}) ไม่มีสิทธิ์สร้าง MBO สำหรับพนักงานใน Section ${cleanSection}\nThis account (${loginUserCode}) is not authorized to create an MBO for section ${cleanSection}.`);
    }

    // Resolve Manager Levels (support new sequential model with fallback to legacy)
    const mgrL1 = route.Manager_Level1_Approvers?.value?.length > 0
      ? route.Manager_Level1_Approvers.value
      : (route.Manager_User?.value || []);
    const mgrL1Rule = route.Manager_Level1_Approval_Rule?.value || 'ALL';

    const mgrL2 = route.Manager_Level2_Approvers?.value || [];
    const mgrL2Rule = route.Manager_Level2_Approval_Rule?.value || 'ALL';

    // Resolve GM Levels
    const gmL1 = route.GM_Level1_Approvers?.value?.length > 0
      ? route.GM_Level1_Approvers.value
      : (route.GM_User?.value || []);
    const gmL1Rule = route.GM_Level1_Approval_Rule?.value || 'ALL';

    const gmL2 = route.GM_Level2_Approvers?.value || [];
    const gmL2Rule = route.GM_Level2_Approval_Rule?.value || 'ALL';

    const hasMgrL2 = mgrL2.length > 0;
    const hasGmL2 = gmL2.length > 0;

    // Topology: e.g. M1_G1, M1_M2_G1, M1_G1_G2, M1_M2_G1_G2
    let topology = 'M1_G1';
    if (hasMgrL2 && hasGmL2) {
      topology = 'M1_M2_G1_G2';
    } else if (hasMgrL2) {
      topology = 'M1_M2_G1';
    } else if (hasGmL2) {
      topology = 'M1_G1_G2';
    }

    return {
      Requester_User: requesters,
      Manager_Level1_Approvers: mgrL1,
      Manager_Level1_Approval_Rule: mgrL1Rule,
      Manager_Level2_Approvers: mgrL2,
      Manager_Level2_Approval_Rule: mgrL2Rule,
      GM_Level1_Approvers: gmL1,
      GM_Level1_Approval_Rule: gmL1Rule,
      GM_Level2_Approvers: gmL2,
      GM_Level2_Approval_Rule: gmL2Rule,
      Has_Manager_Level2: hasMgrL2 ? 'Yes' : 'No',
      Has_GM_Level2: hasGmL2 ? 'Yes' : 'No',
      Routing_Topology: topology,
      // Legacy backwards compatibility
      Manager_User: mgrL1,
      First_Manager_User: mgrL2,
      GM_User: gmL1
    };
  }
}


  /**
 * Employee Part A UI Renderer - Bilingual Spreadsheet Grid
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & Bilingual Specification
 */



class EmployeePartAUI {
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

    // Verification state on Create
    this.isEmployeeVerified = !this.isCreate || !!(this._getVal('Employee_Name') && this._getVal('Employee_Section'));
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

    // STEP 2: Header Section (Horizontal Summary)
    root.appendChild(this._renderHeader());

    // Legend / State Indicator Bar (Bilingual)
    root.appendChild(this._renderLegend());

    // Rating Guidelines Reference
    root.appendChild(this._renderGuidelines());

    // Custom Error Summary Area (Top of Table)
    const errorSummaryContainer = document.createElement('div');
    errorSummaryContainer.id = 'mbo-error-summary-anchor';
    root.appendChild(errorSummaryContainer);

    // Hoshin Section (2 Columns Horizontal)
    root.appendChild(this._renderHoshin());

    // Stage Navigation (Bilingual)
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
          <button type="button" class="mbo-error-item-btn" data-field="${err.field}">
            <span class="mbo-error-item-num">${idx + 1}</span>
            <div class="mbo-error-item-text">
              <div>${err.messageTH}</div>
              <div class="en-sub">${err.messageEN}</div>
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
          tagEl.innerHTML = `
            <span class="mbo-cell-error-msg">
              ❌ ${err.messageTH}<br/>
              <span style="opacity: 0.85; font-size: 11px;">${err.messageEN}</span>
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
        <input type="text" id="mbo-lookup-emp-input" class="mbo-cell-input mbo-field-state-editable" placeholder="กรอกรหัสพนักงาน เช่น 0149 / Enter Employee ID..." value="${empCode}" style="flex: 1; font-weight: 600;" />
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

    card.innerHTML = `
      <div class="mbo-title-bar">
        <h1 class="mbo-main-title">
          แบบประเมินผลการปฏิบัติงาน / Management By Objectives for Staff & Chief
          <span class="mbo-fy-badge">${fy}</span>
        </h1>
        <div class="mbo-status-badge">${status}</div>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px;">
        STEP 2: ข้อมูลพนักงาน / Employee Information [🔵 ระบบ / System Data]
      </div>
      <div class="mbo-profile-grid-horizontal">
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">รหัส / Emp. ID</span>
          <div class="mbo-profile-value" id="mbo-header-emp-code" title="${this._getVal('Employee_Code')}">${this._getVal('Employee_Code') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ชื่อ-นามสกุล / Name</span>
          <div class="mbo-profile-value" id="mbo-header-emp-name" title="${this._getVal('Employee_Name')}">${this._getVal('Employee_Name') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ส่วนงาน / Section</span>
          <div class="mbo-profile-value" id="mbo-header-emp-section" title="${this._getVal('Employee_Section')}">${this._getVal('Employee_Section') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ตำแหน่ง / Position</span>
          <div class="mbo-profile-value" id="mbo-header-emp-position" title="${this._getVal('Employee_Position')}">${this._getVal('Employee_Position') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">แผนก / Department</span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept" title="${this._getVal('Employee_Department')}">${this._getVal('Employee_Department') || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">วันเริ่มงาน / Start Date</span>
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
      <div class="mbo-legend-title">📌 สถานะช่องข้อมูล / Field State Key:</div>
      <div class="mbo-legend-items">
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-editable">🟢 กรอกได้ / Editable</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-required">🟡 ต้องกรอก / Required</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-system">🔵 ข้อมูลจากระบบ / System Data</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-locked">⚪ ระบบล็อก / Locked</span>
        </div>
        <div class="mbo-legend-item">
          <span class="mbo-legend-chip mbo-chip-error">🔴 ไม่ถูกต้อง / Invalid</span>
        </div>
      </div>
    `;
    return card;
  }

  _renderGuidelines() {
    const box = document.createElement('div');
    box.className = 'mbo-guideline-card';
    box.innerHTML = `
      <div class="mbo-guideline-title">📖 เกณฑ์อ้างอิง / Rating Scale Guidelines</div>
      <div class="mbo-guideline-grid">
        <div class="mbo-guideline-item">
          <strong>ระดับความยาก / Difficulty Level [1-4]:</strong><br/>
          Level 4: Challenging (ท้าทายมาก) | Level 3: Difficult (ยาก) | Level 2: Achievable normal (ปานกลาง) | Level 1: Easily achievable (ง่าย)
        </div>
        <div class="mbo-guideline-item">
          <strong>ระดับผลงาน / Achievement Level [1-5]:</strong><br/>
          Level 5: Remarkable (สูงสุด) | Level 4: Exceeding (เกินเป้า) | Level 3: Fully meet (ตามเป้า) | Level 2: Partially meet (บางส่วน) | Level 1: Rarely meet (ต่ำกว่าเป้า)
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
          <span>เป้าหมายแผนก / Department's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Dept. Manager) [🔵 ระบบ / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${this._getVal('Department_Hoshin') || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>เป้าหมายส่วนงาน / Section's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Sect. Manager) [🔵 ระบบ / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-sec-hoshin-view">${this._getVal('Section_Hoshin') || '(No Section Hoshin set)'}</div>
      </div>
    `;
    return grid;
  }

  _renderStageNav() {
    const nav = document.createElement('div');
    nav.className = 'mbo-stage-nav';

    const isObj = this.isCreate || this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT || this.stage === BUSINESS_STAGES.NEW_RECORD;
    const isMid = this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;
    const isSelf = this.stage === BUSINESS_STAGES.SELF_EVALUATION;

    const step1Class = isObj ? 'active' : 'completed';
    const step2Class = isMid ? 'active' : (isSelf ? 'completed' : 'locked');
    const step3Class = isSelf ? 'active' : 'locked';

    nav.innerHTML = `
      <div class="mbo-stage-step ${step1Class}">
        1. ตั้งเป้าหมาย / Set up Objectives ${isObj ? '🔥 [Active]' : (isMid || isSelf ? '✅' : '')}
      </div>
      <div class="mbo-stage-step ${step2Class}">
        2. ทบทวนกลางปี / Mid-Year Progress ${isMid ? '🔥 [Active]' : (isSelf ? '✅' : (isObj ? '🔒' : ''))}
      </div>
      <div class="mbo-stage-step ${step3Class}">
        3. ประเมินตนเองปลายปี / Year-End Self Evaluation ${isSelf ? '🔥 [Active]' : '🔒'}
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
          <textarea class="mbo-cell-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุเป้าหมายและผลลัพธ์ / Indicate expected result and target...">${objVal}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุกิจกรรมและแผนงาน / Indicate activities to achieve objective...">${actVal}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} placeholder="ข้อตกลงเพิ่มเติม / Any agreement or comment...">${addVal}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </td>
        <td style="vertical-align: middle; text-align: center;">
          <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${wVal}" ${!isObjEditable ? 'readonly' : ''} style="text-align: center;" placeholder="30" />
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
          <textarea class="mbo-cell-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="บันทึกทบทวนผลงาน / Review notes...">${revVal}</textarea>
          <span class="mbo-cell-tag" data-target="Periodical_Review_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="ผลสำเร็จปัจจุบัน / Milestone results...">${resVal}</textarea>
          <span class="mbo-cell-tag" data-target="MidYear_Result_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} placeholder="ปัญหาและอุปสรรค / Risks & next action...">${riskVal}</textarea>
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
          <textarea class="mbo-cell-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} placeholder="ผลงานจริง / Summary of actual results...">${actResult}</textarea>
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
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${selfAch}" readonly />
          `}
          <span class="mbo-cell-tag" data-target="Self_Achievement_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? 'readonly' : ''} placeholder="ความเห็นประกอบ / Self reflection...">${selfComment}</textarea>
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
          await this.onLookupEmployee(code);
          this.isEmployeeVerified = true;
          this.clearValidationErrors();
          this.render();
        } catch (err) {
          this.isEmployeeVerified = false;
          if (msgEl) {
            const formattedMsg = String(err.message || '').replace(/\n/g, '<br/>');
            msgEl.innerHTML = `<div style="color: #dc2626; line-height: 1.4; padding: 6px 0;">❌ ${formattedMsg}</div>`;
          }
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


  /**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */








(function () {
  'use strict';

  if (typeof kintone === 'undefined') return;

  const ROUTING_APP_ID = 795;
  const EMPLOYEE_APP_ID = 53;

  let activeUiInstance = null;

  function getMboAppId() {
    return kintone.app.getId() || 794;
  }

  const kintoneApiWrapper = {
    getRecords: async (appId, query) => {
      const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {
        app: appId,
        query: query
      });
      return resp;
    }
  };

  function hideAllNativeFields(record) {
    Object.keys(record).forEach(code => {
      try {
        kintone.app.record.setFieldShown(code, false);
      } catch (e) {
        // ignore system fields that cannot be hidden
      }
    });
  }

  /**
   * Resolve Business Stage based on Event Type and Workflow Status
   * On Create: Returns NEW_RECORD without reading Process Management Status
   * On Edit/Detail: Reads Process Status from saved record
   */
  function resolveBusinessStage(event) {
    if (event.type === 'app.record.create.show' || event.type === 'app.record.create.submit') {
      return BUSINESS_STAGES.NEW_RECORD;
    }

    const status = event.record?.Status?.value || '';
    if (STATUS_TO_STAGE_MAP[status] !== undefined) {
      return STATUS_TO_STAGE_MAP[status];
    }
    return BUSINESS_STAGES.CONFIGURATION_ERROR;
  }

  /**
   * Safe sync to Kintone internal form state preserving field.type
   */
  function syncRecordToKintone(record) {
    try {
      if (typeof kintone.app.record.get === 'function' && typeof kintone.app.record.set === 'function') {
        const currentData = kintone.app.record.get();
        if (currentData && currentData.record) {
          Object.keys(record).forEach(k => {
            if (currentData.record[k] && record[k] && record[k].value !== undefined) {
              currentData.record[k].value = record[k].value;
            }
          });
          kintone.app.record.set(currentData);
        }
      }
    } catch (e) {
      console.warn('[MBO V2] syncRecordToKintone warning:', e);
    }
  }

  // Hook 1: Record Show (Detail, Edit, Create)
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show', 'app.record.create.show'], function (event) {
    const record = event.record;
    const isCreate = event.type === 'app.record.create.show';
    const isEdit = event.type === 'app.record.edit.show';
    const isDetail = event.type === 'app.record.detail.show';

    // 1. Resolve UI host element safely
    const uiHost = getRecordUiHost('SPACE_HEADER');
    if (!uiHost) {
      console.warn('[MBO V2] Custom UI host element not found. Retaining native form.');
      return event;
    }

    const stage = resolveBusinessStage(event);

    // Default Fiscal Year on Create - safely mutating .value only
    if (isCreate && record.Fiscal_Year && !record.Fiscal_Year.value) {
      record.Fiscal_Year.value = 'FY2026';
    }

    // 2. Instantiate and render Custom UI
    const ui = new EmployeePartAUI({
      container: uiHost,
      record: record,
      stage: stage,
      isEditable: isCreate || isEdit,
      isCreate: isCreate,
      onFieldChange: (code, val) => {
        if (record[code]) {
          record[code].value = val;
        }
        syncRecordToKintone(record);
      },
      onEmployeeCodeChanged: (newCode) => {
        // Safely reset snapshot fields without destroying .type
        const fieldsToClear = [
          'Employee_Name', 'Employee_Name_TH', 'Employee_Section',
          'Employee_Department', 'Employee_Position', 'Employee_Email',
          'Employee_Start_Date', 'Department_Hoshin', 'Section_Hoshin', 'Record_Key',
          'Manager_Level1_Approvers', 'Manager_Level2_Approvers',
          'GM_Level1_Approvers', 'GM_Level2_Approvers',
          'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology'
        ];
        if (record.Employee_Code) record.Employee_Code.value = newCode;
        fieldsToClear.forEach(k => {
          if (record[k]) record[k].value = '';
        });
        syncRecordToKintone(record);
      },
      onLookupEmployee: async (empCode) => {
        // Step 1: Employee Lookup from App 53 (Read-Only)
        const empProfile = await EmployeeService.lookupEmployee(empCode, kintoneApiWrapper);

        // Step 2: Routing Validation from App 795
        const loginUser = kintone.getLoginUser();
        const routing = await RoutingService.validateRequesterAccess(ROUTING_APP_ID, empProfile.Employee_Section, loginUser.code, kintoneApiWrapper);

        // Step 3: Record Key & Duplicate Check
        const fy = record.Fiscal_Year?.value || 'FY2026';
        const generatedKey = buildRecordKey(fy, empProfile.Employee_Code);
        await EmployeeService.checkDuplicateMBO(getMboAppId(), fy, empProfile.Employee_Code, record.$id?.value, kintoneApiWrapper);

        // Step 4: Snapshot data safely into record in-memory
        const fieldsToSync = {
          Employee_Code: empProfile.Employee_Code,
          Employee_Name: empProfile.Employee_Name,
          Employee_Name_TH: empProfile.Employee_Name_TH,
          Employee_Section: empProfile.Employee_Section,
          Employee_Department: empProfile.Employee_Department,
          Employee_Position: empProfile.Employee_Position,
          Employee_Email: empProfile.Employee_Email,
          Employee_Start_Date: empProfile.Employee_Start_Date,
          Department_Hoshin: empProfile.Department_Hoshin,
          Section_Hoshin: empProfile.Section_Hoshin,
          Requester_User: routing.Requester_User,
          Manager_Level1_Approvers: routing.Manager_Level1_Approvers,
          Manager_Level1_Approval_Rule: routing.Manager_Level1_Approval_Rule,
          Manager_Level2_Approvers: routing.Manager_Level2_Approvers,
          Manager_Level2_Approval_Rule: routing.Manager_Level2_Approval_Rule,
          GM_Level1_Approvers: routing.GM_Level1_Approvers,
          GM_Level1_Approval_Rule: routing.GM_Level1_Approval_Rule,
          GM_Level2_Approvers: routing.GM_Level2_Approvers,
          GM_Level2_Approval_Rule: routing.GM_Level2_Approval_Rule,
          Has_Manager_Level2: routing.Has_Manager_Level2,
          Has_GM_Level2: routing.Has_GM_Level2,
          Routing_Topology: routing.Routing_Topology,
          First_Manager_User: routing.First_Manager_User,
          Manager_User: routing.Manager_User,
          GM_User: routing.GM_User,
          Fiscal_Year: fy,
          Record_Key: generatedKey
        };

        Object.entries(fieldsToSync).forEach(([k, val]) => {
          if (record[k]) {
            record[k].value = val;
          }
        });

        // Push directly to Kintone Form State
        syncRecordToKintone(record);
      }
    });

    activeUiInstance = ui;

    try {
      ui.render();
      hideAllNativeFields(record);
    } catch (renderError) {
      console.error('[MBO V2] Error rendering custom UI:', renderError);
    }

    return event;
  });

  // Hook 2: Record Submit (Create & Edit) -> Uses return false and Inline Errors
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], async function (event) {
    const record = event.record;
    const isCreate = event.type === 'app.record.create.submit';
    const stage = resolveBusinessStage(event);

    // 1. Sync custom UI values to record
    if (activeUiInstance) {
      activeUiInstance.syncFromDom();
    }

    // 2. On Create: Must verify employee
    if (isCreate && activeUiInstance && !activeUiInstance.isEmployeeVerified) {
      activeUiInstance.showValidationErrors([{
        field: 'Employee_Code',
        messageTH: 'กรุณาระบุรหัสพนักงานและกดค้นหาเพื่อยืนยันข้อมูลก่อนบันทึก',
        messageEN: 'Please enter Employee Code and click Search to verify employee profile before saving.',
        message: 'กรุณาระบุรหัสพนักงานและกดค้นหาเพื่อยืนยันข้อมูลก่อนบันทึก'
      }]);
      return false;
    }

    // 3. Build and validate deterministic Record Key
    const fy = record.Fiscal_Year?.value || 'FY2026';
    const code = record.Employee_Code?.value || '';
    const recordKey = buildRecordKey(fy, code);

    if (!recordKey) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors([{
          field: 'Employee_Code',
          messageTH: 'ไม่สามารถสร้าง Record Key ได้ กรุณาระบุรหัสพนักงานและรอบการประเมิน',
          messageEN: 'Cannot generate Record Key. Please enter Employee Code and Fiscal Year.',
          message: 'ไม่สามารถสร้าง Record Key ได้ กรุณาระบุรหัสพนักงานและรอบการประเมิน'
        }]);
      }
      return false;
    }

    if (record.Record_Key) {
      record.Record_Key.value = recordKey;
    }

    // 4. Duplicate Check Guard
    try {
      const currentId = record.$id?.value;
      const query = `Record_Key = "${recordKey}" ${currentId ? `and $id != "${currentId}"` : ''}`;
      const duplicateRes = await kintoneApiWrapper.getRecords(getMboAppId(), query);
      if (duplicateRes.records && duplicateRes.records.length > 0) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: 'Employee_Code',
            messageTH: `พนักงานรหัส ${code} มี MBO สำหรับ ${fy} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้`,
            messageEN: `Employee ID ${code} already has an MBO record for ${fy}. Duplicate creation is blocked.`,
            message: `พนักงานรหัส ${code} มี MBO สำหรับ ${fy} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้`
          }]);
        }
        return false;
      }
    } catch (err) {
      console.error('[MBO V2] Duplicate check error:', err);
    }

    // 5. Stage Business Rule Validation
    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(validation.fieldErrors);
      }
      return false; // Cancel submit: NO native top error banner!
    }

    if (activeUiInstance) {
      activeUiInstance.clearValidationErrors();
    }

    return event;
  });

  // Hook 3: Process Action (Workflow Proceed)
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const record = event.record;
    const stage = resolveBusinessStage(event);

    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(validation.fieldErrors);
      }
      return false; // Cancel transition
    }

    return event;
  });

})();


})();
