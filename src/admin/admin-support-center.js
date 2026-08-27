/**
 * Admin Support Center UI Component
 * Read-only Technical Admin Diagnostic Panel for Kintone user `admin-form`.
 */

import { AdminDiagnosticModel } from './admin-diagnostic-model.js';

export class AdminSupportCenterUI {
  constructor(options = {}) {
    this.container = options.container || null;
    this.diagnosticContext = options.diagnosticContext || {};
    this.activeTab = 'health';
  }

  /**
   * Renders the complete Admin Support Center panel HTML.
   */
  renderHtml(context = {}) {
    const health = AdminDiagnosticModel.evaluateSystemHealth(context);
    const recordDiag = AdminDiagnosticModel.buildRecordDiagnostic(context.record, context);
    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({ health, recordDiag });

    const statusBadgeClass = {
      PASS: 'background:#059669; color:#ffffff;',
      WARNING: 'background:#d97706; color:#ffffff;',
      ERROR: 'background:#dc2626; color:#ffffff;',
      BLOCKED: 'background:#475569; color:#ffffff;',
      NOT_AVAILABLE: 'background:#64748b; color:#ffffff;'
    };

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
            <span style="font-size:12px; padding:6px 12px; border-radius:4px; font-weight:bold; ${statusBadgeClass[health.overallHealth] || statusBadgeClass.PASS}">
              OVERALL HEALTH: ${health.overallHealth}
            </span>
          </div>
        </div>

        <!-- Security Boundary Notice -->
        <div style="background:#1e293b; border-left:4px solid #f59e0b; padding:10px 15px; margin-bottom:15px; border-radius:0 4px 4px 0; font-size:12px; color:#cbd5e1;">
          ⚠️ <strong>ประกาศขอบเขตความปลอดภัย (Security Boundary Notice):</strong> บัญชี <code>admin-form</code> เป็นสิทธิ์ผู้ดูแลระบบเชิงเทคนิคเท่านั้น (Technical Admin Only) <strong>ไม่มีสิทธิ์ดำเนินธุรกรรมทางธุรกิจ</strong> (0 Business Workflow Authority: ไม่สามารถกดอนุมัติ, ส่งกลับ, ลงคะแนน หรือเริ่มขั้นตอนประเมินแทนพนักงาน/ผู้ประเมิน/HR ได้)
        </div>

        <!-- Section Tabs -->
        <div style="display:flex; gap:10px; border-bottom:1px solid #334155; margin-bottom:15px; padding-bottom:10px;">
          <button type="button" class="admin-tab-btn" data-tab="health" style="background:#1e293b; border:1px solid #3b82f6; color:#60a5fa; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:13px;">
            1. System Health (สถานะสุขภาพระบบ)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="record" style="background:#1e293b; border:1px solid #475569; color:#94a3b8; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:13px;">
            2. Record Diagnostic (การวินิจฉัยเรคคอร์ด)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="repair" style="background:#1e293b; border:1px solid #475569; color:#64748b; padding:8px 16px; border-radius:4px; cursor:not-allowed; font-size:13px;" disabled>
            3. Controlled Repair (🔒 ไม่ได้เปิดใช้งาน)
          </button>
        </div>

        <!-- Tab 1: System Health -->
        <div id="admin-tab-content-health" style="display:block;">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">รายการตรวจสอบตัวชี้วัดสุขภาพระบบ (15 Diagnostic Indicators)</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:10px; margin-bottom:15px;">
            ${health.items.map(item => `
              <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:10px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#f1f5f9;">${item.labelTH}</strong>
                  <span style="font-size:10px; padding:2px 6px; border-radius:3px; font-weight:bold; ${statusBadgeClass[item.status] || statusBadgeClass.NOT_AVAILABLE}">
                    ${item.status}
                  </span>
                </div>
                <div style="color:#94a3b8; font-size:11px; word-break:break-word;">
                  ${item.reason}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tab 2: Record Diagnostic -->
        <div id="admin-tab-content-record" style="display:none;">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">ข้อมูลการวินิจฉัยเรคคอร์ดปัจจุบัน (Read-Only Record Diagnostic)</h3>
          <table style="width:100%; border-collapse:collapse; font-size:12px; color:#cbd5e1; background:#1e293b; border-radius:6px; overflow:hidden;">
            <tbody>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; width:220px; color:#94a3b8;">Record ID / MBO Key:</td><td style="padding:8px 12px;">${recordDiag.recordId} / ${recordDiag.mboKey}</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Fiscal Year / Status:</td><td style="padding:8px 12px;">FY${recordDiag.fiscalYear} • ${recordDiag.currentStatus}</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Employee / Requester:</td><td style="padding:8px 12px;">Code: ${recordDiag.employeeCode} (${recordDiag.employeeName}) • Requester: ${recordDiag.requesterUser}</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Routing Key / Topology:</td><td style="padding:8px 12px;">Key: ${recordDiag.routingKey} (Section: ${recordDiag.sectionCode}, Team: ${recordDiag.teamName}) • ${recordDiag.routingResult.topology || 'N/A'}</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Appraiser Sequence (1..4):</td><td style="padding:8px 12px;">1st: ${recordDiag.appraiser1} | 2nd: ${recordDiag.appraiser2} | 3rd: ${recordDiag.appraiser3} | 4th: ${recordDiag.appraiser4} (Expected Count: ${recordDiag.expectedAppraiserCount})</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Active Appraiser Slot:</td><td style="padding:8px 12px; color:#38bdf8; font-weight:bold;">${recordDiag.activeAppraiserSlot !== 'N/A' ? `Slot ${recordDiag.activeAppraiserSlot}` : 'Not in Appraiser Evaluation stage'}</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Profile Code / Ratios:</td><td style="padding:8px 12px;">${recordDiag.profileCode} (Part A: ${recordDiag.partAWeight}% / Part B: ${recordDiag.partBWeight}%)</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Objective Count & Validity:</td><td style="padding:8px 12px;">Count: ${recordDiag.objectiveCount} (${recordDiag.isObjCountValid ? 'VALID' : 'INVALID/FAIL-CLOSED'})</td></tr>
              <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Viewer Role Resolver:</td><td style="padding:8px 12px;">Resolved: <strong style="color:#f59e0b;">${recordDiag.resolvedViewerRole}</strong></td></tr>
              <tr><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Build Version:</td><td style="padding:8px 12px;">v${recordDiag.buildVersion.version} (${recordDiag.buildVersion.commitSha.substring(0, 7)})</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Tab 3: Controlled Repair Placeholder -->
        <div id="admin-tab-content-repair" style="display:none; background:#1e293b; padding:15px; border-radius:6px; border:1px solid #334155;">
          <h3 style="font-size:14px; color:#f59e0b; margin-top:0;">🔒 Controlled Repair Contract Placeholder</h3>
          <p style="font-size:12px; color:#94a3b8; margin:0 0 10px 0;">
            สัญญาการแก้ไขฉุกเฉินที่มีการควบคุม (Controlled Repair) ยังไม่ได้ถูกเปิดใช้งานในแพ็กเกจนี้ การซ่อมแซมเรคคอร์ดหรือสคีมาต้องการแพ็กเกจเฉพาะที่ได้รับอนุญาตแยกต่างหาก
          </p>
          <div style="font-size:11px; color:#64748b;">
            <code>REPAIR_WRITE_IMPLEMENTED = NO</code> | <code>KINTONE_WRITE = 0</code> | <code>WORKFLOW_ACTION = 0</code>
          </div>
        </div>

        <!-- Snapshot Action -->
        <div style="margin-top:15px; border-top:1px solid #334155; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
          <button type="button" id="admin-snapshot-btn" style="background:#2563eb; color:#ffffff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">
            📄 Generate Diagnostic Snapshot (สร้างภาพถ่ายการวินิจฉัย)
          </button>
          <span style="font-size:11px; color:#64748b;">Sanitized • Secrets & Passwords Redacted</span>
        </div>

        <!-- Snapshot Output Container -->
        <div id="admin-snapshot-output" style="display:none; margin-top:10px;">
          <textarea readonly style="width:100%; height:140px; background:#020617; color:#38bdf8; border:1px solid #334155; border-radius:4px; font-family:monospace; font-size:11px; padding:10px; box-sizing:border-box;">${JSON.stringify(snapshot, null, 2)}</textarea>
        </div>
      </div>
    `;
  }
}
