import {
  APP794_PROVENANCE_FIELD_CODES,
  D3_EXE1_LIVE_IO_LOCKED,
  D3_EXE1_ROUTE_MANIFEST_SHA256,
  applyApp795SeedOperationsLocal,
  assertApp795SeedReadBack,
  assertRouteManifestIntegrity,
  assertScorerMappingApproval,
  buildApp794ProvenancePlan,
  buildApp795SchemaStages,
  buildApp795SeedOperations
} from './d3-sbx-migration-local-executor.js';

export { D3_EXE1_ROUTE_MANIFEST_SHA256 };

export const D3_PREEXEC_WORK_PACKAGE = 'D3-SBX-MIGRATION-01-PREEXEC-01';
export const D3_LIVE_MIGRATION_WORK_PACKAGE = 'D3-SBX-MIGRATION-01';
export const D3_LIVE_MIGRATION_MODE = 'GUARDED_LIVE_MIGRATION';
export const D3_PREEXEC_BASE_HEAD = 'd6dc7ea4e8e7e88776c91be97bd8378ac1fb94d5';
export const D3_PREWRITE_BACKUP_SHA256 =
  '75ee58bf110529f8809f0b6cf6a946bbe5d77f24c52cb01271913ba2a2229c73';
export const D3_APP795_CONTRACT_AWARE_SHA256 =
  'a502bc0e5cd35eece5578512fb2675fe8516981ea21e7e884514151cee91735a';
export const D3_APP794_PROCESS_CANONICAL_SHA256 =
  '46fcbb72f3bfcdebe17946aff0ae2b0b9da194f4a4a3d23dfacae22872aa6d56';

export const D3_ALLOWED_WRITE_APP_IDS = Object.freeze([794, 795]);
export const D3_GUARD_READ_APP_IDS = Object.freeze([794, 795, 798]);
export const D3_FORBIDDEN_WRITE_APP_IDS = Object.freeze([796, 797, 798, 800]);
export const D3_EXPECTED_APP_BASELINES = Object.freeze({
  794: Object.freeze({ revision: '70', fieldCount: 344, recordCount: 1 }),
  795: Object.freeze({ revision: '11', fieldCount: 28, recordCount: 20 }),
  798: Object.freeze({ revision: '5', fieldCount: 23, recordCount: 0 })
});

export const D3_APP795_ACL_BASELINE = Object.freeze({
  dedicatedAccess: 'VIEW_ONLY',
  employeeAccess: 'VIEW_ONLY',
  creator: 'FULL',
  everyone: 'NONE',
  hrAdminGroup: 'NO_WRITE_GRANT',
  recordAclEntries: 0,
  fieldAclEntries: 0
});

export const D3_FROZEN_WRITE_SEQUENCE = Object.freeze([
  'ASSERT_AUTHORIZATION_AND_FROZEN_CONTRACT',
  'READ_PREWRITE_GUARDS_794_795_798',
  'APP795_STAGE_OPTIONAL_FIELDS',
  'APP795_ACTIVATE_STAGED_SCHEMA',
  'APP795_REVALIDATE_EXACT_20_RECORDS',
  'APP795_UPDATE_EXACT_20_EXISTING_RECORDS_ATOMIC',
  'APP795_SEED_READBACK',
  'APP795_FINALIZE_FIELD_PROPERTIES',
  'APP795_ACTIVATE_FINAL_SCHEMA',
  'APP795_FINAL_READBACK',
  'APP794_STAGE_EXACT_5_PROVENANCE_FIELDS_OPTIONAL',
  'APP794_ACTIVATE_STAGED_SCHEMA',
  'APP794_NO_BACKFILL_READBACK',
  'APP798_FINAL_UNTOUCHED_HASH_CHECK',
  'STOP_FOR_INDEPENDENT_REVIEW'
]);

const ALLOWED_IO_METHODS = Object.freeze([
  'readAppSnapshot',
  'stageFormSchema',
  'activateFormSchema',
  'updateExistingRecords'
]);

function fail(code, message, extra = {}) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  Object.assign(error, extra);
  throw error;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function exactArray(actual, expected, code, label) {
  if (!Array.isArray(actual)
      || actual.length !== expected.length
      || actual.some((value, index) => value !== expected[index])) {
    fail(code, `${label} must exactly equal [${expected.join(',')}].`);
  }
}

function assertSha(value, code, label) {
  if (typeof value !== 'string' || !/^[0-9a-f]{40}$/.test(value)) {
    fail(code, `${label} must be an exact 40-character lowercase Git SHA.`);
  }
}

function assertSha256(value, code, label) {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) {
    fail(code, `${label} must be a lowercase SHA-256 hex digest.`);
  }
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

function normalizedFields(snapshot) {
  const fields = snapshot?.schema?.fields ?? snapshot?.currentSchema?.fields ?? snapshot?.fields;
  if (!isPlainObject(fields)) fail('LIVE_SNAPSHOT_SCHEMA_INVALID', `App ${snapshot?.appId} fields are required.`);
  return fields;
}

function recordsOf(snapshot) {
  if (!Array.isArray(snapshot?.records)) {
    fail('LIVE_SNAPSHOT_RECORDS_INVALID', `App ${snapshot?.appId} records are required.`);
  }
  return snapshot.records;
}

function assertSnapshotBase(snapshot, appId, { initial = false } = {}) {
  if (!isPlainObject(snapshot) || Number(snapshot.appId) !== appId) {
    fail('LIVE_SNAPSHOT_APP_ID_MISMATCH', `Expected normalized snapshot for App ${appId}.`);
  }
  const fields = normalizedFields(snapshot);
  const records = recordsOf(snapshot);
  if (Number(snapshot.fieldCount) !== Object.keys(fields).length
      || Number(snapshot.recordCount) !== records.length) {
    fail('LIVE_SNAPSHOT_COUNT_INCONSISTENT', `App ${appId} normalized counts do not match snapshot content.`);
  }
  if (initial) {
    const expected = D3_EXPECTED_APP_BASELINES[appId];
    if (String(snapshot.revision) !== expected.revision
        || Number(snapshot.fieldCount) !== expected.fieldCount
        || Number(snapshot.recordCount) !== expected.recordCount) {
      fail(
        'HEAD_OR_LIVE_DRIFT',
        `App ${appId} baseline drift: expected revision/fields/records `
          + `${expected.revision}/${expected.fieldCount}/${expected.recordCount}.`
      );
    }
  }
  return { fields, records };
}

function assertApp794Initial(snapshot) {
  const { fields } = assertSnapshotBase(snapshot, 794, { initial: true });
  const process = snapshot.process;
  if (!isPlainObject(process)
      || process.enabled !== true
      || Number(process.stateCount) !== 16
      || Number(process.actionCount) !== 31
      || process.canonicalSha256 !== D3_APP794_PROCESS_CANONICAL_SHA256) {
    fail('HEAD_OR_LIVE_DRIFT', 'App 794 process baseline drift detected.');
  }
  for (const fieldCode of APP794_PROVENANCE_FIELD_CODES) {
    if (Object.prototype.hasOwnProperty.call(fields, fieldCode)) {
      fail('HEAD_OR_LIVE_DRIFT', `App 794 provenance field ${fieldCode} already exists.`);
    }
  }
}

function assertApp795Acl(snapshot) {
  if (!isPlainObject(snapshot?.aclBaseline)) {
    fail('APP795_ACL_DRIFT', 'App 795 normalized ACL baseline is required.');
  }
  for (const [key, expected] of Object.entries(D3_APP795_ACL_BASELINE)) {
    if (snapshot.aclBaseline[key] !== expected) {
      fail('APP795_ACL_DRIFT', `App 795 ACL drift at ${key}.`);
    }
  }
}

function assertApp795PreSeed(snapshot, manifest, seedOperations, { initial = false } = {}) {
  assertSnapshotBase(snapshot, 795, { initial });
  assertApp795Acl(snapshot);
  if (snapshot.contractAwareComparisonSha256 !== D3_APP795_CONTRACT_AWARE_SHA256) {
    fail('HEAD_OR_LIVE_DRIFT', 'App 795 20-row contract-aware comparison hash drift detected.');
  }
  // Reuse the independently reviewed R1 exact-set/revision/precondition guard without writing.
  applyApp795SeedOperationsLocal({
    records: snapshot.records,
    operations: seedOperations
  });
  assertRouteManifestIntegrity(manifest);
}

function assertApp798Initial(snapshot) {
  assertSnapshotBase(snapshot, 798, { initial: true });
  assertSha256(snapshot.stableHash, 'APP798_STABLE_HASH_INVALID', 'App 798 stableHash');
}

function plannerBackupEvidence(appId, backupSha256) {
  return {
    appId,
    captured: true,
    verified: true,
    sha256: backupSha256,
    artifactPath: `PREWRITE_COMBINED_BACKUP/app-${appId}`
  };
}

function assertIoContract(io) {
  if (!isPlainObject(io)) fail('D3_LIVE_IO_ADAPTER_REQUIRED', 'A narrow injected I/O adapter is required.');
  for (const method of ALLOWED_IO_METHODS) {
    if (typeof io[method] !== 'function') {
      fail('D3_LIVE_IO_ADAPTER_INCOMPLETE', `Missing I/O method ${method}.`);
    }
  }
  const extraCallable = Object.keys(io)
    .filter(key => typeof io[key] === 'function' && !ALLOWED_IO_METHODS.includes(key));
  if (extraCallable.length) {
    fail('D3_LIVE_IO_ADAPTER_TOO_BROAD', `Unexpected callable I/O methods: ${extraCallable.join(',')}.`);
  }
}

function assertAuthorizationLedger(authorizationLedger) {
  if (!isPlainObject(authorizationLedger)
      || typeof authorizationLedger.consumeAuthorizationId !== 'function') {
    fail(
      'D3_AUTHORIZATION_LEDGER_REQUIRED',
      'A one-shot authorization ledger with consumeAuthorizationId(id) is required.'
    );
  }
}

export function assertD3LiveMigrationAuthorization({ authorization, currentCanonicalHead }) {
  if (!isPlainObject(authorization)) {
    fail('D3_LIVE_AUTHORIZATION_REQUIRED', 'Explicit future live-migration authorization is required.');
  }
  if (authorization.workPackageId !== D3_LIVE_MIGRATION_WORK_PACKAGE
      || authorization.mode !== D3_LIVE_MIGRATION_MODE
      || authorization.explicitOwnerAuthorization !== true) {
    fail('D3_LIVE_AUTHORIZATION_INVALID', 'Exact Owner-authorized guarded live-migration contract is required.');
  }
  if (typeof authorization.authorizationId !== 'string' || !authorization.authorizationId.trim()) {
    fail('D3_AUTHORIZATION_ID_REQUIRED', 'A unique authorizationId is required.');
  }
  assertSha(authorization.reviewedPreexecHead, 'D3_REVIEWED_PREEXEC_HEAD_INVALID', 'reviewedPreexecHead');
  assertSha(authorization.expectedCanonicalHead, 'D3_EXPECTED_HEAD_INVALID', 'expectedCanonicalHead');
  assertSha(currentCanonicalHead, 'D3_CURRENT_HEAD_INVALID', 'currentCanonicalHead');
  if (authorization.reviewedPreexecHead !== authorization.expectedCanonicalHead
      || authorization.expectedCanonicalHead !== currentCanonicalHead) {
    fail('HEAD_OR_LIVE_DRIFT', 'Canonical Git HEAD does not equal the Owner-authorized reviewed PREEXEC head.');
  }
  if (authorization.prewriteBackupSha256 !== D3_PREWRITE_BACKUP_SHA256) {
    fail('PREWRITE_BACKUP_CHECKSUM_MISMATCH', 'PREWRITE backup SHA-256 does not match the reviewed evidence.');
  }
  if (authorization.routeManifestSha256 !== D3_EXE1_ROUTE_MANIFEST_SHA256) {
    fail('ROUTE_MANIFEST_HASH_MISMATCH', 'Route manifest hash does not match the frozen PRE1 contract.');
  }
  if (authorization.app794Policy !== 'DEFER_REQUIREDNESS_NO_BACKFILL') {
    fail('APP794_POLICY_MISMATCH', 'App 794 must use DEFER_REQUIREDNESS_NO_BACKFILL.');
  }
  exactArray(authorization.allowedWriteAppIds, D3_ALLOWED_WRITE_APP_IDS, 'D3_WRITE_APP_SCOPE_INVALID', 'allowedWriteAppIds');
  exactArray(authorization.allowedReadAppIds, D3_GUARD_READ_APP_IDS, 'D3_READ_APP_SCOPE_INVALID', 'allowedReadAppIds');

  const requiredTrue = [
    'kintoneReadAllowed',
    'schemaWriteAllowed',
    'recordWriteAllowed',
    'schemaActivationDeployAllowed',
    'app795AtomicRecordUpdateRequired',
    'retainBackupUntilIndependentReview',
    'stopOnDrift'
  ];
  for (const flag of requiredTrue) {
    if (authorization[flag] !== true) fail('D3_LIVE_AUTHORIZATION_FLAG_INVALID', `${flag} must be true.`);
  }
  const requiredFalse = [
    'processWriteAllowed',
    'aclWriteAllowed',
    'customizationWriteAllowed',
    'recordCreateAllowed',
    'recordDeleteAllowed',
    'historicalBackfillAllowed',
    'automaticRetryAllowed',
    'automaticRollbackAllowed'
  ];
  for (const flag of requiredFalse) {
    if (authorization[flag] !== false) fail('D3_LIVE_AUTHORIZATION_FLAG_INVALID', `${flag} must be false.`);
  }
  return true;
}

function assertScorerApproval(scorerApproval) {
  assertScorerMappingApproval(scorerApproval);
  if (JSON.stringify(scorerApproval.mapping?.M1_G1) !== '[1,2]'
      || JSON.stringify(scorerApproval.mapping?.M1_ONLY) !== '[1]') {
    fail('SCORER_MAPPING_APPROVAL_MISMATCH', 'Exact Owner+HR scorer mapping is required.');
  }
}

function assertNoApp794Backfill(plan) {
  if (plan.policyMode !== 'DEFER_REQUIREDNESS_NO_BACKFILL'
      || plan.requirednessDeferred !== true
      || plan.backfillOperations.length !== 0
      || plan.finalRequirednessOperations.length !== 0
      || plan.additions.length !== 5) {
    fail('APP794_NO_BACKFILL_CONTRACT_VIOLATION', 'App 794 plan must add five optional fields with zero historical backfill.');
  }
  exactArray(
    plan.additions.map(operation => operation.fieldCode),
    [...APP794_PROVENANCE_FIELD_CODES],
    'APP794_FIELD_SCOPE_MISMATCH',
    'App 794 provenance additions'
  );
}

function assertApp794Post(snapshot) {
  const { fields, records } = assertSnapshotBase(snapshot, 794);
  if (records.length !== 1) fail('APP794_RECORD_SET_DRIFT', 'App 794 must still contain exactly one historical record.');
  for (const fieldCode of APP794_PROVENANCE_FIELD_CODES) {
    const field = fields[fieldCode];
    if (!field || field.required === true) {
      fail('APP794_REQUIREDNESS_OR_FIELD_DRIFT', `${fieldCode} must exist and remain optional.`);
    }
    if (readString(records[0]?.[fieldCode]) !== '') {
      fail('APP794_HISTORICAL_BACKFILL_DETECTED', `${fieldCode} must remain blank on the existing historical record.`);
    }
  }
}

function assertApp795Final(snapshot, manifest, scorerApproval, backupSha256) {
  assertSnapshotBase(snapshot, 795);
  assertApp795Acl(snapshot);
  assertApp795SeedReadBack({ manifest, records: snapshot.records, scorerApproval });
  const residual = buildApp795SchemaStages({
    currentSchema: snapshot.schema,
    manifest,
    backupEvidence: plannerBackupEvidence(795, backupSha256)
  });
  const addOps = residual.stages[0].operations;
  const finalOps = residual.stages[2].operations;
  if (addOps.length !== 0 || finalOps.length !== 0) {
    fail('APP795_FINAL_SCHEMA_READBACK_MISMATCH', 'App 795 has residual schema operations after finalization.');
  }
}

function partialWriteError(error, journal) {
  const wrapped = new Error(`D3_LIVE_PARTIAL_WRITE_STOP: ${error.message}`);
  wrapped.code = 'D3_LIVE_PARTIAL_WRITE_STOP';
  wrapped.causeCode = error.code ?? null;
  wrapped.journal = clone(journal);
  wrapped.noAutomaticRetry = true;
  wrapped.noAutomaticRollback = true;
  wrapped.requiresIndependentRecoveryAuthorization = true;
  return wrapped;
}

export async function executeD3GuardedLiveMigration({
  authorization,
  currentCanonicalHead,
  manifest,
  scorerApproval,
  app794Policy,
  io,
  authorizationLedger
}) {
  if (D3_EXE1_LIVE_IO_LOCKED !== true) {
    fail('LOCAL_EXECUTOR_LOCK_DRIFT', 'The previously reviewed local executor must remain live-I/O locked.');
  }
  assertD3LiveMigrationAuthorization({ authorization, currentCanonicalHead });
  assertRouteManifestIntegrity(manifest);
  assertScorerApproval(scorerApproval);
  if (!isPlainObject(app794Policy)
      || app794Policy.mode !== 'DEFER_REQUIREDNESS_NO_BACKFILL'
      || app794Policy.explicitlyResolved !== true
      || typeof app794Policy.decisionRef !== 'string'
      || !app794Policy.decisionRef.trim()) {
    fail('APP794_POLICY_MISMATCH', 'Resolved DEFER_REQUIREDNESS_NO_BACKFILL policy object is required.');
  }
  assertIoContract(io);
  assertAuthorizationLedger(authorizationLedger);

  const journal = [];
  let firstWriteStarted = false;
  const mark = (stage, detail = {}) => journal.push({ stage, ...detail });

  try {
    const app794Before = await io.readAppSnapshot(794);
    const app795Before = await io.readAppSnapshot(795);
    const app798Before = await io.readAppSnapshot(798);
    assertApp794Initial(app794Before);
    assertApp798Initial(app798Before);

    const app795SeedOperations = buildApp795SeedOperations({ manifest, scorerApproval });
    assertApp795PreSeed(app795Before, manifest, app795SeedOperations, { initial: true });
    mark('PREWRITE_GUARDS_PASS', { apps: [794, 795, 798] });

    const app795SchemaPlan = buildApp795SchemaStages({
      currentSchema: app795Before.schema,
      manifest,
      backupEvidence: plannerBackupEvidence(795, authorization.prewriteBackupSha256)
    });
    const app794Plan = buildApp794ProvenancePlan({
      currentSchema: app794Before.schema,
      existingRecords: app794Before.records,
      policy: app794Policy,
      backupEvidence: plannerBackupEvidence(794, authorization.prewriteBackupSha256)
    });
    assertNoApp794Backfill(app794Plan);

    const consumed = await authorizationLedger.consumeAuthorizationId(authorization.authorizationId);
    if (consumed !== true) {
      fail('D3_AUTHORIZATION_REPLAY_OR_LEDGER_REJECTED', 'Authorization ID was not consumed as a fresh one-shot lease.');
    }
    mark('AUTHORIZATION_ID_CONSUMED', { authorizationId: authorization.authorizationId });

    firstWriteStarted = true;
    await io.stageFormSchema({
      appId: 795,
      operations: clone(app795SchemaPlan.stages[0].operations),
      expectedLiveRevision: String(app795Before.revision),
      phase: 'APP795_STAGE_OPTIONAL_FIELDS'
    });
    mark('APP795_STAGE_OPTIONAL_FIELDS');

    const app795Activation1 = await io.activateFormSchema({
      appId: 795,
      phase: 'APP795_ACTIVATE_STAGED_SCHEMA'
    });
    mark('APP795_ACTIVATE_STAGED_SCHEMA', { activation: clone(app795Activation1 ?? null) });

    const app795PreSeed = await io.readAppSnapshot(795);
    assertApp795PreSeed(app795PreSeed, manifest, app795SeedOperations);
    mark('APP795_PRESEED_REVALIDATED', { recordCount: 20 });

    await io.updateExistingRecords({
      appId: 795,
      operations: clone(app795SeedOperations),
      atomic: true,
      phase: 'APP795_SEED_EXACT_20'
    });
    mark('APP795_SEED_EXACT_20', { operationCount: 20 });

    const app795SeedReadback = await io.readAppSnapshot(795);
    assertApp795Acl(app795SeedReadback);
    assertApp795SeedReadBack({ manifest, records: app795SeedReadback.records, scorerApproval });
    mark('APP795_SEED_READBACK_PASS');

    await io.stageFormSchema({
      appId: 795,
      operations: clone(app795SchemaPlan.stages[2].operations),
      expectedLiveRevision: String(app795SeedReadback.revision),
      phase: 'APP795_FINALIZE_FIELD_PROPERTIES'
    });
    mark('APP795_FINALIZE_FIELD_PROPERTIES');

    const app795Activation2 = await io.activateFormSchema({
      appId: 795,
      phase: 'APP795_ACTIVATE_FINAL_SCHEMA'
    });
    mark('APP795_ACTIVATE_FINAL_SCHEMA', { activation: clone(app795Activation2 ?? null) });

    const app795Final = await io.readAppSnapshot(795);
    assertApp795Final(app795Final, manifest, scorerApproval, authorization.prewriteBackupSha256);
    mark('APP795_FINAL_READBACK_PASS');

    await io.stageFormSchema({
      appId: 794,
      operations: clone(app794Plan.additions),
      expectedLiveRevision: String(app794Before.revision),
      phase: 'APP794_STAGE_PROVENANCE_FIELDS'
    });
    mark('APP794_STAGE_PROVENANCE_FIELDS', { operationCount: 5 });

    const app794Activation = await io.activateFormSchema({
      appId: 794,
      phase: 'APP794_ACTIVATE_STAGED_SCHEMA'
    });
    mark('APP794_ACTIVATE_STAGED_SCHEMA', { activation: clone(app794Activation ?? null) });

    const app794Final = await io.readAppSnapshot(794);
    assertApp794Post(app794Final);
    mark('APP794_NO_BACKFILL_READBACK_PASS');

    const app798Final = await io.readAppSnapshot(798);
    assertSnapshotBase(app798Final, 798);
    if (app798Final.stableHash !== app798Before.stableHash) {
      fail('APP798_UNEXPECTED_DRIFT', 'App 798 changed during migration; STOP for independent recovery decision.');
    }
    mark('APP798_FINAL_UNTOUCHED_HASH_PASS');

    return {
      status: 'MIGRATION_EXECUTION_COMPLETE_REVIEW_PENDING',
      workPackageId: D3_LIVE_MIGRATION_WORK_PACKAGE,
      authorizationId: authorization.authorizationId,
      writeApps: [...D3_ALLOWED_WRITE_APP_IDS],
      guardReadApps: [...D3_GUARD_READ_APP_IDS],
      forbiddenWriteApps: [...D3_FORBIDDEN_WRITE_APP_IDS],
      journal: clone(journal),
      noProcessWrite: true,
      noAclWrite: true,
      noCustomizationWrite: true,
      noRecordCreateDelete: true,
      noHistoricalBackfill: true,
      independentReviewRequired: true
    };
  } catch (error) {
    if (firstWriteStarted) throw partialWriteError(error, journal);
    throw error;
  }
}
