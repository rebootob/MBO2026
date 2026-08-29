/**
 * Cryptographic Utilities for Auth Bridge
 * PBKDF2-SHA256 (100,000 iterations), Opaque Tokens (256-bit), SHA-256 Hashing, HMAC Ticket Signing.
 * Decodes saltHex to bytes via Buffer.from(saltHex, 'hex') for exact legacy compatibility.
 */

import crypto from 'node:crypto';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32; // 256 bits = 32 bytes
const PBKDF2_DIGEST = 'sha256';

export class CryptoUtil {
  /**
   * Hashes a password using PBKDF2-SHA256 with 100,000 iterations.
   * Serialized format: pbkdf2$100000$<32-hex-salt>$<64-hex-hash>
   */
  static async hashPassword(password) {
    if (typeof password !== 'string' || !password) {
      throw new Error('INVALID_PASSWORD: Password must be a non-empty string.');
    }
    const saltBytes = crypto.randomBytes(16);
    const saltHex = saltBytes.toString('hex');

    const hashBuffer = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, saltBytes, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    return `pbkdf2$${PBKDF2_ITERATIONS}$${saltHex}$${hashBuffer.toString('hex')}`;
  }

  /**
   * Verifies a raw password against a stored PBKDF2 hash.
   * Enforces strict regex: ^pbkdf2\$100000\$[0-9a-fA-F]{32}\$[0-9a-fA-F]{64}$
   */
  static async verifyPassword(password, storedHash) {
    if (typeof password !== 'string' || !password || typeof storedHash !== 'string' || !storedHash) {
      return false;
    }

    const regex = /^pbkdf2\$100000\$([0-9a-fA-F]{32})\$([0-9a-fA-F]{64})$/;
    const match = storedHash.match(regex);
    if (!match) {
      return false;
    }

    const [, saltHex, expectedHashHex] = match;
    const saltBytes = Buffer.from(saltHex, 'hex');

    if (saltBytes.length !== 16) {
      return false;
    }

    const hashBuffer = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, saltBytes, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, key) => {
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
   * Signs data string using HMAC-SHA256.
   */
  static signHmac(dataString, secretKey) {
    if (!secretKey) throw new Error('MISSING_SECRET_KEY');
    return crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');
  }

  /**
   * Verifies an HMAC-SHA256 signature.
   */
  static verifyHmac(dataString, signature, secretKey) {
    if (!secretKey || !signature || typeof signature !== 'string') return false;
    const computed = CryptoUtil.signHmac(dataString, secretKey);
    try {
      return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }
}
