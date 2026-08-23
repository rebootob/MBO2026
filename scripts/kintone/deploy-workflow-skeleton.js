import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';
import { validateWorkflowPayload } from '../../src/core/workflow-validator.js';

const app = sandboxRegistry.mboV2AppId;
assertSandboxWriteTarget(app);

const [fields, current] = await Promise.all([
  kintoneRequest(`/k/v1/preview/app/form/fields.json?app=${app}`),
  kintoneRequest(`/k/v1/preview/app/status.json?app=${app}`)
]);

const fieldTypes = Object.fromEntries(
  Object.entries(fields.properties).map(([code, field]) => [code, field.type])
);

const stateList = [
  ['01 Draft Objective', 'Requester_User'],
  ['02 First Manager Objective Review', 'First_Manager_User'],
  ['03 Manager Objective Review', 'Manager_User'],
  ['04 GM Objective Review', 'GM_User'],
  ['05 Objective Approved', 'Requester_User'],
  ['06 Employee Mid-Year', 'Requester_User'],
  ['07 First Manager Mid-Year Review', 'First_Manager_User'],
  ['08 Manager Mid-Year Review', 'Manager_User'],
  ['09 GM Mid-Year Review', 'GM_User'],
  ['10 Mid-Year Completed', 'Requester_User'],
  ['11 Employee Self Evaluation', 'Requester_User'],
  ['12 First Manager Final Evaluation', 'First_Manager_User'],
  ['13 Manager Final Evaluation', 'Manager_User'],
  ['14 GM Final Evaluation', 'GM_User'],
  ['15 HR Final Check', null],
  ['16 Completed', null]
];

const states = {};
stateList.forEach(([name, fieldCode], index) => {
  const key = index === 0 ? 'Not started' : name;
  states[key] = {
    name,
    index: String(index),
    assignee: {
      type: 'ONE',
      entities: (index > 0 && fieldCode)
        ? [{ entity: { type: 'FIELD_ENTITY', code: fieldCode }, includeSubs: false }]
        : []
    }
  };
});

const actions = [
  // Objective flow
  { name: 'Submit Objective to First Manager', from: '01 Draft Objective', to: '02 First Manager Objective Review', filterCond: '' },
  { name: 'Submit Objective to Manager', from: '01 Draft Objective', to: '03 Manager Objective Review', filterCond: '' },
  { name: 'Approve Objective', from: '02 First Manager Objective Review', to: '03 Manager Objective Review', filterCond: '' },
  { name: 'Return Objective', from: '02 First Manager Objective Review', to: '01 Draft Objective', filterCond: '' },
  { name: 'Approve Objective', from: '03 Manager Objective Review', to: '04 GM Objective Review', filterCond: '' },
  { name: 'Return Objective', from: '03 Manager Objective Review', to: '01 Draft Objective', filterCond: '' },
  { name: 'Approve Objective', from: '04 GM Objective Review', to: '05 Objective Approved', filterCond: '' },
  { name: 'Return Objective', from: '04 GM Objective Review', to: '01 Draft Objective', filterCond: '' },

  // Mid-Year flow
  { name: 'Start Mid-Year', from: '05 Objective Approved', to: '06 Employee Mid-Year', filterCond: '' },
  { name: 'Submit Mid-Year to First Manager', from: '06 Employee Mid-Year', to: '07 First Manager Mid-Year Review', filterCond: '' },
  { name: 'Submit Mid-Year to Manager', from: '06 Employee Mid-Year', to: '08 Manager Mid-Year Review', filterCond: '' },
  { name: 'Approve Mid-Year First Manager', from: '07 First Manager Mid-Year Review', to: '08 Manager Mid-Year Review', filterCond: '' },
  { name: 'Return Mid-Year First Manager', from: '07 First Manager Mid-Year Review', to: '06 Employee Mid-Year', filterCond: '' },
  { name: 'Approve Mid-Year Manager', from: '08 Manager Mid-Year Review', to: '09 GM Mid-Year Review', filterCond: '' },
  { name: 'Return Mid-Year Manager', from: '08 Manager Mid-Year Review', to: '06 Employee Mid-Year', filterCond: '' },
  { name: 'Approve Mid-Year GM', from: '09 GM Mid-Year Review', to: '10 Mid-Year Completed', filterCond: '' },
  { name: 'Return Mid-Year GM', from: '09 GM Mid-Year Review', to: '06 Employee Mid-Year', filterCond: '' },

  // Final Evaluation flow
  { name: 'Start Self Evaluation', from: '10 Mid-Year Completed', to: '11 Employee Self Evaluation', filterCond: '' },
  { name: 'Submit Final to First Manager', from: '11 Employee Self Evaluation', to: '12 First Manager Final Evaluation', filterCond: '' },
  { name: 'Submit Final to Manager', from: '11 Employee Self Evaluation', to: '13 Manager Final Evaluation', filterCond: '' },
  { name: 'Approve Final First Manager', from: '12 First Manager Final Evaluation', to: '13 Manager Final Evaluation', filterCond: '' },
  { name: 'Return Final First Manager', from: '12 First Manager Final Evaluation', to: '11 Employee Self Evaluation', filterCond: '' },
  { name: 'Approve Final Manager', from: '13 Manager Final Evaluation', to: '14 GM Final Evaluation', filterCond: '' },
  { name: 'Return Final Manager', from: '13 Manager Final Evaluation', to: '11 Employee Self Evaluation', filterCond: '' },
  { name: 'Approve Final GM', from: '14 GM Final Evaluation', to: '15 HR Final Check', filterCond: '' },
  { name: 'Return Final GM', from: '14 GM Final Evaluation', to: '11 Employee Self Evaluation', filterCond: '' },
  { name: 'Complete', from: '15 HR Final Check', to: '16 Completed', filterCond: '' },
  { name: 'Return Final HR', from: '15 HR Final Check', to: '11 Employee Self Evaluation', filterCond: '' }
];

const payload = {
  app,
  enable: true,
  revision: current.revision,
  states,
  actions
};

validateWorkflowPayload(payload, fieldTypes);

await kintoneRequest('/k/v1/preview/app/status.json', {
  method: 'PUT',
  body: payload
});

console.log(`Workflow preview created: ${Object.keys(states).length} statuses, ${actions.length} actions.`);
