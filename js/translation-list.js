/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * Translation list (Translations tab)
 *
 * Selected translations first, in the order their cards appear, then the rest
 * alphabetically. The list is rebuilt from the selection rather than
 * edited in place, so it cannot drift from what is on screen; that is also why
 * its handlers are delegated on the container, which outlives the rows.
 *
 * Rendering only. The actions that edit the selection or its order live in
 * main.js, which is what keeps this module free of any dependency on the card
 * renderer — cards.js redraws this list when it reshuffles, and nothing here
 * reaches back the other way.
 */

import { alphabeticalTranslations, nameToSlug } from "./catalog.js";
import { state } from "./state.js";
import { escapeHtml } from "./util.js";

export const translationListEl = document.getElementById("translation-list");

const ARROW_PATHS = {
  up: "M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",
  down: "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z",
};

const ARROW_LABELS = {
  up: "Move up",
  down: "Move down",
};

function orderButtonHtml(direction, enabled) {
  const label = ARROW_LABELS[direction];
  return `<button
      type="button"
      class="button order-button"
      data-direction="${direction}"
      title="${label}"
      aria-label="${label}"
      ${enabled ? "" : "disabled"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="${ARROW_PATHS[direction]}" />
      </svg>
    </button>`;
}

function translationRowHtml(name, selected, canMoveUp, canMoveDown) {
  const checkboxId = nameToSlug[name] + "-checkbox";
  return `<div class="translation-row" data-translation="${escapeHtml(name)}">
    <label for="${checkboxId}" class="checkbox-container"
      >${escapeHtml(name)}
      <input id="${checkboxId}" type="checkbox"${selected ? " checked" : ""} />
      <span class="checkmark"></span>
    </label>
    <div class="order-buttons">
      ${orderButtonHtml("up", canMoveUp)}
      ${orderButtonHtml("down", canMoveDown)}
    </div>
  </div>`;
}

export function renderTranslationList() {
  if (!translationListEl) return;
  const unselected = alphabeticalTranslations.filter(
    (name) => !state.selectedTranslations.includes(name)
  );
  /* A selected row's down arrow is never dead: at the bottom of the block it
   * drops the translation into the unselected tail. An unselected row's up
   * arrow selects it; its down arrow has nowhere to go, the tail being sorted
   * rather than ordered. */
  const rows = state.selectedTranslations.map((name, index) =>
    translationRowHtml(name, true, index > 0, true)
  );
  if (rows.length > 0 && unselected.length > 0) {
    rows.push('<div class="translation-divider" role="separator"></div>');
  }
  unselected.forEach((name) => {
    rows.push(translationRowHtml(name, false, true, false));
  });
  translationListEl.innerHTML = rows.join("");
}
