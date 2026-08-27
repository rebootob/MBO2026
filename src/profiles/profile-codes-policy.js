/**
 * Browser-Safe Profile Codes & Position Policy Foundation (D7 UI Preview Fix)
 * Contains pure data maps and functions without Node-only crypto/fs dependencies.
 */

export const PROFILE_CODES = {
  STAFF_CHIEF: 'PROF_STAFF_CHIEF',
  JAPANESE_STAFF: 'PROF_JAPANESE_STAFF',
  ASST_MGR: 'PROF_ASST_MGR',
  SECTION_MGR: 'PROF_SECTION_MGR',
  SENIOR_MGR: 'PROF_SENIOR_MGR',
  DGM: 'PROF_DGM',
  GM: 'PROF_GM',
  VP: 'PROF_VP'
};

const POSITION_TO_PROFILE = new Map([
  ['staff', PROFILE_CODES.STAFF_CHIEF],
  ['senior staff', PROFILE_CODES.STAFF_CHIEF],
  ['chief', PROFILE_CODES.STAFF_CHIEF],
  ['marketing chief', PROFILE_CODES.STAFF_CHIEF],
  ['support marketing staff', PROFILE_CODES.STAFF_CHIEF],
  ['support marketing chief', PROFILE_CODES.STAFF_CHIEF],
  ['supoort marketing staff', PROFILE_CODES.STAFF_CHIEF],
  ['supoort marketing chief', PROFILE_CODES.STAFF_CHIEF],
  ['technical service engineer', PROFILE_CODES.STAFF_CHIEF],
  ['technical service chief', PROFILE_CODES.STAFF_CHIEF],
  ['accounting staff', PROFILE_CODES.STAFF_CHIEF],
  ['chief of engineer', PROFILE_CODES.STAFF_CHIEF],
  ['marketing engineer', PROFILE_CODES.STAFF_CHIEF],
  ['engineering staff', PROFILE_CODES.STAFF_CHIEF],
  ['it staff', PROFILE_CODES.STAFF_CHIEF],
  ['technical chief', PROFILE_CODES.STAFF_CHIEF],
  ['technician', PROFILE_CODES.STAFF_CHIEF],
  ['safety officer', PROFILE_CODES.STAFF_CHIEF],
  ['service engineer', PROFILE_CODES.STAFF_CHIEF],
  ['chief of safety officer', PROFILE_CODES.STAFF_CHIEF],
  ['technical staff', PROFILE_CODES.STAFF_CHIEF],
  ['accounting chief', PROFILE_CODES.STAFF_CHIEF],
  ['design engineer', PROFILE_CODES.STAFF_CHIEF],
  ['marketing staff', PROFILE_CODES.STAFF_CHIEF],
  ['operator', PROFILE_CODES.STAFF_CHIEF],
  ['assistant chief', PROFILE_CODES.STAFF_CHIEF],
  ['coordinator', PROFILE_CODES.STAFF_CHIEF],
  ['messenger', PROFILE_CODES.STAFF_CHIEF],
  ['senior chief', PROFILE_CODES.STAFF_CHIEF],
  ['trainee', PROFILE_CODES.STAFF_CHIEF],
  ['cam staff', PROFILE_CODES.STAFF_CHIEF],
  ['specialist', PROFILE_CODES.STAFF_CHIEF],
  ['executive management coordinator', PROFILE_CODES.STAFF_CHIEF],
  ['safety', PROFILE_CODES.STAFF_CHIEF],
  ['senior specilaist', PROFILE_CODES.STAFF_CHIEF],
  ['warehouse support', PROFILE_CODES.STAFF_CHIEF],
  ['driver', PROFILE_CODES.STAFF_CHIEF],
  ['contract (apite)', PROFILE_CODES.STAFF_CHIEF],
  ['interpreter', PROFILE_CODES.STAFF_CHIEF],
  ['warehouse staff', PROFILE_CODES.STAFF_CHIEF],
  ['safety officer& iso control', PROFILE_CODES.STAFF_CHIEF],
  ['clerk', PROFILE_CODES.STAFF_CHIEF],
  ['japanese staff', PROFILE_CODES.JAPANESE_STAFF],
  ['expatriate', PROFILE_CODES.JAPANESE_STAFF],
  ['expatriate japanese staff', PROFILE_CODES.JAPANESE_STAFF],
  ['advisor', PROFILE_CODES.JAPANESE_STAFF],
  ['contract (japan support)', PROFILE_CODES.JAPANESE_STAFF],
  ['assistant manager', PROFILE_CODES.ASST_MGR],
  ['assistant section manager', PROFILE_CODES.ASST_MGR],
  ['asst. section manager', PROFILE_CODES.ASST_MGR],
  ['design engineer assistant manager', PROFILE_CODES.ASST_MGR],
  ['section manager', PROFILE_CODES.SECTION_MGR],
  ['manager', PROFILE_CODES.SECTION_MGR],
  ['co project manager', PROFILE_CODES.SECTION_MGR],
  ['factory manager', PROFILE_CODES.GM],
  ['senior manager', PROFILE_CODES.SENIOR_MGR],
  ['deputy general manager', PROFILE_CODES.DGM],
  ['general manager', PROFILE_CODES.GM],
  ['vice president', PROFILE_CODES.VP],
  ['president', PROFILE_CODES.VP]
]);

const AMBIGUOUS_TITLES = new Set([]);

export class ProfilePolicyError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'ProfilePolicyError';
    this.code = code;
  }
}

export function normalizeTitle(rawTitle) {
  if (typeof rawTitle !== 'string' || rawTitle.trim() === '') {
    throw new ProfilePolicyError('PROFILE_SOURCE_INVALID');
  }
  return rawTitle.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function getProfileCodeFromPosition(position) {
  if (typeof position !== 'string' || position.trim() === '') {
    throw new ProfilePolicyError('PROFILE_SOURCE_INVALID');
  }
  const normalizedTitle = normalizeTitle(position);
  if (AMBIGUOUS_TITLES.has(normalizedTitle)) {
    throw new ProfilePolicyError('PROFILE_RESOLUTION_AMBIGUOUS');
  }
  const profileCode = POSITION_TO_PROFILE.get(normalizedTitle);
  if (!profileCode) {
    throw new ProfilePolicyError('PROFILE_SOURCE_INVALID');
  }
  return profileCode;
}
