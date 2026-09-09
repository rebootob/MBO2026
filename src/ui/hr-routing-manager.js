/**
 * MBO 2026 — HR Versioned Routing Manager UI Component
 *
 * App 800 Self-Service Routing Component.
 * Supports HR self-service routing configuration and Admin-Form diagnostics
 * with strict role-based capability boundaries, dynamic topology slots,
 * HTML injection prevention, and zero live mutations (plan generator).
 */

import {
  TOPOLOGIES,
  TOPOLOGY_CONFIGS,
  ROUTING_STATUSES,
  hasHrCapability,
  hasAdminFormCapability,
  validateRoutingDraft,
  previewRoutingPlan
} from '../services/hr-routing-management-service.js';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const TOPOLOGY_OPTIONS = [
  { value: TOPOLOGIES.M1_ONLY, label: 'M1 Only (1 Appraiser: M1)', slots: ['M1'] },
  { value: TOPOLOGIES.M1_G1, label: 'M1 + G1 (2 Appraisers: M1, G1)', slots: ['M1', 'G1'] },
  { value: TOPOLOGIES.M1_M2_G1, label: 'M1 + M2 + G1 (3 Appraisers: M1, M2, G1)', slots: ['M1', 'M2', 'G1'] },
  { value: TOPOLOGIES.M1_G1_G2, label: 'M1 + G1 + G2 (3 Appraisers: M1, G1, G2)', slots: ['M1', 'G1', 'G2'] },
  { value: TOPOLOGIES.M1_M2_G1_G2, label: 'M1 + M2 + G1 + G2 (4 Appraisers: M1, M2, G1, G2)', slots: ['M1', 'M2', 'G1', 'G2'] }
];

export function getRequiredSlotsForTopology(topology) {
  const config = TOPOLOGY_CONFIGS[topology];
  return config ? [...config.slots] : ['M1'];
}

/**
 * Render the HR Versioned Routing Manager UI as HTML string.
 */
export function renderHrRoutingManagerHtml({
  principal = null,
  routes = [],
  selectedRouteKey = '',
  selectedTopology = TOPOLOGIES.M1_ONLY,
  slotValues = {},
  scorerValues = {},
  effectiveFrom = '',
  effectiveTo = '',
  remark = '',
  validationErrors = [],
  previewResult = null,
  activeTab = 'routes'
} = {}) {
  const isHr = hasHrCapability(principal);
  const isAdminForm = hasAdminFormCapability(principal);
  const hasAccess = isHr || isAdminForm;

  if (!hasAccess) {
    return `
      <div class="hr-routing-panel hr-access-denied" style="padding: 1.5rem; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; color: #9f1239;">
        <h3 style="margin-top: 0;">Access Denied / ไม่ได้รับอนุญาต</h3>
        <p>คุณไม่มีสิทธิ์เข้าถึงส่วนจัดการ Approval Routing (ต้องเป็นสมาชิกของกลุ่ม <strong>hr</strong> หรือ <strong>admin-form</strong>)</p>
      </div>
    `;
  }

  const requiredSlots = getRequiredSlotsForTopology(selectedTopology);

  // Status badge class mapping
  const badgeStyle = (status) => {
    switch (status) {
      case ROUTING_STATUSES.ACTIVE:
        return 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;';
      case ROUTING_STATUSES.DRAFT:
        return 'background: #fef9c3; color: #854d0e; border: 1px solid #fde047;';
      case ROUTING_STATUSES.SUPERSEDED:
        return 'background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db;';
      case ROUTING_STATUSES.CANCELLED:
        return 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  };

  // Role info banner
  const roleBanner = `
    <div class="hr-routing-role-bar" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>User:</strong> ${escapeHtml(principal?.userCode || 'unknown')} |
        <strong>Groups:</strong> ${escapeHtml((principal?.groups || []).join(', '))} |
        <strong>Role Capability:</strong>
        ${isHr ? '<span style="color: #047857; font-weight: 600;">[HR: Full Business Self-Service]</span>' : ''}
        ${isAdminForm && !isHr ? '<span style="color: #b45309; font-weight: 600;">[Admin-Form: Read-Only / Diagnostics / Zero Business Mutations]</span>' : ''}
        ${isHr && isAdminForm ? '<span style="color: #6d28d9; font-weight: 600;">[Dual-Role: Union of HR + Technical Administration]</span>' : ''}
      </div>
      <div>
        <span class="badge" style="font-size: 0.75rem; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px;">D3-IMP-06 LOCAL-ONLY</span>
      </div>
    </div>
  `;

  // Validation errors banner
  const errorHtml = validationErrors.length > 0
    ? `<div class="hr-routing-errors" style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 0.75rem 1rem; margin-bottom: 1rem; border-radius: 4px;">
        <strong style="color: #991b1b;">Validation Errors / พบข้อผิดพลาด:</strong>
        <ul style="margin: 0.5rem 0 0 1.25rem; color: #b91c1c; font-size: 0.875rem;">
          ${validationErrors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
        </ul>
      </div>`
    : '';

  // Routes table
  const routesRows = routes.map(r => {
    const routeKey = escapeHtml(r.Routing_Key || r.routingKey || '');
    const verNum = escapeHtml(r.Version_Number || r.versionNumber || '');
    const verKey = escapeHtml(r.Version_Key || r.versionKey || '');
    const topo = escapeHtml(r.Topology || r.topology || '');
    const st = escapeHtml(r.Status || r.status || '');
    const effFrom = escapeHtml(r.Effective_From || r.effectiveFrom || '');
    const effTo = escapeHtml(r.Effective_To || r.effectiveTo || '-');
    const rmk = escapeHtml(r.Remark || r.remark || '-');
    const isSelected = selectedRouteKey === (r.Routing_Key || r.routingKey);

    return `
      <tr class="${isSelected ? 'selected-route-row' : ''}" style="${isSelected ? 'background: #f0fdf4;' : ''}">
        <td><strong>${routeKey}</strong></td>
        <td>v${verNum}</td>
        <td><small>${verKey}</small></td>
        <td><code>${topo}</code></td>
        <td><span style="padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; ${badgeStyle(st)}">${st}</span></td>
        <td>${effFrom}</td>
        <td>${effTo}</td>
        <td title="${rmk}">${rmk.length > 30 ? rmk.substring(0, 27) + '...' : rmk}</td>
        <td>
          <button type="button" class="btn-select-route" data-route-key="${routeKey}" style="padding: 2px 8px; font-size: 0.8rem; cursor: pointer;">Select</button>
        </td>
      </tr>
    `;
  }).join('');

  // Mutation action controls (HR only vs Admin-Form notice)
  const mutationControls = isHr
    ? `
      <div class="hr-action-group" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" id="hr-btn-create-draft" class="btn-primary" style="padding: 0.5rem 1rem; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          💾 Create New Draft
        </button>
        <button type="button" id="hr-btn-save-draft" class="btn-secondary" style="padding: 0.5rem 1rem; background: #475569; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          ✏️ Update Draft
        </button>
        <button type="button" id="hr-btn-publish" class="btn-success" style="padding: 0.5rem 1rem; background: #16a34a; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          🚀 Publish Plan
        </button>
        <button type="button" id="hr-btn-supersede" class="btn-warning" style="padding: 0.5rem 1rem; background: #d97706; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          🔄 Supersede Plan
        </button>
      </div>
    `
    : `
      <div class="hr-action-group admin-disabled" style="margin-top: 1rem; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 0.75rem;">
        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #92400e;">
          🔒 <strong>Business Mutation Notice:</strong> You are logged in as <strong>admin-form</strong> without HR membership. Business routing mutations (Create Draft, Edit Draft, Publish, Supersede) are strictly reserved for HR. Admin-Form may only preview, validate, and view diagnostics.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" disabled class="btn-disabled" title="HR role required (ROUTING_HR_AUTHORIZATION_REQUIRED)" style="padding: 0.5rem 1rem; background: #cbd5e1; color: #64748b; border: none; border-radius: 4px; cursor: not-allowed;">
            Create New Draft (HR Only)
          </button>
          <button type="button" disabled class="btn-disabled" title="HR role required (ROUTING_HR_AUTHORIZATION_REQUIRED)" style="padding: 0.5rem 1rem; background: #cbd5e1; color: #64748b; border: none; border-radius: 4px; cursor: not-allowed;">
            Publish Plan (HR Only)
          </button>
          <button type="button" disabled class="btn-disabled" title="HR role required (ROUTING_HR_AUTHORIZATION_REQUIRED)" style="padding: 0.5rem 1rem; background: #cbd5e1; color: #64748b; border: none; border-radius: 4px; cursor: not-allowed;">
            Supersede Plan (HR Only)
          </button>
        </div>
      </div>
    `;

  // Preview panel
  const previewHtml = previewResult
    ? `
      <div class="hr-routing-preview-box" style="margin-top: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 1rem;">
        <h4 style="margin-top: 0; color: #166534;">📋 Routing Validation & Preview Result</h4>
        <div style="font-size: 0.875rem; line-height: 1.6; color: #14532d;">
          <div><strong>Status:</strong> ${previewResult.isValid ? '✅ VALID / PASS' : '❌ INVALID'}</div>
          <div><strong>Topology:</strong> <code>${escapeHtml(previewResult.topology)}</code></div>
          <div><strong>Active Slots:</strong> ${previewResult.activeSlots?.map(s => escapeHtml(s.role + ': ' + s.userCode)).join(' ➔ ') || '-'}</div>
          <div><strong>Scorer Slots:</strong> Mid-Year: [${escapeHtml(previewResult.scorerSlots?.midYear || '')}], Final 1: [${escapeHtml(previewResult.scorerSlots?.final1 || '')}], Final 2: [${escapeHtml(previewResult.scorerSlots?.final2 || '')}]</div>
          <div><strong>Process Capability:</strong> <code>${escapeHtml(previewResult.processCapabilityId || '')}</code></div>
          <div><strong>In-Flight App 794 Impact:</strong> <span style="font-weight: 600; color: #047857;">${escapeHtml(previewResult.inFlightImpact || 'NONE (ZERO)')}</span></div>
          ${previewResult.warnings?.length > 0 ? `<div style="color: #b45309;">⚠️ Warnings: ${previewResult.warnings.map(w => escapeHtml(w)).join(', ')}</div>` : ''}
        </div>
        ${previewResult.planPayload ? `
          <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; font-size: 0.8rem; color: #15803d; font-weight: 600;">View Generated Mutation Plan Payload (Local JSON)</summary>
            <pre style="background: #ffffff; padding: 0.75rem; border: 1px solid #dcfce7; border-radius: 4px; font-size: 0.75rem; overflow-x: auto; max-height: 200px;">${escapeHtml(JSON.stringify(previewResult.planPayload, null, 2))}</pre>
          </details>
        ` : ''}
      </div>
    `
    : '';

  return `
    <div class="hr-routing-manager" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1.5rem; margin-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="margin: 0; font-size: 1.25rem; color: #111827; display: flex; align-items: center; gap: 0.5rem;">
          🧭 App 800 HR Approval Routing Self-Service
        </h2>
        <span style="font-size: 0.8rem; color: #6b7280;">App 795 Routing Master Management</span>
      </div>

      ${roleBanner}
      ${errorHtml}

      <!-- Versioned Route Table -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; color: #374151; margin: 0 0 0.5rem 0;">Existing Versioned Routes / รายการสายการอนุมัติ</h3>
        <div style="max-height: 250px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left;">
                <th style="padding: 6px 10px;">Routing Key</th>
                <th style="padding: 6px 10px;">Ver</th>
                <th style="padding: 6px 10px;">Version Key</th>
                <th style="padding: 6px 10px;">Topology</th>
                <th style="padding: 6px 10px;">Status</th>
                <th style="padding: 6px 10px;">Effective From</th>
                <th style="padding: 6px 10px;">Effective To</th>
                <th style="padding: 6px 10px;">Business Reason</th>
                <th style="padding: 6px 10px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${routesRows || '<tr><td colspan="9" style="padding: 1rem; text-align: center; color: #9ca3af;">No route versions registered.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Editor / Configuration Panel -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1.25rem;">
        <h3 style="font-size: 1rem; color: #1e293b; margin: 0 0 1rem 0;">
          Route Configuration & Plan Generator / กำหนดค่าสายการอนุมัติ
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <!-- Routing Key -->
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Routing Key (e.g. DEPT_ENG_SEC1):</label>
            <input type="text" id="hr-route-key" class="hr-input" value="${escapeHtml(selectedRouteKey)}" placeholder="e.g. DEPT_ENG_SEC1" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>

          <!-- Topology Selector -->
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Approval Topology (ลำดับชั้นการอนุมัติ):</label>
            <select id="hr-topology-select" class="hr-select" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
              ${TOPOLOGY_OPTIONS.map(opt => `
                <option value="${escapeHtml(opt.value)}" ${selectedTopology === opt.value ? 'selected' : ''}>
                  ${escapeHtml(opt.label)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Effective Dates -->
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Effective From (YYYY-MM-DD):</label>
            <input type="date" id="hr-effective-from" class="hr-input" value="${escapeHtml(effectiveFrom)}" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Effective To (YYYY-MM-DD, Optional):</label>
            <input type="date" id="hr-effective-to" class="hr-input" value="${escapeHtml(effectiveTo)}" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>
        </div>

        <!-- Dynamic Appraiser Slots -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #334155;">Dynamic Appraiser Slots / ผู้ประเมินตามลำดับชั้น</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            <!-- M1 -->
            <div id="slot-container-m1">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser M1 User Code (Required):</label>
              <input type="text" id="hr-slot-m1" class="hr-input slot-input" data-slot="M1" value="${escapeHtml(slotValues.M1 || '')}" placeholder="e.g. M1_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>

            <!-- M2 -->
            <div id="slot-container-m2" style="${requiredSlots.includes('M2') ? '' : 'display: none;'}">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser M2 User Code:</label>
              <input type="text" id="hr-slot-m2" class="hr-input slot-input" data-slot="M2" value="${escapeHtml(slotValues.M2 || '')}" placeholder="e.g. M2_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>

            <!-- G1 -->
            <div id="slot-container-g1" style="${requiredSlots.includes('G1') ? '' : 'display: none;'}">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser G1 User Code:</label>
              <input type="text" id="hr-slot-g1" class="hr-input slot-input" data-slot="G1" value="${escapeHtml(slotValues.G1 || '')}" placeholder="e.g. G1_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>

            <!-- G2 -->
            <div id="slot-container-g2" style="${requiredSlots.includes('G2') ? '' : 'display: none;'}">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser G2 User Code:</label>
              <input type="text" id="hr-slot-g2" class="hr-input slot-input" data-slot="G2" value="${escapeHtml(slotValues.G2 || '')}" placeholder="e.g. G2_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>
          </div>
        </div>

        <!-- Scorer Slots Configuration -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #334155;">Scorer Slots / สิทธิ์การให้คะแนน</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Mid-Year Scorer Slot:</label>
              <select id="hr-scorer-midyear" class="hr-select" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                ${requiredSlots.map(s => `<option value="${escapeHtml(s)}" ${scorerValues.midYear === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Final Scorer 1 Slot:</label>
              <select id="hr-scorer-final1" class="hr-select" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                ${requiredSlots.map(s => `<option value="${escapeHtml(s)}" ${scorerValues.final1 === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Final Scorer 2 Slot:</label>
              <select id="hr-scorer-final2" class="hr-select" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                <option value="">(None / No Final Scorer 2)</option>
                ${requiredSlots.map(s => `<option value="${escapeHtml(s)}" ${scorerValues.final2 === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Business Reason (Remark) -->
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
            Business Reason / เหตุผลการเปลี่ยนแปลง (Mandatory Remark):
          </label>
          <textarea id="hr-route-remark" class="hr-textarea" rows="2" placeholder="ระบุเหตุผลทางธุรกิจในการสร้าง/ปรับปรุงเวอร์ชันสายการอนุมัติ เช่น ปรับผังองค์กร Q1/2026" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">${escapeHtml(remark)}</textarea>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <button type="button" id="hr-btn-preview" class="btn-info" style="padding: 0.5rem 1.25rem; background: #0369a1; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
            🔍 Preview & Validate Plan
          </button>
          ${mutationControls}
        </div>

        <!-- Historical Route Note -->
        <div style="margin-top: 1rem; font-size: 0.75rem; color: #64748b;">
          🛡️ <strong>Safety Invariant:</strong> Historical route versions cannot be deleted. Deprecated routes must be superseded or cancelled to preserve audit trail integrity.
        </div>
      </div>

      ${previewHtml}
    </div>
  `;
}

/**
 * Client-side runtime binder for HR Routing Manager.
 */
export function bindHrRoutingManagerEvents({
  containerElement,
  principal,
  service,
  onPlanGenerated = () => {},
  initialData = {}
}) {
  if (!containerElement) return;

  let state = {
    selectedRouteKey: initialData.selectedRouteKey || '',
    selectedTopology: initialData.selectedTopology || TOPOLOGIES.M1_ONLY,
    slotValues: initialData.slotValues || { M1: '' },
    scorerValues: initialData.scorerValues || { midYear: 'M1', final1: 'M1', final2: '' },
    effectiveFrom: initialData.effectiveFrom || '',
    effectiveTo: initialData.effectiveTo || '',
    remark: initialData.remark || '',
    validationErrors: [],
    previewResult: null,
    routes: initialData.routes || []
  };

  const render = () => {
    containerElement.innerHTML = renderHrRoutingManagerHtml({
      principal,
      routes: state.routes,
      selectedRouteKey: state.selectedRouteKey,
      selectedTopology: state.selectedTopology,
      slotValues: state.slotValues,
      scorerValues: state.scorerValues,
      effectiveFrom: state.effectiveFrom,
      effectiveTo: state.effectiveTo,
      remark: state.remark,
      validationErrors: state.validationErrors,
      previewResult: state.previewResult
    });

    attachListeners();
  };

  const readFormState = () => {
    const keyEl = containerElement.querySelector('#hr-route-key');
    const topoEl = containerElement.querySelector('#hr-topology-select');
    const effFromEl = containerElement.querySelector('#hr-effective-from');
    const effToEl = containerElement.querySelector('#hr-effective-to');
    const remarkEl = containerElement.querySelector('#hr-route-remark');

    if (keyEl) state.selectedRouteKey = keyEl.value;
    if (topoEl) state.selectedTopology = topoEl.value;
    if (effFromEl) state.effectiveFrom = effFromEl.value;
    if (effToEl) state.effectiveTo = effToEl.value;
    if (remarkEl) state.remark = remarkEl.value;

    const slots = {};
    const slotInputs = containerElement.querySelectorAll('.slot-input');
    slotInputs.forEach(input => {
      const slotName = input.getAttribute('data-slot');
      if (slotName) slots[slotName] = input.value;
    });
    state.slotValues = slots;

    const midEl = containerElement.querySelector('#hr-scorer-midyear');
    const f1El = containerElement.querySelector('#hr-scorer-final1');
    const f2El = containerElement.querySelector('#hr-scorer-final2');

    state.scorerValues = {
      midYear: midEl ? midEl.value : 'M1',
      final1: f1El ? f1El.value : 'M1',
      final2: f2El ? f2El.value : ''
    };
  };

  const attachListeners = () => {
    // Topology change
    const topoEl = containerElement.querySelector('#hr-topology-select');
    if (topoEl) {
      topoEl.addEventListener('change', (e) => {
        state.selectedTopology = e.target.value;
        readFormState();
        render();
      });
    }

    // Select route from table
    const selectBtns = containerElement.querySelectorAll('.btn-select-route');
    selectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rKey = e.target.getAttribute('data-route-key');
        const found = state.routes.find(r => (r.Routing_Key || r.routingKey) === rKey);
        if (found) {
          state.selectedRouteKey = found.Routing_Key || found.routingKey || '';
          state.selectedTopology = found.Topology || found.topology || TOPOLOGIES.M1_ONLY;
          state.effectiveFrom = found.Effective_From || found.effectiveFrom || '';
          state.effectiveTo = found.Effective_To || found.effectiveTo || '';
          state.remark = found.Remark || found.remark || '';
          render();
        }
      });
    });

    // Preview & Validate button
    const previewBtn = containerElement.querySelector('#hr-btn-preview');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        readFormState();
        const draftInput = {
          routingKey: state.selectedRouteKey,
          topology: state.selectedTopology,
          slots: state.slotValues,
          scorerSlots: state.scorerValues,
          effectiveFrom: state.effectiveFrom,
          effectiveTo: state.effectiveTo,
          businessReason: state.remark
        };

        const validation = validateRoutingDraft(draftInput, { existingVersions: state.routes });
        state.validationErrors = validation.errors;

        if (validation.isValid) {
          const preview = previewRoutingPlan({
            principal,
            draft: draftInput,
            existingVersions: state.routes
          });
          state.previewResult = preview;
        } else {
          state.previewResult = null;
        }

        render();
      });
    }

    // Create Draft button (HR only)
    const createDraftBtn = containerElement.querySelector('#hr-btn-create-draft');
    if (createDraftBtn) {
      createDraftBtn.addEventListener('click', () => {
        readFormState();
        try {
          const plan = service.planCreateDraft({
            principal,
            draft: {
              routingKey: state.selectedRouteKey,
              topology: state.selectedTopology,
              slots: state.slotValues,
              scorerSlots: state.scorerValues,
              effectiveFrom: state.effectiveFrom,
              effectiveTo: state.effectiveTo,
              businessReason: state.remark
            },
            existingVersions: state.routes
          });
          state.validationErrors = [];
          state.previewResult = {
            isValid: true,
            topology: state.selectedTopology,
            activeSlots: plan.routeData.activeSlots,
            scorerSlots: plan.routeData.scorerSlots,
            processCapabilityId: plan.routeData.processCapabilityId,
            planPayload: plan
          };
          onPlanGenerated(plan);
          render();
        } catch (err) {
          state.validationErrors = [err.message];
          render();
        }
      });
    }

    // Update Draft button (HR only)
    const saveDraftBtn = containerElement.querySelector('#hr-btn-save-draft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        readFormState();
        try {
          const plan = service.planEditDraft({
            principal,
            currentDraft: {
              Routing_Key: state.selectedRouteKey,
              Status: ROUTING_STATUSES.DRAFT
            },
            updates: {
              topology: state.selectedTopology,
              slots: state.slotValues,
              scorerSlots: state.scorerValues,
              effectiveFrom: state.effectiveFrom,
              effectiveTo: state.effectiveTo,
              businessReason: state.remark
            },
            existingVersions: state.routes
          });
          state.validationErrors = [];
          state.previewResult = {
            isValid: true,
            topology: state.selectedTopology,
            activeSlots: plan.routeData.activeSlots,
            scorerSlots: plan.routeData.scorerSlots,
            processCapabilityId: plan.routeData.processCapabilityId,
            planPayload: plan
          };
          onPlanGenerated(plan);
          render();
        } catch (err) {
          state.validationErrors = [err.message];
          render();
        }
      });
    }

    // Publish Plan button (HR only)
    const publishBtn = containerElement.querySelector('#hr-btn-publish');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        readFormState();
        try {
          const plan = service.planPublishVersion({
            principal,
            versionToPublish: {
              Routing_Key: state.selectedRouteKey,
              Status: ROUTING_STATUSES.DRAFT,
              Topology: state.selectedTopology,
              Effective_From: state.effectiveFrom,
              Effective_To: state.effectiveTo,
              Remark: state.remark,
              Appraiser_M1: [{ code: state.slotValues.M1 || '' }]
            },
            businessReason: state.remark,
            existingVersions: state.routes
          });
          state.validationErrors = [];
          state.previewResult = {
            isValid: true,
            topology: state.selectedTopology,
            activeSlots: plan.publishedVersion.activeSlots,
            scorerSlots: plan.publishedVersion.scorerSlots,
            processCapabilityId: plan.processCapabilityId,
            planPayload: plan
          };
          onPlanGenerated(plan);
          render();
        } catch (err) {
          state.validationErrors = [err.message];
          render();
        }
      });
    }

    // Supersede Plan button (HR only)
    const supersedeBtn = containerElement.querySelector('#hr-btn-supersede');
    if (supersedeBtn) {
      supersedeBtn.addEventListener('click', () => {
        readFormState();
        try {
          const plan = service.planSupersedeVersion({
            principal,
            activeVersion: {
              Routing_Key: state.selectedRouteKey,
              Status: ROUTING_STATUSES.ACTIVE,
              Version_Number: 1
            },
            newVersionDraft: {
              routingKey: state.selectedRouteKey,
              topology: state.selectedTopology,
              slots: state.slotValues,
              scorerSlots: state.scorerValues,
              effectiveFrom: state.effectiveFrom,
              effectiveTo: state.effectiveTo,
              businessReason: state.remark
            },
            businessReason: state.remark,
            existingVersions: state.routes
          });
          state.validationErrors = [];
          state.previewResult = {
            isValid: true,
            topology: state.selectedTopology,
            activeSlots: plan.newVersion.activeSlots,
            scorerSlots: plan.newVersion.scorerSlots,
            processCapabilityId: plan.processCapabilityId,
            planPayload: plan
          };
          onPlanGenerated(plan);
          render();
        } catch (err) {
          state.validationErrors = [err.message];
          render();
        }
      });
    }
  };

  render();

  return {
    getState: () => ({ ...state }),
    setState: (newState) => {
      state = { ...state, ...newState };
      render();
    }
  };
}
