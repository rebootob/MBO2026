/**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */

import { STATUS_TO_STAGE_MAP, BUSINESS_STAGES, CONFIDENTIAL_FIELDS, buildRecordKey } from './config/constants.js';
import { getRecordUiHost } from './ui/host-resolver.js';
import { EmployeePartAUI } from './ui/employee-part-a-ui.js';
import { ValidationEngine } from './validation/validation-engine.js';
import { EmployeeService } from './services/employee-service.js';
import { MboIdentityService } from './services/mbo-identity-service.js';
import { RoutingService } from './services/routing-service.js';
import { resolveProfileCodeForSnapshot as resolveProfileCode } from './profiles/runtime-profile-resolver.js';
import { MboKintoneLoginGate } from './ui/mbo-kintone-login-gate.js';
import { MboKintoneAuthAdapter } from './ui/mbo-kintone-auth-adapter.js';
import { MboSessionManager } from './ui/mbo-session-manager.js';
import { EmployeeSelfIndexUI } from './ui/employee-self-index-ui.js';
import { ApproverTaskIndexUI } from './ui/approver-task-index-ui.js';
import { MboApprovalTaskService } from './services/mbo-approval-task-service.js';
import { EmployeeRecordNavigation } from './ui/employee-record-navigation.js';
import { DeleteGuardPolicy } from './security/delete-guard-policy.js';

let activeUiInstance = null;
let currentEmployeeSelfContext = null;

const kintoneApiWrapper = {
  getRecords: async (appId, query) => {
    if (typeof kintone === 'undefined' || typeof kintone.api !== 'function') {
      throw new Error('Kintone API is unavailable');
    }
    const url = (typeof kintone.api.url === 'function')
      ? kintone.api.url('/k/v1/records.json', true)
      : '/k/v1/records.json';
    const resp = await kintone.api(url, 'GET', { app: appId, query: query });
    return resp;
  },
  getRecord: async (appId, id) => {
    if (typeof kintone === 'undefined' || typeof kintone.api !== 'function') {
      throw new Error('Kintone API is unavailable');
    }
    const url = (typeof kintone.api.url === 'function')
      ? kintone.api.url('/k/v1/record.json', true)
      : '/k/v1/record.json';
    const resp = await kintone.api(url, 'GET', { app: appId, id: id });
    return resp ? resp.record : null;
  }
};

/**
 * D1: Module-level MBO Login Gate. Initialized to null → fail closed.
 * Set by production initialization block or by setMboLoginGate() in tests.
 */
let mboLoginGate = null;

/**
 * Allows test injection of a mock gate. Never self-authorize live cutover.
 * @param {MboKintoneLoginGate|null} gate
 */
export function setMboLoginGate(gate) {
  mboLoginGate = gate;
}

export function getCurrentEmployeeSelfContext() {
  return currentEmployeeSelfContext;
}

export function setCurrentEmployeeSelfContext(context) {
  currentEmployeeSelfContext = context;
}

export function getActiveUiInstance() {
  return activeUiInstance;
}
if (typeof globalThis !== 'undefined') {
  globalThis.getActiveUiInstance = getActiveUiInstance;
  globalThis.getCurrentEmployeeSelfContext = getCurrentEmployeeSelfContext;
}

function resolveRuntimeEmployeeSelfContext(uiHost) {
  const loginUser = (typeof kintone !== 'undefined' && kintone.getLoginUser) ? kintone.getLoginUser() : null;
  const kintoneUserCode = loginUser?.code || null;

  if (!kintoneUserCode) {
    return { status: 'NO_KINTONE_USER', mode: null };
  }

  let principalMode;
  try {
    principalMode = MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode });
  } catch (err) {
    return { status: 'MODE_RESOLUTION_ERROR', reason: err.message };
  }

  if (principalMode === 'TECHNICAL_ADMIN') {
    return { status: 'TECHNICAL_ADMIN', mode: 'TECHNICAL_ADMIN' };
  }

  if (principalMode === 'SHARED') {
    if (!mboLoginGate) {
      return { status: 'GATE_NULL', mode: 'SHARED' };
    }
    const authResult = mboLoginGate.requireLogin(uiHost);
    if (typeof authResult === 'string') {
      return {
        status: 'SUCCESS',
        context: { mode: 'SHARED', employeeCode: authResult, kintoneUserCode }
      };
    } else if (authResult && typeof authResult.then === 'function') {
      return authResult.then(empCode => {
        if (!empCode) {
          return { status: 'SHARED_AUTH_REQUIRED', mode: 'SHARED' };
        }
        return {
          status: 'SUCCESS',
          context: { mode: 'SHARED', employeeCode: empCode, kintoneUserCode }
        };
      });
    }
    return { status: 'SHARED_AUTH_REQUIRED', mode: 'SHARED' };
  }

  if (principalMode === 'DEDICATED') {
    return (async () => {
      let candidateRecords = [];
      try {
        candidateRecords = await EmployeeService.lookupDedicatedIdentityMappingCandidates(kintoneUserCode, kintoneApiWrapper);
      } catch (lookupErr) {
        candidateRecords = [];
      }

      const mappingRes = MboIdentityService.resolveDedicatedKintoneUserMapping({
        kintoneUserCode,
        userMappings: candidateRecords
      });



      if (mappingRes.status === 'IDENTITY_BOUND' && mappingRes.employeeCode) {
        return {
          status: 'SUCCESS',
          context: { mode: 'DEDICATED', employeeCode: mappingRes.employeeCode, kintoneUserCode }
        };
      }

      return {
        status: 'DEDICATED_MAPPING_FAILED',
        reason: mappingRes.reason || 'Kintone user is not bound to an active Employee_Code in App 53'
      };
    })();
  }

  return { status: 'UNSUPPORTED_MODE', mode: principalMode };
}

function isSemanticValueMatch(valA, valB, fieldType) {
  if (valA === valB) return true;

  if (Array.isArray(valA) && Array.isArray(valB)) {
    if (valA.length !== valB.length) return false;
    return valA.every((item, idx) => {
      const bItem = valB[idx];
      if (typeof item === 'object' && item !== null && typeof bItem === 'object' && bItem !== null) {
        return item.code === bItem.code;
      }
      return item === bItem;
    });
  }

  if (fieldType === 'NUMBER' || typeof valA === 'number' || typeof valB === 'number') {
    const numA = Number(valA);
    const numB = Number(valB);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA === numB;
    }
  }

  const strA = String(valA ?? '').trim();
  const strB = String(valB ?? '').trim();
  return strA === strB;
}

export function syncRecordToKintone(record, options = {}) {
  const requireVerifiedPersistence = options.requireVerifiedPersistence === true;
  const requiredFields = Array.isArray(options.requiredFields) ? options.requiredFields : [];

  if (typeof kintone === 'undefined' || !kintone.app || !kintone.app.record) {
    if (requireVerifiedPersistence) {
      throw new Error('Kintone record API is unavailable (kintone.app.record missing)');
    }
    return false;
  }

  if (typeof kintone.app.record.get !== 'function' || typeof kintone.app.record.set !== 'function') {
    if (requireVerifiedPersistence) {
      throw new Error('Kintone record get/set API functions are unavailable');
    }
    return false;
  }

  const currentData = kintone.app.record.get();
  if (!currentData || !currentData.record) {
    if (requireVerifiedPersistence) {
      throw new Error('Current Kintone form record object is unavailable');
    }
    return false;
  }

  const kintoneRecord = currentData.record;

  // 1. Verify required destination fields exist in Kintone form schema
  if (requireVerifiedPersistence) {
    for (const fieldCode of requiredFields) {
      if (!kintoneRecord[fieldCode]) {
        throw new Error(`ไม่พบช่องข้อมูล ${fieldCode} ในแบบฟอร์ม (App 794)\nField ${fieldCode} does not exist on Kintone form schema.`);
      }
    }
  }

  // 2. Clone record and copy matching source values
  const targetRecord = JSON.parse(JSON.stringify(kintoneRecord));
  Object.keys(record).forEach(k => {
    if (targetRecord[k] && record[k] && record[k].value !== undefined) {
      targetRecord[k].value = record[k].value;
    }
  });

  // 3. Perform kintone.app.record.set
  try {
    kintone.app.record.set({ record: targetRecord });
  } catch (e) {
    if (requireVerifiedPersistence) {
      throw new Error(`kintone.app.record.set failed: ${e.message}`);
    }
    console.warn('[MBO V2] syncRecordToKintone warning:', e);
    return false;
  }

  // 4. Post-set read-back verification
  if (requireVerifiedPersistence) {
    const postSetData = kintone.app.record.get();
    const postSetRecord = postSetData?.record;

    if (!postSetRecord) {
      throw new Error('Post-set Kintone form record read-back failed');
    }

    for (const fieldCode of requiredFields) {
      const sourceVal = record[fieldCode]?.value;
      const readBackVal = postSetRecord[fieldCode]?.value;
      const fieldType = postSetRecord[fieldCode]?.type;

      if (!isSemanticValueMatch(sourceVal, readBackVal, fieldType)) {
        throw new Error(`Form state read-back mismatch for field ${fieldCode}: expected ${JSON.stringify(sourceVal)}, got ${JSON.stringify(readBackVal)}`);
      }
    }
  }

  return true;
}

if (typeof kintone !== 'undefined') {
  const ROUTING_APP_ID = 795;
  const EMPLOYEE_APP_ID = 53;
  const SCORING_APP_ID = 796;

  function getMboAppId() {
    return kintone.app.getId() || 794;
  }

  // D1: Production gate initialization — fail closed if gate cannot be created.
  if (!mboLoginGate) {
    try {
      const app801Api = {
        getRecords: (appId, query) => kintoneApiWrapper.getRecords(appId, query),
        updateRecord: (appId, id, record) =>
          kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', {
            app: appId, id: Number(id), record
          })
      };
      const authAdapter = new MboKintoneAuthAdapter({ api: app801Api });
      const sessionManager = new MboSessionManager({
        adapter: authAdapter,
        getKintoneUser: () => (typeof kintone !== 'undefined' && kintone.getLoginUser ? kintone.getLoginUser() : null)
      });
      mboLoginGate = new MboKintoneLoginGate(authAdapter, { sessionManager });
    } catch (initErr) {
      console.error('[MBO V2] FATAL: Failed to initialize MBO Login Gate.', initErr);
      // mboLoginGate remains null → all record handlers will fail closed
    }
  }

  function hideAllNativeFields(record) {
    Object.keys(record).forEach(code => {
      try {
        kintone.app.record.setFieldShown(code, false);
      } catch (e) {
        // ignore system fields that cannot be hidden
      }
    });
  }

  function findNativeCancelButton() {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        const selectors = [
          '.gaia-ui-actionmenu-cancel',
          '.gaia-argui-app-menu-cancel',
          'button.gaia-ui-actionmenu-cancel',
          'button.gaia-argui-app-menu-cancel'
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            return el;
          }
        }
      }
    } catch (e) {
      // ignore non-browser environment DOM errors
    }
    return null;
  }

  function hideNativeSaveCancelControls() {
    try {
      if (typeof document !== 'undefined' && document.querySelectorAll) {
        const selectors = [
          '.gaia-ui-actionmenu-save',
          '.gaia-ui-actionmenu-cancel',
          '.gaia-argui-app-menu-save',
          '.gaia-argui-app-menu-cancel',
          'button.gaia-ui-actionmenu-save',
          'button.gaia-ui-actionmenu-cancel'
        ];
        selectors.forEach(sel => {
          const els = document.querySelectorAll(sel);
          els.forEach(el => {
            if (el && el.style) {
              el.style.display = 'none';
            }
          });
        });
      }
    } catch (e) {
      // ignore non-browser environment DOM errors
    }
  }

  /**
   * B7: Render a visible, full-page blocking access-denied notice on host using textContent.
   * On existing record error states (isCreate === false) or explicit showBackToMyMbo: true,
   * mounts canonical EmployeeRecordNavigation.
   * On authenticated terminal fatal Create (options.isCreate === true && options.hideNativeSaveCancel === true),
   * Back action invokes native Kintone Cancel semantics to discard dirty Create state without leave-confirmation.
   */
  function renderBlockedNotice(host, title, detail, options = {}) {
    if (!host) host = document.querySelector('.gaia-app-wrapper') || document.body;
    host.innerHTML = '';

    const showBackToMyMbo = options.showBackToMyMbo ?? (options.isCreate === false);
    const appId = options.appId || getMboAppId();

    if (showBackToMyMbo) {
      let onNavigateHome = options.onNavigateHome;

      if (options.isCreate === true && options.hideNativeSaveCancel === true && !onNavigateHome) {
        const nativeCancelBtn = findNativeCancelButton();
        if (nativeCancelBtn && typeof nativeCancelBtn.click === 'function') {
          onNavigateHome = () => {
            try {
              nativeCancelBtn.click();
            } catch (err) {
              console.error('[MBO V2] Native cancel invocation failed:', err);
            }
          };
        } else {
          onNavigateHome = () => {
            console.error('[MBO V2] FAIL_CLOSED: Native cancel control missing on fatal Create');
          };
        }
      }

      const nav = new EmployeeRecordNavigation({ appId, onNavigateHome });
      const backBar = nav.renderBackToMyMboBar({ isCreate: false, onNavigateHome });
      if (backBar) {
        host.appendChild(backBar);
      }
    }

    const box = document.createElement('div');
    box.style.cssText = 'padding:32px;border:2px solid #c00;border-radius:8px;background:#fff5f5;font-family:sans-serif;max-width:600px;margin:20px auto;';

    const h2 = document.createElement('h2');
    h2.style.cssText = 'margin:0 0 12px;color:#c00;font-size:18px;';
    h2.textContent = `⛔ ${title}`;

    const p = document.createElement('p');
    p.style.cssText = 'margin:0;color:#555;font-size:14px;white-space:pre-wrap;line-height:1.5;';
    p.textContent = String(detail || '');

    box.appendChild(h2);
    box.appendChild(p);
    host.appendChild(box);

    if (options.hideNativeSaveCancel === true) {
      hideNativeSaveCancelControls();
    }
  }

  /**
   * B1: Renders Employee Self custom index for authenticated Employee_Code.
   * Delegates rendering to EmployeeSelfIndexUI while keeping main-mbo-app.js orchestration-only.
   */
  async function renderEmployeeSelfIndex(event, host, authenticatedEmployeeCode) {
    const indexUi = new EmployeeSelfIndexUI({
      kintoneApiWrapper,
      getMboAppId,
      mboLoginGate,
      renderBlockedNotice
    });
    return indexUi.render(event, host, authenticatedEmployeeCode);
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

  // Hook 0: Index/List — require authentication/identity resolution before any list content is accessible.
  kintone.events.on('app.record.index.show', function (event) {
    const host = document.querySelector('.gaia-app-wrapper') || document.body;

    const resPipeline = (async () => {
      const res = await resolveRuntimeEmployeeSelfContext(host);
      if (res.status === 'TECHNICAL_ADMIN') {
        currentEmployeeSelfContext = null;
        return event;
      }

      if (res.status !== 'SUCCESS') {
        currentEmployeeSelfContext = null;
        const title = res.status === 'DEDICATED_MAPPING_FAILED'
          ? 'Employee Identity Mapping Failed'
          : 'Authentication Required';
        const detail = res.reason || 'Access denied or authentication required for Employee-Self.';
        renderBlockedNotice(host, title, detail);
        const recordList = document.querySelector('.recordlist-gaia') || document.querySelector('.gaia-argus-app-index-readonly');
        if (recordList) recordList.style.display = 'none';
        return event;
      }

      currentEmployeeSelfContext = res.context;
      const gateForIndex = res.context.mode === 'SHARED' ? mboLoginGate : null;
      const indexUi = new EmployeeSelfIndexUI({
        kintoneApiWrapper,
        getMboAppId,
        mboLoginGate: gateForIndex,
        renderBlockedNotice
      });
      const indexRes = await indexUi.render(event, host, res.context.employeeCode);

      if (res.context.mode === 'DEDICATED') {
        const appId = getMboAppId();
        const headerSpace = (typeof kintone !== 'undefined' && kintone.app && typeof kintone.app.getHeaderSpaceElement === 'function')
          ? kintone.app.getHeaderSpaceElement()
          : null;
        const containerHost = headerSpace || host || document.body;

        try {
          const approvalTasks = await MboApprovalTaskService.fetchApprovalTasks(res.context, appId, kintoneApiWrapper);
          ApproverTaskIndexUI.render(containerHost, approvalTasks);
        } catch (err) {
          console.error('[MBO V2] Dedicated approval tasks fetch failed:', err);
          ApproverTaskIndexUI.renderError(containerHost, err);
        }
      }

      return indexRes;
    })();

    return resPipeline;
  });

  function setupRecordUiWithAuth(event, record, isCreate, isEdit, isDetail, uiHost, contextOrCode) {
    let isAutoloadingInCreateHandler = false;
    if (typeof contextOrCode !== 'object' || contextOrCode === null) {
      throw new Error('INVALID_EMPLOYEE_SELF_CONTEXT: Valid resolved Employee-Self context object is required.');
    }

    const context = contextOrCode;
    const userCode = typeof context.kintoneUserCode === 'string' ? context.kintoneUserCode : '';

    if (!context.mode || (context.mode !== 'SHARED' && context.mode !== 'DEDICATED') ||
        !context.employeeCode || !userCode || userCode !== userCode.trim()) {
      throw new Error('INVALID_EMPLOYEE_SELF_CONTEXT: Valid resolved Employee-Self context is required.');
    }

    const authenticatedEmployeeCode = context.employeeCode;

    // 4. D1: Render auth controls bar ONLY for SHARED mode
    if (context.mode === 'SHARED' && mboLoginGate && typeof mboLoginGate.renderAuthBar === 'function') {
      mboLoginGate.renderAuthBar(uiHost, authenticatedEmployeeCode);
    }

    // 5. D1: Detail/Edit — block if record belongs to a different employee.
    if (!isCreate && record.Employee_Code?.value &&
        record.Employee_Code.value !== authenticatedEmployeeCode) {
      renderBlockedNotice(uiHost,
        'Access Denied',
        `This MBO record belongs to a different employee.\nAuthenticated: ${authenticatedEmployeeCode}\nRecord: ${record.Employee_Code.value}`,
        { isCreate, appId: event.appId || getMboAppId() }
      );
      hideAllNativeFields(record);
      return event;
    }

    const stage = resolveBusinessStage(event);

    // 2. Instantiate and render Custom UI
    const loginUser = (typeof kintone !== 'undefined' && kintone.getLoginUser) ? kintone.getLoginUser() : null;
    const loginUserCode = loginUser?.code || null;

    const options = {
      container: uiHost,
      record: record,
      stage: stage,
      isEditable: isCreate || isEdit,
      isCreate: isCreate,
      loginUserCode: loginUserCode,
      authenticatedEmployeeCode: authenticatedEmployeeCode,
      kintoneApiWrapper: kintoneApiWrapper,
      appId: event.appId || getMboAppId(),
      isPreviewMode: false,
      onFieldChange: (code, val) => {
        if (record[code]) {
          record[code].value = val;
        }
        if (!isAutoloadingInCreateHandler) {
          syncRecordToKintone(record);
        }
      },
      onEmployeeCodeChanged: (newCode) => {
        const USER_SELECT_FIELDS = new Set([
          'Requester_User',
          'Manager_Level1_Approvers',
          'Manager_Level2_Approvers',
          'GM_Level1_Approvers',
          'GM_Level2_Approvers',
          'First_Manager_User',
          'Manager_User',
          'GM_User'
        ]);

        const fieldsToClear = [
          'Employee_Name', 'Employee_Name_TH', 'Employee_Section',
          'Employee_Department', 'Employee_Position', 'Employee_Email',
          'Employee_Start_Date', 'Department_Hoshin', 'Section_Hoshin', 'Record_Key',
          'Manager_Level1_Approvers', 'Manager_Level2_Approvers',
          'GM_Level1_Approvers', 'GM_Level2_Approvers',
          'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology',
          'First_Manager_User', 'Manager_User', 'GM_User', 'Requester_User'
        ];
        if (record.Employee_Code) {
          record.Employee_Code.value = newCode;
        }
        fieldsToClear.forEach(k => {
          const clearVal = USER_SELECT_FIELDS.has(k) ? [] : '';
          if (record[k]) {
            record[k].value = clearVal;
          }
        });
        if (!isAutoloadingInCreateHandler) {
          syncRecordToKintone(record);
        }
      },
      onLookupEmployee: async (empCode) => {
        // Step 1: Employee Lookup from App 53 (Read-Only)
        const empLookupRes = await EmployeeService.lookupEmployee(empCode, kintoneApiWrapper);
        const empProfile = empLookupRes.employee || empLookupRes;

        // Step 2: Routing Profile Resolution & Hybrid Requester / Route Composition
        const loginUserCode = context.kintoneUserCode;
        let routeProfile = await RoutingService.resolveRoutingProfile(
          ROUTING_APP_ID,
          empProfile.Employee_Section,
          empProfile.Team,
          kintoneApiWrapper,
          empProfile.Employee_Position
        );

        if (context.mode === 'DEDICATED') {
          routeProfile = RoutingService.applyOwnMboSelfAppraiserElision(routeProfile, loginUserCode, true);
        }

        const effectiveRequesterUsers = RoutingService.resolveEffectiveRequesterUser({
          mode: context.mode,
          kintoneUserCode: loginUserCode,
          routeRequesterUsers: routeProfile.Requester_User
        });

        const routing = {
          ...routeProfile,
          Requester_User: effectiveRequesterUsers
        };

        // Step 3: Published Scoring Configuration Lookup from App 796
        const fy = record.Fiscal_Year?.value || 'FY2026';
        let scoringConfig = null;
        try {
          const profileCode = resolveProfileCode(empProfile);
          const scoringQuery = `Profile_Code = "${profileCode}" and Config_Status in ("PUBLISHED") and Fiscal_Year = "${fy}" limit 2`;
          const scoringRes = await kintoneApiWrapper.getRecords(SCORING_APP_ID, scoringQuery);
          const scoringRecords = scoringRes?.records || [];

          if (scoringRecords.length === 0) {
            throw new Error(`ไม่พบการตั้งค่า Scoring Master (App 796) ที่สถานะ PUBLISHED สำหรับตำแหน่ง ${empProfile.Employee_Position} (${profileCode}) ใน ${fy}\nPublished scoring configuration was not found in App 796 for position ${empProfile.Employee_Position} (${profileCode}) in ${fy}.`);
          }
          if (scoringRecords.length > 1) {
            throw new Error(`พบการตั้งค่า Scoring Master (App 796) ซ้ำซ้อนสำหรับโปรไฟล์ ${profileCode} ใน ${fy}\nDuplicate published scoring configurations found in App 796 for profile ${profileCode} in ${fy}.`);
          }

          const scRec = scoringRecords[0];
          scoringConfig = {
            Profile_Code: profileCode,
            PartA_Weight: scRec.PartA_Weight?.value ? Number(scRec.PartA_Weight.value) : undefined,
            PartB_Weight: scRec.PartB_Weight?.value ? Number(scRec.PartB_Weight.value) : undefined,
            Part_A_Scoring_Mode: scRec.Part_A_Scoring_Mode?.value || '',
            Competency_Set_Code: scRec.Competency_Set_Code?.value || '',
            Configuration_Hash: scRec.Configuration_Hash?.value || ''
          };
        } catch (scoringErr) {
          console.warn('[MBO V2] Scoring resolution info:', scoringErr.message);
          // Re-throw if it's a fail-closed error
          throw scoringErr;
        }

        // Step 4: Record Key & Duplicate Check
        const generatedKey = buildRecordKey(fy, empProfile.Employee_Code);
        await EmployeeService.checkDuplicateMBO(getMboAppId(), fy, empProfile.Employee_Code, record.$id?.value, kintoneApiWrapper);

        // Step 5: Snapshot data safely into record in-memory
        const fieldsToSync = {
          Employee_Code: empProfile.Employee_Code,
          Employee_Name: empProfile.Employee_Name,
          Employee_Name_TH: empProfile.Employee_Name_TH,
          Employee_Section: empProfile.Employee_Section,
          Employee_Department: empProfile.Employee_Department,
          Employee_Position: empProfile.Employee_Position,
          Employee_Email: empProfile.Employee_Email,
          Employee_Start_Date: empProfile.Employee_Start_Date,
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

        if (empProfile.Department_Hoshin !== undefined) {
          fieldsToSync.Department_Hoshin = empProfile.Department_Hoshin;
        }
        if (empProfile.Section_Hoshin !== undefined) {
          fieldsToSync.Section_Hoshin = empProfile.Section_Hoshin;
        }

        if (scoringConfig) {
          if (scoringConfig.Profile_Code) fieldsToSync.Profile_Code = scoringConfig.Profile_Code;
          if (scoringConfig.PartA_Weight !== undefined) fieldsToSync.PartA_Weight = scoringConfig.PartA_Weight;
          if (scoringConfig.PartB_Weight !== undefined) fieldsToSync.PartB_Weight = scoringConfig.PartB_Weight;
          if (scoringConfig.Part_A_Scoring_Mode) fieldsToSync.Part_A_Scoring_Mode = scoringConfig.Part_A_Scoring_Mode;
          if (scoringConfig.Competency_Set_Code) fieldsToSync.Competency_Set_Code = scoringConfig.Competency_Set_Code;
          if (scoringConfig.Configuration_Hash) fieldsToSync.Configuration_Hash = scoringConfig.Configuration_Hash;
        }

        const CORE_SNAPSHOT_FIELDS = [
          'Profile_Code',
          'PartA_Weight',
          'PartB_Weight',
          'Part_A_Scoring_Mode',
          'Competency_Set_Code',
          'Configuration_Hash',
          'Routing_Topology',
          'Requester_User',
          'Record_Key'
        ];

        // Fail-closed if any required snapshot field is missing from form state schema
        for (const fieldCode of CORE_SNAPSHOT_FIELDS) {
          if (!record[fieldCode]) {
            throw new Error(`ไม่พบช่องข้อมูล ${fieldCode} ในแบบฟอร์ม (App 794)\nField ${fieldCode} does not exist on Kintone form schema.`);
          }
        }

        Object.entries(fieldsToSync).forEach(([k, val]) => {
          if (val !== undefined && record[k]) {
            record[k].value = val;
          }
        });

        // Push directly to Kintone Form State with verified persistence and post-set read-back
        if (!isAutoloadingInCreateHandler) {
          syncRecordToKintone(record, {
            requireVerifiedPersistence: true,
            requiredFields: CORE_SNAPSHOT_FIELDS
          });
        }
      }
    };

    const ui = new EmployeePartAUI(options);
    activeUiInstance = ui;

    try {
      ui.render();
      hideAllNativeFields(record);
    } catch (renderError) {
      console.error('[MBO V2] Error rendering custom UI:', renderError);
      renderBlockedNotice(uiHost,
        'Custom UI Render Error',
        `Failed to render MBO interface: ${renderError.message}`,
        { isCreate, appId: event.appId || getMboAppId() }
      );
    }

    // B4: Authenticated Create Autoload MUST be awaited.
    // Fail closed if lookup fails; do not leave an unverified form.
    // Duplicate check preflight runs BEFORE mutating record or executing profile lookup to keep native form clean on error.
    if (isCreate && authenticatedEmployeeCode) {
      const currentAppId = event.appId || getMboAppId();
      const fy = record.Fiscal_Year?.value || 'FY2026';

      const autoloadPipeline = (async () => {
        await EmployeeService.checkDuplicateMBO(
          currentAppId,
          fy,
          authenticatedEmployeeCode,
          record.$id?.value,
          kintoneApiWrapper
        );
        if (record.Fiscal_Year && !record.Fiscal_Year.value) {
          record.Fiscal_Year.value = 'FY2026';
        }
        isAutoloadingInCreateHandler = true;
        return ui.executeLookup(authenticatedEmployeeCode);
      })();

      return autoloadPipeline.then(() => event).catch(err => {
        console.error('[MBO V2] Employee profile resolution failed during create show autoload:', err);
        renderBlockedNotice(uiHost,
          'Employee Profile Resolution Failed',
          `Could not resolve Employee profile for ${authenticatedEmployeeCode}: ${err.message}`,
          { isCreate: true, showBackToMyMbo: true, hideNativeSaveCancel: true, appId: currentAppId }
        );
        hideAllNativeFields(record);
        return event;
      }).finally(() => {
        isAutoloadingInCreateHandler = false;
      });
    }

    return event;
  }

  // Hook 1: Record Show (Detail, Edit, Create)
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show', 'app.record.create.show'], function (event) {
    const record = event.record;
    const isCreate = event.type === 'app.record.create.show';
    const isEdit = event.type === 'app.record.edit.show';
    const isDetail = event.type === 'app.record.detail.show';
    const appId = event.appId || getMboAppId();

    // 1. B3: Resolve UI host element safely. If missing, fail closed without retaining native form.
    let uiHost = getRecordUiHost('SPACE_HEADER');
    if (!uiHost) {
      uiHost = document.querySelector('.gaia-app-wrapper') || document.body;
      renderBlockedNotice(uiHost,
        'Custom UI Host Missing',
        'Required UI header element (SPACE_HEADER) was not found. Access blocked. [FAIL_CLOSED_NO_HOST]',
        { isCreate, appId }
      );
      hideAllNativeFields(record);
      return event;
    }

    const handleResolvedContext = (res) => {
      if (res.status === 'TECHNICAL_ADMIN') {
        currentEmployeeSelfContext = null;
        renderBlockedNotice(uiHost,
          'Technical Admin Identity Restriction',
          'Technical admin identity cannot perform Employee-Self operations. [FAIL_CLOSED_TECH_ADMIN]',
          { isCreate, appId }
        );
        hideAllNativeFields(record);
        return event;
      }

      if (res.status !== 'SUCCESS') {
        currentEmployeeSelfContext = null;
        const title = res.status === 'DEDICATED_MAPPING_FAILED'
          ? 'Employee Identity Mapping Failed'
          : 'Authentication Required';
        const detail = res.reason || 'You must be authenticated to access this page. [FAIL_CLOSED_NO_CODE]';
        renderBlockedNotice(uiHost, title, detail, { isCreate, appId });
        hideAllNativeFields(record);
        return event;
      }

      currentEmployeeSelfContext = res.context;
      return setupRecordUiWithAuth(event, record, isCreate, isEdit, isDetail, uiHost, res.context);
    };

    const res = resolveRuntimeEmployeeSelfContext(uiHost);
    if (res && typeof res.then === 'function') {
      return res.then(handleResolvedContext);
    }

    return handleResolvedContext(res);
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

    // 2. Must verify employee before save (Fail-Closed: block if UI instance is missing or unverified)
    if (!activeUiInstance || activeUiInstance.isEmployeeVerified !== true) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors([{
          field: 'Employee_Code',
          messageTH: 'กรุณาระบุรหัสพนักงานและกดค้นหาเพื่อยืนยันข้อมูลก่อนบันทึก',
          messageEN: 'Please enter Employee Code and click Search to verify employee profile before saving.',
          message: 'กรุณาระบุรหัสพนักงานและกดค้นหาเพื่อยืนยันข้อมูลก่อนบันทึก'
        }]);
      }
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

    // 4. Duplicate Check Guard (Fail-Closed)
    try {
      const currentId = record.$id?.value;
      const query = `Record_Key = "${recordKey}" ${currentId ? `and $id != "${currentId}"` : ''}`;
      const duplicateRes = await kintoneApiWrapper.getRecords(getMboAppId(), query);

      if (!duplicateRes || typeof duplicateRes !== 'object' || !Array.isArray(duplicateRes.records)) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: 'Employee_Code',
            messageTH: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator',
            messageEN: 'Unable to verify record uniqueness. Please try again or contact HR / Administrator.',
            message: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator'
          }]);
        }
        return false;
      }

      if (duplicateRes.records.length > 0) {
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
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors([{
          field: 'Employee_Code',
          messageTH: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator',
          messageEN: 'Unable to verify record uniqueness. Please try again or contact HR / Administrator.',
          message: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator'
        }]);
      }
      return false;
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

    // 6. Attachment Submit Lifecycle Integration (Pre-Save File Upload & Plan Preparation)
    if (activeUiInstance) {
      const hasAttachmentChanges = typeof activeUiInstance.hasPendingOrDirtyAttachments === 'function'
        ? activeUiInstance.hasPendingOrDirtyAttachments()
        : Boolean(activeUiInstance.pendingAttachments && Object.keys(activeUiInstance.pendingAttachments).some(k => Array.isArray(activeUiInstance.pendingAttachments[k]) && activeUiInstance.pendingAttachments[k].length > 0));

      if (hasAttachmentChanges) {
        try {
          let persistedRecord = null;
          if (!isCreate) {
            const appId = event.appId || getMboAppId();
            const recordId = event.recordId || record?.$id?.value;
            if (!appId || !recordId) {
              throw new Error('MISSING_RECORD_IDENTIFIER: appId or recordId is missing for edit attachment plan.');
            }
            if (typeof kintoneApiWrapper.getRecord === 'function') {
              persistedRecord = await kintoneApiWrapper.getRecord(appId, recordId);
            } else if (globalThis.kintone?.api) {
              const url = globalThis.kintone.api.url('/k/v1/record.json', true);
              const resp = await globalThis.kintone.api(url, 'GET', { app: appId, id: recordId });
              persistedRecord = resp ? resp.record : null;
            }

            if (!persistedRecord || typeof persistedRecord !== 'object') {
              throw new Error('PERSISTED_RECORD_GET_FAILED: Kintone GET record returned null or invalid object.');
            }
          }
          await activeUiInstance.preparePendingAttachments({
            record: event.record,
            persistedRecord,
            isEdit: !isCreate
          });
        } catch (err) {
          console.error('[MBO V2] Attachment submit upload error:', err);
          activeUiInstance.showValidationErrors([{
            field: 'Objective_Attachment_1',
            messageTH: `เกิดข้อผิดพลาดในการอัปโหลดไฟล์แนบ: ${err.message}`,
            messageEN: `Attachment upload failed: ${err.message}`,
            message: `Attachment upload failed: ${err.message}`
          }]);
          return false; // Fail closed: cancel submit before upload
        }
      }
    }

    return event;
  });

  // Hook 3: Record Submit Success (Post-Save Attachment REST Finalization)
  kintone.events.on(['app.record.create.submit.success', 'app.record.edit.submit.success'], async function (event) {
    const appId = event.appId || getMboAppId();
    const recordId = event.recordId || event.record?.$id?.value;

    if (activeUiInstance && recordId) {
      try {
        await activeUiInstance.finalizeAttachmentPlan({ appId, recordId });
      } catch (err) {
        console.error('[MBO V2] Attachment post-save finalize error:', err);
        const errorMsgTH = `บันทึกข้อมูลสำเร็จ แต่เกิดข้อผิดพลาดในการบันทึกไฟล์แนบ: ${err.message}`;
        const errorMsgEN = `Record saved, but attachment binding failed: ${err.message}`;

        if (typeof activeUiInstance.showValidationErrors === 'function') {
          activeUiInstance.showValidationErrors([{
            field: 'Objective_Attachment_1',
            messageTH: errorMsgTH,
            messageEN: errorMsgEN,
            message: errorMsgEN
          }]);
        }

        if (typeof globalThis.alert === 'function') {
          try { globalThis.alert(`${errorMsgTH}\n${errorMsgEN}`); } catch (e) {}
        } else if (globalThis.kintone?.showNotification) {
          try { globalThis.kintone.showNotification({ text: `${errorMsgTH} / ${errorMsgEN}`, type: 'error' }); } catch (e) {}
        }

        if (typeof globalThis.location !== 'undefined' && globalThis.location?.href) {
          event.url = globalThis.location.href;
        } else {
          event.url = null;
        }

        return event;
      }
    }

    return event;
  });

  // Hook 3: Process Action (Workflow Proceed)
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const record = event.record;
    const actionName = event.action?.value || '';
    const stage = resolveBusinessStage(event);

    // 1. Topology & Action Validation (Fail-Closed)
    const actionValidation = ValidationEngine.validateWorkflowAction(record, actionName, stage);
    if (!actionValidation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(actionValidation.fieldErrors);
      }
      return false; // Cancel transition
    }

    // 2. Stage Business Rule Validation
    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(validation.fieldErrors);
      }
      return false; // Cancel transition
    }

    return event;
  });

  // Hook 4: Record Deletion Submission Guard (Fail-Closed)
  kintone.events.on(['app.record.detail.delete.submit', 'app.record.index.delete.submit'], function (event) {
    const policy = new DeleteGuardPolicy({
      mboLoginGate,
      getEmployeeSelfContext: () => currentEmployeeSelfContext
    });
    return policy.evaluateDeleteSubmit(event);
  });
}
