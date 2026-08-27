import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO, escapeHtml, CANONICAL_STATUSES } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../src/admin/admin-support-center.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

test('Admin Support Center — Baseline Correction Micro-Fix Tests', async (t) => {

  await t.test('1. canonical M1_G1 statuses are accepted', () => {
    for (const status of ['01 Draft Objective', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved', '06 Employee Mid-Year', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed', '11 Employee Self Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation', '15 HR Final Check', '16 Completed']) {
      const res = AdminDiagnosticModel.evaluateWorkflowTrace({
        currentStatus: status,
        topology: 'M1_G1'
      });
      assert.equal(res.status, 'PASS', `Status "${status}" should be accepted for M1_G1`);
    }
  });

  await t.test('2. 02/07/12 rejected for M1_G1', () => {
    for (const status of ['02 First Manager Objective Review', '07 First Manager Mid-Year Review', '12 First Manager Final Evaluation']) {
      const res = AdminDiagnosticModel.evaluateWorkflowTrace({
        currentStatus: status,
        topology: 'M1_G1'
      });
      assert.equal(res.status, 'ERROR', `Status "${status}" must be rejected for M1_G1`);
      assert.equal(res.isFailClosed, true);
    }
  });

  await t.test('3. 04/09/14 rejected for M1_ONLY', () => {
    for (const status of ['04 GM Objective Review', '09 GM Mid-Year Review', '14 GM Final Evaluation']) {
      const res = AdminDiagnosticModel.evaluateWorkflowTrace({
        currentStatus: status,
        topology: 'M1_ONLY'
      });
      assert.equal(res.status, 'ERROR', `Status "${status}" must be rejected for M1_ONLY`);
      assert.equal(res.isFailClosed, true);
    }
  });

  await t.test('4. invented status names fail closed', () => {
    const inventedStatuses = ['Approved Objective', 'First Manager Evaluation', 'Second Manager Evaluation', 'Objective Self Check', 'Random Status'];
    for (const status of inventedStatuses) {
      const res = AdminDiagnosticModel.evaluateWorkflowTrace({
        currentStatus: status,
        topology: 'M1_G1'
      });
      assert.equal(res.status, 'ERROR', `Invented status "${status}" must fail closed`);
      assert.equal(res.isFailClosed, true);
    }
  });

  await t.test('5. missing topology does not default to M1_G1', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: null
    });
    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.expectedPath, 'NOT_EVIDENCED');
  });

  await t.test('6. unknown topology fails closed', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'INVALID_TOPOLOGY'
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.isFailClosed, true);
  });

  await t.test('7. PROF_JAPANESE_STAFF exact code PASS', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: 'Japanese Staff',
      actualProfileCode: 'PROF_JAPANESE_STAFF',
      actualPartAWeight: 70,
      actualPartBWeight: 30
    });
    assert.equal(res.status, 'PASS');
    assert.equal(res.expectedProfileCode, 'PROF_JAPANESE_STAFF');
  });

  await t.test('8. PROF_SECTION_MGR exact code PASS', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: 'Section Manager',
      actualProfileCode: 'PROF_SECTION_MGR',
      actualPartAWeight: 50,
      actualPartBWeight: 50
    });
    assert.equal(res.status, 'PASS');
    assert.equal(res.expectedProfileCode, 'PROF_SECTION_MGR');
  });

  await t.test('9. PROF_SENIOR_MGR exact code PASS', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: 'Senior Manager',
      actualProfileCode: 'PROF_SENIOR_MGR',
      actualPartAWeight: 50,
      actualPartBWeight: 50
    });
    assert.equal(res.status, 'PASS');
    assert.equal(res.expectedProfileCode, 'PROF_SENIOR_MGR');
  });

  await t.test('10. old PROF_JP_STAFF / PROF_SEC_MGR / PROF_SR_MGR not emitted as canonical', () => {
    const resJP = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Japanese Staff', actualProfileCode: 'PROF_JP_STAFF', actualPartAWeight: 70, actualPartBWeight: 30 });
    assert.equal(resJP.expectedProfileCode, 'PROF_JAPANESE_STAFF', 'Must emit PROF_JAPANESE_STAFF, not PROF_JP_STAFF');
    assert.equal(resJP.status, 'ERROR', 'Old alias PROF_JP_STAFF must not be treated as canonical PASS');

    const resSec = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Section Manager', actualProfileCode: 'PROF_SEC_MGR', actualPartAWeight: 50, actualPartBWeight: 50 });
    assert.equal(resSec.expectedProfileCode, 'PROF_SECTION_MGR');
    assert.equal(resSec.status, 'ERROR');

    const resSr = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Senior Manager', actualProfileCode: 'PROF_SR_MGR', actualPartAWeight: 50, actualPartBWeight: 50 });
    assert.equal(resSr.expectedProfileCode, 'PROF_SENIOR_MGR');
    assert.equal(resSr.status, 'ERROR');
  });

  await t.test('11. DGM key = POSITION_DGM', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'DGM',
      actualRoutingKey: 'POSITION_DGM',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1 }
    });
    assert.equal(res.expectedRoutingKey, 'POSITION_DGM');
    assert.equal(res.status, 'PASS');
  });

  await t.test('12. GM key = POSITION_GM', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'GM',
      actualRoutingKey: 'POSITION_GM',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1 }
    });
    assert.equal(res.expectedRoutingKey, 'POSITION_GM');
    assert.equal(res.status, 'PASS');
  });

  await t.test('13. VP key = POSITION_VP', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'VP',
      actualRoutingKey: 'POSITION_VP',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1 }
    });
    assert.equal(res.expectedRoutingKey, 'POSITION_VP');
    assert.equal(res.status, 'PASS');
  });

  await t.test('14. routing key match without authoritative App795 evidence does NOT produce overall route PASS', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      authoritativeRoute: null // missing authoritative route evidence
    });
    assert.equal(res.routingKeyCheck, 'PASS');
    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.routeMatch, 'NOT_EVIDENCED');
  });

  await t.test('15. wrong ordinal appraiser user => ERROR when authoritative route supplied', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'wrong_user',
      actualAppraiser2: 'g01',
      authoritativeRoute: {
        topology: 'M1_G1',
        appraiserCount: 2,
        appraiser1: 'm01',
        appraiser2: 'g01'
      }
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.routeMatch, 'ERROR');
  });

  await t.test('16. missing authoritative profile evidence => NOT_EVIDENCED', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: null,
      actualProfileCode: null
    });
    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.profileMatch, 'NOT_EVIDENCED');
  });

  await t.test('17. missing critical health evidence => overall not PASS (INCOMPLETE_EVIDENCE)', () => {
    const health = AdminDiagnosticModel.evaluateSystemHealth({
      loginUserCode: 'admin-form',
      requesterUserCodes: ['EMP01'],
      profileCode: 'PROF_STAFF_CHIEF',
      evalProfile: { nameEN: 'Staff' },
      activeObjCount: 4,
      currentStatus: '01 Draft Objective',
      resolvedViewerRole: 'EMPLOYEE',
      phaseCalendar: { isCurrentDateInWindow: true }
      // missing app800 / app801 / schema evidence
    });
    assert.equal(health.overallHealth, 'INCOMPLETE_EVIDENCE');
  });

  await t.test('18. repair classification with incomplete source evidence => BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      authoritativeProfile: true,
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2 }
    });
    assert.equal(candidate.rootCause, 'NO_REPAIR_NEEDED');

    const errorCandidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF' // error, but no authoritative master evidence supplied
    });
    assert.equal(errorCandidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
  });

  await t.test('19. exact admin-form gate still PASS', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('administrator'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('hr'), false);
  });

  await t.test('20. Controlled Repair remains disabled', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({});
    assert.equal(candidate.confirmRepairEnabled, false);
    assert.equal(candidate.repairWriteImplemented, false);

    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('CONFIRM_REPAIR_ENABLED = false'));
    assert.ok(html.includes('REPAIR_WRITE_IMPLEMENTED = false'));
    assert.ok(html.includes('disabled'));
  });
});
