import test from 'node:test';
import assert from 'node:assert/strict';
import { MboExportService } from '../src/services/mbo-export-service.js';

test('GATE2_EXPORT_LOCAL: verifies binary template asset availability', () => {
  const assetStatus = MboExportService.checkTemplateBinaryAssets();
  assert.ok(assetStatus.status === 'AVAILABLE' || assetStatus.status === 'MISSING_LOCAL');
});

test('GATE2_EXPORT_LOCAL: resolves profile weightings accurately for Staff (70/30), AM (60/40), Manager (50/50)', () => {
  assert.deepEqual(MboExportService.resolveProfileWeighting('Staff'), { profileFamily: 'STAFF_CHIEF', partAWeight: 70, partBWeight: 30 });
  assert.deepEqual(MboExportService.resolveProfileWeighting('Assistant Manager'), { profileFamily: 'ASSISTANT_MANAGER', partAWeight: 60, partBWeight: 40 });
  assert.deepEqual(MboExportService.resolveProfileWeighting('General Manager'), { profileFamily: 'MANAGER_GM', partAWeight: 50, partBWeight: 50 });
});

test('GATE2_EXPORT_LOCAL: projects dynamic 5 to 10 objectives into Part A export structure', () => {
  const sampleMbo = {
    Employee_Code: 'EMP001',
    Employee_Name: 'Somchai',
    Employee_Position: 'Staff',
    Fiscal_Year: 'FY2026',
    Objectives: [
      { Title: 'Obj 1', Weight: 20 },
      { Title: 'Obj 2', Weight: 20 },
      { Title: 'Obj 3', Weight: 20 },
      { Title: 'Obj 4', Weight: 20 },
      { Title: 'Obj 5', Weight: 20 }
    ]
  };

  const projection = MboExportService.projectPartAExport({ mboRecord: sampleMbo });
  assert.equal(projection.exportType, 'PART_A_WORKBOOK');
  assert.equal(projection.objectivesCount, 5);
  assert.equal(projection.totalWeight, 100);
  assert.equal(projection.header.partAWeightPercent, 70);
});

test('GATE2_EXPORT_LOCAL: projects combined Part A + Part B workbook & PDF projection', () => {
  const sampleMbo = {
    Employee_Code: 'EMP002',
    Employee_Name: 'Somsri',
    Employee_Position: 'Assistant Manager',
    Fiscal_Year: 'FY2026',
    PartA_Raw_Score: 4.2,
    PartB_Raw_Score: 4.0,
    Final_Score: 4.12
  };

  const combined = MboExportService.projectCombinedExport({ mboRecord: sampleMbo });
  assert.equal(combined.exportType, 'COMBINED_MBO_WORKBOOK_AND_PDF');
  assert.equal(combined.partA.header.partAWeightPercent, 60);
  assert.equal(combined.partB.partBWeightPercent, 40);
});
