/**
 * Business Rule Validation Engine (Bilingual Thai / English + Field-level errors)
 */

import { BUSINESS_STAGES } from '../config/constants.js';

export class ValidationEngine {
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
      const profileCode = this._val(record.Profile_Code);
      if (!profileCode) {
        fieldErrors.push({
          field: 'Employee_Code',
          messageTH: 'ไม่พบข้อมูล Profile Code ของพนักงาน กรุณากดค้นหาเพื่อระบุกลุ่มประเมิน',
          messageEN: 'Employee scoring profile code was not found. Please search to resolve profile.',
          message: 'ไม่พบข้อมูล Profile Code ของพนักงาน กรุณากดค้นหาเพื่อระบุกลุ่มประเมิน\nEmployee scoring profile code was not found. Please search to resolve profile.'
        });
      }

      const routingTopo = this._val(record.Routing_Topology);
      const requesterUserVal = record.Requester_User?.value;
      const hasRequester = Array.isArray(requesterUserVal) && requesterUserVal.length > 0;

      if (!routingTopo || !hasRequester) {
        fieldErrors.push({
          field: 'Employee_Code',
          messageTH: 'ไม่พบข้อมูล Routing ของพนักงาน กรุณากดค้นหาเพื่อระบุเส้นทางอนุมัติ',
          messageEN: 'Employee routing workflow was not found. Please search to resolve routing.',
          message: 'ไม่พบข้อมูล Routing ของพนักงาน กรุณากดค้นหาเพื่อระบุเส้นทางอนุมัติ\nEmployee routing workflow was not found. Please search to resolve routing.'
        });
      }

      // Automatically clear inactive rows so stale values do not leak into saved record
      this.clearInactiveRows(record);

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

  static clearInactiveRows(record) {
    if (!record) return;
    const objCount = parseInt(this._val(record.Objective_Count) || '4', 10);
    if (isNaN(objCount) || objCount < 2 || objCount > 10) return;

    for (let i = objCount + 1; i <= 10; i++) {
      const rowFields = [
        `Objective_${i}`, `Action_Plan_${i}`, `Weight_${i}`, `Difficulty_${i}`,
        `Progress_Percent_${i}`, `Actual_Result_${i}`, `Self_Achievement_${i}`,
        `Midyear_Comment_${i}`, `Appraiser_Achievement_${i}`, `Appraiser_Comment_${i}`
      ];
      rowFields.forEach(f => {
        if (record[f]) {
          if (typeof record[f] === 'object' && 'value' in record[f]) {
            record[f].value = '';
          } else {
            record[f] = '';
          }
        }
      });
    }
  }

  /**
   * Validate workflow action against record topology and assigned user fields
   * @param {Object} record Kintone record object
   * @param {string} actionName Name of process action (event.action?.value)
   * @param {string} stage Resolved business stage from STATUS_TO_STAGE_MAP
   * @returns {Object} { isValid: boolean, fieldErrors: Array, errors: string[] }
   */
  static validateWorkflowAction(record, actionName, stage) {
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
        field: 'Status',
        messageTH: 'สถานะขั้นตอนการทำงานไม่ถูกต้อง หรือไม่ตรงกับระบบ (CONFIGURATION_ERROR)',
        messageEN: 'Workflow status is invalid or unmapped (CONFIGURATION_ERROR)',
        message: 'สถานะขั้นตอนการทำงานไม่ถูกต้อง หรือไม่ตรงกับระบบ (CONFIGURATION_ERROR)\nWorkflow status is invalid or unmapped (CONFIGURATION_ERROR)'
      });
      return this._formatResult(fieldErrors);
    }

    const topology = this._val(record.Routing_Topology);
    const status = this._val(record.Status);

    // 1. Exact Topology Whitelist Guard
    const RECOGNIZED_TOPOLOGIES = ['M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2', 'M1_ONLY'];
    if (!topology || !RECOGNIZED_TOPOLOGIES.includes(topology)) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้องหรือยังไม่ได้ระบุ (UNKNOWN TOPOLOGY FAIL-CLOSED)`,
        messageEN: `Routing topology "${topology || 'BLANK'}" is invalid or unmapped.`,
        message: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้องหรือยังไม่ได้ระบุ (UNKNOWN TOPOLOGY FAIL-CLOSED)\nRouting topology "${topology || 'BLANK'}" is invalid or unmapped.`
      });
      return this._formatResult(fieldErrors);
    }

    // 2. G2 Topology Guard: Any G2 topology is NOT supported by current 16-state Process Management
    if (topology.includes('G2')) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: `เส้นทางการอนุมัติรูปแบบ ${topology} ยังไม่รองรับในระบบปัจจุบัน (G2 UNSUPPORTED CONFIGURATION ERROR)`,
        messageEN: `Routing topology ${topology} is not supported by current Process Management workflow.`,
        message: `เส้นทางการอนุมัติรูปแบบ ${topology} ยังไม่รองรับในระบบปัจจุบัน (G2 UNSUPPORTED CONFIGURATION ERROR)\nRouting topology ${topology} is not supported by current Process Management workflow.`
      });
      return this._formatResult(fieldErrors);
    }

    // 3. First-Manager source states guard (02, 07, 12 require M2 topology)
    const firstMgrStates = [
      '02 First Manager Objective Review',
      '07 First Manager Mid-Year Review',
      '12 First Manager Final Evaluation'
    ];
    if (firstMgrStates.includes(status) && !topology.includes('M2')) {
      fieldErrors.push({
        field: 'Status',
        messageTH: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี First Manager (M2 Topology) เท่านั้น`,
        messageEN: `Status ${status} is valid only for topologies containing First Manager (M2).`,
        message: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี First Manager (M2 Topology) เท่านั้น\nStatus ${status} is valid only for topologies containing First Manager (M2).`
      });
      return this._formatResult(fieldErrors);
    }

    const firstManagerSubmits = [
      'Submit Objective to First Manager',
      'Submit Mid-Year to First Manager',
      'Submit Final to First Manager'
    ];

    const directManagerSubmits = [
      'Submit Objective to Manager',
      'Submit Mid-Year to Manager',
      'Submit Final to Manager'
    ];

    const hasFirstManager = Array.isArray(record.First_Manager_User?.value) && record.First_Manager_User.value.length > 0;
    const hasManager = Array.isArray(record.Manager_User?.value) && record.Manager_User.value.length > 0;
    const hasGM = Array.isArray(record.GM_User?.value) && record.GM_User.value.length > 0;
    const hasRequester = Array.isArray(record.Requester_User?.value) && record.Requester_User.value.length > 0;

    // 4. First-Manager Submit Actions Guard
    if (firstManagerSubmits.includes(actionName)) {
      if (!topology.includes('M2')) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `การส่งรายการผ่าน First Manager (${actionName}) ไม่สามารถใช้ได้กับเส้นทาง ${topology || 'Direct Manager'}`,
          messageEN: `Action "${actionName}" is not allowed for topology ${topology || 'Direct Manager'}.`,
          message: `การส่งรายการผ่าน First Manager (${actionName}) ไม่สามารถใช้ได้กับเส้นทาง ${topology || 'Direct Manager'}\nAction "${actionName}" is not allowed for topology ${topology || 'Direct Manager'}.`
        });
      } else if (!hasFirstManager) {
        fieldErrors.push({
          field: 'First_Manager_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ First_Manager_User สำหรับการส่งรายการ (${actionName})`,
          messageEN: `First_Manager_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ First_Manager_User สำหรับการส่งรายการ (${actionName})\nFirst_Manager_User is empty for action "${actionName}".`
        });
      }
    }

    // 5. Direct-Manager Submit Actions Guard
    if (directManagerSubmits.includes(actionName)) {
      if (topology.includes('M2')) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `เส้นทาง ${topology} ต้องส่งรายการผ่าน First Manager เท่านั้น`,
          messageEN: `Action "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`,
          message: `เส้นทาง ${topology} ต้องส่งรายการผ่าน First Manager เท่านั้น\nAction "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`
        });
      } else if (!hasManager) {
        fieldErrors.push({
          field: 'Manager_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งรายการ (${actionName})`,
          messageEN: `Manager_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งรายการ (${actionName})\nManager_User is empty for action "${actionName}".`
        });
      }
    }

    // 6. Manager Hand-over Actions Guard
    const managerHandoverActions = [
      'Approve Objective', // from 02 to 03
      'Approve Mid-Year First Manager', // from 07 to 08
      'Approve Final First Manager' // from 12 to 13
    ];
    if (managerHandoverActions.includes(actionName) && (status.startsWith('02') || status.startsWith('07') || status.startsWith('12'))) {
      if (!hasManager) {
        fieldErrors.push({
          field: 'Manager_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งเรื่องในขั้นตอนต่อไป`,
          messageEN: `Manager_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งเรื่องในขั้นตอนต่อไป\nManager_User is empty for action "${actionName}".`
        });
      }
    }

    // 7. GM Hand-over Actions Guard
    const gmHandoverActions = [
      'Approve Objective', // from 03 to 04
      'Approve Mid-Year Manager', // from 08 to 09
      'Approve Final Manager' // from 13 to 14
    ];
    if (gmHandoverActions.includes(actionName) && (status.startsWith('03') || status.startsWith('08') || status.startsWith('13'))) {
      if (topology !== 'M1_ONLY' && !hasGM) {
        fieldErrors.push({
          field: 'GM_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ GM_User สำหรับการส่งเรื่องในขั้นตอนต่อไป`,
          messageEN: `GM_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ GM_User สำหรับการส่งเรื่องในขั้นตอนต่อไป\nGM_User is empty for action "${actionName}".`
        });
      }
    }

    // 8. Complete Requester_User Hand-over Guard (Return & Self/Requester Hand-off Actions)
    const returnActions = [
      'Return Objective',
      'Return Mid-Year First Manager',
      'Return Mid-Year Manager',
      'Return Mid-Year GM',
      'Return Final First Manager',
      'Return Final Manager',
      'Return Final GM',
      'Return Final HR'
    ];

    const isRequesterHandoffAction =
      (status.startsWith('04') && actionName === 'Approve Objective') ||
      (status.startsWith('05') && actionName === 'Start Mid-Year') ||
      (status.startsWith('09') && actionName === 'Approve Mid-Year GM') ||
      (status.startsWith('10') && actionName === 'Start Self Evaluation') ||
      returnActions.includes(actionName);

    if (isRequesterHandoffAction && !hasRequester) {
      fieldErrors.push({
        field: 'Requester_User',
        messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
        messageEN: `Requester_User is empty for action "${actionName}".`,
        message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
      });
    }

    return this._formatResult(fieldErrors);
  }

  static _val(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) {
      return field.value !== null && field.value !== undefined ? String(field.value).trim() : '';
    }
    return String(field).trim();
  }
}
