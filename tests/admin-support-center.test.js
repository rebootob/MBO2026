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
      routingResult: null,
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

  await t.test('Requirement 3.1: Bad authoritativeProfile object cannot authorize FIX_THIS_RECORD', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff', // expects PROF_STAFF_CHIEF
      actualProfileCode: 'PROF_ASST_MGR', // profile error
      actualPartAWeight: 60,
      actualPartBWeight: 40,
      authoritativeProfile: { code: 'PROF_WRONG_CODE' } // bad authoritativeProfile code
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE', 'Bad authoritativeProfile code MUST forbid FIX_THIS_RECORD');
    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
  });

  await t.test('Requirement 3.2: Wrong profile weights cannot authorize repair', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager', // expects PROF_ASST_MGR 60/40
      actualProfileCode: 'PROF_STAFF_CHIEF', // profile error
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 70, partBWeight: 30 } // wrong weights (70/30 instead of 60/40)
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE', 'Conflicting weights MUST forbid FIX_THIS_RECORD');
    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
  });

  await t.test('Requirement 3.3: DGM correct key/topology/count but wrong Appraiser1 => ERROR', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'DGM',
      actualRoutingKey: 'POSITION_DGM',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'wrong_user',
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1, appraiser1: 'president_user' }
    });

    assert.equal(res.status, 'ERROR');
    assert.equal(res.routeMatch, 'ERROR');
    assert.ok(res.reason.includes('1ST_APPRAISER_MISMATCH'));
  });

  await t.test('Requirement 3.4: GM missing authoritative appraiser1 => NOT_EVIDENCED', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'GM',
      actualRoutingKey: 'POSITION_GM',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'gm_user',
      authoritativeRoute: null // missing authoritative route/appraiser1
    });

    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.routeMatch, 'NOT_EVIDENCED');
  });

  await t.test('Requirement 3.5: VP full authoritative route + matching Appraiser1 => PASS', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'VP',
      actualRoutingKey: 'POSITION_VP',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'vp_boss',
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1, appraiser1: 'vp_boss' }
    });

    assert.equal(res.status, 'PASS');
    assert.equal(res.routeMatch, 'PASS');
    assert.equal(res.expectedRoutingKey, 'POSITION_VP');
  });

  await t.test('4. Profile mismatch + route evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      authoritativeProfile: null,
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2 }
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
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
      actualRoutingKey: 'WRONG_KEY',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
      authoritativeRoute: null
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.equal(candidate.profileMasterEvidenced, true);
    assert.equal(candidate.routeMasterEvidenced, false);
  });

  await t.test('6. Profile-only mismatch + authoritativeProfile -> safe record candidate ONLY for profile fields', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
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
    assert.deepEqual(candidate.fieldsAffected, ['Profile_Code', 'PartA_Weight', 'PartB_Weight']);
    assert.equal(candidate.before.Routing_Key, undefined);
  });

  await t.test('7. Route-only mismatch + authoritativeRoute -> safe record candidate ONLY for routing fields', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'wrong_user',
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
    });

    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.equal(candidate.profileRecordRepairSafe, false);
    assert.equal(candidate.routeRecordRepairSafe, true);
    assert.deepEqual(candidate.fieldsAffected, ['Routing_Key', 'Routing_Topology', 'Expected_Appraiser_Count']);
    assert.equal(candidate.before.Profile_Code, undefined);
  });

  await t.test('8. Profile+Route mismatch requires BOTH master evidences for FIX_THIS_RECORD', () => {
    const fullCandidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY',
      authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 60, partBWeight: 40 },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2 }
    });
    assert.equal(fullCandidate.rootCause, 'FIX_THIS_RECORD');

    const partialCandidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY',
      authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 60, partBWeight: 40 },
      authoritativeRoute: null
    });
    assert.equal(partialCandidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
  });

  await t.test('9, 10, 11. Record diagnostic defaults removed', () => {
    const diag = AdminDiagnosticModel.buildRecordDiagnostic(null, {});
    assert.equal(diag.fiscalYear, 'NOT_EVIDENCED');
    assert.equal(diag.loggedInUserCode, 'NOT_EVIDENCED');
    assert.equal(diag.phaseCalendarStatus, 'NOT_EVIDENCED');
    assert.equal(diag.currentStatus, 'NOT_EVIDENCED');

    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({});
    assert.equal(snapshot.data.recordIdentity.fiscalYear, 'NOT_EVIDENCED');
    assert.equal(snapshot.data.recordIdentity.loggedInUserCode, 'NOT_EVIDENCED');
  });

  await t.test('12. Existing canonical workflow/profile/routing tests remain PASS', () => {
    assert.equal(AdminDiagnosticModel.evaluateWorkflowTrace({ currentStatus: '01 Draft Objective', topology: 'M1_G1' }).status, 'PASS');
    assert.equal(AdminDiagnosticModel.evaluateWorkflowTrace({ currentStatus: '02 First Manager Objective Review', topology: 'M1_G1' }).status, 'ERROR');
    assert.equal(AdminDiagnosticModel.evaluateProfileMatch({ position: 'Japanese Staff', actualProfileCode: 'PROF_JAPANESE_STAFF', actualPartAWeight: 70, actualPartBWeight: 30 }).status, 'PASS');
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
