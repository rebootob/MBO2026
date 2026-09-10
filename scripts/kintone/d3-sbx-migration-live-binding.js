import crypto from 'node:crypto';
import path from 'node:path';
import { mkdir, open } from 'node:fs/promises';

export const D3_BINDING_ALLOWED_READ_APP_IDS = Object.freeze([794, 795, 798]);
export const D3_BINDING_ALLOWED_WRITE_APP_IDS = Object.freeze([794, 795]);
export const D3_BINDING_FORBIDDEN_WRITE_APP_IDS = Object.freeze([796, 797, 798, 800]);

export const D3_BINDING_ENDPOINTS = Object.freeze({
  previewFields: '/k/v1/preview/app/form/fields.json',
  previewDeploy: '/k/v1/preview/app/deploy.json',
  records: '/k/v1/records.json'
});

const APP795_FIELD_ALLOWLIST = Object.freeze([
  'Routing_Key',
  'Version_Key',
  'Version_Number',
  'Version_Status',
  'Route_Pattern',
  'Scorer_Priority_Slots',
  'Effective_From',
  'Effective_To'
]);

const APP794_FIELD_ALLOWLIST = Object.freeze([
  'Frozen_Profile_Code',
  'K_expected_Snapshot',
  'Effective_Routing_Key',
  'Effective_Route_Version_Key',
  'Effective_Scorer_Slots_Snapshot'
]);

const PHASE_CONTRACT = Object.freeze({
  APP795_STAGE_OPTIONAL_FIELDS: Object.freeze({ appId: 795, operation: 'ADD_FIELD_STAGED_OPTIONAL' }),
  APP795_FINALIZE_FIELD_PROPERTIES: Object.freeze({ appId: 795, operation: 'FINALIZE_FIELD_PROPERTIES' }),
  APP794_STAGE_PROVENANCE_FIELDS: Object.freeze({ appId: 794, operation: 'ADD_FIELD_STAGED_OPTIONAL' })
});

function fail(code, message) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  throw error;
}

function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function exactArray(actual, expected, code, label) {
  if (!Array.isArray(actual)
      || actual.length !== expected.length
      || actual.some((value, index) => value !== expected[index])) {
    fail(code, `${label} must exactly equal [${expected.join(',')}].`);
  }
}

function assertPositiveRevision(value, code = 'D3_BINDING_REVISION_INVALID') {
  const revision = String(value ?? '').trim();
  if (!/^[1-9]\d*$/.test(revision)) fail(code, 'A positive numeric revision is required.');
  return revision;
}

function assertReadAppId(appId) {
  if (!D3_BINDING_ALLOWED_READ_APP_IDS.includes(Number(appId))) {
    fail('D3_BINDING_READ_APP_FORBIDDEN', `Read access to App ${appId} is outside the frozen guard scope.`);
  }
}

function assertWriteAppId(appId) {
  if (!D3_BINDING_ALLOWED_WRITE_APP_IDS.includes(Number(appId))) {
    fail('D3_BINDING_WRITE_APP_FORBIDDEN', `Write access to App ${appId} is outside the frozen migration scope.`);
  }
}

function assertTransport(transport) {
  if (!isPlainObject(transport) || typeof transport.request !== 'function') {
    fail('D3_BINDING_TRANSPORT_INVALID', 'Transport must expose request(requestSpec).');
  }
  const extraCallable = Object.keys(transport)
    .filter(key => typeof transport[key] === 'function' && key !== 'request');
  if (extraCallable.length) {
    fail('D3_BINDING_TRANSPORT_TOO_BROAD', `Unexpected transport callables: ${extraCallable.join(',')}.`);
  }
}

function assertSnapshotReader(readAppSnapshot) {
  if (typeof readAppSnapshot !== 'function') {
    fail('D3_BINDING_SNAPSHOT_READER_REQUIRED', 'A reviewed normalized snapshot reader is required.');
  }
}

export function assertD3BindingMatchesRunnerContract({
  allowedReadAppIds,
  allowedWriteAppIds,
  forbiddenWriteAppIds
}) {
  exactArray(
    allowedReadAppIds,
    D3_BINDING_ALLOWED_READ_APP_IDS,
    'D3_BINDING_RUNNER_READ_SCOPE_MISMATCH',
    'allowedReadAppIds'
  );
  exactArray(
    allowedWriteAppIds,
    D3_BINDING_ALLOWED_WRITE_APP_IDS,
    'D3_BINDING_RUNNER_WRITE_SCOPE_MISMATCH',
    'allowedWriteAppIds'
  );
  exactArray(
    forbiddenWriteAppIds,
    D3_BINDING_FORBIDDEN_WRITE_APP_IDS,
    'D3_BINDING_RUNNER_FORBIDDEN_SCOPE_MISMATCH',
    'forbiddenWriteAppIds'
  );
  return true;
}

function fieldAllowlistFor(appId) {
  if (Number(appId) === 795) return APP795_FIELD_ALLOWLIST;
  if (Number(appId) === 794) return APP794_FIELD_ALLOWLIST;
  fail('D3_BINDING_WRITE_APP_FORBIDDEN', `No schema field allowlist exists for App ${appId}.`);
}

function assertSchemaPhase({ appId, phase, operations }) {
  assertWriteAppId(appId);
  const contract = PHASE_CONTRACT[phase];
  if (!contract || contract.appId !== Number(appId)) {
    fail('D3_BINDING_SCHEMA_PHASE_INVALID', `Unexpected schema phase ${phase} for App ${appId}.`);
  }
  if (!Array.isArray(operations) || operations.length === 0) {
    fail('D3_BINDING_SCHEMA_OPERATIONS_REQUIRED', 'Non-empty schema operations are required.');
  }
  const allowlist = fieldAllowlistFor(appId);
  const seen = new Set();
  for (const operation of operations) {
    if (!isPlainObject(operation)
        || operation.operation !== contract.operation
        || typeof operation.fieldCode !== 'string'
        || !allowlist.includes(operation.fieldCode)) {
      fail('D3_BINDING_SCHEMA_OPERATION_FORBIDDEN', `Schema operation is outside the frozen ${phase} contract.`);
    }
    if (seen.has(operation.fieldCode)) {
      fail('D3_BINDING_SCHEMA_FIELD_DUPLICATE', `Duplicate field operation for ${operation.fieldCode}.`);
    }
    seen.add(operation.fieldCode);
  }
  if (Number(appId) === 794) {
    exactArray(
      operations.map(operation => operation.fieldCode),
      APP794_FIELD_ALLOWLIST,
      'D3_BINDING_APP794_FIELD_SCOPE_MISMATCH',
      'App794 provenance field additions'
    );
  }
  return contract;
}

function propertiesForSchemaOperations(operations) {
  const properties = {};
  for (const operation of operations) {
    const source = operation.operation === 'ADD_FIELD_STAGED_OPTIONAL'
      ? operation.spec
      : operation.target;
    if (!isPlainObject(source)) {
      fail('D3_BINDING_SCHEMA_SPEC_INVALID', `Missing field spec for ${operation.fieldCode}.`);
    }
    properties[operation.fieldCode] = clone(source);
  }
  return properties;
}

function toKintoneRecordValues(values) {
  if (!isPlainObject(values)) fail('D3_BINDING_RECORD_VALUES_INVALID', 'Record values are required.');
  return Object.fromEntries(Object.entries(values).map(([fieldCode, value]) => [
    fieldCode,
    { value: clone(value) }
  ]));
}

export function createD3KintoneIoAdapter({ transport, readAppSnapshot }) {
  assertTransport(transport);
  assertSnapshotReader(readAppSnapshot);
  const pendingPreviewRevision = new Map();

  return Object.freeze({
    async readAppSnapshot(appId) {
      assertReadAppId(appId);
      return readAppSnapshot(Number(appId));
    },

    async stageFormSchema({ appId, operations, expectedLiveRevision, phase }) {
      const contract = assertSchemaPhase({ appId, phase, operations });
      const revision = assertPositiveRevision(expectedLiveRevision);
      const method = contract.operation === 'ADD_FIELD_STAGED_OPTIONAL' ? 'POST' : 'PUT';
      const response = await transport.request({
        method,
        path: D3_BINDING_ENDPOINTS.previewFields,
        body: {
          app: Number(appId),
          properties: propertiesForSchemaOperations(operations),
          revision
        },
        phase
      });
      const previewRevision = assertPositiveRevision(response?.revision, 'D3_BINDING_STAGE_RESULT_REVISION_INVALID');
      pendingPreviewRevision.set(Number(appId), previewRevision);
      return { previewRevision };
    },

    async activateFormSchema({ appId, phase }) {
      assertWriteAppId(appId);
      const validPhase = (Number(appId) === 795
        && ['APP795_ACTIVATE_STAGED_SCHEMA', 'APP795_ACTIVATE_FINAL_SCHEMA'].includes(phase))
        || (Number(appId) === 794 && phase === 'APP794_ACTIVATE_STAGED_SCHEMA');
      if (!validPhase) {
        fail('D3_BINDING_DEPLOY_PHASE_INVALID', `Unexpected schema activation phase ${phase} for App ${appId}.`);
      }
      const revision = pendingPreviewRevision.get(Number(appId));
      if (!revision) {
        fail('D3_BINDING_PREVIEW_REVISION_REQUIRED', `No staged preview revision exists for App ${appId}.`);
      }
      const response = await transport.request({
        method: 'POST',
        path: D3_BINDING_ENDPOINTS.previewDeploy,
        body: { apps: [{ app: Number(appId), revision }] },
        phase
      });
      pendingPreviewRevision.delete(Number(appId));
      return { revision, response: clone(response ?? null) };
    },

    async updateExistingRecords({ appId, operations, atomic, phase }) {
      if (Number(appId) !== 795
          || phase !== 'APP795_SEED_EXACT_20'
          || atomic !== true
          || !Array.isArray(operations)
          || operations.length !== 20) {
        fail('D3_BINDING_RECORD_UPDATE_SCOPE_INVALID', 'Only the atomic exact-20 App795 seed is allowed.');
      }
      const ids = new Set();
      const records = operations.map(operation => {
        if (!isPlainObject(operation)
            || Number(operation.appId) !== 795
            || operation.operation !== 'UPDATE_EXISTING_RECORD_LOCAL_CONTRACT') {
          fail('D3_BINDING_RECORD_OPERATION_INVALID', 'Unexpected App795 record operation.');
        }
        const id = String(operation.recordId ?? '').trim();
        const revision = assertPositiveRevision(operation.expectedRevision, 'D3_BINDING_RECORD_REVISION_INVALID');
        if (!/^[1-9]\d*$/.test(id) || ids.has(id)) {
          fail('D3_BINDING_RECORD_ID_INVALID', 'Record IDs must be 20 unique positive integers.');
        }
        ids.add(id);
        return {
          id,
          revision,
          record: toKintoneRecordValues(operation.values)
        };
      });
      const response = await transport.request({
        method: 'PUT',
        path: D3_BINDING_ENDPOINTS.records,
        body: { app: 795, records },
        phase
      });
      return { updated: records.length, response: clone(response ?? null) };
    }
  });
}

function assertAuthorizationId(id) {
  if (typeof id !== 'string' || !id.trim() || id.length > 256) {
    fail('D3_BINDING_AUTHORIZATION_ID_INVALID', 'authorizationId must be a non-empty string up to 256 characters.');
  }
  return id.trim();
}

export function createD3FileAuthorizationLedger({ directory }) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) {
    fail('D3_BINDING_LEDGER_DIRECTORY_INVALID', 'A dedicated absolute ledger directory is required.');
  }

  return Object.freeze({
    async consumeAuthorizationId(id) {
      const authorizationId = assertAuthorizationId(id);
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const digest = crypto.createHash('sha256').update(authorizationId, 'utf8').digest('hex');
      const markerPath = path.join(directory, `${digest}.consumed.json`);
      let handle;
      try {
        handle = await open(markerPath, 'wx', 0o600);
      } catch (error) {
        if (error?.code === 'EEXIST') return false;
        throw error;
      }
      try {
        await handle.writeFile(JSON.stringify({
          authorizationIdSha256: digest,
          consumedAt: new Date().toISOString()
        }) + '\n', 'utf8');
      } finally {
        await handle.close();
      }
      return true;
    }
  });
}
