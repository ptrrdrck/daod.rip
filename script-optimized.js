/* © 2021 Peter Rodrick <pete@lftlc.xyz> - Optimized Version
 * Dao Drip - Performance Optimized
 */

// Performance optimizations and cached DOM elements
const DaoApp = {
  // Cache DOM elements to avoid repeated queries
  elements: {},
  
  // State management
  state: {
    selectedTranslations: JSON.parse(localStorage.getItem("selectedTranslations")) || ['Stephen Mitchell', 'Ursula K. Le Guin', 'D. C. Lau'],
    readChapters: JSON.parse(localStorage.getItem("readChapters")) || [],
    readOrder: JSON.parse(localStorage.getItem("readOrder")) || [],
    currentChapterIndex: 0,
    historyIndex: -1,
    totalChapters: 81
  },

  // Initialize app
  async init() {
    this.cacheElements();
    this.initializeSettings();
    this.bindEvents();
    await this.displayRandomChapter();
    this.updateHistoryDisplay();
    this.displayUnreadChapters();
  },

  // Cache all DOM elements once
  cacheElements() {
    const selectors = {
      displayArea: '#display',
      dripButton: '#drip-button',
      dripAgainButton: '#drip-again-button',
      yinYang: '#yin-yang',
      chapterSelectInput: '#chapter-select-input',
      chapterSelectButton: '#chapter-select-button',
      addButton: '#add-button',
      subtractButton: '#subtract-button',
      resetUnreadButton: '#reset-unread-button',
      tablePlaceholder: '#table-placeholder',
      historyNav: '#history-nav',
      prevChapterDisplay: '#prev-ch',
      nextChapterDisplay: '#next-ch',
      seekBackButton: '#ch-seek-back',
      seekFwdButton: '#ch-seek-fwd'
    };

    for (const [key, selector] of Object.entries(selectors)) {
      this.elements[key] = document.querySelector(selector);
    }

    // Cache checkboxes
    this.elements.checkboxes = document.querySelectorAll('input[type="checkbox"]');
  },

  // Initialize settings
  initializeSettings() {
    localStorage.setItem("selectedTranslations", JSON.stringify(this.state.selectedTranslations));
    if (!localStorage.getItem("shuffle-control")) {
      localStorage.setItem("shuffle-control", "true");
    }
  },

  // Bind all events using event delegation where possible
  bindEvents() {
    // Main action buttons
    this.elements.dripButton?.addEventListener('click', () => this.displayRandomChapter());
    this.elements.dripAgainButton?.addEventListener('click', () => this.dripAgainWithScroll());
    this.elements.yinYang?.addEventListener('click', () => this.dripAgainWithScroll());

    // Chapter selection
    this.elements.chapterSelectButton?.addEventListener('click', () => this.viewSelectedChapter());
    this.elements.chapterSelectInput?.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) this.viewSelectedChapter();
    });

    // Number controls
    this.elements.addButton?.addEventListener('click', () => this.adjustChapterNumber(1));
    this.elements.subtractButton?.addEventListener('click', () => this.adjustChapterNumber(-1));
    
    // Input handling with debouncing
    this.elements.chapterSelectInput?.addEventListener('input', this.debounce((e) => {
      this.handleChapterInputChange(e);
    }, 300));

    // History navigation
    this.elements.seekBackButton?.addEventListener('click', () => this.navigateHistory(-1));
    this.elements.seekFwdButton?.addEventListener('click', () => this.navigateHistory(1));

    // Reset button
    this.elements.resetUnreadButton?.addEventListener('click', () => this.resetUnreadChapters());

    // Translation checkboxes using event delegation
    document.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox' && e.target.hasAttribute('store')) {
        this.handleCheckboxChange(e.target);
      }
    });
  },

  // Debounce utility for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Optimized random chapter display with lazy loading
  async displayRandomChapter() {
    const randomChapter = Math.floor(Math.random() * this.state.totalChapters);
    await this.displayChapter(randomChapter);
    this.updateReadStatus(randomChapter + 1);
  },

  // Generic chapter display method with async loading
  async displayChapter(chapterIndex) {
    try {
      this.showLoading();
      const translations = await this.loadSelectedTranslations();
      const formattedContent = await this.formatChapterContent(chapterIndex, translations);
      
      this.elements.displayArea.innerHTML = formattedContent;
      this.state.currentChapterIndex = chapterIndex;
    } catch (error) {
      console.error('Error loading chapter:', error);
      this.showError('Failed to load chapter. Please try again.');
    }
  },

  // Load only selected translations (lazy loading)
  async loadSelectedTranslations() {
    const promises = this.state.selectedTranslations.map(async (translatorName) => {
      try {
        // Using the new lazy loading system
        const chapters = await TranslationLoader.loadTranslator(translatorName);
        return { name: translatorName, chapters };
      } catch (error) {
        console.warn(`Failed to load translator ${translatorName}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  },

  // Optimized content formatting
  async formatChapterContent(chapterIndex, translations) {
    const messages = translations.map(({ name, chapters }) => {
      const chapterText = chapters[chapterIndex] || `Chapter ${chapterIndex + 1} not available`;
      const sourceInfo = sources[name] || ['unknown', '#', 'Unknown Source'];
      
      return `
        <div class="translation">
          <span class="chapter-author">Chapter ${chapterIndex + 1} by ${name}:</span> 
          ${chapterText}
          <br />
          <div class="trans-info">
            <span class="trans-ref">${sourceInfo[2]}</span><br />
            <a href="${sourceInfo[1]}" class="trans-link" target="_blank">Source</a>
          </div>
        </div>
      `;
    });

    const shouldShuffle = localStorage.getItem("shuffle-control") === "true";
    const finalMessages = shouldShuffle ? this.shuffleArray([...messages]) : messages;
    
    return finalMessages.join('<br /><span class="chapter-separator">&bull;</span>');
  },

  // Optimized Fisher-Yates shuffle
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // Show loading state
  showLoading() {
    this.elements.displayArea.innerHTML = '<div class="loading">Loading translations...</div>';
  },

  // Show error state
  showError(message) {
    this.elements.displayArea.innerHTML = `<div class="error">${message}</div>`;
  },

  // Optimized DOM manipulation for unread chapters
  displayUnreadChapters() {
    const existingTable = document.getElementById('unread-chapters');
    if (existingTable) {
      existingTable.remove();
    }

    const fragment = document.createDocumentFragment();
    const table = document.createElement('table');
    table.id = 'unread-chapters';

    for (let chapter = 1; chapter <= this.state.totalChapters; chapter++) {
      if (!this.state.readChapters.includes(chapter)) {
        const cell = document.createElement('td');
        const link = document.createElement('a');
        link.href = 'javascript:void(0)';
        link.className = 'chapter-link';
        link.textContent = chapter;
        link.addEventListener('click', () => this.viewChapter(chapter - 1));
        
        cell.appendChild(link);
        table.appendChild(cell);
      }
    }

    fragment.appendChild(table);
    this.elements.tablePlaceholder?.appendChild(fragment);
  },

  // Optimized chapter input handling
  handleChapterInputChange(e) {
    let value = parseInt(e.target.value);
    value = Math.max(1, Math.min(81, value || 1));
    e.target.value = value;
    this.updateButtonStates(value);
  },

  // Update button states
  updateButtonStates(value) {
    if (this.elements.subtractButton) {
      this.elements.subtractButton.disabled = value <= 1;
    }
    if (this.elements.addButton) {
      this.elements.addButton.disabled = value >= 81;
    }
  },

  // Optimized chapter number adjustment
  adjustChapterNumber(delta) {
    const input = this.elements.chapterSelectInput;
    if (!input) return;
    
    const currentValue = parseInt(input.value) || 1;
    const newValue = Math.max(1, Math.min(81, currentValue + delta));
    input.value = newValue;
    this.updateButtonStates(newValue);
  },

  // View selected chapter
  async viewSelectedChapter() {
    const chapterNumber = parseInt(this.elements.chapterSelectInput?.value) || 1;
    await this.viewChapter(chapterNumber - 1);
  },

  // View specific chapter
  async viewChapter(chapterIndex) {
    await this.displayChapter(chapterIndex);
    this.updateReadStatus(chapterIndex + 1);
    this.scrollToTop();
  },

  // Update read status efficiently
  updateReadStatus(chapterNumber) {
    if (!this.state.readChapters.includes(chapterNumber)) {
      this.state.readChapters.push(chapterNumber);
      localStorage.setItem("readChapters", JSON.stringify(this.state.readChapters));
    }
    
    this.state.readOrder.push(chapterNumber);
    localStorage.setItem("readOrder", JSON.stringify(this.state.readOrder));
    
    // Update displays asynchronously to avoid blocking
    requestAnimationFrame(() => {
      this.displayUnreadChapters();
      this.updateHistoryDisplay();
    });
  },

  // Optimized scroll to top
  scrollToTop() {
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  },

  // Handle drip again with scroll
  async dripAgainWithScroll() {
    await this.displayRandomChapter();
    this.scrollToTop();
  },

  // Handle checkbox changes
  handleCheckboxChange(checkbox) {
    const translatorName = this.getTranslatorNameFromCheckbox(checkbox);
    if (translatorName) {
      this.toggleTranslator(translatorName);
      localStorage.setItem(checkbox.getAttribute('store'), checkbox.checked);
      
      // Refresh current chapter if needed
      if (this.state.currentChapterIndex !== undefined) {
        this.displayChapter(this.state.currentChapterIndex);
      }
    }
  },

  // Get translator name from checkbox
  getTranslatorNameFromCheckbox(checkbox) {
    const translatorMap = {
      'mitchell-checkbox': 'Stephen Mitchell',
      'fengEnglish-checkbox': 'Gia-Fu Feng & Jane English',
      'addissLombardo-checkbox': 'Stephen Addiss & Stanley Lombardo',
      'lin-checkbox': 'Derek Lin',
      'legge-checkbox': 'James Legge',
      'leguin-checkbox': 'Ursula K. Le Guin',
      'lau-checkbox': 'D. C. Lau',
      'yutang-checkbox': 'Lin Yutang',
      'henricks-checkbox': 'Robert G. Henricks',
      'redpine-checkbox': 'Red Pine (Bill Porter)'
    };
    return translatorMap[checkbox.id];
  },

  // Toggle translator selection
  toggleTranslator(translatorName) {
    const index = this.state.selectedTranslations.indexOf(translatorName);
    if (index === -1) {
      this.state.selectedTranslations.push(translatorName);
    } else {
      this.state.selectedTranslations.splice(index, 1);
    }
    localStorage.setItem("selectedTranslations", JSON.stringify(this.state.selectedTranslations));
  },

  // Reset unread chapters
  resetUnreadChapters() {
    this.state.readChapters = [];
    localStorage.removeItem("readChapters");
    this.displayUnreadChapters();
  },

  // Simplified history management
  updateHistoryDisplay() {
    // Simplified history display logic
    const hasHistory = this.state.readOrder.length > 1;
    if (this.elements.historyNav) {
      this.elements.historyNav.style.display = hasHistory ? 'flex' : 'none';
    }
  },

  // Navigate history
  navigateHistory(direction) {
    // Simplified history navigation
    const currentIndex = this.state.readOrder.length - 1;
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.state.readOrder.length) {
      const chapterNumber = this.state.readOrder[newIndex];
      this.viewChapter(chapterNumber - 1);
    }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DaoApp.init());
} else {
  DaoApp.init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DaoApp;
}