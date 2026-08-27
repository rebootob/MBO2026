/**
 * Annual Record Service - App 794 Record Initialization & Duplicate Prevention
 */

import { getJapaneseFiscalYear, generateRecordKey } from '../core/fiscal-year-engine.js';
import { EmployeeService } from './employee-service.js';
import { readString, readNumber, projectApp794Objectives } from '../core/kintone-normalizer.js';

export class AnnualRecordError extends Error {
  constructor(code, userMessageTH, userMessageEN, cause = null) {
    super(userMessageTH);
    this.name = 'AnnualRecordError';
    this.code = code;
    this.userMessageTH = userMessageTH;
    this.userMessageEN = userMessageEN;
    this.cause = cause;
  }
}

export const EXPLICIT_WRITE_FIELDS = [
  'Fiscal_Year',
  'Record_Key',
  'Employee_Code',
  'Employee_Name',
  'Employee_Name_TH',
  'Employee_Department',
  'Employee_Section',
  'Employee_Position',
  'Employee_Email',
  'Employee_Start_Date'
];

export const SYSTEM_FIELDS_ALLOWLIST = [
  '$id',
  '$revision',
  'Created_datetime',
  'Updated_datetime',
  'Created_by',
  'Updated_by',
  'Record_number'
];

/**
 * Deterministic Value Normalizer & Deep Comparator (DEF-014)
 */
export function areNormalizedValuesEqual(valA, valB) {
  if (valA === valB) return true;
  if (valA === undefined || valA === null || valB === undefined || valB === null) {
    return valA === valB;
  }

  // Handle Arrays (e.g. USER_SELECT: [], [{ code: "userA" }])
  if (Array.isArray(valA) && Array.isArray(valB)) {
    if (valA.length !== valB.length) return false;
    for (let i = 0; i < valA.length; i++) {
      if (!areNormalizedValuesEqual(valA[i], valB[i])) return false;
    }
    return true;
  }

  if (Array.isArray(valA) || Array.isArray(valB)) return false;

  // Handle Objects (e.g. { code: "userA" })
  if (typeof valA === 'object' && typeof valB === 'object') {
    const keysA = Object.keys(valA).sort();
    const keysB = Object.keys(valB).sort();
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      const k = keysA[i];
      if (k !== keysB[i]) return false;
      if (!areNormalizedValuesEqual(valA[k], valB[k])) return false;
    }
    return true;
  }

  // Handle String / Number normalization
  return String(valA).trim() === String(valB).trim();
}

export class AnnualRecordService {
  /**
   * Perform Live Schema Preflight against App 794
   * @param {number} appId
   * @param {Object} kintoneApi
   * @returns {Promise<{ isPreflightOk: boolean, blockedReason: string|null, metadata: Object }>}
   */
  static async performLiveSchemaPreflight(appId, kintoneApi) {
    let schemaResp;
    try {
      schemaResp = await kintoneApi.getFormFields(appId);
    } catch (err) {
      throw new AnnualRecordError(
        'SCHEMA_PREFLIGHT_ERROR',
        'ไม่สามารถตรวจสอบโครงสร้างฐานข้อมูล App 794 ได้ในขณะนี้',
        'Unable to retrieve App 794 form field schema.',
        err
      );
    }

    const properties = schemaResp?.properties || {};

    // 1. Verify Record_Key unique constraint
    if (!properties.Record_Key || properties.Record_Key.unique !== true) {
      return {
        isPreflightOk: false,
        blockedReason: 'RECORD_KEY_UNIQUE_CONSTRAINT_MISSING',
        metadata: properties
      };
    }

    // 2. Check for unresolved required fields (e.g. Requester_User, Manager_User, GM_User)
    for (const [code, prop] of Object.entries(properties)) {
      if (prop.required === true) {
        const isExplicitField = EXPLICIT_WRITE_FIELDS.includes(code);
        const hasServerDefault = prop.defaultValue !== undefined && prop.defaultValue !== '' && !(Array.isArray(prop.defaultValue) && prop.defaultValue.length === 0);
        if (!isExplicitField && !hasServerDefault) {
          return {
            isPreflightOk: false,
            blockedReason: `REQUIRED_FIELD_UNRESOLVED: ${code}`,
            blockingField: code,
            metadata: properties
          };
        }
      }
    }

    return {
      isPreflightOk: true,
      blockedReason: null,
      metadata: properties
    };
  }

  /**
   * Check Layer 1 duplicate in App 794 for Fiscal Year + Employee Code
   * @param {number} mboAppId
   * @param {string} fiscalYear
   * @param {string} empCode
   * @param {Object} kintoneApi
   */
  static async checkDuplicateMBO(mboAppId, fiscalYear, empCode, kintoneApi) {
    const query = `Fiscal_Year = "${fiscalYear}" and Employee_Code = "${empCode}" limit 2`;
    let resp;
    try {
      resp = await kintoneApi.getRecords(mboAppId, query);
    } catch (err) {
      throw new AnnualRecordError(
        'DUPLICATE_CHECK_ACCESS_ERROR',
        'ไม่สามารถตรวจสอบข้อมูล MBO ซ้ำซ้อนได้ในขณะนี้',
        'Unable to check duplicate MBO records.',
        err
      );
    }

    // Response structure validation (DEF-013: Fail-closed on malformed duplicate check response)
    if (!resp || typeof resp !== 'object' || !Array.isArray(resp.records)) {
      throw new AnnualRecordError(
        'DUPLICATE_CHECK_RESPONSE_INVALID',
        'โครงสร้างข้อมูลตอบกลับจากการตรวจสอบ MBO ซ้ำซ้อนไม่ถูกต้อง',
        'Invalid response structure received from duplicate check query.',
        resp
      );
    }

    if (resp.records.length > 0) {
      throw new AnnualRecordError(
        'DUPLICATE_MBO_EXISTS',
        `พนักงานรหัส ${empCode} มี MBO สำหรับปีงบประมาณ ${fiscalYear} อยู่แล้วในระบบ ไม่สามารถสร้างซ้ำได้\nEmployee ${empCode} already has an MBO record for ${fiscalYear}. Duplicate creation is blocked.`,
        `Employee ${empCode} already has an MBO record for ${fiscalYear}. Duplicate creation is blocked.`
      );
    }
  }

  /**
   * Build candidate initialization payload for App 794
   */
  static buildInitializationPayload(fiscalYear, employeeProfile) {
    const recordKey = generateRecordKey(fiscalYear, employeeProfile.Employee_Code);

    return {
      Fiscal_Year: { value: fiscalYear },
      Record_Key: { value: recordKey },
      Employee_Code: { value: employeeProfile.Employee_Code },
      Employee_Name: { value: employeeProfile.Employee_Name || '' },
      Employee_Name_TH: { value: employeeProfile.Employee_Name_TH || '' },
      Employee_Department: { value: employeeProfile.Employee_Department || '' },
      Employee_Section: { value: employeeProfile.Employee_Section || '' },
      Employee_Position: { value: employeeProfile.Employee_Position || '' },
      Employee_Email: { value: employeeProfile.Employee_Email || '' },
      Employee_Start_Date: { value: employeeProfile.Employee_Start_Date || '' }
    };
  }

  /**
   * Translate Layer 2 Kintone Create Errors (DEF-012)
   * Converts Kintone unique constraint violations into structured DUPLICATE_MBO_EXISTS errors.
   */
  static translateCreateError(err, fiscalYear, empCode) {
    if (err?.code === 'CB_VA01' || (err?.message && /unique constraint|Record_Key/i.test(err.message))) {
      return new AnnualRecordError(
        'DUPLICATE_MBO_EXISTS',
        `พบข้อมูล Record Key ซ้ำซ้อนในระบบสำหรับพนักงาน ${empCode} ปีงบประมาณ ${fiscalYear} ไม่สามารถสร้างรายการซ้ำได้`,
        `Duplicate Record_Key collision detected for employee ${empCode} in ${fiscalYear}. Duplicate creation blocked.`,
        err
      );
    }

    return new AnnualRecordError(
      'KINTONE_CREATE_FAILED',
      `ไม่สามารถสร้างรายการ MBO ได้: ${err?.message || 'Unknown error'}`,
      `Failed to create MBO record: ${err?.message || 'Unknown error'}`,
      err
    );
  }

  /**
   * Pure Pre-Write Orchestration Pipeline (DEF-015)
   * Executes entire validation, lookup, preflight, duplicate check, and payload building without issuing any POST calls.
   */
  static async prepareInitializationCandidate({
    executionDate,
    employeeCode,
    mboAppId,
    employeeApi,
    mboApi
  }) {
    if (!executionDate || typeof executionDate !== 'string') {
      throw new AnnualRecordError(
        'INVALID_EXECUTION_DATE',
        'กรุณาระบุวันที่ดำเนินการที่ถูกต้อง',
        'Please provide a valid execution date string.'
      );
    }

    // 1. Dynamic Fiscal Year Calculation
    const fiscalYear = getJapaneseFiscalYear(executionDate);

    // 2. Employee Lookup via EmployeeService
    const lookupResult = await EmployeeService.lookupEmployee(employeeCode, employeeApi);
    const employee = lookupResult.employee;

    // 3. Live Schema Preflight
    const preflight = await this.performLiveSchemaPreflight(mboAppId, mboApi);
    if (!preflight.isPreflightOk) {
      throw new AnnualRecordError(
        'LIVE_CREATE_BLOCKED',
        `การสร้าง Record ถูกระงับชั่วคราวเนื่องจาก Schema ไม่พร้อม: ${preflight.blockedReason}`,
        `Record creation is blocked due to schema preflight: ${preflight.blockedReason}`,
        preflight.blockedReason
      );
    }

    // 4. Layer 1 Duplicate Check
    await this.checkDuplicateMBO(mboAppId, fiscalYear, employee.Employee_Code, mboApi);

    // 5. Generate Record Key & Payload
    const recordKey = generateRecordKey(fiscalYear, employee.Employee_Code);
    const payload = this.buildInitializationPayload(fiscalYear, employee);

    return {
      status: 'ANNUAL_RECORD_READY',
      fiscalYear,
      recordKey,
      employee,
      payload,
      schemaMetadata: preflight.metadata
    };
  }

  /**
   * Normalize and verify read-back record against expected payload and schema rules (DEF-014)
   */
  static verifyNormalizedReadBack(writtenRecord, postPayload, schemaProperties = {}) {
    if (!writtenRecord || typeof writtenRecord !== 'object') {
      throw new AnnualRecordError(
        'READBACK_RECORD_INVALID',
        'โครงสร้างข้อมูลที่อ่านกลับไม่ถูกต้อง',
        'Invalid read-back record object received.'
      );
    }

    // Tier A: Explicit Written Fields
    for (const fieldCode of EXPLICIT_WRITE_FIELDS) {
      const expectedVal = postPayload[fieldCode]?.value ?? '';
      const actualVal = writtenRecord[fieldCode]?.value ?? '';
      if (actualVal !== expectedVal) {
        throw new AnnualRecordError(
          'READBACK_VERIFICATION_MISMATCH',
          `ข้อมูลที่อ่านกลับในฟิลด์ ${fieldCode} ไม่ตรงกับข้อมูลที่บันทึก`,
          `Read-back field mismatch on ${fieldCode}. Expected: ${expectedVal}, received: ${actualVal}`
        );
      }
    }

    // Tier B: Approved Kintone Server Defaults (Deep Equality & Field Presence)
    for (const [code, prop] of Object.entries(schemaProperties)) {
      if (EXPLICIT_WRITE_FIELDS.includes(code) || SYSTEM_FIELDS_ALLOWLIST.includes(code)) {
        continue;
      }
      if (prop?.defaultValue !== undefined && prop?.type !== 'CALC') {
        const fieldObj = writtenRecord[code];
        if (fieldObj === undefined) {
          throw new AnnualRecordError(
            'READBACK_DEFAULT_MISMATCH',
            `ฟิลด์ที่มีค่าเริ่มต้นตาม Schema (${code}) ขาดหายไปในข้อมูลที่อ่านกลับ`,
            `Field with default value ${code} is missing from read-back record.`
          );
        }

        const actualVal = fieldObj.value;
        const expectedDefault = prop.defaultValue;

        if (!areNormalizedValuesEqual(actualVal, expectedDefault)) {
          throw new AnnualRecordError(
            'READBACK_DEFAULT_MISMATCH',
            `ค่าเริ่มต้นของฟิลด์ ${code} ไม่ตรงตาม Schema`,
            `Default value mismatch on field ${code}. Expected: ${JSON.stringify(expectedDefault)}, received: ${JSON.stringify(actualVal)}`
          );
        }
      }
    }

    // Tier D: Calculated Fields (CALC) Contract Verification
    for (const [code, prop] of Object.entries(schemaProperties)) {
      if (prop?.type === 'CALC') {
        // 1. Assert CALC fields are NOT present in client POST payload
        if (postPayload && postPayload[code] !== undefined) {
          throw new AnnualRecordError(
            'CALC_FIELD_WRITE_PROHIBITED',
            `ไม่อนุญาตให้เขียนข้อมูลลงฟิลด์คำนวณ (${code})`,
            `Direct client write prohibited for calculated field: ${code}`
          );
        }

        // 2. Assert CALC field IS present in read-back record
        if (writtenRecord[code] === undefined) {
          throw new AnnualRecordError(
            'CALC_READBACK_MISSING',
            `ฟิลด์คำนวณ (${code}) ขาดหายไปในข้อมูลที่อ่านกลับ`,
            `Calculated field ${code} is missing from read-back record.`
          );
        }

        // 3. Assert CALC field has a valid server-managed structure
        if (typeof writtenRecord[code] !== 'object' || writtenRecord[code] === null || !('value' in writtenRecord[code])) {
          throw new AnnualRecordError(
            'CALC_READBACK_INVALID',
            `โครงสร้างข้อมูลของฟิลด์คำนวณ (${code}) ไม่ถูกต้อง`,
            `Invalid calculated field format on ${code}.`
          );
        }
      }
    }

    // Tier E: Unexpected Business Fields must not be populated
    for (const [code, fieldObj] of Object.entries(writtenRecord)) {
      if (EXPLICIT_WRITE_FIELDS.includes(code) || SYSTEM_FIELDS_ALLOWLIST.includes(code)) {
        continue;
      }
      const prop = schemaProperties[code];
      if (prop?.type === 'CALC') continue; // Tier D calculations handled by server
      if (prop?.defaultValue !== undefined) continue; // Tier B server defaults

      // If an unmapped business field has non-empty/unexpected content
      if (fieldObj?.value !== '' && fieldObj?.value !== null && fieldObj?.value !== undefined && !(Array.isArray(fieldObj?.value) && fieldObj?.value.length === 0)) {
        throw new AnnualRecordError(
          'UNEXPECTED_BUSINESS_FIELD_POPULATED',
          `พบฟิลด์ธุรกิจนอกขอบเขตมีข้อมูล (${code})`,
          `Unexpected business field populated: ${code}`
        );
      }
    }

    return true;
  }

  /**
   * Gate 5: Copy Previous MBO Candidate Generator
   * Copies ONLY physical planning fields from prior-year record into real App794 flattened field shape.
   * Requires injected current-year dependencies (new FY routing, scoring, Hoshin snapshot, duplicate preflight).
   */
  static generateCopyPreviousCandidate({
    priorYearRecord,
    newFiscalYear,
    authenticatedUser,
    userRole = 'EMPLOYEE',
    authoritativeRoleContext = null,
    newRoutingSnapshot = null,
    newScoringConfig = null,
    newHoshinSnapshot = null,
    duplicatePreflightResult = null
  }) {
    if (!priorYearRecord || typeof priorYearRecord !== 'object') {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_INVALID_SOURCE',
        'ไม่พบข้อมูล MBO ปีก่อนหน้าที่จะคัดลอก',
        'Prior year MBO record is required for copy previous operation.'
      );
    }

    // 1. Dependency Validation (Fail Closed)
    if (!newRoutingSnapshot || typeof newRoutingSnapshot !== 'object') {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_MISSING_DEPENDENCY',
        'ขาดข้อมูล Routing สำหรับปีงบประมาณใหม่',
        'Missing new fiscal year routing snapshot.'
      );
    }
    if (!newScoringConfig || typeof newScoringConfig !== 'object') {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_MISSING_DEPENDENCY',
        'ขาดข้อมูล Scoring Configuration สำหรับปีงบประมาณใหม่',
        'Missing new fiscal year scoring configuration.'
      );
    }
    if (!newHoshinSnapshot || typeof newHoshinSnapshot !== 'object') {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_MISSING_DEPENDENCY',
        'ขาดข้อมูล Hoshin Snapshot สำหรับปีงบประมาณใหม่',
        'Missing new fiscal year Hoshin snapshot.'
      );
    }
    if (!duplicatePreflightResult || typeof duplicatePreflightResult !== 'object' || duplicatePreflightResult.checked !== true) {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_MISSING_DEPENDENCY',
        'ยังไม่ได้ดำเนินการตรวจสอบการสร้าง MBO ซ้ำซ้อน',
        'Duplicate check preflight must be executed before candidate generation.'
      );
    }
    if (duplicatePreflightResult.exists === true) {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_DUPLICATE_EXISTS',
        'มีข้อมูล MBO สำหรับปีงบประมาณใหม่ในระบบแล้ว ไม่สามารถคัดลอกซ้ำได้',
        'An MBO record already exists for the new fiscal year. Copy operation blocked.'
      );
    }

    const priorEmpCode = readString(priorYearRecord, 'Employee_Code');
    if (!priorEmpCode) {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_SOURCE_MISSING_EMPLOYEE',
        'ข้อมูล MBO ปีก่อนหน้าขาดรหัสพนักงาน',
        'Prior year MBO record is missing Employee_Code.'
      );
    }

    // Security check: Employee may copy only own MBO; HR path requires authoritative role context
    if (userRole === 'EMPLOYEE') {
      if (!authenticatedUser || authenticatedUser.employeeCode !== priorEmpCode) {
        throw new AnnualRecordError(
          'COPY_PREVIOUS_UNAUTHORIZED',
          'พนักงานสามารถคัดลอกได้เฉพาะ MBO ของตนเองเท่านั้น',
          'Employees can only copy their own previous MBO records.'
        );
      }
    } else if (userRole === 'HR') {
      const isVerified = authoritativeRoleContext && (
        typeof authoritativeRoleContext.hasVerifiedRole === 'function'
          ? authoritativeRoleContext.hasVerifiedRole('HR', priorEmpCode)
          : authoritativeRoleContext.isAuthorizedHR === true
      );
      if (!isVerified) {
        throw new AnnualRecordError(
          'COPY_PREVIOUS_UNAUTHORIZED_HR',
          'การคัดลอก MBO โดย HR ต้องได้รับการยืนยันสิทธิ์ HR ที่ถูกต้อง',
          'HR copy operation requires authoritative HR role verification.'
        );
      }
    } else {
      throw new AnnualRecordError(
        'COPY_PREVIOUS_UNAUTHORIZED_ROLE',
        'บทบาทของคุณไม่มีสิทธิ์คัดลอก MBO',
        `Role ${userRole} is not authorized to perform copy previous MBO.`
      );
    }

    const cleanNewFY = String(newFiscalYear).trim();
    const newRecordKey = generateRecordKey(cleanNewFY, priorEmpCode);

    // Project raw/flattened prior year objectives
    const rawObjectives = projectApp794Objectives(priorYearRecord);
    const copiedCount = Math.min(Math.max(rawObjectives.length, 1), 10);

    // Build real App794 write-ready flattened candidate object
    const candidateRecord = {
      Fiscal_Year: { value: cleanNewFY },
      Record_Key: { value: newRecordKey },
      Employee_Code: { value: priorEmpCode },
      Employee_Name: { value: readString(priorYearRecord, 'Employee_Name') },
      Employee_Name_TH: { value: readString(priorYearRecord, 'Employee_Name_TH') },
      Employee_Department: { value: readString(priorYearRecord, 'Employee_Department') },
      Employee_Section: { value: readString(priorYearRecord, 'Employee_Section') },
      Employee_Position: { value: readString(priorYearRecord, 'Employee_Position') },
      Workflow_Status: { value: 'DRAFT' },
      Objective_Count: { value: String(copiedCount) },

      // Hoshin Snapshot from new FY
      Hoshin_Fiscal_Year: { value: newHoshinSnapshot.Hoshin_Fiscal_Year || cleanNewFY },
      Department_Hoshin_ID: { value: newHoshinSnapshot.Department_Hoshin_ID || '' },
      Department_Hoshin_Title: { value: newHoshinSnapshot.Department_Hoshin_Title || '' },
      Department_Hoshin_Snapshot: { value: newHoshinSnapshot.Department_Hoshin_Snapshot || '' },
      Section_Hoshin_ID: { value: newHoshinSnapshot.Section_Hoshin_ID || '' },
      Section_Hoshin_Title: { value: newHoshinSnapshot.Section_Hoshin_Title || '' },
      Section_Hoshin_Snapshot: { value: newHoshinSnapshot.Section_Hoshin_Snapshot || '' },
      Hoshin_Snapshot_At: { value: newHoshinSnapshot.Hoshin_Snapshot_At || '' }
    };

    // Populate flattened physical objective fields 1..10
    for (let i = 1; i <= 10; i++) {
      const srcObj = rawObjectives[i - 1];
      if (i <= copiedCount && srcObj) {
        candidateRecord[`Objective_${i}`] = { value: srcObj.title || readString(priorYearRecord, `Objective_${i}`) };
        candidateRecord[`Action_Plan_${i}`] = { value: srcObj.description || readString(priorYearRecord, `Action_Plan_${i}`) };
        candidateRecord[`Additional_Agreement_${i}`] = { value: readString(priorYearRecord, `Additional_Agreement_${i}`) };
        candidateRecord[`Weight_${i}`] = { value: String(srcObj.weight || readNumber(priorYearRecord, `Weight_${i}`, 0)) };
        candidateRecord[`Difficulty_${i}`] = { value: readString(priorYearRecord, `Difficulty_${i}`) };
      } else {
        candidateRecord[`Objective_${i}`] = { value: '' };
        candidateRecord[`Action_Plan_${i}`] = { value: '' };
        candidateRecord[`Additional_Agreement_${i}`] = { value: '' };
        candidateRecord[`Weight_${i}`] = { value: '0' };
        candidateRecord[`Difficulty_${i}`] = { value: '' };
      }
    }

    return {
      status: 'COPY_PREVIOUS_CANDIDATE_READY',
      newFiscalYear: cleanNewFY,
      newRecordKey,
      employeeCode: priorEmpCode,
      copiedObjectivesCount: copiedCount,
      newRoutingSnapshot,
      newScoringConfig,
      newHoshinSnapshot,
      duplicatePreflightResult,
      planningCandidate: candidateRecord
    };
  }
}
