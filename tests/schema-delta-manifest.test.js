import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCAL_SCHEMA_DELTA_MANIFEST } from '../src/config/schema-delta-manifest.js';

test('SCHEMA_MANIFEST_SAFETY: uses exact exported app names and contains zero invented password policy defaults', () => {
  const apps = LOCAL_SCHEMA_DELTA_MANIFEST.targetApps;

  assert.equal(apps.App794.appName, 'MBO V2 Sandbox');
  assert.equal(apps.App797.appName, 'MBO Hoshin Master [Sandbox]');
  assert.equal(apps.App800.appName, 'MBO HR Control Center [Sandbox]');
  assert.equal(apps.App801.appName, 'MBO Employee Authentication & MFA Credential Store [Sandbox]');

  // Verify no invented defaultValue on App800 password policy fields
  const app800Fields = apps.App800.missingFields;
  const pwdMaxAge = app800Fields.find(f => f.code === 'Password_Max_Age_Days');
  assert.equal(pwdMaxAge.defaultValue, undefined);

  // Verify App801 has only Kintone_User_Code and Password_Expires_At
  const app801Codes = apps.App801.missingFields.map(f => f.code);
  assert.deepEqual(app801Codes, ['Kintone_User_Code', 'Password_Expires_At']);
});
