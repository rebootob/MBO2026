import { MboKintoneAuthAdapter } from './mbo-kintone-auth-adapter.js';

/**
 * MBO 2026 — Secure HR Control Center UI Component & Runtime
 *
 * Bound strictly to HR Control Center App 800 (or injected hrControlCenterAppId) on app.record.index.show.
 * Browser runtime for monitoring and authorized administration.
 * Whitelist-based field security, HTML escaping, bounded pagination, functional filtering,
 * pipeline aggregation, real totalCount inventory parsing, and unavailable-source handling.
 */

export const DEFAULT_APP_IDS = Object.freeze({
  mboV2AppId: 794,
  routingMasterAppId: 795,
  scoringConfigMasterAppId: 796,
  hoshinMasterAppId: 797,
  revisionArchiveAppId: 798,
  hrControlCenterAppId: 800,
  credentialAppId: 801
});

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

export async function fetchAllApp794Records(kintoneApi, appId = 794, maxPages = 20) {
  const queryFields = buildHrccMonitoringQuery();
  const fields = queryFields.split(',');
  let allRecords = [];
  let offset = 0;
  const limit = 500;
  let truncated = false;

  for (let page = 0; page < maxPages; page++) {
    const query = `limit ${limit} offset ${offset}`;
    const res = await kintoneApi('/k/v1/records.json', 'GET', { app: appId, fields, query });
    const records = res.records || [];
    allRecords = allRecords.concat(records);
    if (records.length < limit) {
      break;
    }
    offset += limit;
    if (page === maxPages - 1 && records.length === limit) {
      truncated = true;
    }
  }

  return { records: allRecords, truncated };
}

export async function fetchHealthCount(kintoneApi, appId, queryFilter = '') {
  try {
    const query = queryFilter ? `${queryFilter} limit 1` : 'limit 1';
    const res = await kintoneApi('/k/v1/records.json', 'GET', { app: appId, query, totalCount: true });
    const count = res.totalCount !== undefined && res.totalCount !== null ? Number(res.totalCount) : (res.records?.length || 0);
    return { available: true, count, error: null };
  } catch (err) {
    return { available: false, count: null, error: err.message || 'Access denied / unavailable' };
  }
}

export function aggregatePipelineByStatus(evaluations = []) {
  const pipeline = {
    DRAFT: 0,
    SUBMITTED: 0,
    IN_REVIEW: 0,
    COMPLETED: 0,
    REJECTED: 0,
    OTHER: 0
  };

  for (const e of evaluations) {
    const st = e.Status?.value || 'UNKNOWN';
    if (st === 'DRAFT') pipeline.DRAFT++;
    else if (st === 'SUBMITTED') pipeline.SUBMITTED++;
    else if (st.includes('APPROV') || st.includes('REVIEW')) pipeline.IN_REVIEW++;
    else if (st === 'COMPLETED' || st === 'APPROVED') pipeline.COMPLETED++;
    else if (st === 'REJECTED') pipeline.REJECTED++;
    else pipeline.OTHER++;
  }

  return pipeline;
}

export function applyHrccFilters(evaluations = [], { fy = '', dept = '', sec = '', status = '' } = {}) {
  return evaluations.filter(e => {
    if (fy && e.Fiscal_Year?.value !== fy) return false;
    if (dept && e.Employee_Department?.value !== dept) return false;
    if (sec && e.Employee_Section?.value !== sec) return false;
    if (status && e.Status?.value !== status) return false;
    return true;
  });
}

export function renderHrControlCenterHtml({
  evaluations = [],
  allEvaluations = [],
  health = {},
  warnings = [],
  filters = { fy: '', dept: '', sec: '', status: '' },
  appIds = DEFAULT_APP_IDS
} = {}) {
  const normHealth = {
    app794Count: health.app794Count || 0,
    routing: health.routing || { available: true, count: health.routingCoverage || 0 },
    scoring: health.scoring || { available: true, count: health.configCount || 0 },
    hoshin: health.hoshin || { available: true, count: health.hoshinCount || 0 },
    archive: health.archive || { available: true, count: health.archiveCount || 0 }
  };
  const filtered = applyHrccFilters(evaluations, filters);
  const total = filtered.length;
  const completed = filtered.filter(e => e.Status?.value === 'COMPLETED' || e.Status?.value === 'APPROVED').length;
  const inProgress = filtered.filter(e => e.Status?.value && e.Status.value !== 'COMPLETED' && e.Status.value !== 'APPROVED' && e.Status.value !== 'REJECTED').length;
  const needAttention = filtered.filter(e => e.Status?.value === 'REJECTED' || e.Status?.value === 'SUBMITTED').length;

  const pipeline = aggregatePipelineByStatus(filtered);

  // Extract unique filter options from allEvaluations
  const fys = Array.from(new Set(allEvaluations.map(e => e.Fiscal_Year?.value).filter(Boolean))).sort();
  const depts = Array.from(new Set(allEvaluations.map(e => e.Employee_Department?.value).filter(Boolean))).sort();
  const secs = Array.from(new Set(allEvaluations.map(e => e.Employee_Section?.value).filter(Boolean))).sort();
  const statuses = Array.from(new Set(allEvaluations.map(e => e.Status?.value).filter(Boolean))).sort();

  const warningHtml = warnings.length > 0
    ? warnings.map(w => `<div class="hrcc-warning-box">⚠️ <strong>Warning:</strong> ${escapeHtml(w)}</div>`).join('')
    : '';

  const formatHealthText = (h, suffix = '') => {
    if (!h.available) return '<span style="color:red;">Unavailable / Access denied</span>';
    return `${escapeHtml(h.count)}${suffix}`;
  };

  const routingText = normHealth.routing.available ? `${escapeHtml(normHealth.routing.count)}/12` : '<span style="color:red;">Unavailable / Access denied</span>';

  const rowsHtml = filtered.map(e => {
    const id = escapeHtml(e.$id?.value || '');
    const code = escapeHtml(e.Employee_Code?.value || '-');
    const name = escapeHtml(e.Employee_Name?.value || e.Employee_Name_TH?.value || '-');
    const deptVal = escapeHtml(e.Employee_Department?.value || '-');
    const secVal = escapeHtml(e.Employee_Section?.value || '-');
    const posVal = escapeHtml(e.Employee_Position?.value || '-');
    const statusVal = escapeHtml(e.Status?.value || '-');
    return `<tr>
      <td>${code}</td>
      <td>${name}</td>
      <td>${deptVal}</td>
      <td>${secVal}</td>
      <td>${posVal}</td>
      <td><span class="hrcc-badge">${statusVal}</span></td>
      <td><a class="hrcc-link" href="/k/${appIds.mboV2AppId}/show#record=${id}" target="_blank">Open Record #${id}</a></td>
    </tr>`;
  }).join('');

  return `
<div class="hrcc-container">
  <div class="hrcc-header">
    <h1 class="hrcc-title">MBO 2026 — HR Control Center</h1>
    <span class="hrcc-badge">SECURE HR CONTROL CENTER</span>
  </div>

  ${warningHtml}

  <div class="hrcc-health-panel">
    <strong>System Health & Inventory:</strong>
    App ${appIds.mboV2AppId} Count: ${escapeHtml(normHealth.app794Count)} |
    App ${appIds.routingMasterAppId} Active Routings: ${routingText} |
    App ${appIds.scoringConfigMasterAppId} Published Configs: ${formatHealthText(normHealth.scoring)} |
    App ${appIds.hoshinMasterAppId} Ready Hoshins: ${formatHealthText(normHealth.hoshin)} |
    App ${appIds.revisionArchiveAppId} Archive Snapshots: ${formatHealthText(normHealth.archive)}
  </div>

  <div class="hrcc-quick-links" style="margin-bottom: 1rem;">
    <strong>Quick Links:</strong>
    <a class="hrcc-link" href="/k/${appIds.mboV2AppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.mboV2AppId} (Transaction Core)</a>
    <a class="hrcc-link" href="/k/${appIds.routingMasterAppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.routingMasterAppId} (Routing Master)</a>
    <a class="hrcc-link" href="/k/${appIds.scoringConfigMasterAppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.scoringConfigMasterAppId} (Scoring Master)</a>
    <a class="hrcc-link" href="/k/${appIds.hoshinMasterAppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.hoshinMasterAppId} (Hoshin Master)</a>
    <a class="hrcc-link" href="/k/${appIds.revisionArchiveAppId}/" target="_blank">App ${appIds.revisionArchiveAppId} (Revision Archive)</a>
  </div>

  <!-- Filters -->
  <div class="hrcc-filter-bar" style="background:#f4f6f8; padding:0.75rem; border-radius:6px; margin-bottom:1rem; display:flex; gap:1rem; flex-wrap:wrap; align-items:center;">
    <strong>Filters:</strong>
    <label>FY:
      <select id="hrcc-filter-fy" class="hrcc-select">
        <option value="">All FYs</option>
        ${fys.map(f => `<option value="${escapeHtml(f)}" ${filters.fy === f ? 'selected' : ''}>${escapeHtml(f)}</option>`).join('')}
      </select>
    </label>

    <label>Department:
      <select id="hrcc-filter-dept" class="hrcc-select">
        <option value="">All Departments</option>
        ${depts.map(d => `<option value="${escapeHtml(d)}" ${filters.dept === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
      </select>
    </label>

    <label>Section:
      <select id="hrcc-filter-sec" class="hrcc-select">
        <option value="">All Sections</option>
        ${secs.map(s => `<option value="${escapeHtml(s)}" ${filters.sec === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
      </select>
    </label>

    <label>Status:
      <select id="hrcc-filter-status" class="hrcc-select">
        <option value="">All Statuses</option>
        ${statuses.map(st => `<option value="${escapeHtml(st)}" ${filters.status === st ? 'selected' : ''}>${escapeHtml(st)}</option>`).join('')}
      </select>
    </label>
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

  <!-- Pipeline Breakdown -->
  <div class="hrcc-pipeline-bar" style="background:#eef2f5; padding:0.75rem; border-radius:6px; margin-bottom:1rem;">
    <strong>Pipeline Breakdown:</strong>
    Draft: <strong>${pipeline.DRAFT}</strong> |
    Submitted: <strong>${pipeline.SUBMITTED}</strong> |
    In Review: <strong>${pipeline.IN_REVIEW}</strong> |
    Completed: <strong>${pipeline.COMPLETED}</strong> |
    Rejected: <strong>${pipeline.REJECTED}</strong>
  </div>

  <!-- Reset MBO Password Panel -->
  <div class="hrcc-reset-panel" style="background:#ffffff; border:1px solid #e5e7eb; border-radius:0.375rem; padding:1.25rem; margin-bottom:1.5rem;">
    <h2 class="hrcc-reset-title" style="font-size:1.125rem; font-weight:700; margin-top:0; margin-bottom:0.75rem; color:#111827;">
      🔑 รีเซ็ตรหัสผ่าน MBO / Reset MBO Password
    </h2>
    <p class="hrcc-reset-help" style="font-size:0.875rem; color:#4b5563; margin-bottom:1rem; line-height:1.5;">
      สำหรับผู้ใช้ที่มีสิทธิ์ HR Admin หรือ Technical Recovery: ป้อน Employee Code เพื่อรีเซ็ตรหัสผ่าน <strong>MBO Credentials (App 801)</strong> เป็นรหัสผ่านเริ่มต้น (เท่ากับ Employee Code)<br>
      <span style="color:#b91c1c; font-weight:600;">⚠️ หมายเหตุ: การดำเนินการนี้จะรีเซ็ตเฉพาะรหัสผ่าน MBO ในระบบ MBO เท่านั้น ไม่กระทบและไม่ได้รีเซ็ตรหัสผ่านบัญชี Kintone/cybozu หลักของผู้ใช้</span>
    </p>
    <div class="hrcc-reset-form" style="display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-end;">
      <label style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.875rem; font-weight:600;">
        Employee Code:
        <input type="text" id="hrcc-reset-emp-code" class="hrcc-input" placeholder="e.g. EMP001" style="padding:0.5rem; border:1px solid #d1d5db; border-radius:0.25rem; width:180px;">
      </label>
      <label style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.875rem; font-weight:600;">
        Confirm Employee Code:
        <input type="text" id="hrcc-reset-emp-confirm" class="hrcc-input" placeholder="Re-enter Employee Code" style="padding:0.5rem; border:1px solid #d1d5db; border-radius:0.25rem; width:180px;">
      </label>
      <button type="button" id="hrcc-reset-btn" class="hrcc-btn-danger" style="padding:0.5rem 1.25rem; background-color:#dc2626; color:#ffffff; font-weight:600; border:none; border-radius:0.25rem; cursor:pointer;">
        Reset MBO Password
      </button>
    </div>
    <div id="hrcc-reset-feedback" style="margin-top:1rem; font-size:0.875rem; display:none;"></div>
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
    <tbody id="hrcc-table-body">
      ${rowsHtml || '<tr><td colspan="7">No matching transactional records found.</td></tr>'}
    </tbody>
  </table>
</div>
`;
}

export function createHrccRuntime({
  kintoneApi,
  onResetMboPassword,
  appIds = DEFAULT_APP_IDS,
  getAppId = () => typeof kintone !== 'undefined' ? kintone.app.getId() : null,
  getHeaderSpaceElement = () => typeof kintone !== 'undefined' ? kintone.app.getHeaderSpaceElement() : null
} = {}) {
  return async function hrccEventHandler(event) {
    const currentAppId = getAppId();
    if (currentAppId !== appIds.hrControlCenterAppId) return event;

    const headerSpace = getHeaderSpaceElement();
    if (!headerSpace) return event;

    try {
      // 1. Bounded pagination fetch for App 794
      const { records: evaluations, truncated } = await fetchAllApp794Records(kintoneApi, appIds.mboV2AppId);

      // 2. Health count GETs with exact business query filters using totalCount: true
      const health795 = await fetchHealthCount(kintoneApi, appIds.routingMasterAppId, 'Active = "Active"');
      const health796 = await fetchHealthCount(kintoneApi, appIds.scoringConfigMasterAppId, 'Config_Status = "PUBLISHED"');
      const health797 = await fetchHealthCount(kintoneApi, appIds.hoshinMasterAppId, 'Ready_For_MBO = "YES"');
      const health798 = await fetchHealthCount(kintoneApi, appIds.revisionArchiveAppId, '');

      const warnings = [];
      if (truncated) {
        warnings.push(`App ${appIds.mboV2AppId} record count exceeded maximum pagination limit (10,000 records). Some records may not be displayed.`);
      }

      if (!health795.available) warnings.push(`App ${appIds.routingMasterAppId} (Routing Master) is unavailable or access denied.`);
      else if (health795.count < 12) warnings.push(`Routing Master App ${appIds.routingMasterAppId} requester coverage is incomplete (current: ${health795.count}/12).`);

      if (!health796.available) warnings.push(`App ${appIds.scoringConfigMasterAppId} (Scoring Master) is unavailable or access denied.`);
      else if (health796.count === 0) warnings.push(`Scoring Master App ${appIds.scoringConfigMasterAppId} has 0 active baseline records.`);

      if (!health797.available) warnings.push(`App ${appIds.hoshinMasterAppId} (Hoshin Master) is unavailable or access denied.`);
      else if (health797.count === 0) warnings.push(`Hoshin Master App ${appIds.hoshinMasterAppId} has 0 active Hoshin records.`);

      if (!health798.available) warnings.push(`App ${appIds.revisionArchiveAppId} (Revision Archive) is unavailable or access denied.`);

      const health = {
        app794Count: evaluations.length,
        routing: health795,
        scoring: health796,
        hoshin: health797,
        archive: health798
      };

      let activeFilters = { fy: '', dept: '', sec: '', status: '' };

      const defaultResetHandler = async ({ employeeCode }) => {
        const apiWrapper = {
          getRecords: async (appId, query) => kintoneApi('/k/v1/records.json', 'GET', { app: appId, query }),
          updateRecord: async (appId, id, record) => kintoneApi('/k/v1/record.json', 'PUT', { app: appId, id, record })
        };
        const adapter = new MboKintoneAuthAdapter({ api: apiWrapper, appId: appIds.credentialAppId || 801 });
        return await adapter.resetMboPassword({ employeeCode });
      };

      const resetFn = onResetMboPassword || defaultResetHandler;

      const renderUI = () => {
        headerSpace.innerHTML = renderHrControlCenterHtml({
          evaluations,
          allEvaluations: evaluations,
          health,
          warnings,
          filters: activeFilters,
          appIds
        });

        // Attach filter event listeners
        const fySelect = headerSpace.querySelector('#hrcc-filter-fy');
        const deptSelect = headerSpace.querySelector('#hrcc-filter-dept');
        const secSelect = headerSpace.querySelector('#hrcc-filter-sec');
        const statusSelect = headerSpace.querySelector('#hrcc-filter-status');

        if (fySelect) fySelect.addEventListener('change', (e) => { activeFilters.fy = e.target.value; renderUI(); });
        if (deptSelect) deptSelect.addEventListener('change', (e) => { activeFilters.dept = e.target.value; renderUI(); });
        if (secSelect) secSelect.addEventListener('change', (e) => { activeFilters.sec = e.target.value; renderUI(); });
        if (statusSelect) statusSelect.addEventListener('change', (e) => { activeFilters.status = e.target.value; renderUI(); });

        // Attach Reset MBO Password event listener
        const resetBtn = headerSpace.querySelector('#hrcc-reset-btn');
        const empCodeInput = headerSpace.querySelector('#hrcc-reset-emp-code');
        const empConfirmInput = headerSpace.querySelector('#hrcc-reset-emp-confirm');
        const feedbackDiv = headerSpace.querySelector('#hrcc-reset-feedback');

        if (resetBtn) {
          let isExecuting = false;
          resetBtn.addEventListener('click', async () => {
            if (isExecuting) return; // Prevent double-clicks / in-flight repeat

            const rawEmpCode = empCodeInput ? empCodeInput.value : '';
            const rawEmpConfirm = empConfirmInput ? empConfirmInput.value : '';

            if (feedbackDiv) {
              feedbackDiv.style.display = 'block';
              feedbackDiv.innerHTML = '';
            }

            // 1. Empty / Missing input check -> Zero reset calls
            if (!rawEmpCode || !rawEmpConfirm) {
              if (feedbackDiv) {
                feedbackDiv.innerHTML = `<div class="hrcc-warning-box">⚠️ กรุณาระบุ Employee Code และยืนยัน Employee Code ให้ครบถ้วน / Please enter both Employee Code and confirmation.</div>`;
              }
              return;
            }

            // 2. Leading or trailing whitespace check -> Zero reset calls (Strict identity contract)
            if (rawEmpCode !== rawEmpCode.trim() || rawEmpConfirm !== rawEmpConfirm.trim()) {
              if (feedbackDiv) {
                feedbackDiv.innerHTML = `<div class="hrcc-warning-box">⚠️ Employee Code ห้ามมีช่องว่างนำหน้าหรือต่อท้าย / Employee Code must not contain leading or trailing whitespace.</div>`;
              }
              return;
            }

            // 3. Format prevalidation check (canonical format: ^[A-Za-z0-9_.-]+$) -> Zero reset calls
            if (!/^[A-Za-z0-9_.-]+$/.test(rawEmpCode)) {
              if (feedbackDiv) {
                feedbackDiv.innerHTML = `<div class="hrcc-warning-box">⚠️ รูปแบบ Employee Code ไม่ถูกต้อง (อนุญาตเฉพาะ A-Z, a-z, 0-9, _, ., -) / Invalid Employee Code format (allowed characters: A-Z, a-z, 0-9, _, ., -).</div>`;
              }
              return;
            }

            // 4. Confirmation mismatch check -> Zero reset calls
            if (rawEmpCode !== rawEmpConfirm) {
              if (feedbackDiv) {
                feedbackDiv.innerHTML = `<div class="hrcc-warning-box">⚠️ Employee Code และค่ายืนยันไม่ตรงกัน / Employee Code and confirmation code do not match.</div>`;
              }
              return;
            }

            // 5. Set in-flight state & disable button
            isExecuting = true;
            resetBtn.disabled = true;
            resetBtn.textContent = 'Resetting...';

            try {
              const res = await resetFn({ employeeCode: rawEmpCode });

              if (res && res.status === 'PASSWORD_RESET') {
                const safeCode = escapeHtml(res.employeeCode || rawEmpCode);
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div style="background:#ecfdf5; border-left:4px solid #10b981; padding:0.75rem 1rem; border-radius:0.25rem; color:#065f46;">
                    ✅ <strong>รีเซ็ตรหัสผ่าน MBO สำเร็จ / Reset MBO Password Successful:</strong><br>
                    รหัสผ่าน MBO สำหรับ Employee Code <strong>[${safeCode}]</strong> ถูกรีเซ็ตเป็นรหัสผ่านเริ่มต้น (เท่ากับ Employee Code) แล้ว<br>
                    ผู้ใช้ต้องเปลี่ยนรหัสผ่านในการเข้าสู่ระบบ MBO ครั้งถัดไปเมื่อเข้าใช้งานแบบ Shared Account<br>
                    <small style="color:#047857; display:block; margin-top:0.25rem;">ℹ️ หมายเหตุ: การดำเนินการนี้ไม่ได้รีเซ็ตรหัสผ่านบัญชี Kintone/cybozu หลักของผู้ใช้ / Note: This action does not reset native Kintone/cybozu account password.</small>
                  </div>`;
                }
                if (empCodeInput) empCodeInput.value = '';
                if (empConfirmInput) empConfirmInput.value = '';
              } else {
                const reason = escapeHtml(res?.reason || res?.status || 'Unknown credential failure');
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">❌ ไม่สามารถรีเซ็ตรหัสผ่าน MBO ได้: ${reason}</div>`;
                }
              }
            } catch (err) {
              const errMsg = escapeHtml(err.message || 'Technical error occurred');
              if (feedbackDiv) {
                feedbackDiv.innerHTML = `<div class="hrcc-warning-box">❌ เกิดข้อผิดพลาดทางเทคนิค: ${errMsg}</div>`;
              }
            } finally {
              isExecuting = false;
              resetBtn.disabled = false;
              resetBtn.textContent = 'Reset MBO Password';
            }
          });
        }
      };

      renderUI();
    } catch (err) {
      headerSpace.innerHTML = `<div class="hrcc-container" style="color:red;">❌ Error loading HR Control Center: ${escapeHtml(err.message)}</div>`;
    }

    return event;
  };
}

// Auto-register runtime if in Kintone browser environment
if (typeof kintone !== 'undefined' && kintone.events) {
  const browserKintoneApi = (path, method, params) => kintone.api(kintone.api.url(path, true), method, params);
  const handler = createHrccRuntime({ kintoneApi: browserKintoneApi });
  kintone.events.on('app.record.index.show', handler);
}
