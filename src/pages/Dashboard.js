/* ============================================
   BiteBalance Home Dashboard Page View
   ============================================ */

import { store } from '../store.js';
import { getRandomQuote, getScoreColor, getScoreLabel, getTodayDateString, formatDate, getDateString, parseLocalDate, formatFullDate } from '../utils.js';

export class DashboardPage {
  constructor() {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    this.dateStr = params.get('date') || getTodayDateString();
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
    const userName = profile.name || 'Saksham';

    const todayStr = getTodayDateString();
    const yesterdayDate = parseLocalDate(todayStr);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getDateString(yesterdayDate);

    let dayLabel = '';
    if (this.dateStr === todayStr) {
      dayLabel = 'Today';
    } else if (this.dateStr === yesterdayStr) {
      dayLabel = 'Yesterday';
    }

    this.container.innerHTML = `
      <header class="page-header dashboard-header flex-row justify-between align-center">
        <div>
          <h1 class="page-title greeting-text">${greeting}, ${userName}</h1>
          <p class="page-subtitle">${this.dateStr === todayStr ? "Let's keep your nutrition balanced today." : `Viewing meals logged for ${formatDate(this.dateStr)}.`}</p>
        </div>
        <div class="streak-badge" title="Logging Streak">
          <span>🔥</span>
          <span class="streak-number">${streak}</span>
        </div>
      </header>

      <!-- Date Selector Bar -->
      <section class="card date-selector-card flex-row align-center justify-between">
        <button class="btn-date-nav" id="btn-prev-day" title="Previous Day">◀</button>
        <div class="date-display-wrapper flex-row align-center justify-center">
          <span class="calendar-emoji">📅</span>
          <span class="selected-date-text">${dayLabel === 'Today' || dayLabel === 'Yesterday' ? `${dayLabel} (${formatDate(this.dateStr)})` : formatFullDate(this.dateStr)}</span>
          <div class="date-input-overlay-container">
            <input type="date" id="dashboard-date-picker" class="dashboard-date-picker" value="${this.dateStr}" max="${todayStr}" />
          </div>
        </div>
        <button class="btn-date-nav" id="btn-next-day" title="Next Day" ${this.dateStr >= todayStr ? 'disabled' : ''}>▶</button>
      </section>

      <!-- Motivation Quote Panel -->
      <section class="card quote-card flex-row align-center">
        <span class="quote-icon">🌱</span>
        <blockquote class="quote-text">"${getRandomQuote()}"</blockquote>
      </section>

      <!-- Score Gauge Widget -->
      <section class="card today-score-card flex-row align-center justify-between">
        <div class="score-widget-left">
          <h3>${this.dateStr === todayStr ? "Today's Health Rating" : `${dayLabel || formatDate(this.dateStr)}'s Health Rating`}</h3>
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
        <h3 class="section-title">${this.dateStr === todayStr ? "Today's Meals" : `${dayLabel || formatDate(this.dateStr)}'s Meals`}</h3>
        
        <div class="meal-log-cards-grid stagger-children">
          ${this.renderMealCard('Breakfast', 'breakfast', '🍳', day.meals.breakfast)}
          ${this.renderMealCard('Lunch', 'lunch', '🍛', day.meals.lunch)}
          ${this.renderMealCard('Dinner', 'dinner', '🍲', day.meals.dinner)}
          ${this.renderMealCard('Evening Snacks', 'snacks', '🍎', day.meals.snacks)}
          ${this.renderMealCard('Custom Slot', 'custom', '➕', day.meals.custom)}
        </div>
      </section>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const prevBtn = this.container.querySelector('#btn-prev-day');
    const nextBtn = this.container.querySelector('#btn-next-day');
    const datePicker = this.container.querySelector('#dashboard-date-picker');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const date = parseLocalDate(this.dateStr);
        date.setDate(date.getDate() - 1);
        const prevDateStr = getDateString(date);
        window.location.hash = `#/?date=${prevDateStr}`;
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const todayStr = getTodayDateString();
        if (this.dateStr < todayStr) {
          const date = parseLocalDate(this.dateStr);
          date.setDate(date.getDate() + 1);
          const nextDateStr = getDateString(date);
          window.location.hash = `#/?date=${nextDateStr}`;
        }
      });
    }

    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          window.location.hash = `#/?date=${val}`;
        }
      });
    }
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
