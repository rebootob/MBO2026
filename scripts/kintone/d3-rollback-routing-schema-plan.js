/**
 * D3-IMP-02 — Rollback Plan Generator for App 795 Schema and Records
 *
 * This tool is a PLAN GENERATOR ONLY.
 * It describes deterministic rollback prerequisites, restoration steps, and read-back verification.
 * It CANNOT and MUST NOT execute mutation or rollback.
 * Performs ZERO Kintone reads/writes and ZERO network operations.
 */

import crypto from 'node:crypto';
import { D3_ROUTING_MASTER_APP_ID } from '../../src/core/sandbox-write-guard.js';

delete process.env.KINTONE_API_TOKEN;

export const ROLLBACK_TARGET_APP_ID = D3_ROUTING_MASTER_APP_ID; // 795

/**
 * Validates all strict rollback prerequisites.
 */
export function validateRollbackPrerequisites({
  targetAppId,
  originalSchemaSnapshot,
  originalRecordBackup,
  currentRevision,
  expectedBackupRevision
}) {
  if (!Number.isInteger(targetAppId) || targetAppId !== ROLLBACK_TARGET_APP_ID) {
    throw new Error(`ROLLBACK_PREREQUISITE_FAILED: Target App ID must be exactly ${ROLLBACK_TARGET_APP_ID}.`);
  }

  // Original schema snapshot validation
  if (!originalSchemaSnapshot || typeof originalSchemaSnapshot !== 'object') {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original schema snapshot is required.');
  }
  if (!originalSchemaSnapshot.fields || typeof originalSchemaSnapshot.fields !== 'object') {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original schema snapshot must contain fields definition.');
  }
  const origRk = originalSchemaSnapshot.fields.Routing_Key;
  if (!origRk || origRk.unique !== true) {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original schema snapshot must have Routing_Key with unique=true.');
  }

  // Original record backup validation
  if (!originalRecordBackup || typeof originalRecordBackup !== 'object') {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original record backup is required.');
  }
  if (originalRecordBackup.appId !== ROLLBACK_TARGET_APP_ID) {
    throw new Error(`ROLLBACK_PREREQUISITE_FAILED: Backup App ID mismatch (expected ${ROLLBACK_TARGET_APP_ID}, got ${originalRecordBackup.appId}).`);
  }
  if (originalRecordBackup.captured !== true || originalRecordBackup.verified !== true) {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original record backup must be marked captured and verified.');
  }
  if (typeof originalRecordBackup.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(originalRecordBackup.sha256)) {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original record backup sha256 must be a 64-character lowercase hex string.');
  }
  if (typeof originalRecordBackup.artifactPath !== 'string' || !originalRecordBackup.artifactPath.trim()) {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Original record backup artifact path is required.');
  }

  // Revision validation
  const curRev = Number(currentRevision);
  const expRev = Number(expectedBackupRevision);
  if (!Number.isInteger(curRev) || curRev < 1) {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Current revision must be a positive integer.');
  }
  if (!Number.isInteger(expRev) || expRev < 1) {
    throw new Error('ROLLBACK_PREREQUISITE_FAILED: Expected backup revision must be a positive integer.');
  }
  if (curRev < expRev) {
    throw new Error(`ROLLBACK_PREREQUISITE_FAILED: Current revision (${curRev}) cannot be lower than backup revision (${expRev}).`);
  }

  return true;
}

/**
 * Generates a deterministic rollback plan for App 795.
 *
 * @param {Object} params
 * @param {number} params.targetAppId - Target App ID (795)
 * @param {Object} params.originalSchemaSnapshot - Verified pre-migration schema snapshot
 * @param {Object} params.originalRecordBackup - Verified pre-migration record backup
 * @param {number} params.currentRevision - Current live revision
 * @param {number} params.expectedBackupRevision - Revision at time of backup
 * @returns {Object} Rollback plan specification
 */
export function generateRollbackRoutingSchemaPlan({
  targetAppId,
  originalSchemaSnapshot,
  originalRecordBackup,
  currentRevision,
  expectedBackupRevision
}) {
  validateRollbackPrerequisites({
    targetAppId,
    originalSchemaSnapshot,
    originalRecordBackup,
    currentRevision,
    expectedBackupRevision
  });

  const curRev = Number(currentRevision);
  const expRev = Number(expectedBackupRevision);

  const payload = JSON.stringify({
    targetAppId,
    currentRevision: curRev,
    expectedBackupRevision: expRev,
    backupSha256: originalRecordBackup.sha256
  });
  const planHash = crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
  const planId = `D3-ROLLBACK-795-R${curRev}-TO-R${expRev}-${planHash}`;

  return {
    planId,
    planType: 'ROLLBACK_SPECIFICATION_ONLY',
    targetAppId: ROLLBACK_TARGET_APP_ID,
    revisions: {
      currentRevision: curRev,
      targetRestorationRevision: expRev
    },
    prerequisitesStatus: {
      originalSchemaSnapshotVerified: true,
      originalRecordBackupVerified: true,
      backupIdentityMatched: true,
      revisionBoundariesValid: true,
      separateAuthorizationGateRequired: true
    },
    backupEvidence: { ...originalRecordBackup },
    rollbackSteps: [
      {
        step: 1,
        title: 'Verify Pre-Rollback State & Backup Identity',
        action: 'ASSERT_BACKUP_SHA256_AND_REVISION',
        details: `Verify live state revision equals ${curRev} and backup hash matches ${originalRecordBackup.sha256}.`
      },
      {
        step: 2,
        title: 'Restore Routing Records (if data altered)',
        action: 'RESTORE_RECORDS_FROM_BACKUP',
        details: `Restore ${originalRecordBackup.recordCount ?? 'all'} baseline routing records from ${originalRecordBackup.artifactPath}.`
      },
      {
        step: 3,
        title: 'Revert App 795 Schema Properties',
        action: 'RESTORE_SCHEMA_PROPERTIES',
        details: 'Revert Routing_Key unique property back to true and Effective_From required back to false.'
      },
      {
        step: 4,
        title: 'Post-Restoration Read-Back Verification',
        action: 'EXECUTE_READ_BACK_ASSERTIONS',
        assertions: [
          'App 795 Routing_Key.unique === true',
          'Record count matches pre-migration count',
          'Read-back SHA-256 hash matches backup evidence'
        ]
      }
    ],
    executionProhibition: {
      canExecute: false,
      reason: 'PLAN_GENERATOR_ONLY: Real rollback execution is strictly disabled and requires a separately-authorized write gate.'
    }
  };
}

/**
 * Execution function: MUST ALWAYS FAIL CLOSED.
 */
export function executeRollback() {
  throw new Error('ROLLBACK_EXECUTION_BLOCKED: d3-rollback-routing-schema-plan is a plan generator only; execution is strictly prohibited.');
}

if (process.argv[1] && process.argv[1].endsWith('d3-rollback-routing-schema-plan.js')) {
  const dummySchema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', unique: true, required: true }
    }
  };
  const dummyBackup = {
    appId: 795,
    sha256: 'b'.repeat(64),
    captured: true,
    verified: true,
    artifactPath: 'scratch/app795-prewrite-backup.json',
    recordCount: 17
  };
  const plan = generateRollbackRoutingSchemaPlan({
    targetAppId: 795,
    originalSchemaSnapshot: dummySchema,
    originalRecordBackup: dummyBackup,
    currentRevision: 11,
    expectedBackupRevision: 10
  });
  console.log(JSON.stringify(plan, null, 2));
}
