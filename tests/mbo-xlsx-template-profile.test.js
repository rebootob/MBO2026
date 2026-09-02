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
  CHIEF_DYNAMIC_AUTHORITY,
  SELF_DYNAMIC_AUTHORITY,
  PROVEN_SAFE_ROLES,
  UNRESOLVED_ROLES,
  NO_SECURED_SOURCE_ROLES,
  SEMANTIC_PROJECTION_PATHS,
  getObjectiveProjectionPath,
  validatePartAObjectiveCount,
  validatePartBCompetencyCount,
  validateTemplateSha,
  validateAddressFormat,
  MboXlsxTemplateProfile,
  validateMappingIntegrity
} from '../src/profiles/mbo-xlsx-template-profile.js';

test('TEMPLATE_PROFILE_EXACT_SHA_AND_ROLE_COUNTS: 18 SAFE, 22 UNRESOLVED, 5 NO_SOURCE roles', () => {
  assert.equal(PART_A_TEMPLATE_SHA256, '03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3');
  assert.equal(PART_B_TEMPLATE_SHA256, 'c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3');

  assert.equal(PROVEN_SAFE_ROLES.length, 18, 'PROVEN_SAFE_ROLES count must be exactly 18');
  assert.equal(UNRESOLVED_ROLES.length, 22, 'UNRESOLVED_ROLES count must be exactly 22');
  assert.equal(NO_SECURED_SOURCE_ROLES.length, 5, 'NO_SECURED_SOURCE_ROLES count must be exactly 5');
  assert.equal(CHIEF_DYNAMIC_AUTHORITY, 'R:X', 'Chief dynamic authority metadata must be R:X');
  assert.equal(SELF_DYNAMIC_AUTHORITY, 'K:Q', 'Self dynamic authority metadata must be K:Q');
});

test('TEMPLATE_PROFILE_PART_A_HEADER_AND_HOSHIN: proves exact Department, Section, Employee Name & Hoshin addresses', () => {
  const profile = new MboXlsxTemplateProfile();

  // Department Z7 & Section AG7
  const dept = profile.resolveSemanticRole('HEADER_DEPARTMENT', { partKey: 'A' });
  assert.equal(dept.address, 'Z7');
  assert.equal(dept.projectionPath, 'partA.header.department');

  const sec = profile.resolveSemanticRole('HEADER_SECTION', { partKey: 'A' });
  assert.equal(sec.address, 'AG7');
  assert.equal(sec.projectionPath, 'partA.header.section');

  const empName = profile.resolveSemanticRole('HEADER_EMPLOYEE_NAME', { partKey: 'A' });
  assert.equal(empName.address, 'AT7');
  assert.equal(empName.projectionPath, 'partA.header.employeeName');

  // employeeNameTH must throw EXPORT_TEMPLATE_PROFILE_UNRESOLVED
  assert.throws(
    () => profile.resolveSemanticRole('HEADER_EMPLOYEE_NAME_TH', { partKey: 'A' }),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );

  // Department Hoshin G16 & Section Hoshin AM16
  const depHoshin = profile.resolveSemanticRole('HOSHIN_DEPARTMENT_HOSHIN_TITLE', { partKey: 'A' });
  assert.equal(depHoshin.address, 'G16');
  assert.equal(depHoshin.projectionPath, 'partA.hoshin.departmentHoshinTitle');

  const secHoshin = profile.resolveSemanticRole('HOSHIN_SECTION_HOSHIN_TITLE', { partKey: 'A' });
  assert.equal(secHoshin.address, 'AM16');
  assert.equal(secHoshin.projectionPath, 'partA.hoshin.sectionHoshinTitle');

  // G8 is NOT a Hoshin write target
  assert.equal(profile.isDynamicWriteTarget('A', 'G8', 4), false, 'G8 must not be a dynamic write target');
});

test('TEMPLATE_PROFILE_OBJECTIVE_SEMANTICS: 5 proven objective roles resolve for N=4..10; all others & COMMENT alias reject', () => {
  const profile = new MboXlsxTemplateProfile();

  for (const n of ACCEPTED_PART_A_OBJECTIVE_COUNTS) {
    for (let i = 1; i <= n; i++) {
      const r = 24 + i;

      // 5 proven safe objective roles
      const meas = profile.resolveSemanticRole(`OBJECTIVE_${i}_MEASUREMENT`, { partKey: 'A', objectiveCount: n });
      assert.equal(meas.address, `T${r}`);
      assert.equal(meas.projectionPath, `partA.objectives[${i-1}].measurement`);

      const wt = profile.resolveSemanticRole(`OBJECTIVE_${i}_WEIGHT`, { partKey: 'A', objectiveCount: n });
      assert.equal(wt.address, `Y${r}`);
      assert.equal(wt.projectionPath, `partA.objectives[${i-1}].weight`);

      const act = profile.resolveSemanticRole(`OBJECTIVE_${i}_ACTUAL_RESULT`, { partKey: 'A', objectiveCount: n });
      assert.equal(act.address, `AK${r}`);
      assert.equal(act.projectionPath, `partA.objectives[${i-1}].actualResult`);

      const comment = profile.resolveSemanticRole(`OBJECTIVE_${i}_SELF_COMMENT`, { partKey: 'A', objectiveCount: n });
      assert.equal(comment.address, `AD${r}`);
      assert.equal(comment.projectionPath, `partA.objectives[${i-1}].selfComment`);

      const avg = profile.resolveSemanticRole(`OBJECTIVE_${i}_AVERAGE_SCORE`, { partKey: 'A', objectiveCount: n });
      assert.equal(avg.address, `BC${r}`);
      assert.equal(avg.projectionPath, `partA.objectives[${i-1}].averageScore`);

      // OBJECTIVE_i_COMMENT alias MUST REJECT (DEFECT A)
      assert.throws(
        () => profile.resolveSemanticRole(`OBJECTIVE_${i}_COMMENT`, { partKey: 'A', objectiveCount: n }),
        /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/,
        `OBJECTIVE_${i}_COMMENT must reject`
      );

      // Unresolved objective roles MUST reject
      for (const unresField of [
        'TITLE', 'DESCRIPTION', 'KPI', 'TARGET', 'PROGRESS_PERCENT',
        'SELF_ACHIEVEMENT', 'MANAGER_ACHIEVEMENT', 'MANAGER_SCORE',
        'MANAGER_COMMENT', 'GM_ACHIEVEMENT', 'GM_SCORE', 'GM_COMMENT', 'DIFFICULTY'
      ]) {
        assert.throws(
          () => profile.resolveSemanticRole(`OBJECTIVE_${i}_${unresField}`, { partKey: 'A', objectiveCount: n }),
          /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/,
          `OBJECTIVE_${i}_${unresField} must reject`
        );
      }
    }
  }
});

test('TEMPLATE_PROFILE_PART_B_COMPETENCY: Self rating resolves for N6/N7/N8; Chief & RATING aliases reject', () => {
  const profile = new MboXlsxTemplateProfile();

  for (const n of ACCEPTED_PART_B_COMPETENCY_COUNTS) {
    const ratingRows = [9, 13, 17, 21, 25, 29];
    if (n >= 7) ratingRows.push(33);
    if (n === 8) ratingRows.push(37);

    for (let b = 1; b <= n; b++) {
      const r = ratingRows[b - 1];

      // Self rating resolves
      const selfRes = profile.resolveSemanticRole(`COMPETENCY_${b}_SELF_RATING`, { partKey: 'B', competencyCount: n });
      assert.equal(selfRes.address, `K${r}`);
      assert.equal(selfRes.projectionPath, `partB.competencyItems[${b-1}].selfRating`);

      // COMPETENCY_b_RATING alias MUST REJECT (DEFECT B)
      assert.throws(
        () => profile.resolveSemanticRole(`COMPETENCY_${b}_RATING`, { partKey: 'B', competencyCount: n }),
        /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/,
        `COMPETENCY_${b}_RATING must reject`
      );

      // Chief rating MUST reject
      assert.throws(
        () => profile.resolveSemanticRole(`COMPETENCY_${b}_CHIEF_RATING`, { partKey: 'B', competencyCount: n }),
        /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
      );
    }
  }
});

test('TEMPLATE_PROFILE_FAIL_CLOSED_FOR_ALL_22_UNRESOLVED_AND_5_NO_SOURCE_ROLES', () => {
  const profile = new MboXlsxTemplateProfile();

  const allForbiddenRoles = [
    'HEADER_EMPLOYEE_NAME_TH', 'HEADER_PROFILE_CODE', 'HEADER_PROFILE_FAMILY',
    'HEADER_PART_A_WEIGHT_PERCENT', 'HEADER_CHIEF_NAME', 'OBJECTIVE_1_TITLE',
    'OBJECTIVE_1_DESCRIPTION', 'OBJECTIVE_1_KPI', 'OBJECTIVE_1_TARGET',
    'OBJECTIVE_1_PROGRESS_PERCENT', 'OBJECTIVE_1_SELF_ACHIEVEMENT',
    'OBJECTIVE_1_MANAGER_ACHIEVEMENT', 'OBJECTIVE_1_MANAGER_SCORE',
    'OBJECTIVE_1_MANAGER_COMMENT', 'OBJECTIVE_1_GM_ACHIEVEMENT',
    'OBJECTIVE_1_GM_SCORE', 'OBJECTIVE_1_GM_COMMENT', 'OBJECTIVE_1_DIFFICULTY',
    'SUMMARY_WEIGHT_SUM', 'SUMMARY_FINAL_SCORE', 'SUMMARY_FINAL_GRADE',
    'COMPETENCY_1_CHIEF_RATING', 'OVERALL_RATING_SUMMARY', 'EMPLOYEE_COMMENTS',
    'CHIEF_FEEDBACK', 'EMPLOYEE_SIGNATURE', 'CHIEF_SIGNATURE'
  ];

  for (const role of allForbiddenRoles) {
    assert.throws(
      () => profile.resolveSemanticRole(role, { partKey: 'A' }),
      /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/,
      `Role ${role} must reject on Part A`
    );
    assert.throws(
      () => profile.resolveSemanticRole(role, { partKey: 'B' }),
      /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/,
      `Role ${role} must reject on Part B`
    );
  }
});

test('TEMPLATE_PROFILE_INVARIANTS_AND_VALIDATOR: zero duplicate targets, zero null paths, protects row 30/34/38', () => {
  const profile = new MboXlsxTemplateProfile();

  // Validator passes default profile
  assert.equal(validateMappingIntegrity(profile), true);
  assert.equal(validateMappingIntegrity(), true);

  // Validate zero duplicate exclusive write targets & zero null paths for all count combinations
  for (const nA of ACCEPTED_PART_A_OBJECTIVE_COUNTS) {
    const mapA = profile.getPartAMappings(nA);
    const writeAddrs = [];
    writeAddrs.push(...Object.values(mapA.header));
    writeAddrs.push(mapA.hoshin.DEPARTMENT_HOSHIN_TITLE, mapA.hoshin.SECTION_HOSHIN_TITLE);
    for (const obj of mapA.objectives) {
      writeAddrs.push(obj.MEASUREMENT, obj.WEIGHT, obj.ACTUAL_RESULT, obj.SELF_COMMENT, obj.AVERAGE_SCORE);
      assert.ok(obj.projectionPaths.measurement, 'Measurement path must be non-null');
      assert.ok(obj.projectionPaths.weight, 'Weight path must be non-null');
      assert.ok(obj.projectionPaths.actualResult, 'ActualResult path must be non-null');
      assert.ok(obj.projectionPaths.selfComment, 'SelfComment path must be non-null');
      assert.ok(obj.projectionPaths.averageScore, 'AverageScore path must be non-null');
    }
    writeAddrs.push(mapA.summary.PART_A_RAW_SCORE, mapA.summary.PART_A_WEIGHTED_SCORE);

    assert.equal(
      new Set(writeAddrs).size,
      writeAddrs.length,
      `Part A N=${nA} must have zero duplicate exclusive targets`
    );
  }

  // Row 30/34/38 non-writable checks
  const cols = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];
  for (const nB of ACCEPTED_PART_B_COMPETENCY_COUNTS) {
    for (const pRow of [30, 34, 38]) {
      if (pRow === 30 || (nB >= 7 && pRow === 34) || (nB === 8 && pRow === 38)) {
        for (const c of cols) {
          assert.equal(
            profile.isDynamicWriteTarget('B', `${c}${pRow}`, nB),
            false,
            `Part B N=${nB} row ${pRow} must be non-writable`
          );
        }
      }
    }
  }
});

test('TEMPLATE_PROFILE_FOCUSED_MUTATION_NEGATIVE_TESTS: validates fail-closed on all profile anomalies', () => {
  const profile = new MboXlsxTemplateProfile();

  // 1. Missing Part A required header mapping
  const b1 = Object.create(profile);
  b1.getPartAMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    delete clone.header.EMPLOYEE_NAME;
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b1), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 2. Duplicate Part A exclusive safe target mutation
  const b2 = Object.create(profile);
  b2.getPartAMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.header.SECTION = clone.header.DEPARTMENT;
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b2), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 3. Null required objective projection path mutation
  const b3 = Object.create(profile);
  b3.getPartAMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.objectives[0].projectionPaths.measurement = null;
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b3), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 4. Malformed Part A safe summary address mutation
  const b4 = Object.create(profile);
  b4.getPartAMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartAMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.summary.PART_A_RAW_SCORE = 'INVALID_ADDR_999';
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b4), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 5. Broken Part B safe header mutation
  const b5 = Object.create(profile);
  b5.getPartBMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartBMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.header.DEPARTMENT = 'INVALID_CELL_$$';
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b5), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 6. Broken Part B safe summary mutation
  const b6 = Object.create(profile);
  b6.getPartBMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartBMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    delete clone.summary.PART_B_RAW_SCORE;
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b6), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 7. Missing Part B competency mapping / invalid address
  const b7 = Object.create(profile);
  b7.getPartBMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartBMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.competencies[0].SELF_RATING = '';
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b7), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 8. Null Part B competency projection path
  const b8 = Object.create(profile);
  b8.getPartBMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartBMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.competencies[0].projectionPath = null;
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b8), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 9. Duplicate Part B exclusive safe target mutation
  const b9 = Object.create(profile);
  b9.getPartBMappings = function(c) {
    const m = MboXlsxTemplateProfile.prototype.getPartBMappings.call(this, c);
    const clone = JSON.parse(JSON.stringify(m));
    clone.competencies[1].SELF_RATING = clone.competencies[0].SELF_RATING;
    return clone;
  };
  assert.throws(() => validateMappingIntegrity(b9), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);

  // 10. Protected row 30 exposure
  const b10 = Object.create(profile);
  b10.isDynamicWriteTarget = function(partKey, cellAddress, count) {
    if (cellAddress === 'K30') return true;
    return MboXlsxTemplateProfile.prototype.isDynamicWriteTarget.call(this, partKey, cellAddress, count);
  };
  assert.throws(() => validateMappingIntegrity(b10), /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/);
});

test('TEMPLATE_PROFILE_CALLER_IMMUTABILITY: resolution options & returned mappings remain immutable', () => {
  const profile = new MboXlsxTemplateProfile();
  const callerOptions = Object.freeze({ partKey: 'A', objectiveCount: 5 });

  const roleRes = profile.resolveSemanticRole('HEADER_EMPLOYEE_NAME', callerOptions);
  assert.equal(roleRes.address, 'AT7');
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
