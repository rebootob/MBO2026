import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getCanonicalBaselineMasterConfigs,
  computeConfigurationHash,
  KNOWN_COMPETENCY_SETS,
  PROFILE_CODES,
  PART_A_SCORING_MODES
} from '../src/profiles/scoring-config-master.js';
import {
  ProfileScoringResolverError,
  createVerifiedEmployeeSnapshot,
  normalizeTitle,
  resolveProfileScoringConfig
} from '../src/profiles/profile-scoring-resolver.js';

const AUTHENTICATED = { isAuthenticated: true, subject: 'test-user' };

function configs() {
  return getCanonicalBaselineMasterConfigs().map(config => ({
    ...config,
    Configuration_Hash: computeConfigurationHash(config)
  }));
}

function verifiedSnapshot(position, extras = {}) {
  return createVerifiedEmployeeSnapshot({
    status: 'EMPLOYEE_FOUND',
    employee: { Employee_Code: '0149', Employee_Position: position, ...extras }
  });
}

function resolve(position, overrides = {}) {
  return resolveProfileScoringConfig({
    employeeSnapshot: verifiedSnapshot(position, overrides.snapshotExtras),
    fiscalYear: 'FY2026',
    effectiveDate: '2026-08-24',
    masterConfigRecords: configs(),
    authenticatedContext: AUTHENTICATED,
    ...overrides
  });
}

async function rejectsCode(fn, code) {
  await assert.rejects(async () => fn(), error => error instanceof ProfileScoringResolverError && error.code === code);
}

const profiles = [
  ['Staff & Chief', '  STAFF ', PROFILE_CODES.STAFF_CHIEF],
  ['Japanese Staff', 'Japanese Staff', PROFILE_CODES.JAPANESE_STAFF],
  ['Assistant Manager', 'Assistant Manager', PROFILE_CODES.ASST_MGR],
  ['Section Manager', 'Section  Manager', PROFILE_CODES.SECTION_MGR],
  ['Senior Manager', 'Senior Manager', PROFILE_CODES.SENIOR_MGR],
  ['DGM', 'Deputy General Manager', PROFILE_CODES.DGM],
  ['GM', 'General Manager', PROFILE_CODES.GM],
  ['VP', 'Vice President', PROFILE_CODES.VP]
];

for (const [label, position, profileCode] of profiles) {
  test(`WP-002B profile resolution: ${label}`, () => {
    assert.equal(resolve(position).Profile_Code, profileCode);
  });
}

test('WP-002B normalization uses trim, collapsed internal spaces, and lowercase only', () => {
  assert.equal(normalizeTitle('  Senior   Manager  '), 'senior manager');
  assert.throws(() => normalizeTitle(''), error => error.code === 'PROFILE_SOURCE_INVALID');
});

test('WP-002B ambiguous evidence title fails closed', async () => {
  await rejectsCode(() => Promise.resolve(resolve('Assistant Section Manager')), 'PROFILE_RESOLUTION_AMBIGUOUS');
});

test('WP-002B invalid, unknown, and malformed position sources fail closed', async () => {
  await rejectsCode(() => Promise.resolve(resolve('Unrecognized Title')), 'PROFILE_SOURCE_INVALID');
  await rejectsCode(() => Promise.resolve(resolve('')), 'PROFILE_SOURCE_INVALID');
  const snapshot = createVerifiedEmployeeSnapshot({ status: 'EMPLOYEE_FOUND', employee: { Employee_Code: '0149', Employee_Position: 'Staff' } });
  snapshot.Employee_Position = null;
  await rejectsCode(() => Promise.resolve(resolveProfileScoringConfig({ employeeSnapshot: snapshot, fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configs(), authenticatedContext: AUTHENTICATED })), 'PROFILE_SOURCE_INVALID');
});

test('WP-002B caller Profile_Code and Profile_Family cannot bypass position resolution', async () => {
  await rejectsCode(() => Promise.resolve(resolve('Manager', {
    snapshotExtras: { Profile_Code: PROFILE_CODES.GM, Profile_Family: 'PROFILE_EXECUTIVE' }
  })), 'PROFILE_RESOLUTION_AMBIGUOUS');
});

test('WP-002B rejects unverified snapshots and missing authenticated context', async () => {
  await rejectsCode(() => Promise.resolve(resolveProfileScoringConfig({
    employeeSnapshot: { Employee_Code: '0149', Employee_Position: 'General Manager' },
    fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configs(), authenticatedContext: AUTHENTICATED
  })), 'EMPLOYEE_SNAPSHOT_UNVERIFIED');
  await rejectsCode(() => Promise.resolve(resolveProfileScoringConfig({
    employeeSnapshot: verifiedSnapshot('General Manager'), fiscalYear: 'FY2026', effectiveDate: '2026-08-24', masterConfigRecords: configs()
  })), 'AUTHENTICATED_CONTEXT_REQUIRED');
});

test('WP-002B requires exact Fiscal_Year and includes it in output', async () => {
  assert.equal(resolve('Staff').Fiscal_Year, 'FY2026');
  await rejectsCode(() => Promise.resolve(resolve('Staff', { fiscalYear: 'FY2027' })), 'SCORING_CONFIG_NOT_FOUND');
  const otherFy = configs().map(config => ({ ...config, Fiscal_Year: 'FY2027', Configuration_Hash: computeConfigurationHash({ ...config, Fiscal_Year: 'FY2027' }) }));
  await rejectsCode(() => Promise.resolve(resolve('Staff', { masterConfigRecords: otherFy })), 'SCORING_CONFIG_NOT_FOUND');
});

for (const status of ['DRAFT', 'VALIDATED', 'SUPERSEDED', 'RETIRED']) {
  test(`WP-002B ${status} configuration is ineligible`, async () => {
    const records = configs().map(config => ({ ...config, Config_Status: status }));
    await rejectsCode(() => Promise.resolve(resolve('Staff', { masterConfigRecords: records })), 'SCORING_CONFIG_NOT_FOUND');
  });
}

test('WP-002B requires exactly one active configuration', async () => {
  await rejectsCode(() => Promise.resolve(resolve('Staff', { masterConfigRecords: [] })), 'SCORING_CONFIG_NOT_FOUND');
  const duplicate = configs();
  duplicate.push({ ...duplicate[0] });
  await rejectsCode(() => Promise.resolve(resolve('Staff', { masterConfigRecords: duplicate })), 'SCORING_CONFIG_AMBIGUOUS');
});

test('WP-002B effective period is inclusive and fails outside it', async () => {
  assert.equal(resolve('Staff', { effectiveDate: '2026-04-01' }).Profile_Code, PROFILE_CODES.STAFF_CHIEF);
  assert.equal(resolve('Staff', { effectiveDate: '2027-03-31' }).Profile_Code, PROFILE_CODES.STAFF_CHIEF);
  await rejectsCode(() => Promise.resolve(resolve('Staff', { effectiveDate: '2026-03-31' })), 'SCORING_CONFIG_NOT_FOUND');
  await rejectsCode(() => Promise.resolve(resolve('Staff', { effectiveDate: '2027-04-01' })), 'SCORING_CONFIG_NOT_FOUND');
});

test('WP-002B validates mandatory configuration hashes', async () => {
  const missingHash = configs(); delete missingHash[0].Configuration_Hash;
  await rejectsCode(() => Promise.resolve(resolve('Staff', { masterConfigRecords: missingHash })), 'SCORING_CONFIG_INTEGRITY_FAILED');
  const mismatchedHash = configs(); mismatchedHash[0].Configuration_Hash = '0'.repeat(64);
  await rejectsCode(() => Promise.resolve(resolve('Staff', { masterConfigRecords: mismatchedHash })), 'SCORING_CONFIG_INTEGRITY_FAILED');
});

test('WP-002B preserves deployed scoring, appraiser, COCE, and rounding fidelity', () => {
  const asstMgr = resolve('Assistant Manager');
  const gm = resolve('General Manager');
  const vp = resolve('Vice President');
  const sectionMgr = resolve('Section Manager');
  assert.deepEqual([asstMgr.PartA_Weight, asstMgr.PartB_Weight], [60, 40]);
  assert.equal(gm.Expected_Appraiser_Count, 1);
  assert.equal(vp.Expected_Appraiser_Count, 1);
  assert.equal(gm.Part_A_Scoring_Mode, PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT);
  assert.equal(vp.Part_A_Scoring_Mode, PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT);
  assert.equal(KNOWN_COMPETENCY_SETS.COMP_SET_MANAGEMENT_V1.coceItemIndex, 6);
  assert.equal(KNOWN_COMPETENCY_SETS.COMP_SET_MANAGEMENT_V1.coceIncludedInScore, false);
  assert.deepEqual(KNOWN_COMPETENCY_SETS.COMP_SET_MANAGEMENT_V1.scoredItemIndexes, [1, 2, 3, 4, 5, 7, 8]);
  assert.notEqual(sectionMgr.Final_Rounding_Rule, gm.Final_Rounding_Rule);
});

test('WP-002B has no hardcoded Master App ID, Kintone adapter, or runtime Git dependency', () => {
  const source = readFileSync(new URL('../src/profiles/profile-scoring-resolver.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\.getRecords\(|fetch\(|child_process|simple-git/i);
  assert.doesNotMatch(source, /\b(?:53|794|795)\b/);
});
