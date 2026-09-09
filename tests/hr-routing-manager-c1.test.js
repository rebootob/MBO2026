import test from 'node:test';
import assert from 'node:assert/strict';

import {
  bindHrRoutingManagerEvents
} from '../src/ui/hr-routing-manager.js';
import {
  HrRoutingManagementService,
  TOPOLOGIES
} from '../src/services/hr-routing-management-service.js';
import { D3_PROCESS_CAPABILITY_ID } from '../src/validation/validation-engine.js';

const HR = Object.freeze({ userCode: 'hr_ui_c1', groups: ['hr'] });
const ADMIN = Object.freeze({ userCode: 'admin_ui_c1', groups: ['admin-form'] });

function createMockElement({ value = '', attributes = {} } = {}) {
  const listeners = new Map();
  return {
    value,
    attributes: { ...attributes },
    addEventListener(event, fn) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(fn);
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
        ? this.attributes[name]
        : null;
    },
    async trigger(event) {
      for (const fn of [...(listeners.get(event) || [])]) {
        await fn({ target: this });
      }
    }
  };
}

function createContainer({
  routeKey = 'KEY',
  topology = TOPOLOGIES.M1_ONLY,
  effectiveFrom = '2026-07-01',
  remark = 'C1 preview'
} = {}) {
  const elements = new Map();
  const slots = [
    createMockElement({
      value: 'm1_user',
      attributes: { 'data-slot': 'M1' }
    })
  ];
  const lists = new Map([['.btn-select-route', []]]);

  const initial = {
    '#hr-route-key': routeKey,
    '#hr-topology-select': topology,
    '#hr-effective-from': effectiveFrom,
    '#hr-effective-to': '',
    '#hr-supersede-effective-to': '',
    '#hr-route-remark': remark,
    '#hr-scorer-midyear': 'M1',
    '#hr-scorer-final1': 'M1',
    '#hr-scorer-final2': ''
  };

  return {
    innerHTML: '',
    querySelector(selector) {
      if (!elements.has(selector)) {
        elements.set(selector, createMockElement({ value: initial[selector] ?? '' }));
      }
      return elements.get(selector);
    },
    querySelectorAll(selector) {
      if (selector === '.slot-input') return slots;
      return lists.get(selector) || [];
    }
  };
}

function routeRecord({
  routingKey = 'KEY',
  versionNumber = 3,
  versionStatus = 'DRAFT',
  revision = '8'
} = {}) {
  return {
    $revision: { value: String(revision) },
    Routing_Key: { value: routingKey },
    Version_Key: { value: `${routingKey}#v${versionNumber}` },
    Version_Number: { value: String(versionNumber) },
    Version_Status: { value: versionStatus },
    Route_Pattern: { value: 'PATTERN_1_M1' },
    Routing_Topology: { value: 'M1_ONLY' },
    Effective_From: { value: '2026-07-01' },
    Effective_To: { value: '' },
    Remark: { value: 'Existing' },
    Scorer_Priority_Slots: { value: '1' },
    Manager_Level1_Approvers: { value: [{ code: 'm1_user' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' }
  };
}

function spyService(calls) {
  return {
    validateRoutingDraft(args) {
      calls.push(['validate', args]);
      return { isValid: true, errors: [], candidate: {} };
    },
    previewRoutingPlan(args) {
      calls.push(['preview', args]);
      return {
        isValid: true,
        topology: args.draft.topology,
        activeSlots: [{ role: 'M1', userCode: 'm1_user' }],
        scorerSlots: args.draft.scorerSlots,
        kExpected: args.kExpected,
        processCapabilityId: args.processCapabilityId,
        versionContext: args.versionContext || {
          kind: 'NEW',
          routingKey: args.draft.routingKey,
          versionKey: 'KEY#v1',
          versionNumber: 1
        },
        warnings: [],
        planPayload: {}
      };
    }
  };
}

test('C1-UI-01 NEW preview propagates exact complete history proof and no existing Version_Key context', async () => {
  const container = createContainer();
  const calls = [];

  bindHrRoutingManagerEvents({
    containerElement: container,
    principal: ADMIN,
    service: spyService(calls),
    initialData: {
      selectedRouteKey: 'KEY',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      remark: 'new preview',
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID,
      versionHistoryCompletenessByRoutingKey: { KEY: true }
    }
  });

  await container.querySelector('#hr-btn-preview').trigger('click');

  assert.equal(calls.length, 2);
  for (const [, args] of calls) {
    assert.deepEqual(args.historyCompleteness, { routingKey: 'KEY', complete: true });
    assert.equal(args.versionContext, undefined);
  }
});

test('C1-UI-02 EXISTING preview propagates exact selected Version_Key and never mixes history proof', async () => {
  const container = createContainer();
  const calls = [];
  const record = routeRecord({ versionNumber: 3 });

  bindHrRoutingManagerEvents({
    containerElement: container,
    principal: ADMIN,
    service: spyService(calls),
    initialData: {
      selectedRouteKey: 'KEY',
      selectedVersionKey: 'KEY#v3',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      remark: 'existing preview',
      routes: [record],
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID,
      versionHistoryCompletenessByRoutingKey: { KEY: true }
    }
  });

  await container.querySelector('#hr-btn-preview').trigger('click');

  assert.equal(calls.length, 2);
  for (const [, args] of calls) {
    assert.deepEqual(args.versionContext, {
      routingKey: 'KEY',
      versionKey: 'KEY#v3'
    });
    assert.equal(args.historyCompleteness, undefined);
  }
});

test('C1-UI-03 manual Routing_Key change clears stale selected Version_Key before preview', async () => {
  const container = createContainer({ routeKey: 'KEY' });
  const calls = [];

  bindHrRoutingManagerEvents({
    containerElement: container,
    principal: ADMIN,
    service: spyService(calls),
    initialData: {
      selectedRouteKey: 'KEY',
      selectedVersionKey: 'KEY#v3',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      routes: [routeRecord({ versionNumber: 3 })],
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID,
      versionHistoryCompletenessByRoutingKey: { NEW_KEY: true }
    }
  });

  container.querySelector('#hr-route-key').value = 'NEW_KEY';
  await container.querySelector('#hr-btn-preview').trigger('click');

  assert.equal(calls.length, 2);
  for (const [, args] of calls) {
    assert.equal(args.versionContext, undefined);
    assert.deepEqual(args.historyCompleteness, {
      routingKey: 'NEW_KEY',
      complete: true
    });
  }
});

test('C1-UI-04 real service NEW preview derives canonical v1 only when UI supplies complete history proof', async () => {
  const container = createContainer();
  const binding = bindHrRoutingManagerEvents({
    containerElement: container,
    principal: HR,
    service: HrRoutingManagementService,
    initialData: {
      selectedRouteKey: 'KEY',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      remark: 'real C1 preview',
      routes: [],
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID,
      versionHistoryCompletenessByRoutingKey: { KEY: true }
    }
  });

  await container.querySelector('#hr-btn-preview').trigger('click');

  const state = binding.getState();
  assert.deepEqual(state.validationErrors, []);
  assert.equal(state.previewResult.isValid, true);
  assert.equal(state.previewResult.versionContext.kind, 'NEW');
  assert.equal(state.previewResult.versionContext.versionKey, 'KEY#v1');
  assert.equal(state.previewResult.planPayload.Version_Key.value, 'KEY#v1');
});

test('C1-UI-05 real service NEW preview without proof remains fail-closed', async () => {
  const container = createContainer();
  const binding = bindHrRoutingManagerEvents({
    containerElement: container,
    principal: HR,
    service: HrRoutingManagementService,
    initialData: {
      selectedRouteKey: 'KEY',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      remark: 'missing proof',
      routes: [],
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }
  });

  await container.querySelector('#hr-btn-preview').trigger('click');

  const state = binding.getState();
  assert.equal(state.previewResult, null);
  assert.ok(
    state.validationErrors.some(message =>
      message.includes('ROUTING_VERSION_CONTEXT_REQUIRED')
    )
  );
});
