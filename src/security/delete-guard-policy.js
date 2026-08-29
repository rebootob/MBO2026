/**
 * Security Guard: Employee-Self Delete Protection Policy
 * Prevents Employee-Self users from deleting MBO records on App794.
 * Uses mboLoginGate.getEmployeeCode() directly.
 */

export class DeleteGuardPolicy {
  constructor(options = {}) {
    this.mboLoginGate = options.mboLoginGate;
  }

  /**
   * Evaluates app.record.detail.delete.submit and app.record.index.delete.submit events.
   * - If mboLoginGate.getEmployeeCode() has a value (Employee-Self active):
   *     blocks delete submit, sets bilingual error, and returns false.
   * - If mboLoginGate.getEmployeeCode() has no value (no Employee-Self principal):
   *     returns event unchanged without blocking.
   * @param {Object} event Kintone deletion submit event
   * @returns {boolean|Object} Returns false if Employee-Self delete is blocked, or event unchanged if no Employee-Self principal
   */
  evaluateDeleteSubmit(event = {}) {
    const authEmpCode = (this.mboLoginGate && typeof this.mboLoginGate.getEmployeeCode === 'function')
      ? this.mboLoginGate.getEmployeeCode()
      : null;

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
