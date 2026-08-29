/**
 * Employee Native Comment Mirror Component
 * Canonical owner for read-only Kintone comment mirror & Refresh.
 * Rendered on existing Detail & Edit screens; strictly 0 comment GET on Create.
 * Presentation: Compact structured table matching Workflow Action Timeline visual language.
 */

export class EmployeeCommentMirror {
  constructor(options = {}) {
    this.kintoneApiWrapper = options.kintoneApiWrapper;
    this.getAppId = options.getAppId || (() => 794);
  }

  async fetchRecordComments(appId, recordId) {
    const numericAppId = Number(appId || (typeof this.getAppId === 'function' ? this.getAppId() : 794));
    const numericRecordId = Number(recordId || (typeof kintone !== 'undefined' && kintone.app?.record?.getId ? kintone.app.record.getId() : 0));

    if (!numericAppId || isNaN(numericAppId) || !numericRecordId || isNaN(numericRecordId) || numericRecordId <= 0) {
      return [];
    }

    let allComments = [];
    let offset = 0;
    const limit = 10;
    let page = 0;
    const maxPages = 10000;
    let prevOffset = -1;

    while (true) {
      if (page >= maxPages) {
        throw new Error(`PAGINATION_SAFETY_CAP_EXCEEDED: Comment thread exceeded safety ceiling of ${maxPages} pages without completion.`);
      }
      page++;

      if (offset === prevOffset) {
        throw new Error(`PAGINATION_STUCK: Offset did not advance beyond ${offset}`);
      }
      prevOffset = offset;

      let resp = null;
      if (this.kintoneApiWrapper && typeof this.kintoneApiWrapper.getComments === 'function') {
        resp = await this.kintoneApiWrapper.getComments(numericAppId, numericRecordId, { limit, offset, order: 'asc' });
      } else if (typeof kintone !== 'undefined' && kintone.api && typeof kintone.api.url === 'function') {
        const url = kintone.api.url('/k/v1/record/comments.json', true);
        resp = await kintone.api(url, 'GET', { app: numericAppId, record: numericRecordId, limit, offset, order: 'asc' });
      } else {
        break;
      }

      const comments = Array.isArray(resp?.comments) ? resp.comments : [];
      if (comments.length === 0) {
        break;
      }

      allComments = allComments.concat(comments);

      if (typeof resp.newer === 'boolean') {
        if (!resp.newer) {
          break;
        }
        offset += comments.length;
      } else if (comments.length < limit) {
        break;
      } else {
        offset += comments.length;
      }
    }

    return allComments;
  }

  renderNativeCommentMirror(options = {}) {
    const isCreate = options.isCreate ?? false;
    const appId = Number(options.appId || (typeof this.getAppId === 'function' ? this.getAppId() : 794));
    const rawRecordId = options.recordId || (typeof kintone !== 'undefined' && kintone.app?.record?.getId ? kintone.app.record.getId() : null);
    const recordId = Number(rawRecordId);

    const panel = document.createElement('div');
    panel.className = 'mbo-native-comment-mirror mbo-comment-panel';
    if (typeof panel.setAttribute === 'function') {
      panel.setAttribute('data-mbo-comment-panel', '');
      panel.setAttribute('data-mbo-comment-section', '');
    }

    if (isCreate || !rawRecordId || isNaN(recordId) || recordId <= 0) {
      return panel;
    }

    const header = document.createElement('div');
    header.className = 'mbo-comment-header';
    if (typeof header.setAttribute === 'function') {
      header.setAttribute('data-mbo-comment-header', '');
    }

    const titleBox = document.createElement('div');
    titleBox.className = 'mbo-comment-title-box mbo-comment-title';

    const titleEl = document.createElement('span');
    titleEl.className = 'mbo-comment-title-text';
    if (typeof titleEl.setAttribute === 'function') {
      titleEl.setAttribute('data-mbo-comment-title', '');
    }
    titleEl.textContent = '💬 ความคิดเห็นใน Kintone / Kintone Comments (Native Mirror)';

    const noticeEl = document.createElement('div');
    noticeEl.className = 'mbo-comment-subtitle mbo-comment-subnotice';
    noticeEl.textContent = 'แสดงความคิดเห็นล่าสุดจากระบบ Kintone (อ่านอย่างเดียว / Read-only mirror)';

    titleBox.appendChild(titleEl);
    titleBox.appendChild(noticeEl);
    header.appendChild(titleBox);

    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.className = 'mbo-btn-refresh-comments mbo-comment-refresh-btn';
    if (typeof refreshBtn.setAttribute === 'function') {
      refreshBtn.setAttribute('data-mbo-refresh-comments', '');
      refreshBtn.setAttribute('data-mbo-comment-refresh', '');
    }
    refreshBtn.textContent = '🔄 รีเฟรชความคิดเห็น / Refresh Comments';
    header.appendChild(refreshBtn);

    panel.appendChild(header);

    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'mbo-comment-body-container mbo-comment-body';
    if (typeof bodyContainer.setAttribute === 'function') {
      bodyContainer.setAttribute('data-mbo-comment-body', '');
    }

    panel.appendChild(bodyContainer);

    const refreshBtnEl = header.querySelector('[data-mbo-refresh-comments]') || header.querySelector('[data-mbo-comment-refresh]');

    const loadComments = async () => {
      bodyContainer.innerHTML = '';
      const loadingEl = document.createElement('div');
      loadingEl.className = 'mbo-comment-loading';
      loadingEl.textContent = 'กำลังโหลดความคิดเห็น... / Loading comments...';
      bodyContainer.appendChild(loadingEl);

      try {
        const comments = await this.fetchRecordComments(appId, recordId);
        bodyContainer.innerHTML = '';

        const tableContainer = document.createElement('div');
        tableContainer.className = 'mbo-comment-table-container';

        const table = document.createElement('table');
        table.className = 'mbo-comment-table mbo-timeline-table';
        if (typeof table.setAttribute === 'function') {
          table.setAttribute('data-mbo-comment-table', '');
        }

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        const thNum = document.createElement('th');
        thNum.className = 'mbo-comment-num-col';
        thNum.textContent = '#';

        const thAuthor = document.createElement('th');
        thAuthor.className = 'mbo-comment-author-col';
        thAuthor.textContent = 'ผู้แสดงความคิดเห็น / Author';

        const thDate = document.createElement('th');
        thDate.className = 'mbo-comment-date-col';
        thDate.textContent = 'วัน-เวลา / Date & Time';

        const thComment = document.createElement('th');
        thComment.className = 'mbo-comment-text-col';
        thComment.textContent = 'ความคิดเห็น / Comment';

        trHead.appendChild(thNum);
        trHead.appendChild(thAuthor);
        trHead.appendChild(thDate);
        trHead.appendChild(thComment);
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        if (typeof tbody.setAttribute === 'function') {
          tbody.setAttribute('data-mbo-comment-thread', '');
        }

        if (!comments || comments.length === 0) {
          const emptyRow = document.createElement('tr');
          const emptyTd = document.createElement('td');
          emptyTd.colSpan = 4;
          emptyTd.className = 'mbo-comment-empty-cell mbo-comment-empty-notice';
          if (typeof emptyTd.setAttribute === 'function') {
            emptyTd.setAttribute('data-mbo-comment-empty', '');
          }
          emptyTd.textContent = 'ยังไม่มีความคิดเห็นสำหรับบันทึกนี้ / No comments for this record yet.';
          emptyRow.appendChild(emptyTd);
          tbody.appendChild(emptyRow);
        } else {
          comments.forEach((comment, idx) => {
            const row = document.createElement('tr');
            row.className = 'mbo-comment-item';
            if (typeof row.setAttribute === 'function') {
              row.setAttribute('data-mbo-comment-item', '');
              row.setAttribute('data-mbo-comment-row', '');
            }

            // 1. Index # cell
            const tdNum = document.createElement('td');
            tdNum.className = 'mbo-comment-num-col';
            tdNum.textContent = String(idx + 1);

            // 2. Author cell
            const tdAuthor = document.createElement('td');
            tdAuthor.className = 'mbo-comment-author-col';
            const authorName = document.createElement('span');
            authorName.className = 'mbo-comment-author';
            if (typeof authorName.setAttribute === 'function') {
              authorName.setAttribute('data-mbo-comment-author', '');
            }
            authorName.textContent = comment.creator?.name || comment.creator?.code || 'Unknown User';
            tdAuthor.appendChild(authorName);

            // 3. Date & Time cell
            const tdDate = document.createElement('td');
            tdDate.className = 'mbo-comment-date-col';
            const timeStamp = document.createElement('span');
            timeStamp.className = 'mbo-comment-time';
            if (typeof timeStamp.setAttribute === 'function') {
              timeStamp.setAttribute('data-mbo-comment-time', '');
            }
            timeStamp.textContent = comment.createdAt ? new Date(comment.createdAt).toLocaleString('th-TH') : '';
            tdDate.appendChild(timeStamp);

            // 4. Comment text cell
            const tdComment = document.createElement('td');
            tdComment.className = 'mbo-comment-text-col';
            const textContent = document.createElement('div');
            textContent.className = 'mbo-comment-text';
            if (typeof textContent.setAttribute === 'function') {
              textContent.setAttribute('data-mbo-comment-text', '');
            }
            textContent.textContent = comment.text || '';
            tdComment.appendChild(textContent);

            row.appendChild(tdNum);
            row.appendChild(tdAuthor);
            row.appendChild(tdDate);
            row.appendChild(tdComment);
            tbody.appendChild(row);
          });
        }

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        bodyContainer.appendChild(tableContainer);
      } catch (err) {
        bodyContainer.innerHTML = '';
        const errEl = document.createElement('div');
        errEl.className = 'mbo-comment-error-notice';
        if (typeof errEl.setAttribute === 'function') {
          errEl.setAttribute('data-mbo-comment-error', '');
        }
        errEl.textContent = `ไม่สามารถโหลดความคิดเห็นได้ / Failed to load comments: ${err.message}`;
        bodyContainer.appendChild(errEl);
      }
    };

    if (refreshBtnEl && typeof refreshBtnEl.addEventListener === 'function') {
      refreshBtnEl.addEventListener('click', () => {
        loadComments();
      });
    }

    loadComments();
    return panel;
  }
}
