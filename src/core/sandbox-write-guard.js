import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

export const PROTECTED_APP_IDS = Object.freeze([53, 283]);

export function getSandboxAppIds(registry = sandboxRegistry) {
  return [registry.mboV2AppId, registry.routingMasterAppId]
    .filter((appId) => Number.isInteger(appId) && appId > 0);
}

export function assertSandboxWriteTarget(appId, registry = sandboxRegistry) {
  if (!Number.isInteger(appId) || appId <= 0 || PROTECTED_APP_IDS.includes(appId) || !getSandboxAppIds(registry).includes(appId)) {
    throw new Error('WRITE BLOCKED: Target application is not registered as an MBO2026 Sandbox App.');
  }
  return appId;
}
