/**
 * Environment & Configuration Boundary Validation for Auth Bridge
 * Enforces mandatory secrets and explicit CORS origin list without defaults or wildcards.
 */

export function parseBridgeConfig(env = process.env) {
  const kintoneBaseUrl = env.KINTONE_BASE_URL || '';
  const app801Id = Number(env.APP801_ID || 801);
  const kintoneApiToken = env.KINTONE_API_TOKEN || '';
  const forceChangeSigningSecret = env.FORCE_CHANGE_SIGNING_SECRET || '';

  if (!forceChangeSigningSecret || forceChangeSigningSecret.includes('placeholder') || forceChangeSigningSecret.includes('default')) {
    throw new Error('CONFIG_ERROR: FORCE_CHANGE_SIGNING_SECRET must be explicitly configured.');
  }

  const rawOrigins = env.ALLOWED_ORIGINS || '';
  const allowedOrigins = rawOrigins
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
    throw new Error("CONFIG_ERROR: ALLOWED_ORIGINS must be configured without wildcard '*'.");
  }

  const port = Number(env.PORT || 3000);

  return {
    kintoneBaseUrl,
    app801Id,
    kintoneApiToken,
    forceChangeSigningSecret,
    allowedOrigins,
    port
  };
}
