/**
 * Employee Service - Read-only lookup from App 53 (Employee Namelist)
 */

export class EmployeeService {
  /**
   * Lookup employee by Employee Code in App 53
   * Returns snapshot data or throws informative error
   */
  static async lookupEmployee(empCode, kintoneApi) {
    const cleanCode = String(empCode || '').trim();
    if (!cleanCode) {
      throw new Error('กรุณาระบุรหัสพนักงาน (Employee Code)');
    }

    const query = `Number = "${cleanCode}" limit 2`;
    const resp = await kintoneApi.getRecords(53, query);
    const records = resp?.records || [];

    if (records.length === 0) {
      throw new Error(`ไม่พบข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master (App 53)`);
    }

    if (records.length > 1) {
      throw new Error(`พบข้อมูลพนักงานซ้ำซ้อนสำหรับรหัส ${cleanCode} ในระบบ Employee Master กรุณาแจ้ง HR / Administrator`);
    }

    const emp = records[0];
    return {
      Employee_Code: cleanCode,
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
      throw new Error(`พบแบบประเมิน MBO ของพนักงานรหัส ${cleanCode} สำหรับปี ${cleanFY} อยู่ในระบบแล้ว ไม่สามารถสร้างซ้ำได้`);
    }
  }
}
