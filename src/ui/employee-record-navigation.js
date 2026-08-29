/**
 * Employee Record Navigation Component
 * Canonical owner for "← กลับหน้า My MBO / Back to My MBO" top navigation bar.
 * Rendered on existing Detail & Edit screens; strictly absent on Create screen.
 */

export class EmployeeRecordNavigation {
  constructor(options = {}) {
    this.appId = options.appId || 794;
    this.onNavigateHome = options.onNavigateHome;
  }

  renderBackToMyMboBar(options = {}) {
    const isCreate = options.isCreate ?? false;
    if (isCreate) {
      return null;
    }

    const appId = options.appId || this.appId || 794;
    const bar = document.createElement('div');
    bar.className = 'mbo-back-nav-bar mbo-back-nav-container';
    if (typeof bar.setAttribute === 'function') {
      bar.setAttribute('data-mbo-back-nav-bar', '');
    }

    const link = document.createElement('a');
    link.className = 'mbo-back-to-home-link mbo-btn-back-home';
    if (typeof link.setAttribute === 'function') {
      link.setAttribute('data-mbo-back-link', '');
      link.setAttribute('data-mbo-btn-back', '');
    }
    link.href = `/k/${appId}/`;
    link.textContent = '← กลับหน้า My MBO / Back to My MBO';

    const navigateHandler = options.onNavigateHome || this.onNavigateHome;
    if (typeof link.addEventListener === 'function' && typeof navigateHandler === 'function') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateHandler();
      });
    }

    bar.appendChild(link);
    return bar;
  }
}
