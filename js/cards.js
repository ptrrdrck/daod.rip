/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * The translation cards: the chapter as every selected translation renders it.
 *
 * Redrawing the library list when a shuffle rewrites the order is the one
 * thing this reaches outside itself for, and it reaches downwards — the list
 * module knows nothing about cards.
 */

import { dao, sources } from "./dao.js";
import {
  state,
  storeSelectedTranslations,
  translationOrderIsShuffled,
} from "./state.js";
import { renderTranslationList } from "./translation-list.js";
import { escapeHtml, shuffle } from "./util.js";

const displayArea = document.getElementById("display");

export function buildTranslationCard(translation, chapterIndex) {
  const isBookmarked = state.bookmarkedChapters.includes(chapterIndex + 1);
  const starLabel = isBookmarked ? "Remove star" : "Star this chapter";
  const sourceUrl = sources[translation][1];
  const reference = sources[translation][2];
  return `<div class="translation">
    <div class="translation-header">
      <span class="chapter-number">Chapter ${chapterIndex + 1}</span>
      <span class="chapter-translator">${escapeHtml(translation)}</span>
    </div>
    <button
      type="button"
      class="bookmark-toggle${isBookmarked ? " bookmarked" : ""}"
      aria-pressed="${isBookmarked}"
      aria-label="${starLabel}"
      title="${starLabel}"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </button>
    <p class="translation-text">${escapeHtml(dao[translation][chapterIndex])}</p>
    <div class="trans-info">
      <span class="trans-ref">${escapeHtml(reference)}</span><br />
      <a href="${escapeHtml(
        sourceUrl
      )}" class="trans-link" target="_blank" rel="noopener noreferrer">Source</a>
    </div>
  </div>`;
}

/* Cards come out in selection order, always. Shuffling rewrites
 * that array rather than the rendered cards, which is what keeps the library
 * list honest about what is on screen. Only the calls that open a chapter
 * pass shuffleCards; redrawing after a selection or order edit must not
 * reshuffle the thing the reader just set. */
export function renderTranslationCards(chapterIndex, shuffleCards) {
  if (shuffleCards && translationOrderIsShuffled()) {
    shuffle(state.selectedTranslations);
    storeSelectedTranslations();
    renderTranslationList();
  }
  if (state.selectedTranslations.length === 0) {
    displayArea.innerHTML =
      '<p class="empty-state">No translations selected — pick some in the Library.</p>';
    return;
  }
  displayArea.innerHTML = state.selectedTranslations
    .map((translation) => buildTranslationCard(translation, chapterIndex))
    .join("");
}
