/* ============================================
   BiteBalance Main Bootstrapper
   ============================================ */

import { Router } from './router.js';
import { Navigation } from './components/Navigation.js';
import { Toast } from './components/Toast.js';
import { store } from './store.js';

// Setup Toast Notification container
Toast.init();

const appRoot = document.getElementById('app');

// Create layout template
appRoot.innerHTML = `
  <div id="page-mount"></div>
  <div id="navigation-mount"></div>
`;

const pageMount = document.getElementById('page-mount');
const navigationMount = document.getElementById('navigation-mount');

// Create bottom navigation bar
const nav = new Navigation((tab) => {
  // Navigation links are standard hrefs, router handles hash changes automatically.
});

// Mount navigation
navigationMount.appendChild(nav.render());

// Create and initialize SPA Router
const router = new Router(pageMount, (activeTab) => {
  if (activeTab) {
    navigationMount.classList.remove('hidden');
    nav.setActive(activeTab);
  } else {
    // Hide navigation bar on screens like Onboarding
    navigationMount.classList.add('hidden');
  }
});

// Boot the application
router.init();
