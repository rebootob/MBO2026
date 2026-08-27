/**
 * Admin Diagnostic Model & Health Engine (Baseline Correction Micro-Fix)
 * Pure logic for Technical Admin (admin-form) System Health, Workflow Trace, Profile/Route Validation,
 * Root-Cause Classification, Fast Repair Candidate Preparation, and Sanitized Snapshot.
 *
 * Source of Truth: project-docs/CONFIRMED_BASELINE/
 */

export const BUILD_VERSION_INFO = {
  version: '0.2.1',
  commitSha: '0977bf59a838748c69f8ee4920423459fb79eecb',
  buildTimestamp: '2026-08-27T12:19:00Z',
  environment: 'LOCAL_PREVIEW / SANDBOX'
};

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const CANONICAL_STATUSES = [
  '01 Draft Objective',
  '02 First Manager Objective Review',
  '03 Manager Objective Review',
  '04 GM Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '07 First Manager Mid-Year Review',
  '08 Manager Mid-Year Review',
  '09 GM Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '12 First Manager Final Evaluation',
  '13 Manager Final Evaluation',
  '14 GM Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

export class AdminDiagnosticModel {
  /**
   * P0 Security Gate: Strictly authorizes `admin-form` only (case/whitespace-insensitive).
   * Explicitly DENIES `administrator`, `hr`, `EMP...`, status 15, or Employee_Code=admin-form under a different login.
   */
  static isTechnicalAdmin(loginUserCode) {
    if (!loginUserCode || typeof loginUserCode !== 'string') return false;
    const cleanCode = loginUserCode.trim().toLowerCase();
    return cleanCode === 'admin-form';
  }

  /**
   * Normalizes a user code for case-insensitive exact comparison.
   */
  static normalizeUserCode(code) {
    if (!code) return '';
    if (typeof code === 'string') return code.trim().toLowerCase();
    if (typeof code === 'object') {
      if (typeof code.code === 'string') return code.code.trim().toLowerCase();
      if (typeof code.value === 'string') return code.value.trim().toLowerCase();
    }
    return String(code).trim().toLowerCase();
  }

  /**
   * Evaluates System Health across 15 diagnostic indicators.
   * Removes fabricated defaults — missing evidence returns NOT_EVIDENCED / NOT_AVAILABLE.
   * If critical evidence is missing, overallHealth returns INCOMPLETE_EVIDENCE instead of PASS.
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
      app800Status = 'NOT_EVIDENCED',
      app801Status = 'NOT_EVIDENCED',
      attachmentState = 'OPTIONAL_PRESENTATION',
      schemaState = 'NOT_EVIDENCED'
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
    let routingStatus = 'NOT_EVIDENCED';
    let routingReason = 'Routing resolution evidence not provided';
    if (routingResult?.status === 'FAIL_CLOSED' || routingResult?.isFailClosed) {
      routingStatus = 'ERROR';
      routingReason = `Routing fail-closed: ${routingResult.reason || 'No matching App795 route'}`;
    } else if (routingResult?.status === 'PASS' || routingKey) {
      routingStatus = 'PASS';
      routingReason = `Routing key: ${routingKey || 'Resolved'}`;
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
      status: isProfileValid ? 'PASS' : (profileCode ? 'ERROR' : 'NOT_EVIDENCED'),
      reason: isProfileValid ? `Profile: ${profileCode} (${evalProfile.nameEN || ''})` : (profileCode ? 'Profile code unrecognized' : 'Profile evidence missing')
    });

    // 6. Objective Count & Completeness
    let objStatus = 'NOT_EVIDENCED';
    let objReason = 'Objective count evidence not provided';
    if (activeObjCount !== undefined && activeObjCount !== null) {
      if (isObjCountValid !== false && activeObjCount >= 1 && activeObjCount <= 10) {
        objStatus = 'PASS';
        objReason = `Objective Count: ${activeObjCount} (Valid range 1..10)`;
      } else {
        objStatus = 'ERROR';
        objReason = `Objective_Count (${activeObjCount}) is invalid or out of range 1..10`;
      }
    }
    items.push({
      key: 'objective_count',
      labelTH: 'จำนวนเป้าหมาย (Objective Count & Validity)',
      labelEN: 'Objective Count & Validity',
      status: objStatus,
      reason: objReason
    });

    // 7. Scoring Completeness
    let scoringStatus = 'NOT_EVIDENCED';
    let scoringReason = 'Scoring completeness evidence not provided';
    if (isPartAComplete !== undefined || isPartBComplete !== undefined) {
      if (isPartAComplete !== false && isPartBComplete !== false) {
        scoringStatus = 'PASS';
        scoringReason = 'Part A & Part B ratings complete';
      } else {
        scoringStatus = 'WARNING';
        scoringReason = `Incomplete: Part A=${isPartAComplete ? 'OK' : 'Incomplete'}, Part B=${isPartBComplete ? 'OK' : 'Incomplete'}`;
      }
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
      reason: phaseCalendar ? 'Phase dates active' : 'Using fallback phase calendar'
    });

    // 9. Workflow Status & Current Actor
    items.push({
      key: 'workflow_status',
      labelTH: 'สถานะกระบวนการ (Workflow Status & Actor)',
      labelEN: 'Workflow Status & Current Actor',
      status: currentStatus ? (CANONICAL_STATUSES.includes(currentStatus) ? 'PASS' : 'ERROR') : 'ERROR',
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
      reason: app800Status === 'PASS' ? 'App800 HR Control Center schema & config verified' : 'App800 live inspection not evidenced'
    });

    // 12. App801 Auth Contract State
    items.push({
      key: 'app801_auth_contract',
      labelTH: 'สัญญาหลักฐาน App801 (App801 Auth Contract State)',
      labelEN: 'App801 Auth Contract State',
      status: app801Status,
      reason: app801Status === 'NOT_AVAILABLE' ? 'App801 credential store unwired / Kintone SSO primary' : 'App801 live inspection not evidenced'
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
      reason: schemaState === 'PASS' ? 'Physical fields match expected App794 contract' : 'Schema live inspection not evidenced'
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
    const hasUncertain = items.some(i => i.status === 'NOT_EVIDENCED' || i.status === 'NOT_AVAILABLE');
    const overallHealth = hasError ? 'ERROR' : (hasWarning ? 'WARNING' : (hasUncertain ? 'INCOMPLETE_EVIDENCE' : 'PASS'));

    return {
      overallHealth,
      items,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * B. Evaluates Workflow Trace & Workflow State Consistency.
   * MUST use exact canonical App794 status names from CONFIRMED_BASELINE/ROUTING_WORKFLOW.md.
   * MUST NOT fall back to M1_G1 when topology is missing/unknown.
   */
  static evaluateWorkflowTrace(context = {}) {
    const {
      currentStatus,
      topology,
      activeAppraiserSlot,
      appraiser1,
      appraiser2,
      appraiser3,
      appraiser4,
      actualAuditHistory = null
    } = context;

    if (!currentStatus || !CANONICAL_STATUSES.includes(currentStatus)) {
      return {
        status: 'ERROR',
        isFailClosed: true,
        reason: currentStatus ? `Current status "${currentStatus}" is non-canonical or unmapped` : 'Current status is missing',
        expectedPath: 'N/A',
        consistency: 'ERROR'
      };
    }

    if (!topology) {
      return {
        status: 'NOT_EVIDENCED',
        isFailClosed: false,
        reason: 'Topology evidence not provided',
        expectedPath: 'NOT_EVIDENCED',
        consistency: 'NOT_EVIDENCED'
      };
    }

    const expectedPaths = {
      M1_ONLY: ['01 Draft Objective', '03 Manager Objective Review', '05 Objective Approved', '06 Employee Mid-Year', '08 Manager Mid-Year Review', '10 Mid-Year Completed', '11 Employee Self Evaluation', '13 Manager Final Evaluation', '15 HR Final Check', '16 Completed'],
      M1_G1: ['01 Draft Objective', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved', '06 Employee Mid-Year', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed', '11 Employee Self Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check', '16 Completed'],
      M1_M2_G1: ['01 Draft Objective', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved', '06 Employee Mid-Year', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed', '11 Employee Self Evaluation', '12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check', '16 Completed'],
      M1_G1_G2: ['01 Draft Objective', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved', '06 Employee Mid-Year', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed', '11 Employee Self Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check', '16 Completed'],
      M1_M2_G1_G2: ['01 Draft Objective', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved', '06 Employee Mid-Year', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed', '11 Employee Self Evaluation', '12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check', '16 Completed']
    };

    const expectedPath = expectedPaths[topology];
    if (!expectedPath) {
      return {
        status: 'ERROR',
        isFailClosed: true,
        reason: `Unknown or unsupported topology "${topology}"`,
        expectedPath: 'N/A',
        consistency: 'ERROR'
      };
    }

    // Detect topology state violations using exact canonical status names:
    if (topology === 'M1_G1' && ['02 First Manager Objective Review', '07 First Manager Mid-Year Review', '12 First Manager Final Evaluation'].includes(currentStatus)) {
      return {
        status: 'ERROR',
        isFailClosed: true,
        reason: `Topology "${topology}" invalidly entered First Manager state "${currentStatus}"`,
        expectedPath: expectedPath.join(' → '),
        consistency: 'ERROR'
      };
    }

    if (topology === 'M1_ONLY' && ['04 GM Objective Review', '09 GM Mid-Year Review', '14 GM Final Evaluation'].includes(currentStatus)) {
      return {
        status: 'ERROR',
        isFailClosed: true,
        reason: `Topology "M1_ONLY" invalidly entered GM evaluation state "${currentStatus}"`,
        expectedPath: expectedPath.join(' → '),
        consistency: 'ERROR'
      };
    }

    // Active Appraiser Slot consistency using canonical status names
    let expectedSlot = null;
    if (currentStatus === '12 First Manager Final Evaluation') expectedSlot = 1;
    else if (currentStatus === '13 Manager Final Evaluation') expectedSlot = topology === 'M1_ONLY' ? 1 : (topology === 'M1_M2_G1' ? 2 : 1);
    else if (currentStatus === '14 GM Final Evaluation') expectedSlot = (topology === 'M1_M2_G1' ? 3 : (topology === 'M1_G1' ? 2 : (topology === 'M1_G1_G2' ? 2 : 2)));

    if (activeAppraiserSlot && expectedSlot && activeAppraiserSlot !== expectedSlot) {
      return {
        status: 'ERROR',
        isFailClosed: true,
        reason: `Active appraiser slot mismatch: Current status "${currentStatus}" expects Slot ${expectedSlot}, but active slot is ${activeAppraiserSlot}`,
        expectedPath: expectedPath.join(' → '),
        consistency: 'ERROR'
      };
    }

    // Required Appraiser presence for active slot (only check if appraiser field context is supplied)
    const appraiserSlots = { 1: appraiser1, 2: appraiser2, 3: appraiser3, 4: appraiser4 };
    const isAppraiserContextSupplied = Boolean(appraiser1 || appraiser2 || appraiser3 || appraiser4);
    if (expectedSlot && isAppraiserContextSupplied && !appraiserSlots[expectedSlot]) {
      return {
        status: 'ERROR',
        isFailClosed: true,
        reason: `Required appraiser for Slot ${expectedSlot} is missing on record for status "${currentStatus}"`,
        expectedPath: expectedPath.join(' → '),
        consistency: 'ERROR'
      };
    }

    const historyStatus = actualAuditHistory ? 'EVIDENCED' : 'PENDING_AUDIT_DESIGN / NOT_AVAILABLE';

    return {
      status: 'PASS',
      isFailClosed: false,
      reason: `Workflow status "${currentStatus}" is consistent with topology "${topology}"`,
      expectedPath: expectedPath.join(' → '),
      consistency: 'PASS',
      historyStatus,
      actualAuditHistory: actualAuditHistory || 'NOT_AVAILABLE'
    };
  }

  /**
   * C. Evaluates Expected vs Actual Evaluation Profile.
   * MUST use exact Profile Codes from CONFIRMED_BASELINE/EVALUATION_CLASSES.md:
   * PROF_STAFF_CHIEF, PROF_JAPANESE_STAFF, PROF_ASST_MGR, PROF_SECTION_MGR, PROF_SENIOR_MGR, PROF_DGM, PROF_GM, PROF_VP.
   */
  static evaluateProfileMatch(context = {}) {
    const {
      position,
      actualProfileCode,
      actualPartAWeight,
      actualPartBWeight
    } = context;

    if (!position && !actualProfileCode) {
      return {
        status: 'NOT_EVIDENCED',
        reason: 'Position and Profile evidence missing',
        expectedProfileCode: 'NOT_EVIDENCED',
        expectedPartAWeight: null,
        expectedPartBWeight: null,
        profileMatch: 'NOT_EVIDENCED'
      };
    }

    const positionMap = {
      'staff': { code: 'PROF_STAFF_CHIEF', name: 'Staff / Chief', a: 70, b: 30 },
      'chief': { code: 'PROF_STAFF_CHIEF', name: 'Staff / Chief', a: 70, b: 30 },
      'japanese staff': { code: 'PROF_JAPANESE_STAFF', name: 'Japanese Staff', a: 70, b: 30 },
      'assistant manager': { code: 'PROF_ASST_MGR', name: 'Assistant Manager', a: 60, b: 40 },
      'section manager': { code: 'PROF_SECTION_MGR', name: 'Section Manager', a: 50, b: 50 },
      'senior manager': { code: 'PROF_SENIOR_MGR', name: 'Senior Manager', a: 50, b: 50 },
      'dgm': { code: 'PROF_DGM', name: 'Deputy General Manager', a: 50, b: 50 },
      'deputy general manager': { code: 'PROF_DGM', name: 'Deputy General Manager', a: 50, b: 50 },
      'gm': { code: 'PROF_GM', name: 'General Manager', a: 50, b: 50 },
      'general manager': { code: 'PROF_GM', name: 'General Manager', a: 50, b: 50 },
      'vp': { code: 'PROF_VP', name: 'Vice President', a: 50, b: 50 },
      'vice president': { code: 'PROF_VP', name: 'Vice President', a: 50, b: 50 }
    };

    const normPos = (position || '').trim().toLowerCase();
    const expected = positionMap[normPos];

    if (!expected) {
      return {
        status: 'NOT_EVIDENCED',
        reason: `Position "${position || 'N/A'}" not found in authoritative position ratio mapping`,
        expectedProfileCode: 'NOT_EVIDENCED',
        actualProfileCode: actualProfileCode || 'N/A',
        profileMatch: 'NOT_EVIDENCED'
      };
    }

    const codeMatch = actualProfileCode === expected.code;
    const aMatch = Number(actualPartAWeight) === expected.a;
    const bMatch = Number(actualPartBWeight) === expected.b;
    const isMatch = codeMatch && aMatch && bMatch;

    return {
      status: isMatch ? 'PASS' : 'ERROR',
      profileMatch: isMatch ? 'PASS' : 'ERROR',
      expectedProfileCode: expected.code,
      actualProfileCode: actualProfileCode || 'N/A',
      expectedPartAWeight: expected.a,
      actualPartAWeight: actualPartAWeight !== undefined ? Number(actualPartAWeight) : 'N/A',
      expectedPartBWeight: expected.b,
      actualPartBWeight: actualPartBWeight !== undefined ? Number(actualPartBWeight) : 'N/A',
      reason: isMatch
        ? `Profile matches expected ${expected.code} (${expected.a}/${expected.b})`
        : `Profile mismatch: Expected ${expected.code} (${expected.a}/${expected.b}), Actual ${actualProfileCode || 'N/A'} (${actualPartAWeight}/${actualPartBWeight})`
    };
  }

  /**
   * D. Evaluates Expected vs Actual Route Assignment.
   * MUST use exact Executive Routing Keys: POSITION_DGM, POSITION_GM, POSITION_VP.
   * If authoritative App795 route evidence is absent: ROUTE_ASSIGNMENT_CHECK = NOT_EVIDENCED.
   */
  static evaluateRouteMatch(context = {}) {
    const {
      sectionCode,
      teamName,
      position,
      actualRoutingKey,
      actualTopology,
      actualAppraiserCount,
      actualAppraiser1,
      actualAppraiser2,
      actualAppraiser3,
      actualAppraiser4,
      authoritativeRoute = null
    } = context;

    const normPos = (position || '').trim().toLowerCase();

    // Executive direct single-appraiser route check takes precedence
    const execKeyMap = {
      'dgm': 'POSITION_DGM',
      'deputy general manager': 'POSITION_DGM',
      'gm': 'POSITION_GM',
      'general manager': 'POSITION_GM',
      'vp': 'POSITION_VP',
      'vice president': 'POSITION_VP'
    };

    if (execKeyMap[normPos]) {
      const expectedExecKey = execKeyMap[normPos];
      const keyMatch = actualRoutingKey === expectedExecKey;
      const isExecTopology = actualTopology === 'M1_ONLY';
      const isExecCount = Number(actualAppraiserCount) === 1;

      if (!authoritativeRoute) {
        return {
          status: 'NOT_EVIDENCED',
          routeMatch: 'NOT_EVIDENCED',
          expectedRoutingKey: expectedExecKey,
          actualRoutingKey: actualRoutingKey || 'N/A',
          expectedTopology: 'M1_ONLY',
          actualTopology: actualTopology || 'N/A',
          expectedAppraiserCount: 1,
          actualAppraiserCount: actualAppraiserCount || 'N/A',
          reason: 'Executive routing key checked; authoritative App795 route result evidence required for full PASS'
        };
      }

      const isExecMatch = keyMatch && isExecTopology && isExecCount;
      return {
        status: isExecMatch ? 'PASS' : 'ERROR',
        routeMatch: isExecMatch ? 'PASS' : 'ERROR',
        expectedRoutingKey: expectedExecKey,
        actualRoutingKey: actualRoutingKey || 'N/A',
        expectedTopology: 'M1_ONLY',
        actualTopology: actualTopology || 'N/A',
        expectedAppraiserCount: 1,
        actualAppraiserCount: actualAppraiserCount || 'N/A',
        reason: isExecMatch ? `Executive direct single-appraiser route matches ${expectedExecKey}` : `Executive route mismatch: expected ${expectedExecKey} / M1_ONLY / Count=1`
      };
    }

    if (!sectionCode && !authoritativeRoute && !actualRoutingKey) {
      return {
        status: 'NOT_EVIDENCED',
        reason: 'Routing input evidence (Section_Code/App795) not provided',
        routeMatch: 'NOT_EVIDENCED'
      };
    }

    // TMG Section exact-team routing rule
    const isTMG = (sectionCode || '').toUpperCase().startsWith('TMG');
    let expectedKey = sectionCode || '';
    if (isTMG) {
      if (!teamName || !teamName.trim()) {
        return {
          status: 'ERROR',
          isFailClosed: true,
          routeMatch: 'ERROR',
          reason: `TMG Section "${sectionCode}" requires exact Team mapping (FAIL_CLOSED). Cannot fall back to Section-only.`
        };
      }
      expectedKey = `${sectionCode}|${teamName.trim()}`;
    }

    if (!authoritativeRoute) {
      const keyMatch = actualRoutingKey === expectedKey;
      return {
        status: 'NOT_EVIDENCED',
        routeMatch: 'NOT_EVIDENCED',
        routingKeyCheck: keyMatch ? 'PASS' : 'ERROR',
        expectedRoutingKey: expectedKey,
        actualRoutingKey: actualRoutingKey || 'N/A',
        expectedTopology: 'NOT_EVIDENCED',
        actualTopology: actualTopology || 'N/A',
        reason: keyMatch
          ? `Routing key matches "${expectedKey}"; authoritative App795 route result required for overall route PASS`
          : `Routing key mismatch: Expected "${expectedKey}", Actual "${actualRoutingKey || 'N/A'}"`
      };
    }

    // Compare against authoritative App795 route
    const keyMatch = actualRoutingKey === expectedKey;
    const topMatch = actualTopology === authoritativeRoute.topology;
    const countMatch = Number(actualAppraiserCount) === authoritativeRoute.appraiserCount;

    const norm = AdminDiagnosticModel.normalizeUserCode;
    const a1Match = !authoritativeRoute.appraiser1 || norm(actualAppraiser1) === norm(authoritativeRoute.appraiser1);
    const a2Match = !authoritativeRoute.appraiser2 || norm(actualAppraiser2) === norm(authoritativeRoute.appraiser2);
    const a3Match = !authoritativeRoute.appraiser3 || norm(actualAppraiser3) === norm(authoritativeRoute.appraiser3);
    const a4Match = !authoritativeRoute.appraiser4 || norm(actualAppraiser4) === norm(authoritativeRoute.appraiser4);

    const isFullMatch = keyMatch && topMatch && countMatch && a1Match && a2Match && a3Match && a4Match;

    return {
      status: isFullMatch ? 'PASS' : 'ERROR',
      routeMatch: isFullMatch ? 'PASS' : 'ERROR',
      expectedRoutingKey: expectedKey,
      actualRoutingKey: actualRoutingKey || 'N/A',
      expectedTopology: authoritativeRoute.topology,
      actualTopology: actualTopology || 'N/A',
      expectedAppraiserCount: authoritativeRoute.appraiserCount,
      actualAppraiserCount: actualAppraiserCount || 'N/A',
      expectedAppraiser1: authoritativeRoute.appraiser1 || 'N/A',
      actualAppraiser1: actualAppraiser1 || 'N/A',
      expectedAppraiser2: authoritativeRoute.appraiser2 || 'N/A',
      actualAppraiser2: actualAppraiser2 || 'N/A',
      reason: isFullMatch ? 'Route assignment matches authoritative App795 master' : 'Route assignment mismatch with App795 master'
    };
  }

  /**
   * E. Fast Repair Preparation & Root-Cause Classifier.
   * FIX_THIS_RECORD requires proven master inputs AND proven master outputs.
   */
  static prepareRepairCandidate(context = {}) {
    const profileEval = AdminDiagnosticModel.evaluateProfileMatch(context);
    const routeEval = AdminDiagnosticModel.evaluateRouteMatch(context);

    let workflowEval = { status: 'PASS' };
    if (context.currentStatus) {
      workflowEval = AdminDiagnosticModel.evaluateWorkflowTrace(context);
    }

    const hasProfileError = profileEval.status === 'ERROR';
    const hasRouteError = routeEval.status === 'ERROR';
    const hasWorkflowError = workflowEval.status === 'ERROR';
    const isProfileUncertain = profileEval.status === 'NOT_EVIDENCED';
    const isRouteUncertain = routeEval.status === 'NOT_EVIDENCED';

    const isMasterEvidenceProven = Boolean(context.authoritativeProfile || context.authoritativeRoute);

    let rootCause = 'NO_REPAIR_NEEDED';
    let problemType = 'NONE';
    let authoritativeSource = 'All master sources & record fields aligned';
    let recommendedAction = 'No repair required. System is operating normally.';
    let targetApp = 'N/A';
    let risk = 'LOW';
    let impactScope = '0 records';

    if (context.isApp53InputWrong) {
      rootCause = 'FIX_EMPLOYEE_MASTER_FIRST';
      problemType = 'EMPLOYEE_MASTER_INPUT_INVALID';
      authoritativeSource = 'App 53 Staff Master';
      recommendedAction = 'Correct Employee Position, Section, or Team in App 53 Staff Master first, then re-run Employee Check.';
      targetApp = 'App 53 (Staff Master)';
      risk = 'MEDIUM';
      impactScope = 'N records (All employees in Section)';
    } else if (context.isApp795RouteWrong) {
      rootCause = 'FIX_ROUTING_MASTER_FIRST';
      problemType = 'ROUTING_MASTER_CONFIG_INVALID';
      authoritativeSource = 'App 795 Routing Master';
      recommendedAction = 'Update route assignment or topology in App 795 Routing Master first.';
      targetApp = 'App 795 (Routing Master)';
      risk = 'HIGH';
      impactScope = 'N records (All employees sharing Routing_Key)';
    } else if (context.isApp796ProfileWrong) {
      rootCause = 'FIX_SCORING_PROFILE_MASTER_FIRST';
      problemType = 'PROFILE_SCORING_MASTER_INVALID';
      authoritativeSource = 'App 796 Profile & Scoring Master';
      recommendedAction = 'Publish correct Profile_Code or Part A/B ratio configuration in App 796 first.';
      targetApp = 'App 796 (Scoring Master)';
      risk = 'HIGH';
      impactScope = 'N records (All employees sharing Profile_Code)';
    } else if (hasWorkflowError) {
      rootCause = 'ESCALATE_WORKFLOW_REPAIR';
      problemType = 'WORKFLOW_STATE_INCONSISTENCY';
      authoritativeSource = 'Confirmed Process Management 16-State Workflow Model';
      recommendedAction = 'WORKFLOW_REPAIR_REQUIRES_SEPARATE_AUTHORIZED_PACKAGE — Manual process transition required by authorized HR administrator.';
      targetApp = 'App 794 (Process Management)';
      risk = 'HIGH';
      impactScope = '1 record';
    } else if ((hasProfileError || hasRouteError) && isMasterEvidenceProven) {
      rootCause = 'FIX_THIS_RECORD';
      problemType = 'STALE_APP794_SNAPSHOT';
      authoritativeSource = 'App 53 / App 795 / App 796 Master Sources (Verified Correct)';
      recommendedAction = 'Rebind stale Profile_Code, Weights, or Routing fields on this App 794 record snapshot.';
      targetApp = 'App 794 (MBO Evaluation Record)';
      risk = 'LOW';
      impactScope = '1 record';
    } else if (hasProfileError || hasRouteError || isProfileUncertain || isRouteUncertain) {
      rootCause = 'BLOCKED_NOT_ENOUGH_EVIDENCE';
      problemType = 'INSUFFICIENT_AUTHORITATIVE_EVIDENCE';
      authoritativeSource = 'Unknown / Unlinked Master Source';
      recommendedAction = 'Supply authoritative App 53/795/796 evidence before preparing repair.';
      targetApp = 'N/A';
      risk = 'BLOCKED';
      impactScope = 'UNKNOWN';
    }

    const beforeDiff = {
      Profile_Code: context.actualProfileCode || 'N/A',
      PartA_Weight: context.actualPartAWeight ?? 'N/A',
      PartB_Weight: context.actualPartBWeight ?? 'N/A',
      Routing_Key: context.actualRoutingKey || 'N/A',
      Routing_Topology: context.actualTopology || 'N/A',
      Appraiser_Count: context.actualAppraiserCount ?? 'N/A'
    };

    const afterDiff = {
      Profile_Code: profileEval.expectedProfileCode !== 'NOT_EVIDENCED' ? profileEval.expectedProfileCode : beforeDiff.Profile_Code,
      PartA_Weight: profileEval.expectedPartAWeight ?? beforeDiff.PartA_Weight,
      PartB_Weight: profileEval.expectedPartBWeight ?? beforeDiff.PartB_Weight,
      Routing_Key: routeEval.expectedRoutingKey !== 'NOT_EVIDENCED' ? routeEval.expectedRoutingKey : beforeDiff.Routing_Key,
      Routing_Topology: routeEval.expectedTopology !== 'NOT_EVIDENCED' ? routeEval.expectedTopology : beforeDiff.Routing_Topology,
      Appraiser_Count: routeEval.expectedAppraiserCount !== 'NOT_EVIDENCED' ? routeEval.expectedAppraiserCount : beforeDiff.Appraiser_Count
    };

    return {
      employeeCode: context.employeeCode || 'N/A',
      fiscalYear: context.fiscalYear || '2026',
      problemType,
      rootCause,
      authoritativeSource,
      recommendedAction,
      targetApp,
      risk,
      impactScope,
      before: beforeDiff,
      after: afterDiff,
      fieldsAffected: ['Profile_Code', 'PartA_Weight', 'PartB_Weight', 'Routing_Key', 'Routing_Topology', 'Expected_Appraiser_Count'],
      backupRequired: 'YES',
      readbackRequired: 'YES',
      rollbackRequired: 'YES',
      executionStatus: 'NOT EXECUTED',
      repairWriteImplemented: false,
      confirmRepairEnabled: false
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
      activeAppraiserSlot: options.activeAppraiserSlot || null,
      expectedAppraiserCount: options.expectedAppraiserCount || null,
      appraiser1: options.appraiser1 || getVal('First_Manager_User') || 'N/A',
      appraiser2: options.appraiser2 || getVal('GM_User') || 'N/A',
      appraiser3: options.appraiser3 || 'N/A',
      appraiser4: options.appraiser4 || 'N/A',
      routingKey: options.routingKey || 'N/A',
      sectionCode: getVal('Section_Code') || options.sectionCode || 'N/A',
      teamName: getVal('Team') || options.teamName || 'N/A',
      routingResult: options.routingResult || null,
      profileCode: getVal('Profile_Code') || options.profileCode || null,
      partAWeight: options.partAWeight || null,
      partBWeight: options.partBWeight || null,
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
   * Uses an explicit ALLOWLIST contract for diagnostic sections + recursive redaction defense-in-depth.
   */
  static generateDiagnosticSnapshot(diagnosticData = {}) {
    const {
      health,
      recordDiag,
      workflowTrace,
      profileMatch,
      routeMatch,
      repairCandidate
    } = diagnosticData;

    const allowlisted = {
      recordIdentity: {
        recordId: recordDiag?.recordId || 'N/A',
        mboKey: recordDiag?.mboKey || 'N/A',
        fiscalYear: recordDiag?.fiscalYear || '2026',
        employeeCode: recordDiag?.employeeCode || 'N/A',
        loggedInUserCode: recordDiag?.loggedInUserCode || 'admin-form',
        currentStatus: recordDiag?.currentStatus || 'N/A'
      },
      healthSummary: health ? { overallHealth: health.overallHealth, evaluatedAt: health.evaluatedAt } : null,
      workflowValidation: workflowTrace || null,
      profileValidation: profileMatch || null,
      routeValidation: routeMatch || null,
      repairRecommendation: repairCandidate ? {
        problemType: repairCandidate.problemType,
        rootCause: repairCandidate.rootCause,
        authoritativeSource: repairCandidate.authoritativeSource,
        recommendedAction: repairCandidate.recommendedAction,
        risk: repairCandidate.risk,
        impactScope: repairCandidate.impactScope,
        executionStatus: repairCandidate.executionStatus
      } : null,
      buildVersion: BUILD_VERSION_INFO
    };

    const raw = JSON.parse(JSON.stringify(allowlisted));

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
