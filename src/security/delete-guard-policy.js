/**
 * Security Guard: Employee-Self Delete Protection Policy
 * Prevents Employee-Self users from deleting MBO records on App794.
 * Uses mboLoginGate.getEmployeeCode() directly.
 */

export class DeleteGuardPolicy {
  constructor(options = {}) {
    this.mboLoginGate = options.mboLoginGate;
    this.getEmployeeSelfContext = options.getEmployeeSelfContext;
  }

  /**
   * Evaluates app.record.detail.delete.submit and app.record.index.delete.submit events.
   * - If Employee-Self context or mboLoginGate has a bound employeeCode:
   *     blocks delete submit, sets bilingual error, and returns false.
   * - If no Employee-Self context exists:
   *     returns event unchanged without blocking (abstains).
   * @param {Object} event Kintone deletion submit event
   * @returns {boolean|Object} Returns false if Employee-Self delete is blocked, or event unchanged if no Employee-Self principal
   */
  evaluateDeleteSubmit(event = {}) {
    let authEmpCode = null;

    if (typeof this.getEmployeeSelfContext === 'function') {
      const ctx = this.getEmployeeSelfContext();
      if (ctx && typeof ctx === 'object' && ctx.employeeCode) {
        authEmpCode = ctx.employeeCode;
      }
    }

    if (!authEmpCode && this.mboLoginGate && typeof this.mboLoginGate.getEmployeeCode === 'function') {
      authEmpCode = this.mboLoginGate.getEmployeeCode();
    }

    if (!authEmpCode) {
      // No Employee-Self principal -> return event unchanged
      return event;
    }

    // Employee-Self user authenticated -> block deletion with bilingual error
    if (typeof event === 'object' && event !== null) {
      event.error = 'การลบบันทึก MBO ไม่อนุญาตสำหรับพนักงาน / Deleting MBO records is strictly prohibited for Employee-Self.';
    }
    return false;
  }
}
