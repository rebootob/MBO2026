/**
 * Business Rule Validation Engine (Bilingual Thai / English + Field-level errors)
 */

import { BUSINESS_STAGES } from '../config/constants.js';

export const D3_PROCESS_CAPABILITY_ID = 'D3_V1_19_STATE_40_ACTION';

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
  /**
   * Validate workflow action against topology, status, and role/assignee constraints
   * @param {Object} record Kintone record object
   * @param {string} actionName Name of process action (event.action?.value)
   * @param {string} stage Resolved business stage from STATUS_TO_STAGE_MAP
   * @param {Object} options Optional capability parameters (e.g. processCapabilityId)
   * @returns {Object} { isValid: boolean, fieldErrors: Array, errors: string[] }
   */
  static validateWorkflowAction(record, actionName, stage, options = {}) {
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

    const isD3 = options && options.processCapabilityId === D3_PROCESS_CAPABILITY_ID;
    const topology = this._val(record.Routing_Topology);
    const status = this._val(record.Status);

    if (!isD3) {
      // Legacy / Default 16-State Workflow Action Validation
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

    // =========================================================================
    // D3 Native 19-State / 40-Action Workflow Action Validation (D3_V1_19_STATE_40_ACTION)
    // =========================================================================
    const RECOGNIZED_TOPOLOGIES = ['M1_ONLY', 'M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2'];
    if (!topology || !RECOGNIZED_TOPOLOGIES.includes(topology)) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้องหรือยังไม่ได้ระบุ (UNKNOWN TOPOLOGY FAIL-CLOSED)`,
        messageEN: `Routing topology "${topology || 'BLANK'}" is invalid or unmapped.`,
        message: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้องหรือยังไม่ได้ระบุ (UNKNOWN TOPOLOGY FAIL-CLOSED)\nRouting topology "${topology || 'BLANK'}" is invalid or unmapped.`
      });
      return this._formatResult(fieldErrors);
    }

    const hasM2Topology = topology.includes('M2');
    const hasG1Topology = topology.includes('G1');
    const hasG2Topology = topology.includes('G2');
    const isM1Only = topology === 'M1_ONLY';

    // Source state vs topology validation
    const firstMgrStates = [
      '02 First Manager Objective Review',
      '07 First Manager Mid-Year Review',
      '12 First Manager Final Evaluation'
    ];
    if (firstMgrStates.includes(status) && !hasM2Topology) {
      fieldErrors.push({
        field: 'Status',
        messageTH: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี First Manager (M2 Topology) เท่านั้น`,
        messageEN: `Status ${status} is valid only for topologies containing First Manager (M2).`,
        message: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี First Manager (M2 Topology) เท่านั้น\nStatus ${status} is valid only for topologies containing First Manager (M2).`
      });
      return this._formatResult(fieldErrors);
    }

    const g2States = [
      '04B GM Level 2 Objective Review',
      '09B GM Level 2 Mid-Year Review',
      '14B GM Level 2 Final Evaluation'
    ];
    if (g2States.includes(status) && !hasG2Topology) {
      fieldErrors.push({
        field: 'Status',
        messageTH: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2 Topology) เท่านั้น`,
        messageEN: `Status ${status} is valid only for topologies containing GM Level 2 (G2).`,
        message: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2 Topology) เท่านั้น\nStatus ${status} is valid only for topologies containing GM Level 2 (G2).`
      });
      return this._formatResult(fieldErrors);
    }

    const g1States = [
      '04 GM Objective Review',
      '09 GM Mid-Year Review',
      '14 GM Final Evaluation'
    ];
    if (g1States.includes(status) && isM1Only) {
      fieldErrors.push({
        field: 'Status',
        messageTH: `สถานะ ${status} ไม่สามารถใช้ได้กับเส้นทาง M1_ONLY`,
        messageEN: `Status ${status} is not allowed for M1_ONLY topology.`,
        message: `สถานะ ${status} ไม่สามารถใช้ได้กับเส้นทาง M1_ONLY\nStatus ${status} is not allowed for M1_ONLY topology.`
      });
      return this._formatResult(fieldErrors);
    }

    // Helpers to extract users and rules for D3 sequential approver slots (NO fallback to legacy fields)
    const getApproverUsers = (code) => {
      const field = record[code];
      if (!field) return [];
      if (Array.isArray(field.value)) return field.value;
      if (Array.isArray(field)) return field;
      return [];
    };

    const getApprovalRule = (code) => {
      const field = record[code];
      if (!field) return '';
      if (typeof field === 'object' && field !== null && 'value' in field) {
        if (typeof field.value === 'object' && field.value !== null && 'value' in field.value) {
          return String(field.value.value || '').trim();
        }
        return String(field.value || '').trim();
      }
      return String(field).trim();
    };

    const validateD3Slot = (approverField, ruleField) => {
      const users = getApproverUsers(approverField);
      const count = users.length;
      if (count === 0) {
        fieldErrors.push({
          field: approverField,
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ ${approverField}`,
          messageEN: `${approverField} is empty.`,
          message: `ไม่พบข้อมูลผู้อนุมัติ ${approverField}\n${approverField} is empty.`
        });
      } else if (count > 1) {
        fieldErrors.push({
          field: approverField,
          messageTH: `จำนวนผู้อนุมัติ ${approverField} ต้องมีเพียง 1 คน (พบ ${count} คน)`,
          messageEN: `${approverField} must have exactly 1 user (found ${count}).`,
          message: `จำนวนผู้อนุมัติ ${approverField} ต้องมีเพียง 1 คน (พบ ${count} คน)\n${approverField} must have exactly 1 user (found ${count}).`
        });
      }

      const rule = getApprovalRule(ruleField);
      if (rule !== 'ALL') {
        fieldErrors.push({
          field: ruleField,
          messageTH: `กฎการอนุมัติ ${ruleField} ต้องเป็น ALL เท่านั้น (พบ ${rule || 'BLANK'})`,
          messageEN: `${ruleField} must be ALL (found ${rule || 'BLANK'}).`,
          message: `กฎการอนุมัติ ${ruleField} ต้องเป็น ALL เท่านั้น (พบ ${rule || 'BLANK'})\n${ruleField} must be ALL (found ${rule || 'BLANK'}).`
        });
      }
    };

    const requesterUsers = getApproverUsers('Requester_User');
    const hasRequester = requesterUsers.length > 0;

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

    const m1OnlyActions = [
      'Approve Objective (M1 Only)',
      'Approve Mid-Year Manager (M1 Only)',
      'Approve Final Manager (M1 Only)'
    ];

    const toG2Actions = [
      'Approve Objective to G2',
      'Approve Mid-Year GM to G2',
      'Approve Final GM to G2'
    ];

    const g2ApproveActions = [
      'Approve Objective G2',
      'Approve Mid-Year G2',
      'Approve Final G2'
    ];

    const g2ReturnActions = [
      'Return Objective G2',
      'Return Mid-Year G2',
      'Return Final G2'
    ];

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

    // 1. First-Manager Submit Actions
    if (firstManagerSubmits.includes(actionName)) {
      if (!hasM2Topology) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `การส่งรายการผ่าน First Manager (${actionName}) ไม่สามารถใช้ได้กับเส้นทาง ${topology || 'Direct Manager'}`,
          messageEN: `Action "${actionName}" is not allowed for topology ${topology || 'Direct Manager'}. Direct Manager submit must be used.`,
          message: `การส่งรายการผ่าน First Manager (${actionName}) ไม่สามารถใช้ได้กับเส้นทาง ${topology || 'Direct Manager'}\nAction "${actionName}" is not allowed for topology ${topology || 'Direct Manager'}. Direct Manager submit must be used.`
        });
      } else {
        validateD3Slot('Manager_Level2_Approvers', 'Manager_Level2_Approval_Rule');
      }
    }

    // 2. Direct-Manager Submit Actions
    if (directManagerSubmits.includes(actionName)) {
      if (hasM2Topology) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `เส้นทาง ${topology} ต้องส่งรายการผ่าน First Manager เท่านั้น`,
          messageEN: `Action "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`,
          message: `เส้นทาง ${topology} ต้องส่งรายการผ่าน First Manager เท่านั้น\nAction "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`
        });
      } else {
        validateD3Slot('Manager_Level1_Approvers', 'Manager_Level1_Approval_Rule');
      }
    }

    // 3. M2 Hand-over Actions (02 -> 03, 07 -> 08, 12 -> 13)
    const m2HandoverActions = [
      'Approve Objective',
      'Approve Mid-Year First Manager',
      'Approve Final First Manager'
    ];
    if (m2HandoverActions.includes(actionName) && (status.startsWith('02') || status.startsWith('07') || status.startsWith('12'))) {
      validateD3Slot('Manager_Level1_Approvers', 'Manager_Level1_Approval_Rule');
      validateD3Slot('Manager_Level2_Approvers', 'Manager_Level2_Approval_Rule');
    }

    // 4. M1_ONLY Bypass Actions (03 -> 05, 08 -> 10, 13 -> 15)
    if (m1OnlyActions.includes(actionName)) {
      if (!isM1Only) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทาง M1_ONLY เท่านั้น`,
          messageEN: `Action "${actionName}" is allowed only for M1_ONLY topology.`,
          message: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทาง M1_ONLY เท่านั้น\nAction "${actionName}" is allowed only for M1_ONLY topology.`
        });
      } else {
        validateD3Slot('Manager_Level1_Approvers', 'Manager_Level1_Approval_Rule');
        if (actionName === 'Approve Objective (M1 Only)' || actionName === 'Approve Mid-Year Manager (M1 Only)') {
          if (!hasRequester) {
            fieldErrors.push({
              field: 'Requester_User',
              messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
              messageEN: `Requester_User is empty for action "${actionName}".`,
              message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
            });
          }
        }
      }
    }

    // 5. Manager Approval towards G1 (03 -> 04, 08 -> 09, 13 -> 14)
    const m1ToG1Actions = [
      'Approve Objective',
      'Approve Mid-Year Manager',
      'Approve Final Manager'
    ];
    if (m1ToG1Actions.includes(actionName) && (status.startsWith('03') || status.startsWith('08') || status.startsWith('13'))) {
      if (isM1Only) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `เส้นทาง M1_ONLY ไม่สามารถส่งไปยัง GM ได้ กรุณาใช้คำสั่งสำหรับ M1 Only`,
          messageEN: `Action "${actionName}" is not allowed for M1_ONLY topology. M1 Only action must be used.`,
          message: `เส้นทาง M1_ONLY ไม่สามารถส่งไปยัง GM ได้ กรุณาใช้คำสั่งสำหรับ M1 Only\nAction "${actionName}" is not allowed for M1_ONLY topology. M1 Only action must be used.`
        });
      } else if (hasG1Topology) {
        validateD3Slot('GM_Level1_Approvers', 'GM_Level1_Approval_Rule');
        validateD3Slot('Manager_Level1_Approvers', 'Manager_Level1_Approval_Rule');
      }
    }

    // 6. G1 Approval to G2 (04 -> 04B, 09 -> 09B, 14 -> 14B)
    if (toG2Actions.includes(actionName)) {
      if (!hasG2Topology) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2 Topology) เท่านั้น`,
          messageEN: `Action "${actionName}" is allowed only for G2 topologies.`,
          message: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2 Topology) เท่านั้น\nAction "${actionName}" is allowed only for G2 topologies.`
        });
      } else {
        validateD3Slot('GM_Level2_Approvers', 'GM_Level2_Approval_Rule');
        validateD3Slot('GM_Level1_Approvers', 'GM_Level1_Approval_Rule');
      }
    }

    // 7. G1 Direct Completion Approval (04 -> 05, 09 -> 10, 14 -> 15)
    const g1DirectApproveActions = [
      'Approve Objective',
      'Approve Mid-Year GM',
      'Approve Final GM'
    ];
    if (g1DirectApproveActions.includes(actionName) && ((status.startsWith('04') && !status.startsWith('04B')) || (status.startsWith('09') && !status.startsWith('09B')) || (status.startsWith('14') && !status.startsWith('14B')))) {
      if (hasG2Topology) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `เส้นทาง ${topology} ต้องส่งต่อไปยัง GM Level 2 (G2) ก่อน ไม่สามารถอนุมัติเสร็จสิ้นโดยตรงได้`,
          messageEN: `Action "${actionName}" is not allowed for G2 topology. Approve to G2 must be used.`,
          message: `เส้นทาง ${topology} ต้องส่งต่อไปยัง GM Level 2 (G2) ก่อน ไม่สามารถอนุมัติเสร็จสิ้นโดยตรงได้\nAction "${actionName}" is not allowed for G2 topology. Approve to G2 must be used.`
        });
      } else {
        validateD3Slot('GM_Level1_Approvers', 'GM_Level1_Approval_Rule');
        if (actionName === 'Approve Objective' || actionName === 'Approve Mid-Year GM') {
          if (!hasRequester) {
            fieldErrors.push({
              field: 'Requester_User',
              messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
              messageEN: `Requester_User is empty for action "${actionName}".`,
              message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
            });
          }
        }
      }
    }

    // 8. G2 Approval Actions (04B -> 05, 09B -> 10, 14B -> 15)
    if (g2ApproveActions.includes(actionName)) {
      if (!hasG2Topology) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2) เท่านั้น`,
          messageEN: `Action "${actionName}" is allowed only for G2 topologies.`,
          message: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2) เท่านั้น\nAction "${actionName}" is allowed only for G2 topologies.`
        });
      } else {
        validateD3Slot('GM_Level2_Approvers', 'GM_Level2_Approval_Rule');
        if (actionName === 'Approve Objective G2' || actionName === 'Approve Mid-Year G2') {
          if (!hasRequester) {
            fieldErrors.push({
              field: 'Requester_User',
              messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
              messageEN: `Requester_User is empty for action "${actionName}".`,
              message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
            });
          }
        }
      }
    }

    // 9. G2 Return Actions (04B -> 01, 09B -> 06, 14B -> 11)
    if (g2ReturnActions.includes(actionName)) {
      if (!hasG2Topology) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2) เท่านั้น`,
          messageEN: `Action "${actionName}" is allowed only for G2 topologies.`,
          message: `คำสั่ง ${actionName} ใช้ได้เฉพาะเส้นทางที่มี GM Level 2 (G2) เท่านั้น\nAction "${actionName}" is allowed only for G2 topologies.`
        });
      } else {
        validateD3Slot('GM_Level2_Approvers', 'GM_Level2_Approval_Rule');
        if (!hasRequester) {
          fieldErrors.push({
            field: 'Requester_User',
            messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
            messageEN: `Requester_User is empty for action "${actionName}".`,
            message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
          });
        }
      }
    }

    // 10. Generic Return Actions to Requester
    if (returnActions.includes(actionName)) {
      if (!hasRequester) {
        fieldErrors.push({
          field: 'Requester_User',
          messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
          messageEN: `Requester_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
        });
      }
    }

    // 11. Stage Start Actions (05 -> 06, 10 -> 11)
    const stageStartActions = ['Start Mid-Year', 'Start Self Evaluation'];
    if (stageStartActions.includes(actionName)) {
      if (!hasRequester) {
        fieldErrors.push({
          field: 'Requester_User',
          messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
          messageEN: `Requester_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
        });
      }
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

  /**
   * Validates D3 App 794 bound route & provenance snapshot completeness (Fail-Closed)
   * @param {Object} record App 794 record object
   * @param {Object} options Optional validation context (e.g. employeeUserCode)
   * @returns {Object} { isValid: boolean, fieldErrors: Array, errors: string[] }
   */
  static validateD3RouteProvenance(record, options = {}) {
    const fieldErrors = [];

    if (!record || typeof record !== 'object') {
      fieldErrors.push({
        field: 'RECORD',
        messageTH: 'ไม่พบข้อมูล Record สำหรับตรวจสอบ D3 Provenance',
        messageEN: 'Record data missing for D3 Provenance validation',
        message: 'Record data missing for D3 Provenance validation'
      });
      return this._formatResult(fieldErrors);
    }

    const frozenProfile = this._val(record.Frozen_Profile_Code);
    if (!frozenProfile) {
      fieldErrors.push({
        field: 'Frozen_Profile_Code',
        messageTH: 'ไม่พบข้อมูล Frozen_Profile_Code',
        messageEN: 'Frozen_Profile_Code is required',
        message: 'Frozen_Profile_Code is required'
      });
    }

    const kRaw = this._val(record.K_expected_Snapshot);
    const kExpected = Number(kRaw);
    if (!kRaw || (kExpected !== 1 && kExpected !== 2)) {
      fieldErrors.push({
        field: 'K_expected_Snapshot',
        messageTH: 'K_expected_Snapshot ต้องเป็น 1 หรือ 2 เท่านั้น',
        messageEN: 'K_expected_Snapshot must be exactly 1 or 2',
        message: 'K_expected_Snapshot must be exactly 1 or 2'
      });
    }

    const effectiveRoutingKey = this._val(record.Effective_Routing_Key);
    if (!effectiveRoutingKey) {
      fieldErrors.push({
        field: 'Effective_Routing_Key',
        messageTH: 'ไม่พบข้อมูล Effective_Routing_Key',
        messageEN: 'Effective_Routing_Key is required',
        message: 'Effective_Routing_Key is required'
      });
    }

    const effectiveVersionKey = this._val(record.Effective_Route_Version_Key);
    if (!effectiveVersionKey) {
      fieldErrors.push({
        field: 'Effective_Route_Version_Key',
        messageTH: 'ไม่พบข้อมูล Effective_Route_Version_Key',
        messageEN: 'Effective_Route_Version_Key is required',
        message: 'Effective_Route_Version_Key is required'
      });
    }

    const topology = this._val(record.Routing_Topology);
    const validTopologies = ['M1_ONLY', 'M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2'];
    if (!topology || !validTopologies.includes(topology)) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้อง`,
        messageEN: `Routing topology "${topology || 'BLANK'}" is invalid`,
        message: `Routing topology "${topology || 'BLANK'}" is invalid`
      });
    }

    const slotDefinitions = {
      M1_ONLY: ['M1'],
      M1_G1: ['M1', 'G1'],
      M1_M2_G1: ['M2', 'M1', 'G1'],
      M1_G1_G2: ['M1', 'G1', 'G2'],
      M1_M2_G1_G2: ['M2', 'M1', 'G1', 'G2']
    };

    const activeSlots = slotDefinitions[topology] || [];
    if (activeSlots.length === 0) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: 'เส้นทางการอนุมัติไม่มีผู้อนุมัติที่รอดหลัง self-elision',
        messageEN: 'No surviving workflow appraisers in routing topology',
        message: 'No surviving workflow appraisers in routing topology'
      });
    }

    const slotFields = {
      M1: { users: 'Manager_Level1_Approvers', rule: 'Manager_Level1_Approval_Rule' },
      M2: { users: 'Manager_Level2_Approvers', rule: 'Manager_Level2_Approval_Rule' },
      G1: { users: 'GM_Level1_Approvers', rule: 'GM_Level1_Approval_Rule' },
      G2: { users: 'GM_Level2_Approvers', rule: 'GM_Level2_Approval_Rule' }
    };

    const survivingApproverCodes = [];

    // Active slots validation: exactly 1 user per active slot and explicit ALL rule (no fallback)
    for (const slotId of activeSlots) {
      const { users: userField, rule: ruleField } = slotFields[slotId];
      const rawUsers = record[userField]?.value !== undefined ? record[userField].value : record[userField];
      const users = Array.isArray(rawUsers) ? rawUsers : [];
      const rawRule = record[ruleField]?.value !== undefined ? record[ruleField].value : record[ruleField];
      const rule = (rawRule !== null && rawRule !== undefined) ? String(rawRule).trim() : '';

      if (users.length !== 1) {
        fieldErrors.push({
          field: userField,
          messageTH: `${userField} ต้องมีผู้ใช้งานคนเดียวใน D3 V1 (พบ ${users.length})`,
          messageEN: `${userField} must contain exactly one user (found ${users.length})`,
          message: `${userField} must contain exactly one user (found ${users.length})`
        });
      } else {
        const u = users[0];
        const uCode = String(u?.code || u?.value || u || '').trim();
        if (!uCode) {
          fieldErrors.push({
            field: userField,
            messageTH: `${userField} รหัสผู้ใช้งานต้องไม่ว่างเปล่า`,
            messageEN: `${userField} user code cannot be blank`,
            message: `${userField} user code cannot be blank`
          });
        } else {
          survivingApproverCodes.push(uCode);
        }
      }

      if (rule !== 'ALL') {
        fieldErrors.push({
          field: ruleField,
          messageTH: `${ruleField} ต้องระบุค่า ALL อย่างชัดเจนใน D3 V1 (พบ "${rule}")`,
          messageEN: `${ruleField} approval rule must be explicitly ALL (found "${rule}")`,
          message: `${ruleField} approval rule must be explicitly ALL (found "${rule}")`
        });
      }
    }

    // Inactive slots validation: must be strictly empty
    const allSlots = ['M1', 'M2', 'G1', 'G2'];
    const inactiveSlots = allSlots.filter(s => !activeSlots.includes(s));
    for (const slotId of inactiveSlots) {
      const { users: userField } = slotFields[slotId];
      const rawUsers = record[userField]?.value !== undefined ? record[userField].value : record[userField];
      const users = Array.isArray(rawUsers) ? rawUsers : [];
      if (users.length > 0) {
        fieldErrors.push({
          field: userField,
          messageTH: `${userField} ต้องว่างเปล่าสำหรับ topology ${topology} (พบ ${users.length})`,
          messageEN: `${userField} must be empty for topology ${topology} (found ${users.length})`,
          message: `${userField} must be empty for topology ${topology} (found ${users.length})`
        });
      }
    }

    // No duplicate appraiser identities across active slots
    const uniqueApprovers = new Set(survivingApproverCodes);
    if (uniqueApprovers.size !== survivingApproverCodes.length) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: 'ห้ามมีผู้อนุมัติซ้ำกันในเส้นทางการอนุมัติ (DUPLICATE_APPROVERS)',
        messageEN: 'Duplicate approver identities in routing path (DUPLICATE_APPROVERS)',
        message: 'Duplicate approver identities in routing path (DUPLICATE_APPROVERS)'
      });
    }

    const scorerSlotsRaw = this._val(record.Effective_Scorer_Slots_Snapshot);
    if (!scorerSlotsRaw) {
      fieldErrors.push({
        field: 'Effective_Scorer_Slots_Snapshot',
        messageTH: 'ไม่พบข้อมูล Effective_Scorer_Slots_Snapshot',
        messageEN: 'Effective_Scorer_Slots_Snapshot is required',
        message: 'Effective_Scorer_Slots_Snapshot is required'
      });
    } else {
      let parsedSlots;
      try {
        parsedSlots = JSON.parse(scorerSlotsRaw);
      } catch {
        fieldErrors.push({
          field: 'Effective_Scorer_Slots_Snapshot',
          messageTH: 'Effective_Scorer_Slots_Snapshot มีรูปแบบ JSON ไม่ถูกต้อง',
          messageEN: 'Effective_Scorer_Slots_Snapshot contains malformed JSON',
          message: 'Effective_Scorer_Slots_Snapshot contains malformed JSON'
        });
      }

      if (Array.isArray(parsedSlots)) {
        if (parsedSlots.length !== kExpected) {
          fieldErrors.push({
            field: 'Effective_Scorer_Slots_Snapshot',
            messageTH: `จำนวน scorer slots (${parsedSlots.length}) ไม่ตรงกับ K_expected (${kExpected})`,
            messageEN: `Scorer slots count (${parsedSlots.length}) does not match K_expected (${kExpected})`,
            message: `Scorer slots count (${parsedSlots.length}) does not match K_expected (${kExpected})`
          });
        }

        const uniqueSlots = new Set(parsedSlots);
        if (uniqueSlots.size !== parsedSlots.length) {
          fieldErrors.push({
            field: 'Effective_Scorer_Slots_Snapshot',
            messageTH: 'Scorer slots ต้องไม่ซ้ำกัน',
            messageEN: 'Scorer slots must be unique',
            message: 'Scorer slots must be unique'
          });
        }

        const scorerUserCodes = [];
        for (const ordinal of parsedSlots) {
          if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > activeSlots.length) {
            fieldErrors.push({
              field: 'Effective_Scorer_Slots_Snapshot',
              messageTH: `Scorer slot ordinal ${ordinal} ไม่ตรงกับเส้นทางที่รอด (${activeSlots.length} slots)`,
              messageEN: `Scorer slot ordinal ${ordinal} does not reference surviving route (${activeSlots.length} slots)`,
              message: `Scorer slot ordinal ${ordinal} does not reference surviving route (${activeSlots.length} slots)`
            });
          } else {
            const approverCode = survivingApproverCodes[ordinal - 1];
            if (approverCode) scorerUserCodes.push(approverCode);
          }
        }

        if (kExpected === 2 && scorerUserCodes.length === 2 && scorerUserCodes[0] === scorerUserCodes[1]) {
          fieldErrors.push({
            field: 'Effective_Scorer_Slots_Snapshot',
            messageTH: 'K=2 ต้องมีผู้ประเมิน 2 คนที่ไม่ซ้ำกัน',
            messageEN: 'K=2 requires two distinct scorer identities',
            message: 'K=2 requires two distinct scorer identities'
          });
        }

        const targetEmpCode = String(options.employeeUserCode || '').trim();
        if (targetEmpCode && scorerUserCodes.includes(targetEmpCode)) {
          fieldErrors.push({
            field: 'Effective_Scorer_Slots_Snapshot',
            messageTH: 'พนักงานไม่สามารถประเมิน MBO ตนเองได้ (SELF_SCORING_CONFLICT)',
            messageEN: 'Employee cannot score their own MBO (SELF_SCORING_CONFLICT)',
            message: 'Employee cannot score their own MBO (SELF_SCORING_CONFLICT)'
          });
        }
      }
    }

    return this._formatResult(fieldErrors);
  }
}

