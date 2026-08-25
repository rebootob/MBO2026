/**
 * Employee Service - Read-only lookup from App 53 (Employee Namelist)
 */

import { isValidEmployeeCode } from '../core/fiscal-year-engine.js';

const SNAPSHOT_FIELDS = [
  'Employee_Code', 'Employee_Name', 'Employee_Name_TH', 'Employee_Department',
  'Employee_Section', 'Team', 'Employee_Position', 'Employee_Email', 'Employee_Start_Date'
];
const verifiedSnapshotFingerprints = new WeakMap();

function getSnapshotFingerprint(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null;
  return JSON.stringify(SNAPSHOT_FIELDS.map(field => snapshot[field] ?? null));
}

/**
 * Returns true only for an unmodified snapshot object created by a successful
 * EmployeeService.lookupEmployee call. This is provenance evidence, not an
 * authentication or authorization boundary.
 */
export function isVerifiedEmployeeSnapshot(snapshot) {
  const registeredFingerprint = verifiedSnapshotFingerprints.get(snapshot);
  return typeof registeredFingerprint === 'string' &&
    registeredFingerprint === getSnapshotFingerprint(snapshot);
}

export class EmployeeLookupError extends Error {
  constructor(code, userMessageTH, userMessageEN, cause = null) {
    super(userMessageTH);
    this.name = 'EmployeeLookupError';
    this.code = code;
    this.userMessageTH = userMessageTH;
    this.userMessageEN = userMessageEN;
    this.cause = cause;
  }
}

export class EmployeeService {
  /**
   * Lookup employee by Employee Code in App 53 (Read-Only)
   * Canonical Business Employee Code is sourced strictly from App53.emp_text.
   * @param {string} empCode - Input employee code string
   * @param {Object} kintoneApi - Kintone API client instance
   * @returns {Promise<{ status: string, employee: Object }>}
   */
  static async lookupEmployee(empCode, kintoneApi) {
    // 1. Strict Input Validation before API call
    if (empCode === null || empCode === undefined) {
      throw new EmployeeLookupError(
        'EMPLOYEE_CODE_INVALID',
        'กรุณาระบุรหัสพนักงาน\nPlease enter Employee Code',
        'Please enter Employee Code'
      );
    }

    if (typeof empCode !== 'string') {
      throw new EmployeeLookupError(
        'EMPLOYEE_CODE_INVALID',
        `รหัสพนักงานต้องเป็นข้อความ (String) เท่านั้น\nEmployee Code must be a string (received ${typeof empCode})`,
        `Employee Code must be a string (received ${typeof empCode})`
      );
    }

    const cleanCode = empCode.trim();
    if (cleanCode.length === 0 || !isValidEmployeeCode(cleanCode)) {
      throw new EmployeeLookupError(
        'EMPLOYEE_CODE_INVALID',
        `รูปแบบรหัสพนักงานไม่ถูกต้อง (${empCode})\nInvalid Employee Code format (${empCode})`,
        `Invalid Employee Code format (${empCode})`
      );
    }

    // 2. Query Construction (Injection-safe dual representation for query only)
    const isDigitOnly = /^\d+$/.test(cleanCode);
    let query;
    if (isDigitOnly) {
      const numericRep = parseInt(cleanCode, 10);
      query = `(emp_text = "${cleanCode}" or Number = ${numericRep}) limit 2`;
    } else {
      query = `emp_text = "${cleanCode}" limit 2`;
    }

    // 3. Query Execution with safe error wrapping
    let resp;
    try {
      resp = await kintoneApi.getRecords(53, query);
    } catch (err) {
      throw new EmployeeLookupError(
        'SOURCE_ACCESS_ERROR',
        'ไม่สามารถตรวจสอบข้อมูลพนักงานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator\nUnable to verify employee information at this time. Please try again or contact HR / Administrator.',
        'Unable to verify employee information at this time. Please try again or contact HR / Administrator.',
        err
      );
    }

    // 4. Source Response Structure Validation (DEF-009)
    if (!resp || typeof resp !== 'object' || !Array.isArray(resp.records)) {
      throw new EmployeeLookupError(
        'SOURCE_RESPONSE_INVALID',
        'โครงสร้างข้อมูลตอบกลับจากระบบ Employee Master ไม่ถูกต้อง กรุณาติดต่อ HR / Administrator\nInvalid response structure received from Employee Master. Please contact HR / Administrator.',
        'Invalid response structure received from Employee Master. Please contact HR / Administrator.'
      );
    }

    const records = resp.records;

    // 5. Exactly-One Match Rule
    if (records.length === 0) {
      throw new EmployeeLookupError(
        'EMPLOYEE_NOT_FOUND',
        `ไม่พบข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master\nEmployee code ${cleanCode} was not found in Employee Master (App 53)`,
        `Employee code ${cleanCode} was not found in Employee Master (App 53)`
      );
    }

    if (records.length > 1) {
      throw new EmployeeLookupError(
        'EMPLOYEE_SOURCE_AMBIGUOUS',
        `พบรหัสพนักงาน ${cleanCode} ซ้ำซ้อนในระบบ Employee Master กรุณาติดต่อ HR / Administrator\nDuplicate employee records found for code ${cleanCode}. Please contact HR / Administrator.`,
        `Duplicate employee records found for code ${cleanCode}. Please contact HR / Administrator.`
      );
    }

    const emp = records[0];

    // 6. Source Complete Validation: Canonical code must exist in emp_text
    const rawEmpText = emp.emp_text?.value;
    if (!rawEmpText || typeof rawEmpText !== 'string' || !isValidEmployeeCode(rawEmpText.trim())) {
      throw new EmployeeLookupError(
        'EMPLOYEE_SOURCE_INCOMPLETE',
        `ข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master ไม่สมบูรณ์ (ขาดรหัส Canonical emp_text) กรุณาติดต่อ HR\nEmployee Master record for code ${cleanCode} is incomplete (missing or invalid emp_text). Please contact HR.`,
        `Employee Master record for code ${cleanCode} is incomplete (missing or invalid emp_text). Please contact HR.`
      );
    }

    const canonicalCode = rawEmpText.trim();

    // 7. Identity Consistency Validation (DEF-008)
    let isConsistent = false;
    if (canonicalCode === cleanCode) {
      isConsistent = true;
    } else if (isDigitOnly && /^\d+$/.test(canonicalCode)) {
      isConsistent = parseInt(canonicalCode, 10) === parseInt(cleanCode, 10);
    }

    if (!isConsistent) {
      throw new EmployeeLookupError(
        'EMPLOYEE_SOURCE_MISMATCH',
        `ข้อมูลรหัสพนักงานในระบบ Employee Master ไม่ตรงกับรหัสที่ร้องขอ (${cleanCode}) กรุณาติดต่อ HR\nEmployee Master canonical identity does not match requested code (${cleanCode}). Please contact HR.`,
        `Employee Master canonical identity does not match requested code (${cleanCode}). Please contact HR.`
      );
    }

    // 8. Return and register the 9 header snapshot fields (Hoshin excluded).
    const employee = {
      Employee_Code: canonicalCode,
      Employee_Name: emp.Text?.value || '',
      Employee_Name_TH: emp.Text_0?.value || '',
      Employee_Department: emp.Drop_down_0?.value || '',
      Employee_Section: emp.Drop_down?.value || '',
      Team: emp.Drop_down_2?.value || emp.Team?.value || '',
      Employee_Position: emp.Text_2?.value || '',
      Employee_Email: emp.Text_4?.value || '',
      Employee_Start_Date: emp.Date?.value || ''
    };
    verifiedSnapshotFingerprints.set(employee, getSnapshotFingerprint(employee));
    return { status: 'EMPLOYEE_FOUND', employee };
  }

  /**
   * Check for duplicate MBO in App 794 for Fiscal Year + Employee Code
   */
  static async checkDuplicateMBO(mboAppId, fiscalYear, empCode, currentRecordId, kintoneApi) {
    const cleanCode = String(empCode || '').trim();
    const cleanFY = String(fiscalYear || '').trim();
    if (!cleanCode || !cleanFY) return;

    let query = `Fiscal_Year = "${cleanFY}" and Employee_Code = "${cleanCode}"`;
    if (currentRecordId) {
      query += ` and $id != "${currentRecordId}"`;
    }

    let resp;
    try {
      resp = await kintoneApi.getRecords(mboAppId, query);
    } catch (err) {
      throw new Error(`ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator\nUnable to verify record uniqueness. Please try again or contact HR / Administrator.`);
    }

    if (!resp || typeof resp !== 'object' || !Array.isArray(resp.records)) {
      throw new Error(`ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator\nUnable to verify record uniqueness. Please try again or contact HR / Administrator.`);
    }

    if (resp.records.length > 0) {
      throw new Error(`พนักงานรหัส ${cleanCode} มี MBO สำหรับ ${cleanFY} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้\nEmployee ID ${cleanCode} already has an MBO record for ${cleanFY}. Duplicate creation is blocked.`);
    }
  }
}
