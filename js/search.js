/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * Searching the translations and drawing the results.
 *
 * Finding matches and rendering them only. Debouncing the input, and what
 * choosing a result does to the selection and the chapter on screen, are
 * main.js actions.
 */

import { carriedTranslations, totalChapters } from "./catalog.js";
import { dao } from "./dao.js";
import { escapeHtml } from "./util.js";

export const SEARCH_MIN_LENGTH = 2;
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

export function searchTranslations(query) {
  const results = [];
  for (let chapterIndex = 0; chapterIndex < totalChapters; chapterIndex++) {
    const matches = [];
    carriedTranslations.forEach((translation) => {
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

export const searchResults = document.getElementById("search-results");

export function renderSearchStatus(message) {
  searchResults.innerHTML = `<div class="search-status">${message}</div>`;
}

export function renderSearchResults(results, query) {
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
        `<span class="search-result-count">${matches.length} of ${carriedTranslations.length} translations</span>` +
        `</div>` +
        snippetsHtml +
        `</div>`
      );
    })
    .join("");
  searchResults.innerHTML = html;
}
