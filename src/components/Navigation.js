/* ============================================
   BiteBalance Bottom Navigation Component
   ============================================ */

export class Navigation {
  constructor(onTabChange) {
    this.onTabChange = onTabChange;
    this.activeTab = 'dashboard';
  }

  render() {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.innerHTML = `
      <a href="#/" class="nav-item ${this.activeTab === 'dashboard' ? 'nav-item-active' : ''}" data-tab="dashboard">
        <span class="nav-icon">📊</span>
        <span>Today</span>
      </a>
      <a href="#/history" class="nav-item ${this.activeTab === 'history' ? 'nav-item-active' : ''}" data-tab="history">
        <span class="nav-icon">📅</span>
        <span>History</span>
      </a>
      <div class="nav-fab-container">
        <a href="#/log" class="nav-fab" aria-label="Log Meal">
          <span>+</span>
        </a>
      </div>
      <a href="#/analytics" class="nav-item ${this.activeTab === 'analytics' ? 'nav-item-active' : ''}" data-tab="analytics">
        <span class="nav-icon">📈</span>
        <span>Analytics</span>
      </a>
      <a href="#/settings" class="nav-item ${this.activeTab === 'settings' ? 'nav-item-active' : ''}" data-tab="settings">
        <span class="nav-icon">⚙️</span>
        <span>Settings</span>
      </a>
    `;

    // Add event delegation
    nav.querySelectorAll('.nav-item, .nav-fab').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const tab = elem.getAttribute('data-tab');
        if (tab) {
          this.activeTab = tab;
          this.updateActiveState(nav);
          if (this.onTabChange) {
            this.onTabChange(tab);
          }
        }
      });
    });

    return nav;
  }

  updateActiveState(navElement) {
    navElement.querySelectorAll('.nav-item').forEach(item => {
      const tab = item.getAttribute('data-tab');
      if (tab === this.activeTab) {
        item.classList.add('nav-item-active');
      } else {
        item.classList.remove('nav-item-active');
      }
    });
  }

  setActive(tabName) {
    this.activeTab = tabName;
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
      this.updateActiveState(nav);
    }
  }
}
