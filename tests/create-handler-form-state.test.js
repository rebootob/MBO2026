import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const RAW_TOKEN = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const EXPECTED_HASH = crypto.createHash('sha256').update(RAW_TOKEN).digest('hex');

if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto || crypto;
}

const createMockElement = () => ({
  style: {},
  setAttribute: () => {},
  appendChild: () => {},
  insertBefore: () => {},
  addEventListener: () => {},
  remove: () => {},
  firstChild: null,
  querySelector: () => createMockElement(),
  querySelectorAll: () => []
});

const TEST_RESOLUTION_BUSINESS_DATE = '2026-06-15';

function loadBundleForDeterministicBusinessDate() {
  let bundleCode = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');

  const marker = /\b(?:let|var)\s+testResolutionBusinessDate\s*=\s*null\s*;/g;
  const matches = bundleCode.match(marker) || [];

  assert.equal(
    matches.length,
    1,
    'compiled bundle must contain exactly one internal testResolutionBusinessDate declaration'
  );

  bundleCode = bundleCode.replace(
    matches[0],
    matches[0].replace('null', `'${TEST_RESOLUTION_BUSINESS_DATE}'`)
  );

  return bundleCode;
}

test('Create Handler Form State Corrective: Authenticated Create Autoload uses event.record authority with 0 kintone.app.record.get/set calls', async () => {
  let recordGetCalls = 0;
  let recordSetCalls = 0;
  let eventCallback = null;

  // Mock document/DOM environment
  const fakeHeaderSpace = createMockElement();
  globalThis.document = {
    getElementById: () => createMockElement(),
    querySelector: (sel) => {
      if (sel === '.gaia-app-wrapper') return createMockElement();
      return null;
    },
    body: createMockElement(),
    createElement: () => createMockElement()
  };

  // Mock Kintone Environment
  globalThis.kintone = {
    app: {
      getId: () => 794,
      getHeaderSpaceElement: () => fakeHeaderSpace,
      record: {
        getSpaceElement: () => fakeHeaderSpace,
        getHeaderMenuSpaceElement: () => fakeHeaderSpace,
        get: () => {
          recordGetCalls++;
          throw new Error('You cannot call kintone.app.record.get() in handler or during processing a handler.');
        },
        set: () => {
          recordSetCalls++;
          throw new Error('You cannot call kintone.app.record.set() in handler or during processing a handler.');
        },
        setFieldShown: () => {}
      }
    },
    getLoginUser: () => ({ code: 's1', name: 'Somchai' }),
    api: Object.assign(
      async (url, method, params) => {
        const app = params?.app;
        if (app === 801) {
          return {
            records: [{
              Employee_Code: { value: '0113' },
              Account_Status: { value: 'ACTIVE' },
              Force_Password_Change: { value: 'NO' },
              Credential_Version: { value: '1' },
              Session_Credential_Version: { value: '1' },
              Session_Token_Hash: { value: EXPECTED_HASH },
              Session_Issued_At: { value: new Date().toISOString() },
              Session_Expires_At: { value: new Date(Date.now() + 3600000).toISOString() },
              Session_Kintone_User: { value: 's1' }
            }]
          };
        }
        if (app === 53) {
          return {
            records: [{
              emp_text: { value: '0113' },
              MBO_Kintone_User: { value: [] },
              Text: { value: 'Somchai Jaidee' },
              Text_0: { value: 'สมชาย ใจดี' },
              Drop_down_0: { value: 'General Admin' },
              Drop_down: { value: 'General Admin Section 1' },
              Team: { value: '' },
              Text_2: { value: 'General Manager' },
              Text_4: { value: 'somchai@example.com' },
              Date: { value: '2020-01-01' }
            }]
          };
        }
        if (app === 795) {
          return {
            records: [{
              Section_Name: { value: 'General Admin Section 1' },
              Routing_Key: { value: 'POSITION_GM' },
              Version_Key: { value: 'POSITION_GM#v1' },
              Version_Number: { value: '1' },
              Version_Status: { value: 'ACTIVE' },
              Effective_From: { value: '2026-04-01' },
              Effective_To: { value: '' },
              Route_Pattern: { value: 'PATTERN_1_M1' },
              Scorer_Priority_Slots: { value: '[1]' },
              Requester_User: { value: [{ code: 's1' }] },
              Manager_Level1_Approvers: { value: [{ code: 'm1' }] },
              Manager_Level1_Approval_Rule: { value: 'ALL' },
              GM_Level1_Approvers: { value: [] },
              GM_Level1_Approval_Rule: { value: '' },
              Has_Manager_Level2: { value: 'NO' },
              Has_GM_Level2: { value: 'NO' },
              Routing_Topology: { value: 'M1_ONLY' },
              First_Manager_User: { value: [] },
              Manager_User: { value: [{ code: 'm1' }] },
              GM_User: { value: [] }
            }]
          };
        }
        if (app === 796) {
          return {
            records: [{
              Profile_Code: { value: 'PROF_GM' },
              Fiscal_Year: { value: 'FY2026' },
              Config_Status: { value: 'PUBLISHED' },
              Expected_Appraiser_Count: { value: '1' },
              PartA_Weight: { value: '70' },
              PartB_Weight: { value: '30' },
              Part_A_Scoring_Mode: { value: 'ACHIEVEMENT_DIRECT' },
              Competency_Set_Code: { value: 'COMP_SET_MGMT' },
              Configuration_Hash: { value: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' }
            }]
          };
        }
        if (app === 794) {
          return { records: [] };
        }
        return { records: [] };
      },
      { url: (path) => path }
    ),
    events: {
      on: (events, handler) => {
        const evList = Array.isArray(events) ? events : [events];
        if (evList.includes('app.record.create.show')) {
          eventCallback = handler;
        }
      }
    }
  };

  // Mock localStorage & sessionStorage with valid raw bearer token string
  const mockStorage = new Map();
  mockStorage.set('ttmet.mbo794.session.v1', RAW_TOKEN);

  const storageObj = {
    getItem: (k) => mockStorage.get(k) || null,
    setItem: (k, v) => mockStorage.set(k, String(v)),
    removeItem: (k) => mockStorage.delete(k)
  };
  globalThis.localStorage = storageObj;
  globalThis.sessionStorage = storageObj;

  // Import compiled dist bundle to test real production bundle execution
  const bundleCode = loadBundleForDeterministicBusinessDate();
  new Function(bundleCode)();

  assert.equal(typeof eventCallback, 'function', 'app.record.create.show event listener must be registered');

  // Construct initial empty record event on app.record.create.show
  const record = {
    Employee_Code: { value: '' },
    Employee_Name: { value: '' },
    Employee_Name_TH: { value: '' },
    Employee_Department: { value: '' },
    Employee_Section: { value: '' },
    Employee_Position: { value: '' },
    Employee_Email: { value: '' },
    Employee_Start_Date: { value: '' },
    Fiscal_Year: { value: '' },
    Record_Key: { value: '' },
    Requester_User: { value: [] },
    Manager_Level1_Approvers: { value: [] },
    Manager_Level1_Approval_Rule: { value: '' },
    GM_Level1_Approvers: { value: [] },
    GM_Level1_Approval_Rule: { value: '' },
    Has_Manager_Level2: { value: '' },
    Has_GM_Level2: { value: '' },
    Routing_Topology: { value: '' },
    Frozen_Profile_Code: { value: '' },
    K_expected_Snapshot: { value: '' },
    Effective_Routing_Key: { value: '' },
    Effective_Route_Version_Key: { value: '' },
    Effective_Scorer_Slots_Snapshot: { value: '' },
    First_Manager_User: { value: [] },
    Manager_User: { value: [] },
    GM_User: { value: [] },
    Profile_Code: { value: '' },
    PartA_Weight: { value: '' },
    PartB_Weight: { value: '' },
    Part_A_Scoring_Mode: { value: '' },
    Competency_Set_Code: { value: '' },
    Configuration_Hash: { value: '' }
  };

  const createEvent = {
    type: 'app.record.create.show',
    record: record
  };

  // Execute create show handler
  const handlerResult = eventCallback(createEvent);

  // If handler returns a Promise, await it
  let returnedEvent;
  try {
    returnedEvent = (handlerResult && typeof handlerResult.then === 'function')
      ? await handlerResult
      : handlerResult;
  } catch (err) {
    console.error('HANDLER EXECUTION THREW:', err);
    throw err;
  }

  // A. PROOF: kintone.app.record.get() & kintone.app.record.set() call count during handler MUST BE 0
  assert.equal(recordGetCalls, 0, 'CREATE_AUTOLOAD_RECORD_GET_CALLS must equal 0');
  assert.equal(recordSetCalls, 0, 'CREATE_AUTOLOAD_RECORD_SET_CALLS must equal 0');

  // B. PROOF: event.record populated in-memory
  assert.equal(returnedEvent.record.Employee_Code.value, '0113');
  assert.equal(returnedEvent.record.Employee_Name.value, 'Somchai Jaidee');
  assert.equal(returnedEvent.record.Fiscal_Year.value, 'FY2026');
  assert.equal(returnedEvent.record.Record_Key.value, 'FY2026-0113');
  assert.deepEqual(returnedEvent.record.Requester_User.value, [{ code: 's1' }]);
  assert.equal(returnedEvent.record.Routing_Topology.value, 'M1_ONLY');
  assert.equal(returnedEvent.record.Profile_Code.value, 'PROF_GM');
  assert.equal(returnedEvent.record.PartA_Weight.value, 70);
  assert.equal(returnedEvent.record.PartB_Weight.value, 30);
  assert.equal(returnedEvent.record.Competency_Set_Code.value, 'COMP_SET_MGMT');
  assert.equal(returnedEvent.record.Configuration_Hash.value, '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');

  // C. PROOF: Active UI verified state
  const activeUi = globalThis.getActiveUiInstance();
  assert.ok(activeUi, 'getActiveUiInstance must return active UI instance');
  assert.equal(activeUi.isEmployeeVerified, true, 'active UI isEmployeeVerified must be true');

  // E. PROOF: Post-handler interactive sync preserved
  // Override kintone.app.record.get/set to return valid object to test post-handler sync behavior
  let postSyncCalls = 0;
  globalThis.kintone.app.record.get = () => ({ record: returnedEvent.record });
  globalThis.kintone.app.record.set = ({ record: newRec }) => { postSyncCalls++; };

  // Simulate subsequent user interactive edit
  assert.equal(typeof activeUi.onFieldChange, 'function', 'activeUi.onFieldChange must be a function');
  activeUi.onFieldChange('Fiscal_Year', 'FY2026');
  assert.ok(postSyncCalls > 0, 'Post-handler interactive sync must reach kintone.app.record.set');
});

test('Create Handler Form State Corrective: Lookup failure path remains fail-closed with 0 kintone.app.record.get/set calls', async () => {
  let recordGetCalls = 0;
  let recordSetCalls = 0;
  let eventCallback = null;

  globalThis.document = {
    getElementById: () => createMockElement(),
    querySelector: (sel) => {
      if (sel === '.gaia-app-wrapper') return createMockElement();
      return null;
    },
    body: createMockElement(),
    createElement: () => createMockElement()
  };

  globalThis.kintone = {
    app: {
      getId: () => 794,
      getHeaderSpaceElement: () => createMockElement(),
      record: {
        getSpaceElement: () => createMockElement(),
        getHeaderMenuSpaceElement: () => createMockElement(),
        get: () => { recordGetCalls++; throw new Error('FORBIDDEN'); },
        set: () => { recordSetCalls++; throw new Error('FORBIDDEN'); },
        setFieldShown: () => {}
      }
    },
    getLoginUser: () => ({ code: 's1', name: 'Unknown' }),
    api: Object.assign(
      async (url, method, params) => {
        const app = params?.app;
        const RAW_TOKEN_999 = '9999999999abcdef9999999999abcdef9999999999abcdef9999999999abcdef';
        const HASH_999 = crypto.createHash('sha256').update(RAW_TOKEN_999).digest('hex');

        if (app === 801) {
          return {
            records: [{
              Employee_Code: { value: '9999' },
              Account_Status: { value: 'ACTIVE' },
              Force_Password_Change: { value: 'NO' },
              Credential_Version: { value: '1' },
              Session_Credential_Version: { value: '1' },
              Session_Token_Hash: { value: HASH_999 },
              Session_Issued_At: { value: new Date().toISOString() },
              Session_Expires_At: { value: new Date(Date.now() + 3600000).toISOString() },
              Session_Kintone_User: { value: 's1' }
            }]
          };
        }
        if (app === 53) {
          const query = String(params?.query || '');

          // Shared-login eligibility is a separate fail-closed gate.
          // Explicitly prove that employee 9999 has no dedicated Kintone user.
          if (query.includes('Number_0 = 1')) {
            return {
              records: [{
                emp_text: { value: '9999' },
                MBO_Kintone_User: { value: [] }
              }]
            };
          }

          // Preserve the original purpose of this test:
          // the subsequent Employee lookup must fail as not found.
          return { records: [] };
        }
        return { records: [] };
      },
      { url: (path) => path }
    ),
    events: {
      on: (events, handler) => {
        const evList = Array.isArray(events) ? events : [events];
        if (evList.includes('app.record.create.show')) {
          eventCallback = handler;
        }
      }
    }
  };

  const RAW_TOKEN_999 = '9999999999abcdef9999999999abcdef9999999999abcdef9999999999abcdef';
  const HASH_999 = crypto.createHash('sha256').update(RAW_TOKEN_999).digest('hex');

  const mockStorage = new Map();
  mockStorage.set('ttmet.mbo794.session.v1', RAW_TOKEN_999);

  const storageObj2 = {
    getItem: (k) => mockStorage.get(k) || null,
    setItem: (k, v) => mockStorage.set(k, String(v)),
    removeItem: (k) => mockStorage.delete(k)
  };
  globalThis.localStorage = storageObj2;
  globalThis.sessionStorage = storageObj2;

  const bundleCode = loadBundleForDeterministicBusinessDate();
  new Function(bundleCode)();

  const record = { Employee_Code: { value: '' } };
  const createEvent = { type: 'app.record.create.show', record };

  const handlerResult = eventCallback(createEvent);
  const returnedEvent = (handlerResult && typeof handlerResult.then === 'function')
    ? await handlerResult
    : handlerResult;

  // D. PROOF: Failure path makes 0 forbidden record.get/set calls
  assert.equal(recordGetCalls, 0, 'Failure path must make 0 record.get calls');
  assert.equal(recordSetCalls, 0, 'Failure path must make 0 record.set calls');

  const activeUi = globalThis.getActiveUiInstance();
  assert.ok(activeUi, 'getActiveUiInstance must return active UI instance');
  assert.equal(activeUi.isEmployeeVerified, false, 'Failed lookup must leave isEmployeeVerified = false');
});
