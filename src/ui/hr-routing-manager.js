/**
 * MBO2026 — D3-IMP-06-R1 App800 HR routing manager facade.
 *
 * Keeps the accepted D3-IMP-06 presentation surface while correcting:
 * - canonical M2 -> M1 -> G1[/G2] sequence,
 * - explicit scorer selection (no M1/slot-1 UI default),
 * - exact principal/K/process propagation,
 * - event binding to the real HR routing management service API.
 *
 * LOCAL ONLY. ZERO KINTONE / ZERO PROCESS WRITE / ZERO DEPLOYMENT.
 */

import * as BaseUi from './hr-routing-manager-d3imp06-base.js';
import {
  HrRoutingManagementService,
  TOPOLOGIES,
  TOPOLOGY_CONFIGS,
  ROUTING_STATUSES
} from '../services/hr-routing-management-service.js';

export const escapeHtml = BaseUi.escapeHtml;

export const TOPOLOGY_OPTIONS = Object.freeze([
  Object.freeze({ value: TOPOLOGIES.M1_ONLY, label: 'M1 Only (1 Appraiser: M1)', slots: Object.freeze(['M1']) }),
  Object.freeze({ value: TOPOLOGIES.M1_G1, label: 'M1 + G1 (2 Appraisers: M1, G1)', slots: Object.freeze(['M1', 'G1']) }),
  Object.freeze({ value: TOPOLOGIES.M1_M2_G1, label: 'M2 + M1 + G1 (3 Appraisers: M2, M1, G1)', slots: Object.freeze(['M2', 'M1', 'G1']) }),
  Object.freeze({ value: TOPOLOGIES.M1_G1_G2, label: 'M1 + G1 + G2 (3 Appraisers: M1, G1, G2)', slots: Object.freeze(['M1', 'G1', 'G2']) }),
  Object.freeze({ value: TOPOLOGIES.M1_M2_G1_G2, label: 'M2 + M1 + G1 + G2 (4 Appraisers: M2, M1, G1, G2)', slots: Object.freeze(['M2', 'M1', 'G1', 'G2']) })
]);

export function getRequiredSlotsForTopology(topology) {
  const config = TOPOLOGY_CONFIGS[topology];
  return config ? [...config.slots] : [];
}

function unwrap(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value;
  }
  return value;
}

function readString(value) {
  const raw = unwrap(value);
  return raw === null || raw === undefined ? '' : String(raw);
}

function routeRaw(route) {
  return route?.rawRecord || route || null;
}

function routeField(route, rawName, ...aliases) {
  const raw = routeRaw(route);
  if (!raw) return '';
  if (Object.prototype.hasOwnProperty.call(raw, rawName)) return unwrap(raw[rawName]);
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(route || {}, alias)) return unwrap(route[alias]);
  }
  return '';
}

function routeKeyOf(route) {
  return readString(routeField(route, 'Routing_Key', 'routingKey'));
}

function versionKeyOf(route) {
  return readString(routeField(route, 'Version_Key', 'versionKey'));
}

function statusOf(route) {
  return readString(routeField(route, 'Version_Status', 'Status', 'status', 'versionStatus'));
}

function revisionOf(route) {
  const raw = routeRaw(route);
  return readString(raw?.$revision);
}

function reorderCanonicalM2SlotBlocks(html, topology) {
  if (topology !== TOPOLOGIES.M1_M2_G1 && topology !== TOPOLOGIES.M1_M2_G1_G2) return html;

  const sectionStart = html.indexOf('<!-- Dynamic Appraiser Slots -->');
  const sectionEnd = html.indexOf('<!-- Scorer Slots Configuration -->');
  if (sectionStart < 0 || sectionEnd <= sectionStart) return html;

  const section = html.slice(sectionStart, sectionEnd);
  const blockRegex = /\s*<!-- (M1|M2|G1|G2) -->\s*<div id="slot-container-[^"]+"[^>]*>[\s\S]*?<\/div>/g;
  const matches = [...section.matchAll(blockRegex)];
  if (matches.length !== 4) return html;

  const bySlot = new Map(matches.map(match => [match[1], match[0]]));
  if (!['M1', 'M2', 'G1', 'G2'].every(slot => bySlot.has(slot))) return html;

  const first = matches[0].index;
  const lastMatch = matches[matches.length - 1];
  const last = lastMatch.index + lastMatch[0].length;
  const ordered = ['M2', 'M1', 'G1', 'G2'].map(slot => bySlot.get(slot)).join('');
  const correctedSection = section.slice(0, first) + ordered + section.slice(last);
  return html.slice(0, sectionStart) + correctedSection + html.slice(sectionEnd);
}

function injectExplicitScorerBlankOptions(html) {
  const explicitBlank = '<option value="">(Select explicit scorer slot / ต้องระบุ)</option>';
  return html
    .replace(/(<select id="hr-scorer-midyear"[^>]*>)/, `$1\n                ${explicitBlank}`)
    .replace(/(<select id="hr-scorer-final1"[^>]*>)/, `$1\n                ${explicitBlank}`);
}

function injectVersionKeys(html, routes) {
  let index = 0;
  return html.replace(/class="btn-select-route" data-route-key="([^"]*)"/g, match => {
    const versionKey = versionKeyOf(routes[index++]);
    return `${match} data-version-key="${escapeHtml(versionKey)}"`;
  });
}

function injectSupersedeDateInput(html, value) {
  const marker = '<!-- Business Reason (Remark) -->';
  if (!html.includes(marker)) return html;
  const block = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
            Supersede Active Effective To (Explicit, required for Supersede):
          </label>
          <input type="date" id="hr-supersede-effective-to" class="hr-input" value="${escapeHtml(value || '')}" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
        </div>

        `;
  return html.replace(marker, block + marker);
}

export function renderHrRoutingManagerHtml(args = {}) {
  const routes = Array.isArray(args.routes) ? args.routes : [];
  let html = BaseUi.renderHrRoutingManagerHtml({
    ...args,
    scorerValues: args.scorerValues || {}
  });

  html = html
    .replace('M1 + M2 + G1 (3 Appraisers: M1, M2, G1)', 'M2 + M1 + G1 (3 Appraisers: M2, M1, G1)')
    .replace('M1 + M2 + G1 + G2 (4 Appraisers: M1, M2, G1, G2)', 'M2 + M1 + G1 + G2 (4 Appraisers: M2, M1, G1, G2)');

  html = reorderCanonicalM2SlotBlocks(html, args.selectedTopology);
  html = injectExplicitScorerBlankOptions(html);
  html = injectVersionKeys(html, routes);
  html = injectSupersedeDateInput(html, args.supersedeEffectiveToDate || '');
  return html;
}

function rawRoutes(routes) {
  return (Array.isArray(routes) ? routes : []).map(routeRaw).filter(Boolean);
}

function buildDraftState(state) {
  return {
    routingKey: state.selectedRouteKey,
    topology: state.selectedTopology,
    slots: state.slotValues,
    scorerSlots: state.scorerValues,
    effectiveFrom: state.effectiveFrom,
    effectiveTo: state.effectiveTo,
    businessReason: state.remark
  };
}

function toServiceDraftInput(service, state) {
  const draft = buildDraftState(state);
  const candidate = service.buildCandidateRecordFromDraft({ draft });
  return {
    ...candidate,
    Routing_Key: state.selectedRouteKey,
    Route_Pattern: readString(candidate.Route_Pattern),
    Routing_Topology: readString(candidate.Routing_Topology),
    Effective_From: state.effectiveFrom,
    Effective_To: state.effectiveTo,
    Remark: state.remark
  };
}

function historyProofFor(state, routingKey) {
  if (
    state.historyCompleteness &&
    state.historyCompleteness.complete === true &&
    state.historyCompleteness.routingKey === routingKey
  ) {
    return state.historyCompleteness;
  }
  if (state.versionHistoryCompletenessByRoutingKey?.[routingKey] === true) {
    return { routingKey, complete: true };
  }
  return undefined;
}

function findSelectedVersion(state) {
  if (state.selectedVersionKey) {
    return state.routes.find(route => versionKeyOf(route) === state.selectedVersionKey) || null;
  }
  const sameKey = state.routes.filter(route => routeKeyOf(route) === state.selectedRouteKey);
  return sameKey.length === 1 ? sameKey[0] : null;
}

function planPreviewFromMutation(plan, state) {
  return {
    isValid: true,
    topology: state.selectedTopology,
    activeSlots: getRequiredSlotsForTopology(state.selectedTopology).map(slot => ({
      role: slot,
      userCode: state.slotValues?.[slot] || ''
    })),
    scorerSlots: state.scorerValues,
    kExpected: state.kExpected,
    processCapabilityId: state.processCapabilityId,
    inFlightImpact: 'NONE (ZERO)',
    planPayload: plan,
    warnings: []
  };
}

/**
 * Real DOM-event -> strict service API binder.
 * `service` defaults to the actual domain facade and may be injected only as a
 * test seam; every call uses the production method names and exact argument shape.
 */
export function bindHrRoutingManagerEvents({
  containerElement,
  principal,
  service = HrRoutingManagementService,
  onPlanGenerated = () => {},
  initialData = {}
}) {
  if (!containerElement) return null;

  let state = {
    selectedRouteKey: initialData.selectedRouteKey || '',
    selectedVersionKey: initialData.selectedVersionKey || '',
    selectedTopology: initialData.selectedTopology || TOPOLOGIES.M1_ONLY,
    slotValues: initialData.slotValues || {},
    scorerValues: initialData.scorerValues || { midYear: '', final1: '', final2: '' },
    effectiveFrom: initialData.effectiveFrom || '',
    effectiveTo: initialData.effectiveTo || '',
    supersedeEffectiveToDate: initialData.supersedeEffectiveToDate || '',
    remark: initialData.remark || '',
    validationErrors: [],
    previewResult: null,
    routes: Array.isArray(initialData.routes) ? initialData.routes : [],
    kExpected: initialData.kExpected,
    processCapabilityId: initialData.processCapabilityId,
    historyCompleteness: initialData.historyCompleteness,
    versionHistoryCompletenessByRoutingKey: initialData.versionHistoryCompletenessByRoutingKey || {}
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
      supersedeEffectiveToDate: state.supersedeEffectiveToDate,
      remark: state.remark,
      validationErrors: state.validationErrors,
      previewResult: state.previewResult
    });
    attachListeners();
  };

  const readFormState = () => {
    const readValue = (selector, fallback) => {
      const element = containerElement.querySelector(selector);
      return element && typeof element.value !== 'undefined' ? element.value : fallback;
    };

    state.selectedRouteKey = readValue('#hr-route-key', state.selectedRouteKey);
    state.selectedTopology = readValue('#hr-topology-select', state.selectedTopology);
    state.effectiveFrom = readValue('#hr-effective-from', state.effectiveFrom);
    state.effectiveTo = readValue('#hr-effective-to', state.effectiveTo);
    state.supersedeEffectiveToDate = readValue('#hr-supersede-effective-to', state.supersedeEffectiveToDate);
    state.remark = readValue('#hr-route-remark', state.remark);

    const nextSlots = { ...state.slotValues };
    const slotInputs = containerElement.querySelectorAll('.slot-input') || [];
    slotInputs.forEach(input => {
      const slot = input.getAttribute?.('data-slot');
      if (slot) nextSlots[slot] = input.value;
    });
    state.slotValues = nextSlots;

    state.scorerValues = {
      midYear: readValue('#hr-scorer-midyear', state.scorerValues.midYear || ''),
      final1: readValue('#hr-scorer-final1', state.scorerValues.final1 || ''),
      final2: readValue('#hr-scorer-final2', state.scorerValues.final2 || '')
    };
  };

  const setPlan = (plan) => {
    state.validationErrors = [];
    state.previewResult = planPreviewFromMutation(plan, state);
    onPlanGenerated(plan);
    render();
  };

  const setError = (error) => {
    state.validationErrors = [error?.message || String(error)];
    state.previewResult = null;
    render();
  };

  const attachListeners = () => {
    const topo = containerElement.querySelector('#hr-topology-select');
    topo?.addEventListener('change', event => {
      state.selectedTopology = event.target.value;
      readFormState();
      render();
    });

    const selectButtons = containerElement.querySelectorAll('.btn-select-route') || [];
    selectButtons.forEach(button => {
      button.addEventListener('click', event => {
        state.selectedRouteKey = event.target.getAttribute('data-route-key') || '';
        state.selectedVersionKey = event.target.getAttribute('data-version-key') || '';
        const selected = findSelectedVersion(state);
        if (selected) {
          state.selectedTopology = readString(routeField(selected, 'Routing_Topology', 'Topology', 'topology')) || state.selectedTopology;
          state.effectiveFrom = readString(routeField(selected, 'Effective_From', 'effectiveFrom'));
          state.effectiveTo = readString(routeField(selected, 'Effective_To', 'effectiveTo'));
          state.remark = readString(routeField(selected, 'Remark', 'remark'));
        }
        render();
      });
    });

    const preview = containerElement.querySelector('#hr-btn-preview');
    preview?.addEventListener('click', () => {
      readFormState();
      try {
        const draft = buildDraftState(state);
        const validation = service.validateRoutingDraft({
          principal,
          draft,
          records: rawRoutes(state.routes),
          kExpected: state.kExpected,
          processCapabilityId: state.processCapabilityId
        });
        if (!validation.isValid) {
          state.validationErrors = validation.errors;
          state.previewResult = null;
        } else {
          state.validationErrors = [];
          state.previewResult = service.previewRoutingPlan({
            principal,
            draft,
            records: rawRoutes(state.routes),
            kExpected: state.kExpected,
            processCapabilityId: state.processCapabilityId
          });
        }
        render();
      } catch (error) {
        setError(error);
      }
    });

    const create = containerElement.querySelector('#hr-btn-create-draft');
    create?.addEventListener('click', () => {
      readFormState();
      try {
        const draftInput = toServiceDraftInput(service, state);
        const plan = service.createDraftRoutePlan({
          principal,
          records: rawRoutes(state.routes),
          draftInput,
          processCapabilityId: state.processCapabilityId,
          kExpected: state.kExpected,
          historyCompleteness: historyProofFor(state, state.selectedRouteKey)
        });
        setPlan(plan);
      } catch (error) {
        setError(error);
      }
    });

    const save = containerElement.querySelector('#hr-btn-save-draft');
    save?.addEventListener('click', () => {
      readFormState();
      try {
        const selected = findSelectedVersion(state);
        const plan = service.editDraftRoutePlan({
          principal,
          records: rawRoutes(state.routes),
          versionKey: versionKeyOf(selected),
          expectedRevision: revisionOf(selected),
          draftInput: toServiceDraftInput(service, state),
          processCapabilityId: state.processCapabilityId,
          kExpected: state.kExpected
        });
        setPlan(plan);
      } catch (error) {
        setError(error);
      }
    });

    const publish = containerElement.querySelector('#hr-btn-publish');
    publish?.addEventListener('click', () => {
      readFormState();
      try {
        const selected = findSelectedVersion(state);
        const plan = service.createPublishRoutePlan({
          principal,
          records: rawRoutes(state.routes),
          versionKey: versionKeyOf(selected),
          expectedRevision: revisionOf(selected),
          businessReason: state.remark,
          processCapabilityId: state.processCapabilityId,
          kExpected: state.kExpected
        });
        setPlan(plan);
      } catch (error) {
        setError(error);
      }
    });

    const supersede = containerElement.querySelector('#hr-btn-supersede');
    supersede?.addEventListener('click', () => {
      readFormState();
      try {
        const selected = findSelectedVersion(state);
        const routingKey = state.selectedRouteKey || routeKeyOf(selected);
        const candidates = state.routes.filter(route => routeKeyOf(route) === routingKey);
        const active = statusOf(selected) === ROUTING_STATUSES.ACTIVE
          ? selected
          : candidates.find(route => statusOf(route) === ROUTING_STATUSES.ACTIVE);
        const draft = statusOf(selected) === ROUTING_STATUSES.DRAFT
          ? selected
          : candidates.find(route => statusOf(route) === ROUTING_STATUSES.DRAFT);

        const plan = service.createSupersedeRoutePlan({
          principal,
          records: rawRoutes(state.routes),
          activeVersionKey: versionKeyOf(active),
          expectedActiveRevision: revisionOf(active),
          newVersionKey: versionKeyOf(draft),
          expectedNewRevision: revisionOf(draft),
          effectiveToDate: state.supersedeEffectiveToDate,
          businessReason: state.remark,
          processCapabilityId: state.processCapabilityId,
          kExpected: state.kExpected
        });
        setPlan(plan);
      } catch (error) {
        setError(error);
      }
    });
  };

  render();
  return {
    getState: () => ({ ...state, slotValues: { ...state.slotValues }, scorerValues: { ...state.scorerValues } }),
    setState: next => {
      state = { ...state, ...next };
      render();
    }
  };
}
