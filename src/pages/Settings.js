/* ============================================
   BiteBalance Settings Page View
   ============================================ */

import { store } from '../store.js';
import { Toast } from '../components/Toast.js';
import { downloadFile } from '../utils.js';

export class SettingsPage {
  render() {
    const container = document.createElement('div');
    container.className = 'page-container settings-page stagger-children';

    const profile = store.profile;

    container.innerHTML = `
      <header class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your personal preferences</p>
      </header>

      <section class="card settings-section">
        <h3 class="section-title">👤 Profile Info</h3>
        <div class="form-group">
          <label class="label">Name</label>
          <input type="text" id="setting-name" class="input" value="${profile.name}" />
        </div>
      </section>

      <section class="card settings-section">
        <h3 class="section-title">🔑 Gemini AI Key</h3>
        <p class="settings-desc">Enter your Google Gemini API key. This key is stored securely in your local browser only.</p>
        <div class="form-group">
          <input type="password" id="setting-api-key" class="input" value="${profile.apiKey || ''}" placeholder="AIzaSy..." />
        </div>
        <button class="btn btn-secondary btn-test-key" id="test-key-btn">Test Connection</button>
      </section>

      <section class="card settings-section">
        <h3 class="section-title">🎨 Appearance</h3>
        <div class="form-group">
          <label class="label">Theme</label>
          <select id="setting-theme" class="select">
            <option value="light" ${profile.preferences.theme === 'light' ? 'selected' : ''}>Light Mode</option>
            <option value="dark" ${profile.preferences.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
            <option value="system" ${profile.preferences.theme === 'system' ? 'selected' : ''}>System Default</option>
          </select>
        </div>
      </section>

      <section class="card settings-section">
        <h3 class="section-title">🔔 Daily Reminders</h3>
        <div class="form-group flex-row">
          <label class="label" for="setting-reminders">Enable notifications</label>
          <input type="checkbox" id="setting-reminders" ${profile.preferences.reminders ? 'checked' : ''} />
        </div>
        <div class="form-group" id="reminder-time-group" style="${profile.preferences.reminders ? '' : 'display: none;'}">
          <label class="label">Reminder Time</label>
          <input type="time" id="setting-reminder-time" class="input" value="${profile.preferences.reminderTime}" />
        </div>
      </section>

      <section class="card settings-section">
        <h3 class="section-title">💾 Backup & Reset</h3>
        <p class="settings-desc">Export your logged food items or import from a backup file.</p>
        <div class="settings-actions">
          <button class="btn btn-secondary" id="export-backup-btn">📤 Export Data</button>
          <button class="btn btn-secondary" id="import-backup-btn">📥 Import Data</button>
          <input type="file" id="import-file-input" style="display: none;" accept=".json" />
        </div>
        <hr class="divider" />
        <button class="btn btn-danger" id="clear-all-btn">⚠️ Reset All App Data</button>
      </section>

      <div class="settings-footer">
        <p>BiteBalance v1.0.0 — Your premium food companion</p>
      </div>
    `;

    this.bindEvents(container);

    return container;
  }

  bindEvents(container) {
    const saveSettings = () => {
      const name = container.querySelector('#setting-name').value.trim();
      const apiKey = container.querySelector('#setting-api-key').value.trim();
      const theme = container.querySelector('#setting-theme').value;
      const reminders = container.querySelector('#setting-reminders').checked;
      const reminderTime = container.querySelector('#setting-reminder-time').value;

      store.updateProfile({
        name,
        apiKey,
        preferences: {
          theme,
          reminders,
          reminderTime
        }
      });
      Toast.success('Settings saved successfully!');
    };

    // Auto save on inputs change
    const inputs = container.querySelectorAll('.input, .select, #setting-reminders');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.id === 'setting-reminders') {
          const timeGroup = container.querySelector('#reminder-time-group');
          timeGroup.style.display = input.checked ? 'block' : 'none';
        }
        saveSettings();
      });
    });

    // Test API key
    container.querySelector('#test-key-btn').addEventListener('click', async () => {
      const apiKey = container.querySelector('#setting-api-key').value.trim();
      if (!apiKey) {
        Toast.danger('Please enter an API Key first.');
        return;
      }
      
      const btn = container.querySelector('#test-key-btn');
      btn.disabled = true;
      btn.innerText = 'Testing...';

      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'say OK' }] }] })
        });
        
        if (res.ok) {
          Toast.success('API Key is valid and active!');
        } else {
          Toast.danger('API Key invalid. Check key permissions.');
        }
      } catch (e) {
        Toast.danger('Network error testing API key.');
      } finally {
        btn.disabled = false;
        btn.innerText = 'Test Connection';
      }
    });

    // Export Backup
    container.querySelector('#export-backup-btn').addEventListener('click', () => {
      const backup = store.exportBackup();
      downloadFile(backup, 'bitebalance_backup.json', 'application/json');
      Toast.success('Backup exported!');
    });

    // Import Backup
    const fileInput = container.querySelector('#import-file-input');
    container.querySelector('#import-backup-btn').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const success = store.importBackup(event.target.result);
        if (success) {
          Toast.success('Backup imported successfully! Page reloading.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          Toast.danger('Failed to parse backup file.');
        }
      };
      reader.readAsText(file);
    });

    // Clear all data
    container.querySelector('#clear-all-btn').addEventListener('click', () => {
      if (confirm('Are you absolutely sure you want to delete all logs, scores, and settings? This cannot be undone.')) {
        store.clearAllData();
        Toast.warning('App database cleared completely.');
        setTimeout(() => {
          window.location.hash = '#/onboarding';
        }, 1000);
      }
    });
  }
}
