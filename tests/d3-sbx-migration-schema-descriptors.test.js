import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json' with { type: 'json' };

import {
  buildApp795SchemaStages,
  buildApp794ProvenancePlan,
  APP794_PROVENANCE_FIELD_CODES
} from '../scripts/kintone/d3-sbx-migration-local-executor-core.js';
import {
  createD3KintoneIoAdapter,
  D3_BINDING_ENDPOINTS
} from '../scripts/kintone/d3-sbx-migration-live-binding.js';

// Minimal legacy fixture schemas
const app795LegacySchema = Object.freeze({
  revision: '11',
  fields: {
    Routing_Key: { type: 'SINGLE_LINE_TEXT', label: 'Routing Key', required: true, unique: false },
    Requester_User: { type: 'USER_SELECT', label: 'Requester User', required: true },
    Manager_Level1_Approvers: { type: 'USER_SELECT', label: 'Manager Level 1 Approvers' },
    Manager_Level1_Approval_Rule: { type: 'DROP_DOWN', label: 'Manager Level 1 Approval Rule', defaultValue: 'ALL' },
    Manager_Level2_Approvers: { type: 'USER_SELECT', label: 'Manager Level 2 Approvers' },
    Manager_Level2_Approval_Rule: { type: 'DROP_DOWN', label: 'Manager Level 2 Approval Rule', defaultValue: 'ALL' },
    GM_Level1_Approvers: { type: 'USER_SELECT', label: 'GM Level 1 Approvers' },
    GM_Level1_Approval_Rule: { type: 'DROP_DOWN', label: 'GM Level 1 Approval Rule', defaultValue: 'ALL' },
    GM_Level2_Approvers: { type: 'USER_SELECT', label: 'GM Level 2 Approvers' },
    GM_Level2_Approval_Rule: { type: 'DROP_DOWN', label: 'GM Level 2 Approval Rule', defaultValue: 'ALL' },
    Active: { type: 'RADIO_BUTTON', label: 'Active', required: true, defaultValue: 'Active' },
    Effective_From: { type: 'DATE', label: 'Effective From', required: true },
    Effective_To: { type: 'DATE', label: 'Effective To', required: false },
    Remark: { type: 'MULTI_LINE_TEXT', label: 'Remark' }
  }
});

const app794LegacySchema = Object.freeze({
  revision: '70',
  fields: {
    Fiscal_Year: { type: 'SINGLE_LINE_TEXT', label: 'Fiscal Year', required: true },
    Employee_Code: { type: 'SINGLE_LINE_TEXT', label: 'Employee Code', required: true }
  }
});

const backup = appId => ({
  appId,
  captured: true,
  verified: true,
  sha256: 'a'.repeat(64),
  artifactPath: `TEST_ONLY/app${appId}-backup.json`
});

test('every generated App795 property descriptor in schema stages contains spec.code === fieldCode', () => {
  const plan = buildApp795SchemaStages({
    currentSchema: app795LegacySchema,
    manifest,
    backupEvidence: backup(795)
  });

  const stagedOptionalStage = plan.stages.find(s => s.id === 'STAGE_OPTIONAL_FIELD_ADDITIONS');
  assert.ok(stagedOptionalStage);
  assert.ok(stagedOptionalStage.operations.length > 0);

  for (const op of stagedOptionalStage.operations) {
    assert.equal(op.spec.code, op.fieldCode, `Expected op.spec.code === ${op.fieldCode}`);
    assert.equal(typeof op.spec.code, 'string');
    assert.equal(op.spec.code.length > 0, true);
  }

  const finalizationStage = plan.stages.find(s => s.id === 'STAGE_FINAL_FIELD_PROPERTIES');
  assert.ok(finalizationStage);
  assert.ok(finalizationStage.operations.length > 0);

  for (const op of finalizationStage.operations) {
    assert.equal(op.target.code, op.fieldCode, `Expected op.target.code === ${op.fieldCode}`);
    assert.equal(typeof op.target.code, 'string');
    assert.equal(op.target.code.length > 0, true);
  }
});

test('App795 staged schema covers all required new fields with exact internal code property', () => {
  const plan = buildApp795SchemaStages({
    currentSchema: app795LegacySchema,
    manifest,
    backupEvidence: backup(795)
  });

  const stagedOps = plan.stages.find(s => s.id === 'STAGE_OPTIONAL_FIELD_ADDITIONS').operations;
  const coveredFieldCodes = stagedOps.map(op => op.fieldCode);

  const requiredAdditions = [
    'Version_Key',
    'Version_Number',
    'Version_Status',
    'Route_Pattern',
    'Scorer_Priority_Slots'
  ];

  for (const requiredCode of requiredAdditions) {
    assert.ok(coveredFieldCodes.includes(requiredCode), `Missing required fieldCode: ${requiredCode}`);
    const op = stagedOps.find(o => o.fieldCode === requiredCode);
    assert.equal(op.spec.code, requiredCode);
  }
});

test('payload passed to preview fields endpoint contains matching object key and internal code for all fields', async () => {
  const calls = [];
  const transport = {
    async request(spec) {
      calls.push(spec);
      return { revision: '12' };
    }
  };

  const io = createD3KintoneIoAdapter({
    transport,
    readAppSnapshot: async () => ({})
  });

  const plan = buildApp795SchemaStages({
    currentSchema: app795LegacySchema,
    manifest,
    backupEvidence: backup(795)
  });

  const stagedOps = plan.stages.find(s => s.id === 'STAGE_OPTIONAL_FIELD_ADDITIONS').operations;

  // Stage optional fields (POST)
  await io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '11',
    phase: 'APP795_STAGE_OPTIONAL_FIELDS',
    operations: stagedOps
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].path, D3_BINDING_ENDPOINTS.previewFields);

  const postProperties = calls[0].body.properties;
  for (const [key, descriptor] of Object.entries(postProperties)) {
    assert.equal(descriptor.code, key, `Property ${key} must have descriptor.code === ${key}`);
    assert.equal(descriptor.required, false, `Staged optional property ${key} must have required === false`);
  }

  // Finalize properties (PUT)
  const finalizeOps = plan.stages.find(s => s.id === 'STAGE_FINAL_FIELD_PROPERTIES').operations;
  await io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '12',
    phase: 'APP795_FINALIZE_FIELD_PROPERTIES',
    operations: finalizeOps
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[1].method, 'PUT');
  assert.equal(calls[1].path, D3_BINDING_ENDPOINTS.previewFields);

  const putProperties = calls[1].body.properties;
  for (const [key, descriptor] of Object.entries(putProperties)) {
    assert.equal(descriptor.code, key, `Finalized property ${key} must have descriptor.code === ${key}`);
  }
});

test('App794 provenance plan generates descriptors with spec.code === fieldCode for all 5 provenance fields', () => {
  const plan = buildApp794ProvenancePlan({
    currentSchema: app794LegacySchema,
    existingRecords: [{ $id: { value: '1' } }],
    policy: {
      mode: 'DEFER_REQUIREDNESS_NO_BACKFILL',
      explicitlyResolved: true,
      decisionRef: 'project-docs/D3_SBX_MIGRATION_01_BD1.md'
    },
    backupEvidence: backup(794)
  });

  assert.equal(plan.additions.length, 5);
  for (const addition of plan.additions) {
    assert.ok(APP794_PROVENANCE_FIELD_CODES.includes(addition.fieldCode));
    assert.equal(addition.spec.code, addition.fieldCode);
    assert.equal(addition.spec.required, false);
  }
});

test('App794 provenance fields payload sent to stageFormSchema contains exact code properties', async () => {
  const calls = [];
  const transport = {
    async request(spec) {
      calls.push(spec);
      return { revision: '71' };
    }
  };

  const io = createD3KintoneIoAdapter({
    transport,
    readAppSnapshot: async () => ({})
  });

  const plan = buildApp794ProvenancePlan({
    currentSchema: app794LegacySchema,
    existingRecords: [{ $id: { value: '1' } }],
    policy: {
      mode: 'DEFER_REQUIREDNESS_NO_BACKFILL',
      explicitlyResolved: true,
      decisionRef: 'project-docs/D3_SBX_MIGRATION_01_BD1.md'
    },
    backupEvidence: backup(794)
  });

  await io.stageFormSchema({
    appId: 794,
    expectedLiveRevision: '70',
    phase: 'APP794_STAGE_PROVENANCE_FIELDS',
    operations: plan.additions
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].path, D3_BINDING_ENDPOINTS.previewFields);

  const properties = calls[0].body.properties;
  for (const fieldCode of APP794_PROVENANCE_FIELD_CODES) {
    assert.ok(properties[fieldCode], `Expected property ${fieldCode} in payload`);
    assert.equal(properties[fieldCode].code, fieldCode);
    assert.equal(properties[fieldCode].required, false);
  }
});
