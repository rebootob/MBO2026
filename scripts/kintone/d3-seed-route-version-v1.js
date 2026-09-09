/**
 * D3-IMP-02 — Deterministic V1 Seed Planner for Legacy App 795 Rows
 *
 * Generates deterministic migration preview:
 * - Version_Key = <Routing_Key>#v1
 * - Version_Number = 1
 * - Fails closed on missing or inferred Effective_From date
 * - Performs ZERO Kintone reads/writes and ZERO network operations
 */

import crypto from 'node:crypto';
import { D3_ROUTE_PATTERNS } from '../../src/config/d3-route-contract.js';

delete process.env.KINTONE_API_TOKEN;

/**
 * Validates strict YYYY-MM-DD date string with calendar integrity.
 */
export function isValidIsoDateString(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonth = [0, 31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month]) return false;

  return true;
}

function extractUsers(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && Array.isArray(value.value)) return value.value;
  return [];
}

/**
 * Derives the canonical D3 route pattern from populated approver slots.
 */
export function deriveRoutePatternFromSlots(record) {
  if (record.Route_Pattern) {
    const raw = typeof record.Route_Pattern === 'object' ? record.Route_Pattern.value : record.Route_Pattern;
    if (D3_ROUTE_PATTERNS[raw]) return raw;
  }

  const m1 = extractUsers(record.Manager_Level1_Approvers || record.Manager_User).length > 0;
  const m2 = extractUsers(record.Manager_Level2_Approvers || record.First_Manager_User).length > 0;
  const g1 = extractUsers(record.GM_Level1_Approvers || record.GM_User).length > 0;
  const g2 = extractUsers(record.GM_Level2_Approvers).length > 0;

  if (m1 && !m2 && !g1 && !g2) return 'PATTERN_1_M1';
  if (m1 && !m2 && g1 && !g2) return 'PATTERN_2_M1_G1';
  if (m2 && m1 && g1 && !g2) return 'PATTERN_3A_M2_M1_G1';
  if (m1 && !m2 && g1 && g2) return 'PATTERN_3B_M1_G1_G2';
  if (m2 && m1 && g1 && g2) return 'PATTERN_4_M2_M1_G1_G2';

  throw new Error(`SEED_PLAN_ERROR: Unable to map slots to supported D3 route pattern for Routing_Key "${record.Routing_Key || 'UNKNOWN'}".`);
}

/**
 * Derives or formats explicit Scorer_Priority_Slots for the route pattern.
 */
export function deriveScorerPrioritySlots(record, routePattern) {
  if (record.Scorer_Priority_Slots) {
    const raw = typeof record.Scorer_Priority_Slots === 'object' ? record.Scorer_Priority_Slots.value : record.Scorer_Priority_Slots;
    if (raw) return typeof raw === 'string' ? raw : JSON.stringify(raw);
  }

  // Deterministic defaults matching the pattern's active slots
  switch (routePattern) {
    case 'PATTERN_1_M1':
      return '[1]';
    case 'PATTERN_2_M1_G1':
      return '[1, 2]';
    case 'PATTERN_3A_M2_M1_G1':
    case 'PATTERN_3B_M1_G1_G2':
    case 'PATTERN_4_M2_M1_G1_G2':
      return '[1, 2]';
    default:
      throw new Error(`SEED_PLAN_ERROR: No default scorer plan for pattern ${routePattern}.`);
  }
}

/**
 * Generates a deterministic V1 Route Seed Plan for legacy App 795 rows.
 *
 * @param {Object} params
 * @param {Array<Object>} params.records - Array of legacy App 795 record objects
 * @param {string} params.effectiveFrom - Explicit Owner-authorized Effective_From date (YYYY-MM-DD)
 * @param {string} [params.effectiveTo] - Optional Effective_To date (YYYY-MM-DD)
 * @param {string} [params.status] - Version status (default: 'ACTIVE')
 * @returns {Object} Deterministic seed plan
 */
export function generateV1RouteSeedPlan({
  records,
  effectiveFrom,
  effectiveTo = '',
  status = 'ACTIVE'
}) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('SEED_PLAN_ERROR: records array must be non-empty.');
  }

  // Effective_From MUST be explicitly provided and valid
  if (effectiveFrom === undefined || effectiveFrom === null || String(effectiveFrom).trim() === '') {
    throw new Error('MISSING_MIGRATION_EFFECTIVE_DATE: Effective_From date must be explicitly provided; date inference is prohibited.');
  }

  const cleanEffectiveFrom = String(effectiveFrom).trim();
  if (!isValidIsoDateString(cleanEffectiveFrom)) {
    throw new Error(`INVALID_MIGRATION_EFFECTIVE_DATE: Effective_From must be a valid YYYY-MM-DD calendar date (got "${cleanEffectiveFrom}").`);
  }

  const cleanEffectiveTo = effectiveTo ? String(effectiveTo).trim() : '';
  if (cleanEffectiveTo) {
    if (!isValidIsoDateString(cleanEffectiveTo)) {
      throw new Error(`INVALID_MIGRATION_EFFECTIVE_DATE: Effective_To must be a valid YYYY-MM-DD calendar date (got "${cleanEffectiveTo}").`);
    }
    if (cleanEffectiveTo < cleanEffectiveFrom) {
      throw new Error(`INVALID_DATE_INTERVAL: Effective_To (${cleanEffectiveTo}) cannot be earlier than Effective_From (${cleanEffectiveFrom}).`);
    }
  }

  const validStatuses = ['DRAFT', 'ACTIVE', 'CANCELLED', 'SUPERSEDED'];
  if (!validStatuses.includes(status)) {
    throw new Error(`SEED_PLAN_ERROR: Invalid Version_Status "${status}". Expected one of: ${validStatuses.join(', ')}.`);
  }

  // Check for duplicate Routing_Key in input records and interval overlap
  const seenRoutingKeys = new Map();

  const seededRecords = records.map((record, index) => {
    const routingKey = typeof record.Routing_Key === 'object' ? record.Routing_Key.value : record.Routing_Key;
    if (!routingKey || typeof routingKey !== 'string' || !routingKey.trim()) {
      throw new Error(`SEED_PLAN_ERROR: Record at index ${index} is missing a non-empty Routing_Key.`);
    }
    const cleanRoutingKey = routingKey.trim();

    // Check interval overlap if same Routing_Key appears multiple times
    if (seenRoutingKeys.has(cleanRoutingKey)) {
      const prev = seenRoutingKeys.get(cleanRoutingKey);
      const prevFrom = prev.Effective_From;
      const prevTo = prev.Effective_To || '9999-12-31';
      const curFrom = cleanEffectiveFrom;
      const curTo = cleanEffectiveTo || '9999-12-31';

      if (curFrom <= prevTo && curTo >= prevFrom) {
        throw new Error(`INTERVAL_OVERLAP_DETECTED: Multiple seed records for Routing_Key "${cleanRoutingKey}" have overlapping active intervals.`);
      }
    }

    const routePattern = deriveRoutePatternFromSlots(record);
    const scorerPrioritySlots = deriveScorerPrioritySlots(record, routePattern);

    const versionKey = `${cleanRoutingKey}#v1`;
    const versionNumber = 1;

    const seeded = {
      ...record,
      Routing_Key: cleanRoutingKey,
      Version_Key: versionKey,
      Version_Number: versionNumber,
      Version_Status: status,
      Route_Pattern: routePattern,
      Scorer_Priority_Slots: scorerPrioritySlots,
      Effective_From: cleanEffectiveFrom,
      Effective_To: cleanEffectiveTo
    };

    seenRoutingKeys.set(cleanRoutingKey, seeded);
    return seeded;
  });

  // Deterministic seed plan identity
  const contentToHash = JSON.stringify(
    seededRecords.map(r => ({
      routingKey: r.Routing_Key,
      versionKey: r.Version_Key,
      effectiveFrom: r.Effective_From,
      effectiveTo: r.Effective_To,
      pattern: r.Route_Pattern,
      scorerSlots: r.Scorer_Priority_Slots
    }))
  );
  const planHash = crypto.createHash('sha256').update(contentToHash).digest('hex').substring(0, 16);
  const seedPlanId = `D3-SEED-V1-${cleanEffectiveFrom}-${planHash}`;

  return {
    seedPlanId,
    effectiveFrom: cleanEffectiveFrom,
    effectiveTo: cleanEffectiveTo,
    totalRecords: seededRecords.length,
    seededRecords,
    summary: {
      totalSeeded: seededRecords.length,
      versionKeyFormat: '<Routing_Key>#v1',
      versionNumber: 1,
      versionStatus: status,
      effectiveFrom: cleanEffectiveFrom,
      effectiveTo: cleanEffectiveTo || 'OPEN-ENDED',
      patternDistribution: seededRecords.reduce((acc, r) => {
        acc[r.Route_Pattern] = (acc[r.Route_Pattern] || 0) + 1;
        return acc;
      }, {})
    }
  };
}
