/**
 * Employee Service - Read-only lookup from App 53 (Employee Namelist)
 */

export class EmployeeService {
  /**
   * Lookup employee by Employee Code in App 53 (Read-Only)
   * Supports leading zero code input e.g. "0149" -> queries Number in App 53
   * @param {string} empCode
   * @param {Object} kintoneApi
   * @returns {Object} snapshot profile
   */
  static async lookupEmployee(empCode, kintoneApi) {
    const cleanCode = String(empCode || '').trim();
    if (!cleanCode) {
      throw new Error('กรุณาระบุรหัสพนักงาน\nPlease enter Employee Code');
    }

    const numVal = parseInt(cleanCode, 10);
    const query = !isNaN(numVal)
      ? `(Number = "${numVal}" or Number = "${cleanCode}") limit 2`
      : `Number = "${cleanCode}" limit 2`;

    const resp = await kintoneApi.getRecords(53, query);
    const records = resp?.records || [];

    if (records.length === 0) {
      throw new Error(`ไม่พบข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master\nEmployee code ${cleanCode} was not found in Employee Master (App 53)`);
    }

    if (records.length > 1) {
      throw new Error(`พบรหัสพนักงาน ${cleanCode} ซ้ำซ้อนในระบบ Employee Master กรุณาติดต่อ HR / Administrator\nDuplicate employee code ${cleanCode} found. Please contact HR / Administrator.`);
    }

    const emp = records[0];
    return {
      Employee_Code: cleanCode, // Preserve leading zero string representation
      Employee_Name: emp.Text?.value || '',
      Employee_Name_TH: emp.Text_0?.value || '',
      Employee_Section: emp.Drop_down?.value || '',
      Employee_Department: emp.Drop_down_0?.value || '',
      Employee_Position: emp.Text_2?.value || '',
      Employee_Email: emp.Text_4?.value || '',
      Employee_Start_Date: emp.Date?.value || '',
      Department_Hoshin: emp.Text_area?.value || '',
      Section_Hoshin: emp.Text_area_0?.value || ''
    };
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

    const resp = await kintoneApi.getRecords(mboAppId, query);
    if (resp?.records?.length > 0) {
      throw new Error(`พนักงานรหัส ${cleanCode} มี MBO สำหรับ ${cleanFY} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้\nEmployee ${cleanCode} already has an MBO record for ${cleanFY}. Duplicate creation is blocked.`);
    }
  }
}
