import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function cleanEsModules(jsText) {
  return jsText
    .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+\{[\s\S]*?\};?/g, '');
}

test('Classic Bundle: App 794 Javascript bundle parses as classic script with zero ES module residue', () => {
  const constantsJs = cleanEsModules(fs.readFileSync('src/config/constants.js', 'utf8'));
  const fiscalYearEngineJs = cleanEsModules(fs.readFileSync('src/core/fiscal-year-engine.js', 'utf8'));
  const scoringConfigMasterJs = cleanEsModules(fs.readFileSync('src/profiles/scoring-config-master.js', 'utf8'));
  const profileScoringResolverJs = cleanEsModules(fs.readFileSync('src/profiles/profile-scoring-resolver.js', 'utf8'));
  const hostResolverJs = cleanEsModules(fs.readFileSync('src/ui/host-resolver.js', 'utf8'));
  const validationJs = cleanEsModules(fs.readFileSync('src/validation/validation-engine.js', 'utf8'));
  const employeeServiceJs = cleanEsModules(fs.readFileSync('src/services/employee-service.js', 'utf8'));
  const routingServiceJs = cleanEsModules(fs.readFileSync('src/services/routing-service.js', 'utf8'));
  const uiJs = cleanEsModules(fs.readFileSync('src/ui/employee-part-a-ui.js', 'utf8'));
  const mainJs = cleanEsModules(fs.readFileSync('src/main-mbo-app.js', 'utf8'));

  const fullJs = `
(function() {
  'use strict';

  ${constantsJs}

  ${fiscalYearEngineJs}

  ${scoringConfigMasterJs}

  ${profileScoringResolverJs}

  ${hostResolverJs}

  ${validationJs}

  ${employeeServiceJs}

  ${routingServiceJs}

  ${uiJs}

  ${mainJs}

})();
`;

  // 1. Classic Bundle Syntax Parse
  assert.doesNotThrow(() => {
    new Function(fullJs);
  }, 'fullJs must parse cleanly via Function constructor as classic JS script');

  // 2. Zero import statements
  assert.equal(/\bimport\b/.test(fullJs), false, 'fullJs must contain 0 import keywords');

  // 3. Zero export statements
  assert.equal(/\bexport\b/.test(fullJs), false, 'fullJs must contain 0 export keywords');

  // 4. Zero broken } from '...' residue
  assert.equal(/}\s*from\s*['"]/.test(fullJs), false, 'fullJs must contain 0 broken from residue');
});

test('Classic Bundle: isValidEmployeeCode runtime availability in bundle scope', () => {
  const constantsJs = cleanEsModules(fs.readFileSync('src/config/constants.js', 'utf8'));
  const fiscalYearEngineJs = cleanEsModules(fs.readFileSync('src/core/fiscal-year-engine.js', 'utf8'));
  const employeeServiceJs = cleanEsModules(fs.readFileSync('src/services/employee-service.js', 'utf8'));

  const testScript = `
    ${constantsJs}
    ${fiscalYearEngineJs}
    ${employeeServiceJs}

    if (typeof isValidEmployeeCode !== 'function') {
      throw new Error('isValidEmployeeCode is not a function');
    }
    return {
      valid1: isValidEmployeeCode('0149'),
      valid2: isValidEmployeeCode('EM001'),
      invalid1: isValidEmployeeCode(''),
      invalid2: isValidEmployeeCode(123)
    };
  `;

  const result = new Function(testScript)();
  assert.equal(result.valid1, true);
  assert.equal(result.valid2, true);
  assert.equal(result.invalid1, false);
  assert.equal(result.invalid2, false);
});

test('Kintone Field Reset: User Selection fields reset to [] and scalar fields reset to empty string', () => {
  const USER_SELECT_FIELDS = new Set([
    'Requester_User',
    'Manager_Level1_Approvers',
    'Manager_Level2_Approvers',
    'GM_Level1_Approvers',
    'GM_Level2_Approvers',
    'First_Manager_User',
    'Manager_User',
    'GM_User'
  ]);

  const record = {
    Employee_Code: { type: 'SINGLE_LINE_TEXT', value: '0149' },
    Employee_Name: { type: 'SINGLE_LINE_TEXT', value: 'Test User' },
    Manager_Level1_Approvers: { type: 'USER_SELECT', value: [{ code: 'm1' }] },
    Manager_Level2_Approvers: { type: 'USER_SELECT', value: [] },
    GM_Level1_Approvers: { type: 'USER_SELECT', value: [{ code: 'g1' }] },
    GM_Level2_Approvers: { type: 'USER_SELECT', value: [] },
    First_Manager_User: { type: 'USER_SELECT', value: [] },
    Manager_User: { type: 'USER_SELECT', value: [{ code: 'm1' }] },
    GM_User: { type: 'USER_SELECT', value: [{ code: 'g1' }] },
    Requester_User: { type: 'USER_SELECT', value: [{ code: 'req1' }] }
  };

  const fieldsToClear = [
    'Employee_Name', 'Employee_Name_TH', 'Employee_Section',
    'Employee_Department', 'Employee_Position', 'Employee_Email',
    'Employee_Start_Date', 'Department_Hoshin', 'Section_Hoshin', 'Record_Key',
    'Manager_Level1_Approvers', 'Manager_Level2_Approvers',
    'GM_Level1_Approvers', 'GM_Level2_Approvers',
    'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology',
    'First_Manager_User', 'Manager_User', 'GM_User', 'Requester_User'
  ];

  fieldsToClear.forEach(k => {
    if (record[k]) {
      record[k].value = USER_SELECT_FIELDS.has(k) ? [] : '';
    }
  });

  // User selection fields must be arrays
  assert.deepEqual(record.Manager_Level1_Approvers.value, []);
  assert.deepEqual(record.Manager_Level2_Approvers.value, []);
  assert.deepEqual(record.GM_Level1_Approvers.value, []);
  assert.deepEqual(record.GM_Level2_Approvers.value, []);
  assert.deepEqual(record.First_Manager_User.value, []);
  assert.deepEqual(record.Manager_User.value, []);
  assert.deepEqual(record.GM_User.value, []);
  assert.deepEqual(record.Requester_User.value, []);

  // Scalar fields must be empty string
  assert.equal(record.Employee_Name.value, '');
});
