import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';
import { resolveProfileCode } from '../src/profiles/profile-scoring-resolver.js';
import { EmployeeService } from '../src/services/employee-service.js';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';

function createMockRecord(overrides = {}) {
  const base = {
    Employee_Code: { value: '0118' },
    Employee_Name: { value: 'Mr. Peranut Hanpratum' },
    Employee_Section: { value: 'TMS1' },
    Employee_Position: { value: 'Technical Service Chief' },
    Fiscal_Year: { value: 'FY2026' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Routing_Topology: { value: 'SINGLE_MANAGER' },
    Requester_User: { value: [{ code: 's1' }] },
    Objective_Count: { value: '4' },

    Objective_1: { value: 'Achieve sales KPI' },
    Action_Plan_1: { value: 'Visit 5 clients per week' },
    Weight_1: { value: '30' },
    Difficulty_1: { value: '3' },

    Objective_2: { value: 'Improve service quality' },
    Action_Plan_2: { value: 'Conduct customer surveys' },
    Weight_2: { value: '30' },
    Difficulty_2: { value: '3' },

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

const fakeApp53 = position => ({
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
  const noProfileRecord = createMockRecord({ Profile_Code: { value: '' } });
  const res1 = ValidationEngine.validate(noProfileRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res1.isValid, false);
  assert.ok(res1.fieldErrors.some(e => e.field === 'Employee_Code'));

  const noRoutingRecord = createMockRecord({ Routing_Topology: { value: '' } });
  const res2 = ValidationEngine.validate(noRoutingRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res2.isValid, false);
  assert.ok(res2.fieldErrors.some(e => e.field === 'Employee_Code'));

  const emptyRequesterRecord = createMockRecord({ Requester_User: { value: [] } });
  const res3 = ValidationEngine.validate(emptyRequesterRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res3.isValid, false);
  assert.ok(res3.fieldErrors.some(e => e.field === 'Employee_Code'));
});

test('M10L-R2: Malformed non-array Requester_User (string/object/number) blocks save', () => {
  const stringRecord = createMockRecord({ Requester_User: { value: 's1' } });
  const res1 = ValidationEngine.validate(stringRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res1.isValid, false);
  assert.ok(res1.fieldErrors.some(e => e.field === 'Employee_Code'));

  const objectRecord = createMockRecord({ Requester_User: { value: { code: 's1' } } });
  const res2 = ValidationEngine.validate(objectRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res2.isValid, false);
  assert.ok(res2.fieldErrors.some(e => e.field === 'Employee_Code'));

  const numberRecord = createMockRecord({ Requester_User: { value: 123 } });
  const res3 = ValidationEngine.validate(numberRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res3.isValid, false);
  assert.ok(res3.fieldErrors.some(e => e.field === 'Employee_Code'));
});

test('M10L-R1: Requester_User populated array allows validation when other fields valid', () => {
  const validRecord = createMockRecord({ Requester_User: { value: [{ code: 's1' }] } });
  const res = ValidationEngine.validate(validRecord, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, true);
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
  const record = createMockRecord({ Weight_4: { value: '15' } }); // Sum = 95
  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, false);
  assert.ok(res.fieldErrors.some(e => e.field === 'Total_Weight'));
});

test('M10L: Hidden/inactive objective rows are cleared and do not leak into record', () => {
  const record = createMockRecord({
    Objective_Count: { value: '2' },
    Weight_1: { value: '50' },
    Weight_2: { value: '50' },
    // Stale data in row 3 & 4
    Objective_3: { value: 'Stale Objective 3' },
    Weight_3: { value: '20' },
    Objective_4: { value: 'Stale Objective 4' },
    Weight_4: { value: '20' }
  });

  const res = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(res.isValid, true);
  assert.equal(record.Objective_3.value, '');
  assert.equal(record.Weight_3.value, '');
  assert.equal(record.Objective_4.value, '');
  assert.equal(record.Weight_4.value, '');
});

test('M10L-R1: checkDuplicateMBO fails closed when duplicate found', async () => {
  const mockApi = {
    async getRecords() {
      return { records: [{ $id: { value: '100' } }] };
    }
  };
  await assert.rejects(
    async () => EmployeeService.checkDuplicateMBO(794, 'FY2026', '0118', null, mockApi),
    err => err.message.includes('มี MBO สำหรับ FY2026 อยู่แล้ว')
  );
});

test('M10L-R1: checkDuplicateMBO fails closed on GET error or malformed response', async () => {
  const errApi = {
    async getRecords() {
      throw new Error('Network timeout');
    }
  };
  await assert.rejects(
    async () => EmployeeService.checkDuplicateMBO(794, 'FY2026', '0118', null, errApi),
    err => err.message.includes('ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้')
  );

  const malformedApi = {
    async getRecords() {
      return { status: 'error', records: null };
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
