/**
 * Japanese Fiscal Year & Record Key Engine (MBO V2 Pure Foundation)
 *
 * Rules:
 * 1. Japanese Fiscal Year runs from 1 April to 31 March.
 *    - Example: 2027-04-01 to 2028-03-31 is FY2027.
 *    - Example: 2027-03-31 is FY2026.
 * 2. Employee Code is strictly required to be a String matching /^[A-Za-z0-9_-]+$/, preserving leading zeros (e.g. "0149").
 *    Numeric input (e.g. 149), spaces (e.g. "01 49"), slashes, and symbols are rejected to prevent silent corruption.
 * 3. Fiscal Year must match /^FY\d{4}$/i.
 * 4. Record Key is strictly formatted as "{Fiscal_Year}-{Employee_Code}" (e.g. "FY2027-0149") and must satisfy /^FY\d{4}-[A-Za-z0-9_-]+$/.
 * 5. Strict date/time validation rejects invalid calendar dates and invalid timestamp hours/minutes/seconds.
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
 * Rejects invalid calendar dates, invalid months/days, invalid hours/minutes/seconds, and trailing garbage.
 * @param {Date|string} dateInput - Date object or ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...)
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
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|([+-])(\d{2}):(\d{2}))?)?$/);
    if (!dateMatch) {
      throw new Error(`Invalid date format (must be YYYY-MM-DD or ISO-8601): "${dateInput}"`);
    }

    year = parseInt(dateMatch[1], 10);
    month = parseInt(dateMatch[2], 10);
    day = parseInt(dateMatch[3], 10);

    // If time components exist, strictly validate hour, minute, second, and timezone offset
    if (dateMatch[4] !== undefined) {
      const hour = parseInt(dateMatch[4], 10);
      const minute = parseInt(dateMatch[5], 10);
      const second = parseInt(dateMatch[6], 10);

      if (hour < 0 || hour > 23) {
        throw new Error(`Invalid hour: ${hour} in date "${dateInput}". Hour must be between 00 and 23.`);
      }
      if (minute < 0 || minute > 59) {
        throw new Error(`Invalid minute: ${minute} in date "${dateInput}". Minute must be between 00 and 59.`);
      }
      if (second < 0 || second > 59) {
        throw new Error(`Invalid second: ${second} in date "${dateInput}". Second must be between 00 and 59.`);
      }

      // If timezone offset exists, validate offset bounds
      if (dateMatch[8] !== undefined) {
        const offsetHour = parseInt(dateMatch[9], 10);
        const offsetMinute = parseInt(dateMatch[10], 10);
        if (offsetHour < 0 || offsetHour > 14) {
          throw new Error(`Invalid timezone offset hour: ${offsetHour} in date "${dateInput}".`);
        }
        if (offsetMinute < 0 || offsetMinute > 59) {
          throw new Error(`Invalid timezone offset minute: ${offsetMinute} in date "${dateInput}".`);
        }
      }
    }

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
 * Validate that a string qualifies as a canonical Employee Code.
 * Must match /^[A-Za-z0-9_-]+$/.
 * @param {any} code - Value to test
 * @returns {boolean} True if code is non-empty string matching /^[A-Za-z0-9_-]+$/
 */
export function isValidEmployeeCode(code) {
  if (typeof code !== 'string') {
    return false;
  }
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(trimmed);
}

/**
 * Normalize and strictly validate an Employee Code.
 * Enforces String type and format /^[A-Za-z0-9_-]+$/ to guarantee canonical leading zeros are never destroyed.
 * Rejects numeric inputs (e.g. 149), spaces (e.g. "01 49"), slashes, and non-string types.
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

  if (!/^[A-Za-z0-9_-]+$/.test(strCode)) {
    throw new Error(`Invalid Employee Code format: "${code}". Employee Code must contain only alphanumeric characters, underscores, and hyphens (no spaces or slashes).`);
  }

  return strCode;
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

/**
 * Generate standard MBO Record Key from Fiscal Year and Employee Code.
 * Validates that Fiscal Year matches /^FY\d{4}$/i and Employee Code satisfies canonical contract.
 * Guarantees that the returned Record Key satisfies isValidRecordKeyFormat() === true.
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
  const generatedKey = `${cleanFy}-${cleanEmpCode}`;

  if (!isValidRecordKeyFormat(generatedKey)) {
    throw new Error(`Generated Record Key "${generatedKey}" violates canonical Record Key format.`);
  }

  return generatedKey;
}
