/**
 * Employee Native Comment Mirror Component
 * Canonical owner for read-only Kintone comment mirror & Refresh.
 * Rendered on existing Detail & Edit screens; strictly 0 comment GET on Create.
 */

export class EmployeeCommentMirror {
  constructor(options = {}) {
    this.kintoneApiWrapper = options.kintoneApiWrapper;
    this.getAppId = options.getAppId || (() => 794);
  }

  async fetchRecordComments(appId, recordId) {
    if (!appId || !recordId) return [];

    let allComments = [];
    let offset = 0;
    const limit = 50;

    for (let page = 0; page < 100; page++) {
      let resp = null;
      if (this.kintoneApiWrapper && typeof this.kintoneApiWrapper.getComments === 'function') {
        resp = await this.kintoneApiWrapper.getComments(appId, recordId, { limit, offset, order: 'asc' });
      } else if (typeof kintone !== 'undefined' && kintone.api && typeof kintone.api.url === 'function') {
        const url = kintone.api.url('/k/v1/record/comments.json', true);
        resp = await kintone.api(url, 'GET', { app: appId, record: recordId, limit, offset, order: 'asc' });
      } else {
        break;
      }

      const comments = Array.isArray(resp?.comments) ? resp.comments : [];
      if (comments.length === 0) {
        break;
      }

      allComments = allComments.concat(comments);

      // Kintone Get Record Comments REST API semantics for order='asc':
      // - comments.length === 0 => stop safely (handled above)
      // - resp.newer === false => newest comment reached, stop complete
      // - non-empty page + resp.newer === true => MUST continue, even if comments.length < limit
      // - if resp.newer is omitted, fallback to comments.length < limit check
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
    const appId = options.appId || (typeof this.getAppId === 'function' ? this.getAppId() : 794);
    const recordId = options.recordId;

    const panel = document.createElement('div');
    panel.className = 'mbo-native-comment-mirror mbo-comment-panel';
    if (typeof panel.setAttribute === 'function') {
      panel.setAttribute('data-mbo-comment-panel', '');
      panel.setAttribute('data-mbo-comment-section', '');
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
    const titleString = '💬 ความคิดเห็นใน Kintone / Kintone Comments (Native Mirror)';
    titleEl.textContent = titleString;
    titleEl.innerHTML = titleString;

    const noticeEl = document.createElement('div');
    noticeEl.className = 'mbo-comment-subtitle mbo-comment-subnotice';
    const noticeString = 'แสดงความคิดเห็นล่าสุดจากระบบ Kintone (อ่านอย่างเดียว / Read-only mirror)';
    noticeEl.textContent = noticeString;
    noticeEl.innerHTML = noticeString;

    titleBox.appendChild(titleEl);
    titleBox.appendChild(noticeEl);
    header.appendChild(titleBox);

    if (!isCreate) {
      const refreshBtn = document.createElement('button');
      refreshBtn.type = 'button';
      refreshBtn.className = 'mbo-btn-refresh-comments mbo-comment-refresh-btn';
      if (typeof refreshBtn.setAttribute === 'function') {
        refreshBtn.setAttribute('data-mbo-refresh-comments', '');
        refreshBtn.setAttribute('data-mbo-comment-refresh', '');
      }
      const refreshString = '🔄 รีเฟรชความคิดเห็น / Refresh Comments';
      refreshBtn.textContent = refreshString;
      refreshBtn.innerHTML = refreshString;
      header.appendChild(refreshBtn);
    }

    panel.appendChild(header);

    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'mbo-comment-body-container mbo-comment-body';
    if (typeof bodyContainer.setAttribute === 'function') {
      bodyContainer.setAttribute('data-mbo-comment-body', '');
    }

    panel.appendChild(bodyContainer);

    if (isCreate || !recordId) {
      const createMsg = document.createElement('div');
      createMsg.className = 'mbo-comment-empty-notice';
      if (typeof createMsg.setAttribute === 'function') {
        createMsg.setAttribute('data-mbo-comment-create-notice', '');
        createMsg.setAttribute('data-mbo-comment-empty', '');
      }
      const createMsgString = 'ยังไม่มีความคิดเห็น (คำขอใหม่ที่ยังไม่ได้บันทึก) / No comments yet (unpersisted new record).';
      createMsg.textContent = createMsgString;
      createMsg.innerHTML = createMsgString;
      bodyContainer.appendChild(createMsg);
      return panel;
    }

    const refreshBtnEl = header.querySelector('[data-mbo-refresh-comments]') || header.querySelector('[data-mbo-comment-refresh]');

    const loadComments = async () => {
      bodyContainer.innerHTML = '';
      const loadingEl = document.createElement('div');
      loadingEl.className = 'mbo-comment-loading';
      const loadingString = 'กำลังโหลดความคิดเห็น... / Loading comments...';
      loadingEl.textContent = loadingString;
      loadingEl.innerHTML = loadingString;
      bodyContainer.appendChild(loadingEl);

      try {
        const comments = await this.fetchRecordComments(appId, recordId);
        bodyContainer.innerHTML = '';

        if (!comments || comments.length === 0) {
          const emptyNotice = document.createElement('div');
          emptyNotice.className = 'mbo-comment-empty-notice';
          if (typeof emptyNotice.setAttribute === 'function') {
            emptyNotice.setAttribute('data-mbo-comment-empty', '');
          }
          const emptyString = 'ยังไม่มีความคิดเห็นสำหรับบันทึกนี้ / No comments for this record yet.\n(สามารถเพิ่มความคิดเห็นได้ที่แถบด้านขวา / Add comments via native right panel)';
          emptyNotice.textContent = emptyString;
          emptyNotice.innerHTML = emptyString;
          bodyContainer.appendChild(emptyNotice);
          return;
        }

        const threadList = document.createElement('div');
        threadList.className = 'mbo-comment-thread-list';
        if (typeof threadList.setAttribute === 'function') {
          threadList.setAttribute('data-mbo-comment-thread', '');
        }

        comments.forEach(comment => {
          const item = document.createElement('div');
          item.className = 'mbo-comment-item';
          if (typeof item.setAttribute === 'function') {
            item.setAttribute('data-mbo-comment-item', '');
          }

          const metaRow = document.createElement('div');
          metaRow.className = 'mbo-comment-meta';

          const authorName = document.createElement('span');
          authorName.className = 'mbo-comment-author';
          if (typeof authorName.setAttribute === 'function') {
            authorName.setAttribute('data-mbo-comment-author', '');
          }
          authorName.textContent = comment.creator?.name || comment.creator?.code || 'Unknown User';

          const timeStamp = document.createElement('span');
          timeStamp.className = 'mbo-comment-time';
          if (typeof timeStamp.setAttribute === 'function') {
            timeStamp.setAttribute('data-mbo-comment-time', '');
          }
          timeStamp.textContent = comment.createdAt ? new Date(comment.createdAt).toLocaleString('th-TH') : '';

          metaRow.appendChild(authorName);
          metaRow.appendChild(timeStamp);

          const textContent = document.createElement('div');
          textContent.className = 'mbo-comment-text';
          if (typeof textContent.setAttribute === 'function') {
            textContent.setAttribute('data-mbo-comment-text', '');
          }
          textContent.textContent = comment.text || '';

          item.appendChild(metaRow);
          item.appendChild(textContent);
          threadList.appendChild(item);
        });

        bodyContainer.appendChild(threadList);
      } catch (err) {
        bodyContainer.innerHTML = '';
        const errEl = document.createElement('div');
        errEl.className = 'mbo-comment-error-notice';
        if (typeof errEl.setAttribute === 'function') {
          errEl.setAttribute('data-mbo-comment-error', '');
        }
        const errString = `ไม่สามารถโหลดความคิดเห็นได้ / Failed to load comments: ${err.message}`;
        errEl.textContent = errString;
        errEl.innerHTML = errString;
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
