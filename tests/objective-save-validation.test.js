import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { resolveProfileCode } from '../src/profiles/profile-scoring-resolver.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { EmployeePartAUI, escapeHtml, formatUserDisplay, getStatusGuidance, getMacroStage, classifyTopologyForUI, CANONICAL_TOPOLOGIES, getVisualScreen, getProcessProgress, normalizeAppraiserData, COMPETENCIES_LIST, getApplicableCompetencies, WORKFLOW_PATH_M1_G1, WORKFLOW_PATH_M1_M2_G1, getApplicableWorkflowPath, getPhaseCalendarStatus, DEFAULT_PHASE_CALENDAR, ROUTE_SCENARIOS, EVALUATION_PROFILES, calculateDeadlineInfo } from '../src/ui/employee-part-a-ui.js';

const makeMockElement = () => {
  const children = [];
  let _innerHTML = '';
  const el = {
    className: '',
    parentNode: null,
    get innerHTML() {
      const childHtml = children.map(c => c.innerHTML || '').join('');
      return _innerHTML + childHtml;
    },
    set innerHTML(val) {
      _innerHTML = val;
    },
    children,
    appendChild: (child) => {
      child.parentNode = el;
      children.push(child);
      return child;
    },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx !== -1) children.splice(idx, 1);
      child.parentNode = null;
      return child;
    },
    remove: () => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    },
    querySelector: (selector) => {
      const cls = selector.replace(/^[.#]/, '');
      const find = (arr) => {
        for (const c of arr) {
          if (c.className === cls || c.id === cls || (c.className && c.className.includes(cls))) return c;
          if (c.children) {
            const res = find(c.children);
            if (res) return res;
          }
        }
        return null;
      };
      return find(children);
    },
    querySelectorAll: (selector) => {
      const cls = selector.replace(/^[.#]/, '');
      const results = [];
      const find = (arr) => {
        for (const c of arr) {
          if (c.className === cls || (c.className && c.className.includes(cls))) results.push(c);
          if (c.children) find(c.children);
        }
      };
      find(children);
      return results;
    },
    dataset: {},
    _listeners: {},
    addEventListener(evt, fn) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(fn);
    },
    click() {
      if (this._listeners['click']) {
        this._listeners['click'].forEach(fn => fn());
      }
    },
    style: {}
  };
  return el;
};

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

test('UI/UX V1 Candidate R2 — Topology Classifier, G2 Unsupported Warning, Guidance & Presentation Safety', async (t) => {
  // 1. Exact 16 statuses have deterministic UI lifecycle & guidance presentation on canonical M1_G1
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
    assert.ok(stageNum >= 1 && stageNum <= 5, `Status "${st}" must map deterministically to macro stage 1-5`);
  });

  // 2. classifyTopologyForUI checks canonical & supported V1 topologies strictly
  const topM1G1 = classifyTopologyForUI('M1_G1');
  assert.equal(topM1G1.isCanonical, true);
  assert.equal(topM1G1.isSupportedV1, true);
  assert.equal(topM1G1.isM1G1, true);
  assert.equal(topM1G1.isM1M2G1, false);

  const topM1M2G1 = classifyTopologyForUI('M1_M2_G1');
  assert.equal(topM1M2G1.isCanonical, true);
  assert.equal(topM1M2G1.isSupportedV1, true);
  assert.equal(topM1M2G1.isM1M2G1, true);

  const topG2A = classifyTopologyForUI('M1_G1_G2');
  assert.equal(topG2A.isCanonical, true);
  assert.equal(topG2A.isSupportedV1, false);
  assert.equal(topG2A.isG2, true);

  const topG2B = classifyTopologyForUI('M1_M2_G1_G2');
  assert.equal(topG2B.isCanonical, true);
  assert.equal(topG2B.isSupportedV1, false);
  assert.equal(topG2B.isG2, true);

  const topInvalid = classifyTopologyForUI('INVALID_TOPOLOGY');
  assert.equal(topInvalid.isCanonical, false);
  assert.equal(topInvalid.isSupportedV1, false);

  const topInvalidM2 = classifyTopologyForUI('INVALID_M2');
  assert.equal(topInvalidM2.isCanonical, false);
  assert.equal(topInvalidM2.isSupportedV1, false);

  // 3. R2 item 1 — M1_G1 + stale First Manager remains hidden
  const m1g1WithStaleFm = createMockRecord({
    Routing_Topology: { value: 'M1_G1' },
    First_Manager_User: { value: [{ code: 'fm01', name: 'Stale First Manager' }] },
    Manager_User: { value: [{ code: 'm01', name: 'Manager One' }] },
    GM_User: { value: [{ code: 'g01', name: 'GM One' }] }
  });
  const uiM1G1 = new EmployeePartAUI({ record: m1g1WithStaleFm });
  const routeElM1G1 = uiM1G1._renderRouteContext();
  assert.equal(routeElM1G1.innerHTML.includes('3rd Appraiser'), false, 'M1_G1 record must NOT display 3rd Appraiser route step');

  // R2 item 2 — M1_M2_G1 + populated First Manager remains valid for display
  const m1m2g1WithFm = createMockRecord({
    Routing_Topology: { value: 'M1_M2_G1' },
    First_Manager_User: { value: [{ code: 'fm01', name: 'Active First Manager' }] },
    Manager_User: { value: [{ code: 'm01', name: 'Manager One' }] },
    GM_User: { value: [{ code: 'g01', name: 'GM One' }] }
  });
  const uiM1M2G1 = new EmployeePartAUI({ record: m1m2g1WithFm, appraiserCount: 3 });
  const routeElM1M2G1 = uiM1M2G1._renderRouteContext();
  assert.equal(routeElM1M2G1.innerHTML.includes('3rd Appraiser'), true, 'M1_M2_G1 record with First_Manager_User MUST display 3rd Appraiser route step');

  // R2 item 3 — NONEMPTY_INVALID_TOPOLOGY returns warning/fail-closed display
  const invalidTopGuidance = getStatusGuidance('01 Draft Objective', 'INVALID_TOPOLOGY');
  assert.equal(invalidTopGuidance.isWarning, true, 'INVALID_TOPOLOGY must produce isWarning = true');
  assert.ok(invalidTopGuidance.th.includes('INVALID_TOPOLOGY'), 'Warning TH must include raw topology string');

  const invalidTopRecord = createMockRecord({ Routing_Topology: { value: 'INVALID_TOPOLOGY' } });
  const uiInvalidTop = new EmployeePartAUI({ record: invalidTopRecord });
  const routeElInvalidTop = uiInvalidTop._renderRouteContext();
  assert.ok(routeElInvalidTop.innerHTML.includes('Unrecognized'), 'Route context for INVALID_TOPOLOGY must display unrecognized warning badge');
  assert.equal(routeElInvalidTop.innerHTML.includes('Manager (ผู้จัดการส่วนงาน)'), false, 'INVALID_TOPOLOGY must not portray normal approval route');

  // R2 item 4 — INVALID_M2 + populated First Manager does NOT display First Manager or normal route
  const invalidM2Record = createMockRecord({
    Routing_Topology: { value: 'INVALID_M2' },
    First_Manager_User: { value: [{ code: 'fm01', name: 'Fake FM' }] }
  });
  const uiInvalidM2 = new EmployeePartAUI({ record: invalidM2Record });
  const routeElInvalidM2 = uiInvalidM2._renderRouteContext();
  assert.equal(routeElInvalidM2.innerHTML.includes('1st Manager'), false, 'INVALID_M2 must NOT display First Manager route step');
  assert.equal(routeElInvalidM2.innerHTML.includes('Manager (ผู้จัดการส่วนงาน)'), false, 'INVALID_M2 must NOT portray normal approval route');

  // R2 item 5 — blank/null topology remain warning/fail-closed
  const blankGuidance = getStatusGuidance('01 Draft Objective', '');
  assert.equal(blankGuidance.isWarning, true, 'Blank topology must produce isWarning = true');
  const nullGuidance = getStatusGuidance('01 Draft Objective', null);
  assert.equal(nullGuidance.isWarning, true, 'Null topology must produce isWarning = true');

  // R2 item 6 — G2 topologies (M1_G1_G2, M1_M2_G1_G2) display unsupported-current-V1 warning and do NOT present normal route
  const g2Record = createMockRecord({ Routing_Topology: { value: 'M1_G1_G2' } });
  const uiG2 = new EmployeePartAUI({ record: g2Record });
  const routeElG2 = uiG2._renderRouteContext();
  assert.ok(routeElG2.innerHTML.includes('Unsupported in V1'), 'G2 topology must display unsupported badge');
  assert.ok(routeElG2.innerHTML.includes('ยังไม่เปิดใช้งานในระบบ MBO V1'), 'G2 topology must display unsupported warning text');
  assert.equal(routeElG2.innerHTML.includes('Manager (ผู้จัดการส่วนงาน)'), false, 'G2 topology must not portray normal V1 approval route');

  const g2Guidance = getStatusGuidance('01 Draft Objective', 'M1_M2_G1_G2');
  assert.equal(g2Guidance.isWarning, true, 'G2 topology guidance must set isWarning = true');
  assert.ok(g2Guidance.th.includes('ยังไม่เปิดใช้งานในระบบ MBO V1'), 'G2 guidance must state unsupported in V1');

  // 4. Old 4-step Year-End secondary nav is removed in V2 (R2-07)
  const uiNavCheck = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '13 Manager Final Evaluation' } }),
    stage: 'READ_ONLY'
  });
  uiNavCheck.render();
  assert.equal(uiNavCheck._renderStageNav, undefined, 'Old 4-step secondary nav method must be removed');
  assert.ok(uiNavCheck.root, 'V2 screens must render root element');

  // 8. Evaluation UI V2 — 5 Macro Screen Mapping & Appraiser Slot Capacity
  const statusScreenMap = {
    '01 Draft Objective': 'objectives',
    '02 First Manager Objective Review': 'objectives',
    '03 Manager Objective Review': 'objectives',
    '04 GM Objective Review': 'objectives',
    '05 Objective Approved': 'objectives',
    '06 Employee Mid-Year': 'midyear',
    '07 First Manager Mid-Year Review': 'midyear',
    '08 Manager Mid-Year Review': 'midyear',
    '09 GM Mid-Year Review': 'midyear',
    '10 Mid-Year Completed': 'midyear',
    '11 Employee Self Evaluation': 'self_eval',
    '12 First Manager Final Evaluation': 'appraiser_eval',
    '13 Manager Final Evaluation': 'appraiser_eval',
    '14 GM Final Evaluation': 'appraiser_eval',
    '15 HR Final Check': 'hr_final',
    '16 Completed': 'hr_final'
  };

  Object.entries(statusScreenMap).forEach(([st, expectedScreen]) => {
    assert.equal(getVisualScreen(st), expectedScreen, `Status "${st}" must resolve to visual screen "${expectedScreen}"`);
  });

  // 9. Route-aware process progress percentage calculation (R5)
  assert.equal(getProcessProgress('01 Draft Objective', 'M1_G1').percent, 8);
  assert.equal(getProcessProgress('06 Employee Mid-Year', 'M1_G1').percent, 38);
  assert.equal(getProcessProgress('11 Employee Self Evaluation', 'M1_G1').percent, 69);
  assert.equal(getProcessProgress('15 HR Final Check', 'M1_G1').percent, 92);
  assert.equal(getProcessProgress('16 Completed', 'M1_G1').percent, 100);

  assert.equal(getProcessProgress('01 Draft Objective', 'M1_M2_G1').percent, 6);
  assert.equal(getProcessProgress('02 First Manager Objective Review', 'M1_M2_G1').percent, 13);
  assert.equal(getProcessProgress('16 Completed', 'M1_M2_G1').percent, 100);

  // Unknown status or invalid topology fails closed with isMismatch
  assert.equal(getVisualScreen('99 INVALID STATUS'), null, 'Unknown visual status must return null to fail closed');
  assert.equal(getProcessProgress('99 INVALID STATUS', 'M1_G1').isMismatch, true, 'Unknown status progress must return mismatch');

  // 10. Competency Set Count (R1-04, R2-05)
  const opCompList = getApplicableCompetencies('COMP_SET_OPERATIONAL_V1');
  assert.equal(opCompList.length, 6, 'Operational competency set must have exactly 6 items');

  const mgmtCompList = getApplicableCompetencies('COMP_SET_MANAGEMENT_V1');
  assert.equal(mgmtCompList.length, 8, 'Management competency set must have exactly 8 items');

  // Blank or invalid competency set fails closed (R2-05)
  assert.equal(getApplicableCompetencies(''), null, 'Blank competency set code must return null');
  assert.equal(getApplicableCompetencies('INVALID_CODE'), null, 'Invalid competency set code must return null');

  // 11. Real Legacy Field Mapping & Per-Item Comments (R1-01, R2-02)
  const mockRecord = createMockRecord({
    Objective_Count: { value: '2' },
    Manager_Achievement_1: { value: '4' },
    Manager_Achievement_2: { value: '4' },
    Manager_Comment_1: { value: 'Obj 1 Comment' },
    Manager_Comment_2: { value: 'Obj 2 Comment' },
    Manager_Competency_Rating_1: { value: '4' },
    Manager_Competency_Rating_2: { value: '4' },
    Manager_Competency_Rating_3: { value: '4' },
    Manager_Competency_Rating_4: { value: '4' },
    Manager_Competency_Rating_5: { value: '4' },
    Manager_Competency_Rating_6: { value: '5' },
    Manager_Competency_Comment_1: { value: 'Comp 1 Comment' }
  });

  const appData2 = normalizeAppraiserData(mockRecord, 2);
  assert.equal(appData2.totalCount, 2);
  assert.equal(appData2.slots[0].isCompleted, true, 'Slot 1 must be complete when all Part A & Part B ratings exist');
  assert.equal(appData2.slots[1].isCompleted, false, 'Slot 2 must be incomplete when GM fields are missing');
  assert.equal(appData2.isFullyComplete, false, 'Overall completeness must be false when GM fields are missing');
  assert.equal(appData2.slots[0].partAComments[1], 'Obj 1 Comment');
  assert.equal(appData2.slots[0].partAComments[2], 'Obj 2 Comment');
  assert.notEqual(appData2.slots[0].partAComments[2], appData2.slots[0].partAComments[1], 'Obj 1 comment must not leak to Obj 2');
  assert.equal(appData2.slots[0].partBComments[1], 'Comp 1 Comment');
  assert.equal(appData2.slots[0].label, '1st Appraiser');
  assert.equal(appData2.slots[1].label, '2nd Appraiser');

  // Verify none of the normalized appraiser slot labels claim Manager or GM
  appData2.slots.forEach(s => {
    assert.equal(s.label.includes('Manager'), false, 'Appraiser slot label must NOT contain "Manager"');
    assert.equal(s.label.includes('GM'), false, 'Appraiser slot label must NOT contain "GM"');
  });

  // 12. COCE Competency item index 6 is marked as COCE / Excluded from Score (R1-04)
  const coceItem = COMPETENCIES_LIST.find(c => c.id === 6);
  assert.equal(coceItem.isCOCE, true, 'Competency Item 6 must be flagged as isCOCE');

  // 13. Objectives Screen uses Wide Card UX (R2-01)
  const uiObj = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '01 Draft Objective' } }),
    stage: 'OBJECTIVE_INPUT',
    isEditable: true
  });
  uiObj.render();
  assert.equal(uiObj.root.querySelectorAll('.mbo-table-container').length, 1, 'Objectives screen must render horizontal table container');

  // 14. Appraiser & HR Screens render Attachment Evidence Context (R2-04)
  const uiAppraiser = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({
      Status: { value: '13 Manager Final Evaluation' },
      MidYear_Attachment_1: { value: [{ name: 'mid_ev.pdf' }] },
      Final_Attachment_1: { value: [{ name: 'final_ev.pdf' }] }
    }),
    stage: 'READ_ONLY',
    isEditable: false
  });
  uiAppraiser.render();
  assert.equal(uiAppraiser.root.innerHTML.includes('mid_ev.pdf'), true, 'Appraiser screen must show Mid-Year evidence');
  assert.equal(uiAppraiser.root.innerHTML.includes('final_ev.pdf'), true, 'Appraiser screen must show Self Eval evidence');

  const uiHr = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({
      Status: { value: '15 HR Final Check' },
      MidYear_Attachment_1: { value: [{ name: 'mid_ev.pdf' }] },
      Final_Attachment_1: { value: [{ name: 'final_ev.pdf' }] }
    }),
    stage: 'READ_ONLY',
    isEditable: false
  });
  uiHr.render();
  assert.equal(uiHr.root.innerHTML.includes('mid_ev.pdf'), true, 'HR screen must show Mid-Year evidence');
  assert.equal(uiHr.root.innerHTML.includes('final_ev.pdf'), true, 'HR screen must show Self Eval evidence');

  // 15. Invalid Weights Fail Closed (R2-06)
  const uiInvalidWeight = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ PartA_Weight: { value: '80' }, PartB_Weight: { value: '30' } }), // sum 110 != 100
    stage: 'READ_ONLY'
  });
  uiInvalidWeight.render();
  assert.equal(uiInvalidWeight.root.innerHTML.includes('CONFIGURATION ERROR'), true, 'Invalid weight sum must fail closed');

  // 16. Incomplete Ratings Fail Closed even if stale result fields exist (R2-03, R3-02)
  const uiStale = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({
      Status: { value: '13 Manager Final Evaluation' },
      Manager_Achievement_1: { value: '4' },
      GM_Achievement_1: { value: '' }, // GM incomplete
      Manager_Objective_Score_1: { value: '4.00' },
      GM_Objective_Score_1: { value: '4.00' },
      Average_Objective_Score_1: { value: '4.00' }, // Stale
      MBO_Point_1: { value: '1.60' }, // Stale
      Competency_Result_1: { value: '4.00' } // Stale
    }),
    stage: 'READ_ONLY'
  });
  uiStale.render();
  assert.equal(uiStale.root.innerHTML.includes('Combined Result Pending / Incomplete'), true, 'Incomplete ratings must hide certified combined results in Appraiser Evaluation');

  // 17. Create Flow Before Lookup Defers Scoring Validation (R3-01)
  const uiCreateBlank = new EmployeePartAUI({
    container: makeMockElement(),
    record: {
      Fiscal_Year: { value: 'FY2026' },
      Employee_Code: { value: '' },
      Competency_Set_Code: { value: '' }, // Blank snapshot
      PartA_Weight: { value: '' },
      PartB_Weight: { value: '' }
    },
    stage: 'NEW_RECORD',
    isCreate: true,
    isEditable: true
  });
  uiCreateBlank.render();
  assert.equal(uiCreateBlank.root.innerHTML.includes('CONFIGURATION ERROR'), false, 'Create mode before lookup must NOT display CONFIGURATION ERROR');
  assert.equal(uiCreateBlank.root.innerHTML.includes('STEP 1: ระบุพนักงาน'), true, 'Create mode before lookup must render STEP 1 Lookup UI');

  // 18. Post-Lookup Fail-Closed Validation (R3-01)
  const uiCreateVerifiedInvalid = new EmployeePartAUI({
    container: makeMockElement(),
    record: {
      Fiscal_Year: { value: 'FY2026' },
      Employee_Code: { value: '0149' },
      Competency_Set_Code: { value: 'INVALID_CODE' },
      PartA_Weight: { value: '70' },
      PartB_Weight: { value: '30' }
    },
    stage: 'NEW_RECORD',
    isCreate: true,
    isEditable: true
  });
  uiCreateVerifiedInvalid.isEmployeeVerified = true; // Lookup completed but returned invalid config
  uiCreateVerifiedInvalid.render();
  assert.equal(uiCreateVerifiedInvalid.root.innerHTML.includes('CONFIGURATION ERROR'), true, 'Post-lookup verified record with invalid competency set must fail closed');

  // 19. HR Final Breakdown Stale Result Handling (R3-03)
  const uiHrStale = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({
      Status: { value: '15 HR Final Check' },
      Manager_Achievement_1: { value: '4' },
      GM_Achievement_1: { value: '' }, // Incomplete
      Manager_Objective_Score_1: { value: '4.00' },
      Average_Objective_Score_1: { value: '4.00' }
    }),
    stage: 'READ_ONLY'
  });
  uiHrStale.render();
  assert.equal(uiHrStale.root.innerHTML.includes('Combined Result Pending / Incomplete'), true, 'HR Final breakdown must display Pending for incomplete combined results');

  // 20. Slots 3 & 4 Preview Editing Truthful & No Physical Data-Code (R3-04)
  const uiSlots34 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '13 Manager Final Evaluation' } }),
    stage: 'READ_ONLY',
    appraiserCount: 4,
    activeSlotIndex: 3,
    isPreviewMode: true,
    previewOptions: { isPreviewMode: true }
  });
  uiSlots34.render();
  assert.equal(uiSlots34.root.innerHTML.includes('Preview Logical Slot'), true, 'Slots 3/4 must be labeled as Preview Logical Slot');

  // 21. Difficulty Empty-State Handling (R4-01..R4-08)
  const blankDiffRecord = createMockRecord({ Status: { value: '01 Draft Objective' }, Difficulty_1: { value: '' } });
  const uiBlankDiff = new EmployeePartAUI({
    container: makeMockElement(),
    record: blankDiffRecord,
    stage: 'OBJECTIVE_INPUT',
    isEditable: true
  });
  uiBlankDiff.render();

  // (1) Blank Difficulty renders empty placeholder, not Level 3
  assert.equal(uiBlankDiff.root.innerHTML.includes('option value="" selected'), true, 'Blank Difficulty must select empty placeholder option');
  assert.equal(uiBlankDiff.root.innerHTML.includes('-- กรุณาเลือกระดับความยาก / Please select --'), true, 'Blank Difficulty select must present placeholder text');

  // (2) Blank editable Difficulty has data-required="true"
  assert.equal(uiBlankDiff.root.innerHTML.includes('data-code="Difficulty_1" data-required="true"'), true, 'Blank Difficulty select must have data-required="true"');

  // (3) Stored Difficulty_1 = '3' renders normally
  const storedDiff3Record = createMockRecord({ Status: { value: '01 Draft Objective' }, Difficulty_1: { value: '3' } });
  const uiStoredDiff3 = new EmployeePartAUI({
    container: makeMockElement(),
    record: storedDiff3Record,
    stage: 'OBJECTIVE_INPUT',
    isEditable: true
  });
  uiStoredDiff3.render();
  assert.equal(uiStoredDiff3.root.innerHTML.includes('option value="3" selected'), true, 'Stored Difficulty 3 must select option 3');

  // (4) Blank read-only Difficulty renders neutral missing state
  const uiReadOnlyBlankDiff = new EmployeePartAUI({
    container: makeMockElement(),
    record: blankDiffRecord,
    stage: 'READ_ONLY',
    isEditable: false
  });
  uiReadOnlyBlankDiff.render();
  assert.equal(uiReadOnlyBlankDiff.root.innerHTML.includes('value="Level 3"'), false, 'Blank read-only Difficulty input must NOT have value="Level 3"');
  assert.equal(uiReadOnlyBlankDiff.root.innerHTML.includes('value="ยังไม่ได้ระบุ / Not selected"'), true, 'Blank read-only Difficulty input must display neutral missing text');

  // (5) Render does not mutate blank record Difficulty value
  assert.equal(blankDiffRecord.Difficulty_1.value, '', 'Rendering blank Difficulty must NOT mutate record value to default 3');

  // 22. R5 Route-Aware Five-Stage UX Assertions
  // (1) M1_G1 applicable path excludes 02/07/12 (13 statuses)
  assert.equal(WORKFLOW_PATH_M1_G1.length, 13, 'M1_G1 path must contain exactly 13 applicable statuses');
  assert.equal(WORKFLOW_PATH_M1_G1.includes('02 First Manager Objective Review'), false, 'M1_G1 path must exclude status 02');
  assert.equal(WORKFLOW_PATH_M1_G1.includes('07 First Manager Mid-Year Review'), false, 'M1_G1 path must exclude status 07');
  assert.equal(WORKFLOW_PATH_M1_G1.includes('12 First Manager Final Evaluation'), false, 'M1_G1 path must exclude status 12');

  // (2) M1_M2_G1 path includes 02/07/12 (16 statuses)
  assert.equal(WORKFLOW_PATH_M1_M2_G1.length, 16, 'M1_M2_G1 path must contain all 16 statuses');
  assert.equal(WORKFLOW_PATH_M1_M2_G1.includes('02 First Manager Objective Review'), true, 'M1_M2_G1 path must include status 02');

  // (3) M1_G1 + status 02 returns route/status mismatch warning
  const progMismatch = getProcessProgress('02 First Manager Objective Review', 'M1_G1');
  assert.equal(progMismatch.isMismatch, true, 'M1_G1 + status 02 must return route mismatch');

  // (4) Invalid / G2 topology returns fail-closed mismatch
  const progG2 = getProcessProgress('01 Draft Objective', 'M1_G1_G2');
  assert.equal(progG2.isMismatch, true, 'G2 topology must return route mismatch');

  // (5) Status 05 Waiting Boundary
  const uiStatus05 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '05 Objective Approved' } }),
    stage: 'READ_ONLY'
  });
  uiStatus05.render();
  assert.equal(uiStatus05.root.innerHTML.includes('🔒 05 Objective Approved — Stage 1 Complete'), true, 'Status 05 must show Mid-Year waiting boundary banner');

  // (6) Status 10 Waiting Boundary
  const uiStatus10 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '10 Mid-Year Completed' } }),
    stage: 'READ_ONLY'
  });
  uiStatus10.render();
  assert.equal(uiStatus10.root.innerHTML.includes('🔒 10 Mid-Year Completed — Stage 2 Complete'), true, 'Status 10 must show Self Eval waiting boundary banner');

  // (7) Phase Calendar Status calculation
  const phaseCalUpcoming = getPhaseCalendarStatus('midyear', '01 Draft Objective', '2026-02-15');
  assert.equal(phaseCalUpcoming.status, 'Upcoming', 'Mid-Year phase must be Upcoming on Feb 15');

  const phaseCalOpen = getPhaseCalendarStatus('midyear', '06 Employee Mid-Year', '2026-06-15');
  assert.equal(phaseCalOpen.status, 'Open', 'Mid-Year phase must be Open on Jun 15');

  // (8) Actor-Aware Presentation Card
  const uiActorReq = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '01 Draft Objective' } }),
    stage: 'OBJECTIVE_INPUT',
    isEditable: true
  });
  uiActorReq.render();
  assert.equal(uiActorReq.root.innerHTML.includes('Action Required: Requester / Employee'), true, 'Status 01 must render Requester action banner');

  const uiActorAppr = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '03 Manager Objective Review' } }),
    stage: 'READ_ONLY'
  });
  uiActorAppr.render();
  assert.equal(uiActorAppr.root.innerHTML.includes('Action Required: Workflow Approver'), true, 'Status 03 must render Workflow Approver banner');

  // (9) Desktop Horizontal Spreadsheet Layout
  const uiHorizObj = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '01 Draft Objective' } }),
    stage: 'OBJECTIVE_INPUT',
    isEditable: true,
    isCreate: true
  });
  uiHorizObj.isEmployeeVerified = true;
  uiHorizObj.render();
  assert.equal(uiHorizObj.root.querySelectorAll('.mbo-grid-table').length > 0, true, 'Objectives screen must render horizontal spreadsheet table');
});

test('UI/UX V1 Candidate R6 — Route Scenarios, Profiles, HR Calendar, Deadlines, Ordinal Appraiser Headings', () => {
  // 1. ROUTE_SCENARIOS export exactness
  assert.ok(ROUTE_SCENARIOS.CURRENT_STANDARD, 'CURRENT_STANDARD route scenario exists');
  assert.equal(ROUTE_SCENARIOS.CURRENT_STANDARD.appraiserCount, 2);
  assert.equal(ROUTE_SCENARIOS.EXTENDED.appraiserCount, 3);
  assert.equal(ROUTE_SCENARIOS.EXECUTIVE_DIRECT.appraiserCount, 1);
  assert.equal(ROUTE_SCENARIOS.EXECUTIVE_DIRECT.isRuntimeSupported, false);
  assert.equal(ROUTE_SCENARIOS.EXECUTIVE_DIRECT.badgeText, 'Preview Only / Routing Pending');
  assert.equal(ROUTE_SCENARIOS.FUTURE_CAPACITY.appraiserCount, 4);

  // 2. EVALUATION_PROFILES export exactness (8 distinct profile keys)
  assert.equal(Object.keys(EVALUATION_PROFILES).length, 8);
  assert.equal(EVALUATION_PROFILES.PROF_STAFF_OPERATIONAL.partAWeight, 70);
  assert.equal(EVALUATION_PROFILES.PROF_ASST_MGR.partAWeight, 60);
  assert.equal(EVALUATION_PROFILES.PROF_SECT_MGR.partAWeight, 50);
  assert.equal(EVALUATION_PROFILES.PROF_DGM.suggestedRoute, 'EXECUTIVE_DIRECT');

  // 3. calculateDeadlineInfo deterministic date arithmetic
  const dlUpcoming = calculateDeadlineInfo('2026-06-01', '2026-07-31', '2026-02-15', false);
  assert.equal(dlUpcoming.status, 'Upcoming');
  assert.equal(dlUpcoming.isUpcoming, true);
  assert.ok(dlUpcoming.daysTextEN.includes('Opens in'));

  const dlOpen = calculateDeadlineInfo('2026-06-01', '2026-07-31', '2026-06-15', false);
  assert.equal(dlOpen.status, 'Open');
  assert.ok(dlOpen.daysTextEN.includes('days remaining'));

  const dlDueToday = calculateDeadlineInfo('2026-06-01', '2026-07-31', '2026-07-31', false);
  assert.equal(dlDueToday.status, 'Due Today');
  assert.equal(dlDueToday.isDueToday, true);

  const dlOverdue = calculateDeadlineInfo('2026-06-01', '2026-07-31', '2026-08-05', false);
  assert.equal(dlOverdue.status, 'Overdue');
  assert.equal(dlOverdue.isOverdue, true);
  assert.ok(dlOverdue.daysTextEN.includes('days overdue'));

  const dlCompleted = calculateDeadlineInfo('2026-06-01', '2026-07-31', '2026-08-05', true);
  assert.equal(dlCompleted.status, 'Completed');
  assert.equal(dlCompleted.isCompleted, true);

  // 4. Route Summary Ordinal Headings & Bilingual Title
  const uiRoute = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '01 Draft Objective' } }),
    stage: 'OBJECTIVE_INPUT',
    isEditable: true,
    appraiserCount: 2
  });
  uiRoute.render();
  assert.ok(uiRoute.root.innerHTML.includes('Evaluation &amp; Approval Route') || uiRoute.root.innerHTML.includes('Evaluation & Approval Route'));
  assert.ok(uiRoute.root.innerHTML.includes('1st Appraiser'));
  assert.ok(uiRoute.root.innerHTML.includes('2nd Appraiser'));
  assert.equal(uiRoute.root.innerHTML.includes('Manager (ผู้จัดการส่วนงาน):'), false, 'Route summary must not use Manager as step heading');
  assert.equal(uiRoute.root.innerHTML.includes('GM (ผู้จัดการฝ่าย):'), false, 'Route summary must not use GM as step heading');

  // 5. Executive Direct 1 Appraiser Route Preview
  const uiExecDirect = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '01 Draft Objective' } }),
    stage: 'OBJECTIVE_INPUT',
    isEditable: true,
    appraiserCount: 1
  });
  uiExecDirect.render();
  assert.ok(uiExecDirect.root.innerHTML.includes('1st Appraiser'));

  // 6. Status 05 Boundary Guidance (Upcoming vs Open)
  const uiStatus05Upcoming = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '05 Objective Approved' } }),
    stage: 'READ_ONLY',
    previewOptions: { previewNow: '2026-02-15' }
  });
  uiStatus05Upcoming.render();
  assert.ok(uiStatus05Upcoming.root.innerHTML.includes('05 Objective Approved'));

  const uiStatus05Open = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '05 Objective Approved' } }),
    stage: 'READ_ONLY',
    previewOptions: { previewNow: '2026-06-15' }
  });
  uiStatus05Open.render();
  assert.ok(uiStatus05Open.root.innerHTML.includes('Start Mid-Year') || uiStatus05Open.root.innerHTML.includes('พร้อมเริ่มทบทวนกลางปี'));
});

test('UI/UX V2 Candidate R6-R1 — User Visual Correction Closure', () => {
  // 1. Optional Attachment UI & 0 Required Field Errors for Empty Attachment
  const uiObjAttach = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '01 Draft Objective' } }),
    stage: 'OBJECTIVE_INPUT',
    isEditable: true
  });
  uiObjAttach.render();
  assert.ok(uiObjAttach.root.innerHTML.includes('Attach File') || uiObjAttach.root.innerHTML.includes('แนบไฟล์'));
  assert.ok(uiObjAttach.root.innerHTML.includes('Optional'));

  // Save validation passes with 0 attachment errors
  const recordObjEmptyAttach = createMockRecord({ Status: { value: '01 Draft Objective' } });
  const valResult = ValidationEngine.validate(recordObjEmptyAttach, BUSINESS_STAGES.OBJECTIVE_INPUT);
  const attachErrors = (valResult.errors || []).filter(e => e.field && e.field.includes('Attachment'));
  assert.equal(attachErrors.length, 0, 'ATTACHMENT_REQUIRED_VALIDATION_COUNT must be 0');

  // 2. Mid-Year Employee-Reported Progress (%) Input 0..100 & Progress Bar
  const uiMidProg = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '06 Employee Mid-Year' }, Progress_Percent_1: { value: '75' } }),
    stage: 'MIDYEAR_INPUT',
    isEditable: true
  });
  uiMidProg.render();
  assert.ok(uiMidProg.root.innerHTML.includes('ความคืบหน้าของเป้าหมาย') || uiMidProg.root.innerHTML.includes('Objective Progress'));
  assert.ok(uiMidProg.root.innerHTML.includes('mbo-prog-num'));
  assert.ok(uiMidProg.root.innerHTML.includes('75%') || uiMidProg.root.innerHTML.includes('value="75"'));

  // 3. Native Kintone Comment Thread Coexistence Placeholder
  assert.ok(uiMidProg.root.innerHTML.includes('Kintone Comments') || uiMidProg.root.innerHTML.includes('ความคิดเห็นใน Kintone'));

  // 4. Prominent Deadline Urgency Callouts
  const dlOnTime = calculateDeadlineInfo('2026-01-01', '2026-12-31', '2026-06-15');
  assert.equal(dlOnTime.status, 'Open');
  assert.ok(dlOnTime.badgeClass.includes('mbo-deadline-open'));

  const dlOverdue = calculateDeadlineInfo('2026-01-01', '2026-03-31', '2026-06-15');
  assert.equal(dlOverdue.status, 'Overdue');
  assert.equal(dlOverdue.overdueDays, 76);
  assert.equal(dlOverdue.calloutTextEN, '76 DAYS OVERDUE');

  const dlDueToday = calculateDeadlineInfo('2026-01-01', '2026-06-15', '2026-06-15');
  assert.equal(dlDueToday.status, 'Due Today');
  assert.equal(dlDueToday.calloutTextEN, 'DUE TODAY');

  // 5. Active Appraiser Column Mapping Follows Status & Topology
  // M1_G1 Status 13 -> 1st Appraiser active (Slot 1)
  const uiM1G1Status13 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '13 Manager Final Evaluation' }, Routing_Topology: { value: 'M1_G1' } }),
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    appraiserCount: 2
  });
  uiM1G1Status13.render();
  assert.ok(uiM1G1Status13.root.innerHTML.includes('Active Slot: <strong style="color:#0284c7;">Slot 1'));

  // M1_G1 Status 14 -> 2nd Appraiser active (Slot 2)
  const uiM1G1Status14 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '14 GM Final Evaluation' }, Routing_Topology: { value: 'M1_G1' } }),
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    appraiserCount: 2
  });
  uiM1G1Status14.render();
  assert.ok(uiM1G1Status14.root.innerHTML.includes('Active Slot: <strong style="color:#0284c7;">Slot 2'));

  // M1_M2_G1 Status 12 -> 1st Appraiser active (Slot 1)
  const uiM1M2Status12 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '12 First Manager Final Evaluation' }, Routing_Topology: { value: 'M1_M2_G1' } }),
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    appraiserCount: 3
  });
  uiM1M2Status12.render();
  assert.ok(uiM1M2Status12.root.innerHTML.includes('Active Slot: <strong style="color:#0284c7;">Slot 1'));

  // M1_M2_G1 Status 13 -> 2nd Appraiser active (Slot 2)
  const uiM1M2Status13 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '13 Manager Final Evaluation' }, Routing_Topology: { value: 'M1_M2_G1' } }),
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    appraiserCount: 3
  });
  uiM1M2Status13.render();
  assert.ok(uiM1M2Status13.root.innerHTML.includes('Active Slot: <strong style="color:#0284c7;">Slot 2'));

  // M1_M2_G1 Status 14 -> 3rd Appraiser active (Slot 3)
  const uiM1M2Status14 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '14 GM Final Evaluation' }, Routing_Topology: { value: 'M1_M2_G1' } }),
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    appraiserCount: 3
  });
  uiM1M2Status14.render();
  assert.ok(uiM1M2Status14.root.innerHTML.includes('Active Slot: <strong style="color:#0284c7;">Slot 3'));

  // 6. 4-Appraiser Responsive Contained Matrix (R6-R2)
  const ui4Appraiser = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '13 Manager Final Evaluation' }, Routing_Topology: { value: 'M1_M2_G1' } }),
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    appraiserCount: 4,
    previewOptions: { activeSlotIndex: 2 }
  });
  ui4Appraiser.render();
  assert.ok(ui4Appraiser.root.innerHTML.includes('mbo-table-container'), 'Matrix must be wrapped in mbo-table-container');
  assert.ok(ui4Appraiser.root.innerHTML.includes('sticky-col'), 'Objective/Competency first column must be sticky');
  assert.ok(ui4Appraiser.root.innerHTML.includes('sticky-right'), 'Result column must be sticky right');
  assert.ok(ui4Appraiser.root.innerHTML.includes('[EDITABLE / ACTIVE APPRAISER]'), 'Active column must be usable and emphasized');

  // 7. Workflow Action Timeline Desktop Table & Required Columns (R6-R2)
  const timelineHtml = ui4Appraiser.root.innerHTML;
  assert.ok(timelineHtml.includes('mbo-timeline-table'), 'Timeline must render structured <table> on desktop');
  assert.ok(timelineHtml.includes('ขั้นตอน / Stage'), 'Timeline table must contain Stage header');
  assert.ok(timelineHtml.includes('ผู้ดำเนินการ / Actor'), 'Timeline table must contain Actor header');
  assert.ok(timelineHtml.includes('ชื่อผู้ดำเนินการ / Person'), 'Timeline table must contain Person header');
  assert.ok(timelineHtml.includes('การดำเนินการ / Action'), 'Timeline table must contain Action header');
  assert.ok(timelineHtml.includes('วัน-เวลา / Date & Time'), 'Timeline table must contain Date & Time header');
  assert.ok(timelineHtml.includes('ผลลัพธ์ / Result'), 'Timeline table must contain Result header');
  assert.ok(timelineHtml.includes('หมายเหตุ / Comments'), 'Timeline table must contain Comments header');
  assert.ok(timelineHtml.includes('Returned for Revision') || timelineHtml.includes('Returned'), 'Timeline must preserve Return events');
  assert.ok(timelineHtml.includes('Resubmitted Objectives') || timelineHtml.includes('Resubmitted'), 'Timeline must preserve Resubmit events');
  assert.ok(timelineHtml.includes('1st Appraiser') && timelineHtml.includes('2nd Appraiser'), 'Timeline must use ordinal Appraiser names');

  // 8. R6-R3 Deadline Urgency Matrix & Dismissible Toast Tests
  // >7 Days Remaining (Green callout, no toast)
  const uiGt7 = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '06 Employee Mid-Year' } }),
    stage: 'MID_YEAR',
    previewOptions: { previewNow: '2026-06-15' }
  });
  uiGt7.render();
  assert.ok(uiGt7.root.innerHTML.includes('mbo-urgency-green'), '>7 days remaining must use green callout');
  assert.strictEqual(uiGt7.root.querySelector('.mbo-urgency-toast'), null, '>7 days remaining must not spawn urgent toast');

  // 7 Days Remaining (Amber due-soon callout + toast)
  const ui7Days = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '06 Employee Mid-Year' } }),
    stage: 'MID_YEAR',
    previewOptions: { previewNow: '2026-07-24' }
  });
  ui7Days.render();
  assert.ok(ui7Days.root.innerHTML.includes('mbo-urgency-amber'), '7 days remaining must use amber due-soon callout');
  assert.ok(ui7Days.root.querySelector('.mbo-urgency-toast'), '7 days remaining must spawn urgent toast');

  // 1 Day Remaining (Amber/Orange due-soon callout + toast)
  const ui1Day = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '06 Employee Mid-Year' } }),
    stage: 'MID_YEAR',
    previewOptions: { previewNow: '2026-07-30' }
  });
  ui1Day.render();
  assert.ok(ui1Day.root.innerHTML.includes('mbo-urgency-amber') || ui1Day.root.innerHTML.includes('mbo-urgency-orange'), '1 day remaining must use amber/orange callout');
  assert.ok(ui1Day.root.querySelector('.mbo-urgency-toast'), '1 day remaining must spawn urgent toast');

  // Due Today (Orange/Red urgent callout + toast)
  const uiDueToday = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '06 Employee Mid-Year' } }),
    stage: 'MID_YEAR',
    previewOptions: { previewNow: '2026-07-31' }
  });
  uiDueToday.render();
  assert.ok(uiDueToday.root.innerHTML.includes('mbo-urgency-orange'), 'Due today must use orange urgent callout');
  assert.ok(uiDueToday.root.querySelector('.mbo-urgency-toast'), 'Due today must spawn urgent toast');

  // Overdue 76 Days (Red callout + prominent numeric text + toast)
  const uiOverdue = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '06 Employee Mid-Year' } }),
    stage: 'MID_YEAR',
    previewOptions: { previewNow: '2026-10-15' }
  });
  uiOverdue.render();
  assert.ok(uiOverdue.root.innerHTML.includes('mbo-urgency-red'), 'Overdue must use red callout');
  assert.ok(uiOverdue.root.innerHTML.includes('76 DAYS OVERDUE'), 'Overdue callout must show prominent numeric text');
  assert.ok(uiOverdue.root.querySelector('.mbo-urgency-toast'), 'Overdue must spawn urgent toast');

  // Toast Dismissal preserves persistent callout
  const toastBtn = uiOverdue.root.querySelector('.mbo-urgency-toast-close');
  assert.ok(toastBtn, 'Toast must have dismiss button');
  toastBtn.click();
  assert.strictEqual(uiOverdue.root.querySelector('.mbo-urgency-toast'), null, 'Dismissing toast must remove toast node');
  assert.ok(uiOverdue.root.innerHTML.includes('mbo-urgency-callout'), 'Dismissing toast must keep persistent urgency callout');

  // Completed (Green callout, no toast)
  const uiCompleted = new EmployeePartAUI({
    container: makeMockElement(),
    record: createMockRecord({ Status: { value: '16 Completed' } }),
    stage: 'HR_FINAL',
    previewOptions: { previewNow: '2026-12-15' }
  });
  uiCompleted.render();
  assert.strictEqual(uiCompleted.root.querySelector('.mbo-urgency-toast'), null, 'Completed phase must not spawn urgent toast');

  // 9. R6-R4/R6-R5 Single Compact Status Strip, Overdue Pill & Explicit Timeline Grid Tests
  assert.ok(uiOverdue.root.querySelector('.mbo-compact-status-strip'), 'Single compact status strip must be rendered');
  assert.strictEqual(uiOverdue.root.querySelectorAll('.mbo-status-guidance-card').length, 0, 'Must have 0 duplicate status guidance hero cards');
  assert.strictEqual(uiOverdue.root.querySelectorAll('.mbo-actor-banner-card').length, 0, 'Must have 0 duplicate actor banner hero cards');
  assert.ok(uiOverdue.root.innerHTML.includes('mbo-urgency-badge-pill'), 'Overdue state must use prominent badge pill');
  assert.ok(uiOverdue.root.innerHTML.includes('pill-red'), 'Overdue countdown must render red pill highlight');
  assert.ok(uiOverdue.root.innerHTML.includes('mbo-timeline-table'), 'Timeline must be explicit grid table');
});

test('UI/UX V2 Candidate R6-R6 — Historical Stage Review Navigation', async () => {
  const container = makeMockElement('div');

  // 1. Clicking prior stage changes view state only; record.Status remains unchanged
  const recordHr = createMockRecord({ Status: { value: '15 HR Final Check' } });
  const uiHr = new EmployeePartAUI({
    container,
    record: recordHr,
    stage: 'HR_FINAL',
    isEditable: true,
    previewOptions: { viewerRole: 'hr' }
  });
  uiHr.render();

  assert.strictEqual(recordHr.Status.value, '15 HR Final Check');
  assert.strictEqual(uiHr.selectedViewStage, null);

  // Select historical Objectives stage
  uiHr.selectedViewStage = 'objectives';
  uiHr.render();
  assert.strictEqual(recordHr.Status.value, '15 HR Final Check', 'record.Status must remain unchanged');
  assert.ok(uiHr.root.querySelector('.mbo-history-banner'), 'History banner must be rendered');
  assert.ok(uiHr.root.querySelector('.mbo-history-banner').innerHTML.includes('1. เป้าหมาย'), 'Banner must display target stage');

  // 2. Back to Current Phase restores current-stage rendering
  uiHr.selectedViewStage = null;
  uiHr.render();
  assert.strictEqual(uiHr.root.querySelector('.mbo-history-banner'), null, 'History banner removed when returning to current phase');
  assert.strictEqual(recordHr.Status.value, '15 HR Final Check');

  // 3. Future/unreached stage cannot be opened as history
  const recordDraft = createMockRecord({ Status: { value: '01 Draft Objective' } });
  const uiDraft = new EmployeePartAUI({
    container,
    record: recordDraft,
    stage: 'OBJECTIVES',
    isEditable: true
  });
  uiDraft.selectedViewStage = 'hr_final';
  uiDraft.render();
  assert.strictEqual(uiDraft.selectedViewStage, null, 'Unreached stage key must be reset to null');
  assert.strictEqual(uiDraft.root.querySelector('.mbo-history-banner'), null, 'No history banner on unreached stage');

  // 4. Employee viewer role restrictions
  const uiEmp = new EmployeePartAUI({
    container,
    record: recordHr,
    stage: 'HR_FINAL',
    isEditable: false,
    previewOptions: { viewerRole: 'employee' }
  });
  uiEmp.selectedViewStage = 'appraiser_eval';
  uiEmp.render();
  assert.ok(uiEmp.root.querySelector('.mbo-restricted-notice'), 'Employee must receive restricted notice for Appraiser Evaluation');

  // 5. Appraiser history makes all columns read-only
  const recordApp = createMockRecord({ Status: { value: '13 Manager Final Evaluation' } });
  const uiApp = new EmployeePartAUI({
    container,
    record: recordApp,
    stage: 'APPRAISER_EVALUATION',
    isEditable: true,
    previewOptions: { activeSlotIndex: 2, viewerRole: 'appraiser' }
  });
  uiApp.selectedViewStage = 'objectives';
  uiApp.render();
  assert.strictEqual(uiApp.root.querySelector('textarea:not([disabled])'), null, 'Historical view must render 0 editable textareas');

  // 6. Completed record supports browsing all stages
  const recordComp = createMockRecord({ Status: { value: '16 Completed' } });
  const uiComp = new EmployeePartAUI({
    container,
    record: recordComp,
    stage: 'HR_FINAL',
    isEditable: false,
    previewOptions: { viewerRole: 'hr' }
  });
  uiComp.selectedViewStage = 'appraiser_eval';
  uiComp.render();
  assert.ok(uiComp.root.querySelector('.mbo-history-banner'), 'Completed record supports browsing appraiser evaluation history');
});
