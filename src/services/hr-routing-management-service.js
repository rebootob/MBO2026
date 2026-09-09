/**
 * MBO2026 — D3-IMP-06-R1-C1 preview/validation version-context facade.
 *
 * Extends the accepted R1 fail-closed service boundary with one additional rule:
 * preview/validation must resolve an exact version identity without guessing.
 *
 * NEW draft:
 *   complete history proof for exact Routing_Key -> deterministic max+1 identity.
 * EXISTING draft:
 *   exact Version_Key present in supplied records -> preserve existing identity.
 *
 * LOCAL ONLY. ZERO KINTONE / ZERO PROCESS WRITE / ZERO DEPLOYMENT.
 */

// Architectural lineage marker retained for the accepted R1 regression guard:
// hr-routing-management-service-d3imp06-base.js
import * as R1 from './hr-routing-management-service-r1-d3imp06-base.js';

export * from './hr-routing-management-service-r1-d3imp06-base.js';

const E = R1.HrRoutingManagementServiceError;
const VALIDATE = R1.ROUTING_PERMISSIONS.VALIDATE;

function unwrap(value) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, 'value')
  ) {
    return value.value;
  }
  return value;
}

function exactNonBlank(value) {
  const raw = unwrap(value);
  if (raw === null || raw === undefined) return '';
  const text = String(raw);
  return text && text === text.trim() ? text : '';
}

function routingKeyFromDraft(draft = {}) {
  const key = exactNonBlank(
    Object.prototype.hasOwnProperty.call(draft, 'routingKey')
      ? draft.routingKey
      : draft.Routing_Key
  );
  if (!key) {
    throw new E(
      'ROUTING_KEY_REQUIRED',
      'Exact Routing_Key is required before resolving preview/validation version context.'
    );
  }
  return key;
}

function recordRoutingKey(record) {
  return exactNonBlank(record?.Routing_Key);
}

function recordVersionKey(record) {
  return exactNonBlank(record?.Version_Key);
}

function findVersion(records, versionKey) {
  return (Array.isArray(records) ? records : []).find(
    record => recordVersionKey(record) === versionKey
  ) || null;
}

function requireExistingVersionContext(versionContext, records, routingKey) {
  if (!versionContext || typeof versionContext !== 'object') return null;

  const versionKey = exactNonBlank(versionContext.versionKey);
  if (!versionKey) {
    throw new E(
      'ROUTING_VERSION_CONTEXT_REQUIRED',
      'Existing preview/validation context must contain an exact non-empty Version_Key.'
    );
  }

  const record = findVersion(records, versionKey);
  if (!record) {
    throw new E(
      'ROUTING_VERSION_CONTEXT_NOT_FOUND',
      `Version context "${versionKey}" was not found in the supplied routing records.`
    );
  }

  const recordKey = recordRoutingKey(record);
  if (recordKey !== routingKey) {
    throw new E(
      'ROUTING_VERSION_CONTEXT_ROUTING_KEY_MISMATCH',
      `Version context "${versionKey}" belongs to Routing_Key "${recordKey}", not "${routingKey}".`
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(versionContext, 'routingKey') &&
    exactNonBlank(versionContext.routingKey) !== routingKey
  ) {
    throw new E(
      'ROUTING_VERSION_CONTEXT_ROUTING_KEY_MISMATCH',
      `Explicit version context Routing_Key must exactly match "${routingKey}".`
    );
  }

  return {
    kind: 'EXISTING',
    routingKey,
    versionKey,
    record
  };
}

function resolveDraftVersionContext({
  draft,
  existingVersions = [],
  historyCompleteness,
  versionContext
}) {
  if (!Array.isArray(existingVersions)) {
    throw new E(
      'ROUTING_VERSION_HISTORY_INCOMPLETE',
      'Supplied routing records must be an explicit array.'
    );
  }

  const routingKey = routingKeyFromDraft(draft);
  const hasHistoryProof = historyCompleteness !== undefined && historyCompleteness !== null;
  const hasVersionContext = versionContext !== undefined && versionContext !== null;

  if (hasHistoryProof && hasVersionContext) {
    throw new E(
      'ROUTING_VERSION_CONTEXT_AMBIGUOUS',
      'Preview/validation must use either complete NEW-version history proof or exact EXISTING Version_Key context, never both.'
    );
  }

  if (hasVersionContext) {
    return requireExistingVersionContext(versionContext, existingVersions, routingKey);
  }

  if (!hasHistoryProof) {
    throw new E(
      'ROUTING_VERSION_CONTEXT_REQUIRED',
      `Routing_Key "${routingKey}" requires either exact existing Version_Key context or explicit complete history proof.`
    );
  }

  const versionNumber = R1.deriveNextVersionNumber(
    existingVersions,
    routingKey,
    historyCompleteness
  );
  const versionKey = R1.generateCanonicalVersionKey(routingKey, versionNumber);

  return {
    kind: 'NEW',
    routingKey,
    versionKey,
    versionNumber,
    record: null
  };
}

function applyVersionIdentity(candidate, resolved) {
  if (resolved.kind === 'EXISTING') {
    const record = resolved.record;
    return {
      ...candidate,
      Routing_Key: record.Routing_Key,
      Version_Key: record.Version_Key,
      Version_Number: record.Version_Number,
      Version_Status: record.Version_Status,
      ...(record.$revision !== undefined ? { $revision: record.$revision } : {})
    };
  }

  return {
    ...candidate,
    Routing_Key: { value: resolved.routingKey },
    Version_Key: { value: resolved.versionKey },
    Version_Number: { value: String(resolved.versionNumber) },
    Version_Status: { value: R1.ROUTING_STATUSES.DRAFT }
  };
}

function publicVersionContext(resolved) {
  return Object.freeze({
    kind: resolved.kind,
    routingKey: resolved.routingKey,
    versionKey: resolved.versionKey,
    ...(resolved.kind === 'NEW' ? { versionNumber: resolved.versionNumber } : {})
  });
}

export function validateRoutingDraft(
  draft,
  {
    existingVersions = [],
    principal,
    kExpected,
    processCapabilityId,
    historyCompleteness,
    versionContext
  } = {}
) {
  const errors = [];

  try {
    R1.checkRoutingAuthorization(principal, VALIDATE);

    const baseCandidate = R1.buildCandidateRecordFromDraft(draft);
    const resolved = resolveDraftVersionContext({
      draft,
      existingVersions,
      historyCompleteness,
      versionContext
    });
    const candidate = applyVersionIdentity(baseCandidate, resolved);

    R1.HrRoutingManagementService.validateRouteCandidate({
      principal,
      routeCandidate: candidate,
      existingRecords: existingVersions,
      kExpected,
      processCapabilityId
    });

    return {
      isValid: true,
      errors: [],
      candidate,
      versionContext: publicVersionContext(resolved)
    };
  } catch (error) {
    errors.push(error?.message || String(error));
    return {
      isValid: false,
      errors,
      candidate: null,
      versionContext: null
    };
  }
}

export function previewRoutingPlan({
  principal,
  draft,
  existingVersions = [],
  kExpected,
  processCapabilityId,
  historyCompleteness,
  versionContext
} = {}) {
  const validation = validateRoutingDraft(draft, {
    existingVersions,
    principal,
    kExpected,
    processCapabilityId,
    historyCompleteness,
    versionContext
  });

  const topology = draft?.topology || '';
  const config = R1.TOPOLOGY_CONFIGS[topology];
  const activeSlots = config
    ? config.slots.map(slot => ({
        role: slot,
        userCode: draft?.slots?.[slot] || ''
      }))
    : [];

  return {
    isValid: validation.isValid,
    topology,
    activeSlots,
    scorerSlots: draft?.scorerSlots || null,
    scorerPrioritySlots: draft?.scorerPrioritySlots ?? null,
    kExpected,
    processCapabilityId,
    versionContext: validation.versionContext,
    inFlightImpact: 'NONE (ZERO)',
    warnings: validation.isValid ? [] : validation.errors,
    planPayload: validation.isValid ? validation.candidate : null
  };
}

export class HrRoutingManagementService extends R1.HrRoutingManagementService {
  static validateRoutingDraft({
    principal,
    draft,
    records = [],
    kExpected,
    processCapabilityId,
    historyCompleteness,
    versionContext
  } = {}) {
    return validateRoutingDraft(draft, {
      existingVersions: records,
      principal,
      kExpected,
      processCapabilityId,
      historyCompleteness,
      versionContext
    });
  }

  static previewRoutingPlan({
    principal,
    draft,
    records = [],
    kExpected,
    processCapabilityId,
    historyCompleteness,
    versionContext
  } = {}) {
    return previewRoutingPlan({
      principal,
      draft,
      existingVersions: records,
      kExpected,
      processCapabilityId,
      historyCompleteness,
      versionContext
    });
  }
}
