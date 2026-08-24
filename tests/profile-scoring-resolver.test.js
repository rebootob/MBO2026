import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EmployeeService, isVerifiedEmployeeSnapshot } from '../src/services/employee-service.js';
import { getCanonicalBaselineMasterConfigs, computeConfigurationHash, KNOWN_COMPETENCY_SETS, PROFILE_CODES, PART_A_SCORING_MODES } from '../src/profiles/scoring-config-master.js';
import { ProfileScoringResolverError, normalizeTitle, resolveProfileScoringConfig } from '../src/profiles/profile-scoring-resolver.js';

const AUTHENTICATED = { isAuthenticated: true, subject: 'test-user' };
const configRecords = () => getCanonicalBaselineMasterConfigs().map(c => ({ ...c, Configuration_Hash: computeConfigurationHash(c) }));
const record = position => ({ emp_text: { value: '0149' }, Number: { value: '149' }, Text: { value: 'Test Employee' }, Text_0: { value: 'พนักงานทดสอบ' }, Drop_down_0: { value: 'Test Department' }, Drop_down: { value: 'TME1' }, Text_2: { value: position }, Text_4: { value: 'test@example.invalid' }, Date: { value: '2021-04-01' } });
const fakeApp53 = position => ({ async getRecords(appId) { assert.equal(appId, 53); return { records: [record(position)] }; } });
async function snapshot(position) { return (await EmployeeService.lookupEmployee('0149', fakeApp53(position))).employee; }
async function resolve(position, overrides = {}) { return resolveProfileScoringConfig({ employeeSnapshot: await snapshot(position), fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords(), authenticatedContext: AUTHENTICATED, ...overrides }); }
async function rejects(fn, code) { await assert.rejects(async () => fn(), e => e instanceof ProfileScoringResolverError && e.code === code); }

for (const [label, position, code] of [
  ['Staff & Chief', '  STAFF ', PROFILE_CODES.STAFF_CHIEF], ['Japanese Staff', 'Japanese Staff', PROFILE_CODES.JAPANESE_STAFF],
  ['Assistant Manager', 'Assistant Manager', PROFILE_CODES.ASST_MGR], ['Section Manager', 'Section  Manager', PROFILE_CODES.SECTION_MGR],
  ['Senior Manager', 'Senior Manager', PROFILE_CODES.SENIOR_MGR], ['DGM', 'Deputy General Manager', PROFILE_CODES.DGM],
  ['GM', 'General Manager', PROFILE_CODES.GM], ['VP', 'Vice President', PROFILE_CODES.VP]
]) test(`WP-002B resolves ${label}`, async () => assert.equal((await resolve(position)).Profile_Code, code));

test('WP-002B normalizes titles and fails closed for ambiguous/invalid titles', async () => {
  assert.equal(normalizeTitle('  Senior   Manager  '), 'senior manager');
  await rejects(() => resolve('Assistant Section Manager'), 'PROFILE_RESOLUTION_AMBIGUOUS');
  await rejects(() => resolve('Unknown Position'), 'PROFILE_SOURCE_INVALID');
});

test('WP-002B accepts only unmodified EmployeeService snapshots', async () => {
  const forged = { Employee_Code: '0149', Employee_Position: 'General Manager' };
  assert.equal(isVerifiedEmployeeSnapshot(forged), false);
  await rejects(() => resolveProfileScoringConfig({ employeeSnapshot: forged, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords(), authenticatedContext: AUTHENTICATED }), 'EMPLOYEE_SNAPSHOT_UNVERIFIED');
  const verified = await snapshot('General Manager');
  assert.equal(isVerifiedEmployeeSnapshot(verified), true);
  assert.equal(resolveProfileScoringConfig({ employeeSnapshot: verified, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords(), authenticatedContext: AUTHENTICATED }).Profile_Code, PROFILE_CODES.GM);
  verified.Employee_Position = 'Staff';
  await rejects(() => resolveProfileScoringConfig({ employeeSnapshot: verified, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords(), authenticatedContext: AUTHENTICATED }), 'EMPLOYEE_SNAPSHOT_UNVERIFIED');
  const codeMutated = await snapshot('Staff'); codeMutated.Employee_Code = '0150';
  await rejects(() => resolveProfileScoringConfig({ employeeSnapshot: codeMutated, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords(), authenticatedContext: AUTHENTICATED }), 'EMPLOYEE_SNAPSHOT_UNVERIFIED');
});

test('WP-002B ignores caller profile fields and requires caller context', async () => {
  const employee = await snapshot('Manager'); employee.Profile_Code = PROFILE_CODES.GM; employee.Profile_Family = 'PROFILE_EXECUTIVE';
  await rejects(() => resolveProfileScoringConfig({ employeeSnapshot: employee, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords(), authenticatedContext: AUTHENTICATED }), 'PROFILE_RESOLUTION_AMBIGUOUS');
  const staffSnapshot = await snapshot('Staff');
  await rejects(() => resolveProfileScoringConfig({ employeeSnapshot: staffSnapshot, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configRecords() }), 'AUTHENTICATED_CONTEXT_REQUIRED');
});

test('WP-002B requires exact fiscal year and matching effective-date fiscal context', async () => {
  assert.equal((await resolve('Staff', { effectiveDate: '2026-04-01' })).Fiscal_Year, 'FY2026');
  assert.equal((await resolve('Staff', { effectiveDate: '2027-03-31' })).Fiscal_Year, 'FY2026');
  await rejects(() => resolve('Staff', { effectiveDate: '2027-04-01' }), 'FISCAL_YEAR_EFFECTIVE_DATE_MISMATCH');
  await rejects(() => resolve('Staff', { effectiveDate: '2026-03-31' }), 'FISCAL_YEAR_EFFECTIVE_DATE_MISMATCH');
});

test('WP-002B selects only exactly one published config in its effective range', async () => {
  for (const status of ['DRAFT', 'VALIDATED', 'SUPERSEDED', 'RETIRED']) await rejects(() => resolve('Staff', { masterConfigRecords: configRecords().map(c => ({ ...c, Config_Status: status })) }), 'SCORING_CONFIG_NOT_FOUND');
  await rejects(() => resolve('Staff', { masterConfigRecords: [] }), 'SCORING_CONFIG_NOT_FOUND');
  const duplicate = configRecords(); duplicate.push({ ...duplicate[0] });
  await rejects(() => resolve('Staff', { masterConfigRecords: duplicate }), 'SCORING_CONFIG_AMBIGUOUS');
});

test('WP-002B requires a valid hash and valid scoring-domain fields', async () => {
  const missingHash = configRecords(); delete missingHash[0].Configuration_Hash;
  await rejects(() => resolve('Staff', { masterConfigRecords: missingHash }), 'SCORING_CONFIG_INTEGRITY_FAILED');
  const mismatchedHash = configRecords(); mismatchedHash[0].Configuration_Hash = '0'.repeat(64);
  await rejects(() => resolve('Staff', { masterConfigRecords: mismatchedHash }), 'SCORING_CONFIG_INTEGRITY_FAILED');
  const invalidWeights = configRecords(); invalidWeights[0].PartA_Weight = 99; invalidWeights[0].PartB_Weight = 2; invalidWeights[0].Configuration_Hash = computeConfigurationHash(invalidWeights[0]);
  await rejects(() => resolve('Staff', { masterConfigRecords: invalidWeights }), 'SCORING_CONFIG_INVALID');
  const invalidAppraisers = configRecords(); invalidAppraisers[0].Expected_Appraiser_Count = 3; invalidAppraisers[0].Configuration_Hash = computeConfigurationHash(invalidAppraisers[0]);
  await rejects(() => resolve('Staff', { masterConfigRecords: invalidAppraisers }), 'SCORING_CONFIG_INVALID');
});

test('WP-002B applies effective-period bounds independently within FY2026', async () => {
  const bounded = configRecords();
  bounded[0].Effective_From = '2026-06-01'; bounded[0].Effective_To = '2027-02-28';
  bounded[0].Configuration_Hash = computeConfigurationHash(bounded[0]);
  await rejects(() => resolve('Staff', { effectiveDate: '2026-05-31', masterConfigRecords: bounded }), 'SCORING_CONFIG_NOT_FOUND');
  await rejects(() => resolve('Staff', { effectiveDate: '2027-03-01', masterConfigRecords: bounded }), 'SCORING_CONFIG_NOT_FOUND');
  assert.equal((await resolve('Staff', { effectiveDate: '2026-06-01', masterConfigRecords: bounded })).Profile_Code, PROFILE_CODES.STAFF_CHIEF);
  assert.equal((await resolve('Staff', { effectiveDate: '2027-02-28', masterConfigRecords: bounded })).Profile_Code, PROFILE_CODES.STAFF_CHIEF);
});

test('WP-002B filters out an otherwise-valid config from another fiscal year', async () => {
  const otherYear = configRecords().map(config => ({ ...config }));
  otherYear[0].Fiscal_Year = 'FY2027'; otherYear[0].Configuration_Hash = computeConfigurationHash(otherYear[0]);
  await rejects(() => resolve('Staff', { masterConfigRecords: otherYear }), 'SCORING_CONFIG_NOT_FOUND');
});

test('WP-002B preserves scoring truth, COCE, rounding, and architecture boundaries', async () => {
  const [asst, gm, vp, section] = await Promise.all(['Assistant Manager', 'General Manager', 'Vice President', 'Section Manager'].map(resolve));
  assert.deepEqual([asst.PartA_Weight, asst.PartB_Weight], [60, 40]); assert.equal(gm.Expected_Appraiser_Count, 1); assert.equal(vp.Expected_Appraiser_Count, 1);
  assert.equal(gm.Part_A_Scoring_Mode, PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT); assert.equal(vp.Part_A_Scoring_Mode, PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT);
  assert.equal(KNOWN_COMPETENCY_SETS.COMP_SET_MANAGEMENT_V1.coceItemIndex, 6); assert.equal(KNOWN_COMPETENCY_SETS.COMP_SET_MANAGEMENT_V1.coceIncludedInScore, false);
  assert.equal(KNOWN_COMPETENCY_SETS.COMP_SET_OPERATIONAL_V1.coceItemIndex, 6); assert.equal(KNOWN_COMPETENCY_SETS.COMP_SET_OPERATIONAL_V1.coceIncludedInScore, false);
  assert.deepEqual(KNOWN_COMPETENCY_SETS.COMP_SET_MANAGEMENT_V1.scoredItemIndexes, [1, 2, 3, 4, 5, 7, 8]);
  assert.notEqual(section.Final_Rounding_Rule, gm.Final_Rounding_Rule);
  const source = readFileSync(new URL('../src/profiles/profile-scoring-resolver.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\.getRecords\(|fetch\(|child_process|simple-git/i); assert.doesNotMatch(source, /\b(?:53|794|795)\b/);
});
