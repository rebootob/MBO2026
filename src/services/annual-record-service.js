/**
 * Annual Record Service - App 794 Record Initialization & Duplicate Prevention
 */

import { getJapaneseFiscalYear, generateRecordKey, isValidRecordKeyFormat } from '../core/fiscal-year-engine.js';
import { EmployeeService } from './employee-service.js';
import { assertSandboxWriteTarget } from '../core/sandbox-write-guard.js';

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

    if (resp?.records?.length > 0) {
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
   * Normalize and verify read-back record against expected payload and schema rules
   */
  static verifyNormalizedReadBack(writtenRecord, postPayload, schemaProperties = {}) {
    // Tier A: Explicit Written Fields
    for (const fieldCode of EXPLICIT_WRITE_FIELDS) {
      const expectedVal = postPayload[fieldCode]?.value ?? '';
      const actualVal = writtenRecord[fieldCode]?.value ?? '';
      if (actualVal !== expectedVal) {
        throw new AnnualRecordError(
          'READBACK_VERIFICATION_MISMATCH',
          `ข้อมูลที่อ่านกลับในฟิลด์ ${fieldCode} ไม่ตรงกับข้อมูลที่บันทึก (คาดหวัง: ${expectedVal}, ได้รับ: ${actualVal})`,
          `Read-back field mismatch on ${fieldCode}. Expected: ${expectedVal}, received: ${actualVal}`
        );
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
}
