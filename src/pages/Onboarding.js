/* ============================================
   BiteBalance Onboarding Page View
   ============================================ */

import { store } from '../store.js';

export class OnboardingPage {
  constructor() {
    this.currentSlide = 0;
    this.slides = [
      {
        emoji: '🥗',
        title: 'Welcome to BiteBalance',
        desc: 'Hello, Saksham! Track your food intake meal by meal and receive advanced AI-driven nutrition evaluations.'
      },
      {
        emoji: '⚡',
        title: 'Effortless Food Logging',
        desc: 'Log meals with high-speed chips, quick portion adjustments, and optional detailed parameters.'
      },
      {
        emoji: '🤖',
        title: 'Deep Health Scoring',
        desc: 'Our AI examines cooking methods, ingredients, flour, and sugar types to generate precise daily scores out of 100.'
      },
      {
        emoji: '📈',
        title: 'Progressive Analytics',
        desc: 'Keep streaks alive, analyze healthy vs. unhealthy food ratios, and view detailed visual progress charts.'
      }
    ];
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container onboarding-page';

    this.container = container;
    this.update();

    return container;
  }

  update() {
    const slide = this.slides[this.currentSlide];
    const isLast = this.currentSlide === this.slides.length - 1;

    this.container.innerHTML = `
      <div class="onboarding-card card stagger-children">
        <div class="onboarding-header">
          <span class="logo-badge">BiteBalance</span>
        </div>
        
        <div class="onboarding-slide">
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.title}</h2>
          <p class="slide-desc">${slide.desc}</p>
        </div>

        <div class="onboarding-footer">
          <div class="slide-indicators">
            ${this.slides.map((_, i) => `
              <span class="indicator ${i === this.currentSlide ? 'indicator-active' : ''}"></span>
            `).join('')}
          </div>

          <div class="onboarding-actions">
            ${isLast ? `
              <button class="btn btn-primary btn-get-started" style="width: 100%;">Get Started</button>
            ` : `
              <button class="btn btn-text btn-skip">Skip</button>
              <button class="btn btn-primary btn-next">Next</button>
            `}
          </div>
        </div>
      </div>
    `;

    // Bind event listeners
    const nextBtn = this.container.querySelector('.btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentSlide++;
        this.update();
      });
    }

    const skipBtn = this.container.querySelector('.btn-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.completeOnboarding();
      });
    }

    const startBtn = this.container.querySelector('.btn-get-started');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.completeOnboarding();
      });
    }
  }

  completeOnboarding() {
    store.setOnboarded(true);
    window.location.hash = '#/';
  }
}
