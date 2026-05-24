/* ============================================
   BiteBalance Home Dashboard Page View
   ============================================ */

import { store } from '../store.js';
import { getRandomQuote, getScoreColor, getScoreLabel, getTodayDateString, formatDate } from '../utils.js';

export class DashboardPage {
  constructor() {
    this.dateStr = getTodayDateString();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container dashboard-page stagger-children';

    this.container = container;
    this.update();

    return container;
  }

  update() {
    const day = store.getDay(this.dateStr);
    const profile = store.profile;
    const streak = store.getStreak();
    
    // Total count of food logged today
    const itemsCount = Object.values(day.meals).reduce((sum, list) => sum + list.length, 0);

    const greeting = this.getTimeGreeting();
    const score = day.score?.overallScore;

    this.container.innerHTML = `
      <header class="page-header dashboard-header flex-row justify-between align-center">
        <div>
          <h1 class="page-title greeting-text">${greeting}, ${profile.name}</h1>
          <p class="page-subtitle">Let's keep your nutrition balanced today.</p>
        </div>
        <div class="streak-badge" title="Logging Streak">
          <span>🔥</span>
          <span class="streak-number">${streak}</span>
        </div>
      </header>

      <!-- Motivation Quote Panel -->
      <section class="card quote-card flex-row align-center">
        <span class="quote-icon">🌱</span>
        <blockquote class="quote-text">"${getRandomQuote()}"</blockquote>
      </section>

      <!-- Score Gauge Widget -->
      <section class="card today-score-card flex-row align-center justify-between">
        <div class="score-widget-left">
          <h3>Today's Health Rating</h3>
          ${score !== undefined ? `
            <p class="score-status-desc">Your meals are evaluated! Tap details below to review your nutritional tips.</p>
            <a href="#/summary/${this.dateStr}" class="btn btn-primary" style="margin-top: var(--space-3);">See Report Details</a>
          ` : itemsCount > 0 ? `
            <p class="score-status-desc">You have logged ${itemsCount} items. Generate your score now!</p>
            <a href="#/summary/${this.dateStr}" class="btn btn-primary" style="margin-top: var(--space-3);">Evaluate Day</a>
          ` : `
            <p class="score-status-desc">No meals recorded yet. Start logging breakfast or lunch to get evaluated.</p>
            <a href="#/log?date=${this.dateStr}" class="btn btn-primary" style="margin-top: var(--space-3);">Log First Meal</a>
          `}
        </div>

        <div class="score-widget-right">
          ${score !== undefined ? `
            <div class="health-gauge-container">
              <svg class="gauge-svg" style="width: 100px; height: 100px;">
                <circle class="gauge-bg" cx="50" cy="50" r="42" stroke-width="8"></circle>
                <circle class="gauge-fill" cx="50" cy="50" r="42" stroke-width="8" 
                        style="stroke: ${getScoreColor(score)}; stroke-dasharray: 263.8; stroke-dashoffset: ${263.8 - (score/100)*263.8};">
                </circle>
              </svg>
              <div class="gauge-content">
                <span class="gauge-score" style="font-size: var(--text-2xl); color: ${getScoreColor(score)}">${score}</span>
                <span class="gauge-label" style="font-size: 8px;">${getScoreLabel(score)}</span>
              </div>
            </div>
          ` : `
            <div class="score-placeholder">🥗</div>
          `}
        </div>
      </section>

      <!-- Meal Cards Log Overview -->
      <section class="meals-log-overview stagger-children">
        <h3 class="section-title">Today's Meals</h3>
        
        <div class="meal-log-cards-grid stagger-children">
          ${this.renderMealCard('Breakfast', 'breakfast', '🍳', day.meals.breakfast)}
          ${this.renderMealCard('Lunch', 'lunch', '🍛', day.meals.lunch)}
          ${this.renderMealCard('Dinner', 'dinner', '🍲', day.meals.dinner)}
          ${this.renderMealCard('Evening Snacks', 'snacks', '🍎', day.meals.snacks)}
          ${this.renderMealCard('Custom Slot', 'custom', '➕', day.meals.custom)}
        </div>
      </section>
    `;
  }

  getTimeGreeting() {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }

  renderMealCard(title, slotKey, emoji, items) {
    const hasItems = items && items.length > 0;
    
    return `
      <div class="card meal-overview-card card-hoverable flex-row justify-between align-center" onclick="window.location.hash='#/log?date=${this.dateStr}'">
        <div class="meal-card-left flex-row align-center">
          <span class="meal-emoji-icon">${emoji}</span>
          <div class="meal-details">
            <h4 class="meal-card-title">${title}</h4>
            <p class="meal-card-items-summary">
              ${hasItems ? items.map(i => i.name).join(', ') : 'Nothing logged yet'}
            </p>
          </div>
        </div>
        <div class="meal-card-right">
          ${hasItems ? `
            <span class="badge badge-success">${items.length} items</span>
          ` : `
            <span class="badge badge-empty">+ Add</span>
          `}
        </div>
      </div>
    `;
  }
}
