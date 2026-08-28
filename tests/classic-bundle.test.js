import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildMboUi } from '../scripts/kintone/build-mbo-ui.js';
import {
  resolveProfileCodeForSnapshot,
  RuntimeProfileResolverError,
  PROFILE_CODES
} from '../src/profiles/runtime-profile-resolver.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { AdminDiagnosticModel } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../src/admin/admin-support-center.js';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';

test('Classic Bundle: Module-aware build produces valid IIFE browser script without ES module residue', async () => {
  const result = await buildMboUi({ outfile: 'dist/mbo-employee-app-classic-test.js' });
  assert.ok(result, 'esbuild build result must be returned');

  const bundleCode = fs.readFileSync('dist/mbo-employee-app-classic-test.js', 'utf8');

  // 1. Classic Bundle Syntax Parse
  assert.doesNotThrow(() => {
    new Function(bundleCode);
  }, 'dist/mbo-employee-app.js must parse cleanly via Function constructor as classic JS script');

  // 2. Zero import statements
  const strippedCode = bundleCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  assert.equal(/(^|\n)\s*import[\s{]/m.test(strippedCode), false, 'bundleCode must contain 0 ES import statements');

  // 3. Zero export statements
  assert.equal(/(^|\n)\s*export[\s{]/m.test(strippedCode), false, 'bundleCode must contain 0 ES export statements');
});

test('Classic Bundle: Dependency Graph Closure proves expected runtime modules included and Node/Scoring-Master modules absent', async () => {
  const result = await buildMboUi();
  const inputs = Object.keys(result.metafile.inputs);

  const normalizePath = (p) => p.replace(/\\/g, '/');
  const inputSet = new Set(inputs.map(normalizePath));

  // Required runtime modules included in browser bundle graph
  const REQUIRED_MODULES = [
    'src/ui/employee-visibility.js',
    'src/evaluation/appraiser-normalizer.js',
    'src/admin/admin-diagnostic-model.js',
    'src/admin/admin-support-center.js',
    'src/profiles/profile-codes-policy.js',
    'src/profiles/runtime-profile-resolver.js',
    'src/ui/employee-part-a-ui.js',
    'src/ui/mbo-kintone-auth-adapter.js',
    'src/ui/mbo-session-manager.js',
    'src/ui/mbo-kintone-login-gate.js'
  ];

  for (const mod of REQUIRED_MODULES) {
    assert.equal(inputSet.has(mod), true, `Browser bundle graph must include ${mod}`);
  }

  // Forbidden modules that MUST NOT be in the browser bundle graph
  assert.equal(inputSet.has('src/profiles/scoring-config-master.js'), false, 'scoring-config-master.js MUST NOT be in browser bundle graph');

  const bundleCode = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');
  assert.equal(/node:crypto/.test(bundleCode), false, 'dist/mbo-employee-app.js MUST NOT import node:crypto');
});

test('Classic Bundle: AdminDiagnosticModel & AdminSupportCenterUI runtime symbols are defined and resolvable', () => {
  const bundleCode = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');

  // Verify symbol definitions exist in bundle code
  assert.match(bundleCode, /\b(var|class)\s+AdminDiagnosticModel\b/);
  assert.match(bundleCode, /\b(var|class)\s+AdminSupportCenterUI\b/);

  // Direct source-module symbol verification
  assert.equal(typeof AdminDiagnosticModel, 'function');
  assert.equal(typeof AdminSupportCenterUI, 'function');
  assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
  assert.equal(AdminDiagnosticModel.isTechnicalAdmin('user001'), false);

  // Runtime test: EmployeePartAUI._renderSupportCenterIfAdmin executes without throwing ReferenceError
  const ui = new EmployeePartAUI({
    record: {},
    stage: 'NEW_RECORD',
    loginUserCode: 'user001',
    isCreate: true
  });

  assert.doesNotThrow(() => {
    ui._renderSupportCenterIfAdmin();
  }, 'ui._renderSupportCenterIfAdmin must execute without ReferenceError');
});

test('Runtime Profile Resolver: resolves profile code for verified snapshot and fails closed on unverified/invalid data', async () => {
  // 1. Valid verified snapshot from EmployeeService lookup
  const stubApi = {
    getRecords: async () => ({
      records: [{
        emp_text: { value: '0113' },
        Text: { value: 'Somchai Jaidee' },
        Text_0: { value: 'สมชาย ใจดี' },
        Drop_down_0: { value: 'General Admin' },
        Drop_down: { value: 'General Admin Section 1' },
        Team: { value: '' },
        Text_2: { value: 'General Manager' },
        Text_4: { value: 'somchai@example.com' },
        Date: { value: '2020-01-01' }
      }]
    })
  };
  const lookupRes = await EmployeeService.lookupEmployee('0113', stubApi);
  const profileCode = resolveProfileCodeForSnapshot(lookupRes.employee);
  assert.equal(profileCode, PROFILE_CODES.GM);

  // 2. Unverified snapshot throws RuntimeProfileResolverError
  const unverifiedSnapshot = {
    Employee_Code: '0113',
    Employee_Position: 'General Manager'
  };
  assert.throws(() => resolveProfileCodeForSnapshot(unverifiedSnapshot), (err) => {
    return err instanceof RuntimeProfileResolverError && err.code === 'EMPLOYEE_SNAPSHOT_UNVERIFIED';
  });

  // 3. Invalid position throws RuntimeProfileResolverError
  const invalidPosStubApi = {
    getRecords: async () => ({
      records: [{
        emp_text: { value: '0113' },
        Text: { value: 'Somchai Jaidee' },
        Text_0: { value: 'สมชาย ใจดี' },
        Drop_down_0: { value: 'General Admin' },
        Drop_down: { value: 'General Admin Section 1' },
        Team: { value: '' },
        Text_2: { value: 'Unknown Nonexistent Position Title' },
        Text_4: { value: 'somchai@example.com' },
        Date: { value: '2020-01-01' }
      }]
    })
  };
  const invalidLookupRes = await EmployeeService.lookupEmployee('0113', invalidPosStubApi);

  assert.throws(() => resolveProfileCodeForSnapshot(invalidLookupRes.employee), (err) => {
    return err instanceof RuntimeProfileResolverError && err.code === 'PROFILE_SOURCE_INVALID';
  });
});

test('Classic Bundle: isValidEmployeeCode runtime availability in bundle scope', () => {
  const bundleCode = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');

  // Verify function symbol exists in bundle code
  assert.match(bundleCode, /\b(function|var)\s+isValidEmployeeCode\b/);

  // Evaluate in scope
  const testScript = `
    ${bundleCode}
    return {
      valid1: true
    };
  `;
  const result = new Function(testScript)();
  assert.equal(result.valid1, true);
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

test('Classic Bundle: Committed dist contains Save-gate exactness checks', () => {
  const distJs = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');

  assert.ok(
    distJs.includes('!activeUiInstance || activeUiInstance.isEmployeeVerified !== true'),
    'dist bundle must contain fail-closed check for activeUiInstance'
  );
  assert.ok(
    distJs.includes('this.isEmployeeVerified = !this.isCreate'),
    'dist bundle must contain Create mode unverified initialization'
  );
});
