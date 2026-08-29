/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * The Chapters tab: the chapter numbers the current filter admits, drawn as
 * links into the placeholder that outlives them.
 *
 * Rendering only. Which filter is set, and what a click on a chapter does,
 * are both main.js's business.
 */

import { totalChapters } from "./catalog.js";
import { state } from "./state.js";

export const chapterListPlaceholder = document.getElementById(
  "chapter-list-placeholder"
);

export function renderChapterList() {
  const existingTable = document.getElementById("chapter-list");
  if (existingTable) existingTable.remove();
  const existingEmpty =
    chapterListPlaceholder.querySelector(".chapter-list-empty");
  if (existingEmpty) existingEmpty.remove();

  const chapters = [];
  for (let n = 1; n <= totalChapters; n++) {
    if (state.chapterListFilter === "all") {
      chapters.push(n);
    } else if (
      state.chapterListFilter === "unread" &&
      !state.readChapters.includes(n)
    ) {
      chapters.push(n);
    } else if (
      state.chapterListFilter === "bookmarked" &&
      state.bookmarkedChapters.includes(n)
    ) {
      chapters.push(n);
    }
  }

  if (chapters.length === 0) {
    const empty = document.createElement("P");
    empty.classList.add("chapter-list-empty");
    empty.textContent =
      state.chapterListFilter === "bookmarked"
        ? "No starred chapters yet. Tap the star while reading to save a chapter to this list."
        : "You've read every chapter. Nice.";
    chapterListPlaceholder.appendChild(empty);
    return;
  }

  const root = document.createElement("TABLE");
  root.setAttribute("id", "chapter-list");
  chapterListPlaceholder.appendChild(root);
  chapters.forEach((n) => {
    const link = document.createElement("BUTTON");
    link.type = "button";
    link.classList.add("chapter-link");
    link.dataset.chapter = n;
    link.innerText = `${n}`;
    const cell = document.createElement("TD");
    cell.appendChild(link);
    root.appendChild(cell);
  });
}
