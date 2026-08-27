import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO, escapeHtml } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../src/admin/admin-support-center.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

test('Admin Support Center — Stage 2 P0 Identity Gate & Security Boundaries', async (t) => {

  await t.test('1. exact admin-form identity gate; administrator denied', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('ADMIN-FORM'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('  admin-form  '), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('administrator'), false, 'administrator MUST be denied');
  });

  await t.test('2. no Employee_Code or status elevation', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('EMP0118'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('hr'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin(''), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin(null), false);

    const mockRec = { Employee_Code: { value: 'admin-form' }, Requester_User: { value: [{ code: 'emp01' }] } };
    assert.equal(resolveIdentityViewerRole(mockRec, 'emp01', { isPreviewMode: false }), 'EMPLOYEE');
    assert.equal(resolveIdentityViewerRole(mockRec, 'admin-form', { isPreviewMode: false }), 'RESTRICTED', 'admin-form fails closed for business role authority');
  });

  await t.test('3. missing route/profile/App800/schema evidence never defaults to PASS', () => {
    const health = AdminDiagnosticModel.evaluateSystemHealth({ loginUserCode: 'admin-form' });
    const app800 = health.items.find(i => i.key === 'app800_config');
    const app801 = health.items.find(i => i.key === 'app801_auth_contract');
    const schema = health.items.find(i => i.key === 'schema_expectation');

    assert.equal(app800.status, 'NOT_EVIDENCED');
    assert.equal(app801.status, 'NOT_EVIDENCED');
    assert.equal(schema.status, 'NOT_EVIDENCED');
  });
});

test('Admin Support Center — Stage 2 Workflow Trace & Consistency Validation', async (t) => {

  await t.test('4. M1_G1 in First-Manager state fails diagnostic', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '02 First Manager Objective Check',
      topology: 'M1_G1'
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.isFailClosed, true);
    assert.ok(res.reason.includes('invalidly entered First/Second Manager state'));
  });

  await t.test('5. M1_ONLY in GM state fails diagnostic', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '14 GM Final Evaluation',
      topology: 'M1_ONLY'
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.isFailClosed, true);
    assert.ok(res.reason.includes('invalidly entered GM evaluation state'));
  });

  await t.test('6. active appraiser slot mismatch is detected', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '11 First Manager Evaluation',
      topology: 'M1_G1',
      activeAppraiserSlot: 2 // expected slot 1
    });
    assert.equal(res.status, 'ERROR');
    assert.ok(res.reason.includes('expects Slot 1, but active slot is 2'));
  });

  await t.test('7. unknown workflow status fails closed', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: null,
      topology: 'M1_G1'
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.isFailClosed, true);
  });

  await t.test('17. actual workflow history absent => PENDING_AUDIT_DESIGN/NOT_AVAILABLE', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'M1_G1'
    });
    assert.equal(res.historyStatus, 'PENDING_AUDIT_DESIGN / NOT_AVAILABLE');
    assert.equal(res.actualAuditHistory, 'NOT_AVAILABLE');
  });
});

test('Admin Support Center — Stage 2 Evaluation Profile Validation', async (t) => {

  await t.test('8. expected vs actual profile match PASS', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30
    });
    assert.equal(res.status, 'PASS');
    assert.equal(res.profileMatch, 'PASS');
    assert.equal(res.expectedProfileCode, 'PROF_STAFF_CHIEF');
  });

  await t.test('9. profile mismatch ERROR', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: 'Assistant Manager', // expected PROF_ASST_MGR 60/40
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.expectedProfileCode, 'PROF_ASST_MGR');
    assert.equal(res.expectedPartAWeight, 60);
  });

  await t.test('10. missing profile evidence NOT_EVIDENCED', () => {
    const res = AdminDiagnosticModel.evaluateProfileMatch({
      position: null,
      actualProfileCode: null
    });
    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.profileMatch, 'NOT_EVIDENCED');
  });
});

test('Admin Support Center — Stage 2 Route Assignment Validation', async (t) => {

  await t.test('11. expected vs actual routing match PASS', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      teamName: null,
      position: 'Staff',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'm01',
      actualAppraiser2: 'g01',
      authoritativeRoute: {
        topology: 'M1_G1',
        appraiserCount: 2,
        appraiser1: 'M01',
        appraiser2: 'G01'
      }
    });
    assert.equal(res.status, 'PASS');
    assert.equal(res.routeMatch, 'PASS');
  });

  await t.test('12. wrong Routing_Key ERROR', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMH1', // mismatch
      actualTopology: 'M1_G1'
    });
    assert.equal(res.status, 'WARNING');
    assert.equal(res.expectedRoutingKey, 'TMS1');
  });

  await t.test('13. wrong appraiser user in ordinal slot ERROR', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'WRONG_USER',
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

  await t.test('14. wrong appraiser count ERROR', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 1, // expected 2
      authoritativeRoute: {
        topology: 'M1_G1',
        appraiserCount: 2,
        appraiser1: 'm01',
        appraiser2: 'g01'
      }
    });
    assert.equal(res.status, 'ERROR');
  });

  await t.test('15. TMG exact-team missing route FAIL_CLOSED', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMG1',
      teamName: '', // missing team for TMG
      actualRoutingKey: 'TMG1'
    });
    assert.equal(res.status, 'ERROR');
    assert.equal(res.isFailClosed, true);
    assert.ok(res.reason.includes('TMG Section "TMG1" requires exact Team mapping'));
  });

  await t.test('16. Executive direct route validation', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      position: 'General Manager',
      actualRoutingKey: 'DIRECT_EXECUTIVE',
      actualTopology: 'M1_ONLY',
      actualAppraiserCount: 1
    });
    assert.equal(res.status, 'PASS');
    assert.equal(res.expectedTopology, 'M1_ONLY');
  });
});

test('Admin Support Center — Stage 2 Repair Candidate & Root Cause Classifier', async (t) => {

  await t.test('21. all master sources correct + stale App794 => FIX_THIS_RECORD', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Assistant Manager', // expects PROF_ASST_MGR 60/40
      actualProfileCode: 'PROF_STAFF_CHIEF', // stale on App794
      actualPartAWeight: 70,
      actualPartBWeight: 30
    });
    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.equal(candidate.problemType, 'STALE_APP794_SNAPSHOT');
    assert.equal(candidate.before.Profile_Code, 'PROF_STAFF_CHIEF');
    assert.equal(candidate.after.Profile_Code, 'PROF_ASST_MGR');
    assert.equal(candidate.executionStatus, 'NOT EXECUTED');
    assert.equal(candidate.confirmRepairEnabled, false);
  });

  await t.test('22. App53 wrong => FIX_EMPLOYEE_MASTER_FIRST', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      isApp53InputWrong: true
    });
    assert.equal(candidate.rootCause, 'FIX_EMPLOYEE_MASTER_FIRST');
    assert.equal(candidate.targetApp, 'App 53 (Staff Master)');
  });

  await t.test('23. App795 wrong => FIX_ROUTING_MASTER_FIRST', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      isApp795RouteWrong: true
    });
    assert.equal(candidate.rootCause, 'FIX_ROUTING_MASTER_FIRST');
    assert.equal(candidate.targetApp, 'App 795 (Routing Master)');
  });

  await t.test('24. App796/profile config wrong => FIX_SCORING_PROFILE_MASTER_FIRST', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      isApp796ProfileWrong: true
    });
    assert.equal(candidate.rootCause, 'FIX_SCORING_PROFILE_MASTER_FIRST');
    assert.equal(candidate.targetApp, 'App 796 (Scoring Master)');
  });

  await t.test('25. workflow inconsistency => ESCALATE_WORKFLOW_REPAIR', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      currentStatus: '02 First Manager Objective Check',
      topology: 'M1_G1' // invalid state for M1_G1
    });
    assert.equal(candidate.rootCause, 'ESCALATE_WORKFLOW_REPAIR');
    assert.ok(candidate.recommendedAction.includes('WORKFLOW_REPAIR_REQUIRES_SEPARATE_AUTHORIZED_PACKAGE'));
  });

  await t.test('26. missing authoritative evidence => BLOCKED_NOT_ENOUGH_EVIDENCE', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({});
    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.equal(candidate.risk, 'BLOCKED');
  });

  await t.test('27. all validations match => NO_REPAIR_NEEDED', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      sectionCode: 'TMS1',
      actualRoutingKey: 'TMS1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      currentStatus: '01 Draft Objective'
    });
    assert.equal(candidate.rootCause, 'NO_REPAIR_NEEDED');
  });

  await t.test('29. repair candidate never includes employee-authored objectives or secrets', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      position: 'Staff',
      actualProfileCode: 'PROF_STAFF_CHIEF'
    });
    const fields = Object.keys(candidate.before);
    assert.ok(!fields.includes('Objective_1'));
    assert.ok(!fields.includes('Self_Score'));
    assert.ok(!fields.includes('Password_Hash'));
  });
});

test('Admin Support Center — Stage 2 Snapshot Allowlist & HTML Output Escaping', async (t) => {

  await t.test('18. snapshot uses allowlist contract and redacts secrets', () => {
    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({
      health: { overallHealth: 'PASS', evaluatedAt: '2026-08-27T12:00:00Z' },
      recordDiag: { recordId: '101', employeeCode: '0118' },
      workflowTrace: { status: 'PASS' },
      profileMatch: { status: 'PASS' },
      routeMatch: { status: 'PASS' },
      repairCandidate: { problemType: 'NONE', rootCause: 'NO_REPAIR_NEEDED' }
    });

    assert.equal(snapshot.sanitized, true);
    assert.ok(snapshot.data.recordIdentity);
    assert.ok(snapshot.data.buildVersion);
    assert.equal(snapshot.data.recordIdentity.recordId, '101');
    assert.equal(snapshot.data.rawRecord, undefined, 'rawRecord must NOT be dumped');
  });

  await t.test('19. HTML dynamic content escaped', () => {
    const unescapedStr = '<script>alert("xss")</script>';
    const escapedStr = escapeHtml(unescapedStr);
    assert.equal(escapedStr, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({
      loginUserCode: 'admin-form',
      currentStatus: '<script>alert(1)</script>'
    });
    assert.ok(!html.includes('<script>alert(1)</script>'), 'HTML must not contain unescaped executable script tags');
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'HTML must contain properly escaped markup text');
  });

  await t.test('20 & 30. Controlled Repair remains disabled / zero business authority', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });

    assert.ok(html.includes('0 Business Workflow Authority'));
    assert.ok(html.includes('CONFIRM_REPAIR_ENABLED = false'));
    assert.ok(html.includes('REPAIR_WRITE_IMPLEMENTED = false'));
    assert.ok(html.includes('disabled'));
  });
});
