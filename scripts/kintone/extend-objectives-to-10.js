import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';
import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

const app = sandboxRegistry.mboV2AppId;
assertSandboxWriteTarget(app);

const text = (label, options = {}) => ({ type: 'SINGLE_LINE_TEXT', label, required: false, unique: false, defaultValue: '', ...options });
const area = (label) => ({ type: 'MULTI_LINE_TEXT', label, required: false, defaultValue: '' });
const number = (label, options = {}) => ({ type: 'NUMBER', label, required: false, unique: false, minValue: '', maxValue: '', defaultValue: '', ...options });
const file = (label) => ({ type: 'FILE', label, required: false });
const calc = (label, expression) => ({ type: 'CALC', label, expression, hideExpression: true });

// 1. Check existing fields
const currentFields = await kintoneRequest(`/k/v1/preview/app/form/fields.json?app=${app}`);
const existingProperties = currentFields.properties || {};

// 2. Build fields to add for i = 5..10
const newFieldsToAdd = {};

for (let i = 5; i <= 10; i++) {
  const fieldsForSlot = {
    [`Objective_${i}`]: area(`Objective ${i}`),
    [`Action_Plan_${i}`]: area(`Action Plan ${i}`),
    [`Additional_Agreement_${i}`]: area(`Additional Agreement ${i}`),
    [`Weight_${i}`]: number(`Weight ${i} (%)`, { minValue: '0', maxValue: '100' }),
    [`Difficulty_${i}`]: number(`Difficulty ${i}`, { minValue: '1', maxValue: '4' }),
    [`Progress_Percent_${i}`]: number(`Progress ${i} (%)`, { minValue: '0', maxValue: '100' }),
    [`Periodical_Review_${i}`]: area(`Periodical Review ${i}`),
    [`MidYear_Result_${i}`]: area(`Mid-Year Result ${i}`),
    [`MidYear_Issue_Risk_${i}`]: area(`Mid-Year Issue / Risk ${i}`),
    [`MidYear_Next_Action_${i}`]: area(`Mid-Year Next Action ${i}`),
    [`MidYear_Attachment_${i}`]: file(`Mid-Year Attachment ${i}`),
    [`Actual_Result_${i}`]: area(`Actual Result ${i}`),
    [`Self_Achievement_${i}`]: number(`Self Achievement ${i}`, { minValue: '1', maxValue: '5' }),
    [`Self_Comment_${i}`]: area(`Self Comment ${i}`),
    [`Final_Attachment_${i}`]: file(`Final Attachment ${i}`),
    [`Manager_Achievement_${i}`]: number(`Manager Achievement ${i}`, { minValue: '1', maxValue: '5' }),
    [`Manager_Objective_Score_${i}`]: number(`Manager Objective Score ${i}`, { minValue: '1', maxValue: '5' }),
    [`Manager_Comment_${i}`]: area(`Manager Internal Comment ${i}`),
    [`GM_Achievement_${i}`]: number(`GM Achievement ${i}`, { minValue: '1', maxValue: '5' }),
    [`GM_Objective_Score_${i}`]: number(`GM Objective Score ${i}`, { minValue: '1', maxValue: '5' }),
    [`GM_Comment_${i}`]: area(`GM Internal Comment ${i}`),
    [`Average_Objective_Score_${i}`]: calc(`Average Objective Score ${i}`, `(Manager_Objective_Score_${i}+GM_Objective_Score_${i})/2`),
    [`MBO_Point_${i}`]: calc(`MBO Point ${i}`, `(Average_Objective_Score_${i}/100)*Weight_${i}`)
  };

  Object.entries(fieldsForSlot).forEach(([code, prop]) => {
    if (!existingProperties[code]) {
      newFieldsToAdd[code] = { ...prop, code };
    }
  });
}

if (Object.keys(newFieldsToAdd).length > 0) {
  console.log(`Adding ${Object.keys(newFieldsToAdd).length} new fields for Objectives 5-10...`);
  await kintoneRequest('/k/v1/preview/app/form/fields.json', {
    method: 'POST',
    body: {
      app,
      properties: newFieldsToAdd
    }
  });
  console.log('New fields added successfully.');
} else {
  console.log('All fields for Objectives 5-10 already exist.');
}

// 3. Update Objective_Count options (2 to 10) & CALC formulas
const objectiveCountOptions = {};
for (let n = 2; n <= 10; n++) {
  objectiveCountOptions[String(n)] = { label: String(n), index: String(n - 2) };
}

const weightTerms = [];
const mboPointTerms = [];
for (let i = 1; i <= 10; i++) {
  weightTerms.push(`Weight_${i}`);
  mboPointTerms.push(`MBO_Point_${i}`);
}

const updateProperties = {
  Objective_Count: {
    type: 'DROP_DOWN',
    label: 'Objective Count',
    required: true,
    defaultValue: '4',
    options: objectiveCountOptions
  },
  Total_Weight: {
    type: 'CALC',
    label: 'Total Weight',
    expression: weightTerms.join('+'),
    hideExpression: true
  },
  PartA_Raw_Score: {
    type: 'CALC',
    label: 'Part A Raw Score',
    expression: mboPointTerms.join('+'),
    hideExpression: true
  }
};

console.log('Updating Objective_Count options and CALC fields...');
await kintoneRequest('/k/v1/preview/app/form/fields.json', {
  method: 'PUT',
  body: {
    app,
    properties: updateProperties
  }
});
console.log('Fields updated in preview.');

// 4. Deploy app preview to LIVE Sandbox
console.log('Deploying preview to LIVE Sandbox App 794...');
await kintoneRequest('/k/v1/preview/app/deploy.json', {
  method: 'POST',
  body: { apps: [{ app }] }
});

let deployed = false;
for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 1500));
  const res = await kintoneRequest(`/k/v1/preview/app/deploy.json?apps[0]=${app}`);
  const status = res.apps?.[0]?.status;
  console.log(`Deployment status check ${i + 1}: ${status}`);
  if (status === 'SUCCESS') {
    deployed = true;
    break;
  }
  if (status === 'FAIL') {
    throw new Error('Sandbox app deployment failed.');
  }
}

if (!deployed) {
  throw new Error('Deployment timeout.');
}

console.log(`MBO V2 Sandbox (App ${app}) Schema extended to 10 Objectives and deployed to LIVE!`);
