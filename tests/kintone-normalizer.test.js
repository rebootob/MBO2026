import test from 'node:test';
import assert from 'node:assert/strict';
import {
  unwrapField,
  readString,
  readNumber,
  readUserCodes,
  readFileList,
  projectApp794Objectives
} from '../src/core/kintone-normalizer.js';

test('SHARED_KINTONE_NORMALIZER: unwraps plain values and Kintone { value } field objects correctly', () => {
  assert.equal(unwrapField('hello'), 'hello');
  assert.equal(unwrapField({ value: 'world' }), 'world');
  assert.equal(unwrapField(null), '');

  const rawRec = {
    Employee_Code: { value: 'EMP001' },
    PartA_Weight: { value: '50' },
    Manager_User: { value: [{ code: 'mgr1' }] }
  };

  assert.equal(readString(rawRec, 'Employee_Code'), 'EMP001');
  assert.equal(readNumber(rawRec, 'PartA_Weight'), 50);
  assert.deepEqual(readUserCodes(rawRec, 'Manager_User'), ['mgr1']);
});

test('SHARED_KINTONE_NORMALIZER: projects App 794 flattened objective fields (slots 1..10) without creating phantom rows', () => {
  const flattenedRec = {
    Objective_Count: { value: '4' },
    Objective_1: { value: 'Objective One' },
    Weight_1: { value: '25' },
    Objective_2: { value: 'Objective Two' },
    Weight_2: { value: '25' },
    Objective_3: { value: 'Objective Three' },
    Weight_3: { value: '25' },
    Objective_4: { value: 'Objective Four' },
    Weight_4: { value: '25' }
  };

  const objectives = projectApp794Objectives(flattenedRec);
  assert.equal(objectives.length, 4);
  assert.equal(objectives[0].title, 'Objective One');
  assert.equal(objectives[0].weight, 25);
  assert.equal(objectives[3].title, 'Objective Four');
});
