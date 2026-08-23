/**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */

import { STATUS_TO_STAGE_MAP, BUSINESS_STAGES, CONFIDENTIAL_FIELDS, buildRecordKey } from './config/constants.js';
import { getRecordUiHost } from './ui/host-resolver.js';
import { EmployeePartAUI } from './ui/employee-part-a-ui.js';
import { ValidationEngine } from './validation/validation-engine.js';
import { EmployeeService } from './services/employee-service.js';
import { RoutingService } from './services/routing-service.js';

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

  function syncRecordToKintone(record) {
    try {
      if (typeof kintone.app.record.get === 'function' && typeof kintone.app.record.set === 'function') {
        const currentData = kintone.app.record.get();
        if (currentData && currentData.record) {
          Object.keys(record).forEach(k => {
            if (currentData.record[k]) {
              currentData.record[k].value = record[k].value;
            } else {
              currentData.record[k] = record[k];
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

    // Default Fiscal Year on Create
    if (isCreate && !record.Fiscal_Year?.value) {
      record.Fiscal_Year = { value: 'FY2026' };
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
        } else {
          record[code] = { value: val };
        }
        syncRecordToKintone(record);
      },
      onEmployeeCodeChanged: (newCode) => {
        // Reset snapshot if code changes
        record.Employee_Code = { value: newCode };
        record.Employee_Name = { value: '' };
        record.Employee_Name_TH = { value: '' };
        record.Employee_Section = { value: '' };
        record.Employee_Department = { value: '' };
        record.Employee_Position = { value: '' };
        record.Employee_Email = { value: '' };
        record.Employee_Start_Date = { value: '' };
        record.Department_Hoshin = { value: '' };
        record.Section_Hoshin = { value: '' };
        record.Record_Key = { value: '' };
        syncRecordToKintone(record);
      },
      onLookupEmployee: async (empCode) => {
        const empProfile = await EmployeeService.lookupEmployee(empCode, kintoneApiWrapper);
        const loginUser = kintone.getLoginUser();
        const routing = await RoutingService.validateRequesterAccess(ROUTING_APP_ID, empProfile.Employee_Section, loginUser.code, kintoneApiWrapper);
        const fy = record.Fiscal_Year?.value || 'FY2026';
        const generatedKey = buildRecordKey(fy, empProfile.Employee_Code);

        // Check duplicate MBO
        await EmployeeService.checkDuplicateMBO(getMboAppId(), fy, empProfile.Employee_Code, record.$id?.value, kintoneApiWrapper);

        // Snapshot all data into record in-memory
        Object.assign(record, {
          Employee_Code: { value: empProfile.Employee_Code },
          Employee_Name: { value: empProfile.Employee_Name },
          Employee_Name_TH: { value: empProfile.Employee_Name_TH },
          Employee_Section: { value: empProfile.Employee_Section },
          Employee_Department: { value: empProfile.Employee_Department },
          Employee_Position: { value: empProfile.Employee_Position },
          Employee_Email: { value: empProfile.Employee_Email },
          Employee_Start_Date: { value: empProfile.Employee_Start_Date },
          Department_Hoshin: { value: empProfile.Department_Hoshin },
          Section_Hoshin: { value: empProfile.Section_Hoshin },
          Requester_User: { value: routing.Requester_User },
          First_Manager_User: { value: routing.First_Manager_User },
          Manager_User: { value: routing.Manager_User },
          GM_User: { value: routing.GM_User },
          Fiscal_Year: { value: fy },
          Record_Key: { value: generatedKey }
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

    if (!record.Record_Key) {
      record.Record_Key = { value: recordKey };
    } else {
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
