/**
 * Employee-Self Index UI Renderer
 * Renders a unified HeaderSpace shell containing the Auth Toolbar and My MBO Records structured table.
 * Only hides duplicate native index list controls while preserving global Kintone navigation/breadcrumbs.
 */

export function formatDisplayStatus(rawStatus) {
  if (!rawStatus) return '-';
  const str = String(rawStatus).trim();
  if (str === '16 Completed' || str === 'Completed') {
    return 'Completed';
  }
  return str;
}

export class EmployeeSelfIndexUI {
  constructor(options = {}) {
    this.kintoneApiWrapper = options.kintoneApiWrapper;
    this.getMboAppId = options.getMboAppId;
    this.mboLoginGate = options.mboLoginGate;
    this.renderBlockedNotice = options.renderBlockedNotice;
  }

  async render(event, host, authenticatedEmployeeCode) {
    // Hide ONLY duplicate native index list controls
    // DO NOT hide Kintone global header, breadcrumbs, or comments
    const duplicateIndexControls = [
      '.recordlist-gaia',
      '.gaia-argus-app-index-readonly',
      '.gaia-argus-app-index-toolbar'
    ];
    duplicateIndexControls.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.display = 'none';
      }
    });

    const headerSpace = (typeof kintone !== 'undefined' && kintone.app && typeof kintone.app.getHeaderSpaceElement === 'function')
      ? kintone.app.getHeaderSpaceElement()
      : null;
    const containerHost = headerSpace || host || document.body;

    let indexContainer = containerHost.querySelector('[data-mbo-custom-index]');
    if (indexContainer) {
      indexContainer.innerHTML = '';
    } else {
      indexContainer = document.createElement('div');
      indexContainer.setAttribute('data-mbo-custom-index', '');
      indexContainer.style.cssText = 'font-family:sans-serif;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);margin-bottom:20px;overflow:hidden;';
      containerHost.appendChild(indexContainer);
    }

    // Render Auth Toolbar at top of unified HeaderSpace shell (handles deduplication: exactly 1 auth bar)
    if (this.mboLoginGate && typeof this.mboLoginGate.renderAuthBar === 'function') {
      this.mboLoginGate.renderAuthBar(indexContainer, authenticatedEmployeeCode);
    }

    const contentBox = document.createElement('div');
    contentBox.style.cssText = 'padding:20px;';
    indexContainer.appendChild(contentBox);

    const appId = typeof this.getMboAppId === 'function' ? this.getMboAppId() : 794;
    const query = `Employee_Code = "${authenticatedEmployeeCode}" order by Fiscal_Year desc`;

    let records = [];
    try {
      if (this.kintoneApiWrapper && typeof this.kintoneApiWrapper.getRecords === 'function') {
        const res = await this.kintoneApiWrapper.getRecords(appId, query);
        records = res?.records || [];
      }
    } catch (err) {
      if (typeof this.renderBlockedNotice === 'function') {
        this.renderBlockedNotice(contentBox, 'ข้อผิดพลาดในการโหลดข้อมูล / Error Loading MBO Records', `ไม่สามารถโหลดบันทึก MBO สำหรับ ${authenticatedEmployeeCode}: ${err.message}`);
      }
      return event;
    }

    // Header row with Title and Create Button
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f1f5f9;';

    const title = document.createElement('h2');
    title.setAttribute('data-mbo-title', '');
    title.style.cssText = 'margin:0;font-size:18px;font-weight:600;color:#1e293b;';
    title.textContent = 'MBO ของฉัน / My MBO';

    const createBtn = document.createElement('a');
    createBtn.setAttribute('data-mbo-create-btn', '');
    createBtn.textContent = '+ สร้าง MBO ใหม่ / Create New MBO';
    createBtn.href = `/k/${appId}/edit`;
    createBtn.className = 'mbo-btn-create';
    createBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,0.05);';

    headerRow.appendChild(title);
    headerRow.appendChild(createBtn);
    contentBox.appendChild(headerRow);

    if (records.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.setAttribute('data-mbo-empty-state', '');
      emptyCard.style.cssText = 'padding:32px 16px;text-align:center;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:6px;margin-top:8px;';
      const emptyMsg = document.createElement('p');
      emptyMsg.style.cssText = 'color:#64748b;font-size:14px;margin:0;line-height:1.5;white-space:pre-wrap;';
      emptyMsg.textContent = 'ไม่พบบันทึก MBO สำหรับรหัสพนักงาน ' + authenticatedEmployeeCode + '\nNo MBO records found for employee code ' + authenticatedEmployeeCode + '.';
      emptyCard.appendChild(emptyMsg);
      contentBox.appendChild(emptyCard);
      return event;
    }

    // My MBO Structured Table Container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'mbo-my-mbo-table-container mbo-table-container';
    if (typeof tableContainer.setAttribute === 'function') {
      tableContainer.setAttribute('data-mbo-index-table-container', '');
      tableContainer.setAttribute('data-mbo-record-list', '');
    }

    const table = document.createElement('table');
    table.className = 'mbo-my-mbo-table mbo-grid-table';
    if (typeof table.setAttribute === 'function') {
      table.setAttribute('data-mbo-index-table', '');
    }

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    const thFy = document.createElement('th');
    thFy.textContent = 'Fiscal Year / ปีงบประมาณ';

    const thStatus = document.createElement('th');
    thStatus.textContent = 'Status / สถานะ';

    const thKey = document.createElement('th');
    thKey.textContent = 'Record Key / รหัสบันทึก';

    const thAction = document.createElement('th');
    thAction.style.textAlign = 'right';
    thAction.textContent = 'Action / ดำเนินการ';

    trHead.appendChild(thFy);
    trHead.appendChild(thStatus);
    trHead.appendChild(thKey);
    trHead.appendChild(thAction);
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    records.forEach(rec => {
      const row = document.createElement('tr');
      if (typeof row.setAttribute === 'function') {
        row.setAttribute('data-mbo-record-card', '');
        row.setAttribute('data-mbo-record-row', '');
      }

      const rawFy = rec.Fiscal_Year?.value || '-';
      const fyDisplay = (rawFy.startsWith('FY') || rawFy === '-') ? rawFy : `FY ${rawFy}`;
      const keyVal = rec.Record_Key?.value || '-';
      const rawStatus = rec.Status?.value || '-';
      const displayStatus = formatDisplayStatus(rawStatus);
      const isCompleted = (displayStatus === 'Completed' || rawStatus === '16 Completed' || rawStatus === 'Completed');
      const actionLabel = isCompleted ? 'ดูย้อนหลัง / View History' : 'เปิด MBO / Open MBO';

      // 1. Fiscal Year cell
      const tdFy = document.createElement('td');
      const fyEl = document.createElement('span');
      fyEl.className = 'mbo-record-fy';
      if (typeof fyEl.setAttribute === 'function') {
        fyEl.setAttribute('data-mbo-fy', '');
      }
      fyEl.textContent = fyDisplay;
      tdFy.appendChild(fyEl);

      // 2. Status cell
      const tdStatus = document.createElement('td');
      const statusBadge = document.createElement('span');
      if (typeof statusBadge.setAttribute === 'function') {
        statusBadge.setAttribute('data-mbo-status-badge', '');
      }
      statusBadge.className = isCompleted ? 'mbo-status-badge mbo-status-completed' : 'mbo-status-badge mbo-status-active';
      statusBadge.textContent = displayStatus;
      tdStatus.appendChild(statusBadge);

      // 3. Record Key cell
      const tdKey = document.createElement('td');
      const keyEl = document.createElement('code');
      keyEl.className = 'mbo-record-key';
      if (typeof keyEl.setAttribute === 'function') {
        keyEl.setAttribute('data-mbo-record-key', '');
      }
      keyEl.textContent = keyVal;
      tdKey.appendChild(keyEl);

      // 4. Action cell
      const tdAction = document.createElement('td');
      tdAction.style.textAlign = 'right';
      const actionLink = document.createElement('a');
      if (typeof actionLink.setAttribute === 'function') {
        actionLink.setAttribute(isCompleted ? 'data-mbo-history-link' : 'data-mbo-open-link', '');
      }
      actionLink.className = isCompleted ? 'mbo-card-action-btn mbo-btn-history' : 'mbo-card-action-btn mbo-btn-open';
      actionLink.textContent = actionLabel;
      actionLink.href = `/k/${appId}/show#record=${rec.$id?.value}`;
      tdAction.appendChild(actionLink);

      row.appendChild(tdFy);
      row.appendChild(tdStatus);
      row.appendChild(tdKey);
      row.appendChild(tdAction);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    contentBox.appendChild(tableContainer);

    return event;
  }
}
