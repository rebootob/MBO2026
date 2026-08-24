import {
  assertAppCreationAuthorization,
  assertDiscoveryReadOnly,
  WP002C_APPROVED_APP_NAME
} from './sandbox-write-guard.js';

const APP_CREATE_PREVIEW_PATH = '/k/v1/preview/app.json';

export function getKintoneConnection() {
  const baseUrl = process.env.KINTONE_BASE_URL?.replace(/\/$/, '');
  const username = process.env.KINTONE_USERNAME;
  const password = process.env.KINTONE_PASSWORD;
  const token = process.env.KINTONE_API_TOKEN;
  const basicUsername = process.env.KINTONE_BASIC_AUTH_USERNAME;
  const basicPassword = process.env.KINTONE_BASIC_AUTH_PASSWORD;

  if (!baseUrl || (!token && !(username && password))) {
    throw new Error('Missing required Kintone connection variables.');
  }

  const headers = {};
  if (token) headers['X-Cybozu-API-Token'] = token;
  if (username && password) {
    headers['X-Cybozu-Authorization'] = Buffer.from(`${username}:${password}`).toString('base64');
  }
  if (basicUsername && basicPassword) {
    headers.Authorization = `Basic ${Buffer.from(`${basicUsername}:${basicPassword}`).toString('base64')}`;
  }
  return { baseUrl, headers };
}

/**
 * Prepares the future APP_CREATE connection without sending a request.
 * Kintone preview-app creation requires username/password authentication;
 * API tokens are intentionally excluded from this operation's headers.
 */
export function getAppCreationConnection() {
  const baseUrl = process.env.KINTONE_BASE_URL?.replace(/\/$/, '');
  const username = process.env.KINTONE_USERNAME;
  const password = process.env.KINTONE_PASSWORD;
  const basicUsername = process.env.KINTONE_BASIC_AUTH_USERNAME;
  const basicPassword = process.env.KINTONE_BASIC_AUTH_PASSWORD;

  if (!baseUrl || !username || !password) {
    throw new Error('APP CREATE AUTH BLOCKED: Kintone username and password authentication is required.');
  }

  const headers = {
    'X-Cybozu-Authorization': Buffer.from(`${username}:${password}`).toString('base64')
  };
  if (basicUsername && basicPassword) {
    headers.Authorization = `Basic ${Buffer.from(`${basicUsername}:${basicPassword}`).toString('base64')}`;
  }
  return { baseUrl, headers };
}

/**
 * Pure Stage-1 preflight only. It never calls fetch and cannot bypass kintoneRequest.
 */
export function assertAppCreationRequestPreflight(authConfig, requestConfig) {
  if (!requestConfig || typeof requestConfig !== 'object') {
    throw new Error('APP CREATE PREFLIGHT BLOCKED: Missing request configuration.');
  }
  if (requestConfig.method !== 'POST' || requestConfig.path !== APP_CREATE_PREVIEW_PATH) {
    throw new Error('APP CREATE PREFLIGHT BLOCKED: Only POST /k/v1/preview/app.json is allowed.');
  }
  if (requestConfig.body?.name !== WP002C_APPROVED_APP_NAME) {
    throw new Error('APP CREATE PREFLIGHT BLOCKED: Request body App name must exactly match the approved target.');
  }
  return assertAppCreationAuthorization(authConfig, {
    workPackageId: requestConfig.workPackageId,
    operation: requestConfig.operation,
    requestedAppName: requestConfig.body.name,
    manifest: requestConfig.manifest
  });
}

export async function kintoneRequest(path, { method = 'GET', body } = {}) {
  assertDiscoveryReadOnly(method, path);
  const { baseUrl, headers } = getKintoneConnection();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? headers : { ...headers, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = [error.code, error.message, error.errors ? JSON.stringify(error.errors) : ''].filter(Boolean).join(': ');
    throw new Error(`Kintone returned HTTP ${response.status}${detail ? ` (${detail})` : ''}.`);
  }
  return response.json();
}
