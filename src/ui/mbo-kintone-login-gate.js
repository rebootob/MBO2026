export class MboKintoneLoginGate {
  constructor(adapter) { this.adapter = adapter; this.principal = null; this.requiresPasswordChange = false; }
  async login(username, password) { const result = await this.adapter.login({ username, password }); if (result.status === 'AUTHENTICATED') this.principal = { employeeCode: result.employeeCode }; if (result.status === 'PASSWORD_CHANGE_REQUIRED') { this.principal = { employeeCode: result.employeeCode }; this.requiresPasswordChange = true; } return { status: result.status, employeeCode: result.employeeCode }; }
  async changePassword(newPassword) { if (!this.principal) throw new Error('UNAUTHENTICATED'); const result = await this.adapter.changePassword({ employeeCode: this.principal.employeeCode, newPassword }); this.requiresPasswordChange = false; return { status: result.status, employeeCode: result.employeeCode }; }
  getEmployeeCode() { return this.principal && !this.requiresPasswordChange ? this.principal.employeeCode : null; }
  logout() { this.principal = null; this.requiresPasswordChange = false; }
  assertEmployeeCode(code) { return this.getEmployeeCode() !== null && this.getEmployeeCode() === code; }
  async requireLogin(host = document.body) {
    if (this.getEmployeeCode()) return this.getEmployeeCode();
    return await new Promise(resolve => {
      const overlay = document.createElement('div'); overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;display:grid;place-items:center';
      overlay.innerHTML = '<form style="min-width:300px"><h2>MBO Login</h2><label>Employee Code<input name="username" required autocomplete="username"></label><label>Password<input name="password" type="password" required autocomplete="current-password"></label><p data-error></p><button>Login</button></form>';
      overlay.querySelector('form').addEventListener('submit', async e => { e.preventDefault(); const f = new FormData(e.currentTarget); const r = await this.login(f.get('username'), f.get('password')); if (r.status === 'AUTHENTICATED') { overlay.remove(); resolve(r.employeeCode); } else { overlay.querySelector('[data-error]').textContent = r.status; } }); host.appendChild(overlay);
    });
  }
}
