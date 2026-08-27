import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MboEmployeeSelfGateway } from '../src/services/mbo-employee-self-gateway.js';
import { CONFIDENTIAL_FIELDS } from '../src/config/constants.js';

describe('MboEmployeeSelfGateway Unit Test Suite (D1-C3B Final Corrective)', () => {

  // ---------------------------------------------------------------------------
  // Shared fixtures
  // ---------------------------------------------------------------------------

  /** App53 canonical snapshot returned by EmployeeService after lookup */
  const sampleApp53Record0118 = {
    $id: { value: '5301' },
    emp_text: { value: '0118' },
    Number: { value: 118 },
    Text: { value: 'Somchai Jaidee' },
    Text_0: { value: 'Somchai Jaidee TH' },
    Drop_down_0: { value: 'Manufacturing Dept' },
    Drop_down: { value: 'Manufacturing Section 1' },
    Drop_down_2: { value: 'Team A' },
    Text_2: { value: 'Operator' },
    Text_4: { value: 'emp0118@example.com' },
    Date: { value: '2020-01-01' }
  };

  /** App794 record for employee 0118 — includes confidential fields and secrets */
  const sampleApp794Record0118 = {
    $id: { value: '79401' },
    Employee_Code: { value: '0118' },
    Fiscal_Year: { value: 'FY2026' },
    Status: { value: 'DRAFT' },
    Password_Hash: { value: 'pbkdf2$secret' },
    Activation_Code_Hash: { value: 'actSecret' },
    Manager_Achievement_1: { value: 'EXCELLENT' },
    Manager_Objective_Score_1: { value: 5 },
    GM_Achievement_1: { value: 'GOOD' },
    GM_Objective_Score_1: { value: 4 },
    PartA_Weighted_Score: { value: 82.5 },
    Final_Grade: { value: 'A' }
  };

  /** App794 record belonging to employee 0119 */
  const sampleApp794Record0119 = {
    $id: { value: '79402' },
    Employee_Code: { value: '0119' },
    Fiscal_Year: { value: 'FY2026' },
    Status: { value: 'DRAFT' }
  };

  function createMockAuthService(principalMap = {}) {
    return {
      async getAuthenticatedPrincipal(token) {
        return principalMap[token] || null;
      }
    };
  }

  /** A mock transport that serves App53 with canonical records */
  function createCanonicalMockTransport({ app53Records = [sampleApp53Record0118], app794Records = [sampleApp794Record0118], captureQueries = {} } = {}) {
    return {
      async get(path) {
        const decoded = decodeURIComponent(path);
        if (path.includes(`app=53`)) {
          captureQueries.app53 = decoded;
          return { records: app53Records };
        }
        if (path.includes(`app=794`)) {
          captureQueries.app794 = decoded;
          return { records: app794Records };
        }
        return { records: [] };
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Original acceptance tests (must remain passing)
  // ---------------------------------------------------------------------------

  it('1. authenticated 0118 bootstrap queries App53/App794 with 0118 from session, not caller input', async () => {
    const captureQueries = {};
    const mockTransport = createCanonicalMockTransport({ captureQueries });
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', kintoneUserCode: 'emp0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118', fiscalYear: 'FY2026' });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.employeeCode, '0118');
    assert.match(captureQueries.app53, /0118/);
    assert.match(captureQueries.app794, /Employee_Code = "0118"/);
    // employeeInfo is the canonical snapshot from EmployeeService, not the raw Kintone record
    assert.equal(res.employeeInfo.Employee_Code, '0118');
    assert.equal(res.employeeInfo.Employee_Name, 'Somchai Jaidee');
  });

  it('2. 0118 history returns only 0118 query scope', async () => {
    const captureQueries = {};
    const mockTransport = {
      async get(path) {
        captureQueries.last = decodeURIComponent(path);
        return { records: [sampleApp794Record0118] };
      }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.listOwnMboHistory({ sessionToken: 'valid_token_0118' });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.employeeCode, '0118');
    assert.match(captureQueries.last, /Employee_Code = "0118"/);
    assert.equal(res.records.length, 1);
  });

  it('3. 0118 direct recordId lookup uses recordId AND Employee_Code=0118 and cannot expose 0119', async () => {
    let recordQuery = null;
    const mockTransport = {
      async get(path) {
        recordQuery = decodeURIComponent(path);
        if (recordQuery.includes('$id = "79402"') && recordQuery.includes('Employee_Code = "0118"')) {
          return { records: [] };
        }
        return { records: [sampleApp794Record0118] };
      }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getOwnMboRecord({ sessionToken: 'valid_token_0118', recordId: '79402' });

    assert.equal(res.status, 'RECORD_NOT_FOUND');
    assert.match(recordQuery, /\$id = "79402" and Employee_Code = "0118"/);
  });

  it('4. missing/expired/non-data-authorized principal denied', async () => {
    const authService = createMockAuthService({});
    const gateway = new MboEmployeeSelfGateway({
      authService,
      transport: { async get() { return { records: [] }; } }
    });

    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'expired_token' });
    assert.equal(res.status, 'UNAUTHORIZED');
  });

  it('5. duplicate App53 employee identity fails closed', async () => {
    const mockTransport = {
      async get(path) {
        if (path.includes('app=53')) {
          return { records: [sampleApp53Record0118, sampleApp53Record0118] };
        }
        return { records: [] };
      }
    };
    const authService = createMockAuthService({
      'token_dup': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'token_dup' });

    assert.equal(res.status, 'DUPLICATE_EMPLOYEE_IDENTITY');
  });

  it('6. gateway has no employeeCode request parameter used for authorization', async () => {
    const captureQueries = {};
    const mockTransport = createCanonicalMockTransport({ captureQueries });
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    // Caller attempts to pass employeeCode: '0119' to override session
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118', employeeCode: '0119' });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.employeeCode, '0118');
    assert.match(captureQueries.app53, /0118/);
    assert.doesNotMatch(captureQueries.app794, /0119/);
  });

  it('7. sanitized result contains no Password_Hash, Activation_Code_Hash, Session_Token_Hash', async () => {
    const mockTransport = createCanonicalMockTransport();
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118' });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.currentMboRecord.Password_Hash, undefined);
    assert.equal(res.currentMboRecord.Activation_Code_Hash, undefined);
  });

  it('8. technical admin/non-employee-self principal cannot use employee-self gateway', async () => {
    const authService = createMockAuthService({
      'admin_token': { employeeCode: 'ADMIN', isTechnicalAdmin: true }
    });
    const gateway = new MboEmployeeSelfGateway({
      authService,
      transport: { async get() { return { records: [] }; } }
    });

    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'admin_token' });
    assert.equal(res.status, 'UNAUTHORIZED_PRINCIPAL');
  });

  // ---------------------------------------------------------------------------
  // B1 Corrective tests: Query input validation
  // ---------------------------------------------------------------------------

  it('B1.1. invalid fiscalYear (plain year) rejected before Kintone call', async () => {
    let kintoneCallCount = 0;
    const mockTransport = {
      async get() { kintoneCallCount++; return { records: [] }; }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118', fiscalYear: '2026' });

    assert.equal(res.status, 'INVALID_ARGUMENT');
    assert.equal(kintoneCallCount, 0);
  });

  it('B1.2. malicious fiscalYear with injection attempt rejected before Kintone call', async () => {
    let kintoneCallCount = 0;
    const mockTransport = {
      async get() { kintoneCallCount++; return { records: [] }; }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({
      sessionToken: 'valid_token_0118',
      fiscalYear: 'FY2026" or "1"="1'
    });

    assert.equal(res.status, 'INVALID_ARGUMENT');
    assert.equal(kintoneCallCount, 0);
  });

  it('B1.3. invalid recordId (with quotes) rejected before Kintone call', async () => {
    let kintoneCallCount = 0;
    const mockTransport = {
      async get() { kintoneCallCount++; return { records: [] }; }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getOwnMboRecord({
      sessionToken: 'valid_token_0118',
      recordId: '123" or "1"="1'
    });

    assert.equal(res.status, 'INVALID_ARGUMENT');
    assert.equal(kintoneCallCount, 0);
  });

  it('B1.4. invalid recordId (decimal) rejected before Kintone call', async () => {
    let kintoneCallCount = 0;
    const mockTransport = {
      async get() { kintoneCallCount++; return { records: [] }; }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getOwnMboRecord({
      sessionToken: 'valid_token_0118',
      recordId: '123.5'
    });

    assert.equal(res.status, 'INVALID_ARGUMENT');
    assert.equal(kintoneCallCount, 0);
  });

  // ---------------------------------------------------------------------------
  // B2 Corrective tests: App53 canonical EmployeeService lookup
  // ---------------------------------------------------------------------------

  it('B2.1. App53 bootstrap reuses canonical EmployeeService: emp_text + Number query, returns canonical snapshot', async () => {
    const captureQueries = {};
    const mockTransport = createCanonicalMockTransport({ captureQueries });
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118', fiscalYear: 'FY2026' });

    assert.equal(res.status, 'SUCCESS');
    // Verify EmployeeService canonical query uses emp_text / Number pattern
    assert.match(captureQueries.app53, /emp_text/);
    // EmployeeInfo must be the canonical domain snapshot, not a raw Kintone record
    assert.ok(res.employeeInfo.Employee_Code);
    assert.ok(res.employeeInfo.Employee_Name !== undefined);
    // Raw Kintone fields must not exist in the canonical snapshot
    assert.equal(res.employeeInfo.emp_text, undefined);
    assert.equal(res.employeeInfo.$id, undefined);
  });

  // ---------------------------------------------------------------------------
  // B3 Corrective tests: Confidential field filtering and Employee_Code verification
  // ---------------------------------------------------------------------------

  it('B3.1. App794 confidential fields absent from bootstrap current record', async () => {
    const mockTransport = createCanonicalMockTransport();
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118' });

    assert.equal(res.status, 'SUCCESS');
    const rec = res.currentMboRecord;
    // Spot-check a sample of CONFIDENTIAL_FIELDS
    for (const field of ['Manager_Achievement_1', 'GM_Achievement_1', 'Manager_Objective_Score_1', 'PartA_Weighted_Score', 'Final_Grade']) {
      assert.equal(rec[field], undefined, `Confidential field '${field}' must not be present.`);
    }
    // Non-confidential fields remain
    assert.equal(rec.Fiscal_Year?.value, 'FY2026');
    assert.equal(rec.Status?.value, 'DRAFT');
  });

  it('B3.2. App794 confidential fields absent from history records', async () => {
    const mockTransport = {
      async get() {
        return { records: [sampleApp794Record0118] };
      }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.listOwnMboHistory({ sessionToken: 'valid_token_0118' });

    assert.equal(res.status, 'SUCCESS');
    const rec = res.records[0];
    for (const field of CONFIDENTIAL_FIELDS.slice(0, 5)) {
      assert.equal(rec[field], undefined, `Confidential field '${field}' must not be present.`);
    }
  });

  it('B3.3. App794 confidential fields absent from direct record response', async () => {
    const mockTransport = {
      async get() { return { records: [sampleApp794Record0118] }; }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getOwnMboRecord({ sessionToken: 'valid_token_0118', recordId: '79401' });

    assert.equal(res.status, 'SUCCESS');
    const rec = res.record;
    for (const field of ['Manager_Achievement_1', 'Final_Grade', 'PartA_Weighted_Score']) {
      assert.equal(rec[field], undefined, `Confidential field '${field}' must not be present.`);
    }
  });

  it('B3.4. App794 response with Employee_Code different from session employee fails closed', async () => {
    const mismatchedRecord = {
      ...sampleApp794Record0118,
      Employee_Code: { value: '0119' } // Mismatched! Session is 0118
    };
    const mockTransport = {
      async get() { return { records: [mismatchedRecord] }; }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getOwnMboRecord({ sessionToken: 'valid_token_0118', recordId: '79401' });

    assert.equal(res.status, 'EMPLOYEE_CODE_MISMATCH_IN_RECORD');
  });

  it('B3.4a. App794 response missing Employee_Code fails closed with no record returned', async () => {
    const missingEmployeeCodeRecord = { ...sampleApp794Record0118 };
    delete missingEmployeeCodeRecord.Employee_Code;
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });
    const gateway = new MboEmployeeSelfGateway({
      authService,
      transport: { async get() { return { records: [missingEmployeeCodeRecord] }; } }
    });

    const res = await gateway.getOwnMboRecord({ sessionToken: 'valid_token_0118', recordId: '79401' });

    assert.equal(res.status, 'EMPLOYEE_CODE_MISMATCH_IN_RECORD');
    assert.equal(res.record, undefined);
  });

  it('B3.4b. malformed trusted session employeeCode fails closed before App53 or App794 calls', async () => {
    let kintoneCalls = 0;
    const authService = createMockAuthService({
      'malformed_employee_code': { employeeCode: '0118" or $id > 0', isTechnicalAdmin: false }
    });
    const gateway = new MboEmployeeSelfGateway({
      authService,
      transport: { async get() { kintoneCalls += 1; return { records: [] }; } }
    });

    const res = await gateway.getEmployeeSelfBootstrap({
      sessionToken: 'malformed_employee_code',
      fiscalYear: 'FY2026'
    });

    assert.equal(res.status, 'UNAUTHORIZED_PRINCIPAL');
    assert.equal(kintoneCalls, 0);
  });

  it('B3.5. existing 0118 -> 0119 direct-record denial remains passing', async () => {
    let recordQuery = null;
    const mockTransport = {
      async get(path) {
        recordQuery = decodeURIComponent(path);
        if (recordQuery.includes('$id = "79402"') && recordQuery.includes('Employee_Code = "0118"')) {
          return { records: [] };
        }
        return { records: [sampleApp794Record0118] };
      }
    };
    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getOwnMboRecord({ sessionToken: 'valid_token_0118', recordId: '79402' });

    assert.equal(res.status, 'RECORD_NOT_FOUND');
    assert.match(recordQuery, /\$id = "79402" and Employee_Code = "0118"/);
  });

});
