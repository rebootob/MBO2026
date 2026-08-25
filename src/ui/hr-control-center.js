/**
 * MBO 2026 — Secure HR Control Center MVP UI Component
 * 
 * Binds strictly to the HR Control Center App on app.record.index.show.
 * GET-Only browser runtime source from Apps 794, 795, 796, 797, 798 using current user session.
 * EXCLUDES all confidential fields (scores, ratings, comments, attachments).
 */

export const ALLOWED_MONITORING_FIELDS_794 = Object.freeze([
  '$id',
  'Fiscal_Year',
  'Employee_Code',
  'Employee_Name',
  'Employee_Name_TH',
  'Employee_Department',
  'Employee_Section',
  'Employee_Position',
  'Status'
]);

export const CONFIDENTIAL_FIELDS_PROHIBITED = Object.freeze([
  'PartA_Weighted_Score',
  'PartB_Weighted_Score',
  'Final_Confidential_Score',
  'Manager_Comment',
  'GM_Comment',
  'Self_Comment',
  'MidYear_Attachment_1',
  'Final_Attachment_1'
]);

export function renderHrControlCenterHtml({
  evaluations = [],
  health = { app794Count: 0, routingCoverage: '0/12', configCount: 0, hoshinCount: 0, archiveCount: 0 },
  warnings = []
} = {}) {
  const total = evaluations.length;
  const completed = evaluations.filter(e => e.Status?.value === 'COMPLETED' || e.Status?.value === 'APPROVED').length;
  const inProgress = evaluations.filter(e => e.Status?.value && e.Status.value !== 'COMPLETED' && e.Status.value !== 'APPROVED' && e.Status.value !== 'REJECTED').length;
  const needAttention = evaluations.filter(e => e.Status?.value === 'REJECTED' || e.Status?.value === 'SUBMITTED').length;

  const warningHtml = warnings.length > 0
    ? warnings.map(w => `<div class="hrcc-warning-box">⚠️ <strong>Warning:</strong> ${w}</div>`).join('')
    : '';

  const rowsHtml = evaluations.map(e => {
    const id = e.$id?.value || '';
    const code = e.Employee_Code?.value || '-';
    const name = e.Employee_Name?.value || e.Employee_Name_TH?.value || '-';
    const dept = e.Employee_Department?.value || '-';
    const sec = e.Employee_Section?.value || '-';
    const pos = e.Employee_Position?.value || '-';
    const status = e.Status?.value || '-';
    return `<tr>
      <td>${code}</td>
      <td>${name}</td>
      <td>${dept}</td>
      <td>${sec}</td>
      <td>${pos}</td>
      <td><span class="hrcc-badge">${status}</span></td>
      <td><a class="hrcc-link" href="/k/794/show#record=${id}" target="_blank">Open Record #${id}</a></td>
    </tr>`;
  }).join('');

  return `
<div class="hrcc-container">
  <div class="hrcc-header">
    <h1 class="hrcc-title">MBO 2026 — HR Control Center</h1>
    <span class="hrcc-badge">SECURE READ-ONLY MVP</span>
  </div>

  ${warningHtml}

  <div class="hrcc-health-panel">
    <strong>System Health & Inventory:</strong> App 794 Count: ${health.app794Count} | Routing Coverage: ${health.routingCoverage} | Scoring Configs: ${health.configCount} | Hoshin Master: ${health.hoshinCount} | Archive Snapshots: ${health.archiveCount}
  </div>

  <div class="hrcc-kpi-grid">
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">Total Evaluations</div>
      <div class="hrcc-kpi-value">${total}</div>
    </div>
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">Completed / Approved</div>
      <div class="hrcc-kpi-value">${completed}</div>
    </div>
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">In Progress</div>
      <div class="hrcc-kpi-value">${inProgress}</div>
    </div>
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">Need Attention</div>
      <div class="hrcc-kpi-value">${needAttention}</div>
    </div>
  </div>

  <table class="hrcc-table">
    <thead>
      <tr>
        <th>Code</th>
        <th>Employee Name</th>
        <th>Department</th>
        <th>Section</th>
        <th>Position</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="7">No transactional records found.</td></tr>'}
    </tbody>
  </table>
</div>
`;
}

export function buildHrccMonitoringQuery(fields = ALLOWED_MONITORING_FIELDS_794) {
  // Ensure no confidential field is ever requested
  for (const cf of CONFIDENTIAL_FIELDS_PROHIBITED) {
    if (fields.includes(cf)) {
      throw new Error(`SECURITY VIOLATION: Confidential field "${cf}" prohibited in HRCC monitoring query.`);
    }
  }
  return fields.join(',');
}
