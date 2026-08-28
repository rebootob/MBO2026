/**
 * MboKintoneLoginGate — Blocking MBO Login Gate for App794 Kintone Customization (D1)
 *
 * Security boundary:
 * - Authenticated principal stored in module-level page memory.
 * - Integrates with MboSessionManager for short-lived session continuity.
 * - Logout revokes session token and clears page-memory context followed by reload.
 * - Force Password Change state must be resolved before Employee Self data is authorized.
 * - Returns only authenticated Employee_Code; never credential/hash/token data.
 * - Requires dom injection point (host element); fails closed if null.
 */

const BASE_STYLE = 'font-family:sans-serif;box-sizing:border-box;';

function styled(el, css) {
  el.style.cssText = BASE_STYLE + css;
  return el;
}

function ce(tag) {
  return typeof document !== 'undefined' ? document.createElement(tag) : null;
}

export class MboKintoneLoginGate {
  /**
   * @param {import('./mbo-kintone-auth-adapter.js').MboKintoneAuthAdapter} adapter
   * @param {object} [options]
   * @param {import('./mbo-session-manager.js').MboSessionManager|null} [options.sessionManager=null]
   * @param {function} [options.onReload] - injectable for tests; defaults to location.reload
   */
  constructor(adapter, { sessionManager = null, onReload = null } = {}) {
    this.adapter = adapter;
    this.sessionManager = sessionManager;
    this._principal = null;       // { employeeCode: string } — page memory
    this._pendingForceChange = false;
    this._onReload = onReload || (() => {
      if (typeof location !== 'undefined') location.reload();
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
        // ignore errors during revocation
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
        // fail closed to overlay on restore failure
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
    const existing = host.querySelector('[data-mbo-auth-bar]');
    if (existing) existing.remove();

    const bar = ce('div');
    if (!bar) return;
    bar.setAttribute('data-mbo-auth-bar', '');
    styled(bar, 'display:flex;align-items:center;gap:12px;justify-content:flex-end;' +
      'padding:8px 16px;background:#f0f0f0;border-bottom:1px solid #ddd;font-size:13px;');

    const label = ce('span');
    label.textContent = `Logged in: ${employeeCode}`;
    styled(label, 'color:#444;flex:1;');

    const changePwBtn = ce('button');
    changePwBtn.textContent = 'Change Password';
    styled(changePwBtn, 'padding:4px 10px;cursor:pointer;border:1px solid #bbb;border-radius:4px;background:#fff;font-size:13px;');
    changePwBtn.addEventListener('click', () => {
      this._renderChangePasswordDialog(document.body, employeeCode);
    });

    const logoutBtn = ce('button');
    logoutBtn.textContent = 'Logout';
    styled(logoutBtn, 'padding:4px 10px;cursor:pointer;border:1px solid #bbb;border-radius:4px;background:#fff;font-size:13px;');
    logoutBtn.addEventListener('click', async () => {
      await this.logout();
      this._onReload();
    });

    bar.appendChild(label);
    bar.appendChild(changePwBtn);
    bar.appendChild(logoutBtn);
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
      return { status: 'CREDENTIAL_DENIED', reason: err.message || 'Login error' };
    }

    if (result.status === 'AUTHENTICATED') {
      if (this.sessionManager) {
        try {
          await this.sessionManager.issueSession(result.employeeCode);
        } catch {
          this._principal = null;
          this._pendingForceChange = false;
          return { status: 'SESSION_ISSUE_FAILED', reason: 'Failed to create session.' };
        }
      }
      this._principal = { employeeCode: result.employeeCode };
      this._pendingForceChange = false;
      return { status: 'AUTHENTICATED', employeeCode: result.employeeCode };
    }

    if (result.status === 'PASSWORD_CHANGE_REQUIRED') {
      this._principal = { employeeCode: result.employeeCode };
      this._pendingForceChange = true;
      return { status: 'PASSWORD_CHANGE_REQUIRED', employeeCode: result.employeeCode };
    }

    return result;
  }

  async _handleForceChangeAction({ newPassword, confirmPassword }) {
    if (!this._principal || !this._pendingForceChange) {
      return { status: 'CREDENTIAL_DENIED', reason: 'No pending force change state.' };
    }
    if (newPassword !== confirmPassword) {
      return { status: 'INVALID_PASSWORD', reason: 'Passwords do not match.' };
    }
    let result;
    try {
      result = await this.adapter.forceChangePassword({
        employeeCode: this._principal.employeeCode,
        newPassword
      });
    } catch (err) {
      return { status: 'CREDENTIAL_DENIED', reason: err.message || 'Error saving password.' };
    }

    if (result.status === 'PASSWORD_CHANGED') {
      if (this.sessionManager) {
        try {
          await this.sessionManager.issueSession(this._principal.employeeCode);
        } catch {
          return { status: 'SESSION_ISSUE_FAILED', reason: 'Failed to create session.' };
        }
      }
      this._pendingForceChange = false;
      return { status: 'PASSWORD_CHANGED', employeeCode: this._principal.employeeCode };
    }
    return result;
  }

  async _handleChangePasswordAction({ currentPassword, newPassword, confirmPassword }) {
    const code = this.getEmployeeCode();
    if (!code) {
      return { status: 'CREDENTIAL_DENIED', reason: 'Not authenticated.' };
    }
    if (newPassword !== confirmPassword) {
      return { status: 'INVALID_PASSWORD', reason: 'New passwords do not match.' };
    }

    let result;
    try {
      result = await this.adapter.changePassword({ employeeCode: code, currentPassword, newPassword });
    } catch (err) {
      return { status: 'CREDENTIAL_DENIED', reason: err.message || 'Error changing password.' };
    }

    if (result.status === 'PASSWORD_CHANGED') {
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
        return { status: 'SESSION_RENEWAL_FAILED', employeeCode: code };
      }

      return { status: 'PASSWORD_CHANGED', employeeCode: code };
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
    this._removeOverlay(host, 'data-mbo-login-overlay');

    const overlay = ce('div');
    overlay.setAttribute('data-mbo-login-overlay', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'MBO Login');
    styled(overlay, 'position:fixed;inset:0;z-index:2147483647;background:#fff;' +
      'display:flex;align-items:center;justify-content:center;');

    const card = ce('div');
    styled(card, 'min-width:320px;max-width:400px;padding:32px;' +
      'box-shadow:0 4px 24px rgba(0,0,0,.18);border-radius:8px;background:#fff;');

    const title = ce('h2');
    title.textContent = 'MBO Login';
    styled(title, 'margin:0 0 20px;font-size:20px;color:#222;');

    const form = ce('form');
    form.setAttribute('data-mbo-login-form', '');
    form.setAttribute('autocomplete', 'on');

    form.appendChild(this._labeledInput('Employee Code', 'username', 'text', 'username'));
    form.appendChild(this._labeledInput('Password', 'password', 'password', 'current-password'));

    const errorEl = ce('p');
    errorEl.setAttribute('data-mbo-error', '');
    errorEl.setAttribute('role', 'alert');
    styled(errorEl, 'color:#c00;min-height:20px;margin:0 0 12px;font-size:13px;');

    const submitBtn = ce('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Login';
    styled(submitBtn, 'width:100%;padding:10px;background:#0057b8;color:#fff;' +
      'border:none;border-radius:4px;font-size:15px;cursor:pointer;');

    form.appendChild(errorEl);
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in…';

      const username = form.querySelector('[name="username"]')?.value || '';
      const password = form.querySelector('[name="password"]')?.value || '';

      const actionRes = await this._handleLoginAction({ username, password });

      if (actionRes.status === 'AUTHENTICATED') {
        overlay.remove();
        resolve(actionRes.employeeCode);
      } else if (actionRes.status === 'PASSWORD_CHANGE_REQUIRED') {
        card.innerHTML = '';
        this._renderForceChangeCard(card, overlay, resolve);
      } else if (actionRes.status === 'INVALID_CREDENTIALS') {
        errorEl.textContent = 'Invalid Employee Code or password.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      } else if (actionRes.status === 'SESSION_ISSUE_FAILED') {
        errorEl.textContent = 'Failed to create session. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      } else {
        errorEl.textContent = 'Account is locked or disabled. Please contact HR.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
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
    const title = ce('h2');
    title.textContent = 'Password Change Required';
    styled(title, 'margin:0 0 8px;font-size:20px;color:#222;');

    const note = ce('p');
    note.textContent = 'You must set a new password before continuing.';
    styled(note, 'margin:0 0 20px;font-size:13px;color:#666;');

    const form = ce('form');
    form.setAttribute('data-mbo-force-change-form', '');

    form.appendChild(this._labeledInput('New Password', 'newPassword', 'password', 'new-password'));
    form.appendChild(this._labeledInput('Confirm New Password', 'confirmPassword', 'password', 'new-password'));

    const errorEl = ce('p');
    errorEl.setAttribute('data-mbo-error', '');
    errorEl.setAttribute('role', 'alert');
    styled(errorEl, 'color:#c00;min-height:20px;margin:0 0 12px;font-size:13px;');

    const submitBtn = ce('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Set New Password';
    styled(submitBtn, 'width:100%;padding:10px;background:#0057b8;color:#fff;' +
      'border:none;border-radius:4px;font-size:15px;cursor:pointer;');

    form.appendChild(errorEl);
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      const newPassword = form.querySelector('[name="newPassword"]')?.value || '';
      const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value || '';

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';

      const actionRes = await this._handleForceChangeAction({ newPassword, confirmPassword });

      if (actionRes.status === 'PASSWORD_CHANGED') {
        overlay.remove();
        resolve(actionRes.employeeCode);
      } else {
        errorEl.textContent = actionRes.reason || 'Could not change password.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Set New Password';
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
    this._removeOverlay(host, 'data-mbo-change-pw-overlay');

    const overlay = ce('div');
    overlay.setAttribute('data-mbo-change-pw-overlay', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Change Password');
    styled(overlay, 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);' +
      'display:flex;align-items:center;justify-content:center;');

    const card = ce('div');
    styled(card, 'min-width:320px;max-width:400px;padding:32px;background:#fff;' +
      'border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.2);');

    const title = ce('h3');
    title.textContent = 'Change Password';
    styled(title, 'margin:0 0 20px;font-size:18px;color:#222;');

    const form = ce('form');
    form.setAttribute('data-mbo-change-pw-form', '');

    form.appendChild(this._labeledInput('Current Password', 'currentPassword', 'password', 'current-password'));
    form.appendChild(this._labeledInput('New Password', 'newPassword', 'password', 'new-password'));
    form.appendChild(this._labeledInput('Confirm New Password', 'confirmPassword', 'password', 'new-password'));

    const errorEl = ce('p');
    errorEl.setAttribute('data-mbo-error', '');
    errorEl.setAttribute('role', 'alert');
    styled(errorEl, 'color:#c00;min-height:20px;margin:0 0 12px;font-size:13px;');

    const btnRow = ce('div');
    styled(btnRow, 'display:flex;gap:8px;');

    const submitBtn = ce('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Change Password';
    styled(submitBtn, 'flex:1;padding:10px;background:#0057b8;color:#fff;' +
      'border:none;border-radius:4px;font-size:14px;cursor:pointer;');

    const cancelBtn = ce('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    styled(cancelBtn, 'flex:1;padding:10px;background:#fff;color:#333;' +
      'border:1px solid #ccc;border-radius:4px;font-size:14px;cursor:pointer;');
    cancelBtn.addEventListener('click', () => overlay.remove());

    btnRow.appendChild(submitBtn);
    btnRow.appendChild(cancelBtn);

    form.appendChild(errorEl);
    form.appendChild(btnRow);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      const currentPassword = form.querySelector('[name="currentPassword"]')?.value || '';
      const newPassword = form.querySelector('[name="newPassword"]')?.value || '';
      const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value || '';

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';

      const actionRes = await this._handleChangePasswordAction({ currentPassword, newPassword, confirmPassword });

      if (actionRes.status === 'PASSWORD_CHANGED') {
        overlay.remove();
        const confirmEl = ce('div');
        if (confirmEl) {
          styled(confirmEl, 'position:fixed;top:20px;right:20px;z-index:2147483647;' +
            'background:#2a7;color:#fff;padding:12px 20px;border-radius:6px;font-size:14px;');
          confirmEl.textContent = 'Password changed successfully.';
          document.body.appendChild(confirmEl);
          setTimeout(() => confirmEl.remove(), 3000);
        }
      } else if (actionRes.status === 'SESSION_RENEWAL_FAILED') {
        overlay.remove();
      } else {
        errorEl.textContent = actionRes.reason || 'Could not change password.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
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
    const group = ce('div');
    styled(group, 'margin-bottom:16px;');

    const label = ce('label');
    label.textContent = labelText;
    styled(label, 'display:block;margin-bottom:4px;font-size:14px;color:#555;');

    const input = ce('input');
    input.name = name;
    input.type = type;
    input.required = true;
    input.setAttribute('autocomplete', autocomplete || 'off');
    styled(input, 'width:100%;padding:8px 12px;border:1px solid #ccc;' +
      'border-radius:4px;font-size:14px;');

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }
}
