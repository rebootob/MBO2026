import fs from 'node:fs/promises';
import path from 'node:path';
import { getKintoneConnection } from '../../src/core/kintone-client.js';

const PAGE_SIZE = 500;
const MAX_OFFSET_EXPORT = 10000;

function usage() {
  console.log(`\nKintone App Info Exporter (READ ONLY)\n\nUsage:\n  node --env-file-if-exists=.env.local scripts/kintone/get-app-info.js <appId...> [options]\n\nExamples:\n  node --env-file-if-exists=.env.local scripts/kintone/get-app-info.js 794\n  node --env-file-if-exists=.env.local scripts/kintone/get-app-info.js 53 794 795 796 797 800 801\n  node --env-file-if-exists=.env.local scripts/kintone/get-app-info.js 283 305 307 310 640 643 715 716 --records=all\n  node --env-file-if-exists=.env.local scripts/kintone/get-app-info.js 794 --records=sample --sample=20\n\nOptions:\n  --records=none    metadata only (default)\n  --records=sample  export first N records\n  --records=all     export all records up to 10,000\n  --sample=N        sample size, 1..500 (default 20)\n  --out=PATH        output root (default app-info)\n  --help            show help\n\nSafety: GET only. No POST/PUT/DELETE/deploy exists in this script.\n`);
}

function parseArgs(argv) {
  const appIds = [];
  let recordsMode = 'none';
  let sampleSize = 20;
  let outRoot = 'app-info';
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') return { help: true, appIds, recordsMode, sampleSize, outRoot };
    if (arg.startsWith('--records=')) {
      recordsMode = arg.slice(10);
      if (!['none', 'sample', 'all'].includes(recordsMode)) throw new Error(`Invalid --records mode: ${recordsMode}`);
      continue;
    }
    if (arg.startsWith('--sample=')) {
      sampleSize = Number(arg.slice(9));
      if (!Number.isSafeInteger(sampleSize) || sampleSize < 1 || sampleSize > 500) throw new Error('--sample must be 1..500');
      continue;
    }
    if (arg.startsWith('--out=')) {
      outRoot = arg.slice(6).trim();
      if (!outRoot) throw new Error('--out cannot be blank');
      continue;
    }
    if (!/^[1-9]\d*$/.test(arg)) throw new Error(`Invalid App ID/option: ${arg}`);
    appIds.push(Number(arg));
  }
  return { help: false, appIds: [...new Set(appIds)], recordsMode, sampleSize, outRoot };
}

async function getJson(baseUrl, headers, apiPath) {
  const response = await fetch(`${baseUrl}${apiPath}`, { method: 'GET', headers: { ...headers } });
  let payload = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}${payload?.code ? ` ${payload.code}` : ''}${payload?.message ? `: ${payload.message}` : ''}`);
  }
  return payload;
}

function endpoints(appId) {
  const app = encodeURIComponent(String(appId));
  return [
    ['app', `/k/v1/app.json?id=${app}`],
    ['settings', `/k/v1/app/settings.json?app=${app}`],
    ['fields', `/k/v1/app/form/fields.json?app=${app}`],
    ['layout', `/k/v1/app/form/layout.json?app=${app}`],
    ['process', `/k/v1/app/status.json?app=${app}`],
    ['app-acl', `/k/v1/app/acl.json?app=${app}`],
    ['record-acl', `/k/v1/record/acl.json?app=${app}`],
    ['field-acl', `/k/v1/field/acl.json?app=${app}`],
    ['views', `/k/v1/app/views.json?app=${app}`],
    ['customize', `/k/v1/app/customize.json?app=${app}`],
    ['actions', `/k/v1/app/actions.json?app=${app}`],
    ['notifications-general', `/k/v1/app/notifications/general.json?app=${app}`],
    ['notifications-per-record', `/k/v1/app/notifications/perRecord.json?app=${app}`],
    ['notifications-reminder', `/k/v1/app/notifications/reminder.json?app=${app}`]
  ];
}

async function getRecordCount(baseUrl, headers, appId) {
  const q = encodeURIComponent('order by $id asc limit 1');
  const p = await getJson(baseUrl, headers, `/k/v1/records.json?app=${appId}&query=${q}&totalCount=true`);
  return Number(p.totalCount ?? 0);
}

async function getRecords(baseUrl, headers, appId, mode, sampleSize, totalCount) {
  if (mode === 'none') return null;
  if (mode === 'sample') {
    const q = encodeURIComponent(`order by $id asc limit ${sampleSize}`);
    const p = await getJson(baseUrl, headers, `/k/v1/records.json?app=${appId}&query=${q}&totalCount=true`);
    return { mode, totalCount: Number(p.totalCount ?? totalCount), exportedCount: p.records?.length ?? 0, complete: Number(p.totalCount ?? totalCount) <= sampleSize, records: p.records ?? [] };
  }
  if (totalCount > MAX_OFFSET_EXPORT) throw new Error(`App ${appId} has ${totalCount} records (> ${MAX_OFFSET_EXPORT}). Use Kintone CSV export instead.`);
  const records = [];
  for (let offset = 0; offset < totalCount || offset === 0; offset += PAGE_SIZE) {
    const q = encodeURIComponent(`order by $id asc limit ${PAGE_SIZE} offset ${offset}`);
    const p = await getJson(baseUrl, headers, `/k/v1/records.json?app=${appId}&query=${q}&totalCount=true`);
    const page = p.records ?? [];
    records.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return { mode, totalCount, exportedCount: records.length, complete: records.length === totalCount, records };
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function exportApp({ baseUrl, headers, appId, recordsMode, sampleSize, outRoot }) {
  const dir = path.resolve(outRoot, String(appId));
  await fs.mkdir(dir, { recursive: true });
  const results = {};
  const errors = {};

  for (const [name, apiPath] of endpoints(appId)) {
    try {
      const payload = await getJson(baseUrl, headers, apiPath);
      results[name] = payload;
      await writeJson(path.join(dir, `${name}.json`), payload);
      console.log(`[${appId}] ${name}: PASS`);
    } catch (error) {
      errors[name] = error.message;
      console.log(`[${appId}] ${name}: SKIP/ERROR - ${error.message}`);
    }
  }

  let totalCount = null;
  try {
    totalCount = await getRecordCount(baseUrl, headers, appId);
    await writeJson(path.join(dir, 'record-count.json'), { appId, totalCount });
    console.log(`[${appId}] record-count: ${totalCount}`);
  } catch (error) {
    errors['record-count'] = error.message;
  }

  let recordExport = null;
  if (recordsMode !== 'none' && totalCount !== null) {
    try {
      recordExport = await getRecords(baseUrl, headers, appId, recordsMode, sampleSize, totalCount);
      await writeJson(path.join(dir, 'records.json'), recordExport);
      console.log(`[${appId}] records: ${recordExport.exportedCount}/${recordExport.totalCount}`);
    } catch (error) {
      errors.records = error.message;
      console.log(`[${appId}] records: ERROR - ${error.message}`);
    }
  }

  await writeJson(path.join(dir, 'errors.json'), errors);
  const summary = {
    appId,
    appName: results.settings?.name ?? results.app?.name ?? 'UNKNOWN',
    revision: results.settings?.revision ?? results.fields?.revision ?? 'UNKNOWN',
    fieldCount: Object.keys(results.fields?.properties ?? {}).length,
    processStatusCount: Object.keys(results.process?.states ?? {}).length,
    processActionCount: Object.keys(results.process?.actions ?? {}).length,
    viewCount: Object.keys(results.views?.views ?? {}).length,
    totalCount,
    recordsMode,
    recordsExported: recordExport?.exportedCount ?? 0,
    recordsComplete: recordExport?.complete ?? null,
    endpointErrors: errors,
    safety: 'GET_ONLY_NO_POST_PUT_DELETE_DEPLOY'
  };
  await writeJson(path.join(dir, 'SUMMARY.json'), summary);
  return summary;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.appIds.length === 0) {
    usage();
    if (!args.help) process.exitCode = 1;
  } else {
    const { baseUrl, headers } = getKintoneConnection();
    console.log(`READ-ONLY export starting for Apps: ${args.appIds.join(', ')}`);
    console.log(`Output: ${path.resolve(args.outRoot)}`);
    console.log(`Records mode: ${args.recordsMode}`);
    const summaries = [];
    for (const appId of args.appIds) {
      console.log(`\n=== App ${appId} ===`);
      summaries.push(await exportApp({ baseUrl, headers, appId, ...args }));
    }
    await fs.mkdir(path.resolve(args.outRoot), { recursive: true });
    await writeJson(path.resolve(args.outRoot, '_INDEX.json'), {
      exportedAt: new Date().toISOString(),
      safety: 'GET_ONLY_NO_POST_PUT_DELETE_DEPLOY',
      apps: summaries
    });
    console.log('\nDONE. Send the generated app-info folder/ZIP to ChatGPT for analysis.');
  }
} catch (error) {
  console.error(`FAILED: ${error.message}`);
  process.exitCode = 1;
}
