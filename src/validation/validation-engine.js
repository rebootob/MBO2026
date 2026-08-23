/**
 * Central Validation Engine for TTMET MBO V2
 */

import { BUSINESS_STAGES } from '../config/constants.js';

export class ValidationEngine {
  /**
   * Validate entire record based on current business stage
   */
  static validate(record, stage) {
    const errors = [];

    if (!record) {
      errors.push('ไม่พบข้อมูลแบบประเมิน MBO');
      return { isValid: false, errors };
    }

    if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      errors.push('ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)');
      return { isValid: false, errors };
    }

    // A. Employee Validation (Basic fields)
    const empCode = this._val(record.Employee_Code);
    if (!empCode) {
      errors.push('กรุณาระบุรหัสพนักงาน (Employee Code)');
    }

    const fy = this._val(record.Fiscal_Year);
    if (!fy) {
      errors.push('กรุณาระบุปีประเมิน (Fiscal Year)');
    }

    // B. Objectives Validation
    const countVal = parseInt(this._val(record.Objective_Count) || '2', 10);
    const count = isNaN(countVal) ? 2 : countVal;
    if (count < 2 || count > 4) {
      errors.push('จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 4 ข้อ');
    }

    let totalWeight = 0;
    for (let i = 1; i <= count; i++) {
      const obj = this._val(record[`Objective_${i}`]);
      const act = this._val(record[`Action_Plan_${i}`]);
      const wVal = parseFloat(this._val(record[`Weight_${i}`]) || '0');
      const diffVal = parseInt(this._val(record[`Difficulty_${i}`]) || '0', 10);

      if (!obj) {
        errors.push(`กรุณากรอก Objective ${i} ให้ครบถ้วน`);
      }
      if (!act) {
        errors.push(`กรุณากรอก Action Plan ${i} ให้ครบถ้วน`);
      }
      if (isNaN(wVal) || wVal <= 0) {
        errors.push(`กรุณาระบุน้ำหนัก Weight ${i} มากกว่า 0%`);
      } else {
        totalWeight += wVal;
      }
      if (isNaN(diffVal) || diffVal < 1 || diffVal > 4) {
        errors.push(`Difficulty Level ${i} ต้องอยู่ระหว่าง 1 ถึง 4`);
      }
    }

    if (Math.round(totalWeight) !== 100) {
      errors.push(`ผลรวม Weight ต้องเท่ากับ 100% (ปัจจุบัน: ${totalWeight}%)`);
    }

    // C. Mid-Year Validation (if in Mid-Year or later)
    if (stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      for (let i = 1; i <= count; i++) {
        const progVal = parseFloat(this._val(record[`Progress_Percent_${i}`]));
        const currentResult = this._val(record[`MidYear_Result_${i}`]);
        const periodical = this._val(record[`Periodical_Review_${i}`]);

        if (isNaN(progVal) || progVal < 0 || progVal > 100) {
          errors.push(`กรุณาระบุ Progress % ${i} ระหว่าง 0 ถึง 100%`);
        }
        if (!currentResult && !periodical) {
          errors.push(`กรุณากรอกผลการดำเนินงาน Mid-Year หรือ Periodical Review ของ Objective ${i}`);
        }
      }
    }

    // D. Self Evaluation Validation (if in Self Evaluation stage)
    if (stage === BUSINESS_STAGES.SELF_EVALUATION) {
      for (let i = 1; i <= count; i++) {
        const actual = this._val(record[`Actual_Result_${i}`]);
        const selfAchVal = parseInt(this._val(record[`Self_Achievement_${i}`]) || '0', 10);

        if (!actual) {
          errors.push(`กรุณากรอก Actual Result สำหรับ Objective ${i}`);
        }
        if (isNaN(selfAchVal) || selfAchVal < 1 || selfAchVal > 5) {
          errors.push(`กรุณาระบุ Self Achievement Level ${i} (1-5)`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static _val(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) {
      return field.value !== null && field.value !== undefined ? String(field.value).trim() : '';
    }
    return String(field).trim();
  }
}
