import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const ROUTING_APP_ID = 795;
const MBO_APP_ID = 794;

assertSandboxWriteTarget(ROUTING_APP_ID);
assertSandboxWriteTarget(MBO_APP_ID);

console.log('=== Adding Sequential Routing Fields to App 795 ===');
const routingFieldsPayload = {
  app: ROUTING_APP_ID,
  properties: {
    Manager_Level1_Approvers: {
      type: 'USER_SELECT',
      code: 'Manager_Level1_Approvers',
      label: 'Manager Level 1 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    Manager_Level1_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'Manager_Level1_Approval_Rule',
      label: 'Manager Level 1 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    Manager_Level2_Approvers: {
      type: 'USER_SELECT',
      code: 'Manager_Level2_Approvers',
      label: 'Manager Level 2 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    Manager_Level2_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'Manager_Level2_Approval_Rule',
      label: 'Manager Level 2 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    GM_Level1_Approvers: {
      type: 'USER_SELECT',
      code: 'GM_Level1_Approvers',
      label: 'GM Level 1 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    GM_Level1_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'GM_Level1_Approval_Rule',
      label: 'GM Level 1 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    GM_Level2_Approvers: {
      type: 'USER_SELECT',
      code: 'GM_Level2_Approvers',
      label: 'GM Level 2 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    GM_Level2_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'GM_Level2_Approval_Rule',
      label: 'GM Level 2 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    }
  }
};

try {
  await kintoneRequest('/k/v1/preview/app/form/fields.json', {
    method: 'POST',
    body: routingFieldsPayload
  });
  console.log('App 795 preview fields added.');
  await kintoneRequest('/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: { apps: [{ app: ROUTING_APP_ID }] }
  });
  console.log('App 795 deployed.');
} catch (e) {
  console.log('App 795 field update info:', e.message);
}

console.log('\n=== Adding Sequential Routing Snapshot Fields to App 794 ===');
const mboFieldsPayload = {
  app: MBO_APP_ID,
  properties: {
    Manager_Level1_Approvers: {
      type: 'USER_SELECT',
      code: 'Manager_Level1_Approvers',
      label: 'Manager Level 1 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    Manager_Level1_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'Manager_Level1_Approval_Rule',
      label: 'Manager Level 1 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    Manager_Level2_Approvers: {
      type: 'USER_SELECT',
      code: 'Manager_Level2_Approvers',
      label: 'Manager Level 2 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    Manager_Level2_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'Manager_Level2_Approval_Rule',
      label: 'Manager Level 2 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    GM_Level1_Approvers: {
      type: 'USER_SELECT',
      code: 'GM_Level1_Approvers',
      label: 'GM Level 1 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    GM_Level1_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'GM_Level1_Approval_Rule',
      label: 'GM Level 1 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    GM_Level2_Approvers: {
      type: 'USER_SELECT',
      code: 'GM_Level2_Approvers',
      label: 'GM Level 2 Approvers',
      noLabel: false,
      required: false,
      entities: []
    },
    GM_Level2_Approval_Rule: {
      type: 'DROP_DOWN',
      code: 'GM_Level2_Approval_Rule',
      label: 'GM Level 2 Approval Rule',
      noLabel: false,
      required: false,
      options: {
        ANY: { label: 'ANY', index: 0 },
        ALL: { label: 'ALL', index: 1 }
      },
      defaultValue: 'ANY'
    },
    Has_Manager_Level2: {
      type: 'DROP_DOWN',
      code: 'Has_Manager_Level2',
      label: 'Has Manager Level 2',
      noLabel: false,
      required: false,
      options: {
        Yes: { label: 'Yes', index: 0 },
        No: { label: 'No', index: 1 }
      },
      defaultValue: 'No'
    },
    Has_GM_Level2: {
      type: 'DROP_DOWN',
      code: 'Has_GM_Level2',
      label: 'Has GM Level 2',
      noLabel: false,
      required: false,
      options: {
        Yes: { label: 'Yes', index: 0 },
        No: { label: 'No', index: 1 }
      },
      defaultValue: 'No'
    },
    Routing_Topology: {
      type: 'SINGLE_LINE_TEXT',
      code: 'Routing_Topology',
      label: 'Routing Topology',
      noLabel: false,
      required: false,
      defaultValue: 'M1_G1'
    }
  }
};

try {
  await kintoneRequest('/k/v1/preview/app/form/fields.json', {
    method: 'POST',
    body: mboFieldsPayload
  });
  console.log('App 794 preview fields added.');
  await kintoneRequest('/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: { apps: [{ app: MBO_APP_ID }] }
  });
  console.log('App 794 deployed.');
} catch (e) {
  console.log('App 794 field update info:', e.message);
}
