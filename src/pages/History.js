/* ============================================
   BiteBalance Food History Calendar & List
   ============================================ */

import { store } from '../store.js';
import { formatDate, getScoreColor, getTodayDateString } from '../utils.js';

export class HistoryPage {
  constructor() {
    this.currentMonth = new Date();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container history-page stagger-children';

    this.container = container;
    this.update();

    return container;
  }

  update() {
    this.container.innerHTML = `
      <header class="page-header">
        <h1 class="page-title">Log History</h1>
        <p class="page-subtitle">Track your past daily summaries & scores</p>
      </header>

      <section class="card calendar-card">
        <div class="calendar-header">
          <button class="btn btn-icon btn-secondary" id="prev-month-btn">◀</button>
          <h3 id="calendar-month-title">${this.getMonthName(this.currentMonth)}</h3>
          <button class="btn btn-icon btn-secondary" id="next-month-btn">▶</button>
        </div>
        <div class="calendar-grid-header">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div class="calendar-days-grid" id="calendar-days-container"></div>
      </section>

      <section class="history-list-section stagger-children">
        <h3 class="section-title">Recent Entries</h3>
        <div id="recent-logs-list" class="stagger-children"></div>
      </section>
    `;

    this.renderCalendar();
    this.renderRecentLogs();
    this.bindEvents();
  }

  getMonthName(dateObj) {
    return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  renderCalendar() {
    const grid = this.container.querySelector('#calendar-days-container');
    grid.innerHTML = '';

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Fill preceding empty spaces
    for (let i = 0; i < firstDayIndex; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-empty';
      grid.appendChild(cell);
    }

    const todayStr = getTodayDateString();

    // Fill calendar days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      cell.setAttribute('data-date', dateStr);

      const dayNum = document.createElement('span');
      dayNum.className = 'day-number';
      dayNum.innerText = day;
      cell.appendChild(dayNum);

      // Check if logged and score exists
      const dayData = store.days[dateStr];
      const hasFood = dayData && Object.values(dayData.meals).some(m => m.length > 0);

      if (hasFood) {
        const dot = document.createElement('span');
        dot.className = 'day-indicator-dot';
        
        if (dayData.score?.overallScore !== undefined) {
          const score = dayData.score.overallScore;
          dot.style.backgroundColor = getScoreColor(score);
        } else {
          // Food logged but not evaluated
          dot.style.backgroundColor = 'var(--text-tertiary)';
        }
        cell.appendChild(dot);
      }

      if (dateStr === todayStr) {
        cell.classList.add('calendar-day-today');
      }

      cell.addEventListener('click', () => {
        window.location.hash = `#/summary/${dateStr}`;
      });

      grid.appendChild(cell);
    }
  }

  renderRecentLogs() {
    const list = this.container.querySelector('#recent-logs-list');
    list.innerHTML = '';

    const loggedDates = Object.keys(store.days)
      .filter(date => {
        const day = store.days[date];
        return day && Object.values(day.meals).some(m => m.length > 0);
      })
      .sort((a, b) => new Date(b) - new Date(a)) // Newest first
      .slice(0, 5); // Show top 5

    if (loggedDates.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <p>No food logs recorded yet. Start tracking to build your history!</p>
        </div>
      `;
      return;
    }

    loggedDates.forEach(dateStr => {
      const dayData = store.days[dateStr];
      const count = Object.values(dayData.meals).reduce((sum, current) => sum + current.length, 0);
      
      const item = document.createElement('div');
      item.className = 'card history-item-card card-hoverable';
      
      const scoreBadge = dayData.score 
        ? `<div class="history-score-badge" style="background-color: ${getScoreColor(dayData.score.overallScore)}">${dayData.score.overallScore}</div>`
        : `<div class="history-score-badge score-pending">Pending</div>`;

      item.innerHTML = `
        <div class="history-item-left">
          <h4 class="history-item-date">${formatDate(dateStr)}</h4>
          <p class="history-item-desc">${count} items logged</p>
        </div>
        <div class="history-item-right">
          ${scoreBadge}
          <span class="chevron">▶</span>
        </div>
      `;

      item.addEventListener('click', () => {
        window.location.hash = `#/summary/${dateStr}`;
      });

      list.appendChild(item);
    });
  }

  bindEvents() {
    this.container.querySelector('#prev-month-btn').addEventListener('click', () => {
      this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
      this.update();
    });

    this.container.querySelector('#next-month-btn').addEventListener('click', () => {
      this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
      this.update();
    });
  }
}
