import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

export const DISCOVERY_MODE = true;

export const PROTECTED_APP_IDS = Object.freeze([
  53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795
]);

export const WRITE_BLOCKED_APP_IDS = PROTECTED_APP_IDS;

export function assertDiscoveryReadOnly(method = 'GET', appId) {
  if (DISCOVERY_MODE && method.toUpperCase() !== 'GET') {
    throw new Error(`DISCOVERY PHASE WRITE BLOCKED: Method ${method} is blocked during Discovery & Architecture Design Phase for App ${appId || 'ALL'}.`);
  }
}

export function getSandboxAppIds(registry = sandboxRegistry) {
  return [registry.mboV2AppId, registry.routingMasterAppId]
    .filter((appId) => Number.isInteger(appId) && appId > 0);
}

export function assertSandboxWriteTarget(appId, registry = sandboxRegistry) {
  if (DISCOVERY_MODE) {
    throw new Error('DISCOVERY PHASE WRITE BLOCKED: All Kintone write operations are locked during Architecture Discovery Phase.');
  }
  if (!Number.isInteger(appId) || appId <= 0 || PROTECTED_APP_IDS.includes(appId) || !getSandboxAppIds(registry).includes(appId)) {
    throw new Error('WRITE BLOCKED: Target application is not registered as an MBO2026 Sandbox App.');
  }
  return appId;
}
