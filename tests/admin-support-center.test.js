import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO, escapeHtml, CANONICAL_STATUSES } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../src/admin/admin-support-center.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

test('Admin Support Center — Final Closure Package Tests', async (t) => {

  await t.test('1. admin-form identity is technical-only and has ZERO business workflow authority', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('ADMIN-FORM  '), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('administrator'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('hr'), false);

    const viewerRole = resolveIdentityViewerRole({ loginUserCode: 'admin-form' });
    assert.notEqual(viewerRole, 'REQUESTER');
    assert.notEqual(viewerRole, 'APPROVER');
  });

  await t.test('2 & 3. Routing Key alone != Routing PASS and prevents overall health PASS; App795 PASS can produce PASS', () => {
    const healthIncomplete = AdminDiagnosticModel.evaluateSystemHealth({
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

    const routeItemIncomplete = healthIncomplete.items.find(i => i.key === 'routing_resolution');
    assert.equal(routeItemIncomplete.status, 'NOT_EVIDENCED', 'Routing Key alone MUST be NOT_EVIDENCED, never PASS');
    assert.equal(healthIncomplete.overallHealth, 'INCOMPLETE_EVIDENCE', 'Routing Key alone MUST prevent overall PASS');

    const healthPass = AdminDiagnosticModel.evaluateSystemHealth({
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

    const routeItemPass = healthPass.items.find(i => i.key === 'routing_resolution');
    assert.equal(routeItemPass.status, 'PASS');
  });

  await t.test('4. Bad authoritativeProfile object cannot authorize FIX_THIS_RECORD', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_ASST_MGR',
      actualPartAWeight: 60,
      actualPartBWeight: 40,
      authoritativeProfile: { code: 'PROF_WRONG_CODE' }
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
  });

  await t.test('5. Wrong profile weights cannot authorize repair', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 70, partBWeight: 30 }
    });

    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
  });

  await t.test('6. DGM correct key/topology/count but wrong Appraiser1 => ERROR', () => {
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

  await t.test('7. GM missing authoritative appraiser1 => NOT_EVIDENCED', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'GM',
      actualRoutingKey: 'POSITION_GM',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'gm_user',
      authoritativeRoute: null
    });

    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.routeMatch, 'NOT_EVIDENCED');
  });

  await t.test('8. VP full authoritative route + matching Appraiser1 => PASS', () => {
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

  await t.test('9. Profile mismatch + route evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
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

  await t.test('10. Route mismatch + profile evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
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

  await t.test('11. Profile-only mismatch + authoritativeProfile -> safe record candidate ONLY for profile fields', () => {
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

  await t.test('12. Route-only mismatch + authoritativeRoute -> safe record candidate ONLY for routing fields (including changed appraiser assignments)', () => {
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
    assert.ok(candidate.fieldsAffected.includes('Routing_Key'));
    assert.ok(candidate.fieldsAffected.includes('Appraiser1'));
    assert.equal(candidate.before.Appraiser1, 'wrong_user');
    assert.equal(candidate.after.Appraiser1, 'm01');
  });

  await t.test('13. Profile+Route mismatch requires BOTH master evidences for FIX_THIS_RECORD', () => {
    const fullCandidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'WRONG_KEY',
      authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 60, partBWeight: 40 },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01' }
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

  await t.test('14. Record diagnostic defaults removed', () => {
    const diag = AdminDiagnosticModel.buildRecordDiagnostic(null, {});
    assert.equal(diag.fiscalYear, 'NOT_EVIDENCED');
    assert.equal(diag.loggedInUserCode, 'NOT_EVIDENCED');
    assert.equal(diag.phaseCalendarStatus, 'NOT_EVIDENCED');
    assert.equal(diag.currentStatus, 'NOT_EVIDENCED');

    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({});
    assert.equal(snapshot.data.recordIdentity.fiscalYear, 'NOT_EVIDENCED');
    assert.equal(snapshot.data.recordIdentity.loggedInUserCode, 'NOT_EVIDENCED');
  });

  await t.test('15. Neutral UI badges for NOT_EVIDENCED and local Employee Check provider execution', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('⚪ NOT_EVIDENCED'));
    assert.ok(html.includes('OVERALL HEALTH: INCOMPLETE_EVIDENCE'));

    const providerResult = AdminSupportCenterUI.defaultEmployeeProvider('0118', '2026');
    assert.equal(providerResult.employeeCode, '0118');
    assert.equal(providerResult.actualProfileCode, 'PROF_STAFF_CHIEF');
  });

  await t.test('16 & 17. CONFIRM REPAIR remains disabled; gate intact', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({});
    assert.equal(candidate.confirmRepairEnabled, false);
    assert.equal(candidate.repairWriteImplemented, false);

    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('CONFIRM_REPAIR_ENABLED = false'));
    assert.ok(html.includes('REPAIR_WRITE_IMPLEMENTED = false'));
  });
});
