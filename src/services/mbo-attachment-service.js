/**
 * MBO Attachment Service
 * Handles Kintone browser file uploads via POST /k/v1/file.json and
 * Kintone-supported post-save REST attachment field binding via PUT /k/v1/record.json.
 * Kintone-only session context; no external storage or external service dependencies.
 */

export async function uploadKintoneFile(file, options = {}) {
  if (!file || typeof file !== 'object') {
    throw new Error('uploadKintoneFile failed: invalid file object');
  }

  const fetchFn = options.fetch || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    throw new Error('uploadKintoneFile failed: fetch API unavailable');
  }

  const getRequestTokenFn = options.getRequestToken || (globalThis.kintone?.getRequestToken ? () => globalThis.kintone.getRequestToken() : null);

  const formData = new FormData();
  let blobToUpload = file;
  if (typeof globalThis.Blob === 'function' && !(file instanceof globalThis.Blob)) {
    blobToUpload = new Blob([file.content || 'mock_file_content'], { type: file.type || 'application/octet-stream' });
  }
  formData.append('file', blobToUpload, file.name || 'attachment');

  const headers = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (getRequestTokenFn) {
    try {
      const token = getRequestTokenFn();
      if (token) headers['X-Cybozu-RequestToken'] = token;
    } catch (err) {
      // Non-browser or test environment fallback
    }
  }

  const uploadUrl = options.uploadUrl || '/k/v1/file.json';
  const response = await fetchFn(uploadUrl, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Kintone file upload failed: HTTP ${response.status}${errText ? ` (${errText})` : ''}`);
  }

  const data = await response.json();
  if (!data || !data.fileKey) {
    throw new Error('Kintone file upload response missing fileKey');
  }

  return data.fileKey;
}

/**
 * Prepares the attachment binding plan during app.record.create.submit / edit.submit.
 * Uploads pending local files to Kintone Upload File API (POST /k/v1/file.json) and receives fileKeys.
 * Uses explicit desiredSavedFiles map when provided, so saved-file removals are independent of submit event.record.
 *
 * CRITICAL KINTONE INVARIANT:
 * - Does NOT mutate event.record Attachment fields directly!
 * - Leaves event.record Attachment fields completely untouched during submit.
 * - Constructs and returns an attachment plan object mapping target field codes
 *   to their intended post-save REST update payload ({ value: [{ fileKey }, ...] }).
 */
export async function prepareAttachmentPlan(record, pendingAttachments = {}, options = {}) {
  if (!record || typeof record !== 'object') {
    throw new Error('prepareAttachmentPlan failed: invalid record object');
  }

  const plan = {};
  const desiredSavedFilesMap = options.desiredSavedFiles || {};
  const dirtyFieldsSet = new Set([
    ...Object.keys(pendingAttachments || {}),
    ...Object.keys(desiredSavedFilesMap),
    ...(options.dirtyFields || []),
    ...(options.removedFields || [])
  ]);

  const targetMap = new Map();

  // Phase 1: Canonical resolution & atomic persisted-state preflight validation (BEFORE any upload)
  for (const fieldCode of dirtyFieldsSet) {
    let targetCode = fieldCode;
    if (!record[targetCode] && targetCode.startsWith('Self_Attachment_')) {
      const altCode = 'Final_Attachment_' + targetCode.slice('Self_Attachment_'.length);
      if ((record && Object.prototype.hasOwnProperty.call(record, altCode)) ||
          (options.persistedRecord && Object.prototype.hasOwnProperty.call(options.persistedRecord, altCode)) ||
          (desiredSavedFilesMap[altCode] !== undefined)) {
        targetCode = altCode;
      }
    }

    if (options.isEdit) {
      if (!options.persistedRecord || typeof options.persistedRecord !== 'object') {
        throw new Error(`PERSISTED_RECORD_REQUIRED_FOR_EDIT: Missing or invalid persisted record for field ${targetCode}`);
      }
      if (desiredSavedFilesMap[fieldCode] === undefined && desiredSavedFilesMap[targetCode] === undefined) {
        const persistedField = options.persistedRecord[targetCode];
        if (!persistedField || !Array.isArray(persistedField.value)) {
          throw new Error(`PERSISTED_FIELD_MISSING_FOR_EDIT: Persisted record missing FILE field array for ${targetCode}`);
        }
      }
    }
    targetMap.set(fieldCode, targetCode);
  }

  // Phase 2: File uploads & plan construction (ONLY runs after Phase 1 preflight 100% passes)
  for (const fieldCode of dirtyFieldsSet) {
    const pendingItems = pendingAttachments[fieldCode] || [];
    const targetCode = targetMap.get(fieldCode) || fieldCode;

    let savedFiles;
    let modified = false;

    if (desiredSavedFilesMap[fieldCode] !== undefined) {
      savedFiles = Array.isArray(desiredSavedFilesMap[fieldCode]) ? [...desiredSavedFilesMap[fieldCode]] : [];
      modified = true;
    } else if (desiredSavedFilesMap[targetCode] !== undefined) {
      savedFiles = Array.isArray(desiredSavedFilesMap[targetCode]) ? [...desiredSavedFilesMap[targetCode]] : [];
      modified = true;
    } else {
      if (options.isEdit) {
        const persistedField = options.persistedRecord[targetCode];
        savedFiles = [...persistedField.value];
      } else {
        const sourceRecord = options.persistedRecord || record;
        const currentVal = sourceRecord[targetCode]?.value;
        savedFiles = Array.isArray(currentVal) ? [...currentVal] : [];
      }
      modified = Boolean(options.dirtyFields?.includes(fieldCode) || options.removedFields?.includes(fieldCode));
    }

    for (const item of pendingItems) {
      if (item.status === 'saved' && item.fileKey) {
        if (!savedFiles.some(f => f && f.fileKey === item.fileKey)) {
          savedFiles.push({ fileKey: item.fileKey, name: item.name });
          modified = true;
        }
        continue;
      }

      if (item.file) {
        item.status = 'uploading';
        try {
          const fileKey = await uploadKintoneFile(item.file, options);
          item.fileKey = fileKey;
          item.status = 'saved';
          savedFiles.push({ fileKey, name: item.name });
          modified = true;
        } catch (err) {
          item.status = 'error';
          item.error = err.message;
          throw new Error(`Attachment upload failed for field ${fieldCode} (${item.name}): ${err.message}`);
        }
      }
    }

    if (pendingItems.length > 0 || modified) {
      plan[targetCode] = {
        value: savedFiles.filter(f => Boolean(f && f.fileKey)).map(f => ({ fileKey: f.fileKey }))
      };
    }
  }

  return plan;
}

/**
 * Finalizes attachment field binding via Kintone Update Record REST API (PUT /k/v1/record.json).
 * Executed in app.record.create.submit.success / app.record.edit.submit.success.
 */
export async function finalizeAttachmentPlan(appId, recordId, plan, options = {}) {
  if (!appId || !recordId) {
    throw new Error('finalizeAttachmentPlan failed: missing appId or recordId');
  }

  if (!plan || typeof plan !== 'object' || Object.keys(plan).length === 0) {
    return { updated: false };
  }

  const payload = {
    app: Number(appId),
    id: String(recordId),
    record: plan
  };

  const updateRecordFn = options.updateRecord || (async (reqPayload) => {
    const fetchFn = options.fetch || globalThis.fetch;
    if (typeof fetchFn === 'function') {
      const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
      if (globalThis.kintone?.getRequestToken) {
        try {
          const token = globalThis.kintone.getRequestToken();
          if (token) headers['X-Cybozu-RequestToken'] = token;
        } catch (err) {
          // Fallback
        }
      }
      const res = await fetchFn('/k/v1/record.json', {
        method: 'PUT',
        headers,
        body: JSON.stringify(reqPayload)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Kintone Update Record REST API failed: HTTP ${res.status}${text ? ` (${text})` : ''}`);
      }
      return await res.json();
    }

    if (globalThis.kintone?.api && globalThis.kintone?.api?.url) {
      const url = globalThis.kintone.api.url('/k/v1/record.json', true);
      return await globalThis.kintone.api(url, 'PUT', reqPayload);
    }

    throw new Error('updateRecord failed: fetch or kintone.api unavailable');
  });

  const resData = await updateRecordFn(payload);
  return { updated: true, response: resData };
}

/**
 * Uploads pending attachments for a record and binds fileKeys to exact Kintone FILE fields.
 * Wraps prepareAttachmentPlan and finalizeAttachmentPlan when recordId is provided.
 */
export async function uploadAndBindPendingAttachments(record, pendingAttachments = {}, options = {}) {
  const plan = await prepareAttachmentPlan(record, pendingAttachments, options);
  const recordId = options.recordId || record?.$id?.value;
  if (recordId) {
    const appId = options.appId || 794;
    await finalizeAttachmentPlan(appId, recordId, plan, options);
  }
  return plan;
}
