import { assertDiscoveryReadOnly } from './sandbox-write-guard.js';

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
