/* ============================================
   BiteBalance Daily Summary & Feedback View
   ============================================ */

import { store } from '../store.js';
import { analyzeDayWithAI, getLocalMockScore } from '../api.js';
import { getScoreColor, getScoreLabel, formatDate } from '../utils.js';
import { Toast } from '../components/Toast.js';

export class DailySummaryPage {
  constructor(dateStr) {
    this.dateStr = dateStr;
    this.isLoading = false;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container summary-page stagger-children';

    this.container = container;
    this.update();

    return container;
  }

  async update() {
    const day = store.getDay(this.dateStr);
    const count = Object.values(day.meals).reduce((sum, current) => sum + current.length, 0);

    if (count === 0) {
      this.container.innerHTML = `
        <header class="page-header">
          <a href="#/history" class="btn-back">◀ History</a>
          <h1 class="page-title">${formatDate(this.dateStr)}</h1>
        </header>
        <div class="card empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>No foods logged today</h3>
          <p>Please go back to the logging page and enter your meals first.</p>
          <a href="#/log?date=${this.dateStr}" class="btn btn-primary" style="margin-top: var(--space-4);">Log Meals</a>
        </div>
      `;
      return;
    }

    if (day.score) {
      // Score has already been processed, display the results
      this.renderReport(day.score, day.meals);
    } else if (this.isLoading) {
      this.renderLoading();
    } else {
      // Prompt user to trigger evaluation
      this.renderEvaluationPrompt(day.meals);
    }
  }

  renderEvaluationPrompt(meals) {
    this.container.innerHTML = `
      <header class="page-header">
        <a href="#/?date=${this.dateStr}" class="btn-back">◀ Dashboard</a>
        <h1 class="page-title">Summary</h1>
        <p class="page-subtitle">${formatDate(this.dateStr)}</p>
      </header>

      <div class="card evaluate-intro-card stagger-children">
        <div class="evaluate-icon">🧠</div>
        <h2>Generate AI Health Score</h2>
        <p>BiteBalance AI is ready to analyze your meals, examine the quality of ingredients, and deliver your rating & coaching feedback.</p>
        
        <div class="logged-meals-preview">
          ${Object.entries(meals).map(([mealName, list]) => {
            if (list.length === 0) return '';
            return `
              <div class="preview-row">
                <span class="preview-meal-title">${mealName}:</span>
                <span class="preview-meal-items">${list.map(i => i.name).join(', ')}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="evaluate-actions">
          <button class="btn btn-primary" id="btn-trigger-ai" style="width: 100%;">
            Evaluate with Gemini AI
          </button>
          <button class="btn btn-secondary" id="btn-trigger-local" style="width: 100%; margin-top: var(--space-2);">
            Quick Estimate (Offline)
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-trigger-ai').addEventListener('click', () => {
      this.runEvaluation(false);
    });

    this.container.querySelector('#btn-trigger-local').addEventListener('click', () => {
      this.runEvaluation(true);
    });
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="ai-loading-container">
        <div class="ai-loading-glow">🥗</div>
        <h2>Analyzing food logs...</h2>
        <p class="loading-subtext">Gemini AI is examining ingredients, portion parameters, and preparing your personalized score card.</p>
        <div class="loading-bar">
          <div class="loading-bar-fill"></div>
        </div>
      </div>
    `;
  }

  async runEvaluation(forceLocal = false) {
    this.isLoading = true;
    this.update();

    const day = store.getDay(this.dateStr);

    try {
      let scoreData;
      if (forceLocal) {
        scoreData = getLocalMockScore(day.meals);
      } else {
        try {
          scoreData = await analyzeDayWithAI(this.dateStr, day.meals);
        } catch (e) {
          if (e.message === 'API_KEY_MISSING') {
            Toast.warning('API key missing. Evaluating locally instead.');
          } else {
            console.error('Gemini AI failed, using local fallback', e);
            Toast.warning('Connection error. Evaluating locally instead.');
          }
          scoreData = getLocalMockScore(day.meals);
        }
      }

      store.setDayScore(this.dateStr, scoreData);
      Toast.success('Daily score generated!');
    } catch (err) {
      console.error(err);
      Toast.danger('Failed to evaluate day.');
    } finally {
      this.isLoading = false;
      this.update();
    }
  }

  renderReport(score, meals) {
    const oScore = score.overallScore;
    const scoreColor = getScoreColor(oScore);
    const scoreLabel = getScoreLabel(oScore);
    const circumference = 2 * Math.PI * 80; // r=80
    const targetOffset = circumference - (oScore / 100) * circumference;

    this.container.innerHTML = `
      <header class="page-header flex-row justify-between">
        <a href="#/?date=${this.dateStr}" class="btn-back">◀ Today</a>
        <button class="btn btn-secondary btn-icon" id="btn-re-evaluate" title="Re-evaluate Day">🔄</button>
      </header>

      <!-- Health Score Gauge -->
      <section class="card summary-score-card">
        <div class="health-gauge-container">
          <svg class="gauge-svg">
            <circle class="gauge-bg" cx="90" cy="90" r="80"></circle>
            <circle class="gauge-fill" cx="90" cy="90" r="80" 
                    style="stroke: ${scoreColor}; stroke-dasharray: ${circumference}; stroke-dashoffset: ${targetOffset};">
            </circle>
          </svg>
          <div class="gauge-content">
            <span class="gauge-score" style="color: ${scoreColor}">${oScore}</span>
            <span class="gauge-label">${scoreLabel}</span>
          </div>
        </div>
        <div class="summary-verdict-box">
          <p class="summary-verdict">"${score.dailyVerdict}"</p>
        </div>
      </section>

      <!-- Strengths and Weakspots -->
      <div class="strengths-weakness-grid stagger-children">
        <div class="card feedback-panel strength-panel">
          <h4>🌟 Strengths</h4>
          <ul>
            ${score.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div class="card feedback-panel weakness-panel">
          <h4>⚠️ Weak spots</h4>
          <ul>
            ${score.weakspots.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Actionable Suggestions -->
      <section class="card suggestions-card stagger-children">
        <h3 class="card-title">💡 Actionable Tips for Tomorrow</h3>
        <ul class="suggestions-list">
          ${score.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </section>

      <!-- Meal Feedback Breakdown -->
      <section class="card meals-feedback-card stagger-children">
        <h3 class="card-title">🍽️ Meal Specific Feedback</h3>
        <div class="meals-feedback-list">
          ${Object.entries(score.mealFeedback).map(([meal, feedback]) => {
            const count = meals[meal]?.length || 0;
            if (count === 0 && meal !== 'custom') return '';
            const emoji = meal === 'breakfast' ? '🍳' : meal === 'lunch' ? '🍛' : meal === 'dinner' ? '🍲' : '🍎';
            return `
              <div class="meal-feedback-row">
                <div class="meal-feedback-header">
                  <span class="meal-icon-title">${emoji} ${meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                </div>
                <p class="meal-feedback-desc">${feedback}</p>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Food Items Breakdown Detail -->
      <section class="card items-breakdown-card stagger-children">
        <h3 class="card-title">🔍 Logged Food Breakdown</h3>
        <div class="items-list">
          ${score.itemBreakdown.map(item => {
            const impactEmoji = item.impact === 'positive' ? '🟢' : item.impact === 'negative' ? '🔴' : '🟡';
            const impactClass = `impact-${item.impact}`;
            return `
              <div class="item-breakdown-row ${impactClass}">
                <div class="item-breakdown-title-row">
                  <span class="item-impact-dot">${impactEmoji}</span>
                  <strong class="item-name">${item.name}</strong>
                  <span class="item-meal-tag">${item.mealType}</span>
                </div>
                <p class="item-explanation">${item.explanation}</p>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Edit Food Log Link -->
      <div style="text-align: center; margin-bottom: var(--space-4);">
        <a href="#/log?date=${this.dateStr}" class="btn btn-secondary" style="width: 100%;">
          ✏️ Edit / Update Logged Items
        </a>
      </div>
    `;

    this.container.querySelector('#btn-re-evaluate').addEventListener('click', () => {
      if (confirm('Re-evaluating will send your food logs to Gemini AI again. Proceed?')) {
        this.runEvaluation();
      }
    });
  }
}
