/**
 * Force Password Change Ticket Service (Auth Bridge)
 * Issues and validates signed, time-limited force-change tickets.
 * HMAC-SHA256, 10-minute TTL, bound to Employee_Code and Credential_Version.
 */

import crypto from 'node:crypto';
import { CryptoUtil } from './crypto-util.js';

const TICKET_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class TicketService {
  constructor(options = {}) {
    this.signingSecret = options.signingSecret || 'default_test_signing_secret_key_32bytes';
  }

  /**
   * Issues a signed force-change ticket for an employee code & credential version.
   */
  issueForceTicket(employeeCode, credentialVersion, now = new Date()) {
    if (!employeeCode || typeof employeeCode !== 'string') {
      throw new Error('INVALID_ARGUMENT: employeeCode is required for ticket.');
    }

    const expiresAt = now.getTime() + TICKET_TTL_MS;
    const nonce = crypto.randomBytes(16).toString('hex');
    const version = Number(credentialVersion || 1);

    const payloadObj = {
      emp: employeeCode.trim(),
      ver: version,
      exp: expiresAt,
      nonce
    };

    const payloadStr = JSON.stringify(payloadObj);
    const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
    const signature = CryptoUtil.signHmac(payloadBase64, this.signingSecret);

    return `${payloadBase64}.${signature}`;
  }

  /**
   * Verifies and decodes a force-change ticket.
   * Fails closed if tampered, expired, or version mismatched.
   */
  verifyForceTicket(ticket, expectedEmployeeCode, currentCredentialVersion, now = new Date()) {
    if (!ticket || typeof ticket !== 'string') {
      return { valid: false, reason: 'INVALID_TICKET_FORMAT' };
    }

    const parts = ticket.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'INVALID_TICKET_FORMAT' };
    }

    const [payloadBase64, signature] = parts;

    // Verify HMAC signature
    const isSignatureValid = CryptoUtil.verifyHmac(payloadBase64, signature, this.signingSecret);
    if (!isSignatureValid) {
      return { valid: false, reason: 'TICKET_SIGNATURE_INVALID' };
    }

    let payloadObj;
    try {
      const payloadStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
      payloadObj = JSON.parse(payloadStr);
    } catch {
      return { valid: false, reason: 'TAMPERED_TICKET_PAYLOAD' };
    }

    const { emp, ver, exp } = payloadObj || {};

    if (!emp || !ver || !exp) {
      return { valid: false, reason: 'MALFORMED_TICKET_PAYLOAD' };
    }

    // Verify target employee code
    if (expectedEmployeeCode && emp !== expectedEmployeeCode.trim()) {
      return { valid: false, reason: 'TICKET_EMPLOYEE_MISMATCH' };
    }

    // Verify expiration
    if (now.getTime() > exp) {
      return { valid: false, reason: 'TICKET_EXPIRED' };
    }

    // Verify Credential_Version match
    if (currentCredentialVersion !== undefined && currentCredentialVersion !== null) {
      if (Number(ver) !== Number(currentCredentialVersion)) {
        return { valid: false, reason: 'CREDENTIAL_VERSION_MISMATCH' };
      }
    }

    return {
      valid: true,
      employeeCode: emp,
      credentialVersion: Number(ver),
      expiresAt: exp
    };
  }
}
