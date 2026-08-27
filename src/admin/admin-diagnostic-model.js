/**
 * Admin Diagnostic Model & Health Engine (D7 Corrective Round 2)
 * Pure logic for Technical Admin (admin-form) System Health, Workflow Trace, Profile/Route Validation,
 * Topology-aware Ordinal Appraiser Slot Normalization, Root-Cause Classification, Fast Repair Candidate Preparation, and Sanitized Snapshot.
 *
 * Source of Truth: project-docs/CONFIRMED_BASELINE/
 */

import { PROFILE_CODES, getProfileCodeFromPosition } from '../profiles/profile-codes-policy.js';

export const BUILD_VERSION_INFO = {
  version: '0.2.4',
  sourceBuildId: 'WP-002C-CORRECTIVE-ROUND2',
  commitSha: 'NOT_EVIDENCED',
  buildTimestamp: '2026-08-27T13:39:00Z',
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

export const CANONICAL_PROFILE_WEIGHTS = {
  [PROFILE_CODES.STAFF_CHIEF]: { a: 70, b: 30 },
  [PROFILE_CODES.JAPANESE_STAFF]: { a: 70, b: 30 },
  [PROFILE_CODES.ASST_MGR]: { a: 60, b: 40 },
  [PROFILE_CODES.SECTION_MGR]: { a: 50, b: 50 },
  [PROFILE_CODES.SENIOR_MGR]: { a: 50, b: 50 },
  [PROFILE_CODES.DGM]: { a: 50, b: 50 },
  [PROFILE_CODES.GM]: { a: 50, b: 50 },
  [PROFILE_CODES.VP]: { a: 50, b: 50 }
};

export class AdminDiagnosticModel {
  /**
   * P0 Security Gate: Strictly authorizes `admin-form` only for technical diagnostics.
   * `admin-form` has 0 Business Workflow Authority and CANNOT perform requester/approval business actions.
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
    if (Array.isArray(code)) {
      if (code.length > 0) return AdminDiagnosticModel.normalizeUserCode(code[0]);
      return '';
    }
    if (typeof code === 'object') {
      if (typeof code.code === 'string') return code.code.trim().toLowerCase();
      if (typeof code.value === 'string') return code.value.trim().toLowerCase();
      if (Array.isArray(code.value) && code.value.length > 0) return AdminDiagnosticModel.normalizeUserCode(code.value[0]);
    }
    return String(code).trim().toLowerCase();
  }

  /**
   * Topology-aware Ordinal Appraiser Slot Normalizer (P0-E & B3).
   * Normalizes record/context fields into exact 1st..4th Appraiser ordinal slots based on Routing_Topology.
   */
  static normalizeAppraiserSlots(context = {}) {
    const topology = context.topology || context.Routing_Topology || context.actualTopology || 'M1_G1';
    
    const getVal = (code) => {
      const v = context[code];
      if (!v) return '';
      return AdminDiagnosticModel.normalizeUserCode(v);
    };

    let expectedCount = 2;
    const slots = [];

    if (topology === 'M1_ONLY') {
      expectedCount = 1;
      const user = getVal('appraiser1') || getVal('Manager_User') || getVal('First_Manager_User');
      slots.push({ slot: 1, labelEN: '1st Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 1', userCode: user, sourceField: 'Manager_User' });
    } else if (topology === 'M1_G1') {
      expectedCount = 2;
      const u1 = getVal('appraiser1') || getVal('Manager_User');
      const u2 = getVal('appraiser2') || getVal('GM_User');
      slots.push({ slot: 1, labelEN: '1st Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 1', userCode: u1, sourceField: 'Manager_User' });
      slots.push({ slot: 2, labelEN: '2nd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 2', userCode: u2, sourceField: 'GM_User' });
    } else if (topology === 'M1_M2_G1') {
      expectedCount = 3;
      const u1 = getVal('appraiser1') || getVal('First_Manager_User');
      const u2 = getVal('appraiser2') || getVal('Manager_User');
      const u3 = getVal('appraiser3') || getVal('GM_User');
      slots.push({ slot: 1, labelEN: '1st Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 1', userCode: u1, sourceField: 'First_Manager_User' });
      slots.push({ slot: 2, labelEN: '2nd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 2', userCode: u2, sourceField: 'Manager_User' });
      slots.push({ slot: 3, labelEN: '3rd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 3', userCode: u3, sourceField: 'GM_User' });
    } else if (topology === 'M1_G1_G2') {
      expectedCount = 3;
      const u1 = getVal('appraiser1') || getVal('Manager_User');
      const u2 = getVal('appraiser2') || getVal('GM_User');
      const u3 = getVal('appraiser3') || getVal('GM_Level2_Approvers');
      slots.push({ slot: 1, labelEN: '1st Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 1', userCode: u1, sourceField: 'Manager_User' });
      slots.push({ slot: 2, labelEN: '2nd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 2', userCode: u2, sourceField: 'GM_User' });
      slots.push({ slot: 3, labelEN: '3rd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 3', userCode: u3, sourceField: 'GM_Level2_Approvers' });
    } else if (topology === 'M1_M2_G1_G2') {
      expectedCount = 4;
      const u1 = getVal('appraiser1') || getVal('First_Manager_User');
      const u2 = getVal('appraiser2') || getVal('Manager_User');
      const u3 = getVal('appraiser3') || getVal('GM_User');
      const u4 = getVal('appraiser4') || getVal('GM_Level2_Approvers');
      slots.push({ slot: 1, labelEN: '1st Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 1', userCode: u1, sourceField: 'First_Manager_User' });
      slots.push({ slot: 2, labelEN: '2nd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 2', userCode: u2, sourceField: 'Manager_User' });
      slots.push({ slot: 3, labelEN: '3rd Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 3', userCode: u3, sourceField: 'GM_User' });
      slots.push({ slot: 4, labelEN: '4th Appraiser', labelTH: 'ผู้ประเมินลำดับที่ 4', userCode: u4, sourceField: 'GM_Level2_Approvers' });
    }

    return {
      topology,
      expectedCount,
      slots
    };
  }

  /**
   * Evaluates System Health across 15 diagnostic indicators.
   * B5 Fix: When commitSha is 'NOT_EVIDENCED', bundle_version status is NOT_EVIDENCED, not PASS.
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

    // 1. Identity Resolution (P0 Security Gate)
    const isAdminUser = AdminDiagnosticModel.isTechnicalAdmin(loginUserCode);
    items.push({
      key: 'identity_resolution',
      labelTH: 'การระบุตัวตน Kintone (Identity Resolution)',
      labelEN: 'Kintone Identity Resolution',
      status: isAdminUser ? 'PASS' : 'ERROR',
      reason: isAdminUser
        ? `Logged in technical admin: ${loginUserCode}`
        : (loginUserCode ? `Access Denied: User "${loginUserCode}" is not authorized technical admin admin-form` : 'Logged-in user code is missing')
    });

    // 2. Requester Mapping
    items.push({
      key: 'requester_mapping',
      labelTH: 'ผู้ขอประเมิน (Requester User Mapping)',
      labelEN: 'Requester User Mapping',
      status: requesterUserCodes.length > 0 ? 'PASS' : 'WARNING',
      reason: requesterUserCodes.length > 0 ? `Requester user code(s): ${requesterUserCodes.join(', ')}` : 'Requester_User field is unassigned'
    });

    // 3. Routing Resolution (Routing Key alone != PASS)
    let routingStatus = 'NOT_EVIDENCED';
    let routingReason = 'Routing resolution evidence not provided';
    if (routingResult?.status === 'FAIL_CLOSED' || routingResult?.isFailClosed) {
      routingStatus = 'ERROR';
      routingReason = `Routing fail-closed: ${routingResult.reason || 'No matching App795 route'}`;
    } else if (routingResult?.status === 'PASS') {
      routingStatus = 'PASS';
      routingReason = `Routing resolved via App795: ${routingKey || 'Verified'}`;
    } else if (routingKey) {
      routingStatus = 'NOT_EVIDENCED';
      routingReason = `Routing key "${routingKey}" checked; authoritative App795 route result evidence required for PASS`;
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
    let wfStatus = 'NOT_EVIDENCED';
    let wfReason = 'Current workflow status evidence missing';
    if (currentStatus) {
      if (CANONICAL_STATUSES.includes(currentStatus)) {
        wfStatus = 'PASS';
        wfReason = `Status: "${currentStatus}", Actor: "${currentActor || 'N/A'}"`;
      } else {
        wfStatus = 'ERROR';
        wfReason = `Current status "${currentStatus}" is non-canonical or unmapped`;
      }
    }
    items.push({
      key: 'workflow_status',
      labelTH: 'สถานะกระบวนการ (Workflow Status & Actor)',
      labelEN: 'Workflow Status & Current Actor',
      status: wfStatus,
      reason: wfReason
    });

    // 10. Viewer / Privacy Resolution
    let viewerStatus = 'NOT_EVIDENCED';
    let viewerReason = 'Viewer role evidence missing';
    if (resolvedViewerRole) {
      viewerStatus = 'PASS';
      viewerReason = `Viewer Role: ${resolvedViewerRole}`;
    }
    items.push({
      key: 'viewer_privacy',
      labelTH: 'สิทธิ์การมองเห็น (Viewer Privacy Resolution)',
      labelEN: 'Viewer Privacy Resolution',
      status: viewerStatus,
      reason: viewerReason
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

    // 15. Bundle / Source Version Identifier (B5 Fix: NOT_EVIDENCED when commitSha is NOT_EVIDENCED)
    const isCommitEvidenced = BUILD_VERSION_INFO.commitSha && BUILD_VERSION_INFO.commitSha !== 'NOT_EVIDENCED';
    items.push({
      key: 'bundle_version',
      labelTH: 'เวอร์ชันระบบ (Bundle / Build Identifier)',
      labelEN: 'Bundle / Build Identifier',
      status: isCommitEvidenced ? 'PASS' : 'NOT_EVIDENCED',
      reason: `v${BUILD_VERSION_INFO.version} (${BUILD_VERSION_INFO.sourceBuildId}) • Commit: ${BUILD_VERSION_INFO.commitSha}`
    });

    const hasError = items.some(i => i.status === 'ERROR');
    const hasUncertain = items.some(i => i.status === 'NOT_EVIDENCED' || i.status === 'NOT_AVAILABLE');
    const hasWarning = items.some(i => i.status === 'WARNING');
    const overallHealth = hasError ? 'ERROR' : (hasUncertain ? 'INCOMPLETE_EVIDENCE' : (hasWarning ? 'WARNING' : 'PASS'));

    return {
      overallHealth,
      items,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * B. Evaluates Workflow Trace & Workflow State Consistency (P0-D Truth Boundary).
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

    const isConfirmedTopology = topology === 'M1_G1' || topology === 'M1_ONLY';
    const topologyCertificationStatus = topology === 'M1_G1'
      ? 'CURRENT_CONFIRMED'
      : (topology === 'M1_ONLY' ? 'CONFIRMED_EXECUTIVE_DIRECT_CONTEXT' : 'FUTURE_TOPOLOGY_NOT_PRODUCTION_CERTIFIED');

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

    let historyStatus = 'PENDING_AUDIT_SCHEMA_AUTHORIZATION';
    let isAuditStructurallyValid = false;

    if (Array.isArray(actualAuditHistory) && actualAuditHistory.length > 0) {
      isAuditStructurallyValid = actualAuditHistory.every(entry =>
        entry &&
        typeof entry === 'object' &&
        Boolean(entry.actor || entry.actorKintoneUserCode || entry.actorCode) &&
        Boolean(entry.fromStatus || entry.from_status) &&
        Boolean(entry.toStatus || entry.to_status) &&
        Boolean(entry.action || entry.result) &&
        Boolean(entry.timestamp || entry.actionAt || entry.action_at)
      );

      if (isAuditStructurallyValid) {
        historyStatus = 'EVIDENCED';
      } else {
        historyStatus = 'INVALID_AUDIT_STRUCTURE';
      }
    }

    const overallStatus = isConfirmedTopology ? 'PASS' : 'WARNING';
    const reasonText = isConfirmedTopology
      ? `Workflow status "${currentStatus}" is consistent with topology "${topology}"`
      : `Topology "${topology}" is a future/unreviewed topology (FUTURE_TOPOLOGY_NOT_PRODUCTION_CERTIFIED)`;

    return {
      status: overallStatus,
      isFailClosed: false,
      topologyCertificationStatus,
      reason: reasonText,
      expectedPath: expectedPath.join(' → '),
      consistency: overallStatus,
      historyStatus,
      actualAuditHistory: isAuditStructurallyValid ? actualAuditHistory : 'NOT_AVAILABLE'
    };
  }

  /**
   * C. Evaluates Expected vs Actual Evaluation Profile.
   * Reuses canonical shared profile policy from src/profiles/profile-scoring-resolver.js.
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

    let expectedCode = null;
    if (position) {
      try {
        expectedCode = getProfileCodeFromPosition(position);
      } catch {
        return {
          status: 'NOT_EVIDENCED',
          reason: `Position "${position}" not found in authoritative position ratio mapping`,
          expectedProfileCode: 'NOT_EVIDENCED',
          actualProfileCode: actualProfileCode || 'N/A',
          profileMatch: 'NOT_EVIDENCED'
        };
      }
    }

    const expectedWeights = CANONICAL_PROFILE_WEIGHTS[expectedCode];
    if (!expectedWeights) {
      return {
        status: 'NOT_EVIDENCED',
        reason: `Profile code "${expectedCode || 'N/A'}" weights missing in canonical weight table`,
        expectedProfileCode: expectedCode || 'NOT_EVIDENCED',
        actualProfileCode: actualProfileCode || 'N/A',
        profileMatch: 'NOT_EVIDENCED'
      };
    }

    const codeMatch = actualProfileCode === expectedCode;
    const aMatch = Number(actualPartAWeight) === expectedWeights.a;
    const bMatch = Number(actualPartBWeight) === expectedWeights.b;
    const isMatch = codeMatch && aMatch && bMatch;

    return {
      status: isMatch ? 'PASS' : 'ERROR',
      profileMatch: isMatch ? 'PASS' : 'ERROR',
      expectedProfileCode: expectedCode,
      actualProfileCode: actualProfileCode || 'N/A',
      expectedPartAWeight: expectedWeights.a,
      actualPartAWeight: actualPartAWeight !== undefined ? Number(actualPartAWeight) : 'N/A',
      expectedPartBWeight: expectedWeights.b,
      actualPartBWeight: actualPartBWeight !== undefined ? Number(actualPartBWeight) : 'N/A',
      reason: isMatch
        ? `Profile matches expected ${expectedCode} (${expectedWeights.a}/${expectedWeights.b})`
        : `Profile mismatch: Expected ${expectedCode} (${expectedWeights.a}/${expectedWeights.b}), Actual ${actualProfileCode || 'N/A'} (${actualPartAWeight}/${actualPartBWeight})`
    };
  }

  /**
   * D. Evaluates Expected vs Actual Route Assignment.
   * Requires complete App795 route evidence (all required ordinal Appraiser 1..N identities).
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

      const authAppraiser1 = authoritativeRoute?.appraiser1 || authoritativeRoute?.First_Manager_User || authoritativeRoute?.Manager_User;

      if (!authoritativeRoute || !authAppraiser1) {
        return {
          status: 'NOT_EVIDENCED',
          routeMatch: 'NOT_EVIDENCED',
          expectedRoutingKey: expectedExecKey,
          actualRoutingKey: actualRoutingKey || 'N/A',
          expectedTopology: 'M1_ONLY',
          actualTopology: actualTopology || 'N/A',
          expectedAppraiserCount: 1,
          actualAppraiserCount: actualAppraiserCount || 'N/A',
          reason: 'Executive routing key checked; authoritative App795 appraiser1 evidence required for full PASS'
        };
      }

      const norm = AdminDiagnosticModel.normalizeUserCode;
      const appraiser1Match = norm(actualAppraiser1) === norm(authAppraiser1);

      if (!appraiser1Match) {
        return {
          status: 'ERROR',
          routeMatch: 'ERROR',
          expectedRoutingKey: expectedExecKey,
          actualRoutingKey: actualRoutingKey || 'N/A',
          expectedTopology: 'M1_ONLY',
          actualTopology: actualTopology || 'N/A',
          expectedAppraiserCount: 1,
          actualAppraiserCount: actualAppraiserCount || 'N/A',
          expectedAppraiser1: authAppraiser1,
          actualAppraiser1: actualAppraiser1 || 'N/A',
          reason: '1ST_APPRAISER_MISMATCH: Actual 1st Appraiser does not match authoritative App795 executive route'
        };
      }

      const isExecMatch = keyMatch && isExecTopology && isExecCount && appraiser1Match;
      return {
        status: isExecMatch ? 'PASS' : 'ERROR',
        routeMatch: isExecMatch ? 'PASS' : 'ERROR',
        expectedRoutingKey: expectedExecKey,
        actualRoutingKey: actualRoutingKey || 'N/A',
        expectedTopology: 'M1_ONLY',
        actualTopology: actualTopology || 'N/A',
        expectedAppraiserCount: 1,
        actualAppraiserCount: actualAppraiserCount || 'N/A',
        expectedAppraiser1: authAppraiser1,
        actualAppraiser1: actualAppraiser1 || 'N/A',
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

    const isTMG = (sectionCode || '').toUpperCase().startsWith('TMG');
    let expectedKey = sectionCode || authoritativeRoute?.Routing_Key || authoritativeRoute?.Matched_Rule || '';
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

    const expectedCount = Number(authoritativeRoute.appraiserCount || 2);
    const authNorm = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: authoritativeRoute.topology,
      appraiser1: authoritativeRoute.appraiser1 || authoritativeRoute.Manager_User,
      appraiser2: authoritativeRoute.appraiser2 || authoritativeRoute.GM_User,
      appraiser3: authoritativeRoute.appraiser3,
      appraiser4: authoritativeRoute.appraiser4,
      First_Manager_User: authoritativeRoute.First_Manager_User,
      Manager_User: authoritativeRoute.Manager_User,
      GM_User: authoritativeRoute.GM_User
    });

    const actualNorm = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: actualTopology,
      appraiser1: actualAppraiser1,
      appraiser2: actualAppraiser2,
      appraiser3: actualAppraiser3,
      appraiser4: actualAppraiser4,
      First_Manager_User: context.First_Manager_User,
      Manager_User: context.Manager_User,
      GM_User: context.GM_User
    });

    for (let i = 1; i <= expectedCount; i++) {
      const authSlot = authNorm.slots.find(s => s.slot === i);
      if (!authSlot || !authSlot.userCode) {
        return {
          status: 'NOT_EVIDENCED',
          routeMatch: 'NOT_EVIDENCED',
          expectedRoutingKey: expectedKey,
          actualRoutingKey: actualRoutingKey || 'N/A',
          reason: `Authoritative App795 route is missing required user identity for Slot ${i}`
        };
      }
    }

    const keyMatch = actualRoutingKey === expectedKey;
    const topMatch = actualTopology === authoritativeRoute.topology;
    const countMatch = Number(actualAppraiserCount) === expectedCount;

    const norm = AdminDiagnosticModel.normalizeUserCode;
    let slotMismatchReason = null;

    for (let i = 1; i <= expectedCount; i++) {
      const authUser = authNorm.slots.find(s => s.slot === i)?.userCode || '';
      const actualUser = actualNorm.slots.find(s => s.slot === i)?.userCode || '';

      if (norm(authUser) !== norm(actualUser)) {
        const ordinalLabels = { 1: '1ST', 2: '2ND', 3: '3RD', 4: '4TH' };
        slotMismatchReason = `${ordinalLabels[i]}_APPRAISER_MISMATCH: Actual ${i}st/nd/rd/th Appraiser (${actualUser || 'empty'}) does not match authoritative App795 (${authUser})`;
        break;
      }
    }

    let extraSlotError = null;
    const actualTotalSlotsPresent = [actualAppraiser1, actualAppraiser2, actualAppraiser3, actualAppraiser4].filter(Boolean).length;
    if (actualTotalSlotsPresent > expectedCount) {
      extraSlotError = `EXTRA_APPRAISER_SLOT_ERROR: Actual record has ${actualTotalSlotsPresent} appraiser slots, but expected topology count is ${expectedCount}`;
    }

    if (slotMismatchReason) {
      return {
        status: 'ERROR',
        routeMatch: 'ERROR',
        expectedRoutingKey: expectedKey,
        actualRoutingKey: actualRoutingKey || 'N/A',
        expectedTopology: authoritativeRoute.topology,
        actualTopology: actualTopology || 'N/A',
        expectedAppraiserCount: expectedCount,
        actualAppraiserCount: actualAppraiserCount || 'N/A',
        reason: slotMismatchReason
      };
    }

    if (extraSlotError) {
      return {
        status: 'ERROR',
        routeMatch: 'ERROR',
        expectedRoutingKey: expectedKey,
        actualRoutingKey: actualRoutingKey || 'N/A',
        expectedTopology: authoritativeRoute.topology,
        actualTopology: actualTopology || 'N/A',
        expectedAppraiserCount: expectedCount,
        actualAppraiserCount: actualAppraiserCount || 'N/A',
        reason: extraSlotError
      };
    }

    const isFullMatch = keyMatch && topMatch && countMatch;

    return {
      status: isFullMatch ? 'PASS' : 'ERROR',
      routeMatch: isFullMatch ? 'PASS' : 'ERROR',
      expectedRoutingKey: expectedKey,
      actualRoutingKey: actualRoutingKey || 'N/A',
      expectedTopology: authoritativeRoute.topology,
      actualTopology: actualTopology || 'N/A',
      expectedAppraiserCount: expectedCount,
      actualAppraiserCount: actualAppraiserCount || 'N/A',
      expectedAppraiser1: authoritativeRoute.appraiser1 || 'N/A',
      actualAppraiser1: actualAppraiser1 || 'N/A',
      expectedAppraiser2: authoritativeRoute.appraiser2 || 'N/A',
      actualAppraiser2: actualAppraiser2 || 'N/A',
      expectedAppraiser3: authoritativeRoute.appraiser3 || 'N/A',
      actualAppraiser3: actualAppraiser3 || 'N/A',
      expectedAppraiser4: authoritativeRoute.appraiser4 || 'N/A',
      actualAppraiser4: actualAppraiser4 || 'N/A',
      reason: isFullMatch
        ? 'Route assignment matches authoritative App795 master'
        : 'Route assignment mismatch with App795 master'
    };
  }

  /**
   * E. Fast Repair Preparation & Root-Cause Classifier.
   * B2 Fix: App796 Fiscal_Year and Config_Status = 'PUBLISHED' evidence are MANDATORY for profileMasterEvidenced.
   * B4 Fix: Routing_Key ONLY appears in repair diff if isPhysicalRoutingKeyProven === true.
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

    const isProfileOk = profileEval.status === 'PASS';
    const isRouteOk = routeEval.status === 'PASS';

    // B2 Fix: Mandatory strict check on FY and Config_Status = 'PUBLISHED'
    let isProfileMasterProven = false;
    if (context.authoritativeProfile) {
      const authCode = context.authoritativeProfile.code || context.authoritativeProfile.Profile_Code;
      const authA = context.authoritativeProfile.partAWeight ?? context.authoritativeProfile.PartA_Weight;
      const authB = context.authoritativeProfile.partBWeight ?? context.authoritativeProfile.PartB_Weight;
      const authFy = context.authoritativeProfile.Fiscal_Year || context.authoritativeProfile.fiscalYear;
      const authStatus = context.authoritativeProfile.Config_Status || context.authoritativeProfile.configStatus;

      const codeMatch = profileEval.expectedProfileCode !== 'NOT_EVIDENCED' && authCode === profileEval.expectedProfileCode;
      const aMatch = authA !== undefined && authA !== null && profileEval.expectedPartAWeight !== null && Number(authA) === profileEval.expectedPartAWeight;
      const bMatch = authB !== undefined && authB !== null && profileEval.expectedPartBWeight !== null && Number(authB) === profileEval.expectedPartBWeight;
      // B2: authFy and authStatus must BE PRESENT and MATCH EXACTLY
      const fyMatch = Boolean(authFy && context.fiscalYear && authFy === context.fiscalYear);
      const statusMatch = Boolean(authStatus && authStatus === 'PUBLISHED');

      isProfileMasterProven = Boolean(codeMatch && aMatch && bMatch && fyMatch && statusMatch);
    }

    let isRouteMasterProven = false;
    if (context.authoritativeRoute) {
      const top = context.authoritativeRoute.topology;
      const count = context.authoritativeRoute.appraiserCount;
      const a1 = context.authoritativeRoute.appraiser1 || context.authoritativeRoute.Manager_User;
      isRouteMasterProven = Boolean(top && count && a1);
    }

    const profileMasterEvidenced = isProfileMasterProven;
    const routeMasterEvidenced = isRouteMasterProven;

    const profileRepairSafe = hasProfileError && isProfileMasterProven;
    const routeRepairSafe = hasRouteError && isRouteMasterProven;

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
    } else if (isProfileOk && isRouteOk) {
      rootCause = 'NO_REPAIR_NEEDED';
      problemType = 'NONE';
      authoritativeSource = 'All master sources & record fields aligned';
      recommendedAction = 'No repair required. System is operating normally.';
      targetApp = 'N/A';
      risk = 'LOW';
      impactScope = '0 records';
    } else if ((hasProfileError || isProfileUncertain) && (hasRouteError || isRouteUncertain)) {
      if (profileRepairSafe && routeRepairSafe) {
        rootCause = 'FIX_THIS_RECORD';
        problemType = 'STALE_APP794_SNAPSHOT';
        authoritativeSource = 'App 53 / App 795 / App 796 Master Sources (Both Verified Correct)';
        recommendedAction = 'Rebind stale Profile_Code, Weights, and Routing fields on this App 794 record snapshot.';
        targetApp = 'App 794 (MBO Evaluation Record)';
        risk = 'LOW';
        impactScope = '1 record';
      } else {
        rootCause = 'BLOCKED_NOT_ENOUGH_EVIDENCE';
        problemType = 'INSUFFICIENT_AUTHORITATIVE_EVIDENCE';
        authoritativeSource = 'Unknown / Partial Master Source';
        recommendedAction = 'Both Profile and Route evidence are required before preparing record repair.';
        targetApp = 'N/A';
        risk = 'BLOCKED';
        impactScope = 'UNKNOWN';
      }
    } else if (hasProfileError) {
      if (profileRepairSafe && (!isRouteUncertain || isRouteMasterProven)) {
        rootCause = 'FIX_THIS_RECORD';
        problemType = 'STALE_APP794_PROFILE_SNAPSHOT';
        authoritativeSource = 'App 796 Profile & Scoring Master (Verified Correct)';
        recommendedAction = 'Rebind stale Profile_Code and Weights on this App 794 record snapshot.';
        targetApp = 'App 794 (MBO Evaluation Record)';
        risk = 'LOW';
        impactScope = '1 record';
      } else {
        rootCause = 'BLOCKED_NOT_ENOUGH_EVIDENCE';
        problemType = 'INSUFFICIENT_AUTHORITATIVE_EVIDENCE';
        authoritativeSource = 'Unknown / Unlinked Scoring Master Source';
        recommendedAction = 'Profile mismatch detected. Authoritative App 796 profile evidence matching expected employee classification is required before preparing record repair.';
        targetApp = 'N/A';
        risk = 'BLOCKED';
        impactScope = 'UNKNOWN';
      }
    } else if (hasRouteError) {
      if (routeRepairSafe && (!isProfileUncertain || isProfileMasterProven)) {
        rootCause = 'FIX_THIS_RECORD';
        problemType = 'STALE_APP794_ROUTE_SNAPSHOT';
        authoritativeSource = 'App 795 Routing Master (Verified Correct)';
        recommendedAction = 'Rebind stale Routing fields on this App 794 record snapshot.';
        targetApp = 'App 794 (MBO Evaluation Record)';
        risk = 'LOW';
        impactScope = '1 record';
      } else {
        rootCause = 'BLOCKED_NOT_ENOUGH_EVIDENCE';
        problemType = 'INSUFFICIENT_AUTHORITATIVE_EVIDENCE';
        authoritativeSource = 'Unknown / Unlinked Routing Master Source';
        recommendedAction = 'Route mismatch detected. Authoritative App 795 route evidence is required before preparing record repair.';
        targetApp = 'N/A';
        risk = 'BLOCKED';
        impactScope = 'UNKNOWN';
      }
    } else {
      rootCause = 'BLOCKED_NOT_ENOUGH_EVIDENCE';
      problemType = 'INSUFFICIENT_AUTHORITATIVE_EVIDENCE';
      authoritativeSource = 'Unknown / Unlinked Master Source';
      recommendedAction = 'Supply authoritative App 53/795/796 evidence before preparing repair.';
      targetApp = 'N/A';
      risk = 'BLOCKED';
      impactScope = 'UNKNOWN';
    }

    const beforeDiff = {};
    const afterDiff = {};
    const fieldsAffected = [];

    if (rootCause === 'FIX_THIS_RECORD') {
      if (profileRepairSafe) {
        if (context.actualProfileCode !== profileEval.expectedProfileCode && profileEval.expectedProfileCode !== 'NOT_EVIDENCED') {
          beforeDiff.Profile_Code = context.actualProfileCode || 'NOT_EVIDENCED';
          afterDiff.Profile_Code = profileEval.expectedProfileCode;
          fieldsAffected.push('Profile_Code');
        }
        if (Number(context.actualPartAWeight) !== profileEval.expectedPartAWeight && profileEval.expectedPartAWeight !== null) {
          beforeDiff.PartA_Weight = context.actualPartAWeight ?? 'NOT_EVIDENCED';
          afterDiff.PartA_Weight = profileEval.expectedPartAWeight;
          fieldsAffected.push('PartA_Weight');
        }
        if (Number(context.actualPartBWeight) !== profileEval.expectedPartBWeight && profileEval.expectedPartBWeight !== null) {
          beforeDiff.PartB_Weight = context.actualPartBWeight ?? 'NOT_EVIDENCED';
          afterDiff.PartB_Weight = profileEval.expectedPartBWeight;
          fieldsAffected.push('PartB_Weight');
        }
      }

      if (routeRepairSafe) {
        // B4 Fix: Routing_Key ONLY appears in repair diff if physical field is explicitly proven
        const isPhysicalKeyProven = context.isPhysicalRoutingKeyProven === true;
        const storedKey = context.actualStoredRoutingKey || context.actualRoutingKey;
        if (isPhysicalKeyProven && storedKey && storedKey !== 'NOT_AVAILABLE' && storedKey !== routeEval.expectedRoutingKey && routeEval.expectedRoutingKey !== 'NOT_EVIDENCED') {
          beforeDiff.Routing_Key = storedKey;
          afterDiff.Routing_Key = routeEval.expectedRoutingKey;
          fieldsAffected.push('Routing_Key');
        }

        if (context.actualTopology !== routeEval.expectedTopology && routeEval.expectedTopology !== 'NOT_EVIDENCED') {
          beforeDiff.Routing_Topology = context.actualTopology || 'NOT_EVIDENCED';
          afterDiff.Routing_Topology = routeEval.expectedTopology;
          fieldsAffected.push('Routing_Topology');
        }
        if (Number(context.actualAppraiserCount) !== routeEval.expectedAppraiserCount && routeEval.expectedAppraiserCount !== 'NOT_EVIDENCED') {
          beforeDiff.Appraiser_Count = context.actualAppraiserCount ?? 'NOT_EVIDENCED';
          afterDiff.Appraiser_Count = routeEval.expectedAppraiserCount;
          fieldsAffected.push('Expected_Appraiser_Count');
        }

        if (context.authoritativeRoute) {
          const norm = AdminDiagnosticModel.normalizeUserCode;
          const authA1 = context.authoritativeRoute.appraiser1 || context.authoritativeRoute.Manager_User;
          const authA2 = context.authoritativeRoute.appraiser2 || context.authoritativeRoute.GM_User;
          const authA3 = context.authoritativeRoute.appraiser3;
          const authA4 = context.authoritativeRoute.appraiser4;

          if (authA1 !== undefined && norm(context.actualAppraiser1) !== norm(authA1)) {
            beforeDiff.Appraiser1 = context.actualAppraiser1 || 'NOT_EVIDENCED';
            afterDiff.Appraiser1 = authA1;
            fieldsAffected.push('1st Appraiser');
          }
          if (authA2 !== undefined && norm(context.actualAppraiser2) !== norm(authA2)) {
            beforeDiff.Appraiser2 = context.actualAppraiser2 || 'NOT_EVIDENCED';
            afterDiff.Appraiser2 = authA2;
            fieldsAffected.push('2nd Appraiser');
          }
          if (authA3 !== undefined && norm(context.actualAppraiser3) !== norm(authA3)) {
            beforeDiff.Appraiser3 = context.actualAppraiser3 || 'NOT_EVIDENCED';
            afterDiff.Appraiser3 = authA3;
            fieldsAffected.push('3rd Appraiser');
          }
          if (authA4 !== undefined && norm(context.actualAppraiser4) !== norm(authA4)) {
            beforeDiff.Appraiser4 = context.actualAppraiser4 || 'NOT_EVIDENCED';
            afterDiff.Appraiser4 = authA4;
            fieldsAffected.push('4th Appraiser');
          }
        }
      }
    }

    return {
      employeeCode: context.employeeCode || 'NOT_EVIDENCED',
      fiscalYear: context.fiscalYear || 'NOT_EVIDENCED',
      problemType,
      rootCause,
      authoritativeSource,
      recommendedAction,
      targetApp,
      risk,
      impactScope,
      profileMasterEvidenced,
      routeMasterEvidenced,
      profileRecordRepairSafe: profileRepairSafe,
      routeRecordRepairSafe: routeRepairSafe,
      before: beforeDiff,
      after: afterDiff,
      fieldsAffected,
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
   * B3 Fix: Uses normalizeAppraiserSlots for topology-aware appraiser slot mapping.
   * B4 Fix: Distinguishes derived expected Routing_Key from stored Routing_Key (NOT_AVAILABLE if physical field unconfirmed).
   */
  static buildRecordDiagnostic(record, options = {}) {
    const getVal = (code) => {
      if (!record) return '';
      const field = record[code];
      if (field === null || field === undefined) return '';
      if (typeof field === 'object' && field !== null) {
        if (Array.isArray(field.value) && field.value.length > 0) {
          return field.value[0]?.code || field.value[0] || '';
        }
        if ('value' in field) return field.value ?? '';
      }
      if (Array.isArray(field) && field.length > 0) {
        return field[0]?.code || field[0] || '';
      }
      return String(field);
    };

    const hasPhysicalKeyField = options.isPhysicalRoutingKeyProven === true || (record && 'Routing_Key' in record);
    const storedRoutingKeyVal = hasPhysicalKeyField ? (getVal('Routing_Key') || options.actualStoredRoutingKey || 'NOT_AVAILABLE') : 'NOT_AVAILABLE';

    // B3 Fix: Topology-aware ordinal appraiser slot mapping
    const normAppraisers = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: options.actualTopology || getVal('Routing_Topology') || 'M1_G1',
      appraiser1: options.appraiser1,
      appraiser2: options.appraiser2,
      appraiser3: options.appraiser3,
      appraiser4: options.appraiser4,
      First_Manager_User: getVal('First_Manager_User'),
      Manager_User: getVal('Manager_User'),
      GM_User: getVal('GM_User'),
      GM_Level2_Approvers: getVal('GM_Level2_Approvers')
    });

    const getSlotUser = (slotNum) => {
      const s = normAppraisers.slots.find(x => x.slot === slotNum);
      return s && s.userCode ? s.userCode : 'NOT_EVIDENCED';
    };

    return {
      recordId: getVal('$id') || options.recordId || 'NOT_EVIDENCED',
      mboKey: getVal('Record_Key') || options.mboKey || 'NOT_EVIDENCED',
      fiscalYear: getVal('Fiscal_Year') || options.fiscalYear || 'NOT_EVIDENCED',
      employeeCode: getVal('Employee_Code') || options.employeeCode || 'NOT_EVIDENCED',
      employeeName: getVal('Employee_Name') || options.employeeName || 'NOT_EVIDENCED',
      requesterUser: getVal('Requester_User') || options.requesterUser || 'NOT_EVIDENCED',
      loggedInUserCode: options.loggedInUserCode || 'NOT_EVIDENCED',
      currentStatus: getVal('Status') || options.currentStatus || 'NOT_EVIDENCED',
      currentActor: options.currentActor || 'NOT_EVIDENCED',
      resolvedViewerRole: options.resolvedViewerRole || 'NOT_EVIDENCED',
      activeAppraiserSlot: options.activeAppraiserSlot || null,
      expectedAppraiserCount: options.expectedAppraiserCount || normAppraisers.expectedCount,
      appraiser1: options.appraiser1 || getSlotUser(1),
      appraiser2: options.appraiser2 || getSlotUser(2),
      appraiser3: options.appraiser3 || getSlotUser(3),
      appraiser4: options.appraiser4 || getSlotUser(4),
      storedRoutingKey: storedRoutingKeyVal,
      isPhysicalRoutingKeyProven: hasPhysicalKeyField,
      routingKey: options.routingKey || (hasPhysicalKeyField && storedRoutingKeyVal !== 'NOT_AVAILABLE' ? storedRoutingKeyVal : 'NOT_EVIDENCED'),
      sectionCode: getVal('Section_Code') || options.sectionCode || 'NOT_EVIDENCED',
      teamName: getVal('Team') || options.teamName || 'NOT_EVIDENCED',
      routingResult: options.routingResult || null,
      profileCode: getVal('Profile_Code') || options.profileCode || null,
      partAWeight: options.partAWeight || null,
      partBWeight: options.partBWeight || null,
      objectiveCount: getVal('Objective_Count') || options.objectiveCount || 'NOT_EVIDENCED',
      isObjCountValid: options.isObjCountValid !== false,
      scoringCompleteness: options.scoringCompleteness || { isComplete: false },
      phaseCalendarStatus: options.phaseCalendarStatus || 'NOT_EVIDENCED',
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
        recordId: recordDiag?.recordId || 'NOT_EVIDENCED',
        mboKey: recordDiag?.mboKey || 'NOT_EVIDENCED',
        fiscalYear: recordDiag?.fiscalYear || 'NOT_EVIDENCED',
        employeeCode: recordDiag?.employeeCode || 'NOT_EVIDENCED',
        loggedInUserCode: recordDiag?.loggedInUserCode || 'NOT_EVIDENCED',
        currentStatus: recordDiag?.currentStatus || 'NOT_EVIDENCED'
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
