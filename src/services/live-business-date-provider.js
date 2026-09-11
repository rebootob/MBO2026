/**
 * Live Business Date Provider for MBO2026 (D3-LIVE-BUSINESS-DATE-IMP1)
 *
 * Acquires authoritative server timestamp from Kintone web server HTTP response header
 * and deterministically converts it to Asia/Bangkok calendar date (YYYY-MM-DD).
 *
 * Contract Rules:
 * - Authoritative Source: Kintone server time via same-origin HEAD /k/
 * - Timezone: Asia/Bangkok (fixed UTC+07:00 offset, no client clock dependence)
 * - Format: YYYY-MM-DD
 * - Fallback: FORBIDDEN (No local browser/workstation clock fallback)
 * - Error Behavior: FAIL CLOSED on any uncertainty or network issue
 */

export class LiveBusinessDateProviderError extends Error {
  constructor(code, message, cause = null) {
    super(`${code}: ${message}`);
    this.name = 'LiveBusinessDateProviderError';
    this.code = code;
    this.cause = cause;
  }
}

export const AUTHORITATIVE_ENDPOINT = '/k/';
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+07:00

let testFetchImpl = null;

/**
 * Sets a test-only fetch implementation. Never used in production runtime.
 * @param {Function|null} fetchFn
 */
export function setLiveBusinessDateFetchForTests(fetchFn) {
  testFetchImpl = fetchFn;
}

/**
 * Acquires the authoritative business date (YYYY-MM-DD) from Kintone server.
 *
 * @param {Object} [options]
 * @param {Function} [options.fetchImpl] - Optional custom fetch implementation for test injection
 * @returns {Promise<string>} Deterministic Asia/Bangkok calendar date in YYYY-MM-DD format
 * @throws {LiveBusinessDateProviderError} Fail-closed on any network, header, parsing, or formatting error
 */
export async function getLiveBusinessDate(options = {}) {
  // Disallow caller override of authoritative endpoint
  if (options && (options.endpoint !== undefined || options.url !== undefined || options.origin !== undefined || options.host !== undefined)) {
    throw new LiveBusinessDateProviderError(
      'ENDPOINT_OVERRIDE_FORBIDDEN',
      'Authoritative endpoint is locked to /k/. Overriding endpoint, url, origin, or host is strictly forbidden.'
    );
  }

  const fetchImpl = (options && 'fetchImpl' in options)
    ? options.fetchImpl
    : (testFetchImpl || (typeof fetch !== 'undefined' ? fetch : null));

  // 1. Fail-closed if fetch interface is unavailable
  if (typeof fetchImpl !== 'function') {
    throw new LiveBusinessDateProviderError(
      'FETCH_UNAVAILABLE',
      'Fetch interface is unavailable. Cannot acquire authoritative business date.'
    );
  }

  // 2. Perform same-origin HEAD request to authoritative endpoint /k/
  let res;
  try {
    res = await fetchImpl(AUTHORITATIVE_ENDPOINT, {
      method: 'HEAD',
      credentials: 'same-origin',
      cache: 'no-store'
    });
  } catch (netErr) {
    throw new LiveBusinessDateProviderError(
      'NETWORK_ERROR',
      `Failed to fetch server date from ${AUTHORITATIVE_ENDPOINT}: ${netErr.message}`,
      netErr
    );
  }

  // 3. Fail-closed if response is not successful (2xx)
  if (!res || !res.ok || res.status < 200 || res.status >= 300) {
    const status = res?.status ?? 'UNKNOWN';
    throw new LiveBusinessDateProviderError(
      'NON_SUCCESS_HTTP_STATUS',
      `Authoritative server returned non-success status ${status} from ${AUTHORITATIVE_ENDPOINT}.`
    );
  }

  // 4. Fail-closed if headers interface is missing
  if (!res.headers || typeof res.headers.get !== 'function') {
    throw new LiveBusinessDateProviderError(
      'HEADERS_INTERFACE_UNAVAILABLE',
      'Response headers interface is unavailable.'
    );
  }

  // 5. Fail-closed if Date response header is missing or empty
  const dateHeader = res.headers.get('date');
  if (!dateHeader || typeof dateHeader !== 'string' || !dateHeader.trim()) {
    throw new LiveBusinessDateProviderError(
      'SERVER_DATE_HEADER_MISSING',
      'Authoritative server Date response header is missing or empty.'
    );
  }

  // 6. Fail-closed if server Date timestamp cannot be parsed
  const serverEpochMs = Date.parse(dateHeader);
  if (!Number.isFinite(serverEpochMs)) {
    throw new LiveBusinessDateProviderError(
      'SERVER_DATE_HEADER_INVALID',
      `Server Date header is not a valid parseable timestamp: ${dateHeader}`
    );
  }

  // 7. Deterministic conversion to Asia/Bangkok calendar date (UTC+07:00)
  // Date is used ONLY as an arithmetic converter on the server-supplied epoch instant.
  // Local browser/workstation clock is NEVER consulted.
  const bkkInstant = new Date(serverEpochMs + BANGKOK_OFFSET_MS);
  const yyyy = String(bkkInstant.getUTCFullYear());
  const mm = String(bkkInstant.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(bkkInstant.getUTCDate()).padStart(2, '0');
  const businessDate = `${yyyy}-${mm}-${dd}`;

  // 8. Validate exact YYYY-MM-DD calendar date structure
  if (!/^\d{4}-\d{2}-\d{2}$/.test(businessDate)) {
    throw new LiveBusinessDateProviderError(
      'BUSINESS_DATE_FORMAT_INVALID',
      `Converted business date does not match YYYY-MM-DD: ${businessDate}`
    );
  }

  const calendarVerify = new Date(`${businessDate}T00:00:00.000Z`);
  if (Number.isNaN(calendarVerify.getTime()) || calendarVerify.toISOString().slice(0, 10) !== businessDate) {
    throw new LiveBusinessDateProviderError(
      'BUSINESS_DATE_FORMAT_INVALID',
      `Converted business date is not a valid calendar date: ${businessDate}`
    );
  }

  return businessDate;
}

export class LiveBusinessDateProvider {
  static get AUTHORITATIVE_ENDPOINT() {
    return AUTHORITATIVE_ENDPOINT;
  }

  /**
   * Static entrypoint for getting the authoritative business date.
   * @param {Object} [options]
   * @returns {Promise<string>}
   */
  static async getBusinessDate(options = {}) {
    return getLiveBusinessDate(options);
  }
}