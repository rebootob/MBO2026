/**
 * Cryptographic Utilities for Auth Bridge
 * PBKDF2-SHA256 (100,000 iterations), Opaque Tokens (256-bit), SHA-256 Hashing, HMAC Ticket Signing.
 */

import crypto from 'node:crypto';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

export class CryptoUtil {
  /**
   * Hashes a password using PBKDF2-SHA256 with 100,000 iterations.
   * Format: pbkdf2$100000$<saltHex>$<hashHex>
   */
  static async hashPassword(password) {
    if (typeof password !== 'string' || !password) {
      throw new Error('INVALID_PASSWORD: Password must be a non-empty string.');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hashBuffer = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hashBuffer.toString('hex')}`;
  }

  /**
   * Verifies a raw password against a stored PBKDF2 hash.
   */
  static async verifyPassword(password, storedHash) {
    if (!password || !storedHash || typeof storedHash !== 'string') {
      return false;
    }
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }
    const iterations = Number(parts[1]);
    const salt = parts[2];
    const expectedHashHex = parts[3];

    if (!iterations || iterations <= 0 || !salt || !expectedHashHex) {
      return false;
    }

    const hashBuffer = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    const computedHashHex = hashBuffer.toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(computedHashHex, 'hex'), Buffer.from(expectedHashHex, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Generates a 256-bit (32-byte) random hex token for opaque sessions.
   */
  static generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes an opaque session token using SHA-256 for server persistence.
   */
  static hashToken(token) {
    if (!token || typeof token !== 'string') return '';
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Signs a payload using HMAC-SHA256.
   */
  static signHmac(dataString, secretKey) {
    return crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');
  }

  /**
   * Verifies an HMAC-SHA256 signature.
   */
  static verifyHmac(dataString, signature, secretKey) {
    const computed = CryptoUtil.signHmac(dataString, secretKey);
    try {
      return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }
}
