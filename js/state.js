/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * Everything the reading page keeps between renders.
 *
 * These are genuinely shared: the card renderer reads the selection the
 * library list edits, and both history and the chapter list move the chapter
 * on screen. A module cannot assign to a binding it imports, so they sit on
 * one object rather than as separate exports — `state.currentChapterIndex = n`
 * works from anywhere, which is what the single-file version relied on.
 *
 * Every localStorage key the reading page owns is written here, so what
 * persists, and under what name, is one thing to read rather than nine.
 */

import {
  allTranslations,
  getRandomTranslations,
  getSharedTranslationsFromUrl,
} from "./catalog.js";

export const state = {
  /* Cards appear in this order, and the library list shows the same one. */
  selectedTranslations:
    getSharedTranslationsFromUrl() ||
    JSON.parse(localStorage.getItem("selectedTranslations")) ||
    getRandomTranslations(allTranslations, 3),

  readChapters: JSON.parse(localStorage.getItem("readChapters")) || [],
  bookmarkedChapters:
    JSON.parse(localStorage.getItem("bookmarkedChapters")) || [],

  /* Which chapters the Chapters tab lists. */
  chapterListFilter: "unread",

  /* An append-only log of the chapters shown, and a negative offset from its
   * end: -1 is the newest entry. */
  readOrder: JSON.parse(localStorage.getItem("readOrder")) || [],
  historyIndex: -1,

  currentChapterIndex: undefined,
};

export function storeSelectedTranslations() {
  localStorage.setItem(
    "selectedTranslations",
    JSON.stringify(state.selectedTranslations)
  );
}

export function storeReadChapters() {
  localStorage.setItem("readChapters", JSON.stringify(state.readChapters));
}

export function storeBookmarkedChapters() {
  localStorage.setItem(
    "bookmarkedChapters",
    JSON.stringify(state.bookmarkedChapters)
  );
}

export function storeReadOrder() {
  localStorage.setItem("readOrder", JSON.stringify(state.readOrder));
}

export function storeHistoryIndex() {
  localStorage.setItem("historyIndex", state.historyIndex);
}

/* The chapter to reopen when landing mode is Resume. Always the chapter just
 * put on screen, so it is written from currentChapterIndex rather than passed
 * the same value a second time. */
export function storeLastChapterIndex() {
  localStorage.setItem("lastChapterIndex", state.currentChapterIndex);
}
