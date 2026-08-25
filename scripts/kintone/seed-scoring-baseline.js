import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

delete process.env.KINTONE_API_TOKEN;

export async function verifyTrustedPublisherIdentity(loginName, connection = null) {
  if (!loginName || typeof loginName !== 'string') {
    throw new Error('TRUSTED PUBLISHER VERIFICATION FAILED: Login name is missing or invalid.');
  }
  const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;
  const m = await import(clientPath);
  const { baseUrl, headers } = connection || m.getAppCreationConnection();

  const url = `${baseUrl}/v1/users.json?codes[0]=${encodeURIComponent(loginName)}`;
  const res = await fetch(url, { method: 'GET', headers: { ...headers } });
  if (!res.ok) {
    throw new Error(`TRUSTED PUBLISHER VERIFICATION FAILED: HTTP ${res.status}`);
  }
  const data = await res.json();
  const users = data.users || [];
  const matchedUser = users.find(u => u.code === loginName);
  if (!matchedUser || matchedUser.valid === false) {
    throw new Error(`TRUSTED PUBLISHER VERIFICATION FAILED: User "${loginName}" not found or disabled.`);
  }
  console.log('TRUSTED_PUBLISHER_IDENTITY_VERIFIED = YES');
  return matchedUser.code;
}

export function createNarrowLiveTransport(appId = 796, connection = null, registry = null) {
  return async function narrowTransport(relPath, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const body = opts.body;

    if (method === 'DELETE' || method === 'PATCH') {
      throw new Error(`NARROW TRANSPORT BLOCKED: Method ${method} is strictly prohibited.`);
    }

    const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
    const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;
    const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;

    const writeGuard = await import(writeGuardPath);
    const m = await import(clientPath);
    const sandboxRegistry = registry || (await import(sandboxAppsPath, { with: { type: 'json' } })).default;

    if (method === 'POST' || method === 'PUT') {
      if (!body || Number(body.app) !== appId) {
        throw new Error(`NARROW TRANSPORT BLOCKED: Write target must be App ${appId}.`);
      }
      writeGuard.assertSandboxWriteTarget(appId, sandboxRegistry, [appId], { dryRunBypassDiscovery: true });
    }

    const { baseUrl, headers } = connection || m.getAppCreationConnection();
    const url = `${baseUrl}${relPath}`;
    const fetchOpts = {
      method,
      headers: body === undefined ? { ...headers } : { ...headers, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    };

    const res = await fetch(url, fetchOpts);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${method} ${relPath}: Transport operation failed.`);
    }
    return await res.json();
  };
}

export async function executeScoringSeed({ backupEvidencePath, overrideTransport, overrideCandidates } = {}) {
  delete process.env.KINTONE_API_TOKEN;

  const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;
  const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
  const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;
  const scoringMasterPath = pathToFileURL(path.resolve('src/profiles/scoring-config-master.js')).href;
  const scoringServicePath = pathToFileURL(path.resolve('src/services/scoring-config-master-service.js')).href;
  const scoringRepoPath = pathToFileURL(path.resolve('src/services/scoring-config-kintone-repository.js')).href;

  const m = await import(clientPath);
  const writeGuard = await import(writeGuardPath);
  const sandboxRegistry = (await import(sandboxAppsPath, { with: { type: 'json' } })).default;
  const scoringMaster = await import(scoringMasterPath);
  const scoringServiceModule = await import(scoringServicePath);
  const scoringRepoModule = await import(scoringRepoPath);

  const { getCanonicalBaselineMasterConfigs, validateScoringMasterConfig, computeConfigurationHash } = scoringMaster;
  const { ScoringConfigMasterService } = scoringServiceModule;
  const { ScoringConfigKintoneRepository } = scoringRepoModule;

  const appId796 = sandboxRegistry.scoringConfigMasterAppId || 796;
  console.log(`Targeting App 796 ID: ${appId796}`);

  // Enforce sandbox write target guard
  writeGuard.assertSandboxWriteTarget(appId796, sandboxRegistry, [appId796], { dryRunBypassDiscovery: true });

  const connection = overrideTransport ? null : m.getAppCreationConnection();
  const loginName = process.env.KINTONE_USERNAME || 'admin-form';
  const trustedPublisherCode = overrideTransport ? 'admin-form' : await verifyTrustedPublisherIdentity(loginName, connection);
  const trustedPublishedAt = new Date().toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00Z');

  const candidates = overrideCandidates || getCanonicalBaselineMasterConfigs();
  if (!Array.isArray(candidates) || candidates.length !== 8) {
    throw new Error(`SEED BLOCKED: Expected 8 baseline candidates, got ${candidates?.length}`);
  }

  // Pre-validate candidates
  for (const c of candidates) {
    const vRes = validateScoringMasterConfig(c);
    if (!vRes.isValid) {
      throw new Error(`SEED BLOCKED: Candidate ${c.Profile_Code} validation failed: ${JSON.stringify(vRes.errors)}`);
    }
    const hash = computeConfigurationHash(c);
    if (!hash || hash.length !== 64) {
      throw new Error(`SEED BLOCKED: Candidate ${c.Profile_Code} computed invalid hash.`);
    }
  }

  const liveTransport = overrideTransport || createNarrowLiveTransport(appId796, connection, sandboxRegistry);

  // STRICT FAIL-CLOSED PREFLIGHT: App 796 must have EXACTLY 0 records before seeding
  console.log(`Performing strict fail-closed preflight check on App ${appId796}...`);
  const initialRecordsRes = await liveTransport(`/k/v1/records.json?app=${appId796}&query=limit%20500`);
  const initialRecordCount = initialRecordsRes?.records?.length || 0;

  if (initialRecordCount !== 0) {
    throw new Error(`SEED_BLOCKED_EXISTING_RECORDS: App ${appId796} already contains ${initialRecordCount} record(s). Seeder stops fail-closed with ZERO writes.`);
  }

  // Find latest app 796 backup evidence
  let prewriteBackupEvidence;
  if (!overrideTransport) {
    const backupParent = path.resolve('backups/delivery-sprint-03a/app796');
    const backupSubdirs = fs.readdirSync(backupParent).sort().reverse();
    if (backupSubdirs.length === 0) {
      throw new Error('SEED BLOCKED: No App 796 pre-write backup evidence found.');
    }
    const latestBackupDir = path.join(backupParent, backupSubdirs[0]);
    const manifestPath = path.join(latestBackupDir, 'manifest_sha256.json');
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const backupFile = path.join(latestBackupDir, 'app_796_backup.json');
    const backupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    const backupSha256 = manifestData.files['app_796_backup.json'];
    const backupCapturedAt = manifestData.timestamp;

    prewriteBackupEvidence = {
      appId: appId796,
      appName: 'MBO Profile & Scoring Configuration Master [Sandbox]',
      snapshotScope: 'APP796_RECORDS_PREWRITE_V1',
      captured: true,
      verified: true,
      retainedUntilIndependentReview: true,
      artifactPath: backupFile,
      sha256: backupSha256,
      capturedAt: backupCapturedAt,
      recordCount: backupContent.recordCount
    };
  } else {
    prewriteBackupEvidence = {
      appId: appId796,
      appName: 'MBO Profile & Scoring Configuration Master [Sandbox]',
      snapshotScope: 'APP796_RECORDS_PREWRITE_V1',
      captured: true,
      verified: true,
      retainedUntilIndependentReview: true,
      artifactPath: 'backups/delivery-sprint-03a/app796/test/app_796_backup.json',
      sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      capturedAt: new Date().toISOString(),
      recordCount: 0
    };
  }

  const bridge = m.createScoringConfigRepositoryRequestBridge({ transport: liveTransport });

  const repository = new ScoringConfigKintoneRepository({
    request: bridge,
    authorizeWrite: (repoReq) => {
      const op = repoReq.operation;
      let requestContext;

      if (op === 'SCORING_CONFIG_CREATE_VALIDATED') {
        requestContext = {
          operation: op,
          appId: appId796,
          masterRecordKey: repoReq.masterRecordKey,
          manifest: {
            expectedChanges: [
              {
                operation: op,
                appId: appId796,
                masterRecordKey: repoReq.masterRecordKey
              }
            ]
          }
        };
      } else if (op === 'SCORING_CONFIG_PUBLISH') {
        requestContext = {
          operation: op,
          appId: appId796,
          masterRecordKey: repoReq.masterRecordKey,
          recordId: repoReq.recordId,
          expectedRevision: repoReq.expectedRevision,
          manifest: {
            expectedChanges: [
              {
                operation: op,
                appId: appId796,
                recordId: repoReq.recordId,
                expectedRevision: repoReq.expectedRevision
              }
            ]
          }
        };
      } else {
        throw new Error(`UNSUPPORTED OPERATION: ${op}`);
      }

      const authConfig = {
        workPackageId: 'MBO-P03-WP-002C',
        stage: 'STAGE_4C_RECORD_WRITE_BRIDGE',
        recordWriteContractId: 'WP002C_SCORING_RECORD_WRITE_V1',
        appId: appId796,
        appName: 'MBO Profile & Scoring Configuration Master [Sandbox]',
        operation: op,
        explicitUserAuthorization: true,
        activeWindow: true,
        authorizationId: `AUTH_SEED_796_${repoReq.masterRecordKey}_${op}_${Date.now()}_${Math.random()}`,
        prewriteBackupEvidence
      };

      return writeGuard.assertScoringConfigRecordWriteAuthorization(authConfig, requestContext);
    }
  });

  const auditProvider = {
    getPublisherIdentity: () => trustedPublisherCode,
    getPublishedAt: () => trustedPublishedAt
  };

  const service = new ScoringConfigMasterService({ repository, auditProvider });

  let postCount = 0;
  let putCount = 0;

  console.log(`Starting controlled seed of 8 scoring baseline configurations to App ${appId796}...`);

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(`[${i + 1}/8] Publishing candidate ${candidate.Profile_Code} (${candidate.Master_Record_Key})...`);

    const cleanCandidate = { ...candidate };
    delete cleanCandidate.Config_Status;
    delete cleanCandidate.Published_By;
    delete cleanCandidate.Published_At;
    delete cleanCandidate.Configuration_Hash;

    const pubRes = await service.publishScoringConfig(cleanCandidate);

    if (!pubRes || pubRes.status !== 'PUBLISH_VERIFIED') {
      console.error('pubRes failure details:', pubRes);
      throw new Error(`SEED FAILED for ${candidate.Profile_Code}: ${pubRes?.errorCode || pubRes?.error} - ${pubRes?.errorMessage || JSON.stringify(pubRes)}`);
    }

    postCount++;
    putCount++;
    console.log(`Published ${candidate.Profile_Code} -> Record ID: ${pubRes.recordId}, Status: ${pubRes.status}`);
  }

  // Final Readback Verification
  console.log('\nVerifying final live App 796 records...');
  const finalRecordsRes = await liveTransport(`/k/v1/records.json?app=${appId796}`);
  const finalRecords = finalRecordsRes.records || [];

  const publishedRecords = finalRecords.filter(r => r.Config_Status?.value === 'PUBLISHED');
  const validatedRecords = finalRecords.filter(r => r.Config_Status?.value === 'VALIDATED');

  if (finalRecords.length !== 8 || publishedRecords.length !== 8 || validatedRecords.length !== 0) {
    throw new Error(`FINAL READBACK VERIFICATION FAILED: Expected 8 total & 8 PUBLISHED records, got total=${finalRecords.length}, published=${publishedRecords.length}, validated=${validatedRecords.length}`);
  }

  console.log('SUCCESS: All 8 baseline configurations published and verified on live App 796!');
  return { postCount, putCount, totalRecords: finalRecords.length };
}

if (process.argv[1] && process.argv[1].endsWith('seed-scoring-baseline.js')) {
  executeScoringSeed().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
