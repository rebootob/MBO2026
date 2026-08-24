/**
 * Japanese Fiscal Year & Record Key Engine (MBO V2 Pure Foundation)
 *
 * Rules:
 * 1. Japanese Fiscal Year runs from 1 April to 31 March.
 *    - Example: 2027-04-01 to 2028-03-31 is FY2027.
 *    - Example: 2027-03-31 is FY2026.
 * 2. Employee Code is strictly treated as String, preserving leading zeros (e.g. "0149").
 * 3. Record Key is strictly formatted as "{Fiscal_Year}-{Employee_Code}" (e.g. "FY2027-0149").
 */

/**
 * Calculate the Japanese Fiscal Year from a given date.
 * @param {Date|string} dateInput - Date object or ISO date string (YYYY-MM-DD)
 * @returns {string} Fiscal Year string in format "FYXXXX" (e.g. "FY2027")
 */
export function getJapaneseFiscalYear(dateInput = new Date()) {
  let year, month;

  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match && !dateInput.includes('T')) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
    } else {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date input for fiscal year calculation: ${dateInput}`);
      }
      if (dateInput.includes('Z')) {
        year = d.getUTCFullYear();
        month = d.getUTCMonth() + 1;
      } else {
        year = d.getFullYear();
        month = d.getMonth() + 1;
      }
    }
  } else if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      throw new Error(`Invalid date input for fiscal year calculation: ${dateInput}`);
    }
    year = dateInput.getFullYear();
    month = dateInput.getMonth() + 1;
  } else {
    throw new Error(`Invalid date input for fiscal year calculation: ${dateInput}`);
  }

  // Japanese FY: April (Month 4) to March (Month 3 of next calendar year)
  const fiscalYearNumber = month >= 4 ? year : year - 1;
  return `FY${fiscalYearNumber}`;
}

/**
 * Normalize and validate an Employee Code string, strictly preserving leading zeros.
 * @param {string|number} code - Raw employee code input
 * @returns {string} Preserved string representation (e.g. "0149")
 */
export function normalizeEmployeeCode(code) {
  if (code === null || code === undefined) {
    throw new Error('Employee Code cannot be null or undefined.');
  }

  const strCode = String(code).trim();
  if (strCode.length === 0) {
    throw new Error('Employee Code cannot be empty.');
  }

  return strCode;
}

/**
 * Generate standard MBO Record Key from Fiscal Year and Employee Code.
 * @param {string} fiscalYear - Fiscal Year string (e.g. "FY2027")
 * @param {string|number} employeeCode - Employee Code (e.g. "0149")
 * @returns {string} Standard Record Key (e.g. "FY2027-0149")
 */
export function generateRecordKey(fiscalYear, employeeCode) {
  if (!fiscalYear || typeof fiscalYear !== 'string' || !fiscalYear.trim()) {
    throw new Error('Fiscal Year is required for Record Key generation.');
  }

  const cleanFy = fiscalYear.trim().toUpperCase();
  const cleanEmpCode = normalizeEmployeeCode(employeeCode);

  return `${cleanFy}-${cleanEmpCode}`;
}

/**
 * Validate that a given Record Key conforms to standard MBO V2 format.
 * @param {string} recordKey - Record Key string to validate
 * @returns {boolean} True if format matches /^FY\d{4}-[A-Za-z0-9_-]+$/
 */
export function isValidRecordKeyFormat(recordKey) {
  if (!recordKey || typeof recordKey !== 'string') {
    return false;
  }
  return /^FY\d{4}-[A-Za-z0-9_-]+$/.test(recordKey.trim());
}
