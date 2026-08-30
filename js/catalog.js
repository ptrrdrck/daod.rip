/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * The fixed facts about what the site carries: which translations exist, how
 * they are identified and ordered, how many chapters there are, and what may
 * lawfully be done with each one. Nothing here changes as a reader uses the
 * site, and nothing here touches the DOM.
 */

import { dao } from "./dao.js";
import { shuffle } from "./util.js";

export const allTranslations = Object.keys(dao);

export function getRandomTranslations(arr, num) {
  return shuffle(arr.slice()).slice(0, num);
}

/* What may be republished, and what may only be shown here.
 *
 * PUBLIC_DOMAIN applies the US rule and nothing subtler: everything published
 * in 1930 or earlier is free of copyright as of 1 January 2026. RESTRICTED is
 * everything else — a translation the site shows side by side for study,
 * which is a far narrower permission than reproducing it somewhere else, and
 * the copyright notice at the top of dao.js is what that relies on.
 *
 * There are two statuses rather than three on purpose. An earlier draft had a
 * third for translations published after 1930 and never checked for renewal,
 * which described Lin Yutang (1948) exactly. But it behaved identically to
 * RESTRICTED everywhere it mattered, and printed a hedge on the card that
 * gave a reader nothing to act on. That hedge is now moot in the one place it
 * applied: the renewal was found, filed on 14 January 1976, so Lin Yutang is
 * restricted as a fact rather than as a precaution. RIGHTS.md records it.
 *
 * This distinction is not decorative. Anything that reproduces a translation
 * away from this page — the card renderer that will feed the Instagram
 * account, above all — has to ask `quotableInFull` first, so that the corpus
 * decides what may leave the site rather than the caller remembering to. */
export const PUBLIC_DOMAIN = "public-domain";
export const RESTRICTED = "restricted";

/* Every translation the site carries. `slug` is the short identity: it is the
 * ?t= value in a share link and, suffixed with -checkbox, the id of the row's
 * input. `sortKey` is the first translator's last name, spelled out rather
 * than pulled off the end of `name`, because no rule gets "Ursula K. Le Guin",
 * "Red Pine (Bill Porter)" and "Lin Yutang" all right at once.
 *
 * `year` is the year of the translation, not of the edition linked — Feng and
 * English is a 1972 translation whose in-print printing is from 2011, and it
 * is the 1972 date that decides its copyright. `isbn` is the ISBN-13 of an
 * edition a reader can actually buy, which is what the buy link is built
 * from. `freeText` appears only where the full text is lawfully readable for
 * nothing. */
export const translationCatalog = [
  {
    slug: "mitchell",
    name: "Stephen Mitchell",
    sortKey: "Mitchell",
    year: 1988,
    publisher: "Harper Perennial",
    citation: "Tzu, L. (1988) Tao Te Ching: A New English Version. Translated by S. Mitchell. Harper Perennial.",
    rights: RESTRICTED,
    isbn: "9780060812454",
  },
  {
    slug: "fengEnglish",
    name: "Gia-Fu Feng & Jane English",
    sortKey: "Feng",
    year: 1972,
    publisher: "Vintage Books",
    citation: "Tsu, L. (2011) Tao Te Ching. Translated by G.-F. Feng, J. English, and T. Lippe. Vintage Books.",
    rights: RESTRICTED,
    isbn: "9780307949301",
  },
  {
    slug: "addissLombardo",
    name: "Stephen Addiss & Stanley Lombardo",
    sortKey: "Addiss",
    year: 1993,
    publisher: "Hackett Publishing Company",
    citation: "Tzu, L. (1993) Tao Te Ching. Translated by S. Addiss and S. Lombardo. Hackett Publishing Company, Inc.",
    rights: RESTRICTED,
    isbn: "9780872202320",
  },
  {
    slug: "lin",
    name: "Derek Lin",
    sortKey: "Lin",
    year: 1994,
    publisher: "SkyLight Paths",
    citation: "Tzu, L. (1994) Tao Teh Ching. Translated by D. Lin.",
    rights: RESTRICTED,
    isbn: "9781594732041",
  },
  {
    slug: "legge",
    name: "James Legge",
    sortKey: "Legge",
    year: 1891,
    publisher: "Oxford University Press",
    citation: "Tsu, L. (1891) The Tao Te Ching. Translated by J. Legge.",
    rights: PUBLIC_DOMAIN,
    isbn: "9781420953527",
    freeText: "https://sacred-texts.com/tao/taote.htm",
  },
  {
    slug: "leguin",
    name: "Ursula K. Le Guin",
    sortKey: "Le Guin",
    year: 1997,
    publisher: "Shambhala",
    citation: "Tzu, L. (2011) Tao Te Ching: A Book about the Way and the Power of the Way. Translated by U.K. Le Guin. Shambhala.",
    rights: RESTRICTED,
    isbn: "9781611807240",
  },
  {
    slug: "lau",
    name: "D. C. Lau",
    sortKey: "Lau",
    year: 1963,
    publisher: "Penguin Classics",
    citation: "Tzu, L. (1963) Tao Te Ching. Translated by D.C. Lau. Penguin Classics.",
    rights: RESTRICTED,
    isbn: "9780140441314",
  },
  {
    slug: "yutang",
    name: "Lin Yutang",
    sortKey: "Yutang",
    year: 1948,
    publisher: "The Modern Library",
    citation: "Tse, L. (1948) The Wisdom of Laotse. Translated by L. Yutang. The Modern Library - New York, Random House, Inc.",
    rights: RESTRICTED,
    isbn: "9780313211645",
  },
  {
    slug: "henricks",
    name: "Robert G. Henricks",
    sortKey: "Henricks",
    year: 1989,
    publisher: "Ballantine Books",
    citation: "Tzu, L. (1989) Te-Tao Ching: A New Translation Based on the Recently Discovered Ma-wang-tui Texts. Translated by R.G. Henricks. Ballantine Books.",
    rights: RESTRICTED,
    isbn: "9780345370990",
  },
  {
    slug: "redpine",
    name: "Red Pine (Bill Porter)",
    sortKey: "Red Pine",
    year: 1996,
    publisher: "Mercury House",
    citation: "Tzu, L. (1996) Lao-tzu’s Taoteching: Translated by Red Pine, with selected commentaries of the past 2000 years. 1st edn. Translated by B. Porter. Mercury House.",
    rights: RESTRICTED,
    isbn: "9781556592904",
  },
  {
    slug: "carus",
    name: "Paul Carus",
    sortKey: "Carus",
    year: 1913,
    publisher: "Open Court Publishing",
    citation: "Tze, L. (1913) The Canon of Reason and Virtue: Being Lao-tze's Tao Teh King. Translated by P. Carus. Chicago: The Open Court Publishing Co.",
    rights: PUBLIC_DOMAIN,
    freeText: "https://archive.org/details/canonofreasonvir00laoz",
  },
  {
    slug: "goddard",
    name: "Dwight Goddard",
    sortKey: "Goddard",
    year: 1919,
    publisher: "Brentano's",
    citation: "Laotzu (1919) Laotzu's Tao and Wu Wei. Translated by D. Goddard. New York: Brentano's.",
    rights: PUBLIC_DOMAIN,
    freeText: "https://archive.org/details/cu31924023066503",
  },
  {
    slug: "old",
    name: "Walter Gorn Old",
    sortKey: "Old",
    year: 1904,
    publisher: "Philip Wellby",
    citation: "Laotze (1904) The Book of the Simple Way. Translated by W. G. Old. London: Philip Wellby.",
    rights: PUBLIC_DOMAIN,
    freeText: "https://archive.org/details/bookofsimplewayo00laozrich",
  },
];

/* The entries this site can actually show.
 *
 * `translationCatalog` above is the authored list — what the catalog *claims*
 * — while `dao` is the text that exists. `npm run corpus` makes the two agree
 * in the repository, but the browser holds them as two separate files with
 * independent cache lifetimes, so a reader mid-deploy can have a new
 * catalog.js and a dao.js from the previous one. Everything the reader can
 * touch is therefore built from the intersection rather than from the catalog
 * alone: the library list, select-all, share links and the random opening
 * three. A translation the catalog describes but `dao` has not got is simply
 * not offered.
 *
 * The alternative is worse than it sounds. A card renders `dao[name][chapter]`,
 * so offering a row the text cannot back means a reader clicks a translation
 * and gets a thrown exception and a blank page instead of a card. That is
 * exactly what a half-updated cache used to produce.
 *
 * `translationCatalog` is deliberately left unfiltered: `tools/ingest.mjs`
 * verifies it against `dao` and has to see what was actually written down in
 * order to report an entry that has no text behind it. */
const carriedEntries = translationCatalog.filter((entry) =>
  Object.prototype.hasOwnProperty.call(dao, entry.name)
);

export const carriedTranslations = carriedEntries.map(({ name }) => name);

/* A mismatch is always a mistake — a half-updated cache, or a catalog entry
 * added without its text. Say so once rather than letting it pass quietly:
 * the symptom on its own (a translation that will not appear) gives whoever
 * hits it nothing to go on. */
if (carriedEntries.length !== translationCatalog.length) {
  const missing = translationCatalog
    .filter((entry) => !Object.prototype.hasOwnProperty.call(dao, entry.name))
    .map(({ name }) => name);
  console.warn(
    "Dao Drip: the catalog describes translations dao.js has not got, so they " +
      "are not being offered: " + missing.join(", ") +
      ". If this is a browser, a hard reload should pair the two files again."
  );
}

export const slugToName = Object.fromEntries(
  carriedEntries.map(({ slug, name }) => [slug, name])
);

export const nameToSlug = Object.fromEntries(
  carriedEntries.map(({ slug, name }) => [name, slug])
);

const byName = Object.fromEntries(
  carriedEntries.map((entry) => [entry.name, entry])
);

export function catalogEntry(name) {
  return byName[name] || null;
}

/* The one question the rest of the project asks about rights. A caller that
 * wants to put a translation anywhere but this page has to get `true` here
 * first, and the honest answer for nine of the thirteen is no. */
export function quotableInFull(name) {
  const entry = catalogEntry(name);
  return Boolean(entry) && entry.rights === PUBLIC_DOMAIN;
}

/* The line printed under a card. A reader deserves to know who owns the words
 * they are reading, and a publisher who looks at this site deserves to find
 * their name and a way to be paid on the same line as their text.
 *
 * It says "Translation" because `year` is the year of the translation while
 * the citation above it cites the printing consulted, and for Feng and
 * English, Le Guin and Legge those are decades apart. Without the word the
 * two lines look like they disagree. */
export function rightsLabel(name) {
  const entry = catalogEntry(name);
  if (!entry) {
    return "";
  }
  if (entry.rights === PUBLIC_DOMAIN) {
    return `Translation ${entry.year} · public domain`;
  }
  return `Translation © ${entry.year} · ${entry.publisher}`;
}

/* Bookshop.org pays a commission on a sale and splits a second one across
 * independent bookshops, which is why the buy links point there rather than
 * at the Amazon URLs they replaced. Emptying the id does not break the links:
 * they fall back to a search on the same ISBN, which still reaches the right
 * book and simply earns nothing. */
export const BOOKSHOP_AFFILIATE_ID = "127992";

export function buyUrl(name) {
  const entry = catalogEntry(name);
  if (!entry || !entry.isbn) {
    return null;
  }
  return BOOKSHOP_AFFILIATE_ID
    ? `https://bookshop.org/a/${BOOKSHOP_AFFILIATE_ID}/${entry.isbn}`
    : `https://bookshop.org/search?keywords=${entry.isbn}`;
}

/* Where an unselected translation sits in the library list. Spaces are folded
 * out before comparing so it reads letter by letter, the way a bookshelf does:
 * Legge comes before Le Guin. */
export const alphabeticalTranslations = carriedEntries
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
