/**
 * MBO 2026 — HR Versioned Routing Self-Service Management Service (App 800 Integration)
 *
 * Pure local domain service. ZERO live Kintone API calls, ZERO mutations.
 * Enforces HR business authorization, Model A versioning, canonical Version_Key (<Routing_Key>#v<N>),
 * exact slot validation, ALL-only rules, distinct appraiser integrity, and mutation planning.
 */

import {
  D3RouteContractError,
  D3_ROUTE_PATTERNS,
  D3_SLOT_DEFINITIONS,
  getD3RoutePattern,
  normalizeD3RouteVersion,
  applyD3SelfElision,
  parseD3ScorerPrioritySlots,
  readD3String,
  readD3UserList,
  unwrapD3Field
} from '../config/d3-route-contract.js';

import {
  evaluateD3RouteViability,
  D3RouteViabilityError
} from './d3-route-viability-service.js';

import {
  D3_PROCESS_CAPABILITY_ID,
  D3_ACTIVE_ROUTE_SLOTS,
  D3_SLOT_FIELD_MAP
} from '../validation/validation-engine.js';

export class HrRoutingManagementServiceError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'HrRoutingManagementServiceError';
    this.code = code;
    this.details = details;
  }
}

export const ROUTING_ROLES = Object.freeze({
  HR: 'hr',
  ADMIN_FORM: 'admin-form'
});

export const ROUTING_PERMISSIONS = Object.freeze({
  VIEW: 'VIEW',
  PREVIEW: 'PREVIEW',
  VALIDATE: 'VALIDATE',
  CREATE_DRAFT: 'CREATE_DRAFT',
  EDIT_DRAFT: 'EDIT_DRAFT',
  PUBLISH: 'PUBLISH',
  SUPERSEDE: 'SUPERSEDE'
});

export const ROUTING_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  CANCELLED: 'CANCELLED'
});

export const TOPOLOGIES = Object.freeze({
  M1_ONLY: 'M1_ONLY',
  M1_G1: 'M1_G1',
  M1_M2_G1: 'M1_M2_G1',
  M1_G1_G2: 'M1_G1_G2',
  M1_M2_G1_G2: 'M1_M2_G1_G2'
});

export const TOPOLOGY_TO_PATTERN_MAP = Object.freeze({
  [TOPOLOGIES.M1_ONLY]: 'PATTERN_1_M1',
  [TOPOLOGIES.M1_G1]: 'PATTERN_2_M1_G1',
  [TOPOLOGIES.M1_M2_G1]: 'PATTERN_3A_M2_M1_G1',
  [TOPOLOGIES.M1_G1_G2]: 'PATTERN_3B_M1_G1_G2',
  [TOPOLOGIES.M1_M2_G1_G2]: 'PATTERN_4_M2_M1_G1_G2'
});

export const TOPOLOGY_CONFIGS = Object.freeze({
  [TOPOLOGIES.M1_ONLY]: Object.freeze({
    slots: Object.freeze(['M1']),
    label: 'M1 Only (1 Appraiser)'
  }),
  [TOPOLOGIES.M1_G1]: Object.freeze({
    slots: Object.freeze(['M1', 'G1']),
    label: 'M1 + G1 (2 Appraisers)'
  }),
  [TOPOLOGIES.M1_M2_G1]: Object.freeze({
    slots: Object.freeze(['M1', 'M2', 'G1']),
    label: 'M1 + M2 + G1 (3 Appraisers)'
  }),
  [TOPOLOGIES.M1_G1_G2]: Object.freeze({
    slots: Object.freeze(['M1', 'G1', 'G2']),
    label: 'M1 + G1 + G2 (3 Appraisers)'
  }),
  [TOPOLOGIES.M1_M2_G1_G2]: Object.freeze({
    slots: Object.freeze(['M1', 'M2', 'G1', 'G2']),
    label: 'M1 + M2 + G1 + G2 (4 Appraisers)'
  })
});

export function hasHrCapability(principal) {
  try {
    const norm = validatePrincipal(principal);
    return norm.groups.some(g => g.toLowerCase() === ROUTING_ROLES.HR.toLowerCase());
  } catch (_) {
    return false;
  }
}

export function hasAdminFormCapability(principal) {
  try {
    const norm = validatePrincipal(principal);
    return norm.groups.some(g => g.toLowerCase() === ROUTING_ROLES.ADMIN_FORM.toLowerCase());
  } catch (_) {
    return false;
  }
}

/**
 * High-level helper to validate a draft route form object.
 */
export function validateRoutingDraft(draft, { existingVersions = [], principal = { userCode: 'system', groups: ['hr'] } } = {}) {
  const errors = [];
  try {
    const candidate = buildCandidateRecordFromDraft(draft);
    HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: candidate,
      existingRecords: existingVersions
    });
    return { isValid: true, errors: [], candidate };
  } catch (err) {
    errors.push(err.message);
    return { isValid: false, errors, candidate: null };
  }
}

/**
 * High-level helper to generate a preview for a draft.
 */
export function previewRoutingPlan({ principal, draft, existingVersions = [] }) {
  const candidate = buildCandidateRecordFromDraft(draft);
  const activeSlots = (TOPOLOGY_CONFIGS[draft.topology]?.slots || ['M1']).map(slot => ({
    role: slot,
    userCode: draft.slots?.[slot] || ''
  }));

  const validation = validateRoutingDraft(draft, { existingVersions, principal });

  return {
    isValid: validation.isValid,
    topology: draft.topology,
    activeSlots,
    scorerSlots: draft.scorerSlots || { midYear: 'M1', final1: 'M1', final2: '' },
    processCapabilityId: D3_PROCESS_CAPABILITY_ID,
    inFlightImpact: 'NONE (ZERO)',
    warnings: validation.isValid ? [] : validation.errors,
    planPayload: validation.isValid ? candidate : null
  };
}

export function convertSlotNamesToOrdinals(slotNamesOrOrdinals, pattern) {
  const unwrapped = unwrapD3Field(slotNamesOrOrdinals);
  if (unwrapped === null || unwrapped === undefined || unwrapped === '') return '';
  const patternInfo = D3_ROUTE_PATTERNS[pattern];
  const sourceSlots = patternInfo ? patternInfo.sourceSlots : ['M1'];

  const items = Array.isArray(unwrapped)
    ? unwrapped
    : String(unwrapped).split(',').map(s => s.trim());

  const ordinals = [];
  for (const item of items) {
    if (!item) continue;
    const num = Number(item);
    if (Number.isInteger(num)) {
      if (!ordinals.includes(num)) ordinals.push(num);
    } else {
      const idx = sourceSlots.indexOf(item);
      if (idx !== -1) {
        const ord = idx + 1;
        if (!ordinals.includes(ord)) ordinals.push(ord);
      } else {
        ordinals.push(item);
      }
    }
  }
  return ordinals.join(',');
}

export function buildCandidateRecordFromDraft(draft = {}) {
  const topology = draft.topology || TOPOLOGIES.M1_ONLY;
  const pattern = draft.routePattern || TOPOLOGY_TO_PATTERN_MAP[topology] || 'PATTERN_1_M1';

  const rawScorer = draft.scorerPrioritySlots || (
    draft.scorerSlots
      ? [draft.scorerSlots.midYear, draft.scorerSlots.final1, draft.scorerSlots.final2].filter(Boolean)
      : '1'
  );
  const resolvedScorerOrdinals = convertSlotNamesToOrdinals(rawScorer, pattern);

  const record = {
    Routing_Key: { value: draft.routingKey || '' },
    Route_Pattern: { value: pattern },
    Routing_Topology: { value: topology },
    Effective_From: { value: draft.effectiveFrom || '' },
    Effective_To: { value: draft.effectiveTo || '' },
    Remark: { value: draft.businessReason || draft.remark || '' },
    Scorer_Priority_Slots: { value: resolvedScorerOrdinals }
  };

  // Populate slot fields
  const slots = draft.slots || {};
  const slotMapping = {
    M1: { approver: 'Manager_Level1_Approvers', rule: 'Manager_Level1_Approval_Rule' },
    M2: { approver: 'Manager_Level2_Approvers', rule: 'Manager_Level2_Approval_Rule' },
    G1: { approver: 'GM_Level1_Approvers', rule: 'GM_Level1_Approval_Rule' },
    G2: { approver: 'GM_Level2_Approvers', rule: 'GM_Level2_Approval_Rule' }
  };

  for (const [slot, { approver, rule }] of Object.entries(slotMapping)) {
    const code = slots[slot];
    if (code) {
      record[approver] = { value: [{ code }] };
      record[rule] = { value: 'ALL' };
    } else {
      record[approver] = { value: [] };
      record[rule] = { value: 'ALL' };
    }
  }

  return record;
}

export function validatePrincipal(principal) {
  if (!principal || typeof principal !== 'object') {
    throw new HrRoutingManagementServiceError(
      'ROUTING_PRINCIPAL_REQUIRED',
      'Security principal is required for routing management.'
    );
  }

  const { userCode, groups } = principal;

  if (typeof userCode !== 'string' || !userCode.trim() || userCode !== userCode.trim()) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_PRINCIPAL_INVALID',
      'Principal userCode must be a non-empty string without leading or trailing whitespace.'
    );
  }

  if (!Array.isArray(groups) || groups.length === 0 || !groups.every(g => typeof g === 'string' && g.trim().length > 0)) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_PRINCIPAL_INVALID',
      'Principal groups must be a non-empty array of non-empty strings.'
    );
  }

  return {
    userCode: userCode.trim(),
    groups: groups.map(g => g.trim())
  };
}

export function checkRoutingAuthorization(principal, action) {
  const norm = validatePrincipal(principal);
  const isHr = norm.groups.includes(ROUTING_ROLES.HR);
  const isAdminForm = norm.groups.includes(ROUTING_ROLES.ADMIN_FORM);

  switch (action) {
    case ROUTING_PERMISSIONS.VIEW:
    case ROUTING_PERMISSIONS.PREVIEW:
    case ROUTING_PERMISSIONS.VALIDATE:
      if (!isHr && !isAdminForm) {
        throw new HrRoutingManagementServiceError(
          'ROUTING_AUTHORIZATION_DENIED',
          `Principal ${norm.userCode} lacks view/preview authorization (requires hr or admin-form).`
        );
      }
      return true;

    case ROUTING_PERMISSIONS.CREATE_DRAFT:
    case ROUTING_PERMISSIONS.EDIT_DRAFT:
    case ROUTING_PERMISSIONS.PUBLISH:
    case ROUTING_PERMISSIONS.SUPERSEDE:
      if (!isHr) {
        throw new HrRoutingManagementServiceError(
          'ROUTING_HR_AUTHORIZATION_REQUIRED',
          `Principal ${norm.userCode} lacks HR business authorization for action: ${action}. admin-form alone is not authorized.`
        );
      }
      return true;

    default:
      throw new HrRoutingManagementServiceError(
        'ROUTING_UNKNOWN_ACTION',
        `Unknown routing authorization action: ${action}.`
      );
  }
}

export function validateDateString(dateStr, fieldName = 'Date') {
  const unwrapped = readD3String(dateStr);
  const clean = String(unwrapped ?? '').trim();
  if (!clean) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_INVALID_DATE_FORMAT',
      `${fieldName} must be formatted as YYYY-MM-DD (received: "${clean}").`
    );
  }
  const d = new Date(`${clean}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== clean) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_INVALID_DATE_CALENDAR',
      `${fieldName} is not a valid calendar date: "${clean}".`
    );
  }
  return clean;
}

export function validateEffectiveInterval(effectiveFrom, effectiveTo) {
  const from = validateDateString(effectiveFrom, 'Effective_From');
  if (!from) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_EFFECTIVE_FROM_REQUIRED',
      'Effective_From is required for routing versions.'
    );
  }
  const to = effectiveTo ? validateDateString(effectiveTo, 'Effective_To') : '';
  if (to && to < from) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_INVALID_EFFECTIVE_INTERVAL',
      `Effective_To ("${to}") cannot precede Effective_From ("${from}").`
    );
  }
  return { effectiveFrom: from, effectiveTo: to };
}

export function validateBusinessReason(reason) {
  const unwrapped = readD3String(reason);
  if (unwrapped === null || unwrapped === undefined || typeof unwrapped !== 'string' || !unwrapped.trim()) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_BUSINESS_REASON_REQUIRED',
      'Non-empty business reason (Remark) is required for routing mutations.'
    );
  }
  return unwrapped.trim();
}

export function deriveNextVersionNumber(existingVersions, routingKey) {
  const matching = (existingVersions || []).filter(v => {
    const rk = readD3String(v?.Routing_Key);
    return rk === routingKey;
  });

  if (matching.length === 0) {
    return 1;
  }

  const numbers = [];
  for (const v of matching) {
    const rawNum = readD3String(v?.Version_Number);
    const num = Number(rawNum);
    if (!Number.isInteger(num) || num < 1) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_VERSION_HISTORY_INCOMPLETE',
        `Version history for Routing_Key "${routingKey}" contains invalid Version_Number "${rawNum}".`
      );
    }
    numbers.push(num);
  }

  const max = Math.max(...numbers);
  return max + 1;
}

export function generateCanonicalVersionKey(routingKey, versionNumber) {
  if (!routingKey || typeof routingKey !== 'string' || !routingKey.trim()) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_KEY_REQUIRED',
      'Routing_Key is required to generate Version_Key.'
    );
  }
  if (!Number.isInteger(versionNumber) || versionNumber < 1) {
    throw new HrRoutingManagementServiceError(
      'ROUTING_INVALID_VERSION_NUMBER',
      `Version_Number must be a positive integer, received: ${versionNumber}.`
    );
  }
  return `${routingKey.trim()}#v${versionNumber}`;
}

export function checkIntervalOverlap(candidateFrom, candidateTo, existingActiveVersions, currentVersionKey = '') {
  const fromA = candidateFrom;
  const toA = candidateTo || '9999-12-31';

  for (const v of existingActiveVersions || []) {
    const vKey = readD3String(v?.Version_Key);
    if (currentVersionKey && vKey === currentVersionKey) {
      continue;
    }
    const status = readD3String(v?.Version_Status);
    if (status !== 'ACTIVE') {
      continue;
    }

    const fromB = readD3String(v?.Effective_From);
    const toB = readD3String(v?.Effective_To) || '9999-12-31';

    if (!fromB) continue;

    // Overlap condition: From_A <= To_B && From_B <= To_A
    if (fromA <= toB && fromB <= toA) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_EFFECTIVE_INTERVAL_OVERLAP',
        `Proposed effective interval [${fromA}..${candidateTo || 'open'}] overlaps with active version "${vKey}" [${fromB}..${v?.Effective_To ? readD3String(v.Effective_To) : 'open'}].`
      );
    }
  }
}

export class HrRoutingManagementService {
  /**
   * Filter and view version history for a Routing_Key.
   * Authorized for both 'hr' and 'admin-form'.
   */
  static getRoutingVersionHistory({ principal, records = [], routingKey }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.VIEW);

    const cleanRoutingKey = String(routingKey ?? '').trim();
    if (!cleanRoutingKey) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_KEY_REQUIRED',
        'Routing_Key is required to view version history.'
      );
    }

    const versions = records
      .filter(r => readD3String(r?.Routing_Key) === cleanRoutingKey)
      .map(r => ({
        routingKey: readD3String(r.Routing_Key),
        versionKey: readD3String(r.Version_Key),
        versionNumber: Number(readD3String(r.Version_Number)),
        versionStatus: readD3String(r.Version_Status),
        routePattern: readD3String(r.Route_Pattern),
        routingTopology: readD3String(r.Routing_Topology),
        effectiveFrom: readD3String(r.Effective_From),
        effectiveTo: readD3String(r.Effective_To),
        scorerPrioritySlots: readD3String(r.Scorer_Priority_Slots),
        remark: readD3String(r.Remark),
        recordRevision: r?.$revision?.value !== undefined ? String(r.$revision.value) : (r?.$revision ? String(r.$revision) : null),
        rawRecord: r
      }))
      .sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));

    return {
      routingKey: cleanRoutingKey,
      totalVersions: versions.length,
      versions
    };
  }

  /**
   * Validate a route version candidate against all D3 V1 invariants.
   * Authorized for both 'hr' and 'admin-form'.
   */
  static validateRouteCandidate({
    principal,
    routeCandidate,
    kExpected = 1,
    existingRecords = [],
    processCapabilityId = D3_PROCESS_CAPABILITY_ID
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.VALIDATE);

    if (processCapabilityId !== D3_PROCESS_CAPABILITY_ID) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_PROCESS_CAPABILITY_REQUIRED',
        `Exact process capability "${D3_PROCESS_CAPABILITY_ID}" is required (received: "${processCapabilityId || 'BLANK'}").`
      );
    }

    if (!routeCandidate || typeof routeCandidate !== 'object') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_CANDIDATE_REQUIRED',
        'Route candidate object is required for validation.'
      );
    }

    // 1. Validate route pattern
    const rawPattern = readD3String(routeCandidate.Route_Pattern);
    const patternInfo = getD3RoutePattern(rawPattern);
    const topology = patternInfo.topology;

    // 2. Validate declared topology matches pattern
    const declaredTopology = readD3String(routeCandidate.Routing_Topology);
    if (declaredTopology && declaredTopology !== topology) {
      throw new HrRoutingManagementServiceError(
        'ROUTE_PATTERN_TOPOLOGY_MISMATCH',
        `Pattern ${rawPattern} requires topology ${topology}, found "${declaredTopology}".`
      );
    }

    // 3. Validate active slots: exactly 1 user, ALL rule, distinct users
    const activeSlotKeys = D3_ACTIVE_ROUTE_SLOTS[topology] || [];
    const seenCodes = new Map();

    for (const slotKey of activeSlotKeys) {
      const { approverField, ruleField } = D3_SLOT_FIELD_MAP[slotKey];
      const rawUsers = unwrapD3Field(routeCandidate[approverField]);
      const users = Array.isArray(rawUsers) ? rawUsers : [];

      if (users.length === 0) {
        throw new HrRoutingManagementServiceError(
          'D3_V1_SLOT_USER_COUNT_INVALID',
          `Active slot ${slotKey} (${approverField}) is empty. Exactly 1 user is required.`
        );
      }
      if (users.length > 1) {
        throw new HrRoutingManagementServiceError(
          'D3_V1_SLOT_USER_COUNT_INVALID',
          `Active slot ${slotKey} (${approverField}) must have exactly 1 user (found ${users.length}).`
        );
      }

      const u = users[0];
      const isObj = typeof u === 'object' && u !== null && !Array.isArray(u);
      const code = isObj ? u.code : undefined;
      const isStr = typeof code === 'string';
      const isNonEmpty = isStr && code.length > 0;
      const isNotWs = isStr && code.trim().length > 0;

      if (!isObj || !isStr || !isNonEmpty || !isNotWs) {
        throw new HrRoutingManagementServiceError(
          'INVALID_APPRAISER_IDENTITY',
          `Slot ${slotKey} must contain a valid Kintone user object with exact non-empty code.`
        );
      }

      const rawRule = unwrapD3Field(routeCandidate[ruleField]);
      const rule = String(rawRule ?? '');
      if (rule !== 'ALL') {
        throw new HrRoutingManagementServiceError(
          'D3_V1_APPROVAL_RULE_NOT_ALL',
          `Active slot ${slotKey} rule (${ruleField}) must be strictly ALL (found "${rule}").`
        );
      }

      if (seenCodes.has(code)) {
        const prior = seenCodes.get(code);
        throw new HrRoutingManagementServiceError(
          'DUPLICATE_APPRAISER_IDENTITY',
          `Duplicate appraiser user "${code}" in active slots (${prior} and ${slotKey}).`
        );
      }
      seenCodes.set(code, slotKey);
    }

    // Inactive slots are not required.

    // 4. Effective interval validation
    const { effectiveFrom, effectiveTo } = validateEffectiveInterval(
      routeCandidate.Effective_From,
      routeCandidate.Effective_To
    );

    // 5. Scorer plan viability
    let viability;
    const rawScorer = routeCandidate.Scorer_Priority_Slots;
    const resolvedScorer = convertSlotNamesToOrdinals(rawScorer, rawPattern);
    const candidateWithResolvedScorer = {
      ...routeCandidate,
      Scorer_Priority_Slots: { value: resolvedScorer }
    };
    try {
      viability = evaluateD3RouteViability({
        routeVersion: candidateWithResolvedScorer,
        kExpected,
        scorerPrioritySlots: resolvedScorer
      });
    } catch (err) {
      if (err instanceof D3RouteViabilityError || err instanceof D3RouteContractError) {
        throw new HrRoutingManagementServiceError(err.code, err.message.replace(/^[^:]+:\s*/, ''));
      }
      throw err;
    }

    return {
      isValid: true,
      topology,
      routePattern: rawPattern,
      effectiveFrom,
      effectiveTo,
      activeSlotKeys,
      viability
    };
  }

  /**
   * Create a DRAFT route plan.
   * Strictly HR-only. Local mutation plan only.
   */
  static createDraftRoutePlan({
    principal,
    records = [],
    draftInput = {},
    processCapabilityId = D3_PROCESS_CAPABILITY_ID,
    kExpected = 1
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.CREATE_DRAFT);

    const reason = validateBusinessReason(draftInput.Remark);
    const routingKey = String(draftInput.Routing_Key ?? '').trim();
    if (!routingKey) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_KEY_REQUIRED',
        'Routing_Key is required to create a DRAFT route.'
      );
    }

    const versionNumber = deriveNextVersionNumber(records, routingKey);
    const versionKey = generateCanonicalVersionKey(routingKey, versionNumber);

    const patternInfo = getD3RoutePattern(draftInput.Route_Pattern);

    const candidate = {
      ...draftInput,
      Routing_Key: routingKey,
      Version_Key: versionKey,
      Version_Number: versionNumber,
      Version_Status: 'DRAFT',
      Route_Pattern: patternInfo.pattern,
      Routing_Topology: patternInfo.topology,
      Remark: reason
    };

    // Validate entire candidate
    HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: candidate,
      kExpected,
      existingRecords: records,
      processCapabilityId
    });

    return {
      status: 'PLAN_CREATED',
      operation: 'CREATE_DRAFT',
      current: null,
      proposed: candidate,
      mutationsPlanned: [
        {
          app: 795,
          action: 'INSERT_DRAFT',
          record: candidate
        }
      ],
      noMutationExecuted: true
    };
  }

  /**
   * Edit an existing DRAFT route plan.
   * Strictly HR-only. Local mutation plan only.
   */
  static editDraftRoutePlan({
    principal,
    records = [],
    versionKey,
    expectedRevision,
    draftInput = {},
    processCapabilityId = D3_PROCESS_CAPABILITY_ID,
    kExpected = 1
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.EDIT_DRAFT);

    if (expectedRevision === undefined || expectedRevision === null || String(expectedRevision).trim() === '') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_REVISION_REQUIRED',
        'Explicit expected revision is required to edit a DRAFT route.'
      );
    }

    const cleanVk = String(versionKey ?? '').trim();
    const existing = (records || []).find(r => readD3String(r?.Version_Key) === cleanVk);
    if (!existing) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_VERSION_NOT_FOUND',
        `Route version with Version_Key "${cleanVk}" was not found.`
      );
    }

    const actualRev = existing.$revision?.value !== undefined
      ? String(existing.$revision.value)
      : (existing.$revision ? String(existing.$revision) : '');
    if (actualRev && actualRev !== String(expectedRevision).trim()) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_REVISION_CONFLICT',
        `Revision conflict: expected revision ${expectedRevision}, actual revision ${actualRev}.`
      );
    }

    const status = readD3String(existing.Version_Status);
    if (status !== 'DRAFT') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_LIFECYCLE_IMMUTABLE',
        `Only DRAFT versions can be edited. Version "${cleanVk}" is in status "${status}".`
      );
    }

    const reason = validateBusinessReason(draftInput.Remark);
    const patternInfo = getD3RoutePattern(draftInput.Route_Pattern || existing.Route_Pattern);

    const updated = {
      ...existing,
      ...draftInput,
      Routing_Key: readD3String(existing.Routing_Key),
      Version_Key: cleanVk,
      Version_Number: Number(readD3String(existing.Version_Number)),
      Version_Status: 'DRAFT',
      Route_Pattern: patternInfo.pattern,
      Routing_Topology: patternInfo.topology,
      Remark: reason
    };

    HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: updated,
      kExpected,
      existingRecords: records,
      processCapabilityId
    });

    return {
      status: 'PLAN_CREATED',
      operation: 'EDIT_DRAFT',
      current: existing,
      proposed: updated,
      mutationsPlanned: [
        {
          app: 795,
          action: 'UPDATE_DRAFT',
          versionKey: cleanVk,
          expectedRevision: String(expectedRevision).trim(),
          record: updated
        }
      ],
      noMutationExecuted: true
    };
  }

  /**
   * Delete a route version.
   * HISTORICAL_ROUTE_DELETE is NEVER permitted.
   */
  static deleteRoutePlan() {
    throw new HrRoutingManagementServiceError(
      'ROUTING_DELETE_FORBIDDEN',
      'Historical route versions can NEVER be deleted. Version immutability is strictly enforced.'
    );
  }

  /**
   * Create a Publish route plan.
   * Strictly HR-only. Local mutation plan only.
   */
  static createPublishRoutePlan({
    principal,
    records = [],
    versionKey,
    expectedRevision,
    businessReason,
    processCapabilityId = D3_PROCESS_CAPABILITY_ID,
    kExpected = 1
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.PUBLISH);

    const reason = validateBusinessReason(businessReason);

    if (expectedRevision === undefined || expectedRevision === null || String(expectedRevision).trim() === '') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_REVISION_REQUIRED',
        'Explicit expected revision is required to publish a route version.'
      );
    }

    const cleanVk = String(versionKey ?? '').trim();
    const existing = (records || []).find(r => readD3String(r?.Version_Key) === cleanVk);
    if (!existing) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_VERSION_NOT_FOUND',
        `Route version with Version_Key "${cleanVk}" was not found.`
      );
    }

    const actualRev = existing.$revision?.value !== undefined
      ? String(existing.$revision.value)
      : (existing.$revision ? String(existing.$revision) : '');
    if (actualRev && actualRev !== String(expectedRevision).trim()) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_REVISION_CONFLICT',
        `Revision conflict: expected revision ${expectedRevision}, actual revision ${actualRev}.`
      );
    }

    const status = readD3String(existing.Version_Status);
    if (status !== 'DRAFT') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_LIFECYCLE_IMMUTABLE',
        `Only DRAFT versions can be published. Version "${cleanVk}" is in status "${status}".`
      );
    }

    const candidate = {
      ...existing,
      Version_Status: 'ACTIVE',
      Remark: reason
    };

    // Full validation
    const validInfo = HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: candidate,
      kExpected,
      existingRecords: records,
      processCapabilityId
    });

    // Check interval overlap with other active versions
    const routingKey = readD3String(candidate.Routing_Key);
    const activeForRk = (records || []).filter(r => readD3String(r?.Routing_Key) === routingKey && readD3String(r?.Version_Status) === 'ACTIVE');
    checkIntervalOverlap(validInfo.effectiveFrom, validInfo.effectiveTo, activeForRk, cleanVk);

    return {
      status: 'PLAN_CREATED',
      operation: 'PUBLISH_VERSION',
      current: existing,
      proposed: candidate,
      mutationsPlanned: [
        {
          app: 795,
          action: 'PUBLISH_RECORD',
          versionKey: cleanVk,
          expectedRevision: String(expectedRevision).trim(),
          record: candidate
        }
      ],
      noMutationExecuted: true
    };
  }

  /**
   * Create a Supersession route plan.
   * Strictly HR-only. Closes active interval and promotes new version.
   */
  static createSupersedeRoutePlan({
    principal,
    records = [],
    activeVersionKey,
    expectedActiveRevision,
    newVersionKey,
    expectedNewRevision,
    effectiveToDate,
    businessReason,
    processCapabilityId = D3_PROCESS_CAPABILITY_ID,
    kExpected = 1
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.SUPERSEDE);

    const reason = validateBusinessReason(businessReason);

    if (!expectedActiveRevision || !expectedNewRevision) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_REVISION_REQUIRED',
        'Both expectedActiveRevision and expectedNewRevision are required for supersession.'
      );
    }

    const cleanActiveVk = String(activeVersionKey ?? '').trim();
    const cleanNewVk = String(newVersionKey ?? '').trim();

    const activeRec = (records || []).find(r => readD3String(r?.Version_Key) === cleanActiveVk);
    if (!activeRec) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_VERSION_NOT_FOUND',
        `Active version "${cleanActiveVk}" was not found.`
      );
    }

    const newRec = (records || []).find(r => readD3String(r?.Version_Key) === cleanNewVk);
    if (!newRec) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_VERSION_NOT_FOUND',
        `New version "${cleanNewVk}" was not found.`
      );
    }

    if (readD3String(activeRec.Version_Status) !== 'ACTIVE') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_LIFECYCLE_IMMUTABLE',
        `Target to supersede "${cleanActiveVk}" must be ACTIVE (status is "${readD3String(activeRec.Version_Status)}").`
      );
    }

    if (readD3String(newRec.Version_Status) !== 'DRAFT') {
      throw new HrRoutingManagementServiceError(
        'ROUTING_LIFECYCLE_IMMUTABLE',
        `New version "${cleanNewVk}" must be DRAFT to activate via supersession (status is "${readD3String(newRec.Version_Status)}").`
      );
    }

    const closeDate = validateDateString(effectiveToDate, 'Effective_To');
    if (!closeDate) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_EFFECTIVE_TO_REQUIRED',
        'Explicit Effective_To date is required to close the superseded version.'
      );
    }

    const activeFrom = readD3String(activeRec.Effective_From);
    if (closeDate < activeFrom) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_INVALID_EFFECTIVE_INTERVAL',
        `Superseded Effective_To (${closeDate}) cannot precede Effective_From (${activeFrom}).`
      );
    }

    // Proposed changes
    const supersededRec = {
      ...activeRec,
      Version_Status: 'SUPERSEDED',
      Effective_To: closeDate,
      Remark: `${readD3String(activeRec.Remark) || ''}\n[SUPERSEDED]: ${reason}`.trim()
    };

    const activatedRec = {
      ...newRec,
      Version_Status: 'ACTIVE',
      Remark: reason
    };

    // Validate new version
    const validInfo = HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: activatedRec,
      kExpected,
      existingRecords: records,
      processCapabilityId
    });

    // Check overlap: activeRec is now closed at closeDate
    const routingKey = readD3String(activeRec.Routing_Key);
    const activeVersions = (records || [])
      .filter(r => readD3String(r?.Routing_Key) === routingKey && readD3String(r?.Version_Status) === 'ACTIVE')
      .map(r => readD3String(r?.Version_Key) === cleanActiveVk ? supersededRec : r);

    checkIntervalOverlap(validInfo.effectiveFrom, validInfo.effectiveTo, activeVersions, cleanNewVk);

    return {
      status: 'PLAN_CREATED',
      operation: 'SUPERSEDE_VERSION',
      current: {
        activeVersion: activeRec,
        newVersion: newRec
      },
      proposed: {
        supersededVersion: supersededRec,
        activatedVersion: activatedRec
      },
      mutationsPlanned: [
        {
          app: 795,
          action: 'SUPERSEDE_RECORD',
          versionKey: cleanActiveVk,
          expectedRevision: String(expectedActiveRevision).trim(),
          updates: {
            Version_Status: 'SUPERSEDED',
            Effective_To: closeDate,
            Remark: supersededRec.Remark
          }
        },
        {
          app: 795,
          action: 'ACTIVATE_RECORD',
          versionKey: cleanNewVk,
          expectedRevision: String(expectedNewRevision).trim(),
          updates: {
            Version_Status: 'ACTIVE',
            Remark: activatedRec.Remark
          }
        }
      ],
      noMutationExecuted: true
    };
  }

  /**
   * Before / After Preview Generator.
   * Authorized for both 'hr' and 'admin-form'.
   */
  static generateRoutePreview({
    principal,
    currentVersion = null,
    proposedVersion = null,
    routingKey = '',
    hypotheticalRecords = [],
    employeeUserCode = '',
    isOwnMbo = false
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.PREVIEW);

    const formatVersionSummary = (v) => {
      if (!v) return null;
      const pattern = readD3String(v.Route_Pattern);
      const topology = readD3String(v.Routing_Topology) || (pattern ? D3_ROUTE_PATTERNS[pattern]?.topology : '');
      const activeSlots = D3_ACTIVE_ROUTE_SLOTS[topology] || [];

      const orderedAppraisers = activeSlots.map(slotKey => {
        const { approverField } = D3_SLOT_FIELD_MAP[slotKey];
        const users = unwrapD3Field(v[approverField]) || [];
        const code = Array.isArray(users) && users[0] ? users[0].code : '';
        return { slot: slotKey, userCode: code };
      });

      return {
        versionKey: readD3String(v.Version_Key),
        versionNumber: Number(readD3String(v.Version_Number)),
        status: readD3String(v.Version_Status),
        routePattern: pattern,
        topology,
        orderedAppraisers,
        scorerPriorities: readD3String(v.Scorer_Priority_Slots),
        effectiveFrom: readD3String(v.Effective_From),
        effectiveTo: readD3String(v.Effective_To)
      };
    };

    const cur = formatVersionSummary(currentVersion);
    const prop = formatVersionSummary(proposedVersion);

    const differences = {
      topologyChanged: cur && prop ? cur.topology !== prop.topology : false,
      appraiserChanges: [],
      scorerChanges: cur && prop ? cur.scorerPriorities !== prop.scorerPriorities : false,
      dateChanges: {
        fromChanged: cur && prop ? cur.effectiveFrom !== prop.effectiveFrom : false,
        toChanged: cur && prop ? cur.effectiveTo !== prop.effectiveTo : false
      },
      statusChanged: cur && prop ? cur.status !== prop.status : false
    };

    if (cur && prop) {
      const allSlots = Array.from(new Set([
        ...cur.orderedAppraisers.map(a => a.slot),
        ...prop.orderedAppraisers.map(a => a.slot)
      ]));
      for (const slot of allSlots) {
        const cCode = cur.orderedAppraisers.find(a => a.slot === slot)?.userCode || '(none)';
        const pCode = prop.orderedAppraisers.find(a => a.slot === slot)?.userCode || '(none)';
        if (cCode !== pCode) {
          differences.appraiserChanges.push({ slot, from: cCode, to: pCode });
        }
      }
    }

    const futureImpact = {
      routingKeyAffected: routingKey || (prop ? prop.versionKey?.split('#')[0] : ''),
      effectiveIntervalAffected: prop ? `[${prop.effectiveFrom}..${prop.effectiveTo || 'open'}]` : 'N/A',
      resolutionTiming: 'Future explicit resolution points only (Effective_From <= T <= Effective_To)',
      inFlightApp794Impact: 'NONE',
      hypotheticalEvaluationsPreview: Array.isArray(hypotheticalRecords) && hypotheticalRecords.length > 0
        ? hypotheticalRecords.map(r => ({
            id: r.$id?.value || r.id || 'N/A',
            employeeCode: r.Employee_Code?.value || r.employeeCode || 'N/A',
            source: 'Supplied preview data only'
          }))
        : 'Zero live reads performed; no exact live record counts claimed.'
    };

    let selfElisionPreview = null;
    if (prop && employeeUserCode) {
      selfElisionPreview = HrRoutingManagementService.generateSelfElisionPreview({
        principal,
        routeCandidate: proposedVersion,
        employeeUserCode,
        isOwnMbo
      });
    }

    return {
      currentVersion: cur,
      proposedVersion: prop,
      differences,
      futureImpact,
      selfElisionPreview
    };
  }

  /**
   * Self-Elision Preview Generator.
   * Authorized for both 'hr' and 'admin-form'.
   */
  static generateSelfElisionPreview({
    principal,
    routeCandidate,
    employeeUserCode = '',
    isOwnMbo = false,
    kExpected = 1
  }) {
    checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.PREVIEW);

    if (!routeCandidate) {
      throw new HrRoutingManagementServiceError(
        'ROUTING_CANDIDATE_REQUIRED',
        'Route candidate is required for self-elision preview.'
      );
    }

    try {
      const rawPattern = readD3String(routeCandidate.Route_Pattern);
      const rawScorer = routeCandidate.Scorer_Priority_Slots;
      const resolvedScorer = rawPattern ? convertSlotNamesToOrdinals(rawScorer, rawPattern) : rawScorer;
      const candidateToEvaluate = {
        ...routeCandidate,
        Scorer_Priority_Slots: { value: resolvedScorer }
      };

      const viability = evaluateD3RouteViability({
        routeVersion: candidateToEvaluate,
        kExpected,
        employeeUserCode,
        isOwnMbo,
        scorerPrioritySlots: resolvedScorer
      });

      return {
        isSelfElisionApplied: isOwnMbo,
        targetEmployeeUserCode: employeeUserCode,
        configuredTopology: viability.configuredRoute.topology,
        effectiveTopology: viability.effectiveRoute.topology,
        survivingAppraisers: viability.effectiveRoute.businessSlots.map(s => ({
          ordinal: s.ordinal,
          slot: s.targetSlot,
          userCode: s.user.code
        })),
        activeScorers: viability.activeScorers.map(s => ({
          rank: s.scorerRank,
          userCode: s.user.code,
          weight: s.weight
        }))
      };
    } catch (err) {
      if (err instanceof D3RouteViabilityError || err instanceof D3RouteContractError) {
        return {
          isSelfElisionApplied: isOwnMbo,
          targetEmployeeUserCode: employeeUserCode,
          conflict: true,
          errorCode: err.code,
          errorMessage: err.message.replace(/^[^:]+:\s*/, '')
        };
      }
      throw err;
    }
  }
}
