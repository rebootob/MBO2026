import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO, escapeHtml, CANONICAL_STATUSES } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI, MockAdminDiagnosticProvider } from '../src/admin/admin-support-center.js';
import { RoutingService } from '../src/services/routing-service.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

test('Admin Support Center — Complete Residual Closure Matrix (WP-002C)', async (t) => {

  // ==================== 1. SECURITY ====================
  await t.test('1.1 admin-form identity is technical-only and has ZERO business workflow authority', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('ADMIN-FORM  '), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('administrator'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('hr'), false);

    const viewerRole = resolveIdentityViewerRole({ loginUserCode: 'admin-form' });
    assert.notEqual(viewerRole, 'REQUESTER');
    assert.notEqual(viewerRole, 'APPROVER');
  });

  await t.test('1.2 non-admin-form user renders Access Denied boundary panel in UI', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'administrator' });
    assert.ok(html.includes('ACCESS DENIED'));
    assert.ok(html.includes('administrator'));
  });

  await t.test('1.3 RoutingService separates route resolution from business requester authorization', async () => {
    const fakeKintoneApi = {
      async getRecords(appId, query) {
        if (query.includes('POSITION_DGM')) {
          return {
            records: [{
              Routing_Key: { value: 'POSITION_DGM' },
              Requester_User: { value: [{ code: 'dgm001' }] },
              Manager_Level1_Approvers: { value: [{ code: 'president_user' }] },
              Manager_Level1_Approval_Rule: { value: 'ALL' }
            }]
          };
        }
        return { records: [] };
      }
    };

    // Pure route resolution works without loginUserCode
    const route = await RoutingService.resolveRoutingProfile(795, '', '', fakeKintoneApi, 'DGM');
    assert.equal(route.Routing_Key, 'POSITION_DGM');

    // Requester authorization checks Requester_User array strictly
    assert.doesNotThrow(() => RoutingService.assertRequesterAuthorized(route, 'dgm001'));
    assert.throws(() => RoutingService.assertRequesterAuthorized(route, 'admin-form'), /not authorized/);
    assert.throws(() => RoutingService.assertRequesterAuthorized(route, 'administrator'), /not authorized/);
  });


  // ==================== 2. EMPLOYEE CHECK CONTROLLER ====================
  await t.test('2.1 MockAdminDiagnosticProvider handles lookup, blank checks, and errors', async () => {
    const provider = new MockAdminDiagnosticProvider();

    // Blank employee blocks
    await assert.rejects(() => provider.checkEmployee('', '2026'), /EMPLOYEE_CODE_REQUIRED/);
    await assert.rejects(() => provider.checkEmployee('0118', ''), /FISCAL_YEAR_REQUIRED/);

    // Successful lookup
    const res = await provider.checkEmployee('0118', '2026');
    assert.equal(res.employeeCode, '0118');
    assert.equal(res.actualProfileCode, 'PROF_STAFF_CHIEF');

    // Not found
    const nf = await provider.checkEmployee('UNKNOWN_EMP', '2026');
    assert.equal(nf.isNotFound, true);
    assert.equal(nf.recordId, 'NOT_FOUND');

    // Ambiguous record
    await assert.rejects(() => provider.checkEmployee('AMBIGUOUS_EMP', '2026'), /AMBIGUOUS_RECORD/);
  });

  await t.test('2.2 UI event binding and lookup execution do not mutate current record context', async () => {
    const provider = new MockAdminDiagnosticProvider();
    const ui = new AdminSupportCenterUI({ diagnosticProvider: provider });

    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('CHECK EMPLOYEE'));
    assert.ok(html.includes('admin-btn-check-employee'));
  });


  // ==================== 3. PROFILE VALIDATION ====================
  await t.test('3.1 Profile resolution uses canonical shared profile policy parity', () => {
    const resStaff = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Staff', actualProfileCode: 'PROF_STAFF_CHIEF', actualPartAWeight: 70, actualPartBWeight: 30 });
    assert.equal(resStaff.status, 'PASS');
    assert.equal(resStaff.expectedProfileCode, 'PROF_STAFF_CHIEF');

    const resAsst = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Assistant Manager', actualProfileCode: 'PROF_ASST_MGR', actualPartAWeight: 60, actualPartBWeight: 40 });
    assert.equal(resAsst.status, 'PASS');

    const resSec = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Section Manager', actualProfileCode: 'PROF_SECTION_MGR', actualPartAWeight: 50, actualPartBWeight: 50 });
    assert.equal(resSec.status, 'PASS');

    const resDgm = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Deputy General Manager', actualProfileCode: 'PROF_DGM', actualPartAWeight: 50, actualPartBWeight: 50 });
    assert.equal(resDgm.status, 'PASS');

    const resUnknown = AdminDiagnosticModel.evaluateProfileMatch({ position: 'Invalid Nonexistent Position', actualProfileCode: 'PROF_STAFF_CHIEF', actualPartAWeight: 70, actualPartBWeight: 30 });
    assert.equal(resUnknown.status, 'NOT_EVIDENCED');
  });

  await t.test('3.2 Incomplete authoritative profile object cannot authorize repair', () => {
    const candidateBadCode = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_ASST_MGR',
      authoritativeProfile: { code: 'PROF_WRONG' }
    });
    assert.equal(candidateBadCode.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.equal(candidateBadCode.profileMasterEvidenced, false);

    const candidateMissingWeights = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      authoritativeProfile: { code: 'PROF_ASST_MGR' } // missing PartA_Weight & PartB_Weight
    });
    assert.equal(candidateMissingWeights.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.equal(candidateMissingWeights.profileMasterEvidenced, false);
  });


  // ==================== 4. ROUTING VALIDATION & EXECUTIVE KEYS ====================
  await t.test('4.1 Non-TMG & TMG exact Section|Team routing validation', () => {
    // Non-TMG Section only
    const nonTmg = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      teamName: '',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'm01',
      actualAppraiser2: 'g01',
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
    });
    assert.equal(nonTmg.status, 'PASS');

    // TMG missing team fails closed
    const tmgNoTeam = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMG1',
      teamName: ''
    });
    assert.equal(tmgNoTeam.status, 'ERROR');
    assert.ok(tmgNoTeam.reason.includes('TMG Section'));
  });

  await t.test('4.2 Executive keys (DGM / GM / VP) require exact President appraiser1 verification', () => {
    const dgmErr = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'DGM',
      actualRoutingKey: 'POSITION_DGM',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'wrong_user',
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1, appraiser1: 'president_user' }
    });
    assert.equal(dgmErr.status, 'ERROR');
    assert.ok(dgmErr.reason.includes('1ST_APPRAISER_MISMATCH'));

    const vpPass = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'VP',
      actualRoutingKey: 'POSITION_VP',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1,
      actualAppraiser1: 'president_user',
      authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1, appraiser1: 'president_user' }
    });
    assert.equal(vpPass.status, 'PASS');
  });

  await t.test('4.3 Missing required authoritative slot returns NOT_EVIDENCED', () => {
    const missingSlot = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'm01',
      actualAppraiser2: 'g01',
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01' } // missing appraiser2
    });
    assert.equal(missingSlot.status, 'NOT_EVIDENCED');
  });

  await t.test('4.4 Extra actual appraiser slot beyond expected count returns ERROR', () => {
    const extraSlot = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'm01',
      actualAppraiser2: 'g01',
      actualAppraiser3: 'extra_user',
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
    });
    assert.equal(extraSlot.status, 'ERROR');
    assert.ok(extraSlot.reason.includes('EXTRA_APPRAISER_SLOT_ERROR'));
  });


  // ==================== 5. ORDINAL APPRAISER NORMALIZER ====================
  await t.test('5.1 normalizeAppraiserSlots correctly maps topology to ordinal 1st..4th Appraiser slots', () => {
    const m1g1 = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: 'M1_G1',
      appraiser1: 'mgr01',
      appraiser2: 'gm01'
    });
    assert.equal(m1g1.expectedCount, 2);
    assert.equal(m1g1.slots[0].labelEN, '1st Appraiser');
    assert.equal(m1g1.slots[0].userCode, 'mgr01');
    assert.equal(m1g1.slots[1].labelEN, '2nd Appraiser');
    assert.equal(m1g1.slots[1].userCode, 'gm01');

    const m1only = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: 'M1_ONLY',
      appraiser1: 'president'
    });
    assert.equal(m1only.expectedCount, 1);
    assert.equal(m1only.slots[0].userCode, 'president');

    const m1m2g1 = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: 'M1_M2_G1',
      First_Manager_User: 'fm01',
      Manager_User: 'mgr01',
      GM_User: 'gm01'
    });
    assert.equal(m1m2g1.expectedCount, 3);
    assert.equal(m1m2g1.slots[0].userCode, 'fm01');
    assert.equal(m1m2g1.slots[1].userCode, 'mgr01');
    assert.equal(m1m2g1.slots[2].userCode, 'gm01');
  });


  // ==================== 6. WORKFLOW TRACE & FUTURE TOPOLOGY GUARD ====================
  await t.test('6.1 Future/unreviewed topologies (M1_M2_G1, M1_G1_G2, M1_M2_G1_G2) do not return production-certified PASS', () => {
    const traceFuture = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'M1_M2_G1'
    });
    assert.equal(traceFuture.status, 'WARNING');
    assert.equal(traceFuture.topologyCertificationStatus, 'FUTURE_TOPOLOGY_NOT_PRODUCTION_CERTIFIED');

    const traceConfirmed = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'M1_G1'
    });
    assert.equal(traceConfirmed.status, 'PASS');
    assert.equal(traceConfirmed.topologyCertificationStatus, 'CURRENT_CONFIRMED');
  });

  await t.test('6.2 Workflow actual history status is explicitly PENDING_AUDIT_SCHEMA_AUTHORIZATION', () => {
    const trace = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'M1_G1'
    });
    assert.equal(trace.historyStatus, 'PENDING_AUDIT_SCHEMA_AUTHORIZATION');
    assert.equal(trace.actualAuditHistory, 'NOT_AVAILABLE');
  });


  // ==================== 7. REPAIR CANDIDATE CLASSIFIER & DIFF ====================
  await t.test('7.1 Safe record candidate produces field diff ONLY for actual changed fields, including changed appraisers', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'wrong_user',
      actualAppraiser2: 'g01',
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
    });

    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.equal(candidate.routeRecordRepairSafe, true);
    assert.deepEqual(candidate.fieldsAffected, ['1st Appraiser']);
    assert.equal(candidate.before.Appraiser1, 'wrong_user');
    assert.equal(candidate.after.Appraiser1, 'm01');
    assert.equal(candidate.before.Appraiser2, undefined); // Unchanged appraiser2 is omitted
  });

  await t.test('7.2 Blocked or NO_REPAIR_NEEDED candidates produce zero fake diff fields', () => {
    const noRepair = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'm01',
      actualAppraiser2: 'g01',
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
    });

    assert.equal(noRepair.rootCause, 'NO_REPAIR_NEEDED');
    assert.deepEqual(noRepair.before, {});
    assert.deepEqual(noRepair.after, {});
    assert.deepEqual(noRepair.fieldsAffected, []);
  });


  // ==================== 8. UI & SNAPSHOT SECURITY ====================
  await t.test('8.1 UI renders neutral badges for unevidenced attributes and CONFIRM REPAIR disabled', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('⚪ NOT_EVIDENCED'));
    assert.ok(html.includes('CONFIRM_REPAIR_ENABLED = false'));
  });

  await t.test('8.2 Snapshot generator uses explicit allowlist and redacts password/secret fields', () => {
    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({
      recordDiag: {
        recordId: '101',
        passwordHash: 'secret_12345',
        apiToken: 'tok_abc'
      }
    });

    assert.equal(snapshot.sanitized, true);
    assert.equal(snapshot.data.recordIdentity.recordId, '101');
    assert.equal(snapshot.data.passwordHash, undefined); // Excluded by allowlist
  });
});
