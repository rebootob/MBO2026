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

test('validateWorkflowPayloadStructure validates structure without triggering write lock', async () => {
  const { validateWorkflowPayloadStructure } = await import('../src/core/workflow-validator.js');
  const valid = {
    app: 794,
    enable: true,
    states: {
      Draft: { name: 'Draft', index: '0', assignee: { type: 'ONE', entities: [] } },
      Review: { name: 'Review', index: '1', assignee: { type: 'ALL', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_Level1_Approvers' } }] } }
    },
    actions: [{ name: 'Submit', from: 'Draft', to: 'Review', filterCond: '' }]
  };
  assert.equal(validateWorkflowPayloadStructure(valid, fields), true);
});

test('validateWorkflowPayloadStructure rejects invalid state, action, or assignee field', async () => {
  const { validateWorkflowPayloadStructure } = await import('../src/core/workflow-validator.js');
  assert.throws(() => validateWorkflowPayloadStructure(null, fields), /Invalid workflow root payload/);
  assert.throws(() => validateWorkflowPayloadStructure({ enable: 'not-bool' }, fields), /Invalid workflow root payload/);
  assert.throws(() => validateWorkflowPayloadStructure({
    enable: true,
    states: { Draft: { name: 'Draft', index: '0', assignee: { type: 'INVALID', entities: [] } } },
    actions: []
  }, fields), /Invalid state: Draft/);
  assert.throws(() => validateWorkflowPayloadStructure({
    enable: true,
    states: {
      Draft: { name: 'Draft', index: '0', assignee: { type: 'ONE', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Unknown_Field' } }] } }
    },
    actions: []
  }, fields), /Invalid assignee field: Unknown_Field/);
  assert.throws(() => validateWorkflowPayloadStructure({
    enable: true,
    states: { Draft: { name: 'Draft', index: '0', assignee: { type: 'ONE', entities: [] } } },
    actions: [{ name: 'Bad', from: 'Draft', to: 'NonExistent', filterCond: '' }]
  }, fields), /Invalid action: Bad/);
});
