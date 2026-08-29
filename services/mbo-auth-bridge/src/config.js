/**
 * Environment & Configuration Validation for Auth Bridge
 */

export function parseBridgeConfig(env = process.env) {
  const kintoneBaseUrl = env.KINTONE_BASE_URL || '';
  const app801Id = Number(env.APP801_ID || 801);
  const kintoneApiToken = env.KINTONE_API_TOKEN || '';
  const forceChangeSigningSecret = env.FORCE_CHANGE_SIGNING_SECRET || '';
  const allowedOrigins = (env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
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
