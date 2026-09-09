/**
 * MBO2026 — D3-IMP-06-R1 strict HR routing management facade.
 *
 * This file is the sole public service boundary for App800 routing management.
 * The D3-IMP-06 implementation is retained in the adjacent base module to
 * minimize regression surface, but every public R1 path below requires the
 * explicit authorities that D3-IMP-06 previously defaulted.
 *
 * LOCAL ONLY. ZERO KINTONE / ZERO PROCESS WRITE / ZERO DEPLOYMENT.
 */

import * as Base from './hr-routing-management-service-d3imp06-base.js';
import { D3_PROCESS_CAPABILITY_ID } from '../validation/validation-engine.js';

export {
  HrRoutingManagementServiceError,
  ROUTING_ROLES,
  ROUTING_PERMISSIONS,
  ROUTING_STATUSES,
  TOPOLOGIES,
  TOPOLOGY_TO_PATTERN_MAP,
  hasHrCapability,
  hasAdminFormCapability,
  convertSlotNamesToOrdinals,
  validatePrincipal,
  checkRoutingAuthorization,
  validateDateString,
  validateEffectiveInterval,
  validateBusinessReason,
  generateCanonicalVersionKey,
  checkIntervalOverlap
} from './hr-routing-management-service-d3imp06-base.js';

const E = Base.HrRoutingManagementServiceError;
const P = Base.ROUTING_PERMISSIONS;

function unwrap(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value;
  }
  return value;
}

function readString(value) {
  const raw = unwrap(value);
  if (raw === null || raw === undefined) return '';
  return String(raw);
}

function exactNonBlank(value) {
  const raw = readString(value);
  return raw && raw === raw.trim() ? raw : '';
}

function requireKExpected(kExpected) {
  if (kExpected === undefined || kExpected === null || String(unwrap(kExpected)).trim() === '') {
    throw new E(
      'ROUTING_K_EXPECTED_REQUIRED',
      'Explicit frozen/published K_expected authority is required; no default is permitted.'
    );
  }
  const parsed = Number(unwrap(kExpected));
  if (parsed !== 1 && parsed !== 2) {
    throw new E(
      'INVALID_K_EXPECTED',
      `K_expected must be exactly 1 or 2, received ${String(unwrap(kExpected))}.`
    );
  }
  return parsed;
}

function requireProcessCapability(processCapabilityId) {
  const supplied = exactNonBlank(processCapabilityId);
  if (!supplied) {
    throw new E(
      'ROUTING_PROCESS_CAPABILITY_REQUIRED',
      `Explicit process capability "${D3_PROCESS_CAPABILITY_ID}" is required; no default is permitted.`
    );
  }
  if (supplied !== D3_PROCESS_CAPABILITY_ID) {
    throw new E(
      'ROUTING_PROCESS_CAPABILITY_REQUIRED',
      `Exact process capability "${D3_PROCESS_CAPABILITY_ID}" is required (received: "${supplied}").`
    );
  }
  return supplied;
}

function hasConfiguredScorerValue(value) {
  const raw = unwrap(value);
  if (Array.isArray(raw)) {
    return raw.some(item => exactNonBlank(item));
  }
  return exactNonBlank(raw) !== '';
}

function scorerSourceFromDraft(draft = {}) {
  if (Object.prototype.hasOwnProperty.call(draft, 'scorerPrioritySlots')) {
    return draft.scorerPrioritySlots;
  }
  if (Object.prototype.hasOwnProperty.call(draft, 'Scorer_Priority_Slots')) {
    return draft.Scorer_Priority_Slots;
  }
  if (draft.scorerSlots && typeof draft.scorerSlots === 'object') {
    return [draft.scorerSlots.midYear, draft.scorerSlots.final1, draft.scorerSlots.final2]
      .filter(item => exactNonBlank(item));
  }
  return undefined;
}

function requireScorerPlan(routeOrDraft) {
  const source = scorerSourceFromDraft(routeOrDraft || {});
  if (!hasConfiguredScorerValue(source)) {
    throw new E(
      'SCORER_PLAN_NOT_CONFIGURED',
      'Explicit HR-authorized scorer plan is required; no slot-1/M1 fallback is permitted.'
    );
  }
  return source;
}

function normalizeRoutingKey(value) {
  const key = exactNonBlank(value);
  if (!key) {
    throw new E('ROUTING_KEY_REQUIRED', 'Routing_Key must be an exact non-empty string.');
  }
  return key;
}

function requireHistoryCompleteness(historyCompleteness, routingKey) {
  const key = normalizeRoutingKey(routingKey);
  if (!historyCompleteness || typeof historyCompleteness !== 'object') {
    throw new E(
      'ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED',
      `Explicit completeness proof is required before deriving the next Version_Number for Routing_Key "${key}".`
    );
  }
  if (historyCompleteness.complete !== true || exactNonBlank(historyCompleteness.routingKey) !== key) {
    throw new E(
      'ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED',
      `Version history completeness must be explicitly confirmed for the exact Routing_Key "${key}".`
    );
  }
  return Object.freeze({ routingKey: key, complete: true });
}

function routeRevision(record) {
  const raw = unwrap(record?.$revision);
  const revision = exactNonBlank(raw);
  if (!revision) {
    throw new E(
      'ROUTING_RECORD_REVISION_REQUIRED',
      'Actual $revision is required for revision-guarded routing mutation planning.'
    );
  }
  return revision;
}

function expectedRevision(value, label) {
  const revision = exactNonBlank(value);
  if (!revision) {
    throw new E('ROUTING_REVISION_REQUIRED', `${label} is required.`);
  }
  return revision;
}

function findByVersionKey(records, versionKey) {
  const key = exactNonBlank(versionKey);
  if (!key) return null;
  return (Array.isArray(records) ? records : []).find(record => readString(record?.Version_Key) === key) || null;
}

function assertRevisionMatches(record, expected, label) {
  const expectedValue = expectedRevision(expected, label);
  const actualValue = routeRevision(record);
  if (actualValue !== expectedValue) {
    throw new E(
      'ROUTING_REVISION_CONFLICT',
      `${label} is stale: expected revision ${expectedValue}, actual revision ${actualValue}.`
    );
  }
  return actualValue;
}

export const TOPOLOGY_CONFIGS = Object.freeze({
  [Base.TOPOLOGIES.M1_ONLY]: Object.freeze({
    slots: Object.freeze(['M1']),
    label: 'M1 Only (1 Appraiser)'
  }),
  [Base.TOPOLOGIES.M1_G1]: Object.freeze({
    slots: Object.freeze(['M1', 'G1']),
    label: 'M1 + G1 (2 Appraisers)'
  }),
  [Base.TOPOLOGIES.M1_M2_G1]: Object.freeze({
    slots: Object.freeze(['M2', 'M1', 'G1']),
    label: 'M2 + M1 + G1 (3 Appraisers)'
  }),
  [Base.TOPOLOGIES.M1_G1_G2]: Object.freeze({
    slots: Object.freeze(['M1', 'G1', 'G2']),
    label: 'M1 + G1 + G2 (3 Appraisers)'
  }),
  [Base.TOPOLOGIES.M1_M2_G1_G2]: Object.freeze({
    slots: Object.freeze(['M2', 'M1', 'G1', 'G2']),
    label: 'M2 + M1 + G1 + G2 (4 Appraisers)'
  })
});

export function buildCandidateRecordFromDraft(draft = {}) {
  requireScorerPlan(draft);
  return Base.buildCandidateRecordFromDraft(draft);
}

export function deriveNextVersionNumber(existingVersions, routingKey, historyCompleteness) {
  if (!Array.isArray(existingVersions)) {
    throw new E(
      'ROUTING_VERSION_HISTORY_INCOMPLETE',
      'Supplied routing version history must be an explicit array.'
    );
  }
  const key = normalizeRoutingKey(routingKey);
  requireHistoryCompleteness(historyCompleteness, key);
  return Base.deriveNextVersionNumber(existingVersions, key);
}

export function validateRoutingDraft(
  draft,
  {
    existingVersions = [],
    principal,
    kExpected,
    processCapabilityId
  } = {}
) {
  const errors = [];
  try {
    const candidate = buildCandidateRecordFromDraft(draft);
    HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: candidate,
      existingRecords: existingVersions,
      kExpected,
      processCapabilityId
    });
    return { isValid: true, errors: [], candidate };
  } catch (error) {
    errors.push(error.message);
    return { isValid: false, errors, candidate: null };
  }
}

export function previewRoutingPlan({
  principal,
  draft,
  existingVersions = [],
  kExpected,
  processCapabilityId
}) {
  const normalizedK = requireKExpected(kExpected);
  const capability = requireProcessCapability(processCapabilityId);
  requireScorerPlan(draft);

  const config = TOPOLOGY_CONFIGS[draft?.topology];
  if (!config) {
    throw new E(
      'ROUTING_TOPOLOGY_REQUIRED',
      `A supported routing topology is required for preview (received: "${String(draft?.topology ?? '')}").`
    );
  }

  const candidate = buildCandidateRecordFromDraft(draft);
  const validation = validateRoutingDraft(draft, {
    existingVersions,
    principal,
    kExpected: normalizedK,
    processCapabilityId: capability
  });

  return {
    isValid: validation.isValid,
    topology: draft.topology,
    activeSlots: config.slots.map(slot => ({
      role: slot,
      userCode: draft?.slots?.[slot] || ''
    })),
    scorerSlots: draft.scorerSlots || null,
    scorerPrioritySlots: scorerSourceFromDraft(draft),
    kExpected: normalizedK,
    processCapabilityId: capability,
    inFlightImpact: 'NONE (ZERO)',
    warnings: validation.isValid ? [] : validation.errors,
    planPayload: validation.isValid ? candidate : null
  };
}

export class HrRoutingManagementService extends Base.HrRoutingManagementService {
  static validateRouteCandidate({
    principal,
    routeCandidate,
    kExpected,
    existingRecords = [],
    processCapabilityId
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.VALIDATE);
    const normalizedK = requireKExpected(kExpected);
    const capability = requireProcessCapability(processCapabilityId);
    requireScorerPlan(routeCandidate);
    return super.validateRouteCandidate({
      principal,
      routeCandidate,
      kExpected: normalizedK,
      existingRecords,
      processCapabilityId: capability
    });
  }

  static validateRoutingDraft({
    principal,
    draft,
    records = [],
    kExpected,
    processCapabilityId
  } = {}) {
    return validateRoutingDraft(draft, {
      existingVersions: records,
      principal,
      kExpected,
      processCapabilityId
    });
  }

  static previewRoutingPlan({
    principal,
    draft,
    records = [],
    kExpected,
    processCapabilityId
  } = {}) {
    return previewRoutingPlan({
      principal,
      draft,
      existingVersions: records,
      kExpected,
      processCapabilityId
    });
  }

  static buildCandidateRecordFromDraft({ draft } = {}) {
    return buildCandidateRecordFromDraft(draft);
  }

  static createDraftRoutePlan({
    principal,
    records = [],
    draftInput = {},
    processCapabilityId,
    kExpected,
    historyCompleteness
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.CREATE_DRAFT);
    const normalizedK = requireKExpected(kExpected);
    const capability = requireProcessCapability(processCapabilityId);
    requireScorerPlan(draftInput);
    const routingKey = normalizeRoutingKey(draftInput.Routing_Key);
    requireHistoryCompleteness(historyCompleteness, routingKey);

    return super.createDraftRoutePlan({
      principal,
      records,
      draftInput,
      processCapabilityId: capability,
      kExpected: normalizedK
    });
  }

  static editDraftRoutePlan({
    principal,
    records = [],
    versionKey,
    expectedRevision: expected,
    draftInput = {},
    processCapabilityId,
    kExpected
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.EDIT_DRAFT);
    const normalizedK = requireKExpected(kExpected);
    const capability = requireProcessCapability(processCapabilityId);
    const existing = findByVersionKey(records, versionKey);
    if (existing) {
      assertRevisionMatches(existing, expected, 'expectedRevision');
      requireScorerPlan(
        Object.prototype.hasOwnProperty.call(draftInput, 'Scorer_Priority_Slots')
          ? draftInput
          : existing
      );
    }

    return super.editDraftRoutePlan({
      principal,
      records,
      versionKey,
      expectedRevision: expected,
      draftInput,
      processCapabilityId: capability,
      kExpected: normalizedK
    });
  }

  static createPublishRoutePlan({
    principal,
    records = [],
    versionKey,
    expectedRevision: expected,
    businessReason,
    processCapabilityId,
    kExpected
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.PUBLISH);
    const normalizedK = requireKExpected(kExpected);
    const capability = requireProcessCapability(processCapabilityId);
    const existing = findByVersionKey(records, versionKey);
    if (existing) {
      assertRevisionMatches(existing, expected, 'expectedRevision');
      requireScorerPlan(existing);
    }

    return super.createPublishRoutePlan({
      principal,
      records,
      versionKey,
      expectedRevision: expected,
      businessReason,
      processCapabilityId: capability,
      kExpected: normalizedK
    });
  }

  static createSupersedeRoutePlan({
    principal,
    records = [],
    activeVersionKey,
    expectedActiveRevision,
    newVersionKey,
    expectedNewRevision,
    effectiveToDate,
    businessReason,
    processCapabilityId,
    kExpected
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.SUPERSEDE);
    const normalizedK = requireKExpected(kExpected);
    const capability = requireProcessCapability(processCapabilityId);

    const activeRec = findByVersionKey(records, activeVersionKey);
    const newRec = findByVersionKey(records, newVersionKey);

    if (activeRec) {
      assertRevisionMatches(activeRec, expectedActiveRevision, 'expectedActiveRevision');
    }
    if (newRec) {
      assertRevisionMatches(newRec, expectedNewRevision, 'expectedNewRevision');
      requireScorerPlan(newRec);
    }

    if (activeRec && newRec) {
      const activeRoutingKey = normalizeRoutingKey(readString(activeRec.Routing_Key));
      const newRoutingKey = normalizeRoutingKey(readString(newRec.Routing_Key));
      if (activeRoutingKey !== newRoutingKey) {
        throw new E(
          'ROUTING_SUPERSESSION_ROUTING_KEY_MISMATCH',
          `Supersession requires identical Routing_Key values; active="${activeRoutingKey}", new="${newRoutingKey}".`
        );
      }
    }

    return super.createSupersedeRoutePlan({
      principal,
      records,
      activeVersionKey,
      expectedActiveRevision,
      newVersionKey,
      expectedNewRevision,
      effectiveToDate,
      businessReason,
      processCapabilityId: capability,
      kExpected: normalizedK
    });
  }

  static generateSelfElisionPreview({
    principal,
    routeCandidate,
    employeeUserCode = '',
    isOwnMbo = false,
    kExpected
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.PREVIEW);
    const normalizedK = requireKExpected(kExpected);
    requireScorerPlan(routeCandidate);
    return super.generateSelfElisionPreview({
      principal,
      routeCandidate,
      employeeUserCode,
      isOwnMbo,
      kExpected: normalizedK
    });
  }

  static generateRoutePreview({
    principal,
    currentVersion = null,
    proposedVersion = null,
    routingKey = '',
    hypotheticalRecords = [],
    employeeUserCode = '',
    isOwnMbo = false,
    kExpected,
    processCapabilityId
  } = {}) {
    Base.checkRoutingAuthorization(principal, P.PREVIEW);
    const normalizedK = requireKExpected(kExpected);
    requireProcessCapability(processCapabilityId);
    if (proposedVersion) requireScorerPlan(proposedVersion);

    const result = super.generateRoutePreview({
      principal,
      currentVersion,
      proposedVersion,
      routingKey,
      hypotheticalRecords,
      employeeUserCode: '',
      isOwnMbo: false
    });

    if (proposedVersion && employeeUserCode) {
      result.selfElisionPreview = this.generateSelfElisionPreview({
        principal,
        routeCandidate: proposedVersion,
        employeeUserCode,
        isOwnMbo,
        kExpected: normalizedK
      });
    }
    return result;
  }
}
