import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

export const DISCOVERY_MODE = true;

/**
 * Permanent Corporate Protected / Reference App IDs (MUST NEVER BE WRITTEN TO)
 */
export const PROTECTED_APP_IDS = Object.freeze([
  53, 283, 305, 307, 310, 640, 643, 715, 716
]);

/**
 * Current Work Package Write Allow-List.
 * For Phase 1 (MBO-P01-WP-001), WRITE_ALLOWED_APPS is strictly EMPTY (default-deny).
 */
export const WRITE_ALLOWED_APPS = Object.freeze([]);

/**
 * Backwards compatibility: WRITE_BLOCKED_APP_IDS includes all protected apps + any app not in allow-list
 */
export const WRITE_BLOCKED_APP_IDS = Object.freeze([
  ...PROTECTED_APP_IDS, 794, 795
]);

export function assertDiscoveryReadOnly(method = 'GET', appId) {
  if (DISCOVERY_MODE && method.toUpperCase() !== 'GET') {
    throw new Error(`DISCOVERY PHASE WRITE BLOCKED: Method ${method} is blocked during Discovery & Architecture Design Phase for App ${appId || 'ALL'}.`);
  }
}

export function getSandboxAppIds(registry = sandboxRegistry) {
  return [registry.mboV2AppId, registry.routingMasterAppId]
    .filter((appId) => Number.isInteger(appId) && appId > 0);
}

/**
 * Assert whether a write operation (POST, PUT, DELETE) is authorized for a given target app.
 * In Phase 1 (MBO-P01-WP-001), all writes are blocked (default deny).
 * Protected legacy apps (53, 283, 305, 307, 310, 640, 643, 715, 716) can NEVER be written to under any circumstances.
 */
export function assertSandboxWriteTarget(appId, registry = sandboxRegistry, allowList = WRITE_ALLOWED_APPS) {
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error('WRITE BLOCKED: Target application ID must be a positive integer.');
  }

  // Absolute invariant: Protected apps are NEVER writable under any circumstances
  if (PROTECTED_APP_IDS.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is a permanent PROTECTED PRODUCTION APP and cannot be modified.`);
  }

  if (DISCOVERY_MODE) {
    throw new Error('DISCOVERY PHASE WRITE BLOCKED: All Kintone write operations are locked during Architecture Discovery Phase.');
  }

  // Work Package Allow-List enforcement
  if (!allowList.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not in the active Work Package write allow-list (allow-list count = ${allowList.length}).`);
  }

  if (!getSandboxAppIds(registry).includes(appId)) {
    throw new Error('WRITE BLOCKED: Target application is not registered as an MBO2026 Sandbox App.');
  }

  return appId;
}

