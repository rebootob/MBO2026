/**
 * D3 V1 route/scorer viability service.
 *
 * Pure local logic: route normalization -> self-elision -> explicit scorer
 * resolution. No Kintone access and no fallback heuristics.
 */

import {
  D3RouteContractError,
  normalizeD3RouteVersion,
  applyD3SelfElision,
  parseD3ScorerPrioritySlots,
  unwrapD3Field
} from '../config/d3-route-contract.js';

export class D3RouteViabilityError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'D3RouteViabilityError';
    this.code = code;
    this.details = details;
  }
}

function failFromContract(error) {
  if (error instanceof D3RouteContractError) {
    throw new D3RouteViabilityError(error.code, error.message.replace(/^[^:]+:\s*/, ''), error.details);
  }
  throw error;
}

function normalizeKExpected(value) {
  const raw = unwrapD3Field(value);
  const parsed = Number(raw);
  if (parsed !== 1 && parsed !== 2) {
    throw new D3RouteViabilityError(
      'INVALID_K_EXPECTED',
      `K_expected must be exactly 1 or 2, received ${String(raw)}.`
    );
  }
  return parsed;
}

function exactEmployeeCode(value, required) {
  const code = String(value ?? '');
  if (!required && !code) return '';
  if (!code || code !== code.trim()) {
    throw new D3RouteViabilityError(
      'MISSING_DEDICATED_USER_CODE',
      'Exact nonblank Kintone user code is required for own-MBO evaluation.'
    );
  }
  return code;
}

export function evaluateD3RouteViability({
  routeVersion,
  kExpected,
  employeeUserCode = '',
  isOwnMbo = false,
  scorerPrioritySlots
}) {
  const requiredK = normalizeKExpected(kExpected);

  let configuredRoute;
  try {
    configuredRoute = normalizeD3RouteVersion(routeVersion);
  } catch (error) {
    failFromContract(error);
  }

  const employeeCode = exactEmployeeCode(employeeUserCode, isOwnMbo);

  let effectiveRoute;
  try {
    effectiveRoute = applyD3SelfElision(
      configuredRoute,
      employeeCode,
      isOwnMbo
    );
  } catch (error) {
    failFromContract(error);
  }

  if (effectiveRoute.businessSlots.length < requiredK) {
    throw new D3RouteViabilityError(
      'INSUFFICIENT_EFFECTIVE_APPRAISERS',
      `Surviving workflow appraisers (${effectiveRoute.businessSlots.length}) are fewer than K_expected (${requiredK}).`
    );
  }

  let prioritySlots;
  try {
    prioritySlots = parseD3ScorerPrioritySlots(
      scorerPrioritySlots !== undefined
        ? scorerPrioritySlots
        : routeVersion?.Scorer_Priority_Slots
    );
  } catch (error) {
    failFromContract(error);
  }

  for (const priority of prioritySlots) {
    if (priority > configuredRoute.businessSlots.length) {
      throw new D3RouteViabilityError(
        'INVALID_SCORER_PLAN',
        `Scorer priority slot ${priority} does not exist in the configured route.`
      );
    }
  }

  const survivingCodes = new Set(
    effectiveRoute.businessSlots.map(slot => slot.user.code)
  );

  const authorizedCandidates = [];
  for (const sourceOrdinal of prioritySlots) {
    const configuredSlot = configuredRoute.businessSlots.find(
      slot => slot.sourceOrdinal === sourceOrdinal
    );

    if (!configuredSlot || !survivingCodes.has(configuredSlot.user.code)) {
      continue;
    }

    if (!authorizedCandidates.some(item => item.user.code === configuredSlot.user.code)) {
      authorizedCandidates.push(configuredSlot);
    }
  }

  if (authorizedCandidates.length < requiredK) {
    throw new D3RouteViabilityError(
      'SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION',
      `Surviving HR-authorized scorers (${authorizedCandidates.length}) are fewer than K_expected (${requiredK}).`,
      {
        prioritySlots,
        survivingCandidateCodes: authorizedCandidates.map(item => item.user.code)
      }
    );
  }

  const selected = authorizedCandidates.slice(0, requiredK);

  if (
    requiredK === 2 &&
    selected[0].user.code === selected[1].user.code
  ) {
    throw new D3RouteViabilityError(
      'DUPLICATE_SCORER_IDENTITY',
      'K=2 requires two distinct scorer identities.'
    );
  }

  if (
    isOwnMbo &&
    selected.some(slot => slot.user.code === employeeCode)
  ) {
    throw new D3RouteViabilityError(
      'SELF_SCORING_CONFLICT',
      'Target employee cannot score their own MBO.'
    );
  }

  const weights = requiredK === 1 ? [100] : [50, 50];
  const activeScorers = selected.map((configuredSlot, index) => {
    const effectiveSlot = effectiveRoute.businessSlots.find(
      slot => slot.user.code === configuredSlot.user.code
    );

    return {
      scorerRank: index + 1,
      sourceOrdinal: configuredSlot.sourceOrdinal,
      effectiveOrdinal: effectiveSlot?.ordinal ?? null,
      user: configuredSlot.user,
      weight: weights[index]
    };
  });

  return {
    status: 'PASS',
    code: 'VIABLE',
    configuredRoute,
    effectiveRoute,
    kExpected: requiredK,
    scorerPrioritySlots: prioritySlots,
    activeScorers,
    scorerWeights: weights,
    routeVersionKey: configuredRoute.versionKey,
    routingKey: configuredRoute.routingKey
  };
}
