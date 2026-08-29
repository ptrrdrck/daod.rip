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
 * a translation still under copyright — showing it side by side for study is
 * a far narrower permission than reproducing it somewhere else, and the
 * copyright notice at the top of dao.js is what the site relies on for it.
 * UNCERTAIN is post-1930 but has never been checked for renewal, and is
 * treated exactly as RESTRICTED until somebody does that search.
 *
 * This distinction is not decorative. Anything that reproduces a translation
 * away from this page — the card renderer that will feed the Instagram
 * account, above all — has to ask `quotableInFull` first, so that the corpus
 * decides what may leave the site rather than the caller remembering to. */
export const PUBLIC_DOMAIN = "public-domain";
export const RESTRICTED = "restricted";
export const UNCERTAIN = "uncertain";

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
    rights: RESTRICTED,
    isbn: "9780060812454",
  },
  {
    slug: "fengEnglish",
    name: "Gia-Fu Feng & Jane English",
    sortKey: "Feng",
    year: 1972,
    publisher: "Vintage Books",
    rights: RESTRICTED,
    isbn: "9780307949301",
  },
  {
    slug: "addissLombardo",
    name: "Stephen Addiss & Stanley Lombardo",
    sortKey: "Addiss",
    year: 1993,
    publisher: "Hackett Publishing Company",
    rights: RESTRICTED,
    isbn: "9780872202320",
  },
  {
    slug: "lin",
    name: "Derek Lin",
    sortKey: "Lin",
    year: 2006,
    publisher: "SkyLight Paths",
    rights: RESTRICTED,
    isbn: "9781594732041",
  },
  {
    slug: "legge",
    name: "James Legge",
    sortKey: "Legge",
    year: 1891,
    publisher: "Oxford University Press",
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
    rights: RESTRICTED,
    isbn: "9781611807240",
  },
  {
    slug: "lau",
    name: "D. C. Lau",
    sortKey: "Lau",
    year: 1963,
    publisher: "Penguin Classics",
    rights: RESTRICTED,
    isbn: "9780140441314",
  },
  {
    slug: "yutang",
    name: "Lin Yutang",
    sortKey: "Yutang",
    year: 1948,
    publisher: "The Modern Library",
    rights: UNCERTAIN,
    isbn: "9780313211645",
  },
  {
    slug: "henricks",
    name: "Robert G. Henricks",
    sortKey: "Henricks",
    year: 1989,
    publisher: "Ballantine Books",
    rights: RESTRICTED,
    isbn: "9780345370990",
  },
  {
    slug: "redpine",
    name: "Red Pine (Bill Porter)",
    sortKey: "Red Pine",
    year: 1996,
    publisher: "Mercury House",
    rights: RESTRICTED,
    isbn: "9781556592904",
  },
];

export const slugToName = Object.fromEntries(
  translationCatalog.map(({ slug, name }) => [slug, name])
);

export const nameToSlug = Object.fromEntries(
  translationCatalog.map(({ slug, name }) => [name, slug])
);

const byName = Object.fromEntries(
  translationCatalog.map((entry) => [entry.name, entry])
);

export function catalogEntry(name) {
  return byName[name] || null;
}

/* The one question the rest of the project asks about rights. A caller that
 * wants to put a translation anywhere but this page has to get `true` here
 * first, and the honest answer for nine of the ten is no. */
export function quotableInFull(name) {
  const entry = catalogEntry(name);
  return Boolean(entry) && entry.rights === PUBLIC_DOMAIN;
}

/* The line printed under a card. A reader deserves to know who owns the words
 * they are reading, and a publisher who looks at this site deserves to find
 * their name and a way to be paid on the same line as their text. */
export function rightsLabel(name) {
  const entry = catalogEntry(name);
  if (!entry) {
    return "";
  }
  if (entry.rights === PUBLIC_DOMAIN) {
    return `Public domain · ${entry.year}`;
  }
  if (entry.rights === UNCERTAIN) {
    return `© ${entry.year} ${entry.publisher} · renewal unverified`;
  }
  return `© ${entry.year} ${entry.publisher}`;
}

/* Bookshop.org pays a commission on a sale and splits a second one across
 * independent bookshops, which is why the buy links point there rather than
 * at the Amazon URLs they replace. Fill this in with the id from
 * bookshop.org/affiliates and every link below starts earning; leave it empty
 * and the links still take a reader to the right book, they just earn
 * nothing. The site is correct either way, which is the point of the
 * fallback. */
export const BOOKSHOP_AFFILIATE_ID = "";

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
