/**
 * Appraiser Data Normalization Module
 * Pure logic module for parsing, validating, and normalizing physical appraiser ratings
 * and comments into a structured logical slot representation.
 */

import { parseObjectiveCount, getApplicableCompetencies } from '../ui/employee-part-a-ui.js';

export function normalizeAppraiserData(record, appraiserCount = 2, previewOptions = {}) {
  const count = Math.min(Math.max(parseInt(appraiserCount || 2, 10), 1), 4);
  const slots = [];

  const getVal = (code) => {
    if (!record) return '';
    const field = record[code];
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) return field.value ?? '';
    return String(field);
  };

  const activeObjCount = parseObjectiveCount(getVal('Objective_Count'));
  if (activeObjCount === null) {
    return {
      slots: [],
      totalCount: count,
      completedCount: 0,
      completionPercent: 0,
      isFullyComplete: false,
      isInvalidConfig: true,
      partA: { completed: 0, total: 0, isComplete: false },
      partB: { completed: 0, total: 0, isComplete: false }
    };
  }

  const compSetCode = getVal('Competency_Set_Code') || previewOptions.competencySetCode;
  const applicableCompList = getApplicableCompetencies(compSetCode);

  if (!applicableCompList) {
    return {
      slots: [],
      totalCount: count,
      completedCount: 0,
      completionPercent: 0,
      isFullyComplete: false,
      isInvalidConfig: true,
      partA: { completed: 0, total: 0, isComplete: false },
      partB: { completed: 0, total: 0, isComplete: false }
    };
  }

  const slotLabels = ['1st Appraiser', '2nd Appraiser', '3rd Appraiser', '4th Appraiser'];

  let totalRequiredPartARatings = count * activeObjCount;
  let completedRequiredPartARatings = 0;

  let totalRequiredPartBRatings = count * applicableCompList.length;
  let completedRequiredPartBRatings = 0;

  for (let i = 1; i <= count; i++) {
    const label = slotLabels[i - 1];
    const partARatings = {};
    const partBRatings = {};
    const partAComments = {};
    const partBComments = {};

    let slotPartARatedCount = 0;
    let slotPartBRatedCount = 0;

    if (i === 1) {
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = getVal(`Manager_Comment_${k}`) || previewOptions.slot1CommentsA?.[k] || '';
        const val = getVal(`Manager_Achievement_${k}`) || previewOptions.slot1RatingsA?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = getVal(`Manager_Competency_Comment_${comp.id}`) || previewOptions.slot1CommentsB?.[comp.id] || '';
        const val = getVal(`Manager_Competency_Rating_${comp.id}`) || previewOptions.slot1RatingsB?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    } else if (i === 2) {
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = getVal(`GM_Comment_${k}`) || previewOptions.slot2CommentsA?.[k] || '';
        const val = getVal(`GM_Achievement_${k}`) || previewOptions.slot2RatingsA?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = getVal(`GM_Competency_Comment_${comp.id}`) || previewOptions.slot2CommentsB?.[comp.id] || '';
        const val = getVal(`GM_Competency_Rating_${comp.id}`) || previewOptions.slot2RatingsB?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    } else {
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = previewOptions[`slot${i}CommentsA`]?.[k] || '';
        const val = previewOptions[`slot${i}RatingsA`]?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = previewOptions[`slot${i}CommentsB`]?.[comp.id] || '';
        const val = previewOptions[`slot${i}RatingsB`]?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    }

    completedRequiredPartARatings += slotPartARatedCount;
    completedRequiredPartBRatings += slotPartBRatedCount;

    const isPartAComplete = (slotPartARatedCount === activeObjCount);
    const isPartBComplete = (slotPartBRatedCount === applicableCompList.length);
    const isSlotCompleted = isPartAComplete && isPartBComplete;

    slots.push({
      slotIndex: i,
      label,
      isCompleted: isSlotCompleted,
      isPartAComplete,
      isPartBComplete,
      partARatings,
      partBRatings,
      partAComments,
      partBComments
    });
  }

  const completedCount = slots.filter(s => s.isCompleted).length;
  const completionPercent = Math.round((completedCount / count) * 100);
  const isFullyComplete = (completedCount === count);

  return {
    slots,
    totalCount: count,
    completedCount,
    completionPercent,
    isFullyComplete,
    isInvalidConfig: false,
    partA: {
      completed: completedRequiredPartARatings,
      total: totalRequiredPartARatings,
      isComplete: completedRequiredPartARatings === totalRequiredPartARatings
    },
    partB: {
      completed: completedRequiredPartBRatings,
      total: totalRequiredPartBRatings,
      isComplete: completedRequiredPartBRatings === totalRequiredPartBRatings
    }
  };
}
