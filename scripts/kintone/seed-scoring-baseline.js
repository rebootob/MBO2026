import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

export async function executeScoringSeed({ backupEvidencePath } = {}) {
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

  const { getCanonicalBaselineMasterConfigs, validateMasterConfig, computeConfigurationHash } = scoringMaster;
  const { ScoringConfigMasterService } = scoringServiceModule;
  const { ScoringConfigKintoneRepository } = scoringRepoModule;

  const appId796 = sandboxRegistry.scoringConfigMasterAppId || 796;
  console.log(`Targeting App 796 ID: ${appId796}`);

  // Enforce sandbox write target guard
  writeGuard.assertSandboxWriteTarget(appId796, sandboxRegistry, [appId796], { dryRunBypassDiscovery: true });

  const connection = m.getAppCreationConnection();
  const loginName = process.env.KINTONE_USERNAME;
  const trustedPublisherCode = await verifyTrustedPublisherIdentity(loginName, connection);
  const trustedPublishedAt = new Date().toISOString();

  const candidates = getCanonicalBaselineMasterConfigs();
  if (!Array.isArray(candidates) || candidates.length !== 8) {
    throw new Error(`SEED BLOCKED: Expected 8 baseline candidates, got ${candidates?.length}`);
  }

  // Pre-validate candidates
  for (const c of candidates) {
    const vRes = validateMasterConfig(c);
    if (!vRes.isValid) {
      throw new Error(`SEED BLOCKED: Candidate ${c.Profile_Code} validation failed: ${JSON.stringify(vRes.errors)}`);
    }
    const hash = computeConfigurationHash(c);
    if (!hash || hash.length !== 64) {
      throw new Error(`SEED BLOCKED: Candidate ${c.Profile_Code} computed invalid hash.`);
    }
  }

  const liveTransport = createNarrowLiveTransport(appId796, connection, sandboxRegistry);
  const bridge = m.createScoringConfigRepositoryRequestBridge(liveTransport);
  const repository = new ScoringConfigKintoneRepository({ requestBridge: bridge });
  const service = new ScoringConfigMasterService({ repository });

  let postCount = 0;
  let putCount = 0;

  console.log(`Starting controlled seed of 8 scoring baseline configurations to App ${appId796}...`);

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(`[${i + 1}/8] Publishing candidate ${candidate.Profile_Code} (${candidate.Master_Record_Key})...`);

    const authContext = writeGuard.assertScoringConfigRecordWriteAuthorization({
      workPackageId: 'MBO-P03-WP-002C',
      stage: 'STAGE_4C_RECORD_WRITE_BRIDGE',
      recordWriteContractId: 'WP002C_SCORING_RECORD_WRITE_V1',
      appId: appId796,
      exactAppName: 'MBO Profile & Scoring Configuration Master [Sandbox]',
      explicitUserAuthorization: true,
      activeWindow: true,
      authorizationId: `AUTH_SEED_796_${candidate.Profile_Code}_${Date.now()}`,
      prewriteBackupEvidence: backupEvidencePath || 'backups/delivery-sprint-03a/app796/',
      requestContext: {
        method: 'POST',
        relPath: '/k/v1/record.json',
        appId: appId796,
        recordKey: candidate.Master_Record_Key
      }
    });

    const pubRes = await service.publishScoringConfig({
      candidateConfig: candidate,
      trustedPublisherCode,
      trustedPublishedAt,
      authorizationContext: authContext
    });

    if (!pubRes.isSuccess || pubRes.status !== 'PUBLISHED') {
      throw new Error(`SEED FAILED for ${candidate.Profile_Code}: ${pubRes.errorCode} - ${pubRes.errorMessage}`);
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
