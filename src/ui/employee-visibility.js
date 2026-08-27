/**
 * Employee Viewer Identity & Visibility Resolution Module
 * Pure logic module for extracting login identity codes, resolving viewer roles,
 * and enforcing role-based privacy visibility rules.
 */

export function extractUserCodes(fieldVal) {
  if (!fieldVal) return [];

  const processVal = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return item.trim().toLowerCase();
    if (typeof item === 'object') {
      if (typeof item.code === 'string') return item.code.trim().toLowerCase();
      if (typeof item.value === 'string') return item.value.trim().toLowerCase();
    }
    return null;
  };

  let rawList = [];
  if (Array.isArray(fieldVal)) {
    rawList = fieldVal;
  } else if (typeof fieldVal === 'object') {
    if (Array.isArray(fieldVal.value)) {
      rawList = fieldVal.value;
    } else {
      rawList = [fieldVal];
    }
  } else {
    rawList = [fieldVal];
  }

  const codes = [];
  for (const entry of rawList) {
    const code = processVal(entry);
    if (code && !codes.includes(code)) {
      codes.push(code);
    }
  }

  return codes;
}

export function resolveIdentityViewerRole(record, loginUserCode, options = {}) {
  const isPreviewMode = Boolean(options.isPreviewMode || options.previewOptions?.isPreviewMode);
  const rawRole = options.previewOptions?.viewerRole || options.viewerRole;

  if (isPreviewMode && rawRole && ['employee', 'appraiser', 'hr'].includes(String(rawRole).toLowerCase())) {
    return String(rawRole).toUpperCase();
  }

  if (!loginUserCode || typeof loginUserCode !== 'string' || !loginUserCode.trim()) {
    return 'RESTRICTED';
  }

  const cleanLoginCode = loginUserCode.trim().toLowerCase();
  if (!record) {
    return 'RESTRICTED';
  }

  const requesterCodes = extractUserCodes(record.Requester_User);
  const isRequester = requesterCodes.includes(cleanLoginCode);

  const appraiserCodes = [
    ...extractUserCodes(record.First_Manager_User),
    ...extractUserCodes(record.Manager_User),
    ...extractUserCodes(record.GM_User),
    ...extractUserCodes(record.Manager_Level1_Approvers),
    ...extractUserCodes(record.Manager_Level2_Approvers),
    ...extractUserCodes(record.GM_Level1_Approvers),
    ...extractUserCodes(record.GM_Level2_Approvers)
  ];
  const isAppraiser = appraiserCodes.includes(cleanLoginCode);

  const hrCodes = [
    ...extractUserCodes(record.HR_User),
    ...extractUserCodes(options.hrUserList)
  ];
  const isHR = hrCodes.includes(cleanLoginCode);

  const matchedRoles = [];
  if (isRequester) matchedRoles.push('EMPLOYEE');
  if (isAppraiser) matchedRoles.push('APPRAISER');
  if (isHR) matchedRoles.push('HR');

  if (matchedRoles.length === 1) {
    return matchedRoles[0];
  }

  return 'RESTRICTED';
}
