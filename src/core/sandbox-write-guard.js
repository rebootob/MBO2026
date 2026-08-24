import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

export const DISCOVERY_MODE = true;

/**
 * Permanent Corporate Protected / Reference App IDs (MUST NEVER BE WRITTEN TO UNDER ANY CIRCUMSTANCES)
 */
export const PROTECTED_APP_IDS = Object.freeze([
  53, 283, 305, 307, 310, 640, 643, 715, 716
]);

/**
 * Default Work Package Write Allow-List.
 * Under standard / quiescent state, WRITE_ALLOWED_APPS is strictly EMPTY (default-deny).
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
 * Protected legacy apps (53, 283, 305, 307, 310, 640, 643, 715, 716) can NEVER be written to under any circumstances.
 */
export function assertSandboxWriteTarget(appId, registry = sandboxRegistry, allowList = WRITE_ALLOWED_APPS, options = {}) {
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error('WRITE BLOCKED: Target application ID must be a positive integer.');
  }

  // Absolute invariant: Protected apps are NEVER writable under any circumstances (Hard Block overrides allow-list)
  if (PROTECTED_APP_IDS.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is a permanent PROTECTED PRODUCTION APP and cannot be modified.`);
  }

  if (DISCOVERY_MODE && !options.dryRunBypassDiscovery) {
    throw new Error('DISCOVERY PHASE WRITE BLOCKED: All Kintone write operations are locked during Architecture Discovery Phase.');
  }

  // Fail-closed: allowList must be a valid array
  if (!Array.isArray(allowList) || allowList.length === 0) {
    throw new Error(`WRITE BLOCKED: Empty or missing write allow-list denies write operation for App ${appId}.`);
  }

  // Work Package Allow-List enforcement
  if (!allowList.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not in the active Work Package write allow-list (allow-list: [${allowList.join(', ')}]).`);
  }

  if (!getSandboxAppIds(registry).includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not registered as an MBO2026 Sandbox App.`);
  }

  return appId;
}

/**
 * Comprehensive Work Package Authorization & Safety Gate Engine (WP-002).
 * Validates:
 * 1. Fail-Closed on missing/corrupted configs
 * 2. Permanent Protected App Hard Block
 * 3. Work Package ID & Scope matching
 * 4. Operation-Level permission matching (e.g. FIELD_CREATE, LAYOUT_UPDATE)
 * 5. Pre-Write Backup Gate verification
 * 6. Expected Change Manifest presence
 * 7. Active Temporary Write Window
 */
export function assertWorkPackageAuthorization(authConfig, requestConfig) {
  // 1. Fail-closed: missing or invalid configuration
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('WRITE BLOCKED (FAIL-CLOSED): Missing or corrupted authorization/request configuration.');
  }

  const {
    workPackageId: activeWpId,
    allowedAppIds = [],
    allowedOperations = [],
    backupVerified = false,
    activeWindow = false,
    dryRunBypassDiscovery = false
  } = authConfig;

  const {
    appId,
    operation,
    manifest,
    workPackageId: reqWpId
  } = requestConfig;

  // Validate App ID integer
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error('WRITE BLOCKED: Target application ID must be a positive integer.');
  }

  // 2. Absolute invariant: Permanent Protected Apps are NEVER writable under any circumstances
  if (PROTECTED_APP_IDS.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is a permanent PROTECTED PRODUCTION APP and cannot be modified.`);
  }

  // Discovery Mode check
  if (DISCOVERY_MODE && !dryRunBypassDiscovery) {
    throw new Error('DISCOVERY PHASE WRITE BLOCKED: All Kintone write operations are locked during Architecture Discovery Phase.');
  }

  // 3. Work Package ID matching
  if (!activeWpId || !reqWpId || activeWpId !== reqWpId) {
    throw new Error(`WRITE BLOCKED: Work package mismatch (Active: ${activeWpId || 'NONE'}, Request: ${reqWpId || 'NONE'}).`);
  }

  // 4. Temporary Write Window check
  if (activeWindow !== true) {
    throw new Error(`WRITE BLOCKED: Write window is CLOSED for Work Package ${activeWpId}.`);
  }

  // 5. App Allow-list check
  if (!Array.isArray(allowedAppIds) || !allowedAppIds.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not in the authorized allow-list for Work Package ${activeWpId}.`);
  }

  // 6. Operation-level permission check
  if (!Array.isArray(allowedOperations) || !allowedOperations.includes(operation)) {
    throw new Error(`WRITE BLOCKED: Operation '${operation || 'UNKNOWN'}' is not authorized for App ${appId} under Work Package ${activeWpId}.`);
  }

  // 7. Pre-Write Backup Gate check
  if (backupVerified !== true) {
    throw new Error(`WRITE BLOCKED (BACKUP GATE): Pre-write backup has not been verified for App ${appId} under Work Package ${activeWpId}.`);
  }

  // 8. Expected Change Manifest check
  if (!manifest || typeof manifest !== 'object' || !manifest.expectedChanges || !Array.isArray(manifest.expectedChanges) || manifest.expectedChanges.length === 0) {
    throw new Error(`WRITE BLOCKED: Missing or empty Expected Change Manifest for Work Package ${activeWpId}.`);
  }

  return true;
}


