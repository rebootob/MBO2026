import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  MBO2026_PROFILE_ID,
  PART_A_TEMPLATE_SHA256,
  PART_B_TEMPLATE_SHA256,
  ACCEPTED_PART_A_OBJECTIVE_COUNTS,
  ACCEPTED_PART_B_COMPETENCY_COUNTS,
  validatePartAObjectiveCount,
  validatePartBCompetencyCount,
  validateTemplateSha,
  MboXlsxTemplateProfile
} from '../src/profiles/mbo-xlsx-template-profile.js';

test('TEMPLATE_PROFILE_EXACT_SHA_IDENTITY: exports exact accepted Part A and Part B SHA-256 hashes', () => {
  assert.equal(
    PART_A_TEMPLATE_SHA256,
    '03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3',
    'Part A SHA-256 must match exact baseline identity'
  );
  assert.equal(
    PART_B_TEMPLATE_SHA256,
    'c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3',
    'Part B SHA-256 must match exact baseline identity'
  );

  const profile = new MboXlsxTemplateProfile();
  assert.equal(profile.profileId, MBO2026_PROFILE_ID);
  assert.equal(profile.partASha, PART_A_TEMPLATE_SHA256);
  assert.equal(profile.partBSha, PART_B_TEMPLATE_SHA256);

  // Validate exact SHA helper
  assert.equal(validateTemplateSha('A', PART_A_TEMPLATE_SHA256), true);
  assert.equal(validateTemplateSha('B', PART_B_TEMPLATE_SHA256), true);

  // Wrong SHA throws EXPORT_TEMPLATE_PROFILE_UNRESOLVED
  assert.throws(
    () => validateTemplateSha('A', '0000000000000000000000000000000000000000000000000000000000000000'),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
  assert.throws(
    () => validateTemplateSha('B', '0000000000000000000000000000000000000000000000000000000000000000'),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
});

test('TEMPLATE_PROFILE_EXACT_CARDINALITY_DOMAINS: objective counts = 4..10, competency counts = 6..8', () => {
  assert.deepEqual(ACCEPTED_PART_A_OBJECTIVE_COUNTS, [4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(ACCEPTED_PART_B_COMPETENCY_COUNTS, [6, 7, 8]);

  const profile = new MboXlsxTemplateProfile();
  assert.deepEqual(profile.getPartAObjectiveDomain(), [4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(profile.getPartBCompetencyDomain(), [6, 7, 8]);
});

test('TEMPLATE_PROFILE_DETERMINISTIC_MAPPING_PART_A: maps all objective counts 4..10 without gap or truncation', () => {
  const profile = new MboXlsxTemplateProfile();

  for (let n = 4; n <= 10; n++) {
    const map = profile.getPartAMappings(n);
    assert.equal(map.profileId, 'MBO2026');
    assert.equal(map.objectiveCount, n);
    assert.equal(map.objectives.length, n);

    // Verify row progression
    for (let i = 0; i < n; i++) {
      const obj = map.objectives[i];
      assert.equal(obj.index, i + 1);
      assert.equal(obj.row, 25 + i);
      assert.equal(obj.OBJECTIVE_NAME_AND_TARGET, `B${25 + i}`);
      assert.equal(obj.WEIGHT, `F${25 + i}`);
    }

    // Verify summary score rows move deterministically with extraRows (N - 4)
    assert.equal(map.summary.WEIGHT_SUM_ROW, 25 + n);
    assert.equal(map.summary.WEIGHT_SUM, `F${25 + n}`);
    assert.equal(map.summary.PART_A_RAW_SCORE, `BC${25 + n}`);
    assert.equal(map.summary.FINAL_GRADE, `BI${27 + n}`);
  }
});

test('TEMPLATE_PROFILE_DETERMINISTIC_MAPPING_PART_B: maps all competency counts 6..8 with exact block relocation', () => {
  const profile = new MboXlsxTemplateProfile();

  for (const n of [6, 7, 8]) {
    const map = profile.getPartBMappings(n);
    assert.equal(map.profileId, 'MBO2026');
    assert.equal(map.competencyCount, n);
    assert.equal(map.competencies.length, n);

    const extraBlocks = n - 6;
    const extraRows = 4 * extraBlocks;

    // Verify block start rows and ratings
    for (let b = 1; b <= n; b++) {
      const comp = map.competencies[b - 1];
      const startRow = 7 + (b - 1) * 4;
      assert.equal(comp.index, b);
      assert.equal(comp.blockStartRow, startRow);
      assert.equal(comp.paddingRow, startRow + 3);
      assert.equal(comp.selfRatings[0], `K${startRow}`);
      assert.equal(comp.chiefRatings[0], `R${startRow}`);
    }

    // Verify summary relocation
    const expectedSummaryStart = 31 + extraRows;
    assert.equal(map.summary.startRow, expectedSummaryStart);
    assert.equal(map.summary.OVERALL_RATING_SUMMARY, `B${expectedSummaryStart}`);
    assert.equal(map.summary.EMPLOYEE_COMMENTS, `E${expectedSummaryStart}`);
    assert.equal(map.summary.CHIEF_FEEDBACK, `I${expectedSummaryStart}`);
  }
});

test('TEMPLATE_PROFILE_FAIL_CLOSED_INVALID_INPUTS: invalid counts, unknown profile, or unmapped role throw EXPORT_TEMPLATE_PROFILE_UNRESOLVED', () => {
  const profile = new MboXlsxTemplateProfile();

  // Invalid profileId constructor
  assert.throws(
    () => new MboXlsxTemplateProfile({ profileId: 'MBO2027' }),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );

  // Invalid Part A objective counts
  for (const invalidCount of [3, 11, 4.5, '4', '10', null, undefined, {}, []]) {
    assert.throws(
      () => validatePartAObjectiveCount(invalidCount),
      /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
    );
    assert.throws(
      () => profile.getPartAMappings(invalidCount),
      /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
    );
  }

  // Invalid Part B competency counts
  for (const invalidCount of [5, 9, 6.5, '6', '8', null, undefined, {}, []]) {
    assert.throws(
      () => validatePartBCompetencyCount(invalidCount),
      /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
    );
    assert.throws(
      () => profile.getPartBMappings(invalidCount),
      /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
    );
  }

  // Unmapped or invalid semantic role
  assert.throws(
    () => profile.resolveSemanticRole('NON_EXISTENT_ROLE', { partKey: 'A', objectiveCount: 4 }),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
  assert.throws(
    () => profile.resolveSemanticRole('HEADER_INVALID_KEY', { partKey: 'A', objectiveCount: 4 }),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
  assert.throws(
    () => profile.resolveSemanticRole(null),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
});

test('TEMPLATE_PROFILE_PROTECTED_PADDING_NON_WRITABLE: source row 30 and N=7/8 padding clones rows 34/38 never resolve as dynamic write targets', () => {
  const profile = new MboXlsxTemplateProfile();

  // N=6 padding rows: 10, 14, 18, 22, 26, 30
  const map6 = profile.getPartBMappings(6);
  assert.deepEqual(map6.protectedPaddingRows, [10, 14, 18, 22, 26, 30]);
  assert.equal(profile.isDynamicWriteTarget('B', 'B30', 6), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'K30', 6), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'X30', 6), false);

  // N=7 padding rows: 10, 14, 18, 22, 26, 30, 34
  const map7 = profile.getPartBMappings(7);
  assert.deepEqual(map7.protectedPaddingRows, [10, 14, 18, 22, 26, 30, 34]);
  assert.equal(profile.isDynamicWriteTarget('B', 'B30', 7), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'B34', 7), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'K34', 7), false);

  // N=8 padding rows: 10, 14, 18, 22, 26, 30, 34, 38
  const map8 = profile.getPartBMappings(8);
  assert.deepEqual(map8.protectedPaddingRows, [10, 14, 18, 22, 26, 30, 34, 38]);
  assert.equal(profile.isDynamicWriteTarget('B', 'B30', 8), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'B34', 8), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'B38', 8), false);
  assert.equal(profile.isDynamicWriteTarget('B', 'K38', 8), false);

  // Verify real dynamic rating cells DO resolve as dynamic write targets
  assert.equal(profile.isDynamicWriteTarget('B', 'K7', 6), true);
  assert.equal(profile.isDynamicWriteTarget('B', 'R7', 6), true);
  assert.equal(profile.isDynamicWriteTarget('B', 'K31', 7), true);
  assert.equal(profile.isDynamicWriteTarget('B', 'K35', 8), true);
});

test('TEMPLATE_PROFILE_EXCLUSIVE_MAPPING_NO_DUPLICATES: no duplicate semantic owner for the same exclusive write responsibility', () => {
  const profile = new MboXlsxTemplateProfile();

  // Part A exclusive write targets
  for (let n = 4; n <= 10; n++) {
    const mapA = profile.getPartAMappings(n);
    const writeTargetsA = [];

    // Add headers
    writeTargetsA.push(...Object.values(mapA.header));
    writeTargetsA.push(mapA.hoshin.CORPORATE_HOSHIN_TEXT);
    writeTargetsA.push(mapA.hoshin.DEPARTMENT_HOSHIN_TEXT);

    // Add objective fields
    for (const obj of mapA.objectives) {
      writeTargetsA.push(obj.OBJECTIVE_NAME_AND_TARGET);
      writeTargetsA.push(obj.WEIGHT);
      writeTargetsA.push(obj.PLAN_TARGET);
      writeTargetsA.push(obj.MID_TERM_PROGRESS);
      writeTargetsA.push(obj.SELF_RATING);
      writeTargetsA.push(obj.CHIEF_RATING);
      writeTargetsA.push(obj.FINAL_RATING);
      writeTargetsA.push(obj.SELF_COMMENT);
      writeTargetsA.push(obj.CHIEF_COMMENT);
    }

    // Add summary fields
    writeTargetsA.push(mapA.summary.WEIGHT_SUM);
    writeTargetsA.push(mapA.summary.PART_A_RAW_SCORE);
    writeTargetsA.push(mapA.summary.PART_A_WEIGHTED_SCORE);
    writeTargetsA.push(mapA.summary.PART_B_RAW_SCORE);
    writeTargetsA.push(mapA.summary.PART_B_WEIGHTED_SCORE);
    writeTargetsA.push(mapA.summary.FINAL_SCORE);
    writeTargetsA.push(mapA.summary.FINAL_GRADE);

    const setA = new Set(writeTargetsA);
    assert.equal(
      setA.size,
      writeTargetsA.length,
      `Part A N=${n} write targets must have 0 duplicate addresses`
    );
  }

  // Part B exclusive write targets
  for (const n of [6, 7, 8]) {
    const mapB = profile.getPartBMappings(n);
    const writeTargetsB = [];

    // Add header values
    writeTargetsB.push(mapB.header.FISCAL_YEAR);
    writeTargetsB.push(mapB.header.DEPARTMENT_VALUE);
    writeTargetsB.push(mapB.header.SECTION_VALUE);
    writeTargetsB.push(mapB.header.POSITION_VALUE);
    writeTargetsB.push(mapB.header.EMPLOYEE_ID_VALUE);
    writeTargetsB.push(mapB.header.EMPLOYEE_NAME_VALUE);

    // Add competency rating cells
    for (const comp of mapB.competencies) {
      writeTargetsB.push(...comp.selfRatings);
      writeTargetsB.push(...comp.chiefRatings);
    }

    // Add summary fields
    writeTargetsB.push(mapB.summary.OVERALL_RATING_SUMMARY);
    writeTargetsB.push(mapB.summary.EMPLOYEE_COMMENTS);
    writeTargetsB.push(mapB.summary.CHIEF_FEEDBACK);
    writeTargetsB.push(mapB.summary.EMPLOYEE_SIGNATURE);
    writeTargetsB.push(mapB.summary.CHIEF_SIGNATURE);

    const setB = new Set(writeTargetsB);
    assert.equal(
      setB.size,
      writeTargetsB.length,
      `Part B N=${n} write targets must have 0 duplicate addresses`
    );
  }
});

test('TEMPLATE_PROFILE_CALLER_IMMUTABILITY: profile resolution does not mutate caller input options or returned mappings', () => {
  const profile = new MboXlsxTemplateProfile();
  const callerOptions = Object.freeze({ partKey: 'A', objectiveCount: 5 });

  const role = profile.resolveSemanticRole('HEADER_EMPLOYEE_NAME', callerOptions);
  assert.equal(role, 'Z7');
  assert.deepEqual(callerOptions, { partKey: 'A', objectiveCount: 5 });

  const mapA = profile.getPartAMappings(5);
  assert.throws(
    () => { mapA.objectiveCount = 99; },
    /TypeError/
  );
});

test('TEMPLATE_PROFILE_PURE_IMPORTS_NO_WORKBOOK_IO: source file imports no fs, Kintone adapter, or xlsx-populate', () => {
  const profileSourcePath = path.join(process.cwd(), 'src', 'profiles', 'mbo-xlsx-template-profile.js');
  const sourceCode = fs.readFileSync(profileSourcePath, 'utf8');

  assert.equal(/^import\s+fs/m.test(sourceCode), false, 'Must not import fs');
  assert.equal(/require\(['"]fs['"]\)/.test(sourceCode), false, 'Must not require fs');
  assert.equal(/xlsx-populate/.test(sourceCode), false, 'Must not reference xlsx-populate');
  assert.equal(/kintone/i.test(sourceCode), false, 'Must not reference kintone');
});
