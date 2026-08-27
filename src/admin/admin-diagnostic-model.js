/**
 * Admin Diagnostic Model & Health Engine
 * Pure logic for Technical Admin (admin-form) System Health, Record Diagnostics, and Sanitized Snapshot.
 */

export const BUILD_VERSION_INFO = {
  version: '0.1.0',
  commitSha: 'b2f0a5647e1436e16ec65550ae069fac2ed0be6f',
  buildTimestamp: '2026-08-27T12:00:00Z',
  environment: 'LOCAL_PREVIEW / SANDBOX'
};

export class AdminDiagnosticModel {
  /**
   * Evaluates if current logged-in Kintone user is authorized for Technical Admin Support Center.
   * Strictly uses Kintone login identity. Cannot be bypassed by Employee_Code, status, or position.
   */
  static isTechnicalAdmin(loginUserCode) {
    if (!loginUserCode || typeof loginUserCode !== 'string') return false;
    const cleanCode = loginUserCode.trim().toLowerCase();
    return cleanCode === 'admin-form' || cleanCode === 'administrator';
  }

  /**
   * Evaluates System Health across 15 core diagnostic indicators.
   */
  static evaluateSystemHealth(context = {}) {
    const {
      loginUserCode,
      requesterUserCodes = [],
      routingKey,
      routingResult,
      activeAppraiserSlot,
      profileCode,
      evalProfile,
      activeObjCount,
      isObjCountValid,
      isPartAComplete,
      isPartBComplete,
      phaseCalendar,
      currentStatus,
      currentActor,
      resolvedViewerRole,
      app800Status = 'PASS',
      app801Status = 'NOT_AVAILABLE',
      attachmentState = 'OPTIONAL_PRESENTATION',
      schemaState = 'PASS'
    } = context;

    const items = [];

    // 1. Identity Resolution
    items.push({
      key: 'identity_resolution',
      labelTH: 'การระบุตัวตน Kintone (Identity Resolution)',
      labelEN: 'Kintone Identity Resolution',
      status: loginUserCode ? 'PASS' : 'ERROR',
      reason: loginUserCode ? `Logged in user: ${loginUserCode}` : 'Logged-in user code is missing'
    });

    // 2. Requester Mapping
    items.push({
      key: 'requester_mapping',
      labelTH: 'ผู้ขอประเมิน (Requester User Mapping)',
      labelEN: 'Requester User Mapping',
      status: requesterUserCodes.length > 0 ? 'PASS' : 'WARNING',
      reason: requesterUserCodes.length > 0 ? `Requester user code(s): ${requesterUserCodes.join(', ')}` : 'Requester_User field is unassigned'
    });

    // 3. Routing Resolution
    let routingStatus = 'PASS';
    let routingReason = `Routing key: ${routingKey || 'N/A'}`;
    if (routingResult?.status === 'FAIL_CLOSED' || routingResult?.isFailClosed) {
      routingStatus = 'ERROR';
      routingReason = `Routing fail-closed: ${routingResult.reason || 'No matching App795 route'}`;
    } else if (!routingKey) {
      routingStatus = 'WARNING';
      routingReason = 'Routing key not provided';
    }
    items.push({
      key: 'routing_resolution',
      labelTH: 'การกำหนดเส้นทางประเมิน (Routing Resolution)',
      labelEN: 'Routing Resolution',
      status: routingStatus,
      reason: routingReason
    });

    // 4. Current Active Appraiser Slot
    items.push({
      key: 'active_appraiser_slot',
      labelTH: 'ช่องผู้ประเมินปัจจุบัน (Active Appraiser Slot)',
      labelEN: 'Current Active Appraiser Slot',
      status: activeAppraiserSlot ? 'PASS' : 'NOT_AVAILABLE',
      reason: activeAppraiserSlot ? `Active Appraiser: Slot ${activeAppraiserSlot}` : 'Not currently in Appraiser Evaluation stage'
    });

    // 5. Evaluation Profile Resolution
    const isProfileValid = !!(profileCode && evalProfile);
    items.push({
      key: 'profile_resolution',
      labelTH: 'โปรไฟล์การประเมิน (Evaluation Profile Resolution)',
      labelEN: 'Evaluation Profile Resolution',
      status: isProfileValid ? 'PASS' : 'ERROR',
      reason: isProfileValid ? `Profile: ${profileCode} (${evalProfile.nameEN || ''})` : 'Invalid or missing Profile_Code'
    });

    // 6. Objective Count & Completeness
    items.push({
      key: 'objective_count',
      labelTH: 'จำนวนเป้าหมาย (Objective Count & Validity)',
      labelEN: 'Objective Count & Validity',
      status: isObjCountValid !== false && activeObjCount > 0 ? 'PASS' : 'ERROR',
      reason: isObjCountValid !== false && activeObjCount > 0 ? `Objective Count: ${activeObjCount} (Valid range 1..10)` : 'Objective_Count is invalid or missing'
    });

    // 7. Scoring Completeness
    let scoringStatus = 'PASS';
    let scoringReason = 'Part A & Part B ratings complete';
    if (isPartAComplete === false || isPartBComplete === false) {
      scoringStatus = 'WARNING';
      scoringReason = `Incomplete: Part A=${isPartAComplete ? 'OK' : 'Incomplete'}, Part B=${isPartBComplete ? 'OK' : 'Incomplete'}`;
    }
    items.push({
      key: 'scoring_completeness',
      labelTH: 'ความครบถ้วนของคะแนน (Scoring Completeness)',
      labelEN: 'Scoring Completeness',
      status: scoringStatus,
      reason: scoringReason
    });

    // 8. Phase Calendar / Config Resolution
    items.push({
      key: 'phase_calendar',
      labelTH: 'ปฏิทินการประเมิน (Phase Calendar Resolution)',
      labelEN: 'Phase Calendar Resolution',
      status: phaseCalendar ? 'PASS' : 'WARNING',
      reason: phaseCalendar ? 'Phase dates active' : 'Using default fallback phase calendar'
    });

    // 9. Workflow Status & Current Actor
    items.push({
      key: 'workflow_status',
      labelTH: 'สถานะกระบวนการ (Workflow Status & Actor)',
      labelEN: 'Workflow Status & Current Actor',
      status: currentStatus ? 'PASS' : 'ERROR',
      reason: currentStatus ? `Status: "${currentStatus}", Actor: "${currentActor || 'N/A'}"` : 'Current status missing'
    });

    // 10. Viewer / Privacy Resolution
    items.push({
      key: 'viewer_privacy',
      labelTH: 'สิทธิ์การมองเห็น (Viewer Privacy Resolution)',
      labelEN: 'Viewer Privacy Resolution',
      status: resolvedViewerRole ? 'PASS' : 'ERROR',
      reason: resolvedViewerRole ? `Viewer Role: ${resolvedViewerRole}` : 'Failed to resolve viewer role'
    });

    // 11. App800 Config State
    items.push({
      key: 'app800_config',
      labelTH: 'สถานะ App800 (App800 Config State)',
      labelEN: 'App800 Config State',
      status: app800Status,
      reason: app800Status === 'PASS' ? 'App800 HR Control Center schema & config verified' : 'App800 config inspection pending'
    });

    // 12. App801 Auth Contract State (Masked/Status Only)
    items.push({
      key: 'app801_auth_contract',
      labelTH: 'สัญญาหลักฐาน App801 (App801 Auth Contract State)',
      labelEN: 'App801 Auth Contract State',
      status: app801Status,
      reason: app801Status === 'NOT_AVAILABLE' ? 'App801 credential store unwired / Kintone SSO primary' : 'App801 active'
    });

    // 13. Attachment Mapping State
    items.push({
      key: 'attachment_mapping',
      labelTH: 'สถานะไฟล์แนบ (Attachment Mapping State)',
      labelEN: 'Attachment Mapping State',
      status: attachmentState,
      reason: 'Objectives, Mid-Year & Self attachments are optional presentation evidence'
    });

    // 14. Schema / Field Expectation State
    items.push({
      key: 'schema_expectation',
      labelTH: 'ความถูกต้องของ Schema (Schema Expectation State)',
      labelEN: 'Schema Expectation State',
      status: schemaState,
      reason: schemaState === 'PASS' ? 'Physical fields match expected App794 contract' : 'Schema anomaly detected'
    });

    // 15. Bundle / Source Version Identifier
    items.push({
      key: 'bundle_version',
      labelTH: 'เวอร์ชันระบบ (Bundle / Build Identifier)',
      labelEN: 'Bundle / Build Identifier',
      status: 'PASS',
      reason: `v${BUILD_VERSION_INFO.version} (Commit ${BUILD_VERSION_INFO.commitSha.substring(0, 7)})`
    });

    const hasError = items.some(i => i.status === 'ERROR');
    const hasWarning = items.some(i => i.status === 'WARNING');
    const overallHealth = hasError ? 'ERROR' : (hasWarning ? 'WARNING' : 'PASS');

    return {
      overallHealth,
      items,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Builds detailed read-only Record Diagnostic object.
   */
  static buildRecordDiagnostic(record, options = {}) {
    const getVal = (code) => {
      if (!record) return '';
      const field = record[code];
      if (field === null || field === undefined) return '';
      if (typeof field === 'object' && 'value' in field) return field.value ?? '';
      return String(field);
    };

    return {
      recordId: getVal('$id') || options.recordId || 'N/A',
      mboKey: getVal('Record_Key') || options.mboKey || 'N/A',
      fiscalYear: getVal('Fiscal_Year') || options.fiscalYear || '2026',
      employeeCode: getVal('Employee_Code') || options.employeeCode || 'N/A',
      employeeName: getVal('Employee_Name') || options.employeeName || 'N/A',
      requesterUser: getVal('Requester_User') || options.requesterUser || 'N/A',
      loggedInUserCode: options.loggedInUserCode || 'admin-form',
      currentStatus: getVal('Status') || options.currentStatus || 'N/A',
      currentActor: options.currentActor || 'N/A',
      resolvedViewerRole: options.resolvedViewerRole || 'RESTRICTED',
      activeAppraiserSlot: options.activeAppraiserSlot || 'N/A',
      expectedAppraiserCount: options.expectedAppraiserCount || 2,
      appraiser1: options.appraiser1 || getVal('First_Manager_User') || 'N/A',
      appraiser2: options.appraiser2 || getVal('GM_User') || 'N/A',
      appraiser3: options.appraiser3 || 'N/A',
      appraiser4: options.appraiser4 || 'N/A',
      routingKey: options.routingKey || 'N/A',
      sectionCode: getVal('Section_Code') || options.sectionCode || 'N/A',
      teamName: getVal('Team') || options.teamName || 'N/A',
      routingResult: options.routingResult || { status: 'PASS', topology: 'M1_G1' },
      profileCode: getVal('Profile_Code') || options.profileCode || 'PROF_STAFF_CHIEF',
      partAWeight: options.partAWeight || 70,
      partBWeight: options.partBWeight || 30,
      objectiveCount: getVal('Objective_Count') || options.objectiveCount || 'N/A',
      isObjCountValid: options.isObjCountValid !== false,
      scoringCompleteness: options.scoringCompleteness || { isComplete: false },
      phaseCalendarStatus: options.phaseCalendarStatus || 'PASS',
      validationErrors: options.validationErrors || [],
      buildVersion: BUILD_VERSION_INFO
    };
  }

  /**
   * Generates a sanitized diagnostic snapshot object.
   * Strictly removes Password_Hash, passwords, tokens, cookies, secrets.
   */
  static generateDiagnosticSnapshot(diagnosticData) {
    const raw = JSON.parse(JSON.stringify(diagnosticData));

    // Sanitization step — recursive sanitization for keys matching password/secret/token/hash
    const sanitizeObj = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('token') ||
          lowerKey.includes('hash') ||
          lowerKey.includes('cookie') ||
          lowerKey.includes('auth_header')
        ) {
          obj[key] = '[REDACTED_FOR_SECURITY]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObj(obj[key]);
        }
      }
    };

    sanitizeObj(raw);

    return {
      title: 'MBO Technical Admin Diagnostic Snapshot',
      sanitized: true,
      timestamp: new Date().toISOString(),
      systemInfo: BUILD_VERSION_INFO,
      data: raw
    };
  }
}
