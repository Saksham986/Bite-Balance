/* ============================================
   BiteBalance Analytics Dashboard Page
   ============================================ */

import { store } from '../store.js';
import { getScoreColor } from '../utils.js';
import { Chart, registerables } from 'chart.js';

// Register all chart types
Chart.register(...registerables);

export class AnalyticsPage {
  constructor() {
    this.chartInstances = {};
    this.range = 'weekly'; // weekly | monthly | all
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container analytics-page stagger-children';

    this.container = container;
    this.update();

    return container;
  }

  update() {
    this.container.innerHTML = `
      <header class="page-header">
        <h1 class="page-title">Progress Analytics</h1>
        <p class="page-subtitle">Your personalized wellness insight overview</p>
      </header>

      <div class="analytics-tabs card">
        <button class="analytics-tab-btn ${this.range === 'weekly' ? 'tab-active' : ''}" data-range="weekly">7 Days</button>
        <button class="analytics-tab-btn ${this.range === 'monthly' ? 'tab-active' : ''}" data-range="monthly">30 Days</button>
        <button class="analytics-tab-btn ${this.range === 'all' ? 'tab-active' : ''}" data-range="all">All Time</button>
      </div>

      <div class="stats-summary-grid">
        <div class="card stats-mini-card">
          <span class="stats-icon">🔥</span>
          <div class="stats-info">
            <span class="stats-val" id="analytics-streak">0 days</span>
            <span class="stats-lbl">Current Streak</span>
          </div>
        </div>
        <div class="card stats-mini-card">
          <span class="stats-icon">🎯</span>
          <div class="stats-info">
            <span class="stats-val" id="analytics-average">N/A</span>
            <span class="stats-lbl">Average Score</span>
          </div>
        </div>
      </div>

      <div class="card chart-container-card stagger-children">
        <h3 class="chart-title">📈 Daily Health Trend</h3>
        <div class="canvas-wrapper">
          <canvas id="trendChart"></canvas>
        </div>
      </div>

      <div class="card chart-container-card">
        <h3 class="chart-title">🥗 Meal Composition Ratio</h3>
        <p class="chart-desc">Proportion of positive (healthy) vs. negative (unhealthy) food impact items evaluated by AI</p>
        <div class="canvas-wrapper doughnut-wrapper">
          <canvas id="compositionChart"></canvas>
        </div>
      </div>

      <div class="card chart-container-card">
        <h3 class="chart-title">🍔 Unhealthy Item Frequencies</h3>
        <p class="chart-desc">Frequencies of processed items, sugars, or heavy fats detected by AI</p>
        <div class="canvas-wrapper">
          <canvas id="unhealthyFrequencyChart"></canvas>
        </div>
      </div>
    `;

    // Process analytics and draw charts asynchronously
    setTimeout(() => {
      this.processDataAndDrawCharts();
      this.bindEvents();
    }, 50);
  }

  processDataAndDrawCharts() {
    const daysData = store.days;
    const sortedDates = Object.keys(daysData)
      .filter(date => daysData[date].score?.overallScore !== undefined)
      .sort((a, b) => new Date(a) - new Date(b));

    // Filter by range
    let filteredDates = [...sortedDates];
    const today = new Date();
    
    if (this.range === 'weekly') {
      const cutOff = new Date(today);
      cutOff.setDate(cutOff.getDate() - 7);
      filteredDates = sortedDates.filter(d => new Date(d) >= cutOff);
    } else if (this.range === 'monthly') {
      const cutOff = new Date(today);
      cutOff.setDate(cutOff.getDate() - 30);
      filteredDates = sortedDates.filter(d => new Date(d) >= cutOff);
    }

    // Set Streak
    const streakElement = this.container.querySelector('#analytics-streak');
    if (streakElement) {
      streakElement.innerText = `${store.getStreak()} days`;
    }

    // Set Average Score
    const averageElement = this.container.querySelector('#analytics-average');
    const validScores = filteredDates.map(d => daysData[d].score.overallScore);
    if (validScores.length > 0) {
      const avg = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
      averageElement.innerText = `${avg}/100`;
      averageElement.style.color = getScoreColor(avg);
    } else {
      averageElement.innerText = 'N/A';
      averageElement.style.color = 'var(--text-tertiary)';
    }

    this.drawTrendChart(filteredDates, daysData);
    this.drawCompositionChart(filteredDates, daysData);
    this.drawFrequencyChart(filteredDates, daysData);
  }

  drawTrendChart(dates, daysData) {
    const ctx = this.container.querySelector('#trendChart')?.getContext('2d');
    if (!ctx) return;

    if (this.chartInstances.trend) {
      this.chartInstances.trend.destroy();
    }

    if (dates.length === 0) {
      this.drawEmptyStateOnCanvas(ctx, "Log food and generate scores to see trends.");
      return;
    }

    const labels = dates.map(d => {
      const dateObj = new Date(d);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const data = dates.map(d => daysData[d].score.overallScore);
    const colors = dates.map(d => getScoreColor(daysData[d].score.overallScore));

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    this.chartInstances.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Health Score',
          data: data,
          borderColor: '#10B981',
          backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: colors,
          pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
            },
            ticks: {
              color: isDark ? '#94A3B8' : '#64748B'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: isDark ? '#94A3B8' : '#64748B'
            }
          }
        }
      }
    });
  }

  drawCompositionChart(dates, daysData) {
    const ctx = this.container.querySelector('#compositionChart')?.getContext('2d');
    if (!ctx) return;

    if (this.chartInstances.composition) {
      this.chartInstances.composition.destroy();
    }

    if (dates.length === 0) {
      this.drawEmptyStateOnCanvas(ctx, "No logged food items.");
      return;
    }

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    dates.forEach(d => {
      const breakdown = daysData[d].score.itemBreakdown || [];
      breakdown.forEach(item => {
        if (item.impact === 'positive') positiveCount++;
        else if (item.impact === 'negative') negativeCount++;
        else neutralCount++;
      });
    });

    const total = positiveCount + neutralCount + negativeCount;
    if (total === 0) {
      this.drawEmptyStateOnCanvas(ctx, "No items rated.");
      return;
    }

    this.chartInstances.composition = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Healthy', 'Neutral', 'Unhealthy'],
        datasets: [{
          data: [positiveCount, neutralCount, negativeCount],
          backgroundColor: ['#10B981', '#94A3B8', '#EF4444'],
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1E293B' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#94A3B8' : '#64748B',
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });
  }

  drawFrequencyChart(dates, daysData) {
    const ctx = this.container.querySelector('#unhealthyFrequencyChart')?.getContext('2d');
    if (!ctx) return;

    if (this.chartInstances.frequency) {
      this.chartInstances.frequency.destroy();
    }

    const itemCounts = {};
    dates.forEach(d => {
      const breakdown = daysData[d].score.itemBreakdown || [];
      breakdown.forEach(item => {
        if (item.impact === 'negative') {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
        }
      });
    });

    const sortedItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // top 5 worst food frequencies

    if (sortedItems.length === 0) {
      this.drawEmptyStateOnCanvas(ctx, "Nice! No recent unhealthy items detected.");
      return;
    }

    const labels = sortedItems.map(item => item[0]);
    const data = sortedItems.map(item => item[1]);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    this.chartInstances.frequency = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Frequencies',
          data: data,
          backgroundColor: '#EF4444',
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: isDark ? '#94A3B8' : '#64748B'
            },
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
            }
          },
          x: {
            ticks: {
              color: isDark ? '#94A3B8' : '#64748B'
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  drawEmptyStateOnCanvas(ctx, message) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const canvas = ctx.canvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Inter';
    ctx.fillStyle = isDark ? '#64748B' : '#94A3B8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  bindEvents() {
    this.container.querySelectorAll('.analytics-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.range = e.target.getAttribute('data-range');
        this.update();
      });
    });
  }
}
