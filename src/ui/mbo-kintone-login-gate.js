export class MboKintoneLoginGate {
  constructor(adapter) { this.adapter = adapter; this.principal = null; this.requiresPasswordChange = false; }
  async login(username, password) { const result = await this.adapter.login({ username, password }); if (result.status === 'AUTHENTICATED') this.principal = { employeeCode: result.employeeCode }; if (result.status === 'PASSWORD_CHANGE_REQUIRED') { this.principal = { employeeCode: result.employeeCode }; this.requiresPasswordChange = true; } return { status: result.status, employeeCode: result.employeeCode }; }
  async changePassword(newPassword) { if (!this.principal) throw new Error('UNAUTHENTICATED'); const result = await this.adapter.changePassword({ employeeCode: this.principal.employeeCode, newPassword }); this.requiresPasswordChange = false; return { status: result.status, employeeCode: result.employeeCode }; }
  getEmployeeCode() { return this.principal && !this.requiresPasswordChange ? this.principal.employeeCode : null; }
  logout() { this.principal = null; this.requiresPasswordChange = false; }
  assertEmployeeCode(code) { return this.getEmployeeCode() !== null && this.getEmployeeCode() === code; }
}
