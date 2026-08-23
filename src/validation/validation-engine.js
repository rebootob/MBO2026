/**
 * Business Rule Validation Engine
 */

import { BUSINESS_STAGES } from '../config/constants.js';

export class ValidationEngine {
  static validate(record, stage) {
    const errors = [];

    if (!record) {
      errors.push('ไม่พบข้อมูล Record');
      return { isValid: false, errors };
    }

    if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      errors.push('ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)');
      return { isValid: false, errors };
    }

    if (stage === BUSINESS_STAGES.READ_ONLY) {
      return { isValid: true, errors: [] };
    }

    // Common checks
    const empCode = this._val(record.Employee_Code);
    if (!empCode) {
      errors.push('กรุณาระบุรหัสพนักงาน (Employee Code)');
    }

    const fy = this._val(record.Fiscal_Year);
    if (!fy) {
      errors.push('กรุณาระบุรอบการประเมิน (Fiscal Year)');
    }

    const objCount = parseInt(this._val(record.Objective_Count) || '4', 10);
    if (isNaN(objCount) || objCount < 2 || objCount > 10) {
      errors.push('จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ');
      return { isValid: false, errors };
    }

    // Stage 1: OBJECTIVE_INPUT
    if (stage === BUSINESS_STAGES.OBJECTIVE_INPUT) {
      let totalWeight = 0;

      for (let i = 1; i <= objCount; i++) {
        const obj = this._val(record[`Objective_${i}`]);
        const plan = this._val(record[`Action_Plan_${i}`]);
        const weightVal = this._val(record[`Weight_${i}`]);
        const weight = parseFloat(weightVal || '0');
        const diffVal = this._val(record[`Difficulty_${i}`]);
        const diff = parseInt(diffVal, 10);

        if (!obj) {
          errors.push(`กรุณาระบุ Objective ข้อที่ ${i}`);
        }
        if (!plan) {
          errors.push(`กรุณาระบุ Action Plan ข้อที่ ${i}`);
        }
        if (!weightVal || isNaN(weight) || weight <= 0 || weight > 100) {
          errors.push(`กรุณาระบุ Weight ข้อที่ ${i} (1 - 100%)`);
        } else {
          totalWeight += weight;
        }
        if (!diffVal || isNaN(diff) || diff < 1 || diff > 4) {
          errors.push(`กรุณาเลือกระดับ Difficulty Level ${i} ต้องอยู่ระหว่าง 1 ถึง 4`);
        }
      }

      if (Math.round(totalWeight) !== 100) {
        errors.push(`ผลรวม Weight ต้องเท่ากับ 100% (ปัจจุบันคำนวณได้ ${totalWeight}%)`);
      }
    }

    // Stage 2: MIDYEAR_INPUT
    if (stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      for (let i = 1; i <= objCount; i++) {
        const progVal = this._val(record[`Progress_Percent_${i}`]);
        const prog = parseFloat(progVal || '0');
        if (progVal === '' || isNaN(prog) || prog < 0 || prog > 100) {
          errors.push(`กรุณาระบุ Progress % ${i} ระหว่าง 0 ถึง 100%`);
        }
      }
    }

    // Stage 3: SELF_EVALUATION
    if (stage === BUSINESS_STAGES.SELF_EVALUATION) {
      for (let i = 1; i <= objCount; i++) {
        const actual = this._val(record[`Actual_Result_${i}`]);
        const achVal = this._val(record[`Self_Achievement_${i}`]);
        const ach = parseInt(achVal, 10);

        if (!actual) {
          errors.push(`กรุณาระบุ Actual Result ข้อที่ ${i}`);
        }
        if (!achVal || isNaN(ach) || ach < 1 || ach > 5) {
          errors.push(`กรุณาเลือกระดับ Self Achievement ข้อที่ ${i} (1 - 5)`);
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
