/**
 * Security Guard: Employee-Self Delete Protection Policy
 * Enforces strict fail-closed deletion prohibition for Employee-Self users and unauthenticated sessions.
 */

export class DeleteGuardPolicy {
  constructor(options = {}) {
    this.mboLoginGate = options.mboLoginGate;
    this.getAuthenticatedEmployeeCode = options.getAuthenticatedEmployeeCode;
  }

  /**
   * Evaluates app.record.detail.delete.submit and app.record.index.delete.submit events.
   * Blocks record deletion fail-closed for Employee-Self users and unauthenticated sessions.
   * @param {Object} event Kintone deletion submit event
   * @returns {boolean|Object} Returns false or event with event.error set to block deletion
   */
  evaluateDeleteSubmit(event = {}) {
    let authEmpCode = null;

    if (typeof this.getAuthenticatedEmployeeCode === 'function') {
      authEmpCode = this.getAuthenticatedEmployeeCode();
    } else if (this.mboLoginGate && typeof this.mboLoginGate.getAuthenticatedEmployeeCode === 'function') {
      authEmpCode = this.mboLoginGate.getAuthenticatedEmployeeCode();
    }

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
