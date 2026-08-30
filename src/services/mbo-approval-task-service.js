/**
 * MboApprovalTaskService — Canonical Current-Assignee Authority Service Foundation
 *
 * Enforces native Kintone current-assignee authority (Assignee field, STATUS_ASSIGNEE type)
 * for DEDICATED native Kintone users only.
 */

export class MboApprovalTaskService {
  /**
   * Validate that context is a valid DEDICATED Kintone user context
   * @param {Object} context
   * @throws {Error} if mode is not DEDICATED or user code is invalid
   */
  static validateDedicatedContext(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('APPROVER_AUTHORITY_DENIED: Valid Employee-Self context object is required.');
    }
    if (context.mode !== 'DEDICATED') {
      throw new Error('APPROVER_AUTHORITY_DENIED: SHARED mode principals are denied approval authority.');
    }
    const userCode = typeof context.kintoneUserCode === 'string' ? context.kintoneUserCode : '';
    if (!userCode || userCode !== userCode.trim()) {
      throw new Error('APPROVER_AUTHORITY_DENIED: Nonblank exact dedicated Kintone user code is required.');
    }
  }

  /**
   * Exact current-assignee verification on a record
   * @param {Object} record
   * @param {string} kintoneUserCode
   * @returns {boolean}
   */
  static isAuthorizedAssignee(record, kintoneUserCode) {
    if (!record || typeof record !== 'object') return false;
    if (!kintoneUserCode || typeof kintoneUserCode !== 'string') return false;
    const cleanUserCode = kintoneUserCode.trim();
    if (!cleanUserCode || kintoneUserCode !== cleanUserCode) return false;

    const assigneeField = record.Assignee;
    if (!assigneeField || typeof assigneeField !== 'object') return false;
    if (assigneeField.type !== 'STATUS_ASSIGNEE') return false;
    if (!Array.isArray(assigneeField.value)) return false;

    return assigneeField.value.some(user => user && typeof user === 'object' && user.code === cleanUserCode);
  }

  /**
   * List current approval tasks for dedicated user via Assignee in (LOGINUSER()) query
   * @param {Object} context - { mode: 'DEDICATED', kintoneUserCode: '...' }
   * @param {number|string} mboAppId
   * @param {Object} kintoneApiWrapper - API wrapper supplying getRecords(appId, query)
   * @returns {Promise<Array<Object>>}
   */
  static async fetchApprovalTasks(context, mboAppId, kintoneApiWrapper) {
    this.validateDedicatedContext(context);
    if (!mboAppId) {
      throw new Error('INVALID_MBO_APP_ID: mboAppId is required for approval tasks lookup.');
    }
    if (!kintoneApiWrapper || typeof kintoneApiWrapper.getRecords !== 'function') {
      throw new Error('INVALID_KINTONE_API_WRAPPER: kintoneApiWrapper.getRecords function is required.');
    }

    const userCode = context.kintoneUserCode;
    const baseQuery = 'Assignee in (LOGINUSER()) order by $id asc';
    const limit = 500;
    let offset = 0;
    let allRecords = [];
    let hasMore = true;

    while (hasMore) {
      const pageQuery = `${baseQuery} limit ${limit} offset ${offset}`;
      const res = await kintoneApiWrapper.getRecords(mboAppId, pageQuery);
      const records = res?.records;

      if (!Array.isArray(records)) {
        throw new Error('INVALID_GET_RECORDS_RESPONSE: getRecords response records field must be an array.');
      }

      allRecords.push(...records);

      if (records.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    // Fail closed: filter out any returned record that fails exact Assignee.value check
    return allRecords.filter(rec => this.isAuthorizedAssignee(rec, userCode));
  }

  /**
   * Perform single-record fresh revalidation of approval task authority
   * @param {Object} context - { mode: 'DEDICATED', kintoneUserCode: '...' }
   * @param {number|string} mboAppId
   * @param {number|string} recordId
   * @param {Object} kintoneApiWrapper - API wrapper supplying getRecord(appId, recordId) or getRecords
   * @returns {Promise<{ authorized: boolean, record?: Object, reason?: string }>}
   */
  static async revalidateApprovalTask(context, mboAppId, recordId, kintoneApiWrapper) {
    this.validateDedicatedContext(context);
    if (!mboAppId || !recordId) {
      throw new Error('INVALID_REVALIDATE_PARAMS: mboAppId and recordId are required for revalidation.');
    }
    if (!kintoneApiWrapper) {
      throw new Error('INVALID_KINTONE_API_WRAPPER: kintoneApiWrapper is required.');
    }

    let record = null;

    if (typeof kintoneApiWrapper.getRecord === 'function') {
      const res = await kintoneApiWrapper.getRecord(mboAppId, recordId);
      record = res?.record || null;
    } else if (typeof kintoneApiWrapper.getRecords === 'function') {
      const query = `$id = "${recordId}" limit 1`;
      const res = await kintoneApiWrapper.getRecords(mboAppId, query);
      record = (res?.records && res.records.length > 0) ? res.records[0] : null;
    } else {
      throw new Error('INVALID_KINTONE_API_WRAPPER: kintoneApiWrapper must provide getRecord or getRecords.');
    }

    if (!record) {
      return { authorized: false, reason: 'RECORD_NOT_FOUND' };
    }

    const authorized = this.isAuthorizedAssignee(record, context.kintoneUserCode);
    if (!authorized) {
      return { authorized: false, reason: 'ASSIGNEE_MISMATCH' };
    }

    return { authorized: true, record };
  }
}
