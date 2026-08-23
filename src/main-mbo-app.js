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

  function getBusinessStage(record) {
    const status = record?.Status?.value || '';
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

    const stage = getBusinessStage(record);

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

    try {
      ui.render();
      hideAllNativeFields(record);
    } catch (renderError) {
      console.error('[MBO V2] Error rendering custom UI:', renderError);
    }

    return event;
  });

  // Hook 2: Record Submit (Create & Edit)
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], async function (event) {
    const record = event.record;
    const stage = getBusinessStage(record);

    // 1. Build and validate deterministic Record Key
    const fy = record.Fiscal_Year?.value || 'FY2026';
    const code = record.Employee_Code?.value || '';
    const recordKey = buildRecordKey(fy, code);

    if (!recordKey) {
      event.error = 'ไม่สามารถสร้าง Record Key ได้ กรุณาระบุรหัสพนักงานและ Fiscal Year';
      return event;
    }

    if (!record.Record_Key) {
      record.Record_Key = { value: recordKey };
    } else {
      record.Record_Key.value = recordKey;
    }

    // 2. Duplicate Check Guard
    try {
      const currentId = record.$id?.value;
      const query = `Record_Key = "${recordKey}" ${currentId ? `and $id != "${currentId}"` : ''}`;
      const duplicateRes = await kintoneApiWrapper.getRecords(getMboAppId(), query);
      if (duplicateRes.records && duplicateRes.records.length > 0) {
        event.error = `พนักงานรหัส ${code} มี MBO สำหรับ ${fy} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้`;
        return event;
      }
    } catch (err) {
      console.error('[MBO V2] Duplicate check error:', err);
    }

    // 3. Stage Validation
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
