/* Corpus checks, and the gate a new translation has to pass to join it.
 *
 *   node tools/ingest.mjs --verify          check the corpus that is here
 *   node tools/ingest.mjs <candidate.json>  check a translation before adding it
 *
 * There is no build step, so this deliberately does not edit `js/dao.js` or
 * `js/catalog.js`. It validates, and then prints the exact blocks to paste in.
 * dao.js is the hand-formatted text the whole site is built on; a script that
 * rewrites it in place would save a minute of pasting and put the one file
 * with nothing to fall back on at risk.
 *
 * A candidate file looks like this, with all 81 chapters in order:
 *
 *   {
 *     "name": "Paul Carus",
 *     "slug": "carus",
 *     "sortKey": "Carus",
 *     "year": 1898,
 *     "publisher": "Open Court Publishing",
 *     "rights": "public-domain",
 *     "freeText": "https://...",
 *     "citation": "Tze, L. (1898) Lao-Tze's Tao-Teh-King. Translated by P. Carus.",
 *     "chapters": ["The Reason that can be reasoned ...", "..."]
 *   }
 */

import { readFile } from "node:fs/promises";
import process from "node:process";

import { dao } from "../js/dao.js";
import {
  PUBLIC_DOMAIN,
  RESTRICTED,
  allTranslations,
  catalogEntry,
  totalChapters,
  translationCatalog,
} from "../js/catalog.js";

const RIGHTS_VALUES = [PUBLIC_DOMAIN, RESTRICTED];

/* The year at which the US public domain currently stops. It moves forward by
 * one every 1 January, so this is a fact with a shelf life: 1930 is the line
 * as of 2026. Anything later needs a renewal search before it can claim to be
 * public domain, and this refuses to take the claim on trust. */
const PUBLIC_DOMAIN_CUTOFF = 1930;

const problems = [];

function fail(message) {
  problems.push(message);
}

function report(label) {
  if (problems.length === 0) {
    console.log(`${label}: ok`);
    return 0;
  }
  console.log(`${label}: ${problems.length} problem(s)`);
  for (const problem of problems) {
    console.log("  - " + problem);
  }
  return 1;
}

/* Everything the corpus is supposed to be true about itself. The site trusts
 * all of this implicitly — cards index by chapter, the share link maps slugs
 * to names, the rights label reads fields off the catalog — so it is worth
 * being able to ask in one command. */
function verifyCorpus() {
  const catalogNames = translationCatalog.map((entry) => entry.name);

  for (const name of allTranslations) {
    if (!catalogNames.includes(name)) {
      fail(`dao.js has "${name}" but the catalog does not`);
    }
  }

  for (const entry of translationCatalog) {
    if (!allTranslations.includes(entry.name)) {
      fail(`the catalog has "${entry.name}" but dao.js does not`);
      continue;
    }
    const chapters = dao[entry.name];
    if (chapters.length !== totalChapters) {
      fail(
        `"${entry.name}" has ${chapters.length} chapters, expected ${totalChapters}`
      );
    }
    const empty = chapters.findIndex(
      (chapter) => typeof chapter !== "string" || chapter.trim() === ""
    );
    if (empty !== -1) {
      fail(`"${entry.name}" chapter ${empty + 1} is empty`);
    }
    if (!RIGHTS_VALUES.includes(entry.rights)) {
      fail(`"${entry.name}" has an unknown rights value: ${entry.rights}`);
    }
    if (!entry.year || !entry.publisher || !entry.citation) {
      fail(`"${entry.name}" is missing a year, a publisher or a citation`);
    }
    if (entry.rights === PUBLIC_DOMAIN && entry.year > PUBLIC_DOMAIN_CUTOFF) {
      fail(
        `"${entry.name}" claims public domain but is dated ${entry.year}, after ${PUBLIC_DOMAIN_CUTOFF}`
      );
    }
  }

  const slugs = translationCatalog.map((entry) => entry.slug);
  const duplicated = slugs.filter((slug, i) => slugs.indexOf(slug) !== i);
  for (const slug of duplicated) {
    fail(`the slug "${slug}" is used more than once`);
  }

  return report(`corpus (${allTranslations.length} translations`.concat(
    `, ${totalChapters} chapters)`
  ));
}

/* What a candidate has to prove before it is allowed near dao.js.
 *
 * The rights check is the one with teeth. Everything added from here on is
 * meant to be quotable off the site — that is the whole reason for adding it —
 * so a candidate that is not public domain is rejected rather than warned
 * about. Adding a translation that is still in copyright is a decision to be
 * made deliberately, by hand, with the reasoning written down. */
function verifyCandidate(candidate) {
  const required = ["name", "slug", "sortKey", "year", "publisher", "rights", "chapters"];
  for (const field of required) {
    if (candidate[field] === undefined) {
      fail(`missing required field: ${field}`);
    }
  }
  if (problems.length) {
    return report("candidate");
  }

  if (catalogEntry(candidate.name)) {
    fail(`"${candidate.name}" is already in the catalog`);
  }
  if (translationCatalog.some((entry) => entry.slug === candidate.slug)) {
    fail(`the slug "${candidate.slug}" is already taken`);
  }
  if (!/^[a-zA-Z]+$/.test(candidate.slug)) {
    fail(`the slug "${candidate.slug}" must be letters only — it goes in a URL`);
  }

  if (candidate.rights !== PUBLIC_DOMAIN) {
    fail(
      `rights is "${candidate.rights}"; only ${PUBLIC_DOMAIN} translations are ingested by this script`
    );
  }
  if (candidate.year > PUBLIC_DOMAIN_CUTOFF) {
    fail(
      `dated ${candidate.year}, after the ${PUBLIC_DOMAIN_CUTOFF} public-domain cutoff`
    );
  }
  if (!candidate.citation) {
    fail("no citation — a card has nothing to print without one");
  }

  if (!Array.isArray(candidate.chapters)) {
    fail("chapters is not an array");
    return report("candidate");
  }
  if (candidate.chapters.length !== totalChapters) {
    fail(
      `${candidate.chapters.length} chapters, expected ${totalChapters}`
    );
  }
  candidate.chapters.forEach((chapter, i) => {
    if (typeof chapter !== "string" || chapter.trim() === "") {
      fail(`chapter ${i + 1} is empty`);
      return;
    }
    if (/<[a-z/][^>]*>/i.test(chapter)) {
      fail(`chapter ${i + 1} still contains markup`);
    }
    if (/\s{2,}|\n/.test(chapter)) {
      fail(`chapter ${i + 1} has newlines or runs of spaces left in it`);
    }
  });

  const code = report("candidate");
  if (code === 0) {
    printBlocks(candidate);
  }
  return code;
}

function js(value) {
  return JSON.stringify(value);
}

function printBlocks(candidate) {
  console.log("\n--- paste into the dao object in js/dao.js ---\n");
  console.log(`  ${js(candidate.name)}: [`);
  for (const chapter of candidate.chapters) {
    console.log(`    ${js(chapter)},`);
  }
  console.log("  ],");

  console.log("\n--- paste into translationCatalog in js/catalog.js ---\n");
  console.log("  {");
  console.log(`    slug: ${js(candidate.slug)},`);
  console.log(`    name: ${js(candidate.name)},`);
  console.log(`    sortKey: ${js(candidate.sortKey)},`);
  console.log(`    year: ${candidate.year},`);
  console.log(`    publisher: ${js(candidate.publisher)},`);
  console.log(`    citation: ${js(candidate.citation)},`);
  console.log("    rights: PUBLIC_DOMAIN,");
  if (candidate.isbn) {
    console.log(`    isbn: ${js(candidate.isbn)},`);
  }
  if (candidate.freeText) {
    console.log(`    freeText: ${js(candidate.freeText)},`);
  }
  console.log("  },");
  console.log("\nThen run --verify again, and npm test.");
}

const arg = process.argv[2];

if (!arg || arg === "--verify") {
  process.exit(verifyCorpus());
} else {
  const candidate = JSON.parse(await readFile(arg, "utf8"));
  process.exit(verifyCandidate(candidate));
}
