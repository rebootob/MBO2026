/**
 * MBO 2026 — Secure HR Control Center MVP UI Component & Runtime
 * 
 * Binds strictly to HR Control Center App 800 on app.record.index.show.
 * GET-Only browser runtime source from Apps 794, 795, 796, 797, 798 using current user session.
 * Whitelist-based field security: ONLY non-confidential monitoring fields allowed.
 * HTML escaping on all rendered strings.
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

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildHrccMonitoringQuery(fields = ALLOWED_MONITORING_FIELDS_794) {
  if (!Array.isArray(fields)) {
    throw new Error('SECURITY VIOLATION: Fields parameter must be an array.');
  }
  for (const f of fields) {
    if (!ALLOWED_MONITORING_FIELDS_794.includes(f)) {
      throw new Error(`SECURITY VIOLATION: Non-whitelisted field "${f}" is prohibited in HRCC monitoring query.`);
    }
  }
  return fields.join(',');
}

export function renderHrControlCenterHtml({
  evaluations = [],
  health = { app794Count: 0, routingCoverage: '0/12', configCount: 0, hoshinCount: 0, archiveCount: 0 },
  warnings = [],
  filters = { fy: '', dept: '', status: '' }
} = {}) {
  const total = evaluations.length;
  const completed = evaluations.filter(e => e.Status?.value === 'COMPLETED' || e.Status?.value === 'APPROVED').length;
  const inProgress = evaluations.filter(e => e.Status?.value && e.Status.value !== 'COMPLETED' && e.Status.value !== 'APPROVED' && e.Status.value !== 'REJECTED').length;
  const needAttention = evaluations.filter(e => e.Status?.value === 'REJECTED' || e.Status?.value === 'SUBMITTED').length;

  const warningHtml = warnings.length > 0
    ? warnings.map(w => `<div class="hrcc-warning-box">⚠️ <strong>Warning:</strong> ${escapeHtml(w)}</div>`).join('')
    : '';

  const rowsHtml = evaluations.map(e => {
    const id = escapeHtml(e.$id?.value || '');
    const code = escapeHtml(e.Employee_Code?.value || '-');
    const name = escapeHtml(e.Employee_Name?.value || e.Employee_Name_TH?.value || '-');
    const dept = escapeHtml(e.Employee_Department?.value || '-');
    const sec = escapeHtml(e.Employee_Section?.value || '-');
    const pos = escapeHtml(e.Employee_Position?.value || '-');
    const status = escapeHtml(e.Status?.value || '-');
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
    <strong>System Health & Inventory:</strong> App 794 Count: ${escapeHtml(health.app794Count)} | Routing Coverage: ${escapeHtml(health.routingCoverage)} | Scoring Configs: ${escapeHtml(health.configCount)} | Hoshin Master: ${escapeHtml(health.hoshinCount)} | Archive Snapshots: ${escapeHtml(health.archiveCount)}
  </div>

  <div class="hrcc-quick-links" style="margin-bottom: 1rem;">
    <strong>Quick Links:</strong>
    <a class="hrcc-link" href="/k/794/" target="_blank" style="margin-right: 1rem;">App 794 (Transaction Core)</a>
    <a class="hrcc-link" href="/k/795/" target="_blank" style="margin-right: 1rem;">App 795 (Routing Master)</a>
    <a class="hrcc-link" href="/k/796/" target="_blank" style="margin-right: 1rem;">App 796 (Scoring Master)</a>
    <a class="hrcc-link" href="/k/797/" target="_blank" style="margin-right: 1rem;">App 797 (Hoshin Master)</a>
    <a class="hrcc-link" href="/k/798/" target="_blank">App 798 (Revision Archive)</a>
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

// Auto-initializer for Kintone browser environment
if (typeof kintone !== 'undefined' && kintone.events) {
  kintone.events.on('app.record.index.show', async (event) => {
    // Registered HRCC App ID is 800
    const HRCC_APP_ID = 800;
    if (kintone.app.getId() !== HRCC_APP_ID) return event;

    const headerSpace = kintone.app.getHeaderSpaceElement();
    if (!headerSpace) return event;

    try {
      // 1. Fetch App 794 monitoring fields
      const queryFields = buildHrccMonitoringQuery();
      const res794 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {
        app: 794,
        fields: queryFields.split(',')
      });
      const evaluations = res794.records || [];

      // 2. Fetch inventory health counts from 795, 796, 797, 798
      const res795 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: 795, query: 'limit 1' }).catch(() => ({ records: [] }));
      const res796 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: 796, query: 'limit 1' }).catch(() => ({ records: [] }));
      const res797 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: 797, query: 'limit 1' }).catch(() => ({ records: [] }));
      const res798 = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: 798, query: 'limit 1' }).catch(() => ({ records: [] }));

      const warnings = [];
      const routingCount = res795.records?.length || 0;
      const configCount = res796.records?.length || 0;
      const hoshinCount = res797.records?.length || 0;

      if (routingCount < 12) warnings.push(`Routing Master App 795 requester coverage is incomplete (current: ${routingCount}/12).`);
      if (configCount === 0) warnings.push('Scoring Master App 796 has 0 active baseline records.');
      if (hoshinCount === 0) warnings.push('Hoshin Master App 797 has 0 active Hoshin records.');

      const health = {
        app794Count: evaluations.length,
        routingCoverage: `${routingCount}/12`,
        configCount,
        hoshinCount,
        archiveCount: res798.records?.length || 0
      };

      headerSpace.innerHTML = renderHrControlCenterHtml({ evaluations, health, warnings });
    } catch (err) {
      headerSpace.innerHTML = `<div class="hrcc-container" style="color:red;">❌ Error loading HR Control Center: ${escapeHtml(err.message)}</div>`;
    }

    return event;
  });
}
