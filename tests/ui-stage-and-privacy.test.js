import test from 'node:test';
import assert from 'node:assert/strict';
import { STATUS_TO_STAGE_MAP, BUSINESS_STAGES, CONFIDENTIAL_FIELDS } from '../src/config/constants.js';

test('Constants: Known workflow statuses map to correct business stages', () => {
  assert.equal(STATUS_TO_STAGE_MAP['01 Draft Objective'], BUSINESS_STAGES.OBJECTIVE_INPUT);
  assert.equal(STATUS_TO_STAGE_MAP['02 First Manager Objective Review'], BUSINESS_STAGES.READ_ONLY);
  assert.equal(STATUS_TO_STAGE_MAP['03 Manager Objective Review'], BUSINESS_STAGES.READ_ONLY);
  assert.equal(STATUS_TO_STAGE_MAP['06 Employee Mid-Year'], BUSINESS_STAGES.MIDYEAR_INPUT);
  assert.equal(STATUS_TO_STAGE_MAP['11 Employee Self Evaluation'], BUSINESS_STAGES.SELF_EVALUATION);
  assert.equal(STATUS_TO_STAGE_MAP['16 Completed'], BUSINESS_STAGES.READ_ONLY);
});

test('Privacy: Confidential fields contains all Manager, GM, and Part B scores', () => {
  assert.ok(CONFIDENTIAL_FIELDS.includes('Manager_Achievement_1'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('GM_Achievement_1'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('Manager_Comment_1'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('GM_Comment_1'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('PartA_Raw_Score'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('PartB_Raw_Score'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('Final_Confidential_Score'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('Manager_Competency_Rating_1'));
  assert.ok(CONFIDENTIAL_FIELDS.includes('GM_Competency_Rating_1'));
});
