import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI, MockAdminDiagnosticProvider, KintoneAdminDiagnosticProvider } from '../src/admin/admin-support-center.js';

test('Admin Support Center — Corrective Round 2 Test Suite (B1-B5)', async (t) => {
  // B1 Tests: Production provider fail closed & no fake fallbacks
  await t.test('B1.1 KintoneAdminDiagnosticProvider fails closed on App794 0 (MBO_NOT_FOUND) and >1 (MBO_AMBIGUOUS)', async () => {
    const mockApp53Repo = { getRecords: async () => [{ Employee_Code: '0118', Employee_Position: 'Staff', Employee_Section: 'TMT1' }] };

    // 0 App794 records
    const mockApp794RepoEmpty = { getRecords: async () => [] };
    const p1 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794RepoEmpty });
    await assert.rejects(async () => {
      await p1.checkEmployee('0118', '2026');
    }, { message: /MBO_NOT_FOUND/ });

    // >1 App794 records
    const mockApp794RepoDup = { getRecords: async () => [{ $id: 101 }, { $id: 102 }] };
    const p2 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794RepoDup });
    await assert.rejects(async () => {
      await p2.checkEmployee('0118', '2026');
    }, { message: /MBO_AMBIGUOUS/ });
  });

  await t.test('B1.2 KintoneAdminDiagnosticProvider fails closed on App795 0 (ROUTE_NOT_FOUND) and >1 (ROUTE_AMBIGUOUS)', async () => {
    const mockApp53Repo = { getRecords: async () => [{ Employee_Code: '0118', Employee_Position: 'Staff', Employee_Section: 'TMT1' }] };
    const mockApp794Repo = { getRecords: async () => [{ $id: 101, Status: '01 Draft Objective' }] };
    const mockApp796Repo = { getRecords: async () => [{ Profile_Code: 'PROF_STAFF_CHIEF', PartA_Weight: 70, PartB_Weight: 30, Fiscal_Year: '2026', Config_Status: 'PUBLISHED' }] };

    // 0 App795 records
    const mockApp795Empty = { getRecords: async () => [] };
    const p1 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796Repo, app795Repo: mockApp795Empty });
    await assert.rejects(async () => {
      await p1.checkEmployee('0118', '2026');
    }, { message: /ROUTE_NOT_FOUND/ });

    // >1 App795 records
    const mockApp795Dup = { getRecords: async () => [{ id: 1 }, { id: 2 }] };
    const p2 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796Repo, app795Repo: mockApp795Dup });
    await assert.rejects(async () => {
      await p2.checkEmployee('0118', '2026');
    }, { message: /ROUTE_AMBIGUOUS/ });
  });

  await t.test('B1.3 KintoneAdminDiagnosticProvider fails closed on App796 0 (SCORING_CONFIG_NOT_FOUND) and >1 (SCORING_CONFIG_AMBIGUOUS)', async () => {
    const mockApp53Repo = { getRecords: async () => [{ Employee_Code: '0118', Employee_Position: 'Staff', Employee_Section: 'TMT1' }] };
    const mockApp794Repo = { getRecords: async () => [{ $id: 101, Status: '01 Draft Objective' }] };

    // 0 App796 records
    const mockApp796Empty = { getRecords: async () => [] };
    const p1 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796Empty });
    await assert.rejects(async () => {
      await p1.checkEmployee('0118', '2026');
    }, { message: /SCORING_CONFIG_NOT_FOUND/ });

    // >1 App796 records
    const mockApp796Dup = { getRecords: async () => [{ id: 1 }, { id: 2 }] };
    const p2 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796Dup });
    await assert.rejects(async () => {
      await p2.checkEmployee('0118', '2026');
    }, { message: /SCORING_CONFIG_AMBIGUOUS/ });
  });

  await t.test('B1.4 KintoneAdminDiagnosticProvider fails closed when App53 position cannot resolve expected Profile_Code', async () => {
    const mockApp53Unmapped = { getRecords: async () => [{ Employee_Code: '0118', Employee_Position: 'UNKNOWN_INVALID_POSITION', Employee_Section: 'TMT1' }] };
    const mockApp794Repo = { getRecords: async () => [{ $id: 101, Status: '01 Draft Objective' }] };
    const p = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Unmapped, app794Repo: mockApp794Repo });
    await assert.rejects(async () => {
      await p.checkEmployee('0118', '2026');
    }, { message: /SCORING_CONFIG_NOT_FOUND/ });
  });

  await t.test('B1.5 KintoneAdminDiagnosticProvider fails closed when App796 record is missing Fiscal_Year or Config_Status', async () => {
    const mockApp53Repo = { getRecords: async () => [{ Employee_Code: '0118', Employee_Position: 'Staff', Employee_Section: 'TMT1' }] };
    const mockApp794Repo = { getRecords: async () => [{ $id: 101, Status: '01 Draft Objective' }] };

    // Missing Fiscal_Year
    const mockApp796MissingFy = { getRecords: async () => [{ Profile_Code: 'PROF_STAFF_CHIEF', PartA_Weight: 70, PartB_Weight: 30, Config_Status: 'PUBLISHED' }] };
    const p1 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796MissingFy });
    await assert.rejects(async () => {
      await p1.checkEmployee('0118', '2026');
    }, { message: /SCORING_CONFIG_NOT_FOUND/ });

    // Missing Config_Status
    const mockApp796MissingStatus = { getRecords: async () => [{ Profile_Code: 'PROF_STAFF_CHIEF', PartA_Weight: 70, PartB_Weight: 30, Fiscal_Year: '2026' }] };
    const p2 = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796MissingStatus });
    await assert.rejects(async () => {
      await p2.checkEmployee('0118', '2026');
    }, { message: /SCORING_CONFIG_NOT_FOUND/ });
  });

  await t.test('B1.6 Production provider returns authoritativeProfile using real App796 record values without fallbacks', async () => {
    const mockApp53Repo = { getRecords: async () => [{ Employee_Code: '0118', Employee_Position: 'Staff', Employee_Section: 'TMT1' }] };
    const mockApp794Repo = { getRecords: async () => [{ $id: 101, Status: '01 Draft Objective' }] };
    const mockApp796Repo = { getRecords: async () => [{ Profile_Code: 'PROF_STAFF_CHIEF', PartA_Weight: 70, PartB_Weight: 30, Fiscal_Year: '2026', Config_Status: 'PUBLISHED' }] };
    const mockApp795Repo = { getRecords: async () => [{ Manager_Level1_Approvers: { value: [{ code: 'real_mgr_user' }] }, GM_Level1_Approvers: { value: [{ code: 'real_gm_user' }] }, Routing_Topology: 'M1_G1', Expected_Appraiser_Count: 2 }] };

    const p = new KintoneAdminDiagnosticProvider({ app53Repo: mockApp53Repo, app794Repo: mockApp794Repo, app796Repo: mockApp796Repo, app795Repo: mockApp795Repo });
    const res = await p.checkEmployee('0118', '2026');

    assert.equal(res.authoritativeProfile.code, 'PROF_STAFF_CHIEF');
    assert.equal(res.authoritativeProfile.fiscalYear, '2026');
    assert.equal(res.authoritativeProfile.configStatus, 'PUBLISHED');
    assert.equal(res.authoritativeProfile.partAWeight, 70);
    assert.equal(res.authoritativeProfile.partBWeight, 30);
    assert.equal(res.authoritativeRoute.appraiser1, 'real_mgr_user');
    assert.equal(res.authoritativeRoute.appraiser2, 'real_gm_user');
  });

  // B2 Tests: App796 FY and PUBLISHED evidence mandatory
  await t.test('B2.1 App796 missing FY or missing status makes repair candidate unsafe (not proven)', () => {
    // Missing FY
    const candidate1 = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 60,
      actualPartBWeight: 40,
      position: 'Staff',
      authoritativeProfile: {
        code: 'PROF_STAFF_CHIEF',
        partAWeight: 70,
        partBWeight: 30,
        fiscalYear: null, // missing FY
        configStatus: 'PUBLISHED'
      }
    });

    assert.equal(candidate1.profileMasterEvidenced, false);
    assert.equal(candidate1.profileRecordRepairSafe, false);

    // Missing status
    const candidate2 = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 60,
      actualPartBWeight: 40,
      position: 'Staff',
      authoritativeProfile: {
        code: 'PROF_STAFF_CHIEF',
        partAWeight: 70,
        partBWeight: 30,
        fiscalYear: '2026',
        configStatus: null // missing status
      }
    });

    assert.equal(candidate2.profileMasterEvidenced, false);
    assert.equal(candidate2.profileRecordRepairSafe, false);
  });

  await t.test('B2.2 App796 wrong FY or non-PUBLISHED status makes repair candidate unsafe', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 60,
      actualPartBWeight: 40,
      position: 'Staff',
      authoritativeProfile: {
        code: 'PROF_STAFF_CHIEF',
        partAWeight: 70,
        partBWeight: 30,
        fiscalYear: '2026',
        configStatus: 'DRAFT' // non-PUBLISHED
      }
    });

    assert.equal(candidate.profileMasterEvidenced, false);
    assert.equal(candidate.profileRecordRepairSafe, false);
  });

  // B3 Tests: buildRecordDiagnostic() topology-aware ordinal mapping
  await t.test('B3.1 buildRecordDiagnostic() M1_G1 topology maps 1st=Manager_User, 2nd=GM_User', () => {
    const record = {
      $id: { value: '101' },
      Status: { value: '01 Draft Objective' },
      Routing_Topology: { value: 'M1_G1' },
      Manager_User: { value: [{ code: 'mgr1' }] },
      GM_User: { value: [{ code: 'gm1' }] }
    };
    const diag = AdminDiagnosticModel.buildRecordDiagnostic(record, { actualTopology: 'M1_G1' });

    assert.equal(diag.appraiser1, 'mgr1');
    assert.equal(diag.appraiser2, 'gm1');
  });

  await t.test('B3.2 buildRecordDiagnostic() M1_ONLY executive topology maps 1st=Manager_User', () => {
    const record = {
      $id: { value: '103' },
      Status: { value: '01 Draft Objective' },
      Routing_Topology: { value: 'M1_ONLY' },
      Manager_User: { value: [{ code: 'pres1' }] }
    };
    const diag = AdminDiagnosticModel.buildRecordDiagnostic(record, { actualTopology: 'M1_ONLY' });

    assert.equal(diag.appraiser1, 'pres1');
    assert.equal(diag.expectedAppraiserCount, 1);
  });

  // B4 Tests: Derived Routing_Key without physical storage evidence is absent from repair diff
  await t.test('B4.1 Derived Routing_Key without physical storage evidence is absent from repair diff', () => {
    const candidate = AdminDiagnosticModel.prepareRepairCandidate({
      employeeCode: '0118',
      fiscalYear: '2026',
      actualProfileCode: 'PROF_STAFF_CHIEF',
      actualPartAWeight: 70,
      actualPartBWeight: 30,
      position: 'Staff',
      sectionCode: 'TMT1',
      actualRoutingKey: 'TMT1',
      isPhysicalRoutingKeyProven: false, // physical field NOT proven
      actualTopology: 'M1_ONLY', // mismatch
      actualAppraiserCount: 1,
      actualAppraiser1: 'm1',
      authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30, fiscalYear: '2026', configStatus: 'PUBLISHED' },
      authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm1', appraiser2: 'g1' }
    });

    assert.equal(candidate.rootCause, 'FIX_THIS_RECORD');
    assert.ok(!('Routing_Key' in candidate.before));
    assert.ok('Routing_Topology' in candidate.before);
  });

  // B5 Tests: BUILD_VERSION_INFO.commitSha = NOT_EVIDENCED cannot render build status PASS
  await t.test('B5.1 BUILD_VERSION_INFO.commitSha = NOT_EVIDENCED renders bundle_version status NOT_EVIDENCED', () => {
    const health = AdminDiagnosticModel.evaluateSystemHealth({ loginUserCode: 'admin-form' });
    const versionItem = health.items.find(i => i.key === 'bundle_version');

    assert.equal(versionItem.status, 'NOT_EVIDENCED');
    assert.notEqual(versionItem.status, 'PASS');
  });

  // Security gate verification
  await t.test('Security Gate: admin-form technical-only identity with ZERO business workflow authority', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('0118'), false);
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: '0118' });
    assert.ok(html.includes('ACCESS DENIED'));
  });
});
