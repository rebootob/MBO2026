/**
 * Admin Support Center UI Component & Diagnostic Providers (D7 Corrective Round 2)
 * Read-only Technical Admin Diagnostic Panel strictly restricted to Kintone user `admin-form`.
 *
 * Source of Truth: project-docs/CONFIRMED_BASELINE/
 */

import { AdminDiagnosticModel, escapeHtml } from './admin-diagnostic-model.js';
import { getProfileCodeFromPosition } from '../profiles/profile-scoring-resolver.js';

/**
 * Mock Diagnostic Provider for local preview, unit testing, and offline diagnostic checks.
 * Explicitly labeled sourceMode = 'PREVIEW_FIXTURE', isProductionEvidence = false.
 */
export class MockAdminDiagnosticProvider {
  constructor(catalog = {}) {
    this.sourceMode = 'PREVIEW_FIXTURE';
    this.isProductionEvidence = false;
    this.catalog = {
      '0118': {
        employeeCode: '0118',
        fiscalYear: '2026',
        recordId: '101',
        mboKey: 'MBO_2026_0118',
        employeeName: 'Technical Service Chief',
        requesterUser: '0118',
        currentStatus: '01 Draft Objective',
        routingKey: 'TMT1',
        storedRoutingKey: 'TMT1',
        isPhysicalRoutingKeyProven: true,
        sectionCode: 'TMT1',
        teamName: 'Technical Service',
        position: 'Staff',
        actualProfileCode: 'PROF_STAFF_CHIEF',
        actualPartAWeight: 70,
        actualPartBWeight: 30,
        actualTopology: 'M1_G1',
        actualAppraiserCount: 2,
        appraiser1: 'm01',
        appraiser2: 'g01',
        appraiser3: 'NOT_EVIDENCED',
        appraiser4: 'NOT_EVIDENCED',
        authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30, fiscalYear: '2026', configStatus: 'PUBLISHED' },
        authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' },
        sourceMode: 'PREVIEW_FIXTURE',
        isProductionEvidence: false
      },
      '0111': {
        employeeCode: '0111',
        fiscalYear: '2026',
        recordId: '102',
        mboKey: 'MBO_2026_0111',
        employeeName: 'Assistant Manager 0111',
        requesterUser: '0111',
        currentStatus: '01 Draft Objective',
        routingKey: 'TMS1',
        storedRoutingKey: 'TMS1',
        isPhysicalRoutingKeyProven: true,
        sectionCode: 'TMS1',
        teamName: '',
        position: 'Assistant Manager',
        actualProfileCode: 'PROF_ASST_MGR',
        actualPartAWeight: 60,
        actualPartBWeight: 40,
        actualTopology: 'M1_G1',
        actualAppraiserCount: 2,
        appraiser1: 'm02',
        appraiser2: 'g01',
        appraiser3: 'NOT_EVIDENCED',
        appraiser4: 'NOT_EVIDENCED',
        authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 60, partBWeight: 40, fiscalYear: '2026', configStatus: 'PUBLISHED' },
        authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm02', appraiser2: 'g01' },
        sourceMode: 'PREVIEW_FIXTURE',
        isProductionEvidence: false
      },
      'DGM001': {
        employeeCode: 'DGM001',
        fiscalYear: '2026',
        recordId: '103',
        mboKey: 'MBO_2026_DGM001',
        employeeName: 'Deputy General Manager',
        requesterUser: 'DGM001',
        currentStatus: '01 Draft Objective',
        routingKey: 'POSITION_DGM',
        storedRoutingKey: 'POSITION_DGM',
        isPhysicalRoutingKeyProven: true,
        sectionCode: '',
        teamName: '',
        position: 'DGM',
        actualProfileCode: 'PROF_DGM',
        actualPartAWeight: 50,
        actualPartBWeight: 50,
        actualTopology: 'M1_ONLY',
        actualAppraiserCount: 1,
        appraiser1: 'president_user',
        appraiser2: 'NOT_EVIDENCED',
        appraiser3: 'NOT_EVIDENCED',
        appraiser4: 'NOT_EVIDENCED',
        authoritativeProfile: { code: 'PROF_DGM', partAWeight: 50, partBWeight: 50, fiscalYear: '2026', configStatus: 'PUBLISHED' },
        authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1, appraiser1: 'president_user' },
        sourceMode: 'PREVIEW_FIXTURE',
        isProductionEvidence: false
      },
      ...catalog
    };
  }

  async checkEmployee(empCode, fiscalYear) {
    const cleanEmp = String(empCode || '').trim();
    const cleanFy = String(fiscalYear || '').trim();

    if (!cleanEmp) {
      throw new Error('EMPLOYEE_CODE_REQUIRED: Please enter an Employee Code to check.');
    }
    if (!cleanFy) {
      throw new Error('FISCAL_YEAR_REQUIRED: Please enter a Fiscal Year (e.g. 2026).');
    }

    if (cleanEmp === 'AMBIGUOUS_EMP') {
      const err = new Error(`MBO_AMBIGUOUS: Multiple App794 records found for employee ${cleanEmp} in ${cleanFy}.`);
      err.code = 'MBO_AMBIGUOUS';
      throw err;
    }

    if (cleanEmp === 'ERROR_EMP') {
      throw new Error('PROVIDER_ERROR: Diagnostic provider error occurred during employee check.');
    }

    const match = this.catalog[cleanEmp];

    if (!match) {
      return {
        employeeCode: cleanEmp,
        fiscalYear: cleanFy,
        recordId: 'NOT_FOUND',
        mboKey: 'NOT_EVIDENCED',
        employeeName: 'NOT_EVIDENCED',
        requesterUser: 'NOT_EVIDENCED',
        currentStatus: 'NOT_EVIDENCED',
        routingKey: 'NOT_EVIDENCED',
        storedRoutingKey: 'NOT_AVAILABLE',
        isPhysicalRoutingKeyProven: false,
        sectionCode: 'NOT_EVIDENCED',
        teamName: 'NOT_EVIDENCED',
        appraiser1: 'NOT_EVIDENCED',
        appraiser2: 'NOT_EVIDENCED',
        appraiser3: 'NOT_EVIDENCED',
        appraiser4: 'NOT_EVIDENCED',
        isNotFound: true,
        sourceMode: 'PREVIEW_FIXTURE',
        isProductionEvidence: false
      };
    }

    return {
      ...match,
      employeeCode: cleanEmp,
      fiscalYear: cleanFy,
      sourceMode: 'PREVIEW_FIXTURE',
      isProductionEvidence: false
    };
  }
}

/**
 * Production-Intended Read-Only Async Kintone Diagnostic Provider (B1 Fix).
 * Assembles a single READ-ONLY diagnostic evidence bundle from injected dependencies for App53, App794, App795, App796.
 * Zero live Kintone calls executed without injected test transport or API adapter.
 * Fails closed on missing or ambiguous records for all 4 apps. Does NOT fabricate fallbacks.
 */
export class KintoneAdminDiagnosticProvider {
  constructor(options = {}) {
    this.sourceMode = 'PRODUCTION_KINTONE';
    this.isProductionEvidence = true;
    this.kintoneApi = options.kintoneApi || null;
    this.appIds = options.appIds || { app53: 53, app795: 795, app796: 796, app794: 794 };
    this.app53Repo = options.app53Repo || null;
    this.app794Repo = options.app794Repo || null;
    this.app795Repo = options.app795Repo || null;
    this.app796Repo = options.app796Repo || null;
  }

  async checkEmployee(empCode, fiscalYear) {
    const cleanEmp = String(empCode || '').trim();
    const cleanFy = String(fiscalYear || '').trim();

    if (!cleanEmp) throw new Error('EMPLOYEE_CODE_REQUIRED');
    if (!cleanFy) throw new Error('FISCAL_YEAR_REQUIRED');

    // 1. App53 Employee Master Query
    let empRecords = [];
    if (this.app53Repo) {
      empRecords = await this.app53Repo.getRecords(`Employee_Code = "${cleanEmp}" limit 2`);
    } else if (this.kintoneApi) {
      const resp = await this.kintoneApi.getRecords(this.appIds.app53, `Employee_Code = "${cleanEmp}" limit 2`);
      empRecords = resp?.records || [];
    } else {
      throw new Error('PROVIDER_NOT_CONFIGURED: Kintone transport or repository dependency is not wired.');
    }

    if (!empRecords || empRecords.length === 0) {
      const err = new Error(`EMPLOYEE_NOT_FOUND: Employee Code "${cleanEmp}" was not found in App53 Employee Master.`);
      err.code = 'EMPLOYEE_NOT_FOUND';
      throw err;
    }
    if (empRecords.length > 1) {
      const err = new Error(`EMPLOYEE_AMBIGUOUS: Duplicate active records found for Employee Code "${cleanEmp}" in App53.`);
      err.code = 'EMPLOYEE_AMBIGUOUS';
      throw err;
    }

    const empObj = empRecords[0];
    const empPos = empObj.Employee_Position?.value || empObj.Employee_Position || '';
    const secCode = empObj.Employee_Section?.value || empObj.Employee_Section || '';
    const teamCode = empObj.Team?.value || empObj.Team || '';

    // 2. App794 MBO Annual Record Query (B1: 0 records => MBO_NOT_FOUND, >1 => MBO_AMBIGUOUS)
    let mboRecords = [];
    if (this.app794Repo) {
      mboRecords = await this.app794Repo.getRecords(`Employee_Code = "${cleanEmp}" and Fiscal_Year = "${cleanFy}" limit 2`);
    } else if (this.kintoneApi) {
      const resp = await this.kintoneApi.getRecords(this.appIds.app794, `Employee_Code = "${cleanEmp}" and Fiscal_Year = "${cleanFy}" limit 2`);
      mboRecords = resp?.records || [];
    }

    if (!mboRecords || mboRecords.length === 0) {
      const err = new Error(`MBO_NOT_FOUND: App794 MBO record not found for Employee "${cleanEmp}" in Fiscal Year ${cleanFy}.`);
      err.code = 'MBO_NOT_FOUND';
      throw err;
    }
    if (mboRecords.length > 1) {
      const err = new Error(`MBO_AMBIGUOUS: Multiple App794 records found for Employee "${cleanEmp}" in ${cleanFy}.`);
      err.code = 'MBO_AMBIGUOUS';
      throw err;
    }

    const mboRecord = mboRecords[0];

    // 3. App796 Published Scoring Master Config Query (B1: Query by expected Profile_Code + FY + PUBLISHED)
    let expectedProfileCode = null;
    if (empPos) {
      try {
        expectedProfileCode = getProfileCodeFromPosition(empPos);
      } catch {}
    }

    let app796Records = [];
    const pQuery = expectedProfileCode
      ? `Fiscal_Year = "${cleanFy}" and Config_Status in ("PUBLISHED") and Profile_Code = "${expectedProfileCode}" limit 2`
      : `Fiscal_Year = "${cleanFy}" and Config_Status in ("PUBLISHED") limit 2`;

    if (this.app796Repo) {
      app796Records = await this.app796Repo.getRecords(pQuery);
    } else if (this.kintoneApi) {
      const resp = await this.kintoneApi.getRecords(this.appIds.app796, pQuery);
      app796Records = resp?.records || [];
    }

    if (!app796Records || app796Records.length === 0) {
      const err = new Error(`SCORING_CONFIG_NOT_FOUND: Published App796 config for profile "${expectedProfileCode || 'N/A'}" in FY ${cleanFy} not found.`);
      err.code = 'SCORING_CONFIG_NOT_FOUND';
      throw err;
    }
    if (app796Records.length > 1) {
      const err = new Error(`SCORING_CONFIG_AMBIGUOUS: Multiple published App796 configs found for profile "${expectedProfileCode || 'N/A'}" in FY ${cleanFy}.`);
      err.code = 'SCORING_CONFIG_AMBIGUOUS';
      throw err;
    }

    const app796Obj = app796Records[0];

    // 4. App795 Routing Master Query (B1: 0 records => ROUTE_NOT_FOUND, >1 => ROUTE_AMBIGUOUS)
    const normPos = empPos.trim().toLowerCase();
    const execKeyMap = {
      'dgm': 'POSITION_DGM',
      'deputy general manager': 'POSITION_DGM',
      'gm': 'POSITION_GM',
      'general manager': 'POSITION_GM',
      'vp': 'POSITION_VP',
      'vice president': 'POSITION_VP'
    };
    const rKey = execKeyMap[normPos] || (teamCode ? `${secCode}|${teamCode}` : secCode);

    let app795Records = [];
    if (this.app795Repo) {
      app795Records = await this.app795Repo.getRecords(`Routing_Key = "${rKey}" and Active in ("Active") limit 2`);
    } else if (this.kintoneApi) {
      const resp = await this.kintoneApi.getRecords(this.appIds.app795, `Routing_Key = "${rKey}" and Active in ("Active") limit 2`);
      app795Records = resp?.records || [];
    }

    if (!app795Records || app795Records.length === 0) {
      const err = new Error(`ROUTE_NOT_FOUND: Active App795 route for key "${rKey}" not found.`);
      err.code = 'ROUTE_NOT_FOUND';
      throw err;
    }
    if (app795Records.length > 1) {
      const err = new Error(`ROUTE_AMBIGUOUS: Multiple active App795 routes found for key "${rKey}".`);
      err.code = 'ROUTE_AMBIGUOUS';
      throw err;
    }

    const app795Obj = app795Records[0];

    // Check physical storage of Routing_Key on App794 record (B4)
    const isPhysicalRoutingKeyProven = Boolean(mboRecord && 'Routing_Key' in mboRecord && mboRecord.Routing_Key !== null && mboRecord.Routing_Key !== undefined);
    const storedRoutingKey = isPhysicalRoutingKeyProven ? (mboRecord.Routing_Key?.value || mboRecord.Routing_Key || 'NOT_AVAILABLE') : 'NOT_AVAILABLE';

    // Extract real appraiser user codes without hardcoded fallbacks like 'm01' or 'g01'
    const a1 = app795Obj.Manager_Level1_Approvers?.value?.[0]?.code || app795Obj.First_Manager_User?.value?.[0]?.code || app795Obj.Manager_User?.value?.[0]?.code || app795Obj.appraiser1 || null;
    const a2 = app795Obj.GM_Level1_Approvers?.value?.[0]?.code || app795Obj.GM_User?.value?.[0]?.code || app795Obj.appraiser2 || null;
    const a3 = app795Obj.GM_Level2_Approvers?.value?.[0]?.code || app795Obj.appraiser3 || null;
    const a4 = app795Obj.appraiser4 || null;

    return {
      employeeCode: cleanEmp,
      fiscalYear: cleanFy,
      recordId: String(mboRecord.$id?.value || mboRecord.$id || ''),
      mboKey: String(mboRecord.Record_Key?.value || mboRecord.Record_Key || 'NOT_EVIDENCED'),
      employeeName: empObj.Employee_Name?.value || empObj.Employee_Name || 'NOT_EVIDENCED',
      requesterUser: empObj.Employee_Code?.value || empObj.Employee_Code || cleanEmp,
      currentStatus: String(mboRecord.Status?.value || mboRecord.Status || 'NOT_EVIDENCED'),
      routingKey: rKey || 'NOT_EVIDENCED',
      storedRoutingKey,
      isPhysicalRoutingKeyProven,
      sectionCode: secCode || 'NOT_EVIDENCED',
      teamName: teamCode || 'NOT_EVIDENCED',
      position: empPos || 'NOT_EVIDENCED',
      actualProfileCode: mboRecord.Profile_Code?.value || mboRecord.Profile_Code || 'NOT_EVIDENCED',
      actualPartAWeight: mboRecord.PartA_Weight?.value ?? mboRecord.PartA_Weight ?? null,
      actualPartBWeight: mboRecord.PartB_Weight?.value ?? mboRecord.PartB_Weight ?? null,
      actualTopology: mboRecord.Routing_Topology?.value || mboRecord.Routing_Topology || 'NOT_EVIDENCED',
      actualAppraiserCount: mboRecord.Expected_Appraiser_Count?.value ?? mboRecord.Expected_Appraiser_Count ?? null,
      appraiser1: mboRecord.First_Manager_User?.value?.[0]?.code || mboRecord.First_Manager_User || 'NOT_EVIDENCED',
      appraiser2: mboRecord.GM_User?.value?.[0]?.code || mboRecord.GM_User || 'NOT_EVIDENCED',
      authoritativeProfile: {
        code: app796Obj.Profile_Code?.value || app796Obj.Profile_Code,
        partAWeight: app796Obj.PartA_Weight?.value ?? app796Obj.PartA_Weight,
        partBWeight: app796Obj.PartB_Weight?.value ?? app796Obj.PartB_Weight,
        fiscalYear: app796Obj.Fiscal_Year?.value || app796Obj.Fiscal_Year || cleanFy,
        configStatus: app796Obj.Config_Status?.value || app796Obj.Config_Status || 'PUBLISHED'
      },
      authoritativeRoute: {
        topology: app795Obj.Routing_Topology?.value || app795Obj.Routing_Topology || null,
        appraiserCount: app795Obj.Expected_Appraiser_Count?.value ?? app795Obj.Expected_Appraiser_Count ?? null,
        appraiser1: a1,
        appraiser2: a2,
        appraiser3: a3,
        appraiser4: a4
      },
      isNotFound: false,
      sourceMode: 'PRODUCTION_KINTONE',
      isProductionEvidence: true
    };
  }
}

export class AdminSupportCenterUI {
  constructor(options = {}) {
    this.container = options.container || null;
    this.diagnosticContext = options.diagnosticContext || {};
    this.activeTab = options.activeTab || 'health';
    // P0-A: Production-intended UI does NOT silently default to mock provider
    this.diagnosticProvider = options.diagnosticProvider || null;
    this.checkErrorMessage = null;
    this.checkLoading = false;
  }

  /**
   * Helper to return truth-based indicator badges for UI tables (P1-A).
   */
  static getMatchBadge(status, isMatch) {
    if (status === 'NOT_EVIDENCED' || status === 'NOT_AVAILABLE' || status === null || status === undefined) {
      return '<span style="background:#475569; color:#f8fafc; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">⚪ NOT_EVIDENCED</span>';
    }
    if (status === 'NOT_APPLICABLE') {
      return '<span style="background:#64748b; color:#f8fafc; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">⚪ NOT_APPLICABLE</span>';
    }
    if (status === 'PASS' || isMatch === true) {
      return '<span style="background:#059669; color:#ffffff; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">✅ MATCH</span>';
    }
    return '<span style="background:#dc2626; color:#ffffff; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">❌ MISMATCH</span>';
  }

  /**
   * Renders the complete Admin Support Center panel HTML with HTML Output Escaping and security gates.
   */
  renderHtml(context = {}) {
    const activeCtx = { ...this.diagnosticContext, ...context };

    // P0 Security Gate: Technical admin admin-form ONLY
    if (!AdminDiagnosticModel.isTechnicalAdmin(activeCtx.loginUserCode)) {
      return `
        <div id="admin-support-center-panel" style="background:#450a0a; border:2px solid #ef4444; border-radius:8px; padding:20px; margin:20px 0; color:#fca5a5; font-family:sans-serif;">
          <h3 style="margin:0 0 8px 0; color:#f87171; font-size:16px;">⛔ ACCESS DENIED / ปฏิเสธการเข้าถึง</h3>
          <div style="font-size:12px; line-height:1.5;">
            ศูนย์ตรวจสอบระบบสำหรับผู้ดูแล (Admin Support Center) สงวนสิทธิ์เฉพาะบัญชีผู้ดูแลระบบเชิงเทคนิค <code>admin-form</code> เท่านั้น<br/>
            User code <strong>"${escapeHtml(activeCtx.loginUserCode || 'UNAUTHENTICATED')}"</strong> is not authorized to access read-only Technical Admin Diagnostics.
          </div>
        </div>
      `;
    }

    const health = AdminDiagnosticModel.evaluateSystemHealth(activeCtx);
    const recordDiag = AdminDiagnosticModel.buildRecordDiagnostic(activeCtx.record, activeCtx);
    const workflowTrace = AdminDiagnosticModel.evaluateWorkflowTrace(activeCtx);
    const profileMatch = AdminDiagnosticModel.evaluateProfileMatch(activeCtx);
    const routeMatch = AdminDiagnosticModel.evaluateRouteMatch(activeCtx);
    const repairCandidate = AdminDiagnosticModel.prepareRepairCandidate(activeCtx);

    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({
      health,
      recordDiag,
      workflowTrace,
      profileMatch,
      routeMatch,
      repairCandidate
    });

    const statusBadgeClass = {
      PASS: 'background:#059669; color:#ffffff;',
      WARNING: 'background:#d97706; color:#ffffff;',
      ERROR: 'background:#dc2626; color:#ffffff;',
      INCOMPLETE_EVIDENCE: 'background:#1e40af; color:#ffffff;',
      BLOCKED: 'background:#475569; color:#ffffff;',
      NOT_EVIDENCED: 'background:#475569; color:#ffffff;',
      NOT_AVAILABLE: 'background:#64748b; color:#ffffff;'
    };

    const riskBadgeClass = {
      LOW: 'background:#059669; color:#ffffff;',
      MEDIUM: 'background:#d97706; color:#ffffff;',
      HIGH: 'background:#dc2626; color:#ffffff;',
      BLOCKED: 'background:#475569; color:#ffffff;'
    };

    const getBadge = AdminSupportCenterUI.getMatchBadge;

    const providerMode = this.diagnosticProvider?.sourceMode || activeCtx.sourceMode || 'UNCONFIGURED';
    const isProdEvidence = this.diagnosticProvider?.isProductionEvidence ?? activeCtx.isProductionEvidence ?? false;

    return `
      <div id="admin-support-center-panel" style="background:#0f172a; border:2px solid #3b82f6; border-radius:8px; padding:20px; margin:20px 0; color:#f8fafc; font-family:sans-serif;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:15px; margin-bottom:15px;">
          <div>
            <h2 style="margin:0 0 5px 0; font-size:18px; color:#60a5fa; display:flex; align-items:center; gap:8px;">
              🛡️ Admin Support Center / ศูนย์ตรวจสอบระบบสำหรับผู้ดูแล
              <span style="font-size:11px; background:#1e40af; color:#dbeafe; padding:3px 8px; border-radius:12px; font-weight:normal;">TECHNICAL ADMIN / READ-ONLY DIAGNOSTICS</span>
            </h2>
            <div style="font-size:12px; color:#94a3b8;">
              ระบบตรวจสอบและวินิจฉัยเชิงเทคนิคสำหรับวิศวกรผู้ดูแลระบบ • 0 Business Workflow Authority
            </div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:12px; padding:6px 12px; border-radius:4px; font-weight:bold; ${statusBadgeClass[health.overallHealth] || statusBadgeClass.INCOMPLETE_EVIDENCE}">
              OVERALL HEALTH: ${escapeHtml(health.overallHealth)}
            </span>
            <!-- Explicit Evidence Provider Badge -->
            <div style="margin-top:4px;">
              ${providerMode === 'PREVIEW_FIXTURE' ? `
                <span style="font-size:10px; background:#9a3412; color:#ffedd5; padding:2px 6px; border-radius:4px; font-weight:bold;">⚠️ PREVIEW FIXTURE EVIDENCE (NOT PRODUCTION EVIDENCE)</span>
              ` : (isProdEvidence ? `
                <span style="font-size:10px; background:#065f46; color:#d1fae5; padding:2px 6px; border-radius:4px; font-weight:bold;">🔒 PRODUCTION KINTONE EVIDENCE</span>
              ` : `
                <span style="font-size:10px; background:#334155; color:#94a3b8; padding:2px 6px; border-radius:4px; font-weight:bold;">⚪ PROVIDER NOT CONFIGURED</span>
              `)}
            </div>
          </div>
        </div>

        <!-- Security Boundary Notice -->
        <div style="background:#1e293b; border-left:4px solid #f59e0b; padding:10px 15px; margin-bottom:15px; border-radius:0 4px 4px 0; font-size:12px; color:#cbd5e1;">
          ⚠️ <strong>ประกาศขอบเขตความปลอดภัย (Security Boundary Notice):</strong> บัญชี <code>admin-form</code> เป็นสิทธิ์ผู้ดูแลระบบเชิงเทคนิคเท่านั้น (Technical Admin Only) <strong>ไม่มีสิทธิ์ดำเนินธุรกรรมทางธุรกิจ</strong> (0 Business Workflow Authority: ไม่สามารถกดอนุมัติ, ส่งกลับ, ลงคะแนน หรือเริ่มขั้นตอนประเมินแทนพนักงาน/ผู้ประเมิน/HR ได้)
        </div>

        <!-- Section Tabs -->
        <div style="display:flex; gap:8px; border-bottom:1px solid #334155; margin-bottom:15px; padding-bottom:10px; overflow-x:auto;">
          <button type="button" class="admin-tab-btn" data-tab="health" style="background:${this.activeTab === 'health' ? '#1e40af' : '#1e293b'}; border:1px solid #3b82f6; color:${this.activeTab === 'health' ? '#ffffff' : '#60a5fa'}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            1. System Health (สุขภาพระบบ)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="check" style="background:${this.activeTab === 'check' ? '#1e40af' : '#1e293b'}; border:1px solid #475569; color:${this.activeTab === 'check' ? '#ffffff' : '#94a3b8'}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            2. Employee Check (ตรวจสอบพนักงาน)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="validation" style="background:${this.activeTab === 'validation' ? '#1e40af' : '#1e293b'}; border:1px solid #475569; color:${this.activeTab === 'validation' ? '#ffffff' : '#94a3b8'}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            3. Workflow & Route Trace (ตรวจสอบเส้นทาง)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="candidate" style="background:${this.activeTab === 'candidate' ? '#1e40af' : '#1e293b'}; border:1px solid #475569; color:${this.activeTab === 'candidate' ? '#ffffff' : '#94a3b8'}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            4. Repair Candidate (เตรียมการซ่อมแซม)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="repair" style="background:#1e293b; border:1px solid #475569; color:#64748b; padding:8px 12px; border-radius:4px; cursor:not-allowed; font-size:12px; white-space:nowrap;" disabled>
            5. Controlled Repair (🔒 ไม่ได้เปิดใช้งาน)
          </button>
        </div>

        <!-- Tab 1: System Health -->
        <div id="admin-tab-content-health" style="display:${this.activeTab === 'health' ? 'block' : 'none'};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">รายการตรวจสอบตัวชี้วัดสุขภาพระบบ (15 Diagnostic Indicators)</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:10px; margin-bottom:15px;">
            ${health.items.map(item => `
              <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:10px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#f1f5f9;">${escapeHtml(item.labelTH)}</strong>
                  <span style="font-size:10px; padding:2px 6px; border-radius:3px; font-weight:bold; ${statusBadgeClass[item.status] || statusBadgeClass.NOT_AVAILABLE}">
                    ${escapeHtml(item.status)}
                  </span>
                </div>
                <div style="color:#94a3b8; font-size:11px; word-break:break-word;">
                  ${escapeHtml(item.reason)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tab 2: Employee Check -->
        <div id="admin-tab-content-check" style="display:${this.activeTab === 'check' ? 'block' : 'none'};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">Employee-Centric Record Check (การตรวจสอบข้อมูลประจำตัวพนักงาน)</h3>
          <div style="background:#1e293b; border:1px solid #334155; padding:15px; border-radius:6px; margin-bottom:15px;">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px;">
              <div>
                <label style="font-size:11px; color:#94a3b8; display:block; margin-bottom:4px;">Employee Code / รหัสพนักงาน</label>
                <input type="text" id="admin-check-emp-code" value="${recordDiag.employeeCode === 'NOT_EVIDENCED' ? '' : escapeHtml(recordDiag.employeeCode)}" placeholder="Enter Employee Code (e.g. 0118)" style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 10px; border-radius:4px; font-size:12px; width:180px;" />
              </div>
              <div>
                <label style="font-size:11px; color:#94a3b8; display:block; margin-bottom:4px;">Fiscal Year / ปีงบประมาณ</label>
                <input type="text" id="admin-check-fy" value="${recordDiag.fiscalYear === 'NOT_EVIDENCED' ? '' : escapeHtml(recordDiag.fiscalYear)}" placeholder="e.g. 2026" style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 10px; border-radius:4px; font-size:12px; width:100px;" />
              </div>
              <div style="margin-top:16px;">
                <button type="button" id="admin-btn-check-employee" style="background:#2563eb; color:#ffffff; border:none; padding:7px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">
                  ${this.checkLoading ? '⏳ CHECKING...' : '🔍 CHECK EMPLOYEE'}
                </button>
              </div>
            </div>

            ${this.checkErrorMessage ? `
              <div style="background:#450a0a; border:1px solid #ef4444; color:#fca5a5; padding:8px 12px; border-radius:4px; font-size:12px; margin-bottom:12px;">
                ❌ ${escapeHtml(this.checkErrorMessage)}
              </div>
            ` : ''}

            <table style="width:100%; border-collapse:collapse; font-size:12px; color:#cbd5e1; background:#0f172a; border-radius:6px; overflow:hidden;">
              <tbody>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; width:220px; color:#94a3b8;">Record ID / MBO Key:</td><td style="padding:8px 12px;">${escapeHtml(recordDiag.recordId)} / ${escapeHtml(recordDiag.mboKey)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Employee Name / Requester:</td><td style="padding:8px 12px;">${escapeHtml(recordDiag.employeeName)} • Requester: ${escapeHtml(recordDiag.requesterUser)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Current Workflow Status:</td><td style="padding:8px 12px; color:#38bdf8; font-weight:bold;">${escapeHtml(recordDiag.currentStatus)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Routing Key / Stored Key:</td><td style="padding:8px 12px;">Derived: ${escapeHtml(recordDiag.routingKey)} • Stored: ${escapeHtml(recordDiag.storedRoutingKey)}</td></tr>
                <tr><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Appraiser Slot Sequence:</td><td style="padding:8px 12px;">1st: ${escapeHtml(recordDiag.appraiser1)} | 2nd: ${escapeHtml(recordDiag.appraiser2)} | 3rd: ${escapeHtml(recordDiag.appraiser3)} | 4th: ${escapeHtml(recordDiag.appraiser4)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 3: Workflow & Route Validation -->
        <div id="admin-tab-content-validation" style="display:${this.activeTab === 'validation' ? 'block' : 'none'};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">Workflow Trace, Profile & Route Validation</h3>

          <!-- Card 1: Workflow Trace -->
          <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:6px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#60a5fa; font-size:13px;">1. Workflow Trace & State Consistency Check</strong>
              <span style="font-size:10px; padding:2px 8px; border-radius:3px; font-weight:bold; ${statusBadgeClass[workflowTrace.status] || statusBadgeClass.NOT_EVIDENCED}">
                ${escapeHtml(workflowTrace.status)}
              </span>
            </div>
            <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">
              <strong>Expected Workflow Path:</strong> <code style="color:#38bdf8;">${escapeHtml(workflowTrace.expectedPath)}</code>
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              Status Reason: ${escapeHtml(workflowTrace.reason)}<br/>
              Actual Workflow Log Status: <span style="color:#f59e0b;">${escapeHtml(workflowTrace.historyStatus)}</span>
            </div>
          </div>

          <!-- Card 2: Profile Check -->
          <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:6px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#60a5fa; font-size:13px;">2. Expected vs Actual Evaluation Profile Check</strong>
              <span style="font-size:10px; padding:2px 8px; border-radius:3px; font-weight:bold; ${statusBadgeClass[profileMatch.status] || statusBadgeClass.NOT_EVIDENCED}">
                ${escapeHtml(profileMatch.status)}
              </span>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#cbd5e1;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; text-align:left;">
                  <th style="padding:4px;">Metric</th>
                  <th style="padding:4px;">Expected (App796 Master)</th>
                  <th style="padding:4px;">Actual (App794 Record)</th>
                  <th style="padding:4px;">Match</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Profile Code</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.expectedProfileCode)}</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.actualProfileCode)}</td>
                  <td style="padding:4px;">${getBadge(profileMatch.status, profileMatch.expectedProfileCode === profileMatch.actualProfileCode)}</td>
                </tr>
                <tr>
                  <td style="padding:4px; font-weight:bold;">Part A / Part B Weight</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.expectedPartAWeight)}% / ${escapeHtml(profileMatch.expectedPartBWeight)}%</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.actualPartAWeight)}% / ${escapeHtml(profileMatch.actualPartBWeight)}%</td>
                  <td style="padding:4px;">${getBadge(profileMatch.status, profileMatch.expectedPartAWeight === profileMatch.actualPartAWeight && profileMatch.expectedPartBWeight === profileMatch.actualPartBWeight)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size:11px; color:#94a3b8; margin-top:6px;">${escapeHtml(profileMatch.reason)}</div>
          </div>

          <!-- Card 3: Route Check -->
          <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#60a5fa; font-size:13px;">3. Expected vs Actual Route Assignment Check</strong>
              <span style="font-size:10px; padding:2px 8px; border-radius:3px; font-weight:bold; ${statusBadgeClass[routeMatch.status] || statusBadgeClass.NOT_EVIDENCED}">
                ${escapeHtml(routeMatch.status)}
              </span>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#cbd5e1;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; text-align:left;">
                  <th style="padding:4px;">Attribute</th>
                  <th style="padding:4px;">Expected (App795 Master)</th>
                  <th style="padding:4px;">Actual (App794 Record)</th>
                  <th style="padding:4px;">Match</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Routing Key</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedRoutingKey)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualRoutingKey)}</td>
                  <td style="padding:4px;">${getBadge(routeMatch.status, routeMatch.expectedRoutingKey === routeMatch.actualRoutingKey)}</td>
                </tr>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Routing Topology</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedTopology)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualTopology)}</td>
                  <td style="padding:4px;">${getBadge(routeMatch.status, routeMatch.expectedTopology === routeMatch.actualTopology)}</td>
                </tr>
                <tr>
                  <td style="padding:4px; font-weight:bold;">Appraiser Count</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedAppraiserCount)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualAppraiserCount)}</td>
                  <td style="padding:4px;">${getBadge(routeMatch.status, routeMatch.expectedAppraiserCount === routeMatch.actualAppraiserCount)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size:11px; color:#94a3b8; margin-top:6px;">${escapeHtml(routeMatch.reason)}</div>
          </div>
        </div>

        <!-- Tab 4: Repair Candidate -->
        <div id="admin-tab-content-candidate" style="display:${this.activeTab === 'candidate' ? 'block' : 'none'};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">Prepare Repair Candidate (เตรียมข้อมูลและเปรียบเทียบก่อน-หลังซ่อมแซม)</h3>
          
          <div style="background:#1e293b; border:1px solid #334155; padding:15px; border-radius:6px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div>
                <strong style="color:#f59e0b; font-size:13px;">Root Cause Classification: ${escapeHtml(repairCandidate.rootCause)}</strong>
                <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Problem Type: ${escapeHtml(repairCandidate.problemType)}</div>
              </div>
              <div>
                <span style="font-size:11px; padding:4px 10px; border-radius:3px; font-weight:bold; ${riskBadgeClass[repairCandidate.risk] || riskBadgeClass.LOW}">
                  RISK: ${escapeHtml(repairCandidate.risk)}
                </span>
              </div>
            </div>

            <div style="font-size:12px; color:#cbd5e1; background:#0f172a; padding:10px; border-radius:4px; margin-bottom:12px;">
              <strong>Authoritative Source:</strong> ${escapeHtml(repairCandidate.authoritativeSource)}<br/>
              <strong>Recommended Action:</strong> ${escapeHtml(repairCandidate.recommendedAction)}<br/>
              <strong>Impact Scope:</strong> ${escapeHtml(repairCandidate.impactScope)} • Target App: ${escapeHtml(repairCandidate.targetApp)}
            </div>

            <!-- Exact Before / After Diff Table -->
            <h4 style="font-size:12px; color:#60a5fa; margin:10px 0 6px 0;">Exact Field Diff (Before vs After)</h4>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#cbd5e1; background:#0f172a; border-radius:4px; overflow:hidden; margin-bottom:10px;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; text-align:left;">
                  <th style="padding:6px 10px;">Field Name</th>
                  <th style="padding:6px 10px; color:#ef4444;">Before (Current Record)</th>
                  <th style="padding:6px 10px; color:#10b981;">After (Proposed Candidate)</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(repairCandidate.before).length > 0 ? Object.keys(repairCandidate.before).map(field => `
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:6px 10px; font-weight:bold;">${escapeHtml(field)}</td>
                    <td style="padding:6px 10px; color:#fca5a5;">${escapeHtml(repairCandidate.before[field])}</td>
                    <td style="padding:6px 10px; color:#6ee7b7;">${escapeHtml(repairCandidate.after[field])}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="3" style="padding:8px 10px; color:#94a3b8; text-align:center;">No safe field diff available (BLOCKED or NO_REPAIR_NEEDED)</td></tr>
                `}
              </tbody>
            </table>

            <div style="font-size:11px; color:#94a3b8; display:flex; gap:15px;">
              <span>Backup Required: <strong>${escapeHtml(repairCandidate.backupRequired)}</strong></span>
              <span>Read-back Required: <strong>${escapeHtml(repairCandidate.readbackRequired)}</strong></span>
              <span>Rollback Required: <strong>${escapeHtml(repairCandidate.rollbackRequired)}</strong></span>
              <span>Execution Status: <strong style="color:#f59e0b;">${escapeHtml(repairCandidate.executionStatus)}</strong></span>
            </div>
          </div>
        </div>

        <!-- Tab 5: Controlled Repair Placeholder -->
        <div id="admin-tab-content-repair" style="display:none; background:#1e293b; padding:15px; border-radius:6px; border:1px solid #334155;">
          <h3 style="font-size:14px; color:#f59e0b; margin-top:0;">🔒 Controlled Repair Contract Placeholder</h3>
          <p style="font-size:12px; color:#94a3b8; margin:0 0 10px 0;">
            สัญญาการแก้ไขฉุกเฉินที่มีการควบคุม (Controlled Repair) ยังไม่ได้ถูกเปิดใช้งานในแพ็กเกจนี้ การซ่อมแซมเรคคอร์ดหรือสคีมาต้องการแพ็กเกจเฉพาะที่ได้รับอนุญาตแยกต่างหาก
          </p>
          <div style="margin-bottom:12px;">
            <button type="button" disabled style="background:#475569; color:#94a3b8; border:none; padding:8px 16px; border-radius:4px; cursor:not-allowed; font-weight:bold; font-size:12px;">
              🚫 CONFIRM REPAIR (DISABLED — NO KINTONE AUTHORIZATION)
            </button>
          </div>
          <div style="font-size:11px; color:#64748b;">
            <code>CONFIRM_REPAIR_ENABLED = false</code> | <code>REPAIR_WRITE_IMPLEMENTED = false</code> | <code>KINTONE_WRITE = 0</code>
          </div>
        </div>

        <!-- Snapshot Action -->
        <div style="margin-top:15px; border-top:1px solid #334155; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
          <button type="button" id="admin-snapshot-btn" style="background:#2563eb; color:#ffffff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">
            📄 Generate Diagnostic Snapshot (สร้างภาพถ่ายการวินิจฉัย)
          </button>
          <span style="font-size:11px; color:#64748b;">Allowlist Contract • Secrets & Passwords Redacted</span>
        </div>

        <!-- Snapshot Output Container -->
        <div id="admin-snapshot-output" style="display:none; margin-top:10px;">
          <textarea readonly style="width:100%; height:160px; background:#020617; color:#38bdf8; border:1px solid #334155; border-radius:4px; font-family:monospace; font-size:11px; padding:10px; box-sizing:border-box;">${escapeHtml(JSON.stringify(snapshot, null, 2))}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Attaches interactive DOM event listeners to a rendered container element with clean delegation.
   */
  attachEventListeners(rootContainer) {
    if (!rootContainer) return;
    this.container = rootContainer;

    if (this._boundClickHandler) {
      rootContainer.removeEventListener('click', this._boundClickHandler);
    }

    this._boundClickHandler = async (e) => {
      // 1. Tab Switching
      const tabBtn = e.target.closest('.admin-tab-btn');
      if (tabBtn && !tabBtn.disabled) {
        const targetTab = tabBtn.getAttribute('data-tab');
        if (targetTab) {
          this.activeTab = targetTab;
          this.reRender();
        }
        return;
      }

      // 2. Check Employee Action
      const checkBtn = e.target.closest('#admin-btn-check-employee');
      if (checkBtn && !this.checkLoading) {
        const empCodeInput = rootContainer.querySelector('#admin-check-emp-code');
        const fyInput = rootContainer.querySelector('#admin-check-fy');
        const empCode = empCodeInput ? empCodeInput.value.trim() : '';
        const fy = fyInput ? fyInput.value.trim() : '';

        // P0-A: Fail closed if diagnostic provider is not configured
        if (!this.diagnosticProvider) {
          this.checkErrorMessage = 'PROVIDER_NOT_CONFIGURED: Production diagnostic provider is not configured.';
          this.reRender();
          return;
        }

        this.checkErrorMessage = null;
        this.checkLoading = true;
        this.reRender();

        try {
          const result = await this.diagnosticProvider.checkEmployee(empCode, fy);
          this.diagnosticContext = {
            ...this.diagnosticContext,
            ...result,
            employeeCode: empCode,
            fiscalYear: fy
          };
          this.checkLoading = false;
          this.reRender();
        } catch (err) {
          this.checkLoading = false;
          this.checkErrorMessage = err.message || 'Error occurred during employee check';
          this.reRender();
        }
        return;
      }

      // 3. Snapshot Action
      const snapshotBtn = e.target.closest('#admin-snapshot-btn');
      if (snapshotBtn) {
        const outputEl = rootContainer.querySelector('#admin-snapshot-output');
        if (outputEl) {
          outputEl.style.display = outputEl.style.display === 'none' ? 'block' : 'none';
        }
        return;
      }
    };

    rootContainer.addEventListener('click', this._boundClickHandler);
  }

  reRender() {
    if (!this.container) return;
    this.container.innerHTML = this.renderHtml();
    this.attachEventListeners(this.container);
  }
}
