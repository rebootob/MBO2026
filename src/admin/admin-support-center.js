/**
 * Admin Support Center UI Component (Stage 2 Hardened)
 * Read-only Technical Admin Diagnostic Panel for Kintone user `admin-form`.
 */

import { AdminDiagnosticModel, escapeHtml } from './admin-diagnostic-model.js';

export class AdminSupportCenterUI {
  constructor(options = {}) {
    this.container = options.container || null;
    this.diagnosticContext = options.diagnosticContext || {};
    this.activeTab = options.activeTab || 'health';
    this.employeeProvider = options.employeeProvider || AdminSupportCenterUI.defaultEmployeeProvider;
  }

  /**
   * Default local employee diagnostic provider for testing/checking employee lookup.
   */
  static defaultEmployeeProvider(empCode, fiscalYear) {
    if (!empCode) {
      return {
        employeeCode: 'NOT_EVIDENCED',
        fiscalYear: fiscalYear || 'NOT_EVIDENCED',
        recordId: 'NOT_EVIDENCED',
        mboKey: 'NOT_EVIDENCED',
        employeeName: 'NOT_EVIDENCED',
        requesterUser: 'NOT_EVIDENCED',
        currentStatus: 'NOT_EVIDENCED',
        routingKey: 'NOT_EVIDENCED',
        sectionCode: 'NOT_EVIDENCED',
        teamName: 'NOT_EVIDENCED',
        appraiser1: 'NOT_EVIDENCED',
        appraiser2: 'NOT_EVIDENCED',
        appraiser3: 'NOT_EVIDENCED',
        appraiser4: 'NOT_EVIDENCED'
      };
    }

    const clean = String(empCode).trim();

    const mockCatalog = {
      '0118': {
        employeeCode: '0118',
        fiscalYear: fiscalYear || '2026',
        recordId: '101',
        mboKey: 'MBO_2026_0118',
        employeeName: 'Technical Service Chief',
        requesterUser: '0118',
        currentStatus: '01 Draft Objective',
        routingKey: 'TMT1',
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
        authoritativeProfile: { code: 'PROF_STAFF_CHIEF', partAWeight: 70, partBWeight: 30 },
        authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm01', appraiser2: 'g01' }
      },
      '0111': {
        employeeCode: '0111',
        fiscalYear: fiscalYear || '2026',
        recordId: '102',
        mboKey: 'MBO_2026_0111',
        employeeName: 'Assistant Manager 0111',
        requesterUser: '0111',
        currentStatus: '01 Draft Objective',
        routingKey: 'TMS1',
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
        authoritativeProfile: { code: 'PROF_ASST_MGR', partAWeight: 60, partBWeight: 40 },
        authoritativeRoute: { topology: 'M1_G1', appraiserCount: 2, appraiser1: 'm02', appraiser2: 'g01' }
      },
      'DGM001': {
        employeeCode: 'DGM001',
        fiscalYear: fiscalYear || '2026',
        recordId: '103',
        mboKey: 'MBO_2026_DGM001',
        employeeName: 'Deputy General Manager',
        requesterUser: 'DGM001',
        currentStatus: '01 Draft Objective',
        routingKey: 'POSITION_DGM',
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
        authoritativeProfile: { code: 'PROF_DGM', partAWeight: 50, partBWeight: 50 },
        authoritativeRoute: { topology: 'M1_ONLY', appraiserCount: 1, appraiser1: 'president_user' }
      }
    };

    return mockCatalog[clean] || {
      employeeCode: clean,
      fiscalYear: fiscalYear || 'NOT_EVIDENCED',
      recordId: 'NOT_EVIDENCED',
      mboKey: `MBO_${fiscalYear || 'FY'}_${clean}`,
      employeeName: `Employee ${clean}`,
      requesterUser: clean,
      currentStatus: '01 Draft Objective',
      routingKey: 'NOT_EVIDENCED',
      sectionCode: 'NOT_EVIDENCED',
      teamName: 'NOT_EVIDENCED',
      appraiser1: 'NOT_EVIDENCED',
      appraiser2: 'NOT_EVIDENCED',
      appraiser3: 'NOT_EVIDENCED',
      appraiser4: 'NOT_EVIDENCED'
    };
  }

  /**
   * Helper to return truth-based indicator icons for UI tables.
   * FIX: Prevents false green checkmarks for NOT_EVIDENCED / INCOMPLETE_EVIDENCE states.
   */
  static getMatchIcon(status, isMatch) {
    if (status === 'NOT_EVIDENCED' || status === 'NOT_AVAILABLE' || status === null || status === undefined) {
      return '<span style="color:#94a3b8; font-size:12px;">⚪ NOT_EVIDENCED</span>';
    }
    if (status === 'PASS' || isMatch === true) {
      return '<span style="color:#10b981; font-size:12px;">✅ MATCH</span>';
    }
    return '<span style="color:#ef4444; font-size:12px;">❌ MISMATCH</span>';
  }

  /**
   * Renders the complete Admin Support Center panel HTML with HTML Output Escaping.
   */
  renderHtml(context = {}) {
    const activeCtx = { ...this.diagnosticContext, ...context };

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

    const getIcon = AdminSupportCenterUI.getMatchIcon;

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
          <div>
            <span style="font-size:12px; padding:6px 12px; border-radius:4px; font-weight:bold; ${statusBadgeClass[health.overallHealth] || statusBadgeClass.INCOMPLETE_EVIDENCE}">
              OVERALL HEALTH: ${escapeHtml(health.overallHealth)}
            </span>
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
                <input type="text" id="admin-check-emp-code" value="${escapeHtml(recordDiag.employeeCode)}" style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 10px; border-radius:4px; font-size:12px; width:160px;" />
              </div>
              <div>
                <label style="font-size:11px; color:#94a3b8; display:block; margin-bottom:4px;">Fiscal Year / ปีงบประมาณ</label>
                <input type="text" id="admin-check-fy" value="${escapeHtml(recordDiag.fiscalYear)}" style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 10px; border-radius:4px; font-size:12px; width:100px;" />
              </div>
              <div style="margin-top:16px;">
                <button type="button" id="admin-btn-check-employee" style="background:#2563eb; color:#ffffff; border:none; padding:7px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">
                  🔍 CHECK EMPLOYEE
                </button>
              </div>
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:12px; color:#cbd5e1; background:#0f172a; border-radius:6px; overflow:hidden;">
              <tbody>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; width:220px; color:#94a3b8;">Record ID / MBO Key:</td><td style="padding:8px 12px;">${escapeHtml(recordDiag.recordId)} / ${escapeHtml(recordDiag.mboKey)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Employee Name / Requester:</td><td style="padding:8px 12px;">${escapeHtml(recordDiag.employeeName)} • Requester: ${escapeHtml(recordDiag.requesterUser)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Current Workflow Status:</td><td style="padding:8px 12px; color:#38bdf8; font-weight:bold;">${escapeHtml(recordDiag.currentStatus)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Routing Key / Topology:</td><td style="padding:8px 12px;">Key: ${escapeHtml(recordDiag.routingKey)} • ${escapeHtml(recordDiag.sectionCode)} | ${escapeHtml(recordDiag.teamName)}</td></tr>
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
                  <td style="padding:4px;">${getIcon(profileMatch.status, profileMatch.expectedProfileCode === profileMatch.actualProfileCode)}</td>
                </tr>
                <tr>
                  <td style="padding:4px; font-weight:bold;">Part A / Part B Weight</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.expectedPartAWeight)}% / ${escapeHtml(profileMatch.expectedPartBWeight)}%</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.actualPartAWeight)}% / ${escapeHtml(profileMatch.actualPartBWeight)}%</td>
                  <td style="padding:4px;">${getIcon(profileMatch.status, profileMatch.expectedPartAWeight === profileMatch.actualPartAWeight)}</td>
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
                  <td style="padding:4px;">${getIcon(routeMatch.status, routeMatch.expectedRoutingKey === routeMatch.actualRoutingKey)}</td>
                </tr>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Routing Topology</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedTopology)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualTopology)}</td>
                  <td style="padding:4px;">${getIcon(routeMatch.status, routeMatch.expectedTopology === routeMatch.actualTopology)}</td>
                </tr>
                <tr>
                  <td style="padding:4px; font-weight:bold;">Appraiser Count</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedAppraiserCount)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualAppraiserCount)}</td>
                  <td style="padding:4px;">${getIcon(routeMatch.status, routeMatch.expectedAppraiserCount === routeMatch.actualAppraiserCount)}</td>
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
   * Attaches interactive DOM event listeners to a rendered container element.
   * Handles tab switching, Check Employee lookup, and snapshot toggling locally without Kintone writes.
   */
  attachEventListeners(rootContainer) {
    if (!rootContainer) return;

    // 1. Tab Switching
    const tabButtons = rootContainer.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        if (!targetTab || btn.disabled) return;
        this.activeTab = targetTab;

        // Hide all tab contents
        const contents = ['health', 'check', 'validation', 'candidate', 'repair'];
        contents.forEach(id => {
          const el = rootContainer.querySelector(`#admin-tab-content-${id}`);
          if (el) el.style.display = id === targetTab ? 'block' : 'none';
        });

        // Highlight tab buttons
        tabButtons.forEach(b => {
          const isTarget = b.getAttribute('data-tab') === targetTab;
          if (b.disabled) return;
          b.style.background = isTarget ? '#1e40af' : '#1e293b';
          b.style.color = isTarget ? '#ffffff' : '#60a5fa';
        });
      });
    });

    // 2. Check Employee Action
    const checkBtn = rootContainer.querySelector('#admin-btn-check-employee');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        const empCodeInput = rootContainer.querySelector('#admin-check-emp-code');
        const fyInput = rootContainer.querySelector('#admin-check-fy');
        const empCode = empCodeInput ? empCodeInput.value : '';
        const fy = fyInput ? fyInput.value : '';

        const recordData = this.employeeProvider(empCode, fy);
        this.diagnosticContext = {
          ...this.diagnosticContext,
          ...recordData,
          employeeCode: empCode,
          fiscalYear: fy
        };

        // Re-render HTML into rootContainer
        rootContainer.innerHTML = this.renderHtml();
        this.attachEventListeners(rootContainer);
      });
    }

    // 3. Snapshot Toggle Action
    const snapshotBtn = rootContainer.querySelector('#admin-snapshot-btn');
    const snapshotOutput = rootContainer.querySelector('#admin-snapshot-output');
    if (snapshotBtn && snapshotOutput) {
      snapshotBtn.addEventListener('click', () => {
        const isHidden = snapshotOutput.style.display === 'none';
        snapshotOutput.style.display = isHidden ? 'block' : 'none';
      });
    }
  }
}
