import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MboActivationService } from '../src/services/mbo-activation-service.js';

describe('MboActivationService Unit Test Suite (D1-C3A First-Login Activation)', () => {

  it('1. secure issuance returns plaintext once + stored hash metadata', () => {
    const issuance = MboActivationService.generateActivation({
      employeeCode: '0118',
      ttlHours: 24
    });

    assert.equal(issuance.employeeCode, '0118');
    assert.ok(issuance.activationCode);
    assert.equal(issuance.activationCode.length, 8);
    assert.equal(issuance.record.Employee_Code, '0118');
    assert.ok(issuance.record.Activation_Code_Hash);
    assert.ok(issuance.record.Activation_Expires_At);
    assert.equal(issuance.record.Activation_Used_At, null);
    assert.equal('plaintextCode' in issuance.record, false);
  });

  it('2. valid activation verifies', () => {
    const issuance = MboActivationService.generateActivation({
      employeeCode: '0118'
    });

    const verifyRes = MboActivationService.verifyActivation({
      activationRecord: issuance.record,
      inputCode: issuance.activationCode
    });

    assert.equal(verifyRes.status, 'ACTIVATION_VALIDATED');
    assert.equal(verifyRes.employeeCode, '0118');
  });

  it('3. wrong activation denied', () => {
    const issuance = MboActivationService.generateActivation({
      employeeCode: '0118'
    });

    const verifyRes = MboActivationService.verifyActivation({
      activationRecord: issuance.record,
      inputCode: 'WRONGCODE'
    });

    assert.equal(verifyRes.status, 'INVALID_ACTIVATION_CODE');
  });

  it('4. expired activation denied', () => {
    const pastTime = new Date(Date.now() - 3600 * 1000);
    const issuance = MboActivationService.generateActivation({
      employeeCode: '0118',
      now: pastTime,
      ttlHours: 1
    });

    const verifyRes = MboActivationService.verifyActivation({
      activationRecord: issuance.record,
      inputCode: issuance.activationCode,
      now: new Date()
    });

    assert.equal(verifyRes.status, 'ACTIVATION_EXPIRED');
  });

  it('5. already-used activation denied', () => {
    const issuance = MboActivationService.generateActivation({
      employeeCode: '0118'
    });

    const usedRecord = {
      ...issuance.record,
      Activation_Used_At: new Date().toISOString()
    };

    const verifyRes = MboActivationService.verifyActivation({
      activationRecord: usedRecord,
      inputCode: issuance.activationCode
    });

    assert.equal(verifyRes.status, 'ACTIVATION_ALREADY_USED');
  });

  it('6. malformed activation state denied', () => {
    const malformedRecord = {
      Employee_Code: '0118'
      // missing Activation_Code_Hash
    };

    const verifyRes = MboActivationService.verifyActivation({
      activationRecord: malformedRecord,
      inputCode: 'ABCDEF12'
    });

    assert.equal(verifyRes.status, 'ACTIVATION_EXPIRED');
  });

});
