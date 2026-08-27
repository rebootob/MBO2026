/**
 * Shared Kintone Record Normalizer & Field Reader
 * Normalizes both plain JS objects and raw Kintone { value: ... } field structures.
 */

export function unwrapField(valueOrField) {
  if (valueOrField === null || valueOrField === undefined) return '';
  if (typeof valueOrField === 'object' && 'value' in valueOrField) {
    return valueOrField.value;
  }
  return valueOrField;
}

export function readString(record, fieldCode) {
  if (!record || typeof record !== 'object') return '';
  const raw = record[fieldCode];
  const unwrapped = unwrapField(raw);
  if (unwrapped === null || unwrapped === undefined) return '';
  return String(unwrapped).trim();
}

export function readNumber(record, fieldCode, defaultValue = 0) {
  if (!record || typeof record !== 'object') return defaultValue;
  const raw = record[fieldCode];
  const unwrapped = unwrapField(raw);
  if (unwrapped === null || unwrapped === undefined || unwrapped === '') return defaultValue;
  const num = Number(unwrapped);
  return isNaN(num) ? defaultValue : num;
}

export function readUserCodes(record, fieldCode) {
  if (!record || typeof record !== 'object') return [];
  const raw = record[fieldCode];
  const val = unwrapField(raw);
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(u => (typeof u === 'object' ? u.code || u.value || '' : String(u))).filter(Boolean);
  }
  if (typeof val === 'object' && val.code) return [val.code];
  if (typeof val === 'string' && val.trim() !== '') return [val.trim()];
  return [];
}

export function readFileList(record, fieldCode) {
  if (!record || typeof record !== 'object') return [];
  const raw = record[fieldCode];
  const val = unwrapField(raw);
  if (!Array.isArray(val)) return [];
  return val.map(fileObj => ({
    fileKey: fileObj.fileKey || '',
    name: fileObj.name || '',
    contentType: fileObj.contentType || '',
    size: Number(fileObj.size || 0)
  }));
}

/**
 * Projects App 794 flattened objective fields (slots 1..10) into normalized objective objects.
 * Honors Objective_Count if specified, otherwise infers from populated slots.
 * Does NOT create phantom blank objective rows!
 */
export function projectApp794Objectives(record) {
  if (!record || typeof record !== 'object') return [];

  // Check if record has nested Objectives array
  const nested = record.Objectives || record.objectives;
  const unwrappedNested = unwrapField(nested);
  if (Array.isArray(unwrappedNested)) {
    return unwrappedNested.map((obj, idx) => ({
      slotIndex: idx + 1,
      title: readString(obj, 'Objective_Title') || readString(obj, 'Title') || readString(obj, 'title'),
      description: readString(obj, 'Objective_Description') || readString(obj, 'Description') || readString(obj, 'description'),
      kpi: readString(obj, 'KPI') || readString(obj, 'kpi'),
      target: readString(obj, 'Target') || readString(obj, 'target'),
      measurement: readString(obj, 'Measurement') || readString(obj, 'measurement'),
      weight: readNumber(obj, 'Weight', 0),
      progressPercent: readNumber(obj, 'Progress_Percent', 0),
      actualResult: readString(obj, 'Actual_Result'),
      selfAchievement: readString(obj, 'Self_Achievement'),
      selfComment: readString(obj, 'Self_Comment'),
      managerAchievement: readString(obj, 'Manager_Achievement'),
      managerScore: readNumber(obj, 'Manager_Objective_Score', 0),
      managerComment: readString(obj, 'Manager_Comment'),
      gmAchievement: readString(obj, 'GM_Achievement'),
      gmScore: readNumber(obj, 'GM_Objective_Score', 0),
      gmComment: readString(obj, 'GM_Comment'),
      averageScore: readNumber(obj, 'Average_Objective_Score', 0),
      midYearFiles: readFileList(obj, 'MidYear_Attachment'),
      finalFiles: readFileList(obj, 'Final_Attachment')
    })).filter(o => o.title !== '' || o.weight > 0);
  }

  // Flattened slots 1..10
  const countField = readNumber(record, 'Objective_Count', 0);
  const objectives = [];

  for (let i = 1; i <= 10; i++) {
    const title = readString(record, `Objective_${i}`);
    const weight = readNumber(record, `Weight_${i}`, 0);

    // If Objective_Count is specified and i > Objective_Count, stop
    if (countField > 0 && i > countField) break;

    // Skip unpopulated slot if Objective_Count not explicitly set
    if (countField === 0 && title === '' && weight === 0) continue;

    objectives.push({
      slotIndex: i,
      title,
      description: readString(record, `Objective_${i}_Description`) || title,
      kpi: readString(record, `KPI_${i}`),
      target: readString(record, `Target_${i}`),
      measurement: readString(record, `Measurement_${i}`),
      weight,
      progressPercent: readNumber(record, `Progress_Percent_${i}`, 0),
      actualResult: readString(record, `Actual_Result_${i}`),
      selfAchievement: readString(record, `Self_Achievement_${i}`),
      selfComment: readString(record, `Self_Comment_${i}`),
      managerAchievement: readString(record, `Manager_Achievement_${i}`),
      managerScore: readNumber(record, `Manager_Objective_Score_${i}`, 0),
      managerComment: readString(record, `Manager_Comment_${i}`),
      gmAchievement: readString(record, `GM_Achievement_${i}`),
      gmScore: readNumber(record, `GM_Objective_Score_${i}`, 0),
      gmComment: readString(record, `GM_Comment_${i}`),
      averageScore: readNumber(record, `Average_Objective_Score_${i}`, 0),
      midYearFiles: readFileList(record, `MidYear_Attachment_${i}`),
      finalFiles: readFileList(record, `Final_Attachment_${i}`)
    });
  }

  return objectives;
}
