import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MboKintoneAuthRepository } from '../src/services/mbo-auth-kintone-repository.js';
import { MboAuthSessionService } from '../src/services/mbo-auth-session-service.js';
import { MboPasswordDomainService } from '../src/services/mbo-password-service.js';

describe('MboKintoneAuthRepository Unit Test Suite (D1-C1 App801 Credential Adapter)', () => {

  const validPasswordHash = MboPasswordDomainService.hashPassword('Pass0118!');

  const sampleRecord = {
    $id: { value: '101' },
    Employee_Code: { value: '0118' },
    Password_Hash: { value: validPasswordHash },
    Password_Algorithm: { value: 'PBKDF2-SHA256' },
    Force_Password_Change: { value: 'YES' },
    Password_Changed_At: { value: null },
    Password_Expires_At: { value: null },
    Failed_Attempts: { value: '0' },
    Locked_Until: { value: null },
    Account_Status: { value: 'ACTIVE' }
  };

  it('1. exact Employee_Code returns one sanitized server credential domain object', async () => {
    const mockTransport = {
      async get(path) {
        assert.match(path, /\/k\/v1\/records\.json\?app=801/);
        assert.match(decodeURIComponent(path), /Employee_Code = "0118"/);
        return { records: [sampleRecord] };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    const cred = await repo.getCredential('0118');

    assert.equal(cred.Employee_Code, '0118');
    assert.equal(cred.Password_Hash, validPasswordHash);
    assert.equal(cred.Must_Change_Password, true);
    assert.equal(cred.Failed_Login_Count, 0);
    assert.equal(cred.Account_Status, 'ACTIVE');
    assert.equal(cred.Locked_Until, null);
  });

  it('2. zero records => returns null (fail closed)', async () => {
    const mockTransport = {
      async get() {
        return { records: [] };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    const cred = await repo.getCredential('9999');
    assert.equal(cred, null);
  });

  it('3. duplicate Employee_Code => throws DUPLICATE_IDENTITY_RECORD (fail closed)', async () => {
    const mockTransport = {
      async get() {
        return { records: [sampleRecord, sampleRecord] };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    await assert.rejects(
      async () => await repo.getCredential('0118'),
      /DUPLICATE_IDENTITY_RECORD/
    );
  });

  it('4. update uses strict field allowlist and updates Kintone payload properly', async () => {
    let putCalled = false;
    let putPayload = null;

    const mockTransport = {
      async get() {
        return { records: [sampleRecord] };
      },
      async put(path, body) {
        putCalled = true;
        putPayload = body;
        return { revision: '5' };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    const res = await repo.updateCredential('0118', {
      Failed_Login_Count: 3,
      Must_Change_Password: false,
      Account_Status: 'ACTIVE'
    });

    assert.equal(res.success, true);
    assert.equal(res.recordId, 101);
    assert.equal(res.revision, '5');
    assert.equal(putCalled, true);
    assert.equal(putPayload.app, 801);
    assert.equal(putPayload.id, 101);
    assert.equal(putPayload.record.Failed_Attempts.value, 3);
    assert.equal(putPayload.record.Force_Password_Change.value, 'NO');
    assert.equal(putPayload.record.Account_Status.value, 'ACTIVE');
  });

  it('5. unknown / identity-field mutation rejected', async () => {
    const mockTransport = {
      async get() { return { records: [sampleRecord] }; }
    };
    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });

    // Attempting to mutate Employee_Code (immutable identity)
    await assert.rejects(
      async () => await repo.updateCredential('0118', { Employee_Code: '0119' }),
      /UNAUTHORIZED_CREDENTIAL_MUTATION/
    );

    // Attempting to mutate unknown field
    await assert.rejects(
      async () => await repo.updateCredential('0118', { Unknown_Secret: '123' }),
      /UNAUTHORIZED_CREDENTIAL_MUTATION/
    );
  });

  it('6. malformed/missing required App801 field => fail closed', async () => {
    const malformedRecord = {
      $id: { value: '102' },
      Employee_Code: { value: '0118' },
      Account_Status: { value: 'ACTIVE' },
      Force_Password_Change: { value: 'YES' },
      Failed_Attempts: { value: '0' }
      // Missing Password_Hash
    };

    const mockTransport = {
      async get() { return { records: [malformedRecord] }; }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    await assert.rejects(
      async () => await repo.getCredential('0118'),
      /MALFORMED_CREDENTIAL_RECORD/
    );
  });

  it('7. transport errors fail closed and do not expose secrets', async () => {
    const mockTransport = {
      async get() {
        throw new Error('Kintone API rate limit exceeded');
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    await assert.rejects(
      async () => await repo.getCredential('0118'),
      (err) => {
        assert.match(err.message, /Kintone API rate limit/);
        assert.doesNotMatch(err.message, /pbkdf2/);
        return true;
      }
    );
  });

  it('8. compatibility with MboAuthSessionService credentialStore interface', async () => {
    let currentRecord = { ...sampleRecord };
    const mockTransport = {
      async get() {
        return { records: [currentRecord] };
      },
      async put(path, body) {
        if (body.record.Failed_Attempts) {
          currentRecord = { ...currentRecord, Failed_Attempts: { value: String(body.record.Failed_Attempts.value) } };
        }
        return { revision: '2' };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });

    const authService = new MboAuthSessionService({
      credentialStore: repo,
      sessionStore: {
        async getSession() { return null; },
        async setSession() { return true; },
        async deleteSession() { return true; }
      },
      userMappings: [{ Kintone_User_Code: 'emp0118', Employee_Code: '0118' }]
    });

    // Wrong password attempt updates failed attempt count through repo adapter
    const loginRes = await authService.login({
      kintoneUserCode: 'emp0118',
      mboUsername: '0118',
      password: 'WrongPassword!'
    });

    assert.equal(loginRes.status, 'INVALID_CREDENTIALS');
    assert.equal(currentRecord.Failed_Attempts.value, '1');
  });

  it('9. App801-backed changePassword() succeeds with auth service contract without mutating Employee_Code', async () => {
    let currentRecord = { ...sampleRecord };
    let putPayload = null;

    const mockTransport = {
      async get() {
        return { records: [currentRecord] };
      },
      async put(path, body) {
        putPayload = body;
        return { revision: '3' };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    const inMemorySessions = new Map();

    const authService = new MboAuthSessionService({
      credentialStore: repo,
      sessionStore: {
        async getSession(tokenHash) { return inMemorySessions.get(tokenHash) || null; },
        async setSession(tokenHash, sessionObj) { inMemorySessions.set(tokenHash, sessionObj); },
        async deleteSession(tokenHash) { inMemorySessions.delete(tokenHash); }
      },
      userMappings: [{ Kintone_User_Code: 'emp0118', Employee_Code: '0118' }]
    });

    const loginRes = await authService.login({
      kintoneUserCode: 'emp0118',
      mboUsername: '0118',
      password: 'Pass0118!'
    });

    assert.equal(loginRes.status, 'PASSWORD_CHANGE_REQUIRED');

    const changeRes = await authService.changePassword({
      sessionToken: loginRes.sessionToken,
      newPassword: 'NewSecurePass123!'
    });

    assert.equal(changeRes.status, 'PASSWORD_CHANGED_SUCCESS');
    assert.equal(putPayload.app, 801);
    assert.equal(putPayload.id, 101);
    assert.equal(putPayload.record.Force_Password_Change.value, 'NO');
    assert.equal(putPayload.record.Failed_Attempts.value, 0);
    assert.equal(putPayload.record.Employee_Code, undefined);
  });

  it('10. missing/unknown Account Status fails closed', async () => {
    const recMissingStatus = { ...sampleRecord, Account_Status: { value: '' } };
    const repoMissing = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recMissingStatus] }; } } });
    await assert.rejects(async () => await repoMissing.getCredential('0118'), /Account_Status/);

    const recUnknownStatus = { ...sampleRecord, Account_Status: { value: 'UNKNOWN_STATE' } };
    const repoUnknown = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recUnknownStatus] }; } } });
    await assert.rejects(async () => await repoUnknown.getCredential('0118'), /Account_Status/);
  });

  it('11. missing/unknown force-change state fails closed', async () => {
    const recMissingForce = { ...sampleRecord, Force_Password_Change: { value: '' } };
    const repoMissing = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recMissingForce] }; } } });
    await assert.rejects(async () => await repoMissing.getCredential('0118'), /Force_Password_Change/);

    const recUnknownForce = { ...sampleRecord, Force_Password_Change: { value: 'MAYBE' } };
    const repoUnknown = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recUnknownForce] }; } } });
    await assert.rejects(async () => await repoUnknown.getCredential('0118'), /Force_Password_Change/);
  });

  it('12. malformed failed-attempt counter fails closed', async () => {
    const recNegative = { ...sampleRecord, Failed_Attempts: { value: '-1' } };
    const repoNeg = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recNegative] }; } } });
    await assert.rejects(async () => await repoNeg.getCredential('0118'), /Failed_Attempts/);

    const recNaN = { ...sampleRecord, Failed_Attempts: { value: 'abc' } };
    const repoNaN = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recNaN] }; } } });
    await assert.rejects(async () => await repoNaN.getCredential('0118'), /Failed_Attempts/);
  });

  it('13. returned Employee_Code mismatch fails closed', async () => {
    const recMismatch = { ...sampleRecord, Employee_Code: { value: '0119' } };
    const repo = new MboKintoneAuthRepository({ transport: { async get() { return { records: [recMismatch] }; } } });
    await assert.rejects(async () => await repo.getCredential('0118'), /CREDENTIAL_MISMATCH/);
  });

  it('14. sessionStore set/get stores token hash only and reconstructs exact session state', async () => {
    let storedRecord = { ...sampleRecord };
    let putPayload = null;

    const mockTransport = {
      async get(path) {
        if (path.includes('Session_Token_Hash')) {
          return { records: [storedRecord] };
        }
        return { records: [storedRecord] };
      },
      async put(path, body) {
        putPayload = body;
        if (body.record.Session_Token_Hash) {
          storedRecord = {
            ...storedRecord,
            Session_Token_Hash: body.record.Session_Token_Hash,
            Session_Expires_At: body.record.Session_Expires_At,
            Session_Requires_Password_Change: body.record.Session_Requires_Password_Change,
            Session_Data_Authorized: body.record.Session_Data_Authorized,
            Session_Kintone_User_Code: body.record.Session_Kintone_User_Code
          };
        }
        return { revision: '10' };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });

    const sampleTokenHash = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
    const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

    await repo.setSession(sampleTokenHash, {
      employeeCode: '0118',
      kintoneUserCode: 'emp0118',
      expiresAt,
      requiresPasswordChange: false,
      isDataAuthorized: true
    });

    assert.equal(putPayload.record.Session_Token_Hash.value, sampleTokenHash);
    assert.equal(putPayload.record.Session_Requires_Password_Change.value, 'NO');
    assert.equal(putPayload.record.Session_Data_Authorized.value, 'YES');
    assert.equal(putPayload.record.Session_Kintone_User_Code.value, 'emp0118');

    const retrievedSession = await repo.getSession(sampleTokenHash);
    assert.ok(retrievedSession);
    assert.equal(retrievedSession.tokenHash, sampleTokenHash);
    assert.equal(retrievedSession.employeeCode, '0118');
    assert.equal(retrievedSession.kintoneUserCode, 'emp0118');
    assert.equal(retrievedSession.requiresPasswordChange, false);
    assert.equal(retrievedSession.isDataAuthorized, true);
  });

  it('15. deleteSession clears session fields and invalidates token hash', async () => {
    let storedRecord = {
      ...sampleRecord,
      Session_Token_Hash: { value: 'hash123' },
      Session_Expires_At: { value: new Date(Date.now() + 3600000).toISOString() },
      Session_Requires_Password_Change: { value: 'NO' },
      Session_Data_Authorized: { value: 'YES' },
      Session_Kintone_User_Code: { value: 'emp0118' }
    };
    let deletePutCalled = false;

    const mockTransport = {
      async get() {
        return { records: [storedRecord] };
      },
      async put(path, body) {
        deletePutCalled = true;
        assert.equal(body.record.Session_Token_Hash.value, null);
        assert.equal(body.record.Session_Expires_At.value, null);
        storedRecord = { ...storedRecord, Session_Token_Hash: { value: null } };
        return { revision: '11' };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    const deleteRes = await repo.deleteSession('hash123');

    assert.equal(deleteRes, true);
    assert.equal(deletePutCalled, true);
  });

  it('16. duplicate session records throws DUPLICATE_SESSION_RECORD', async () => {
    const sessionRec = {
      ...sampleRecord,
      Session_Token_Hash: { value: 'dupHash' },
      Session_Expires_At: { value: new Date(Date.now() + 3600000).toISOString() }
    };

    const mockTransport = {
      async get() {
        return { records: [sessionRec, sessionRec] };
      }
    };

    const repo = new MboKintoneAuthRepository({ transport: mockTransport, appId: 801 });
    await assert.rejects(
      async () => await repo.getSession('dupHash'),
      /DUPLICATE_SESSION_RECORD/
    );
  });

});
