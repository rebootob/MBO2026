/**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */

import { STATUS_TO_STAGE_MAP, BUSINESS_STAGES, CONFIDENTIAL_FIELDS } from './config/constants.js';
import { getRecordUiHost } from './ui/host-resolver.js';
import { EmployeePartAUI } from './ui/employee-part-a-ui.js';
import { ValidationEngine } from './validation/validation-engine.js';
import { EmployeeService } from './services/employee-service.js';
import { RoutingService } from './services/routing-service.js';

(function () {
  'use strict';

  if (typeof kintone === 'undefined') return;

  const MBO_APP_ID = kintone.app.getId();
  const ROUTING_APP_ID = 795;
  const EMPLOYEE_APP_ID = 53;

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
        }
      },
      onLookupEmployee: async (empCode) => {
        const empProfile = await EmployeeService.lookupEmployee(empCode, kintoneApiWrapper);
        const loginUser = kintone.getLoginUser();
        const routing = await RoutingService.validateRequesterAccess(ROUTING_APP_ID, empProfile.Employee_Section, loginUser.code, kintoneApiWrapper);
        const fy = record.Fiscal_Year?.value || 'FY2026';
        await EmployeeService.checkDuplicateMBO(MBO_APP_ID, fy, empCode, record.$id?.value, kintoneApiWrapper);

        // Snapshot all data into record
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
          Record_Key: { value: `${fy}-${empProfile.Employee_Code}` }
        });
      }
    });

    try {
      ui.render();
      // 3. Only hide native fields AFTER successful custom UI render
      hideAllNativeFields(record);
    } catch (renderError) {
      console.error('[MBO V2] Error rendering custom UI:', renderError);
      // Keep native fields visible in fail-safe mode
    }

    return event;
  });

  // Hook 2: Record Submit (Create & Edit)
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], function (event) {
    const record = event.record;
    const stage = getBusinessStage(record);

    // Always ensure Record_Key is generated: FY + Code
    const fy = record.Fiscal_Year?.value || 'FY2026';
    const code = record.Employee_Code?.value || '';
    if (fy && code && record.Record_Key) {
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
