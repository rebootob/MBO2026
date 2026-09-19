import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoutePattern } from '../src/services/d3-route-pattern-resolver.js';
import { D3_ROUTE_PATTERNS } from '../src/config/d3-route-contract.js';

// ── All 5 locked topologies (production D3_ROUTE_PATTERNS, no override) ──
// Each case actually invokes the resolver against the production contract
// and asserts the returned Route_Pattern key — not a mere declared table.

test('R1: topology M1_ONLY resolves to PATTERN_1_M1', () => {
  assert.equal(resolveRoutePattern('M1_ONLY', D3_ROUTE_PATTERNS), 'PATTERN_1_M1');
});

test('R1: topology M1_G1 resolves to PATTERN_2_M1_G1', () => {
  assert.equal(resolveRoutePattern('M1_G1', D3_ROUTE_PATTERNS), 'PATTERN_2_M1_G1');
});

test('R1: topology M1_M2_G1 resolves to PATTERN_3A_M2_M1_G1', () => {
  assert.equal(resolveRoutePattern('M1_M2_G1', D3_ROUTE_PATTERNS), 'PATTERN_3A_M2_M1_G1');
});

test('R1: topology M1_G1_G2 resolves to PATTERN_3B_M1_G1_G2', () => {
  assert.equal(resolveRoutePattern('M1_G1_G2', D3_ROUTE_PATTERNS), 'PATTERN_3B_M1_G1_G2');
});

test('R1: topology M1_M2_G1_G2 resolves to PATTERN_4_M2_M1_G1_G2', () => {
  assert.equal(resolveRoutePattern('M1_M2_G1_G2', D3_ROUTE_PATTERNS), 'PATTERN_4_M2_M1_G1_G2');
});

// Also prove the resolver works using its own default (no injected map),
// i.e. exactly how production callers invoke it.
test('R1: resolver default (no injected map) resolves against production D3_ROUTE_PATTERNS', () => {
  assert.equal(resolveRoutePattern('M1_G1'), 'PATTERN_2_M1_G1');
});

// ── Unknown / missing topology ────────────────────────────────────────

test('R1: unknown topology fails closed with PROVENANCE_INVALID', () => {
  assert.throws(() => resolveRoutePattern('UNKNOWN_TOPOLOGY_XYZ', D3_ROUTE_PATTERNS), /PROVENANCE_INVALID/);
});

test('R1: missing topology (empty string) fails closed with PROVENANCE_MISSING', () => {
  assert.throws(() => resolveRoutePattern('', D3_ROUTE_PATTERNS), /PROVENANCE_MISSING/);
});

test('R1: missing topology (undefined) fails closed with PROVENANCE_MISSING', () => {
  assert.throws(() => resolveRoutePattern(undefined, D3_ROUTE_PATTERNS), /PROVENANCE_MISSING/);
});

// ── Ambiguous mapping (isolated injected map only — production never mutated) ──

test('R1: ambiguous topology mapping (2 matches) fails closed with PROVENANCE_AMBIGUOUS', () => {
  const duplicateMap = Object.freeze({
    PATTERN_X: Object.freeze({ topology: 'DUPLICATE_TOPOLOGY', sourceSlots: Object.freeze(['M1']) }),
    PATTERN_Y: Object.freeze({ topology: 'DUPLICATE_TOPOLOGY', sourceSlots: Object.freeze(['M1', 'G1']) })
  });
  assert.throws(() => resolveRoutePattern('DUPLICATE_TOPOLOGY', duplicateMap), /PROVENANCE_AMBIGUOUS/);
});

test('R1: production D3_ROUTE_PATTERNS is never mutated by ambiguous-mapping test', () => {
  // Sanity: the frozen production contract must remain exactly 5 entries
  // and each topology must still be unique after the ambiguous test above ran.
  const topologies = Object.values(D3_ROUTE_PATTERNS).map((def) => def.topology);
  assert.equal(topologies.length, 5);
  assert.equal(new Set(topologies).size, 5);
  assert.equal(Object.isFrozen(D3_ROUTE_PATTERNS), true);
});
