import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO, escapeHtml, CANONICAL_STATUSES } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../src/admin/admin-support-center.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

test('Admin Support Center — Final Evidence-Boundary Micro-Fix Tests', async (t) => {

  await t.test('1 & 2. Routing Key alone != Routing PASS and prevents overall health PASS', () => {
    const health = AdminDiagnosticModel.evaluateSystemHealth({
      loginUserCode: 'admin-form',
      requesterUserCodes: ['EMP01'],
      routingKey: 'TMS1',
      routingResult: null, // missing authoritative routingResult
      profileCode: 'PROF_STAFF_CHIEF',
      evalProfile: { nameEN: 'Staff' },
      activeObjCount: 4,
      currentStatus: '01 Draft Objective',
      resolvedViewerRole: 'EMPLOYEE',
      phaseCalendar: { isCurrentDateInWindow: true }
    });

    const routeItem = health.items.find(i => i.key === 'routing_resolution');
    assert.equal(routeItem.status, 'NOT_EVIDENCED', 'Routing Key alone MUST be NOT_EVIDENCED, never PASS');
    assert.equal(health.overallHealth, 'INCOMPLETE_EVIDENCE', 'Routing Key alone MUST prevent overall PASS');
  });

  await t.test('3. Authoritative App795 PASS can produce Routing PASS', () => {
    const health = AdminDiagnosticModel.evaluateSystemHealth({
      loginUserCode: 'admin-form',
      requesterUserCodes: ['EMP01'],
      routingKey: 'TMS1',
      routingResult: { status: 'PASS' },
      profileCode: 'PROF_STAFF_CHIEF',
      evalProfile: { nameEN: 'Staff' },
      activeObjCount: 4,
      currentStatus: '01 Draft Objective',
      resolvedViewerRole: 'EMPLOYEE',
      phaseCalendar: { isCurrentDateInWindow: true },
      app800Status: 'PASS',
      app801Status: 'NOT_AVAILABLE',
      schemaState: 'PASS'
    });

    const routeItem = health.items.find(i => i.key === 'routing_resolution');
    assert.equal(routeItem.status, 'PASS');
  });

  await t.test('4. Profile mismatch + route evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF', // profile error
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      authoritativeProfile: null, // missing profile evidence
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2 } // route evidence supplied
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE', 'Route evidence MUST NOT authorize repair for Profile mismatch');
    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.routeMasterEvidenced, true);
  });

  await t.test('5. Route mismatch + profile evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY', // route error
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF' }, // profile evidence supplied
      authoritativeRoute: null // missing route evidence
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE', 'Profile evidence MUST NOT authorize repair for Route mismatch');
    assert.equal(candidate.profileMasterEvidenced, true);
    assert.equal(candidate.routeMasterEvidenced, false);
  });

  await t.test('6. Profile-only mismatch + authoritativeProfile -> safe record candidate ONLY for profile fields', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF', // profile error
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 60, partBWeight: 40 },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2 }
    });

    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.equal(candidate.profileRecordRepairSafe, true);
    assert.equal(candidate.routeRecordRepairSafe, false);
    assert.deepEqual(candidate.fieldsAffected, ['Profile_Code', 'PartA_Weight', 'PartB_Weight'], 'Fields affected must include ONLY profile fields');
    assert.equal(candidate.before.Routing_Key, undefined, 'Routing_Key must not leak into profile-only repair diff');
  });

  await t.test('7. Route-only mismatch + authoritativeRoute -> safe record candidate ONLY for routing fields', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY', // route error
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'wrong_user',
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF' },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
    });

    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.equal(candidate.profileRecordRepairSafe, false);
    assert.equal(candidate.routeRecordRepairSafe, true);
    assert.deepEqual(candidate.fieldsAffected, ['Routing_Key', 'Routing_Topology', 'Expected_Appraiser_Count'], 'Fields affected must include ONLY routing fields');
    assert.equal(candidate.before.Profile_Code, undefined, 'Profile_Code must not leak into route-only repair diff');
  });

  await t.test('8. Profile+Route mismatch requires BOTH master evidences for FIX_THIS_RECORD', () => {
    // Case A: Both master evidences supplied
    const fullCandidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF', // profile error
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY', // route error
      authoritativeProfile: { code: 'PROF_ASST_MGR' },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2 }
    });
    assert.equal(fullCandidate.rootCause, 'FIX_THIS_RECORD');

    // Case B: Only profile master evidence supplied
    const partialCandidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF', // profile error
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY', // route error
      authoritativeProfile: { code: 'PROF_ASST_MGR' },
      authoritativeRoute: null
    });
    assert.equal(partialCandidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
  });

  await t.test('9, 10, 11. Record diagnostic defaults removed', () => {
    const diag = AdminDiagnosticModel.buildRecordDiagnostic(null, {});
    assert.equal(diag.fiscalYear, 'NOT_EVIDENCED', 'Fiscal year must NOT default to 2026');
    assert.equal(diag.loggedInUserCode, 'NOT_EVIDENCED', 'Logged in user must NOT default to admin-form');
    assert.equal(diag.phaseCalendarStatus, 'NOT_EVIDENCED', 'Phase calendar status must NOT default to PASS');
    assert.equal(diag.currentStatus, 'NOT_EVIDENCED');

    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({});
    assert.equal(snapshot.data.recordIdentity.fiscalYear, 'NOT_EVIDENCED');
    assert.equal(snapshot.data.recordIdentity.loggedInUserCode, 'NOT_EVIDENCED');
  });

  await t.test('12. Existing canonical workflow/profile/routing tests remain PASS', () => {
    assert.equal(AdminDiagnosticModel.evaluateWorkflowTrace({ currentStatus: '01 Draft Objective', topology: 'M1_G1' }).status, 'PASS');
    assert.equal(AdminDiagnosticModel.evaluateWorkflowTrace({ currentStatus: '02 First Manager Objective Review', topology: 'M1_G1' }).status, 'ERROR');
    assert.equal(AdminDiagnosticModel.evaluateProfileMatch({ position: 'Japanese Staff', actualProfileCode: 'PROF_JAPANESE_STAFF', actualPartAWeight: 70, actualPartBWeight: 30 }).status, 'PASS');
    assert.equal(AdminDiagnosticModel.evaluateRouteMatch({ position: 'DGM', actualRoutingKey: 'POSITION_DGM', actualTopology: 'M1_ONLY', actualAppraiserCount: 1, authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1 } }).status, 'PASS');
  });

  await t.test('13 & 14. CONFIRM REPAIR remains disabled; gate intact', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({});
    assert.equal(candidate.confirmRepairEnabled, false);
    assert.equal(candidate.repairWriteImplemented, false);

    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('CONFIRM_REPAIR_ENABLED = false'));
    assert.ok(html.includes('REPAIR_WRITE_IMPLEMENTED = false'));
  });
});
