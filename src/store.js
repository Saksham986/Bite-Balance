/* ============================================
   BiteBalance Reactive Application Store
   ============================================ */

const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const DEFAULT_PROFILE = {
  name: 'Saksham',
  apiKey: DEFAULT_API_KEY,
  createdAt: new Date().toISOString().split('T')[0],
  preferences: {
    theme: 'light',
    reminders: false,
    reminderTime: '20:00'
  }
};

class Store extends EventTarget {
  constructor() {
    super();
    this.profile = this.load('bitebalance_profile', DEFAULT_PROFILE);
    this.days = this.load('bitebalance_days', {});
    this.customFoods = this.load('bitebalance_custom_foods', []);
    this.onboarded = this.load('bitebalance_onboarded', false);
    
    // Set theme on startup
    this.applyTheme(this.profile.preferences.theme);
  }

  // Load from localStorage
  load(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error loading state from key: ${key}`, e);
      return defaultValue;
    }
  }

  // Save to localStorage
  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving state to key: ${key}`, e);
    }
  }

  // Notify listeners that state changed
  notify(eventName) {
    this.dispatchEvent(new CustomEvent(eventName));
  }

  // Onboarding Status
  setOnboarded(status) {
    this.onboarded = status;
    this.save('bitebalance_onboarded', status);
    this.notify('onboarding_change');
  }

  // Profile Settings
  updateProfile(updates) {
    this.profile = { ...this.profile, ...updates };
    this.save('bitebalance_profile', this.profile);
    
    if (updates.preferences && updates.preferences.theme) {
      this.applyTheme(updates.preferences.theme);
    }
    
    this.notify('profile_change');
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      // System choice
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }

  // Daily logs management
  getDay(dateStr) {
    if (!this.days[dateStr]) {
      this.days[dateStr] = {
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
          custom: []
        },
        score: null
      };
    }
    return this.days[dateStr];
  }

  saveDay(dateStr, dayData) {
    this.days[dateStr] = dayData;
    this.save('bitebalance_days', this.days);
    this.notify('days_change');
  }

  addFood(dateStr, mealType, foodItem) {
    const day = this.getDay(dateStr);
    
    // Add unique ID
    foodItem.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    foodItem.addedAt = new Date().toISOString();

    day.meals[mealType].push(foodItem);
    
    // Invalidate old score when day changes
    day.score = null;
    
    this.saveDay(dateStr, day);
    this.addCustomFood(foodItem.name);
  }

  removeFood(dateStr, mealType, foodId) {
    const day = this.getDay(dateStr);
    day.meals[mealType] = day.meals[mealType].filter(item => item.id !== foodId);
    
    // Invalidate old score when day changes
    day.score = null;

    this.saveDay(dateStr, day);
  }

  updateFood(dateStr, mealType, foodId, updatedItem) {
    const day = this.getDay(dateStr);
    day.meals[mealType] = day.meals[mealType].map(item => {
      if (item.id === foodId) {
        return { ...item, ...updatedItem };
      }
      return item;
    });

    day.score = null;
    this.saveDay(dateStr, day);
  }

  setDayScore(dateStr, scoreData) {
    const day = this.getDay(dateStr);
    day.score = scoreData;
    this.saveDay(dateStr, day);
  }

  // Tracking custom foods entered for smart suggestion
  addCustomFood(name) {
    const normalized = name.trim();
    if (!normalized) return;
    
    if (!this.customFoods.includes(normalized)) {
      this.customFoods.push(normalized);
      // Keep only last 50 entries
      if (this.customFoods.length > 50) {
        this.customFoods.shift();
      }
      this.save('bitebalance_custom_foods', this.customFoods);
      this.notify('custom_foods_change');
    }
  }

  // Get current streak
  getStreak() {
    const dateStrings = Object.keys(this.days)
      .filter(date => {
        // Must have at least 1 food logged to count
        const day = this.days[date];
        return day && Object.values(day.meals).some(m => m.length > 0);
      })
      .sort((a, b) => new Date(b) - new Date(a)); // Descending order (newest first)

    if (dateStrings.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const newestDate = new Date(dateStrings[0]);
    newestDate.setHours(0,0,0,0);

    // If newest logged date is older than yesterday, streak is broken
    if (newestDate < yesterday && newestDate.getTime() !== today.getTime()) {
      return 0;
    }

    let checkDate = new Date(newestDate);
    for (let i = 0; i < dateStrings.length; i++) {
      const logDate = new Date(dateStrings[i]);
      logDate.setHours(0,0,0,0);

      // Check if dates are continuous
      if (checkDate.getTime() === logDate.getTime()) {
        streak++;
        // Go back 1 day for next comparison
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  // Export full backup
  exportBackup() {
    const data = {
      profile: this.profile,
      days: this.days,
      customFoods: this.customFoods,
      onboarded: this.onboarded
    };
    return JSON.stringify(data, null, 2);
  }

  // Import backup
  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.updateProfile(data.profile);
      if (data.days) {
        this.days = data.days;
        this.save('bitebalance_days', this.days);
      }
      if (data.customFoods) {
        this.customFoods = data.customFoods;
        this.save('bitebalance_custom_foods', this.customFoods);
      }
      if (data.onboarded !== undefined) {
        this.setOnboarded(data.onboarded);
      }
      this.notify('days_change');
      this.notify('profile_change');
      return true;
    } catch (e) {
      console.error("Backup import failed", e);
      return false;
    }
  }

  // Reset entire database
  clearAllData() {
    localStorage.clear();
    this.profile = DEFAULT_PROFILE;
    this.days = {};
    this.customFoods = [];
    this.onboarded = false;
    this.applyTheme('light');
    
    this.notify('days_change');
    this.notify('profile_change');
    this.notify('onboarding_change');
  }
}

export const store = new Store();
