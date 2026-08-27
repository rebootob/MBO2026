import test from 'node:test';
import assert from 'node:assert/strict';
import { MboExportService } from '../src/services/mbo-export-service.js';

test('EXPORT_PROFILE_FAIL_CLOSED: resolves exact weighting per Profile_Code and fails closed on unmapped profile', () => {
  assert.equal(MboExportService.resolveProfileWeighting('PROF_STAFF_CHIEF').partAWeight, 70);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_ASST_MGR').partAWeight, 60);
  assert.equal(MboExportService.resolveProfileWeighting('PROF_SECTION_MGR').partAWeight, 50);

  assert.throws(
    () => MboExportService.resolveProfileWeighting('UNKNOWN_PROFILE'),
    /EXPORT_PROFILE_UNRESOLVED/
  );
});

test('EXPORT_4_AND_10_OBJECTIVES: exports exact 4 objectives when 4 are populated (not 5/10)', () => {
  const mboRec = {
    Employee_Code: { value: 'EMP001' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Objective_Count: { value: '4' },
    Objective_1: { value: 'Obj 1' }, Weight_1: { value: '25' },
    Objective_2: { value: 'Obj 2' }, Weight_2: { value: '25' },
    Objective_3: { value: 'Obj 3' }, Weight_3: { value: '25' },
    Objective_4: { value: 'Obj 4' }, Weight_4: { value: '25' }
  };

  const projection = MboExportService.projectPartAExport({ mboRecord: mboRec });
  assert.equal(projection.objectivesCount, 4);
  assert.equal(projection.objectives.length, 4);
  assert.equal(projection.totalWeight, 100);
});
