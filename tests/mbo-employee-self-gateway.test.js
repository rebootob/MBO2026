import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MboEmployeeSelfGateway } from '../src/services/mbo-employee-self-gateway.js';

describe('MboEmployeeSelfGateway Unit Test Suite (D1-C3B Data Gateway)', () => {

  const sampleApp53Record0118 = {
    $id: { value: '5301' },
    emp_text: { value: '0118' },
    Text_0: { value: 'Somchai Jaidee' },
    Text_1: { value: 'Manufacturing Section 1' }
  };

  const sampleApp794Record0118 = {
    $id: { value: '79401' },
    Employee_Code: { value: '0118' },
    Fiscal_Year: { value: '2026' },
    Status: { value: 'DRAFT' },
    Password_Hash: { value: 'pbkdf2$secret' },
    Activation_Code_Hash: { value: 'actSecret' }
  };

  const sampleApp794Record0119 = {
    $id: { value: '79402' },
    Employee_Code: { value: '0119' },
    Fiscal_Year: { value: '2026' },
    Status: { value: 'DRAFT' }
  };

  function createMockAuthService(principalMap = {}) {
    return {
      async getAuthenticatedPrincipal(token) {
        return principalMap[token] || null;
      }
    };
  }

  it('1. authenticated 0118 bootstrap queries App53/App794 with 0118 from session, not caller input', async () => {
    let app53Query = null;
    let app794Query = null;

    const mockTransport = {
      async get(path) {
        if (path.includes('app=53')) {
          app53Query = decodeURIComponent(path);
          return { records: [sampleApp53Record0118] };
        }
        if (path.includes('app=794')) {
          app794Query = decodeURIComponent(path);
          return { records: [sampleApp794Record0118] };
        }
        return { records: [] };
      }
    };

    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', kintoneUserCode: 'emp0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118', fiscalYear: '2026' });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.employeeCode, '0118');
    assert.match(app53Query, /0118/);
    assert.match(app794Query, /Employee_Code = "0118"/);
    assert.equal(res.employeeInfo.Text_0.value, 'Somchai Jaidee');
  });

  it('2. 0118 history returns only 0118 query scope', async () => {
    let historyQuery = null;
    const mockTransport = {
      async get(path) {
        historyQuery = decodeURIComponent(path);
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
    assert.match(historyQuery, /Employee_Code = "0118"/);
    assert.equal(res.records.length, 1);
  });

  it('3. 0118 direct recordId lookup uses recordId AND Employee_Code=0118 and cannot expose 0119', async () => {
    let recordQuery = null;
    const mockTransport = {
      async get(path) {
        recordQuery = decodeURIComponent(path);
        // Simulate Kintone compound filter: returning 0 records because 79402 belongs to 0119, not 0118
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

    // Attempting to fetch Employee 0119's record ID 79402 with Employee 0118's session token
    const res = await gateway.getOwnMboRecord({ sessionToken: 'valid_token_0118', recordId: '79402' });

    assert.equal(res.status, 'RECORD_NOT_FOUND');
    assert.match(recordQuery, /\$id = "79402" and Employee_Code = "0118"/);
  });

  it('4. missing/expired/non-data-authorized principal denied', async () => {
    const authService = createMockAuthService({}); // No active sessions
    const gateway = new MboEmployeeSelfGateway({ authService, transport: { async get() { return { records: [] }; } } });

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
    let queriedEmployeeCode = null;
    const mockTransport = {
      async get(path) {
        const decoded = decodeURIComponent(path);
        const match = decoded.match(/Employee_Code = "([^"]+)"/);
        if (match) queriedEmployeeCode = match[1];
        return { records: [sampleApp53Record0118] };
      }
    };

    const authService = createMockAuthService({
      'valid_token_0118': { employeeCode: '0118', isTechnicalAdmin: false }
    });

    const gateway = new MboEmployeeSelfGateway({ authService, transport: mockTransport });
    // Caller attempts to pass employeeCode: '0119' to override session
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'valid_token_0118', employeeCode: '0119' });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.employeeCode, '0118');
    assert.equal(queriedEmployeeCode, '0118');
  });

  it('7. sanitized result contains no Password_Hash, Activation_Code_Hash, Session_Token_Hash', async () => {
    const mockTransport = {
      async get(path) {
        if (path.includes('app=53')) return { records: [sampleApp53Record0118] };
        return { records: [sampleApp794Record0118] };
      }
    };

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

    const gateway = new MboEmployeeSelfGateway({ authService, transport: { async get() { return { records: [] }; } } });
    const res = await gateway.getEmployeeSelfBootstrap({ sessionToken: 'admin_token' });

    assert.equal(res.status, 'UNAUTHORIZED_PRINCIPAL');
  });

});
