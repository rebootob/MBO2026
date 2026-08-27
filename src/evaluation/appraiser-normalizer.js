/**
 * Appraiser Data Normalization Module
 * Pure logic module for parsing, validating, and normalizing physical appraiser ratings
 * and comments into a structured logical slot representation.
 */

export function parseObjectiveCount(rawVal, fallback = null) {
  if (rawVal === null || rawVal === undefined || rawVal === '') return fallback;
  const str = String(rawVal).trim();
  if (!/^\d+$/.test(str)) return fallback;
  const countVal = parseInt(str, 10);
  if (countVal < 1 || countVal > 10) return fallback;
  return countVal;
}

// Normalized Verified Business Competency Definitions (R2-05 Fail-Closed Selection)
export const COMPETENCIES_LIST = [
  { id: 1, nameTH: '1. Adaptability', nameEN: 'Adaptability', desc: 'ปรับตัวอย่างยืดหยุ่น ยอมรับการเปลี่ยนแปลงและเรียนรู้สิ่งใหม่ / Demonstrate flexibility and open-mindedness to organizational changes.' },
  { id: 2, nameTH: '2. Problem Solving', nameEN: 'Problem Solving & Decision Making', desc: 'การแก้ปัญหาและการตัดสินใจอย่างมีหลักการ / Analyze root causes and make effective decisions.' },
  { id: 3, nameTH: '3. Customer Focus', nameEN: 'Customer Focus & Service Excellence', desc: 'การมุ่งเน้นลูกค้าและผู้รับบริการ ส่งมอบบริการที่มีคุณภาพ / Prioritize internal/external customer needs and quality delivery.' },
  { id: 4, nameTH: '4. Additional Value Creation', nameEN: 'Value Creation & Innovation', desc: 'การสร้างมูลค่าเพิ่มและนวัตกรรมใหม่ในงาน / Proactively seek improvements and innovative solutions.' },
  { id: 5, nameTH: '5. Safety Awareness', nameEN: 'Safety & Environmental Awareness', desc: 'ความตระหนักด้านความปลอดภัยและสิ่งแวดล้อม / Adhere to safety standards and environmental responsibility.' },
  { id: 6, nameTH: '6. Compliance / COCE', nameEN: 'Compliance & Code of Conduct (COCE)', desc: 'การปฏิบัติตามกฎระเบียบและจริยธรรมธุรกิจ [Evaluated / Excluded from Score] / Evaluated for compliance but excluded from numerical score weight.', isCOCE: true },
  { id: 7, nameTH: '7. Leadership & People Management', nameEN: 'Leadership & People Management', desc: 'ภาวะผู้นำและการบริหารคน สร้างแรงจูงใจในการทำงาน / Lead, empower, and guide team members effectively.', isManagementOnly: true },
  { id: 8, nameTH: '8. Strategy & Coaching', nameEN: 'Strategy & Coaching / Advising', desc: 'การกำหนดกลยุทธ์และการเป็นพี่เลี้ยงในการพัฒนาทีมงาน / Align with strategic goals and mentor staff.', isManagementOnly: true }
];

export function getApplicableCompetencies(setCode) {
  const code = String(setCode || '').trim();
  if (code === 'COMP_SET_OPERATIONAL_V1') {
    return COMPETENCIES_LIST.filter(c => !c.isManagementOnly); // 6 items
  }
  if (code === 'COMP_SET_MANAGEMENT_V1') {
    return COMPETENCIES_LIST; // 8 items
  }
  return null; // Fail closed for invalid/blank competency set code
}

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
