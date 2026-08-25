import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProfileCode, ProfileScoringResolverError } from '../src/profiles/profile-scoring-resolver.js';
import { EmployeeService } from '../src/services/employee-service.js';

const record = position => ({
  emp_text: { value: '0149' },
  Number: { value: '149' },
  Text: { value: 'Test Employee' },
  Text_0: { value: 'พนักงานทดสอบ' },
  Drop_down_0: { value: 'Test Department' },
  Drop_down: { value: 'TME1' },
  Text_2: { value: position },
  Text_4: { value: 'test@example.invalid' },
  Date: { value: '2021-04-01' }
});

const fakeApp53 = position => ({
  async getRecords(appId) {
    assert.equal(appId, 53);
    return { records: [record(position)] };
  }
});

async function createVerifiedSnapshot(pos) {
  const res = await EmployeeService.lookupEmployee('0149', fakeApp53(pos));
  return res.employee;
}

test('M10I: Employee 0111 Assistant Section Manager resolves to PROF_ASST_MGR', async () => {
  const snapshot = await createVerifiedSnapshot('Assistant Section Manager');
  const profile = resolveProfileCode(snapshot);
  assert.equal(profile, 'PROF_ASST_MGR');
});

test('M10I: Employee 0118 Technical Service Chief resolves to PROF_STAFF_CHIEF', async () => {
  const snapshot = await createVerifiedSnapshot('Technical Service Chief');
  const profile = resolveProfileCode(snapshot);
  assert.equal(profile, 'PROF_STAFF_CHIEF');
});

test('M10I: Hierarchy regression checks across key positions', async () => {
  const cases = [
    { pos: 'Staff', expected: 'PROF_STAFF_CHIEF' },
    { pos: 'Senior Staff', expected: 'PROF_STAFF_CHIEF' },
    { pos: 'Chief', expected: 'PROF_STAFF_CHIEF' },
    { pos: 'Operator', expected: 'PROF_STAFF_CHIEF' },
    { pos: 'Marketing Staff', expected: 'PROF_STAFF_CHIEF' },
    { pos: 'Japanese Staff', expected: 'PROF_JAPANESE_STAFF' },
    { pos: 'Advisor', expected: 'PROF_JAPANESE_STAFF' },
    { pos: 'Assistant Manager', expected: 'PROF_ASST_MGR' },
    { pos: 'Asst. Section Manager', expected: 'PROF_ASST_MGR' },
    { pos: 'Section Manager', expected: 'PROF_SECTION_MGR' },
    { pos: 'Manager', expected: 'PROF_SECTION_MGR' },
    { pos: 'Factory Manager', expected: 'PROF_SECTION_MGR' },
    { pos: 'Senior Manager', expected: 'PROF_SENIOR_MGR' },
    { pos: 'Deputy General Manager', expected: 'PROF_DGM' },
    { pos: 'General Manager', expected: 'PROF_GM' },
    { pos: 'Vice President', expected: 'PROF_VP' },
    { pos: 'President', expected: 'PROF_VP' }
  ];

  for (const { pos, expected } of cases) {
    const snapshot = await createVerifiedSnapshot(pos);
    const profile = resolveProfileCode(snapshot);
    assert.equal(profile, expected, `Position "${pos}" should resolve to ${expected}`);
  }
});

test('M10I: Blank or invalid position fails closed with PROFILE_SOURCE_INVALID', async () => {
  const emptySnapshot = await createVerifiedSnapshot('');
  assert.throws(
    () => resolveProfileCode(emptySnapshot),
    (err) => err instanceof ProfileScoringResolverError && err.code === 'PROFILE_SOURCE_INVALID'
  );

  const unknownSnapshot = await createVerifiedSnapshot('  ');
  assert.throws(
    () => resolveProfileCode(unknownSnapshot),
    (err) => err instanceof ProfileScoringResolverError && err.code === 'PROFILE_SOURCE_INVALID'
  );
});
