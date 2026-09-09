/**
 * RevisionArchiveService
 *
 * Local business service for App 798 (Revision Archive) immutable evidence ledger.
 * Governed by locked D3-008 and D3-WP001-R4-R1.
 *
 * App 798 is an immutable event-scoped historical evidence ledger:
 * - STAGE_COMPLETION_SNAPSHOT
 * - EVALUATION_REVISION_CREATED
 * - ROUTE_REASSIGNMENT_PRECHANGE
 *
 * Zero real Kintone execution; works through an injected repository.
 */

import { hashD3Snapshot } from './d3-snapshot-serializer.js';
import {
  RevisionArchiveKintoneRepository,
  RevisionArchiveRepositoryError
} from './revision-archive-kintone-repository.js';

export const ARCHIVE_EVENT_TYPES = Object.freeze({
  STAGE_COMPLETION_SNAPSHOT: 'STAGE_COMPLETION_SNAPSHOT',
  EVALUATION_REVISION_CREATED: 'EVALUATION_REVISION_CREATED',
  ROUTE_REASSIGNMENT_PRECHANGE: 'ROUTE_REASSIGNMENT_PRECHANGE'
});

export const ARCHIVE_EVALUATION_STAGES = Object.freeze({
  OBJECTIVE: 'OBJECTIVE',
  MIDYEAR: 'MIDYEAR',
  FINAL: 'FINAL'
});

export class RevisionArchiveError extends Error {
  constructor(code, message, details = null) {
    super(`${code}: ${message}`);
    this.name = 'RevisionArchiveError';
    this.code = code;
    this.details = details;
  }
}

// Module-private issuance registry for service-issued archive evidence (unforgeable in-process)
const issuedArchiveEvidence = new WeakSet();

// Strict ISO-8601 datetime with explicit timezone (Z or numeric offset)
const ISO_WITH_TIMEZONE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;

function validateKeyComponent(value, componentName) {
  if (value === null || value === undefined || typeof value !== 'string') {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${componentName} must be a non-empty string in Archive_Key.`
    );
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed !== value) {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${componentName} cannot be empty or contain leading/trailing whitespace.`
    );
  }
  if (value.includes('|') || value.includes('\r') || value.includes('\n')) {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${componentName} contains invalid delimiter characters (| or newline).`
    );
  }
  return value;
}

function validatePositiveInteger(value, paramName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new RevisionArchiveError(
      'ARCHIVE_INVALID_KEY_COMPONENT',
      `${paramName} must be a positive integer, received: ${value}.`
    );
  }
  return num;
}

function isStrictPositiveInteger(value) {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed !== value) return false;
    if (!/^\d+$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return Number.isInteger(num) && num > 0;
  }
  return false;
}

export function buildArchiveKey({
  eventType,
  sourceRecordKey,
  evaluationStage,
  revisionNumber,
  supersededByRevision,
  stableEventId
}) {
  if (!Object.values(ARCHIVE_EVENT_TYPES).includes(eventType)) {
    throw new RevisionArchiveError(
      'ARCHIVE_UNSUPPORTED_EVENT_TYPE',
      `Unsupported archive event type: ${eventType}.`
    );
  }

  if (!Object.values(ARCHIVE_EVALUATION_STAGES).includes(evaluationStage)) {
    throw new RevisionArchiveError(
      'ARCHIVE_UNSUPPORTED_STAGE',
      `Unsupported evaluation stage: ${evaluationStage}.`
    );
  }

  const cleanKey = validateKeyComponent(sourceRecordKey, 'Source_Record_Key');
  const cleanStage = validateKeyComponent(evaluationStage, 'Evaluation_Stage');
  const cleanRev = validatePositiveInteger(revisionNumber, 'Revision_Number');

  if (eventType === ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT) {
    return `${cleanKey}|${cleanStage}|R${cleanRev}|STAGE_COMPLETION`;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED) {
    const cleanSuperseded = validatePositiveInteger(supersededByRevision, 'Superseded_By_Revision');
    if (cleanSuperseded <= cleanRev) {
      throw new RevisionArchiveError(
        'ARCHIVE_INVALID_KEY_COMPONENT',
        `Superseded_By_Revision (${cleanSuperseded}) must be greater than Revision_Number (${cleanRev}).`
      );
    }
    return `${cleanKey}|${cleanStage}|R${cleanRev}|EVALUATION_REVISION_CREATED|TO_R${cleanSuperseded}`;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE) {
    if (!stableEventId || typeof stableEventId !== 'string' || !stableEventId.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_STABLE_EVENT_ID_REQUIRED',
        'ROUTE_REASSIGNMENT_PRECHANGE requires a non-empty caller-supplied stableEventId.'
      );
    }
    const cleanEventId = validateKeyComponent(stableEventId, 'Stable_Event_ID');
    return `${cleanKey}|${cleanStage}|R${cleanRev}|ROUTE_REASSIGNMENT_PRECHANGE|${cleanEventId}`;
  }

  throw new RevisionArchiveError(
    'ARCHIVE_UNSUPPORTED_EVENT_TYPE',
    `Unhandled event type: ${eventType}`
  );
}

function resolveActorUserCode(actor) {
  if (!actor || typeof actor !== 'object' || Array.isArray(actor)) {
    throw new RevisionArchiveError('ARCHIVE_ACTOR_NOT_RESOLVED', 'Archive actor must be an object with explicit userCode.');
  }

  if (typeof actor.userCode !== 'string') {
    throw new RevisionArchiveError(
      'ARCHIVE_ACTOR_NOT_RESOLVED',
      'Archive actor must specify userCode as a non-empty string; plain string, { code }, and display-name are forbidden.'
    );
  }

  const userCode = actor.userCode.trim();
  if (!userCode || userCode.toUpperCase() === 'SYSTEM') {
    throw new RevisionArchiveError(
      'ARCHIVE_ACTOR_NOT_RESOLVED',
      'Archive actor userCode cannot be empty, whitespace, or generic "SYSTEM".'
    );
  }

  return userCode;
}

function resolveReason(eventType, evaluationStage, rawReason) {
  const trimmed = typeof rawReason === 'string' ? rawReason.trim() : '';

  if (eventType === ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT) {
    if (trimmed) return trimmed;
    return `STAGE_COMPLETION_SNAPSHOT:${evaluationStage}`;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED) {
    if (!trimmed) {
      throw new RevisionArchiveError(
        'ARCHIVE_REASON_REQUIRED',
        'EVALUATION_REVISION_CREATED requires an explicit approved business reason.'
      );
    }
    return trimmed;
  }

  if (eventType === ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE) {
    if (!trimmed) {
      throw new RevisionArchiveError(
        'ARCHIVE_REASON_REQUIRED',
        'ROUTE_REASSIGNMENT_PRECHANGE requires an explicit approved reassignment reason.'
      );
    }
    return trimmed;
  }

  return trimmed;
}

function resolveArchivedAt(explicitArchivedAt, clock) {
  if (explicitArchivedAt !== undefined && explicitArchivedAt !== null) {
    if (typeof explicitArchivedAt !== 'string' || !explicitArchivedAt.trim()) {
      throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', 'archivedAt must be a non-empty ISO-8601 string.');
    }
    const trimmed = explicitArchivedAt.trim();
    if (!ISO_WITH_TIMEZONE_REGEX.test(trimmed)) {
      throw new RevisionArchiveError(
        'ARCHIVE_INVALID_TIMESTAMP',
        `archivedAt must be an ISO-8601 datetime with explicit timezone (Z or numeric offset), received: "${explicitArchivedAt}".`
      );
    }
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) {
      throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', `Invalid datetime string: "${explicitArchivedAt}".`);
    }
    return d.toISOString();
  }

  if (typeof clock === 'function') {
    const clockResult = clock();
    if (clockResult instanceof Date) {
      if (Number.isNaN(clockResult.getTime())) {
        throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', 'Clock returned an invalid Date.');
      }
      return clockResult.toISOString();
    }
    if (typeof clockResult === 'string') {
      const trimmed = clockResult.trim();
      if (!ISO_WITH_TIMEZONE_REGEX.test(trimmed)) {
        throw new RevisionArchiveError(
          'ARCHIVE_INVALID_TIMESTAMP',
          `Clock returned datetime without explicit timezone or invalid format: "${clockResult}".`
        );
      }
      const d = new Date(trimmed);
      if (Number.isNaN(d.getTime())) {
        throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', `Clock returned an invalid datetime: "${clockResult}".`);
      }
      return d.toISOString();
    }
    throw new RevisionArchiveError('ARCHIVE_INVALID_TIMESTAMP', 'Injected clock must return a Date or ISO-8601 string with timezone.');
  }

  throw new RevisionArchiveError(
    'ARCHIVE_TIMESTAMP_REQUIRED',
    'Archived_At requires an explicit ISO timestamp or an injected service clock. System clock fallback is forbidden.'
  );
}

function validateSnapshotCoherence(logicalSnapshot, request) {
  if (!logicalSnapshot || typeof logicalSnapshot !== 'object') {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Logical snapshot is required and must be a plain object.'
    );
  }

  const { source, stage, profile, route, scoring } = logicalSnapshot;

  if (!source || !stage || !profile || !route || !scoring) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Logical snapshot is missing required core sections (source, stage, profile, route, scoring).'
    );
  }

  if (source.Record_Key !== request.sourceRecordKey) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Record_Key (${source.Record_Key}) does not match request Source_Record_Key (${request.sourceRecordKey}).`
    );
  }

  // Employee_Code hardening: non-empty exact string without whitespace
  if (typeof request.employeeCode !== 'string' || !request.employeeCode.trim() || request.employeeCode.trim() !== request.employeeCode) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Request Employee_Code must be a non-empty exact string without whitespace, received: "${request.employeeCode}".`
    );
  }
  if (typeof source.Employee_Code !== 'string' || !source.Employee_Code.trim() || source.Employee_Code.trim() !== source.Employee_Code) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Employee_Code must be a non-empty exact string without whitespace, received: "${source.Employee_Code}".`
    );
  }
  if (source.Employee_Code !== request.employeeCode) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Employee_Code (${source.Employee_Code}) does not match request Employee_Code (${request.employeeCode}).`
    );
  }

  // Fiscal_Year hardening: non-empty exact string without whitespace
  if (typeof request.fiscalYear !== 'string' || !request.fiscalYear.trim() || request.fiscalYear.trim() !== request.fiscalYear) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Request Fiscal_Year must be a non-empty exact string without whitespace, received: "${request.fiscalYear}".`
    );
  }
  if (typeof source.Fiscal_Year !== 'string' || !source.Fiscal_Year.trim() || source.Fiscal_Year.trim() !== source.Fiscal_Year) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Fiscal_Year must be a non-empty exact string without whitespace, received: "${source.Fiscal_Year}".`
    );
  }
  if (source.Fiscal_Year !== request.fiscalYear) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot source.Fiscal_Year (${source.Fiscal_Year}) does not match request Fiscal_Year (${request.fiscalYear}).`
    );
  }

  // Source_Record_ID hardening (Cases A, B, C)
  const hasRequestSourceRecordId = request.sourceRecordId !== undefined && request.sourceRecordId !== null;
  const hasSnapshotSourceRecordId = source.Record_ID !== undefined && source.Record_ID !== null;

  if (hasRequestSourceRecordId) {
    // CASE A: request.sourceRecordId supplied
    if (!isStrictPositiveInteger(request.sourceRecordId)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Request sourceRecordId must be a positive integer, received: ${request.sourceRecordId}.`
      );
    }
    if (!hasSnapshotSourceRecordId || !isStrictPositiveInteger(source.Record_ID)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Snapshot source.Record_ID must exist and be a positive integer when request sourceRecordId is supplied, received: ${source.Record_ID}.`
      );
    }
    if (Number(request.sourceRecordId) !== Number(source.Record_ID)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Snapshot source.Record_ID (${source.Record_ID}) does not match request Source_Record_ID (${request.sourceRecordId}).`
      );
    }
  } else if (hasSnapshotSourceRecordId) {
    // CASE B: request.sourceRecordId omitted but snapshot.source.Record_ID exists
    if (!isStrictPositiveInteger(source.Record_ID)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Snapshot source.Record_ID must be a positive integer when present, received: ${source.Record_ID}.`
      );
    }
  }
  // CASE C: both omitted -> allowed

  if (stage.Evaluation_Stage !== request.evaluationStage) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot stage.Evaluation_Stage (${stage.Evaluation_Stage}) does not match request Evaluation_Stage (${request.evaluationStage}).`
    );
  }

  if (Number(stage.Revision_Number) !== Number(request.revisionNumber)) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot stage.Revision_Number (${stage.Revision_Number}) does not match request Revision_Number (${request.revisionNumber}).`
    );
  }

  // Previous_Status coherence
  const snapshotPreviousStatus = stage.Previous_Status !== undefined && stage.Previous_Status !== null
    ? String(stage.Previous_Status)
    : '';
  if (request.previousStatus !== undefined && request.previousStatus !== null) {
    const reqPrev = String(request.previousStatus);
    if (reqPrev !== snapshotPreviousStatus) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Snapshot stage.Previous_Status ("${snapshotPreviousStatus}") does not match request previousStatus ("${reqPrev}").`
      );
    }
  }

  // profile.Frozen_Profile_Code: required nonblank string
  if (typeof profile.Frozen_Profile_Code !== 'string' || !profile.Frozen_Profile_Code.trim()) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot profile.Frozen_Profile_Code must be a non-empty string.'
    );
  }

  // profile.K_expected_Snapshot: must be exact integer: 1 or 2
  const kExpected = profile.K_expected_Snapshot;
  if (!Number.isInteger(kExpected) || (kExpected !== 1 && kExpected !== 2)) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Snapshot profile.K_expected_Snapshot must be exact integer 1 or 2, received: ${kExpected}.`
    );
  }

  // route.Effective_Routing_Key: required nonblank
  if (typeof route.Effective_Routing_Key !== 'string' || !route.Effective_Routing_Key.trim()) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot route.Effective_Routing_Key must be a non-empty string.'
    );
  }

  // route.Effective_Route_Version_Key: required nonblank
  if (typeof route.Effective_Route_Version_Key !== 'string' || !route.Effective_Route_Version_Key.trim()) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot route.Effective_Route_Version_Key must be a non-empty string.'
    );
  }

  // route.Workflow_Appraisers: must be non-empty array
  if (!Array.isArray(route.Workflow_Appraisers) || route.Workflow_Appraisers.length === 0) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot route.Workflow_Appraisers must be a non-empty array.'
    );
  }

  // Every workflow appraiser: must contain exact nonblank code. No duplicate codes.
  const appraiserCodes = new Set();
  for (const appraiser of route.Workflow_Appraisers) {
    if (!appraiser || typeof appraiser.code !== 'string' || !appraiser.code.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        'Every appraiser in route.Workflow_Appraisers must contain an exact non-empty string code.'
      );
    }
    const code = appraiser.code.trim();
    if (appraiserCodes.has(code)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Duplicate appraiser code in route.Workflow_Appraisers: "${code}".`
      );
    }
    appraiserCodes.add(code);
  }

  // scoring.Scorers: must be non-empty array
  if (!Array.isArray(scoring.Scorers) || scoring.Scorers.length === 0) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      'Snapshot scoring.Scorers must be a non-empty array.'
    );
  }

  // Every scorer: must contain exact nonblank code. No duplicate codes.
  const scorerCodes = new Set();
  for (const scorer of scoring.Scorers) {
    if (!scorer || typeof scorer.code !== 'string' || !scorer.code.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        'Every scorer in scoring.Scorers must contain an exact non-empty string code.'
      );
    }
    const code = scorer.code.trim();
    if (scorerCodes.has(code)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Duplicate scorer code in scoring.Scorers: "${code}".`
      );
    }
    scorerCodes.add(code);
  }

  // Scorer count: must equal K_expected_Snapshot
  if (scoring.Scorers.length !== kExpected) {
    throw new RevisionArchiveError(
      'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
      `Scorer count (${scoring.Scorers.length}) does not match K_expected_Snapshot (${kExpected}).`
    );
  }

  // Every scorer identity: must exist in Workflow_Appraisers
  for (const scorerCode of scorerCodes) {
    if (!appraiserCodes.has(scorerCode)) {
      throw new RevisionArchiveError(
        'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH',
        `Scorer "${scorerCode}" does not exist in route.Workflow_Appraisers.`
      );
    }
  }
}

function compareArchiveRecordToExpected(persisted, expected, mode) {
  const isReadback = mode === 'POST_CREATE_READBACK';
  const errorCode = isReadback
    ? 'ARCHIVE_READBACK_VERIFICATION_FAILED'
    : 'ARCHIVE_IDEMPOTENCY_CONFLICT';

  function fail(field, persistedVal, expectedVal) {
    throw new RevisionArchiveError(
      errorCode,
      `Archive record verification failed on ${field} (${mode}): persisted "${persistedVal}" vs expected "${expectedVal}".`
    );
  }

  if (persisted.archiveKey !== expected.archiveKey) {
    fail('Archive_Key', persisted.archiveKey, expected.archiveKey);
  }
  if (persisted.sourceRecordKey !== expected.sourceRecordKey) {
    fail('Source_Record_Key', persisted.sourceRecordKey, expected.sourceRecordKey);
  }
  if (persisted.fiscalYear !== expected.fiscalYear) {
    fail('Fiscal_Year', persisted.fiscalYear, expected.fiscalYear);
  }
  if (persisted.employeeCode !== expected.employeeCode) {
    fail('Employee_Code', persisted.employeeCode, expected.employeeCode);
  }
  if (persisted.evaluationStage !== expected.evaluationStage) {
    fail('Evaluation_Stage', persisted.evaluationStage, expected.evaluationStage);
  }
  if (Number(persisted.revisionNumber) !== Number(expected.revisionNumber)) {
    fail('Revision_Number', persisted.revisionNumber, expected.revisionNumber);
  }
  if (persisted.eventType !== expected.eventType) {
    fail('Event_Type', persisted.eventType, expected.eventType);
  }
  if (persisted.reason !== expected.reason) {
    fail('Reason', persisted.reason, expected.reason);
  }
  if (persisted.snapshotHash !== expected.snapshotHash) {
    fail('Snapshot_Hash', persisted.snapshotHash, expected.snapshotHash);
  }
  if (persisted.snapshotJson !== expected.snapshotJson) {
    fail('Snapshot_JSON', persisted.snapshotJson, expected.snapshotJson);
  }

  // Archived_By: exact one user code
  const persistedActor = persisted.archivedBy?.[0]?.code;
  const hasSingleActor = Array.isArray(persisted.archivedBy) && persisted.archivedBy.length === 1;
  if (!hasSingleActor || persistedActor !== expected.actorUserCode) {
    fail('Archived_By', persistedActor, expected.actorUserCode);
  }

  // Previous_Status
  const persistedPrev = persisted.previousStatus ?? '';
  const expectedPrev = expected.previousStatus ?? '';
  if (persistedPrev !== expectedPrev) {
    fail('Previous_Status', persistedPrev, expectedPrev);
  }

  // Superseded_By_Revision
  const persistedSuperseded = (persisted.supersededByRevision !== null && persisted.supersededByRevision !== undefined && persisted.supersededByRevision !== '')
    ? Number(persisted.supersededByRevision)
    : null;
  const expectedSuperseded = (expected.supersededByRevision !== null && expected.supersededByRevision !== undefined && expected.supersededByRevision !== '')
    ? Number(expected.supersededByRevision)
    : null;
  if (persistedSuperseded !== expectedSuperseded) {
    fail('Superseded_By_Revision', persistedSuperseded, expectedSuperseded);
  }

  // Source_Record_ID (when expected supplies it or present)
  if (expected.sourceRecordId !== null && expected.sourceRecordId !== undefined && expected.sourceRecordId !== '') {
    const expId = Number(expected.sourceRecordId);
    const persId = (persisted.sourceRecordId !== null && persisted.sourceRecordId !== undefined && persisted.sourceRecordId !== '')
      ? Number(persisted.sourceRecordId)
      : null;
    if (persId !== expId) {
      fail('Source_Record_ID', persId, expId);
    }
  }

  // Post-create readback checks Archived_At written by this attempt
  if (isReadback) {
    if (persisted.archivedAt !== expected.archivedAt) {
      fail('Archived_At', persisted.archivedAt, expected.archivedAt);
    }
  }

  return true;
}

export class RevisionArchiveService {
  /**
   * @param {RevisionArchiveKintoneRepository|object} repository - Repository instance or injected Kintone API adapter
   * @param {object} [options]
   * @param {function} [options.clock] - Optional injected clock function returning Date or ISO string
   */
  constructor(repository, options = {}) {
    if (!repository) {
      throw new RevisionArchiveError(
        'REPOSITORY_REQUIRED',
        'RevisionArchiveService requires a repository instance or injected Kintone API adapter.'
      );
    }

    if (repository instanceof RevisionArchiveKintoneRepository) {
      this.repository = repository;
    } else {
      this.repository = new RevisionArchiveKintoneRepository(repository, options);
    }

    this.clock = options.clock || null;
  }

  /**
   * Archives a stage completion event.
   */
  async archiveStageCompletion(params) {
    return this._archiveEvent({
      ...params,
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      supersededByRevision: undefined
    });
  }

  /**
   * Archives a controlled reopen revision-created event.
   */
  async archiveEvaluationRevisionCreated(params) {
    const revisionNumber = params.oldRevisionNumber !== undefined ? params.oldRevisionNumber : params.revisionNumber;
    const supersededByRevision = params.newRevisionNumber !== undefined ? params.newRevisionNumber : params.supersededByRevision;

    return this._archiveEvent({
      ...params,
      revisionNumber,
      supersededByRevision,
      eventType: ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED
    });
  }

  /**
   * Archives a pre-change route reassignment event.
   */
  async archiveRouteReassignmentPrechange(params) {
    return this._archiveEvent({
      ...params,
      eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
      supersededByRevision: undefined
    });
  }

  /**
   * Core execution pipeline for immutable archive events.
   * @private
   */
  async _archiveEvent(params) {
    const {
      eventType,
      sourceRecordKey,
      employeeCode,
      fiscalYear,
      evaluationStage,
      revisionNumber,
      supersededByRevision,
      stableEventId,
      sourceRecordId,
      previousStatus,
      actor,
      reason: rawReason,
      archivedAt: explicitArchivedAt,
      logicalSnapshot
    } = params;

    // 1. Validate inputs and construct deterministic Archive_Key
    const archiveKey = buildArchiveKey({
      eventType,
      sourceRecordKey,
      evaluationStage,
      revisionNumber,
      supersededByRevision,
      stableEventId
    });

    const actorUserCode = resolveActorUserCode(actor);
    const reason = resolveReason(eventType, evaluationStage, rawReason);
    const archivedAt = resolveArchivedAt(explicitArchivedAt, this.clock);

    // 2. Validate snapshot coherence & compute deterministic hash
    validateSnapshotCoherence(logicalSnapshot, {
      sourceRecordKey,
      employeeCode,
      fiscalYear,
      evaluationStage,
      revisionNumber,
      sourceRecordId,
      previousStatus
    });

    const { canonicalJson, sha256 } = hashD3Snapshot(logicalSnapshot);

    const resolvedPreviousStatus = logicalSnapshot.stage?.Previous_Status !== undefined && logicalSnapshot.stage?.Previous_Status !== null
      ? String(logicalSnapshot.stage.Previous_Status)
      : (previousStatus ? String(previousStatus) : '');

    const resolvedSourceRecordId = (sourceRecordId !== undefined && sourceRecordId !== null)
      ? Number(sourceRecordId)
      : (logicalSnapshot.source?.Record_ID !== undefined && logicalSnapshot.source?.Record_ID !== null
          ? Number(logicalSnapshot.source.Record_ID)
          : null);

    const expectedFacts = {
      archiveKey,
      sourceRecordKey,
      fiscalYear,
      employeeCode,
      evaluationStage,
      revisionNumber: Number(revisionNumber),
      supersededByRevision: supersededByRevision ? Number(supersededByRevision) : null,
      eventType,
      reason,
      snapshotHash: sha256,
      snapshotJson: canonicalJson,
      actorUserCode,
      previousStatus: resolvedPreviousStatus,
      sourceRecordId: resolvedSourceRecordId,
      archivedAt
    };

    // 3. Check for existing record (Idempotency Contract)
    const existingRecords = await this.repository.findByArchiveKey(archiveKey);

    if (existingRecords.length > 1) {
      throw new RevisionArchiveError(
        'ARCHIVE_DUPLICATE_KEY_CORRUPTION',
        `Data corruption: multiple rows (${existingRecords.length}) exist in App 798 for Archive_Key: ${archiveKey}.`
      );
    }

    if (existingRecords.length === 1) {
      const existing = existingRecords[0];
      compareArchiveRecordToExpected(existing, expectedFacts, 'IDEMPOTENT_REPLAY');

      return this._buildVerifiedEvidence({
        archiveKey,
        eventType,
        snapshotHash: sha256,
        idempotentReplay: true,
        recovered: false,
        sourceRecordKey,
        employeeCode,
        fiscalYear,
        evaluationStage,
        revisionNumber: Number(revisionNumber),
        supersededByRevision: expectedFacts.supersededByRevision,
        sourceRecordId: resolvedSourceRecordId,
        archivedBy: actorUserCode,
        archivedAt: existing.archivedAt
      });
    }

    // 4. Record payload mapping
    const recordPayload = {
      Archive_Key: { value: archiveKey },
      Source_Record_Key: { value: sourceRecordKey },
      Fiscal_Year: { value: fiscalYear },
      Employee_Code: { value: employeeCode },
      Evaluation_Stage: { value: evaluationStage },
      Revision_Number: { value: String(revisionNumber) },
      Event_Type: { value: eventType },
      Reason: { value: reason },
      Snapshot_JSON: { value: canonicalJson },
      Snapshot_Hash: { value: sha256 },
      Archived_By: { value: [{ code: actorUserCode }] },
      Archived_At: { value: archivedAt }
    };

    if (resolvedSourceRecordId !== null) {
      recordPayload.Source_Record_ID = { value: String(resolvedSourceRecordId) };
    }
    if (resolvedPreviousStatus) {
      recordPayload.Previous_Status = { value: resolvedPreviousStatus };
    }
    if (expectedFacts.supersededByRevision !== null) {
      recordPayload.Superseded_By_Revision = { value: String(expectedFacts.supersededByRevision) };
    }

    // 5. Attempt creation with Uncertain Write Handling
    let createError = null;
    try {
      await this.repository.createArchiveRecord(recordPayload);
    } catch (err) {
      createError = err;
    }

    if (createError) {
      // Handle uncertain transport: check if the row was actually written
      const recoveryRecords = await this.repository.findByArchiveKey(archiveKey);
      if (recoveryRecords.length === 1) {
        const rec = recoveryRecords[0];
        compareArchiveRecordToExpected(rec, expectedFacts, 'UNCERTAIN_WRITE_RECOVERY');
        return this._buildVerifiedEvidence({
          archiveKey,
          eventType,
          snapshotHash: sha256,
          idempotentReplay: false,
          recovered: true,
          sourceRecordKey,
          employeeCode,
          fiscalYear,
          evaluationStage,
          revisionNumber: Number(revisionNumber),
          supersededByRevision: expectedFacts.supersededByRevision,
          sourceRecordId: resolvedSourceRecordId,
          archivedBy: actorUserCode,
          archivedAt: rec.archivedAt
        });
      }
      if (recoveryRecords.length > 1) {
        throw new RevisionArchiveError(
          'ARCHIVE_DUPLICATE_KEY_CORRUPTION',
          `Multiple rows found during uncertain write recovery for Archive_Key ${archiveKey}.`
        );
      }
      // Row not found; fail closed with uncertain classification
      throw new RevisionArchiveError(
        'ARCHIVE_TRANSPORT_UNCERTAIN',
        `Failed to create archive row and record not found on read-back: ${createError.message}`,
        createError
      );
    }

    // 6. Create + Read-back verification
    const readBack = await this.repository.readBackExactArchiveRecord(archiveKey);
    compareArchiveRecordToExpected(readBack, expectedFacts, 'POST_CREATE_READBACK');

    return this._buildVerifiedEvidence({
      archiveKey,
      eventType,
      snapshotHash: sha256,
      idempotentReplay: false,
      recovered: false,
      sourceRecordKey,
      employeeCode,
      fiscalYear,
      evaluationStage,
      revisionNumber: Number(revisionNumber),
      supersededByRevision: expectedFacts.supersededByRevision,
      sourceRecordId: resolvedSourceRecordId,
      archivedBy: actorUserCode,
      archivedAt
    });
  }

  _buildVerifiedEvidence(data) {
    const evidence = Object.freeze({
      verified: true,
      serviceVersion: 'D3_V1',
      ...data
    });
    issuedArchiveEvidence.add(evidence);
    return evidence;
  }

  /**
   * Pure verification helper to confirm an evidence object was produced by this service.
   * @param {object} evidence
   * @returns {boolean}
   */
  static validateArchiveEvidence(evidence) {
    if (!evidence || typeof evidence !== 'object') return false;
    if (!issuedArchiveEvidence.has(evidence)) return false;
    if (evidence.verified !== true) return false;
    if (evidence.serviceVersion !== 'D3_V1') return false;
    if (!evidence.archiveKey || typeof evidence.archiveKey !== 'string') return false;
    if (!evidence.snapshotHash || typeof evidence.snapshotHash !== 'string') return false;
    if (!Object.values(ARCHIVE_EVENT_TYPES).includes(evidence.eventType)) return false;
    if (!Object.values(ARCHIVE_EVALUATION_STAGES).includes(evidence.evaluationStage)) return false;
    return true;
  }

  /**
   * Archive-Before-Change gate helper.
   * Fails closed if evidence is missing, invalid, or does not match expected context.
   * Requires complete expected context binding the exact event instance.
   *
   * @param {object} evidence - Service-issued archive evidence object
   * @param {object} expectedContext - Full expected event context
   * @returns {boolean} true on verified gate pass
   */
  static assertArchiveBeforeChangeGate(evidence, expectedContext) {
    // 1. Evidence validity & unforgeable service-issued branding check
    if (!RevisionArchiveService.validateArchiveEvidence(evidence)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        'Operation blocked: required verified archive evidence was not provided or is invalid.'
      );
    }

    // 2. Expected context presence check
    if (!expectedContext || typeof expectedContext !== 'object') {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        'assertArchiveBeforeChangeGate requires a complete expectedContext object.'
      );
    }

    const {
      sourceRecordKey,
      evaluationStage,
      revisionNumber,
      eventType,
      archiveKey,
      snapshotHash,
      supersededByRevision,
      stableEventId,
      sourceRecordId,
      employeeCode,
      fiscalYear
    } = expectedContext;

    // Check base required fields
    if (!sourceRecordKey || typeof sourceRecordKey !== 'string' || !sourceRecordKey.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        'expectedContext.sourceRecordKey is required and must be a non-empty string.'
      );
    }

    if (!evaluationStage || !Object.values(ARCHIVE_EVALUATION_STAGES).includes(evaluationStage)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        `expectedContext.evaluationStage is required and must be one of: ${Object.values(ARCHIVE_EVALUATION_STAGES).join(', ')}.`
      );
    }

    if (revisionNumber === undefined || revisionNumber === null || revisionNumber === '' || !isStrictPositiveInteger(revisionNumber)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        `expectedContext.revisionNumber is required and must be a positive integer, received: ${revisionNumber}.`
      );
    }

    if (!eventType || !Object.values(ARCHIVE_EVENT_TYPES).includes(eventType)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        `expectedContext.eventType is required and must be one of: ${Object.values(ARCHIVE_EVENT_TYPES).join(', ')}.`
      );
    }

    if (!archiveKey || typeof archiveKey !== 'string' || !archiveKey.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        'expectedContext.archiveKey is required and must be a non-empty string.'
      );
    }

    const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;
    if (!snapshotHash || typeof snapshotHash !== 'string' || !SHA256_HEX_REGEX.test(snapshotHash.trim())) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
        'expectedContext.snapshotHash is required and must be a 64-character SHA-256 hex string.'
      );
    }

    // Event-specific required fields in expectedContext
    if (eventType === ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED) {
      if (supersededByRevision === undefined || supersededByRevision === null || supersededByRevision === '' || !isStrictPositiveInteger(supersededByRevision)) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
          'expectedContext.supersededByRevision is required and must be a positive integer for EVALUATION_REVISION_CREATED.'
        );
      }
      if (Number(supersededByRevision) <= Number(revisionNumber)) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
          `expectedContext.supersededByRevision (${supersededByRevision}) must be greater than revisionNumber (${revisionNumber}).`
        );
      }
    }

    if (eventType === ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE) {
      if (!stableEventId || typeof stableEventId !== 'string' || !stableEventId.trim()) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED',
          'expectedContext.stableEventId is required and must be a non-empty string for ROUTE_REASSIGNMENT_PRECHANGE.'
        );
      }
    }

    // 3. Re-derive canonical Archive_Key from expectedContext
    let derivedArchiveKey;
    try {
      derivedArchiveKey = buildArchiveKey({
        eventType,
        sourceRecordKey,
        evaluationStage,
        revisionNumber: Number(revisionNumber),
        supersededByRevision: supersededByRevision ? Number(supersededByRevision) : undefined,
        stableEventId
      });
    } catch (err) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Failed to canonically derive Archive_Key from expected context: ${err.message}`,
        err
      );
    }

    if (derivedArchiveKey !== archiveKey) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `expectedContext.archiveKey ("${archiveKey}") does not match canonically derived Archive_Key ("${derivedArchiveKey}").`
      );
    }

    if (derivedArchiveKey !== evidence.archiveKey) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Evidence archiveKey ("${evidence.archiveKey}") does not match canonically derived Archive_Key ("${derivedArchiveKey}").`
      );
    }

    // 4. Exact evidence field matching
    if (evidence.archiveKey !== archiveKey) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Evidence archiveKey ("${evidence.archiveKey}") does not match expectedContext.archiveKey ("${archiveKey}").`
      );
    }

    if (evidence.snapshotHash !== snapshotHash.trim()) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Evidence snapshotHash ("${evidence.snapshotHash}") does not match expected snapshotHash ("${snapshotHash}").`
      );
    }

    if (evidence.sourceRecordKey !== sourceRecordKey) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence sourceRecordKey (${evidence.sourceRecordKey}) does not match expected (${sourceRecordKey}).`
      );
    }

    if (evidence.evaluationStage !== evaluationStage) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence evaluationStage (${evidence.evaluationStage}) does not match expected (${evaluationStage}).`
      );
    }

    if (Number(evidence.revisionNumber) !== Number(revisionNumber)) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence revisionNumber (${evidence.revisionNumber}) does not match expected (${revisionNumber}).`
      );
    }

    if (evidence.eventType !== eventType) {
      throw new RevisionArchiveError(
        'ARCHIVE_GATE_EVIDENCE_INVALID',
        `Archive evidence eventType (${evidence.eventType}) does not match expected (${eventType}).`
      );
    }

    if (eventType === ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED) {
      if (Number(evidence.supersededByRevision) !== Number(supersededByRevision)) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EVIDENCE_INVALID',
          `Archive evidence supersededByRevision (${evidence.supersededByRevision}) does not match expected (${supersededByRevision}).`
        );
      }
    }

    if (sourceRecordId !== undefined && sourceRecordId !== null && sourceRecordId !== '') {
      if (!isStrictPositiveInteger(sourceRecordId)) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EVIDENCE_INVALID',
          `expectedContext.sourceRecordId must be a positive integer, received: ${sourceRecordId}.`
        );
      }
      if (evidence.sourceRecordId === null || evidence.sourceRecordId === undefined || Number(evidence.sourceRecordId) !== Number(sourceRecordId)) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EVIDENCE_INVALID',
          `Archive evidence sourceRecordId (${evidence.sourceRecordId}) does not match expected (${sourceRecordId}).`
        );
      }
    }

    if (employeeCode !== undefined && employeeCode !== null) {
      if (evidence.employeeCode !== employeeCode) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EVIDENCE_INVALID',
          `Archive evidence employeeCode (${evidence.employeeCode}) does not match expected (${employeeCode}).`
        );
      }
    }

    if (fiscalYear !== undefined && fiscalYear !== null) {
      if (evidence.fiscalYear !== fiscalYear) {
        throw new RevisionArchiveError(
          'ARCHIVE_GATE_EVIDENCE_INVALID',
          `Archive evidence fiscalYear (${evidence.fiscalYear}) does not match expected (${fiscalYear}).`
        );
      }
    }

    return true;
  }
}
