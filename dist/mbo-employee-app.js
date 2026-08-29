(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/services/mbo-attachment-service.js
  var mbo_attachment_service_exports = {};
  __export(mbo_attachment_service_exports, {
    downloadKintoneFileBlob: () => downloadKintoneFileBlob,
    finalizeAttachmentPlan: () => finalizeAttachmentPlan,
    prepareAttachmentPlan: () => prepareAttachmentPlan,
    uploadAndBindPendingAttachments: () => uploadAndBindPendingAttachments,
    uploadKintoneFile: () => uploadKintoneFile
  });
  async function uploadKintoneFile(file, options = {}) {
    if (!file || typeof file !== "object") {
      throw new Error("uploadKintoneFile failed: invalid file object");
    }
    const fetchFn = options.fetch || globalThis.fetch;
    if (typeof fetchFn !== "function") {
      throw new Error("uploadKintoneFile failed: fetch API unavailable");
    }
    const getRequestTokenFn = options.getRequestToken || (globalThis.kintone?.getRequestToken ? () => globalThis.kintone.getRequestToken() : null);
    const formData = new FormData();
    let blobToUpload = file;
    if (typeof globalThis.Blob === "function" && !(file instanceof globalThis.Blob)) {
      blobToUpload = new Blob([file.content || "mock_file_content"], { type: file.type || "application/octet-stream" });
    }
    formData.append("file", blobToUpload, file.name || "attachment");
    const headers = {
      "X-Requested-With": "XMLHttpRequest"
    };
    if (getRequestTokenFn) {
      try {
        const token = getRequestTokenFn();
        if (token) headers["X-Cybozu-RequestToken"] = token;
      } catch (err) {
      }
    }
    const uploadUrl = options.uploadUrl || "/k/v1/file.json";
    const response = await fetchFn(uploadUrl, {
      method: "POST",
      headers,
      body: formData
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Kintone file upload failed: HTTP ${response.status}${errText ? ` (${errText})` : ""}`);
    }
    const data = await response.json();
    if (!data || !data.fileKey) {
      throw new Error("Kintone file upload response missing fileKey");
    }
    return data.fileKey;
  }
  async function prepareAttachmentPlan(record, pendingAttachments = {}, options = {}) {
    if (!record || typeof record !== "object") {
      throw new Error("prepareAttachmentPlan failed: invalid record object");
    }
    const plan = {};
    const desiredSavedFilesMap = options.desiredSavedFiles || {};
    const dirtyFieldsSet = /* @__PURE__ */ new Set([
      ...Object.keys(pendingAttachments || {}),
      ...Object.keys(desiredSavedFilesMap),
      ...options.dirtyFields || [],
      ...options.removedFields || []
    ]);
    const targetMap = /* @__PURE__ */ new Map();
    for (const fieldCode of dirtyFieldsSet) {
      let targetCode = fieldCode;
      if (!record[targetCode] && targetCode.startsWith("Self_Attachment_")) {
        const altCode = "Final_Attachment_" + targetCode.slice("Self_Attachment_".length);
        if (record && Object.prototype.hasOwnProperty.call(record, altCode) || options.persistedRecord && Object.prototype.hasOwnProperty.call(options.persistedRecord, altCode) || desiredSavedFilesMap[altCode] !== void 0) {
          targetCode = altCode;
        }
      }
      if (options.isEdit) {
        if (!options.persistedRecord || typeof options.persistedRecord !== "object") {
          throw new Error(`PERSISTED_RECORD_REQUIRED_FOR_EDIT: Missing or invalid persisted record for field ${targetCode}`);
        }
        if (desiredSavedFilesMap[fieldCode] === void 0 && desiredSavedFilesMap[targetCode] === void 0) {
          const persistedField = options.persistedRecord[targetCode];
          if (!persistedField || !Array.isArray(persistedField.value)) {
            throw new Error(`PERSISTED_FIELD_MISSING_FOR_EDIT: Persisted record missing FILE field array for ${targetCode}`);
          }
        }
      }
      targetMap.set(fieldCode, targetCode);
    }
    for (const fieldCode of dirtyFieldsSet) {
      const pendingItems = pendingAttachments[fieldCode] || [];
      const targetCode = targetMap.get(fieldCode) || fieldCode;
      let savedFiles;
      let modified = false;
      if (desiredSavedFilesMap[fieldCode] !== void 0) {
        savedFiles = Array.isArray(desiredSavedFilesMap[fieldCode]) ? [...desiredSavedFilesMap[fieldCode]] : [];
        modified = true;
      } else if (desiredSavedFilesMap[targetCode] !== void 0) {
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
        if (item.status === "saved" && item.fileKey) {
          if (!savedFiles.some((f) => f && f.fileKey === item.fileKey)) {
            savedFiles.push({ fileKey: item.fileKey, name: item.name });
            modified = true;
          }
          continue;
        }
        if (item.file) {
          item.status = "uploading";
          try {
            const fileKey = await uploadKintoneFile(item.file, options);
            item.fileKey = fileKey;
            item.status = "saved";
            savedFiles.push({ fileKey, name: item.name });
            modified = true;
          } catch (err) {
            item.status = "error";
            item.error = err.message;
            throw new Error(`Attachment upload failed for field ${fieldCode} (${item.name}): ${err.message}`);
          }
        }
      }
      if (pendingItems.length > 0 || modified) {
        plan[targetCode] = {
          value: savedFiles.filter((f) => Boolean(f && f.fileKey)).map((f) => ({ fileKey: f.fileKey }))
        };
      }
    }
    return plan;
  }
  async function finalizeAttachmentPlan(appId, recordId, plan, options = {}) {
    if (!appId || !recordId) {
      throw new Error("finalizeAttachmentPlan failed: missing appId or recordId");
    }
    if (!plan || typeof plan !== "object" || Object.keys(plan).length === 0) {
      return { updated: false };
    }
    const payload = {
      app: Number(appId),
      id: String(recordId),
      record: plan
    };
    const updateRecordFn = options.updateRecord || (async (reqPayload) => {
      const fetchFn = options.fetch || globalThis.fetch;
      if (typeof fetchFn === "function") {
        const headers = {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        };
        if (globalThis.kintone?.getRequestToken) {
          try {
            const token = globalThis.kintone.getRequestToken();
            if (token) headers["X-Cybozu-RequestToken"] = token;
          } catch (err) {
          }
        }
        const res = await fetchFn("/k/v1/record.json", {
          method: "PUT",
          headers,
          body: JSON.stringify(reqPayload)
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Kintone Update Record REST API failed: HTTP ${res.status}${text ? ` (${text})` : ""}`);
        }
        return await res.json();
      }
      if (globalThis.kintone?.api && globalThis.kintone?.api?.url) {
        const url = globalThis.kintone.api.url("/k/v1/record.json", true);
        return await globalThis.kintone.api(url, "PUT", reqPayload);
      }
      throw new Error("updateRecord failed: fetch or kintone.api unavailable");
    });
    const resData = await updateRecordFn(payload);
    return { updated: true, response: resData };
  }
  async function uploadAndBindPendingAttachments(record, pendingAttachments = {}, options = {}) {
    const plan = await prepareAttachmentPlan(record, pendingAttachments, options);
    const recordId = options.recordId || record?.$id?.value;
    if (recordId) {
      const appId = options.appId || 794;
      await finalizeAttachmentPlan(appId, recordId, plan, options);
    }
    return plan;
  }
  async function downloadKintoneFileBlob(fileKey, options = {}) {
    if (!fileKey || typeof fileKey !== "string" || fileKey.trim() === "" || fileKey === "undefined" || fileKey === "null") {
      throw new Error("downloadKintoneFileBlob failed: valid fileKey is required");
    }
    const fetchFn = options.fetchFn || options.fetch || globalThis.fetch;
    if (typeof fetchFn !== "function") {
      throw new Error("downloadKintoneFileBlob failed: fetch API unavailable");
    }
    let downloadUrl = `/k/v1/file.json?fileKey=${encodeURIComponent(fileKey)}`;
    if (globalThis.kintone?.api?.urlForGet) {
      try {
        downloadUrl = globalThis.kintone.api.urlForGet("/k/v1/file.json", { fileKey }, true);
      } catch (err) {
      }
    }
    const headers = {
      "X-Requested-With": "XMLHttpRequest"
    };
    const response = await fetchFn(downloadUrl, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Kintone file download failed: HTTP ${response.status}${errText ? ` (${errText})` : ""}`);
    }
    return await response.blob();
  }
  var init_mbo_attachment_service = __esm({
    "src/services/mbo-attachment-service.js"() {
    }
  });

  // src/config/constants.js
  var BUSINESS_STAGES = {
    NEW_RECORD: "NEW_RECORD",
    OBJECTIVE_INPUT: "OBJECTIVE_INPUT",
    MIDYEAR_INPUT: "MIDYEAR_INPUT",
    SELF_EVALUATION: "SELF_EVALUATION",
    READ_ONLY: "READ_ONLY",
    CONFIGURATION_ERROR: "CONFIGURATION_ERROR"
  };
  var STATUS_TO_STAGE_MAP = {
    "01 Draft Objective": BUSINESS_STAGES.OBJECTIVE_INPUT,
    "02 First Manager Objective Review": BUSINESS_STAGES.READ_ONLY,
    "03 Manager Objective Review": BUSINESS_STAGES.READ_ONLY,
    "04 GM Objective Review": BUSINESS_STAGES.READ_ONLY,
    "05 Objective Approved": BUSINESS_STAGES.READ_ONLY,
    "06 Employee Mid-Year": BUSINESS_STAGES.MIDYEAR_INPUT,
    "07 First Manager Mid-Year Review": BUSINESS_STAGES.READ_ONLY,
    "08 Manager Mid-Year Review": BUSINESS_STAGES.READ_ONLY,
    "09 GM Mid-Year Review": BUSINESS_STAGES.READ_ONLY,
    "10 Mid-Year Completed": BUSINESS_STAGES.READ_ONLY,
    "11 Employee Self Evaluation": BUSINESS_STAGES.SELF_EVALUATION,
    "12 First Manager Final Evaluation": BUSINESS_STAGES.READ_ONLY,
    "13 Manager Final Evaluation": BUSINESS_STAGES.READ_ONLY,
    "14 GM Final Evaluation": BUSINESS_STAGES.READ_ONLY,
    "15 HR Final Check": BUSINESS_STAGES.READ_ONLY,
    "16 Completed": BUSINESS_STAGES.READ_ONLY
  };
  function buildRecordKey(fiscalYear, employeeCode) {
    const fy = String(fiscalYear || "").trim();
    const emp = String(employeeCode || "").trim();
    if (!fy || !emp) {
      return "";
    }
    return `${fy}-${emp}`;
  }

  // src/ui/host-resolver.js
  function getRecordUiHost(preferredSpaceId = "SPACE_HEADER") {
    if (typeof kintone === "undefined" || !kintone.app || !kintone.app.record) {
      return null;
    }
    if (typeof kintone.app.record.getSpaceElement === "function") {
      const spaceEl = kintone.app.record.getSpaceElement(preferredSpaceId);
      if (spaceEl) return spaceEl;
      const fallbackSpaceIds = ["SPACE_HEADER", "SPACE_MBO_ROOT", "SPACE_PART_A"];
      for (const id of fallbackSpaceIds) {
        if (id !== preferredSpaceId) {
          const el = kintone.app.record.getSpaceElement(id);
          if (el) return el;
        }
      }
    }
    if (typeof kintone.app.record.getHeaderMenuSpaceElement === "function") {
      const menuEl = kintone.app.record.getHeaderMenuSpaceElement();
      if (menuEl) return menuEl;
    }
    return null;
  }

  // src/validation/validation-engine.js
  var ValidationEngine = class {
    /**
     * Validate record against stage business rules
     * @param {Object} record Kintone record object
     * @param {string} stage Current business stage
     * @returns {Object} { isValid: boolean, fieldErrors: Array<{field: string, messageTH: string, messageEN: string, message: string}>, errors: string[] }
     */
    static validate(record, stage) {
      const fieldErrors = [];
      if (!record) {
        fieldErrors.push({
          field: "RECORD",
          messageTH: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Record",
          messageEN: "Record data not found",
          message: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Record\nRecord data not found"
        });
        return this._formatResult(fieldErrors);
      }
      if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
        fieldErrors.push({
          field: "SYSTEM",
          messageTH: "\u0E23\u0E30\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E30\u0E1A\u0E38\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (SYSTEM CONFIGURATION ERROR)",
          messageEN: "Unable to identify workflow stage. Please contact HR / Administrator.",
          message: "\u0E23\u0E30\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E30\u0E1A\u0E38\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (SYSTEM CONFIGURATION ERROR)\nUnable to identify workflow stage. Please contact HR / Administrator."
        });
        return this._formatResult(fieldErrors);
      }
      if (stage === BUSINESS_STAGES.READ_ONLY) {
        return this._formatResult([]);
      }
      const empCode = this._val(record.Employee_Code);
      if (!empCode) {
        fieldErrors.push({
          field: "Employee_Code",
          messageTH: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32",
          messageEN: "Please enter Employee Code and search",
          message: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\nPlease enter Employee Code and search"
        });
      }
      const empName = this._val(record.Employee_Name);
      if (!empName) {
        fieldErrors.push({
          field: "Employee_Code",
          messageTH: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E41\u0E25\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01",
          messageEN: "Please search and verify employee profile before saving",
          message: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E41\u0E25\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\nPlease search and verify employee profile before saving"
        });
      }
      const fy = this._val(record.Fiscal_Year);
      if (!fy) {
        fieldErrors.push({
          field: "Fiscal_Year",
          messageTH: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (Fiscal Year)",
          messageEN: "Please enter Fiscal Year",
          message: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (Fiscal Year)\nPlease enter Fiscal Year"
        });
      }
      const objCount = parseInt(this._val(record.Objective_Count) || "4", 10);
      if (isNaN(objCount) || objCount < 2 || objCount > 10) {
        fieldErrors.push({
          field: "Objective_Count",
          messageTH: "\u0E08\u0E33\u0E19\u0E27\u0E19 Objective \u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07 2 \u0E16\u0E36\u0E07 10 \u0E02\u0E49\u0E2D",
          messageEN: "Objective Count must be between 2 and 10",
          message: "\u0E08\u0E33\u0E19\u0E27\u0E19 Objective \u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07 2 \u0E16\u0E36\u0E07 10 \u0E02\u0E49\u0E2D\nObjective Count must be between 2 and 10"
        });
        return this._formatResult(fieldErrors);
      }
      if (stage === BUSINESS_STAGES.OBJECTIVE_INPUT || stage === BUSINESS_STAGES.NEW_RECORD) {
        const profileCode = this._val(record.Profile_Code);
        if (!profileCode) {
          fieldErrors.push({
            field: "Employee_Code",
            messageTH: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Profile Code \u0E02\u0E2D\u0E07\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E25\u0E38\u0E48\u0E21\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19",
            messageEN: "Employee scoring profile code was not found. Please search to resolve profile.",
            message: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Profile Code \u0E02\u0E2D\u0E07\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E25\u0E38\u0E48\u0E21\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\nEmployee scoring profile code was not found. Please search to resolve profile."
          });
        }
        const routingTopo = this._val(record.Routing_Topology);
        const requesterUserVal = record.Requester_User?.value;
        const hasRequester = Array.isArray(requesterUserVal) && requesterUserVal.length > 0;
        if (!routingTopo || !hasRequester) {
          fieldErrors.push({
            field: "Employee_Code",
            messageTH: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing \u0E02\u0E2D\u0E07\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34",
            messageEN: "Employee routing workflow was not found. Please search to resolve routing.",
            message: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing \u0E02\u0E2D\u0E07\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\nEmployee routing workflow was not found. Please search to resolve routing."
          });
        }
        this.clearInactiveRows(record);
        let totalWeight = 0;
        for (let i = 1; i <= objCount; i++) {
          const obj = this._val(record[`Objective_${i}`]);
          const plan = this._val(record[`Action_Plan_${i}`]);
          const weightVal = this._val(record[`Weight_${i}`]);
          const weight = parseFloat(weightVal || "0");
          const diffVal = this._val(record[`Difficulty_${i}`]);
          const diff = parseInt(diffVal, 10);
          if (!obj) {
            fieldErrors.push({
              field: `Objective_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i}`,
              messageEN: `Please enter Objective ${i}`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i}
Please enter Objective ${i}`
            });
          }
          if (!plan) {
            fieldErrors.push({
              field: `Action_Plan_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E41\u0E1C\u0E19\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i}`,
              messageEN: `Please enter Action Plan ${i}`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E41\u0E1C\u0E19\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i}
Please enter Action Plan ${i}`
            });
          }
          if (!weightVal || isNaN(weight) || weight <= 0 || weight > 100) {
            fieldErrors.push({
              field: `Weight_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (1 - 100%)`,
              messageEN: `Please enter Weight ${i} (1 - 100%)`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (1 - 100%)
Please enter Weight ${i} (1 - 100%)`
            });
          } else {
            totalWeight += weight;
          }
          if (!diffVal || isNaN(diff) || diff < 1 || diff > 4) {
            fieldErrors.push({
              field: `Difficulty_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (1 - 4)`,
              messageEN: `Please select Difficulty Level ${i} (1 - 4)`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (1 - 4)
Please select Difficulty Level ${i} (1 - 4)`
            });
          }
        }
        if (Math.round(totalWeight) !== 100) {
          fieldErrors.push({
            field: "Total_Weight",
            messageTH: `\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A 100% (\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19\u0E44\u0E14\u0E49 ${totalWeight}%)`,
            messageEN: `Total Weight must equal 100% (Currently ${totalWeight}%)`,
            message: `\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A 100% (\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19\u0E44\u0E14\u0E49 ${totalWeight}%)
Total Weight must equal 100% (Currently ${totalWeight}%)`
          });
        }
      }
      if (stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
        for (let i = 1; i <= objCount; i++) {
          const progVal = this._val(record[`Progress_Percent_${i}`]);
          const prog = parseFloat(progVal || "0");
          if (progVal === "" || isNaN(prog) || prog < 0 || prog > 100) {
            fieldErrors.push({
              field: `Progress_Percent_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32 % \u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (0 - 100%)`,
              messageEN: `Please enter Progress % ${i} (0 - 100%)`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32 % \u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (0 - 100%)
Please enter Progress % ${i} (0 - 100%)`
            });
          }
        }
      }
      if (stage === BUSINESS_STAGES.SELF_EVALUATION) {
        for (let i = 1; i <= objCount; i++) {
          const actual = this._val(record[`Actual_Result_${i}`]);
          const achVal = this._val(record[`Self_Achievement_${i}`]);
          const ach = parseInt(achVal, 10);
          if (!actual) {
            fieldErrors.push({
              field: `Actual_Result_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i}`,
              messageEN: `Please enter Actual Result ${i}`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i}
Please enter Actual Result ${i}`
            });
          }
          if (!achVal || isNaN(ach) || ach < 1 || ach > 5) {
            fieldErrors.push({
              field: `Self_Achievement_${i}`,
              messageTH: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E1C\u0E25\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (1 - 5)`,
              messageEN: `Please select Self Achievement ${i} (1 - 5)`,
              message: `\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E1C\u0E25\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48 ${i} (1 - 5)
Please select Self Achievement ${i} (1 - 5)`
            });
          }
        }
      }
      return this._formatResult(fieldErrors);
    }
    static _formatResult(fieldErrors) {
      return {
        isValid: fieldErrors.length === 0,
        fieldErrors,
        errors: fieldErrors.map((e) => e.message)
      };
    }
    static clearInactiveRows(record) {
      if (!record) return;
      const objCount = parseInt(this._val(record.Objective_Count) || "4", 10);
      if (isNaN(objCount) || objCount < 2 || objCount > 10) return;
      for (let i = objCount + 1; i <= 10; i++) {
        const rowFields = [
          `Objective_${i}`,
          `Action_Plan_${i}`,
          `Weight_${i}`,
          `Difficulty_${i}`,
          `Progress_Percent_${i}`,
          `Actual_Result_${i}`,
          `Self_Achievement_${i}`,
          `Midyear_Comment_${i}`,
          `Appraiser_Achievement_${i}`,
          `Appraiser_Comment_${i}`
        ];
        rowFields.forEach((f) => {
          if (record[f]) {
            if (typeof record[f] === "object" && "value" in record[f]) {
              record[f].value = "";
            } else {
              record[f] = "";
            }
          }
        });
      }
    }
    /**
     * Validate workflow action against record topology and assigned user fields
     * @param {Object} record Kintone record object
     * @param {string} actionName Name of process action (event.action?.value)
     * @param {string} stage Resolved business stage from STATUS_TO_STAGE_MAP
     * @returns {Object} { isValid: boolean, fieldErrors: Array, errors: string[] }
     */
    static validateWorkflowAction(record, actionName, stage) {
      const fieldErrors = [];
      if (!record) {
        fieldErrors.push({
          field: "RECORD",
          messageTH: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Record",
          messageEN: "Record data not found",
          message: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Record\nRecord data not found"
        });
        return this._formatResult(fieldErrors);
      }
      if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
        fieldErrors.push({
          field: "Status",
          messageTH: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E30\u0E1A\u0E1A (CONFIGURATION_ERROR)",
          messageEN: "Workflow status is invalid or unmapped (CONFIGURATION_ERROR)",
          message: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E30\u0E1A\u0E1A (CONFIGURATION_ERROR)\nWorkflow status is invalid or unmapped (CONFIGURATION_ERROR)"
        });
        return this._formatResult(fieldErrors);
      }
      const topology = this._val(record.Routing_Topology);
      const status = this._val(record.Status);
      const RECOGNIZED_TOPOLOGIES = ["M1_G1", "M1_M2_G1", "M1_G1_G2", "M1_M2_G1_G2", "M1_ONLY"];
      if (!topology || !RECOGNIZED_TOPOLOGIES.includes(topology)) {
        fieldErrors.push({
          field: "Routing_Topology",
          messageTH: `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 "${topology || "BLANK"}" \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E30\u0E1A\u0E38 (UNKNOWN TOPOLOGY FAIL-CLOSED)`,
          messageEN: `Routing topology "${topology || "BLANK"}" is invalid or unmapped.`,
          message: `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 "${topology || "BLANK"}" \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E30\u0E1A\u0E38 (UNKNOWN TOPOLOGY FAIL-CLOSED)
Routing topology "${topology || "BLANK"}" is invalid or unmapped.`
        });
        return this._formatResult(fieldErrors);
      }
      if (topology.includes("G2")) {
        fieldErrors.push({
          field: "Routing_Topology",
          messageTH: `\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A ${topology} \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (G2 UNSUPPORTED CONFIGURATION ERROR)`,
          messageEN: `Routing topology ${topology} is not supported by current Process Management workflow.`,
          message: `\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A ${topology} \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (G2 UNSUPPORTED CONFIGURATION ERROR)
Routing topology ${topology} is not supported by current Process Management workflow.`
        });
        return this._formatResult(fieldErrors);
      }
      const firstMgrStates = [
        "02 First Manager Objective Review",
        "07 First Manager Mid-Year Review",
        "12 First Manager Final Evaluation"
      ];
      if (firstMgrStates.includes(status) && !topology.includes("M2")) {
        fieldErrors.push({
          field: "Status",
          messageTH: `\u0E2A\u0E16\u0E32\u0E19\u0E30 ${status} \u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E17\u0E35\u0E48\u0E21\u0E35 First Manager (M2 Topology) \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19`,
          messageEN: `Status ${status} is valid only for topologies containing First Manager (M2).`,
          message: `\u0E2A\u0E16\u0E32\u0E19\u0E30 ${status} \u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E17\u0E35\u0E48\u0E21\u0E35 First Manager (M2 Topology) \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19
Status ${status} is valid only for topologies containing First Manager (M2).`
        });
        return this._formatResult(fieldErrors);
      }
      const firstManagerSubmits = [
        "Submit Objective to First Manager",
        "Submit Mid-Year to First Manager",
        "Submit Final to First Manager"
      ];
      const directManagerSubmits = [
        "Submit Objective to Manager",
        "Submit Mid-Year to Manager",
        "Submit Final to Manager"
      ];
      const hasFirstManager = Array.isArray(record.First_Manager_User?.value) && record.First_Manager_User.value.length > 0;
      const hasManager = Array.isArray(record.Manager_User?.value) && record.Manager_User.value.length > 0;
      const hasGM = Array.isArray(record.GM_User?.value) && record.GM_User.value.length > 0;
      const hasRequester = Array.isArray(record.Requester_User?.value) && record.Requester_User.value.length > 0;
      if (firstManagerSubmits.includes(actionName)) {
        if (!topology.includes("M2")) {
          fieldErrors.push({
            field: "Routing_Topology",
            messageTH: `\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19 First Manager (${actionName}) \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E01\u0E31\u0E1A\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 ${topology || "Direct Manager"}`,
            messageEN: `Action "${actionName}" is not allowed for topology ${topology || "Direct Manager"}.`,
            message: `\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19 First Manager (${actionName}) \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E01\u0E31\u0E1A\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 ${topology || "Direct Manager"}
Action "${actionName}" is not allowed for topology ${topology || "Direct Manager"}.`
          });
        } else if (!hasFirstManager) {
          fieldErrors.push({
            field: "First_Manager_User",
            messageTH: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 First_Manager_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 (${actionName})`,
            messageEN: `First_Manager_User is empty for action "${actionName}".`,
            message: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 First_Manager_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 (${actionName})
First_Manager_User is empty for action "${actionName}".`
          });
        }
      }
      if (directManagerSubmits.includes(actionName)) {
        if (topology.includes("M2")) {
          fieldErrors.push({
            field: "Routing_Topology",
            messageTH: `\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 ${topology} \u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19 First Manager \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19`,
            messageEN: `Action "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`,
            message: `\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 ${topology} \u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19 First Manager \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19
Action "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`
          });
        } else if (!hasManager) {
          fieldErrors.push({
            field: "Manager_User",
            messageTH: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 Manager_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 (${actionName})`,
            messageEN: `Manager_User is empty for action "${actionName}".`,
            message: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 Manager_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 (${actionName})
Manager_User is empty for action "${actionName}".`
          });
        }
      }
      const managerHandoverActions = [
        "Approve Objective",
        // from 02 to 03
        "Approve Mid-Year First Manager",
        // from 07 to 08
        "Approve Final First Manager"
        // from 12 to 13
      ];
      if (managerHandoverActions.includes(actionName) && (status.startsWith("02") || status.startsWith("07") || status.startsWith("12"))) {
        if (!hasManager) {
          fieldErrors.push({
            field: "Manager_User",
            messageTH: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 Manager_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E43\u0E19\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B`,
            messageEN: `Manager_User is empty for action "${actionName}".`,
            message: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 Manager_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E43\u0E19\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B
Manager_User is empty for action "${actionName}".`
          });
        }
      }
      const gmHandoverActions = [
        "Approve Objective",
        // from 03 to 04
        "Approve Mid-Year Manager",
        // from 08 to 09
        "Approve Final Manager"
        // from 13 to 14
      ];
      if (gmHandoverActions.includes(actionName) && (status.startsWith("03") || status.startsWith("08") || status.startsWith("13"))) {
        if (topology !== "M1_ONLY" && !hasGM) {
          fieldErrors.push({
            field: "GM_User",
            messageTH: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 GM_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E43\u0E19\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B`,
            messageEN: `GM_User is empty for action "${actionName}".`,
            message: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 GM_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E43\u0E19\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B
GM_User is empty for action "${actionName}".`
          });
        }
      }
      const returnActions = [
        "Return Objective",
        "Return Mid-Year First Manager",
        "Return Mid-Year Manager",
        "Return Mid-Year GM",
        "Return Final First Manager",
        "Return Final Manager",
        "Return Final GM",
        "Return Final HR"
      ];
      const isRequesterHandoffAction = status.startsWith("04") && actionName === "Approve Objective" || status.startsWith("05") && actionName === "Start Mid-Year" || status.startsWith("09") && actionName === "Approve Mid-Year GM" || status.startsWith("10") && actionName === "Start Self Evaluation" || returnActions.includes(actionName);
      if (isRequesterHandoffAction && !hasRequester) {
        fieldErrors.push({
          field: "Requester_User",
          messageTH: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E02\u0E2D\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 Requester_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E07\u0E32\u0E19 (${actionName})`,
          messageEN: `Requester_User is empty for action "${actionName}".`,
          message: `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E02\u0E2D\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 Requester_User \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E07\u0E32\u0E19 (${actionName})
Requester_User is empty for action "${actionName}".`
        });
      }
      return this._formatResult(fieldErrors);
    }
    static _val(field) {
      if (field === null || field === void 0) return "";
      if (typeof field === "object" && "value" in field) {
        return field.value !== null && field.value !== void 0 ? String(field.value).trim() : "";
      }
      return String(field).trim();
    }
  };

  // src/ui/employee-visibility.js
  function extractUserCodes(fieldVal) {
    if (!fieldVal) return [];
    const processVal = (item) => {
      if (!item) return null;
      if (typeof item === "string") return item.trim().toLowerCase();
      if (typeof item === "object") {
        if (typeof item.code === "string") return item.code.trim().toLowerCase();
        if (typeof item.value === "string") return item.value.trim().toLowerCase();
      }
      return null;
    };
    let rawList = [];
    if (Array.isArray(fieldVal)) {
      rawList = fieldVal;
    } else if (typeof fieldVal === "object") {
      if (Array.isArray(fieldVal.value)) {
        rawList = fieldVal.value;
      } else {
        rawList = [fieldVal];
      }
    } else {
      rawList = [fieldVal];
    }
    const codes = [];
    for (const entry of rawList) {
      const code = processVal(entry);
      if (code && !codes.includes(code)) {
        codes.push(code);
      }
    }
    return codes;
  }
  function resolveIdentityViewerRole(record, loginUserCode, options = {}) {
    const isPreviewMode = Boolean(options.isPreviewMode || options.previewOptions?.isPreviewMode);
    const rawRole = options.previewOptions?.viewerRole || options.viewerRole;
    if (isPreviewMode && rawRole && ["employee", "appraiser", "hr"].includes(String(rawRole).toLowerCase())) {
      return String(rawRole).toUpperCase();
    }
    if (!loginUserCode || typeof loginUserCode !== "string" || !loginUserCode.trim()) {
      return "RESTRICTED";
    }
    const cleanLoginCode = loginUserCode.trim().toLowerCase();
    if (!record) {
      return "RESTRICTED";
    }
    const requesterCodes = extractUserCodes(record.Requester_User);
    const isRequester = requesterCodes.includes(cleanLoginCode);
    const appraiserCodes = [
      ...extractUserCodes(record.First_Manager_User),
      ...extractUserCodes(record.Manager_User),
      ...extractUserCodes(record.GM_User),
      ...extractUserCodes(record.Manager_Level1_Approvers),
      ...extractUserCodes(record.Manager_Level2_Approvers),
      ...extractUserCodes(record.GM_Level1_Approvers),
      ...extractUserCodes(record.GM_Level2_Approvers)
    ];
    const isAppraiser = appraiserCodes.includes(cleanLoginCode);
    const hrCodes = [
      ...extractUserCodes(record.HR_User),
      ...extractUserCodes(options.hrUserList)
    ];
    const isHR = hrCodes.includes(cleanLoginCode);
    const matchedRoles = [];
    if (isRequester) matchedRoles.push("EMPLOYEE");
    if (isAppraiser) matchedRoles.push("APPRAISER");
    if (isHR) matchedRoles.push("HR");
    if (matchedRoles.length === 1) {
      return matchedRoles[0];
    }
    return "RESTRICTED";
  }

  // src/evaluation/appraiser-normalizer.js
  function parseObjectiveCount(rawVal, fallback = null) {
    if (rawVal === null || rawVal === void 0 || rawVal === "") return fallback;
    const str = String(rawVal).trim();
    if (!/^\d+$/.test(str)) return fallback;
    const countVal = parseInt(str, 10);
    if (countVal < 1 || countVal > 10) return fallback;
    return countVal;
  }
  var COMPETENCIES_LIST = [
    { id: 1, nameTH: "1. Adaptability", nameEN: "Adaptability", desc: "\u0E1B\u0E23\u0E31\u0E1A\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E22\u0E37\u0E14\u0E2B\u0E22\u0E38\u0E48\u0E19 \u0E22\u0E2D\u0E21\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E41\u0E25\u0E30\u0E40\u0E23\u0E35\u0E22\u0E19\u0E23\u0E39\u0E49\u0E2A\u0E34\u0E48\u0E07\u0E43\u0E2B\u0E21\u0E48 / Demonstrate flexibility and open-mindedness to organizational changes." },
    { id: 2, nameTH: "2. Problem Solving", nameEN: "Problem Solving & Decision Making", desc: "\u0E01\u0E32\u0E23\u0E41\u0E01\u0E49\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E21\u0E35\u0E2B\u0E25\u0E31\u0E01\u0E01\u0E32\u0E23 / Analyze root causes and make effective decisions." },
    { id: 3, nameTH: "3. Customer Focus", nameEN: "Customer Focus & Service Excellence", desc: "\u0E01\u0E32\u0E23\u0E21\u0E38\u0E48\u0E07\u0E40\u0E19\u0E49\u0E19\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E41\u0E25\u0E30\u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23 \u0E2A\u0E48\u0E07\u0E21\u0E2D\u0E1A\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E21\u0E35\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E / Prioritize internal/external customer needs and quality delivery." },
    { id: 4, nameTH: "4. Additional Value Creation", nameEN: "Value Creation & Innovation", desc: "\u0E01\u0E32\u0E23\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E21\u0E39\u0E25\u0E04\u0E48\u0E32\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E25\u0E30\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E43\u0E2B\u0E21\u0E48\u0E43\u0E19\u0E07\u0E32\u0E19 / Proactively seek improvements and innovative solutions." },
    { id: 5, nameTH: "5. Safety Awareness", nameEN: "Safety & Environmental Awareness", desc: "\u0E04\u0E27\u0E32\u0E21\u0E15\u0E23\u0E30\u0E2B\u0E19\u0E31\u0E01\u0E14\u0E49\u0E32\u0E19\u0E04\u0E27\u0E32\u0E21\u0E1B\u0E25\u0E2D\u0E14\u0E20\u0E31\u0E22\u0E41\u0E25\u0E30\u0E2A\u0E34\u0E48\u0E07\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21 / Adhere to safety standards and environmental responsibility." },
    { id: 6, nameTH: "6. Compliance / COCE", nameEN: "Compliance & Code of Conduct (COCE)", desc: "\u0E01\u0E32\u0E23\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E15\u0E32\u0E21\u0E01\u0E0E\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E41\u0E25\u0E30\u0E08\u0E23\u0E34\u0E22\u0E18\u0E23\u0E23\u0E21\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08 [Evaluated / Excluded from Score] / Evaluated for compliance but excluded from numerical score weight.", isCOCE: true },
    { id: 7, nameTH: "7. Leadership & People Management", nameEN: "Leadership & People Management", desc: "\u0E20\u0E32\u0E27\u0E30\u0E1C\u0E39\u0E49\u0E19\u0E33\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E04\u0E19 \u0E2A\u0E23\u0E49\u0E32\u0E07\u0E41\u0E23\u0E07\u0E08\u0E39\u0E07\u0E43\u0E08\u0E43\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19 / Lead, empower, and guide team members effectively.", isManagementOnly: true },
    { id: 8, nameTH: "8. Strategy & Coaching", nameEN: "Strategy & Coaching / Advising", desc: "\u0E01\u0E32\u0E23\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E01\u0E25\u0E22\u0E38\u0E17\u0E18\u0E4C\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E1E\u0E35\u0E48\u0E40\u0E25\u0E35\u0E49\u0E22\u0E07\u0E43\u0E19\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E17\u0E35\u0E21\u0E07\u0E32\u0E19 / Align with strategic goals and mentor staff.", isManagementOnly: true }
  ];
  function getApplicableCompetencies(setCode) {
    const code = String(setCode || "").trim();
    if (code === "COMP_SET_OPERATIONAL_V1") {
      return COMPETENCIES_LIST.filter((c) => !c.isManagementOnly);
    }
    if (code === "COMP_SET_MANAGEMENT_V1") {
      return COMPETENCIES_LIST;
    }
    return null;
  }
  function normalizeAppraiserData(record, appraiserCount = 2, previewOptions = {}) {
    const count = Math.min(Math.max(parseInt(appraiserCount || 2, 10), 1), 4);
    const slots = [];
    const getVal = (code) => {
      if (!record) return "";
      const field = record[code];
      if (field === null || field === void 0) return "";
      if (typeof field === "object" && "value" in field) return field.value ?? "";
      return String(field);
    };
    const activeObjCount = parseObjectiveCount(getVal("Objective_Count"));
    if (activeObjCount === null) {
      return {
        slots: [],
        totalCount: count,
        completedCount: 0,
        completionPercent: 0,
        isFullyComplete: false,
        isInvalidConfig: true,
        partA: { completed: 0, total: 0, isComplete: false },
        partB: { completed: 0, total: 0, isComplete: false }
      };
    }
    const compSetCode = getVal("Competency_Set_Code") || previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);
    if (!applicableCompList) {
      return {
        slots: [],
        totalCount: count,
        completedCount: 0,
        completionPercent: 0,
        isFullyComplete: false,
        isInvalidConfig: true,
        partA: { completed: 0, total: 0, isComplete: false },
        partB: { completed: 0, total: 0, isComplete: false }
      };
    }
    const slotLabels = ["1st Appraiser", "2nd Appraiser", "3rd Appraiser", "4th Appraiser"];
    let totalRequiredPartARatings = count * activeObjCount;
    let completedRequiredPartARatings = 0;
    let totalRequiredPartBRatings = count * applicableCompList.length;
    let completedRequiredPartBRatings = 0;
    for (let i = 1; i <= count; i++) {
      const label = slotLabels[i - 1];
      const partARatings = {};
      const partBRatings = {};
      const partAComments = {};
      const partBComments = {};
      let slotPartARatedCount = 0;
      let slotPartBRatedCount = 0;
      if (i === 1) {
        for (let k = 1; k <= activeObjCount; k++) {
          partAComments[k] = getVal(`Manager_Comment_${k}`) || previewOptions.slot1CommentsA?.[k] || "";
          const val = getVal(`Manager_Achievement_${k}`) || previewOptions.slot1RatingsA?.[k];
          if (val) {
            partARatings[k] = String(val);
            slotPartARatedCount++;
          }
        }
        applicableCompList.forEach((comp) => {
          partBComments[comp.id] = getVal(`Manager_Competency_Comment_${comp.id}`) || previewOptions.slot1CommentsB?.[comp.id] || "";
          const val = getVal(`Manager_Competency_Rating_${comp.id}`) || previewOptions.slot1RatingsB?.[comp.id];
          if (val) {
            partBRatings[comp.id] = String(val);
            slotPartBRatedCount++;
          }
        });
      } else if (i === 2) {
        for (let k = 1; k <= activeObjCount; k++) {
          partAComments[k] = getVal(`GM_Comment_${k}`) || previewOptions.slot2CommentsA?.[k] || "";
          const val = getVal(`GM_Achievement_${k}`) || previewOptions.slot2RatingsA?.[k];
          if (val) {
            partARatings[k] = String(val);
            slotPartARatedCount++;
          }
        }
        applicableCompList.forEach((comp) => {
          partBComments[comp.id] = getVal(`GM_Competency_Comment_${comp.id}`) || previewOptions.slot2CommentsB?.[comp.id] || "";
          const val = getVal(`GM_Competency_Rating_${comp.id}`) || previewOptions.slot2RatingsB?.[comp.id];
          if (val) {
            partBRatings[comp.id] = String(val);
            slotPartBRatedCount++;
          }
        });
      } else {
        for (let k = 1; k <= activeObjCount; k++) {
          partAComments[k] = previewOptions[`slot${i}CommentsA`]?.[k] || "";
          const val = previewOptions[`slot${i}RatingsA`]?.[k];
          if (val) {
            partARatings[k] = String(val);
            slotPartARatedCount++;
          }
        }
        applicableCompList.forEach((comp) => {
          partBComments[comp.id] = previewOptions[`slot${i}CommentsB`]?.[comp.id] || "";
          const val = previewOptions[`slot${i}RatingsB`]?.[comp.id];
          if (val) {
            partBRatings[comp.id] = String(val);
            slotPartBRatedCount++;
          }
        });
      }
      completedRequiredPartARatings += slotPartARatedCount;
      completedRequiredPartBRatings += slotPartBRatedCount;
      const isPartAComplete = slotPartARatedCount === activeObjCount;
      const isPartBComplete = slotPartBRatedCount === applicableCompList.length;
      const isSlotCompleted = isPartAComplete && isPartBComplete;
      slots.push({
        slotIndex: i,
        label,
        isCompleted: isSlotCompleted,
        isPartAComplete,
        isPartBComplete,
        partARatings,
        partBRatings,
        partAComments,
        partBComments
      });
    }
    const completedCount = slots.filter((s) => s.isCompleted).length;
    const completionPercent = Math.round(completedCount / count * 100);
    const isFullyComplete = completedCount === count;
    return {
      slots,
      totalCount: count,
      completedCount,
      completionPercent,
      isFullyComplete,
      isInvalidConfig: false,
      partA: {
        completed: completedRequiredPartARatings,
        total: totalRequiredPartARatings,
        isComplete: completedRequiredPartARatings === totalRequiredPartARatings
      },
      partB: {
        completed: completedRequiredPartBRatings,
        total: totalRequiredPartBRatings,
        isComplete: completedRequiredPartBRatings === totalRequiredPartBRatings
      }
    };
  }

  // src/profiles/profile-codes-policy.js
  var PROFILE_CODES = {
    STAFF_CHIEF: "PROF_STAFF_CHIEF",
    JAPANESE_STAFF: "PROF_JAPANESE_STAFF",
    ASST_MGR: "PROF_ASST_MGR",
    SECTION_MGR: "PROF_SECTION_MGR",
    SENIOR_MGR: "PROF_SENIOR_MGR",
    DGM: "PROF_DGM",
    GM: "PROF_GM",
    VP: "PROF_VP"
  };
  var POSITION_TO_PROFILE = /* @__PURE__ */ new Map([
    ["staff", PROFILE_CODES.STAFF_CHIEF],
    ["senior staff", PROFILE_CODES.STAFF_CHIEF],
    ["chief", PROFILE_CODES.STAFF_CHIEF],
    ["marketing chief", PROFILE_CODES.STAFF_CHIEF],
    ["support marketing staff", PROFILE_CODES.STAFF_CHIEF],
    ["support marketing chief", PROFILE_CODES.STAFF_CHIEF],
    ["supoort marketing staff", PROFILE_CODES.STAFF_CHIEF],
    ["supoort marketing chief", PROFILE_CODES.STAFF_CHIEF],
    ["technical service engineer", PROFILE_CODES.STAFF_CHIEF],
    ["technical service chief", PROFILE_CODES.STAFF_CHIEF],
    ["accounting staff", PROFILE_CODES.STAFF_CHIEF],
    ["chief of engineer", PROFILE_CODES.STAFF_CHIEF],
    ["marketing engineer", PROFILE_CODES.STAFF_CHIEF],
    ["engineering staff", PROFILE_CODES.STAFF_CHIEF],
    ["it staff", PROFILE_CODES.STAFF_CHIEF],
    ["technical chief", PROFILE_CODES.STAFF_CHIEF],
    ["technician", PROFILE_CODES.STAFF_CHIEF],
    ["safety officer", PROFILE_CODES.STAFF_CHIEF],
    ["service engineer", PROFILE_CODES.STAFF_CHIEF],
    ["chief of safety officer", PROFILE_CODES.STAFF_CHIEF],
    ["technical staff", PROFILE_CODES.STAFF_CHIEF],
    ["accounting chief", PROFILE_CODES.STAFF_CHIEF],
    ["design engineer", PROFILE_CODES.STAFF_CHIEF],
    ["marketing staff", PROFILE_CODES.STAFF_CHIEF],
    ["operator", PROFILE_CODES.STAFF_CHIEF],
    ["assistant chief", PROFILE_CODES.STAFF_CHIEF],
    ["coordinator", PROFILE_CODES.STAFF_CHIEF],
    ["messenger", PROFILE_CODES.STAFF_CHIEF],
    ["senior chief", PROFILE_CODES.STAFF_CHIEF],
    ["trainee", PROFILE_CODES.STAFF_CHIEF],
    ["cam staff", PROFILE_CODES.STAFF_CHIEF],
    ["specialist", PROFILE_CODES.STAFF_CHIEF],
    ["executive management coordinator", PROFILE_CODES.STAFF_CHIEF],
    ["safety", PROFILE_CODES.STAFF_CHIEF],
    ["senior specilaist", PROFILE_CODES.STAFF_CHIEF],
    ["warehouse support", PROFILE_CODES.STAFF_CHIEF],
    ["driver", PROFILE_CODES.STAFF_CHIEF],
    ["contract (apite)", PROFILE_CODES.STAFF_CHIEF],
    ["interpreter", PROFILE_CODES.STAFF_CHIEF],
    ["warehouse staff", PROFILE_CODES.STAFF_CHIEF],
    ["safety officer& iso control", PROFILE_CODES.STAFF_CHIEF],
    ["clerk", PROFILE_CODES.STAFF_CHIEF],
    ["japanese staff", PROFILE_CODES.JAPANESE_STAFF],
    ["expatriate", PROFILE_CODES.JAPANESE_STAFF],
    ["expatriate japanese staff", PROFILE_CODES.JAPANESE_STAFF],
    ["advisor", PROFILE_CODES.JAPANESE_STAFF],
    ["contract (japan support)", PROFILE_CODES.JAPANESE_STAFF],
    ["assistant manager", PROFILE_CODES.ASST_MGR],
    ["assistant section manager", PROFILE_CODES.ASST_MGR],
    ["asst. section manager", PROFILE_CODES.ASST_MGR],
    ["design engineer assistant manager", PROFILE_CODES.ASST_MGR],
    ["section manager", PROFILE_CODES.SECTION_MGR],
    ["manager", PROFILE_CODES.SECTION_MGR],
    ["co project manager", PROFILE_CODES.SECTION_MGR],
    ["factory manager", PROFILE_CODES.GM],
    ["senior manager", PROFILE_CODES.SENIOR_MGR],
    ["deputy general manager", PROFILE_CODES.DGM],
    ["general manager", PROFILE_CODES.GM],
    ["vice president", PROFILE_CODES.VP],
    ["president", PROFILE_CODES.VP]
  ]);
  var AMBIGUOUS_TITLES = /* @__PURE__ */ new Set([]);
  var ProfilePolicyError = class extends Error {
    constructor(code, message = code) {
      super(message);
      this.name = "ProfilePolicyError";
      this.code = code;
    }
  };
  function normalizeTitle(rawTitle) {
    if (typeof rawTitle !== "string" || rawTitle.trim() === "") {
      throw new ProfilePolicyError("PROFILE_SOURCE_INVALID");
    }
    return rawTitle.trim().replace(/\s+/g, " ").toLowerCase();
  }
  function getProfileCodeFromPosition(position) {
    if (typeof position !== "string" || position.trim() === "") {
      throw new ProfilePolicyError("PROFILE_SOURCE_INVALID");
    }
    const normalizedTitle = normalizeTitle(position);
    if (AMBIGUOUS_TITLES.has(normalizedTitle)) {
      throw new ProfilePolicyError("PROFILE_RESOLUTION_AMBIGUOUS");
    }
    const profileCode = POSITION_TO_PROFILE.get(normalizedTitle);
    if (!profileCode) {
      throw new ProfilePolicyError("PROFILE_SOURCE_INVALID");
    }
    return profileCode;
  }

  // src/admin/admin-diagnostic-model.js
  var BUILD_VERSION_INFO = {
    version: "0.2.4",
    sourceBuildId: "WP-002C-CORRECTIVE-ROUND2",
    commitSha: "NOT_EVIDENCED",
    buildTimestamp: "2026-08-27T13:39:00Z",
    environment: "LOCAL_PREVIEW / SANDBOX"
  };
  function escapeHtml(str) {
    if (str === null || str === void 0) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  var CANONICAL_STATUSES = [
    "01 Draft Objective",
    "02 First Manager Objective Review",
    "03 Manager Objective Review",
    "04 GM Objective Review",
    "05 Objective Approved",
    "06 Employee Mid-Year",
    "07 First Manager Mid-Year Review",
    "08 Manager Mid-Year Review",
    "09 GM Mid-Year Review",
    "10 Mid-Year Completed",
    "11 Employee Self Evaluation",
    "12 First Manager Final Evaluation",
    "13 Manager Final Evaluation",
    "14 GM Final Evaluation",
    "15 HR Final Check",
    "16 Completed"
  ];
  var CANONICAL_PROFILE_WEIGHTS = {
    [PROFILE_CODES.STAFF_CHIEF]: { a: 70, b: 30 },
    [PROFILE_CODES.JAPANESE_STAFF]: { a: 70, b: 30 },
    [PROFILE_CODES.ASST_MGR]: { a: 60, b: 40 },
    [PROFILE_CODES.SECTION_MGR]: { a: 50, b: 50 },
    [PROFILE_CODES.SENIOR_MGR]: { a: 50, b: 50 },
    [PROFILE_CODES.DGM]: { a: 50, b: 50 },
    [PROFILE_CODES.GM]: { a: 50, b: 50 },
    [PROFILE_CODES.VP]: { a: 50, b: 50 }
  };
  var AdminDiagnosticModel = class _AdminDiagnosticModel {
    /**
     * P0 Security Gate: Strictly authorizes `admin-form` only for technical diagnostics.
     * `admin-form` has 0 Business Workflow Authority and CANNOT perform requester/approval business actions.
     */
    static isTechnicalAdmin(loginUserCode) {
      if (!loginUserCode || typeof loginUserCode !== "string") return false;
      const cleanCode = loginUserCode.trim().toLowerCase();
      return cleanCode === "admin-form";
    }
    /**
     * Normalizes a user code for case-insensitive exact comparison.
     */
    static normalizeUserCode(code) {
      if (!code) return "";
      if (typeof code === "string") return code.trim().toLowerCase();
      if (Array.isArray(code)) {
        if (code.length > 0) return _AdminDiagnosticModel.normalizeUserCode(code[0]);
        return "";
      }
      if (typeof code === "object") {
        if (typeof code.code === "string") return code.code.trim().toLowerCase();
        if (typeof code.value === "string") return code.value.trim().toLowerCase();
        if (Array.isArray(code.value) && code.value.length > 0) return _AdminDiagnosticModel.normalizeUserCode(code.value[0]);
      }
      return String(code).trim().toLowerCase();
    }
    /**
     * Topology-aware Ordinal Appraiser Slot Normalizer (P0-E & B3).
     * Normalizes record/context fields into exact 1st..4th Appraiser ordinal slots based on Routing_Topology.
     */
    static normalizeAppraiserSlots(context = {}) {
      const topology = context.topology || context.Routing_Topology || context.actualTopology || "M1_G1";
      const getVal = (code) => {
        const v = context[code];
        if (!v) return "";
        return _AdminDiagnosticModel.normalizeUserCode(v);
      };
      let expectedCount = 2;
      const slots = [];
      if (topology === "M1_ONLY") {
        expectedCount = 1;
        const user = getVal("appraiser1") || getVal("Manager_User") || getVal("First_Manager_User");
        slots.push({ slot: 1, labelEN: "1st Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1", userCode: user, sourceField: "Manager_User" });
      } else if (topology === "M1_G1") {
        expectedCount = 2;
        const u1 = getVal("appraiser1") || getVal("Manager_User");
        const u2 = getVal("appraiser2") || getVal("GM_User");
        slots.push({ slot: 1, labelEN: "1st Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1", userCode: u1, sourceField: "Manager_User" });
        slots.push({ slot: 2, labelEN: "2nd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2", userCode: u2, sourceField: "GM_User" });
      } else if (topology === "M1_M2_G1") {
        expectedCount = 3;
        const u1 = getVal("appraiser1") || getVal("First_Manager_User");
        const u2 = getVal("appraiser2") || getVal("Manager_User");
        const u3 = getVal("appraiser3") || getVal("GM_User");
        slots.push({ slot: 1, labelEN: "1st Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1", userCode: u1, sourceField: "First_Manager_User" });
        slots.push({ slot: 2, labelEN: "2nd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2", userCode: u2, sourceField: "Manager_User" });
        slots.push({ slot: 3, labelEN: "3rd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 3", userCode: u3, sourceField: "GM_User" });
      } else if (topology === "M1_G1_G2") {
        expectedCount = 3;
        const u1 = getVal("appraiser1") || getVal("Manager_User");
        const u2 = getVal("appraiser2") || getVal("GM_User");
        const u3 = getVal("appraiser3") || getVal("GM_Level2_Approvers");
        slots.push({ slot: 1, labelEN: "1st Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1", userCode: u1, sourceField: "Manager_User" });
        slots.push({ slot: 2, labelEN: "2nd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2", userCode: u2, sourceField: "GM_User" });
        slots.push({ slot: 3, labelEN: "3rd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 3", userCode: u3, sourceField: "GM_Level2_Approvers" });
      } else if (topology === "M1_M2_G1_G2") {
        expectedCount = 4;
        const u1 = getVal("appraiser1") || getVal("First_Manager_User");
        const u2 = getVal("appraiser2") || getVal("Manager_User");
        const u3 = getVal("appraiser3") || getVal("GM_User");
        const u4 = getVal("appraiser4") || getVal("GM_Level2_Approvers");
        slots.push({ slot: 1, labelEN: "1st Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1", userCode: u1, sourceField: "First_Manager_User" });
        slots.push({ slot: 2, labelEN: "2nd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2", userCode: u2, sourceField: "Manager_User" });
        slots.push({ slot: 3, labelEN: "3rd Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 3", userCode: u3, sourceField: "GM_User" });
        slots.push({ slot: 4, labelEN: "4th Appraiser", labelTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 4", userCode: u4, sourceField: "GM_Level2_Approvers" });
      }
      return {
        topology,
        expectedCount,
        slots
      };
    }
    /**
     * Evaluates System Health across 15 diagnostic indicators.
     * B5 Fix: When commitSha is 'NOT_EVIDENCED', bundle_version status is NOT_EVIDENCED, not PASS.
     */
    static evaluateSystemHealth(context = {}) {
      const {
        loginUserCode,
        requesterUserCodes = [],
        routingKey,
        routingResult,
        activeAppraiserSlot,
        profileCode,
        evalProfile,
        activeObjCount,
        isObjCountValid,
        isPartAComplete,
        isPartBComplete,
        phaseCalendar,
        currentStatus,
        currentActor,
        resolvedViewerRole,
        app800Status = "NOT_EVIDENCED",
        app801Status = "NOT_EVIDENCED",
        attachmentState = "OPTIONAL_PRESENTATION",
        schemaState = "NOT_EVIDENCED"
      } = context;
      const items = [];
      const isAdminUser = _AdminDiagnosticModel.isTechnicalAdmin(loginUserCode);
      items.push({
        key: "identity_resolution",
        labelTH: "\u0E01\u0E32\u0E23\u0E23\u0E30\u0E1A\u0E38\u0E15\u0E31\u0E27\u0E15\u0E19 Kintone (Identity Resolution)",
        labelEN: "Kintone Identity Resolution",
        status: isAdminUser ? "PASS" : "ERROR",
        reason: isAdminUser ? `Logged in technical admin: ${loginUserCode}` : loginUserCode ? `Access Denied: User "${loginUserCode}" is not authorized technical admin admin-form` : "Logged-in user code is missing"
      });
      items.push({
        key: "requester_mapping",
        labelTH: "\u0E1C\u0E39\u0E49\u0E02\u0E2D\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (Requester User Mapping)",
        labelEN: "Requester User Mapping",
        status: requesterUserCodes.length > 0 ? "PASS" : "WARNING",
        reason: requesterUserCodes.length > 0 ? `Requester user code(s): ${requesterUserCodes.join(", ")}` : "Requester_User field is unassigned"
      });
      let routingStatus = "NOT_EVIDENCED";
      let routingReason = "Routing resolution evidence not provided";
      if (routingResult?.status === "FAIL_CLOSED" || routingResult?.isFailClosed) {
        routingStatus = "ERROR";
        routingReason = `Routing fail-closed: ${routingResult.reason || "No matching App795 route"}`;
      } else if (routingResult?.status === "PASS") {
        routingStatus = "PASS";
        routingReason = `Routing resolved via App795: ${routingKey || "Verified"}`;
      } else if (routingKey) {
        routingStatus = "NOT_EVIDENCED";
        routingReason = `Routing key "${routingKey}" checked; authoritative App795 route result evidence required for PASS`;
      }
      items.push({
        key: "routing_resolution",
        labelTH: "\u0E01\u0E32\u0E23\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (Routing Resolution)",
        labelEN: "Routing Resolution",
        status: routingStatus,
        reason: routingReason
      });
      items.push({
        key: "active_appraiser_slot",
        labelTH: "\u0E0A\u0E48\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (Active Appraiser Slot)",
        labelEN: "Current Active Appraiser Slot",
        status: activeAppraiserSlot ? "PASS" : "NOT_AVAILABLE",
        reason: activeAppraiserSlot ? `Active Appraiser: Slot ${activeAppraiserSlot}` : "Not currently in Appraiser Evaluation stage"
      });
      const isProfileValid = !!(profileCode && evalProfile);
      items.push({
        key: "profile_resolution",
        labelTH: "\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (Evaluation Profile Resolution)",
        labelEN: "Evaluation Profile Resolution",
        status: isProfileValid ? "PASS" : profileCode ? "ERROR" : "NOT_EVIDENCED",
        reason: isProfileValid ? `Profile: ${profileCode} (${evalProfile.nameEN || ""})` : profileCode ? "Profile code unrecognized" : "Profile evidence missing"
      });
      let objStatus = "NOT_EVIDENCED";
      let objReason = "Objective count evidence not provided";
      if (activeObjCount !== void 0 && activeObjCount !== null) {
        if (isObjCountValid !== false && activeObjCount >= 1 && activeObjCount <= 10) {
          objStatus = "PASS";
          objReason = `Objective Count: ${activeObjCount} (Valid range 1..10)`;
        } else {
          objStatus = "ERROR";
          objReason = `Objective_Count (${activeObjCount}) is invalid or out of range 1..10`;
        }
      }
      items.push({
        key: "objective_count",
        labelTH: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 (Objective Count & Validity)",
        labelEN: "Objective Count & Validity",
        status: objStatus,
        reason: objReason
      });
      let scoringStatus = "NOT_EVIDENCED";
      let scoringReason = "Scoring completeness evidence not provided";
      if (isPartAComplete !== void 0 || isPartBComplete !== void 0) {
        if (isPartAComplete !== false && isPartBComplete !== false) {
          scoringStatus = "PASS";
          scoringReason = "Part A & Part B ratings complete";
        } else {
          scoringStatus = "WARNING";
          scoringReason = `Incomplete: Part A=${isPartAComplete ? "OK" : "Incomplete"}, Part B=${isPartBComplete ? "OK" : "Incomplete"}`;
        }
      }
      items.push({
        key: "scoring_completeness",
        labelTH: "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E30\u0E41\u0E19\u0E19 (Scoring Completeness)",
        labelEN: "Scoring Completeness",
        status: scoringStatus,
        reason: scoringReason
      });
      items.push({
        key: "phase_calendar",
        labelTH: "\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (Phase Calendar Resolution)",
        labelEN: "Phase Calendar Resolution",
        status: phaseCalendar ? "PASS" : "WARNING",
        reason: phaseCalendar ? "Phase dates active" : "Using fallback phase calendar"
      });
      let wfStatus = "NOT_EVIDENCED";
      let wfReason = "Current workflow status evidence missing";
      if (currentStatus) {
        if (CANONICAL_STATUSES.includes(currentStatus)) {
          wfStatus = "PASS";
          wfReason = `Status: "${currentStatus}", Actor: "${currentActor || "N/A"}"`;
        } else {
          wfStatus = "ERROR";
          wfReason = `Current status "${currentStatus}" is non-canonical or unmapped`;
        }
      }
      items.push({
        key: "workflow_status",
        labelTH: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23 (Workflow Status & Actor)",
        labelEN: "Workflow Status & Current Actor",
        status: wfStatus,
        reason: wfReason
      });
      let viewerStatus = "NOT_EVIDENCED";
      let viewerReason = "Viewer role evidence missing";
      if (resolvedViewerRole) {
        viewerStatus = "PASS";
        viewerReason = `Viewer Role: ${resolvedViewerRole}`;
      }
      items.push({
        key: "viewer_privacy",
        labelTH: "\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E01\u0E32\u0E23\u0E21\u0E2D\u0E07\u0E40\u0E2B\u0E47\u0E19 (Viewer Privacy Resolution)",
        labelEN: "Viewer Privacy Resolution",
        status: viewerStatus,
        reason: viewerReason
      });
      items.push({
        key: "app800_config",
        labelTH: "\u0E2A\u0E16\u0E32\u0E19\u0E30 App800 (App800 Config State)",
        labelEN: "App800 Config State",
        status: app800Status,
        reason: app800Status === "PASS" ? "App800 HR Control Center schema & config verified" : "App800 live inspection not evidenced"
      });
      items.push({
        key: "app801_auth_contract",
        labelTH: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19 App801 (App801 Auth Contract State)",
        labelEN: "App801 Auth Contract State",
        status: app801Status,
        reason: app801Status === "NOT_AVAILABLE" ? "App801 credential store unwired / Kintone SSO primary" : "App801 live inspection not evidenced"
      });
      items.push({
        key: "attachment_mapping",
        labelTH: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E44\u0E1F\u0E25\u0E4C\u0E41\u0E19\u0E1A (Attachment Mapping State)",
        labelEN: "Attachment Mapping State",
        status: attachmentState,
        reason: "Objectives, Mid-Year & Self attachments are optional presentation evidence"
      });
      items.push({
        key: "schema_expectation",
        labelTH: "\u0E04\u0E27\u0E32\u0E21\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E2D\u0E07 Schema (Schema Expectation State)",
        labelEN: "Schema Expectation State",
        status: schemaState,
        reason: schemaState === "PASS" ? "Physical fields match expected App794 contract" : "Schema live inspection not evidenced"
      });
      const isCommitEvidenced = BUILD_VERSION_INFO.commitSha && BUILD_VERSION_INFO.commitSha !== "NOT_EVIDENCED";
      items.push({
        key: "bundle_version",
        labelTH: "\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E0A\u0E31\u0E19\u0E23\u0E30\u0E1A\u0E1A (Bundle / Build Identifier)",
        labelEN: "Bundle / Build Identifier",
        status: isCommitEvidenced ? "PASS" : "NOT_EVIDENCED",
        reason: `v${BUILD_VERSION_INFO.version} (${BUILD_VERSION_INFO.sourceBuildId}) \u2022 Commit: ${BUILD_VERSION_INFO.commitSha}`
      });
      const hasError = items.some((i) => i.status === "ERROR");
      const hasUncertain = items.some((i) => i.status === "NOT_EVIDENCED" || i.status === "NOT_AVAILABLE");
      const hasWarning = items.some((i) => i.status === "WARNING");
      const overallHealth = hasError ? "ERROR" : hasUncertain ? "INCOMPLETE_EVIDENCE" : hasWarning ? "WARNING" : "PASS";
      return {
        overallHealth,
        items,
        evaluatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    /**
     * B. Evaluates Workflow Trace & Workflow State Consistency (P0-D Truth Boundary).
     */
    static evaluateWorkflowTrace(context = {}) {
      const {
        currentStatus,
        topology,
        activeAppraiserSlot,
        appraiser1,
        appraiser2,
        appraiser3,
        appraiser4,
        actualAuditHistory = null
      } = context;
      if (!currentStatus || !CANONICAL_STATUSES.includes(currentStatus)) {
        return {
          status: "ERROR",
          isFailClosed: true,
          reason: currentStatus ? `Current status "${currentStatus}" is non-canonical or unmapped` : "Current status is missing",
          expectedPath: "N/A",
          consistency: "ERROR"
        };
      }
      if (!topology) {
        return {
          status: "NOT_EVIDENCED",
          isFailClosed: false,
          reason: "Topology evidence not provided",
          expectedPath: "NOT_EVIDENCED",
          consistency: "NOT_EVIDENCED"
        };
      }
      const expectedPaths = {
        M1_ONLY: ["01 Draft Objective", "03 Manager Objective Review", "05 Objective Approved", "06 Employee Mid-Year", "08 Manager Mid-Year Review", "10 Mid-Year Completed", "11 Employee Self Evaluation", "13 Manager Final Evaluation", "15 HR Final Check", "16 Completed"],
        M1_G1: ["01 Draft Objective", "03 Manager Objective Review", "04 GM Objective Review", "05 Objective Approved", "06 Employee Mid-Year", "08 Manager Mid-Year Review", "09 GM Mid-Year Review", "10 Mid-Year Completed", "11 Employee Self Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation", "15 HR Final Check", "16 Completed"],
        M1_M2_G1: ["01 Draft Objective", "03 Manager Objective Review", "04 GM Objective Review", "05 Objective Approved", "06 Employee Mid-Year", "08 Manager Mid-Year Review", "09 GM Mid-Year Review", "10 Mid-Year Completed", "11 Employee Self Evaluation", "12 First Manager Final Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation", "15 HR Final Check", "16 Completed"],
        M1_G1_G2: ["01 Draft Objective", "03 Manager Objective Review", "04 GM Objective Review", "05 Objective Approved", "06 Employee Mid-Year", "08 Manager Mid-Year Review", "09 GM Mid-Year Review", "10 Mid-Year Completed", "11 Employee Self Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation", "15 HR Final Check", "16 Completed"],
        M1_M2_G1_G2: ["01 Draft Objective", "03 Manager Objective Review", "04 GM Objective Review", "05 Objective Approved", "06 Employee Mid-Year", "08 Manager Mid-Year Review", "09 GM Mid-Year Review", "10 Mid-Year Completed", "11 Employee Self Evaluation", "12 First Manager Final Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation", "15 HR Final Check", "16 Completed"]
      };
      const expectedPath = expectedPaths[topology];
      if (!expectedPath) {
        return {
          status: "ERROR",
          isFailClosed: true,
          reason: `Unknown or unsupported topology "${topology}"`,
          expectedPath: "N/A",
          consistency: "ERROR"
        };
      }
      const isConfirmedTopology = topology === "M1_G1" || topology === "M1_ONLY";
      const topologyCertificationStatus = topology === "M1_G1" ? "CURRENT_CONFIRMED" : topology === "M1_ONLY" ? "CONFIRMED_EXECUTIVE_DIRECT_CONTEXT" : "FUTURE_TOPOLOGY_NOT_PRODUCTION_CERTIFIED";
      if (topology === "M1_G1" && ["02 First Manager Objective Review", "07 First Manager Mid-Year Review", "12 First Manager Final Evaluation"].includes(currentStatus)) {
        return {
          status: "ERROR",
          isFailClosed: true,
          reason: `Topology "${topology}" invalidly entered First Manager state "${currentStatus}"`,
          expectedPath: expectedPath.join(" \u2192 "),
          consistency: "ERROR"
        };
      }
      if (topology === "M1_ONLY" && ["04 GM Objective Review", "09 GM Mid-Year Review", "14 GM Final Evaluation"].includes(currentStatus)) {
        return {
          status: "ERROR",
          isFailClosed: true,
          reason: `Topology "M1_ONLY" invalidly entered GM evaluation state "${currentStatus}"`,
          expectedPath: expectedPath.join(" \u2192 "),
          consistency: "ERROR"
        };
      }
      let expectedSlot = null;
      if (currentStatus === "12 First Manager Final Evaluation") expectedSlot = 1;
      else if (currentStatus === "13 Manager Final Evaluation") expectedSlot = topology === "M1_ONLY" ? 1 : topology === "M1_M2_G1" ? 2 : 1;
      else if (currentStatus === "14 GM Final Evaluation") expectedSlot = topology === "M1_M2_G1" ? 3 : topology === "M1_G1" ? 2 : topology === "M1_G1_G2" ? 2 : 2;
      if (activeAppraiserSlot && expectedSlot && activeAppraiserSlot !== expectedSlot) {
        return {
          status: "ERROR",
          isFailClosed: true,
          reason: `Active appraiser slot mismatch: Current status "${currentStatus}" expects Slot ${expectedSlot}, but active slot is ${activeAppraiserSlot}`,
          expectedPath: expectedPath.join(" \u2192 "),
          consistency: "ERROR"
        };
      }
      const appraiserSlots = { 1: appraiser1, 2: appraiser2, 3: appraiser3, 4: appraiser4 };
      const isAppraiserContextSupplied = Boolean(appraiser1 || appraiser2 || appraiser3 || appraiser4);
      if (expectedSlot && isAppraiserContextSupplied && !appraiserSlots[expectedSlot]) {
        return {
          status: "ERROR",
          isFailClosed: true,
          reason: `Required appraiser for Slot ${expectedSlot} is missing on record for status "${currentStatus}"`,
          expectedPath: expectedPath.join(" \u2192 "),
          consistency: "ERROR"
        };
      }
      let historyStatus = "PENDING_AUDIT_SCHEMA_AUTHORIZATION";
      let isAuditStructurallyValid = false;
      if (Array.isArray(actualAuditHistory) && actualAuditHistory.length > 0) {
        isAuditStructurallyValid = actualAuditHistory.every(
          (entry) => entry && typeof entry === "object" && Boolean(entry.actor || entry.actorKintoneUserCode || entry.actorCode) && Boolean(entry.fromStatus || entry.from_status) && Boolean(entry.toStatus || entry.to_status) && Boolean(entry.action || entry.result) && Boolean(entry.timestamp || entry.actionAt || entry.action_at)
        );
        if (isAuditStructurallyValid) {
          historyStatus = "EVIDENCED";
        } else {
          historyStatus = "INVALID_AUDIT_STRUCTURE";
        }
      }
      const overallStatus = isConfirmedTopology ? "PASS" : "WARNING";
      const reasonText = isConfirmedTopology ? `Workflow status "${currentStatus}" is consistent with topology "${topology}"` : `Topology "${topology}" is a future/unreviewed topology (FUTURE_TOPOLOGY_NOT_PRODUCTION_CERTIFIED)`;
      return {
        status: overallStatus,
        isFailClosed: false,
        topologyCertificationStatus,
        reason: reasonText,
        expectedPath: expectedPath.join(" \u2192 "),
        consistency: overallStatus,
        historyStatus,
        actualAuditHistory: isAuditStructurallyValid ? actualAuditHistory : "NOT_AVAILABLE"
      };
    }
    /**
     * C. Evaluates Expected vs Actual Evaluation Profile.
     * Reuses canonical shared profile policy from src/profiles/profile-scoring-resolver.js.
     */
    static evaluateProfileMatch(context = {}) {
      const {
        position,
        actualProfileCode,
        actualPartAWeight,
        actualPartBWeight
      } = context;
      if (!position && !actualProfileCode) {
        return {
          status: "NOT_EVIDENCED",
          reason: "Position and Profile evidence missing",
          expectedProfileCode: "NOT_EVIDENCED",
          expectedPartAWeight: null,
          expectedPartBWeight: null,
          profileMatch: "NOT_EVIDENCED"
        };
      }
      let expectedCode = null;
      if (position) {
        try {
          expectedCode = getProfileCodeFromPosition(position);
        } catch {
          return {
            status: "NOT_EVIDENCED",
            reason: `Position "${position}" not found in authoritative position ratio mapping`,
            expectedProfileCode: "NOT_EVIDENCED",
            actualProfileCode: actualProfileCode || "N/A",
            profileMatch: "NOT_EVIDENCED"
          };
        }
      }
      const expectedWeights = CANONICAL_PROFILE_WEIGHTS[expectedCode];
      if (!expectedWeights) {
        return {
          status: "NOT_EVIDENCED",
          reason: `Profile code "${expectedCode || "N/A"}" weights missing in canonical weight table`,
          expectedProfileCode: expectedCode || "NOT_EVIDENCED",
          actualProfileCode: actualProfileCode || "N/A",
          profileMatch: "NOT_EVIDENCED"
        };
      }
      const codeMatch = actualProfileCode === expectedCode;
      const aMatch = Number(actualPartAWeight) === expectedWeights.a;
      const bMatch = Number(actualPartBWeight) === expectedWeights.b;
      const isMatch = codeMatch && aMatch && bMatch;
      return {
        status: isMatch ? "PASS" : "ERROR",
        profileMatch: isMatch ? "PASS" : "ERROR",
        expectedProfileCode: expectedCode,
        actualProfileCode: actualProfileCode || "N/A",
        expectedPartAWeight: expectedWeights.a,
        actualPartAWeight: actualPartAWeight !== void 0 ? Number(actualPartAWeight) : "N/A",
        expectedPartBWeight: expectedWeights.b,
        actualPartBWeight: actualPartBWeight !== void 0 ? Number(actualPartBWeight) : "N/A",
        reason: isMatch ? `Profile matches expected ${expectedCode} (${expectedWeights.a}/${expectedWeights.b})` : `Profile mismatch: Expected ${expectedCode} (${expectedWeights.a}/${expectedWeights.b}), Actual ${actualProfileCode || "N/A"} (${actualPartAWeight}/${actualPartBWeight})`
      };
    }
    /**
     * D. Evaluates Expected vs Actual Route Assignment.
     * Requires complete App795 route evidence (all required ordinal Appraiser 1..N identities).
     */
    static evaluateRouteMatch(context = {}) {
      const {
        sectionCode,
        teamName,
        position,
        actualRoutingKey,
        actualTopology,
        actualAppraiserCount,
        actualAppraiser1,
        actualAppraiser2,
        actualAppraiser3,
        actualAppraiser4,
        authoritativeRoute = null
      } = context;
      const normPos = (position || "").trim().toLowerCase();
      const execKeyMap = {
        "dgm": "POSITION_DGM",
        "deputy general manager": "POSITION_DGM",
        "gm": "POSITION_GM",
        "general manager": "POSITION_GM",
        "vp": "POSITION_VP",
        "vice president": "POSITION_VP"
      };
      if (execKeyMap[normPos]) {
        const expectedExecKey = execKeyMap[normPos];
        const keyMatch2 = actualRoutingKey === expectedExecKey;
        const isExecTopology = actualTopology === "M1_ONLY";
        const isExecCount = Number(actualAppraiserCount) === 1;
        const authAppraiser1 = authoritativeRoute?.appraiser1 || authoritativeRoute?.First_Manager_User || authoritativeRoute?.Manager_User;
        if (!authoritativeRoute || !authAppraiser1) {
          return {
            status: "NOT_EVIDENCED",
            routeMatch: "NOT_EVIDENCED",
            expectedRoutingKey: expectedExecKey,
            actualRoutingKey: actualRoutingKey || "N/A",
            expectedTopology: "M1_ONLY",
            actualTopology: actualTopology || "N/A",
            expectedAppraiserCount: 1,
            actualAppraiserCount: actualAppraiserCount || "N/A",
            reason: "Executive routing key checked; authoritative App795 appraiser1 evidence required for full PASS"
          };
        }
        const norm2 = _AdminDiagnosticModel.normalizeUserCode;
        const appraiser1Match = norm2(actualAppraiser1) === norm2(authAppraiser1);
        if (!appraiser1Match) {
          return {
            status: "ERROR",
            routeMatch: "ERROR",
            expectedRoutingKey: expectedExecKey,
            actualRoutingKey: actualRoutingKey || "N/A",
            expectedTopology: "M1_ONLY",
            actualTopology: actualTopology || "N/A",
            expectedAppraiserCount: 1,
            actualAppraiserCount: actualAppraiserCount || "N/A",
            expectedAppraiser1: authAppraiser1,
            actualAppraiser1: actualAppraiser1 || "N/A",
            reason: "1ST_APPRAISER_MISMATCH: Actual 1st Appraiser does not match authoritative App795 executive route"
          };
        }
        const isExecMatch = keyMatch2 && isExecTopology && isExecCount && appraiser1Match;
        return {
          status: isExecMatch ? "PASS" : "ERROR",
          routeMatch: isExecMatch ? "PASS" : "ERROR",
          expectedRoutingKey: expectedExecKey,
          actualRoutingKey: actualRoutingKey || "N/A",
          expectedTopology: "M1_ONLY",
          actualTopology: actualTopology || "N/A",
          expectedAppraiserCount: 1,
          actualAppraiserCount: actualAppraiserCount || "N/A",
          expectedAppraiser1: authAppraiser1,
          actualAppraiser1: actualAppraiser1 || "N/A",
          reason: isExecMatch ? `Executive direct single-appraiser route matches ${expectedExecKey}` : `Executive route mismatch: expected ${expectedExecKey} / M1_ONLY / Count=1`
        };
      }
      if (!sectionCode && !authoritativeRoute && !actualRoutingKey) {
        return {
          status: "NOT_EVIDENCED",
          reason: "Routing input evidence (Section_Code/App795) not provided",
          routeMatch: "NOT_EVIDENCED"
        };
      }
      const isTMG = (sectionCode || "").toUpperCase().startsWith("TMG");
      let expectedKey = sectionCode || authoritativeRoute?.Routing_Key || authoritativeRoute?.Matched_Rule || "";
      if (isTMG) {
        if (!teamName || !teamName.trim()) {
          return {
            status: "ERROR",
            isFailClosed: true,
            routeMatch: "ERROR",
            reason: `TMG Section "${sectionCode}" requires exact Team mapping (FAIL_CLOSED). Cannot fall back to Section-only.`
          };
        }
        expectedKey = `${sectionCode}|${teamName.trim()}`;
      }
      if (!authoritativeRoute) {
        const keyMatch2 = actualRoutingKey === expectedKey;
        return {
          status: "NOT_EVIDENCED",
          routeMatch: "NOT_EVIDENCED",
          routingKeyCheck: keyMatch2 ? "PASS" : "ERROR",
          expectedRoutingKey: expectedKey,
          actualRoutingKey: actualRoutingKey || "N/A",
          expectedTopology: "NOT_EVIDENCED",
          actualTopology: actualTopology || "N/A",
          reason: keyMatch2 ? `Routing key matches "${expectedKey}"; authoritative App795 route result required for overall route PASS` : `Routing key mismatch: Expected "${expectedKey}", Actual "${actualRoutingKey || "N/A"}"`
        };
      }
      const expectedCount = Number(authoritativeRoute.appraiserCount || 2);
      const authNorm = _AdminDiagnosticModel.normalizeAppraiserSlots({
        topology: authoritativeRoute.topology,
        appraiser1: authoritativeRoute.appraiser1 || authoritativeRoute.Manager_User,
        appraiser2: authoritativeRoute.appraiser2 || authoritativeRoute.GM_User,
        appraiser3: authoritativeRoute.appraiser3,
        appraiser4: authoritativeRoute.appraiser4,
        First_Manager_User: authoritativeRoute.First_Manager_User,
        Manager_User: authoritativeRoute.Manager_User,
        GM_User: authoritativeRoute.GM_User
      });
      const actualNorm = _AdminDiagnosticModel.normalizeAppraiserSlots({
        topology: actualTopology,
        appraiser1: actualAppraiser1,
        appraiser2: actualAppraiser2,
        appraiser3: actualAppraiser3,
        appraiser4: actualAppraiser4,
        First_Manager_User: context.First_Manager_User,
        Manager_User: context.Manager_User,
        GM_User: context.GM_User
      });
      for (let i = 1; i <= expectedCount; i++) {
        const authSlot = authNorm.slots.find((s) => s.slot === i);
        if (!authSlot || !authSlot.userCode) {
          return {
            status: "NOT_EVIDENCED",
            routeMatch: "NOT_EVIDENCED",
            expectedRoutingKey: expectedKey,
            actualRoutingKey: actualRoutingKey || "N/A",
            reason: `Authoritative App795 route is missing required user identity for Slot ${i}`
          };
        }
      }
      const keyMatch = actualRoutingKey === expectedKey;
      const topMatch = actualTopology === authoritativeRoute.topology;
      const countMatch = Number(actualAppraiserCount) === expectedCount;
      const norm = _AdminDiagnosticModel.normalizeUserCode;
      let slotMismatchReason = null;
      for (let i = 1; i <= expectedCount; i++) {
        const authUser = authNorm.slots.find((s) => s.slot === i)?.userCode || "";
        const actualUser = actualNorm.slots.find((s) => s.slot === i)?.userCode || "";
        if (norm(authUser) !== norm(actualUser)) {
          const ordinalLabels = { 1: "1ST", 2: "2ND", 3: "3RD", 4: "4TH" };
          slotMismatchReason = `${ordinalLabels[i]}_APPRAISER_MISMATCH: Actual ${i}st/nd/rd/th Appraiser (${actualUser || "empty"}) does not match authoritative App795 (${authUser})`;
          break;
        }
      }
      let extraSlotError = null;
      const actualTotalSlotsPresent = [actualAppraiser1, actualAppraiser2, actualAppraiser3, actualAppraiser4].filter(Boolean).length;
      if (actualTotalSlotsPresent > expectedCount) {
        extraSlotError = `EXTRA_APPRAISER_SLOT_ERROR: Actual record has ${actualTotalSlotsPresent} appraiser slots, but expected topology count is ${expectedCount}`;
      }
      if (slotMismatchReason) {
        return {
          status: "ERROR",
          routeMatch: "ERROR",
          expectedRoutingKey: expectedKey,
          actualRoutingKey: actualRoutingKey || "N/A",
          expectedTopology: authoritativeRoute.topology,
          actualTopology: actualTopology || "N/A",
          expectedAppraiserCount: expectedCount,
          actualAppraiserCount: actualAppraiserCount || "N/A",
          reason: slotMismatchReason
        };
      }
      if (extraSlotError) {
        return {
          status: "ERROR",
          routeMatch: "ERROR",
          expectedRoutingKey: expectedKey,
          actualRoutingKey: actualRoutingKey || "N/A",
          expectedTopology: authoritativeRoute.topology,
          actualTopology: actualTopology || "N/A",
          expectedAppraiserCount: expectedCount,
          actualAppraiserCount: actualAppraiserCount || "N/A",
          reason: extraSlotError
        };
      }
      const isFullMatch = keyMatch && topMatch && countMatch;
      return {
        status: isFullMatch ? "PASS" : "ERROR",
        routeMatch: isFullMatch ? "PASS" : "ERROR",
        expectedRoutingKey: expectedKey,
        actualRoutingKey: actualRoutingKey || "N/A",
        expectedTopology: authoritativeRoute.topology,
        actualTopology: actualTopology || "N/A",
        expectedAppraiserCount: expectedCount,
        actualAppraiserCount: actualAppraiserCount || "N/A",
        expectedAppraiser1: authoritativeRoute.appraiser1 || "N/A",
        actualAppraiser1: actualAppraiser1 || "N/A",
        expectedAppraiser2: authoritativeRoute.appraiser2 || "N/A",
        actualAppraiser2: actualAppraiser2 || "N/A",
        expectedAppraiser3: authoritativeRoute.appraiser3 || "N/A",
        actualAppraiser3: actualAppraiser3 || "N/A",
        expectedAppraiser4: authoritativeRoute.appraiser4 || "N/A",
        actualAppraiser4: actualAppraiser4 || "N/A",
        reason: isFullMatch ? "Route assignment matches authoritative App795 master" : "Route assignment mismatch with App795 master"
      };
    }
    /**
     * E. Fast Repair Preparation & Root-Cause Classifier.
     * B2 Fix: App796 Fiscal_Year and Config_Status = 'PUBLISHED' evidence are MANDATORY for profileMasterEvidenced.
     * B4 Fix: Routing_Key ONLY appears in repair diff if isPhysicalRoutingKeyProven === true.
     */
    static prepareRepairCandidate(context = {}) {
      const profileEval = _AdminDiagnosticModel.evaluateProfileMatch(context);
      const routeEval = _AdminDiagnosticModel.evaluateRouteMatch(context);
      let workflowEval = { status: "PASS" };
      if (context.currentStatus) {
        workflowEval = _AdminDiagnosticModel.evaluateWorkflowTrace(context);
      }
      const hasProfileError = profileEval.status === "ERROR";
      const hasRouteError = routeEval.status === "ERROR";
      const hasWorkflowError = workflowEval.status === "ERROR";
      const isProfileUncertain = profileEval.status === "NOT_EVIDENCED";
      const isRouteUncertain = routeEval.status === "NOT_EVIDENCED";
      const isProfileOk = profileEval.status === "PASS";
      const isRouteOk = routeEval.status === "PASS";
      let isProfileMasterProven = false;
      if (context.authoritativeProfile) {
        const authCode = context.authoritativeProfile.code || context.authoritativeProfile.Profile_Code;
        const authA = context.authoritativeProfile.partAWeight ?? context.authoritativeProfile.PartA_Weight;
        const authB = context.authoritativeProfile.partBWeight ?? context.authoritativeProfile.PartB_Weight;
        const authFy = context.authoritativeProfile.Fiscal_Year || context.authoritativeProfile.fiscalYear;
        const authStatus = context.authoritativeProfile.Config_Status || context.authoritativeProfile.configStatus;
        const codeMatch = profileEval.expectedProfileCode !== "NOT_EVIDENCED" && authCode === profileEval.expectedProfileCode;
        const aMatch = authA !== void 0 && authA !== null && profileEval.expectedPartAWeight !== null && Number(authA) === profileEval.expectedPartAWeight;
        const bMatch = authB !== void 0 && authB !== null && profileEval.expectedPartBWeight !== null && Number(authB) === profileEval.expectedPartBWeight;
        const fyMatch = Boolean(authFy && context.fiscalYear && authFy === context.fiscalYear);
        const statusMatch = Boolean(authStatus && authStatus === "PUBLISHED");
        isProfileMasterProven = Boolean(codeMatch && aMatch && bMatch && fyMatch && statusMatch);
      }
      let isRouteMasterProven = false;
      if (context.authoritativeRoute) {
        const top = context.authoritativeRoute.topology;
        const count = context.authoritativeRoute.appraiserCount;
        const a1 = context.authoritativeRoute.appraiser1 || context.authoritativeRoute.Manager_User;
        isRouteMasterProven = Boolean(top && count && a1);
      }
      const profileMasterEvidenced = isProfileMasterProven;
      const routeMasterEvidenced = isRouteMasterProven;
      const profileRepairSafe = hasProfileError && isProfileMasterProven;
      const routeRepairSafe = hasRouteError && isRouteMasterProven;
      let rootCause = "NO_REPAIR_NEEDED";
      let problemType = "NONE";
      let authoritativeSource = "All master sources & record fields aligned";
      let recommendedAction = "No repair required. System is operating normally.";
      let targetApp = "N/A";
      let risk = "LOW";
      let impactScope = "0 records";
      if (context.isApp53InputWrong) {
        rootCause = "FIX_EMPLOYEE_MASTER_FIRST";
        problemType = "EMPLOYEE_MASTER_INPUT_INVALID";
        authoritativeSource = "App 53 Staff Master";
        recommendedAction = "Correct Employee Position, Section, or Team in App 53 Staff Master first, then re-run Employee Check.";
        targetApp = "App 53 (Staff Master)";
        risk = "MEDIUM";
        impactScope = "N records (All employees in Section)";
      } else if (context.isApp795RouteWrong) {
        rootCause = "FIX_ROUTING_MASTER_FIRST";
        problemType = "ROUTING_MASTER_CONFIG_INVALID";
        authoritativeSource = "App 795 Routing Master";
        recommendedAction = "Update route assignment or topology in App 795 Routing Master first.";
        targetApp = "App 795 (Routing Master)";
        risk = "HIGH";
        impactScope = "N records (All employees sharing Routing_Key)";
      } else if (context.isApp796ProfileWrong) {
        rootCause = "FIX_SCORING_PROFILE_MASTER_FIRST";
        problemType = "PROFILE_SCORING_MASTER_INVALID";
        authoritativeSource = "App 796 Profile & Scoring Master";
        recommendedAction = "Publish correct Profile_Code or Part A/B ratio configuration in App 796 first.";
        targetApp = "App 796 (Scoring Master)";
        risk = "HIGH";
        impactScope = "N records (All employees sharing Profile_Code)";
      } else if (hasWorkflowError) {
        rootCause = "ESCALATE_WORKFLOW_REPAIR";
        problemType = "WORKFLOW_STATE_INCONSISTENCY";
        authoritativeSource = "Confirmed Process Management 16-State Workflow Model";
        recommendedAction = "WORKFLOW_REPAIR_REQUIRES_SEPARATE_AUTHORIZED_PACKAGE \u2014 Manual process transition required by authorized HR administrator.";
        targetApp = "App 794 (Process Management)";
        risk = "HIGH";
        impactScope = "1 record";
      } else if (isProfileOk && isRouteOk) {
        rootCause = "NO_REPAIR_NEEDED";
        problemType = "NONE";
        authoritativeSource = "All master sources & record fields aligned";
        recommendedAction = "No repair required. System is operating normally.";
        targetApp = "N/A";
        risk = "LOW";
        impactScope = "0 records";
      } else if ((hasProfileError || isProfileUncertain) && (hasRouteError || isRouteUncertain)) {
        if (profileRepairSafe && routeRepairSafe) {
          rootCause = "FIX_THIS_RECORD";
          problemType = "STALE_APP794_SNAPSHOT";
          authoritativeSource = "App 53 / App 795 / App 796 Master Sources (Both Verified Correct)";
          recommendedAction = "Rebind stale Profile_Code, Weights, and Routing fields on this App 794 record snapshot.";
          targetApp = "App 794 (MBO Evaluation Record)";
          risk = "LOW";
          impactScope = "1 record";
        } else {
          rootCause = "BLOCKED_NOT_ENOUGH_EVIDENCE";
          problemType = "INSUFFICIENT_AUTHORITATIVE_EVIDENCE";
          authoritativeSource = "Unknown / Partial Master Source";
          recommendedAction = "Both Profile and Route evidence are required before preparing record repair.";
          targetApp = "N/A";
          risk = "BLOCKED";
          impactScope = "UNKNOWN";
        }
      } else if (hasProfileError) {
        if (profileRepairSafe && (!isRouteUncertain || isRouteMasterProven)) {
          rootCause = "FIX_THIS_RECORD";
          problemType = "STALE_APP794_PROFILE_SNAPSHOT";
          authoritativeSource = "App 796 Profile & Scoring Master (Verified Correct)";
          recommendedAction = "Rebind stale Profile_Code and Weights on this App 794 record snapshot.";
          targetApp = "App 794 (MBO Evaluation Record)";
          risk = "LOW";
          impactScope = "1 record";
        } else {
          rootCause = "BLOCKED_NOT_ENOUGH_EVIDENCE";
          problemType = "INSUFFICIENT_AUTHORITATIVE_EVIDENCE";
          authoritativeSource = "Unknown / Unlinked Scoring Master Source";
          recommendedAction = "Profile mismatch detected. Authoritative App 796 profile evidence matching expected employee classification is required before preparing record repair.";
          targetApp = "N/A";
          risk = "BLOCKED";
          impactScope = "UNKNOWN";
        }
      } else if (hasRouteError) {
        if (routeRepairSafe && (!isProfileUncertain || isProfileMasterProven)) {
          rootCause = "FIX_THIS_RECORD";
          problemType = "STALE_APP794_ROUTE_SNAPSHOT";
          authoritativeSource = "App 795 Routing Master (Verified Correct)";
          recommendedAction = "Rebind stale Routing fields on this App 794 record snapshot.";
          targetApp = "App 794 (MBO Evaluation Record)";
          risk = "LOW";
          impactScope = "1 record";
        } else {
          rootCause = "BLOCKED_NOT_ENOUGH_EVIDENCE";
          problemType = "INSUFFICIENT_AUTHORITATIVE_EVIDENCE";
          authoritativeSource = "Unknown / Unlinked Routing Master Source";
          recommendedAction = "Route mismatch detected. Authoritative App 795 route evidence is required before preparing record repair.";
          targetApp = "N/A";
          risk = "BLOCKED";
          impactScope = "UNKNOWN";
        }
      } else {
        rootCause = "BLOCKED_NOT_ENOUGH_EVIDENCE";
        problemType = "INSUFFICIENT_AUTHORITATIVE_EVIDENCE";
        authoritativeSource = "Unknown / Unlinked Master Source";
        recommendedAction = "Supply authoritative App 53/795/796 evidence before preparing repair.";
        targetApp = "N/A";
        risk = "BLOCKED";
        impactScope = "UNKNOWN";
      }
      const beforeDiff = {};
      const afterDiff = {};
      const fieldsAffected = [];
      if (rootCause === "FIX_THIS_RECORD") {
        if (profileRepairSafe) {
          if (context.actualProfileCode !== profileEval.expectedProfileCode && profileEval.expectedProfileCode !== "NOT_EVIDENCED") {
            beforeDiff.Profile_Code = context.actualProfileCode || "NOT_EVIDENCED";
            afterDiff.Profile_Code = profileEval.expectedProfileCode;
            fieldsAffected.push("Profile_Code");
          }
          if (Number(context.actualPartAWeight) !== profileEval.expectedPartAWeight && profileEval.expectedPartAWeight !== null) {
            beforeDiff.PartA_Weight = context.actualPartAWeight ?? "NOT_EVIDENCED";
            afterDiff.PartA_Weight = profileEval.expectedPartAWeight;
            fieldsAffected.push("PartA_Weight");
          }
          if (Number(context.actualPartBWeight) !== profileEval.expectedPartBWeight && profileEval.expectedPartBWeight !== null) {
            beforeDiff.PartB_Weight = context.actualPartBWeight ?? "NOT_EVIDENCED";
            afterDiff.PartB_Weight = profileEval.expectedPartBWeight;
            fieldsAffected.push("PartB_Weight");
          }
        }
        if (routeRepairSafe) {
          const isPhysicalKeyProven = context.isPhysicalRoutingKeyProven === true;
          const storedKey = context.actualStoredRoutingKey || context.actualRoutingKey;
          if (isPhysicalKeyProven && storedKey && storedKey !== "NOT_AVAILABLE" && storedKey !== routeEval.expectedRoutingKey && routeEval.expectedRoutingKey !== "NOT_EVIDENCED") {
            beforeDiff.Routing_Key = storedKey;
            afterDiff.Routing_Key = routeEval.expectedRoutingKey;
            fieldsAffected.push("Routing_Key");
          }
          if (context.actualTopology !== routeEval.expectedTopology && routeEval.expectedTopology !== "NOT_EVIDENCED") {
            beforeDiff.Routing_Topology = context.actualTopology || "NOT_EVIDENCED";
            afterDiff.Routing_Topology = routeEval.expectedTopology;
            fieldsAffected.push("Routing_Topology");
          }
          if (Number(context.actualAppraiserCount) !== routeEval.expectedAppraiserCount && routeEval.expectedAppraiserCount !== "NOT_EVIDENCED") {
            beforeDiff.Appraiser_Count = context.actualAppraiserCount ?? "NOT_EVIDENCED";
            afterDiff.Appraiser_Count = routeEval.expectedAppraiserCount;
            fieldsAffected.push("Expected_Appraiser_Count");
          }
          if (context.authoritativeRoute) {
            const norm = _AdminDiagnosticModel.normalizeUserCode;
            const authA1 = context.authoritativeRoute.appraiser1 || context.authoritativeRoute.Manager_User;
            const authA2 = context.authoritativeRoute.appraiser2 || context.authoritativeRoute.GM_User;
            const authA3 = context.authoritativeRoute.appraiser3;
            const authA4 = context.authoritativeRoute.appraiser4;
            if (authA1 !== void 0 && norm(context.actualAppraiser1) !== norm(authA1)) {
              beforeDiff.Appraiser1 = context.actualAppraiser1 || "NOT_EVIDENCED";
              afterDiff.Appraiser1 = authA1;
              fieldsAffected.push("1st Appraiser");
            }
            if (authA2 !== void 0 && norm(context.actualAppraiser2) !== norm(authA2)) {
              beforeDiff.Appraiser2 = context.actualAppraiser2 || "NOT_EVIDENCED";
              afterDiff.Appraiser2 = authA2;
              fieldsAffected.push("2nd Appraiser");
            }
            if (authA3 !== void 0 && norm(context.actualAppraiser3) !== norm(authA3)) {
              beforeDiff.Appraiser3 = context.actualAppraiser3 || "NOT_EVIDENCED";
              afterDiff.Appraiser3 = authA3;
              fieldsAffected.push("3rd Appraiser");
            }
            if (authA4 !== void 0 && norm(context.actualAppraiser4) !== norm(authA4)) {
              beforeDiff.Appraiser4 = context.actualAppraiser4 || "NOT_EVIDENCED";
              afterDiff.Appraiser4 = authA4;
              fieldsAffected.push("4th Appraiser");
            }
          }
        }
      }
      return {
        employeeCode: context.employeeCode || "NOT_EVIDENCED",
        fiscalYear: context.fiscalYear || "NOT_EVIDENCED",
        problemType,
        rootCause,
        authoritativeSource,
        recommendedAction,
        targetApp,
        risk,
        impactScope,
        profileMasterEvidenced,
        routeMasterEvidenced,
        profileRecordRepairSafe: profileRepairSafe,
        routeRecordRepairSafe: routeRepairSafe,
        before: beforeDiff,
        after: afterDiff,
        fieldsAffected,
        backupRequired: "YES",
        readbackRequired: "YES",
        rollbackRequired: "YES",
        executionStatus: "NOT EXECUTED",
        repairWriteImplemented: false,
        confirmRepairEnabled: false
      };
    }
    /**
     * Builds detailed read-only Record Diagnostic object.
     * B3 Fix: Uses normalizeAppraiserSlots for topology-aware appraiser slot mapping.
     * B4 Fix: Distinguishes derived expected Routing_Key from stored Routing_Key (NOT_AVAILABLE if physical field unconfirmed).
     */
    static buildRecordDiagnostic(record, options = {}) {
      const getVal = (code) => {
        if (!record) return "";
        const field = record[code];
        if (field === null || field === void 0) return "";
        if (typeof field === "object" && field !== null) {
          if (Array.isArray(field.value) && field.value.length > 0) {
            return field.value[0]?.code || field.value[0] || "";
          }
          if ("value" in field) return field.value ?? "";
        }
        if (Array.isArray(field) && field.length > 0) {
          return field[0]?.code || field[0] || "";
        }
        return String(field);
      };
      const hasPhysicalKeyField = options.isPhysicalRoutingKeyProven === true || record && "Routing_Key" in record;
      const storedRoutingKeyVal = hasPhysicalKeyField ? getVal("Routing_Key") || options.actualStoredRoutingKey || "NOT_AVAILABLE" : "NOT_AVAILABLE";
      const normAppraisers = _AdminDiagnosticModel.normalizeAppraiserSlots({
        topology: options.actualTopology || getVal("Routing_Topology") || "M1_G1",
        appraiser1: options.appraiser1,
        appraiser2: options.appraiser2,
        appraiser3: options.appraiser3,
        appraiser4: options.appraiser4,
        First_Manager_User: getVal("First_Manager_User"),
        Manager_User: getVal("Manager_User"),
        GM_User: getVal("GM_User"),
        GM_Level2_Approvers: getVal("GM_Level2_Approvers")
      });
      const getSlotUser = (slotNum) => {
        const s = normAppraisers.slots.find((x) => x.slot === slotNum);
        return s && s.userCode ? s.userCode : "NOT_EVIDENCED";
      };
      return {
        recordId: getVal("$id") || options.recordId || "NOT_EVIDENCED",
        mboKey: getVal("Record_Key") || options.mboKey || "NOT_EVIDENCED",
        fiscalYear: getVal("Fiscal_Year") || options.fiscalYear || "NOT_EVIDENCED",
        employeeCode: getVal("Employee_Code") || options.employeeCode || "NOT_EVIDENCED",
        employeeName: getVal("Employee_Name") || options.employeeName || "NOT_EVIDENCED",
        requesterUser: getVal("Requester_User") || options.requesterUser || "NOT_EVIDENCED",
        loggedInUserCode: options.loggedInUserCode || "NOT_EVIDENCED",
        currentStatus: getVal("Status") || options.currentStatus || "NOT_EVIDENCED",
        currentActor: options.currentActor || "NOT_EVIDENCED",
        resolvedViewerRole: options.resolvedViewerRole || "NOT_EVIDENCED",
        activeAppraiserSlot: options.activeAppraiserSlot || null,
        expectedAppraiserCount: options.expectedAppraiserCount || normAppraisers.expectedCount,
        appraiser1: options.appraiser1 || getSlotUser(1),
        appraiser2: options.appraiser2 || getSlotUser(2),
        appraiser3: options.appraiser3 || getSlotUser(3),
        appraiser4: options.appraiser4 || getSlotUser(4),
        storedRoutingKey: storedRoutingKeyVal,
        isPhysicalRoutingKeyProven: hasPhysicalKeyField,
        routingKey: options.routingKey || (hasPhysicalKeyField && storedRoutingKeyVal !== "NOT_AVAILABLE" ? storedRoutingKeyVal : "NOT_EVIDENCED"),
        sectionCode: getVal("Section_Code") || options.sectionCode || "NOT_EVIDENCED",
        teamName: getVal("Team") || options.teamName || "NOT_EVIDENCED",
        routingResult: options.routingResult || null,
        profileCode: getVal("Profile_Code") || options.profileCode || null,
        partAWeight: options.partAWeight || null,
        partBWeight: options.partBWeight || null,
        objectiveCount: getVal("Objective_Count") || options.objectiveCount || "NOT_EVIDENCED",
        isObjCountValid: options.isObjCountValid !== false,
        scoringCompleteness: options.scoringCompleteness || { isComplete: false },
        phaseCalendarStatus: options.phaseCalendarStatus || "NOT_EVIDENCED",
        validationErrors: options.validationErrors || [],
        buildVersion: BUILD_VERSION_INFO
      };
    }
    /**
     * Generates a sanitized diagnostic snapshot object.
     * Uses an explicit ALLOWLIST contract for diagnostic sections + recursive redaction defense-in-depth.
     */
    static generateDiagnosticSnapshot(diagnosticData = {}) {
      const {
        health,
        recordDiag,
        workflowTrace,
        profileMatch,
        routeMatch,
        repairCandidate
      } = diagnosticData;
      const allowlisted = {
        recordIdentity: {
          recordId: recordDiag?.recordId || "NOT_EVIDENCED",
          mboKey: recordDiag?.mboKey || "NOT_EVIDENCED",
          fiscalYear: recordDiag?.fiscalYear || "NOT_EVIDENCED",
          employeeCode: recordDiag?.employeeCode || "NOT_EVIDENCED",
          loggedInUserCode: recordDiag?.loggedInUserCode || "NOT_EVIDENCED",
          currentStatus: recordDiag?.currentStatus || "NOT_EVIDENCED"
        },
        healthSummary: health ? { overallHealth: health.overallHealth, evaluatedAt: health.evaluatedAt } : null,
        workflowValidation: workflowTrace || null,
        profileValidation: profileMatch || null,
        routeValidation: routeMatch || null,
        repairRecommendation: repairCandidate ? {
          problemType: repairCandidate.problemType,
          rootCause: repairCandidate.rootCause,
          authoritativeSource: repairCandidate.authoritativeSource,
          recommendedAction: repairCandidate.recommendedAction,
          risk: repairCandidate.risk,
          impactScope: repairCandidate.impactScope,
          executionStatus: repairCandidate.executionStatus
        } : null,
        buildVersion: BUILD_VERSION_INFO
      };
      const raw = JSON.parse(JSON.stringify(allowlisted));
      const sanitizeObj = (obj) => {
        if (!obj || typeof obj !== "object") return;
        for (const key of Object.keys(obj)) {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes("password") || lowerKey.includes("secret") || lowerKey.includes("token") || lowerKey.includes("hash") || lowerKey.includes("cookie") || lowerKey.includes("auth_header")) {
            obj[key] = "[REDACTED_FOR_SECURITY]";
          } else if (typeof obj[key] === "object") {
            sanitizeObj(obj[key]);
          }
        }
      };
      sanitizeObj(raw);
      return {
        title: "MBO Technical Admin Diagnostic Snapshot",
        sanitized: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        systemInfo: BUILD_VERSION_INFO,
        data: raw
      };
    }
  };

  // src/admin/admin-support-center.js
  var AdminSupportCenterUI = class _AdminSupportCenterUI {
    constructor(options = {}) {
      this.container = options.container || null;
      this.diagnosticContext = options.diagnosticContext || {};
      this.activeTab = options.activeTab || "health";
      this.diagnosticProvider = options.diagnosticProvider || null;
      this.checkErrorMessage = null;
      this.checkLoading = false;
    }
    /**
     * Helper to return truth-based indicator badges for UI tables (P1-A).
     */
    static getMatchBadge(status, isMatch) {
      if (status === "NOT_EVIDENCED" || status === "NOT_AVAILABLE" || status === null || status === void 0) {
        return '<span style="background:#475569; color:#f8fafc; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">\u26AA NOT_EVIDENCED</span>';
      }
      if (status === "NOT_APPLICABLE") {
        return '<span style="background:#64748b; color:#f8fafc; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">\u26AA NOT_APPLICABLE</span>';
      }
      if (status === "PASS" || isMatch === true) {
        return '<span style="background:#059669; color:#ffffff; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">\u2705 MATCH</span>';
      }
      return '<span style="background:#dc2626; color:#ffffff; padding:2px 8px; border-radius:3px; font-weight:bold; font-size:11px;">\u274C MISMATCH</span>';
    }
    /**
     * Renders the complete Admin Support Center panel HTML with HTML Output Escaping and security gates.
     */
    renderHtml(context = {}) {
      const activeCtx = { ...this.diagnosticContext, ...context };
      if (!AdminDiagnosticModel.isTechnicalAdmin(activeCtx.loginUserCode)) {
        return `
        <div id="admin-support-center-panel" style="background:#450a0a; border:2px solid #ef4444; border-radius:8px; padding:20px; margin:20px 0; color:#fca5a5; font-family:sans-serif;">
          <h3 style="margin:0 0 8px 0; color:#f87171; font-size:16px;">\u26D4 ACCESS DENIED / \u0E1B\u0E0F\u0E34\u0E40\u0E2A\u0E18\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07</h3>
          <div style="font-size:12px; line-height:1.5;">
            \u0E28\u0E39\u0E19\u0E22\u0E4C\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25 (Admin Support Center) \u0E2A\u0E07\u0E27\u0E19\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04 <code>admin-form</code> \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19<br/>
            User code <strong>"${escapeHtml(activeCtx.loginUserCode || "UNAUTHENTICATED")}"</strong> is not authorized to access read-only Technical Admin Diagnostics.
          </div>
        </div>
      `;
      }
      const health = AdminDiagnosticModel.evaluateSystemHealth(activeCtx);
      const recordDiag = AdminDiagnosticModel.buildRecordDiagnostic(activeCtx.record, activeCtx);
      const workflowTrace = AdminDiagnosticModel.evaluateWorkflowTrace(activeCtx);
      const profileMatch = AdminDiagnosticModel.evaluateProfileMatch(activeCtx);
      const routeMatch = AdminDiagnosticModel.evaluateRouteMatch(activeCtx);
      const repairCandidate = AdminDiagnosticModel.prepareRepairCandidate(activeCtx);
      const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot({
        health,
        recordDiag,
        workflowTrace,
        profileMatch,
        routeMatch,
        repairCandidate
      });
      const statusBadgeClass = {
        PASS: "background:#059669; color:#ffffff;",
        WARNING: "background:#d97706; color:#ffffff;",
        ERROR: "background:#dc2626; color:#ffffff;",
        INCOMPLETE_EVIDENCE: "background:#1e40af; color:#ffffff;",
        BLOCKED: "background:#475569; color:#ffffff;",
        NOT_EVIDENCED: "background:#475569; color:#ffffff;",
        NOT_AVAILABLE: "background:#64748b; color:#ffffff;"
      };
      const riskBadgeClass = {
        LOW: "background:#059669; color:#ffffff;",
        MEDIUM: "background:#d97706; color:#ffffff;",
        HIGH: "background:#dc2626; color:#ffffff;",
        BLOCKED: "background:#475569; color:#ffffff;"
      };
      const getBadge = _AdminSupportCenterUI.getMatchBadge;
      const providerMode = this.diagnosticProvider?.sourceMode || activeCtx.sourceMode || "UNCONFIGURED";
      const isProdEvidence = this.diagnosticProvider?.isProductionEvidence ?? activeCtx.isProductionEvidence ?? false;
      return `
      <div id="admin-support-center-panel" style="background:#0f172a; border:2px solid #3b82f6; border-radius:8px; padding:20px; margin:20px 0; color:#f8fafc; font-family:sans-serif;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:15px; margin-bottom:15px;">
          <div>
            <h2 style="margin:0 0 5px 0; font-size:18px; color:#60a5fa; display:flex; align-items:center; gap:8px;">
              \u{1F6E1}\uFE0F Admin Support Center / \u0E28\u0E39\u0E19\u0E22\u0E4C\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25
              <span style="font-size:11px; background:#1e40af; color:#dbeafe; padding:3px 8px; border-radius:12px; font-weight:normal;">TECHNICAL ADMIN / READ-ONLY DIAGNOSTICS</span>
            </h2>
            <div style="font-size:12px; color:#94a3b8;">
              \u0E23\u0E30\u0E1A\u0E1A\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E27\u0E34\u0E28\u0E27\u0E01\u0E23\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A \u2022 0 Business Workflow Authority
            </div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:12px; padding:6px 12px; border-radius:4px; font-weight:bold; ${statusBadgeClass[health.overallHealth] || statusBadgeClass.INCOMPLETE_EVIDENCE}">
              OVERALL HEALTH: ${escapeHtml(health.overallHealth)}
            </span>
            <!-- Explicit Evidence Provider Badge -->
            <div style="margin-top:4px;">
              ${providerMode === "PREVIEW_FIXTURE" ? `
                <span style="font-size:10px; background:#9a3412; color:#ffedd5; padding:2px 6px; border-radius:4px; font-weight:bold;">\u26A0\uFE0F PREVIEW FIXTURE EVIDENCE (NOT PRODUCTION EVIDENCE)</span>
              ` : isProdEvidence ? `
                <span style="font-size:10px; background:#065f46; color:#d1fae5; padding:2px 6px; border-radius:4px; font-weight:bold;">\u{1F512} PRODUCTION KINTONE EVIDENCE</span>
              ` : `
                <span style="font-size:10px; background:#334155; color:#94a3b8; padding:2px 6px; border-radius:4px; font-weight:bold;">\u26AA PROVIDER NOT CONFIGURED</span>
              `}
            </div>
          </div>
        </div>

        <!-- Security Boundary Notice -->
        <div style="background:#1e293b; border-left:4px solid #f59e0b; padding:10px 15px; margin-bottom:15px; border-radius:0 4px 4px 0; font-size:12px; color:#cbd5e1;">
          \u26A0\uFE0F <strong>\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15\u0E04\u0E27\u0E32\u0E21\u0E1B\u0E25\u0E2D\u0E14\u0E20\u0E31\u0E22 (Security Boundary Notice):</strong> \u0E1A\u0E31\u0E0D\u0E0A\u0E35 <code>admin-form</code> \u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19 (Technical Admin Only) <strong>\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E18\u0E38\u0E23\u0E01\u0E23\u0E23\u0E21\u0E17\u0E32\u0E07\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08</strong> (0 Business Workflow Authority: \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E01\u0E14\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34, \u0E2A\u0E48\u0E07\u0E01\u0E25\u0E31\u0E1A, \u0E25\u0E07\u0E04\u0E30\u0E41\u0E19\u0E19 \u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E41\u0E17\u0E19\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19/\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19/HR \u0E44\u0E14\u0E49)
        </div>

        <!-- Section Tabs -->
        <div style="display:flex; gap:8px; border-bottom:1px solid #334155; margin-bottom:15px; padding-bottom:10px; overflow-x:auto;">
          <button type="button" class="admin-tab-btn" data-tab="health" style="background:${this.activeTab === "health" ? "#1e40af" : "#1e293b"}; border:1px solid #3b82f6; color:${this.activeTab === "health" ? "#ffffff" : "#60a5fa"}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            1. System Health (\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E23\u0E30\u0E1A\u0E1A)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="check" style="background:${this.activeTab === "check" ? "#1e40af" : "#1e293b"}; border:1px solid #475569; color:${this.activeTab === "check" ? "#ffffff" : "#94a3b8"}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            2. Employee Check (\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="validation" style="background:${this.activeTab === "validation" ? "#1e40af" : "#1e293b"}; border:1px solid #475569; color:${this.activeTab === "validation" ? "#ffffff" : "#94a3b8"}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            3. Workflow & Route Trace (\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="candidate" style="background:${this.activeTab === "candidate" ? "#1e40af" : "#1e293b"}; border:1px solid #475569; color:${this.activeTab === "candidate" ? "#ffffff" : "#94a3b8"}; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; white-space:nowrap;">
            4. Repair Candidate (\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E01\u0E32\u0E23\u0E0B\u0E48\u0E2D\u0E21\u0E41\u0E0B\u0E21)
          </button>
          <button type="button" class="admin-tab-btn" data-tab="repair" style="background:#1e293b; border:1px solid #475569; color:#64748b; padding:8px 12px; border-radius:4px; cursor:not-allowed; font-size:12px; white-space:nowrap;" disabled>
            5. Controlled Repair (\u{1F512} \u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19)
          </button>
        </div>

        <!-- Tab 1: System Health -->
        <div id="admin-tab-content-health" style="display:${this.activeTab === "health" ? "block" : "none"};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E0A\u0E35\u0E49\u0E27\u0E31\u0E14\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E23\u0E30\u0E1A\u0E1A (15 Diagnostic Indicators)</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:10px; margin-bottom:15px;">
            ${health.items.map((item) => `
              <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:10px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#f1f5f9;">${escapeHtml(item.labelTH)}</strong>
                  <span style="font-size:10px; padding:2px 6px; border-radius:3px; font-weight:bold; ${statusBadgeClass[item.status] || statusBadgeClass.NOT_AVAILABLE}">
                    ${escapeHtml(item.status)}
                  </span>
                </div>
                <div style="color:#94a3b8; font-size:11px; word-break:break-word;">
                  ${escapeHtml(item.reason)}
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Tab 2: Employee Check -->
        <div id="admin-tab-content-check" style="display:${this.activeTab === "check" ? "block" : "none"};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">Employee-Centric Record Check (\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E15\u0E31\u0E27\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19)</h3>
          <div style="background:#1e293b; border:1px solid #334155; padding:15px; border-radius:6px; margin-bottom:15px;">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px;">
              <div>
                <label style="font-size:11px; color:#94a3b8; display:block; margin-bottom:4px;">Employee Code / \u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19</label>
                <input type="text" id="admin-check-emp-code" value="${recordDiag.employeeCode === "NOT_EVIDENCED" ? "" : escapeHtml(recordDiag.employeeCode)}" placeholder="Enter Employee Code (e.g. 0118)" style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 10px; border-radius:4px; font-size:12px; width:180px;" />
              </div>
              <div>
                <label style="font-size:11px; color:#94a3b8; display:block; margin-bottom:4px;">Fiscal Year / \u0E1B\u0E35\u0E07\u0E1A\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13</label>
                <input type="text" id="admin-check-fy" value="${recordDiag.fiscalYear === "NOT_EVIDENCED" ? "" : escapeHtml(recordDiag.fiscalYear)}" placeholder="e.g. 2026" style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 10px; border-radius:4px; font-size:12px; width:100px;" />
              </div>
              <div style="margin-top:16px;">
                <button type="button" id="admin-btn-check-employee" style="background:#2563eb; color:#ffffff; border:none; padding:7px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">
                  ${this.checkLoading ? "\u23F3 CHECKING..." : "\u{1F50D} CHECK EMPLOYEE"}
                </button>
              </div>
            </div>

            ${this.checkErrorMessage ? `
              <div style="background:#450a0a; border:1px solid #ef4444; color:#fca5a5; padding:8px 12px; border-radius:4px; font-size:12px; margin-bottom:12px;">
                \u274C ${escapeHtml(this.checkErrorMessage)}
              </div>
            ` : ""}

            <table style="width:100%; border-collapse:collapse; font-size:12px; color:#cbd5e1; background:#0f172a; border-radius:6px; overflow:hidden;">
              <tbody>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; width:220px; color:#94a3b8;">Record ID / MBO Key:</td><td style="padding:8px 12px;">${escapeHtml(recordDiag.recordId)} / ${escapeHtml(recordDiag.mboKey)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Employee Name / Requester:</td><td style="padding:8px 12px;">${escapeHtml(recordDiag.employeeName)} \u2022 Requester: ${escapeHtml(recordDiag.requesterUser)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Current Workflow Status:</td><td style="padding:8px 12px; color:#38bdf8; font-weight:bold;">${escapeHtml(recordDiag.currentStatus)}</td></tr>
                <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Routing Key / Stored Key:</td><td style="padding:8px 12px;">Derived: ${escapeHtml(recordDiag.routingKey)} \u2022 Stored: ${escapeHtml(recordDiag.storedRoutingKey)}</td></tr>
                <tr><td style="padding:8px 12px; font-weight:bold; color:#94a3b8;">Appraiser Slot Sequence:</td><td style="padding:8px 12px;">1st: ${escapeHtml(recordDiag.appraiser1)} | 2nd: ${escapeHtml(recordDiag.appraiser2)} | 3rd: ${escapeHtml(recordDiag.appraiser3)} | 4th: ${escapeHtml(recordDiag.appraiser4)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 3: Workflow & Route Validation -->
        <div id="admin-tab-content-validation" style="display:${this.activeTab === "validation" ? "block" : "none"};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">Workflow Trace, Profile & Route Validation</h3>

          <!-- Card 1: Workflow Trace -->
          <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:6px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#60a5fa; font-size:13px;">1. Workflow Trace & State Consistency Check</strong>
              <span style="font-size:10px; padding:2px 8px; border-radius:3px; font-weight:bold; ${statusBadgeClass[workflowTrace.status] || statusBadgeClass.NOT_EVIDENCED}">
                ${escapeHtml(workflowTrace.status)}
              </span>
            </div>
            <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">
              <strong>Expected Workflow Path:</strong> <code style="color:#38bdf8;">${escapeHtml(workflowTrace.expectedPath)}</code>
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              Status Reason: ${escapeHtml(workflowTrace.reason)}<br/>
              Actual Workflow Log Status: <span style="color:#f59e0b;">${escapeHtml(workflowTrace.historyStatus)}</span>
            </div>
          </div>

          <!-- Card 2: Profile Check -->
          <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:6px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#60a5fa; font-size:13px;">2. Expected vs Actual Evaluation Profile Check</strong>
              <span style="font-size:10px; padding:2px 8px; border-radius:3px; font-weight:bold; ${statusBadgeClass[profileMatch.status] || statusBadgeClass.NOT_EVIDENCED}">
                ${escapeHtml(profileMatch.status)}
              </span>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#cbd5e1;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; text-align:left;">
                  <th style="padding:4px;">Metric</th>
                  <th style="padding:4px;">Expected (App796 Master)</th>
                  <th style="padding:4px;">Actual (App794 Record)</th>
                  <th style="padding:4px;">Match</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Profile Code</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.expectedProfileCode)}</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.actualProfileCode)}</td>
                  <td style="padding:4px;">${getBadge(profileMatch.status, profileMatch.expectedProfileCode === profileMatch.actualProfileCode)}</td>
                </tr>
                <tr>
                  <td style="padding:4px; font-weight:bold;">Part A / Part B Weight</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.expectedPartAWeight)}% / ${escapeHtml(profileMatch.expectedPartBWeight)}%</td>
                  <td style="padding:4px;">${escapeHtml(profileMatch.actualPartAWeight)}% / ${escapeHtml(profileMatch.actualPartBWeight)}%</td>
                  <td style="padding:4px;">${getBadge(profileMatch.status, profileMatch.expectedPartAWeight === profileMatch.actualPartAWeight && profileMatch.expectedPartBWeight === profileMatch.actualPartBWeight)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size:11px; color:#94a3b8; margin-top:6px;">${escapeHtml(profileMatch.reason)}</div>
          </div>

          <!-- Card 3: Route Check -->
          <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#60a5fa; font-size:13px;">3. Expected vs Actual Route Assignment Check</strong>
              <span style="font-size:10px; padding:2px 8px; border-radius:3px; font-weight:bold; ${statusBadgeClass[routeMatch.status] || statusBadgeClass.NOT_EVIDENCED}">
                ${escapeHtml(routeMatch.status)}
              </span>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#cbd5e1;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; text-align:left;">
                  <th style="padding:4px;">Attribute</th>
                  <th style="padding:4px;">Expected (App795 Master)</th>
                  <th style="padding:4px;">Actual (App794 Record)</th>
                  <th style="padding:4px;">Match</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Routing Key</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedRoutingKey)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualRoutingKey)}</td>
                  <td style="padding:4px;">${getBadge(routeMatch.status, routeMatch.expectedRoutingKey === routeMatch.actualRoutingKey)}</td>
                </tr>
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:4px; font-weight:bold;">Routing Topology</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedTopology)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualTopology)}</td>
                  <td style="padding:4px;">${getBadge(routeMatch.status, routeMatch.expectedTopology === routeMatch.actualTopology)}</td>
                </tr>
                <tr>
                  <td style="padding:4px; font-weight:bold;">Appraiser Count</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.expectedAppraiserCount)}</td>
                  <td style="padding:4px;">${escapeHtml(routeMatch.actualAppraiserCount)}</td>
                  <td style="padding:4px;">${getBadge(routeMatch.status, routeMatch.expectedAppraiserCount === routeMatch.actualAppraiserCount)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size:11px; color:#94a3b8; margin-top:6px;">${escapeHtml(routeMatch.reason)}</div>
          </div>
        </div>

        <!-- Tab 4: Repair Candidate -->
        <div id="admin-tab-content-candidate" style="display:${this.activeTab === "candidate" ? "block" : "none"};">
          <h3 style="font-size:14px; color:#e2e8f0; margin-top:0;">Prepare Repair Candidate (\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E48\u0E2D\u0E19-\u0E2B\u0E25\u0E31\u0E07\u0E0B\u0E48\u0E2D\u0E21\u0E41\u0E0B\u0E21)</h3>
          
          <div style="background:#1e293b; border:1px solid #334155; padding:15px; border-radius:6px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div>
                <strong style="color:#f59e0b; font-size:13px;">Root Cause Classification: ${escapeHtml(repairCandidate.rootCause)}</strong>
                <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Problem Type: ${escapeHtml(repairCandidate.problemType)}</div>
              </div>
              <div>
                <span style="font-size:11px; padding:4px 10px; border-radius:3px; font-weight:bold; ${riskBadgeClass[repairCandidate.risk] || riskBadgeClass.LOW}">
                  RISK: ${escapeHtml(repairCandidate.risk)}
                </span>
              </div>
            </div>

            <div style="font-size:12px; color:#cbd5e1; background:#0f172a; padding:10px; border-radius:4px; margin-bottom:12px;">
              <strong>Authoritative Source:</strong> ${escapeHtml(repairCandidate.authoritativeSource)}<br/>
              <strong>Recommended Action:</strong> ${escapeHtml(repairCandidate.recommendedAction)}<br/>
              <strong>Impact Scope:</strong> ${escapeHtml(repairCandidate.impactScope)} \u2022 Target App: ${escapeHtml(repairCandidate.targetApp)}
            </div>

            <!-- Exact Before / After Diff Table -->
            <h4 style="font-size:12px; color:#60a5fa; margin:10px 0 6px 0;">Exact Field Diff (Before vs After)</h4>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#cbd5e1; background:#0f172a; border-radius:4px; overflow:hidden; margin-bottom:10px;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; text-align:left;">
                  <th style="padding:6px 10px;">Field Name</th>
                  <th style="padding:6px 10px; color:#ef4444;">Before (Current Record)</th>
                  <th style="padding:6px 10px; color:#10b981;">After (Proposed Candidate)</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(repairCandidate.before).length > 0 ? Object.keys(repairCandidate.before).map((field) => `
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:6px 10px; font-weight:bold;">${escapeHtml(field)}</td>
                    <td style="padding:6px 10px; color:#fca5a5;">${escapeHtml(repairCandidate.before[field])}</td>
                    <td style="padding:6px 10px; color:#6ee7b7;">${escapeHtml(repairCandidate.after[field])}</td>
                  </tr>
                `).join("") : `
                  <tr><td colspan="3" style="padding:8px 10px; color:#94a3b8; text-align:center;">No safe field diff available (BLOCKED or NO_REPAIR_NEEDED)</td></tr>
                `}
              </tbody>
            </table>

            <div style="font-size:11px; color:#94a3b8; display:flex; gap:15px;">
              <span>Backup Required: <strong>${escapeHtml(repairCandidate.backupRequired)}</strong></span>
              <span>Read-back Required: <strong>${escapeHtml(repairCandidate.readbackRequired)}</strong></span>
              <span>Rollback Required: <strong>${escapeHtml(repairCandidate.rollbackRequired)}</strong></span>
              <span>Execution Status: <strong style="color:#f59e0b;">${escapeHtml(repairCandidate.executionStatus)}</strong></span>
            </div>
          </div>
        </div>

        <!-- Tab 5: Controlled Repair Placeholder -->
        <div id="admin-tab-content-repair" style="display:none; background:#1e293b; padding:15px; border-radius:6px; border:1px solid #334155;">
          <h3 style="font-size:14px; color:#f59e0b; margin-top:0;">\u{1F512} Controlled Repair Contract Placeholder</h3>
          <p style="font-size:12px; color:#94a3b8; margin:0 0 10px 0;">
            \u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E01\u0E32\u0E23\u0E41\u0E01\u0E49\u0E44\u0E02\u0E09\u0E38\u0E01\u0E40\u0E09\u0E34\u0E19\u0E17\u0E35\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E04\u0E27\u0E1A\u0E04\u0E38\u0E21 (Controlled Repair) \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E16\u0E39\u0E01\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E43\u0E19\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E19\u0E35\u0E49 \u0E01\u0E32\u0E23\u0E0B\u0E48\u0E2D\u0E21\u0E41\u0E0B\u0E21\u0E40\u0E23\u0E04\u0E04\u0E2D\u0E23\u0E4C\u0E14\u0E2B\u0E23\u0E37\u0E2D\u0E2A\u0E04\u0E35\u0E21\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15\u0E41\u0E22\u0E01\u0E15\u0E48\u0E32\u0E07\u0E2B\u0E32\u0E01
          </p>
          <div style="margin-bottom:12px;">
            <button type="button" disabled style="background:#475569; color:#94a3b8; border:none; padding:8px 16px; border-radius:4px; cursor:not-allowed; font-weight:bold; font-size:12px;">
              \u{1F6AB} CONFIRM REPAIR (DISABLED \u2014 NO KINTONE AUTHORIZATION)
            </button>
          </div>
          <div style="font-size:11px; color:#64748b;">
            <code>CONFIRM_REPAIR_ENABLED = false</code> | <code>REPAIR_WRITE_IMPLEMENTED = false</code> | <code>KINTONE_WRITE = 0</code>
          </div>
        </div>

        <!-- Snapshot Action -->
        <div style="margin-top:15px; border-top:1px solid #334155; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
          <button type="button" id="admin-snapshot-btn" style="background:#2563eb; color:#ffffff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">
            \u{1F4C4} Generate Diagnostic Snapshot (\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E01\u0E32\u0E23\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22)
          </button>
          <span style="font-size:11px; color:#64748b;">Allowlist Contract \u2022 Secrets & Passwords Redacted</span>
        </div>

        <!-- Snapshot Output Container -->
        <div id="admin-snapshot-output" style="display:none; margin-top:10px;">
          <textarea readonly style="width:100%; height:160px; background:#020617; color:#38bdf8; border:1px solid #334155; border-radius:4px; font-family:monospace; font-size:11px; padding:10px; box-sizing:border-box;">${escapeHtml(JSON.stringify(snapshot, null, 2))}</textarea>
        </div>
      </div>
    `;
    }
    /**
     * Attaches interactive DOM event listeners to a rendered container element with clean delegation.
     */
    attachEventListeners(rootContainer) {
      if (!rootContainer) return;
      this.container = rootContainer;
      if (this._boundClickHandler) {
        rootContainer.removeEventListener("click", this._boundClickHandler);
      }
      this._boundClickHandler = async (e) => {
        const tabBtn = e.target.closest(".admin-tab-btn");
        if (tabBtn && !tabBtn.disabled) {
          const targetTab = tabBtn.getAttribute("data-tab");
          if (targetTab) {
            this.activeTab = targetTab;
            this.reRender();
          }
          return;
        }
        const checkBtn = e.target.closest("#admin-btn-check-employee");
        if (checkBtn && !this.checkLoading) {
          const empCodeInput = rootContainer.querySelector("#admin-check-emp-code");
          const fyInput = rootContainer.querySelector("#admin-check-fy");
          const empCode = empCodeInput ? empCodeInput.value.trim() : "";
          const fy = fyInput ? fyInput.value.trim() : "";
          if (!this.diagnosticProvider) {
            this.checkErrorMessage = "PROVIDER_NOT_CONFIGURED: Production diagnostic provider is not configured.";
            this.reRender();
            return;
          }
          this.checkErrorMessage = null;
          this.checkLoading = true;
          this.reRender();
          try {
            const result = await this.diagnosticProvider.checkEmployee(empCode, fy);
            this.diagnosticContext = {
              ...this.diagnosticContext,
              ...result,
              employeeCode: empCode,
              fiscalYear: fy
            };
            this.checkLoading = false;
            this.reRender();
          } catch (err) {
            this.checkLoading = false;
            this.checkErrorMessage = err.message || "Error occurred during employee check";
            this.reRender();
          }
          return;
        }
        const snapshotBtn = e.target.closest("#admin-snapshot-btn");
        if (snapshotBtn) {
          const outputEl = rootContainer.querySelector("#admin-snapshot-output");
          if (outputEl) {
            outputEl.style.display = outputEl.style.display === "none" ? "block" : "none";
          }
          return;
        }
      };
      rootContainer.addEventListener("click", this._boundClickHandler);
    }
    reRender() {
      if (!this.container) return;
      this.container.innerHTML = this.renderHtml();
      this.attachEventListeners(this.container);
    }
  };

  // src/ui/employee-part-a-ui.js
  var CANONICAL_TOPOLOGIES = ["M1_G1", "M1_M2_G1", "M1_G1_G2", "M1_M2_G1_G2", "M1_ONLY"];
  var WORKFLOW_PATH_M1_ONLY = [
    "01 Draft Objective",
    "03 Manager Objective Review",
    "05 Objective Approved",
    "06 Employee Mid-Year",
    "08 Manager Mid-Year Review",
    "10 Mid-Year Completed",
    "11 Employee Self Evaluation",
    "13 Manager Final Evaluation",
    "15 HR Final Check",
    "16 Completed"
  ];
  var WORKFLOW_PATH_M1_G1 = [
    "01 Draft Objective",
    "03 Manager Objective Review",
    "04 GM Objective Review",
    "05 Objective Approved",
    "06 Employee Mid-Year",
    "08 Manager Mid-Year Review",
    "09 GM Mid-Year Review",
    "10 Mid-Year Completed",
    "11 Employee Self Evaluation",
    "13 Manager Final Evaluation",
    "14 GM Final Evaluation",
    "15 HR Final Check",
    "16 Completed"
  ];
  var WORKFLOW_PATH_M1_M2_G1 = [
    "01 Draft Objective",
    "02 First Manager Objective Review",
    "03 Manager Objective Review",
    "04 GM Objective Review",
    "05 Objective Approved",
    "06 Employee Mid-Year",
    "07 First Manager Mid-Year Review",
    "08 Manager Mid-Year Review",
    "09 GM Mid-Year Review",
    "10 Mid-Year Completed",
    "11 Employee Self Evaluation",
    "12 First Manager Final Evaluation",
    "13 Manager Final Evaluation",
    "14 GM Final Evaluation",
    "15 HR Final Check",
    "16 Completed"
  ];
  var DEFAULT_PHASE_CALENDAR = {
    objectives: { start: "2026-01-01", end: "2026-03-31", label: "Jan 1 - Mar 31, 2026" },
    midyear: { start: "2026-06-01", end: "2026-07-31", label: "Jun 1 - Jul 31, 2026" },
    selfEvaluation: { start: "2026-10-01", end: "2026-10-31", label: "Oct 1 - Oct 31, 2026" },
    appraiserEvaluation: { start: "2026-11-01", end: "2026-11-30", label: "Nov 1 - Nov 30, 2026" },
    hrFinal: { start: "2026-12-01", end: "2026-12-31", label: "Dec 1 - Dec 31, 2026" }
  };
  function calculateDeadlineInfo(startDateIso, endDateIso, nowIso = "2026-06-15", isCompleted = false) {
    if (isCompleted) {
      return {
        status: "Completed",
        labelTH: "\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E41\u0E25\u0E49\u0E27",
        labelEN: "Completed",
        daysTextTH: "\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27",
        daysTextEN: "Phase process completed",
        calloutTextTH: "\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C",
        calloutTextEN: "COMPLETED",
        badgeClass: "mbo-deadline-completed",
        isCompleted: true
      };
    }
    const parseLocalDate = (isoStr) => {
      const s = String(isoStr || "").trim();
      return new Date(s.includes("T") ? s : `${s}T00:00:00`);
    };
    const now = parseLocalDate(nowIso);
    const start = parseLocalDate(startDateIso);
    const end = parseLocalDate(endDateIso);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const msPerDay = 864e5;
    if (now < start) {
      const diffDays = Math.round((start - now) / msPerDay);
      return {
        status: "Upcoming",
        labelTH: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14",
        labelEN: "Upcoming",
        daysTextTH: `\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E19 ${diffDays} \u0E27\u0E31\u0E19 (${startDateIso})`,
        daysTextEN: `Opens in ${diffDays} days (${startDateIso})`,
        calloutTextTH: `\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E19 ${diffDays} \u0E27\u0E31\u0E19`,
        calloutTextEN: `Opens in ${diffDays} days`,
        badgeClass: "mbo-deadline-upcoming",
        isUpcoming: true,
        diffDays
      };
    }
    if (now > end) {
      const overdueDays = Math.round((now - end) / msPerDay);
      return {
        status: "Overdue",
        labelTH: "\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14",
        labelEN: "Overdue",
        daysTextTH: `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14 ${overdueDays} \u0E27\u0E31\u0E19 (\u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14 ${endDateIso})`,
        daysTextEN: `${overdueDays} days overdue (Due ${endDateIso})`,
        calloutTextTH: `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14 ${overdueDays} \u0E27\u0E31\u0E19`,
        calloutTextEN: `${overdueDays} DAYS OVERDUE`,
        badgeClass: "mbo-deadline-overdue",
        isOverdue: true,
        overdueDays
      };
    }
    const remDays = Math.round((end - now) / msPerDay);
    if (remDays === 0) {
      return {
        status: "Due Today",
        labelTH: "\u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49",
        labelEN: "Due Today",
        daysTextTH: `\u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49 (${endDateIso})`,
        daysTextEN: `Due today (${endDateIso})`,
        calloutTextTH: `\u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49`,
        calloutTextEN: `DUE TODAY`,
        badgeClass: "mbo-deadline-due-today",
        isDueToday: true,
        remDays: 0
      };
    }
    const isDueSoon = remDays >= 1 && remDays <= 7;
    return {
      status: "Open",
      labelTH: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E1B\u0E34\u0E14",
      labelEN: "Open",
      daysTextTH: `\u0E40\u0E2B\u0E25\u0E37\u0E2D ${remDays} \u0E27\u0E31\u0E19 (\u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14 ${endDateIso})`,
      daysTextEN: `${remDays} days remaining (Due ${endDateIso})`,
      calloutTextTH: `\u0E40\u0E2B\u0E25\u0E37\u0E2D ${remDays} \u0E27\u0E31\u0E19`,
      calloutTextEN: `${remDays} DAYS REMAINING`,
      badgeClass: isDueSoon ? "mbo-deadline-due-soon" : "mbo-deadline-open",
      isOpen: true,
      isDueSoon,
      remDays
    };
  }
  function escapeHtml2(str) {
    if (str === null || str === void 0) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function formatUserDisplay(userArr) {
    if (!userArr || !Array.isArray(userArr) || userArr.length === 0) return "-";
    const u = userArr[0];
    if (typeof u === "string") return escapeHtml2(u);
    if (typeof u === "object" && u !== null) {
      if (u.name && u.code) return `${escapeHtml2(u.name)} (${escapeHtml2(u.code)})`;
      if (u.name) return escapeHtml2(u.name);
      if (u.code) return escapeHtml2(u.code);
    }
    return "-";
  }
  function classifyTopologyForUI(topology) {
    if (topology === null || topology === void 0) {
      return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: false, raw: "" };
    }
    const raw = String(topology).trim();
    if (!raw || !CANONICAL_TOPOLOGIES.includes(raw)) {
      return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: false, raw };
    }
    if (raw === "M1_G1_G2" || raw === "M1_M2_G1_G2") {
      return { isCanonical: true, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: true, raw };
    }
    return {
      isCanonical: true,
      isSupportedV1: true,
      isM1G1: raw === "M1_G1",
      isM1M2G1: raw === "M1_M2_G1",
      isM1Only: raw === "M1_ONLY",
      isG2: false,
      raw
    };
  }
  function getApplicableWorkflowPath(topology = "M1_G1") {
    const topInfo = classifyTopologyForUI(topology);
    if (!topInfo.isCanonical || !topInfo.isSupportedV1) return null;
    if (topInfo.isM1Only) return WORKFLOW_PATH_M1_ONLY;
    if (topInfo.isM1G1) return WORKFLOW_PATH_M1_G1;
    if (topInfo.isM1M2G1) return WORKFLOW_PATH_M1_M2_G1;
    return null;
  }
  function getVisualScreen(status) {
    const currentStatus = String(status || "").trim();
    if (["01 Draft Objective", "02 First Manager Objective Review", "03 Manager Objective Review", "04 GM Objective Review", "05 Objective Approved"].includes(currentStatus)) {
      return "objectives";
    }
    if (["06 Employee Mid-Year", "07 First Manager Mid-Year Review", "08 Manager Mid-Year Review", "09 GM Mid-Year Review", "10 Mid-Year Completed"].includes(currentStatus)) {
      return "midyear";
    }
    if (currentStatus === "11 Employee Self Evaluation") {
      return "self_eval";
    }
    if (["12 First Manager Final Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation"].includes(currentStatus)) {
      return "appraiser_eval";
    }
    if (["15 HR Final Check", "16 Completed"].includes(currentStatus)) {
      return "hr_final";
    }
    return null;
  }
  function getProcessProgress(status, topology = "M1_G1") {
    const currentStatus = String(status || "").trim();
    const pathList = getApplicableWorkflowPath(topology);
    if (!pathList) {
      return {
        percent: 0,
        stepIndex: 1,
        label: "Invalid / Unsupported Topology",
        isMismatch: true,
        mismatchMessage: `Routing topology ("${escapeHtml2(String(topology || ""))}") is missing, unrecognized, or unsupported in V1.`
      };
    }
    const idx = pathList.indexOf(currentStatus);
    if (idx === -1) {
      return {
        percent: 0,
        stepIndex: 1,
        label: "Status Not Applicable to Route",
        isMismatch: true,
        mismatchMessage: `Status "${escapeHtml2(currentStatus)}" is not applicable to active ${escapeHtml2(String(topology))} route.`
      };
    }
    const percent = Math.round((idx + 1) / pathList.length * 100);
    const macroStage = getMacroStage(currentStatus);
    return {
      percent,
      stepIndex: macroStage,
      label: `${macroStage}. Stage Progress (${idx + 1}/${pathList.length}: ${currentStatus})`,
      isMismatch: false,
      mismatchMessage: ""
    };
  }
  function getPhaseCalendarStatus(stageKey, currentStatus, nowIso = "2026-06-15", calendar = DEFAULT_PHASE_CALENDAR) {
    const currentStage = getMacroStage(currentStatus);
    const stageMap = { objectives: 1, midyear: 2, selfEvaluation: 3, appraiserEvaluation: 4, hrFinal: 5 };
    const targetStage = stageMap[stageKey] || 1;
    const cal = calendar || DEFAULT_PHASE_CALENDAR;
    const dates = cal[stageKey] || { start: "2026-01-01", end: "2026-12-31", label: "TBD" };
    const isCompleted = currentStage > targetStage || currentStatus === "16 Completed";
    return calculateDeadlineInfo(dates.start, dates.end, nowIso, isCompleted);
  }
  function getStatusGuidance(status, topology) {
    const currentStatus = String(status || "").trim();
    const topInfo = classifyTopologyForUI(topology);
    if (!topInfo.isCanonical) {
      return {
        th: topInfo.raw ? `\u26A0\uFE0F \u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E04\u0E2D\u0E19\u0E1F\u0E34\u0E01: \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing Topology ("${escapeHtml2(topInfo.raw)}") \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator` : "\u26A0\uFE0F \u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E04\u0E2D\u0E19\u0E1F\u0E34\u0E01: \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing Topology \u0E43\u0E19\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator",
        en: topInfo.raw ? `\u26A0\uFE0F Configuration warning: Unrecognized Routing Topology ("${escapeHtml2(topInfo.raw)}"). Please contact HR / Administrator.` : "\u26A0\uFE0F Configuration warning: Routing Topology not specified in record. Please contact HR / Administrator.",
        isWarning: true
      };
    }
    if (topInfo.isG2) {
      return {
        th: `\u26A0\uFE0F \u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E04\u0E2D\u0E19\u0E1F\u0E34\u0E01: \u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 ${escapeHtml2(topInfo.raw)} \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A MBO V1 \u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A M1_G1 \u0E41\u0E25\u0E30 M1_M2_G1 \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19)`,
        en: `\u26A0\uFE0F Configuration warning: Topology ${escapeHtml2(topInfo.raw)} is unsupported in current V1 workflow. Please contact HR / Administrator.`,
        isWarning: true
      };
    }
    const firstManagerWarning = {
      th: "\u26A0\uFE0F \u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E04\u0E2D\u0E19\u0E1F\u0E34\u0E01: \u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 M1_G1 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49 First Manager \u0E2B\u0E32\u0E01\u0E1E\u0E1A\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E19\u0E35\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator",
      en: "\u26A0\uFE0F Configuration warning: M1_G1 topology does not use First Manager. Please contact HR / Administrator.",
      isWarning: true
    };
    const guidanceMap = {
      "01 Draft Objective": {
        th: "\u0E01\u0E23\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E30\u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19\u0E43\u0E2B\u0E49\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C (\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 100%) \u0E41\u0E25\u0E49\u0E27\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 Submit \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E48\u0E07\u0E43\u0E2B\u0E49 Manager \u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32",
        en: "Fill Objectives & Action Plan (Total Weight 100%), then click Submit above for Manager review.",
        isWarning: false
      },
      "02 First Manager Objective Review": topInfo.isM1G1 ? firstManagerWarning : {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E42\u0E14\u0E22 First Manager / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under First Manager review for Objectives. Please review and approve via Kintone buttons above.",
        isWarning: false
      },
      "03 Manager Objective Review": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E42\u0E14\u0E22 Manager / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under Manager review for Objectives. Please review and approve via Kintone buttons above.",
        isWarning: false
      },
      "04 GM Objective Review": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E42\u0E14\u0E22 GM / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under GM review for Objectives. Please review and approve via Kintone buttons above.",
        isWarning: false
      },
      "05 Objective Approved": {
        th: "\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E23\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35",
        en: "Objectives Approved. Waiting to start Mid-Year review.",
        isWarning: false
      },
      "06 Employee Mid-Year": {
        th: "\u0E01\u0E23\u0E2D\u0E01\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32 \u0E41\u0E25\u0E49\u0E27\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 Submit \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E48\u0E07\u0E43\u0E2B\u0E49 Manager",
        en: "Fill Mid-Year progress & review notes, then click Submit above to Manager.",
        isWarning: false
      },
      "07 First Manager Mid-Year Review": topInfo.isM1G1 ? firstManagerWarning : {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E42\u0E14\u0E22 First Manager / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under First Manager Mid-Year review. Please review and approve via Kintone buttons above.",
        isWarning: false
      },
      "08 Manager Mid-Year Review": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E42\u0E14\u0E22 Manager / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under Manager Mid-Year review. Please review and approve via Kintone buttons above.",
        isWarning: false
      },
      "09 GM Mid-Year Review": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E42\u0E14\u0E22 GM / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under GM Mid-Year review. Please review and approve via Kintone buttons above.",
        isWarning: false
      },
      "10 Mid-Year Completed": {
        th: "\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C \u0E23\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35",
        en: "Mid-Year review completed. Waiting to start Year-End self-evaluation.",
        isWarning: false
      },
      "11 Employee Self Evaluation": {
        th: "\u0E01\u0E23\u0E2D\u0E01\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35 \u0E41\u0E25\u0E49\u0E27\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 Submit \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E48\u0E07\u0E43\u0E2B\u0E49 Manager",
        en: "Fill actual results & self-evaluation, then click Submit above to Manager.",
        isWarning: false
      },
      "12 First Manager Final Evaluation": topInfo.isM1G1 ? firstManagerWarning : {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35\u0E42\u0E14\u0E22 First Manager / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under First Manager Final evaluation. Please evaluate and approve via Kintone buttons above.",
        isWarning: false
      },
      "13 Manager Final Evaluation": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35\u0E42\u0E14\u0E22 Manager / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under Manager Final evaluation. Please evaluate and approve via Kintone buttons above.",
        isWarning: false
      },
      "14 GM Final Evaluation": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35\u0E42\u0E14\u0E22 GM / \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19",
        en: "Under GM Final evaluation. Please evaluate and approve via Kintone buttons above.",
        isWarning: false
      },
      "15 HR Final Check": {
        th: "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22\u0E42\u0E14\u0E22 HR Final Check",
        en: "Under HR Final check and verification.",
        isWarning: false
      },
      "16 Completed": {
        th: "\u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 MBO \u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27",
        en: "MBO Evaluation process fully completed.",
        isWarning: false
      }
    };
    return guidanceMap[currentStatus] || {
      th: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19)",
      en: "Current workflow status (Process actions available via Kintone buttons above).",
      isWarning: false
    };
  }
  function getMacroStage(status) {
    const screen = getVisualScreen(status);
    switch (screen) {
      case "objectives":
        return 1;
      case "midyear":
        return 2;
      case "self_eval":
        return 3;
      case "appraiser_eval":
        return 4;
      case "hr_final":
        return 5;
      default:
        return 1;
    }
  }
  var EmployeePartAUI = class {
    constructor(options = {}) {
      this.container = options.container;
      this.record = options.record || {};
      this.stage = options.stage || BUSINESS_STAGES.READ_ONLY;
      this.isEditable = options.isEditable || false;
      this.isCreate = options.isCreate || false;
      this.appraiserCount = options.appraiserCount || 2;
      this.previewOptions = options.previewOptions || {};
      this.isPreviewMode = Boolean(options.isPreviewMode || options.previewOptions?.isPreviewMode);
      this.loginUserCode = options.loginUserCode || options.previewOptions?.loginUserCode || null;
      this.selectedViewStage = options.selectedViewStage || null;
      const rawSlot = options.activeSlotIndex || options.previewOptions?.activeSlotIndex || 1;
      this.activeSlotIndex = Math.min(Math.max(parseInt(rawSlot, 10), 1), this.appraiserCount);
      this.onFieldChange = options.onFieldChange || (() => {
      });
      this.onLookupEmployee = options.onLookupEmployee || (() => {
      });
      this.onEmployeeCodeChanged = options.onEmployeeCodeChanged || (() => {
      });
      this.authenticatedEmployeeCode = options.authenticatedEmployeeCode || null;
      this.currentErrors = [];
      this.preparedAttachmentPlan = null;
      this.desiredSavedFiles = null;
      this.dirtyAttachmentFields = /* @__PURE__ */ new Set();
      this.pendingAttachments = null;
      this.isEmployeeVerified = !this.isCreate;
    }
    _getResolvedViewerRole() {
      return resolveIdentityViewerRole(this.record, this.loginUserCode, {
        isPreviewMode: this.isPreviewMode,
        previewOptions: this.previewOptions
      });
    }
    render() {
      if (!this.container) return;
      this.container.innerHTML = "";
      const root = document.createElement("div");
      root.className = "mbo-root";
      this.root = root;
      if (this.stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
        root.appendChild(this._renderErrorBanner("\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E30\u0E1A\u0E38\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (SYSTEM CONFIGURATION ERROR)<br/>Unable to identify workflow stage. Please contact HR / Administrator."));
        this.container.appendChild(root);
        return;
      }
      const status = this.isCreate ? "01 Draft Objective" : this._getVal("Status") || "01 Draft Objective";
      const currentVisualScreen = getVisualScreen(status);
      if (!currentVisualScreen) {
        root.appendChild(this._renderErrorBanner("\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2B\u0E23\u0E37\u0E2D\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (CONFIGURATION / UNKNOWN STATUS ERROR)<br/>Unrecognized status value in record. Please contact HR / Administrator."));
        this.container.appendChild(root);
        return;
      }
      const currentStageNum = getMacroStage(status);
      const stageMap = { objectives: 1, midyear: 2, self_eval: 3, appraiser_eval: 4, hr_final: 5 };
      if (this.selectedViewStage) {
        const selectedStageNum = stageMap[this.selectedViewStage];
        if (!selectedStageNum || selectedStageNum > currentStageNum && status !== "16 Completed") {
          this.selectedViewStage = null;
        }
      }
      const effectiveVisualScreen = this.selectedViewStage || currentVisualScreen;
      const isHistoricalView = Boolean(this.selectedViewStage && effectiveVisualScreen !== currentVisualScreen);
      this.isHistoricalView = isHistoricalView;
      if (this.isCreate && !this.authenticatedEmployeeCode) {
        root.appendChild(this._renderLookupSection());
      }
      const shouldValidateSnapshot = !(this.isCreate && !this.isEmployeeVerified);
      if (shouldValidateSnapshot) {
        const compSetCode = this._getVal("Competency_Set_Code") || this.previewOptions.competencySetCode;
        const applicableCompList = getApplicableCompetencies(compSetCode);
        if (!applicableCompList) {
          root.appendChild(this._renderErrorBanner(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E0A\u0E38\u0E14\u0E2A\u0E21\u0E23\u0E23\u0E16\u0E19\u0E30 (Competency_Set_Code: "${escapeHtml2(compSetCode || "\u0E27\u0E48\u0E32\u0E07")}") \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing Competency_Set_Code in configuration.`));
          this.container.appendChild(root);
          return;
        }
        const partAWeight = parseFloat(this._getVal("PartA_Weight") || this.previewOptions.partAWeight || "");
        const partBWeight = parseFloat(this._getVal("PartB_Weight") || this.previewOptions.partBWeight || "");
        if (isNaN(partAWeight) || isNaN(partBWeight) || partAWeight + partBWeight !== 100) {
          root.appendChild(this._renderErrorBanner(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E04\u0E30\u0E41\u0E19\u0E19\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (PartA_Weight + PartB_Weight \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A 100%) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing PartA_Weight / PartB_Weight ratio configuration.`));
          this.container.appendChild(root);
          return;
        }
      }
      this._renderSupportCenterIfAdmin(root, status);
      root.appendChild(this._renderOverallProgressBar(status));
      const urgencyToast = this._renderUrgencyToast(status);
      if (urgencyToast) {
        root.appendChild(urgencyToast);
      }
      root.appendChild(this._renderCompactStatusStrip(status));
      root.appendChild(this._renderHeader());
      root.appendChild(this._renderRouteContext());
      root.appendChild(this._renderCollapsibleLegendAndGuidelines());
      const errorSummaryContainer = document.createElement("div");
      errorSummaryContainer.id = "mbo-error-summary-anchor";
      root.appendChild(errorSummaryContainer);
      root.appendChild(this._renderHoshin());
      if (isHistoricalView) {
        root.appendChild(this._renderHistoryBanner(effectiveVisualScreen, status));
      }
      const origStage = this.stage;
      const origEditable = this.isEditable;
      if (isHistoricalView) {
        this.stage = BUSINESS_STAGES.READ_ONLY;
        this.isEditable = false;
      }
      try {
        if (effectiveVisualScreen === "objectives") {
          root.appendChild(this._renderScreenObjectives());
        } else if (effectiveVisualScreen === "midyear") {
          root.appendChild(this._renderScreenMidYear());
        } else if (effectiveVisualScreen === "self_eval") {
          root.appendChild(this._renderScreenSelfEval());
        } else if (effectiveVisualScreen === "appraiser_eval") {
          const resolvedRole = this._getResolvedViewerRole();
          if (["EMPLOYEE", "RESTRICTED"].includes(resolvedRole)) {
            const privacyCard = document.createElement("div");
            privacyCard.className = "mbo-restricted-notice mbo-wide-card";
            privacyCard.style.padding = "24px 20px";
            privacyCard.style.margin = "12px 0";
            privacyCard.style.background = "#f8fafc";
            privacyCard.style.border = "1px solid #cbd5e1";
            privacyCard.style.borderRadius = "8px";
            privacyCard.style.textAlign = "center";
            privacyCard.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#0f172a; margin-bottom:6px;">
              \u{1F512} \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 / Appraiser Evaluation in progress
            </div>
            <div style="font-size:13px; color:#475569;">
              \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 Part A & Part B \u0E41\u0E25\u0E30\u0E1C\u0E25\u0E04\u0E30\u0E41\u0E19\u0E19\u0E16\u0E39\u0E01\u0E2A\u0E07\u0E27\u0E19\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E32\u0E21\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E41\u0E25\u0E30 HR<br/>
              Detailed Appraiser Evaluation ratings, comments, and scoring context are restricted to authorized Appraiser and HR reviewers.
            </div>
          `;
            root.appendChild(privacyCard);
          } else {
            root.appendChild(this._renderScreenAppraiserEval());
          }
        } else if (effectiveVisualScreen === "hr_final") {
          const resolvedRole = this._getResolvedViewerRole();
          if (["EMPLOYEE", "RESTRICTED"].includes(resolvedRole)) {
            const hrPrivacyCard = document.createElement("div");
            hrPrivacyCard.className = "mbo-restricted-notice mbo-wide-card";
            hrPrivacyCard.style.padding = "24px 20px";
            hrPrivacyCard.style.margin = "12px 0";
            hrPrivacyCard.style.background = "#f0f9ff";
            hrPrivacyCard.style.border = "1px solid #bae6fd";
            hrPrivacyCard.style.borderRadius = "8px";
            hrPrivacyCard.style.textAlign = "center";
            hrPrivacyCard.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#0369a1; margin-bottom:6px;">
              \u{1F512} HR \u0E01\u0E33\u0E25\u0E31\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E1C\u0E25\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22 / HR Final Review in progress
            </div>
            <div style="font-size:13px; color:#334155;">
              \u0E1C\u0E25\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E2A\u0E23\u0E38\u0E1B\u0E41\u0E25\u0E30\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E42\u0E14\u0E22\u0E1D\u0E48\u0E32\u0E22\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E1A\u0E38\u0E04\u0E04\u0E25<br/>
              Final evaluation summary breakdown is restricted to authorized HR reviewers.
            </div>
          `;
            root.appendChild(hrPrivacyCard);
          } else {
            root.appendChild(this._renderScreenHrFinal());
          }
        }
      } finally {
        this.stage = origStage;
        this.isEditable = origEditable;
      }
      root.appendChild(this._renderNativeCommentPlaceholder());
      root.appendChild(this._renderWorkflowActionTimeline());
      this.container.appendChild(root);
      this._updateTotalWeightDisplay();
      this._refreshAllFieldHighlights(root);
      this._bindEvents(root);
      if (this.currentErrors && this.currentErrors.length > 0) {
        this._renderInlineErrors(this.currentErrors);
      }
    }
    _renderHistoryBanner(viewScreenKey, currentStatus) {
      const phases = [
        { key: "objectives", nameTH: "1. \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22", nameEN: "Objectives", stage: 1 },
        { key: "midyear", nameTH: "2. \u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35", nameEN: "Mid-Year", stage: 2 },
        { key: "self_eval", nameTH: "3. \u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07", nameEN: "Self Evaluation", stage: 3 },
        { key: "appraiser_eval", nameTH: "4. \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19", nameEN: "Appraiser Evaluation", stage: 4 },
        { key: "hr_final", nameTH: "5. HR \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22 / \u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19", nameEN: "HR Final / Completed", stage: 5 }
      ];
      const targetPhase = phases.find((p) => p.key === viewScreenKey) || phases[0];
      const banner = document.createElement("div");
      banner.className = "mbo-history-banner";
      banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:20px;">\u{1F4DC}</span>
        <div>
          <div style="font-weight:700; font-size:13px; color:#1e40af;">
            \u0E01\u0E33\u0E25\u0E31\u0E07\u0E14\u0E39\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07: ${escapeHtml2(targetPhase.nameTH)} (${escapeHtml2(targetPhase.nameEN)}) \u2014 \u0E2D\u0E48\u0E32\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27 / Read Only
          </div>
          <div style="font-size:11px; color:#3b82f6; margin-top:2px;">
            \u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19\u0E02\u0E2D\u0E07 Workflow \u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A: <strong>[${escapeHtml2(currentStatus)}]</strong> (\u0E01\u0E32\u0E23\u0E14\u0E39\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1C\u0E25\u0E15\u0E48\u0E2D\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E23\u0E30\u0E1A\u0E1A)
          </div>
        </div>
      </div>
      <button type="button" class="mbo-back-to-current-btn" data-action="back-to-current">
        \u21A9\uFE0F \u0E01\u0E25\u0E31\u0E1A\u0E2A\u0E39\u0E48\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 / Back to Current Phase
      </button>
    `;
      const backBtn = banner.querySelector('[data-action="back-to-current"]');
      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.selectedViewStage = null;
          this.render();
        });
      }
      return banner;
    }
    _renderOverallProgressBar(status) {
      const card = document.createElement("div");
      card.className = "mbo-overall-progress-card";
      const rawTopology = this._getVal("Routing_Topology");
      const prog = getProcessProgress(status, rawTopology);
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || "2026-06-15";
      if (prog.isMismatch) {
        card.innerHTML = `
        <div style="padding:12px 16px; background:#fffbe6; border:1px solid #ffe58f; border-radius:6px; color:#b45309; font-size:13px; font-weight:700;">
          \u26A0\uFE0F Route Warning / Status Mismatch: ${escapeHtml2(prog.mismatchMessage)}
        </div>
      `;
        return card;
      }
      const phases = [
        { key: "objectives", calKey: "objectives", nameTH: "1. \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22", nameEN: "Objectives", stage: 1 },
        { key: "midyear", calKey: "midyear", nameTH: "2. \u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35", nameEN: "Mid-Year", stage: 2 },
        { key: "self_eval", calKey: "selfEvaluation", nameTH: "3. \u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07", nameEN: "Self Evaluation", stage: 3 },
        { key: "appraiser_eval", calKey: "appraiserEvaluation", nameTH: "4. \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19", nameEN: "Appraiser Evaluation", stage: 4 },
        { key: "hr_final", calKey: "hrFinal", nameTH: "5. HR \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22 / \u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19", nameEN: "HR Final / Completed", stage: 5 }
      ];
      const currentStage = getMacroStage(status);
      const currentVisualScreen = getVisualScreen(status);
      const effectiveVisualScreen = this.selectedViewStage && (phases.find((p) => p.key === this.selectedViewStage)?.stage <= currentStage || status === "16 Completed") ? this.selectedViewStage : currentVisualScreen;
      const isHistoricalView = Boolean(this.selectedViewStage && effectiveVisualScreen !== currentVisualScreen);
      const resolvedRole = this._getResolvedViewerRole();
      const phaseStepsHtml = phases.map((p) => {
        const deadline = getPhaseCalendarStatus(p.calKey, status, nowIso, calendar);
        const isCurrentStage = currentStage === p.stage;
        const isViewedStage = effectiveVisualScreen === p.key;
        const isReachable = (p.stage <= currentStage || status === "16 Completed") && (resolvedRole !== "EMPLOYEE" || p.stage <= 3);
        let stepClass = "mbo-phase-step";
        if (isViewedStage && isHistoricalView) {
          stepClass += " viewing-history";
        } else if (isCurrentStage) {
          stepClass += " active";
        } else if (currentStage > p.stage || deadline.status === "Completed") {
          stepClass += " completed";
        } else {
          stepClass += " locked";
        }
        if (isReachable) {
          stepClass += " clickable";
        }
        let badgeText = `[${escapeHtml2(deadline.labelTH)} / ${escapeHtml2(deadline.labelEN)}]`;
        if (isViewedStage && isHistoricalView) {
          badgeText = "[ Viewing / \u0E01\u0E33\u0E25\u0E31\u0E07\u0E14\u0E39 ]";
        } else if (isCurrentStage) {
          badgeText = "[ Current / \u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 ]";
        }
        const tooltipText = isReachable ? "\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 / Click to view history" : resolvedRole === "EMPLOYEE" && p.stage >= 4 ? "\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E2A\u0E07\u0E27\u0E19\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19/HR / Restricted to Appraisers/HR" : "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E16\u0E36\u0E07\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19 / Unreached stage";
        return `
        <div class="${stepClass}" ${isReachable ? `data-stage-key="${p.key}"` : ""} title="${tooltipText}">
          <div style="font-size:12px; font-weight:700;">${escapeHtml2(p.nameTH)}</div>
          <div style="font-size:10px; font-weight:600; opacity:0.9;">${escapeHtml2(p.nameEN)}</div>
          <div class="mbo-deadline-badge ${isViewedStage && isHistoricalView ? "mbo-deadline-history" : deadline.badgeClass}">
            ${badgeText}
          </div>
          <div style="font-size:9.5px; margin-top:2px; opacity:0.85;">
            ${escapeHtml2(deadline.daysTextEN)}
          </div>
        </div>
      `;
      }).join("");
      card.innerHTML = `
      <div class="mbo-progress-phases">
        ${phaseStepsHtml}
      </div>
      <div class="mbo-progress-bar-wrap" style="margin-top:10px;">
        <div class="mbo-progress-bar-fill" style="width: ${prog.percent}%;"></div>
      </div>
      <div class="mbo-progress-label" style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>\u{1F4CA} \u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E15\u0E32\u0E21\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 / Route Progress: <strong>${prog.percent}%</strong> (${escapeHtml2(prog.label)})</span>
        <span style="font-size:11px; color:#64748b;">\u{1F4C5} Simulated Date: <strong>${escapeHtml2(nowIso)}</strong></span>
      </div>
    `;
      card.querySelectorAll(".mbo-phase-step.clickable").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const stageKey = el.getAttribute("data-stage-key");
          if (!stageKey) return;
          const targetPhase = phases.find((p) => p.key === stageKey);
          if (!targetPhase) return;
          if (targetPhase.stage <= currentStage || status === "16 Completed") {
            if (targetPhase.key === currentVisualScreen) {
              this.selectedViewStage = null;
            } else {
              this.selectedViewStage = stageKey;
            }
            this.render();
          }
        });
      });
      return card;
    }
    _renderCompactStatusStrip(status) {
      const currentStatus = String(status || "").trim();
      const rawTopology = this._getVal("Routing_Topology");
      const topInfo = classifyTopologyForUI(rawTopology);
      const phases = [
        { key: "objectives", nameTH: "1. \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22", nameEN: "Objectives", stage: 1 },
        { key: "midyear", nameTH: "2. \u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35", nameEN: "Mid-Year", stage: 2 },
        { key: "selfEvaluation", nameTH: "3. \u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07", nameEN: "Self Evaluation", stage: 3 },
        { key: "appraiserEvaluation", nameTH: "4. \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19", nameEN: "Appraiser Evaluation", stage: 4 },
        { key: "hrFinal", nameTH: "5. HR \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22 / \u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19", nameEN: "HR Final / Completed", stage: 5 }
      ];
      const currentStage = getMacroStage(status);
      const activePhase = phases.find((p) => p.stage === currentStage) || phases[0];
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || "2026-06-15";
      const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);
      let bannerClass = "mbo-urgency-green";
      let pillClass = "pill-green";
      let icon = "\u23F3";
      if (deadline.isCompleted) {
        bannerClass = "mbo-urgency-green";
        pillClass = "pill-green";
        icon = "\u2713";
      } else if (deadline.isOverdue) {
        bannerClass = "mbo-urgency-red mbo-pulse-active";
        pillClass = "pill-red";
        icon = "\u{1F6A8}";
      } else if (deadline.isDueToday) {
        bannerClass = "mbo-urgency-orange mbo-pulse-active";
        pillClass = "pill-orange";
        icon = "\u26A0\uFE0F";
      } else if (deadline.isDueSoon || deadline.remDays >= 1 && deadline.remDays <= 7) {
        bannerClass = "mbo-urgency-amber mbo-pulse-active";
        pillClass = "pill-amber";
        icon = "\u23F0";
      } else if (deadline.isUpcoming) {
        bannerClass = "mbo-urgency-neutral";
        pillClass = "pill-neutral";
        icon = "\u{1F4C5}";
      }
      const exactDueDate = calendar[activePhase.key]?.end || "N/A";
      const statusGuidance = getStatusGuidance(status, rawTopology);
      let actorSummary = "";
      if (["01 Draft Objective", "06 Employee Mid-Year", "11 Employee Self Evaluation"].includes(currentStatus)) {
        actorSummary = "\u{1F464} <strong>Action Required: Requester / Employee (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19):</strong> \u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E49\u0E27\u0E01\u0E14\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E02\u0E2D\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34";
      } else if (["02 First Manager Objective Review", "03 Manager Objective Review", "04 GM Objective Review", "07 First Manager Mid-Year Review", "08 Manager Mid-Year Review", "09 GM Mid-Year Review"].includes(currentStatus)) {
        actorSummary = "\u{1F465} <strong>Action Required: Workflow Approver (\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34):</strong> \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone";
      } else if (["12 First Manager Final Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation"].includes(currentStatus)) {
        actorSummary = "\u{1F465} <strong>Action Required: Appraiser (\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19):</strong> \u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19 Part A & Part B \u0E41\u0E25\u0E49\u0E27\u0E01\u0E14\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34";
      } else if (currentStatus === "05 Objective Approved") {
        actorSummary = deadline.isUpcoming ? "\u{1F512} <strong>\u0E23\u0E2D\u0E40\u0E27\u0E25\u0E32:</strong> \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35" : '\u{1F680} <strong>\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E23\u0E34\u0E48\u0E21:</strong> \u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 "Start Mid-Year" \u0E43\u0E19 Kintone';
      } else if (currentStatus === "10 Mid-Year Completed") {
        actorSummary = deadline.isUpcoming ? "\u{1F512} <strong>\u0E23\u0E2D\u0E40\u0E27\u0E25\u0E32:</strong> \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07" : '\u{1F680} <strong>\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E23\u0E34\u0E48\u0E21:</strong> \u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 "Start Self Evaluation" \u0E43\u0E19 Kintone';
      } else if (currentStatus === "15 HR Final Check") {
        actorSummary = "\u{1F3DB}\uFE0F <strong>HR Admin:</strong> \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E01\u0E14\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19";
      } else if (currentStatus === "16 Completed") {
        actorSummary = "\u2713 <strong>\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C:</strong> \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27";
      }
      const card = document.createElement("div");
      card.className = "mbo-compact-status-strip-wrap";
      card.innerHTML = `
      <div class="mbo-urgency-callout mbo-compact-status-strip ${bannerClass}">
        <div class="mbo-urgency-icon">${icon}</div>
        <div class="mbo-urgency-content">
          <div class="mbo-urgency-header-row">
            <div class="mbo-urgency-phase-title">
              \u{1F4CC} ${escapeHtml2(activePhase.nameTH)} (${escapeHtml2(activePhase.nameEN)}) \u2014 <span style="font-weight:600;">[${escapeHtml2(currentStatus)}]</span>
            </div>
            <div class="mbo-urgency-badge-pill ${pillClass}">
              ${escapeHtml2(deadline.calloutTextTH)} / ${escapeHtml2(deadline.calloutTextEN)}
            </div>
          </div>
          <div class="mbo-urgency-sub-date">
            <span>${actorSummary}</span>
            <span style="margin-left:12px; color:#475569;">\u{1F4C5} \u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14: <strong>${escapeHtml2(exactDueDate)}</strong></span>
          </div>
          ${statusGuidance && statusGuidance.isWarning ? `<div style="font-size:11px; font-weight:700; color:#b45309; margin-top:3px;">${escapeHtml2(statusGuidance.th)}</div>` : ""}
        </div>
      </div>
    `;
      return card;
    }
    _renderDeadlineUrgencyBanner(status) {
      const card = document.createElement("div");
      card.className = "mbo-deadline-urgency-container";
      const phases = [
        { key: "objectives", nameTH: "1. \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22", nameEN: "Objectives", stage: 1 },
        { key: "midyear", nameTH: "2. \u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35", nameEN: "Mid-Year", stage: 2 },
        { key: "selfEvaluation", nameTH: "3. \u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07", nameEN: "Self Evaluation", stage: 3 },
        { key: "appraiserEvaluation", nameTH: "4. \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19", nameEN: "Appraiser Evaluation", stage: 4 },
        { key: "hrFinal", nameTH: "5. HR \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22 / \u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19", nameEN: "HR Final / Completed", stage: 5 }
      ];
      const currentStage = getMacroStage(status);
      const activePhase = phases.find((p) => p.stage === currentStage) || phases[0];
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || "2026-06-15";
      const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);
      let bannerClass = "mbo-urgency-green";
      let icon = "\u23F3";
      if (deadline.isCompleted) {
        bannerClass = "mbo-urgency-green";
        icon = "\u2713";
      } else if (deadline.isOverdue) {
        bannerClass = "mbo-urgency-red mbo-pulse-active";
        icon = "\u{1F6A8}";
      } else if (deadline.isDueToday) {
        bannerClass = "mbo-urgency-orange mbo-pulse-active";
        icon = "\u26A0\uFE0F";
      } else if (deadline.isDueSoon || deadline.remDays >= 1 && deadline.remDays <= 7) {
        bannerClass = "mbo-urgency-amber mbo-pulse-active";
        icon = "\u23F0";
      } else if (deadline.isUpcoming) {
        bannerClass = "mbo-urgency-neutral";
        icon = "\u{1F4C5}";
      }
      const exactDueDate = calendar[activePhase.key]?.end || "N/A";
      card.innerHTML = `
      <div class="mbo-urgency-callout ${bannerClass}">
        <div class="mbo-urgency-icon">${icon}</div>
        <div class="mbo-urgency-content">
          <div class="mbo-urgency-phase-title">
            \u{1F4CC} \u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 / CURRENT PHASE: ${escapeHtml2(activePhase.nameTH)} (${escapeHtml2(activePhase.nameEN)})
          </div>
          <div class="mbo-urgency-main-number">
            ${escapeHtml2(deadline.calloutTextTH)} / ${escapeHtml2(deadline.calloutTextEN)}
          </div>
          <div class="mbo-urgency-sub-date">
            \u{1F4C5} \u0E01\u0E33\u0E2B\u0E19\u0E14\u0E2A\u0E48\u0E07\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D / Phase Due Date: <strong>${escapeHtml2(exactDueDate)}</strong> (\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E08\u0E33\u0E25\u0E2D\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 / Simulated Date: ${escapeHtml2(nowIso)})
          </div>
        </div>
      </div>
    `;
      return card;
    }
    _renderUrgencyToast(status) {
      if (this._toastDismissed) return null;
      const phases = [
        { key: "objectives", nameTH: "1. \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22", nameEN: "Objectives", stage: 1 },
        { key: "midyear", nameTH: "2. \u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35", nameEN: "Mid-Year", stage: 2 },
        { key: "selfEvaluation", nameTH: "3. \u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07", nameEN: "Self Evaluation", stage: 3 },
        { key: "appraiserEvaluation", nameTH: "4. \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19", nameEN: "Appraiser Evaluation", stage: 4 },
        { key: "hrFinal", nameTH: "5. HR \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22 / \u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19", nameEN: "HR Final / Completed", stage: 5 }
      ];
      const currentStage = getMacroStage(status);
      const activePhase = phases.find((p) => p.stage === currentStage) || phases[0];
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || "2026-06-15";
      const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);
      const isDueSoon = deadline.isDueSoon || deadline.remDays >= 1 && deadline.remDays <= 7;
      const isDueToday = deadline.isDueToday;
      const isOverdue = deadline.isOverdue;
      if (!isDueSoon && !isDueToday && !isOverdue) {
        return null;
      }
      const toast = document.createElement("div");
      toast.className = `mbo-urgency-toast ${isOverdue ? "overdue" : isDueToday ? "due-today" : "due-soon"}`;
      let msgTH = "";
      if (isOverdue) {
        msgTH = `\u26A0\uFE0F \u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14 ${deadline.overdueDays || ""} \u0E27\u0E31\u0E19 \u2014 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E42\u0E14\u0E22\u0E40\u0E23\u0E47\u0E27 / Please take action as soon as possible.`;
      } else if (isDueToday) {
        msgTH = `\u26A0\uFE0F \u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49 \u2014 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E43\u0E2B\u0E49\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19\u0E20\u0E32\u0E22\u0E43\u0E19\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49 / Due Today! Please complete your action today.`;
      } else {
        msgTH = `\u23F3 \u0E40\u0E2B\u0E25\u0E37\u0E2D ${deadline.remDays} \u0E27\u0E31\u0E19 \u2014 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E20\u0E32\u0E22\u0E43\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14 / Please complete action before deadline.`;
      }
      const toastBody = document.createElement("div");
      toastBody.className = "mbo-urgency-toast-body";
      const toastText = document.createElement("div");
      toastText.className = "mbo-urgency-toast-text";
      toastText.innerHTML = `<strong>${escapeHtml2(activePhase.nameTH)}:</strong> ${escapeHtml2(msgTH)}`;
      toastBody.appendChild(toastText);
      const closeBtn = document.createElement("button");
      closeBtn.className = "mbo-urgency-toast-close";
      closeBtn.type = "button";
      closeBtn.textContent = "\u2715 \u0E1B\u0E34\u0E14 / Dismiss";
      closeBtn.addEventListener("click", () => {
        this._toastDismissed = true;
        if (typeof toast.remove === "function") {
          toast.remove();
        } else if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      });
      toastBody.appendChild(closeBtn);
      toast.appendChild(toastBody);
      return toast;
    }
    _renderActorBanner(status) {
      const currentStatus = String(status || "").trim();
      const rawTopology = this._getVal("Routing_Topology");
      const topInfo = classifyTopologyForUI(rawTopology);
      const card = document.createElement("div");
      card.className = "mbo-actor-banner-card";
      card.style.marginBottom = "14px";
      if (!topInfo.isCanonical || !topInfo.isSupportedV1) {
        card.innerHTML = `
        <div style="background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; border-radius:6px; color:#991b1b; font-size:13px; font-weight:700;">
          \u26A0\uFE0F Route Warning: Cannot determine stage owner because routing topology is missing, unrecognized, or unsupported in V1 (${escapeHtml2(topInfo.raw || "None")}).
        </div>
      `;
        return card;
      }
      const pathList = getApplicableWorkflowPath(rawTopology);
      if (pathList && !pathList.includes(currentStatus)) {
        card.innerHTML = `
        <div style="background:#fffbe6; border:1px solid #ffe58f; padding:10px 14px; border-radius:6px; color:#b45309; font-size:13px; font-weight:700;">
          \u26A0\uFE0F Route Mismatch: Status "${escapeHtml2(currentStatus)}" is not applicable to active ${escapeHtml2(topInfo.raw)} route.
        </div>
      `;
        return card;
      }
      let actorTitle = "";
      let actorDesc = "";
      let badgeColor = "#0284c7";
      let badgeBg = "#e0f2fe";
      if (["01 Draft Objective", "06 Employee Mid-Year", "11 Employee Self Evaluation"].includes(currentStatus)) {
        actorTitle = "\u{1F464} Action Required: Requester / Employee (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19)";
        actorDesc = "\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22/\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E43\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E1C\u0E34\u0E14\u0E0A\u0E2D\u0E1A \u0E08\u0E32\u0E01\u0E19\u0E31\u0E49\u0E19\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E02\u0E2D\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34";
        badgeColor = "#0284c7";
        badgeBg = "#e0f2fe";
      } else if (["02 First Manager Objective Review", "03 Manager Objective Review", "04 GM Objective Review", "07 First Manager Mid-Year Review", "08 Manager Mid-Year Review", "09 GM Mid-Year Review"].includes(currentStatus)) {
        actorTitle = "\u{1F465} Action Required: Workflow Approver (\u0E1C\u0E39\u0E49\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E32 / \u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E15\u0E32\u0E21\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E02\u0E31\u0E49\u0E19)";
        actorDesc = "\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E15\u0E32\u0E21\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E38\u0E48\u0E21 Kintone \u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19";
        badgeColor = "#b45309";
        badgeBg = "#fef3c7";
      } else if (["12 First Manager Final Evaluation", "13 Manager Final Evaluation", "14 GM Final Evaluation"].includes(currentStatus)) {
        actorTitle = "\u{1F465} Action Required: Workflow Approver & Scoring Appraisers (\u0E1C\u0E39\u0E49\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E32 & \u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19)";
        actorDesc = "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19 Part A (Objectives) \u0E41\u0E25\u0E30 Part B (Competencies) \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E41\u0E19\u0E30 \u0E08\u0E32\u0E01\u0E19\u0E31\u0E49\u0E19\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34";
        badgeColor = "#6d28d9";
        badgeBg = "#f3e8ff";
      } else if (currentStatus === "05 Objective Approved") {
        const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
        const nowIso = this.previewOptions.previewNow || "2026-06-15";
        const deadline = calculateDeadlineInfo(calendar.midyear.start, calendar.midyear.end, nowIso, false);
        if (deadline.isUpcoming) {
          actorTitle = "\u{1F512} Waiting Boundary: 05 Objective Approved \u2014 \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / No action required yet";
          actorDesc = `\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35 (Mid-Year opens in ${deadline.diffDays || 0} days on ${calendar.midyear.start})`;
          badgeColor = "#047857";
          badgeBg = "#d1fae5";
        } else {
          actorTitle = "\u{1F680} Ready Boundary: 05 Objective Approved \u2014 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E23\u0E34\u0E48\u0E21\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35 / Ready to start Mid-Year";
          actorDesc = `\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E40\u0E1B\u0E34\u0E14\u0E41\u0E25\u0E49\u0E27 (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 Requester \u0E40\u0E1B\u0E47\u0E19\u0E1C\u0E39\u0E49\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23: \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 "Start Mid-Year" \u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A Kintone \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E0A\u0E48\u0E27\u0E07\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35)`;
          badgeColor = "#0284c7";
          badgeBg = "#e0f2fe";
        }
      } else if (currentStatus === "10 Mid-Year Completed") {
        const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
        const nowIso = this.previewOptions.previewNow || "2026-06-15";
        const deadline = calculateDeadlineInfo(calendar.selfEvaluation.start, calendar.selfEvaluation.end, nowIso, false);
        if (deadline.isUpcoming) {
          actorTitle = "\u{1F512} Waiting Boundary: 10 Mid-Year Completed \u2014 \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / No action required yet";
          actorDesc = `\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35 (Self Evaluation opens in ${deadline.diffDays || 0} days on ${calendar.selfEvaluation.start})`;
          badgeColor = "#047857";
          badgeBg = "#d1fae5";
        } else {
          actorTitle = "\u{1F680} Ready Boundary: 10 Mid-Year Completed \u2014 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E23\u0E34\u0E48\u0E21\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07 / Ready to start Self Evaluation";
          actorDesc = `\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E40\u0E1B\u0E34\u0E14\u0E41\u0E25\u0E49\u0E27 (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 Requester \u0E40\u0E1B\u0E47\u0E19\u0E1C\u0E39\u0E49\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23: \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21 "Start Self Evaluation" \u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A Kintone \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E0A\u0E48\u0E27\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07)`;
          badgeColor = "#0284c7";
          badgeBg = "#e0f2fe";
        }
      } else if (currentStatus === "15 HR Final Check") {
        actorTitle = "\u{1F50D} Action Required: HR Final Check (\u0E1D\u0E48\u0E32\u0E22\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E1A\u0E38\u0E04\u0E04\u0E25)";
        actorDesc = "HR \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1B\u0E34\u0E14\u0E23\u0E2D\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 MBO";
        badgeColor = "#0369a1";
        badgeBg = "#e0f2fe";
      } else if (currentStatus === "16 Completed") {
        actorTitle = "\u{1F389} Status: Completed \u2014 All Evaluation Phases Closed (\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C)";
        actorDesc = "\u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E16\u0E39\u0E01\u0E25\u0E47\u0E2D\u0E01\u0E16\u0E32\u0E27\u0E23\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E0A\u0E49\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07";
        badgeColor = "#15803d";
        badgeBg = "#dcfce7";
      }
      card.innerHTML = `
      <div style="background:${badgeBg}; border:1px solid ${badgeColor}; padding:10px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:13.5px; font-weight:700; color:${badgeColor};">${actorTitle}</div>
          <div style="font-size:12px; color:#334155; margin-top:2px;">${actorDesc}</div>
        </div>
        <div style="font-size:11px; font-weight:700; background:#ffffff; color:${badgeColor}; padding:4px 10px; border-radius:12px; border:1px solid ${badgeColor}; white-space:nowrap;">
          Actor-Aware Context
        </div>
      </div>
    `;
      return card;
    }
    _getSavedAttachmentFiles(fieldCode) {
      let targetCode = fieldCode;
      if ((!this.record[targetCode] || !this.record[targetCode].value || Array.isArray(this.record[targetCode].value) && this.record[targetCode].value.length === 0) && targetCode.startsWith("Self_Attachment_")) {
        const altCode = targetCode.replace("Self_Attachment_", "Final_Attachment_");
        if (this.record[altCode] && Array.isArray(this.record[altCode].value) && this.record[altCode].value.length > 0) {
          targetCode = altCode;
        }
      }
      const rawVal = this.desiredSavedFiles && this.desiredSavedFiles[targetCode] !== void 0 ? this.desiredSavedFiles[targetCode] : this.record[targetCode] ? this.record[targetCode].value : null;
      if (!rawVal) return [];
      if (Array.isArray(rawVal)) {
        return rawVal.map((item) => {
          if (item && typeof item === "object" && item.name) {
            return { name: item.name, fileKey: item.fileKey || "", size: item.size || 0, contentType: item.contentType || "" };
          } else if (typeof item === "string" && item) {
            return { name: item, fileKey: "", size: 0, contentType: "" };
          }
          return null;
        }).filter(Boolean);
      } else if (typeof rawVal === "object" && rawVal.name) {
        return [{ name: rawVal.name, fileKey: rawVal.fileKey || "", size: rawVal.size || 0, contentType: rawVal.contentType || "" }];
      } else if (typeof rawVal === "string" && rawVal) {
        return [{ name: rawVal, fileKey: "", size: 0, contentType: "" }];
      }
      return [];
    }
    _removeSavedAttachmentFile(fieldCode, filename, fileKey) {
      let targetCode = fieldCode;
      if ((!this.record[targetCode] || !Array.isArray(this.record[targetCode].value) || this.record[targetCode].value.length === 0) && targetCode.startsWith("Self_Attachment_")) {
        const altCode = targetCode.replace("Self_Attachment_", "Final_Attachment_");
        if (this.record[altCode] && Array.isArray(this.record[altCode].value) && this.record[altCode].value.length > 0) {
          targetCode = altCode;
        }
      }
      if (!this.record[targetCode] || !Array.isArray(this.record[targetCode].value)) return;
      const remainingFiles = this.record[targetCode].value.filter((f) => {
        if (fileKey && f.fileKey) return f.fileKey !== fileKey;
        if (filename && f.name) return f.name !== filename;
        if (typeof f === "string") return f !== filename;
        return true;
      });
      if (!this.desiredSavedFiles) this.desiredSavedFiles = {};
      this.desiredSavedFiles[targetCode] = remainingFiles;
      if (!this.dirtyAttachmentFields) this.dirtyAttachmentFields = /* @__PURE__ */ new Set();
      this.dirtyAttachmentFields.add(fieldCode);
      this.dirtyAttachmentFields.add(targetCode);
    }
    _renderAttachmentControl(fieldCode, stageLabel, isEditable) {
      const isPreview = Boolean(this.isPreviewMode || this.previewOptions?.isPreviewMode);
      const savedFiles = this._getSavedAttachmentFiles(fieldCode);
      const pendingFiles = this.pendingAttachments && this.pendingAttachments[fieldCode] || [];
      let mockFiles = [];
      if (isPreview && savedFiles.length === 0 && pendingFiles.length === 0 && this.previewOptions?.attachments?.[fieldCode]) {
        const mock = this.previewOptions.attachments[fieldCode];
        if (mock && mock.name) mockFiles = [{ name: mock.name, isPreviewMock: true }];
      }
      const allFilesToDisplay = [
        ...savedFiles.map((f) => ({ ...f, isSaved: true })),
        ...pendingFiles.map((f, idx) => ({ ...f, isPending: true, pendingIdx: idx })),
        ...mockFiles
      ];
      if (allFilesToDisplay.length === 0) {
        if (isEditable) {
          return `
          <div class="mbo-attachment-box" data-attachment-box="${escapeHtml2(fieldCode)}">
            <label class="mbo-attachment-btn" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; color:#0284c7; background:#e0f2fe; border:1px solid #bae6fd; padding:4px 10px; border-radius:4px;">
              \u{1F4CE} \u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C (\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E14\u0E49 / Optional)
              <input type="file" class="mbo-attachment-file-input" data-code="${escapeHtml2(fieldCode)}" multiple style="display:none;" />
            </label>
            <div style="font-size:9.5px; color:#64748b; margin-top:2px;">Optional evidence (${escapeHtml2(stageLabel)})</div>
          </div>
        `;
        }
        return `<span class="mbo-no-attachment" style="font-size:11px; color:#94a3b8; font-style:italic;">\u0E44\u0E21\u0E48\u0E21\u0E35\u0E44\u0E1F\u0E25\u0E4C\u0E41\u0E19\u0E1A / No attachment</span>`;
      }
      const badgesHtml = allFilesToDisplay.map((f) => {
        if (f.isPending) {
          if (f.status === "error") {
            return `
            <div class="mbo-attachment-badge error-file" style="display:flex; align-items:center; justify-content:space-between; gap:6px; width:100%; max-width:100%; min-width:0; box-sizing:border-box; font-size:11px; color:#b91c1c; background:#fef2f2; border:1px solid #fca5a5; padding:3px 8px; border-radius:4px;">
              <span class="mbo-attachment-icon" style="flex:0 0 auto;">\u26A0\uFE0F</span>
              <span class="mbo-attachment-filename" title="${escapeHtml2(f.name)}" style="flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml2(f.name)}</span>
              <span class="mbo-attachment-error-tag" style="flex:0 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; font-weight:700; color:#dc2626;">(\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E25\u0E49\u0E21\u0E40\u0E2B\u0E25\u0E27 / Upload failed)</span>
              ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml2(fieldCode)}" data-pending-idx="${f.pendingIdx}" style="flex:0 0 auto; flex-shrink:0; border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px; line-height:1; min-width:16px;">\u2715</button>` : ""}
            </div>
          `;
          }
          return `
          <div class="mbo-attachment-badge pending-file" style="display:flex; align-items:center; justify-content:space-between; gap:6px; width:100%; max-width:100%; min-width:0; box-sizing:border-box; font-size:11px; color:#0369a1; background:#f0f9ff; border:1px dashed #0284c7; padding:3px 8px; border-radius:4px;">
            <span class="mbo-attachment-icon" style="flex:0 0 auto;">\u{1F4CE}</span>
            <span class="mbo-attachment-filename" title="${escapeHtml2(f.name)}" style="flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml2(f.name)}</span>
            <span class="mbo-attachment-pending-tag" style="flex:0 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; font-weight:700; color:#0284c7;">(\u0E23\u0E2D\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 / Pending save)</span>
            ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml2(fieldCode)}" data-pending-idx="${f.pendingIdx}" style="flex:0 0 auto; flex-shrink:0; border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px; line-height:1; min-width:16px;">\u2715</button>` : ""}
          </div>
        `;
        }
        const isMock = Boolean(f.isPreviewMock);
        const hasValidFileKey = !isMock && Boolean(f.fileKey && String(f.fileKey).trim() !== "" && f.fileKey !== "undefined" && f.fileKey !== "null");
        const filenameHtml = hasValidFileKey ? `<a href="#" class="mbo-attachment-filename" data-code="${escapeHtml2(fieldCode)}" data-filename="${escapeHtml2(f.name)}" data-filekey="${escapeHtml2(f.fileKey)}" title="${escapeHtml2(f.name)}" style="flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#0284c7; text-decoration:underline; cursor:pointer;">${escapeHtml2(f.name)}</a>` : `<span class="mbo-attachment-filename" title="${escapeHtml2(f.name)}" style="flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml2(f.name)}</span>`;
        const actionsHtml = `
        <div class="mbo-attachment-actions" style="display:flex; align-items:center; gap:4px; flex:0 0 auto;">
          ${hasValidFileKey ? `<button type="button" class="mbo-attachment-download-btn" data-code="${escapeHtml2(fieldCode)}" data-filename="${escapeHtml2(f.name)}" data-filekey="${escapeHtml2(f.fileKey)}" title="Download ${escapeHtml2(f.name)}" style="flex:0 0 auto; flex-shrink:0; border:none; background:none; cursor:pointer; color:#0284c7; font-weight:700; padding:0 2px; line-height:1;">\u2B07\uFE0F</button>` : ""}
          ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml2(fieldCode)}" data-filename="${escapeHtml2(f.name)}" data-filekey="${escapeHtml2(f.fileKey || "")}" title="Remove file" style="flex:0 0 auto; flex-shrink:0; border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px; line-height:1; min-width:16px;">\u2715</button>` : ""}
        </div>
      `;
        return `
        <div class="mbo-attachment-badge saved-file" style="display:flex; align-items:center; justify-content:space-between; gap:6px; width:100%; max-width:100%; min-width:0; box-sizing:border-box; font-size:11px; color:#1e293b; background:#f1f5f9; border:1px solid #cbd5e1; padding:3px 8px; border-radius:4px;">
          <span class="mbo-attachment-icon" style="flex:0 0 auto;">\u{1F4CE}</span>
          ${filenameHtml}
          ${actionsHtml}
        </div>
      `;
      }).join("");
      const addMoreBtnHtml = isEditable ? `
      <label class="mbo-attachment-btn-add" style="cursor:pointer; display:inline-flex; align-items:center; font-size:10.5px; font-weight:600; color:#0284c7; background:#ffffff; border:1px solid #bae6fd; padding:2px 6px; border-radius:4px; margin-top:2px; max-width:100%; box-sizing:border-box;">
        + \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E44\u0E1F\u0E25\u0E4C / Add file
        <input type="file" class="mbo-attachment-file-input" data-code="${escapeHtml2(fieldCode)}" multiple style="display:none;" />
      </label>
    ` : "";
      return `
      <div class="mbo-attachment-container" data-attachment-container="${escapeHtml2(fieldCode)}" style="display:flex; flex-direction:column; align-items:stretch; gap:4px; width:100%; max-width:100%; min-width:0; box-sizing:border-box;">
        ${badgesHtml}
        ${addMoreBtnHtml}
      </div>
    `;
    }
    _renderWorkflowActionTimeline() {
      const card = document.createElement("div");
      card.className = "mbo-timeline-card";
      const resolvedRole = this._getResolvedViewerRole();
      const isPreview = Boolean(this.isPreviewMode || this.previewOptions?.isPreviewMode);
      let rawEvents = null;
      if (Array.isArray(this.previewOptions?.timelineEvents)) {
        rawEvents = this.previewOptions.timelineEvents;
      } else if (isPreview) {
        rawEvents = [
          { stage: "1. Objectives", actor: "1st Appraiser (\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1)", name: "Manager Sompong (m01)", action: "Approved Objectives", time: "14 Feb 2026 \u2022 09:42", outcome: "approved", commentNotice: false },
          { stage: "1. Objectives", actor: "2nd Appraiser (\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2)", name: "GM Vichai (g01)", action: "Returned for Revision", time: "15 Feb 2026 \u2022 10:18", outcome: "returned", commentNotice: true },
          { stage: "1. Objectives", actor: "Employee / Requester (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19)", name: "Somchai Prasert (0118)", action: "Resubmitted Objectives", time: "16 Feb 2026 \u2022 08:30", outcome: "resubmitted", commentNotice: false },
          { stage: "1. Objectives", actor: "2nd Appraiser (\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2)", name: "GM Vichai (g01)", action: "Approved Objectives", time: "16 Feb 2026 \u2022 13:05", outcome: "approved", commentNotice: false },
          { stage: "4. Appraiser Evaluation", actor: "1st Appraiser (\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1)", name: "Manager Sompong (m01)", action: "Scoring Completed", time: "20 Nov 2026 \u2022 14:22", outcome: "approved", commentNotice: false }
        ];
      } else {
        rawEvents = [];
      }
      let events = [...rawEvents];
      if (resolvedRole === "EMPLOYEE" && events.length > 0) {
        events = events.filter((e) => {
          const stageStr = String(e.stage || "").toLowerCase();
          return !stageStr.includes("4.") && !stageStr.includes("5.") && !stageStr.includes("appraiser evaluation") && !stageStr.includes("hr final");
        });
      }
      if (events.length === 0) {
        card.innerHTML = `
        <details open style="cursor:pointer;">
          <summary class="mbo-timeline-title">
            <span>\u{1F4DC} \u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Workflow Action Timeline (Read-Only Audit Trail)</span>
            <span style="font-size:11px; font-weight:600; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px;">0 Events Recorded</span>
          </summary>
          <div class="mbo-timeline-empty" style="padding:15px; text-align:center; color:#64748b; font-size:12px; font-style:italic; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-top:10px;">
            \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / No workflow history available
          </div>
        </details>
      `;
        return card;
      }
      const rowsHtml = events.map((e, idx) => {
        const outcomeClass = escapeHtml2(e.outcome || "approved");
        const badgeText = e.outcome === "returned" ? "Returned" : e.outcome === "resubmitted" ? "Resubmitted" : "Approved";
        const isReturned = e.outcome === "returned";
        return `
        <tr class="${isReturned ? "returned-row" : ""}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${idx + 1}</td>
          <td><span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 6px; border-radius:4px;">${escapeHtml2(e.stage)}</span></td>
          <td style="font-weight:700; color:#1e293b;">${escapeHtml2(e.actor)}</td>
          <td style="font-weight:600; color:#0f172a;">${escapeHtml2(e.name)}</td>
          <td style="font-weight:600; color:#334155;">${escapeHtml2(e.action)}</td>
          <td style="font-size:11.5px; color:#475569; white-space:nowrap;">\u{1F552} ${escapeHtml2(e.time)}</td>
          <td style="text-align:center;"><span class="mbo-timeline-badge ${outcomeClass}">${escapeHtml2(badgeText)}</span></td>
          <td style="font-size:11px;">${e.commentNotice ? `<span style="color:#dc2626; font-weight:700;">\u{1F4AC} \u0E14\u0E39\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19 / View Comments</span>` : '<span style="color:#94a3b8;">\u2014</span>'}</td>
        </tr>
      `;
      }).join("");
      card.innerHTML = `
      <details open style="cursor:pointer;">
        <summary class="mbo-timeline-title">
          <span>\u{1F4DC} \u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Workflow Action Timeline (Read-Only Audit Trail)</span>
          <span style="font-size:11px; font-weight:600; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px;">${events.length} Events Recorded</span>
        </summary>
        <div class="mbo-table-container" style="margin-top:10px;">
          <table class="mbo-timeline-table">
            <thead>
              <tr>
                <th style="width:35px; text-align:center;">#</th>
                <th style="width:17%;">\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19 / Stage</th>
                <th style="width:20%;">\u0E1C\u0E39\u0E49\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Actor</th>
                <th style="width:16%;">\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Person</th>
                <th style="width:16%;">\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Action</th>
                <th style="width:14%;">\u0E27\u0E31\u0E19-\u0E40\u0E27\u0E25\u0E32 / Date & Time</th>
                <th style="width:12%; text-align:center;">\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C / Result</th>
                <th style="width:12%;">\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38 / Comments</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </details>
    `;
      return card;
    }
    _renderNativeCommentPlaceholder() {
      const card = document.createElement("div");
      card.className = "mbo-native-comment-placeholder";
      card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#0f172a; font-size:13px;">\u{1F4AC} \u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19\u0E43\u0E19 Kintone / Kintone Comments (Native Platform)</strong>
          <div style="font-size:11.5px; color:#475569; margin-top:2px;">
            \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E01\u0E25\u0E31\u0E1A\u0E43\u0E2B\u0E49\u0E41\u0E01\u0E49\u0E44\u0E02 (Return / Reject) \u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E41\u0E25\u0E30\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E37\u0E48\u0E2D\u0E2A\u0E32\u0E23\u0E1C\u0E48\u0E32\u0E19\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19\u0E2B\u0E25\u0E31\u0E01\u0E02\u0E2D\u0E07 Kintone \u0E17\u0E32\u0E07\u0E14\u0E49\u0E32\u0E19\u0E02\u0E27\u0E32\u0E21\u0E37\u0E2D\u0E02\u0E2D\u0E07\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D
          </div>
        </div>
        <span style="font-size:10.5px; font-weight:700; background:#e2e8f0; color:#334155; padding:4px 8px; border-radius:4px; white-space:nowrap;">
          Native Platform Coexistence
        </span>
      </div>
    `;
      return card;
    }
    _renderScreenObjectives() {
      const container = document.createElement("div");
      container.className = "mbo-table-container";
      const isObjectiveStage = this.isCreate || this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT || this.stage === BUSINESS_STAGES.NEW_RECORD;
      const isObjEditable = this.isEditable && isObjectiveStage && this.isEmployeeVerified;
      let count = parseObjectiveCount(this._getVal("Objective_Count"));
      if (count === null && this.isCreate === true) {
        count = 4;
      }
      if (count === null) {
        const errCard = document.createElement("div");
        errCard.style.padding = "20px";
        errCard.style.margin = "12px 0";
        errCard.style.background = "#fef2f2";
        errCard.style.border = "1px solid #fca5a5";
        errCard.style.borderRadius = "6px";
        errCard.style.color = "#991b1b";
        errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">\u0E04\u0E48\u0E32 Objective_Count \u0E43\u0E19\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E27\u0E48\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 / Objective_Count is invalid or missing in record data.</div>
      `;
        container.appendChild(errCard);
        return container;
      }
      const bar = document.createElement("div");
      bar.className = "mbo-table-header-bar";
      bar.innerHTML = `
      <span>STEP 3: Part A : MBO (\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E1C\u0E25\u0E07\u0E32\u0E19 / Objectives Setup)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 / Number of Objectives:</span>
        ${isObjEditable ? `
          <select id="mbo-obj-count-select" class="mbo-cell-select" style="width: 65px; height: 28px; font-size: 13px; padding: 2px 6px; background: #ffffff;">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<option value="${n}" ${count === n ? "selected" : ""}>${n}</option>`).join("")}
          </select>
        ` : `<strong>${count} Objectives</strong>`}
      </div>
    `;
      container.appendChild(bar);
      if (this.isCreate && !this.isEmployeeVerified) {
        const lockBanner = document.createElement("div");
        lockBanner.style.padding = "30px 20px";
        lockBanner.style.textAlign = "center";
        lockBanner.style.background = "#f8fafc";
        lockBanner.style.border = "1px dashed #cbd5e1";
        lockBanner.style.borderRadius = "6px";
        lockBanner.style.margin = "12px 0";
        lockBanner.style.color = "#64748b";
        lockBanner.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 6px;">\u{1F512} \u0E15\u0E32\u0E23\u0E32\u0E07\u0E15\u0E31\u0E49\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E16\u0E39\u0E01\u0E25\u0E47\u0E2D\u0E01\u0E0A\u0E31\u0E48\u0E27\u0E04\u0E23\u0E32\u0E27 / Objective Setup is Locked</div>
        <div style="font-size: 13px;">\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E19 <strong>STEP 1</strong> \u0E41\u0E25\u0E30\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E01\u0E48\u0E2D\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1B\u0E25\u0E14\u0E25\u0E47\u0E2D\u0E01\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22<br/>Please identify and verify employee profile in STEP 1 to unlock objective setup.</div>
      `;
        container.appendChild(lockBanner);
        return container;
      }
      const currentStatus = this._getVal("Status") || "01 Draft Objective";
      if (currentStatus === "05 Objective Approved") {
        const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
        const boundaryBanner = document.createElement("div");
        boundaryBanner.style.padding = "16px 20px";
        boundaryBanner.style.background = "#f0fdf4";
        boundaryBanner.style.border = "1px solid #86efac";
        boundaryBanner.style.borderRadius = "6px";
        boundaryBanner.style.margin = "12px 0";
        boundaryBanner.innerHTML = `
        <div style="font-size:15px; font-weight:700; color:#166534; margin-bottom:4px;">\u{1F512} 05 Objective Approved \u2014 Stage 1 Complete</div>
        <div style="font-size:12.5px; color:#334155;">\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35 (Mid-Year Start Date: <strong>${escapeHtml2(calendar.midyear.start)}</strong>)</div>
      `;
        container.appendChild(boundaryBanner);
      }
      const table = document.createElement("table");
      table.className = "mbo-grid-table";
      table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="width: 28%;">
            \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E30\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E17\u0E35\u0E48\u0E04\u0E32\u0E14\u0E2B\u0E27\u0E31\u0E07 / Objectives & Target *
            <span class="th-sub">[\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 \u0E15\u0E31\u0E27\u0E0A\u0E35\u0E49\u0E27\u0E31\u0E14 \u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22]</span>
          </th>
          <th style="width: 28%;">
            \u0E41\u0E1C\u0E19\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23 / Action Plan *
            <span class="th-sub">[\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21 \u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19 \u0E41\u0E25\u0E30\u0E23\u0E30\u0E22\u0E30\u0E40\u0E27\u0E25\u0E32\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23]</span>
          </th>
          <th style="width: 16%;">
            \u0E02\u0E49\u0E2D\u0E15\u0E01\u0E25\u0E07\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21 / Additional Agreement
            <span class="th-sub">[\u0E02\u0E49\u0E2D\u0E15\u0E01\u0E25\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21]</span>
          </th>
          <th style="width: 7%; text-align: center;">
            \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 *
            <span class="th-sub">(Weight %)</span>
          </th>
          <th style="width: 11%; text-align: center;">
            \u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E01 *
            <span class="th-sub">[Difficulty 1-4]</span>
          </th>
          <th style="width: 10%; text-align: center;">
            \u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C / Attach File
            <span class="th-sub">(Optional)</span>
          </th>
        </tr>
      </thead>
    `;
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      for (let i = 1; i <= count; i++) {
        const objVal = this._getVal(`Objective_${i}`);
        const actVal = this._getVal(`Action_Plan_${i}`);
        const addVal = this._getVal(`Additional_Agreement_${i}`);
        const wVal = this._getVal(`Weight_${i}`);
        const diffVal = this._getVal(`Difficulty_${i}`);
        const attachHtml = this._renderAttachmentControl(`Objective_Attachment_${i}`, "Objectives", isObjEditable);
        const tr = document.createElement("tr");
        tr.dataset.objIndex = String(i);
        tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? "readonly" : ""} placeholder="\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E30\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E17\u0E35\u0E48\u0E04\u0E32\u0E14\u0E2B\u0E27\u0E31\u0E07...">${escapeHtml2(objVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? "readonly" : ""} placeholder="\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E41\u0E25\u0E30\u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1A\u0E23\u0E23\u0E25\u0E38\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22...">${escapeHtml2(actVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? "readonly" : ""} style="min-height:75px;" placeholder="\u0E02\u0E49\u0E2D\u0E15\u0E01\u0E25\u0E07\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21...">${escapeHtml2(addVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </td>
        <td style="text-align:center; vertical-align:top;">
          <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${escapeHtml2(wVal)}" ${!isObjEditable ? "readonly" : ""} style="text-align:center; height:36px;" placeholder="30" />
          <span class="mbo-cell-tag" data-target="Weight_${i}"></span>
        </td>
        <td style="vertical-align:top;">
          ${isObjEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Difficulty_${i}" data-required="true" style="height:36px;">
              <option value="" ${!diffVal ? "selected" : ""}>-- \u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E01 / Please select --</option>
              <option value="1" ${diffVal === "1" ? "selected" : ""}>1 : Normal (\u0E07\u0E48\u0E32\u0E22)</option>
              <option value="2" ${diffVal === "2" ? "selected" : ""}>2 : Moderate (\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07)</option>
              <option value="3" ${diffVal === "3" ? "selected" : ""}>3 : Difficult (\u0E22\u0E32\u0E01)</option>
              <option value="4" ${diffVal === "4" ? "selected" : ""}>4 : Challenging (\u0E17\u0E49\u0E32\u0E17\u0E32\u0E22\u0E21\u0E32\u0E01)</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="${diffVal ? `Level ${escapeHtml2(diffVal)}` : "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E30\u0E1A\u0E38 / Not selected"}" readonly style="height:36px;" />
          `}
          <span class="mbo-cell-tag" data-target="Difficulty_${i}"></span>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
        tbody.appendChild(tr);
      }
      container.appendChild(table);
      container.appendChild(this._renderWeightSummary());
      return container;
    }
    _renderScreenMidYear() {
      const container = document.createElement("div");
      container.className = "mbo-table-container";
      const isMidEditable = this.isEditable && this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;
      const count = parseObjectiveCount(this._getVal("Objective_Count"));
      if (count === null) {
        const errCard = document.createElement("div");
        errCard.style.padding = "20px";
        errCard.style.margin = "12px 0";
        errCard.style.background = "#fef2f2";
        errCard.style.border = "1px solid #fca5a5";
        errCard.style.borderRadius = "6px";
        errCard.style.color = "#991b1b";
        errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">\u0E04\u0E48\u0E32 Objective_Count \u0E43\u0E19\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E27\u0E48\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 / Objective_Count is invalid or missing in record data.</div>
      `;
        container.appendChild(errCard);
        return container;
      }
      const bar = document.createElement("div");
      bar.className = "mbo-table-header-bar";
      bar.innerHTML = `
      <span>STEP 3: \u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35 / Stage 2 \u2014 Mid-Year Progress & Review (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Table Layout]</span>
    `;
      container.appendChild(bar);
      const currentStatus = this._getVal("Status") || "06 Employee Mid-Year";
      if (currentStatus === "10 Mid-Year Completed") {
        const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
        const boundaryBanner = document.createElement("div");
        boundaryBanner.style.padding = "24px 20px";
        boundaryBanner.style.textAlign = "center";
        boundaryBanner.style.background = "#f0fdf4";
        boundaryBanner.style.border = "1px dashed #86efac";
        boundaryBanner.style.borderRadius = "6px";
        boundaryBanner.style.margin = "12px";
        boundaryBanner.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#166534; margin-bottom:6px;">\u{1F512} 10 Mid-Year Completed \u2014 Stage 2 Complete</div>
        <div style="font-size:13px; color:#334155;">\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35 (Self Eval Start Date: <strong>${escapeHtml2(calendar.selfEvaluation.start)}</strong>)</div>
      `;
        container.appendChild(boundaryBanner);
        return container;
      }
      const table = document.createElement("table");
      table.className = "mbo-grid-table";
      table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">#</th>
          <th style="width:22%;">\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 & \u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19 / Objective & Action Plan (Read-Only)</th>
          <th style="width:16%;">\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 / Objective Progress (%)</th>
          <th style="width:17%;">\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E23\u0E30\u0E22\u0E30 / Periodical Review</th>
          <th style="width:17%;">\u0E1C\u0E25\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 / Milestone Result</th>
          <th style="width:16%;">\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E2D\u0E38\u0E1B\u0E2A\u0E23\u0E23\u0E04 / Issue & Next Action</th>
          <th style="width:12%; text-align:center;">\u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C / Attach File <span class="th-sub">(Optional)</span></th>
        </tr>
      </thead>
    `;
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      for (let i = 1; i <= count; i++) {
        const objVal = this._getVal(`Objective_${i}`);
        const actVal = this._getVal(`Action_Plan_${i}`);
        const wVal = this._getVal(`Weight_${i}`) || "0";
        const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || "0", 10);
        const revVal = this._getVal(`Periodical_Review_${i}`);
        const resVal = this._getVal(`MidYear_Result_${i}`);
        const riskVal = this._getVal(`MidYear_Issue_Risk_${i}`);
        const nextActVal = this._getVal(`MidYear_Next_Action_${i}`);
        const attachHtml = this._renderAttachmentControl(`MidYear_Attachment_${i}`, "Mid-Year", isMidEditable);
        const tr = document.createElement("tr");
        tr.dataset.objIndex = String(i);
        tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#1e3a8a; font-size:13px;">#${i} ${escapeHtml2(objVal) || "(No title)"}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin:2px 0 4px 0;">Weight: ${escapeHtml2(wVal)}%</div>
          <div style="font-size:12px; color:#475569; background:#f8fafc; padding:6px; border-radius:4px;">${escapeHtml2(actVal) || "-"}</div>
        </td>
        <td>
          <div style="font-size:10.5px; font-weight:700; color:#0369a1; margin-bottom:2px;">
            \u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 / Objective Progress (%)
          </div>
          <div style="font-size:9.5px; color:#64748b; margin-bottom:4px;">
            \u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E30\u0E1A\u0E38\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 0\u2013100% / Employee-reported current progress 0\u2013100%
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            ${isMidEditable ? `
              <input type="number" min="0" max="100" class="mbo-cell-input mbo-field mbo-prog-num" data-code="Progress_Percent_${i}" value="${prog}" style="width:60px; height:28px; font-size:12px; font-weight:700; text-align:center;" />
              <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width:80px;" />
            ` : `
              <strong style="font-size:13px; color:#0369a1;">${prog}%</strong>
            `}
          </div>
          <div class="mbo-progress-bar-container" style="height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
            <div class="mbo-progress-bar-fill" style="width: ${prog}%; height:100%; background:#0284c7;"></div>
          </div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? "readonly" : ""} style="min-height:75px;" placeholder="\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E17\u0E1A\u0E17\u0E27\u0E19...">${escapeHtml2(revVal)}</textarea>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? "readonly" : ""} style="min-height:75px;" placeholder="\u0E1C\u0E25\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19...">${escapeHtml2(resVal)}</textarea>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? "readonly" : ""} style="min-height:38px; margin-bottom:4px;" placeholder="\u0E1B\u0E31\u0E0D\u0E2B\u0E32/\u0E2D\u0E38\u0E1B\u0E2A\u0E23\u0E23\u0E04...">${escapeHtml2(riskVal)}</textarea>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Next_Action_${i}" ${!isMidEditable ? "readonly" : ""} style="min-height:38px;" placeholder="\u0E41\u0E19\u0E27\u0E17\u0E32\u0E07\u0E41\u0E01\u0E49\u0E44\u0E02...">${escapeHtml2(nextActVal)}</textarea>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
        tbody.appendChild(tr);
      }
      container.appendChild(table);
      return container;
    }
    _renderScreenSelfEval() {
      const container = document.createElement("div");
      container.className = "mbo-table-container";
      const isSelfEditable = this.isEditable && this.stage === BUSINESS_STAGES.SELF_EVALUATION;
      const count = parseObjectiveCount(this._getVal("Objective_Count"));
      if (count === null) {
        const errCard = document.createElement("div");
        errCard.style.padding = "20px";
        errCard.style.margin = "12px 0";
        errCard.style.background = "#fef2f2";
        errCard.style.border = "1px solid #fca5a5";
        errCard.style.borderRadius = "6px";
        errCard.style.color = "#991b1b";
        errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">\u0E04\u0E48\u0E32 Objective_Count \u0E43\u0E19\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E27\u0E48\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 / Objective_Count is invalid or missing in record data.</div>
      `;
        container.appendChild(errCard);
        return container;
      }
      const bar = document.createElement("div");
      bar.className = "mbo-table-header-bar";
      bar.innerHTML = `
      <span>STEP 3: \u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35 / Stage 3 \u2014 Self Evaluation (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Table Layout]</span>
    `;
      container.appendChild(bar);
      const currentStatus = this._getVal("Status") || "11 Employee Self Evaluation";
      if (currentStatus === "10 Mid-Year Completed") {
        const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
        const boundaryBanner = document.createElement("div");
        boundaryBanner.style.padding = "24px 20px";
        boundaryBanner.style.textAlign = "center";
        boundaryBanner.style.background = "#f0fdf4";
        boundaryBanner.style.border = "1px dashed #86efac";
        boundaryBanner.style.borderRadius = "6px";
        boundaryBanner.style.margin = "12px";
        boundaryBanner.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#166534; margin-bottom:6px;">\u{1F512} 10 Mid-Year Completed \u2014 Stage 2 Complete</div>
        <div style="font-size:13px; color:#334155;">\u0E01\u0E32\u0E23\u0E17\u0E1A\u0E17\u0E27\u0E19\u0E01\u0E25\u0E32\u0E07\u0E1B\u0E35\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E23\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E1B\u0E35 (Self Eval Start Date: <strong>${escapeHtml2(calendar.selfEvaluation.start)}</strong>)</div>
      `;
        container.appendChild(boundaryBanner);
        return container;
      }
      const table = document.createElement("table");
      table.className = "mbo-grid-table";
      table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">#</th>
          <th style="width:23%;">\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 / Objective (Read-Only)</th>
          <th style="width:33%;">\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07 / Actual Result & Achievement *</th>
          <th style="width:14%;">\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07 / Self Achievement [1-5] *</th>
          <th style="width:18%;">\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07 / Self Reflection</th>
          <th style="width:12%; text-align:center;">\u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C / Attach File <span class="th-sub">(Optional)</span></th>
        </tr>
      </thead>
    `;
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      for (let i = 1; i <= count; i++) {
        const objVal = this._getVal(`Objective_${i}`);
        const wVal = this._getVal(`Weight_${i}`) || "0";
        const prog = this._getVal(`Progress_Percent_${i}`) || "0";
        const actResult = this._getVal(`Actual_Result_${i}`);
        const selfAch = this._getVal(`Self_Achievement_${i}`) || "3";
        const selfComment = this._getVal(`Self_Comment_${i}`);
        const attachHtml = this._renderAttachmentControl(`Self_Attachment_${i}`, "Self Evaluation", isSelfEditable) || this._renderAttachmentControl(`Final_Attachment_${i}`, "Self Evaluation", isSelfEditable);
        const tr = document.createElement("tr");
        tr.dataset.objIndex = String(i);
        tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#1e3a8a; font-size:13px;">#${i} ${escapeHtml2(objVal) || "(No title)"}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin-top:2px;">Weight: ${escapeHtml2(wVal)}% | Mid Progress: ${escapeHtml2(prog)}%</div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? "readonly" : ""} style="min-height:80px;" placeholder="\u0E2A\u0E23\u0E38\u0E1B\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07\u0E17\u0E35\u0E48\u0E1A\u0E23\u0E23\u0E25\u0E38\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E2A\u0E34\u0E49\u0E19\u0E1B\u0E35...">${escapeHtml2(actResult)}</textarea>
        </td>
        <td>
          ${isSelfEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Self_Achievement_${i}" style="height:36px;">
              <option value="1" ${selfAch === "1" ? "selected" : ""}>1 : Rarely meet</option>
              <option value="2" ${selfAch === "2" ? "selected" : ""}>2 : Partially meet</option>
              <option value="3" ${selfAch === "3" ? "selected" : ""}>3 : Fully meet</option>
              <option value="4" ${selfAch === "4" ? "selected" : ""}>4 : Exceeded</option>
              <option value="5" ${selfAch === "5" ? "selected" : ""}>5 : Remarkable</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${escapeHtml2(selfAch)}" readonly style="height:36px;" />
          `}
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? "readonly" : ""} style="min-height:80px;" placeholder="\u0E02\u0E49\u0E2D\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07...">${escapeHtml2(selfComment)}</textarea>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
        tbody.appendChild(tr);
      }
      container.appendChild(table);
      return container;
    }
    _renderScreenAppraiserEval() {
      const wrap = document.createElement("div");
      const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);
      const compSetCode = this._getVal("Competency_Set_Code") || this.previewOptions.competencySetCode;
      const applicableCompList = getApplicableCompetencies(compSetCode);
      const currentStatus = this._getVal("Status") || "13 Manager Final Evaluation";
      const rawTopology = this._getVal("Routing_Topology") || "M1_G1";
      const topInfo = classifyTopologyForUI(rawTopology);
      let activeSlot = 1;
      if (this.previewOptions.activeSlotIndex !== void 0 && this.previewOptions.activeSlotIndex !== null) {
        activeSlot = parseInt(this.previewOptions.activeSlotIndex, 10);
      } else if (currentStatus === "12 First Manager Final Evaluation") {
        activeSlot = 1;
      } else if (currentStatus === "13 Manager Final Evaluation") {
        activeSlot = topInfo.isM1M2G1 ? 2 : 1;
      } else if (currentStatus === "14 GM Final Evaluation") {
        activeSlot = topInfo.isM1M2G1 ? 3 : 2;
      }
      const compCard = document.createElement("div");
      compCard.className = "mbo-appraiser-completion-card";
      compCard.innerHTML = `
      <div class="mbo-appraiser-completion-info">
        \u{1F465} \u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 / Appraiser Evaluation Completion:
        <strong>${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Complete (${appraiserInfo.completionPercent}%)</strong>
        <div style="font-size:11.5px; font-weight:normal; color:#475569; margin-top:2px;">
          Part A Ratings: <strong>${appraiserInfo.partA.completed}/${appraiserInfo.partA.total}</strong> | Part B Ratings: <strong>${appraiserInfo.partB.completed}/${appraiserInfo.partB.total}</strong>
          | Active Slot: <strong style="color:#0284c7;">Slot ${activeSlot} (${appraiserInfo.slots.find((s) => s.slotIndex === activeSlot)?.label || ""})</strong>
        </div>
      </div>
      <div class="mbo-appraiser-slots-pills">
        ${appraiserInfo.slots.map((s) => `
          <span class="mbo-appraiser-slot-pill ${s.isCompleted ? "done" : "pending"} ${s.slotIndex === activeSlot ? "active" : ""}">
            ${s.isCompleted ? "\u2713" : "\u23F3"} ${escapeHtml2(s.label)} ${s.slotIndex === activeSlot ? "(Active)" : ""}
          </span>
        `).join("")}
      </div>
    `;
      wrap.appendChild(compCard);
      const count = parseObjectiveCount(this._getVal("Objective_Count"));
      if (count === null) {
        const errCard = document.createElement("div");
        errCard.style.padding = "20px";
        errCard.style.margin = "12px 0";
        errCard.style.background = "#fef2f2";
        errCard.style.border = "1px solid #fca5a5";
        errCard.style.borderRadius = "6px";
        errCard.style.color = "#991b1b";
        errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">\u0E04\u0E48\u0E32 Objective_Count \u0E43\u0E19\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E27\u0E48\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 / Objective_Count is invalid or missing in record data.</div>
      `;
        wrap.appendChild(errCard);
        return wrap;
      }
      const partAContainer = document.createElement("div");
      partAContainer.className = "mbo-table-container";
      const barA = document.createElement("div");
      barA.className = "mbo-table-header-bar";
      barA.innerHTML = `
      <span>PART A: \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E1C\u0E25\u0E07\u0E32\u0E19 / Part A Objectives Evaluation (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Appraiser Matrix]</span>
    `;
      partAContainer.appendChild(barA);
      const tableA = document.createElement("table");
      tableA.className = "mbo-grid-table";
      let slotHeadersHtml = "";
      appraiserInfo.slots.forEach((s) => {
        const slotTitle = s.slotIndex >= 3 ? `${escapeHtml2(s.label)} (Preview Logical Slot)` : escapeHtml2(s.label);
        const isActiveCol = s.slotIndex === activeSlot;
        slotHeadersHtml += `<th style="width: 16%; ${isActiveCol ? "background:#0284c7; color:#ffffff;" : ""}">${slotTitle} ${isActiveCol ? "\u2605 Active" : ""}</th>`;
      });
      tableA.innerHTML = `
      <thead>
        <tr>
          <th class="sticky-col" style="width: 40px; text-align: center;">#</th>
          <th class="sticky-col" style="width: 22%; left: 40px;">\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 & \u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19 / Objective</th>
          <th style="width: 18%;">\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E08\u0E23\u0E34\u0E07 & \u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19 / Evidence Context</th>
          ${slotHeadersHtml}
          <th class="sticky-right" style="width: 10%; text-align: center;">\u0E04\u0E30\u0E41\u0E19\u0E19\u0E2A\u0E23\u0E38\u0E1B / Result</th>
        </tr>
      </thead>
    `;
      const tbodyA = document.createElement("tbody");
      tableA.appendChild(tbodyA);
      for (let i = 1; i <= count; i++) {
        const objVal = this._getVal(`Objective_${i}`);
        const wVal = this._getVal(`Weight_${i}`) || "0";
        const diffVal = this._getVal(`Difficulty_${i}`);
        const actResult = this._getVal(`Actual_Result_${i}`);
        const selfAch = this._getVal(`Self_Achievement_${i}`) || "-";
        const avgScore = this._getVal(`Average_Objective_Score_${i}`);
        const mboPoint = this._getVal(`MBO_Point_${i}`);
        const objAttachHtml = this._renderAttachmentControl(`Objective_Attachment_${i}`, "Objectives", false);
        const midAttachHtml = this._renderAttachmentControl(`MidYear_Attachment_${i}`, "Mid-Year", false);
        const selfAttachHtml = this._renderAttachmentControl(`Self_Attachment_${i}`, "Self Evaluation", false);
        let slotCellsHtml = "";
        appraiserInfo.slots.forEach((s) => {
          const ratingVal = s.partARatings[i] || "";
          const itemComment = s.partAComments[i] || "";
          const isSlotEditable = this.isEditable && s.slotIndex === activeSlot;
          const ratingDataCode = s.slotIndex === 1 ? `Manager_Achievement_${i}` : s.slotIndex === 2 ? `GM_Achievement_${i}` : "";
          const commentDataCode = s.slotIndex === 1 ? `Manager_Comment_${i}` : s.slotIndex === 2 ? `GM_Comment_${i}` : "";
          if (isSlotEditable) {
            slotCellsHtml += `
            <td style="background:#f0f9ff; border:2px solid #0284c7;">
              <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:2px;">[EDITABLE / ACTIVE APPRAISER]</div>
              <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:2px;">Rating [1-5]:</div>
              <select class="mbo-cell-select ${ratingDataCode ? "mbo-field" : ""}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="height:32px; font-size:12px;">
                <option value="" ${!ratingVal ? "selected" : ""}>-- Select --</option>
                <option value="1" ${ratingVal === "1" ? "selected" : ""}>1 : Rarely meet</option>
                <option value="2" ${ratingVal === "2" ? "selected" : ""}>2 : Partially meet</option>
                <option value="3" ${ratingVal === "3" ? "selected" : ""}>3 : Fully meet</option>
                <option value="4" ${ratingVal === "4" ? "selected" : ""}>4 : Exceeded</option>
                <option value="5" ${ratingVal === "5" ? "selected" : ""}>5 : Remarkable</option>
              </select>
              <div style="font-size:11px; font-weight:700; color:#475569; margin:4px 0 2px 0;">Feedback:</div>
              <textarea class="mbo-wide-textarea ${commentDataCode ? "mbo-field" : ""}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="min-height:45px; font-size:12px;" placeholder="Comment...">${escapeHtml2(itemComment)}</textarea>
            </td>
          `;
          } else {
            slotCellsHtml += `
            <td style="background:#f8fafc; color:#334155; font-size:12px;">
              <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:2px;">[READ-ONLY / VISIBLE]</div>
              <strong>Score:</strong> ${ratingVal ? `L${escapeHtml2(ratingVal)}` : '<span style="color:#94a3b8;">-</span>'}<br/>
              <div style="margin-top:2px; font-style:italic; color:#475569;">"${escapeHtml2(itemComment || "No comment recorded")}"</div>
            </td>
          `;
          }
        });
        let resultContextHtml = "";
        if (appraiserInfo.isFullyComplete) {
          resultContextHtml = `
          <div style="font-size:11px; color:#166534; background:#f0fdf4; padding:6px; border-radius:4px; border:1px solid #bbf7d0;">
            Avg: <strong>${escapeHtml2(avgScore || "-")}</strong><br/>
            Point: <strong>${escapeHtml2(mboPoint || "-")}</strong>
          </div>
        `;
        } else {
          resultContextHtml = `
          <div style="font-size:11px; color:#991b1b; background:#fef2f2; padding:6px; border-radius:4px; border:1px solid #fecaca;">
            <span class="mbo-pending-badge">\u26A0\uFE0F Pending</span>
          </div>
        `;
        }
        const tr = document.createElement("tr");
        tr.dataset.objIndex = String(i);
        tr.innerHTML = `
        <td class="mbo-row-num-cell sticky-col">${i}</td>
        <td class="sticky-col" style="left:40px;">
          <strong style="color:#0f172a; font-size:13px;">#${i} ${escapeHtml2(objVal) || "(No title)"}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin-top:2px;">
            Weight: ${escapeHtml2(wVal)}% | Diff: ${diffVal ? `L${escapeHtml2(diffVal)}` : "N/A"} | Self: L${escapeHtml2(selfAch)}
          </div>
        </td>
        <td>
          <div style="font-size:12px; color:#334155; background:#f8fafc; padding:6px; border-radius:4px; min-height:50px;">${escapeHtml2(actResult) || "-"}</div>
          <div style="margin-top:4px; font-size:9.5px; color:#64748b; display:flex; flex-direction:column; gap:2px;">
            <div>\u{1F4CC} Obj File: ${objAttachHtml}</div>
            <div>\u{1F4CC} Mid File: ${midAttachHtml}</div>
            <div>\u{1F4CC} Self File: ${selfAttachHtml}</div>
          </div>
        </td>
        ${slotCellsHtml}
        <td class="sticky-right" style="vertical-align:middle; text-align:center;">${resultContextHtml}</td>
      `;
        tbodyA.appendChild(tr);
      }
      partAContainer.appendChild(tableA);
      wrap.appendChild(partAContainer);
      const partBContainer = document.createElement("div");
      partBContainer.className = "mbo-table-container";
      const barB = document.createElement("div");
      barB.className = "mbo-table-header-bar";
      barB.innerHTML = `
      <span>PART B: \u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E2A\u0E21\u0E23\u0E23\u0E16\u0E19\u0E30 / Part B Competency Evaluation (${applicableCompList.length} Items)</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[${escapeHtml2(compSetCode)}]</span>
    `;
      partBContainer.appendChild(barB);
      const tableB = document.createElement("table");
      tableB.className = "mbo-grid-table";
      tableB.innerHTML = `
      <thead>
        <tr>
          <th class="sticky-col" style="width: 25%;">\u0E2A\u0E21\u0E23\u0E23\u0E16\u0E19\u0E30 / Competency Item</th>
          ${slotHeadersHtml}
          <th class="sticky-right" style="width: 12%; text-align: center;">\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 / Result</th>
        </tr>
      </thead>
    `;
      const tbodyB = document.createElement("tbody");
      tableB.appendChild(tbodyB);
      applicableCompList.forEach((comp) => {
        let slotCellsHtml = "";
        appraiserInfo.slots.forEach((s) => {
          const ratingVal = s.partBRatings[comp.id] || "";
          const itemComment = s.partBComments[comp.id] || "";
          const isSlotEditable = this.isEditable && s.slotIndex === activeSlot;
          const ratingDataCode = s.slotIndex === 1 ? `Manager_Competency_Rating_${comp.id}` : s.slotIndex === 2 ? `GM_Competency_Rating_${comp.id}` : "";
          const commentDataCode = s.slotIndex === 1 ? `Manager_Competency_Comment_${comp.id}` : s.slotIndex === 2 ? `GM_Competency_Comment_${comp.id}` : "";
          if (isSlotEditable) {
            slotCellsHtml += `
            <td style="background:#f0f9ff; border:2px solid #0284c7;">
              <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:2px;">[EDITABLE / ACTIVE APPRAISER]</div>
              <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:2px;">Score [1-5]:</div>
              <select class="mbo-cell-select ${ratingDataCode ? "mbo-field" : ""}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="height:32px; font-size:12px;">
                <option value="" ${!ratingVal ? "selected" : ""}>-- Select --</option>
                <option value="1" ${ratingVal === "1" ? "selected" : ""}>1 : Unsatisfactory</option>
                <option value="2" ${ratingVal === "2" ? "selected" : ""}>2 : Needs Improvement</option>
                <option value="3" ${ratingVal === "3" ? "selected" : ""}>3 : Meets Standard</option>
                <option value="4" ${ratingVal === "4" ? "selected" : ""}>4 : Exceeds Standard</option>
                <option value="5" ${ratingVal === "5" ? "selected" : ""}>5 : Outstanding</option>
              </select>
              <div style="font-size:11px; font-weight:700; color:#475569; margin:4px 0 2px 0;">Feedback:</div>
              <textarea class="mbo-wide-textarea ${commentDataCode ? "mbo-field" : ""}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="min-height:40px; font-size:12px;" placeholder="Comment...">${escapeHtml2(itemComment)}</textarea>
            </td>
          `;
          } else {
            slotCellsHtml += `
            <td style="background:#f8fafc; color:#334155; font-size:12px;">
              <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:2px;">[READ-ONLY / VISIBLE]</div>
              <strong>Score:</strong> ${ratingVal ? `L${escapeHtml2(ratingVal)}` : '<span style="color:#94a3b8;">-</span>'}<br/>
              <div style="margin-top:2px; font-style:italic; color:#475569;">"${escapeHtml2(itemComment || "No comment recorded")}"</div>
            </td>
          `;
          }
        });
        const compResult = this._getVal(`Competency_Result_${comp.id}`);
        let partBResultLabel = "";
        if (comp.isCOCE) {
          partBResultLabel = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
        } else if (appraiserInfo.isFullyComplete) {
          partBResultLabel = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml2(compResult || "-")}</span>`;
        } else {
          partBResultLabel = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Pending</span>';
        }
        const tr = document.createElement("tr");
        tr.dataset.compId = String(comp.id);
        tr.innerHTML = `
        <td class="sticky-col">
          <strong style="color:#0f172a; font-size:13px;">${escapeHtml2(comp.nameTH)}</strong>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${escapeHtml2(comp.desc)}</div>
        </td>
        ${slotCellsHtml}
        <td class="sticky-right" style="vertical-align:middle; text-align:center;">${partBResultLabel}</td>
      `;
        tbodyB.appendChild(tr);
      });
      partBContainer.appendChild(tableB);
      wrap.appendChild(partBContainer);
      const scoreSummaryCard = document.createElement("div");
      scoreSummaryCard.className = "mbo-wide-card";
      if (appraiserInfo.isFullyComplete) {
        scoreSummaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; color:#166534; font-size:15px;">\u2705 \u0E2A\u0E23\u0E38\u0E1B\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C / Evaluation Complete</h3>
            <p style="margin:4px 0 0 0; font-size:12.5px; color:#475569;">\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E17\u0E38\u0E01\u0E17\u0E48\u0E32\u0E19\u0E25\u0E07\u0E04\u0E30\u0E41\u0E19\u0E19\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19\u0E41\u0E25\u0E49\u0E27 (Part A & Part B Required Data Complete)</p>
          </div>
          <div style="font-weight:700; font-size:14px; color:#166534; background:#dcfce7; padding:8px 16px; border-radius:6px;">
            Part A + Part B Verified Complete
          </div>
        </div>
      `;
      } else {
        scoreSummaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; color:#991b1b; font-size:15px;">\u23F3 \u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E25\u0E07\u0E04\u0E30\u0E41\u0E19\u0E19 / Rating Incomplete</h3>
            <p style="margin:4px 0 0 0; font-size:12.5px; color:#475569;">\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E23\u0E27\u0E1A\u0E23\u0E27\u0E21\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E08\u0E32\u0E01\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19 (${appraiserInfo.completedCount}/${appraiserInfo.totalCount} Complete Slots)</p>
          </div>
          <div>
            <span class="mbo-pending-badge">\u26A0\uFE0F Combined Result Pending / Incomplete</span>
          </div>
        </div>
      `;
      }
      wrap.appendChild(scoreSummaryCard);
      return wrap;
    }
    _renderScreenHrFinal() {
      const wrap = document.createElement("div");
      const status = this._getVal("Status") || "15 HR Final Check";
      const isCompleted = status === "16 Completed";
      const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);
      const partAWeight = this._getVal("PartA_Weight") || this.previewOptions.partAWeight;
      const partBWeight = this._getVal("PartB_Weight") || this.previewOptions.partBWeight;
      const execSummaryCard = document.createElement("div");
      execSummaryCard.className = "mbo-wide-card";
      execSummaryCard.style.borderTop = isCompleted ? "4px solid #166534" : "4px solid #0284c7";
      execSummaryCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
        <div>
          <h2 style="margin:0; font-size:17px; color:${isCompleted ? "#166534" : "#0284c7"};">
            ${isCompleted ? "\u{1F389} \u0E1C\u0E25\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C / MBO Evaluation Completed" : "\u{1F50D} \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22\u0E42\u0E14\u0E22 HR / HR Final Check"}
          </h2>
          <span style="font-size:12px; color:#64748b;">
            ${isCompleted ? "\u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C\u0E41\u0E25\u0E30\u0E16\u0E39\u0E01\u0E25\u0E47\u0E2D\u0E01\u0E16\u0E32\u0E27\u0E23" : "\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E1B\u0E34\u0E14\u0E23\u0E2D\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E14\u0E22 HR"}
          </span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:13px; font-weight:700; padding:4px 12px; border-radius:12px; background:${isCompleted ? "#dcfce7" : "#e0f2fe"}; color:${isCompleted ? "#166534" : "#0369a1"};">
            ${escapeHtml2(status)}
          </span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:14px;">
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Appraiser Completion</div>
          <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:2px;">
            ${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Appraisers (${appraiserInfo.completionPercent}%)
          </div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Part A Weight (Objectives)</div>
          <div style="font-size:14px; font-weight:700; color:#0369a1; margin-top:2px;">${escapeHtml2(partAWeight)}%</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Part B Weight (Competencies)</div>
          <div style="font-size:14px; font-weight:700; color:#0369a1; margin-top:2px;">${escapeHtml2(partBWeight)}%</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Final Result Status</div>
          <div style="font-size:14px; font-weight:700; margin-top:2px;">
            ${appraiserInfo.isFullyComplete ? '<span style="color:#166534;">Verified & Complete</span>' : '<span style="color:#991b1b;">Pending / Incomplete</span>'}
          </div>
        </div>
      </div>
    `;
      wrap.appendChild(execSummaryCard);
      const readOnlyBreakdown = this._renderReadOnlyAppraiserBreakdown(appraiserInfo);
      wrap.appendChild(readOnlyBreakdown);
      return wrap;
    }
    _renderReadOnlyAppraiserBreakdown(appraiserInfo) {
      const container = document.createElement("div");
      container.className = "mbo-table-container";
      const compSetCode = this._getVal("Competency_Set_Code") || this.previewOptions.competencySetCode;
      const applicableCompList = getApplicableCompetencies(compSetCode);
      const count = parseObjectiveCount(this._getVal("Objective_Count"));
      if (count === null) {
        const errCard = document.createElement("div");
        errCard.style.padding = "20px";
        errCard.style.margin = "12px 0";
        errCard.style.background = "#fef2f2";
        errCard.style.border = "1px solid #fca5a5";
        errCard.style.borderRadius = "6px";
        errCard.style.color = "#991b1b";
        errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">\u0E04\u0E48\u0E32 Objective_Count \u0E43\u0E19\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E27\u0E48\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 / Objective_Count is invalid or missing in record data.</div>
      `;
        container.appendChild(errCard);
        return container;
      }
      const bar = document.createElement("div");
      bar.className = "mbo-table-header-bar";
      bar.innerHTML = `
      <span>\u{1F4CB} \u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 / Evaluation Detail Breakdown (Read-Only)</span>
    `;
      container.appendChild(bar);
      const tableA = document.createElement("table");
      tableA.className = "mbo-grid-table";
      let slotHeadersHtml = "";
      appraiserInfo.slots.forEach((s) => {
        slotHeadersHtml += `<th style="width: 16%;">${escapeHtml2(s.label)}</th>`;
      });
      tableA.innerHTML = `
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="width: 25%;">Part A Objectives</th>
          <th style="width: 20%;">Actual Result</th>
          ${slotHeadersHtml}
        </tr>
      </thead>
    `;
      const tbodyA = document.createElement("tbody");
      tableA.appendChild(tbodyA);
      for (let i = 1; i <= count; i++) {
        const objVal = this._getVal(`Objective_${i}`);
        const wVal = this._getVal(`Weight_${i}`) || "0";
        const actResult = this._getVal(`Actual_Result_${i}`);
        const mgrScore = this._getVal(`Manager_Objective_Score_${i}`);
        const gmScore = this._getVal(`GM_Objective_Score_${i}`);
        const avgScore = this._getVal(`Average_Objective_Score_${i}`);
        const mboPoint = this._getVal(`MBO_Point_${i}`);
        const midAttachHtml = this._getAttachmentHtml(`MidYear_Attachment_${i}`, this.previewOptions.midyearAttachments?.[i]);
        const selfAttachHtml = this._getAttachmentHtml(`Final_Attachment_${i}`, this.previewOptions.finalAttachments?.[i]);
        let slotCellsHtml = "";
        appraiserInfo.slots.forEach((s) => {
          const ratingVal = s.partARatings[i] || "-";
          const commentVal = s.partAComments[i] || "-";
          slotCellsHtml += `
          <td style="font-size:12px;">
            <strong>Rating:</strong> L${escapeHtml2(ratingVal)}<br/>
            <span style="color:#475569;">"${escapeHtml2(commentVal)}"</span>
          </td>
        `;
        });
        let partAResultContext = "";
        if (appraiserInfo.isFullyComplete) {
          partAResultContext = `
          <div style="font-size:11px; color:#166534; background:#f0fdf4; padding:4px; border-radius:4px; border:1px solid #bbf7d0;">
            Avg: <strong>${escapeHtml2(avgScore || "-")}</strong><br/>
            Point: <strong>${escapeHtml2(mboPoint || "-")}</strong>
          </div>
        `;
        } else {
          partAResultContext = `
          <div style="font-size:11px; color:#991b1b; background:#fef2f2; padding:4px; border-radius:4px; border:1px solid #fecaca;">
            <span class="mbo-pending-badge">\u26A0\uFE0F Combined Result Pending / Incomplete</span>
          </div>
        `;
        }
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#0f172a; font-size:13px;">#${i} ${escapeHtml2(objVal)}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700;">Weight: ${escapeHtml2(wVal)}%</div>
        </td>
        <td>
          <div style="font-size:12px; color:#334155; background:#f8fafc; padding:4px; border-radius:4px;">${escapeHtml2(actResult || "-")}</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Mid: ${midAttachHtml} | Self: ${selfAttachHtml}</div>
        </td>
        ${slotCellsHtml}
        <td style="vertical-align:middle; text-align:center;">${partAResultContext}</td>
      `;
        tbodyA.appendChild(tr);
      }
      container.appendChild(tableA);
      const tableB = document.createElement("table");
      tableB.className = "mbo-grid-table";
      tableB.style.marginTop = "14px";
      tableB.innerHTML = `
      <thead>
        <tr>
          <th style="width: 30%;">Part B Competency Item</th>
          ${slotHeadersHtml}
        </tr>
      </thead>
    `;
      const tbodyB = document.createElement("tbody");
      tableB.appendChild(tbodyB);
      applicableCompList.forEach((comp) => {
        const compResult = this._getVal(`Competency_Result_${comp.id}`);
        let slotCellsHtml = "";
        appraiserInfo.slots.forEach((s) => {
          const ratingVal = s.partBRatings[comp.id] || "-";
          const commentVal = s.partBComments[comp.id] || "-";
          slotCellsHtml += `
          <td style="font-size:12px;">
            <strong>Score:</strong> L${escapeHtml2(ratingVal)}<br/>
            <span style="color:#475569;">"${escapeHtml2(commentVal)}"</span>
          </td>
        `;
        });
        let compResultBadge = "";
        if (comp.isCOCE) {
          compResultBadge = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
        } else if (appraiserInfo.isFullyComplete) {
          compResultBadge = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml2(compResult || "-")}</span>`;
        } else {
          compResultBadge = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Pending</span>';
        }
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>
          <strong style="color:#0f172a; font-size:13px;">${escapeHtml2(comp.nameTH)}</strong>
        </td>
        ${slotCellsHtml}
        <td style="vertical-align:middle; text-align:center;">${compResultBadge}</td>
      `;
        tbodyB.appendChild(tr);
      });
      container.appendChild(tableB);
      return container;
    }
    _getAttachmentHtml(fieldCode, fixtureArr) {
      const fileVal = this.record[fieldCode];
      let realFileList = [];
      if (fileVal && typeof fileVal === "object" && Array.isArray(fileVal.value)) {
        realFileList = fileVal.value.map((f) => f.name || f.fileKey || "Attachment");
      }
      if (realFileList.length > 0) {
        return realFileList.map((fn) => `<span class="mbo-attachment-chip">\u{1F4C4} ${escapeHtml2(fn)}</span>`).join(" ");
      }
      if (this.isPreviewMode) {
        const fixtureFiles = fixtureArr || [`Evidence_${fieldCode}.pdf`];
        return fixtureFiles.map((fn) => `<span class="mbo-attachment-chip" style="border-style:dashed;">\u{1F4C4} ${escapeHtml2(fn)} (Preview)</span>`).join(" ");
      }
      return '<span style="color:#94a3b8; font-size:11px;">No attachment / \u0E44\u0E21\u0E48\u0E21\u0E35\u0E44\u0E1F\u0E25\u0E4C\u0E41\u0E19\u0E1A</span>';
    }
    syncFromDom() {
      if (!this.root) return;
      this.root.querySelectorAll(".mbo-field").forEach((input) => {
        const code = input.dataset.code;
        if (code) {
          const val = input.value !== void 0 ? input.value : "";
          this._setVal(code, val);
        }
      });
    }
    showValidationErrors(fieldErrors = []) {
      this.currentErrors = fieldErrors;
      this._renderInlineErrors(fieldErrors);
      this.focusFirstInvalidField(fieldErrors);
    }
    clearValidationErrors() {
      this.currentErrors = [];
      if (!this.root) return;
      const summaryAnchor = this.root.querySelector("#mbo-error-summary-anchor");
      if (summaryAnchor) summaryAnchor.innerHTML = "";
      this.root.querySelectorAll(".mbo-field").forEach((input) => {
        this._refreshSingleFieldHighlight(input, this.root);
      });
    }
    focusFirstInvalidField(fieldErrors = []) {
      if (!this.root || !fieldErrors || fieldErrors.length === 0) return;
      const firstField = fieldErrors[0].field;
      if (!firstField) return;
      if (firstField === "Employee_Code" && this.isCreate) {
        const empInput = this.root.querySelector("#mbo-lookup-emp-input");
        if (empInput) {
          empInput.scrollIntoView({ behavior: "smooth", block: "center" });
          requestAnimationFrame(() => empInput.focus());
        }
        return;
      }
      if (firstField === "Total_Weight") {
        const weightBox = this.root.querySelector("#mbo-weight-summary-box");
        if (weightBox) {
          weightBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      const input = this.root.querySelector(`.mbo-field[data-code="${firstField}"]`);
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        requestAnimationFrame(() => {
          try {
            input.focus();
            if (typeof input.select === "function") input.select();
          } catch (e) {
          }
        });
      }
    }
    _renderStatusGuidanceCard() {
      const card = document.createElement("div");
      const status = this.isCreate ? "01 Draft Objective" : this._getVal("Status") || "01 Draft Objective";
      const rawTopology = this._getVal("Routing_Topology");
      const guidance = getStatusGuidance(status, rawTopology);
      const cardClass = guidance.isWarning ? "mbo-guidance-warning" : "mbo-guidance-info";
      card.className = `mbo-workflow-guidance-card ${cardClass}`;
      card.style.marginBottom = "14px";
      card.innerHTML = `
      <div class="mbo-guidance-header">
        <div class="mbo-guidance-status-pill">
          \u{1F4CC} \u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 / Current Status: <strong>${escapeHtml2(status)}</strong>
        </div>
        <div class="mbo-guidance-notice">
          \u{1F4A1} \u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07 / \u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 / \u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E2A\u0E31\u0E48\u0E07\u0E01\u0E32\u0E23\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19\u0E02\u0E2D\u0E07 Kintone (Process action buttons)
        </div>
      </div>
      <div class="mbo-guidance-body">
        <div class="mbo-guidance-text-th">${escapeHtml2(guidance.th)}</div>
        <div class="mbo-guidance-text-en">${escapeHtml2(guidance.en)}</div>
      </div>
    `;
      return card;
    }
    _renderRouteContext() {
      const card = document.createElement("div");
      card.className = "mbo-route-context-card";
      const rawTopology = this._getVal("Routing_Topology");
      const topInfo = classifyTopologyForUI(rawTopology);
      const appCount = Math.min(Math.max(parseInt(this.appraiserCount || 2, 10), 1), 4);
      const requesterUser = this._getValObj("Requester_User");
      const managerUser = this._getValObj("Manager_User");
      const gmUser = this._getValObj("GM_User");
      const firstManagerUser = this._getValObj("First_Manager_User");
      const pos = this._getVal("Employee_Position") || "-";
      const sec = this._getVal("Employee_Section") || "-";
      const team = this._getVal("Team") || "-";
      const routingKey = this._getVal("Routing_Key") || sec;
      let topologyBadgeHtml = "";
      if (!topInfo.isCanonical) {
        topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fef2f2; color: #dc2626;">Technical Details: \u26A0\uFE0F Unrecognized Topology (${escapeHtml2(topInfo.raw || "Not Specified")})</span>`;
      } else if (topInfo.isG2) {
        topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fffbe6; color: #b45309;">Technical Details: \u26A0\uFE0F Unsupported in V1 (${escapeHtml2(topInfo.raw)})</span>`;
      } else {
        topologyBadgeHtml = `<span class="mbo-route-topology-badge">Technical Details: ${escapeHtml2(topInfo.raw)} (${appCount} Slots) | Pos: ${escapeHtml2(pos)} | Sec: ${escapeHtml2(sec)}${team !== "-" ? ` | Team: ${escapeHtml2(team)}` : ""} | Rule: ${escapeHtml2(routingKey)} | Source: App795</span>`;
      }
      if (!topInfo.isSupportedV1) {
        card.innerHTML = `
        <div class="mbo-route-title">
          <span>\u{1F517} \u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 / Evaluation & Approval Route</span>
          ${topologyBadgeHtml}
        </div>
        <div style="padding: 10px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 4px; font-size: 12.5px; color: #b45309;">
          \u26A0\uFE0F <strong>\u0E44\u0E21\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19 V1 / Unsupported V1 Approval Route</strong><br/>
          ${topInfo.isG2 ? `\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07 ${escapeHtml2(topInfo.raw)} \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A MBO V1 \u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A M1_G1 \u0E41\u0E25\u0E30 M1_M2_G1 \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19)` : `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing Topology (${escapeHtml2(topInfo.raw || "\u0E27\u0E48\u0E32\u0E07")}) \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19`}
        </div>
      `;
        return card;
      }
      const status = this.isCreate ? "01 Draft Objective" : this._getVal("Status") || "01 Draft Objective";
      const macroStage = getMacroStage(status);
      const steps = [
        {
          slotIndex: 0,
          roleTH: "\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19",
          roleEN: "Employee",
          userName: formatUserDisplay(requesterUser) !== "-" ? formatUserDisplay(requesterUser) : this._getVal("Employee_Name") || "Requester Employee",
          statusBadge: macroStage === 1 ? "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Current" : "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27 / Reviewed"
        },
        {
          slotIndex: 1,
          roleTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1",
          roleEN: "1st Appraiser",
          userName: formatUserDisplay(managerUser) !== "-" ? formatUserDisplay(managerUser) : "1st Appraiser",
          statusBadge: macroStage === 4 ? "\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19\u0E41\u0E25\u0E49\u0E27 / Scored" : macroStage > 1 ? "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27 / Reviewed" : "\u0E23\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Waiting"
        }
      ];
      if (appCount >= 2) {
        steps.push({
          slotIndex: 2,
          roleTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2",
          roleEN: "2nd Appraiser",
          userName: formatUserDisplay(gmUser) !== "-" ? formatUserDisplay(gmUser) : "2nd Appraiser",
          statusBadge: macroStage === 4 ? "\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19\u0E41\u0E25\u0E49\u0E27 / Scored" : macroStage > 1 ? "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27 / Reviewed" : "\u0E23\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Waiting"
        });
      }
      if (appCount >= 3) {
        steps.push({
          slotIndex: 3,
          roleTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 3",
          roleEN: "3rd Appraiser",
          userName: formatUserDisplay(firstManagerUser) !== "-" ? formatUserDisplay(firstManagerUser) : this.previewOptions.slot3Name || "3rd Appraiser (Preview)",
          statusBadge: macroStage === 4 ? "\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19\u0E41\u0E25\u0E49\u0E27 / Scored" : macroStage > 1 ? "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27 / Reviewed" : "\u0E23\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Waiting"
        });
      }
      if (appCount >= 4) {
        steps.push({
          slotIndex: 4,
          roleTH: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 4",
          roleEN: "4th Appraiser",
          userName: this.previewOptions.slot4Name || "4th Appraiser (Preview)",
          statusBadge: macroStage === 4 ? "\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19\u0E41\u0E25\u0E49\u0E27 / Scored" : macroStage > 1 ? "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27 / Reviewed" : "\u0E23\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Waiting"
        });
      }
      steps.push({
        slotIndex: 5,
        roleTH: "HR Final Check",
        roleEN: "HR Final / HR Admin",
        userName: "\u0E1D\u0E48\u0E32\u0E22\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E1A\u0E38\u0E04\u0E04\u0E25 / HR Control Center",
        statusBadge: status === "16 Completed" ? "\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E41\u0E25\u0E49\u0E27 / Completed" : status === "15 HR Final Check" ? "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Current" : "\u0E23\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Waiting"
      });
      const routeStepsHtml = steps.map((s) => `
      <div class="mbo-route-step ${s.slotIndex === this.activeSlotIndex ? "active-slot" : ""}">
        <div style="font-size: 11px; font-weight: 700; color: #475569;">${escapeHtml2(s.roleTH)} / ${escapeHtml2(s.roleEN)}</div>
        <div class="mbo-route-user" style="font-size: 12.5px; font-weight: 700; color: #0f172a; margin: 2px 0;">${escapeHtml2(s.userName)}</div>
        <div style="font-size: 10.5px; color: #0284c7; font-weight: 600;">[${escapeHtml2(s.statusBadge)}]</div>
      </div>
    `).join("");
      card.innerHTML = `
      <div class="mbo-route-title">
        <span>\u{1F517} \u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 / Evaluation & Approval Route</span>
        ${topologyBadgeHtml}
      </div>
      <div class="mbo-route-grid">
        ${routeStepsHtml}
      </div>
    `;
      return card;
    }
    _renderCollapsibleLegendAndGuidelines() {
      const card = document.createElement("div");
      card.className = "mbo-collapsible-card";
      card.innerHTML = `
      <details class="mbo-details" open>
        <summary class="mbo-summary">
          <span>\u{1F4CC} \u0E04\u0E33\u0E2D\u0E18\u0E34\u0E1A\u0E32\u0E22\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E0A\u0E48\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30\u0E40\u0E01\u0E13\u0E11\u0E4C\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07 / Field Legend & Rating Guidelines</span>
          <span class="mbo-summary-hint">(\u0E01\u0E14\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E0B\u0E48\u0E2D\u0E19/\u0E41\u0E2A\u0E14\u0E07 / Click to toggle)</span>
        </summary>
        <div class="mbo-details-body">
          <div class="mbo-legend-row">
            <div class="mbo-legend-title">\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E0A\u0E48\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 / Field State Key:</div>
            <div class="mbo-legend-items">
              <span class="mbo-legend-chip mbo-chip-editable">\u{1F7E2} \u0E01\u0E23\u0E2D\u0E01\u0E44\u0E14\u0E49 / Editable</span>
              <span class="mbo-legend-chip mbo-chip-required">\u{1F7E1} \u0E15\u0E49\u0E2D\u0E07\u0E01\u0E23\u0E2D\u0E01 / Required</span>
              <span class="mbo-legend-chip mbo-chip-system">\u{1F535} \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A / System Data</span>
              <span class="mbo-legend-chip mbo-chip-locked">\u26AA \u0E23\u0E30\u0E1A\u0E1A\u0E25\u0E47\u0E2D\u0E01 / Locked</span>
              <span class="mbo-legend-chip mbo-chip-error">\u{1F534} \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 / Invalid</span>
            </div>
          </div>
          <div class="mbo-guideline-row">
            <div class="mbo-guideline-col">
              <strong>\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E01 / Difficulty Level [1-4]:</strong><br/>
              Level 4: Challenging (\u0E17\u0E49\u0E32\u0E17\u0E32\u0E22\u0E21\u0E32\u0E01) | Level 3: Difficult (\u0E22\u0E32\u0E01) | Level 2: Achievable normal (\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07) | Level 1: Easily achievable (\u0E07\u0E48\u0E32\u0E22)
            </div>
            <div class="mbo-guideline-col">
              <strong>\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E1C\u0E25\u0E07\u0E32\u0E19 / Achievement Level [1-5]:</strong><br/>
              Level 5: Remarkable (\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14) | Level 4: Exceeding (\u0E40\u0E01\u0E34\u0E19\u0E40\u0E1B\u0E49\u0E32) | Level 3: Fully meet (\u0E15\u0E32\u0E21\u0E40\u0E1B\u0E49\u0E32) | Level 2: Partially meet (\u0E1A\u0E32\u0E07\u0E2A\u0E48\u0E27\u0E19) | Level 1: Rarely meet (\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E40\u0E1B\u0E49\u0E32)
            </div>
          </div>
        </div>
      </details>
    `;
      return card;
    }
    _renderInlineErrors(fieldErrors = []) {
      if (!this.root) return;
      const summaryAnchor = this.root.querySelector("#mbo-error-summary-anchor");
      if (!summaryAnchor) return;
      if (fieldErrors.length === 0) {
        summaryAnchor.innerHTML = "";
        return;
      }
      const errorCount = fieldErrors.length;
      const summaryCard = document.createElement("div");
      summaryCard.className = "mbo-error-summary-card";
      summaryCard.innerHTML = `
      <div class="mbo-error-summary-header">
        <span>\u26A0\uFE0F \u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E01\u0E49\u0E44\u0E02 ${errorCount} \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 / ${errorCount} items require correction</span>
      </div>
      <div class="mbo-error-summary-list">
        ${fieldErrors.map((err, idx) => `
          <button type="button" class="mbo-error-item-btn" data-field="${escapeHtml2(err.field)}">
            <span class="mbo-error-item-num">${idx + 1}</span>
            <div class="mbo-error-item-text">
              <div>${escapeHtml2(err.messageTH)}</div>
              <div class="en-sub">${escapeHtml2(err.messageEN)}</div>
            </div>
          </button>
        `).join("")}
      </div>
    `;
      summaryCard.querySelectorAll(".mbo-error-item-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const field = btn.dataset.field;
          this.focusFirstInvalidField([{ field }]);
        });
      });
      summaryAnchor.innerHTML = "";
      summaryAnchor.appendChild(summaryCard);
      fieldErrors.forEach((err) => {
        if (err.field === "Total_Weight") {
          const box = this.root.querySelector("#mbo-weight-summary-box");
          if (box) box.className = "mbo-weight-summary invalid";
          return;
        }
        if (err.field === "Employee_Code" && this.isCreate) {
          const empInput = this.root.querySelector("#mbo-lookup-emp-input");
          if (empInput) {
            empInput.classList.remove("mbo-field-state-editable");
            empInput.classList.add("mbo-field-state-error");
          }
          return;
        }
        const input = this.root.querySelector(`.mbo-field[data-code="${err.field}"]`);
        if (input) {
          input.classList.remove("mbo-field-state-editable", "mbo-field-state-required-empty");
          input.classList.add("mbo-field-state-error");
          const tagEl = this.root.querySelector(`.mbo-cell-tag[data-target="${err.field}"]`);
          if (tagEl) {
            const msgThFormatted = escapeHtml2(err.messageTH || "").replace(/\n/g, "<br/>");
            const msgEnFormatted = escapeHtml2(err.messageEN || "").replace(/\n/g, "<br/>");
            tagEl.innerHTML = `
            <span class="mbo-cell-error-msg">
              \u274C ${msgThFormatted}<br/>
              <span style="opacity: 0.85; font-size: 11px;">${msgEnFormatted}</span>
            </span>
          `;
          }
        }
      });
    }
    _renderErrorBanner(msg) {
      const banner = document.createElement("div");
      banner.className = "mbo-alert-banner mbo-alert-error";
      banner.innerHTML = `\u26A0\uFE0F <span>${msg}</span>`;
      return banner;
    }
    _renderLookupSection() {
      const box = document.createElement("div");
      box.className = "mbo-header-card";
      box.style.borderTopColor = this.isEmployeeVerified ? "#059669" : "#0284c7";
      box.style.background = this.isEmployeeVerified ? "#f0fdf4" : "#f0f9ff";
      const empCode = this._getVal("Employee_Code");
      const badgeText = this.isEmployeeVerified ? '<span style="color: #059669; font-weight: 700;">\u2713 \u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27 / Employee verified</span>' : '<span style="color: #0284c7; font-weight: 600;">(\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32 / Please enter Employee ID)</span>';
      box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
          STEP 1: \u0E23\u0E30\u0E1A\u0E38\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 / Identify Employee (App 53)
        </div>
        <div style="font-size: 13px;">${badgeText}</div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; max-width: 650px;">
        <input type="text" id="mbo-lookup-emp-input" class="mbo-cell-input mbo-field-state-editable" placeholder="\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E40\u0E0A\u0E48\u0E19 0149 / Enter Employee ID..." value="${escapeHtml2(empCode)}" style="flex: 1; font-weight: 600;" />
        <button type="button" id="mbo-lookup-btn" style="background: #0284c7; color: white; border: none; padding: 0 18px; height: 36px; border-radius: 4px; font-weight: 600; cursor: pointer;">
          \u0E04\u0E49\u0E19\u0E2B\u0E32\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 / Search
        </button>
      </div>
      <div id="mbo-lookup-msg" style="font-size: 12px; margin-top: 6px;"></div>
    `;
      return box;
    }
    _getActiveAppraiserSlot(status) {
      if (!status) return null;
      const top = this._getVal("Routing_Topology") || this.previewOptions?.routeScenario?.topology || "M1_G1";
      if (["02 First Manager Objective Review", "07 First Manager Mid-Year Review", "12 First Manager Final Evaluation"].includes(status)) {
        return top === "M1_M2_G1" || top === "M1_M2_G1_G2" ? 1 : null;
      }
      if (["03 Manager Objective Review", "08 Manager Mid-Year Review", "13 Manager Final Evaluation"].includes(status)) {
        if (top === "M1_ONLY" || top === "M1_G1" || top === "M1_G1_G2") return 1;
        if (top === "M1_M2_G1" || top === "M1_M2_G1_G2") return 2;
        return 1;
      }
      if (["04 GM Objective Review", "09 GM Mid-Year Review", "14 GM Final Evaluation"].includes(status)) {
        if (top === "M1_G1" || top === "M1_G1_G2") return 2;
        if (top === "M1_M2_G1" || top === "M1_M2_G1_G2") return 3;
        return null;
      }
      return null;
    }
    _getStageCurrentActor(status) {
      const s = String(status || "").trim();
      if (["01 Draft Objective", "06 Employee Mid-Year", "11 Employee Self Evaluation"].includes(s)) {
        return "EMPLOYEE";
      }
      if (["02 First Manager Objective Review", "07 First Manager Mid-Year Review", "12 First Manager Final Evaluation"].includes(s)) {
        return "FIRST_MANAGER";
      }
      if (["03 Manager Objective Review", "08 Manager Mid-Year Review", "13 Manager Final Evaluation"].includes(s)) {
        return "MANAGER";
      }
      if (["04 GM Objective Review", "09 GM Mid-Year Review", "14 GM Final Evaluation"].includes(s)) {
        return "GM";
      }
      if (s === "15 HR Final Check") {
        return "HR";
      }
      return "NONE";
    }
    _renderSupportCenterIfAdmin(root, status) {
      const loginUser = this.previewOptions?.simulatedLoginUserCode || (this.previewOptions?.viewerRole === "admin" ? "admin-form" : "") || (typeof kintone !== "undefined" ? kintone.getLoginUser()?.code : "");
      if (!AdminDiagnosticModel.isTechnicalAdmin(loginUser)) {
        return;
      }
      const adminCenter = new AdminSupportCenterUI();
      const adminDiv = document.createElement("div");
      adminDiv.className = "mbo-admin-support-center-wrapper";
      const diagContext = {
        loginUserCode: loginUser,
        requesterUserCodes: extractUserCodes(this._getVal("Requester_User")),
        routingKey: (this._getVal("Section_Code") || "") + (this._getVal("Team") ? "|" + this._getVal("Team") : ""),
        routingResult: { status: "PASS", topology: this._getVal("Routing_Topology") || "M1_G1" },
        activeAppraiserSlot: this._getActiveAppraiserSlot(status),
        profileCode: this.evalProfileCode,
        evalProfile: this.evalProfile,
        activeObjCount: this.activeObjCount,
        isObjCountValid: true,
        currentStatus: status,
        currentActor: this._getStageCurrentActor(status),
        resolvedViewerRole: this.resolvedViewerRole,
        record: this.record,
        recordId: this._getVal("$id"),
        mboKey: this._getVal("Record_Key"),
        fiscalYear: this._getVal("Fiscal_Year") || "2026",
        employeeCode: this._getVal("Employee_Code"),
        employeeName: this._getVal("Employee_Name"),
        requesterUser: extractUserCodes(this._getVal("Requester_User")).join(", "),
        appraiser1: extractUserCodes(this._getVal("First_Manager_User")).join(", "),
        appraiser2: extractUserCodes(this._getVal("GM_User")).join(", "),
        sectionCode: this._getVal("Section_Code"),
        teamName: this._getVal("Team")
      };
      adminDiv.innerHTML = adminCenter.renderHtml(diagContext);
      root.appendChild(adminDiv);
      const tabBtns = adminDiv.querySelectorAll(".admin-tab-btn");
      tabBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const tab = e.currentTarget.getAttribute("data-tab");
          if (!tab || tab === "repair") return;
          tabBtns.forEach((b) => {
            b.style.border = "1px solid #475569";
            b.style.color = "#94a3b8";
          });
          e.currentTarget.style.border = "1px solid #3b82f6";
          e.currentTarget.style.color = "#60a5fa";
          const healthTab = adminDiv.querySelector("#admin-tab-content-health");
          const checkTab = adminDiv.querySelector("#admin-tab-content-check");
          const valTab = adminDiv.querySelector("#admin-tab-content-validation");
          const candTab = adminDiv.querySelector("#admin-tab-content-candidate");
          const repairTab = adminDiv.querySelector("#admin-tab-content-repair");
          if (healthTab) healthTab.style.display = tab === "health" ? "block" : "none";
          if (checkTab) checkTab.style.display = tab === "check" ? "block" : "none";
          if (valTab) valTab.style.display = tab === "validation" ? "block" : "none";
          if (candTab) candTab.style.display = tab === "candidate" ? "block" : "none";
          if (repairTab) repairTab.style.display = tab === "repair" ? "block" : "none";
        });
      });
      const snapBtn = adminDiv.querySelector("#admin-snapshot-btn");
      const snapOutput = adminDiv.querySelector("#admin-snapshot-output");
      if (snapBtn && snapOutput) {
        snapBtn.addEventListener("click", () => {
          snapOutput.style.display = snapOutput.style.display === "none" ? "block" : "none";
        });
      }
    }
    _renderHeader() {
      const card = document.createElement("div");
      card.className = "mbo-header-card";
      const fy = this._getVal("Fiscal_Year") || "FY2026";
      const status = this.isCreate ? "NEW RECORD (\u0E01\u0E33\u0E25\u0E31\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07)" : this._getVal("Status") || "01 Draft Objective";
      const empCode = this._getVal("Employee_Code");
      const empName = this._getVal("Employee_Name");
      const empSection = this._getVal("Employee_Section");
      const empPosition = this._getVal("Employee_Position");
      const empDept = this._getVal("Employee_Department");
      const empStartDate = this._getVal("Employee_Start_Date");
      card.innerHTML = `
      <div class="mbo-title-bar">
        <h1 class="mbo-main-title">
          \u0E41\u0E1A\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E07\u0E32\u0E19 / Management By Objectives (MBO)
          <span class="mbo-fy-badge">${escapeHtml2(fy)}</span>
        </h1>
        <div class="mbo-status-badge">${escapeHtml2(status)}</div>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px;">
        STEP 2: \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 / Employee Information [\u{1F535} \u0E23\u0E30\u0E1A\u0E1A / System Data]
      </div>
      <div class="mbo-profile-grid-horizontal">
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">\u0E23\u0E2B\u0E31\u0E2A / Emp. ID</span>
          <div class="mbo-profile-value" id="mbo-header-emp-code" title="${escapeHtml2(empCode)}">${escapeHtml2(empCode) || "-"}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">\u0E0A\u0E37\u0E48\u0E2D-\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25 / Name</span>
          <div class="mbo-profile-value" id="mbo-header-emp-name" title="${escapeHtml2(empName)}">${escapeHtml2(empName) || "-"}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">\u0E2A\u0E48\u0E27\u0E19\u0E07\u0E32\u0E19 / Section</span>
          <div class="mbo-profile-value" id="mbo-header-emp-section" title="${escapeHtml2(empSection)}">${escapeHtml2(empSection) || "-"}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07 / Position</span>
          <div class="mbo-profile-value" id="mbo-header-emp-position" title="${escapeHtml2(empPosition)}">${escapeHtml2(empPosition) || "-"}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">\u0E41\u0E1C\u0E19\u0E01 / Department</span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept" title="${escapeHtml2(empDept)}">${escapeHtml2(empDept) || "-"}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">\u0E27\u0E31\u0E19\u0E40\u0E23\u0E34\u0E48\u0E21\u0E07\u0E32\u0E19 / Start Date</span>
          <div class="mbo-profile-value" id="mbo-header-emp-start-date" title="${escapeHtml2(empStartDate)}">${escapeHtml2(empStartDate) || "-"}</div>
        </div>
      </div>
    `;
      return card;
    }
    _renderHoshin() {
      const grid = document.createElement("div");
      grid.className = "mbo-hoshin-grid";
      const deptHoshin = this._getVal("Department_Hoshin");
      const secHoshin = this._getVal("Section_Hoshin");
      grid.innerHTML = `
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E1C\u0E19\u0E01 / Department's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Dept. Manager) [\u{1F535} \u0E23\u0E30\u0E1A\u0E1A / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${escapeHtml2(deptHoshin) || "(No Department Hoshin set)"}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E2A\u0E48\u0E27\u0E19\u0E07\u0E32\u0E19 / Section's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Sect. Manager) [\u{1F535} \u0E23\u0E30\u0E1A\u0E1A / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-sec-hoshin-view">${escapeHtml2(secHoshin) || "(No Section Hoshin set)"}</div>
      </div>
    `;
      return grid;
    }
    _renderWeightSummary() {
      const summary = document.createElement("div");
      summary.id = "mbo-weight-summary-box";
      summary.className = "mbo-weight-summary valid";
      summary.innerHTML = `
      <div class="mbo-weight-text" id="mbo-weight-calc-text">\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 / Total Weight: 0%</div>
      <div class="mbo-weight-status" id="mbo-weight-calc-status">Checking...</div>
    `;
      return summary;
    }
    _bindEvents(root) {
      root.querySelectorAll(".mbo-field").forEach((input) => {
        input.addEventListener("input", (e) => {
          const code = e.target.dataset.code;
          const val = e.target.value;
          this._setVal(code, val);
          this.onFieldChange(code, val);
          if (this.currentErrors && this.currentErrors.length > 0) {
            this.currentErrors = this.currentErrors.filter((err) => err.field !== code);
            this._renderInlineErrors(this.currentErrors);
          }
          this._refreshSingleFieldHighlight(e.target, root);
          if (code.startsWith("Weight_")) {
            this._updateTotalWeightDisplay();
          }
          if (code.startsWith("Progress_Percent_")) {
            const row = e.target.closest("td") || e.target.closest("div");
            const fill = row?.querySelector(".mbo-progress-bar-fill");
            if (fill) fill.style.width = `${val}%`;
            const lbl = row?.querySelector("label strong");
            if (lbl) lbl.textContent = `${val}%`;
          }
        });
      });
      if (this.isPreviewMode) {
        root.querySelectorAll("[data-preview-slot]").forEach((input) => {
          input.addEventListener("change", (e) => {
            const slotIdx = e.target.dataset.previewSlot;
            const tagName = e.target.tagName.toLowerCase();
            const val = e.target.value;
            if (!this.previewOptions[`slot${slotIdx}RatingsA`]) this.previewOptions[`slot${slotIdx}RatingsA`] = {};
            if (!this.previewOptions[`slot${slotIdx}CommentsA`]) this.previewOptions[`slot${slotIdx}CommentsA`] = {};
            if (!this.previewOptions[`slot${slotIdx}RatingsB`]) this.previewOptions[`slot${slotIdx}RatingsB`] = {};
            if (!this.previewOptions[`slot${slotIdx}CommentsB`]) this.previewOptions[`slot${slotIdx}CommentsB`] = {};
            const objRow = e.target.closest("[data-obj-index]");
            const compRow = e.target.closest("[data-comp-id]");
            if (objRow) {
              const objIndex = objRow.dataset.objIndex;
              if (tagName === "select") this.previewOptions[`slot${slotIdx}RatingsA`][objIndex] = val;
              if (tagName === "textarea") this.previewOptions[`slot${slotIdx}CommentsA`][objIndex] = val;
            } else if (compRow) {
              const compId = compRow.dataset.compId;
              if (tagName === "select") this.previewOptions[`slot${slotIdx}RatingsB`][compId] = val;
              if (tagName === "textarea") this.previewOptions[`slot${slotIdx}CommentsB`][compId] = val;
            }
          });
        });
      }
      const countSelect = root.querySelector("#mbo-obj-count-select");
      if (countSelect) {
        countSelect.addEventListener("change", (e) => {
          const count = e.target.value;
          this._setVal("Objective_Count", count);
          this.onFieldChange("Objective_Count", count);
          ValidationEngine.clearInactiveRows(this.record);
          this.render();
        });
      }
      const lookupInput = root.querySelector("#mbo-lookup-emp-input");
      if (lookupInput) {
        lookupInput.addEventListener("input", (e) => {
          const newCode = e.target.value.trim();
          const oldCode = this._getVal("Employee_Code");
          if (newCode !== oldCode) {
            this.isEmployeeVerified = false;
            this.onEmployeeCodeChanged(newCode);
            const msgEl = root.querySelector("#mbo-lookup-msg");
            if (msgEl) msgEl.innerHTML = '<span style="color: #b45309;">\u26A0\uFE0F \u0E21\u0E35\u0E01\u0E32\u0E23\u0E41\u0E01\u0E49\u0E44\u0E02\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E43\u0E2B\u0E21\u0E48 / Employee code changed. Please re-search.</span>';
          }
        });
        lookupInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const lookupBtn2 = root.querySelector("#mbo-lookup-btn");
            if (lookupBtn2) lookupBtn2.click();
          }
        });
      }
      const lookupBtn = root.querySelector("#mbo-lookup-btn");
      if (lookupBtn && lookupInput) {
        lookupBtn.addEventListener("click", async () => {
          const code = lookupInput.value.trim();
          const msgEl = root.querySelector("#mbo-lookup-msg");
          if (!code) {
            if (msgEl) msgEl.innerHTML = '<span style="color: #dc2626;">\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 / Please enter Employee ID</span>';
            return;
          }
          if (msgEl) msgEl.innerHTML = '<span style="color: #0369a1;">\u0E01\u0E33\u0E25\u0E31\u0E07\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E32\u0E01 App 53 \u0E41\u0E25\u0E30\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C... / Searching App 53 & verifying access...</span>';
          try {
            await this.executeLookup(code);
          } catch (err) {
          }
        });
      }
      root.querySelectorAll(".mbo-attachment-file-input").forEach((input) => {
        input.addEventListener("change", (e) => {
          const fieldCode = e.target.dataset.code;
          if (!fieldCode) return;
          const files = Array.from(e.target.files || []);
          if (files.length === 0) return;
          if (!this.pendingAttachments) this.pendingAttachments = {};
          if (!this.pendingAttachments[fieldCode]) this.pendingAttachments[fieldCode] = [];
          files.forEach((file) => {
            this.pendingAttachments[fieldCode].push({
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              status: "pending"
            });
          });
          this._refreshAttachmentControlDisplay(fieldCode, root);
        });
      });
      root.querySelectorAll(".mbo-attachment-remove-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          if (e && typeof e.preventDefault === "function") e.preventDefault();
          if (e && typeof e.stopPropagation === "function") e.stopPropagation();
          const targetBtn = e.target && typeof e.target.closest === "function" ? e.target.closest(".mbo-attachment-remove-btn") : btn;
          if (!targetBtn) return;
          const fieldCode = targetBtn.dataset?.code || targetBtn.getAttribute?.("data-code");
          if (!fieldCode) return;
          const pendingIdxStr = targetBtn.dataset?.pendingIdx || targetBtn.getAttribute?.("data-pending-idx");
          if (pendingIdxStr !== void 0 && pendingIdxStr !== null && pendingIdxStr !== "") {
            const idx = parseInt(pendingIdxStr, 10);
            if (this.pendingAttachments && this.pendingAttachments[fieldCode]) {
              this.pendingAttachments[fieldCode].splice(idx, 1);
            }
          } else {
            const filename = targetBtn.dataset?.filename || targetBtn.getAttribute?.("data-filename");
            const fileKey = targetBtn.dataset?.filekey || targetBtn.getAttribute?.("data-filekey");
            this._removeSavedAttachmentFile(fieldCode, filename, fileKey);
          }
          this._refreshAttachmentControlDisplay(fieldCode, root);
        });
      });
      root.querySelectorAll("a.mbo-attachment-filename").forEach((link) => {
        link.addEventListener("click", (e) => {
          if (e && typeof e.preventDefault === "function") e.preventDefault();
          if (e && typeof e.stopPropagation === "function") e.stopPropagation();
          const targetLink = e.target && typeof e.target.closest === "function" ? e.target.closest("a.mbo-attachment-filename") : link;
          if (!targetLink) return;
          const fieldCode = targetLink.dataset?.code || targetLink.getAttribute?.("data-code");
          const filename = targetLink.dataset?.filename || targetLink.getAttribute?.("data-filename");
          const fileKey = targetLink.dataset?.filekey || targetLink.getAttribute?.("data-filekey");
          this._handleAttachmentPreview(fieldCode, filename, fileKey);
        });
      });
      root.querySelectorAll(".mbo-attachment-download-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          if (e && typeof e.preventDefault === "function") e.preventDefault();
          if (e && typeof e.stopPropagation === "function") e.stopPropagation();
          const targetBtn = e.target && typeof e.target.closest === "function" ? e.target.closest(".mbo-attachment-download-btn") : btn;
          if (!targetBtn) return;
          const fieldCode = targetBtn.dataset?.code || targetBtn.getAttribute?.("data-code");
          const filename = targetBtn.dataset?.filename || targetBtn.getAttribute?.("data-filename");
          const fileKey = targetBtn.dataset?.filekey || targetBtn.getAttribute?.("data-filekey");
          this._handleAttachmentDownload(fieldCode, filename, fileKey);
        });
      });
    }
    async _handleAttachmentPreview(fieldCode, filename, fileKey) {
      if (!fileKey || typeof fileKey !== "string" || fileKey.trim() === "" || fileKey === "undefined" || fileKey === "null") {
        console.warn(`[MBO V2] Attachment preview skipped: missing fileKey for field ${fieldCode}`);
        return;
      }
      const win = typeof window !== "undefined" && window.open ? window.open("about:blank", "_blank") : null;
      try {
        const { downloadKintoneFileBlob: downloadKintoneFileBlob2 } = await Promise.resolve().then(() => (init_mbo_attachment_service(), mbo_attachment_service_exports));
        const blob = await downloadKintoneFileBlob2(fileKey);
        const mime = blob && blob.type ? blob.type.toLowerCase() : "";
        const ext = (filename || "").split(".").pop().toLowerCase();
        const isPreviewable = mime.startsWith("image/") || mime === "application/pdf" || mime.startsWith("text/") || mime.startsWith("audio/") || mime.startsWith("video/") || ["pdf", "jpg", "jpeg", "png", "gif", "svg", "webp", "txt", "html", "mp4", "mp3"].includes(ext);
        const objectUrl = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(blob) : null;
        if (isPreviewable && objectUrl) {
          if (win && !win.closed) {
            win.location.href = objectUrl;
          } else if (typeof window !== "undefined" && window.open) {
            window.open(objectUrl, "_blank");
          }
        } else {
          if (win && !win.closed) win.close();
          this._triggerBlobDownload(blob, filename);
        }
      } catch (err) {
        if (win && !win.closed) win.close();
        console.error(`[MBO V2] Attachment preview failed for field ${fieldCode} (${filename}):`, err.message);
        this._showAttachmentError(`\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E41\u0E2A\u0E14\u0E07\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E44\u0E1F\u0E25\u0E4C "${filename}" \u0E44\u0E14\u0E49 (${err.message}) / Cannot preview file`);
      }
    }
    async _handleAttachmentDownload(fieldCode, filename, fileKey) {
      if (!fileKey || typeof fileKey !== "string" || fileKey.trim() === "" || fileKey === "undefined" || fileKey === "null") {
        console.warn(`[MBO V2] Attachment download skipped: missing fileKey for field ${fieldCode}`);
        return;
      }
      try {
        const { downloadKintoneFileBlob: downloadKintoneFileBlob2 } = await Promise.resolve().then(() => (init_mbo_attachment_service(), mbo_attachment_service_exports));
        const blob = await downloadKintoneFileBlob2(fileKey);
        this._triggerBlobDownload(blob, filename);
      } catch (err) {
        console.error(`[MBO V2] Attachment download failed for field ${fieldCode} (${filename}):`, err.message);
        this._showAttachmentError(`\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C "${filename}" \u0E44\u0E14\u0E49 (${err.message}) / Download failed`);
      }
    }
    _triggerBlobDownload(blob, filename) {
      if (typeof URL === "undefined" || typeof document === "undefined") return;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename || "attachment";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      }, 1e3);
    }
    _showAttachmentError(msg) {
      if (typeof alert === "function") {
        alert(msg);
      } else {
        console.error(msg);
      }
    }
    _refreshAttachmentControlDisplay(fieldCode, root) {
      const activeRoot = this.root || root || document;
      const stageLabel = fieldCode.startsWith("Objective_") ? "Objectives" : fieldCode.startsWith("MidYear_") ? "Mid-Year" : "Self Evaluation";
      const container = activeRoot.querySelector(`[data-attachment-container="${fieldCode}"]`) || activeRoot.querySelector(`[data-attachment-box="${fieldCode}"]`) || activeRoot.querySelector(`input[data-code="${fieldCode}"]`)?.closest("td, div");
      const isEditable = Boolean(!container || container.querySelector(".mbo-attachment-file-input") || container.querySelector(".mbo-attachment-remove-btn") || activeRoot.querySelector(`input[data-code="${fieldCode}"]`));
      const parentCell = container ? container.closest("td") || container.parentElement : null;
      if (parentCell) {
        parentCell.innerHTML = this._renderAttachmentControl(fieldCode, stageLabel, true);
        this._bindEvents(activeRoot);
      } else {
        this.render();
      }
    }
    hasPendingOrDirtyAttachments() {
      const hasPending = Boolean(this.pendingAttachments && Object.keys(this.pendingAttachments).some((k) => Array.isArray(this.pendingAttachments[k]) && this.pendingAttachments[k].length > 0));
      const hasDesired = Boolean(this.desiredSavedFiles && Object.keys(this.desiredSavedFiles).length > 0);
      const hasDirty = Boolean(this.dirtyAttachmentFields && this.dirtyAttachmentFields.size > 0);
      return hasPending || hasDesired || hasDirty;
    }
    async preparePendingAttachments(options = {}) {
      const { prepareAttachmentPlan: prepareAttachmentPlan2 } = await Promise.resolve().then(() => (init_mbo_attachment_service(), mbo_attachment_service_exports));
      const targetRecord = options.record || this.record;
      const dirtyFields = Array.from(this.dirtyAttachmentFields || []);
      const desiredSavedFiles = { ...this.desiredSavedFiles || {}, ...options.desiredSavedFiles || {} };
      const plan = await prepareAttachmentPlan2(targetRecord, this.pendingAttachments || {}, { ...options, dirtyFields, desiredSavedFiles });
      this.preparedAttachmentPlan = plan && Object.keys(plan).length > 0 ? plan : null;
      return this.preparedAttachmentPlan;
    }
    async finalizeAttachmentPlan(options = {}) {
      const { finalizeAttachmentPlan: finalizeAttachmentPlan2 } = await Promise.resolve().then(() => (init_mbo_attachment_service(), mbo_attachment_service_exports));
      const appId = options.appId || 794;
      const recordId = options.recordId;
      if (!this.preparedAttachmentPlan || Object.keys(this.preparedAttachmentPlan).length === 0) {
        return { updated: false };
      }
      const plan = this.preparedAttachmentPlan;
      const res = await finalizeAttachmentPlan2(appId, recordId, plan, options);
      this.preparedAttachmentPlan = null;
      this.pendingAttachments = {};
      this.desiredSavedFiles = {};
      if (this.dirtyAttachmentFields) this.dirtyAttachmentFields.clear();
      return res;
    }
    async uploadPendingAttachments(options = {}) {
      const plan = await this.preparePendingAttachments(options);
      if (options.recordId) {
        return await this.finalizeAttachmentPlan(options);
      }
      return plan;
    }
    async executeLookup(empCode) {
      const code = String(empCode || "").trim();
      if (!code) return;
      if (this.authenticatedEmployeeCode && code !== this.authenticatedEmployeeCode) {
        throw new Error("AUTHENTICATED_EMPLOYEE_CODE_MISMATCH: Employee Self context is locked to the authenticated session. Cannot look up a different employee.");
      }
      this.isEmployeeVerified = false;
      if (typeof this.onEmployeeCodeChanged === "function") {
        this.onEmployeeCodeChanged(code);
      }
      try {
        await this.onLookupEmployee(code);
        this.isEmployeeVerified = true;
        this.clearValidationErrors();
        this.render();
      } catch (err) {
        this.isEmployeeVerified = false;
        this.render();
        const newMsgEl = this.root ? this.root.querySelector("#mbo-lookup-msg") : null;
        if (newMsgEl) {
          const formattedMsg = escapeHtml2(err.message || "").replace(/\n/g, "<br/>");
          newMsgEl.innerHTML = `<div style="color: #dc2626; line-height: 1.4; padding: 6px 0;">\u274C ${formattedMsg}</div>`;
        }
        throw err;
      }
    }
    _refreshAllFieldHighlights(root) {
      root.querySelectorAll(".mbo-field").forEach((input) => {
        this._refreshSingleFieldHighlight(input, root);
      });
    }
    _refreshSingleFieldHighlight(input, root) {
      const code = input.dataset.code;
      const isReadonly = input.readOnly || input.disabled;
      const val = input.value?.trim() || "";
      const isRequired = input.dataset.required === "true";
      const isErr = this.currentErrors && this.currentErrors.some((err) => err.field === code);
      input.classList.remove(
        "mbo-field-state-editable",
        "mbo-field-state-required-empty",
        "mbo-field-state-locked",
        "mbo-field-state-error"
      );
      const tagEl = root.querySelector(`.mbo-cell-tag[data-target="${code}"]`);
      if (isErr) {
        input.classList.add("mbo-field-state-error");
        return;
      }
      if (isReadonly) {
        input.classList.add("mbo-field-state-locked");
        if (tagEl) tagEl.innerHTML = '<span style="color: #64748b;">\u26AA [\u0E25\u0E47\u0E2D\u0E01 / Locked]</span>';
      } else {
        if (isRequired && !val) {
          input.classList.add("mbo-field-state-required-empty");
          if (tagEl) tagEl.innerHTML = '<span style="color: #854d0e;">\u{1F7E1} [\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E23\u0E2D\u0E01 / Required]</span>';
        } else {
          input.classList.add("mbo-field-state-editable");
          if (tagEl) tagEl.innerHTML = '<span style="color: #166534;">\u{1F7E2} [\u0E01\u0E23\u0E2D\u0E01\u0E44\u0E14\u0E49 / Editable]</span>';
        }
      }
    }
    _updateTotalWeightDisplay() {
      const count = parseObjectiveCount(this._getVal("Objective_Count"));
      const box = document.getElementById("mbo-weight-summary-box");
      const txt = document.getElementById("mbo-weight-calc-text");
      const st = document.getElementById("mbo-weight-calc-status");
      if (!box || !txt || !st) return;
      if (count === null) {
        box.className = "mbo-weight-summary invalid";
        txt.textContent = "\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 / Total Weight: Invalid Objective_Count (1..10)";
        st.textContent = "\u274C Invalid Count";
        return;
      }
      let total = 0;
      const parts = [];
      for (let i = 1; i <= count; i++) {
        const w = parseFloat(this._getVal(`Weight_${i}`) || "0");
        total += isNaN(w) ? 0 : w;
        parts.push(`${w || 0}%`);
      }
      txt.textContent = `\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 / Total Weight: ${parts.join(" + ")} = ${total}%`;
      if (Math.round(total) === 100) {
        box.className = "mbo-weight-summary valid";
        st.innerHTML = "\u2705 \u0E04\u0E23\u0E1A 100% \u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C / Complete (100%)";
      } else {
        box.className = "mbo-weight-summary invalid";
        st.innerHTML = `\u274C \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E1C\u0E25\u0E23\u0E27\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A 100% (\u0E02\u0E32\u0E14/\u0E40\u0E01\u0E34\u0E19 ${Math.abs(100 - total)}%) / Must equal 100%`;
      }
    }
    _getValObj(code) {
      const field = this.record[code];
      if (field && typeof field === "object" && Array.isArray(field.value)) {
        return field.value;
      }
      return [];
    }
    _getVal(code) {
      const field = this.record[code];
      if (field === null || field === void 0) return "";
      if (typeof field === "object" && "value" in field) {
        return field.value !== null && field.value !== void 0 ? String(field.value) : "";
      }
      return String(field);
    }
    _setVal(code, val) {
      if (this.record[code] && typeof this.record[code] === "object") {
        this.record[code].value = val;
      }
    }
  };

  // src/core/fiscal-year-engine.js
  function isValidEmployeeCode(code) {
    if (typeof code !== "string") {
      return false;
    }
    if (code !== code.trim()) {
      return false;
    }
    const trimmed = code.trim();
    if (trimmed.length === 0) {
      return false;
    }
    return /^[A-Za-z0-9_.-]+$/.test(trimmed);
  }

  // src/services/employee-service.js
  var SNAPSHOT_FIELDS = [
    "Employee_Code",
    "Employee_Name",
    "Employee_Name_TH",
    "Employee_Department",
    "Employee_Section",
    "Team",
    "Employee_Position",
    "Employee_Email",
    "Employee_Start_Date"
  ];
  var verifiedSnapshotFingerprints = /* @__PURE__ */ new WeakMap();
  function getSnapshotFingerprint(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return null;
    return JSON.stringify(SNAPSHOT_FIELDS.map((field) => snapshot[field] ?? null));
  }
  function isVerifiedEmployeeSnapshot(snapshot) {
    const registeredFingerprint = verifiedSnapshotFingerprints.get(snapshot);
    return typeof registeredFingerprint === "string" && registeredFingerprint === getSnapshotFingerprint(snapshot);
  }
  var EmployeeLookupError = class extends Error {
    constructor(code, userMessageTH, userMessageEN, cause = null) {
      super(userMessageTH);
      this.name = "EmployeeLookupError";
      this.code = code;
      this.userMessageTH = userMessageTH;
      this.userMessageEN = userMessageEN;
      this.cause = cause;
    }
  };
  var EmployeeService = class {
    /**
     * Lookup employee by Employee Code in App 53 (Read-Only)
     * Canonical Business Employee Code is sourced strictly from App53.emp_text.
     * @param {string} empCode - Input employee code string
     * @param {Object} kintoneApi - Kintone API client instance
     * @returns {Promise<{ status: string, employee: Object }>}
     */
    static async lookupEmployee(empCode, kintoneApi) {
      if (empCode === null || empCode === void 0) {
        throw new EmployeeLookupError(
          "EMPLOYEE_CODE_INVALID",
          "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\nPlease enter Employee Code",
          "Please enter Employee Code"
        );
      }
      if (typeof empCode !== "string") {
        throw new EmployeeLookupError(
          "EMPLOYEE_CODE_INVALID",
          `\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21 (String) \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19
Employee Code must be a string (received ${typeof empCode})`,
          `Employee Code must be a string (received ${typeof empCode})`
        );
      }
      const cleanCode = empCode.trim();
      if (cleanCode.length === 0 || !isValidEmployeeCode(cleanCode)) {
        throw new EmployeeLookupError(
          "EMPLOYEE_CODE_INVALID",
          `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (${empCode})
Invalid Employee Code format (${empCode})`,
          `Invalid Employee Code format (${empCode})`
        );
      }
      const isDigitOnly = /^\d+$/.test(cleanCode);
      let query;
      if (isDigitOnly) {
        const numericRep = parseInt(cleanCode, 10);
        query = `(emp_text = "${cleanCode}" or Number = ${numericRep}) limit 2`;
      } else {
        query = `emp_text = "${cleanCode}" limit 2`;
      }
      let resp;
      try {
        resp = await kintoneApi.getRecords(53, query);
      } catch (err) {
        throw new EmployeeLookupError(
          "SOURCE_ACCESS_ERROR",
          "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E44\u0E14\u0E49\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator\nUnable to verify employee information at this time. Please try again or contact HR / Administrator.",
          "Unable to verify employee information at this time. Please try again or contact HR / Administrator.",
          err
        );
      }
      if (!resp || typeof resp !== "object" || !Array.isArray(resp.records)) {
        throw new EmployeeLookupError(
          "SOURCE_RESPONSE_INVALID",
          "\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E15\u0E2D\u0E1A\u0E01\u0E25\u0E31\u0E1A\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A Employee Master \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator\nInvalid response structure received from Employee Master. Please contact HR / Administrator.",
          "Invalid response structure received from Employee Master. Please contact HR / Administrator."
        );
      }
      const records = resp.records;
      if (records.length === 0) {
        throw new EmployeeLookupError(
          "EMPLOYEE_NOT_FOUND",
          `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E23\u0E2B\u0E31\u0E2A ${cleanCode} \u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A Employee Master
Employee code ${cleanCode} was not found in Employee Master (App 53)`,
          `Employee code ${cleanCode} was not found in Employee Master (App 53)`
        );
      }
      if (records.length > 1) {
        throw new EmployeeLookupError(
          "EMPLOYEE_SOURCE_AMBIGUOUS",
          `\u0E1E\u0E1A\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 ${cleanCode} \u0E0B\u0E49\u0E33\u0E0B\u0E49\u0E2D\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A Employee Master \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator
Duplicate employee records found for code ${cleanCode}. Please contact HR / Administrator.`,
          `Duplicate employee records found for code ${cleanCode}. Please contact HR / Administrator.`
        );
      }
      const emp = records[0];
      const rawEmpText = emp.emp_text?.value;
      if (!rawEmpText || typeof rawEmpText !== "string" || !isValidEmployeeCode(rawEmpText.trim())) {
        throw new EmployeeLookupError(
          "EMPLOYEE_SOURCE_INCOMPLETE",
          `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E23\u0E2B\u0E31\u0E2A ${cleanCode} \u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A Employee Master \u0E44\u0E21\u0E48\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C (\u0E02\u0E32\u0E14\u0E23\u0E2B\u0E31\u0E2A Canonical emp_text) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR
Employee Master record for code ${cleanCode} is incomplete (missing or invalid emp_text). Please contact HR.`,
          `Employee Master record for code ${cleanCode} is incomplete (missing or invalid emp_text). Please contact HR.`
        );
      }
      const canonicalCode = rawEmpText.trim();
      let isConsistent = false;
      if (canonicalCode === cleanCode) {
        isConsistent = true;
      } else if (isDigitOnly && /^\d+$/.test(canonicalCode)) {
        isConsistent = parseInt(canonicalCode, 10) === parseInt(cleanCode, 10);
      }
      if (!isConsistent) {
        throw new EmployeeLookupError(
          "EMPLOYEE_SOURCE_MISMATCH",
          `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A Employee Master \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E2B\u0E31\u0E2A\u0E17\u0E35\u0E48\u0E23\u0E49\u0E2D\u0E07\u0E02\u0E2D (${cleanCode}) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR
Employee Master canonical identity does not match requested code (${cleanCode}). Please contact HR.`,
          `Employee Master canonical identity does not match requested code (${cleanCode}). Please contact HR.`
        );
      }
      const employee = {
        Employee_Code: canonicalCode,
        Employee_Name: emp.Text?.value || "",
        Employee_Name_TH: emp.Text_0?.value || "",
        Employee_Department: emp.Drop_down_0?.value || "",
        Employee_Section: emp.Drop_down?.value || "",
        Team: emp.Drop_down_2?.value || emp.Team?.value || "",
        Employee_Position: emp.Text_2?.value || "",
        Employee_Email: emp.Text_4?.value || "",
        Employee_Start_Date: emp.Date?.value || ""
      };
      verifiedSnapshotFingerprints.set(employee, getSnapshotFingerprint(employee));
      return { status: "EMPLOYEE_FOUND", employee };
    }
    /**
     * Check for duplicate MBO in App 794 for Fiscal Year + Employee Code
     */
    static async checkDuplicateMBO(mboAppId, fiscalYear, empCode, currentRecordId, kintoneApi) {
      const cleanCode = String(empCode || "").trim();
      const cleanFY = String(fiscalYear || "").trim();
      if (!cleanCode || !cleanFY) return;
      let query = `Fiscal_Year = "${cleanFY}" and Employee_Code = "${cleanCode}"`;
      if (currentRecordId) {
        query += ` and $id != "${currentRecordId}"`;
      }
      let resp;
      try {
        resp = await kintoneApi.getRecords(mboAppId, query);
      } catch (err) {
        throw new Error(`\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator
Unable to verify record uniqueness. Please try again or contact HR / Administrator.`);
      }
      if (!resp || typeof resp !== "object" || !Array.isArray(resp.records)) {
        throw new Error(`\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator
Unable to verify record uniqueness. Please try again or contact HR / Administrator.`);
      }
      if (resp.records.length > 0) {
        throw new Error(`\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E2B\u0E31\u0E2A ${cleanCode} \u0E21\u0E35 MBO \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A ${cleanFY} \u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49
Employee ID ${cleanCode} already has an MBO record for ${cleanFY}. Duplicate creation is blocked.`);
      }
    }
  };

  // src/services/routing-service.js
  var RoutingService = class _RoutingService {
    /**
     * Normalize position string to canonical routing position class
     * @param {string} positionCode
     * @returns {string} Normalized Position Class
     */
    static normalizePosition(positionCode) {
      const clean = String(positionCode || "").trim();
      if (/^(Deputy\s*General\s*Manager|DGM)$/i.test(clean)) {
        return "DEPUTY_GENERAL_MANAGER";
      }
      if (/^(General\s*Manager|GM)$/i.test(clean)) {
        return "GENERAL_MANAGER";
      }
      if (/^(Vice\s*President|VP)$/i.test(clean)) {
        return "VICE_PRESIDENT";
      }
      return clean;
    }
    /**
     * Pure Read-Only Route Resolution from App 795 (Zero Requester Authorization Check)
     * Supports Position Priority (DGM/GM/VP -> President) and Team-aware routing keys (Section_Code|Team)
     * @param {number} routingAppId
     * @param {string} sectionCode
     * @param {string} teamCode
     * @param {Object} kintoneApi
     * @param {string} positionCode
     * @returns {Object} Resolved Routing Profile with Requester_User list
     */
    static async resolveRoutingProfile(routingAppId, sectionCode, teamCode, kintoneApi, positionCode = "") {
      const cleanPosition = String(positionCode || "").trim();
      const normalizedPos = _RoutingService.normalizePosition(cleanPosition);
      const cleanSection = String(sectionCode || "").trim();
      const cleanTeam = String(teamCode || "").trim();
      const isExecutiveDirect = ["DEPUTY_GENERAL_MANAGER", "GENERAL_MANAGER", "VICE_PRESIDENT"].includes(normalizedPos);
      if (isExecutiveDirect) {
        let routingKey = "POSITION_GM";
        if (normalizedPos === "DEPUTY_GENERAL_MANAGER") routingKey = "POSITION_DGM";
        if (normalizedPos === "VICE_PRESIDENT") routingKey = "POSITION_VP";
        const execQuery = `Routing_Key = "${routingKey}" and Active in ("Active") limit 2`;
        const resp2 = await kintoneApi.getRecords(routingAppId, execQuery);
        const execRecords = resp2?.records || [];
        if (execRecords.length === 0) {
          throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 Routing \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07 ${normalizedPos} (${routingKey}) \u0E43\u0E19 Routing Master (App 795) (APPROVER_NOT_FOUND)
Routing configuration for executive position ${normalizedPos} (${routingKey}) was not found in Routing Master.`);
        }
        if (execRecords.length > 1) {
          throw new Error(`\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing \u0E0B\u0E49\u0E33\u0E0B\u0E49\u0E2D\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Routing Key ${routingKey} \u0E43\u0E19 Routing Master (App 795) (AMBIGUOUS_ROUTE)
Duplicate active routing records found for key ${routingKey} in Routing Master.`);
        }
        const route2 = execRecords[0];
        const presidentApprover = route2.Manager_Level1_Approvers?.value || route2.GM_Level1_Approvers?.value || [];
        if (!presidentApprover || presidentApprover.length === 0) {
          throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07 ${normalizedPos} \u0E43\u0E19 Routing Master (App 795) (APPROVER_NOT_FOUND)
No valid approver target configured for executive position ${normalizedPos} in Routing Master.`);
        }
        const requesters2 = route2.Requester_User?.value || [];
        return {
          Routing_Key: route2.Routing_Key?.value || routingKey,
          Requester_User: requesters2,
          Manager_Level1_Approvers: presidentApprover,
          Manager_Level1_Approval_Rule: route2.Manager_Level1_Approval_Rule?.value || "ALL",
          Manager_Level2_Approvers: [],
          Manager_Level2_Approval_Rule: "ALL",
          GM_Level1_Approvers: [],
          GM_Level1_Approval_Rule: "ALL",
          GM_Level2_Approvers: [],
          GM_Level2_Approval_Rule: "ALL",
          Has_Manager_Level2: "No",
          Has_GM_Level2: "No",
          Routing_Topology: "M1_ONLY",
          Manager_User: presidentApprover,
          First_Manager_User: [],
          GM_User: [],
          Matched_Rule: routingKey,
          Position: cleanPosition,
          Section: cleanSection,
          Team: cleanTeam
        };
      }
      if (!cleanSection) {
        throw new Error("\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Section \u0E02\u0E2D\u0E07\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A Employee Master (App 53)\nEmployee section is missing in Employee Master.");
      }
      const isTmgSection = cleanSection === "TMG1" || cleanSection === "TMG2" || /^TMG/i.test(cleanSection);
      if (isTmgSection && !cleanTeam) {
        throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Team \u0E02\u0E2D\u0E07\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E19 Section ${cleanSection} \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A Employee Master (App 53) (TEAM_REQUIRED)
Team is required for employee in section ${cleanSection}.`);
      }
      const primaryRoutingKey = cleanTeam ? `${cleanSection}|${cleanTeam}` : cleanSection;
      const query = `Routing_Key = "${primaryRoutingKey}" and Active in ("Active") limit 2`;
      const resp = await kintoneApi.getRecords(routingAppId, query);
      const records = resp?.records || [];
      if (records.length === 0) {
        const targetLabel = cleanTeam ? `${cleanSection} / Team ${cleanTeam}` : cleanSection;
        throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 Routing \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Section ${targetLabel} \u0E43\u0E19 Routing Master (App 795) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (ROUTE_NOT_FOUND)
Routing configuration for section ${targetLabel} was not found in Routing Master.`);
      }
      if (records.length > 1) {
        throw new Error(`\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Routing \u0E0B\u0E49\u0E33\u0E0B\u0E49\u0E2D\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Routing Key ${primaryRoutingKey} \u0E43\u0E19 Routing Master (App 795) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator (AMBIGUOUS_ROUTE)
Duplicate active routing records found for key ${primaryRoutingKey} in Routing Master.`);
      }
      const route = records[0];
      const requesters = route.Requester_User?.value || [];
      const mgrL1 = route.Manager_Level1_Approvers?.value || [];
      const mgrL1Rule = route.Manager_Level1_Approval_Rule?.value || "ALL";
      const mgrL2 = route.Manager_Level2_Approvers?.value || [];
      const mgrL2Rule = route.Manager_Level2_Approval_Rule?.value || "ALL";
      const gmL1 = route.GM_Level1_Approvers?.value || [];
      const gmL1Rule = route.GM_Level1_Approval_Rule?.value || "ALL";
      const gmL2 = route.GM_Level2_Approvers?.value || [];
      const gmL2Rule = route.GM_Level2_Approval_Rule?.value || "ALL";
      const hasMgrL2 = mgrL2.length > 0;
      const hasGmL2 = gmL2.length > 0;
      let topology = "M1_G1";
      if (hasMgrL2 && hasGmL2) {
        topology = "M1_M2_G1_G2";
      } else if (hasMgrL2) {
        topology = "M1_M2_G1";
      } else if (hasGmL2) {
        topology = "M1_G1_G2";
      }
      return {
        Routing_Key: route.Routing_Key?.value || primaryRoutingKey,
        Requester_User: requesters,
        Manager_Level1_Approvers: mgrL1,
        Manager_Level1_Approval_Rule: mgrL1Rule,
        Manager_Level2_Approvers: mgrL2,
        Manager_Level2_Approval_Rule: mgrL2Rule,
        GM_Level1_Approvers: gmL1,
        GM_Level1_Approval_Rule: gmL1Rule,
        GM_Level2_Approvers: gmL2,
        GM_Level2_Approval_Rule: gmL2Rule,
        Has_Manager_Level2: hasMgrL2 ? "Yes" : "No",
        Has_GM_Level2: hasGmL2 ? "Yes" : "No",
        Routing_Topology: topology,
        Manager_User: mgrL1,
        First_Manager_User: mgrL2,
        GM_User: gmL1,
        Matched_Rule: route.Routing_Key?.value || primaryRoutingKey,
        Position: cleanPosition,
        Section: cleanSection,
        Team: cleanTeam
      };
    }
    /**
     * Asserts Business Requester Authorization against the resolved route's Requester_User list.
     * `admin-form` and `Administrator` have 0 business requester authority unless listed in Requester_User.
     * @param {Object} route Resolved route profile
     * @param {string} loginUserCode Current login user code
     */
    static assertRequesterAuthorized(route, loginUserCode) {
      const cleanUser = String(loginUserCode || "").trim();
      if (!cleanUser) {
        throw new Error("\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\nLogged-in user code is missing.");
      }
      const requesters = route?.Requester_User || [];
      const norm = (code) => String(code || "").trim().toLowerCase();
      const isAuthorized = Array.isArray(requesters) && requesters.some((u) => {
        const uCode = typeof u === "object" ? u.code || u.value : u;
        return norm(uCode) === norm(cleanUser);
      });
      if (!isAuthorized) {
        const cleanSection = route?.Section || "";
        const cleanPosition = route?.Position || "";
        const sectionInfo = cleanSection ? ` \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E19 Section ${cleanSection}` : cleanPosition ? ` \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07 ${cleanPosition}` : "";
        throw new Error(`\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E19\u0E35\u0E49 (${cleanUser}) \u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E2A\u0E23\u0E49\u0E32\u0E07 MBO${sectionInfo}
This account (${cleanUser}) is not authorized to create an MBO for this target.`);
      }
    }
    /**
     * Validate current user access and resolve sequential routing topology from App 795
     * Composes `resolveRoutingProfile` + `assertRequesterAuthorized`.
     * @param {number} routingAppId
     * @param {string} sectionCode
     * @param {string} teamCode
     * @param {string} loginUserCode
     * @param {Object} kintoneApi
     * @param {string} positionCode
     * @returns {Object} Full Sequential Routing Profile
     */
    static async validateRequesterAccess(routingAppId, sectionCode, teamCode, loginUserCode, kintoneApi, positionCode = "") {
      const route = await _RoutingService.resolveRoutingProfile(routingAppId, sectionCode, teamCode, kintoneApi, positionCode);
      _RoutingService.assertRequesterAuthorized(route, loginUserCode);
      return route;
    }
  };

  // src/profiles/runtime-profile-resolver.js
  var RuntimeProfileResolverError = class extends Error {
    constructor(code, message = code) {
      super(message);
      this.name = "RuntimeProfileResolverError";
      this.code = code;
    }
  };
  function resolveProfileCodeForSnapshot(employeeSnapshot) {
    if (!isVerifiedEmployeeSnapshot(employeeSnapshot)) {
      throw new RuntimeProfileResolverError("EMPLOYEE_SNAPSHOT_UNVERIFIED");
    }
    try {
      return getProfileCodeFromPosition(employeeSnapshot.Employee_Position);
    } catch (err) {
      if (err instanceof ProfilePolicyError) {
        throw new RuntimeProfileResolverError(err.code);
      }
      throw err;
    }
  }

  // src/ui/mbo-kintone-login-gate.js
  var BASE_STYLE = "font-family:sans-serif;box-sizing:border-box;";
  function styled(el, css) {
    el.style.cssText = BASE_STYLE + css;
    return el;
  }
  function ce(tag) {
    return typeof document !== "undefined" ? document.createElement(tag) : null;
  }
  var MboKintoneLoginGate = class {
    /**
     * @param {import('./mbo-kintone-auth-adapter.js').MboKintoneAuthAdapter} adapter
     * @param {object} [options]
     * @param {import('./mbo-session-manager.js').MboSessionManager|null} [options.sessionManager=null]
     * @param {function} [options.onReload] - injectable for tests; defaults to location.reload
     */
    constructor(adapter, { sessionManager = null, onReload = null } = {}) {
      this.adapter = adapter;
      this.sessionManager = sessionManager;
      this._principal = null;
      this._pendingForceChange = false;
      this._onReload = onReload || (() => {
        if (typeof location !== "undefined") location.reload();
      });
    }
    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------
    /**
     * Returns the authenticated Employee_Code only when fully authorized
     * (authenticated AND no pending force password change).
     * Returns null otherwise — caller must fail closed.
     */
    getEmployeeCode() {
      if (!this._principal || this._pendingForceChange) return null;
      return this._principal.employeeCode;
    }
    /**
     * Clears page-memory authentication context and revokes session token if sessionManager is present.
     * Caller should follow with reload to re-trigger the login gate.
     */
    async logout() {
      let revokeResult = null;
      if (this.sessionManager) {
        try {
          revokeResult = await this.sessionManager.revokeSession();
        } catch {
        }
      }
      this._principal = null;
      this._pendingForceChange = false;
      return revokeResult;
    }
    /**
     * Ensures the user is authenticated before Employee Self content renders.
     * If already authenticated and no force-change pending → resolves immediately.
     * Otherwise attempts session restore if sessionManager is present.
     * Otherwise → renders a full-page blocking login overlay on `host`.
     *
     * @param {HTMLElement} host - DOM element that hosts the gate overlay
     * @returns {Promise<string>} authenticated Employee_Code
     */
    async requireLogin(host) {
      const code = this.getEmployeeCode();
      if (code) return code;
      if (this.sessionManager) {
        try {
          const restored = await this.sessionManager.restoreSession();
          if (restored?.employeeCode) {
            this._principal = { employeeCode: restored.employeeCode };
            this._pendingForceChange = false;
            return restored.employeeCode;
          }
        } catch {
        }
      }
      return new Promise((resolve) => {
        this._renderLoginOverlay(host, resolve);
      });
    }
    /**
     * Renders auth bar (Logged-in label, Change Password, Logout) on host.
     * Logout triggers page reload for clean re-entry.
     *
     * @param {HTMLElement} host
     * @param {string} employeeCode
     */
    renderAuthBar(host, employeeCode) {
      if (!host) return;
      const existing = host.querySelector("[data-mbo-auth-bar]");
      if (existing) existing.remove();
      const bar = ce("div");
      if (!bar) return;
      bar.setAttribute("data-mbo-auth-bar", "");
      styled(bar, "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;border-radius:8px 8px 0 0;");
      const label = ce("span");
      label.textContent = `\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 / Employee Code: ${employeeCode}`;
      styled(label, "color:#334155;font-weight:600;");
      const actionsContainer = ce("div");
      styled(actionsContainer, "display:flex;align-items:center;gap:8px;");
      const changePwBtn = ce("button");
      changePwBtn.textContent = "\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 / Change Password";
      styled(changePwBtn, "padding:5px 12px;cursor:pointer;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;font-size:12px;font-weight:500;");
      changePwBtn.addEventListener("click", () => {
        this._renderChangePasswordDialog(document.body, employeeCode);
      });
      const logoutBtn = ce("button");
      logoutBtn.textContent = "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A / Logout";
      styled(logoutBtn, "padding:5px 12px;cursor:pointer;border:1px solid #fca5a5;border-radius:6px;background:#fef2f2;color:#991b1b;font-size:12px;font-weight:500;");
      logoutBtn.addEventListener("click", async () => {
        await this.logout();
        this._onReload();
      });
      actionsContainer.appendChild(changePwBtn);
      actionsContainer.appendChild(logoutBtn);
      bar.appendChild(label);
      bar.appendChild(actionsContainer);
      host.insertBefore(bar, host.firstChild);
      return bar;
    }
    // ---------------------------------------------------------------------------
    // Production Action Handlers (exercised directly by tests and DOM listeners)
    // ---------------------------------------------------------------------------
    async _handleLoginAction({ username, password }) {
      let result;
      try {
        result = await this.adapter.login({ username, password });
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message || "Login error" };
      }
      if (result.status === "AUTHENTICATED") {
        if (this.sessionManager) {
          try {
            await this.sessionManager.issueSession(result.employeeCode);
          } catch {
            this._principal = null;
            this._pendingForceChange = false;
            return { status: "SESSION_ISSUE_FAILED", reason: "Failed to create session." };
          }
        }
        this._principal = { employeeCode: result.employeeCode };
        this._pendingForceChange = false;
        return { status: "AUTHENTICATED", employeeCode: result.employeeCode };
      }
      if (result.status === "PASSWORD_CHANGE_REQUIRED") {
        this._principal = { employeeCode: result.employeeCode };
        this._pendingForceChange = true;
        return { status: "PASSWORD_CHANGE_REQUIRED", employeeCode: result.employeeCode };
      }
      return result;
    }
    async _handleForceChangeAction({ newPassword, confirmPassword }) {
      if (!this._principal || !this._pendingForceChange) {
        return { status: "CREDENTIAL_DENIED", reason: "No pending force change state." };
      }
      if (newPassword !== confirmPassword) {
        return { status: "INVALID_PASSWORD", reason: "Passwords do not match." };
      }
      let result;
      try {
        result = await this.adapter.forceChangePassword({
          employeeCode: this._principal.employeeCode,
          newPassword
        });
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message || "Error saving password." };
      }
      if (result.status === "PASSWORD_CHANGED") {
        if (this.sessionManager) {
          try {
            await this.sessionManager.issueSession(this._principal.employeeCode);
          } catch {
            return { status: "SESSION_ISSUE_FAILED", reason: "Failed to create session." };
          }
        }
        this._pendingForceChange = false;
        return { status: "PASSWORD_CHANGED", employeeCode: this._principal.employeeCode };
      }
      return result;
    }
    async _handleChangePasswordAction({ currentPassword, newPassword, confirmPassword }) {
      const code = this.getEmployeeCode();
      if (!code) {
        return { status: "CREDENTIAL_DENIED", reason: "Not authenticated." };
      }
      if (newPassword !== confirmPassword) {
        return { status: "INVALID_PASSWORD", reason: "New passwords do not match." };
      }
      let result;
      try {
        result = await this.adapter.changePassword({ employeeCode: code, currentPassword, newPassword });
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message || "Error changing password." };
      }
      if (result.status === "PASSWORD_CHANGED") {
        let sessionOk = true;
        if (this.sessionManager) {
          try {
            await this.sessionManager.issueSession(code);
          } catch {
            sessionOk = false;
          }
        }
        if (!sessionOk) {
          if (this.sessionManager) this.sessionManager.clearLocalToken();
          this._principal = null;
          this._pendingForceChange = false;
          this._onReload();
          return { status: "SESSION_RENEWAL_FAILED", employeeCode: code };
        }
        return { status: "PASSWORD_CHANGED", employeeCode: code };
      }
      return result;
    }
    // ---------------------------------------------------------------------------
    // Internal: Login overlay
    // ---------------------------------------------------------------------------
    _removeOverlay(host, attr) {
      if (!host || !host.querySelector) return;
      const el = host.querySelector(`[${attr}]`);
      if (el) el.remove();
    }
    _renderLoginOverlay(host, resolve) {
      if (!host) return;
      this._removeOverlay(host, "data-mbo-login-overlay");
      const overlay = ce("div");
      overlay.setAttribute("data-mbo-login-overlay", "");
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "MBO Login");
      styled(overlay, "position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;align-items:center;justify-content:center;");
      const card = ce("div");
      styled(card, "min-width:320px;max-width:400px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.18);border-radius:8px;background:#fff;");
      const title = ce("h2");
      title.textContent = "MBO Login";
      styled(title, "margin:0 0 20px;font-size:20px;color:#222;");
      const form = ce("form");
      form.setAttribute("data-mbo-login-form", "");
      form.setAttribute("autocomplete", "on");
      form.appendChild(this._labeledInput("Employee Code", "username", "text", "username"));
      form.appendChild(this._labeledInput("Password", "password", "password", "current-password"));
      const errorEl = ce("p");
      errorEl.setAttribute("data-mbo-error", "");
      errorEl.setAttribute("role", "alert");
      styled(errorEl, "color:#c00;min-height:20px;margin:0 0 12px;font-size:13px;");
      const submitBtn = ce("button");
      submitBtn.type = "submit";
      submitBtn.textContent = "Login";
      styled(submitBtn, "width:100%;padding:10px;background:#0057b8;color:#fff;border:none;border-radius:4px;font-size:15px;cursor:pointer;");
      form.appendChild(errorEl);
      form.appendChild(submitBtn);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in\u2026";
        const username = form.querySelector('[name="username"]')?.value || "";
        const password = form.querySelector('[name="password"]')?.value || "";
        const actionRes = await this._handleLoginAction({ username, password });
        if (actionRes.status === "AUTHENTICATED") {
          overlay.remove();
          resolve(actionRes.employeeCode);
        } else if (actionRes.status === "PASSWORD_CHANGE_REQUIRED") {
          card.innerHTML = "";
          this._renderForceChangeCard(card, overlay, resolve);
        } else if (actionRes.status === "INVALID_CREDENTIALS") {
          errorEl.textContent = "Invalid Employee Code or password.";
          submitBtn.disabled = false;
          submitBtn.textContent = "Login";
        } else if (actionRes.status === "SESSION_ISSUE_FAILED") {
          errorEl.textContent = "Failed to create session. Please try again.";
          submitBtn.disabled = false;
          submitBtn.textContent = "Login";
        } else {
          errorEl.textContent = "Account is locked or disabled. Please contact HR.";
          submitBtn.disabled = false;
          submitBtn.textContent = "Login";
        }
      });
      card.appendChild(title);
      card.appendChild(form);
      overlay.appendChild(card);
      host.appendChild(overlay);
      const usernameInput = form.querySelector('[name="username"]');
      if (usernameInput) usernameInput.focus();
    }
    // ---------------------------------------------------------------------------
    // Internal: Force Password Change card (replaces login card content)
    // ---------------------------------------------------------------------------
    _renderForceChangeCard(card, overlay, resolve) {
      const title = ce("h2");
      title.textContent = "Password Change Required";
      styled(title, "margin:0 0 8px;font-size:20px;color:#222;");
      const note = ce("p");
      note.textContent = "You must set a new password before continuing.";
      styled(note, "margin:0 0 20px;font-size:13px;color:#666;");
      const form = ce("form");
      form.setAttribute("data-mbo-force-change-form", "");
      form.appendChild(this._labeledInput("New Password", "newPassword", "password", "new-password"));
      form.appendChild(this._labeledInput("Confirm New Password", "confirmPassword", "password", "new-password"));
      const errorEl = ce("p");
      errorEl.setAttribute("data-mbo-error", "");
      errorEl.setAttribute("role", "alert");
      styled(errorEl, "color:#c00;min-height:20px;margin:0 0 12px;font-size:13px;");
      const submitBtn = ce("button");
      submitBtn.type = "submit";
      submitBtn.textContent = "Set New Password";
      styled(submitBtn, "width:100%;padding:10px;background:#0057b8;color:#fff;border:none;border-radius:4px;font-size:15px;cursor:pointer;");
      form.appendChild(errorEl);
      form.appendChild(submitBtn);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        const newPassword = form.querySelector('[name="newPassword"]')?.value || "";
        const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value || "";
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving\u2026";
        const actionRes = await this._handleForceChangeAction({ newPassword, confirmPassword });
        if (actionRes.status === "PASSWORD_CHANGED") {
          overlay.remove();
          resolve(actionRes.employeeCode);
        } else {
          errorEl.textContent = actionRes.reason || "Could not change password.";
          submitBtn.disabled = false;
          submitBtn.textContent = "Set New Password";
        }
      });
      card.appendChild(title);
      card.appendChild(note);
      card.appendChild(form);
      const firstInput = form.querySelector('[name="newPassword"]');
      if (firstInput) firstInput.focus();
    }
    // ---------------------------------------------------------------------------
    // Internal: Change Password dialog (authenticated own-password change)
    // ---------------------------------------------------------------------------
    _renderChangePasswordDialog(host, employeeCode) {
      if (!host) return;
      this._removeOverlay(host, "data-mbo-change-pw-overlay");
      const overlay = ce("div");
      overlay.setAttribute("data-mbo-change-pw-overlay", "");
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Change Password");
      styled(overlay, "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;");
      const card = ce("div");
      styled(card, "min-width:320px;max-width:400px;padding:32px;background:#fff;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.2);");
      const title = ce("h3");
      title.textContent = "Change Password";
      styled(title, "margin:0 0 20px;font-size:18px;color:#222;");
      const form = ce("form");
      form.setAttribute("data-mbo-change-pw-form", "");
      form.appendChild(this._labeledInput("Current Password", "currentPassword", "password", "current-password"));
      form.appendChild(this._labeledInput("New Password", "newPassword", "password", "new-password"));
      form.appendChild(this._labeledInput("Confirm New Password", "confirmPassword", "password", "new-password"));
      const errorEl = ce("p");
      errorEl.setAttribute("data-mbo-error", "");
      errorEl.setAttribute("role", "alert");
      styled(errorEl, "color:#c00;min-height:20px;margin:0 0 12px;font-size:13px;");
      const btnRow = ce("div");
      styled(btnRow, "display:flex;gap:8px;");
      const submitBtn = ce("button");
      submitBtn.type = "submit";
      submitBtn.textContent = "Change Password";
      styled(submitBtn, "flex:1;padding:10px;background:#0057b8;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;");
      const cancelBtn = ce("button");
      cancelBtn.type = "button";
      cancelBtn.textContent = "Cancel";
      styled(cancelBtn, "flex:1;padding:10px;background:#fff;color:#333;border:1px solid #ccc;border-radius:4px;font-size:14px;cursor:pointer;");
      cancelBtn.addEventListener("click", () => overlay.remove());
      btnRow.appendChild(submitBtn);
      btnRow.appendChild(cancelBtn);
      form.appendChild(errorEl);
      form.appendChild(btnRow);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        const currentPassword = form.querySelector('[name="currentPassword"]')?.value || "";
        const newPassword = form.querySelector('[name="newPassword"]')?.value || "";
        const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value || "";
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving\u2026";
        const actionRes = await this._handleChangePasswordAction({ currentPassword, newPassword, confirmPassword });
        if (actionRes.status === "PASSWORD_CHANGED") {
          overlay.remove();
          const confirmEl = ce("div");
          if (confirmEl) {
            styled(confirmEl, "position:fixed;top:20px;right:20px;z-index:2147483647;background:#2a7;color:#fff;padding:12px 20px;border-radius:6px;font-size:14px;");
            confirmEl.textContent = "Password changed successfully.";
            document.body.appendChild(confirmEl);
            setTimeout(() => confirmEl.remove(), 3e3);
          }
        } else if (actionRes.status === "SESSION_RENEWAL_FAILED") {
          overlay.remove();
        } else {
          errorEl.textContent = actionRes.reason || "Could not change password.";
          submitBtn.disabled = false;
          submitBtn.textContent = "Change Password";
        }
      });
      card.appendChild(title);
      card.appendChild(form);
      overlay.appendChild(card);
      host.appendChild(overlay);
      const firstInput = form.querySelector('[name="currentPassword"]');
      if (firstInput) firstInput.focus();
    }
    // ---------------------------------------------------------------------------
    // Internal: helper — labeled input group
    // ---------------------------------------------------------------------------
    _labeledInput(labelText, name, type, autocomplete) {
      const group = ce("div");
      styled(group, "margin-bottom:16px;");
      const label = ce("label");
      label.textContent = labelText;
      styled(label, "display:block;margin-bottom:4px;font-size:14px;color:#555;");
      const input = ce("input");
      input.name = name;
      input.type = type;
      input.required = true;
      input.setAttribute("autocomplete", autocomplete || "off");
      styled(input, "width:100%;padding:8px 12px;border:1px solid #ccc;border-radius:4px;font-size:14px;");
      group.appendChild(label);
      group.appendChild(input);
      return group;
    }
  };

  // src/ui/mbo-kintone-auth-adapter.js
  var PBKDF2_ITERATIONS = 1e5;
  var PBKDF2_HASH = "SHA-256";
  var PBKDF2_KEY_LEN_BITS = 256;
  var LOCK_DURATION_MS = 15 * 60 * 1e3;
  var MAX_FAILED_ATTEMPTS = 5;
  var enc = new TextEncoder();
  function hexEncode(buffer) {
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function hexDecode(hexStr) {
    if (hexStr.length % 2 !== 0) return new Uint8Array(0);
    const bytes = new Uint8Array(hexStr.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
  var MboKintoneAuthAdapter = class {
    /**
     * @param {object} options
     * @param {{ getRecords(appId, query): Promise, updateRecord(appId, id, record): Promise }} options.api
     * @param {number} [options.appId=801] - App801 ID
     * @param {Crypto} [options.cryptoImpl=globalThis.crypto] - injectable for tests
     * @param {() => Date} [options.now=() => new Date()] - injectable for tests
     */
    constructor({ api, appId = 801, cryptoImpl = globalThis.crypto, now = () => /* @__PURE__ */ new Date() } = {}) {
      this.api = api;
      this.appId = appId;
      this.crypto = cryptoImpl;
      this.now = now;
    }
    // ---------------------------------------------------------------------------
    // Internal: Employee_Code canonical validation
    // ---------------------------------------------------------------------------
    _normalizeEmployeeCode(code) {
      if (typeof code !== "string") throw new Error("INVALID_EMPLOYEE_CODE");
      if (code !== code.trim()) throw new Error("INVALID_EMPLOYEE_CODE");
      const trimmed = code.trim();
      if (!trimmed || !/^[A-Za-z0-9_.-]+$/.test(trimmed)) throw new Error("INVALID_EMPLOYEE_CODE");
      return trimmed;
    }
    // ---------------------------------------------------------------------------
    // Internal: PBKDF2 crypto
    // ---------------------------------------------------------------------------
    async _deriveHash(password, saltBytes) {
      const keyMaterial = await this.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );
      const bits = await this.crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: PBKDF2_HASH, salt: saltBytes, iterations: PBKDF2_ITERATIONS },
        keyMaterial,
        PBKDF2_KEY_LEN_BITS
      );
      return hexEncode(bits);
    }
    /**
     * Verifies a plaintext password against a stored pbkdf2$... hash string.
     * Returns false for any malformed or mismatched hash — never throws.
     */
    async verifyPassword(password, storedHash) {
      try {
        if (typeof storedHash !== "string") return false;
        const parts = storedHash.split("$");
        if (parts.length !== 4) return false;
        if (parts[0] !== "pbkdf2") return false;
        if (parts[1] !== String(PBKDF2_ITERATIONS)) return false;
        if (!/^[0-9a-f]+$/i.test(parts[2]) || parts[2].length === 0) return false;
        if (!/^[0-9a-f]{64}$/i.test(parts[3])) return false;
        const saltBytes = hexDecode(parts[2]);
        const computed = await this._deriveHash(password, saltBytes);
        return computed === parts[3].toLowerCase();
      } catch {
        return false;
      }
    }
    /**
     * Creates a new pbkdf2$100000$<saltHex>$<hashHex> hash string using a
     * cryptographically random 16-byte salt.
     */
    async createPasswordHash(password) {
      if (typeof password !== "string" || password.length === 0) {
        throw new Error("INVALID_PASSWORD");
      }
      const saltBytes = new Uint8Array(16);
      this.crypto.getRandomValues(saltBytes);
      const hashHex = await this._deriveHash(password, saltBytes);
      return `pbkdf2$${PBKDF2_ITERATIONS}$${hexEncode(saltBytes)}$${hashHex}`;
    }
    // ---------------------------------------------------------------------------
    // Internal: App801 credential fetch
    // ---------------------------------------------------------------------------
    async _getCredential(employeeCode) {
      const code = this._normalizeEmployeeCode(employeeCode);
      const result = await this.api.getRecords(this.appId, `Employee_Code = "${code}" limit 2`);
      const records = result?.records || [];
      if (records.length === 0) throw new Error("CREDENTIAL_NOT_FOUND");
      if (records.length > 1) throw new Error("DUPLICATE_CREDENTIAL");
      const r = records[0];
      const get = (key) => r[key]?.value ?? null;
      const storedCode = get("Employee_Code");
      const hash = get("Password_Hash");
      const status = get("Account_Status");
      const force = get("Force_Password_Change");
      const failedRaw = get("Failed_Attempts");
      const lockedUntilRaw = get("Locked_Until");
      const credVerRaw = get("Credential_Version");
      const sessHash = get("Session_Token_Hash");
      const sessIssued = get("Session_Issued_At");
      const sessExpires = get("Session_Expires_At");
      const sessCredVerRaw = get("Session_Credential_Version");
      const sessKintoneUser = get("Session_Kintone_User");
      if (storedCode !== code) throw new Error("MALFORMED_CREDENTIAL");
      if (typeof hash !== "string" || !hash) throw new Error("MALFORMED_CREDENTIAL");
      if (!["ACTIVE", "LOCKED", "DISABLED"].includes(status)) throw new Error("MALFORMED_CREDENTIAL");
      if (!["YES", "NO"].includes(force)) throw new Error("MALFORMED_CREDENTIAL");
      let failedAttempts = 0;
      if (failedRaw !== null && failedRaw !== void 0 && failedRaw !== "") {
        const parsedFailed = Number(failedRaw);
        if (isNaN(parsedFailed) || parsedFailed < 0) throw new Error("MALFORMED_CREDENTIAL");
        failedAttempts = parsedFailed;
      }
      if (lockedUntilRaw !== null && lockedUntilRaw !== void 0 && lockedUntilRaw !== "") {
        if (isNaN(Date.parse(lockedUntilRaw))) throw new Error("MALFORMED_CREDENTIAL");
      }
      if (credVerRaw === null || credVerRaw === void 0 || credVerRaw === "") {
        throw new Error("MALFORMED_CREDENTIAL");
      }
      const credentialVersion = Number(credVerRaw);
      if (isNaN(credentialVersion) || !Number.isInteger(credentialVersion) || credentialVersion <= 0) {
        throw new Error("MALFORMED_CREDENTIAL");
      }
      let sessionCredentialVersion = null;
      if (sessCredVerRaw !== null && sessCredVerRaw !== void 0 && sessCredVerRaw !== "") {
        const parsedSessVer = Number(sessCredVerRaw);
        if (isNaN(parsedSessVer) || !Number.isInteger(parsedSessVer) || parsedSessVer <= 0) {
          throw new Error("MALFORMED_CREDENTIAL");
        }
        sessionCredentialVersion = parsedSessVer;
      }
      return {
        id: r.$id?.value,
        code,
        hash,
        status,
        forceChange: force === "YES",
        lockedUntil: lockedUntilRaw || null,
        failedAttempts,
        credentialVersion,
        sessionTokenHash: sessHash || null,
        sessionIssuedAt: sessIssued || null,
        sessionExpiresAt: sessExpires || null,
        sessionCredentialVersion,
        sessionKintoneUser: sessKintoneUser || null
      };
    }
    // ---------------------------------------------------------------------------
    // Public: login
    // ---------------------------------------------------------------------------
    /**
     * Authenticates an employee against App801.
     * Returns one of:
     *   { status: 'AUTHENTICATED', employeeCode }
     *   { status: 'PASSWORD_CHANGE_REQUIRED', employeeCode }
     *   { status: 'INVALID_CREDENTIALS' }
     *   { status: 'CREDENTIAL_DENIED', reason }
     *
     * Never returns Password_Hash.
     */
    async login({ username, password }) {
      let cred;
      try {
        cred = await this._getCredential(username);
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      if (cred.status === "DISABLED") {
        return { status: "CREDENTIAL_DENIED", reason: "Account is disabled." };
      }
      if (cred.status === "LOCKED") {
        return { status: "CREDENTIAL_DENIED", reason: "Account is locked." };
      }
      if (cred.lockedUntil && new Date(cred.lockedUntil) > this.now()) {
        return { status: "CREDENTIAL_DENIED", reason: "Account is temporarily locked. Please try again later." };
      }
      const valid = await this.verifyPassword(password, cred.hash);
      if (!valid) {
        const newFailed = cred.failedAttempts + 1;
        const lockedUntil = newFailed >= MAX_FAILED_ATTEMPTS ? new Date(this.now().getTime() + LOCK_DURATION_MS).toISOString() : null;
        await this.api.updateRecord(this.appId, cred.id, {
          Failed_Attempts: { value: newFailed },
          Locked_Until: { value: lockedUntil }
        });
        return { status: "INVALID_CREDENTIALS" };
      }
      await this.api.updateRecord(this.appId, cred.id, {
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Last_Login_At: { value: this.now().toISOString() }
      });
      return {
        status: cred.forceChange ? "PASSWORD_CHANGE_REQUIRED" : "AUTHENTICATED",
        employeeCode: cred.code
      };
    }
    // ---------------------------------------------------------------------------
    // Public: Session operations
    // ---------------------------------------------------------------------------
    /**
     * Stores server-side session metadata in App801 for employeeCode.
     * Corrective A: requires exact non-empty kintoneUserCode (no trim/lowercase mutation).
     */
    async storeSession({ employeeCode, tokenHash, issuedAt, expiresAt, kintoneUserCode }) {
      if (typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
        throw new Error("INVALID_TOKEN_HASH");
      }
      if (!kintoneUserCode || typeof kintoneUserCode !== "string" || kintoneUserCode !== kintoneUserCode.trim() || !kintoneUserCode.trim()) {
        throw new Error("MISSING_KINTONE_PRINCIPAL");
      }
      const cred = await this._getCredential(employeeCode);
      if (cred.status !== "ACTIVE") {
        throw new Error("CREDENTIAL_NOT_ACTIVE");
      }
      if (cred.forceChange) {
        throw new Error("FORCE_PASSWORD_CHANGE_REQUIRED");
      }
      await this.api.updateRecord(this.appId, cred.id, {
        Session_Token_Hash: { value: tokenHash.toLowerCase() },
        Session_Issued_At: { value: issuedAt },
        Session_Expires_At: { value: expiresAt },
        Session_Credential_Version: { value: cred.credentialVersion },
        Session_Kintone_User: { value: kintoneUserCode }
      });
      return { status: "SESSION_STORED", employeeCode: cred.code };
    }
    /**
     * Validates a session token hash against App801.
     * Returns { status: 'VALID_SESSION', employeeCode } or { status: 'INVALID_SESSION', reason }.
     * Never throws for invalid/missing/expired session.
     */
    async validateSession({ tokenHash, currentKintoneUserCode }) {
      try {
        if (typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
          return { status: "INVALID_SESSION", reason: "Invalid token hash format." };
        }
        if (!currentKintoneUserCode || typeof currentKintoneUserCode !== "string" || currentKintoneUserCode !== currentKintoneUserCode.trim() || !currentKintoneUserCode.trim()) {
          return { status: "INVALID_SESSION", reason: "Missing current Kintone user." };
        }
        const hashLower = tokenHash.toLowerCase();
        const result = await this.api.getRecords(this.appId, `Session_Token_Hash = "${hashLower}" limit 2`);
        const records = result?.records || [];
        if (records.length === 0) {
          return { status: "INVALID_SESSION", reason: "Session token not found." };
        }
        if (records.length > 1) {
          return { status: "INVALID_SESSION", reason: "Duplicate session token hash." };
        }
        const r = records[0];
        const get = (key) => r[key]?.value ?? null;
        const code = get("Employee_Code");
        const status = get("Account_Status");
        const force = get("Force_Password_Change");
        const expiresAtRaw = get("Session_Expires_At");
        const credVerRaw = get("Credential_Version");
        const sessCredVerRaw = get("Session_Credential_Version");
        const sessKintoneUser = get("Session_Kintone_User");
        const normalizedCode = this._normalizeEmployeeCode(code);
        if (status !== "ACTIVE") {
          return { status: "INVALID_SESSION", reason: "Account is not active." };
        }
        if (force !== "NO") {
          return { status: "INVALID_SESSION", reason: "Password change is required." };
        }
        if (!expiresAtRaw || isNaN(Date.parse(expiresAtRaw))) {
          return { status: "INVALID_SESSION", reason: "Invalid or missing expiry date." };
        }
        if (new Date(expiresAtRaw) <= this.now()) {
          return { status: "INVALID_SESSION", reason: "Session has expired." };
        }
        if (credVerRaw === null || credVerRaw === void 0 || credVerRaw === "") {
          return { status: "INVALID_SESSION", reason: "Missing credential version." };
        }
        const credVer = Number(credVerRaw);
        if (isNaN(credVer) || !Number.isInteger(credVer) || credVer <= 0) {
          return { status: "INVALID_SESSION", reason: "Malformed credential version." };
        }
        if (sessCredVerRaw === null || sessCredVerRaw === void 0 || sessCredVerRaw === "") {
          return { status: "INVALID_SESSION", reason: "Missing session credential version." };
        }
        const sessCredVer = Number(sessCredVerRaw);
        if (isNaN(sessCredVer) || !Number.isInteger(sessCredVer) || sessCredVer <= 0 || sessCredVer !== credVer) {
          return { status: "INVALID_SESSION", reason: "Credential version mismatch." };
        }
        if (!sessKintoneUser || typeof sessKintoneUser !== "string" || sessKintoneUser !== sessKintoneUser.trim() || !sessKintoneUser.trim()) {
          return { status: "INVALID_SESSION", reason: "Missing session Kintone user." };
        }
        if (sessKintoneUser !== currentKintoneUserCode) {
          return { status: "INVALID_SESSION", reason: "Kintone user mismatch." };
        }
        return {
          status: "VALID_SESSION",
          employeeCode: normalizedCode
        };
      } catch (err) {
        return { status: "INVALID_SESSION", reason: err.message };
      }
    }
    /**
     * Revokes session fields in App801 for tokenHash.
     * Corrective B: Revoke failure throws stable error string (SESSION_NOT_FOUND, DUPLICATE_SESSION_TOKEN_HASH, SERVER_REVOKE_FAILED).
     */
    async revokeSession({ tokenHash }) {
      if (typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
        throw new Error("INVALID_TOKEN_HASH");
      }
      const hashLower = tokenHash.toLowerCase();
      const result = await this.api.getRecords(this.appId, `Session_Token_Hash = "${hashLower}" limit 2`);
      const records = result?.records || [];
      if (records.length === 0) {
        throw new Error("SESSION_NOT_FOUND");
      }
      if (records.length > 1) {
        throw new Error("DUPLICATE_SESSION_TOKEN_HASH");
      }
      const recId = records[0].$id?.value;
      try {
        await this.api.updateRecord(this.appId, recId, {
          Session_Token_Hash: { value: null },
          Session_Issued_At: { value: null },
          Session_Expires_At: { value: null },
          Session_Credential_Version: { value: null },
          Session_Kintone_User: { value: null }
        });
      } catch {
        throw new Error("SERVER_REVOKE_FAILED");
      }
      return { status: "SESSION_REVOKED" };
    }
    // ---------------------------------------------------------------------------
    // Public: changePassword (normal authenticated change — requires current password)
    // ---------------------------------------------------------------------------
    /**
     * Changes password for an authenticated employee.
     * Requires currentPassword verification before update.
     * Increments Credential_Version and clears prior session fields.
     */
    async changePassword({ employeeCode, currentPassword, newPassword }) {
      let cred;
      try {
        cred = await this._getCredential(employeeCode);
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      const valid = await this.verifyPassword(currentPassword, cred.hash);
      if (!valid) {
        return { status: "INVALID_CREDENTIALS", reason: "Current password is incorrect." };
      }
      if (newPassword === cred.code) {
        return { status: "INVALID_PASSWORD", reason: "New password cannot be the same as your Employee Code." };
      }
      const newHash = await this.createPasswordHash(newPassword);
      const newCredVersion = cred.credentialVersion + 1;
      await this.api.updateRecord(this.appId, cred.id, {
        Password_Hash: { value: newHash },
        Password_Changed_At: { value: this.now().toISOString() },
        Force_Password_Change: { value: "NO" },
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Credential_Version: { value: newCredVersion },
        Session_Token_Hash: { value: null },
        Session_Issued_At: { value: null },
        Session_Expires_At: { value: null },
        Session_Credential_Version: { value: null },
        Session_Kintone_User: { value: null }
      });
      return { status: "PASSWORD_CHANGED", employeeCode: cred.code, newCredentialVersion: newCredVersion };
    }
    // ---------------------------------------------------------------------------
    // Public: forceChangePassword (initial/forced change — no current password required)
    // ---------------------------------------------------------------------------
    /**
     * Applies a forced password change without requiring current password verification.
     * Increments Credential_Version and clears prior session fields.
     */
    async forceChangePassword({ employeeCode, newPassword }) {
      let cred;
      try {
        cred = await this._getCredential(employeeCode);
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      if (cred.forceChange !== true) {
        return { status: "CREDENTIAL_DENIED", reason: "Force password change is not required for this account." };
      }
      if (newPassword === cred.code) {
        return { status: "INVALID_PASSWORD", reason: "New password cannot be the same as your Employee Code." };
      }
      const newHash = await this.createPasswordHash(newPassword);
      const newCredVersion = cred.credentialVersion + 1;
      await this.api.updateRecord(this.appId, cred.id, {
        Password_Hash: { value: newHash },
        Password_Changed_At: { value: this.now().toISOString() },
        Force_Password_Change: { value: "NO" },
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Credential_Version: { value: newCredVersion },
        Session_Token_Hash: { value: null },
        Session_Issued_At: { value: null },
        Session_Expires_At: { value: null },
        Session_Credential_Version: { value: null },
        Session_Kintone_User: { value: null }
      });
      return { status: "PASSWORD_CHANGED", employeeCode: cred.code, newCredentialVersion: newCredVersion };
    }
  };

  // src/ui/mbo-session-manager.js
  var SESSION_STORAGE_KEY = "ttmet.mbo794.session.v1";
  var ABSOLUTE_TTL_MS = 8 * 60 * 60 * 1e3;
  function hexEncode2(buffer) {
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  var MboSessionManager = class {
    /**
     * @param {object} options
     * @param {import('./mbo-kintone-auth-adapter.js').MboKintoneAuthAdapter} options.adapter
     * @param {() => { code: string }|null} [options.getKintoneUser]
     * @param {Storage} [options.sessionStorageImpl=globalThis.sessionStorage]
     * @param {Crypto} [options.cryptoImpl=globalThis.crypto]
     * @param {() => Date} [options.now=() => new Date()]
     */
    constructor({
      adapter,
      getKintoneUser = () => typeof kintone !== "undefined" && kintone.getLoginUser ? kintone.getLoginUser() : null,
      sessionStorageImpl = globalThis.sessionStorage,
      cryptoImpl = globalThis.crypto,
      now = () => /* @__PURE__ */ new Date()
    } = {}) {
      if (!adapter) throw new Error("MISSING_AUTH_ADAPTER");
      this.adapter = adapter;
      this.getKintoneUser = getKintoneUser;
      this.sessionStorage = sessionStorageImpl;
      this.crypto = cryptoImpl;
      this.now = now;
    }
    /**
     * Generates a cryptographically random 256-bit (32-byte) hex token string.
     * @returns {string} 64-character hex string
     */
    generateToken() {
      const bytes = new Uint8Array(32);
      this.crypto.getRandomValues(bytes);
      return hexEncode2(bytes);
    }
    /**
     * Computes SHA-256 hash of the token string.
     * @param {string} token
     * @returns {Promise<string>} 64-character hex hash string
     */
    async hashToken(token) {
      if (typeof token !== "string" || !/^[0-9a-f]{64}$/i.test(token)) {
        throw new Error("INVALID_TOKEN_FORMAT");
      }
      const enc2 = new TextEncoder();
      const data = enc2.encode(token.toLowerCase());
      const buffer = await this.crypto.subtle.digest("SHA-256", data);
      return hexEncode2(buffer);
    }
    /**
     * Reads raw token from browser sessionStorage.
     * Validates hex format — returns null if missing or malformed.
     * @returns {string|null}
     */
    getLocalToken() {
      try {
        if (!this.sessionStorage) return null;
        const val = this.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (typeof val !== "string" || !/^[0-9a-f]{64}$/i.test(val)) return null;
        return val.toLowerCase();
      } catch {
        return null;
      }
    }
    /**
     * Writes raw token to browser sessionStorage.
     * @param {string} token
     */
    setLocalToken(token) {
      if (typeof token !== "string" || !/^[0-9a-f]{64}$/i.test(token)) {
        throw new Error("INVALID_TOKEN_FORMAT");
      }
      if (this.sessionStorage) {
        this.sessionStorage.setItem(SESSION_STORAGE_KEY, token.toLowerCase());
      }
    }
    /**
     * Removes session token from browser sessionStorage.
     */
    clearLocalToken() {
      try {
        if (this.sessionStorage) {
          this.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
      }
    }
    /**
     * Issues a new session for an authenticated Employee_Code:
     * 1. Validates current Kintone user code (must be exact non-empty string, no whitespace mutation)
     * 2. Generates 256-bit token
     * 3. Computes SHA-256 token hash
     * 4. Calculates 8-hour expiry
     * 5. Stores session metadata in App801 via adapter
     * 6. Writes raw token to sessionStorage
     *
     * Public outcome returns ONLY non-secret metadata (no raw token or hash).
     *
     * @param {string} employeeCode
     * @returns {Promise<{ status: 'SESSION_ISSUED', expiresAt: string }>}
     */
    async issueSession(employeeCode) {
      const kintoneUser = this.getKintoneUser();
      const kintoneUserCode = kintoneUser?.code;
      if (!kintoneUserCode || typeof kintoneUserCode !== "string" || kintoneUserCode !== kintoneUserCode.trim() || !kintoneUserCode.trim()) {
        throw new Error("MISSING_KINTONE_PRINCIPAL");
      }
      const token = this.generateToken();
      const tokenHash = await this.hashToken(token);
      const currentTime = this.now();
      const issuedAt = currentTime.toISOString();
      const expiresAt = new Date(currentTime.getTime() + ABSOLUTE_TTL_MS).toISOString();
      await this.adapter.storeSession({
        employeeCode,
        tokenHash,
        issuedAt,
        expiresAt,
        kintoneUserCode
      });
      this.setLocalToken(token);
      return { status: "SESSION_ISSUED", expiresAt };
    }
    /**
     * Restores and validates session from local sessionStorage token against App801.
     * Clears local token and returns null if missing, invalid, or expired.
     *
     * Public outcome returns ONLY authenticated Employee_Code (no raw token).
     *
     * @returns {Promise<{ employeeCode: string }|null>}
     */
    async restoreSession() {
      const token = this.getLocalToken();
      if (!token) return null;
      let tokenHash;
      try {
        tokenHash = await this.hashToken(token);
      } catch {
        this.clearLocalToken();
        return null;
      }
      const kintoneUser = this.getKintoneUser();
      const currentKintoneUserCode = kintoneUser?.code;
      if (!currentKintoneUserCode || typeof currentKintoneUserCode !== "string" || currentKintoneUserCode !== currentKintoneUserCode.trim() || !currentKintoneUserCode.trim()) {
        this.clearLocalToken();
        return null;
      }
      let res;
      try {
        res = await this.adapter.validateSession({
          tokenHash,
          currentKintoneUserCode
        });
      } catch {
        this.clearLocalToken();
        return null;
      }
      if (res?.status === "VALID_SESSION" && res.employeeCode) {
        return {
          employeeCode: res.employeeCode
        };
      }
      this.clearLocalToken();
      return null;
    }
    /**
     * Revokes the current local session.
     * Clears local token unconditionally, but reports sanitized server revocation failure status.
     *
     * @returns {Promise<{ status: 'SESSION_REVOKED'|'REVOKE_FAILED', serverRevoked?: boolean, reason?: string }>}
     */
    async revokeSession() {
      const token = this.getLocalToken();
      let serverRevoked = false;
      let serverReason = null;
      if (token) {
        try {
          const tokenHash = await this.hashToken(token);
          const res = await this.adapter.revokeSession({ tokenHash });
          if (res?.status === "SESSION_REVOKED") {
            serverRevoked = true;
          }
        } catch (err) {
          const msg = err.message || "";
          if (["INVALID_TOKEN_HASH", "SESSION_NOT_FOUND", "DUPLICATE_SESSION_TOKEN_HASH"].includes(msg)) {
            serverReason = msg;
          } else {
            serverReason = "SERVER_REVOKE_FAILED";
          }
        }
      }
      this.clearLocalToken();
      if (serverReason) {
        return { status: "REVOKE_FAILED", reason: serverReason };
      }
      return { status: "SESSION_REVOKED", serverRevoked };
    }
  };

  // src/ui/employee-self-index-ui.js
  function formatDisplayStatus(rawStatus) {
    if (!rawStatus) return "-";
    const str = String(rawStatus).trim();
    if (str === "16 Completed" || str === "Completed") {
      return "Completed";
    }
    return str;
  }
  var EmployeeSelfIndexUI = class {
    constructor(options = {}) {
      this.kintoneApiWrapper = options.kintoneApiWrapper;
      this.getMboAppId = options.getMboAppId;
      this.mboLoginGate = options.mboLoginGate;
      this.renderBlockedNotice = options.renderBlockedNotice;
    }
    async render(event, host, authenticatedEmployeeCode) {
      const duplicateIndexControls = [
        ".recordlist-gaia",
        ".gaia-argus-app-index-readonly",
        ".gaia-argus-app-index-toolbar"
      ];
      duplicateIndexControls.forEach((selector) => {
        const el = document.querySelector(selector);
        if (el) {
          el.style.display = "none";
        }
      });
      const headerSpace = typeof kintone !== "undefined" && kintone.app && typeof kintone.app.getHeaderSpaceElement === "function" ? kintone.app.getHeaderSpaceElement() : null;
      const containerHost = headerSpace || host || document.body;
      let indexContainer = containerHost.querySelector("[data-mbo-custom-index]");
      if (indexContainer) {
        indexContainer.innerHTML = "";
      } else {
        indexContainer = document.createElement("div");
        indexContainer.setAttribute("data-mbo-custom-index", "");
        indexContainer.style.cssText = "font-family:sans-serif;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);margin-bottom:20px;overflow:hidden;";
        containerHost.appendChild(indexContainer);
      }
      if (this.mboLoginGate && typeof this.mboLoginGate.renderAuthBar === "function") {
        this.mboLoginGate.renderAuthBar(indexContainer, authenticatedEmployeeCode);
      }
      const contentBox = document.createElement("div");
      contentBox.style.cssText = "padding:20px;";
      indexContainer.appendChild(contentBox);
      const appId = typeof this.getMboAppId === "function" ? this.getMboAppId() : 794;
      const query = `Employee_Code = "${authenticatedEmployeeCode}" order by Fiscal_Year desc`;
      let records = [];
      try {
        if (this.kintoneApiWrapper && typeof this.kintoneApiWrapper.getRecords === "function") {
          const res = await this.kintoneApiWrapper.getRecords(appId, query);
          records = res?.records || [];
        }
      } catch (err) {
        if (typeof this.renderBlockedNotice === "function") {
          this.renderBlockedNotice(contentBox, "\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E43\u0E19\u0E01\u0E32\u0E23\u0E42\u0E2B\u0E25\u0E14\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 / Error Loading MBO Records", `\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E42\u0E2B\u0E25\u0E14\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 MBO \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A ${authenticatedEmployeeCode}: ${err.message}`);
        }
        return event;
      }
      const headerRow = document.createElement("div");
      headerRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f1f5f9;";
      const title = document.createElement("h2");
      title.setAttribute("data-mbo-title", "");
      title.style.cssText = "margin:0;font-size:18px;font-weight:600;color:#1e293b;";
      title.textContent = "MBO \u0E02\u0E2D\u0E07\u0E09\u0E31\u0E19 / My MBO";
      const createBtn = document.createElement("a");
      createBtn.setAttribute("data-mbo-create-btn", "");
      createBtn.textContent = "+ \u0E2A\u0E23\u0E49\u0E32\u0E07 MBO \u0E43\u0E2B\u0E21\u0E48 / Create New MBO";
      createBtn.href = `/k/${appId}/edit`;
      createBtn.style.cssText = "display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,0.05);";
      headerRow.appendChild(title);
      headerRow.appendChild(createBtn);
      contentBox.appendChild(headerRow);
      if (records.length === 0) {
        const emptyCard = document.createElement("div");
        emptyCard.setAttribute("data-mbo-empty-state", "");
        emptyCard.style.cssText = "padding:32px 16px;text-align:center;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:6px;margin-top:8px;";
        const emptyMsg = document.createElement("p");
        emptyMsg.style.cssText = "color:#64748b;font-size:14px;margin:0;line-height:1.5;white-space:pre-wrap;";
        emptyMsg.textContent = "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 MBO \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 " + authenticatedEmployeeCode + "\nNo MBO records found for employee code " + authenticatedEmployeeCode + ".";
        emptyCard.appendChild(emptyMsg);
        contentBox.appendChild(emptyCard);
        return event;
      }
      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;";
      const thead = document.createElement("thead");
      thead.innerHTML = '<tr style="background:#f1f5f9;border-bottom:2px solid #e2e8f0;text-align:left;color:#475569;font-weight:600;"><th style="padding:10px 12px;">\u0E1B\u0E35\u0E07\u0E1A\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 / Fiscal Year</th><th style="padding:10px 12px;">\u0E23\u0E2B\u0E31\u0E2A\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 / Record Key</th><th style="padding:10px 12px;">\u0E2A\u0E16\u0E32\u0E19\u0E30 / Status</th><th style="padding:10px 12px;text-align:right;">\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 / Action</th></tr>';
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      records.forEach((rec) => {
        const tr = document.createElement("tr");
        tr.style.cssText = "border-bottom:1px solid #f1f5f9;";
        const fyTd = document.createElement("td");
        fyTd.style.cssText = "padding:12px;color:#334155;";
        fyTd.textContent = rec.Fiscal_Year?.value || "-";
        const keyTd = document.createElement("td");
        keyTd.style.cssText = "padding:12px;color:#334155;font-family:monospace;";
        keyTd.textContent = rec.Record_Key?.value || "-";
        const rawStatus = rec.Status?.value || "-";
        const displayStatus = formatDisplayStatus(rawStatus);
        const statusTd = document.createElement("td");
        statusTd.style.cssText = "padding:12px;";
        const statusBadge = document.createElement("span");
        statusBadge.setAttribute("data-mbo-status-badge", "");
        statusBadge.textContent = displayStatus;
        const isCompleted = displayStatus === "Completed";
        statusBadge.style.cssText = isCompleted ? "display:inline-block;padding:3px 8px;border-radius:12px;background:#dcfce7;color:#166534;font-size:12px;font-weight:600;" : "display:inline-block;padding:3px 8px;border-radius:12px;background:#e2e8f0;color:#334155;font-size:12px;font-weight:500;";
        statusTd.appendChild(statusBadge);
        const actionTd = document.createElement("td");
        actionTd.style.cssText = "padding:12px;text-align:right;";
        const viewLink = document.createElement("a");
        viewLink.setAttribute("data-mbo-history-link", "");
        viewLink.textContent = "\u0E14\u0E39\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 / View History";
        viewLink.href = `/k/${appId}/show#record=${rec.$id?.value}`;
        viewLink.style.cssText = "color:#2563eb;text-decoration:none;font-weight:500;";
        actionTd.appendChild(viewLink);
        tr.appendChild(fyTd);
        tr.appendChild(keyTd);
        tr.appendChild(statusTd);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      contentBox.appendChild(table);
      return event;
    }
  };

  // src/security/delete-guard-policy.js
  var DeleteGuardPolicy = class {
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
      const authEmpCode = this.mboLoginGate && typeof this.mboLoginGate.getEmployeeCode === "function" ? this.mboLoginGate.getEmployeeCode() : null;
      if (!authEmpCode) {
        return event;
      }
      if (typeof event === "object" && event !== null) {
        event.error = "\u0E01\u0E32\u0E23\u0E25\u0E1A\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 MBO \u0E44\u0E21\u0E48\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 / Deleting MBO records is strictly prohibited for Employee-Self.";
      }
      return false;
    }
  };

  // src/main-mbo-app.js
  var activeUiInstance = null;
  var mboLoginGate = null;
  function setMboLoginGate(gate) {
    mboLoginGate = gate;
  }
  function getActiveUiInstance() {
    return activeUiInstance;
  }
  if (typeof globalThis !== "undefined") {
    globalThis.getActiveUiInstance = getActiveUiInstance;
  }
  function isSemanticValueMatch(valA, valB, fieldType) {
    if (valA === valB) return true;
    if (Array.isArray(valA) && Array.isArray(valB)) {
      if (valA.length !== valB.length) return false;
      return valA.every((item, idx) => {
        const bItem = valB[idx];
        if (typeof item === "object" && item !== null && typeof bItem === "object" && bItem !== null) {
          return item.code === bItem.code;
        }
        return item === bItem;
      });
    }
    if (fieldType === "NUMBER" || typeof valA === "number" || typeof valB === "number") {
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA === numB;
      }
    }
    const strA = String(valA ?? "").trim();
    const strB = String(valB ?? "").trim();
    return strA === strB;
  }
  function syncRecordToKintone(record, options = {}) {
    const requireVerifiedPersistence = options.requireVerifiedPersistence === true;
    const requiredFields = Array.isArray(options.requiredFields) ? options.requiredFields : [];
    if (typeof kintone === "undefined" || !kintone.app || !kintone.app.record) {
      if (requireVerifiedPersistence) {
        throw new Error("Kintone record API is unavailable (kintone.app.record missing)");
      }
      return false;
    }
    if (typeof kintone.app.record.get !== "function" || typeof kintone.app.record.set !== "function") {
      if (requireVerifiedPersistence) {
        throw new Error("Kintone record get/set API functions are unavailable");
      }
      return false;
    }
    const currentData = kintone.app.record.get();
    if (!currentData || !currentData.record) {
      if (requireVerifiedPersistence) {
        throw new Error("Current Kintone form record object is unavailable");
      }
      return false;
    }
    const kintoneRecord = currentData.record;
    if (requireVerifiedPersistence) {
      for (const fieldCode of requiredFields) {
        if (!kintoneRecord[fieldCode]) {
          throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E0A\u0E48\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 ${fieldCode} \u0E43\u0E19\u0E41\u0E1A\u0E1A\u0E1F\u0E2D\u0E23\u0E4C\u0E21 (App 794)
Field ${fieldCode} does not exist on Kintone form schema.`);
        }
      }
    }
    const targetRecord = JSON.parse(JSON.stringify(kintoneRecord));
    Object.keys(record).forEach((k) => {
      if (targetRecord[k] && record[k] && record[k].value !== void 0) {
        targetRecord[k].value = record[k].value;
      }
    });
    try {
      kintone.app.record.set({ record: targetRecord });
    } catch (e) {
      if (requireVerifiedPersistence) {
        throw new Error(`kintone.app.record.set failed: ${e.message}`);
      }
      console.warn("[MBO V2] syncRecordToKintone warning:", e);
      return false;
    }
    if (requireVerifiedPersistence) {
      const postSetData = kintone.app.record.get();
      const postSetRecord = postSetData?.record;
      if (!postSetRecord) {
        throw new Error("Post-set Kintone form record read-back failed");
      }
      for (const fieldCode of requiredFields) {
        const sourceVal = record[fieldCode]?.value;
        const readBackVal = postSetRecord[fieldCode]?.value;
        const fieldType = postSetRecord[fieldCode]?.type;
        if (!isSemanticValueMatch(sourceVal, readBackVal, fieldType)) {
          throw new Error(`Form state read-back mismatch for field ${fieldCode}: expected ${JSON.stringify(sourceVal)}, got ${JSON.stringify(readBackVal)}`);
        }
      }
    }
    return true;
  }
  if (typeof kintone !== "undefined") {
    let getMboAppId = function() {
      return kintone.app.getId() || 794;
    }, hideAllNativeFields = function(record) {
      Object.keys(record).forEach((code) => {
        try {
          kintone.app.record.setFieldShown(code, false);
        } catch (e) {
        }
      });
    }, renderBlockedNotice = function(host, title, detail) {
      if (!host) host = document.body;
      host.innerHTML = "";
      const box = document.createElement("div");
      box.style.cssText = "padding:32px;border:2px solid #c00;border-radius:8px;background:#fff5f5;font-family:sans-serif;max-width:600px;margin:20px auto;";
      const h2 = document.createElement("h2");
      h2.style.cssText = "margin:0 0 12px;color:#c00;font-size:18px;";
      h2.textContent = `\u26D4 ${title}`;
      const p = document.createElement("p");
      p.style.cssText = "margin:0;color:#555;font-size:14px;white-space:pre-wrap;line-height:1.5;";
      p.textContent = String(detail || "");
      box.appendChild(h2);
      box.appendChild(p);
      host.appendChild(box);
    }, resolveBusinessStage = function(event) {
      if (event.type === "app.record.create.show" || event.type === "app.record.create.submit") {
        return BUSINESS_STAGES.NEW_RECORD;
      }
      const status = event.record?.Status?.value || "";
      if (STATUS_TO_STAGE_MAP[status] !== void 0) {
        return STATUS_TO_STAGE_MAP[status];
      }
      return BUSINESS_STAGES.CONFIGURATION_ERROR;
    }, setupRecordUiWithAuth = function(event, record, isCreate, isEdit, isDetail, uiHost, authenticatedEmployeeCode) {
      let isAutoloadingInCreateHandler = false;
      if (mboLoginGate && typeof mboLoginGate.renderAuthBar === "function") {
        mboLoginGate.renderAuthBar(uiHost, authenticatedEmployeeCode);
      }
      if (!isCreate && record.Employee_Code?.value && record.Employee_Code.value !== authenticatedEmployeeCode) {
        renderBlockedNotice(
          uiHost,
          "Access Denied",
          `This MBO record belongs to a different employee.
Authenticated: ${authenticatedEmployeeCode}
Record: ${record.Employee_Code.value}`
        );
        hideAllNativeFields(record);
        return event;
      }
      const stage = resolveBusinessStage(event);
      if (isCreate && record.Fiscal_Year && !record.Fiscal_Year.value) {
        record.Fiscal_Year.value = "FY2026";
      }
      const loginUser = typeof kintone !== "undefined" && kintone.getLoginUser ? kintone.getLoginUser() : null;
      const loginUserCode = loginUser?.code || null;
      const options = {
        container: uiHost,
        record,
        stage,
        isEditable: isCreate || isEdit,
        isCreate,
        loginUserCode,
        // D1: bind authenticated Employee_Code so lookup UI is suppressed and context is locked
        authenticatedEmployeeCode,
        isPreviewMode: false,
        onFieldChange: (code, val) => {
          if (record[code]) {
            record[code].value = val;
          }
          if (!isAutoloadingInCreateHandler) {
            syncRecordToKintone(record);
          }
        },
        onEmployeeCodeChanged: (newCode) => {
          const USER_SELECT_FIELDS = /* @__PURE__ */ new Set([
            "Requester_User",
            "Manager_Level1_Approvers",
            "Manager_Level2_Approvers",
            "GM_Level1_Approvers",
            "GM_Level2_Approvers",
            "First_Manager_User",
            "Manager_User",
            "GM_User"
          ]);
          const fieldsToClear = [
            "Employee_Name",
            "Employee_Name_TH",
            "Employee_Section",
            "Employee_Department",
            "Employee_Position",
            "Employee_Email",
            "Employee_Start_Date",
            "Department_Hoshin",
            "Section_Hoshin",
            "Record_Key",
            "Manager_Level1_Approvers",
            "Manager_Level2_Approvers",
            "GM_Level1_Approvers",
            "GM_Level2_Approvers",
            "Has_Manager_Level2",
            "Has_GM_Level2",
            "Routing_Topology",
            "First_Manager_User",
            "Manager_User",
            "GM_User",
            "Requester_User"
          ];
          if (record.Employee_Code) {
            record.Employee_Code.value = newCode;
          }
          fieldsToClear.forEach((k) => {
            const clearVal = USER_SELECT_FIELDS.has(k) ? [] : "";
            if (record[k]) {
              record[k].value = clearVal;
            }
          });
          if (!isAutoloadingInCreateHandler) {
            syncRecordToKintone(record);
          }
        },
        onLookupEmployee: async (empCode) => {
          const empLookupRes = await EmployeeService.lookupEmployee(empCode, kintoneApiWrapper);
          const empProfile = empLookupRes.employee || empLookupRes;
          const loginUser2 = kintone.getLoginUser();
          const routing = await RoutingService.validateRequesterAccess(
            ROUTING_APP_ID,
            empProfile.Employee_Section,
            empProfile.Team,
            loginUser2.code,
            kintoneApiWrapper,
            empProfile.Employee_Position
          );
          const fy = record.Fiscal_Year?.value || "FY2026";
          let scoringConfig = null;
          try {
            const profileCode = resolveProfileCodeForSnapshot(empProfile);
            const scoringQuery = `Profile_Code = "${profileCode}" and Config_Status in ("PUBLISHED") and Fiscal_Year = "${fy}" limit 2`;
            const scoringRes = await kintoneApiWrapper.getRecords(SCORING_APP_ID, scoringQuery);
            const scoringRecords = scoringRes?.records || [];
            if (scoringRecords.length === 0) {
              throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 Scoring Master (App 796) \u0E17\u0E35\u0E48\u0E2A\u0E16\u0E32\u0E19\u0E30 PUBLISHED \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07 ${empProfile.Employee_Position} (${profileCode}) \u0E43\u0E19 ${fy}
Published scoring configuration was not found in App 796 for position ${empProfile.Employee_Position} (${profileCode}) in ${fy}.`);
            }
            if (scoringRecords.length > 1) {
              throw new Error(`\u0E1E\u0E1A\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 Scoring Master (App 796) \u0E0B\u0E49\u0E33\u0E0B\u0E49\u0E2D\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C ${profileCode} \u0E43\u0E19 ${fy}
Duplicate published scoring configurations found in App 796 for profile ${profileCode} in ${fy}.`);
            }
            const scRec = scoringRecords[0];
            scoringConfig = {
              Profile_Code: profileCode,
              PartA_Weight: scRec.PartA_Weight?.value ? Number(scRec.PartA_Weight.value) : void 0,
              PartB_Weight: scRec.PartB_Weight?.value ? Number(scRec.PartB_Weight.value) : void 0,
              Part_A_Scoring_Mode: scRec.Part_A_Scoring_Mode?.value || "",
              Competency_Set_Code: scRec.Competency_Set_Code?.value || "",
              Configuration_Hash: scRec.Configuration_Hash?.value || ""
            };
          } catch (scoringErr) {
            console.warn("[MBO V2] Scoring resolution info:", scoringErr.message);
            throw scoringErr;
          }
          const generatedKey = buildRecordKey(fy, empProfile.Employee_Code);
          await EmployeeService.checkDuplicateMBO(getMboAppId(), fy, empProfile.Employee_Code, record.$id?.value, kintoneApiWrapper);
          const fieldsToSync = {
            Employee_Code: empProfile.Employee_Code,
            Employee_Name: empProfile.Employee_Name,
            Employee_Name_TH: empProfile.Employee_Name_TH,
            Employee_Section: empProfile.Employee_Section,
            Employee_Department: empProfile.Employee_Department,
            Employee_Position: empProfile.Employee_Position,
            Employee_Email: empProfile.Employee_Email,
            Employee_Start_Date: empProfile.Employee_Start_Date,
            Requester_User: routing.Requester_User,
            Manager_Level1_Approvers: routing.Manager_Level1_Approvers,
            Manager_Level1_Approval_Rule: routing.Manager_Level1_Approval_Rule,
            Manager_Level2_Approvers: routing.Manager_Level2_Approvers,
            Manager_Level2_Approval_Rule: routing.Manager_Level2_Approval_Rule,
            GM_Level1_Approvers: routing.GM_Level1_Approvers,
            GM_Level1_Approval_Rule: routing.GM_Level1_Approval_Rule,
            GM_Level2_Approvers: routing.GM_Level2_Approvers,
            GM_Level2_Approval_Rule: routing.GM_Level2_Approval_Rule,
            Has_Manager_Level2: routing.Has_Manager_Level2,
            Has_GM_Level2: routing.Has_GM_Level2,
            Routing_Topology: routing.Routing_Topology,
            First_Manager_User: routing.First_Manager_User,
            Manager_User: routing.Manager_User,
            GM_User: routing.GM_User,
            Fiscal_Year: fy,
            Record_Key: generatedKey
          };
          if (empProfile.Department_Hoshin !== void 0) {
            fieldsToSync.Department_Hoshin = empProfile.Department_Hoshin;
          }
          if (empProfile.Section_Hoshin !== void 0) {
            fieldsToSync.Section_Hoshin = empProfile.Section_Hoshin;
          }
          if (scoringConfig) {
            if (scoringConfig.Profile_Code) fieldsToSync.Profile_Code = scoringConfig.Profile_Code;
            if (scoringConfig.PartA_Weight !== void 0) fieldsToSync.PartA_Weight = scoringConfig.PartA_Weight;
            if (scoringConfig.PartB_Weight !== void 0) fieldsToSync.PartB_Weight = scoringConfig.PartB_Weight;
            if (scoringConfig.Part_A_Scoring_Mode) fieldsToSync.Part_A_Scoring_Mode = scoringConfig.Part_A_Scoring_Mode;
            if (scoringConfig.Competency_Set_Code) fieldsToSync.Competency_Set_Code = scoringConfig.Competency_Set_Code;
            if (scoringConfig.Configuration_Hash) fieldsToSync.Configuration_Hash = scoringConfig.Configuration_Hash;
          }
          const CORE_SNAPSHOT_FIELDS = [
            "Profile_Code",
            "PartA_Weight",
            "PartB_Weight",
            "Part_A_Scoring_Mode",
            "Competency_Set_Code",
            "Configuration_Hash",
            "Routing_Topology",
            "Requester_User",
            "Record_Key"
          ];
          for (const fieldCode of CORE_SNAPSHOT_FIELDS) {
            if (!record[fieldCode]) {
              throw new Error(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E0A\u0E48\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 ${fieldCode} \u0E43\u0E19\u0E41\u0E1A\u0E1A\u0E1F\u0E2D\u0E23\u0E4C\u0E21 (App 794)
Field ${fieldCode} does not exist on Kintone form schema.`);
            }
          }
          Object.entries(fieldsToSync).forEach(([k, val]) => {
            if (val !== void 0 && record[k]) {
              record[k].value = val;
            }
          });
          if (!isAutoloadingInCreateHandler) {
            syncRecordToKintone(record, {
              requireVerifiedPersistence: true,
              requiredFields: CORE_SNAPSHOT_FIELDS
            });
          }
        }
      };
      const ui = new EmployeePartAUI(options);
      activeUiInstance = ui;
      try {
        ui.render();
        hideAllNativeFields(record);
      } catch (renderError) {
        console.error("[MBO V2] Error rendering custom UI:", renderError);
      }
      if (isCreate && authenticatedEmployeeCode) {
        isAutoloadingInCreateHandler = true;
        const lookupPromise = ui.executeLookup(authenticatedEmployeeCode);
        if (lookupPromise && typeof lookupPromise.then === "function") {
          return lookupPromise.then(() => event).catch((err) => {
            console.error("[MBO V2] Employee profile resolution failed during create show autoload:", err);
            renderBlockedNotice(
              uiHost,
              "Employee Profile Resolution Failed",
              `Could not resolve Employee profile for ${authenticatedEmployeeCode}: ${err.message}`
            );
            hideAllNativeFields(record);
            return event;
          }).finally(() => {
            isAutoloadingInCreateHandler = false;
          });
        } else {
          isAutoloadingInCreateHandler = false;
        }
      }
      return event;
    };
    const ROUTING_APP_ID = 795;
    const EMPLOYEE_APP_ID = 53;
    const SCORING_APP_ID = 796;
    const kintoneApiWrapper = {
      getRecords: async (appId, query) => {
        const resp = await kintone.api(kintone.api.url("/k/v1/records.json", true), "GET", {
          app: appId,
          query
        });
        return resp;
      },
      getRecord: async (appId, id) => {
        const resp = await kintone.api(kintone.api.url("/k/v1/record.json", true), "GET", {
          app: appId,
          id
        });
        return resp ? resp.record : null;
      }
    };
    if (!mboLoginGate) {
      try {
        const app801Api = {
          getRecords: (appId, query) => kintoneApiWrapper.getRecords(appId, query),
          updateRecord: (appId, id, record) => kintone.api(kintone.api.url("/k/v1/record.json", true), "PUT", {
            app: appId,
            id: Number(id),
            record
          })
        };
        const authAdapter = new MboKintoneAuthAdapter({ api: app801Api });
        const sessionManager = new MboSessionManager({
          adapter: authAdapter,
          getKintoneUser: () => typeof kintone !== "undefined" && kintone.getLoginUser ? kintone.getLoginUser() : null
        });
        mboLoginGate = new MboKintoneLoginGate(authAdapter, { sessionManager });
      } catch (initErr) {
        console.error("[MBO V2] FATAL: Failed to initialize MBO Login Gate.", initErr);
      }
    }
    async function renderEmployeeSelfIndex(event, host, authenticatedEmployeeCode) {
      const indexUi = new EmployeeSelfIndexUI({
        kintoneApiWrapper,
        getMboAppId,
        mboLoginGate,
        renderBlockedNotice
      });
      return indexUi.render(event, host, authenticatedEmployeeCode);
    }
    kintone.events.on("app.record.index.show", function(event) {
      const host = document.querySelector(".gaia-app-wrapper") || document.body;
      if (!mboLoginGate) {
        renderBlockedNotice(
          host,
          "MBO Login Gate Not Initialized",
          "The MBO authentication system could not be started. Access blocked. [FAIL_CLOSED_GATE_NULL]"
        );
        const recordList2 = document.querySelector(".recordlist-gaia") || document.querySelector(".gaia-argus-app-index-readonly");
        if (recordList2) recordList2.style.display = "none";
        return event;
      }
      const authResult = mboLoginGate.requireLogin(host);
      if (typeof authResult === "string") {
        return renderEmployeeSelfIndex(event, host, authResult);
      } else if (authResult && typeof authResult.then === "function") {
        return authResult.then((authenticatedEmployeeCode) => {
          if (!authenticatedEmployeeCode) {
            renderBlockedNotice(
              host,
              "Authentication Required",
              "You must log in with your MBO credentials to access this page. [FAIL_CLOSED_NO_CODE]"
            );
            const recordList2 = document.querySelector(".recordlist-gaia") || document.querySelector(".gaia-argus-app-index-readonly");
            if (recordList2) recordList2.style.display = "none";
            return event;
          }
          return renderEmployeeSelfIndex(event, host, authenticatedEmployeeCode);
        });
      }
      renderBlockedNotice(
        host,
        "Authentication Required",
        "You must log in with your MBO credentials to access this page. [FAIL_CLOSED_NO_CODE]"
      );
      const recordList = document.querySelector(".recordlist-gaia") || document.querySelector(".gaia-argus-app-index-readonly");
      if (recordList) recordList.style.display = "none";
      return event;
    });
    kintone.events.on(["app.record.detail.show", "app.record.edit.show", "app.record.create.show"], function(event) {
      const record = event.record;
      const isCreate = event.type === "app.record.create.show";
      const isEdit = event.type === "app.record.edit.show";
      const isDetail = event.type === "app.record.detail.show";
      let uiHost = getRecordUiHost("SPACE_HEADER");
      if (!uiHost) {
        uiHost = document.querySelector(".gaia-app-wrapper") || document.body;
        renderBlockedNotice(
          uiHost,
          "Custom UI Host Missing",
          "Required UI header element (SPACE_HEADER) was not found. Access blocked. [FAIL_CLOSED_NO_HOST]"
        );
        hideAllNativeFields(record);
        return event;
      }
      if (!mboLoginGate) {
        renderBlockedNotice(
          uiHost,
          "MBO Login Gate Not Initialized",
          "The MBO authentication system could not be started. Please contact your administrator. [FAIL_CLOSED_GATE_NULL]"
        );
        hideAllNativeFields(record);
        return event;
      }
      const authResult = mboLoginGate.requireLogin(uiHost);
      if (typeof authResult === "string") {
        return setupRecordUiWithAuth(event, record, isCreate, isEdit, isDetail, uiHost, authResult);
      } else if (authResult && typeof authResult.then === "function") {
        return authResult.then((authenticatedEmployeeCode) => {
          if (!authenticatedEmployeeCode) {
            renderBlockedNotice(
              uiHost,
              "Authentication Required",
              "You must log in with your MBO credentials to access this page. [FAIL_CLOSED_NO_CODE]"
            );
            hideAllNativeFields(record);
            return event;
          }
          return setupRecordUiWithAuth(event, record, isCreate, isEdit, isDetail, uiHost, authenticatedEmployeeCode);
        });
      }
      renderBlockedNotice(
        uiHost,
        "Authentication Required",
        "You must log in with your MBO credentials to access this page. [FAIL_CLOSED_NO_CODE]"
      );
      hideAllNativeFields(record);
      return event;
    });
    kintone.events.on(["app.record.create.submit", "app.record.edit.submit"], async function(event) {
      const record = event.record;
      const isCreate = event.type === "app.record.create.submit";
      const stage = resolveBusinessStage(event);
      if (activeUiInstance) {
        activeUiInstance.syncFromDom();
      }
      if (!activeUiInstance || activeUiInstance.isEmployeeVerified !== true) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: "Employee_Code",
            messageTH: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E48\u0E2D\u0E19\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01",
            messageEN: "Please enter Employee Code and click Search to verify employee profile before saving.",
            message: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E01\u0E14\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E48\u0E2D\u0E19\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01"
          }]);
        }
        return false;
      }
      const fy = record.Fiscal_Year?.value || "FY2026";
      const code = record.Employee_Code?.value || "";
      const recordKey = buildRecordKey(fy, code);
      if (!recordKey) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: "Employee_Code",
            messageTH: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E23\u0E49\u0E32\u0E07 Record Key \u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19",
            messageEN: "Cannot generate Record Key. Please enter Employee Code and Fiscal Year.",
            message: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E23\u0E49\u0E32\u0E07 Record Key \u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E23\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19"
          }]);
        }
        return false;
      }
      if (record.Record_Key) {
        record.Record_Key.value = recordKey;
      }
      try {
        const currentId = record.$id?.value;
        const query = `Record_Key = "${recordKey}" ${currentId ? `and $id != "${currentId}"` : ""}`;
        const duplicateRes = await kintoneApiWrapper.getRecords(getMboAppId(), query);
        if (!duplicateRes || typeof duplicateRes !== "object" || !Array.isArray(duplicateRes.records)) {
          if (activeUiInstance) {
            activeUiInstance.showValidationErrors([{
              field: "Employee_Code",
              messageTH: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator",
              messageEN: "Unable to verify record uniqueness. Please try again or contact HR / Administrator.",
              message: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator"
            }]);
          }
          return false;
        }
        if (duplicateRes.records.length > 0) {
          if (activeUiInstance) {
            activeUiInstance.showValidationErrors([{
              field: "Employee_Code",
              messageTH: `\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E2B\u0E31\u0E2A ${code} \u0E21\u0E35 MBO \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A ${fy} \u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49`,
              messageEN: `Employee ID ${code} already has an MBO record for ${fy}. Duplicate creation is blocked.`,
              message: `\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E2B\u0E31\u0E2A ${code} \u0E21\u0E35 MBO \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A ${fy} \u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49`
            }]);
          }
          return false;
        }
      } catch (err) {
        console.error("[MBO V2] Duplicate check error:", err);
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: "Employee_Code",
            messageTH: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator",
            messageEN: "Unable to verify record uniqueness. Please try again or contact HR / Administrator.",
            message: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D HR / Administrator"
          }]);
        }
        return false;
      }
      const validation = ValidationEngine.validate(record, stage);
      if (!validation.isValid) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors(validation.fieldErrors);
        }
        return false;
      }
      if (activeUiInstance) {
        activeUiInstance.clearValidationErrors();
      }
      if (activeUiInstance) {
        const hasAttachmentChanges = typeof activeUiInstance.hasPendingOrDirtyAttachments === "function" ? activeUiInstance.hasPendingOrDirtyAttachments() : Boolean(activeUiInstance.pendingAttachments && Object.keys(activeUiInstance.pendingAttachments).some((k) => Array.isArray(activeUiInstance.pendingAttachments[k]) && activeUiInstance.pendingAttachments[k].length > 0));
        if (hasAttachmentChanges) {
          try {
            let persistedRecord = null;
            if (!isCreate) {
              const appId = event.appId || getMboAppId();
              const recordId = event.recordId || record?.$id?.value;
              if (!appId || !recordId) {
                throw new Error("MISSING_RECORD_IDENTIFIER: appId or recordId is missing for edit attachment plan.");
              }
              if (typeof kintoneApiWrapper.getRecord === "function") {
                persistedRecord = await kintoneApiWrapper.getRecord(appId, recordId);
              } else if (globalThis.kintone?.api) {
                const url = globalThis.kintone.api.url("/k/v1/record.json", true);
                const resp = await globalThis.kintone.api(url, "GET", { app: appId, id: recordId });
                persistedRecord = resp ? resp.record : null;
              }
              if (!persistedRecord || typeof persistedRecord !== "object") {
                throw new Error("PERSISTED_RECORD_GET_FAILED: Kintone GET record returned null or invalid object.");
              }
            }
            await activeUiInstance.preparePendingAttachments({
              record: event.record,
              persistedRecord,
              isEdit: !isCreate
            });
          } catch (err) {
            console.error("[MBO V2] Attachment submit upload error:", err);
            activeUiInstance.showValidationErrors([{
              field: "Objective_Attachment_1",
              messageTH: `\u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E43\u0E19\u0E01\u0E32\u0E23\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C\u0E41\u0E19\u0E1A: ${err.message}`,
              messageEN: `Attachment upload failed: ${err.message}`,
              message: `Attachment upload failed: ${err.message}`
            }]);
            return false;
          }
        }
      }
      return event;
    });
    kintone.events.on(["app.record.create.submit.success", "app.record.edit.submit.success"], async function(event) {
      const appId = event.appId || getMboAppId();
      const recordId = event.recordId || event.record?.$id?.value;
      if (activeUiInstance && recordId) {
        try {
          await activeUiInstance.finalizeAttachmentPlan({ appId, recordId });
        } catch (err) {
          console.error("[MBO V2] Attachment post-save finalize error:", err);
          const errorMsgTH = `\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08 \u0E41\u0E15\u0E48\u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E43\u0E19\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E41\u0E19\u0E1A: ${err.message}`;
          const errorMsgEN = `Record saved, but attachment binding failed: ${err.message}`;
          if (typeof activeUiInstance.showValidationErrors === "function") {
            activeUiInstance.showValidationErrors([{
              field: "Objective_Attachment_1",
              messageTH: errorMsgTH,
              messageEN: errorMsgEN,
              message: errorMsgEN
            }]);
          }
          if (typeof globalThis.alert === "function") {
            try {
              globalThis.alert(`${errorMsgTH}
${errorMsgEN}`);
            } catch (e) {
            }
          } else if (globalThis.kintone?.showNotification) {
            try {
              globalThis.kintone.showNotification({ text: `${errorMsgTH} / ${errorMsgEN}`, type: "error" });
            } catch (e) {
            }
          }
          if (typeof globalThis.location !== "undefined" && globalThis.location?.href) {
            event.url = globalThis.location.href;
          } else {
            event.url = null;
          }
          return event;
        }
      }
      return event;
    });
    kintone.events.on("app.record.detail.process.proceed", function(event) {
      const record = event.record;
      const actionName = event.action?.value || "";
      const stage = resolveBusinessStage(event);
      const actionValidation = ValidationEngine.validateWorkflowAction(record, actionName, stage);
      if (!actionValidation.isValid) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors(actionValidation.fieldErrors);
        }
        return false;
      }
      const validation = ValidationEngine.validate(record, stage);
      if (!validation.isValid) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors(validation.fieldErrors);
        }
        return false;
      }
      return event;
    });
    kintone.events.on(["app.record.detail.delete.submit", "app.record.index.delete.submit"], function(event) {
      const policy = new DeleteGuardPolicy({ mboLoginGate });
      return policy.evaluateDeleteSubmit(event);
    });
  }
})();
