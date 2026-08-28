/**
 * Employee-Self Index UI Renderer
 * Renders a unified HeaderSpace shell containing the Auth Toolbar and My MBO Records card list.
 * Only hides duplicate native index list controls while preserving global Kintone navigation/breadcrumbs.
 */

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

    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr style="background:#f1f5f9;border-bottom:2px solid #e2e8f0;text-align:left;color:#475569;font-weight:600;">' +
      '<th style="padding:10px 12px;">ปีงบประมาณ / Fiscal Year</th>' +
      '<th style="padding:10px 12px;">รหัสบันทึก / Record Key</th>' +
      '<th style="padding:10px 12px;">สถานะ / Status</th>' +
      '<th style="padding:10px 12px;text-align:right;">การดำเนินการ / Action</th>' +
      '</tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    records.forEach(rec => {
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom:1px solid #f1f5f9;';

      const fyTd = document.createElement('td');
      fyTd.style.cssText = 'padding:12px;color:#334155;';
      fyTd.textContent = rec.Fiscal_Year?.value || '-';

      const keyTd = document.createElement('td');
      keyTd.style.cssText = 'padding:12px;color:#334155;font-family:monospace;';
      keyTd.textContent = rec.Record_Key?.value || '-';

      const statusTd = document.createElement('td');
      statusTd.style.cssText = 'padding:12px;';
      const statusBadge = document.createElement('span');
      statusBadge.textContent = rec.Status?.value || '-';
      statusBadge.style.cssText = 'display:inline-block;padding:3px 8px;border-radius:12px;background:#e2e8f0;color:#334155;font-size:12px;font-weight:500;';
      statusTd.appendChild(statusBadge);

      const actionTd = document.createElement('td');
      actionTd.style.cssText = 'padding:12px;text-align:right;';
      const viewLink = document.createElement('a');
      viewLink.textContent = 'ดู / แก้ไข (View / Edit)';
      viewLink.href = `/k/${appId}/show#record=${rec.$id?.value}`;
      viewLink.style.cssText = 'color:#2563eb;text-decoration:none;font-weight:500;';
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
}
