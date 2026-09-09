/**
 * D3 Model A effective-dated route-version resolver.
 *
 * Pure local logic only. The caller supplies candidate App795 records; this
 * module never reads or writes Kintone.
 */

import { readD3String } from '../config/d3-route-contract.js';

export class D3RouteVersionResolutionError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'D3RouteVersionResolutionError';
    this.code = code;
    this.details = details;
  }
}

function normalizeDateOnly(value, fieldName) {
  let raw = value;

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) {
      throw new D3RouteVersionResolutionError(
        'INVALID_RESOLUTION_DATE',
        `${fieldName} is an invalid Date.`
      );
    }
    raw = raw.toISOString().slice(0, 10);
  } else {
    raw = readD3String(raw);
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      raw = raw.slice(0, 10);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new D3RouteVersionResolutionError(
      'INVALID_RESOLUTION_DATE',
      `${fieldName} must resolve to YYYY-MM-DD.`
    );
  }

  const parsed = new Date(`${raw}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== raw
  ) {
    throw new D3RouteVersionResolutionError(
      'INVALID_RESOLUTION_DATE',
      `${fieldName} is not a valid calendar date: ${raw}.`
    );
  }

  return raw;
}

function normalizeRouteVersionRecord(record) {
  const routingKey = readD3String(record?.Routing_Key);
  const versionKey = readD3String(record?.Version_Key);
  const versionStatus = readD3String(record?.Version_Status);
  const effectiveFrom = readD3String(record?.Effective_From);
  const effectiveTo = readD3String(record?.Effective_To);

  return {
    record,
    routingKey,
    versionKey,
    versionStatus,
    effectiveFrom,
    effectiveTo
  };
}

function validateActiveVersionMetadata(candidate) {
  if (!candidate.versionKey) {
    throw new D3RouteVersionResolutionError(
      'INVALID_ROUTE_VERSION_IDENTITY',
      `ACTIVE route ${candidate.routingKey || 'UNKNOWN'} is missing Version_Key.`
    );
  }

  const from = normalizeDateOnly(candidate.effectiveFrom, 'Effective_From');
  const to = candidate.effectiveTo
    ? normalizeDateOnly(candidate.effectiveTo, 'Effective_To')
    : '';

  if (to && to < from) {
    throw new D3RouteVersionResolutionError(
      'INVALID_EFFECTIVE_INTERVAL',
      `Effective_To ${to} precedes Effective_From ${from}.`,
      { versionKey: candidate.versionKey, effectiveFrom: from, effectiveTo: to }
    );
  }

  return {
    ...candidate,
    effectiveFrom: from,
    effectiveTo: to
  };
}

export function resolveEffectiveRouteVersion({
  records,
  routingKey,
  at
}) {
  if (!Array.isArray(records)) {
    throw new D3RouteVersionResolutionError(
      'INVALID_ROUTE_VERSION_COLLECTION',
      'Route-version candidates must be an array.'
    );
  }

  const targetKey = String(routingKey ?? '').trim();
  if (!targetKey) {
    throw new D3RouteVersionResolutionError(
      'ROUTING_KEY_REQUIRED',
      'Routing_Key is required for Model A resolution.'
    );
  }

  const atDate = normalizeDateOnly(at, 'resolution timestamp');
  const matchingActive = records
    .map(normalizeRouteVersionRecord)
    .filter(candidate =>
      candidate.routingKey === targetKey &&
      candidate.versionStatus === 'ACTIVE'
    )
    .map(validateActiveVersionMetadata);

  const effective = matchingActive.filter(candidate =>
    candidate.effectiveFrom <= atDate &&
    (!candidate.effectiveTo || candidate.effectiveTo >= atDate)
  );

  if (effective.length === 0) {
    throw new D3RouteVersionResolutionError(
      'NO_EFFECTIVE_ROUTE',
      `No ACTIVE route version for ${targetKey} is effective on ${atDate}.`,
      { routingKey: targetKey, atDate }
    );
  }

  if (effective.length > 1) {
    throw new D3RouteVersionResolutionError(
      'AMBIGUOUS_EFFECTIVE_ROUTE',
      `Multiple ACTIVE route versions for ${targetKey} are effective on ${atDate}.`,
      {
        routingKey: targetKey,
        atDate,
        versionKeys: effective.map(candidate => candidate.versionKey)
      }
    );
  }

  const selected = effective[0];

  return {
    record: selected.record,
    routingKey: selected.routingKey,
    versionKey: selected.versionKey,
    effectiveFrom: selected.effectiveFrom,
    effectiveTo: selected.effectiveTo,
    resolvedDate: atDate
  };
}
