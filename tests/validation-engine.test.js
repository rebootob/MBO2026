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
  assert.equal(result.errors.length, 0);
});

test('Validation: Valid 5 Objectives with Weight 100% passes', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '5' },
    Objective_1: { value: 'Obj 1' }, Action_Plan_1: { value: 'Plan 1' }, Weight_1: { value: '20' }, Difficulty_1: { value: '3' },
    Objective_2: { value: 'Obj 2' }, Action_Plan_2: { value: 'Plan 2' }, Weight_2: { value: '20' }, Difficulty_2: { value: '3' },
    Objective_3: { value: 'Obj 3' }, Action_Plan_3: { value: 'Plan 3' }, Weight_3: { value: '20' }, Difficulty_3: { value: '3' },
    Objective_4: { value: 'Obj 4' }, Action_Plan_4: { value: 'Plan 4' }, Weight_4: { value: '20' }, Difficulty_4: { value: '3' },
    Objective_5: { value: 'Obj 5' }, Action_Plan_5: { value: 'Plan 5' }, Weight_5: { value: '20' }, Difficulty_5: { value: '3' },
    Weight_6: { value: '50' } // Inactive slot with old value - should be ignored!
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, true);
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
});

test('Validation: Objective Count < 2 or > 10 blocks', () => {
  const recordLow = { Fiscal_Year: { value: 'FY2026' }, Employee_Code: { value: '0149' }, Objective_Count: { value: '1' } };
  const resLow = ValidationEngine.validate(recordLow, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(resLow.isValid, false);
  assert.match(resLow.errors[0], /จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ/);

  const recordHigh = { Fiscal_Year: { value: 'FY2026' }, Employee_Code: { value: '0149' }, Objective_Count: { value: '11' } };
  const resHigh = ValidationEngine.validate(recordHigh, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(resHigh.isValid, false);
  assert.match(resHigh.errors[0], /จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ/);
});

test('Validation: Total Weight != 100% fails (e.g. 10 items total 99%)', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '10' }
  };
  for (let i = 1; i <= 9; i++) {
    record[`Objective_${i}`] = { value: `Obj ${i}` };
    record[`Action_Plan_${i}`] = { value: `Plan ${i}` };
    record[`Weight_${i}`] = { value: '10' };
    record[`Difficulty_${i}`] = { value: '3' };
  }
  record['Objective_10'] = { value: 'Obj 10' };
  record['Action_Plan_10'] = { value: 'Plan 10' };
  record['Weight_10'] = { value: '9' }; // total 99%
  record['Difficulty_10'] = { value: '3' };

  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /ผลรวม Weight ต้องเท่ากับ 100%/);
});

test('Validation: Configuration Error stage fails closed immediately', () => {
  const result = ValidationEngine.validate({}, BUSINESS_STAGES.CONFIGURATION_ERROR);
  assert.equal(result.isValid, false);
  assert.match(result.errors[0], /SYSTEM CONFIGURATION ERROR/);
});
