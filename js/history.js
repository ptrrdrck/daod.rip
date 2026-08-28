/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * History control
 *
 * readOrder is an append-only log of chapter numbers in the order they were
 * shown. historyIndex is a negative offset from the end of that log: -1 is the
 * newest entry, -2 the one before it. So the chapter currently on screen sits
 * at readOrder[readOrder.length + historyIndex], and everything the nav shows
 * is a lookup at an offset from there.
 *
 * Reading the log and drawing the nav. Opening a chapter from it is a main.js
 * action, which is why the seek buttons are exported rather than wired here.
 */

import { state, storeHistoryIndex } from "./state.js";

/* Ordered outwards from the reader: nearest chapter first. */
const prevChapterSlots = [
  document.getElementById("prev-ch"),
  document.getElementById("prev-ch-2"),
  document.getElementById("prev-ch-3"),
];
const nextChapterSlots = [
  document.getElementById("next-ch"),
  document.getElementById("next-ch-2"),
  document.getElementById("next-ch-3"),
];
export const seekBackButton = document.getElementById("ch-seek-back");
export const seekFwdButton = document.getElementById("ch-seek-fwd");
const historyDisplay = document.getElementById("history-nav");
const displayArea = document.getElementById("display");

export /* The chapter `offset` places before (negative) or after (positive) the one on
 * screen, or undefined when that position falls outside the log. */
function historyChapterAt(offset) {
  const position = state.readOrder.length + state.historyIndex + offset;
  return position >= 0 && position < state.readOrder.length
    ? state.readOrder[position]
    : undefined;
}

/* Fills every slot from the log and reports what it put there, so nothing has
 * to read the rendered text back to find out. */
function renderHistorySlots(slots, direction) {
  return slots.map((slot, depth) => {
    const chapter = historyChapterAt(direction * (depth + 1));
    slot.textContent = chapter === undefined ? "" : String(chapter);
    slot.classList.toggle("history-hide", chapter === undefined);
    return chapter;
  });
}

export function renderHistory() {
  const previous = renderHistorySlots(prevChapterSlots, -1);
  const next = renderHistorySlots(nextChapterSlots, 1);

  /* Slots run outwards, so an empty nearest slot means the rest are empty. */
  const hasPrevious = previous[0] !== undefined;
  const hasNext = next[0] !== undefined;
  seekBackButton.style.display = hasPrevious ? "inline-block" : "none";
  seekFwdButton.style.display = hasNext ? "inline-block" : "none";

  const hasHistory = hasPrevious || hasNext;
  historyDisplay.style.display = hasHistory ? "flex" : "none";
  if (hasHistory) {
    /* Measured after the display change above, so the nav has a layout. */
    document.documentElement.style.setProperty(
      "--history-nav-height",
      `${historyDisplay.offsetHeight}px`
    );
    displayArea.classList.remove("history-collapsed");
  } else {
    displayArea.classList.add("history-collapsed");
  }
}

export function setHistoryIndex(index = -1) {
  state.historyIndex = index;
  storeHistoryIndex();
  renderHistory();
}
