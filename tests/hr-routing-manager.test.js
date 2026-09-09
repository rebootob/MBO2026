import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import {
  renderHrRoutingManagerHtml,
  bindHrRoutingManagerEvents,
  TOPOLOGY_OPTIONS,
  getRequiredSlotsForTopology
} from '../src/ui/hr-routing-manager.js';
import {
  HrRoutingManagementService,
  TOPOLOGIES
} from '../src/services/hr-routing-management-service.js';
import { D3_PROCESS_CAPABILITY_ID } from '../src/validation/validation-engine.js';

// Preserve the accepted D3-IMP-06 UI matrix, updating only the two canonical
// M2 sequence expectations that R1 intentionally corrects.
const legacySourceUrl = new URL('./hr-routing-manager-d3imp06-matrix.source', import.meta.url);
const generatedUrl = new URL('./.generated-hr-routing-manager-d3imp06-matrix.mjs', import.meta.url);
let legacySource = await fs.readFile(legacySourceUrl, 'utf8');
legacySource = legacySource
  .replace("['M1', 'M2', 'G1']", "['M2', 'M1', 'G1']")
  .replace("['M1', 'M2', 'G1', 'G2']", "['M2', 'M1', 'G1', 'G2']");
await fs.writeFile(generatedUrl, legacySource, 'utf8');
try {
  await import(`${generatedUrl.href}?r1=${Date.now()}`);
} finally {
  await fs.unlink(generatedUrl).catch(() => {});
}

const HR = Object.freeze({ userCode: 'hr_ui_r1', groups: ['hr'] });
const ADMIN = Object.freeze({ userCode: 'admin_ui_r1', groups: ['admin-form'] });

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
      return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
    },
    setAttribute(name, next) {
      this.attributes[name] = String(next);
    },
    async trigger(event) {
      for (const fn of [...(listeners.get(event) || [])]) {
        await fn({ target: this });
      }
    }
  };
}

function createMockContainer(initial = {}) {
  const elements = new Map();
  const slotElements = [];
  const buttonLists = new Map([['.btn-select-route', []]]);
  const container = {
    innerHTML: '',
    elements,
    querySelector(selector) {
      if (!elements.has(selector)) {
        elements.set(selector, createMockElement({ value: initial[selector] ?? '' }));
      }
      return elements.get(selector);
    },
    querySelectorAll(selector) {
      if (selector === '.slot-input') return slotElements;
      return buttonLists.get(selector) || [];
    },
    addSlot(slot, value) {
      const element = createMockElement({ value, attributes: { 'data-slot': slot } });
      slotElements.push(element);
      return element;
    }
  };
  return container;
}

function createDraftUiContainer() {
  const container = createMockContainer({
    '#hr-route-key': 'KEY',
    '#hr-topology-select': TOPOLOGIES.M1_ONLY,
    '#hr-effective-from': '2026-07-01',
    '#hr-effective-to': '',
    '#hr-supersede-effective-to': '',
    '#hr-route-remark': 'R1 UI create',
    '#hr-scorer-midyear': 'M1',
    '#hr-scorer-final1': 'M1',
    '#hr-scorer-final2': ''
  });
  container.addSlot('M1', 'm1_user');
  return container;
}

test('R1-UI-01 M2 route options expose canonical M2-first sequence', () => {
  const m2Three = TOPOLOGY_OPTIONS.find(option => option.value === TOPOLOGIES.M1_M2_G1);
  const m2Four = TOPOLOGY_OPTIONS.find(option => option.value === TOPOLOGIES.M1_M2_G1_G2);
  assert.deepEqual(m2Three.slots, ['M2', 'M1', 'G1']);
  assert.deepEqual(m2Four.slots, ['M2', 'M1', 'G1', 'G2']);
  assert.match(m2Three.label, /^M2 \+ M1 \+ G1/);
  assert.match(m2Four.label, /^M2 \+ M1 \+ G1 \+ G2/);
});

test('R1-UI-02 rendered M2 topology places M2 before M1 and has no implicit scorer selection', () => {
  const html = renderHrRoutingManagerHtml({
    principal: HR,
    selectedTopology: TOPOLOGIES.M1_M2_G1,
    scorerValues: { midYear: '', final1: '', final2: '' }
  });
  assert.ok(html.indexOf('id="slot-container-m2"') < html.indexOf('id="slot-container-m1"'));
  assert.ok(html.includes('M2 + M1 + G1 (3 Appraisers: M2, M1, G1)'));
  assert.ok(html.includes('(Select explicit scorer slot / ต้องระบุ)'));
});

test('R1-UI-03 getRequiredSlotsForTopology is canonical and has no unknown-topology M1 fallback', () => {
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_M2_G1), ['M2', 'M1', 'G1']);
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_M2_G1_G2), ['M2', 'M1', 'G1', 'G2']);
  assert.deepEqual(getRequiredSlotsForTopology('UNKNOWN'), []);
});

test('R1-UI-04 preview event propagates the exact principal/K/process to validation and preview APIs', async () => {
  const container = createDraftUiContainer();
  const calls = [];
  const service = {
    validateRoutingDraft(args) {
      calls.push(['validateRoutingDraft', args]);
      return { isValid: true, errors: [], candidate: {} };
    },
    previewRoutingPlan(args) {
      calls.push(['previewRoutingPlan', args]);
      return {
        isValid: true,
        topology: args.draft.topology,
        activeSlots: [{ role: 'M1', userCode: 'm1_user' }],
        scorerSlots: args.draft.scorerSlots,
        processCapabilityId: args.processCapabilityId,
        kExpected: args.kExpected,
        warnings: [],
        planPayload: {}
      };
    }
  };

  bindHrRoutingManagerEvents({
    containerElement: container,
    principal: ADMIN,
    service,
    initialData: {
      selectedRouteKey: 'KEY',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      remark: 'preview',
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }
  });

  await container.querySelector('#hr-btn-preview').trigger('click');
  assert.equal(calls.length, 2);
  for (const [, args] of calls) {
    assert.strictEqual(args.principal, ADMIN);
    assert.equal(args.principal.userCode, 'admin_ui_r1');
    assert.deepEqual(args.principal.groups, ['admin-form']);
    assert.equal(args.kExpected, 1);
    assert.equal(args.processCapabilityId, D3_PROCESS_CAPABILITY_ID);
  }
});

test('R1-UI-05 create event calls the real createDraftRoutePlan API and generates a local-only plan', async () => {
  const container = createDraftUiContainer();
  let generated = null;

  bindHrRoutingManagerEvents({
    containerElement: container,
    principal: HR,
    service: HrRoutingManagementService,
    onPlanGenerated(plan) {
      generated = plan;
    },
    initialData: {
      selectedRouteKey: 'KEY',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      effectiveTo: '',
      remark: 'R1 UI create',
      routes: [],
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID,
      versionHistoryCompletenessByRoutingKey: { KEY: true }
    }
  });

  await container.querySelector('#hr-btn-create-draft').trigger('click');
  assert.ok(generated, 'real service plan must be generated');
  assert.equal(generated.operation, 'CREATE_DRAFT');
  assert.equal(generated.noMutationExecuted, true);
  assert.equal(generated.proposed.Version_Key, 'KEY#v1');
});

test('R1-UI-06 create event never invents history completeness', async () => {
  const container = createDraftUiContainer();
  let generated = null;
  const binding = bindHrRoutingManagerEvents({
    containerElement: container,
    principal: HR,
    service: HrRoutingManagementService,
    onPlanGenerated(plan) {
      generated = plan;
    },
    initialData: {
      selectedRouteKey: 'KEY',
      selectedTopology: TOPOLOGIES.M1_ONLY,
      slotValues: { M1: 'm1_user' },
      scorerValues: { midYear: 'M1', final1: 'M1', final2: '' },
      effectiveFrom: '2026-07-01',
      remark: 'No proof',
      routes: [],
      kExpected: 1,
      processCapabilityId: D3_PROCESS_CAPABILITY_ID
    }
  });

  await container.querySelector('#hr-btn-create-draft').trigger('click');
  assert.equal(generated, null);
  assert.ok(binding.getState().validationErrors.some(message => message.includes('ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED')));
});
