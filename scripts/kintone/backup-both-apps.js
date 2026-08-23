import fs from 'node:fs';
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const ROUTING_APP_ID = 795;
const MBO_APP_ID = 794;

assertSandboxWriteTarget(ROUTING_APP_ID);
assertSandboxWriteTarget(MBO_APP_ID);

const backupDir = 'backups';
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const timestamp = Date.now();

// 1. Backup App 795
const app795Data = await kintoneRequest(`/k/v1/records.json?app=${ROUTING_APP_ID}`);
const path795 = `${backupDir}/app795_backup_${timestamp}.json`;
fs.writeFileSync(path795, JSON.stringify(app795Data, null, 2), 'utf8');
console.log(`App 795 backed up to ${path795} (Count: ${app795Data.records.length})`);

// 2. Backup App 794
const app794Data = await kintoneRequest(`/k/v1/records.json?app=${MBO_APP_ID}`);
const path794 = `${backupDir}/app794_backup_${timestamp}.json`;
fs.writeFileSync(path794, JSON.stringify(app794Data, null, 2), 'utf8');
console.log(`App 794 backed up to ${path794} (Count: ${app794Data.records.length})`);
