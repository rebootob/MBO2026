import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI, MockAdminDiagnosticProvider, KintoneAdminDiagnosticProvider } from '../src/admin/admin-support-center.js';

test('Admin Support Center — Corrective Package Test Suite (WP-002C)', async (t) => {
  // 1. P0-A & Security: admin-form technical-only identity and provider bounds
  await t.test('1.1 admin-form identity is technical-only and has ZERO business workflow authority', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('ADMIN-FORM'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('administrator'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('0118'), false);
  });

  await t.test('1.2 non-admin-form user renders Access Denied boundary panel in UI', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: '0118' });
    assert.ok(html.includes('ACCESS DENIED'));
    assert.ok(html.includes('admin-form'));
    assert.ok(!html.includes('15 Diagnostic Indicators'));
  });

  await t.test('1.3 No silent Mock provider in production-intended mode (PROVIDER_NOT_CONFIGURED)', async () => {
    const ui = new AdminSupportCenterUI(); // no provider supplied
    assert.equal(ui.diagnosticProvider, null);

    // Simulate check click without provider
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });
    assert.ok(html.includes('⚪ PROVIDER NOT CONFIGURED'));
  });

  // 2. P0-A: Unknown preview employee returns NOT_FOUND without fabricating data
  await t.test('2.1 Unknown preview employee returns NOT_FOUND without fabricating identity or status', async () => {
    const provider = new MockAdminDiagnosticProvider();
    const res = await provider.checkEmployee('UNKNOWN999', '2026');
    assert.equal(res.recordId, 'NOT_FOUND');
    assert.equal(res.isNotFound, true);
    assert.equal(res.mboKey, 'NOT_EVIDENCED');
    assert.equal(res.employeeName, 'NOT_EVIDENCED');
    assert.equal(res.requesterUser, 'NOT_EVIDENCED');
    assert.equal(res.currentStatus, 'NOT_EVIDENCED');
    assert.equal(res.sourceMode, 'PREVIEW_FIXTURE');
    assert.equal(res.isProductionEvidence, false);
  });

  // 3. P0-B: KintoneAdminDiagnosticProvider fail-closed checks
  await t.test('3.1 App53 not found and duplicate fail closed in KintoneAdminDiagnosticProvider', async () => {
    const mockApp53RepoEmpty = { getRecords: async () => [] };
    const p1 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53RepoEmpty });
    await assert.rejects(async () => {
      await p1.checkEmployee('0999', '2026');
    }, { message: /EMPLOYEE_NOT_FOUND/ });

    const mockApp53RepoDup = { getRecords: async () => [{ id: 1 }, { id: 2 }] };
    const p2 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53RepoDup });
    await assert.rejects(async () => {
      await p2.checkEmployee('0999', '2026');
    }, { message: /EMPLOYEE_AMBIGUOUS/ });
  });

  await t.test('3.2 App794 duplicate MBO record fails closed in KintoneAdminDiagnosticProvider', async () => {
    const mockApp53Repo = { getRecords: async () => [{ Employee_Code: '0118', Employee_Name: 'Test' }] };
    const mockApp794RepoDup = { getRecords: async () => [{ $id: 101 }, { $id: 102 }] };
    const provider = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794RepoDup });
    await assert.rejects(async () => {
      await provider.checkEmployee('0118', '2026');
    }, { message: /MBO_AMBIGUOUS/ });
  });

  // 4. P0-C: App796 profile evidence strictness (FY & PUBLISHED)
  await t.test('4.1 App796 profile FY mismatch or non-PUBLISHED status prevents record repair', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 60, // wrong
      actualPartBWeight: 40,
      position: 'Staff',
      authoritativeProfile: {
        code: 'PROF_STAFF_CHIEF',
        partAWeight: 70,
        partBWeight: 30,
        fiscalYear: '2025', // wrong FY
        configStatus: 'PUBLISHED'
      }
    });

    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
    assert.equal(candidate.rootCause, 'BLOCKED_NOT_ENOUGH_EVIDENCE');
    assert.deepEqual(candidate.before, {});
  });

  await t.test('4.2 Missing PartA or PartB weight in authoritative profile fails closed', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 60,
      actualPartBWeight: 40,
      position: 'Staff',
      authoritativeProfile: {
        code: 'PROF_STAFF_CHIEF',
        partAWeight: null, // missing weight
        partBWeight: 30,
        fiscalYear: '2026',
        configStatus: 'PUBLISHED'
      }
    });

    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
  });

  // 5. P0-D: Workflow audit history truth boundary
  await t.test('5.1 Arbitrary audit history array does NOT become EVIDENCED without required structural fields', () => {
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'M1_G1',
      actualAuditHistory: [{ foo: 'bar' }, 'invalid_entry']
    });

    assert.equal(res.historyStatus, 'INVALID_AUDIT_STRUCTURE');
    assert.equal(res.actualAuditHistory, 'NOT_AVAILABLE');
  });

  await t.test('5.2 Structurally valid audit history array sets historyStatus = EVIDENCED', () => {
    const validHistory = [
      { actor: 'emp1', fromStatus: '01 Draft Objective', toStatus: '03 Manager Objective Review', action: 'SUBMIT', timestamp: '2026-04-01T00:00:00Z' }
    ];
    const res = AdminDiagnosticModel.evaluateWorkflowTrace({
      currentStatus: '01 Draft Objective',
      topology: 'M1_G1',
      actualAuditHistory: validHistory
    });

    assert.equal(res.historyStatus, 'EVIDENCED');
    assert.deepEqual(res.actualAuditHistory, validHistory);
  });

  // 6. P0-E: Topology-aware ordinal Appraiser 1..4 normalization
  await t.test('6.1 normalizeAppraiserSlots maps M1_G1 topology to 1st=Manager, 2nd=GM', () => {
    const norm = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: 'M1_G1',
      Manager_User: 'm1',
      GM_User: 'g1'
    });
    assert.equal(norm.expectedCount, 2);
    assert.equal(norm.slots[0].slot, 1);
    assert.equal(norm.slots[0].userCode, 'm1');
    assert.equal(norm.slots[1].slot, 2);
    assert.equal(norm.slots[1].userCode, 'g1');
  });

  await t.test('6.2 normalizeAppraiserSlots maps M1_M2_G1 topology to 1st=First Manager, 2nd=Manager, 3rd=GM', () => {
    const norm = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: 'M1_M2_G1',
      First_Manager_User: 'm2',
      Manager_User: 'm1',
      GM_User: 'g1'
    });
    assert.equal(norm.expectedCount, 3);
    assert.equal(norm.slots[0].slot, 1);
    assert.equal(norm.slots[0].userCode, 'm2');
    assert.equal(norm.slots[1].slot, 2);
    assert.equal(norm.slots[1].userCode, 'm1');
    assert.equal(norm.slots[2].slot, 3);
    assert.equal(norm.slots[2].userCode, 'g1');
  });

  await t.test('6.3 normalizeAppraiserSlots maps M1_ONLY executive route to 1st=Executive appraiser', () => {
    const norm = AdminDiagnosticModel.normalizeAppraiserSlots({
      topology: 'M1_ONLY',
      Manager_User: 'pres01'
    });
    assert.equal(norm.expectedCount, 1);
    assert.equal(norm.slots[0].slot, 1);
    assert.equal(norm.slots[0].userCode, 'pres01');
  });

  await t.test('6.4 Missing required authoritative appraiser slot returns NOT_EVIDENCED', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMT1',
      actualRoutingKey: 'TMT1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'm1',
      actualAppraiser2: 'g1',
      authoritativeRoute: {
        topology: 'M1_G1',
        appraiserCount: 2,
        appraiser1: 'm1'
        // missing appraiser2
      }
    });

    assert.equal(res.status, 'NOT_EVIDENCED');
    assert.equal(res.routeMatch, 'NOT_EVIDENCED');
  });

  await t.test('6.5 Mismatched 1st or 2nd appraiser slot produces exact mismatch error', () => {
    const res = AdminDiagnosticModel.evaluateRouteMatch({
      sectionCode: 'TMT1',
      actualRoutingKey: 'TMT1',
      actualTopology: 'M1_G1',
      actualAppraiserCount: 2,
      actualAppraiser1: 'wrong_mgr',
      actualAppraiser2: 'g1',
      authoritativeRoute: {
        topology: 'M1_G1',
        appraiserCount: 2,
        appraiser1: 'm1',
        appraiser2: 'g1'
      }
    });

    assert.equal(res.status, 'ERROR');
    assert.ok(res.reason.includes('1ST_APPRAISER_MISMATCH'));
  });

  // 7. P0-F: Routing_Key physical storage gate
  await t.test('7.1 Unproven stored Routing_Key (NOT_AVAILABLE) is NOT included in repair diff', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      position: 'Staff',
      sectionCode: 'TMT1',
      actualRoutingKey: 'NOT_AVAILABLE', // unproven physical field
      actualTopology: 'M1_ONLY', // wrong topology
      actualAppraiserCount: 1,
      actualAppraiser1: 'm1',
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30, fiscalYear: '2026', configStatus: 'PUBLISHED' },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm1', appraiser2: 'g1' }
    });

    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.ok('Routing_Topology' in candidate.before);
    assert.ok(!('Routing_Key' in candidate.before)); // Omitted from diff
  });

  // 8. P0-G & P1: Truthful build metadata and disabled repair
  await t.test('8.1 BUILD_VERSION_INFO exposes truthful build metadata without fake commit SHA', () => {
    assert.equal(BUILD_VERSION_INFO.version, '0.2.4');
    assert.equal(BUILD_VERSION_INFO.commitSha, 'NOT_EVIDENCED');
  });

  await t.test('8.2 Controlled Repair remains DISABLED and zero Kintone writes', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({});
    assert.equal(candidate.confirmRepairEnabled, false);
    assert.equal(candidate.repairWriteImplemented, false);
    assert.equal(candidate.executionStatus, 'NOT EXECUTED');
  });
});
