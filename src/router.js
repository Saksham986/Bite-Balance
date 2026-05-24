/* ============================================
   BiteBalance Hash Router (SPA)
   ============================================ */

import { store } from './store.js';
import { DashboardPage } from './pages/Dashboard.js';
import { MealLogPage } from './pages/MealLog.js';
import { DailySummaryPage } from './pages/DailySummary.js';
import { AnalyticsPage } from './pages/Analytics.js';
import { HistoryPage } from './pages/History.js';
import { SettingsPage } from './pages/Settings.js';
import { OnboardingPage } from './pages/Onboarding.js';

export class Router {
  constructor(appMountPoint, onNavigate) {
    this.mountPoint = appMountPoint;
    this.onNavigate = onNavigate;
    
    // Bind hash change listener
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  handleRoute() {
    const rawHash = window.location.hash || '#/';
    
    // Check onboarding
    if (!store.onboarded && rawHash !== '#/onboarding') {
      window.location.hash = '#/onboarding';
      return;
    }

    // Split route and query params
    const [pathPart, queryPart] = rawHash.split('?');
    const path = pathPart === '#/' ? '#/' : (pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart);

    let pageInstance = null;
    let activeTab = 'dashboard';

    // Simple routing table matching
    if (path === '#/onboarding') {
      pageInstance = new OnboardingPage();
      activeTab = null;
    } else if (path === '#/') {
      pageInstance = new DashboardPage();
      activeTab = 'dashboard';
    } else if (path === '#/log') {
      pageInstance = new MealLogPage();
      activeTab = 'log';
    } else if (path.startsWith('#/summary/')) {
      const dateStr = path.split('/')[2]; // #/summary/YYYY-MM-DD
      pageInstance = new DailySummaryPage(dateStr);
      activeTab = 'dashboard';
    } else if (path === '#/analytics') {
      pageInstance = new AnalyticsPage();
      activeTab = 'analytics';
    } else if (path === '#/history') {
      pageInstance = new HistoryPage();
      activeTab = 'history';
    } else if (path === '#/settings') {
      pageInstance = new SettingsPage();
      activeTab = 'settings';
    } else {
      // Fallback
      window.location.hash = '#/';
      return;
    }

    if (pageInstance) {
      // Clear mount point and render new view
      this.mountPoint.innerHTML = '';
      
      const element = pageInstance.render();
      this.mountPoint.appendChild(element);

      if (this.onNavigate) {
        this.onNavigate(activeTab);
      }
    }
  }
}
