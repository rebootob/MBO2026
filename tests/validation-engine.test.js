import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationEngine } from '../src/validation/validation-engine.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';

test('Validation: Valid 2 Objectives with Weight 100% passes', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Achieve sales profit' },
    Action_Plan_1: { value: 'Visit customers weekly' },
    Weight_1: { value: '60' },
    Difficulty_1: { value: '4' },
    Objective_2: { value: 'Safety accident = 0' },
    Action_Plan_2: { value: 'Conduct weekly patrol' },
    Weight_2: { value: '40' },
    Difficulty_2: { value: '3' }
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, true);
  assert.equal(result.fieldErrors.length, 0);
  assert.equal(result.errors.length, 0);
});

test('Validation: Missing Objective & Action Plan returns structured field errors', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '4' },
    Objective_1: { value: 'Obj 1' }, Action_Plan_1: { value: 'Plan 1' }, Weight_1: { value: '25' }, Difficulty_1: { value: '3' },
    Objective_2: { value: 'Obj 2' }, Action_Plan_2: { value: 'Plan 2' }, Weight_2: { value: '25' }, Difficulty_2: { value: '3' },
    Objective_3: { value: '' },      Action_Plan_3: { value: '' },       Weight_3: { value: '25' }, Difficulty_3: { value: '3' },
    Objective_4: { value: '' },      Action_Plan_4: { value: '' },       Weight_4: { value: '25' }, Difficulty_4: { value: '3' }
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, false);
  assert.equal(result.fieldErrors.length, 4);

  const fields = result.fieldErrors.map(e => e.field);
  assert.deepEqual(fields, ['Objective_3', 'Action_Plan_3', 'Objective_4', 'Action_Plan_4']);
  assert.equal(result.fieldErrors[0].messageTH, 'กรุณาระบุเป้าหมายข้อที่ 3');
  assert.equal(result.fieldErrors[0].messageEN, 'Please enter Objective 3');
});

test('Validation: Valid 10 Objectives with Weight 100% passes', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '10' }
  };
  for (let i = 1; i <= 10; i++) {
    record[`Objective_${i}`] = { value: `Obj ${i}` };
    record[`Action_Plan_${i}`] = { value: `Plan ${i}` };
    record[`Weight_${i}`] = { value: '10' };
    record[`Difficulty_${i}`] = { value: '3' };
  }
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, true);
  assert.equal(result.fieldErrors.length, 0);
});

test('Validation: Objective Count < 2 or > 10 blocks', () => {
  const recordLow = { Fiscal_Year: { value: 'FY2026' }, Employee_Code: { value: '0149' }, Objective_Count: { value: '1' } };
  const resLow = ValidationEngine.validate(recordLow, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(resLow.isValid, false);
  assert.equal(resLow.fieldErrors[0].field, 'Objective_Count');

  const recordHigh = { Fiscal_Year: { value: 'FY2026' }, Employee_Code: { value: '0149' }, Objective_Count: { value: '11' } };
  const resHigh = ValidationEngine.validate(recordHigh, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(resHigh.isValid, false);
  assert.equal(resHigh.fieldErrors[0].field, 'Objective_Count');
});

test('Validation: Total Weight != 100% produces Total_Weight field error', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Obj 1' }, Action_Plan_1: { value: 'Plan 1' }, Weight_1: { value: '40' }, Difficulty_1: { value: '3' },
    Objective_2: { value: 'Obj 2' }, Action_Plan_2: { value: 'Plan 2' }, Weight_2: { value: '40' }, Difficulty_2: { value: '3' }
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, false);
  const totalWeightErr = result.fieldErrors.find(e => e.field === 'Total_Weight');
  assert.ok(totalWeightErr);
  assert.match(totalWeightErr.messageTH, /ผลรวมน้ำหนักต้องเท่ากับ 100%/);
});

test('Validation: Configuration Error stage fails closed immediately with SYSTEM code', () => {
  const result = ValidationEngine.validate({}, BUSINESS_STAGES.CONFIGURATION_ERROR);
  assert.equal(result.isValid, false);
  assert.equal(result.fieldErrors[0].field, 'SYSTEM');
  assert.match(result.fieldErrors[0].messageTH, /SYSTEM CONFIGURATION ERROR/);
});
