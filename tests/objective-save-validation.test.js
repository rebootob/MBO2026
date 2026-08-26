import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { resolveProfileCode } from '../src/profiles/profile-scoring-resolver.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';

const makeMockElement = () => ({
  innerHTML: '',
  appendChild: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  style: {}
});

const kintoneHandlers = {};
let currentFormRecord = null;
let getApiOverride = null;
let setApiOverride = null;

const fakeApi = async () => ({ records: [] });
fakeApi.url = (path) => path;

globalThis.kintone = {
  app: {
    getId: () => 794,
    record: {
      setFieldShown: () => {},
      getSpaceElement: makeMockElement,
      getHeaderMenuSpaceElement: makeMockElement,
      get: (...args) => {
        if (typeof getApiOverride === 'function') return getApiOverride(...args);
        return currentFormRecord ? { record: currentFormRecord } : null;
      },
      set: (...args) => {
        if (typeof setApiOverride === 'function') return setApiOverride(...args);
        if (!args[0] || !args[0].record) throw new Error('Invalid set data');
        currentFormRecord = args[0].record;
      }
    }
  },
  getLoginUser: () => ({ code: 'req1' }),
  api: fakeApi,
  events: {
    on: (events, handler) => {
      const list = Array.isArray(events) ? events : [events];
      list.forEach(evt => { kintoneHandlers[evt] = handler; });
    }
  }
};
globalThis.document = {
  createElement: makeMockElement,
  getElementById: () => null
};

const { getActiveUiInstance, syncRecordToKintone } = await import('../src/main-mbo-app.js');

function createMockRecord(overrides = {}) {
  const base = {
    Employee_Code: { value: '0118' },
    Employee_Name: { value: 'Mr. Peranut Hanpratum' },
    Employee_Section: { value: 'TMS1' },
    Employee_Position: { value: 'Technical Service Chief' },
    Fiscal_Year: { value: 'FY2026' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    PartA_Weight: { value: '70' },
    PartB_Weight: { value: '30' },
    Part_A_Scoring_Mode: { value: 'DIFFICULTY_ACHIEVEMENT_MATRIX' },
    Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
    Configuration_Hash: { value: 'hash0118' },
    Routing_Topology: { value: 'SINGLE_MANAGER' },
    Requester_User: { value: [{ code: 's1' }] },
    Record_Key: { value: 'REC0118' },
    Objective_Count: { value: '4' },

    Objective_1: { value: 'Achieve sales KPI' },
    Action_Plan_1: { value: 'Visit 5 clients per week' },
    Weight_1: { value: '30' },
    Difficulty_1: { value: '3' },

    Objective_2: { value: 'Improve service quality' },
    Action_Plan_2: { value: 'Conduct customer surveys' },
    Weight_2: { value: '30' },
    Difficulty_2: { value: '2' },

    Objective_3: { value: 'Team development' },
    Action_Plan_3: { value: 'Train junior engineers' },
    Weight_3: { value: '20' },
    Difficulty_3: { value: '2' },

    Objective_4: { value: 'Safety compliance' },
    Action_Plan_4: { value: 'Zero accident workplace' },
    Weight_4: { value: '20' },
    Difficulty_4: { value: '2' }
  };

  return { ...base, ...overrides };
}

function createBlankFormStateRecord(overrides = {}) {
  return createMockRecord({
    Profile_Code: { value: '' },
    PartA_Weight: { value: '' },
    PartB_Weight: { value: '' },
    Part_A_Scoring_Mode: { value: '' },
    Competency_Set_Code: { value: '' },
    Configuration_Hash: { value: '' },
    Routing_Topology: { value: '' },
    Requester_User: { value: [] },
    Record_Key: { value: '' },
    ...overrides
  });
}

function setupMockKintoneApis() {
  getApiOverride = null;
  setApiOverride = null;
  const mockApi = async (path, method, body) => {
    if (path.includes('app/form/fields')) return { properties: {} };
    if (path.includes('/k/v1/records') || path.includes('records.json')) {
      if (body?.app === 53 || path.includes('app=53') || body?.query?.includes('emp_text')) {
        return {
          records: [{
            emp_text: { value: '0118' },
            Number: { value: '118' },
            Text: { value: 'Mr. Peranut Hanpratum' },
            Text_0: { value: 'นายพีรณัฐ' },
            Drop_down_0: { value: 'Technical Services' },
            Drop_down: { value: 'TMS1' },
            Text_2: { value: 'Technical Service Chief' },
            Text_4: { value: 'peranut@example.invalid' },
            Date: { value: '2022-01-01' }
          }]
        };
      }
      if (body?.app === 795 || path.includes('app=795') || body?.query?.includes('Section_Code')) {
        return {
          records: [{
            Section_Code: { value: 'TMS1' },
            Requester_User: { value: [{ code: 'req1' }] },
            Manager_Level1_Approvers: { value: [{ code: 'm1' }] },
            Manager_Level1_Approval_Rule: { value: 'ALL' },
            Manager_Level2_Approvers: { value: [] },
            Manager_Level2_Approval_Rule: { value: 'ANY' },
            GM_Level1_Approvers: { value: [{ code: 'g1' }] },
            GM_Level1_Approval_Rule: { value: 'ALL' },
            GM_Level2_Approvers: { value: [] },
            GM_Level2_Approval_Rule: { value: 'ANY' },
            Has_Manager_Level2: { value: 'NO' },
            Has_GM_Level2: { value: 'NO' },
            Routing_Topology: { value: 'M1_G1' },
            First_Manager_User: { value: [] },
            Manager_User: { value: [{ code: 'm1' }] },
            GM_User: { value: [{ code: 'g1' }] }
          }]
        };
      }
      if (body?.app === 796 || path.includes('app=796') || body?.query?.includes('Profile_Code')) {
        return {
          records: [{
            Profile_Code: { value: 'PROF_STAFF_CHIEF' },
            Fiscal_Year: { value: 'FY2026' },
            PartA_Weight: { value: '70' },
            PartB_Weight: { value: '30' },
            Part_A_Scoring_Mode: { value: 'DIFFICULTY_ACHIEVEMENT_MATRIX' },
            Competency_Set_Code: { value: 'COMP_SET_OPERATIONAL_V1' },
            Configuration_Hash: { value: '24e18411485c875a6988de51b61f481206dc159b5e1b2768c6a0b09ff40a72da' }
          }]
        };
      }
    }
    return { records: [] };
  };
  mockApi.url = (path) => path;
  globalThis.kintone.api = mockApi;
}

const fakeApp53 = position => ({
  url: path => path,
  async getRecords() {
    return {
      records: [{
        emp_text: { value: '0149' },
        Number: { value: '149' },
        Text: { value: 'Test Employee' },
        Text_0: { value: 'พนักงานทดสอบ' },
        Drop_down_0: { value: 'Test Department' },
        Drop_down: { value: 'TME1' },
        Text_2: { value: position },
        Text_4: { value: 'test@example.invalid' },
        Date: { value: '2021-04-01' }
      }]
    };
  }
});

async function makeVerifiedSnapshot(pos) {
  const res = await EmployeeService.lookupEmployee('0149', fakeApp53(pos));
  return res.employee;
}

test('M10L: Valid verified record + 4 objectives + 100% total weight passes validation', () => {
  const record = createMockRecord();
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, true);
  assert.equal(res.fieldErrors.length, 0);
});

test('M10L-R1: Missing Profile_Code, Routing_Topology, or empty Requester_User [] blocks save', () => {
  const r1 = createMockRecord({ Profile_Code: { value: '' } });
  assert.equal(ValidationEngine.validate(r1, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);

  const r2 = createMockRecord({ Routing_Topology: { value: '' } });
  assert.equal(ValidationEngine.validate(r2, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);

  const r3 = createMockRecord({ Requester_User: { value: [] } });
  assert.equal(ValidationEngine.validate(r3, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);
});

test('M10L-R3: Completely missing Requester_User field or null value blocks save', () => {
  const r1 = createMockRecord();
  delete r1.Requester_User;
  assert.equal(ValidationEngine.validate(r1, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);

  const r2 = createMockRecord({ Requester_User: null });
  assert.equal(ValidationEngine.validate(r2, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);

  const r3 = createMockRecord({ Requester_User: { value: null } });
  assert.equal(ValidationEngine.validate(r3, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);
});

test('M10L-R2: Malformed non-array Requester_User (string/object/number) blocks save', () => {
  const r1 = createMockRecord({ Requester_User: { value: 'user1' } });
  assert.equal(ValidationEngine.validate(r1, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);

  const r2 = createMockRecord({ Requester_User: { value: { code: 'user1' } } });
  assert.equal(ValidationEngine.validate(r2, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);

  const r3 = createMockRecord({ Requester_User: { value: 123 } });
  assert.equal(ValidationEngine.validate(r3, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, false);
});

test('M10L-R1: Requester_User populated array allows validation when other fields valid', () => {
  const r1 = createMockRecord({ Requester_User: { value: [{ code: 'user1' }] } });
  assert.equal(ValidationEngine.validate(r1, BUSINESS_STAGES.OBJECTIVE_INPUT).isValid, true);
});

test('M10L-R2: Create mode EmployeePartAUI starts unverified even if Employee_Name/Section are prefilled', () => {
  const recordWithPrefills = createMockRecord();
  const createUi = new EmployeePartAUI({
    isCreate: true,
    record: recordWithPrefills
  });
  assert.equal(createUi.isEmployeeVerified, false);
});

test('M10L-R2: Edit mode EmployeePartAUI starts verified for existing saved records', () => {
  const recordWithPrefills = createMockRecord();
  const editUi = new EmployeePartAUI({
    isCreate: false,
    record: recordWithPrefills
  });
  assert.equal(editUi.isEmployeeVerified, true);
});

test('M10L: Missing Objective text blocks save', () => {
  const record = createMockRecord({ Objective_2: { value: '' } });
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some(e => e.field === 'Objective_2'));
});

test('M10L: Missing Action Plan blocks save', () => {
  const record = createMockRecord({ Action_Plan_3: { value: '   ' } });
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some(e => e.field === 'Action_Plan_3'));
});

test('M10L: Invalid Difficulty Level (< 1 or > 4) blocks save', () => {
  const record = createMockRecord({ Difficulty_1: { value: '5' } });
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some(e => e.field === 'Difficulty_1'));
});

test('M10L: Blank or non-numeric Weight blocks save', () => {
  const record = createMockRecord({ Weight_1: { value: 'abc' } });
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some(e => e.field === 'Weight_1'));
});

test('M10L: Total Weight != 100% blocks save', () => {
  const record = createMockRecord({ Weight_4: { value: '15' } });
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some(e => e.field === 'Total_Weight'));
});

test('M10L: Hidden/inactive objective rows are cleared and do not leak into record', () => {
  const record = createMockRecord({
    Objective_Count: { value: '2' },
    Weight_1: { value: '50' },
    Weight_2: { value: '50' },
    Objective_3: { value: 'Stale objective 3' },
    Action_Plan_3: { value: 'Stale action 3' },
    Weight_3: { value: '20' },
    Difficulty_3: { value: '2' }
  });

  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, true);
  assert.equal(record.Objective_3.value, '');
  assert.equal(record.Action_Plan_3.value, '');
  assert.equal(record.Weight_3.value, '');
  assert.equal(record.Difficulty_3.value, '');
});

test('M10L-R1: checkDuplicateMBO fails closed when duplicate found', async () => {
  const dupApi = {
    async getRecords() {
      return { records: [{ $id: { value: '99' } }] };
    }
  };
  await assert.rejects(
    async () => EmployeeService.checkDuplicateMBO(794, 'FY2026', '0118', null, dupApi),
    err => err.message.includes('0118') && err.message.includes('FY2026')
  );
});

test('M10L-R1: checkDuplicateMBO fails closed on GET error or malformed response', async () => {
  const errorApi = {
    async getRecords() {
      throw new Error('Network error');
    }
  };
  await assert.rejects(
    async () => EmployeeService.checkDuplicateMBO(794, 'FY2026', '0118', null, errorApi),
    err => err.message.includes('ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้')
  );

  const malformedApi = {
    async getRecords() {
      return null;
    }
  };
  await assert.rejects(
    async () => EmployeeService.checkDuplicateMBO(794, 'FY2026', '0118', null, malformedApi),
    err => err.message.includes('ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้')
  );
});

test('M10L-R1: checkDuplicateMBO succeeds on zero duplicate records', async () => {
  const mockApi = {
    async getRecords() {
      return { records: [] };
    }
  };
  await assert.doesNotReject(
    async () => EmployeeService.checkDuplicateMBO(794, 'FY2026', '0118', null, mockApi)
  );
});

test('M10L: Profile resolver regressions (0111, 0118, Factory Manager)', async () => {
  const asstMgr = await makeVerifiedSnapshot('Assistant Section Manager');
  assert.equal(resolveProfileCode(asstMgr), 'PROF_ASST_MGR');

  const chief = await makeVerifiedSnapshot('Technical Service Chief');
  assert.equal(resolveProfileCode(chief), 'PROF_STAFF_CHIEF');

  const factoryMgr = await makeVerifiedSnapshot('Factory Manager');
  assert.equal(resolveProfileCode(factoryMgr), 'PROF_GM');
});

test('M10L-R3: Runtime submit hook blocks save (returns false) when activeUiInstance is null/unavailable', async () => {
  const submitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof submitHook === 'function');

  const validRecord = createMockRecord();
  const event = { type: 'app.record.create.submit', record: validRecord };
  const res = await submitHook(event);
  assert.equal(res, false, 'Submit must return false (block save) when activeUiInstance is missing/null');
});

test('M10L-R3: Runtime submit hook proceeds (returns event) for valid existing Edit save with verified activeUiInstance', async () => {
  const showHook = kintoneHandlers['app.record.edit.show'];
  const submitHook = kintoneHandlers['app.record.edit.submit'];
  assert.ok(typeof showHook === 'function');
  assert.ok(typeof submitHook === 'function');

  const editRecord = createMockRecord({ $id: { value: '10' }, Status: { value: '01 Draft Objective' } });
  currentFormRecord = editRecord;
  const showEvent = { type: 'app.record.edit.show', record: editRecord };
  showHook(showEvent);

  const submitEvent = { type: 'app.record.edit.submit', record: editRecord };
  const res = await submitHook(submitEvent);

  assert.equal(res, submitEvent, 'Valid Edit submit must return event object when UI is verified and validation passes');
});

test('M10L-D-R4: Employee 0118 Technical Service Chief lookup populates all 9 snapshot fields into form state and passes post-set read-back', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const submitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof showHook === 'function');

  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);

  const ui = getActiveUiInstance();
  assert.ok(ui, 'getActiveUiInstance must return active UI instance');
  assert.equal(ui.isEmployeeVerified, false, 'Create UI must start unverified');

  // Execute lookup
  await ui.executeLookup('0118');

  // Verify form state read-back contains populated snapshot fields
  assert.equal(currentFormRecord.Profile_Code.value, 'PROF_STAFF_CHIEF');
  assert.equal(String(currentFormRecord.PartA_Weight.value), '70');
  assert.equal(String(currentFormRecord.PartB_Weight.value), '30');
  assert.equal(currentFormRecord.Part_A_Scoring_Mode.value, 'DIFFICULTY_ACHIEVEMENT_MATRIX');
  assert.equal(currentFormRecord.Competency_Set_Code.value, 'COMP_SET_OPERATIONAL_V1');
  assert.equal(currentFormRecord.Configuration_Hash.value, '24e18411485c875a6988de51b61f481206dc159b5e1b2768c6a0b09ff40a72da');
  assert.equal(currentFormRecord.Routing_Topology.value, 'M1_G1');
  assert.deepEqual(currentFormRecord.Requester_User.value, [{ code: 'req1' }]);
  assert.ok(currentFormRecord.Record_Key.value);

  // Verify UI verification state
  assert.equal(ui.isEmployeeVerified, true, 'isEmployeeVerified must become true after successful form-state persistence');

  // Verify business record payload contains ZERO test pollution
  assert.equal(rawRecord._uiOptions, undefined);
  assert.equal(rawRecord._uiInstance, undefined);

  // Submit hook must proceed
  const submitEvent = { type: 'app.record.create.submit', record: rawRecord };
  const res = await submitHook(submitEvent);
  assert.equal(res, submitEvent);
});

test('M10L-D-R4: Lookup fails closed when Profile_Code is absent from Kintone form state schema', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  const submitHook = kintoneHandlers['app.record.create.submit'];
  assert.ok(typeof showHook === 'function');

  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  // Kintone form state is missing Profile_Code field
  currentFormRecord = createBlankFormStateRecord();
  delete currentFormRecord.Profile_Code;

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('ไม่พบช่องข้อมูล Profile_Code ในแบบฟอร์ม (App 794)')
  );

  assert.equal(currentFormRecord.Profile_Code, undefined, 'Profile_Code must NOT be synthetically created on form state');
  assert.equal(ui.isEmployeeVerified, false, 'UI must remain unverified');

  const submitEvent = { type: 'app.record.create.submit', record: rawRecord };
  const res = await submitHook(submitEvent);
  assert.equal(res, false, 'Submit must return false when UI is unverified');
});

test('M10L-D-R5: Lookup fails closed when kintone.app.record.get is not a function', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  const originalGet = globalThis.kintone.app.record.get;
  globalThis.kintone.app.record.get = undefined;

  try {
    await assert.rejects(
      async () => ui.executeLookup('0118'),
      err => err.message.includes('Kintone record get/set API functions are unavailable')
    );
    assert.equal(ui.isEmployeeVerified, false);
  } finally {
    globalThis.kintone.app.record.get = originalGet;
  }
});

test('M10L-D-R5: Lookup fails closed when kintone.app.record.set is not a function', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  const originalSet = globalThis.kintone.app.record.set;
  globalThis.kintone.app.record.set = undefined;

  try {
    await assert.rejects(
      async () => ui.executeLookup('0118'),
      err => err.message.includes('Kintone record get/set API functions are unavailable')
    );
    assert.equal(ui.isEmployeeVerified, false);
  } finally {
    globalThis.kintone.app.record.set = originalSet;
  }
});

test('M10L-D-R5: Lookup fails closed when kintone.app.record.get returns null (missing form state)', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  getApiOverride = () => null;

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('Current Kintone form record object is unavailable')
  );

  assert.equal(ui.isEmployeeVerified, false);
});

test('M10L-D-R4: Lookup fails closed when kintone.app.record.set throws an exception', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  setApiOverride = () => { throw new Error('Kintone set API permission error'); };

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('kintone.app.record.set failed')
  );

  assert.equal(ui.isEmployeeVerified, false);
});

test('M10L-D-R4: Lookup fails closed when kintone.app.record.set is a no-op and read-back retains old value', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord({ Routing_Topology: { value: 'OLD_TOPOLOGY' } });

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  // setApi does nothing -> currentFormRecord remains unchanged with OLD_TOPOLOGY
  setApiOverride = () => {};

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('Form state read-back mismatch for field')
  );

  assert.equal(ui.isEmployeeVerified, false);
});

test('M10L-D-R4: Lookup fails closed when required scoring snapshot field (Configuration_Hash) is missing from Kintone schema', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();
  delete currentFormRecord.Configuration_Hash;

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('ไม่พบช่องข้อมูล Configuration_Hash ในแบบฟอร์ม (App 794)')
  );

  assert.equal(ui.isEmployeeVerified, false);
});

test('M10L-D-R4: Employee lookup fails closed if App 796 scoring query finds 0 published configs', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();

  // Override scoring query to return 0 records
  const baseApi = globalThis.kintone.api;
  globalThis.kintone.api = async (path, method, body) => {
    if (path.includes('app=796') || body?.app === 796) return { records: [] };
    return baseApi(path, method, body);
  };
  globalThis.kintone.api.url = (path) => path;

  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('ไม่พบการตั้งค่า Scoring Master')
  );
  assert.equal(ui.isEmployeeVerified, false);
});

test('M10L-D-R4: Employee lookup fails closed if App 796 scoring query finds duplicate published configs', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();

  // Override scoring query to return 2 records
  const baseApi = globalThis.kintone.api;
  globalThis.kintone.api = async (path, method, body) => {
    if (path.includes('app=796') || body?.app === 796) {
      return {
        records: [
          { Profile_Code: { value: 'PROF_STAFF_CHIEF' } },
          { Profile_Code: { value: 'PROF_STAFF_CHIEF' } }
        ]
      };
    }
    return baseApi(path, method, body);
  };
  globalThis.kintone.api.url = (path) => path;

  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord();

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  await assert.rejects(
    async () => ui.executeLookup('0118'),
    err => err.message.includes('พบการตั้งค่า Scoring Master (App 796) ซ้ำซ้อน')
  );
  assert.equal(ui.isEmployeeVerified, false);
});

test('M10L-D-R6: app.record.detail.process.proceed handler returns exact event on valid validation', async () => {
  const proceedHook = kintoneHandlers['app.record.detail.process.proceed'];
  assert.ok(typeof proceedHook === 'function', 'process.proceed hook must be registered');

  const validRecord = createMockRecord({ Status: { value: '01 Draft Objective' } });
  const proceedEvent = {
    type: 'app.record.detail.process.proceed',
    record: validRecord,
    action: { value: 'Submit to Manager' }
  };

  const res = proceedHook(proceedEvent);
  assert.equal(res, proceedEvent, 'process.proceed hook must return exact event object when valid');
});

test('M10L-D-R6: app.record.detail.process.proceed handler returns false on invalid validation', async () => {
  const proceedHook = kintoneHandlers['app.record.detail.process.proceed'];
  assert.ok(typeof proceedHook === 'function', 'process.proceed hook must be registered');

  const invalidRecord = createMockRecord({
    PartA_Objectives: {
      type: 'SUBTABLE',
      value: [
        { id: '1', value: { Weight: { value: '50' } } }
      ]
    }
  });

  const proceedEvent = {
    type: 'app.record.detail.process.proceed',
    record: invalidRecord,
    status: 'SUBMITTED'
  };

  const res = proceedHook(proceedEvent);
  assert.equal(res, false, 'process.proceed hook must return false when validation fails');
});
