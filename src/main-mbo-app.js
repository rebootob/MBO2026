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
import { LiveBusinessDateProvider } from './services/live-business-date-provider.js';
import { resolveProfileCodeForSnapshot as resolveProfileCode } from './profiles/runtime-profile-resolver.js';
import { MboKintoneLoginGate } from './ui/mbo-kintone-login-gate.js';
import { MboKintoneAuthAdapter } from './ui/mbo-kintone-auth-adapter.js';
import { MboSessionManager } from './ui/mbo-session-manager.js';
import { EmployeeSelfIndexUI } from './ui/employee-self-index-ui.js';
import { ApproverTaskIndexUI } from './ui/approver-task-index-ui.js';
import { MboApprovalTaskService } from './services/mbo-approval-task-service.js';
import { EmployeeRecordNavigation } from './ui/employee-record-navigation.js';
import { DeleteGuardPolicy } from './security/delete-guard-policy.js';
import { RevisionArchiveService } from './services/revision-archive-service.js';
import { RevisionArchiveKintoneRepository } from './services/revision-archive-kintone-repository.js';
import { D3_ROUTE_PATTERNS, D3_SLOT_DEFINITIONS } from './config/d3-route-contract.js';

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
  },
  getUserGroups: async (userCode) => {
    if (typeof kintone === 'undefined' || typeof kintone.api !== 'function') {
      throw new Error('Kintone API is unavailable');
    }
    const url = (typeof kintone.api.url === 'function')
      ? kintone.api.url('/v1/user/groups.json', true)
      : '/v1/user/groups.json';
    const resp = await kintone.api(url, 'GET', { code: userCode });
    return resp ? resp.groups : [];
  },
  addRecord: async (appId, recordData) => {
    if (typeof kintone === 'undefined' || typeof kintone.api !== 'function') {
      throw new Error('Kintone API is unavailable');
    }
    const url = (typeof kintone.api.url === 'function')
      ? kintone.api.url('/k/v1/record.json', true)
      : '/k/v1/record.json';
    const resp = await kintone.api(url, 'POST', { app: appId, record: recordData });
    return resp;
  }
};

/**
 * D1: Module-level MBO Login Gate. Initialized to null → fail closed.
 * Set by production initialization block or by setMboLoginGate() in tests.
 */
let mboLoginGate = null;

// D3 testability-only deterministic business-date injection.
// Default remains null so production continues to fail closed until a
// LIVE_BUSINESS_DATE_PROVIDER is explicitly designed and authorized.
let testResolutionBusinessDate = null;

export function setResolutionBusinessDateForTests(value) {
  if (value === null) {
    testResolutionBusinessDate = null;
    return;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      'TEST_RESOLUTION_BUSINESS_DATE_INVALID: Expected YYYY-MM-DD or null.'
    );
  }

  testResolutionBusinessDate = value;
}

let liveBusinessDateProvider = LiveBusinessDateProvider;

export function setLiveBusinessDateProviderForTests(provider) {
  liveBusinessDateProvider = provider || LiveBusinessDateProvider;
}

export function getLiveBusinessDateProvider() {
  return liveBusinessDateProvider;
}

/**
 * Production seam: Resolves D3 Model A route profile with canonical K and authoritative business date.
 * Exercised by production onLookupEmployee and directly testable without code duplication.
 */
export async function resolveD3RoutingProfileWithDateSeam(
  routingAppId,
  section,
  team,
  apiWrapper,
  position,
  routingOptions = {},
  authOptions = {},
  options = {},
  provider = liveBusinessDateProvider
) {
  const resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;
  const effectiveResolutionBusinessDate = resolutionBusinessDate || await provider.getBusinessDate();
  if (!effectiveResolutionBusinessDate || typeof effectiveResolutionBusinessDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveResolutionBusinessDate)) {
    throw new Error('Explicit resolution business date (YYYY-MM-DD) is required for D3 Model A resolution (RESOLUTION_BUSINESS_DATE_REQUIRED).');
  }

  return RoutingService.resolveRoutingProfile(
    routingAppId,
    section,
    team,
    apiWrapper,
    position,
    {
      ...routingOptions,
      resolutionBusinessDate: effectiveResolutionBusinessDate
    }
  );
}

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

function resolveRuntimeEmployeeSelfContext(uiHost, options = {}) {
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

      // 5. If Employee mapping does NOT exist: check authoritative Kintone group membership.
      let userGroups = [];
      try {
        if (typeof options?.userGroupsFetcher === 'function') {
          userGroups = await options.userGroupsFetcher(kintoneUserCode);
        } else if (kintoneApiWrapper && typeof kintoneApiWrapper.getUserGroups === 'function') {
          userGroups = await kintoneApiWrapper.getUserGroups(kintoneUserCode);
        } else if (typeof kintone !== 'undefined' && typeof kintone.api === 'function') {
          const url = (typeof kintone.api.url === 'function')
            ? kintone.api.url('/v1/user/groups.json', true)
            : '/v1/user/groups.json';
          const resp = await kintone.api(url, 'GET', { code: kintoneUserCode });
          userGroups = resp?.groups || [];
        }
      } catch (groupErr) {
        // 7. If HR group verification fails/errors: FAIL CLOSED. Preserve DEDICATED_MAPPING_FAILED.
        userGroups = [];
      }

      // 6. Only if the authenticated principal is verified as a member of HR_ADMIN_GROUP may runtime resolve HR_ADMIN.
      if (MboIdentityService.isHrAdminGroupMember(userGroups)) {
        return {
          status: 'HR_ADMIN',
          mode: 'HR_ADMIN',
          context: { mode: 'HR_ADMIN', kintoneUserCode }
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
      mboLoginGate = new MboKintoneLoginGate(authAdapter, {
        sessionManager,
        checkSharedEligibility: (empCode) => EmployeeService.checkSharedLoginEligibility(empCode, kintoneApiWrapper)
      });
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

      if (res.status === 'HR_ADMIN') {
        currentEmployeeSelfContext = res.context;
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

  function setupRecordUiWithAuth(event, record, isCreate, isEdit, isDetail, uiHost, contextOrCode, authOptions = {}) {
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

    // 5. D1: Detail/Edit — block if record belongs to a different employee, UNLESS authorized cross-employee Detail.
    if (!isCreate && record.Employee_Code?.value &&
        record.Employee_Code.value !== authenticatedEmployeeCode) {
      const isAllowedCrossEmployee = isDetail && context.mode === 'DEDICATED' && authOptions?.isCrossEmployeeDetailAuthorized === true;
      if (!isAllowedCrossEmployee) {
        renderBlockedNotice(uiHost,
          'Access Denied',
          `This MBO record belongs to a different employee.\nAuthenticated: ${authenticatedEmployeeCode}\nRecord: ${record.Employee_Code.value}`,
          { isCreate, appId: event.appId || getMboAppId() }
        );
        hideAllNativeFields(record);
        return event;
      }
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
          'Manager_Level1_Approval_Rule', 'Manager_Level2_Approval_Rule',
          'GM_Level1_Approval_Rule', 'GM_Level2_Approval_Rule',
          'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology',
          'First_Manager_User', 'Manager_User', 'GM_User', 'Requester_User',
          'Frozen_Profile_Code', 'K_expected_Snapshot', 'Effective_Routing_Key',
          'Effective_Route_Version_Key', 'Effective_Scorer_Slots_Snapshot',
          'Profile_Code', 'PartA_Weight', 'PartB_Weight', 'Part_A_Scoring_Mode',
          'Competency_Set_Code', 'Configuration_Hash'
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

        // Step 2: Frozen Profile Code Resolution
        const profileCode = resolveProfileCode(empProfile);

        // Step 3: Published Scoring Configuration Lookup from App 796
        const fy = record.Fiscal_Year?.value || 'FY2026';
        let scoringConfig = null;
        try {
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
            Expected_Appraiser_Count: scRec.Expected_Appraiser_Count?.value ? Number(scRec.Expected_Appraiser_Count.value) : undefined,
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

        // Step 4: Extract & Validate Expected_Appraiser_Count from App 796 Scoring Config
        const kExpected = scoringConfig.Expected_Appraiser_Count;
        if (kExpected !== 1 && kExpected !== 2) {
          throw new Error(`ไม่พบหรือค่า Expected_Appraiser_Count ไม่ถูกต้องใน Scoring Master (App 796) สำหรับโปรไฟล์ ${profileCode} (K_EXPECTED_NOT_CONFIGURED)\nExpected_Appraiser_Count must be 1 or 2 in App 796 scoring configuration for profile ${profileCode}.`);
        }

        // Step 5: D3 Model A Route Resolution with Canonical K & Explicit Business Date
        // LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
        const resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;
        const loginUserCode = context.kintoneUserCode;
        let routeProfile = await resolveD3RoutingProfileWithDateSeam(
          ROUTING_APP_ID,
          empProfile.Employee_Section,
          empProfile.Team,
          kintoneApiWrapper,
          empProfile.Employee_Position,
          {
            d3: true,
            existingRecord: record,
            employeeSnapshot: empProfile,
            employeeUserCode: loginUserCode,
            isOwnMbo: context.mode === 'DEDICATED',
            frozenProfileCode: profileCode,
            kExpected: kExpected
          },
          authOptions,
          options,
          liveBusinessDateProvider
        );

        if (context.mode === 'DEDICATED' && !routeProfile.Effective_Route_Version_Key) {
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

        // Step 6: Record Key & Duplicate Check
        const generatedKey = buildRecordKey(fy, empProfile.Employee_Code);
        await EmployeeService.checkDuplicateMBO(getMboAppId(), fy, empProfile.Employee_Code, record.$id?.value, kintoneApiWrapper);

        // Step 7: Snapshot data safely into record in-memory
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

        if (routing.Frozen_Profile_Code !== undefined) fieldsToSync.Frozen_Profile_Code = routing.Frozen_Profile_Code;
        if (routing.K_expected_Snapshot !== undefined) fieldsToSync.K_expected_Snapshot = routing.K_expected_Snapshot;
        if (routing.Effective_Routing_Key !== undefined) fieldsToSync.Effective_Routing_Key = routing.Effective_Routing_Key;
        if (routing.Effective_Route_Version_Key !== undefined) fieldsToSync.Effective_Route_Version_Key = routing.Effective_Route_Version_Key;
        if (routing.Effective_Scorer_Slots_Snapshot !== undefined) fieldsToSync.Effective_Scorer_Slots_Snapshot = routing.Effective_Scorer_Slots_Snapshot;

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

        const D3_PROVENANCE_FIELDS = [
          'Frozen_Profile_Code',
          'K_expected_Snapshot',
          'Effective_Routing_Key',
          'Effective_Route_Version_Key',
          'Effective_Scorer_Slots_Snapshot'
        ];

        const isD3ProvenanceActive = Boolean(
          routing.Effective_Route_Version_Key ||
          routing.Frozen_Profile_Code ||
          record.Effective_Route_Version_Key
        );

        const requiredSnapshotFields = isD3ProvenanceActive
          ? [...CORE_SNAPSHOT_FIELDS, ...D3_PROVENANCE_FIELDS]
          : CORE_SNAPSHOT_FIELDS;

        // Fail-closed if any required snapshot field is missing from form state schema
        for (const fieldCode of requiredSnapshotFields) {
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
            requiredFields: requiredSnapshotFields
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

    const handleResolvedContext = async (res) => {
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

      if (res.status === 'HR_ADMIN') {
        currentEmployeeSelfContext = res.context;
        if (isCreate) {
          renderBlockedNotice(uiHost,
            'Create Restricted',
            'HR Admin does not have creation authority in App 794.',
            { isCreate, appId }
          );
          hideAllNativeFields(record);
          return event;
        }
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

      let isCrossEmployeeDetailAuthorized = false;
      const isDifferentEmployee = !isCreate && record?.Employee_Code?.value && record.Employee_Code.value !== res.context.employeeCode;

      if (isDifferentEmployee) {
        if (isDetail && res.context.mode === 'DEDICATED') {
          const recordId = event.recordId || record?.$id?.value || record?.Record_ID?.value;
          if (!recordId) {
            renderBlockedNotice(uiHost, 'Access Denied', 'Record ID missing for approval task revalidation.', { isCreate, appId });
            hideAllNativeFields(record);
            return event;
          }
          try {
            const revalRes = await MboApprovalTaskService.revalidateApprovalTask(res.context, appId, recordId, kintoneApiWrapper);
            if (revalRes && revalRes.authorized === true) {
              isCrossEmployeeDetailAuthorized = true;
            } else {
              renderBlockedNotice(uiHost, 'Access Denied', 'Cross-employee approval task authority denied.', { isCreate, appId });
              hideAllNativeFields(record);
              return event;
            }
          } catch (err) {
            renderBlockedNotice(uiHost, 'Access Denied', `Cross-employee approval task revalidation failed: ${err.message}`, { isCreate, appId });
            hideAllNativeFields(record);
            return event;
          }
        }
      }

      return setupRecordUiWithAuth(
        event,
        record,
        isCreate,
        isEdit,
        isDetail,
        uiHost,
        res.context,
        {
          isCrossEmployeeDetailAuthorized,
          resolutionBusinessDate: testResolutionBusinessDate
        }
      );
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
  kintone.events.on('app.record.detail.process.proceed', async function (event) {
    const record = event.record;
    const actionName = event.action?.value || '';
    const stage = resolveBusinessStage(event);

    const context = currentEmployeeSelfContext;
    const recordEmpCode = record?.Employee_Code?.value;
    const isCrossEmployee = Boolean(context && recordEmpCode && context.employeeCode && recordEmpCode !== context.employeeCode);

    if (isCrossEmployee) {
      if (context.mode !== 'DEDICATED') {
        return false;
      }

      const appId = event.appId || getMboAppId();
      const recordId = event.recordId || record?.$id?.value;
      if (!recordId) {
        return false;
      }

      try {
        const revalRes = await MboApprovalTaskService.revalidateApprovalTask(context, appId, recordId, kintoneApiWrapper);
        if (!revalRes || revalRes.authorized !== true) {
          return false;
        }
      } catch (err) {
        return false;
      }
    }

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

    // 3. Stage Completion Snapshot Archive for D3 Lifecycle Transitions
    const archiveOutcome = await executeProcessTransitionArchive(record, event, {
      apiAdapter: kintoneApiWrapper
    });
    if (archiveOutcome && archiveOutcome.success === false) {
      const errDetail = archiveOutcome.error || 'Archive verification failed';
      if (activeUiInstance && typeof activeUiInstance.showValidationErrors === 'function') {
        activeUiInstance.showValidationErrors([{
          field: 'Record_Key',
          message: `Stage Archive Failed: ${errDetail}`,
          messageTH: `การบันทึกประวัติสถานะ (Stage Archive) ไม่สำเร็จ: ${errDetail}`,
          messageEN: `Stage Archive Failed: ${errDetail}`
        }]);
      }
      return false; // Fail-closed: block transition
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

/**
 * D3 Stage Completion Archive Integration: Builds coherent logical snapshot from record data
 * Strictly enforces exact persisted values and fails closed without fallbacks.
 */
export function buildStageLogicalSnapshot(record, targetStage, currentStatus) {
  const getVal = (f) => (record && record[f] && typeof record[f] === 'object' && 'value' in record[f]) ? record[f].value : record?.[f];

  const sourceRecordKey = String(getVal('Record_Key') || '').trim();
  if (!sourceRecordKey) {
    throw new Error('PROVENANCE_MISSING: Record_Key is required');
  }

  const employeeCode = String(getVal('Employee_Code') || '').trim();
  if (!employeeCode) {
    throw new Error('PROVENANCE_MISSING: Employee_Code is required');
  }

  const fiscalYear = String(getVal('Fiscal_Year') || '').trim();
  if (!fiscalYear) {
    throw new Error('PROVENANCE_MISSING: Fiscal_Year is required');
  }

  const rawRecordId = Number(getVal('$id') || getVal('Record_ID') || 0);

  const rawRev = getVal('Revision_Number') ?? getVal('Current_Revision_Number');
  const revisionNumber = Number(rawRev);
  if (!Number.isInteger(revisionNumber) || revisionNumber < 1) {
    throw new Error(`PROVENANCE_INVALID: Revision_Number must be a positive integer, got "${rawRev}"`);
  }

  const frozenProfileCode = String(getVal('Frozen_Profile_Code') || getVal('Profile_Code') || '').trim();
  if (!frozenProfileCode) {
    throw new Error('PROVENANCE_MISSING: Frozen_Profile_Code is required');
  }

  const rawK = getVal('K_expected_Snapshot');
  const kExpected = Number(rawK);
  if (kExpected !== 1 && kExpected !== 2) {
    throw new Error(`PROVENANCE_INVALID: K_expected_Snapshot must be 1 or 2, got "${rawK}"`);
  }

  const routePattern = String(getVal('Route_Pattern') || '').trim();
  if (!routePattern || !D3_ROUTE_PATTERNS[routePattern]) {
    throw new Error(`PROVENANCE_INVALID: Route_Pattern "${routePattern}" is invalid or unmapped`);
  }
  const patternDef = D3_ROUTE_PATTERNS[routePattern];

  const routingTopology = String(getVal('Routing_Topology') || '').trim();
  if (!routingTopology) {
    throw new Error('PROVENANCE_MISSING: Routing_Topology is required');
  }
  if (routingTopology !== patternDef.topology) {
    throw new Error(`PROVENANCE_MISMATCH: Routing_Topology "${routingTopology}" does not match pattern topology "${patternDef.topology}"`);
  }

  const effectiveRoutingKey = String(getVal('Effective_Routing_Key') || '').trim();
  if (!effectiveRoutingKey) {
    throw new Error('PROVENANCE_MISSING: Effective_Routing_Key is required');
  }
  const effectiveRouteVersionKey = String(getVal('Effective_Route_Version_Key') || '').trim();
  if (!effectiveRouteVersionKey) {
    throw new Error('PROVENANCE_MISSING: Effective_Route_Version_Key is required');
  }

  // Workflow appraisers: strictly mapped from active slots defined in D3_ROUTE_PATTERNS
  // Enforce single user per active slot, approvalRule === 'ALL', fail-closed on duplicates/missing
  const workflowAppraisers = [];
  for (const slotId of patternDef.sourceSlots) {
    const slotDef = D3_SLOT_DEFINITIONS[slotId];
    if (!slotDef) {
      throw new Error(`PROVENANCE_INVALID: Unknown slot definition "${slotId}"`);
    }

    // Approval rule must strictly be "ALL"
    const ruleVal = String(getVal(slotDef.approvalRuleField) || '').trim();
    if (ruleVal !== 'ALL') {
      throw new Error(
        `PROVENANCE_INVALID: Approval rule for slot ${slotId} (${slotDef.approvalRuleField}) must be "ALL", received: "${ruleVal}"`
      );
    }

    // Physical USER_SELECT field
    let rawApprover = getVal(slotDef.approverField);
    if (
      (rawApprover === undefined || rawApprover === null || (Array.isArray(rawApprover) && rawApprover.length === 0)) &&
      slotDef.legacyApproverField
    ) {
      rawApprover = getVal(slotDef.legacyApproverField);
    }

    let userList = [];
    if (Array.isArray(rawApprover)) {
      userList = rawApprover;
    } else if (rawApprover && typeof rawApprover === 'object') {
      userList = [rawApprover];
    } else if (typeof rawApprover === 'string' && rawApprover.trim()) {
      userList = [{ code: rawApprover.trim() }];
    }

    if (userList.length === 0) {
      throw new Error(
        `PROVENANCE_MISSING: Missing approver for active slot ${slotId} (${slotDef.approverField})`
      );
    }
    if (userList.length > 1) {
      throw new Error(
        `PROVENANCE_INVALID: Active slot ${slotId} (${slotDef.approverField}) must have exactly one user, found ${userList.length}`
      );
    }

    const appraiserCode = String(userList[0]?.code || userList[0]?.value || '').trim();
    if (!appraiserCode) {
      throw new Error(
        `PROVENANCE_INVALID: Active slot ${slotId} (${slotDef.approverField}) user has blank code`
      );
    }

    workflowAppraisers.push({ code: appraiserCode });
  }

  const seenAppraisers = new Set();
  for (const a of workflowAppraisers) {
    if (seenAppraisers.has(a.code)) {
      throw new Error(`PROVENANCE_DUPLICATE: Duplicate appraiser code in workflow: "${a.code}"`);
    }
    seenAppraisers.add(a.code);
  }

  if (workflowAppraisers.length !== patternDef.sourceSlots.length) {
    throw new Error(`PROVENANCE_MISMATCH: Workflow_Appraisers count (${workflowAppraisers.length}) does not match route pattern slot count (${patternDef.sourceSlots.length})`);
  }

  // Scorers: must come strictly from persisted Effective_Scorer_Slots_Snapshot (DEC-036 locked weights)
  const rawScorerSnapshot = getVal('Effective_Scorer_Slots_Snapshot');
  if (rawScorerSnapshot === undefined || rawScorerSnapshot === null || String(rawScorerSnapshot).trim() === '') {
    throw new Error('PROVENANCE_MISSING: Effective_Scorer_Slots_Snapshot is required');
  }

  let parsedSlots;
  try {
    parsedSlots = typeof rawScorerSnapshot === 'string' ? JSON.parse(rawScorerSnapshot) : rawScorerSnapshot;
  } catch (err) {
    throw new Error('PROVENANCE_MALFORMED: Effective_Scorer_Slots_Snapshot contains malformed JSON');
  }

  if (!Array.isArray(parsedSlots) || parsedSlots.length === 0) {
    throw new Error('PROVENANCE_INVALID: Effective_Scorer_Slots_Snapshot must be a non-empty array');
  }

  if (parsedSlots.length !== kExpected) {
    throw new Error(
      `PROVENANCE_MISMATCH: Scorer slot count (${parsedSlots.length}) does not match K_expected_Snapshot (${kExpected})`
    );
  }

  const seenOrdinals = new Set();
  for (const ordinal of parsedSlots) {
    if (!Number.isInteger(ordinal)) {
      throw new Error(`PROVENANCE_MALFORMED: Effective_Scorer_Slots_Snapshot ordinals must be integers, got: ${ordinal}`);
    }
    if (ordinal < 1 || ordinal > workflowAppraisers.length) {
      throw new Error(
        `PROVENANCE_MISMATCH: Scorer slot ordinal ${ordinal} out of range (1..${workflowAppraisers.length})`
      );
    }
    if (seenOrdinals.has(ordinal)) {
      throw new Error(`PROVENANCE_DUPLICATE: Duplicate scorer slot ordinal: ${ordinal}`);
    }
    seenOrdinals.add(ordinal);
  }

  // DEC-036 exact weight authority: K=1 -> [100], K=2 -> [50, 50]
  const dec036Weights = kExpected === 1 ? [100] : [50, 50];
  const scorers = [];
  const seenScorers = new Set();
  for (let idx = 0; idx < parsedSlots.length; idx++) {
    const ord = parsedSlots[idx];
    const scorerCode = workflowAppraisers[ord - 1].code;
    if (seenScorers.has(scorerCode)) {
      throw new Error(`PROVENANCE_DUPLICATE: Duplicate scorer identity: "${scorerCode}"`);
    }
    seenScorers.add(scorerCode);
    scorers.push({
      code: scorerCode,
      weight: dec036Weights[idx]
    });
  }

  const departmentHoshinKey = String(getVal('Department_Hoshin_Key') || '').trim();
  if (!departmentHoshinKey) {
    throw new Error('PROVENANCE_MISSING: Department_Hoshin_Key is required');
  }

  const configurationHash = String(getVal('Configuration_Hash') || '').trim();
  if (!configurationHash) {
    throw new Error('PROVENANCE_MISSING: Configuration_Hash is required');
  }

  // Business snapshot: read physical fields from App 794 schema (Objective_Count & Objective matrix 1..10)
  const rawObjectiveCount = getVal('Objective_Count');
  if (rawObjectiveCount === undefined || rawObjectiveCount === null || String(rawObjectiveCount).trim() === '') {
    throw new Error('PROVENANCE_MISSING: Objective_Count is required');
  }
  const objectiveCount = Number(rawObjectiveCount);
  if (!Number.isInteger(objectiveCount) || objectiveCount < 2 || objectiveCount > 10) {
    throw new Error(`PROVENANCE_INVALID: Objective_Count must be an integer between 2 and 10, got "${rawObjectiveCount}"`);
  }

  const rawPartARawScore = getVal('PartA_Raw_Score');
  if (rawPartARawScore === undefined || rawPartARawScore === null || String(rawPartARawScore).trim() === '') {
    throw new Error('PROVENANCE_MISSING: PartA_Raw_Score is required');
  }
  const partARawScore = Number(rawPartARawScore);
  if (!Number.isFinite(partARawScore)) {
    throw new Error(`PROVENANCE_INVALID: PartA_Raw_Score must be a finite number, got "${rawPartARawScore}"`);
  }

  const objectives = [];
  for (let i = 1; i <= objectiveCount; i++) {
    const rawObjective = getVal(`Objective_${i}`);
    if (rawObjective === undefined || rawObjective === null || String(rawObjective).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Objective_${i} is required for objective ${i}`);
    }
    const rawActionPlan = getVal(`Action_Plan_${i}`);
    if (rawActionPlan === undefined || rawActionPlan === null || String(rawActionPlan).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Action_Plan_${i} is required for objective ${i}`);
    }
    const rawWeight = getVal(`Weight_${i}`);
    if (rawWeight === undefined || rawWeight === null || String(rawWeight).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Weight_${i} is required for objective ${i}`);
    }
    const weightNum = Number(rawWeight);
    if (!Number.isFinite(weightNum) || weightNum < 0 || weightNum > 100) {
      throw new Error(`PROVENANCE_INVALID: Weight_${i} must be a number between 0 and 100, got "${rawWeight}"`);
    }
    const rawDifficulty = getVal(`Difficulty_${i}`);
    if (rawDifficulty === undefined || rawDifficulty === null || String(rawDifficulty).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Difficulty_${i} is required for objective ${i}`);
    }
    const difficultyNum = Number(rawDifficulty);
    if (!Number.isFinite(difficultyNum) || difficultyNum < 1 || difficultyNum > 4) {
      throw new Error(`PROVENANCE_INVALID: Difficulty_${i} must be an integer between 1 and 4, got "${rawDifficulty}"`);
    }

    const item = {
      index: i,
      Objective: String(rawObjective).trim(),
      Action_Plan: String(rawActionPlan).trim(),
      Weight: weightNum,
      Difficulty: difficultyNum,
      Additional_Agreement: getVal(`Additional_Agreement_${i}`) ?? '',
      Objective_Attachment: getVal(`Objective_Attachment_${i}`) ?? [],
      Progress_Percent: (getVal(`Progress_Percent_${i}`) !== undefined && getVal(`Progress_Percent_${i}`) !== null && getVal(`Progress_Percent_${i}`) !== '') ? Number(getVal(`Progress_Percent_${i}`)) : '',
      Periodical_Review: getVal(`Periodical_Review_${i}`) ?? '',
      MidYear_Result: getVal(`MidYear_Result_${i}`) ?? '',
      MidYear_Issue_Risk: getVal(`MidYear_Issue_Risk_${i}`) ?? '',
      MidYear_Next_Action: getVal(`MidYear_Next_Action_${i}`) ?? '',
      MidYear_Attachment: getVal(`MidYear_Attachment_${i}`) ?? [],
      Actual_Result: getVal(`Actual_Result_${i}`) ?? '',
      Self_Achievement: (getVal(`Self_Achievement_${i}`) !== undefined && getVal(`Self_Achievement_${i}`) !== null && getVal(`Self_Achievement_${i}`) !== '') ? Number(getVal(`Self_Achievement_${i}`)) : '',
      Self_Comment: getVal(`Self_Comment_${i}`) ?? '',
      Final_Attachment: getVal(`Final_Attachment_${i}`) ?? [],
      Manager_Achievement: (getVal(`Manager_Achievement_${i}`) !== undefined && getVal(`Manager_Achievement_${i}`) !== null && getVal(`Manager_Achievement_${i}`) !== '') ? Number(getVal(`Manager_Achievement_${i}`)) : '',
      Manager_Objective_Score: (getVal(`Manager_Objective_Score_${i}`) !== undefined && getVal(`Manager_Objective_Score_${i}`) !== null && getVal(`Manager_Objective_Score_${i}`) !== '') ? Number(getVal(`Manager_Objective_Score_${i}`)) : '',
      Manager_Comment: getVal(`Manager_Comment_${i}`) ?? '',
      GM_Achievement: (getVal(`GM_Achievement_${i}`) !== undefined && getVal(`GM_Achievement_${i}`) !== null && getVal(`GM_Achievement_${i}`) !== '') ? Number(getVal(`GM_Achievement_${i}`)) : '',
      GM_Objective_Score: (getVal(`GM_Objective_Score_${i}`) !== undefined && getVal(`GM_Objective_Score_${i}`) !== null && getVal(`GM_Objective_Score_${i}`) !== '') ? Number(getVal(`GM_Objective_Score_${i}`)) : '',
      GM_Comment: getVal(`GM_Comment_${i}`) ?? ''
    };
    objectives.push(item);
  }

  return {
    source: {
      Record_Key: sourceRecordKey,
      Employee_Code: employeeCode,
      Fiscal_Year: fiscalYear,
      ...(rawRecordId > 0 ? { Record_ID: rawRecordId } : {})
    },
    stage: {
      Evaluation_Stage: targetStage,
      Revision_Number: revisionNumber,
      Previous_Status: String(currentStatus || '').trim()
    },
    profile: {
      Frozen_Profile_Code: frozenProfileCode,
      K_expected_Snapshot: kExpected
    },
    route: {
      Effective_Routing_Key: effectiveRoutingKey,
      Effective_Route_Version_Key: effectiveRouteVersionKey,
      Route_Pattern: routePattern,
      Routing_Topology: routingTopology,
      Workflow_Appraisers: workflowAppraisers
    },
    scoring: {
      Scorers: scorers
    },
    hoshin: {
      Department_Hoshin_Key: departmentHoshinKey
    },
    config: {
      Configuration_Hash: configurationHash
    },
    business: {
      Objective_Count: objectives.length,
      Objectives: objectives
    },
    computed: {
      PartA_Raw_Score: partARawScore
    }
  };
}

/**
 * Executes stage archive persistence upon authorized workflow action transition.
 * Strictly uses exact status, action, and nextStatus equality matching.
 * Returns { success: boolean, targetStage?: string, archiveResult?: object, skipped?: boolean, error?: string }
 */
export async function executeProcessTransitionArchive(record, event, options = {}) {
  const currentStatus = String(event?.status?.value || event?.currentStatus || record?.Status?.value || record?.Status || '').trim();
  const nextStatus = String(event?.nextStatus?.value || event?.nextStatus || '').trim();
  const actionName = String(event?.action?.value || event?.action || '').trim();

  let targetStage = null;
  if (
    currentStatus === '05 Objective Approved' &&
    actionName === 'Start Mid-Year' &&
    nextStatus === '06 Employee Mid-Year'
  ) {
    targetStage = 'OBJECTIVE';
  } else if (
    currentStatus === '10 Mid-Year Completed' &&
    actionName === 'Start Self Evaluation' &&
    nextStatus === '11 Employee Self Evaluation'
  ) {
    targetStage = 'MIDYEAR';
  } else if (
    currentStatus === '15 HR Final Check' &&
    actionName === 'Complete' &&
    nextStatus === '16 Completed'
  ) {
    targetStage = 'FINAL';
  }

  if (!targetStage) {
    return { success: true, skipped: true, reason: 'NOT_A_TARGET_TRANSITION' };
  }

  const apiAdapter = options.apiAdapter || kintoneApiWrapper;
  const loginUser = options.loginUser || ((typeof kintone !== 'undefined' && typeof kintone.getLoginUser === 'function') ? kintone.getLoginUser() : null);
  const actorCode = String(options.actor || loginUser?.code || '').trim();

  if (!actorCode) {
    const errorMsg = `[D3 ARCHIVE ERROR] Cannot resolve actor login identity for transition ${currentStatus} -> ${nextStatus}. Transition blocked.`;
    console.error(errorMsg);
    return { success: false, error: 'ACTOR_IDENTITY_UNRESOLVED' };
  }

  try {
    const archiveAppId = options.archiveAppId || 798;
    const clock = options.clock || (() => new Date().toISOString());
    const archiveService = options.archiveService || new RevisionArchiveService(apiAdapter, { archiveAppId, clock });
    const logicalSnapshot = options.logicalSnapshot || buildStageLogicalSnapshot(record, targetStage, currentStatus);

    const rawRecordId = Number(record?.$id?.value || record?.$id || record?.Record_ID?.value || record?.Record_ID || 0);

    const archiveResult = await archiveService.archiveStageCompletion({
      sourceRecordKey: String(record?.Record_Key?.value || record?.Record_Key || '').trim(),
      employeeCode: String(record?.Employee_Code?.value || record?.Employee_Code || '').trim(),
      fiscalYear: String(record?.Fiscal_Year?.value || record?.Fiscal_Year || '').trim(),
      evaluationStage: targetStage,
      revisionNumber: Number(record?.Revision_Number?.value || record?.Current_Revision_Number?.value || record?.Revision_Number || record?.Current_Revision_Number),
      sourceRecordId: rawRecordId > 0 ? rawRecordId : undefined,
      previousStatus: currentStatus,
      actor: { userCode: actorCode },
      archivedAt: options.archivedAt || (typeof clock === 'function' ? clock() : new Date().toISOString()),
      logicalSnapshot
    });

    return { success: true, targetStage, archiveResult };
  } catch (err) {
    console.error(`[D3 ARCHIVE ERROR] Failed to create ${targetStage} stage completion archive:`, err);
    return { success: false, error: err.message || String(err), details: err };
  }
}
