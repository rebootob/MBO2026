import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkflowPayload } from '../src/core/workflow-validator.js';
const fields = { Manager_User: 'USER_SELECT' };
const good = { app: 794, enable: true, states: { Draft: { name: 'Draft', index: '0', assignee: { type: 'ONE', entities: [] } }, Review: { name: 'Review', index: '1', assignee: { type: 'ONE', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_User' } }] } } }, actions: [{ name: 'Submit', from: 'Draft', to: 'Review', filterCond: '' }] };
test('accepts valid sandbox workflow', () => assert.equal(validateWorkflowPayload(good, fields), true));
test('rejects invalid action reference', () => assert.throws(() => validateWorkflowPayload({ ...good, actions: [{ ...good.actions[0], to: 'Missing' }] }, fields)));
test('rejects invalid assignee field', () => assert.throws(() => validateWorkflowPayload({ ...good, states: { ...good.states, Review: { ...good.states.Review, assignee: { type: 'ONE', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Nope' } }] } } } }, fields)));
test('rejects protected app workflow', () => assert.throws(() => validateWorkflowPayload({ ...good, app: 53 }, fields)));

