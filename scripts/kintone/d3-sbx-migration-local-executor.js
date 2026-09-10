import crypto from 'node:crypto';
import { routingFields, mboFields } from '../../config/schema-spec.js';

export const D3_EXE1_WORK_PACKAGE = 'D3-SBX-MIGRATION-01-EXE1';
export const D3_EXE1_MODE = 'LOCAL_TEST_ONLY';
export const D3_EXE1_LIVE_IO_LOCKED = true;
export const D3_EXE1_ROUTE_MANIFEST_SHA256 =
  '0e2cfdebe9e25d443f1b20139b018dffe9468c4819aedd071f4aa9940277a72e';
export const D3_EXE1_ROUTE_MANIFEST_CANONICALIZATION =
  'ECMASCRIPT_JSON_STRINGIFY_MANIFEST_ROWS_UTF8_NO_TRAILING_NEWLINE';

export const APP795_TARGET_FIELD_CODES = Object.freeze([
  'Routing_Key', 'Version_Key', 'Version_Number', 'Version_Status',
  'Route_Pattern', 'Scorer_Priority_Slots', 'Effective_From', 'Effective_To'
]);

export const APP794_PROVENANCE_FIELD_CODES = Object.freeze([
  'Frozen_Profile_Code',
  'K_expected_Snapshot',
  'Effective_Routing_Key',
  'Effective_Route_Version_Key',
  'Effective_Scorer_Slots_Snapshot'
]);

const APP795_NEW_FIELD_CODES = Object.freeze([
  'Version_Key', 'Version_Number', 'Version_Status',
  'Route_Pattern', 'Scorer_Priority_Slots'
]);

const EXPECTED_MANIFEST_COLUMNS = Object.freeze([
  'sourceRecordId','expectedSourceRevision','routingKey','versionKey',
  'versionNumber','versionStatus','routePattern','topology',
  'scorerPrioritySlotsProposed','effectiveFrom','effectiveTo','sectionCode',
  'sectionName','team','requesterUsers','M2','M1','G1','G2',
  'M2Rule','M1Rule','G1Rule','G2Rule','remarkPreserve'
]);

function fail(code, message) {
  throw new Error(`${code}: ${message}`);
}

function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function deepClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
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

function readUserCodes(value) {
  const raw = unwrap(value);
  if (raw === null || raw === undefined || raw === '') return [];
  if (!Array.isArray(raw)) fail('INVALID_USER_LIST', 'Expected USER_SELECT array.');
  return raw.map(item => {
    const code = typeof item === 'string' ? item : item?.code;
    if (typeof code !== 'string' || !code.trim()) {
      fail('INVALID_USER_IDENTITY', 'USER_SELECT item is missing a user code.');
    }
    return code.trim();
  });
}

function readRecordId(record) {
  const raw = unwrap(record?.$id ?? record?.recordId ?? record?.id);
  const value = raw === null || raw === undefined ? '' : String(raw).trim();
  if (!/^[1-9]\d*$/.test(value)) fail('APP_RECORD_ID_INVALID', 'Positive record ID is required.');
  return value;
}

function readRevision(record) {
  const raw = unwrap(record?.$revision ?? record?.revision);
  const value = raw === null || raw === undefined ? '' : String(raw).trim();
  if (!/^[1-9]\d*$/.test(value)) fail('APP_RECORD_REVISION_INVALID', 'Positive record revision is required.');
  return value;
}

function exactStringArray(actual, expected, code, context) {
  if (!Array.isArray(actual) || actual.length !== expected.length
      || actual.some((value, index) => value !== expected[index])) {
    fail(code, `${context} mismatch.`);
  }
}

function routeRowObject(manifest, row) {
  return Object.fromEntries(manifest.columns.map((column, index) => [column, row[index]]));
}

function assertDate(value, code, context) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(code, `${context} must be YYYY-MM-DD.`);
  }
}

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export function assertExe1LocalAuthorization(auth) {
  if (!isPlainObject(auth)) fail('EXE1_AUTHORIZATION_REQUIRED', 'Authorization object is required.');
  if (auth.workPackageId !== D3_EXE1_WORK_PACKAGE) {
    fail('EXE1_WORK_PACKAGE_MISMATCH', `Expected ${D3_EXE1_WORK_PACKAGE}.`);
  }
  if (auth.explicitOwnerAuthorization !== true
      || auth.mode !== D3_EXE1_MODE
      || auth.localOnly !== true
      || auth.testOnly !== true) {
    fail('EXE1_LOCAL_TEST_AUTHORIZATION_INVALID', 'Explicit LOCAL_TEST_ONLY Owner authorization is required.');
  }
  for (const flag of [
    'kintoneReadAllowed', 'kintoneWriteAllowed', 'schemaWriteAllowed',
    'processWriteAllowed', 'deploymentAllowed'
  ]) {
    if (auth[flag] !== false) {
      fail('EXE1_LIVE_IO_FORBIDDEN', `${flag} must be explicitly false.`);
    }
  }
  return true;
}

export function canonicalizeRouteManifestRows(manifest) {
  if (!isPlainObject(manifest) || !Array.isArray(manifest.rows)) {
    fail('ROUTE_MANIFEST_INVALID', 'Manifest rows are required.');
  }
  return Buffer.from(JSON.stringify(manifest.rows), 'utf8');
}

export function assertRouteManifestIntegrity(manifest) {
  if (!isPlainObject(manifest)) fail('ROUTE_MANIFEST_INVALID', 'Manifest object is required.');
  if (manifest.package !== 'D3-SBX-MIGRATION-01-PRE1') {
    fail('ROUTE_MANIFEST_PACKAGE_MISMATCH', 'Unexpected PRE1 manifest package.');
  }
  exactStringArray(
    manifest.columns,
    EXPECTED_MANIFEST_COLUMNS,
    'ROUTE_MANIFEST_COLUMNS_MISMATCH',
    'Manifest columns'
  );
  if (manifest.routeCount !== 20 || manifest.rows.length !== 20) {
    fail('ROUTE_MANIFEST_ROW_COUNT_MISMATCH', 'Exact 20-route manifest is required.');
  }
  if (manifest.routeArrayIntegrity?.canonicalization
      !== D3_EXE1_ROUTE_MANIFEST_CANONICALIZATION) {
    fail('ROUTE_MANIFEST_CANONICALIZATION_MISMATCH', 'Canonicalization contract mismatch.');
  }

  const bytes = canonicalizeRouteManifestRows(manifest);
  const hash = sha256Hex(bytes);
  if (bytes.length !== manifest.routeArrayIntegrity?.canonicalByteLength) {
    fail('ROUTE_MANIFEST_BYTE_LENGTH_MISMATCH', 'Canonical byte length mismatch.');
  }
  if (hash !== D3_EXE1_ROUTE_MANIFEST_SHA256
      || manifest.routeManifestSha256 !== hash
      || manifest.routeArrayIntegrity?.sha256 !== hash) {
    fail('ROUTE_MANIFEST_HASH_MISMATCH', `Expected authoritative SHA-256 ${D3_EXE1_ROUTE_MANIFEST_SHA256}.`);
  }

  const recordIds = new Set();
  const routingKeys = new Set();
  const versionKeys = new Set();
  const distribution = { M1_G1: 0, M1_ONLY: 0 };

  for (const rawRow of manifest.rows) {
    if (!Array.isArray(rawRow) || rawRow.length !== EXPECTED_MANIFEST_COLUMNS.length) {
      fail('ROUTE_MANIFEST_ROW_SHAPE_INVALID', 'Each route row must match the frozen column contract.');
    }
    const row = routeRowObject(manifest, rawRow);
    if (!/^[1-9]\d*$/.test(String(row.sourceRecordId))
        || !/^[1-9]\d*$/.test(String(row.expectedSourceRevision))) {
      fail('ROUTE_MANIFEST_SOURCE_IDENTITY_INVALID', 'Source record ID/revision must be positive integers.');
    }
    if (recordIds.has(row.sourceRecordId)) fail('ROUTE_MANIFEST_DUPLICATE_RECORD', 'Duplicate source record ID.');
    if (routingKeys.has(row.routingKey)) fail('ROUTE_MANIFEST_DUPLICATE_ROUTING_KEY', 'Duplicate Routing_Key in v1 seed.');
    if (versionKeys.has(row.versionKey)) fail('ROUTE_MANIFEST_DUPLICATE_VERSION_KEY', 'Duplicate Version_Key.');
    recordIds.add(row.sourceRecordId);
    routingKeys.add(row.routingKey);
    versionKeys.add(row.versionKey);

    if (row.versionKey !== `${row.routingKey}#v1` || row.versionNumber !== 1 || row.versionStatus !== 'ACTIVE') {
      fail('ROUTE_MANIFEST_VERSION_IDENTITY_INVALID', `Invalid v1 identity for ${row.routingKey}.`);
    }
    assertDate(row.effectiveFrom, 'ROUTE_MANIFEST_EFFECTIVE_DATE_INVALID', 'Effective_From');
    assertDate(row.effectiveTo, 'ROUTE_MANIFEST_EFFECTIVE_DATE_INVALID', 'Effective_To');

    if (row.topology === 'M1_G1') {
      distribution.M1_G1 += 1;
      if (row.routePattern !== 'PATTERN_2_M1_G1') fail('ROUTE_MANIFEST_PATTERN_MISMATCH', row.routingKey);
      exactStringArray(row.M2, [], 'ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} M2`);
      if (!Array.isArray(row.M1) || row.M1.length !== 1 || !Array.isArray(row.G1) || row.G1.length !== 1) {
        fail('ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} requires one M1 and one G1.`);
      }
      exactStringArray(row.G2, [], 'ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} G2`);
      if (row.M2Rule !== '' || row.M1Rule !== 'ALL' || row.G1Rule !== 'ALL' || row.G2Rule !== '') {
        fail('ROUTE_MANIFEST_RULE_MISMATCH', `${row.routingKey} active rules must be ALL and inactive blank.`);
      }
      if (JSON.stringify(row.scorerPrioritySlotsProposed) !== '[1,2]') {
        fail('ROUTE_MANIFEST_SCORER_PROPOSAL_DRIFT', `${row.routingKey} proposal changed.`);
      }
    } else if (row.topology === 'M1_ONLY') {
      distribution.M1_ONLY += 1;
      if (row.routePattern !== 'PATTERN_1_M1') fail('ROUTE_MANIFEST_PATTERN_MISMATCH', row.routingKey);
      exactStringArray(row.M2, [], 'ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} M2`);
      if (!Array.isArray(row.M1) || row.M1.length !== 1) {
        fail('ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} requires one M1.`);
      }
      exactStringArray(row.G1, [], 'ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} G1`);
      exactStringArray(row.G2, [], 'ROUTE_MANIFEST_SLOT_MISMATCH', `${row.routingKey} G2`);
      if (row.M2Rule !== '' || row.M1Rule !== 'ALL' || row.G1Rule !== '' || row.G2Rule !== '') {
        fail('ROUTE_MANIFEST_RULE_MISMATCH', `${row.routingKey} rule contract mismatch.`);
      }
      if (JSON.stringify(row.scorerPrioritySlotsProposed) !== '[1]') {
        fail('ROUTE_MANIFEST_SCORER_PROPOSAL_DRIFT', `${row.routingKey} proposal changed.`);
      }
    } else {
      fail('ROUTE_MANIFEST_TOPOLOGY_UNSUPPORTED', `Unexpected topology ${row.topology}.`);
    }
  }

  if (distribution.M1_G1 !== 17 || distribution.M1_ONLY !== 3) {
    fail('ROUTE_MANIFEST_DISTRIBUTION_MISMATCH', 'Expected 17 M1_G1 and 3 M1_ONLY routes.');
  }

  return { sha256: hash, canonicalByteLength: bytes.length, routeCount: 20, distribution };
}

export function assertScorerMappingApproval(approval) {
  if (!isPlainObject(approval)
      || approval.approved !== true
      || approval.explicitOwnerHrApproval !== true
      || typeof approval.decisionRef !== 'string'
      || !approval.decisionRef.trim()) {
    fail('SCORER_MAPPING_NOT_OWNER_HR_APPROVED', 'Explicit Owner/HR scorer mapping approval is required.');
  }
  if (JSON.stringify(approval.mapping?.M1_G1) !== '[1,2]'
      || JSON.stringify(approval.mapping?.M1_ONLY) !== '[1]') {
    fail('SCORER_MAPPING_APPROVAL_MISMATCH', 'Approved mapping must exactly match the reviewed PRE1 proposal.');
  }
  return true;
}

function assertBackup(backup, appId) {
  if (!isPlainObject(backup)
      || backup.appId !== appId
      || backup.captured !== true
      || backup.verified !== true
      || typeof backup.sha256 !== 'string'
      || !/^[0-9a-f]{64}$/.test(backup.sha256)
      || typeof backup.artifactPath !== 'string'
      || !backup.artifactPath.trim()) {
    fail('PREWRITE_BACKUP_EVIDENCE_INVALID', `Verified backup evidence is required for App ${appId}.`);
  }
}

function normalizedFields(schema) {
  if (!isPlainObject(schema)) fail('SCHEMA_STATE_REQUIRED', 'Schema object is required.');
  const fields = isPlainObject(schema.fields) ? schema.fields : schema;
  if (!isPlainObject(fields)) fail('SCHEMA_STATE_REQUIRED', 'Valid fields object is required.');
  return fields;
}

function cloneFieldSpec(spec) {
  return deepClone(spec);
}

function stagedOptionalSpec(targetSpec) {
  const spec = cloneFieldSpec(targetSpec);
  spec.required = false;
  if (Object.prototype.hasOwnProperty.call(spec, 'unique')) spec.unique = false;
  delete spec.defaultValue;
  return spec;
}

function assertCompatibleType(field, target, fieldCode) {
  if (field && field.type !== target.type) {
    fail('INCOMPATIBLE_FIELD_TYPE', `${fieldCode} must remain ${target.type}, received ${field.type}.`);
  }
}

function fieldFinalDiff(current, target, fieldCode) {
  if (!current) return { fieldCode, operation: 'FINALIZE_FIELD_PROPERTIES', target: cloneFieldSpec(target) };
  const properties = ['required', 'unique', 'minValue', 'maxValue'];
  const differs = properties.some(key => {
    if (!Object.prototype.hasOwnProperty.call(target, key)) return false;
    return String(current[key] ?? '') !== String(target[key] ?? '');
  });
  const targetOptions = target.options ? Object.keys(target.options).sort() : [];
  const currentOptions = current.options ? Object.keys(current.options).sort() : [];
  if (JSON.stringify(targetOptions) !== JSON.stringify(currentOptions)) {
    return { fieldCode, operation: 'FINALIZE_FIELD_PROPERTIES', target: cloneFieldSpec(target) };
  }
  return differs ? { fieldCode, operation: 'FINALIZE_FIELD_PROPERTIES', target: cloneFieldSpec(target) } : null;
}

export function buildApp795SchemaStages({ currentSchema, manifest, backupEvidence }) {
  assertRouteManifestIntegrity(manifest);
  assertBackup(backupEvidence, 795);
  const fields = normalizedFields(currentSchema);
  if (!fields.Routing_Key) fail('APP795_ROUTING_KEY_MISSING', 'Routing_Key must already exist.');
  assertCompatibleType(fields.Routing_Key, routingFields.Routing_Key, 'Routing_Key');

  const stageAdditions = [];
  const finalizations = [];

  for (const fieldCode of APP795_NEW_FIELD_CODES) {
    const current = fields[fieldCode];
    const target = routingFields[fieldCode];
    assertCompatibleType(current, target, fieldCode);
    if (!current) {
      stageAdditions.push({
        fieldCode,
        operation: 'ADD_FIELD_STAGED_OPTIONAL',
        spec: stagedOptionalSpec(target)
      });
    }
    const diff = fieldFinalDiff(current, target, fieldCode);
    if (diff) finalizations.push(diff);
  }

  for (const fieldCode of ['Routing_Key', 'Effective_From', 'Effective_To']) {
    const current = fields[fieldCode];
    const target = routingFields[fieldCode];
    if (!current && fieldCode === 'Effective_From') {
      stageAdditions.push({ fieldCode, operation: 'ADD_FIELD_STAGED_OPTIONAL', spec: stagedOptionalSpec(target) });
    } else if (!current && fieldCode === 'Effective_To') {
      stageAdditions.push({ fieldCode, operation: 'ADD_FIELD_STAGED_OPTIONAL', spec: stagedOptionalSpec(target) });
    } else {
      assertCompatibleType(current, target, fieldCode);
    }
    const diff = fieldFinalDiff(current, target, fieldCode);
    if (diff) finalizations.push(diff);
  }

  return {
    appId: 795,
    mode: D3_EXE1_MODE,
    stages: [
      { id: 'STAGE_OPTIONAL_FIELD_ADDITIONS', operations: stageAdditions },
      { id: 'STAGE_EXACT_20_ROW_SEED', operationCount: 20 },
      { id: 'STAGE_FINAL_FIELD_PROPERTIES', operations: finalizations }
    ],
    invariants: {
      requirednessBeforeSeed: false,
      uniqueVersionKeyBeforeSeed: false,
      noFieldDelete: true,
      noNetwork: true,
      noKintoneIo: true
    }
  };
}

function scorerPlanForRow(row, approval) {
  const approved = approval.mapping[row.topology];
  if (JSON.stringify(approved) !== JSON.stringify(row.scorerPrioritySlotsProposed)) {
    fail('SCORER_MAPPING_APPROVAL_MISMATCH', `Approved scorer mapping drift for ${row.routingKey}.`);
  }
  return approved;
}

export function buildApp795SeedOperations({ manifest, scorerApproval }) {
  assertRouteManifestIntegrity(manifest);
  assertScorerMappingApproval(scorerApproval);

  return manifest.rows.map(rawRow => {
    const row = routeRowObject(manifest, rawRow);
    const scorerPlan = scorerPlanForRow(row, scorerApproval);
    return {
      operation: 'UPDATE_EXISTING_RECORD_LOCAL_CONTRACT',
      appId: 795,
      recordId: String(row.sourceRecordId),
      expectedRevision: String(row.expectedSourceRevision),
      preconditions: {
        Routing_Key: row.routingKey,
        Requester_User: deepClone(row.requesterUsers),
        Manager_Level2_Approvers: deepClone(row.M2),
        Manager_Level1_Approvers: deepClone(row.M1),
        GM_Level1_Approvers: deepClone(row.G1),
        GM_Level2_Approvers: deepClone(row.G2),
        Effective_From: row.effectiveFrom,
        Effective_To: row.effectiveTo
      },
      values: {
        Version_Key: row.versionKey,
        Version_Number: row.versionNumber,
        Version_Status: row.versionStatus,
        Route_Pattern: row.routePattern,
        Scorer_Priority_Slots: JSON.stringify(scorerPlan),
        Manager_Level2_Approval_Rule: row.M2Rule,
        Manager_Level1_Approval_Rule: row.M1Rule,
        GM_Level1_Approval_Rule: row.G1Rule,
        GM_Level2_Approval_Rule: row.G2Rule
      }
    };
  });
}

function assertRecordPreconditions(record, operation) {
  if (readRecordId(record) !== operation.recordId) {
    fail('APP795_RECORD_ID_DRIFT', `Expected record ${operation.recordId}.`);
  }
  if (readRevision(record) !== operation.expectedRevision) {
    fail('APP795_RECORD_REVISION_DRIFT', `Revision drift on record ${operation.recordId}.`);
  }
  if (readString(record.Routing_Key) !== operation.preconditions.Routing_Key) {
    fail('APP795_ROUTING_KEY_DRIFT', `Routing_Key drift on record ${operation.recordId}.`);
  }
  const listChecks = [
    ['Requester_User', 'Requester_User'],
    ['Manager_Level2_Approvers', 'Manager_Level2_Approvers'],
    ['Manager_Level1_Approvers', 'Manager_Level1_Approvers'],
    ['GM_Level1_Approvers', 'GM_Level1_Approvers'],
    ['GM_Level2_Approvers', 'GM_Level2_Approvers']
  ];
  for (const [fieldCode, expectedKey] of listChecks) {
    exactStringArray(
      readUserCodes(record[fieldCode]),
      operation.preconditions[expectedKey],
      'APP795_ROUTE_IDENTITY_DRIFT',
      `${operation.recordId} ${fieldCode}`
    );
  }
  if (readString(record.Effective_From) !== operation.preconditions.Effective_From
      || readString(record.Effective_To) !== operation.preconditions.Effective_To) {
    fail('APP795_EFFECTIVE_INTERVAL_DRIFT', `Effective interval drift on record ${operation.recordId}.`);
  }
}

export function applyApp795SeedOperationsLocal({ records, operations }) {
  if (!Array.isArray(records) || !Array.isArray(operations) || operations.length !== 20) {
    fail('APP795_LOCAL_SEED_INPUT_INVALID', 'Exact 20 records and 20 operations are required.');
  }
  const byId = new Map(records.map(record => [readRecordId(record), record]));
  if (byId.size !== 20) fail('APP795_LOCAL_SEED_INPUT_INVALID', 'Exact 20 unique record IDs are required.');

  return operations.map(operation => {
    const record = byId.get(operation.recordId);
    if (!record) fail('APP795_RECORD_SET_DRIFT', `Missing record ${operation.recordId}.`);
    assertRecordPreconditions(record, operation);
    return {
      ...deepClone(record),
      ...deepClone(operation.values),
      $id: operation.recordId,
      $revision: operation.expectedRevision
    };
  });
}

export function assertApp795SeedReadBack({ manifest, records, scorerApproval }) {
  const operations = buildApp795SeedOperations({ manifest, scorerApproval });
  if (!Array.isArray(records) || records.length !== 20) {
    fail('APP795_READBACK_ROW_COUNT_MISMATCH', 'Read-back must contain exactly 20 rows.');
  }
  const byId = new Map(records.map(record => [readRecordId(record), record]));
  for (const operation of operations) {
    const record = byId.get(operation.recordId);
    if (!record) fail('APP795_READBACK_RECORD_MISSING', operation.recordId);
    for (const [fieldCode, expected] of Object.entries(operation.values)) {
      const actual = unwrap(record[fieldCode]);
      if (String(actual) !== String(expected)) {
        fail('APP795_READBACK_VALUE_MISMATCH', `${operation.recordId} ${fieldCode}.`);
      }
    }
  }
  return true;
}

function validateProvenanceValueSet(values) {
  if (!isPlainObject(values)) fail('APP794_PROVENANCE_VALUE_SET_INVALID', 'Provenance values are required.');
  for (const fieldCode of APP794_PROVENANCE_FIELD_CODES) {
    if (!Object.prototype.hasOwnProperty.call(values, fieldCode)) {
      fail('APP794_PROVENANCE_VALUE_SET_INVALID', `Missing ${fieldCode}.`);
    }
  }
  if (!readString(values.Frozen_Profile_Code)
      || !readString(values.Effective_Routing_Key)
      || !readString(values.Effective_Route_Version_Key)) {
    fail('APP794_PROVENANCE_VALUE_SET_INVALID', 'Provenance identity fields must be nonblank.');
  }
  const k = Number(unwrap(values.K_expected_Snapshot));
  if (k !== 1 && k !== 2) fail('APP794_PROVENANCE_K_INVALID', 'K_expected_Snapshot must be 1 or 2.');
  const scorerRaw = readString(values.Effective_Scorer_Slots_Snapshot);
  let slots;
  try { slots = JSON.parse(scorerRaw); } catch {
    fail('APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID', 'Scorer snapshot must be JSON.');
  }
  if (!Array.isArray(slots) || slots.length !== k || slots.some(x => !Number.isInteger(Number(x)))) {
    fail('APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID', 'Scorer snapshot must contain exactly K integer slots.');
  }
}

export function buildApp794ProvenancePlan({
  currentSchema,
  existingRecords = [],
  policy,
  backupEvidence
}) {
  assertBackup(backupEvidence, 794);
  const fields = normalizedFields(currentSchema);
  if (!isPlainObject(policy)
      || policy.explicitlyResolved !== true
      || typeof policy.decisionRef !== 'string'
      || !policy.decisionRef.trim()) {
    fail(
      'APP794_EXISTING_RECORD_PROVENANCE_BACKFILL_POLICY_NOT_DEFINED',
      'An explicit historical-record provenance policy is required.'
    );
  }

  const additions = [];
  for (const fieldCode of APP794_PROVENANCE_FIELD_CODES) {
    const target = mboFields[fieldCode];
    const current = fields[fieldCode];
    assertCompatibleType(current, target, fieldCode);
    if (!current) {
      additions.push({
        fieldCode,
        operation: 'ADD_FIELD_STAGED_OPTIONAL',
        spec: stagedOptionalSpec(target)
      });
    }
  }

  if (policy.mode === 'DEFER_REQUIREDNESS_NO_BACKFILL') {
    return {
      appId: 794,
      mode: D3_EXE1_MODE,
      policyMode: policy.mode,
      additions,
      backfillOperations: [],
      finalRequirednessOperations: [],
      requirednessDeferred: existingRecords.length > 0,
      noBusinessValueInvented: true
    };
  }

  if (policy.mode !== 'EXPLICIT_BACKFILL') {
    fail('APP794_PROVENANCE_POLICY_MODE_INVALID', 'Unsupported explicit provenance policy mode.');
  }
  if (!Array.isArray(existingRecords)
      || !Array.isArray(policy.records)
      || existingRecords.length !== policy.records.length) {
    fail('APP794_PROVENANCE_BACKFILL_SET_MISMATCH', 'Policy must cover the exact existing record set.');
  }

  const existingById = new Map(existingRecords.map(record => [readRecordId(record), record]));
  const backfillOperations = policy.records.map(entry => {
    if (!isPlainObject(entry)) fail('APP794_PROVENANCE_BACKFILL_ENTRY_INVALID', 'Invalid backfill entry.');
    const recordId = String(entry.recordId ?? '').trim();
    const expectedRevision = String(entry.expectedRevision ?? '').trim();
    const record = existingById.get(recordId);
    if (!record) fail('APP794_PROVENANCE_BACKFILL_SET_MISMATCH', `Unknown record ${recordId}.`);
    if (readRevision(record) !== expectedRevision) {
      fail('APP794_RECORD_REVISION_DRIFT', `Revision drift on App794 record ${recordId}.`);
    }
    validateProvenanceValueSet(entry.values);
    return {
      operation: 'UPDATE_EXISTING_RECORD_LOCAL_CONTRACT',
      appId: 794,
      recordId,
      expectedRevision,
      values: deepClone(entry.values)
    };
  });

  const finalRequirednessOperations = APP794_PROVENANCE_FIELD_CODES.map(fieldCode => ({
    fieldCode,
    operation: 'FINALIZE_FIELD_PROPERTIES',
    target: cloneFieldSpec(mboFields[fieldCode])
  }));

  return {
    appId: 794,
    mode: D3_EXE1_MODE,
    policyMode: policy.mode,
    additions,
    backfillOperations,
    finalRequirednessOperations,
    requirednessDeferred: false,
    noBusinessValueInvented: true
  };
}

export function applyApp794BackfillLocal({ records, plan }) {
  const byId = new Map(records.map(record => [readRecordId(record), record]));
  return records.map(record => {
    const id = readRecordId(record);
    const operation = plan.backfillOperations.find(item => item.recordId === id);
    if (!operation) return deepClone(record);
    if (readRevision(record) !== operation.expectedRevision) {
      fail('APP794_RECORD_REVISION_DRIFT', `Revision drift on App794 record ${id}.`);
    }
    return {
      ...deepClone(record),
      ...deepClone(operation.values),
      $id: id,
      $revision: operation.expectedRevision
    };
  });
}

function applySchemaOperationsLocal(fields, operations) {
  const next = deepClone(fields);
  for (const operation of operations) {
    if (operation.operation === 'ADD_FIELD_STAGED_OPTIONAL') {
      if (next[operation.fieldCode]) fail('LOCAL_SCHEMA_SIMULATION_CONFLICT', `${operation.fieldCode} already exists.`);
      next[operation.fieldCode] = deepClone(operation.spec);
    } else if (operation.operation === 'FINALIZE_FIELD_PROPERTIES') {
      if (!next[operation.fieldCode]) fail('LOCAL_SCHEMA_SIMULATION_MISSING_FIELD', operation.fieldCode);
      next[operation.fieldCode] = {
        ...next[operation.fieldCode],
        ...deepClone(operation.target)
      };
    } else {
      fail('LOCAL_SCHEMA_SIMULATION_OPERATION_UNSUPPORTED', operation.operation);
    }
  }
  return next;
}

export function executeD3SandboxMigrationLocalOnly({
  authorization,
  manifest,
  scorerApproval,
  app795,
  app794
}) {
  assertExe1LocalAuthorization(authorization);
  const manifestEvidence = assertRouteManifestIntegrity(manifest);

  const app795SchemaPlan = buildApp795SchemaStages({
    currentSchema: app795.currentSchema,
    manifest,
    backupEvidence: app795.backupEvidence
  });
  const app795SeedOperations = buildApp795SeedOperations({ manifest, scorerApproval });

  let app795Fields = normalizedFields(app795.currentSchema);
  app795Fields = applySchemaOperationsLocal(app795Fields, app795SchemaPlan.stages[0].operations);
  const app795Records = applyApp795SeedOperationsLocal({
    records: app795.records,
    operations: app795SeedOperations
  });
  assertApp795SeedReadBack({ manifest, records: app795Records, scorerApproval });
  app795Fields = applySchemaOperationsLocal(app795Fields, app795SchemaPlan.stages[2].operations);

  const app794Plan = buildApp794ProvenancePlan({
    currentSchema: app794.currentSchema,
    existingRecords: app794.records,
    policy: app794.policy,
    backupEvidence: app794.backupEvidence
  });
  let app794Fields = normalizedFields(app794.currentSchema);
  app794Fields = applySchemaOperationsLocal(app794Fields, app794Plan.additions);
  const app794Records = applyApp794BackfillLocal({ records: app794.records, plan: app794Plan });
  app794Fields = applySchemaOperationsLocal(app794Fields, app794Plan.finalRequirednessOperations);

  const evidence = {
    workPackageId: D3_EXE1_WORK_PACKAGE,
    executionMode: D3_EXE1_MODE,
    liveExecutionAllowed: false,
    manifestSha256: manifestEvidence.sha256,
    app795SeedOperationCount: app795SeedOperations.length,
    app794PolicyMode: app794Plan.policyMode,
    kintoneReads: 0,
    kintoneWrites: 0,
    schemaWrites: 0,
    processWrites: 0,
    deployments: 0
  };
  evidence.packetSha256 = sha256Hex(Buffer.from(JSON.stringify(evidence), 'utf8'));

  return {
    status: 'LOCAL_SIMULATION_PASS',
    evidence,
    simulatedState: {
      app795: { fields: app795Fields, records: app795Records },
      app794: { fields: app794Fields, records: app794Records }
    },
    plans: { app795SchemaPlan, app795SeedOperations, app794Plan }
  };
}

export function executeLiveD3SandboxMigration() {
  fail('D3_EXE1_LIVE_IO_LOCKED', 'EXE1 cannot perform live Kintone reads/writes, schema/process writes, or deployment.');
}
