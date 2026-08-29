/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * The fixed facts about what the site carries: which translations exist, how
 * they are identified and ordered, and how many chapters there are. Nothing
 * here changes as a reader uses the site, and nothing here touches the DOM.
 */

import { dao } from "./dao.js";
import { shuffle } from "./util.js";

export const allTranslations = Object.keys(dao);

export function getRandomTranslations(arr, num) {
  return shuffle(arr.slice()).slice(0, num);
}

/* Every translation the site carries. `slug` is the short identity: it is the
 * ?t= value in a share link and, suffixed with -checkbox, the id of the row's
 * input. `sortKey` is the first translator's last name, spelled out rather
 * than pulled off the end of `name`, because no rule gets "Ursula K. Le Guin",
 * "Red Pine (Bill Porter)" and "Lin Yutang" all right at once. */
export const translationCatalog = [
  { slug: "mitchell", name: "Stephen Mitchell", sortKey: "Mitchell" },
  { slug: "fengEnglish", name: "Gia-Fu Feng & Jane English", sortKey: "Feng" },
  {
    slug: "addissLombardo",
    name: "Stephen Addiss & Stanley Lombardo",
    sortKey: "Addiss",
  },
  { slug: "lin", name: "Derek Lin", sortKey: "Lin" },
  { slug: "legge", name: "James Legge", sortKey: "Legge" },
  { slug: "leguin", name: "Ursula K. Le Guin", sortKey: "Le Guin" },
  { slug: "lau", name: "D. C. Lau", sortKey: "Lau" },
  { slug: "yutang", name: "Lin Yutang", sortKey: "Yutang" },
  { slug: "henricks", name: "Robert G. Henricks", sortKey: "Henricks" },
  { slug: "redpine", name: "Red Pine (Bill Porter)", sortKey: "Red Pine" },
];

export const slugToName = Object.fromEntries(
  translationCatalog.map(({ slug, name }) => [slug, name])
);

export const nameToSlug = Object.fromEntries(
  translationCatalog.map(({ slug, name }) => [name, slug])
);

/* Where an unselected translation sits in the library list. Spaces are folded
 * out before comparing so it reads letter by letter, the way a bookshelf does:
 * Legge comes before Le Guin. */
export const alphabeticalTranslations = translationCatalog
  .slice()
  .sort((a, b) =>
    a.sortKey.replace(/\s+/g, "").localeCompare(b.sortKey.replace(/\s+/g, ""))
  )
  .map(({ name }) => name);

export const totalChapters = dao[allTranslations[0]].length;

export function getSharedTranslationsFromUrl() {
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

export function getSharedChapterFromUrl() {
  const ch = parseInt(new URLSearchParams(window.location.search).get("ch"), 10);
  return Number.isInteger(ch) && ch >= 1 && ch <= totalChapters ? ch : null;
}
