/**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */

import { STATUS_TO_STAGE_MAP, BUSINESS_STAGES, CONFIDENTIAL_FIELDS } from './config/constants.js';
import { EmployeePartAUI } from './ui/employee-part-a-ui.js';
import { ValidationEngine } from './validation/validation-engine.js';
import { EmployeeService } from './services/employee-service.js';
import { RoutingService } from './services/routing-service.js';

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
