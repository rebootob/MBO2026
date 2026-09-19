/**
 * D3 Revision Resolver (Pure Module).
 *
 * Single responsibility: resolve the authoritative live revision number for
 * an App794-shaped record.
 *
 * Authority priority (highest first):
 *   1. Kintone native system field `$revision` (always present on every
 *      live Kintone record; authoritative for App794 live schema).
 *   2. Legacy custom field `Revision_Number` (historical compatibility only
 *      — retained because some existing tests/contracts still exercise it).
 *   3. Legacy custom field `Current_Revision_Number` (historical
 *      compatibility only, same rationale as above).
 *
 * No Kintone API calls. No DOM access. No side effects. Pure function,
 * independently unit-testable without any Kintone/browser environment.
 */

/**
 * Reads a single Kintone-shaped field value, tolerating both the raw
 * `{ value }` field-object shape and already-unwrapped primitives.
 *
 * @param {object} record
 * @param {string} fieldCode
 * @returns {*} unwrapped field value, or undefined if absent
 */
function readField(record, fieldCode) {
  const raw = record?.[fieldCode];
  if (raw && typeof raw === 'object' && 'value' in raw) {
    return raw.value;
  }
  return raw;
}

/**
 * Resolves the authoritative revision number for a record.
 *
 * @param {object} record Authoritative Kintone App794 record (raw or
 *   field-object shaped)
 * @returns {number} a positive integer revision number
 * @throws {Error} PROVENANCE_INVALID if no authority yields a valid
 *   positive integer
 */
export function resolveRevisionNumber(record) {
  const rawRevision =
    readField(record, '$revision') ??
    readField(record, 'Revision_Number') ??
    readField(record, 'Current_Revision_Number');

  const revisionNumber = Number(rawRevision);
  if (!Number.isInteger(revisionNumber) || revisionNumber < 1) {
    throw new Error(`PROVENANCE_INVALID: Revision_Number must be a positive integer, got "${rawRevision}"`);
  }

  return revisionNumber;
}
