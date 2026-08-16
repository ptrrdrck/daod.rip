/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 * Dao Drip
 * Displays the same random chapter of the Daodejing
 * from characteristically distinct translations.
 */

const allTranslations = Object.keys(dao);

function getRandomTranslations(arr, num) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

const translationCheckboxes = [
  { checkBoxId: "mitchell-checkbox", name: "Stephen Mitchell" },
  { checkBoxId: "fengEnglish-checkbox", name: "Gia-Fu Feng & Jane English" },
  {
    checkBoxId: "addissLombardo-checkbox",
    name: "Stephen Addiss & Stanley Lombardo",
  },
  { checkBoxId: "lin-checkbox", name: "Derek Lin" },
  { checkBoxId: "legge-checkbox", name: "James Legge" },
  { checkBoxId: "leguin-checkbox", name: "Ursula K. Le Guin" },
  { checkBoxId: "lau-checkbox", name: "D. C. Lau" },
  { checkBoxId: "yutang-checkbox", name: "Lin Yutang" },
  { checkBoxId: "henricks-checkbox", name: "Robert G. Henricks" },
  { checkBoxId: "redpine-checkbox", name: "Red Pine (Bill Porter)" },
];

const slugToName = Object.fromEntries(
  translationCheckboxes.map(({ checkBoxId, name }) => [
    checkBoxId.replace("-checkbox", ""),
    name,
  ])
);
const nameToSlug = Object.fromEntries(
  translationCheckboxes.map(({ checkBoxId, name }) => [
    name,
    checkBoxId.replace("-checkbox", ""),
  ])
);

function getSharedTranslationsFromUrl() {
  const t = new URLSearchParams(window.location.search).get("t");
  if (!t) {
    return null;
  }
  const names = t
    .split(",")
    .map((slug) => slugToName[slug])
    .filter(Boolean);
  return names.length ? names : null;
}

let selectedTranslations =
  getSharedTranslationsFromUrl() ||
  JSON.parse(localStorage.getItem("selectedTranslations")) ||
  getRandomTranslations(allTranslations, 3);

localStorage.setItem(
  "selectedTranslations",
  JSON.stringify(selectedTranslations)
);

localStorage.getItem("shuffle-control") ||
  localStorage.setItem("shuffle-control", "true");

let readChapters = JSON.parse(localStorage.getItem("readChapters")) || [];
let bookmarkedChapters =
  JSON.parse(localStorage.getItem("bookmarkedChapters")) || [];

const totalChapters = dao[allTranslations[0]].length;
const chapterListPlaceholder = document.getElementById(
  "chapter-list-placeholder"
);
let chapterListFilter = "unread";

function getSharedChapterFromUrl() {
  const ch = parseInt(new URLSearchParams(window.location.search).get("ch"), 10);
  return Number.isInteger(ch) && ch >= 1 && ch <= totalChapters ? ch : null;
}

const sharedChapter = getSharedChapterFromUrl();

function renderChapterList() {
  const existingTable = document.getElementById("chapter-list");
  if (existingTable) existingTable.remove();
  const existingEmpty =
    chapterListPlaceholder.querySelector(".chapter-list-empty");
  if (existingEmpty) existingEmpty.remove();

  const chapters = [];
  for (let n = 1; n <= totalChapters; n++) {
    if (chapterListFilter === "all") {
      chapters.push(n);
    } else if (chapterListFilter === "unread" && !readChapters.includes(n)) {
      chapters.push(n);
    } else if (
      chapterListFilter === "bookmarked" &&
      bookmarkedChapters.includes(n)
    ) {
      chapters.push(n);
    }
  }

  if (chapters.length === 0) {
    const empty = document.createElement("P");
    empty.classList.add("chapter-list-empty");
    empty.textContent =
      chapterListFilter === "bookmarked"
        ? "No starred chapters yet. Tap the star while reading to star a chapter."
        : "You've read every chapter. Nice.";
    chapterListPlaceholder.appendChild(empty);
    return;
  }

  const root = document.createElement("TABLE");
  root.setAttribute("id", "chapter-list");
  chapterListPlaceholder.appendChild(root);
  chapters.forEach((n) => {
    const link = document.createElement("A");
    link.setAttribute(
      "href",
      `javascript:selectedChapter = ${n}; viewChapter(${n} - 1);`
    );
    link.classList.add("chapter-link");
    link.innerText = `${n}`;
    const cell = document.createElement("TD");
    cell.appendChild(link);
    root.appendChild(cell);
  });
}

/**
 * History control
 */

let readOrder = JSON.parse(localStorage.getItem("readOrder")) || [];
let historyIndex = -1;
let prevChapter =
  readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
let prevChapterTwo;
let prevChapterThree;
let nextChapter = readOrder[(historyIndex + 1) % readOrder.length];
let nextChapterTwo;
let nextChapterThree;

const prevChapterDisplay = document.getElementById("prev-ch");
const prevChapterTwoDisplay = document.getElementById("prev-ch-2");
const prevChapterThreeDisplay = document.getElementById("prev-ch-3");
const nextChapterDisplay = document.getElementById("next-ch");
const nextChapterTwoDisplay = document.getElementById("next-ch-2");
const nextChapterThreeDisplay = document.getElementById("next-ch-3");
const seekBackButton = document.getElementById("ch-seek-back");
const seekFwdButton = document.getElementById("ch-seek-fwd");
const historyDisplay = document.getElementById("history-nav");

function hideUndefinedHistory() {
  const historyChapters = document.getElementsByClassName("history");
  for (let i = 0; i < historyChapters.length; i++) {
    const historyChapter = historyChapters[i];
    if (historyChapter.innerText == "undefined") {
      historyChapter.classList.add("history-hide");
    } else {
      historyChapter.classList.remove("history-hide");
    }
  }
  seekBackButton.style.display =
    prevChapter === undefined &&
    prevChapterTwo === undefined &&
    prevChapterThree === undefined
      ? "none"
      : "inline-block";
  seekFwdButton.style.display =
    nextChapter === undefined &&
    nextChapterTwo === undefined &&
    nextChapterThree === undefined
      ? "none"
      : "inline-block";
  historyDisplay.style.display =
    prevChapter === undefined &&
    prevChapterTwo === undefined &&
    prevChapterThree === undefined &&
    nextChapter === undefined &&
    nextChapterTwo === undefined &&
    nextChapterThree === undefined
      ? "none"
      : "flex";
}

hideUndefinedHistory();

function updatePreviousChapters() {
  if (readOrder.length == 2) {
    prevChapter =
      readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
    [prevChapterTwo, prevChapterThree] = [undefined, undefined];
    prevChapterDisplay.innerHTML = prevChapter;
  } else if (readOrder.length == 3) {
    prevChapter =
      readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
    prevChapterTwo =
      readOrder[(historyIndex + readOrder.length - 2) % readOrder.length];
    prevChapterThree = undefined;
    prevChapterDisplay.innerHTML = prevChapter;
    prevChapterTwoDisplay.innerHTML = prevChapterTwo;
  } else if (readOrder.length > 3) {
    prevChapter =
      readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
    prevChapterTwo =
      readOrder[(historyIndex + readOrder.length - 2) % readOrder.length];
    prevChapterThree =
      readOrder[(historyIndex + readOrder.length - 3) % readOrder.length];
    prevChapterDisplay.innerHTML = prevChapter;
    prevChapterTwoDisplay.innerHTML = prevChapterTwo;
    prevChapterThreeDisplay.innerHTML = prevChapterThree;
  }
}

function updateNextChapters() {
  if (historyIndex == -1) {
    [nextChapter, nextChapterTwo, nextChapterThree] = [
      undefined,
      undefined,
      undefined,
    ];
  } else if (historyIndex == -2) {
    nextChapter =
      readOrder[(historyIndex + readOrder.length + 1) % readOrder.length];
    [nextChapterTwo, nextChapterThree] = [undefined, undefined];
  } else if (historyIndex == -3) {
    nextChapter =
      readOrder[(historyIndex + readOrder.length + 1) % readOrder.length];
    nextChapterTwo =
      readOrder[(historyIndex + readOrder.length + 2) % readOrder.length];
    nextChapterThree = undefined;
  } else {
    nextChapter =
      readOrder[(historyIndex + readOrder.length + 1) % readOrder.length];
    nextChapterTwo =
      readOrder[(historyIndex + readOrder.length + 2) % readOrder.length];
    nextChapterThree =
      readOrder[(historyIndex + readOrder.length + 3) % readOrder.length];
  }
  nextChapterDisplay.innerHTML = nextChapter;
  nextChapterTwoDisplay.innerHTML = nextChapterTwo;
  nextChapterThreeDisplay.innerHTML = nextChapterThree;
}

function updateHistory(index = -1) {
  historyIndex = index;
  localStorage.setItem("historyIndex", historyIndex);
  updatePreviousChapters();
  updateNextChapters();
  hideUndefinedHistory();
}

/* Random chapter selection */

let currentChapterIndex;

const displayArea = document.getElementById("display");
const dripButton = document.getElementById("drip-button");
const dripAgainButton = document.getElementById("drip-again-button");
const yinYang = document.getElementById("yin-yang");

function randNumb(num) {
  return Math.floor(Math.random() * num);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildTranslationCard(translation, chapterIndex) {
  const isBookmarked = bookmarkedChapters.includes(chapterIndex + 1);
  return (
    `<div class="translation">` +
    `<div class="translation-header">` +
    `<span class="chapter-number">Chapter ${chapterIndex + 1}</span>` +
    `<span class="chapter-translator">${translation}</span>` +
    `</div>` +
    `<button type="button" class="bookmark-toggle${
      isBookmarked ? " bookmarked" : ""
    }" ` +
    `aria-pressed="${isBookmarked}" ` +
    `aria-label="${
      isBookmarked ? "Remove star" : "Star this chapter"
    }" ` +
    `title="${isBookmarked ? "Remove star" : "Star this chapter"}">` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">` +
    `<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />` +
    `</svg></button>` +
    `<p class="translation-text">${dao[translation][chapterIndex]}</p>` +
    `<div class="trans-info">` +
    `<span class="trans-ref">${sources[translation][2]}</span><br />` +
    `<a href="${sources[translation][1]}" class="trans-link" target="_blank">Source</a>` +
    `</div>` +
    `</div>`
  );
}

function renderTranslationCards(chapterIndex, shuffleCards) {
  if (selectedTranslations.length === 0) {
    displayArea.innerHTML =
      '<p class="empty-state">No translations selected — pick some in the Library.</p>';
    return;
  }
  let message = [];
  selectedTranslations.forEach(function (translation) {
    message.push(buildTranslationCard(translation, chapterIndex));
  });
  if (shuffleCards && localStorage.getItem("shuffle-control") === "true") {
    message = shuffle(message);
  }
  displayArea.innerHTML = message.join("");
}

/* Search */

const SEARCH_MIN_LENGTH = 2;
const SEARCH_SNIPPET_RADIUS = 40;

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
  if (readChapters.indexOf(randomChapter + 1) === -1) {
    readChapters.push(randomChapter + 1);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));
  renderChapterList();
  readOrder.push(randomChapter + 1);
  localStorage.setItem("readOrder", JSON.stringify(readOrder));
  updateHistory();
  currentChapterIndex = randomChapter;
  localStorage.setItem("lastChapterIndex", randomChapter);
}

function resumeChapter(chapter) {
  renderTranslationCards(chapter, true);
  currentChapterIndex = chapter;
  localStorage.setItem("lastChapterIndex", chapter);
  renderChapterList();
  const storedHistoryIndex = localStorage.getItem("historyIndex");
  const restoredHistoryIndex =
    storedHistoryIndex !== null ? parseInt(storedHistoryIndex, 10) : -1;
  updateHistory(restoredHistoryIndex);
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
});

dripAgainButton.addEventListener("click", () => {
  newRandomChapter();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

yinYang.addEventListener("click", () => {
  newRandomChapter();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* History chapter selection */

function getHistoryChapter(chapter) {
  renderTranslationCards(chapter - 1, false);
  currentChapterIndex = chapter - 1;
  localStorage.setItem("lastChapterIndex", chapter - 1);
}

function seekBack() {
  historyIndex--;
  localStorage.setItem("historyIndex", historyIndex);
  updatePreviousChapters();
  updateNextChapters();
  hideUndefinedHistory();
}

function seekFwd() {
  historyIndex++;
  localStorage.setItem("historyIndex", historyIndex);
  updatePreviousChapters();
  updateNextChapters();
  hideUndefinedHistory();
}

seekBackButton.addEventListener("click", () => {
  getHistoryChapter(prevChapter);
  seekBack();
});

seekFwdButton.addEventListener("click", () => {
  getHistoryChapter(nextChapter);
  seekFwd();
});

/* Manual chapter selection */

let selectedChapter = 1;

const chapterSelectInput = document.getElementById("chapter-select-input");
const chapterSelectButton = document.getElementById("chapter-select-button");
const addButton = document.getElementById("add-button");
const subtractButton = document.getElementById("subtract-button");

const handleValueChange = (value) => {
  if (value <= 1) {
    subtractButton.setAttribute("disabled", true);
  } else if (value < 81) {
    subtractButton.removeAttribute("disabled");
    addButton.removeAttribute("disabled");
  } else if ((value = 81)) {
    addButton.setAttribute("disabled", true);
  } else {
    subtractButton.setAttribute("disabled", true);
  }
};

if (sharedChapter !== null) {
  chapterSelectInput.value = sharedChapter;
  selectedChapter = sharedChapter;
  handleValueChange(sharedChapter);
}

addButton.addEventListener("click", () => {
  chapterSelectInput.value = +chapterSelectInput.value + 1;
  selectedChapter = chapterSelectInput.valueAsNumber;
  handleValueChange(chapterSelectInput.value);
});

subtractButton.addEventListener("click", () => {
  chapterSelectInput.value = +chapterSelectInput.value - 1;
  selectedChapter = chapterSelectInput.valueAsNumber;
  handleValueChange(chapterSelectInput.value);
});

chapterSelectInput.addEventListener("click", function (e) {
  chapterSelectInput.value = "";
});

chapterSelectInput.addEventListener("input", function (e) {
  if (this.value > 81) {
    this.value = 81;
  }
  if (this.value < 1) {
    this.value = 1;
  }
  selectedChapter = e.target.valueAsNumber;
  handleValueChange(e.target.value);
});

chapterSelectInput.addEventListener("change", function (e) {
  selectedChapter = e.target.valueAsNumber;
});

function viewChapter(chapter) {
  renderTranslationCards(chapter, true);
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (readChapters.indexOf(chapter + 1) === -1) {
    readChapters.push(chapter + 1);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));
  renderChapterList();
  readOrder.push(chapter + 1);
  localStorage.setItem("readOrder", JSON.stringify(readOrder));
  updateHistory();
  currentChapterIndex = chapter;
  localStorage.setItem("lastChapterIndex", chapter);
}

chapterSelectInput.onkeydown = function (e) {
  if (e.keyCode == 13) {
    selectedChapter = chapterSelectInput.valueAsNumber;
    viewChapter(selectedChapter - 1);
  }
};

chapterSelectButton.addEventListener("click", () => {
  selectedChapter = chapterSelectInput.valueAsNumber;
  viewChapter(selectedChapter - 1);
});

/* Share link */

const topShareButton = document.getElementById("top-share-button");
const topShareButtonIcon = topShareButton.innerHTML;
const topShareButtonCheckIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>';

topShareButton.addEventListener("click", async () => {
  const params = new URLSearchParams();
  params.set("ch", currentChapterIndex + 1);
  params.set(
    "t",
    selectedTranslations.map((name) => nameToSlug[name]).join(",")
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
  translationCheckboxes.forEach(({ checkBoxId, name }) => {
    const checkbox = document.getElementById(checkBoxId);
    if (checkbox) checkbox.checked = translations.includes(name);
  });
  selectedTranslations = translations.slice();
  localStorage.setItem(
    "selectedTranslations",
    JSON.stringify(selectedTranslations)
  );
}

function selectOnlyMatchedTranslations(translations) {
  setSelectedTranslations(translations);
}

function jumpToSearchResult(resultEl) {
  const chapterIndex = parseInt(resultEl.getAttribute("data-chapter-index"), 10);
  const result = lastSearchResults.find((r) => r.chapterIndex === chapterIndex);
  if (result) {
    selectOnlyMatchedTranslations(result.matches.map((m) => m.translation));
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

/* Translation control */

translationCheckboxes.forEach(({ checkBoxId, name }) => {
  if (selectedTranslations.includes(name)) {
    localStorage.setItem(checkBoxId, "true");
  } else {
    localStorage.setItem(checkBoxId, "false");
  }
});

function checkBoxes() {
  const boxes = document.querySelectorAll("input[type='checkbox']");
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    if (box.hasAttribute("store")) {
      setupBox(box);
    }
  }
  function setupBox(box) {
    const storageId = box.getAttribute("store");
    const oldVal = localStorage.getItem(storageId);
    box.checked = oldVal === "true" ? true : false;

    box.addEventListener("change", function () {
      localStorage.setItem(storageId, this.checked);
    });
  }
}

checkBoxes();

function toggleArrayItem(array, item) {
  const i = array.indexOf(item);
  if (i === -1) {
    array.push(item);
  } else {
    array.splice(i, 1);
  }
}

function refreshCurrentChapter() {
  renderTranslationCards(currentChapterIndex, false);
}

translationCheckboxes.forEach(({ checkBoxId, name }) => {
  document.getElementById(checkBoxId).addEventListener("change", () => {
    toggleArrayItem(selectedTranslations, name);
    refreshCurrentChapter();
    localStorage.setItem(
      "selectedTranslations",
      JSON.stringify(selectedTranslations)
    );
  });
});

/* Bookmarks */

displayArea.addEventListener("click", (e) => {
  const toggle = e.target.closest(".bookmark-toggle");
  if (!toggle) return;
  toggleArrayItem(bookmarkedChapters, currentChapterIndex + 1);
  localStorage.setItem(
    "bookmarkedChapters",
    JSON.stringify(bookmarkedChapters)
  );
  const nowBookmarked = bookmarkedChapters.includes(currentChapterIndex + 1);
  document.querySelectorAll("#display .bookmark-toggle").forEach((btn) => {
    btn.classList.toggle("bookmarked", nowBookmarked);
    btn.setAttribute("aria-pressed", nowBookmarked);
    const label = nowBookmarked ? "Remove star" : "Star this chapter";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  });
  renderChapterList();
});

/* Library modal */

const libraryButton = document.getElementById("library-button");
const libraryModal = document.getElementById("library-modal");
const libraryCloseButton = document.getElementById("library-close-button");
const libraryTabTranslations = document.getElementById(
  "library-tab-translations"
);
const libraryTabChapters = document.getElementById("library-tab-chapters");
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

function setLibraryTab(tab) {
  const isTranslations = tab === "translations";
  libraryTabTranslations.classList.toggle("active", isTranslations);
  libraryTabTranslations.setAttribute("aria-selected", isTranslations);
  libraryTabChapters.classList.toggle("active", !isTranslations);
  libraryTabChapters.setAttribute("aria-selected", !isTranslations);
  libraryPanelTranslations.hidden = !isTranslations;
  libraryPanelChapters.hidden = isTranslations;
  if (!isTranslations) renderChapterList();
}

libraryTabTranslations.addEventListener("click", () =>
  setLibraryTab("translations")
);
libraryTabChapters.addEventListener("click", () => setLibraryTab("chapters"));

selectAllTranslationsButton.addEventListener("click", () => {
  setSelectedTranslations(allTranslations);
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

libraryModal.addEventListener("close", () => {
  setLibraryTab("translations");
});

/* Chapter filter (Chapters tab) */

const chapterFilterAllButton = document.getElementById("chapter-filter-all");
const chapterFilterUnreadButton = document.getElementById(
  "chapter-filter-unread"
);
const chapterFilterBookmarkedButton = document.getElementById(
  "chapter-filter-bookmarked"
);
const resetUnreadButton = document.getElementById("reset-unread-button");

function setChapterListFilter(filter) {
  chapterListFilter = filter;
  chapterFilterAllButton.classList.toggle("active", filter === "all");
  chapterFilterAllButton.setAttribute("aria-pressed", filter === "all");
  chapterFilterUnreadButton.classList.toggle("active", filter === "unread");
  chapterFilterUnreadButton.setAttribute("aria-pressed", filter === "unread");
  chapterFilterBookmarkedButton.classList.toggle(
    "active",
    filter === "bookmarked"
  );
  chapterFilterBookmarkedButton.setAttribute(
    "aria-pressed",
    filter === "bookmarked"
  );
  resetUnreadButton.hidden = filter !== "unread";
  renderChapterList();
}

chapterFilterAllButton.addEventListener("click", () =>
  setChapterListFilter("all")
);
chapterFilterUnreadButton.addEventListener("click", () =>
  setChapterListFilter("unread")
);
chapterFilterBookmarkedButton.addEventListener("click", () =>
  setChapterListFilter("bookmarked")
);

resetUnreadButton.addEventListener("click", () => {
  localStorage.removeItem("readChapters");
  readChapters = [];
  renderChapterList();
});
