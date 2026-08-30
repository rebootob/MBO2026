import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeeService, EmployeeLookupError } from '../src/services/employee-service.js';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget
} from '../src/core/sandbox-write-guard.js';

// Mock helper to simulate Kintone API and track calls
function createMockKintoneApi(recordsResponse, shouldThrow = false, rawResponse = null) {
  let callCount = 0;
  let lastQuery = null;
  let lastAppId = null;

  return {
    async getRecords(appId, query) {
      callCount++;
      lastAppId = appId;
      lastQuery = query;
      if (shouldThrow) {
        throw new Error('Network timeout / Kintone 500 Internal Error');
      }
      if (rawResponse !== null) {
        return rawResponse;
      }
      return { records: recordsResponse };
    },
    getCallCount() {
      return callCount;
    },
    getLastCall() {
      return { appId: lastAppId, query: lastQuery };
    }
  };
}

// Synthetic Fixture (DEF-010: Zero unnecessary real PII)
const mockPilot0149Record = {
  $id: { value: '386' },
  emp_text: { type: 'SINGLE_LINE_TEXT', value: '0149' },
  Number: { type: 'NUMBER', value: '149' },
  Text: { type: 'SINGLE_LINE_TEXT', value: 'Test Employee' },
  Text_0: { type: 'SINGLE_LINE_TEXT', value: 'พนักงานทดสอบ' },
  Drop_down_0: { type: 'DROP_DOWN', value: 'Eco Energy & Textile Machinery' },
  Drop_down: { type: 'DROP_DOWN', value: 'TME1' },
  Text_2: { type: 'SINGLE_LINE_TEXT', value: 'Test Position' },
  Text_4: { type: 'SINGLE_LINE_TEXT', value: 'pilot0149@example.invalid' },
  Date: { type: 'DATE', value: '2021-04-01' },
  Text_area: { type: 'MULTI_LINE_TEXT', value: 'Legacy Dept Hoshin' },
  Text_area_0: { type: 'MULTI_LINE_TEXT', value: 'Legacy Sec Hoshin' }
};

test('EMP-001: Valid canonical code "0149" returns EMPLOYEE_FOUND with canonical code "0149"', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);
  const result = await EmployeeService.lookupEmployee('0149', api);

  assert.equal(result.status, 'EMPLOYEE_FOUND');
  assert.equal(result.employee.Employee_Code, '0149');
  assert.equal(typeof result.employee.Employee_Code, 'string');
});

test('EMP-002: Query representation separation: Input "149" queries Number 149, but output is canonical "0149"', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);
  const result = await EmployeeService.lookupEmployee('149', api);

  assert.equal(result.status, 'EMPLOYEE_FOUND');
  // Canonical code comes strictly from App53.emp_text ("0149"), NOT the unpadded input "149"
  assert.equal(result.employee.Employee_Code, '0149');

  const lastCall = api.getLastCall();
  assert.equal(lastCall.appId, 53);
  assert.equal(lastCall.query, '(emp_text = "149" or Number = 149) limit 2');
});

test('EMP-003: Non-existent employee code throws EMPLOYEE_NOT_FOUND', async () => {
  const api = createMockKintoneApi([]);

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('9999', api),
    (err) => {
      assert.equal(err instanceof EmployeeLookupError, true);
      assert.equal(err.code, 'EMPLOYEE_NOT_FOUND');
      assert.match(err.userMessageTH, /ไม่พบข้อมูลพนักงานสำหรับรหัส 9999/);
      assert.match(err.userMessageEN, /Employee code 9999 was not found/);
      return true;
    }
  );
});

test('EMP-004: Empty or whitespace employee code throws EMPLOYEE_CODE_INVALID client-side without calling API', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('   ', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee(null, api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  // Assert API was never called
  assert.equal(api.getCallCount(), 0);
});

test('EMP-005: Numeric type and illegal characters throw EMPLOYEE_CODE_INVALID client-side without calling API', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee(149, api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      assert.match(err.userMessageEN, /must be a string/);
      return true;
    }
  );

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('01 49', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('01/49', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      return true;
    }
  );

  // Assert API was never called
  assert.equal(api.getCallCount(), 0);
});

test('EMP-006: Multiple matching records in App 53 throws EMPLOYEE_SOURCE_AMBIGUOUS (Fail-Closed)', async () => {
  const duplicateRecords = [
    { ...mockPilot0149Record, $id: { value: '101' }, emp_text: { value: '9000' } },
    { ...mockPilot0149Record, $id: { value: '102' }, emp_text: { value: '9000' } }
  ];
  const api = createMockKintoneApi(duplicateRecords);

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('9000', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_AMBIGUOUS');
      assert.match(err.userMessageTH, /ซ้ำซ้อน/);
      return true;
    }
  );
});

test('EMP-007: API / Network connectivity failure throws SOURCE_ACCESS_ERROR with user-safe message', async () => {
  const api = createMockKintoneApi([], true); // Throws API error

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('0149', api),
    (err) => {
      assert.equal(err.code, 'SOURCE_ACCESS_ERROR');
      assert.match(err.userMessageTH, /ไม่สามารถตรวจสอบข้อมูลพนักงานได้ในขณะนี้/);
      assert.match(err.userMessageEN, /Unable to verify employee information at this time/);
      assert.equal(Boolean(err.cause), true);
      return true;
    }
  );
});

test('EMP-008: Validates all 8 snapshot mapped fields and excludes deprecated Hoshin fields (DEF-010 Synthetic Data)', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);
  const result = await EmployeeService.lookupEmployee('0149', api);
  const emp = result.employee;

  assert.equal(emp.Employee_Code, '0149');
  assert.equal(emp.Employee_Name, 'Test Employee');
  assert.equal(emp.Employee_Name_TH, 'พนักงานทดสอบ');
  assert.equal(emp.Employee_Department, 'Eco Energy & Textile Machinery');
  assert.equal(emp.Employee_Section, 'TME1');
  assert.equal(emp.Employee_Position, 'Test Position');
  assert.equal(emp.Employee_Email, 'pilot0149@example.invalid');
  assert.equal(emp.Employee_Start_Date, '2021-04-01');

  // Strict check: Deprecated Hoshin fields must NOT exist in snapshot
  assert.equal(emp.Department_Hoshin, undefined);
  assert.equal(emp.Section_Hoshin, undefined);
  assert.equal(emp.Text_area, undefined);
  assert.equal(emp.Text_area_0, undefined);
});

test('EMP-009: EMPLOYEE_FOUND does not imply Routing Success (Decoupled Scope)', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);
  const result = await EmployeeService.lookupEmployee('0149', api);

  assert.equal(result.status, 'EMPLOYEE_FOUND');
  assert.equal(result.routing, undefined);
  assert.equal(result.approvers, undefined);
});

test('EMP-010: EMPLOYEE_FOUND does not imply Profile Success (Decoupled Scope)', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);
  const result = await EmployeeService.lookupEmployee('0149', api);

  assert.equal(result.status, 'EMPLOYEE_FOUND');
  assert.equal(result.evaluationProfile, undefined);
  assert.equal(result.scoringWeights, undefined);
});

test('EMP-011: Found record with missing or empty emp_text throws EMPLOYEE_SOURCE_INCOMPLETE', async () => {
  const incompleteRecord = {
    ...mockPilot0149Record,
    emp_text: { type: 'SINGLE_LINE_TEXT', value: '' }, // Missing emp_text
    Number: { type: 'NUMBER', value: '195' }
  };
  const api = createMockKintoneApi([incompleteRecord]);

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('195', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_INCOMPLETE');
      assert.match(err.userMessageTH, /ไม่สมบูรณ์/);
      assert.match(err.userMessageEN, /incomplete/);
      return true;
    }
  );
});

test('EMP-012: App 53 remains strictly read-only', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(53, undefined, [53]),
    /permanent PROTECTED PRODUCTION APP/
  );
});

test('EMP-013: App 794 default-deny write guard maintains 0 writes during WP-002', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(
    () => assertSandboxWriteTarget(794, undefined, WRITE_ALLOWED_APPS),
    /WRITE BLOCKED/
  );
});

test('EMP-014: App 795 remains unchanged (Deny)', () => {
  assert.throws(
    () => assertSandboxWriteTarget(795, undefined, WRITE_ALLOWED_APPS),
    /WRITE BLOCKED/
  );
});

test('EMP-015: Identity Mismatch: Input "149" matched Number 149 but emp_text is "0150" throws EMPLOYEE_SOURCE_MISMATCH (DEF-008)', async () => {
  const mismatchedRecord = {
    ...mockPilot0149Record,
    emp_text: { type: 'SINGLE_LINE_TEXT', value: '0150' }, // Inconsistent code!
    Number: { type: 'NUMBER', value: '149' }
  };
  const api = createMockKintoneApi([mismatchedRecord]);

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('149', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_SOURCE_MISMATCH');
      assert.match(err.userMessageTH, /ไม่ตรงกับรหัสที่ร้องขอ/);
      assert.match(err.userMessageEN, /does not match requested code/);
      return true;
    }
  );
});

test('EMP-016: Identity Consistency: Input "149" with matching emp_text "0149" passes successfully (DEF-008)', async () => {
  const api = createMockKintoneApi([mockPilot0149Record]);
  const result = await EmployeeService.lookupEmployee('149', api);

  assert.equal(result.status, 'EMPLOYEE_FOUND');
  assert.equal(result.employee.Employee_Code, '0149');
});

test('EMP-017: Malformed response object {} throws SOURCE_RESPONSE_INVALID (DEF-009)', async () => {
  const api = createMockKintoneApi([], false, {}); // Malformed raw response

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('0149', api),
    (err) => {
      assert.equal(err.code, 'SOURCE_RESPONSE_INVALID');
      assert.match(err.userMessageTH, /โครงสร้างข้อมูลตอบกลับ/);
      assert.match(err.userMessageEN, /Invalid response structure/);
      return true;
    }
  );
});

test('EMP-018: Malformed response { records: null } throws SOURCE_RESPONSE_INVALID and NOT EMPLOYEE_NOT_FOUND (DEF-009)', async () => {
  const api = createMockKintoneApi([], false, { records: null }); // Malformed records

  await assert.rejects(
    async () => await EmployeeService.lookupEmployee('0149', api),
    (err) => {
      assert.equal(err.code, 'SOURCE_RESPONSE_INVALID');
      assert.notEqual(err.code, 'EMPLOYEE_NOT_FOUND');
      return true;
    }
  );
});

// --- DEDICATED IDENTITY MAPPING CANDIDATE LOOKUP TESTS ---

test('DEDICATED_LOOKUP-001: Valid user code executes exact query MBO_Kintone_User in ("vassana") and Number_0 = 1 limit 2 against App 53', async () => {
  const api = createMockKintoneApi([{ $id: { value: '456' }, emp_text: { value: '0044' }, Number_0: { value: '1' } }]);
  const records = await EmployeeService.lookupDedicatedIdentityMappingCandidates('vassana', api);

  assert.equal(records.length, 1);
  const lastCall = api.getLastCall();
  assert.equal(lastCall.appId, 53);
  assert.equal(lastCall.query, 'MBO_Kintone_User in ("vassana") and Number_0 = 1 limit 2');
});

test('DEDICATED_LOOKUP-002: Safely escapes double-quotes and backslashes in query literal', async () => {
  const api = createMockKintoneApi([]);
  await EmployeeService.lookupDedicatedIdentityMappingCandidates('user"with\\quotes', api);

  const lastCall = api.getLastCall();
  assert.equal(lastCall.query, 'MBO_Kintone_User in ("user\\"with\\\\quotes") and Number_0 = 1 limit 2');
});

test('DEDICATED_LOOKUP-003: Rejects whitespace in Kintone User Code client-side without calling API', async () => {
  const api = createMockKintoneApi([]);

  await assert.rejects(
    async () => await EmployeeService.lookupDedicatedIdentityMappingCandidates(' vassana ', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_CODE_INVALID');
      assert.equal(api.getCallCount(), 0);
      return true;
    }
  );
});

test('DEDICATED_LOOKUP-004: API error throws EMPLOYEE_LOOKUP_FAILED and fails closed', async () => {
  const api = createMockKintoneApi([], true); // API throws error

  await assert.rejects(
    async () => await EmployeeService.lookupDedicatedIdentityMappingCandidates('vassana', api),
    (err) => {
      assert.equal(err.code, 'EMPLOYEE_LOOKUP_FAILED');
      return true;
    }
  );
});
