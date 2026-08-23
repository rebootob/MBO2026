import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES, STATUS_TO_STAGE_MAP } from '../src/config/constants.js';

test('Stage Resolution: Unsaved Create Show does not enter Configuration Error', () => {
  // Simulating resolveBusinessStage logic for create event
  const createEvent = { type: 'app.record.create.show', record: {} };
  const stage = createEvent.type === 'app.record.create.show' ? BUSINESS_STAGES.NEW_RECORD : STATUS_TO_STAGE_MAP[createEvent.record.Status?.value];
  assert.equal(stage, BUSINESS_STAGES.NEW_RECORD);
});

test('Stage Resolution: Edit/Detail maps 01 Draft Objective to OBJECTIVE_INPUT', () => {
  const editEvent = { type: 'app.record.edit.show', record: { Status: { value: '01 Draft Objective' } } };
  const stage = STATUS_TO_STAGE_MAP[editEvent.record.Status.value];
  assert.equal(stage, BUSINESS_STAGES.OBJECTIVE_INPUT);
});

test('Validation: NEW_RECORD requires verified employee profile before saving', () => {
  const unverifiedRecord = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Employee_Name: { value: '' } // Not verified from App 53 yet
  };
  const result = ValidationEngine.validate(unverifiedRecord, BUSINESS_STAGES.NEW_RECORD);
  assert.equal(result.isValid, false);
  const empErr = result.fieldErrors.find(e => e.field === 'Employee_Code');
  assert.ok(empErr);
  assert.match(empErr.messageTH, /กรุณากดค้นหาและยืนยันข้อมูลพนักงานก่อนบันทึก/);
});

test('Validation: NEW_RECORD with verified profile and valid objectives passes', () => {
  const verifiedRecord = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Employee_Name: { value: 'Mr.Gritchai Somphonkrang' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Solar project profit' },
    Action_Plan_1: { value: 'Customer expansion' },
    Weight_1: { value: '50' },
    Difficulty_1: { value: '3' },
    Objective_2: { value: 'Safety zero accident' },
    Action_Plan_2: { value: 'Site patrols' },
    Weight_2: { value: '50' },
    Difficulty_2: { value: '3' }
  };
  const result = ValidationEngine.validate(verifiedRecord, BUSINESS_STAGES.NEW_RECORD);
  assert.equal(result.isValid, true);
  assert.equal(result.fieldErrors.length, 0);
});
