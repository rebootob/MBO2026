/**
 * D3 Route Pattern Resolver (Pure Module).
 *
 * Single responsibility: resolve the authoritative Route_Pattern key for a
 * given live Routing_Topology value.
 *
 * Authority: the existing locked `D3_ROUTE_PATTERNS` contract
 * (`src/config/d3-route-contract.js`) — this module does NOT define its own
 * production mapping table. It inspects `D3_ROUTE_PATTERNS` (or an injected
 * equivalent, for isolated unit testing) dynamically at call time.
 *
 * Rules (deterministic, fail-closed):
 *   - exactly 1 pattern definition whose `.topology` matches => return that
 *     pattern key
 *   - 0 matches (unknown topology)      => FAIL CLOSED (PROVENANCE_INVALID)
 *   - missing/empty topology            => FAIL CLOSED (PROVENANCE_MISSING)
 *   - more than 1 match (ambiguous map) => FAIL CLOSED (PROVENANCE_AMBIGUOUS)
 *
 * No Kintone API calls. No DOM access. No side effects. Pure function,
 * independently unit-testable. The production `D3_ROUTE_PATTERNS` object is
 * frozen/locked and is never mutated by this module — tests requiring an
 * ambiguous mapping must inject their own isolated `routePatterns` object.
 */
import { D3_ROUTE_PATTERNS as PRODUCTION_ROUTE_PATTERNS } from '../config/d3-route-contract.js';

function getDefaultRoutePatterns() {
  return PRODUCTION_ROUTE_PATTERNS;
}

/**
 * Resolves the Route_Pattern key for a given Routing_Topology value.
 *
 * @param {string} routingTopology Live `Routing_Topology` field value
 * @param {object} [routePatterns] Route pattern contract to inspect;
 *   defaults to the production-locked D3_ROUTE_PATTERNS when omitted.
 *   Each entry must have shape `{ topology: string, ... }`. Injectable only
 *   for isolated unit tests (e.g. to prove ambiguous-mapping fail-closed
 *   behavior) — production callers must never pass a mutated map.
 * @returns {string} the matching Route_Pattern key
 * @throws {Error} PROVENANCE_MISSING if routingTopology is empty
 * @throws {Error} PROVENANCE_INVALID if no pattern matches the topology
 * @throws {Error} PROVENANCE_AMBIGUOUS if more than one pattern matches
 */
export function resolveRoutePattern(routingTopology, routePatterns) {
  const topology = String(routingTopology || '').trim();
  if (!topology) {
    throw new Error('PROVENANCE_MISSING: Routing_Topology is required');
  }

  const contract = routePatterns ?? getDefaultRoutePatterns();
  const matches = Object.entries(contract).filter(([, def]) => def?.topology === topology);

  if (matches.length === 0) {
    throw new Error(`PROVENANCE_INVALID: Routing_Topology "${topology}" has no locked D3 route pattern mapping`);
  }
  if (matches.length > 1) {
    throw new Error(`PROVENANCE_AMBIGUOUS: Routing_Topology "${topology}" matches ${matches.length} route patterns, expected exactly 1`);
  }

  const [patternKey] = matches[0];
  return patternKey;
}
