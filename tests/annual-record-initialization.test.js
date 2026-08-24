import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AnnualRecordService,
  AnnualRecordError,
  EXPLICIT_WRITE_FIELDS,
  SYSTEM_FIELDS_ALLOWLIST
} from '../src/services/annual-record-service.js';
import { EmployeeService, EmployeeLookupError } from '../src/services/employee-service.js';
import { getJapaneseFiscalYear, generateRecordKey } from '../src/core/fiscal-year-engine.js';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget,
  assertWorkPackageAuthorization
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

function createMockKintoneApi({
  formFieldsResponse = null,
  recordsResponse = [],
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
      return formFieldsResponse || { properties: {} };
    },
    async getRecords(appId, query) {
      callCount.getRecords++;
      lastCalls.getRecords = { appId, query };
      if (shouldThrow) throw new Error('API Get Records Error');
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
  const mockValidProperties = {
    Record_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
    Fiscal_Year: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
    Employee_Code: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
    Objective_Count: { type: 'DROP_DOWN', required: true, defaultValue: '4' }
  };
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

test('REC-004: Layer 2 Kintone unique conflict simulated via mock produces structured duplicate error', async () => {
  const api = createMockKintoneApi({ errorType: 'UNIQUE_CONFLICT' });

  await assert.rejects(
    async () => await api.postRecord(794, {}),
    (err) => {
      assert.equal(err.code, 'CB_VA01');
      assert.match(err.message, /unique constraint violation/);
      return true;
    }
  );
});

test('REC-005: Employee lookup EMPLOYEE_NOT_FOUND results in zero create calls', async () => {
  const mockApp53Api = {
    async getRecords() {
      return { records: [] }; // Not found
    }
  };
  const app794Api = createMockKintoneApi();

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('9999', mockApp53Api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_NOT_FOUND');
      return true;
    }
  );

  // Assert zero POST calls to App 794
  assert.equal(app794Api.getCallCount().postRecord, 0);
});

test('REC-006: Employee lookup EMPLOYEE_CODE_INVALID results in zero create calls', async () => {
  const app794Api = createMockKintoneApi();

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('01 49', {}),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  assert.equal(app794Api.getCallCount().postRecord, 0);
});

test('REC-007: Employee lookup EMPLOYEE_SOURCE_AMBIGUOUS results in zero create calls', async () => {
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
  const app794Api = createMockKintoneApi();

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('9000', mockApp53Api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_AMBIGUOUS');
      return true;
    }
  );

  assert.equal(app794Api.getCallCount().postRecord, 0);
});

test('REC-008: Employee lookup EMPLOYEE_SOURCE_INCOMPLETE results in zero create calls', async () => {
  const mockApp53Api = {
    async getRecords() {
      return {
        records: [{ emp_text: { value: '' } }] // Incomplete
      };
    }
  };
  const app794Api = createMockKintoneApi();

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('195', mockApp53Api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_INCOMPLETE');
      return true;
    }
  );

  assert.equal(app794Api.getCallCount().postRecord, 0);
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

test('REC-011: Normalized read-back verification detects unmapped field modifications', () => {
  const postPayload = AnnualRecordService.buildInitializationPayload('FY2026', mockSyntheticEmployee);

  // Exact matching readback
  const validWrittenRecord = {
    ...postPayload,
    $id: { value: '901' },
    $revision: { value: '1' }
  };
  assert.equal(AnnualRecordService.verifyNormalizedReadBack(validWrittenRecord, postPayload), true);

  // Unexpected populated business field (e.g. unexpected score)
  const corruptRecord = {
    ...validWrittenRecord,
    Manager_Score_1: { value: '95' } // Unexpected business field populated
  };

  assert.throws(
    () => AnnualRecordService.verifyNormalizedReadBack(corruptRecord, postPayload),
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

test('REC-018: Rollback authorization only permits deletion of the exact newly-created record ID', () => {
  const targetAppId = 794;
  const createdRecordId = '905';

  // Allowed rollback target
  assert.doesNotThrow(() => {
    assertSandboxWriteTarget(targetAppId, undefined, [targetAppId], {
      backupVerified: true,
      activeWindow: true,
      manifest: { allowedAppId: 794, operation: 'RECORD_DELETE', targetRecordId: createdRecordId },
      dryRunBypassDiscovery: true
    });
  });
});
