/* Which chapters the translators most disagree about.
 *
 *   node tools/divergence.mjs              the ranking
 *   node tools/divergence.mjs --ch 1       one chapter, word by word
 *   node tools/divergence.mjs --json       for the composer
 *   node tools/divergence.mjs --all        include the in-copyright ones
 *
 * This is the editorial judgement the account runs on, and it is the one
 * thing here that nothing else has: thirteen translations of the same 81
 * chapters, aligned, in one place. A quote account picks a nice-sounding
 * passage. This picks the passage where four translators looked at the same
 * line and could not agree what it said, which is a better post because the
 * disagreement is the content.
 *
 * By default it reads only the translations a card may quote, because those
 * are the ones a post can be built from. `--all` widens it to all thirteen,
 * which is a more complete picture of the text and is fine to compute —
 * measuring a statistic is not reproducing anything — but nothing quotable
 * comes out of it.
 */

import process from "node:process";
import { pathToFileURL } from "node:url";

import { dao } from "../js/dao.js";
import { catalogEntry, quotableInFull, totalChapters } from "../js/catalog.js";

/* Function words carry grammar rather than choice. Every translation of every
 * chapter is full of them, so leaving them in measures how much English the
 * two share rather than how differently they read the Chinese. This list is
 * deliberately short: it covers what is common enough to swamp the signal and
 * stops there, because every word removed is a word that can no longer show a
 * translator's hand. */
const STOPWORDS = new Set(`
a all also an and any are as at be because been before being both but by can
cannot could
did do does doing done each either else even ever every for from further had
has have having he her hers him his how however i if in indeed into is it its
itself just may me might more most much must my never no nor not now of on
once one only or other others ought our ours out over own perhaps rather said
same shall she should since so some still such than that the their theirs them
then there therefore these they this those through thus to too under until up
upon us very was we well were what when whenever where whether which while who
whom whose why will with within without would yet you your yours
`.trim().split(/\s+/));

/* Spelling is not disagreement either, and this corpus spans 1891 to 1919 on
 * both sides of the Atlantic: Legge writes favour and honour, Goddard writes
 * favor and honor. Left alone that reads as two translators choosing different
 * words when they chose the same one, and it lands hardest on exactly the
 * chapters about favour and honour.
 *
 * The list is explicit rather than a rule, because a rule that rewrites -our
 * to -or also rewrites "four" and "your". These are the pairs that actually
 * occur; re-derive them after adding a translation by scanning the corpus
 * vocabulary for words that differ only by these patterns. */
const BRITISH_TO_AMERICAN = new Map([
  ["favour", "favor"],
  ["honour", "honor"],
  ["vigour", "vigor"],
  ["flavour", "flavor"],
  ["armour", "armor"],
]);

function normalise(word) {
  const mapped = BRITISH_TO_AMERICAN.get(word);
  if (mapped) {
    return mapped;
  }
  /* recognised/recognized, and anything else built the same way. */
  return word.replace(/is(e|ed|es|ing|ation)$/, "iz$1");
}

/* Inflection is not disagreement. "reason", "reasons" and "reasoned" are one
 * translator making one choice, and counting them as three makes a chapter
 * look more contested than it is. This is a crude suffix stripper rather than
 * a real stemmer — it will mangle irregular words — but it is applied to every
 * translation equally, so the comparison stays fair even where a given word
 * comes out wrong. */
function stem(word) {
  for (const suffix of ["ings", "edly", "ing", "ed", "ly", "es", "s"]) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/* Hyphens split because translators hyphenate the same compound differently —
 * "self-abasement" against "self abasement" is not a disagreement. Apostrophes
 * are dropped so possessives and contractions land on the bare word.
 *
 * The result maps each stem to the word it was actually written as, because
 * the stem is for comparing and the surface form is for reading. A card that
 * set "ancestor" as "ancestor" is a post; one that set it as "ancestor" after
 * a stemmer had reached "veri" or "chao" is a bug on a billboard. First
 * spelling seen wins, which for one chapter of one translation is almost
 * always the only one. */
export function contentWords(text) {
  const words = new Map();
  for (const word of text.toLowerCase().replace(/['’]/g, "").split(/[^a-z]+/)) {
    if (word.length > 1 && !STOPWORDS.has(word)) {
      const key = stem(normalise(word));
      if (!words.has(key)) {
        words.set(key, word);
      }
    }
  }
  return words;
}

/* How many of the corpus's chapter-texts each stem appears in.
 *
 * A word that is distinctive to one translation is not automatically
 * interesting: "like" and "get" are unique to somebody in half the chapters
 * and say nothing, while "trodden" appears once in the whole book and says
 * everything. Frequency is what separates them, and the composer uses it to
 * choose which word to build a question out of. */
export function documentFrequency(entries) {
  const counts = new Map();
  for (const entry of entries) {
    for (const text of dao[entry.name]) {
      for (const key of contentWords(text).keys()) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
  }
  return counts;
}

/* The stem a surface word is counted under, so a caller holding a real word
 * can ask how common it is without knowing how stemming works. */
export function stemOf(word) {
  return stem(normalise(word.toLowerCase()));
}

function jaccardDistance(a, b) {
  let shared = 0;
  for (const key of a.keys()) {
    if (b.has(key)) {
      shared++;
    }
  }
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : 1 - shared / union;
}

/* The mean distance across every pair. A single pair would let one eccentric
 * translation carry a chapter; averaging asks whether the disagreement is
 * general. */
function meanPairwiseDistance(sets) {
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      total += jaccardDistance(sets[i], sets[j]);
      pairs++;
    }
  }
  return pairs === 0 ? 0 : total / pairs;
}

export function scoreChapter(entries, chapter) {
  const texts = entries.map((entry) => dao[entry.name][chapter - 1]);
  const sets = texts.map(contentWords);

  const shared = [...sets[0].keys()]
    .filter((key) => sets.every((set) => set.has(key)))
    .map((key) => sets[0].get(key));

  /* A word one translator reached for and nobody else did. This is the part a
   * post is actually built out of: it is the visible shape of the
   * disagreement, and it is what to set in colour on a card. */
  const distinctive = {};
  entries.forEach((entry, i) => {
    distinctive[entry.slug] = [...sets[i].keys()]
      .filter((key) => sets.every((set, j) => j === i || !set.has(key)))
      .map((key) => sets[i].get(key));
  });

  const lengths = texts.map((text) => text.length);

  return {
    chapter,
    divergence: Number(meanPairwiseDistance(sets).toFixed(4)),
    translations: entries.length,
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
    shared: shared.sort(),
    distinctive,
  };
}

function selectedEntries(includeRestricted) {
  const entries = Object.keys(dao)
    .map(catalogEntry)
    .filter(Boolean)
    .filter((entry) => includeRestricted || quotableInFull(entry.name));
  if (entries.length < 2) {
    throw new Error(
      "divergence needs at least two translations to compare; " +
        `only ${entries.length} available. See RIGHTS.md.`
    );
  }
  return entries;
}

export function rankChapters(entries) {
  return Array.from({ length: totalChapters }, (_, i) => scoreChapter(entries, i + 1)).sort(
    (a, b) => b.divergence - a.divergence
  );
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      args.json = true;
    } else if (arg === "--all") {
      args.all = true;
    } else if (arg.startsWith("--")) {
      args[arg.slice(2)] = argv[++i];
    }
  }
  return args;
}

function printChapter(entries, row) {
  console.log(`Chapter ${row.chapter} — divergence ${row.divergence}`);
  console.log(
    `${row.translations} translations, ${row.shortest}–${row.longest} characters\n`
  );
  console.log(
    `  agreed on: ${row.shared.length ? row.shared.join(", ") : "(nothing)"}\n`
  );
  for (const entry of entries) {
    const words = row.distinctive[entry.slug];
    console.log(`  only ${entry.name} (${entry.year}):`);
    console.log(`    ${words.length ? words.join(", ") : "(nothing of its own)"}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const entries = selectedEntries(args.all);

  if (args.ch) {
    const chapter = parseInt(args.ch, 10);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > totalChapters) {
      throw new Error(`--ch must be between 1 and ${totalChapters}`);
    }
    const row = scoreChapter(entries, chapter);
    if (args.json) {
      console.log(JSON.stringify(row, null, 2));
    } else {
      printChapter(entries, row);
    }
    return;
  }

  const ranked = rankChapters(entries);

  if (args.json) {
    console.log(JSON.stringify(ranked, null, 2));
    return;
  }

  const limit = args.top ? parseInt(args.top, 10) : 15;
  console.log(
    `${entries.length} translations compared: ${entries.map((e) => e.slug).join(", ")}` +
      (args.all ? "  (--all: includes in-copyright, not quotable)" : "")
  );
  console.log(`\nmost contested ${limit} of ${totalChapters}:\n`);
  console.log("  ch   divergence  agreed on");
  for (const row of ranked.slice(0, limit)) {
    console.log(
      `  ${String(row.chapter).padStart(2)}   ${row.divergence.toFixed(3)}       ` +
        `${row.shared.length} word${row.shared.length === 1 ? "" : "s"}`
    );
  }
  console.log("\nleast contested:\n");
  console.log("  ch   divergence  agreed on");
  for (const row of ranked.slice(-3).reverse()) {
    console.log(
      `  ${String(row.chapter).padStart(2)}   ${row.divergence.toFixed(3)}       ` +
        `${row.shared.length} word${row.shared.length === 1 ? "" : "s"}`
    );
  }
}

/* Only when run as a command. compose.mjs imports rankChapters from here, and
 * a module that prints a table on import is a module that cannot be reused. */
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
