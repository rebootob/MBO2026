import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkflowPayload } from '../src/core/workflow-validator.js';

const fields = { Manager_Level1_Approvers: 'USER_SELECT' };

test('rejects non-GET workflow operations during Discovery Phase', () => {
  const good = {
    app: 794,
    enable: true,
    states: {
      Draft: { name: 'Draft', index: '0', assignee: { type: 'ONE', entities: [] } },
      Review: { name: 'Review', index: '1', assignee: { type: 'ONE', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_Level1_Approvers' } }] } }
    },
    actions: [{ name: 'Submit', from: 'Draft', to: 'Review', filterCond: '' }]
  };
  assert.throws(() => validateWorkflowPayload(good, fields), /DISCOVERY PHASE WRITE BLOCKED/);
});

test('rejects invalid action reference', () => {
  const badAction = {
    app: 794,
    enable: true,
    states: { Draft: { name: 'Draft', index: '0' } },
    actions: [{ name: 'Submit', from: 'Draft', to: 'MissingState', filterCond: '' }]
  };
  assert.throws(() => validateWorkflowPayload(badAction, fields));
});

test('rejects protected app workflow', () => {
  const protectedApp = { app: 283, enable: true, states: {}, actions: [] };
  assert.throws(() => validateWorkflowPayload(protectedApp, fields));
});
