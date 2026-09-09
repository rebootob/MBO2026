/**
 * D3 V1 pure routing-domain contract.
 *
 * No Kintone access is performed here. Physical App795/App794 field names are
 * normalized into an ordinal business route before any runtime integration.
 */

export class D3RouteContractError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'D3RouteContractError';
    this.code = code;
    this.details = details;
  }
}

export const D3_ROUTE_PATTERNS = Object.freeze({
  PATTERN_1_M1: Object.freeze({
    topology: 'M1_ONLY',
    sourceSlots: Object.freeze(['M1'])
  }),
  PATTERN_2_M1_G1: Object.freeze({
    topology: 'M1_G1',
    sourceSlots: Object.freeze(['M1', 'G1'])
  }),
  PATTERN_3A_M2_M1_G1: Object.freeze({
    topology: 'M1_M2_G1',
    sourceSlots: Object.freeze(['M2', 'M1', 'G1'])
  }),
  PATTERN_3B_M1_G1_G2: Object.freeze({
    topology: 'M1_G1_G2',
    sourceSlots: Object.freeze(['M1', 'G1', 'G2'])
  }),
  PATTERN_4_M2_M1_G1_G2: Object.freeze({
    topology: 'M1_M2_G1_G2',
    sourceSlots: Object.freeze(['M2', 'M1', 'G1', 'G2'])
  })
});

export const D3_SLOT_DEFINITIONS = Object.freeze({
  M1: Object.freeze({
    approverField: 'Manager_Level1_Approvers',
    legacyApproverField: 'Manager_User',
    approvalRuleField: 'Manager_Level1_Approval_Rule'
  }),
  M2: Object.freeze({
    approverField: 'Manager_Level2_Approvers',
    legacyApproverField: 'First_Manager_User',
    approvalRuleField: 'Manager_Level2_Approval_Rule'
  }),
  G1: Object.freeze({
    approverField: 'GM_Level1_Approvers',
    legacyApproverField: 'GM_User',
    approvalRuleField: 'GM_Level1_Approval_Rule'
  }),
  G2: Object.freeze({
    approverField: 'GM_Level2_Approvers',
    legacyApproverField: null,
    approvalRuleField: 'GM_Level2_Approval_Rule'
  })
});

export function unwrapD3Field(value) {
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

export function readD3String(value) {
  const raw = unwrapD3Field(value);
  if (raw === null || raw === undefined) return '';
  return String(raw).trim();
}

function normalizeUserIdentity(rawUser, fieldCode) {
  if (typeof rawUser === 'string') {
    const code = rawUser.trim();
    if (!code) {
      throw new D3RouteContractError(
        'INVALID_APPRAISER_IDENTITY',
        `Blank user identity in ${fieldCode}.`
      );
    }
    return { code };
  }

  if (rawUser && typeof rawUser === 'object') {
    const code = String(rawUser.code ?? rawUser.value ?? '').trim();
    if (!code) {
      throw new D3RouteContractError(
        'INVALID_APPRAISER_IDENTITY',
        `Missing Kintone user code in ${fieldCode}.`
      );
    }
    return { ...rawUser, code };
  }

  throw new D3RouteContractError(
    'INVALID_APPRAISER_IDENTITY',
    `Unsupported user identity in ${fieldCode}.`
  );
}

export function readD3UserList(value, fieldCode = 'USER_SELECT') {
  const raw = unwrapD3Field(value);
  if (raw === null || raw === undefined || raw === '') return [];
  if (!Array.isArray(raw)) {
    throw new D3RouteContractError(
      'INVALID_SLOT_USER_SHAPE',
      `${fieldCode} must be a USER_SELECT array.`
    );
  }
  return raw.map(user => normalizeUserIdentity(user, fieldCode));
}

function readSlotUsers(routeVersion, slotId) {
  const def = D3_SLOT_DEFINITIONS[slotId];
  const primary = routeVersion?.[def.approverField];

  if (primary !== undefined) {
    return readD3UserList(primary, def.approverField);
  }

  if (def.legacyApproverField && routeVersion?.[def.legacyApproverField] !== undefined) {
    return readD3UserList(
      routeVersion[def.legacyApproverField],
      def.legacyApproverField
    );
  }

  return [];
}

function readSlotRule(routeVersion, slotId) {
  const def = D3_SLOT_DEFINITIONS[slotId];
  return readD3String(routeVersion?.[def.approvalRuleField]);
}

export function parseD3ScorerPrioritySlots(value) {
  let raw = unwrapD3Field(value);

  if (raw === null || raw === undefined || raw === '') {
    throw new D3RouteContractError(
      'SCORER_PLAN_NOT_CONFIGURED',
      'Scorer_Priority_Slots is missing or blank.'
    );
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new D3RouteContractError(
        'SCORER_PLAN_NOT_CONFIGURED',
        'Scorer_Priority_Slots is blank.'
      );
    }

    if (trimmed.startsWith('[')) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        throw new D3RouteContractError(
          'INVALID_SCORER_PLAN',
          'Scorer_Priority_Slots contains malformed JSON.'
        );
      }
    } else {
      raw = trimmed.split(',').map(item => item.trim());
    }
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new D3RouteContractError(
      'INVALID_SCORER_PLAN',
      'Scorer_Priority_Slots must be a non-empty ordered list.'
    );
  }

  const slots = raw.map(item => {
    const candidate = unwrapD3Field(item);
    const parsed = Number(candidate);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) {
      throw new D3RouteContractError(
        'INVALID_SCORER_PLAN',
        `Invalid scorer priority slot: ${String(candidate)}.`
      );
    }
    return parsed;
  });

  if (new Set(slots).size !== slots.length) {
    throw new D3RouteContractError(
      'INVALID_SCORER_PLAN',
      'Scorer priority slots must be distinct.'
    );
  }

  return slots;
}

export function getD3RoutePattern(routePattern) {
  const pattern = readD3String(routePattern);
  const contract = D3_ROUTE_PATTERNS[pattern];

  if (!contract) {
    throw new D3RouteContractError(
      'UNKNOWN_ROUTE_PATTERN',
      `Unsupported D3 route pattern: ${pattern || 'BLANK'}.`
    );
  }

  return { pattern, ...contract };
}

export function normalizeD3RouteVersion(routeVersion) {
  if (!routeVersion || typeof routeVersion !== 'object') {
    throw new D3RouteContractError(
      'ROUTE_VERSION_NOT_PROVIDED',
      'Route version object is required.'
    );
  }

  const { pattern, topology, sourceSlots } = getD3RoutePattern(
    routeVersion.Route_Pattern
  );

  const declaredTopology = readD3String(routeVersion.Routing_Topology);
  if (declaredTopology && declaredTopology !== topology) {
    throw new D3RouteContractError(
      'ROUTE_PATTERN_TOPOLOGY_MISMATCH',
      `Route pattern ${pattern} requires ${topology}, received ${declaredTopology}.`
    );
  }

  const activeSlotIds = new Set(sourceSlots);
  const slotState = {};
  const allConfiguredCodes = [];

  for (const slotId of Object.keys(D3_SLOT_DEFINITIONS)) {
    const users = readSlotUsers(routeVersion, slotId);
    const rule = readSlotRule(routeVersion, slotId);

    if (rule && rule !== 'ALL') {
      throw new D3RouteContractError(
        'D3_V1_APPROVAL_RULE_NOT_ALL',
        `${slotId} approval rule must be ALL in D3 V1.`
      );
    }

    if (activeSlotIds.has(slotId)) {
      if (users.length !== 1) {
        throw new D3RouteContractError(
          'D3_V1_SLOT_USER_COUNT_INVALID',
          `${slotId} must contain exactly one Kintone user in D3 V1.`,
          { slotId, count: users.length }
        );
      }

      if (rule !== 'ALL') {
        throw new D3RouteContractError(
          'D3_V1_APPROVAL_RULE_NOT_ALL',
          `${slotId} approval rule must be explicitly ALL in D3 V1.`
        );
      }

      allConfiguredCodes.push(users[0].code);
    } else if (users.length !== 0) {
      throw new D3RouteContractError(
        'INACTIVE_ROUTE_SLOT_POPULATED',
        `${slotId} must be empty for route pattern ${pattern}.`
      );
    }

    slotState[slotId] = { users, rule };
  }

  if (new Set(allConfiguredCodes).size !== allConfiguredCodes.length) {
    throw new D3RouteContractError(
      'DUPLICATE_APPRAISER_IDENTITY',
      'The same Kintone user cannot occupy more than one D3 V1 sequential slot.'
    );
  }

  const businessSlots = sourceSlots.map((slotId, index) => {
    const def = D3_SLOT_DEFINITIONS[slotId];
    return {
      ordinal: index + 1,
      sourceOrdinal: index + 1,
      sourceSlot: slotId,
      targetSlot: slotId,
      fieldCode: def.approverField,
      approvalRule: 'ALL',
      user: slotState[slotId].users[0]
    };
  });

  return {
    routingKey: readD3String(routeVersion.Routing_Key),
    versionKey: readD3String(routeVersion.Version_Key),
    versionNumber: readD3String(routeVersion.Version_Number),
    routePattern: pattern,
    topology,
    businessSlots
  };
}

function compactedPatternFor(routeContract, removedOrdinal) {
  const remainingCount = routeContract.businessSlots.length - 1;

  if (remainingCount === 0) {
    throw new D3RouteContractError(
      'SELF_APPROVAL_ROUTE_CONFLICT',
      'Self-elision leaves zero surviving appraisers.'
    );
  }

  if (remainingCount === 1) return 'PATTERN_1_M1';
  if (remainingCount === 2) return 'PATTERN_2_M1_G1';

  if (
    remainingCount === 3 &&
    routeContract.routePattern === 'PATTERN_4_M2_M1_G1_G2'
  ) {
    return removedOrdinal <= 2
      ? 'PATTERN_3B_M1_G1_G2'
      : 'PATTERN_3A_M2_M1_G1';
  }

  throw new D3RouteContractError(
    'SELF_ELISION_PATTERN_UNRESOLVED',
    'Unable to derive a valid compacted D3 route pattern.'
  );
}

export function applyD3SelfElision(
  routeContract,
  employeeUserCode,
  isOwnMbo = false
) {
  if (!routeContract || !Array.isArray(routeContract.businessSlots)) {
    throw new D3RouteContractError(
      'INVALID_ROUTE_CONTRACT',
      'Normalized route contract is required.'
    );
  }

  if (!isOwnMbo) {
    return {
      ...routeContract,
      businessSlots: routeContract.businessSlots.map(slot => ({ ...slot })),
      selfAppraiserElided: false,
      removedSourceOrdinal: null
    };
  }

  const employeeCode = String(employeeUserCode ?? '');
  if (!employeeCode || employeeCode !== employeeCode.trim()) {
    throw new D3RouteContractError(
      'MISSING_DEDICATED_USER_CODE',
      'Exact nonblank Kintone user code is required for own-MBO self-elision.'
    );
  }

  const removed = routeContract.businessSlots.find(
    slot => slot.user.code === employeeCode
  );

  if (!removed) {
    return {
      ...routeContract,
      businessSlots: routeContract.businessSlots.map(slot => ({ ...slot })),
      selfAppraiserElided: false,
      removedSourceOrdinal: null
    };
  }

  const survivors = routeContract.businessSlots.filter(
    slot => slot.user.code !== employeeCode
  );

  if (survivors.length === 0) {
    throw new D3RouteContractError(
      'SELF_APPROVAL_ROUTE_CONFLICT',
      'Self-elision leaves zero surviving appraisers.'
    );
  }

  const effectivePattern =
    routeContract.businessSlots.length === survivors.length
      ? routeContract.routePattern
      : compactedPatternFor(routeContract, removed.sourceOrdinal);

  const effectiveDefinition = D3_ROUTE_PATTERNS[effectivePattern];

  const compactedSlots = survivors.map((slot, index) => ({
    ...slot,
    ordinal: index + 1,
    targetSlot: effectiveDefinition.sourceSlots[index],
    targetFieldCode:
      D3_SLOT_DEFINITIONS[effectiveDefinition.sourceSlots[index]].approverField
  }));

  return {
    ...routeContract,
    routePattern: effectivePattern,
    topology: effectiveDefinition.topology,
    businessSlots: compactedSlots,
    selfAppraiserElided: true,
    removedSourceOrdinal: removed.sourceOrdinal
  };
}
