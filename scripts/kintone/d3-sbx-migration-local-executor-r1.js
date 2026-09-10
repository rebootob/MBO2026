import * as core from './d3-sbx-migration-local-executor-core.js';
import frozenManifest from '../../project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json' with { type: 'json' };

export const D3_EXE1_WORK_PACKAGE = core.D3_EXE1_WORK_PACKAGE;
export const D3_EXE1_MODE = core.D3_EXE1_MODE;
export const D3_EXE1_LIVE_IO_LOCKED = core.D3_EXE1_LIVE_IO_LOCKED;
export const D3_EXE1_ROUTE_MANIFEST_SHA256 = core.D3_EXE1_ROUTE_MANIFEST_SHA256;
export const D3_EXE1_ROUTE_MANIFEST_CANONICALIZATION = core.D3_EXE1_ROUTE_MANIFEST_CANONICALIZATION;
export const APP795_TARGET_FIELD_CODES = core.APP795_TARGET_FIELD_CODES;
export const APP794_PROVENANCE_FIELD_CODES = core.APP794_PROVENANCE_FIELD_CODES;

export const assertExe1LocalAuthorization = core.assertExe1LocalAuthorization;
export const canonicalizeRouteManifestRows = core.canonicalizeRouteManifestRows;
export const assertRouteManifestIntegrity = core.assertRouteManifestIntegrity;
export const assertScorerMappingApproval = core.assertScorerMappingApproval;
export const buildApp795SchemaStages = core.buildApp795SchemaStages;
export const buildApp795SeedOperations = core.buildApp795SeedOperations;
export const executeLiveD3SandboxMigration = core.executeLiveD3SandboxMigration;

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

function readRecordId(record) {
  const raw = unwrap(record?.$id ?? record?.recordId ?? record?.id);
  const value = raw === null || raw === undefined ? '' : String(raw).trim();
  if (!/^[1-9]\d*$/.test(value)) {
    fail('APP_RECORD_ID_INVALID', 'Positive record ID is required.');
  }
  return value;
}

function readRevision(record) {
  const raw = unwrap(record?.$revision ?? record?.revision);
  const value = raw === null || raw === undefined ? '' : String(raw).trim();
  if (!/^[1-9]\d*$/.test(value)) {
    fail('APP_RECORD_REVISION_INVALID', 'Positive record revision is required.');
  }
  return value;
}

function assertExactIdSet({ records, operations, expectedCount, code, recordLabel, operationLabel }) {
  if (!Array.isArray(records) || !Array.isArray(operations)
      || records.length !== expectedCount || operations.length !== expectedCount) {
    fail(code, `Expected exact ${expectedCount} ${recordLabel} and ${expectedCount} ${operationLabel}.`);
  }

  const recordIds = records.map(readRecordId);
  const operationIds = operations.map(operation => String(operation?.recordId ?? '').trim());

  if (operationIds.some(id => !/^[1-9]\d*$/.test(id))) {
    fail(code, `${operationLabel} contain an invalid record ID.`);
  }

  const recordSet = new Set(recordIds);
  const operationSet = new Set(operationIds);
  if (recordSet.size !== expectedCount || operationSet.size !== expectedCount) {
    fail(code, `${recordLabel}/${operationLabel} must each contain unique record IDs.`);
  }

  const missing = [...recordSet].filter(id => !operationSet.has(id));
  const extra = [...operationSet].filter(id => !recordSet.has(id));
  if (missing.length || extra.length) {
    fail(code, `Record-set mismatch; missing=${missing.join(',') || 'none'} extra=${extra.join(',') || 'none'}.`);
  }
}

function rowObject(rawRow) {
  return Object.fromEntries(frozenManifest.columns.map((column, index) => [column, rawRow[index]]));
}

function buildFrozenRouteByKey() {
  core.assertRouteManifestIntegrity(frozenManifest);
  return new Map(frozenManifest.rows.map(rawRow => {
    const row = rowObject(rawRow);
    return [row.routingKey, row];
  }));
}

const FROZEN_ROUTE_BY_KEY = buildFrozenRouteByKey();

function activeRouteSlotCount(row) {
  return ['M2', 'M1', 'G1', 'G2']
    .reduce((count, key) => count + (Array.isArray(row[key]) && row[key].length > 0 ? 1 : 0), 0);
}

function validateProvenanceSemantics(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    fail('APP794_PROVENANCE_VALUE_SET_INVALID', 'Provenance values are required.');
  }

  for (const fieldCode of APP794_PROVENANCE_FIELD_CODES) {
    if (!Object.prototype.hasOwnProperty.call(values, fieldCode)) {
      fail('APP794_PROVENANCE_VALUE_SET_INVALID', `Missing ${fieldCode}.`);
    }
  }

  const frozenProfile = readString(values.Frozen_Profile_Code);
  const routingKey = readString(values.Effective_Routing_Key);
  const routeVersionKey = readString(values.Effective_Route_Version_Key);
  if (!frozenProfile || !routingKey || !routeVersionKey) {
    fail('APP794_PROVENANCE_VALUE_SET_INVALID', 'Provenance identity fields must be nonblank.');
  }

  const route = FROZEN_ROUTE_BY_KEY.get(routingKey);
  if (!route) {
    fail('APP794_PROVENANCE_ROUTE_KEY_NOT_IN_MANIFEST', `Routing_Key ${routingKey} is not in the accepted PRE1 manifest.`);
  }
  if (routeVersionKey !== route.versionKey) {
    fail(
      'APP794_PROVENANCE_ROUTE_VERSION_MISMATCH',
      `Expected ${route.versionKey} for Routing_Key ${routingKey}, received ${routeVersionKey}.`
    );
  }

  const k = Number(unwrap(values.K_expected_Snapshot));
  if (k !== 1 && k !== 2) {
    fail('APP794_PROVENANCE_K_INVALID', 'K_expected_Snapshot must be 1 or 2.');
  }

  const scorerRaw = readString(values.Effective_Scorer_Slots_Snapshot);
  let slots;
  try {
    slots = JSON.parse(scorerRaw);
  } catch {
    fail('APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID', 'Scorer snapshot must be valid JSON.');
  }
  if (!Array.isArray(slots) || slots.length !== k) {
    fail('APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID', 'Scorer snapshot must contain exactly K slots.');
  }

  const normalized = slots.map(slot => Number(slot));
  if (normalized.some(slot => !Number.isInteger(slot) || slot < 1)) {
    fail('APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID', 'Scorer slots must be positive integers.');
  }
  if (new Set(normalized).size !== normalized.length) {
    fail('APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID', 'Scorer slots must be distinct.');
  }

  const maxSlot = activeRouteSlotCount(route);
  if (normalized.some(slot => slot > maxSlot)) {
    fail(
      'APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID',
      `Scorer slot exceeds active route slot count (${maxSlot}) for ${routingKey}.`
    );
  }
}

function assertExactApp794PolicyCoverage(existingRecords, policyRecords) {
  if (!Array.isArray(existingRecords) || !Array.isArray(policyRecords)
      || existingRecords.length !== policyRecords.length) {
    fail('APP794_PROVENANCE_BACKFILL_SET_MISMATCH', 'Policy must cover the exact existing record set.');
  }

  const existingIds = existingRecords.map(readRecordId);
  const policyIds = policyRecords.map(entry => String(entry?.recordId ?? '').trim());
  if (policyIds.some(id => !/^[1-9]\d*$/.test(id))) {
    fail('APP794_PROVENANCE_BACKFILL_SET_MISMATCH', 'Policy contains an invalid record ID.');
  }

  const existingSet = new Set(existingIds);
  const policySet = new Set(policyIds);
  if (existingSet.size !== existingRecords.length || policySet.size !== policyRecords.length) {
    fail('APP794_PROVENANCE_BACKFILL_SET_MISMATCH', 'Existing records and policy records must use unique record IDs.');
  }

  const missing = [...existingSet].filter(id => !policySet.has(id));
  const extra = [...policySet].filter(id => !existingSet.has(id));
  if (missing.length || extra.length) {
    fail(
      'APP794_PROVENANCE_BACKFILL_SET_MISMATCH',
      `Policy record set mismatch; missing=${missing.join(',') || 'none'} extra=${extra.join(',') || 'none'}.`
    );
  }

  const existingById = new Map(existingRecords.map(record => [readRecordId(record), record]));
  for (const entry of policyRecords) {
    const recordId = String(entry.recordId).trim();
    const expectedRevision = String(entry.expectedRevision ?? '').trim();
    if (!/^[1-9]\d*$/.test(expectedRevision)) {
      fail('APP794_RECORD_REVISION_DRIFT', `Invalid expected revision for App794 record ${recordId}.`);
    }
    if (readRevision(existingById.get(recordId)) !== expectedRevision) {
      fail('APP794_RECORD_REVISION_DRIFT', `Revision drift on App794 record ${recordId}.`);
    }
    validateProvenanceSemantics(entry.values);
  }
}

export function applyApp795SeedOperationsLocal({ records, operations }) {
  assertExactIdSet({
    records,
    operations,
    expectedCount: 20,
    code: 'APP795_LOCAL_SEED_INPUT_INVALID',
    recordLabel: 'records',
    operationLabel: 'operations'
  });
  return core.applyApp795SeedOperationsLocal({ records, operations });
}

export function assertApp795SeedReadBack({ manifest, records, scorerApproval }) {
  const operations = core.buildApp795SeedOperations({ manifest, scorerApproval });
  assertExactIdSet({
    records,
    operations,
    expectedCount: 20,
    code: 'APP795_READBACK_ROW_COUNT_MISMATCH',
    recordLabel: 'read-back records',
    operationLabel: 'expected operations'
  });
  return core.assertApp795SeedReadBack({ manifest, records, scorerApproval });
}

export function buildApp794ProvenancePlan({
  currentSchema,
  existingRecords = [],
  policy,
  backupEvidence
}) {
  if (policy?.mode === 'EXPLICIT_BACKFILL') {
    assertExactApp794PolicyCoverage(existingRecords, policy.records);
  }
  return core.buildApp794ProvenancePlan({
    currentSchema,
    existingRecords,
    policy,
    backupEvidence
  });
}

export function applyApp794BackfillLocal({ records, plan }) {
  if (plan?.policyMode === 'EXPLICIT_BACKFILL') {
    assertExactIdSet({
      records,
      operations: plan.backfillOperations,
      expectedCount: records?.length ?? -1,
      code: 'APP794_PROVENANCE_BACKFILL_SET_MISMATCH',
      recordLabel: 'App794 records',
      operationLabel: 'backfill operations'
    });
    for (const operation of plan.backfillOperations) {
      validateProvenanceSemantics(operation.values);
    }
  }
  return core.applyApp794BackfillLocal({ records, plan });
}

export function executeD3SandboxMigrationLocalOnly(args) {
  core.assertExe1LocalAuthorization(args?.authorization);
  core.assertRouteManifestIntegrity(args?.manifest);

  const seedOperations = core.buildApp795SeedOperations({
    manifest: args.manifest,
    scorerApproval: args.scorerApproval
  });
  assertExactIdSet({
    records: args?.app795?.records,
    operations: seedOperations,
    expectedCount: 20,
    code: 'APP795_LOCAL_SEED_INPUT_INVALID',
    recordLabel: 'records',
    operationLabel: 'operations'
  });

  buildApp794ProvenancePlan({
    currentSchema: args?.app794?.currentSchema,
    existingRecords: args?.app794?.records,
    policy: args?.app794?.policy,
    backupEvidence: args?.app794?.backupEvidence
  });

  return core.executeD3SandboxMigrationLocalOnly(args);
}
