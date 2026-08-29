/**
 * HTTP Router & Response Normalizer (Auth Bridge Core)
 * Handles endpoint dispatch, CORS enforcement, Cache-Control: no-store, Rate Limiting, and Response Sanitization.
 */

export class AuthBridgeRouter {
  constructor(options = {}) {
    this.authService = options.authService;
    this.sessionService = options.sessionService;
    this.rateLimiter = options.rateLimiter || null;
    this.allowedOrigins = options.allowedOrigins || ['*'];
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

    // 4. Endpoint Routing
    try {
      if (method === 'POST' && url === '/v1/auth/login') {
        const { employeeCode, password, kintoneUserCode } = body || {};
        const result = await this.authService.login({ employeeCode, password, kintoneUserCode, now });
        return this._formatResponse(result, responseHeaders);
      }

      if (method === 'POST' && url === '/v1/auth/session/validate') {
        const { sessionToken, employeeCode, kintoneUserCode } = body || {};
        const result = await this.sessionService.validateSession(sessionToken, employeeCode, kintoneUserCode, now);
        if (result.valid) {
          return {
            statusCode: 200,
            headers: responseHeaders,
            body: {
              status: 'AUTHENTICATED',
              valid: true,
              employeeCode: result.employeeCode,
              credentialVersion: result.credentialVersion,
              expiresAt: result.expiresAt
            }
          };
        } else {
          return {
            statusCode: 200,
            headers: responseHeaders,
            body: {
              status: 'INVALID_SESSION',
              valid: false,
              reason: result.reason
            }
          };
        }
      }

      if (method === 'POST' && url === '/v1/auth/logout') {
        const { employeeCode } = body || {};
        const result = await this.authService.logout({ employeeCode });
        return { statusCode: 200, headers: responseHeaders, body: result };
      }

      if (method === 'POST' && url === '/v1/auth/password/force-change') {
        const { forceTicket, employeeCode, newPassword, kintoneUserCode } = body || {};
        const result = await this.authService.forcePasswordChange({ forceTicket, employeeCode, newPassword, kintoneUserCode, now });
        return this._formatResponse(result, responseHeaders);
      }

      if (method === 'POST' && url === '/v1/auth/password/change') {
        const { sessionToken, employeeCode, currentPassword, newPassword, kintoneUserCode } = body || {};
        const result = await this.authService.changePassword({ sessionToken, employeeCode, currentPassword, newPassword, kintoneUserCode, now });
        return this._formatResponse(result, responseHeaders);
      }

      return {
        statusCode: 404,
        headers: responseHeaders,
        body: { error: 'NOT_FOUND', reason: 'Endpoint not found.' }
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: responseHeaders,
        body: { status: 'AUTH_SERVICE_UNAVAILABLE', reason: err.message || 'Internal service error.' }
      };
    }
  }

  _checkCorsOrigin(origin) {
    if (!origin) return true;
    if (this.allowedOrigins.includes('*')) return true;
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
      'RATE_LIMITED': 429,
      'AUTH_SERVICE_UNAVAILABLE': 500
    };
    const statusCode = statusMap[serviceResult.status] || 400;

    // Sanitize response body — NO secrets, NO Password_Hash, NO Session_Token_Hash, NO API tokens!
    const sanitizedBody = {
      status: serviceResult.status,
      employeeCode: serviceResult.employeeCode || undefined,
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
