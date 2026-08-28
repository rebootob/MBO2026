/**
 * Security Guard: Employee-Self Delete Protection Policy
 * Enforces strict fail-closed deletion prohibition for Employee-Self users and unauthenticated sessions.
 * Integrates directly with mboLoginGate.getEmployeeCode() without adding any new auth API surface.
 */

export class DeleteGuardPolicy {
  constructor(options = {}) {
    this.mboLoginGate = options.mboLoginGate;
  }

  /**
   * Evaluates app.record.detail.delete.submit and app.record.index.delete.submit events.
   * Blocks record deletion fail-closed for Employee-Self users and unauthenticated sessions.
   * @param {Object} event Kintone deletion submit event
   * @returns {boolean} Returns false to block deletion and sets event.error
   */
  evaluateDeleteSubmit(event = {}) {
    const authEmpCode = (this.mboLoginGate && typeof this.mboLoginGate.getEmployeeCode === 'function')
      ? this.mboLoginGate.getEmployeeCode()
      : null;

    if (!authEmpCode) {
      if (typeof event === 'object' && event !== null) {
        event.error = 'ไม่พบข้อมูลการเข้าสู่ระบบ / Authentication required to perform record operations.';
      }
      return false;
    }

    // Employee-Self user authenticated -> strictly prohibit deletion
    if (typeof event === 'object' && event !== null) {
      event.error = 'การลบบันทึก MBO ไม่อนุญาตสำหรับพนักงาน / Deleting MBO records is strictly prohibited for Employee-Self.';
    }
    return false;
  }
}
