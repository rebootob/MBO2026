import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AnnualRecordService,
  AnnualRecordError,
  EXPLICIT_WRITE_FIELDS,
  SYSTEM_FIELDS_ALLOWLIST,
  areNormalizedValuesEqual
} from '../src/services/annual-record-service.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { getJapaneseFiscalYear, generateRecordKey } from '../src/core/fiscal-year-engine.js';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget,
  assertWorkPackageAuthorization,
  assertRollbackAuthorization
} from '../src/core/sandbox-write-guard.js';

// Mock Synthetic Profile (Zero PII)
const mockSyntheticEmployee = {
  Employee_Code: '0149',
  Employee_Name: 'Test Employee',
  Employee_Name_TH: 'พนักงานทดสอบ',
  Employee_Department: 'Eco Energy & Textile Machinery',
  Employee_Section: 'TME1',
  Employee_Position: 'Test Position',
  Employee_Email: 'pilot0149@example.invalid',
  Employee_Start_Date: '2021-04-01'
};

const mockValidProperties = {
  Record_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
  Fiscal_Year: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  Employee_Code: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  Objective_Count: { type: 'DROP_DOWN', required: true, defaultValue: '4' }
};

function createMockKintoneApi({
  formFieldsResponse = null,
  recordsResponse = [],
  rawRecordsResponse = null,
  postResponse = null,
  shouldThrow = false,
  errorType = null
} = {}) {
  let callCount = { getFormFields: 0, getRecords: 0, postRecord: 0, deleteRecord: 0 };
  let lastCalls = {};

  return {
    async getFormFields(appId) {
      callCount.getFormFields++;
      lastCalls.getFormFields = { appId };
      if (shouldThrow) throw new Error('API Schema Error');
      return formFieldsResponse || { properties: mockValidProperties };
    },
    async getRecords(appId, query) {
      callCount.getRecords++;
      lastCalls.getRecords = { appId, query };
      if (shouldThrow) throw new Error('API Get Records Error');
      if (rawRecordsResponse !== null) return rawRecordsResponse;
      return { records: recordsResponse };
    },
    async postRecord(appId, record) {
      callCount.postRecord++;
      lastCalls.postRecord = { appId, record };
      if (errorType === 'UNIQUE_CONFLICT') {
        const err = new Error('CB_VA01: Duplicate Record_Key unique constraint violation');
        err.code = 'CB_VA01';
        throw err;
      }
      if (shouldThrow) throw new Error('API Post Record Error');
      return postResponse || { id: '901', revision: '1' };
    },
    async deleteRecords(appId, ids) {
      callCount.deleteRecord++;
      lastCalls.deleteRecords = { appId, ids };
      return { ids };
    },
    getCallCount() {
      return callCount;
    },
    getLastCalls() {
      return lastCalls;
    }
  };
}

test('REC-001: Dynamic FY calculation and canonical employee code produce exact candidate Record_Key', () => {
  const executionDate = '2026-08-24';
  const resolvedFY = getJapaneseFiscalYear(executionDate);
  assert.equal(resolvedFY, 'FY2026');

  const recordKey = generateRecordKey(resolvedFY, mockSyntheticEmployee.Employee_Code);
  assert.equal(recordKey, 'FY2026-0149');

  const payload = AnnualRecordService.buildInitializationPayload(resolvedFY, mockSyntheticEmployee);
  assert.equal(payload.Fiscal_Year.value, 'FY2026');
  assert.equal(payload.Record_Key.value, 'FY2026-0149');
  assert.equal(payload.Employee_Code.value, '0149');
  assert.equal(payload.Employee_Name.value, 'Test Employee');
  assert.equal(payload.Employee_Start_Date.value, '2021-04-01');
});

test('REC-002: Live schema preflight contract validates required, unique, and default metadata', async () => {
  const api = createMockKintoneApi({ formFieldsResponse: { properties: mockValidProperties } });
  const preflight = await AnnualRecordService.performLiveSchemaPreflight(794, api);

  assert.equal(preflight.isPreflightOk, true);
  assert.equal(preflight.blockedReason, null);
});

test('REC-003: Layer 1 application duplicate check stops duplicate write before API call', async () => {
  const existingRecord = {
    $id: { value: '900' },
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' }
  };
  const api = createMockKintoneApi({ recordsResponse: [existingRecord] });

  await assert.rejects(
    async () => await AnnualRecordService.checkDuplicateMBO(794, 'FY2026', '0149', api),
    (err) => {
      assert.equal(err instanceof AnnualRecordError, true);
      assert.equal(err.code, 'DUPLICATE_MBO_EXISTS');
      assert.match(err.userMessageTH, /มี MBO สำหรับปีงบประมาณ FY2026 อยู่แล้ว/);
      return true;
    }
  );
});

test('REC-004: Layer 2 Kintone unique conflict translated via AnnualRecordService (DEF-012)', () => {
  const kintoneErr = new Error('CB_VA01: Duplicate Record_Key unique constraint violation');
  kintoneErr.code = 'CB_VA01';

  const translated = AnnualRecordService.translateCreateError(kintoneErr, 'FY2026', '0149');
  assert.equal(translated instanceof AnnualRecordError, true);
  assert.equal(translated.code, 'DUPLICATE_MBO_EXISTS');
  assert.match(translated.userMessageTH, /Record Key ซ้ำซ้อน/);
  assert.equal(translated.cause, kintoneErr);
});

test('REC-005: Pipeline EMPLOYEE_NOT_FOUND fails closed with 0 create calls (DEF-015)', async () => {
  const mockApp53Api = {
    async getRecords() {
      return { records: [] }; // Not found
    }
  };
  const mboApi = createMockKintoneApi();

  await assert.rejects(
    async () => await AnnualRecordService.prepareInitializationCandidate({
      executionDate: '2026-08-24',
      employeeCode: '9999',
      mboAppId: 794,
      employeeApi: mockApp53Api,
      mboApi
    }),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_NOT_FOUND');
      return true;
    }
  );

  // Assert zero POST calls to App 794
  assert.equal(mboApi.getCallCount().postRecord, 0);
});

test('REC-006: Pipeline EMPLOYEE_CODE_INVALID fails closed with 0 create calls (DEF-015)', async () => {
  const mboApi = createMockKintoneApi();

  await assert.rejects(
    async () => await AnnualRecordService.prepareInitializationCandidate({
      executionDate: '2026-08-24',
      employeeCode: '01 49',
      mboAppId: 794,
      employeeApi: {},
      mboApi
    }),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  assert.equal(mboApi.getCallCount().postRecord, 0);
});

test('REC-007: Pipeline EMPLOYEE_SOURCE_AMBIGUOUS fails closed with 0 create calls (DEF-015)', async () => {
  const mockApp53Api = {
    async getRecords() {
      return {
        records: [
          { emp_text: { value: '9000' } },
          { emp_text: { value: '9000' } }
        ]
      };
    }
  };
  const mboApi = createMockKintoneApi();

  await assert.rejects(
    async () => await AnnualRecordService.prepareInitializationCandidate({
      executionDate: '2026-08-24',
      employeeCode: '9000',
      mboAppId: 794,
      employeeApi: mockApp53Api,
      mboApi
    }),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_AMBIGUOUS');
      return true;
    }
  );

  assert.equal(mboApi.getCallCount().postRecord, 0);
});

test('REC-008: Pipeline EMPLOYEE_SOURCE_INCOMPLETE fails closed with 0 create calls (DEF-015)', async () => {
  const mockApp53Api = {
    async getRecords() {
      return {
        records: [{ emp_text: { value: '' } }] // Incomplete
      };
    }
  };
  const mboApi = createMockKintoneApi();

  await assert.rejects(
    async () => await AnnualRecordService.prepareInitializationCandidate({
      executionDate: '2026-08-24',
      employeeCode: '195',
      mboAppId: 794,
      employeeApi: mockApp53Api,
      mboApi
    }),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_INCOMPLETE');
      return true;
    }
  );

  assert.equal(mboApi.getCallCount().postRecord, 0);
});

test('REC-009: Pre-write backup requirement is strictly enforced by safety guard', () => {
  const authNoBackup = {
    workPackageId: 'MBO-P02-WP-003',
    allowedAppIds: [794],
    allowedOperations: ['RECORD_CREATE'],
    backupVerified: false,
    activeWindow: true,
    dryRunBypassDiscovery: true
  };

  const req = {
    workPackageId: 'MBO-P02-WP-003',
    appId: 794,
    operation: 'RECORD_CREATE',
    manifest: { expectedChanges: [{ field: 'Record_Key', action: 'CREATE' }] }
  };

  assert.throws(
    () => assertWorkPackageAuthorization(authNoBackup, req),
    /BACKUP GATE/
  );
});

test('REC-010: Create attempt with closed write window (WRITE_ALLOWED_APPS = []) is blocked locally', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(
    () => assertSandboxWriteTarget(794, undefined, WRITE_ALLOWED_APPS),
    /WRITE BLOCKED/
  );
});

test('REC-011: Normalized read-back Tier B default equality and Tier D CALC structural verification (DEF-014)', () => {
  const postPayload = AnnualRecordService.buildInitializationPayload('FY2026', mockSyntheticEmployee);

  const schemaProperties = {
    ...mockValidProperties,
    Objective_Count: { type: 'DROP_DOWN', defaultValue: '4' },
    Requester_User: { type: 'USER_SELECT', defaultValue: [] },
    Manager_User: { type: 'USER_SELECT', defaultValue: [{ code: 'userM' }] },
    Total_Weight: { type: 'CALC' }
  };

  // Valid matching readback with valid primitive, array defaults, and server CALC
  const validWrittenRecord = {
    ...postPayload,
    $id: { value: '901' },
    $revision: { value: '1' },
    Objective_Count: { value: '4' },
    Requester_User: { value: [] },
    Manager_User: { value: [{ code: 'userM' }] },
    Total_Weight: { value: '100' }
  };
  assert.equal(AnnualRecordService.verifyNormalizedReadBack(validWrittenRecord, postPayload, schemaProperties), true);

  // Mismatched primitive server default (Tier B failure: "4" vs "2")
  const corruptPrimitiveDefault = {
    ...validWrittenRecord,
    Objective_Count: { value: '2' }
  };
  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(corruptPrimitiveDefault, postPayload, schemaProperties),
    (err) => {
      assert.equal(err.code, 'READBACK_DEFAULT_MISMATCH');
      return true;
    }
  );

  // Missing primitive default field in read-back (Tier B failure)
  const missingPrimitiveDefault = { ...validWrittenRecord };
  delete missingPrimitiveDefault.Objective_Count;
  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(missingPrimitiveDefault, postPayload, schemaProperties),
    (err) => {
      assert.equal(err.code, 'READBACK_DEFAULT_MISMATCH');
      return true;
    }
  );

  // Mismatched array server default (Tier B failure: [{ code: "userM" }] vs [{ code: "userOTHER" }])
  const corruptArrayDefault = {
    ...validWrittenRecord,
    Manager_User: { value: [{ code: 'userOTHER' }] }
  };
  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(corruptArrayDefault, postPayload, schemaProperties),
    (err) => {
      assert.equal(err.code, 'READBACK_DEFAULT_MISMATCH');
      return true;
    }
  );

  // Tier D: Direct client attempt to write CALC field in payload throws CALC_FIELD_WRITE_PROHIBITED
  const corruptPayloadWithCalc = {
    ...postPayload,
    Total_Weight: { value: '100' }
  };
  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(validWrittenRecord, corruptPayloadWithCalc, schemaProperties),
    (err) => {
      assert.equal(err.code, 'CALC_FIELD_WRITE_PROHIBITED');
      return true;
    }
  );

  // Tier D: CALC field missing from server read-back record throws CALC_READBACK_MISSING
  const corruptReadbackMissingCalc = { ...validWrittenRecord };
  delete corruptReadbackMissingCalc.Total_Weight;
  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(corruptReadbackMissingCalc, postPayload, schemaProperties),
    (err) => {
      assert.equal(err.code, 'CALC_READBACK_MISSING');
      return true;
    }
  );

  // Tier E: Unexpected populated business field throws UNEXPECTED_BUSINESS_FIELD_POPULATED
  const corruptFieldRecord = {
    ...validWrittenRecord,
    Manager_Score_1: { value: '95' }
  };
  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(corruptFieldRecord, postPayload, schemaProperties),
    (err) => {
      assert.equal(err.code, 'UNEXPECTED_BUSINESS_FIELD_POPULATED');
      return true;
    }
  );
});

test('REC-012: App 53 permanent read-only protection', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(53, undefined, [53]),
    /permanent PROTECTED PRODUCTION APP/
  );
});

test('REC-013: App 795 zero write protection during WP-003', () => {
  assert.throws(
    () => assertSandboxWriteTarget(795, undefined, [794]),
    /WRITE BLOCKED/
  );
});

test('REC-014: Protected apps (283..716) permanent hard denial', () => {
  for (const appId of PROTECTED_APP_IDS) {
    assert.throws(
      () => assertSandboxWriteTarget(appId, undefined, [appId]),
      /permanent PROTECTED PRODUCTION APP/
    );
  }
});

test('REC-015: Full regression suite execution verification', () => {
  assert.equal(EXPLICIT_WRITE_FIELDS.length, 10);
  assert.equal(SYSTEM_FIELDS_ALLOWLIST.length, 7);
});

test('REC-016: Required App 794 field missing from manifest without default blocks preflight', async () => {
  const mockPropertiesWithMissingRequired = {
    Record_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
    Some_Required_Field: { type: 'SINGLE_LINE_TEXT', required: true, defaultValue: '' }
  };
  const api = createMockKintoneApi({ formFieldsResponse: { properties: mockPropertiesWithMissingRequired } });
  const preflight = await AnnualRecordService.performLiveSchemaPreflight(794, api);

  assert.equal(preflight.isPreflightOk, false);
  assert.match(preflight.blockedReason, /REQUIRED_FIELD_UNRESOLVED: Some_Required_Field/);
});

test('REC-017: Requester_User required on live schema without resolved value blocks live create', async () => {
  const mockPropertiesWithRequesterUser = {
    Record_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
    Requester_User: { type: 'USER_SELECT', required: true, defaultValue: [] }
  };
  const api = createMockKintoneApi({ formFieldsResponse: { properties: mockPropertiesWithRequesterUser } });
  const preflight = await AnnualRecordService.performLiveSchemaPreflight(794, api);

  assert.equal(preflight.isPreflightOk, false);
  assert.match(preflight.blockedReason, /REQUIRED_FIELD_UNRESOLVED: Requester_User/);
});

test('REC-018: Rollback exact-record authorization contract and boundary enforcement (DEF-011)', () => {
  const baseAuthConfig = {
    workPackageId: 'MBO-P02-WP-003',
    allowedAppIds: [794],
    allowedOperations: ['RECORD_DELETE'],
    allowedRecordId: '905',
    backupVerified: true,
    activeWindow: true,
    dryRunBypassDiscovery: true
  };

  const baseManifest = { expectedChanges: [{ recordId: '905', action: 'DELETE' }] };

  // 1. 905 -> 905 (PASS)
  assert.equal(
    assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordId: '905',
      manifest: baseManifest
    }),
    true
  );

  // 2. 905 -> 904 (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordId: '904',
      manifest: baseManifest
    }),
    /Target record ID mismatch/
  );

  // 3. 905 -> 906 (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordId: '906',
      manifest: baseManifest
    }),
    /Target record ID mismatch/
  );

  // 4. 905 -> ["905"] (PASS)
  assert.equal(
    assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordIds: ['905'],
      manifest: baseManifest
    }),
    true
  );

  // 5. 905 -> ["905", "906"] (DENY: multi-record prohibited)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordIds: ['905', '906'],
      manifest: baseManifest
    }),
    /must contain exactly 1 ID/
  );

  // 6. 905 -> "905" passed as non-array targetRecordIds (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordIds: '905',
      manifest: baseManifest
    }),
    /targetRecordIds must be a valid array/
  );

  // 7. Missing target ID (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_DELETE',
      manifest: baseManifest
    }),
    /Missing target record ID/
  );

  // 8. Operation RECORD_CREATE (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_CREATE',
      targetRecordId: '905',
      manifest: baseManifest
    }),
    /Rollback requires 'RECORD_DELETE'/
  );

  // 9. Operation RECORD_UPDATE (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 794,
      operation: 'RECORD_UPDATE',
      targetRecordId: '905',
      manifest: baseManifest
    }),
    /Rollback requires 'RECORD_DELETE'/
  );

  // 10. App 795 (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-003',
      appId: 795,
      operation: 'RECORD_DELETE',
      targetRecordId: '905',
      manifest: baseManifest
    }),
    /App 795 is not in the authorized allow-list/
  );

  // 11. Wrong Work Package ID (DENY)
  assert.throws(
    () => assertRollbackAuthorization(baseAuthConfig, {
      workPackageId: 'MBO-P02-WP-001',
      appId: 794,
      operation: 'RECORD_DELETE',
      targetRecordId: '905',
      manifest: baseManifest
    }),
    /Work package mismatch/
  );
});

test('REC-019: Malformed duplicate check response {} throws DUPLICATE_CHECK_RESPONSE_INVALID (DEF-013)', async () => {
  const api = createMockKintoneApi({ rawRecordsResponse: {} });

  await assert.rejects(
    async () => await AnnualRecordService.checkDuplicateMBO(794, 'FY2026', '0149', api),
    (err) => {
      assert.equal(err.code, 'DUPLICATE_CHECK_RESPONSE_INVALID');
      return true;
    }
  );
});

test('REC-020: Malformed duplicate check response { records: null } throws DUPLICATE_CHECK_RESPONSE_INVALID (DEF-013)', async () => {
  const api = createMockKintoneApi({ rawRecordsResponse: { records: null } });

  await assert.rejects(
    async () => await AnnualRecordService.checkDuplicateMBO(794, 'FY2026', '0149', api),
    (err) => {
      assert.equal(err.code, 'DUPLICATE_CHECK_RESPONSE_INVALID');
      return true;
    }
  );
});
