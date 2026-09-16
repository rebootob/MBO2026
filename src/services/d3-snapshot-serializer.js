/**
 * D3 V1 deterministic snapshot serializer.
 *
 * Accepts a logical snapshot payload, whitelists canonical business sections,
 * recursively sorts object keys, preserves semantic array order, omits
 * undefined object values, preserves explicit null, and returns SHA-256 over
 * exact canonical UTF-8 JSON bytes.
 */

function rotr(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

const SHA256_K = Object.freeze([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function computeSha256Hex(input) {
  let bytes;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) {
    bytes = new Uint8Array(input);
  } else {
    bytes = new Uint8Array(input);
  }

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const l = bytes.length;
  const bitLen = l * 8;
  const rem = (l + 9) % 64;
  const padLen = rem === 0 ? 0 : 64 - rem;
  const totalLen = l + 1 + padLen + 8;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes, 0);
  buf[l] = 0x80;

  const view = new DataView(buf.buffer);
  const highBit = Math.floor(bitLen / 0x100000000);
  const lowBit = bitLen >>> 0;
  view.setUint32(totalLen - 8, highBit, false);
  view.setUint32(totalLen - 4, lowBit, false);

  const W = new Uint32Array(64);

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10)) >>> 0;
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + SHA256_K[i] + W[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) {
    out += H[i].toString(16).padStart(8, '0');
  }
  return out;
}

export class D3SnapshotSerializationError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'D3SnapshotSerializationError';
    this.code = code;
    this.details = details;
  }
}

export const D3_SNAPSHOT_SCHEMA_VERSION = 'D3_V1';

export const D3_SNAPSHOT_SECTION_ALLOWLIST = Object.freeze([
  'source',
  'stage',
  'profile',
  'route',
  'scoring',
  'hoshin',
  'config',
  'business',
  'computed'
]);

export const D3_SNAPSHOT_REQUIRED_SECTIONS = D3_SNAPSHOT_SECTION_ALLOWLIST;

const OMIT = Symbol('D3_SNAPSHOT_OMIT');

function canonicalize(value, path = '$', inArray = false) {
  if (value === undefined) {
    if (inArray) {
      throw new D3SnapshotSerializationError(
        'UNDEFINED_ARRAY_VALUE',
        `Undefined array item is not allowed at ${path}.`
      );
    }
    return OMIT;
  }

  if (value === null) return null;

  const type = typeof value;

  if (type === 'string' || type === 'boolean') return value;

  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new D3SnapshotSerializationError(
        'NON_FINITE_NUMBER',
        `Non-finite number is not allowed at ${path}.`
      );
    }
    return value;
  }

  if (type === 'bigint' || type === 'function' || type === 'symbol') {
    throw new D3SnapshotSerializationError(
      'UNSUPPORTED_SNAPSHOT_VALUE',
      `Unsupported ${type} value at ${path}.`
    );
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new D3SnapshotSerializationError(
        'INVALID_DATE_VALUE',
        `Invalid Date at ${path}.`
      );
    }
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => canonicalize(item, `${path}[${index}]`, true));
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new D3SnapshotSerializationError(
      'UNSUPPORTED_OBJECT_PROTOTYPE',
      `Only plain objects are allowed at ${path}.`
    );
  }

  const output = {};
  for (const key of Object.keys(value).sort()) {
    const normalized = canonicalize(value[key], `${path}.${key}`, false);
    if (normalized !== OMIT) output[key] = normalized;
  }
  return output;
}

export function buildD3SnapshotManifest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new D3SnapshotSerializationError(
      'INVALID_SNAPSHOT_INPUT',
      'Logical snapshot input must be a plain object.'
    );
  }

  const manifest = {
    snapshotSchemaVersion: D3_SNAPSHOT_SCHEMA_VERSION
  };

  for (const section of D3_SNAPSHOT_REQUIRED_SECTIONS) {
    const sectionValue = input[section];

    if (sectionValue === undefined) {
      throw new D3SnapshotSerializationError(
        'SNAPSHOT_SECTION_MISSING',
        `Required snapshot section is missing: ${section}.`
      );
    }

    if (
      sectionValue === null ||
      typeof sectionValue !== 'object' ||
      Array.isArray(sectionValue)
    ) {
      throw new D3SnapshotSerializationError(
        'INVALID_SNAPSHOT_SECTION',
        `Snapshot section ${section} must be a plain object.`
      );
    }

    manifest[section] = sectionValue;
  }

  return manifest;
}

export function canonicalizeD3Snapshot(input) {
  return canonicalize(buildD3SnapshotManifest(input));
}

export function serializeD3Snapshot(input) {
  const canonicalObject = canonicalizeD3Snapshot(input);
  const canonicalJson = JSON.stringify(canonicalObject);

  return {
    snapshot: canonicalObject,
    canonicalJson
  };
}

export function hashD3Snapshot(input) {
  const { snapshot, canonicalJson } = serializeD3Snapshot(input);
  const sha256 = computeSha256Hex(canonicalJson);

  return {
    snapshot,
    canonicalJson,
    sha256
  };
}
