/**
 * D3 V1 deterministic snapshot serializer.
 *
 * Accepts a logical snapshot payload, whitelists canonical business sections,
 * recursively sorts object keys, preserves semantic array order, omits
 * undefined object values, preserves explicit null, and returns SHA-256 over
 * exact canonical UTF-8 JSON bytes.
 */

import { createHash } from 'node:crypto';

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
  const sha256 = createHash('sha256')
    .update(Buffer.from(canonicalJson, 'utf8'))
    .digest('hex');

  return {
    snapshot,
    canonicalJson,
    sha256
  };
}
