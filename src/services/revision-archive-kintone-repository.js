/**
 * RevisionArchiveKintoneRepository
 *
 * Local repository abstraction for App 798 (Revision Archive).
 * Interacts strictly via an injected Kintone API adapter.
 * ZERO live Kintone calls, zero environment credentials, zero network imports.
 *
 * App 798 is an immutable evidence ledger:
 * - findByArchiveKey: query records by exact Archive_Key
 * - createArchiveRecord: create a new archive row
 * - readBackExactArchiveRecord: read back and verify single row existence
 *
 * Mutation of existing rows is STRICTLY FORBIDDEN:
 * - NO updateArchiveRecord
 * - NO deleteArchiveRecord
 */

export const REVISION_ARCHIVE_APP_ID = 798;

export class RevisionArchiveRepositoryError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'RevisionArchiveRepositoryError';
    this.code = code;
    this.details = details;
  }
}

function escapeKintoneQueryValue(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

export class RevisionArchiveKintoneRepository {
  /**
   * @param {object} kintoneApi - Injected Kintone API adapter ({ getRecords, addRecord })
   * @param {object} [options] - Configuration options
   * @param {number} [options.appId=798] - Target archive app ID (default 798)
   */
  constructor(kintoneApi, options = {}) {
    if (!kintoneApi || typeof kintoneApi.getRecords !== 'function' || typeof kintoneApi.addRecord !== 'function') {
      throw new RevisionArchiveRepositoryError(
        'INJECTED_API_REQUIRED',
        'RevisionArchiveKintoneRepository requires an injected API adapter with getRecords and addRecord.'
      );
    }

    this.kintoneApi = kintoneApi;
    this.appId = Number(options.appId) || REVISION_ARCHIVE_APP_ID;
  }

  /**
   * Look up existing records by exact Archive_Key.
   * @param {string} archiveKey
   * @returns {Promise<Array<object>>} Normalized records array
   */
  async findByArchiveKey(archiveKey) {
    if (!archiveKey || typeof archiveKey !== 'string') {
      throw new RevisionArchiveRepositoryError(
        'ARCHIVE_KEY_REQUIRED',
        'findByArchiveKey requires a non-empty string archiveKey.'
      );
    }

    const query = `Archive_Key = "${escapeKintoneQueryValue(archiveKey)}" limit 5`;
    const res = await this.kintoneApi.getRecords(this.appId, query);
    const records = res?.records || [];

    return records.map(rec => this._normalizeRecord(rec));
  }

  /**
   * Create an archive row in App 798.
   * @param {object} recordPayload - Kintone-formatted field values map
   * @returns {Promise<{ id: string|number, revision: string|number }>}
   */
  async createArchiveRecord(recordPayload) {
    if (!recordPayload || typeof recordPayload !== 'object') {
      throw new RevisionArchiveRepositoryError(
        'RECORD_PAYLOAD_REQUIRED',
        'createArchiveRecord requires a recordPayload object.'
      );
    }

    const res = await this.kintoneApi.addRecord(this.appId, recordPayload);
    if (!res || (!res.id && !res.$id)) {
      throw new RevisionArchiveRepositoryError(
        'ARCHIVE_CREATE_FAILED',
        'Kintone addRecord failed or did not return record identity.'
      );
    }

    return {
      id: res.id || res.$id?.value || res.$id,
      revision: res.revision || res.$revision?.value || res.$revision || null
    };
  }

  /**
   * Read back an exact archive row by Archive_Key.
   * Fails closed if 0 or >1 records match.
   * @param {string} archiveKey
   * @returns {Promise<object>} Normalized record
   */
  async readBackExactArchiveRecord(archiveKey) {
    const records = await this.findByArchiveKey(archiveKey);

    if (records.length === 0) {
      throw new RevisionArchiveRepositoryError(
        'ARCHIVE_READBACK_NOT_FOUND',
        `No archive record found for Archive_Key: ${archiveKey}`
      );
    }

    if (records.length > 1) {
      throw new RevisionArchiveRepositoryError(
        'ARCHIVE_DUPLICATE_KEY_CORRUPTION',
        `Multiple archive records (${records.length}) found for unique Archive_Key: ${archiveKey}`
      );
    }

    return records[0];
  }

  /**
   * Normalize raw Kintone record structure to clean logical properties.
   * @private
   */
  _normalizeRecord(raw) {
    if (!raw) return null;

    const sourceRecordIdRaw = raw.Source_Record_ID?.value;
    const revisionNumberRaw = raw.Revision_Number?.value;
    const supersededByRevisionRaw = raw.Superseded_By_Revision?.value;

    return {
      archiveKey: raw.Archive_Key?.value ?? '',
      sourceRecordId: (sourceRecordIdRaw !== undefined && sourceRecordIdRaw !== '' && sourceRecordIdRaw !== null)
        ? Number(sourceRecordIdRaw)
        : null,
      sourceRecordKey: raw.Source_Record_Key?.value ?? '',
      fiscalYear: raw.Fiscal_Year?.value ?? '',
      employeeCode: raw.Employee_Code?.value ?? '',
      evaluationStage: raw.Evaluation_Stage?.value ?? '',
      revisionNumber: (revisionNumberRaw !== undefined && revisionNumberRaw !== '' && revisionNumberRaw !== null)
        ? Number(revisionNumberRaw)
        : null,
      previousStatus: raw.Previous_Status?.value ?? '',
      supersededByRevision: (supersededByRevisionRaw !== undefined && supersededByRevisionRaw !== '' && supersededByRevisionRaw !== null)
        ? Number(supersededByRevisionRaw)
        : null,
      eventType: raw.Event_Type?.value ?? '',
      reason: raw.Reason?.value ?? '',
      snapshotJson: raw.Snapshot_JSON?.value ?? '',
      snapshotHash: raw.Snapshot_Hash?.value ?? '',
      archivedBy: Array.isArray(raw.Archived_By?.value) ? raw.Archived_By.value : [],
      archivedAt: raw.Archived_At?.value ?? '',
      rawRecord: raw
    };
  }
}
