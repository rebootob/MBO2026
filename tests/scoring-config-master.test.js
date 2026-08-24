import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROFILE_CODES,
  PROFILE_FAMILIES,
  PART_A_SCORING_MODES,
  APPRAISER_WEIGHT_RULES,
  ALLOWED_ROUNDING_RULES,
  KNOWN_COMPETENCY_SETS,
  CONFIG_LIFECYCLE_STATUS,
  generateMasterRecordKey,
  computeConfigurationHash,
  validateScoringMasterConfig,
  getCanonicalBaselineMasterConfigs
} from '../src/profiles/scoring-config-master.js';

test('WP-002A: Baseline returns exactly 8 config records for all 8 evaluation groups', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  assert.equal(baselines.length, 8);

  const profileCodes = baselines.map(c => c.Profile_Code);
  const expectedCodes = Object.values(PROFILE_CODES);
  assert.deepEqual(profileCodes.sort(), expectedCodes.sort());
});

test('WP-002A: Section Manager and DGM are separate configs with distinct rounding behavior', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const sectMgr = baselines.find(c => c.Profile_Code === PROFILE_CODES.SECTION_MGR);
  const dgm = baselines.find(c => c.Profile_Code === PROFILE_CODES.DGM);

  assert.ok(sectMgr);
  assert.ok(dgm);
  assert.notEqual(sectMgr.Profile_Code, dgm.Profile_Code);
  assert.notEqual(sectMgr.Master_Record_Key, dgm.Master_Record_Key);

  // Section Manager has explicit final ROUND(...,2) in App 305
  assert.equal(sectMgr.Final_Rounding_Rule, ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_FINAL_ROUND_2);
  // DGM has no explicit final ROUND in App 307
  assert.equal(dgm.Final_Rounding_Rule, ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC);
});

test('WP-002A: Assistant Manager remains 60/40 split', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const asstMgr = baselines.find(c => c.Profile_Code === PROFILE_CODES.ASST_MGR);
  assert.ok(asstMgr);
  assert.equal(asstMgr.PartA_Weight, 60);
  assert.equal(asstMgr.PartB_Weight, 40);
  assert.equal(asstMgr.Expected_Appraiser_Count, 2);

  const result = validateScoringMasterConfig(asstMgr);
  assert.equal(result.isValid, true);
});

test('WP-002A: GM remains K=1 / ACHIEVEMENT_DIRECT', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const gm = baselines.find(c => c.Profile_Code === PROFILE_CODES.GM);
  assert.ok(gm);
  assert.equal(gm.Expected_Appraiser_Count, 1);
  assert.equal(gm.Part_A_Scoring_Mode, PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT);

  const result = validateScoringMasterConfig(gm);
  assert.equal(result.isValid, true);
});

test('WP-002A: Missing Effective_From fails with MISSING_EFFECTIVE_PERIOD', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const missingFrom = {
    ...baselines[0],
    Effective_From: ''
  };

  assert.throws(
    () => validateScoringMasterConfig(missingFrom),
    { message: /MISSING_EFFECTIVE_PERIOD/ }
  );
});

test('WP-002A: Missing Effective_To fails with MISSING_EFFECTIVE_PERIOD', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const missingTo = {
    ...baselines[0],
    Effective_To: null
  };

  assert.throws(
    () => validateScoringMasterConfig(missingTo),
    { message: /MISSING_EFFECTIVE_PERIOD/ }
  );
});

test('WP-002A: Invalid rounding rule fails with INVALID_ROUNDING_RULE', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const invalidRounding = {
    ...baselines[0],
    Final_Rounding_Rule: 'INVALID_ROUNDING_CODE'
  };

  assert.throws(
    () => validateScoringMasterConfig(invalidRounding),
    { message: /INVALID_ROUNDING_RULE/ }
  );
});

test('WP-002A: Current baseline does not globally use UNIFIED_HALF_UP_2_DECIMALS', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const usesUnified = baselines.some(c =>
    c.Final_Rounding_Rule === ALLOWED_ROUNDING_RULES.UNIFIED_HALF_UP_2_DECIMALS ||
    c.PartA_Rounding_Rule === ALLOWED_ROUNDING_RULES.UNIFIED_HALF_UP_2_DECIMALS
  );

  // Deployed baseline truth must NOT use UNIFIED_HALF_UP_2_DECIMALS as active current truth
  assert.equal(usesUnified, false);
});

test('WP-002A: COCE remains Included_In_Score = false across known competency sets', () => {
  for (const setKey of Object.keys(KNOWN_COMPETENCY_SETS)) {
    const compSet = KNOWN_COMPETENCY_SETS[setKey];
    assert.equal(compSet.coceIncludedInScore, false);
    assert.equal(compSet.totalItems - compSet.includedItemsCount, 1);
  }
});

test('WP-002A: Master_Record_Key generation matches Profile_Code + Version exactly', () => {
  const key = generateMasterRecordKey(PROFILE_CODES.ASST_MGR, 'v1.0.0');
  assert.equal(key, 'PROF_ASST_MGR::v1.0.0');
});

test('WP-002A: Duplicate Master_Record_Key fails closed with MASTER_CONFIG_DUPLICATE', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const staffConfig = baselines[0];
  const existingKeys = ['PROF_STAFF_CHIEF::v1.0.0'];

  assert.throws(
    () => validateScoringMasterConfig(staffConfig, existingKeys),
    { message: /MASTER_CONFIG_DUPLICATE/ }
  );
});

test('WP-002A: Configuration_Hash is deterministic across calls', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const config = baselines[0];

  const hash1 = computeConfigurationHash(config);
  const hash2 = computeConfigurationHash(config);
  assert.equal(hash1, hash2);
});

test('WP-002A: Configuration_Hash ignores audit/lifecycle fields', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const configDraft = {
    ...baselines[0],
    Config_Status: CONFIG_LIFECYCLE_STATUS.DRAFT,
    Published_At: null,
    Published_By: null,
    Configuration_Hash: null
  };

  const configPublished = {
    ...baselines[0],
    Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
    Published_At: '2026-08-24T12:00:00Z',
    Published_By: 'user_hr_01',
    Configuration_Hash: 'pre_existing_hash_string'
  };

  const hashDraft = computeConfigurationHash(configDraft);
  const hashPublished = computeConfigurationHash(configPublished);

  assert.equal(hashDraft, hashPublished);
});

test('WP-002A: Configuration_Hash changes when immutable scoring content changes', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const baseConfig = baselines[0];

  const modifiedWeightConfig = {
    ...baseConfig,
    PartA_Weight: 80,
    PartB_Weight: 20
  };

  const hashBase = computeConfigurationHash(baseConfig);
  const hashMod = computeConfigurationHash(modifiedWeightConfig);

  assert.notEqual(hashBase, hashMod);
});
