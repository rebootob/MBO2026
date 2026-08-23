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

test('Validation: Total Weight != 100% fails', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Achieve sales' },
    Action_Plan_1: { value: 'Plan' },
    Weight_1: { value: '60' },
    Difficulty_1: { value: '4' },
    Objective_2: { value: 'Safety' },
    Action_Plan_2: { value: 'Plan' },
    Weight_2: { value: '35' }, // total 95%
    Difficulty_2: { value: '3' }
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /ผลรวม Weight ต้องเท่ากับ 100%/);
});

test('Validation: Difficulty out of bounds (0 or 5) fails', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Achieve sales' },
    Action_Plan_1: { value: 'Plan' },
    Weight_1: { value: '50' },
    Difficulty_1: { value: '5' }, // invalid
    Objective_2: { value: 'Safety' },
    Action_Plan_2: { value: 'Plan' },
    Weight_2: { value: '50' },
    Difficulty_2: { value: '3' }
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /Difficulty Level 1 ต้องอยู่ระหว่าง 1 ถึง 4/);
});

test('Validation: Mid-Year stage requires Progress % between 0-100', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Achieve sales' },
    Action_Plan_1: { value: 'Plan' },
    Weight_1: { value: '50' },
    Difficulty_1: { value: '3' },
    Objective_2: { value: 'Safety' },
    Action_Plan_2: { value: 'Plan' },
    Weight_2: { value: '50' },
    Difficulty_2: { value: '3' },
    Progress_Percent_1: { value: '120' }, // invalid
    MidYear_Result_1: { value: 'On track' },
    Progress_Percent_2: { value: '80' },
    MidYear_Result_2: { value: 'Completed' }
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.MIDYEAR_INPUT);
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /Progress % 1 ระหว่าง 0 ถึง 100%/);
});

test('Validation: Self Evaluation stage requires Actual Result & Achievement 1-5', () => {
  const record = {
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: '0149' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Achieve sales' },
    Action_Plan_1: { value: 'Plan' },
    Weight_1: { value: '50' },
    Difficulty_1: { value: '3' },
    Objective_2: { value: 'Safety' },
    Action_Plan_2: { value: 'Plan' },
    Weight_2: { value: '50' },
    Difficulty_2: { value: '3' },
    Actual_Result_1: { value: '' }, // missing
    Self_Achievement_1: { value: '4' },
    Actual_Result_2: { value: 'Done' },
    Self_Achievement_2: { value: '0' } // invalid
  };
  const result = ValidationEngine.validate(record, BUSINESS_STAGES.SELF_EVALUATION);
  assert.equal(result.isValid, false);
  assert.equal(result.errors.length, 2);
});

test('Validation: Configuration Error stage fails closed immediately', () => {
  const result = ValidationEngine.validate({}, BUSINESS_STAGES.CONFIGURATION_ERROR);
  assert.equal(result.isValid, false);
  assert.match(result.errors[0], /SYSTEM CONFIGURATION ERROR/);
});
