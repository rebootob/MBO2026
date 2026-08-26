import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { resolveProfileCode } from '../src/profiles/profile-scoring-resolver.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { EmployeePartAUI, escapeHtml, formatUserDisplay, getStatusGuidance, getMacroStage } from '../src/ui/employee-part-a-ui.js';

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
        const rec = args[0].record;
        for (const [code, fieldObj] of Object.entries(rec)) {
          if (fieldObj && fieldObj.value === undefined) {
            throw new Error(`event.record['${code}'].value is invalid.`);
          }
        }
        currentFormRecord = rec;
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
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] },
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
    action: { value: 'Submit Objective to Manager' }
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

test('M10L-D-R10: Employee lookup does not assign undefined Hoshin and preserves existing Hoshin & Routing_Topology read-back', async () => {
  const showHook = kintoneHandlers['app.record.create.show'];
  setupMockKintoneApis();
  const rawRecord = createMockRecord();
  currentFormRecord = createBlankFormStateRecord({
    Department_Hoshin: { value: 'PRESERVED_DEPT_HOSHIN' },
    Section_Hoshin: { value: 'PRESERVED_SEC_HOSHIN' }
  });

  const showEvent = { type: 'app.record.create.show', record: rawRecord };
  showHook(showEvent);
  const ui = getActiveUiInstance();

  await ui.executeLookup('0118');

  assert.equal(ui.isEmployeeVerified, true, '0118 lookup must verify successfully');
  assert.equal(currentFormRecord.Routing_Topology.value, 'M1_G1', 'Routing_Topology must persist and read back as M1_G1');
  assert.equal(currentFormRecord.Profile_Code.value, 'PROF_STAFF_CHIEF', 'Profile_Code must persist as PROF_STAFF_CHIEF');
  assert.equal(currentFormRecord.PartA_Weight.value, 70, 'PartA_Weight must persist as 70');
  assert.equal(currentFormRecord.PartB_Weight.value, 30, 'PartB_Weight must persist as 30');
  assert.equal(currentFormRecord.Department_Hoshin.value, 'PRESERVED_DEPT_HOSHIN', 'Existing Department_Hoshin value must be preserved');
  assert.equal(currentFormRecord.Section_Hoshin.value, 'PRESERVED_SEC_HOSHIN', 'Existing Section_Hoshin value must be preserved');

  // Verify no field in currentFormRecord has value === undefined
  for (const [code, fieldObj] of Object.entries(currentFormRecord)) {
    assert.notEqual(fieldObj?.value, undefined, `Field ${code} in form state must not have value === undefined`);
  }
});

test('M10L-D-R12B: STATUS_TO_STAGE_MAP covers all 16 exact live statuses and rejects 5 stale aliases', async () => {
  const { STATUS_TO_STAGE_MAP, BUSINESS_STAGES } = await import('../src/config/constants.js');

  const expected16 = [
    '01 Draft Objective',
    '02 First Manager Objective Review',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '05 Objective Approved',
    '06 Employee Mid-Year',
    '07 First Manager Mid-Year Review',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '10 Mid-Year Completed',
    '11 Employee Self Evaluation',
    '12 First Manager Final Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ];

  expected16.forEach(st => {
    assert.ok(st in STATUS_TO_STAGE_MAP, `STATUS_TO_STAGE_MAP must recognize exact live status: ${st}`);
    assert.notEqual(STATUS_TO_STAGE_MAP[st], BUSINESS_STAGES.CONFIGURATION_ERROR);
  });

  const staleAliases = [
    '10 Mid-Year Approved',
    '12 First Manager Evaluation',
    '13 Manager Evaluation',
    '14 GM Evaluation',
    '15 Evaluation Completed'
  ];

  staleAliases.forEach(alias => {
    assert.equal(STATUS_TO_STAGE_MAP[alias], undefined, `Stale alias "${alias}" must not exist in STATUS_TO_STAGE_MAP`);
  });
});

test('M10L-D-R12B: Workflow action validation enforces fail-closed topology & assignee guards', async () => {
  const proceedHook = kintoneHandlers['app.record.detail.process.proceed'];
  assert.ok(typeof proceedHook === 'function', 'process.proceed hook must be registered');

  const validRecordM1G1 = createMockRecord({
    Status: { value: '01 Draft Objective' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });

  // 1. M1_G1 + Direct Manager Submit -> PASS
  const passEvent1 = {
    type: 'app.record.detail.process.proceed',
    record: validRecordM1G1,
    action: { value: 'Submit Objective to Manager' }
  };
  assert.equal(proceedHook(passEvent1), passEvent1, 'M1_G1 + direct Manager submit must pass');

  // 2. M1_G1 + First Manager Submit -> FAIL CLOSED
  const failEvent1 = {
    type: 'app.record.detail.process.proceed',
    record: validRecordM1G1,
    action: { value: 'Submit Objective to First Manager' }
  };
  assert.equal(proceedHook(failEvent1), false, 'M1_G1 + First Manager submit must fail closed');

  // 3. M1_M2_G1 + First Manager Submit with populated First_Manager_User -> PASS
  const validRecordM2 = createMockRecord({
    Status: { value: '01 Draft Objective' },
    Routing_Topology: { value: 'M1_M2_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    First_Manager_User: { value: [{ code: 'fm1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const passEvent2 = {
    type: 'app.record.detail.process.proceed',
    record: validRecordM2,
    action: { value: 'Submit Objective to First Manager' }
  };
  assert.equal(proceedHook(passEvent2), passEvent2, 'M1_M2_G1 + First Manager submit must pass when First_Manager_User populated');

  // 4. M1_M2_G1 + Direct Manager Submit -> FAIL CLOSED
  const failEvent2 = {
    type: 'app.record.detail.process.proceed',
    record: validRecordM2,
    action: { value: 'Submit Objective to Manager' }
  };
  assert.equal(proceedHook(failEvent2), false, 'M1_M2_G1 + direct Manager submit must fail closed');

  // 5. M1_M2_G1 + First Manager Submit with EMPTY First_Manager_User -> FAIL CLOSED
  const invalidRecordM2EmptyFM = createMockRecord({
    Status: { value: '01 Draft Objective' },
    Routing_Topology: { value: 'M1_M2_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    First_Manager_User: { value: [] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const failEvent3 = {
    type: 'app.record.detail.process.proceed',
    record: invalidRecordM2EmptyFM,
    action: { value: 'Submit Objective to First Manager' }
  };
  assert.equal(proceedHook(failEvent3), false, 'M1_M2_G1 with empty First_Manager_User must fail closed');

  // 6. G2 Topology Entry -> FAIL CLOSED
  const invalidRecordG2 = createMockRecord({
    Status: { value: '01 Draft Objective' },
    Routing_Topology: { value: 'M1_G1_G2' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const failEvent4 = {
    type: 'app.record.detail.process.proceed',
    record: invalidRecordG2,
    action: { value: 'Submit Objective to Manager' }
  };
  assert.equal(proceedHook(failEvent4), false, 'G2 topology entry must fail closed');

  // 7. Valid M1_G1 Manager/GM Approve & Return actions remain PASS
  const approveRecordManager = createMockRecord({
    Status: { value: '03 Manager Objective Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const passApproveManager = {
    type: 'app.record.detail.process.proceed',
    record: approveRecordManager,
    action: { value: 'Approve Objective' }
  };
  assert.equal(proceedHook(passApproveManager), passApproveManager, 'Manager Approve Objective must pass on M1_G1');

  const returnRecordManager = createMockRecord({
    Status: { value: '03 Manager Objective Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const passReturnManager = {
    type: 'app.record.detail.process.proceed',
    record: returnRecordManager,
    action: { value: 'Return Objective' }
  };
  assert.equal(proceedHook(passReturnManager), passReturnManager, 'Manager Return Objective must pass on M1_G1');

  // 8. Unknown Status -> FAIL CLOSED
  const unknownStatusRecord = createMockRecord({
    Status: { value: '99 Unknown Stage' },
    Routing_Topology: { value: 'M1_G1' }
  });
  const failUnknownStatus = {
    type: 'app.record.detail.process.proceed',
    record: unknownStatusRecord,
    action: { value: 'Submit Objective to Manager' }
  };
  assert.equal(proceedHook(failUnknownStatus), false, 'Unknown status must return false on process proceed');
});

test('M10L-D-R12B-R1: Topology whitelist and complete Requester_User handoff fail-closed guards', async () => {
  const proceedHook = kintoneHandlers['app.record.detail.process.proceed'];
  assert.ok(typeof proceedHook === 'function', 'process.proceed hook must be registered');

  // 1. Blank Routing_Topology + Mid-Year direct submit -> FAIL CLOSED
  const blankTopoRecord = createMockRecord({
    Status: { value: '06 Employee Mid-Year' },
    Routing_Topology: { value: '' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] }
  });
  const failBlankTopo = {
    type: 'app.record.detail.process.proceed',
    record: blankTopoRecord,
    action: { value: 'Submit Mid-Year to Manager' }
  };
  assert.equal(proceedHook(failBlankTopo), false, 'Blank topology must fail closed');

  // 2. Unknown Routing_Topology + Final direct submit -> FAIL CLOSED
  const unknownTopoRecord = createMockRecord({
    Status: { value: '11 Employee Self Evaluation' },
    Routing_Topology: { value: 'INVALID_TOPOLOGY' },
    Requester_User: { value: [{ code: 's1' }] },
    Manager_User: { value: [{ code: 'm1' }] }
  });
  const failUnknownTopo = {
    type: 'app.record.detail.process.proceed',
    record: unknownTopoRecord,
    action: { value: 'Submit Final to Manager' }
  };
  assert.equal(proceedHook(failUnknownTopo), false, 'Unknown topology must fail closed');

  // 3. Both G2 exact variants (M1_G1_G2 and M1_M2_G1_G2) -> FAIL CLOSED
  ['M1_G1_G2', 'M1_M2_G1_G2'].forEach(g2Topo => {
    const g2Record = createMockRecord({
      Status: { value: '01 Draft Objective' },
      Routing_Topology: { value: g2Topo },
      Requester_User: { value: [{ code: 's1' }] },
      First_Manager_User: { value: [{ code: 'fm1' }] },
      Manager_User: { value: [{ code: 'm1' }] },
      GM_User: { value: [{ code: 'g1' }] }
    });
    const failG2 = {
      type: 'app.record.detail.process.proceed',
      record: g2Record,
      action: { value: g2Topo.includes('M2') ? 'Submit Objective to First Manager' : 'Submit Objective to Manager' }
    };
    assert.equal(proceedHook(failG2), false, `G2 variant ${g2Topo} must fail closed`);
  });

  // 4. Status 04 GM Objective Review + Approve Objective: Empty Requester_User -> FAIL CLOSED; Populated -> PASS
  const status04EmptyRequester = createMockRecord({
    Status: { value: '04 GM Objective Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const failStatus04 = {
    type: 'app.record.detail.process.proceed',
    record: status04EmptyRequester,
    action: { value: 'Approve Objective' }
  };
  assert.equal(proceedHook(failStatus04), false, 'Status 04 Approve Objective with empty Requester_User must fail closed');

  const status04PopulatedRequester = createMockRecord({
    Status: { value: '04 GM Objective Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const passStatus04 = {
    type: 'app.record.detail.process.proceed',
    record: status04PopulatedRequester,
    action: { value: 'Approve Objective' }
  };
  assert.equal(proceedHook(passStatus04), passStatus04, 'Status 04 Approve Objective with populated Requester_User must pass');

  // 5. Status 05 Objective Approved + Start Mid-Year: Empty Requester_User -> FAIL CLOSED; Populated -> PASS
  const status05EmptyRequester = createMockRecord({
    Status: { value: '05 Objective Approved' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [] }
  });
  const failStatus05 = {
    type: 'app.record.detail.process.proceed',
    record: status05EmptyRequester,
    action: { value: 'Start Mid-Year' }
  };
  assert.equal(proceedHook(failStatus05), false, 'Status 05 Start Mid-Year with empty Requester_User must fail closed');

  const status05PopulatedRequester = createMockRecord({
    Status: { value: '05 Objective Approved' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] }
  });
  const passStatus05 = {
    type: 'app.record.detail.process.proceed',
    record: status05PopulatedRequester,
    action: { value: 'Start Mid-Year' }
  };
  assert.equal(proceedHook(passStatus05), passStatus05, 'Status 05 Start Mid-Year with populated Requester_User must pass');

  // 6. Status 09 GM Mid-Year Review + Approve Mid-Year GM: Empty Requester_User -> FAIL CLOSED; Populated -> PASS
  const status09EmptyRequester = createMockRecord({
    Status: { value: '09 GM Mid-Year Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const failStatus09 = {
    type: 'app.record.detail.process.proceed',
    record: status09EmptyRequester,
    action: { value: 'Approve Mid-Year GM' }
  };
  assert.equal(proceedHook(failStatus09), false, 'Status 09 Approve Mid-Year GM with empty Requester_User must fail closed');

  const status09PopulatedRequester = createMockRecord({
    Status: { value: '09 GM Mid-Year Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] },
    GM_User: { value: [{ code: 'g1' }] }
  });
  const passStatus09 = {
    type: 'app.record.detail.process.proceed',
    record: status09PopulatedRequester,
    action: { value: 'Approve Mid-Year GM' }
  };
  assert.equal(proceedHook(passStatus09), passStatus09, 'Status 09 Approve Mid-Year GM with populated Requester_User must pass');

  // 7. Status 10 Mid-Year Completed + Start Self Evaluation: Empty Requester_User -> FAIL CLOSED; Populated -> PASS
  const status10EmptyRequester = createMockRecord({
    Status: { value: '10 Mid-Year Completed' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [] }
  });
  const failStatus10 = {
    type: 'app.record.detail.process.proceed',
    record: status10EmptyRequester,
    action: { value: 'Start Self Evaluation' }
  };
  assert.equal(proceedHook(failStatus10), false, 'Status 10 Start Self Evaluation with empty Requester_User must fail closed');

  const status10PopulatedRequester = createMockRecord({
    Status: { value: '10 Mid-Year Completed' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [{ code: 's1' }] }
  });
  const passStatus10 = {
    type: 'app.record.detail.process.proceed',
    record: status10PopulatedRequester,
    action: { value: 'Start Self Evaluation' }
  };
  assert.equal(proceedHook(passStatus10), passStatus10, 'Status 10 Start Self Evaluation with populated Requester_User must pass');

  // 8. Representative Return action with empty Requester_User -> FAIL CLOSED
  const returnEmptyRequester = createMockRecord({
    Status: { value: '08 Manager Mid-Year Review' },
    Routing_Topology: { value: 'M1_G1' },
    Requester_User: { value: [] },
    Manager_User: { value: [{ code: 'm1' }] }
  });
  const failReturnEmptyRequester = {
    type: 'app.record.detail.process.proceed',
    record: returnEmptyRequester,
    action: { value: 'Return Mid-Year Manager' }
  };
  assert.equal(proceedHook(failReturnEmptyRequester), false, 'Return Mid-Year Manager with empty Requester_User must fail closed');
});

test('UI/UX V1 Candidate — Deterministic Status Guidance, Escaping & Presentation Safety', async (t) => {
  // 1. Exact 16 statuses have deterministic UI lifecycle & guidance presentation
  const all16Statuses = [
    '01 Draft Objective',
    '02 First Manager Objective Review',
    '03 Manager Objective Review',
    '04 GM Objective Review',
    '05 Objective Approved',
    '06 Employee Mid-Year',
    '07 First Manager Mid-Year Review',
    '08 Manager Mid-Year Review',
    '09 GM Mid-Year Review',
    '10 Mid-Year Completed',
    '11 Employee Self Evaluation',
    '12 First Manager Final Evaluation',
    '13 Manager Final Evaluation',
    '14 GM Final Evaluation',
    '15 HR Final Check',
    '16 Completed'
  ];

  all16Statuses.forEach(st => {
    const guidanceMap = getStatusGuidance(st, 'M1_G1');
    assert.ok(guidanceMap.th && guidanceMap.th.length > 0, `Status "${st}" must have Thai guidance text`);
    assert.ok(guidanceMap.en && guidanceMap.en.length > 0, `Status "${st}" must have English guidance text`);

    const stageNum = getMacroStage(st);
    assert.ok(stageNum >= 1 && stageNum <= 4, `Status "${st}" must map deterministically to macro stage 1-4`);
  });

  // 2. M1_G1 + First-Manager status produces configuration-warning presentation
  const fmObjectiveWarning = getStatusGuidance('02 First Manager Objective Review', 'M1_G1');
  assert.equal(fmObjectiveWarning.isWarning, true, 'Status 02 on M1_G1 must flag isWarning = true');
  assert.ok(fmObjectiveWarning.th.includes('ไม่ใช้ First Manager'), 'Warning TH must explain M1_G1 does not use First Manager');

  const fmMidYearWarning = getStatusGuidance('07 First Manager Mid-Year Review', 'M1_G1');
  assert.equal(fmMidYearWarning.isWarning, true, 'Status 07 on M1_G1 must flag isWarning = true');

  const fmFinalWarning = getStatusGuidance('12 First Manager Final Evaluation', 'M1_G1');
  assert.equal(fmFinalWarning.isWarning, true, 'Status 12 on M1_G1 must flag isWarning = true');

  // M2_G1 topology does not flag warning for First Manager status
  const fmM2Guidance = getStatusGuidance('02 First Manager Objective Review', 'M2_G1');
  assert.equal(fmM2Guidance.isWarning, false, 'Status 02 on M2_G1 must not be flagged as warning');

  // 3. User-list display prefers name then code
  assert.equal(formatUserDisplay([{ name: 'John Doe', code: '0123' }]), 'John Doe (0123)', 'User display must prefer Name (Code)');
  assert.equal(formatUserDisplay([{ code: '0123' }]), '0123', 'User display must fallback to Code if Name missing');
  assert.equal(formatUserDisplay([]), '-', 'User display must return - for empty user list');
  assert.equal(formatUserDisplay(null), '-', 'User display must return - for null user list');

  // 4. HTML Escaping neutralizes <, >, &, quotes, event-handler and closing-textarea payloads
  const payload1 = '<script>alert("XSS")</script>&\'';
  const escaped1 = escapeHtml(payload1);
  assert.equal(escaped1.includes('<script>'), false, 'Escaped output must not contain raw script tag');
  assert.equal(escaped1.includes('&lt;script&gt;'), true, 'Escaped output must convert < and > to entities');
  assert.equal(escaped1.includes('&amp;'), true, 'Escaped output must convert & to &amp;');
  assert.equal(escaped1.includes('&quot;'), true, 'Escaped output must convert double quote to &quot;');
  assert.equal(escaped1.includes('&#39;'), true, 'Escaped output must convert single quote to &#39;');

  const payload2 = '</textarea><img src=x onerror=alert(1)>';
  const escaped2 = escapeHtml(payload2);
  assert.equal(escaped2.includes('</textarea>'), false, 'Escaped output must neutralize closing textarea tag');
  assert.equal(escaped2.includes('&lt;/textarea&gt;'), true, 'Escaped output must encode closing textarea tag');

  // 5. Presentation helpers do not mutate record business values
  const rawRecord = createMockRecord({
    Objective_1: { value: '<b>Sales Objective</b> & Goal' },
    Employee_Name: { value: 'Test & User <Dev>' }
  });
  const recordSnapshotJson = JSON.stringify(rawRecord);

  const uiInstance = new EmployeePartAUI({ record: rawRecord, stage: BUSINESS_STAGES.OBJECTIVE_INPUT, isEditable: true });
  uiInstance.render();

  assert.equal(JSON.stringify(rawRecord), recordSnapshotJson, 'UI rendering must not mutate record business values');
  assert.equal(rawRecord.Objective_1.value, '<b>Sales Objective</b> & Goal', 'Business value in record must remain unescaped raw string');
});
