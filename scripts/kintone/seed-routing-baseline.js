import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

delete process.env.KINTONE_API_TOKEN;

export const APPROVED_ROUTING_BASELINE_MANIFEST = [
  { sectionCode: 'TMF1', sectionName: 'Manufacturing Section 1', requesterUser: 'f1' },
  { sectionCode: 'TMF2', sectionName: 'Manufacturing Section 2', requesterUser: 'f2' },
  { sectionCode: 'TMF3', sectionName: 'Manufacturing Section 3', requesterUser: 'f3' },
  { sectionCode: 'TMG1', sectionName: 'General Admin Section 1', requesterUser: 'g_request' },
  { sectionCode: 'TMG2', sectionName: 'General Admin Section 2', requesterUser: 'g_request' },
  { sectionCode: 'TMH1', sectionName: 'HR & Admin Section 1', requesterUser: 'tmh' },
  { sectionCode: 'TMH2', sectionName: 'HR & Admin Section 2', requesterUser: 'tmh' },
  { sectionCode: 'TMH3', sectionName: 'HR & Admin Section 3', requesterUser: 'tmh' },
  { sectionCode: 'TMS1', sectionName: 'Sales Section 1', requesterUser: 's1' },
  { sectionCode: 'TMT1', sectionName: 'Technology Section 1', requesterUser: 't1' },
  { sectionCode: 'TMT2', sectionName: 'Technology Section 2', requesterUser: 't2' }
];

export function validateRoutingSeedManifest(manifest) {
  if (!Array.isArray(manifest) || manifest.length !== 11) {
    throw new Error(`ROUTING MANIFEST INVALID: Expected exactly 11 items, got ${manifest?.length}`);
  }

  const seenCodes = new Set();
  const allowedUsers = new Set(['f1', 'f2', 'f3', 'g_request', 'tmh', 's1', 't1', 't2']);

  for (const item of manifest) {
    if (!item || typeof item !== 'object') {
      throw new Error('ROUTING MANIFEST INVALID: Item must be a plain object');
    }
    const { sectionCode, sectionName, requesterUser } = item;

    if (!sectionCode || typeof sectionCode !== 'string' || sectionCode.trim() === '') {
      throw new Error('ROUTING MANIFEST INVALID: Section_Code must be non-empty string');
    }
    if (sectionCode === 'TME1') {
      throw new Error('ROUTING MANIFEST INVALID: TME1 is the existing pilot and must not be in seed manifest');
    }
    if (sectionCode === 'TMT3') {
      throw new Error('ROUTING MANIFEST INVALID: TMT3 is retired and must not be in seed manifest');
    }
    if (seenCodes.has(sectionCode)) {
      throw new Error(`ROUTING MANIFEST INVALID: Duplicate Section_Code '${sectionCode}' in manifest`);
    }
    seenCodes.add(sectionCode);

    if (!sectionName || typeof sectionName !== 'string' || sectionName.trim() === '') {
      throw new Error(`ROUTING MANIFEST INVALID: Section_Name for '${sectionCode}' must be non-empty string`);
    }
    if (!requesterUser || typeof requesterUser !== 'string' || !allowedUsers.has(requesterUser)) {
      throw new Error(`ROUTING MANIFEST INVALID: Requester_User '${requesterUser}' for '${sectionCode}' is not in approved requester list`);
    }
  }

  return true;
}

export function createNarrowRoutingTransport(appId = 795, connection = null, registry = null) {
  return async function narrowTransport(relPath, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const body = opts.body;

    if (method === 'DELETE' || method === 'PATCH' || method === 'PUT') {
      throw new Error(`NARROW ROUTING TRANSPORT BLOCKED: Method ${method} is strictly prohibited.`);
    }

    const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
    const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;
    const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;

    const writeGuard = await import(writeGuardPath);
    const m = await import(clientPath);
    const sandboxRegistry = registry || (await import(sandboxAppsPath, { with: { type: 'json' } })).default;

    if (method === 'POST') {
      if (relPath !== '/k/v1/record.json') {
        throw new Error(`NARROW ROUTING TRANSPORT BLOCKED: POST target must be '/k/v1/record.json', got '${relPath}'`);
      }
      if (!body || Number(body.app) !== appId) {
        throw new Error(`NARROW ROUTING TRANSPORT BLOCKED: Write target body.app must be App ${appId}.`);
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

export function createNarrowRollbackTransport(appId = 795, connection = null, registry = null) {
  return async function narrowRollbackTransport(relPath, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const body = opts.body;

    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      throw new Error(`NARROW ROLLBACK TRANSPORT BLOCKED: Method ${method} is strictly prohibited.`);
    }

    const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
    const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;
    const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;

    const writeGuard = await import(writeGuardPath);
    const m = await import(clientPath);
    const sandboxRegistry = registry || (await import(sandboxAppsPath, { with: { type: 'json' } })).default;

    if (method === 'DELETE') {
      if (!relPath.startsWith('/k/v1/records.json')) {
        throw new Error(`NARROW ROLLBACK TRANSPORT BLOCKED: DELETE target must be '/k/v1/records.json', got '${relPath}'`);
      }
      if (!body || Number(body.app) !== appId) {
        throw new Error(`NARROW ROLLBACK TRANSPORT BLOCKED: Write target body.app must be App ${appId}.`);
      }
      if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 11) {
        throw new Error(`NARROW ROLLBACK TRANSPORT BLOCKED: DELETE body.ids must be non-empty array up to 11 IDs.`);
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

export async function executeRoutingSeed({ overrideTransport, overrideManifest } = {}) {
  delete process.env.KINTONE_API_TOKEN;

  const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;
  const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
  const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;

  const m = await import(clientPath);
  const writeGuard = await import(writeGuardPath);
  const sandboxRegistry = (await import(sandboxAppsPath, { with: { type: 'json' } })).default;

  const appId795 = sandboxRegistry.routingMasterAppId || 795;
  console.log(`Targeting Routing Master App ID: ${appId795}`);

  writeGuard.assertSandboxWriteTarget(appId795, sandboxRegistry, [appId795], { dryRunBypassDiscovery: true });

  const manifest = overrideManifest || APPROVED_ROUTING_BASELINE_MANIFEST;
  validateRoutingSeedManifest(manifest);

  const connection = overrideTransport ? null : m.getAppCreationConnection();
  const liveTransport = overrideTransport || createNarrowRoutingTransport(appId795, connection, sandboxRegistry);

  // STEP 2 PREFLIGHT
  console.log(`Performing App ${appId795} preflight inspection...`);
  const initialRes = await liveTransport(`/k/v1/records.json?app=${appId795}&query=limit%20500`);
  const initialRecords = initialRes?.records || [];
  const initialActive = initialRecords.filter(r => r.Active?.value === 'Active');

  if (initialActive.length !== 1) {
    throw new Error(`SEED BLOCKED: Expected active coverage 1/12 before seed, got ${initialActive.length}`);
  }

  const tme1Record = initialActive.find(r => r.Section_Code?.value === 'TME1');
  if (!tme1Record || tme1Record.Requester_User?.value?.[0]?.code !== 'e1') {
    throw new Error('SEED BLOCKED: Existing TME1 pilot record is missing or mutated');
  }

  for (const item of manifest) {
    const existing = initialActive.find(r => r.Section_Code?.value === item.sectionCode);
    if (existing) {
      throw new Error(`SEED BLOCKED: Section '${item.sectionCode}' already exists in active records`);
    }
  }

  console.log(`Starting controlled seed of 11 routing baseline records to App ${appId795}...`);

  let postCount = 0;
  const createdRecordIds = [];

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    console.log(`[${i + 1}/11] Creating routing record ${item.sectionCode} (${item.sectionName} -> ${item.requesterUser})...`);

    // Strictly REQUIRES requester-only payload without unverified hardcoded approver slots
    const recordBody = {
      app: appId795,
      record: {
        Section_Code: { value: item.sectionCode },
        Section_Name: { value: item.sectionName },
        Requester_User: { value: [{ code: item.requesterUser }] },
        Active: { value: 'Active' }
      }
    };

    const res = await liveTransport('/k/v1/record.json', {
      method: 'POST',
      body: recordBody
    });

    if (!res || !res.id) {
      throw new Error(`POST FAILED for ${item.sectionCode}: Response missing record id`);
    }

    postCount++;
    createdRecordIds.push(res.id);
    console.log(`Created ${item.sectionCode} -> Record ID: ${res.id}`);
  }

  // STEP 8 READBACK VERIFICATION
  console.log('\nVerifying final live App 795 records...');
  const finalRes = await liveTransport(`/k/v1/records.json?app=${appId795}&query=limit%20500`);
  const finalRecords = finalRes?.records || [];
  const finalActive = finalRecords.filter(r => r.Active?.value === 'Active');

  if (finalActive.length !== 12) {
    throw new Error(`FINAL READBACK FAILED: Expected 12 active records, got ${finalActive.length}`);
  }

  const activeCodes = new Set(finalActive.map(r => r.Section_Code?.value));
  if (activeCodes.size !== 12) {
    throw new Error(`FINAL READBACK FAILED: Expected 12 unique active section codes, got ${activeCodes.size}`);
  }

  if (activeCodes.has('TMT3')) {
    throw new Error('FINAL READBACK FAILED: Retired section TMT3 is present in active records');
  }

  const expectedAllCodes = ['TME1', ...manifest.map(m => m.sectionCode)];
  for (const code of expectedAllCodes) {
    if (!activeCodes.has(code)) {
      throw new Error(`FINAL READBACK FAILED: Required active section '${code}' is missing`);
    }
  }

  console.log('SUCCESS: All 12 active routing baseline records verified on live App 795!');
  return { postCount, createdRecordIds, totalActive: finalActive.length };
}

export async function executeRoutingRollback({ targetRecordIds, overrideTransport } = {}) {
  delete process.env.KINTONE_API_TOKEN;

  if (!Array.isArray(targetRecordIds) || targetRecordIds.length !== 11) {
    throw new Error(`ROLLBACK BLOCKED: Expected exactly 11 target record IDs, got ${targetRecordIds?.length}`);
  }

  const strTargetIds = targetRecordIds.map(id => String(id));

  // TME1 ID check (Record ID 1 must be preserved)
  if (strTargetIds.includes('1')) {
    throw new Error('ROLLBACK BLOCKED: TME1 record ID (1) is prohibited from deletion.');
  }

  const clientPath = pathToFileURL(path.resolve('src/core/kintone-client.js')).href;
  const writeGuardPath = pathToFileURL(path.resolve('src/core/sandbox-write-guard.js')).href;
  const sandboxAppsPath = pathToFileURL(path.resolve('config/sandbox-apps.json')).href;

  const m = await import(clientPath);
  const writeGuard = await import(writeGuardPath);
  const sandboxRegistry = (await import(sandboxAppsPath, { with: { type: 'json' } })).default;

  const appId795 = sandboxRegistry.routingMasterAppId || 795;
  console.log(`Targeting Routing Master App ID ${appId795} for exact rollback DELETE of 11 records...`);

  writeGuard.assertSandboxWriteTarget(appId795, sandboxRegistry, [appId795], { dryRunBypassDiscovery: true });

  const connection = overrideTransport ? null : m.getAppCreationConnection();
  const liveTransport = overrideTransport || createNarrowRollbackTransport(appId795, connection, sandboxRegistry);

  // Preflight check
  console.log(`Performing pre-rollback inspection on App ${appId795}...`);
  const initialRes = await liveTransport(`/k/v1/records.json?app=${appId795}&query=limit%20500`);
  const initialRecords = initialRes?.records || [];
  const initialRecordIds = new Set(initialRecords.map(r => String(r.$id.value)));

  for (const id of strTargetIds) {
    if (!initialRecordIds.has(id)) {
      throw new Error(`ROLLBACK BLOCKED: Target record ID ${id} does not exist in App ${appId795}`);
    }
  }

  // Construct query string for DELETE request
  const idsQuery = strTargetIds.map((id, idx) => `ids[${idx}]=${encodeURIComponent(id)}`).join('&');
  const deleteUrl = `/k/v1/records.json?app=${appId795}&${idsQuery}`;

  console.log(`Executing exact DELETE of 11 records on App ${appId795}...`);
  const deleteRes = await liveTransport(deleteUrl, {
    method: 'DELETE',
    body: {
      app: appId795,
      ids: strTargetIds
    }
  });

  // Post-rollback readback verification
  console.log('\nPerforming post-rollback readback verification on App 795...');
  const finalRes = await liveTransport(`/k/v1/records.json?app=${appId795}&query=limit%20500`);
  const finalRecords = finalRes?.records || [];
  const finalActive = finalRecords.filter(r => r.Active?.value === 'Active');

  if (finalActive.length !== 1) {
    throw new Error(`POST-ROLLBACK VERIFICATION FAILED: Expected active coverage 1/12 (TME1 pilot), got ${finalActive.length}`);
  }

  const tme1Record = finalActive[0];
  if (tme1Record.Section_Code?.value !== 'TME1' || tme1Record.Requester_User?.value?.[0]?.code !== 'e1') {
    throw new Error('POST-ROLLBACK VERIFICATION FAILED: TME1 pilot record was mutated or deleted');
  }

  const target11Codes = ['TMF1', 'TMF2', 'TMF3', 'TMG1', 'TMG2', 'TMH1', 'TMH2', 'TMH3', 'TMS1', 'TMT1', 'TMT2'];
  for (const code of target11Codes) {
    const found = finalActive.find(r => r.Section_Code?.value === code);
    if (found) {
      throw new Error(`POST-ROLLBACK VERIFICATION FAILED: Rollback target section '${code}' still present in active records`);
    }
  }

  console.log('SUCCESS: Exact rollback completed and verified! Restored App 795 active coverage to 1/12 (TME1 pilot preserved).');
  return { deletedCount: strTargetIds.length, postRollbackActiveCount: finalActive.length };
}

if (process.argv[1] && process.argv[1].endsWith('seed-routing-baseline.js')) {
  executeRoutingSeed().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
