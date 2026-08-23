import { mkdir, writeFile } from 'node:fs/promises';
import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { kintoneRequest } from '../../src/core/kintone-client.js';
import { validateWorkflowPayload } from '../../src/core/workflow-validator.js';

const app = sandboxRegistry.mboV2AppId;
const [fields, current] = await Promise.all([kintoneRequest(`/k/v1/preview/app/form/fields.json?app=${app}`), kintoneRequest(`/k/v1/preview/app/status.json?app=${app}`)]);
const fieldTypes = Object.fromEntries(Object.entries(fields.properties).map(([code, field]) => [code, field.type]));
const state = (name, index, code) => ({ name, index: String(index), assignee: { type: 'ONE', entities: code ? [{ entity: { type: 'FIELD_ENTITY', code }, includeSubs: false }] : [] } });
const payload = { app, enable: true, revision: current.revision, states: { 'Not started': state('Not started', 0), 'Manager Objective Review': state('Manager Objective Review', 1, 'Manager_User'), Completed: state('Completed', 2) }, actions: [{ name: 'Submit Objective', from: 'Not started', to: 'Manager Objective Review', filterCond: '' }, { name: 'Complete', from: 'Manager Objective Review', to: 'Completed', filterCond: '' }] };
validateWorkflowPayload(payload, fieldTypes);
await mkdir('debug', { recursive: true });
await writeFile('debug/workflow-minimal-payload.json', `${JSON.stringify(payload, null, 2)}\n`);
await kintoneRequest('/k/v1/preview/app/status.json', { method: 'PUT', body: payload });
console.log('Minimal workflow preview PUT passed.');
