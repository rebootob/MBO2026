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
  SEMANTIC_PROJECTION_PATHS,
  getObjectiveProjectionPath,
  validatePartAObjectiveCount,
  validatePartBCompetencyCount,
  validateTemplateSha,
  validateAddressFormat,
  MboXlsxTemplateProfile,
  validateMappingIntegrity
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

test('TEMPLATE_PROFILE_PART_B_ROW_AUTHORITY_TOPOLOGY: proves exact N=6, N=7, N=8 dynamic rating vs protected padding rows', () => {
  const profile = new MboXlsxTemplateProfile();
  const cols = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

  // Proof 1: N=6 rows 10, 14, 18, 22, 26 (columns K:X) ARE DYNAMIC rating rows
  for (const r of [10, 14, 18, 22, 26]) {
    for (const c of cols) {
      assert.equal(profile.isDynamicWriteTarget('B', `${c}${r}`, 6), true, `N6 cell ${c}${r} MUST be dynamic`);
    }
  }

  // Proof 2: Row 30 (columns K:X) IS NON-DYNAMIC for N=6, N=7, N=8
  for (const n of [6, 7, 8]) {
    for (const c of cols) {
      assert.equal(profile.isDynamicWriteTarget('B', `${c}30`, n), false, `N${n} cell ${c}30 MUST be non-dynamic`);
    }
  }

  // Proof 3: N=7 rows 31..33 (K:X) ARE DYNAMIC
  for (let r = 31; r <= 33; r++) {
    for (const c of cols) {
      assert.equal(profile.isDynamicWriteTarget('B', `${c}${r}`, 7), true, `N7 cell ${c}${r} MUST be dynamic`);
    }
  }

  // Proof 4: N=7 row 34 (K:X) IS NON-DYNAMIC
  for (const c of cols) {
    assert.equal(profile.isDynamicWriteTarget('B', `${c}34`, 7), false, `N7 cell ${c}34 MUST be non-dynamic`);
  }

  // Proof 5: N=8 rows 31..33 and 35..37 (K:X) ARE DYNAMIC
  for (const r of [31, 32, 33, 35, 36, 37]) {
    for (const c of cols) {
      assert.equal(profile.isDynamicWriteTarget('B', `${c}${r}`, 8), true, `N8 cell ${c}${r} MUST be dynamic`);
    }
  }

  // Proof 6: N=8 rows 34 and 38 (K:X) ARE NON-DYNAMIC
  for (const r of [34, 38]) {
    for (const c of cols) {
      assert.equal(profile.isDynamicWriteTarget('B', `${c}${r}`, 8), false, `N8 cell ${c}${r} MUST be non-dynamic`);
    }
  }

  // Proof 7: Summary row destinations are exactly 31:34 (N=6), 35:38 (N=7), 39:42 (N=8)
  const map6 = profile.getPartBMappings(6);
  assert.equal(map6.summary.startRow, 31);
  assert.equal(map6.summary.endRow, 34);

  const map7 = profile.getPartBMappings(7);
  assert.equal(map7.summary.startRow, 35);
  assert.equal(map7.summary.endRow, 38);

  const map8 = profile.getPartBMappings(8);
  assert.equal(map8.summary.startRow, 39);
  assert.equal(map8.summary.endRow, 42);

  // Proof 8: False original padding model [10, 14, 18, 22, 26, 30] DOES NOT SURVIVE
  assert.deepEqual(map6.protectedPaddingRows, [30], 'N6 protected padding rows must be strictly [30]');
  assert.deepEqual(map7.protectedPaddingRows, [30, 34], 'N7 protected padding rows must be strictly [30, 34]');
  assert.deepEqual(map8.protectedPaddingRows, [30, 34, 38], 'N8 protected padding rows must be strictly [30, 34, 38]');
});

test('TEMPLATE_PROFILE_SECURED_PROJECTION_SEMANTICS: aligns with read-only MboExportService projection paths', () => {
  const profile = new MboXlsxTemplateProfile();

  // Proof 9: Both department and section Hoshin projection paths are represented
  const depHoshinRes = profile.resolveSemanticRole('HOSHIN_DEPARTMENT_HOSHIN_TITLE', { partKey: 'A' });
  assert.equal(depHoshinRes.projectionPath, 'partA.hoshin.departmentHoshinTitle');

  const secHoshinRes = profile.resolveSemanticRole('HOSHIN_SECTION_HOSHIN_TITLE', { partKey: 'A' });
  assert.equal(secHoshinRes.projectionPath, 'partA.hoshin.sectionHoshinTitle');

  // Proof 10: Every claimed objective semantic role has explicit projection-path translation
  for (let i = 1; i <= 4; i++) {
    const titleRes = profile.resolveSemanticRole(`OBJECTIVE_${i}_TITLE`, { partKey: 'A', objectiveCount: 4 });
    assert.equal(titleRes.projectionPath, `partA.objectives[${i-1}].title`);

    const weightRes = profile.resolveSemanticRole(`OBJECTIVE_${i}_WEIGHT`, { partKey: 'A', objectiveCount: 4 });
    assert.equal(weightRes.projectionPath, `partA.objectives[${i-1}].weight`);

    const selfCommentRes = profile.resolveSemanticRole(`OBJECTIVE_${i}_SELF_COMMENT`, { partKey: 'A', objectiveCount: 4 });
    assert.equal(selfCommentRes.projectionPath, `partA.objectives[${i-1}].selfComment`);
  }

  // Header semantics carry explicit projection paths
  const empNameRes = profile.resolveSemanticRole('HEADER_EMPLOYEE_NAME', { partKey: 'A' });
  assert.equal(empNameRes.projectionPath, 'partA.header.employeeName');

  const deptRes = profile.resolveSemanticRole('HEADER_DEPARTMENT', { partKey: 'A' });
  assert.equal(deptRes.projectionPath, 'partA.header.department');
});

test('TEMPLATE_PROFILE_FAIL_CLOSED_INTEGRITY_VALIDATOR: validates default profile and catches in-memory anomalies', () => {
  const profile = new MboXlsxTemplateProfile();

  // Proof 15: Default profile passes production integrity validator
  assert.equal(validateMappingIntegrity(profile), true);
  assert.equal(validateMappingIntegrity(), true);

  // Proof 11: Removing required mapping in-memory => exact blocker
  const brokenProfile1 = Object.create(profile);
  brokenProfile1.getPartAMappings = function(count) {
    const map = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, count);
    const clone = JSON.parse(JSON.stringify(map));
    delete clone.header.EMPLOYEE_NAME;
    return clone;
  };
  assert.throws(
    () => validateMappingIntegrity(brokenProfile1),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );

  // Proof 12: Duplicate exclusive target in-memory => exact blocker
  const brokenProfile2 = Object.create(profile);
  brokenProfile2.getPartAMappings = function(count) {
    const map = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, count);
    const clone = JSON.parse(JSON.stringify(map));
    clone.header.EMPLOYEE_CODE = clone.header.EMPLOYEE_NAME; // Duplicate cell address
    return clone;
  };
  assert.throws(
    () => validateMappingIntegrity(brokenProfile2),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );

  // Proof 13: Exposing row 30/34/38 writable in-memory => exact blocker
  const brokenProfile3 = Object.create(profile);
  brokenProfile3.isDynamicWriteTarget = function(partKey, cellAddress, count) {
    if (cellAddress === 'K30') return true; // Exposing row 30 as writable
    return MboXlsxTemplateProfile.prototype.isDynamicWriteTarget.call(this, partKey, cellAddress, count);
  };
  assert.throws(
    () => validateMappingIntegrity(brokenProfile3),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );

  // Proof 14: Malformed address/range => exact blocker
  assert.equal(validateAddressFormat('INVALID_CELL_123'), false);
  assert.equal(validateAddressFormat('$$5'), false);
  assert.equal(validateAddressFormat('Z7'), true);
  assert.equal(validateAddressFormat('B25:E25'), true);

  const brokenProfile4 = Object.create(profile);
  brokenProfile4.getPartAMappings = function(count) {
    const map = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, count);
    const clone = JSON.parse(JSON.stringify(map));
    clone.header.FISCAL_YEAR = 'INVALID_ADDR';
    return clone;
  };
  assert.throws(
    () => validateMappingIntegrity(brokenProfile4),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
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

test('TEMPLATE_PROFILE_CALLER_IMMUTABILITY: profile resolution does not mutate caller input options or returned mappings', () => {
  const profile = new MboXlsxTemplateProfile();
  const callerOptions = Object.freeze({ partKey: 'A', objectiveCount: 5 });

  const roleRes = profile.resolveSemanticRole('HEADER_EMPLOYEE_NAME', callerOptions);
  assert.equal(roleRes.address, 'Z7');
  assert.deepEqual(callerOptions, { partKey: 'A', objectiveCount: 5 });

  // Returned mapping object is frozen
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
