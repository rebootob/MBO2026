/**
 * D3 Process Management Workflow Payload Builder (Pure / Local Only)
 * 
 * Constructs the canonical 19-state / 40-action Kintone Process Management
 * definition for MBO2026 D3 V1.
 * 
 * ZERO Kintone network calls, ZERO HTTP client imports, ZERO credentials.
 * Pure deterministic local builder only.
 */

import { D3_PROCESS_CAPABILITY_ID } from '../../src/validation/validation-engine.js';

export const TOPOLOGY_GROUPS = {
  ALL_TOPOLOGIES: ['M1_ONLY', 'M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2'],
  HAS_M2: ['M1_M2_G1', 'M1_M2_G1_G2'],
  NO_M2: ['M1_ONLY', 'M1_G1', 'M1_G1_G2'],
  HAS_G1: ['M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2'],
  G1_WITHOUT_G2: ['M1_G1', 'M1_M2_G1'],
  HAS_G2: ['M1_G1_G2', 'M1_M2_G1_G2'],
  M1_ONLY_GROUP: ['M1_ONLY']
};

export function buildTopologyFilter(topologies) {
  if (!Array.isArray(topologies) || topologies.length === 0) {
    throw new Error('buildTopologyFilter requires non-empty array of topologies');
  }
  return `Routing_Topology in (${topologies.map((t) => `"${t}"`).join(', ')})`;
}

export const D3_STATE_DEFINITIONS = [
  // Objective stage (indexes 0..5)
  { index: 0, name: '01 Draft Objective', key: '01 Draft Objective', fieldCode: null, type: 'ONE' },
  { index: 1, name: '02 First Manager Objective Review', key: '02 First Manager Objective Review', fieldCode: 'Manager_Level2_Approvers', type: 'ALL' },
  { index: 2, name: '03 Manager Objective Review', key: '03 Manager Objective Review', fieldCode: 'Manager_Level1_Approvers', type: 'ALL' },
  { index: 3, name: '04 GM Objective Review', key: '04 GM Objective Review', fieldCode: 'GM_Level1_Approvers', type: 'ALL' },
  { index: 4, name: '04B GM Level 2 Objective Review', key: '04B GM Level 2 Objective Review', fieldCode: 'GM_Level2_Approvers', type: 'ALL' },
  { index: 5, name: '05 Objective Approved', key: '05 Objective Approved', fieldCode: 'Requester_User', type: 'ONE' },

  // Mid-Year stage (indexes 6..11)
  { index: 6, name: '06 Employee Mid-Year', key: '06 Employee Mid-Year', fieldCode: 'Requester_User', type: 'ONE' },
  { index: 7, name: '07 First Manager Mid-Year Review', key: '07 First Manager Mid-Year Review', fieldCode: 'Manager_Level2_Approvers', type: 'ALL' },
  { index: 8, name: '08 Manager Mid-Year Review', key: '08 Manager Mid-Year Review', fieldCode: 'Manager_Level1_Approvers', type: 'ALL' },
  { index: 9, name: '09 GM Mid-Year Review', key: '09 GM Mid-Year Review', fieldCode: 'GM_Level1_Approvers', type: 'ALL' },
  { index: 10, name: '09B GM Level 2 Mid-Year Review', key: '09B GM Level 2 Mid-Year Review', fieldCode: 'GM_Level2_Approvers', type: 'ALL' },
  { index: 11, name: '10 Mid-Year Completed', key: '10 Mid-Year Completed', fieldCode: 'Requester_User', type: 'ONE' },

  // Final evaluation stage (indexes 12..18)
  { index: 12, name: '11 Employee Self Evaluation', key: '11 Employee Self Evaluation', fieldCode: 'Requester_User', type: 'ONE' },
  { index: 13, name: '12 First Manager Final Evaluation', key: '12 First Manager Final Evaluation', fieldCode: 'Manager_Level2_Approvers', type: 'ALL' },
  { index: 14, name: '13 Manager Final Evaluation', key: '13 Manager Final Evaluation', fieldCode: 'Manager_Level1_Approvers', type: 'ALL' },
  { index: 15, name: '14 GM Final Evaluation', key: '14 GM Final Evaluation', fieldCode: 'GM_Level1_Approvers', type: 'ALL' },
  { index: 16, name: '14B GM Level 2 Final Evaluation', key: '14B GM Level 2 Final Evaluation', fieldCode: 'GM_Level2_Approvers', type: 'ALL' },
  {
    index: 17,
    name: '15 HR Final Check',
    key: '15 HR Final Check',
    fieldCode: null,
    type: 'ONE',
    entities: [{ entity: { type: 'USER', code: 'hr' }, includeSubs: false }]
  },
  { index: 18, name: '16 Completed', key: '16 Completed', fieldCode: null, type: 'ONE' }
];

export const D3_ACTION_DEFINITIONS = [
  // Objective — 12 Actions (01..12)
  {
    name: 'Submit Objective to First Manager',
    from: '01 Draft Objective',
    to: '02 First Manager Objective Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Submit Objective to Manager',
    from: '01 Draft Objective',
    to: '03 Manager Objective Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.NO_M2)
  },
  {
    name: 'Approve Objective',
    from: '02 First Manager Objective Review',
    to: '03 Manager Objective Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Return Objective',
    from: '02 First Manager Objective Review',
    to: '01 Draft Objective',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Approve Objective',
    from: '03 Manager Objective Review',
    to: '04 GM Objective Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1)
  },
  {
    name: 'Approve Objective (M1 Only)',
    from: '03 Manager Objective Review',
    to: '05 Objective Approved',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.M1_ONLY_GROUP)
  },
  {
    name: 'Return Objective',
    from: '03 Manager Objective Review',
    to: '01 Draft Objective',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  },
  {
    name: 'Approve Objective',
    from: '04 GM Objective Review',
    to: '05 Objective Approved',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.G1_WITHOUT_G2)
  },
  {
    name: 'Approve Objective to G2',
    from: '04 GM Objective Review',
    to: '04B GM Level 2 Objective Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Return Objective',
    from: '04 GM Objective Review',
    to: '01 Draft Objective',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1)
  },
  {
    name: 'Approve Objective G2',
    from: '04B GM Level 2 Objective Review',
    to: '05 Objective Approved',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Return Objective G2',
    from: '04B GM Level 2 Objective Review',
    to: '01 Draft Objective',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },

  // Mid-Year — 13 Actions (13..25)
  {
    name: 'Start Mid-Year',
    from: '05 Objective Approved',
    to: '06 Employee Mid-Year',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  },
  {
    name: 'Submit Mid-Year to First Manager',
    from: '06 Employee Mid-Year',
    to: '07 First Manager Mid-Year Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Submit Mid-Year to Manager',
    from: '06 Employee Mid-Year',
    to: '08 Manager Mid-Year Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.NO_M2)
  },
  {
    name: 'Approve Mid-Year First Manager',
    from: '07 First Manager Mid-Year Review',
    to: '08 Manager Mid-Year Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Return Mid-Year First Manager',
    from: '07 First Manager Mid-Year Review',
    to: '06 Employee Mid-Year',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Approve Mid-Year Manager',
    from: '08 Manager Mid-Year Review',
    to: '09 GM Mid-Year Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1)
  },
  {
    name: 'Approve Mid-Year Manager (M1 Only)',
    from: '08 Manager Mid-Year Review',
    to: '10 Mid-Year Completed',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.M1_ONLY_GROUP)
  },
  {
    name: 'Return Mid-Year Manager',
    from: '08 Manager Mid-Year Review',
    to: '06 Employee Mid-Year',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  },
  {
    name: 'Approve Mid-Year GM',
    from: '09 GM Mid-Year Review',
    to: '10 Mid-Year Completed',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.G1_WITHOUT_G2)
  },
  {
    name: 'Approve Mid-Year GM to G2',
    from: '09 GM Mid-Year Review',
    to: '09B GM Level 2 Mid-Year Review',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Return Mid-Year GM',
    from: '09 GM Mid-Year Review',
    to: '06 Employee Mid-Year',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1)
  },
  {
    name: 'Approve Mid-Year G2',
    from: '09B GM Level 2 Mid-Year Review',
    to: '10 Mid-Year Completed',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Return Mid-Year G2',
    from: '09B GM Level 2 Mid-Year Review',
    to: '06 Employee Mid-Year',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },

  // Final — 15 Actions (26..40)
  {
    name: 'Start Self Evaluation',
    from: '10 Mid-Year Completed',
    to: '11 Employee Self Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  },
  {
    name: 'Submit Final to First Manager',
    from: '11 Employee Self Evaluation',
    to: '12 First Manager Final Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Submit Final to Manager',
    from: '11 Employee Self Evaluation',
    to: '13 Manager Final Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.NO_M2)
  },
  {
    name: 'Approve Final First Manager',
    from: '12 First Manager Final Evaluation',
    to: '13 Manager Final Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Return Final First Manager',
    from: '12 First Manager Final Evaluation',
    to: '11 Employee Self Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_M2)
  },
  {
    name: 'Approve Final Manager',
    from: '13 Manager Final Evaluation',
    to: '14 GM Final Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1)
  },
  {
    name: 'Approve Final Manager (M1 Only)',
    from: '13 Manager Final Evaluation',
    to: '15 HR Final Check',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.M1_ONLY_GROUP)
  },
  {
    name: 'Return Final Manager',
    from: '13 Manager Final Evaluation',
    to: '11 Employee Self Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  },
  {
    name: 'Approve Final GM',
    from: '14 GM Final Evaluation',
    to: '15 HR Final Check',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.G1_WITHOUT_G2)
  },
  {
    name: 'Approve Final GM to G2',
    from: '14 GM Final Evaluation',
    to: '14B GM Level 2 Final Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Return Final GM',
    from: '14 GM Final Evaluation',
    to: '11 Employee Self Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G1)
  },
  {
    name: 'Approve Final G2',
    from: '14B GM Level 2 Final Evaluation',
    to: '15 HR Final Check',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Return Final G2',
    from: '14B GM Level 2 Final Evaluation',
    to: '11 Employee Self Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.HAS_G2)
  },
  {
    name: 'Complete',
    from: '15 HR Final Check',
    to: '16 Completed',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  },
  {
    name: 'Return Final HR',
    from: '15 HR Final Check',
    to: '11 Employee Self Evaluation',
    filterCond: buildTopologyFilter(TOPOLOGY_GROUPS.ALL_TOPOLOGIES)
  }
];

export function buildD3WorkflowDefinition() {
  const states = {};
  for (const def of D3_STATE_DEFINITIONS) {
    let entities = [];
    if (Array.isArray(def.entities)) {
      entities = def.entities.map((e) => ({
        entity: { ...e.entity },
        includeSubs: Boolean(e.includeSubs)
      }));
    } else if (def.fieldCode) {
      entities = [{ entity: { type: 'FIELD_ENTITY', code: def.fieldCode }, includeSubs: false }];
    }

    states[def.key] = {
      name: def.name,
      index: String(def.index),
      assignee: {
        type: def.type,
        entities
      }
    };
  }

  const actions = D3_ACTION_DEFINITIONS.map((act) => ({ ...act }));

  return { states, actions };
}

export function buildD3WorkflowPayload(options = {}) {
  const { app, revision } = options;

  if (app === undefined || app === null || (typeof app !== 'number' && typeof app !== 'string') || String(app).trim() === '') {
    throw new Error('Explicit app ID is required for workflow payload.');
  }

  if (revision === undefined || revision === null || (typeof revision !== 'number' && typeof revision !== 'string') || String(revision).trim() === '') {
    throw new Error('Explicit revision is required for workflow payload.');
  }

  const numericApp = typeof app === 'number' ? app : parseInt(String(app), 10);
  if (Number.isNaN(numericApp)) {
    throw new Error('Invalid app ID format.');
  }

  const { states, actions } = buildD3WorkflowDefinition();

  const payload = {
    app: numericApp,
    enable: true,
    revision: String(revision),
    states,
    actions
  };

  return {
    capabilityId: D3_PROCESS_CAPABILITY_ID,
    payload
  };
}
