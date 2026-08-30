/**
 * ApproverTaskIndexUI — Presentation Renderer for My Approval Tasks
 *
 * Render-only component for DEDICATED approval tasks section on Index show.
 * Performs 0 Kintone API calls, 0 App795 lookups, and 0 authority calculations.
 */

export class ApproverTaskIndexUI {
  static _setStyle(el, css) {
    if (!el) return;
    if (!el.style) el.style = {};
    try {
      el.style.cssText = css;
    } catch (e) {
      // ignore
    }
  }

  /**
   * Render My Approval Tasks section into host element
   * @param {HTMLElement} hostElement
   * @param {Array<Object>} tasks - Already-authorized task records from MboApprovalTaskService
   */
  static render(hostElement, tasks = []) {
    if (!hostElement) return;

    const existingSection = hostElement.querySelector('.mbo-approval-tasks-section');
    if (existingSection) {
      existingSection.remove();
    }

    const section = document.createElement('div');
    section.className = 'mbo-approval-tasks-section';
    this._setStyle(section, 'margin-top: 24px; padding: 16px; border: 1px solid #e3e8ee; border-radius: 8px; background: #ffffff;');

    const header = document.createElement('div');
    header.className = 'mbo-approval-tasks-header';
    this._setStyle(header, 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #205493; padding-bottom: 8px;');

    const title = document.createElement('h2');
    this._setStyle(title, 'margin: 0; font-size: 18px; font-weight: 600; color: #102a43;');
    title.textContent = `งานรอฉันอนุมัติ / My Approval Tasks (${tasks.length})`;

    header.appendChild(title);
    section.appendChild(header);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'mbo-approval-tasks-empty';
      this._setStyle(emptyMsg, 'padding: 24px; text-align: center; color: #627d98; font-size: 14px;');
      emptyMsg.textContent = 'ไม่มีรายการรออนุมัติ / No pending approval tasks';
      section.appendChild(emptyMsg);
    } else {
      const table = document.createElement('table');
      table.className = 'mbo-approval-tasks-table';
      this._setStyle(table, 'width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;');

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr style="background: #f0f4f8; color: #334e68; border-bottom: 1px solid #d9e2ec;">
          <th style="padding: 10px;">Fiscal Year</th>
          <th style="padding: 10px;">Employee</th>
          <th style="padding: 10px;">Status</th>
          <th style="padding: 10px;">Record Key</th>
          <th style="padding: 10px; text-align: center;">Action</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement('tbody');

      tasks.forEach(task => {
        const row = document.createElement('tr');
        this._setStyle(row, 'border-bottom: 1px solid #e1e8ed;');

        const recId = task.$id?.value || task.Record_ID?.value || '';
        const fy = task.Fiscal_Year?.value || '-';
        const empCode = task.Employee_Code?.value || '';
        const empName = task.Employee_Name?.value || task.Employee_Name_TH?.value || '';
        const empDisplay = empCode && empName ? `${empCode} - ${empName}` : (empCode || empName || '-');
        const status = task.Status?.value || '-';
        const key = task.Record_Key?.value || (recId ? `#${recId}` : '-');

        const tdFy = document.createElement('td');
        this._setStyle(tdFy, 'padding: 10px;');
        tdFy.textContent = fy;

        const tdEmp = document.createElement('td');
        this._setStyle(tdEmp, 'padding: 10px;');
        tdEmp.textContent = empDisplay;

        const tdStatus = document.createElement('td');
        this._setStyle(tdStatus, 'padding: 10px;');
        tdStatus.textContent = status;

        const tdKey = document.createElement('td');
        this._setStyle(tdKey, 'padding: 10px;');
        tdKey.textContent = key;

        const tdAction = document.createElement('td');
        this._setStyle(tdAction, 'padding: 10px; text-align: center;');

        if (recId) {
          const link = document.createElement('a');
          link.className = 'mbo-approval-task-link';
          link.href = `/k/794/show#record=${recId}`;
          this._setStyle(link, 'color: #0066cc; text-decoration: none; font-weight: 500;');
          link.textContent = 'View Record';
          tdAction.appendChild(link);
        } else {
          tdAction.textContent = '-';
        }

        row.appendChild(tdFy);
        row.appendChild(tdEmp);
        row.appendChild(tdStatus);
        row.appendChild(tdKey);
        row.appendChild(tdAction);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      section.appendChild(table);
    }

    hostElement.appendChild(section);
  }

  /**
   * Render error state into host element when task fetching fails
   * @param {HTMLElement} hostElement
   * @param {Error} error
   */
  static renderError(hostElement, error) {
    if (!hostElement) return;

    const existingSection = hostElement.querySelector('.mbo-approval-tasks-section');
    if (existingSection) {
      existingSection.remove();
    }

    const section = document.createElement('div');
    section.className = 'mbo-approval-tasks-section mbo-approval-tasks-error-state';
    this._setStyle(section, 'margin-top: 24px; padding: 16px; border: 1px solid #f5c6cb; border-radius: 8px; background: #f8d7da;');

    const title = document.createElement('h2');
    this._setStyle(title, 'margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #721c24;');
    title.textContent = 'งานรอฉันอนุมัติ / My Approval Tasks';

    const errorMsg = document.createElement('div');
    this._setStyle(errorMsg, 'color: #721c24; font-size: 14px;');
    errorMsg.textContent = 'ไม่สามารถโหลดรายการรออนุมัติได้ / Unable to load approval tasks';

    section.appendChild(title);
    section.appendChild(errorMsg);
    hostElement.appendChild(section);
  }
}
