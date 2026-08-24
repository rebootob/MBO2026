import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROFILE_CODES,
  PROFILE_FAMILIES,
  PART_A_SCORING_MODES,
  APPRAISER_WEIGHT_RULES,
  CONFIG_LIFECYCLE_STATUS,
  generateMasterRecordKey,
  computeConfigurationHash,
  validateScoringMasterConfig,
  getCanonicalBaselineMasterConfigs
} from '../src/profiles/scoring-config-master.js';

test('WP-002A: Master_Record_Key generation matches Profile_Code + Version exactly', () => {
  const key = generateMasterRecordKey(PROFILE_CODES.ASST_MGR, 'v1.0.0');
  assert.equal(key, 'PROF_ASST_MGR::v1.0.0');
});

test('WP-002A: Valid Staff config passes validation and computes hash', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const staffConfig = baselines.find(c => c.Profile_Code === PROFILE_CODES.STAFF_CHIEF);
  assert.ok(staffConfig);

  const result = validateScoringMasterConfig(staffConfig);
  assert.equal(result.isValid, true);
  assert.ok(result.computedHash);
  assert.equal(typeof result.computedHash, 'string');
  assert.equal(result.computedHash.length, 64); // SHA-256 hex string length
});

test('WP-002A: Valid Assistant Manager 60/40 config passes validation', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const asstMgrConfig = baselines.find(c => c.Profile_Code === PROFILE_CODES.ASST_MGR);
  assert.ok(asstMgrConfig);
  assert.equal(asstMgrConfig.PartA_Weight, 60);
  assert.equal(asstMgrConfig.PartB_Weight, 40);

  const result = validateScoringMasterConfig(asstMgrConfig);
  assert.equal(result.isValid, true);
});

test('WP-002A: Valid GM Executive K=1 config passes validation', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const execConfig = baselines.find(c => c.Profile_Code === PROFILE_CODES.EXECUTIVE);
  assert.ok(execConfig);
  assert.equal(execConfig.Expected_Appraiser_Count, 1);
  assert.equal(execConfig.Part_A_Scoring_Mode, PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT);

  const result = validateScoringMasterConfig(execConfig);
  assert.equal(result.isValid, true);
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

test('WP-002A: Invalid 60/50 weights fail closed with INVALID_SCORING_WEIGHTS', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const invalidWeightsConfig = {
    ...baselines[0],
    PartA_Weight: 60,
    PartB_Weight: 50 // Sum = 110 != 100
  };

  assert.throws(
    () => validateScoringMasterConfig(invalidWeightsConfig),
    { message: /INVALID_SCORING_WEIGHTS/ }
  );
});

test('WP-002A: Invalid Expected_Appraiser_Count fails closed with INVALID_APPRAISER_COUNT', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const invalidKConfig = {
    ...baselines[0],
    Expected_Appraiser_Count: 3 // K must be 1 or 2
  };

  assert.throws(
    () => validateScoringMasterConfig(invalidKConfig),
    { message: /INVALID_APPRAISER_COUNT/ }
  );
});

test('WP-002A: Invalid Part A mode fails closed with INVALID_PART_A_MODE', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const invalidModeConfig = {
    ...baselines[0],
    Part_A_Scoring_Mode: 'INVALID_MODE'
  };

  assert.throws(
    () => validateScoringMasterConfig(invalidModeConfig),
    { message: /INVALID_PART_A_MODE/ }
  );
});

test('WP-002A: Missing competency set fails closed with MISSING_COMPETENCY_SET', () => {
  const baselines = getCanonicalBaselineMasterConfigs();
  const missingCompConfig = {
    ...baselines[0],
    Competency_Set_Code: ''
  };

  assert.throws(
    () => validateScoringMasterConfig(missingCompConfig),
    { message: /MISSING_COMPETENCY_SET/ }
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

  // Changing Config_Status, Published_At, Published_By, Configuration_Hash MUST NOT change hash
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
