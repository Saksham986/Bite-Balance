/* ============================================
   BiteBalance Meal Logging View
   ============================================ */

import { store } from '../store.js';
import { foodDatabase, allSuggestions } from '../data/foods.js';
import { Toast } from '../components/Toast.js';
import { getTodayDateString, formatDate } from '../utils.js';

export class MealLogPage {
  constructor() {
    // Read query parameter for custom dates if editing history
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    this.dateStr = params.get('date') || getTodayDateString();
    
    this.currentMeal = 'breakfast'; // Default selected slot
    this.expandedDetailsId = null; // ID of item whose details pane is expanded
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container log-page stagger-children';

    this.container = container;
    this.update();
    this.bindEventsOnce();

    return container;
  }

  update() {
    const day = store.getDay(this.dateStr);
    const mealItems = day.meals[this.currentMeal] || [];

    this.container.innerHTML = `
      <header class="page-header flex-row justify-between">
        <a href="#/" class="btn-back">◀ Home</a>
        <div class="header-date-badge">${formatDate(this.dateStr)}</div>
      </header>

      <!-- Meal Selection Tabs -->
      <div class="meal-tabs card">
        <button class="meal-tab-btn ${this.currentMeal === 'breakfast' ? 'tab-active' : ''}" data-meal="breakfast">🍳 Breakfast</button>
        <button class="meal-tab-btn ${this.currentMeal === 'lunch' ? 'tab-active' : ''}" data-meal="lunch">🍛 Lunch</button>
        <button class="meal-tab-btn ${this.currentMeal === 'dinner' ? 'tab-active' : ''}" data-meal="dinner">🍲 Dinner</button>
        <button class="meal-tab-btn ${this.currentMeal === 'snacks' ? 'tab-active' : ''}" data-meal="snacks">🍎 Snacks</button>
        <button class="meal-tab-btn ${this.currentMeal === 'custom' ? 'tab-active' : ''}" data-meal="custom">➕ Custom</button>
      </div>

      <!-- Quick suggestions grid -->
      <section class="card suggestions-section">
        <h4 class="section-title">Quick Add Suggestions</h4>
        <div class="suggestions-chips-grid" id="quick-chips"></div>
      </section>

      <!-- Search Autocomplete Input & Manual Add -->
      <section class="card input-section">
        <h4 class="section-title">Add Food Item</h4>
        <div class="search-box-container">
          <input type="text" id="food-search-input" class="input" placeholder="Search food (e.g. Oats, Poha, Pizza)..." autocomplete="off" />
          <div class="autocomplete-dropdown hidden" id="autocomplete-list"></div>
        </div>

        <!-- Optional Collapsible parameters -->
        <div class="collapsible-details-header" id="toggle-optional-btn">
          <span>⚙️ Optional Cooking Details (Tap to Expand)</span>
          <span class="chevron-indicator">▼</span>
        </div>
        
        <div class="collapsible-details-content hidden" id="optional-pane">
          <div class="form-group flex-row justify-between align-center">
            <label class="label">Homemade or Cooked at home?</label>
            <input type="checkbox" id="opt-homemade" checked />
          </div>
          
          <div class="form-group">
            <label class="label">Portion Size</label>
            <select id="opt-portion" class="select">
              <option value="1 regular serving">1 regular serving (Standard)</option>
              <option value="Small portion (half serving)">Small portion (half serving)</option>
              <option value="Large portion (double serving)">Large portion (double serving)</option>
              <option value="Custom amount">Custom amount</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Flour Type (If applicable)</label>
            <select id="opt-flour" class="select">
              <option value="">N/A</option>
              <option value="Whole Wheat / Atta">Whole Wheat / Atta</option>
              <option value="Refined flour / Maida">Refined flour / Maida</option>
              <option value="Millets (Ragi/Jowar/Bajra)">Millets (Ragi/Jowar/Bajra)</option>
              <option value="Gluten-free mix">Gluten-free mix</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Sweetener / Sugar Type</label>
            <select id="opt-sugar" class="select">
              <option value="">N/A</option>
              <option value="No sweetener added">No sweetener added</option>
              <option value="Refined White Sugar">Refined White Sugar</option>
              <option value="Jaggery / Brown Sugar">Jaggery / Brown Sugar</option>
              <option value="Honey / Maple Syrup">Honey / Maple Syrup</option>
              <option value="Dates / Stevia (Natural sweetener)">Dates / Stevia (Natural sweetener)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Cooking Oil / Fat used</label>
            <select id="opt-oil" class="select">
              <option value="">N/A</option>
              <option value="Olive oil / Mustard oil">Olive oil / Mustard oil</option>
              <option value="Refined Vegetable oil / Seed oil">Refined Vegetable oil / Seed oil</option>
              <option value="Ghee / Butter">Ghee / Butter</option>
              <option value="No oil used (Boiled/Baked)">No oil used (Boiled/Baked)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Added Veggies / Protein boost?</label>
            <input type="text" id="opt-protein-veg" class="input" placeholder="e.g. Added paneer, extra carrots/spinach" />
          </div>

          <div class="form-group">
            <label class="label">Extra Notes</label>
            <textarea id="opt-notes" class="textarea" placeholder="e.g. Homemade whole-wheat crust, less cheese, organic honey..."></textarea>
          </div>
        </div>

        <button class="btn btn-primary" id="btn-add-food" style="width: 100%; margin-top: var(--space-4);">Add to Log</button>
      </section>

      <!-- Currently Logged Items List -->
      <section class="card logged-items-section stagger-children">
        <h3 class="section-title">Logged for ${this.currentMeal.charAt(0).toUpperCase() + this.currentMeal.slice(1)}</h3>
        <div class="logged-list" id="logged-list-container"></div>
      </section>

      <!-- CTA to Evaluate -->
      <div style="margin-top: var(--space-6); margin-bottom: var(--space-6);">
        <a href="#/summary/${this.dateStr}" class="btn btn-primary" style="width: 100%; font-size: var(--text-lg); padding: var(--space-4);">
          ✨ View Daily Health Report
        </a>
      </div>
    `;

    this.renderSuggestions();
    this.renderLoggedItems(mealItems);
  }

  renderSuggestions() {
    const container = this.container.querySelector('#quick-chips');
    const suggestions = foodDatabase[this.currentMeal] || [];
    
    container.innerHTML = suggestions.map(item => `
      <button class="chip chip-suggestion" data-name="${item.name}">${item.name}</button>
    `).join('');

    // Recent custom items
    if (store.customFoods.length > 0) {
      const recentsHeader = document.createElement('div');
      recentsHeader.className = 'label';
      recentsHeader.style.marginTop = 'var(--space-3)';
      recentsHeader.innerText = 'Recently Used:';
      container.appendChild(recentsHeader);

      const recentsContainer = document.createElement('div');
      recentsContainer.className = 'suggestions-chips-grid';
      recentsContainer.style.marginTop = 'var(--space-1)';
      recentsContainer.innerHTML = store.customFoods.slice(-5).reverse().map(name => `
        <button class="chip chip-suggestion chip-recent" data-name="${name}">${name} 🕒</button>
      `).join('');
      container.appendChild(recentsContainer);
    }
  }

  renderLoggedItems(items) {
    const container = this.container.querySelector('#logged-list-container');
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = `
        <p class="empty-list-desc">No foods logged for this meal yet.</p>
      `;
      return;
    }

    items.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'logged-item-row card';
      
      const isExpanded = this.expandedDetailsId === item.id;
      
      // Build details list summary
      const summaryParts = [
        item.quantity ? `Portion: ${item.quantity}` : null,
        item.details?.homemade ? 'Homemade' : 'Outside',
        item.details?.flour ? `Flour: ${item.details.flour}` : null,
        item.details?.sugar ? `Sugar: ${item.details.sugar}` : null,
        item.details?.oil ? `Oil: ${item.details.oil}` : null,
        item.details?.proteinVeg ? `Additions: ${item.details.proteinVeg}` : null,
        item.details?.notes ? `Notes: ${item.details.notes}` : null
      ].filter(Boolean);

      itemRow.innerHTML = `
        <div class="logged-item-main flex-row justify-between align-center">
          <div>
            <strong class="logged-food-name">${item.name}</strong>
            <div class="logged-food-subtitle">${item.quantity || '1 portion'} • ${item.details?.homemade ? 'Homemade' : 'Processed/Outside'}</div>
          </div>
          <div class="logged-item-actions">
            <button class="btn-text btn-toggle-item-details" data-id="${item.id}" title="Toggle Ingredient Details">⚙️</button>
            <button class="btn-text btn-delete-item" data-id="${item.id}" title="Delete Item">❌</button>
          </div>
        </div>
        <div class="logged-item-details-pane ${isExpanded ? '' : 'hidden'}" style="margin-top: var(--space-3); border-top: 1px solid var(--border-light); padding-top: var(--space-2);">
          <div class="details-grid">
            ${summaryParts.map(part => `<span class="detail-badge">${part}</span>`).join('')}
          </div>
        </div>
      `;

      container.appendChild(itemRow);
    });
  }

  handleAddFood() {
    const searchInput = this.container.querySelector('#food-search-input');
    if (!searchInput) return;
    const name = searchInput.value.trim();
    if (!name) {
      Toast.warning('Please select or type a food name.');
      return;
    }

    const homemade = this.container.querySelector('#opt-homemade').checked;
    const portion = this.container.querySelector('#opt-portion').value;
    const flour = this.container.querySelector('#opt-flour').value;
    const sugar = this.container.querySelector('#opt-sugar').value;
    const oil = this.container.querySelector('#opt-oil').value;
    const proteinVeg = this.container.querySelector('#opt-protein-veg').value.trim();
    const notes = this.container.querySelector('#opt-notes').value.trim();

    const foodItem = {
      name,
      quantity: portion,
      details: {
        homemade,
        flour: flour || null,
        sugar: sugar || null,
        oil: oil || null,
        proteinVeg: proteinVeg || null,
        notes: notes || null
      }
    };

    store.addFood(this.dateStr, this.currentMeal, foodItem);
    Toast.success(`Added ${name} to ${this.currentMeal}!`);
    
    // Reset inputs
    searchInput.value = '';
    const proteinInput = this.container.querySelector('#opt-protein-veg');
    if (proteinInput) proteinInput.value = '';
    const notesInput = this.container.querySelector('#opt-notes');
    if (notesInput) notesInput.value = '';
    
    this.update();
  }

  bindEventsOnce() {
    // We bind event listeners directly to the container to utilize event delegation.
    this.container.addEventListener('click', (e) => {
      // 1. Tab switching
      const tabBtn = e.target.closest('.meal-tab-btn');
      if (tabBtn) {
        this.currentMeal = tabBtn.getAttribute('data-meal');
        this.update();
        return;
      }

      // 2. Chip suggestion click
      const chip = e.target.closest('.chip-suggestion');
      if (chip) {
        const name = chip.getAttribute('data-name');
        const searchInput = this.container.querySelector('#food-search-input');
        if (searchInput) {
          searchInput.value = name;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        Toast.info(`Selected ${name}. Adjust optional parameters below if needed.`);
        return;
      }

      // 3. Toggle Optional Pane
      const toggleBtn = e.target.closest('#toggle-optional-btn');
      if (toggleBtn) {
        const optionalPane = this.container.querySelector('#optional-pane');
        const chevron = this.container.querySelector('.chevron-indicator');
        if (optionalPane && chevron) {
          const isHidden = optionalPane.classList.toggle('hidden');
          chevron.innerText = isHidden ? '▼' : '▲';
        }
        return;
      }

      // 4. Add food item
      const addBtn = e.target.closest('#btn-add-food');
      if (addBtn) {
        this.handleAddFood();
        return;
      }

      // 5. Toggle details inside logged items list
      const toggleDetailsBtn = e.target.closest('.btn-toggle-item-details');
      if (toggleDetailsBtn) {
        const itemId = toggleDetailsBtn.getAttribute('data-id');
        this.expandedDetailsId = this.expandedDetailsId === itemId ? null : itemId;
        this.update();
        return;
      }

      // 6. Delete item inside log
      const deleteBtn = e.target.closest('.btn-delete-item');
      if (deleteBtn) {
        const itemId = deleteBtn.getAttribute('data-id');
        // Instantly delete the food item for smoother user experience, rather than blocking threads
        store.removeFood(this.dateStr, this.currentMeal, itemId);
        Toast.warning('Item removed.');
        this.update();
        return;
      }
      
      // 7. Select autocomplete option
      const autocompleteItem = e.target.closest('.autocomplete-item');
      if (autocompleteItem) {
        const val = autocompleteItem.getAttribute('data-value');
        const searchInput = this.container.querySelector('#food-search-input');
        if (searchInput) {
          searchInput.value = val;
        }
        const listContainer = this.container.querySelector('#autocomplete-list');
        if (listContainer) {
          listContainer.classList.add('hidden');
        }
      }
    });

    // 8. Autocomplete input event (delegated to container)
    this.container.addEventListener('input', (e) => {
      if (e.target.id === 'food-search-input') {
        const listContainer = this.container.querySelector('#autocomplete-list');
        if (!listContainer) return;
        
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          listContainer.classList.add('hidden');
          return;
        }

        const filtered = [...new Set([...allSuggestions, ...store.customFoods])]
          .filter(name => name.toLowerCase().includes(query))
          .slice(0, 5);

        if (filtered.length === 0) {
          listContainer.classList.add('hidden');
          return;
        }

        listContainer.innerHTML = filtered.map(name => `
          <div class="autocomplete-item" data-value="${name}">${name}</div>
        `).join('');
        listContainer.classList.remove('hidden');
      }
    });

    // 9. Document click listener for autocomplete close
    if (!window._bitebalance_doc_click_bound) {
      document.addEventListener('click', (e) => {
        const activeAutocomplete = document.querySelector('#autocomplete-list');
        if (activeAutocomplete && !e.target.closest('.search-box-container')) {
          activeAutocomplete.classList.add('hidden');
        }
      });
      window._bitebalance_doc_click_bound = true;
    }
  }
}
