/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * The translation cards: the chapter as every selected translation renders it.
 *
 * Redrawing the library list when a shuffle rewrites the order is the one
 * thing this reaches outside itself for, and it reaches downwards — the list
 * module knows nothing about cards.
 */

import { dao } from "./dao.js";
import { buyUrl, catalogEntry, rightsLabel } from "./catalog.js";
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
  const entry = catalogEntry(translation);
  const reference = entry ? entry.citation : "";
  const buy = buyUrl(translation);
  /* A translation still in print is worth buying and a translation in the
   * public domain is worth reading for nothing, so a card offers whichever
   * applies rather than the same link twice. Legge is the one that has both. */
  const links = [
    entry && entry.freeText
      ? `<a href="${escapeHtml(
          entry.freeText
        )}" class="trans-link" target="_blank" rel="noopener noreferrer">Read free</a>`
      : "",
    buy
      ? `<a href="${escapeHtml(
          buy
        )}" class="trans-link" target="_blank" rel="noopener noreferrer">Buy the book</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");
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
      <span class="trans-ref">${escapeHtml(reference)}</span>
      <span class="trans-rights">${escapeHtml(rightsLabel(translation))}</span>
      <span class="trans-links">${links}</span>
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
