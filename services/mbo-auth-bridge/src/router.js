/**
 * HTTP Router & Response Normalizer (Auth Bridge Core)
 * Handles endpoint dispatch, CORS enforcement, Cache-Control: no-store, Rate Limiting, and Response Sanitization.
 */

export class AuthBridgeRouter {
  constructor(options = {}) {
    this.authService = options.authService;
    this.sessionService = options.sessionService;
    this.rateLimiter = options.rateLimiter || null;
    this.allowedOrigins = options.allowedOrigins || [];
  }

  /**
   * Dispatches an HTTP request object and returns normalized status + JSON body + headers.
   */
  async handleRequest(req) {
    const { method, url, headers = {}, body = {}, ip = '127.0.0.1', now = new Date() } = req;
    const origin = headers.origin || headers.Origin || '';

    // 1. CORS Origin Validation
    const isCorsAllowed = this._checkCorsOrigin(origin);
    const responseHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json; charset=utf-8'
    };

    if (origin && isCorsAllowed) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }

    if (method === 'OPTIONS') {
      if (origin && !isCorsAllowed) {
        return { statusCode: 403, headers: responseHeaders, body: { error: 'CORS_ORIGIN_DENIED' } };
      }
      return { statusCode: 204, headers: responseHeaders, body: null };
    }

    if (origin && !isCorsAllowed) {
      return { statusCode: 403, headers: responseHeaders, body: { error: 'CORS_ORIGIN_DENIED' } };
    }

    // 2. Rate limiting check
    if (this.rateLimiter && this.rateLimiter.isRateLimited(ip, now)) {
      return {
        statusCode: 429,
        headers: responseHeaders,
        body: { status: 'RATE_LIMITED', reason: 'Too many requests. Please try again later.' }
      };
    }

    // 3. Health check endpoint
    if (method === 'GET' && url === '/healthz') {
      return { statusCode: 200, headers: responseHeaders, body: { status: 'OK', service: 'mbo-auth-bridge' } };
    }

    // 4. Endpoint Routing with Sanitized Error Handling
    try {
      if (method === 'POST' && url === '/v1/auth/login') {
        const { employeeCode, password, kintoneUser } = body || {};
        const result = await this.authService.login({ employeeCode, password, kintoneUser, now });
        return this._formatResponse(result, responseHeaders);
      }

      if (method === 'POST' && url === '/v1/auth/session/validate') {
        const { sessionToken, kintoneUser } = body || {};
        const result = await this.sessionService.validateSession(sessionToken, kintoneUser, now);
        return this._formatResponse(result, responseHeaders);
      }

      if (method === 'POST' && url === '/v1/auth/logout') {
        const { sessionToken } = body || {};
        const result = await this.authService.logout({ sessionToken });
        return { statusCode: 200, headers: responseHeaders, body: result };
      }

      if (method === 'POST' && url === '/v1/auth/password/force-change') {
        const { forceTicket, newPassword, kintoneUser } = body || {};
        const result = await this.authService.forcePasswordChange({ forceTicket, newPassword, kintoneUser, now });
        return this._formatResponse(result, responseHeaders);
      }

      if (method === 'POST' && url === '/v1/auth/password/change') {
        const { sessionToken, currentPassword, newPassword, kintoneUser } = body || {};
        const result = await this.authService.changePassword({ sessionToken, currentPassword, newPassword, kintoneUser, now });
        return this._formatResponse(result, responseHeaders);
      }

      return {
        statusCode: 404,
        headers: responseHeaders,
        body: { error: 'NOT_FOUND', reason: 'Endpoint not found.' }
      };
    } catch (err) {
      // Sanitized error response — NEVER leak internal err.message or stack trace to client!
      return {
        statusCode: 500,
        headers: responseHeaders,
        body: { status: 'AUTH_SERVICE_UNAVAILABLE', reason: 'An internal authentication service error occurred.' }
      };
    }
  }

  _checkCorsOrigin(origin) {
    if (!origin) return true; // Direct non-browser requests allowed
    return this.allowedOrigins.includes(origin);
  }

  _formatResponse(serviceResult, headers) {
    const statusMap = {
      'AUTHENTICATED': 200,
      'PASSWORD_CHANGE_REQUIRED': 200,
      'INVALID_CREDENTIALS': 200,
      'ACCOUNT_LOCKED': 200,
      'ACCOUNT_DISABLED': 200,
      'INVALID_SESSION': 200,
      'INVALID_TICKET': 200,
      'INVALID_PARAMETERS': 200,
      'RATE_LIMITED': 429,
      'AUTH_SERVICE_UNAVAILABLE': 500
    };
    const statusCode = statusMap[serviceResult.status] || 400;

    // Sanitize response body — NO secrets, NO Password_Hash, NO Session_Token_Hash, NO API tokens, NO internal stack!
    const sanitizedBody = {
      status: serviceResult.status,
      valid: serviceResult.valid !== undefined ? serviceResult.valid : undefined,
      employeeCode: serviceResult.employeeCode || undefined,
      credentialVersion: serviceResult.credentialVersion || undefined,
      sessionToken: serviceResult.sessionToken || undefined,
      expiresAt: serviceResult.expiresAt || undefined,
      forceTicket: serviceResult.forceTicket || undefined,
      reason: serviceResult.reason || undefined
    };

    // Remove undefined properties
    Object.keys(sanitizedBody).forEach(key => {
      if (sanitizedBody[key] === undefined) delete sanitizedBody[key];
    });

    return { statusCode, headers, body: sanitizedBody };
  }
}
