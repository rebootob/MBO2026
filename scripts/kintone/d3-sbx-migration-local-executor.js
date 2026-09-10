import * as r1 from './d3-sbx-migration-local-executor-r1.js';

export * from './d3-sbx-migration-local-executor-r1.js';

function fail(code, message) {
  throw new Error(`${code}: ${message}`);
}

function unwrap(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)
      && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value;
  }
  return value;
}

function readString(value) {
  const raw = unwrap(value);
  return raw === null || raw === undefined ? '' : String(raw).trim();
}

function assertStrictScorerSlotTypes(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)
      || !Object.prototype.hasOwnProperty.call(values, 'Effective_Scorer_Slots_Snapshot')) {
    return;
  }

  const raw = readString(values.Effective_Scorer_Slots_Snapshot);
  let slots;
  try {
    slots = JSON.parse(raw);
  } catch {
    return; // R1 owns malformed-JSON semantics and error code.
  }

  if (!Array.isArray(slots)) {
    return; // R1 owns non-array semantics and error code.
  }

  if (slots.some(slot => typeof slot !== 'number' || !Number.isInteger(slot) || slot < 1)) {
    fail(
      'APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID',
      'Scorer slots must be positive JSON integer numbers; coercion from strings, booleans, null, or decimals is forbidden.'
    );
  }
}

function assertStrictPolicyScorerSlotTypes(policy) {
  if (policy?.mode !== 'EXPLICIT_BACKFILL' || !Array.isArray(policy.records)) return;
  for (const entry of policy.records) {
    assertStrictScorerSlotTypes(entry?.values);
  }
}

function assertStrictPlanScorerSlotTypes(plan) {
  if (plan?.policyMode !== 'EXPLICIT_BACKFILL' || !Array.isArray(plan.backfillOperations)) return;
  for (const operation of plan.backfillOperations) {
    assertStrictScorerSlotTypes(operation?.values);
  }
}

export function buildApp794ProvenancePlan(args) {
  assertStrictPolicyScorerSlotTypes(args?.policy);
  return r1.buildApp794ProvenancePlan(args);
}

export function applyApp794BackfillLocal(args) {
  assertStrictPlanScorerSlotTypes(args?.plan);
  return r1.applyApp794BackfillLocal(args);
}

export function executeD3SandboxMigrationLocalOnly(args) {
  assertStrictPolicyScorerSlotTypes(args?.app794?.policy);
  return r1.executeD3SandboxMigrationLocalOnly(args);
}
