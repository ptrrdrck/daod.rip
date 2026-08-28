/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 * Dao Drip
 * Displays the same random chapter of the Daodejing
 * from characteristically distinct translations.
 */

import { dao } from "./dao.js";
import {
  historyChapterAt,
  renderHistory,
  seekBackButton,
  seekFwdButton,
  setHistoryIndex,
} from "./history.js";
import {
  chapterListPlaceholder,
  renderChapterList,
} from "./chapter-list.js";
import { renderTranslationCards } from "./cards.js";
import {
  renderTranslationList,
  translationListEl,
} from "./translation-list.js";
import {
  TRANSLATION_ORDER_KEY,
  state,
  storeBookmarkedChapters,
  storeLastChapterIndex,
  storeReadChapters,
  storeReadOrder,
  storeSelectedTranslations,
} from "./state.js";
import {
  allTranslations,
  alphabeticalTranslations,
  getSharedChapterFromUrl,
  nameToSlug,
  totalChapters,
} from "./catalog.js";
import {
  escapeHtml,
  randNumb,
  setupChoiceSetting,
  toggleArrayItem,
} from "./util.js";
/* Imported for its side effects, not for a value. settings.js clears storage
 * when the storage epoch moves, and that has to happen before anything here
 * reads what a reader saved. The script tags already run it first; this keeps
 * that true if they are ever reordered. */
import "./settings.js";


storeSelectedTranslations();

/* Translation order
 *
 * "shuffled" reshuffles the selection on every new chapter and keeps
 * the result, so the library list always shows the order the cards are in.
 * "manual" leaves that order alone, which is what the arrows in the library
 * list set. Readers who had turned the old shuffle checkbox off meant manual,
 * so carry them over rather than silently reshuffling for them. */

if (
  localStorage.getItem(TRANSLATION_ORDER_KEY) === null &&
  localStorage.getItem("shuffle-control") === "false"
) {
  localStorage.setItem(TRANSLATION_ORDER_KEY, "manual");
}

const translationOrderSetting = setupChoiceSetting({
  storageKey: TRANSLATION_ORDER_KEY,
  fallback: "shuffled",
  choices: [
    { value: "shuffled", buttonId: "translation-order-shuffled-button" },
    { value: "manual", buttonId: "translation-order-manual-button" },
  ],
});








/* Every edit to the selection or its order lands the same way. */
function commitTranslationChange() {
  storeSelectedTranslations();
  renderTranslationList();
  refreshCurrentChapter();
}

/* The arrows cross the divider rather than stopping at it: from the tail, up
 * joins the selection at the bottom of it, and from the last selected row,
 * down leaves the selection. There is nowhere below the tail to go, and the
 * tail sorts itself, so those rows get no down arrow. */
function moveTranslation(name, direction) {
  const selected = state.selectedTranslations;
  const index = selected.indexOf(name);
  if (index === -1) {
    if (direction === "down") return;
    selected.push(name);
  } else if (direction === "up") {
    if (index === 0) return;
    [selected[index - 1], selected[index]] = [
      selected[index],
      selected[index - 1],
    ];
  } else if (index === selected.length - 1) {
    selected.splice(index, 1);
  } else {
    [selected[index], selected[index + 1]] = [
      selected[index + 1],
      selected[index],
    ];
  }
  /* Having placed a translation by hand, the reader would not thank us for
   * shuffling it away on the next chapter. */
  translationOrderSetting.set("manual");
  commitTranslationChange();
}

if (translationListEl) {
  translationListEl.addEventListener("click", (e) => {
    const button = e.target.closest(".order-button");
    if (!button) return;
    const row = button.closest(".translation-row");
    moveTranslation(row.dataset.translation, button.dataset.direction);
  });

  /* Selection listens for change rather than click: the label, the box and
   * the checkmark are three places one tap can land, and only the input
   * reports the result of that tap once. */
  translationListEl.addEventListener("change", (e) => {
    const row = e.target.closest(".translation-row");
    if (!row) return;
    toggleArrayItem(state.selectedTranslations, row.dataset.translation);
    commitTranslationChange();
  });
}

renderTranslationList();



const sharedChapter = getSharedChapterFromUrl();


/* Delegated once on the placeholder, which outlives the table that
 * renderChapterList tears down and rebuilds on every filter change. */
chapterListPlaceholder.addEventListener("click", (e) => {
  const link = e.target.closest(".chapter-link");
  if (!link) return;
  viewChapter(Number(link.dataset.chapter) - 1);
  libraryModal.close();
});

/**







/* Size the nav before the first cards paint. */
renderHistory();

/* Random chapter selection */


const dripButton = document.getElementById("drip-button");
const yinYang = document.getElementById("yin-yang");



/* Search */

const SEARCH_MIN_LENGTH = 2;
const SEARCH_SNIPPET_RADIUS = 40;

function extractSnippet(text, query) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  if (matchIndex === -1) return null;

  const start = Math.max(0, matchIndex - SEARCH_SNIPPET_RADIUS);
  const end = Math.min(
    text.length,
    matchIndex + query.length + SEARCH_SNIPPET_RADIUS
  );

  const before = escapeHtml(text.slice(start, matchIndex));
  const matched = escapeHtml(text.slice(matchIndex, matchIndex + query.length));
  const after = escapeHtml(text.slice(matchIndex + query.length, end));

  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";

  return `${prefix}${before}<mark>${matched}</mark>${after}${suffix}`;
}

function searchTranslations(query) {
  const results = [];
  for (let chapterIndex = 0; chapterIndex < totalChapters; chapterIndex++) {
    const matches = [];
    allTranslations.forEach((translation) => {
      const snippet = extractSnippet(dao[translation][chapterIndex], query);
      if (snippet !== null) {
        matches.push({ translation, snippet });
      }
    });
    if (matches.length > 0) {
      results.push({ chapterIndex, matches });
    }
  }
  return results;
}

function newRandomChapter() {
  const randomChapter = randNumb(totalChapters);
  renderTranslationCards(randomChapter, true);
  if (state.readChapters.indexOf(randomChapter + 1) === -1) {
    state.readChapters.push(randomChapter + 1);
  }
  storeReadChapters();
  renderChapterList();
  state.readOrder.push(randomChapter + 1);
  storeReadOrder();
  setHistoryIndex();
  state.currentChapterIndex = randomChapter;
  storeLastChapterIndex();
}

function resumeChapter(chapter) {
  renderTranslationCards(chapter, true);
  state.currentChapterIndex = chapter;
  storeLastChapterIndex();
  renderChapterList();
  const storedHistoryIndex = localStorage.getItem("historyIndex");
  const restoredHistoryIndex =
    storedHistoryIndex !== null ? parseInt(storedHistoryIndex, 10) : -1;
  setHistoryIndex(restoredHistoryIndex);
}

const storedLastChapterIndex = localStorage.getItem("lastChapterIndex");
if (sharedChapter !== null) {
  viewChapter(sharedChapter - 1);
} else if (
  localStorage.getItem("landingMode") === "resume" &&
  storedLastChapterIndex !== null
) {
  resumeChapter(parseInt(storedLastChapterIndex, 10));
} else {
  newRandomChapter();
}

dripButton.addEventListener("click", () => {
  newRandomChapter();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

yinYang.addEventListener("click", () => {
  newRandomChapter();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* History chapter selection */

function showHistoryChapter(chapter) {
  renderTranslationCards(chapter - 1, false);
  state.currentChapterIndex = chapter - 1;
  storeLastChapterIndex();
}

/* Read the target before moving the index, so the two steps cannot be
 * transposed, and do nothing at the ends of the log. */
function seek(direction) {
  const chapter = historyChapterAt(direction);
  if (chapter === undefined) return;
  showHistoryChapter(chapter);
  setHistoryIndex(state.historyIndex + direction);
}

seekBackButton.addEventListener("click", () => seek(-1));
seekFwdButton.addEventListener("click", () => seek(1));

function viewChapter(chapter) {
  renderTranslationCards(chapter, true);
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (state.readChapters.indexOf(chapter + 1) === -1) {
    state.readChapters.push(chapter + 1);
  }
  storeReadChapters();
  renderChapterList();
  state.readOrder.push(chapter + 1);
  storeReadOrder();
  setHistoryIndex();
  state.currentChapterIndex = chapter;
  storeLastChapterIndex();
}

/* Share link */

const topShareButton = document.getElementById("top-share-button");
const topShareButtonIcon = topShareButton.innerHTML;
const topShareButtonCheckIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>';

topShareButton.addEventListener("click", async () => {
  const params = new URLSearchParams();
  params.set("ch", state.currentChapterIndex + 1);
  params.set(
    "t",
    state.selectedTranslations.map((name) => nameToSlug[name]).join(",")
  );
  const shareUrl = `${location.origin}${location.pathname}?${params.toString()}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    topShareButton.innerHTML = topShareButtonCheckIcon;
    setTimeout(() => (topShareButton.innerHTML = topShareButtonIcon), 1500);
  } catch {
    window.prompt("Copy this link:", shareUrl);
  }
});

/* Settings modal */

const settingsButton = document.getElementById("settings-button");
const settingsModal = document.getElementById("settings-modal");
const settingsCloseButton = document.getElementById("settings-close-button");

settingsButton.addEventListener("click", () => {
  settingsModal.showModal();
});

settingsCloseButton.addEventListener("click", () => {
  settingsModal.close();
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.close();
  }
});

const clearStorageButton = document.getElementById("clear-storage-button");
const clearStorageConfirm = document.getElementById("clear-storage-confirm");
const clearStorageCancelButton = document.getElementById(
  "clear-storage-cancel-button"
);
const clearStorageConfirmButton = document.getElementById(
  "clear-storage-confirm-button"
);

function resetClearStorageConfirm() {
  clearStorageConfirm.hidden = true;
  clearStorageButton.hidden = false;
}

clearStorageButton.addEventListener("click", () => {
  clearStorageButton.hidden = true;
  clearStorageConfirm.hidden = false;
});

clearStorageCancelButton.addEventListener("click", resetClearStorageConfirm);

clearStorageConfirmButton.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

settingsModal.addEventListener("close", resetClearStorageConfirm);

/* Search modal */

const searchButton = document.getElementById("search-button");
const searchModal = document.getElementById("search-modal");
const searchCloseButton = document.getElementById("search-close-button");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

function renderSearchStatus(message) {
  searchResults.innerHTML = `<div class="search-status">${message}</div>`;
}

function renderSearchResults(results, query) {
  if (results.length === 0) {
    renderSearchStatus(`No chapters mention "${escapeHtml(query)}".`);
    return;
  }
  const html = results
    .map(({ chapterIndex, matches }) => {
      const snippetsHtml = matches
        .map(
          ({ translation, snippet }) =>
            `<div class="search-snippet"><span class="snippet-translator">${escapeHtml(
              translation
            )}:</span>${snippet}</div>`
        )
        .join("");
      return (
        `<div class="search-result" data-chapter-index="${chapterIndex}" tabindex="0" role="button">` +
        `<div class="search-result-header">` +
        `<span>Chapter ${chapterIndex + 1}</span>` +
        `<span class="search-result-count">${matches.length} of ${allTranslations.length} translations</span>` +
        `</div>` +
        snippetsHtml +
        `</div>`
      );
    })
    .join("");
  searchResults.innerHTML = html;
}

let lastSearchResults = [];

function runSearch() {
  const query = searchInput.value.trim();
  if (query.length < SEARCH_MIN_LENGTH) {
    lastSearchResults = [];
    renderSearchStatus("Type at least 2 characters to search.");
    return;
  }
  lastSearchResults = searchTranslations(query);
  renderSearchResults(lastSearchResults, query);
}

let searchDebounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(runSearch, 180);
});


function setSelectedTranslations(translations) {
  state.selectedTranslations = translations.slice();
  storeSelectedTranslations();
  renderTranslationList();
}

function jumpToSearchResult(resultEl) {
  const chapterIndex = parseInt(resultEl.getAttribute("data-chapter-index"), 10);
  const result = lastSearchResults.find((r) => r.chapterIndex === chapterIndex);
  if (result) {
    setSelectedTranslations(result.matches.map((m) => m.translation));
  }
  viewChapter(chapterIndex);
  searchModal.close();
}

searchResults.addEventListener("click", (e) => {
  const result = e.target.closest(".search-result");
  if (result) jumpToSearchResult(result);
});

searchResults.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const result = e.target.closest(".search-result");
  if (!result) return;
  e.preventDefault();
  jumpToSearchResult(result);
});

function resetSearchModal() {
  searchInput.value = "";
  lastSearchResults = [];
  renderSearchStatus("Search across all 10 translations.");
}

searchButton.addEventListener("click", () => {
  searchModal.showModal();
  searchInput.focus();
});

searchCloseButton.addEventListener("click", () => {
  searchModal.close();
});

searchModal.addEventListener("click", (e) => {
  if (e.target === searchModal) {
    searchModal.close();
  }
});

searchModal.addEventListener("close", () => {
  resetSearchModal();
});

resetSearchModal();

function refreshCurrentChapter() {
  renderTranslationCards(state.currentChapterIndex, false);
}

/* Bookmarks */

const displayArea = document.getElementById("display");

displayArea.addEventListener("click", (e) => {
  const toggle = e.target.closest(".bookmark-toggle");
  if (!toggle) return;
  toggleArrayItem(state.bookmarkedChapters, state.currentChapterIndex + 1);
  storeBookmarkedChapters();
  const nowBookmarked = state.bookmarkedChapters.includes(
    state.currentChapterIndex + 1
  );
  document.querySelectorAll("#display .bookmark-toggle").forEach((btn) => {
    btn.classList.toggle("bookmarked", nowBookmarked);
    btn.setAttribute("aria-pressed", nowBookmarked);
    const label = nowBookmarked ? "Remove star" : "Star this chapter";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  });
  renderChapterList();
});

/* Chapter filter (Chapters tab) */

const resetUnreadButton = document.getElementById("reset-unread-button");

/* Remembered the same way the tab is. The stored values are the names
 * renderChapterList branches on, so "bookmarked" is what the Starred button
 * writes. */
setupChoiceSetting({
  storageKey: "chapterListFilter",
  fallback: "unread",
  choices: [
    { value: "all", buttonId: "chapter-filter-all" },
    { value: "unread", buttonId: "chapter-filter-unread" },
    { value: "bookmarked", buttonId: "chapter-filter-bookmarked" },
  ],
  apply(filter) {
    state.chapterListFilter = filter;
    resetUnreadButton.hidden = filter !== "unread";
    renderChapterList();
  },
});

resetUnreadButton.addEventListener("click", () => {
  localStorage.removeItem("readChapters");
  state.readChapters = [];
  renderChapterList();
});

/* Library modal */

const libraryButton = document.getElementById("library-button");
const libraryModal = document.getElementById("library-modal");
const libraryCloseButton = document.getElementById("library-close-button");
const libraryPanelTranslations = document.getElementById(
  "library-panel-translations"
);
const libraryPanelChapters = document.getElementById(
  "library-panel-chapters"
);
const selectAllTranslationsButton = document.getElementById(
  "select-all-translations-button"
);
const deselectAllTranslationsButton = document.getElementById(
  "deselect-all-translations-button"
);

/* The tab a reader last used is the tab the library opens on, which is why
 * nothing resets it when the dialog closes. */
setupChoiceSetting({
  storageKey: "libraryTab",
  fallback: "translations",
  activeAttribute: "aria-selected",
  choices: [
    { value: "translations", buttonId: "library-tab-translations" },
    { value: "chapters", buttonId: "library-tab-chapters" },
  ],
  apply(tab) {
    libraryPanelTranslations.hidden = tab !== "translations";
    libraryPanelChapters.hidden = tab === "translations";
    if (tab === "chapters") renderChapterList();
  },
});

/* Appends the tail instead of replacing the selection, so an order the reader
 * has set survives selecting the rest and the rows they had only gain a
 * checkmark. */
selectAllTranslationsButton.addEventListener("click", () => {
  setSelectedTranslations(
    state.selectedTranslations.concat(
      alphabeticalTranslations.filter(
        (name) => !state.selectedTranslations.includes(name)
      )
    )
  );
  refreshCurrentChapter();
});

deselectAllTranslationsButton.addEventListener("click", () => {
  setSelectedTranslations([]);
  refreshCurrentChapter();
});

libraryButton.addEventListener("click", () => {
  libraryModal.showModal();
});

libraryCloseButton.addEventListener("click", () => {
  libraryModal.close();
});

libraryModal.addEventListener("click", (e) => {
  if (e.target === libraryModal) {
    libraryModal.close();
  }
});
