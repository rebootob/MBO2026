/**
 * Japanese Fiscal Year & Record Key Engine (MBO V2 Pure Foundation)
 *
 * Rules:
 * 1. Japanese Fiscal Year runs from 1 April to 31 March.
 *    - Example: 2027-04-01 to 2028-03-31 is FY2027.
 *    - Example: 2027-03-31 is FY2026.
 * 2. Employee Code is strictly required to be a String, preserving leading zeros (e.g. "0149").
 *    Numeric input (e.g. 149) is rejected to prevent silent corruption of canonical codes.
 * 3. Fiscal Year must match /^FY\d{4}$/i.
 * 4. Record Key is strictly formatted as "{Fiscal_Year}-{Employee_Code}" (e.g. "FY2027-0149").
 * 5. Strict date validation rejects invalid calendar dates (e.g. 2027-13-01, 2027-02-31, 2027-04-01abc).
 */

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year, month) {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

/**
 * Parse and strictly validate a date input (string or Date object).
 * Rejects invalid calendar dates, invalid months/days, and trailing garbage.
 * @param {Date|string} dateInput - Date object or ISO date string (YYYY-MM-DD)
 * @returns {{ year: number, month: number, day: number }}
 */
function parseAndValidateDate(dateInput) {
  if (dateInput === null || dateInput === undefined) {
    throw new Error('Date input cannot be null or undefined.');
  }

  let year, month, day;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // Check for exact YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss(Z|offset)
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/);
    if (!dateMatch) {
      throw new Error(`Invalid date format (must be YYYY-MM-DD or ISO-8601): "${dateInput}"`);
    }

    year = parseInt(dateMatch[1], 10);
    month = parseInt(dateMatch[2], 10);
    day = parseInt(dateMatch[3], 10);

    // If ISO string with UTC 'Z' timezone, evaluate in UTC
    if (dateMatch[7] === 'Z') {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date input: "${dateInput}"`);
      }
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    }
  } else if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      throw new Error('Invalid Date object instance.');
    }
    year = dateInput.getFullYear();
    month = dateInput.getMonth() + 1;
    day = dateInput.getDate();
  } else {
    throw new Error(`Unsupported date input type: ${typeof dateInput}`);
  }

  // Validate Year range
  if (year < 1900 || year > 2100) {
    throw new Error(`Year ${year} is out of supported range (1900-2100).`);
  }

  // Validate Month range (1 to 12)
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month} in date "${dateInput}". Month must be between 01 and 12.`);
  }

  // Validate Day range for specific month/year
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    throw new Error(`Invalid day: ${day} for month ${month}/${year} in date "${dateInput}". Maximum valid day is ${maxDays}.`);
  }

  return { year, month, day };
}

/**
 * Calculate the Japanese Fiscal Year from a strictly validated date.
 * @param {Date|string} dateInput - Date object or ISO date string (YYYY-MM-DD)
 * @returns {string} Fiscal Year string in format "FYXXXX" (e.g. "FY2027")
 */
export function getJapaneseFiscalYear(dateInput = new Date()) {
  const { year, month } = parseAndValidateDate(dateInput);

  // Japanese FY: April (Month 4) to March (Month 3 of next calendar year)
  const fiscalYearNumber = month >= 4 ? year : year - 1;
  return `FY${fiscalYearNumber}`;
}

/**
 * Normalize and strictly validate an Employee Code.
 * Enforces String type to guarantee canonical leading zeros are never destroyed.
 * Rejects numeric inputs (e.g. 149) and non-string types.
 * @param {string} code - Raw employee code input (must be string)
 * @returns {string} Canonical preserved string representation (e.g. "0149")
 */
export function normalizeEmployeeCode(code) {
  if (code === null || code === undefined) {
    throw new Error('Employee Code cannot be null or undefined.');
  }

  if (typeof code !== 'string') {
    throw new Error(`Employee Code must be a string (received ${typeof code}). Numeric codes like ${code} are rejected to protect canonical leading zeros.`);
  }

  const strCode = code.trim();
  if (strCode.length === 0) {
    throw new Error('Employee Code cannot be empty.');
  }

  return strCode;
}

/**
 * Generate standard MBO Record Key from Fiscal Year and Employee Code.
 * Validates that Fiscal Year matches /^FY\d{4}$/i and Employee Code is a valid canonical string.
 * @param {string} fiscalYear - Fiscal Year string (e.g. "FY2027")
 * @param {string} employeeCode - Canonical string Employee Code (e.g. "0149")
 * @returns {string} Standard Record Key (e.g. "FY2027-0149")
 */
export function generateRecordKey(fiscalYear, employeeCode) {
  if (!fiscalYear || typeof fiscalYear !== 'string') {
    throw new Error('Fiscal Year is required and must be a string.');
  }

  const cleanFy = fiscalYear.trim().toUpperCase();
  if (!/^FY\d{4}$/.test(cleanFy)) {
    throw new Error(`Invalid Fiscal Year format: "${fiscalYear}". Expected format is FYYYYY (e.g. FY2027).`);
  }

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
