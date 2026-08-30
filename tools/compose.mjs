/* Tomorrow's post, assembled.
 *
 *   node tools/compose.mjs                  the next post, to stdout
 *   node tools/compose.mjs --ch 1           compose a chapter you picked
 *   node tools/compose.mjs --out queue      write queue/<date>.json
 *   node tools/compose.mjs --used queue     skip chapters already composed there
 *
 * The shape of a post is fixed and the divergence engine chooses what goes in
 * it: the same chapter in each quotable translation, one per slide, then a
 * closing question. Each swipe is a small surprise, which is what holds a
 * carousel, and the surprise is real rather than manufactured — four people
 * read the same line and wrote down different words.
 *
 * Nothing here writes to Instagram. It emits a spec that a renderer turns into
 * images and a publisher turns into a post, so the editorial decision can be
 * read, argued with and corrected before any of that happens.
 */

import path from "node:path";
import process from "node:process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { dao } from "../js/dao.js";
import { catalogEntry, quotableInFull, totalChapters } from "../js/catalog.js";
import { documentFrequency, rankChapters, stemOf } from "./divergence.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Instagram takes two to ten items in a carousel through the API, whatever the
 * app allows. Four translations and a question is five, so there is room, but
 * a fifth public-domain translation would still fit and a ninth would not. */
const MAX_CAROUSEL_ITEMS = 10;

/* Longer than this and the card renderer has to shrink the type below the
 * point where it can be read at the size Instagram serves it. The number comes
 * from `node tools/render.mjs --audit`, which measures rather than guesses:
 * at the time of writing exactly one chapter of one translation exceeds it.
 * Re-run the audit if the corpus changes. */
const MAX_CARD_CHARS = 1400;

function quotableEntries() {
  const entries = Object.keys(dao)
    .map(catalogEntry)
    .filter((entry) => entry && quotableInFull(entry.name));
  if (entries.length < 2) {
    throw new Error(
      `a divergence post needs at least two quotable translations, found ${entries.length}. See RIGHTS.md.`
    );
  }
  return entries.slice(0, MAX_CAROUSEL_ITEMS - 1);
}

/* The word a translator reached for that nobody else did, taken from the
 * opening of the chapter.
 *
 * The corpus holds no Chinese, so nothing here knows which English word
 * renders which character. Two translations' distinctive words are therefore
 * not guaranteed to be counterparts — over a whole chapter you can end up
 * pairing somebody's noun against somebody else's verb, which reads as a
 * non-sequitur. Restricting the search to the opening line raises the odds a
 * long way, because that is where every translation is still rendering the
 * same few characters: chapter 1 gives trodden, reason, understood, subject,
 * which are four readings of one word.
 *
 * It raises the odds rather than settling it, which is the reason a person
 * approves the queue before it posts. */
const OPENING_CHARS = 160;

function keyWord(entry, chapter, distinctive, frequency) {
  const text = dao[entry.name][chapter - 1].toLowerCase();
  const words = distinctive[entry.slug];
  if (!words.length) {
    return null;
  }
  const placed = words
    .map((word) => ({
      word,
      at: text.indexOf(word),
      seen: frequency.get(stemOf(word)) || 1,
    }))
    .filter((row) => row.at !== -1);
  if (!placed.length) {
    return null;
  }
  /* Rarest first, and only then earliest. A word unique to this translation
   * and to two or three places in the whole book is the one carrying the
   * translator's reading; one that turns up in forty chapters is filler that
   * happens to be unique here. */
  const rank = (rows) =>
    rows.sort((a, b) => a.seen - b.seen || a.at - b.at)[0].word;
  const opening = placed.filter((row) => row.at < OPENING_CHARS);
  return rank(opening.length ? opening : placed);
}

/* Four ways of asking, so a daily account does not read like a form letter.
 * The chapter number chooses, so composing a chapter twice gives the same post
 * rather than a different one each run.
 *
 * Every template names all the translators rather than setting two against
 * each other. That is a correctness decision, not a stylistic one: with no
 * Chinese in the corpus, nothing here knows that Legge's word and Carus's word
 * render the same character, so "Legge says X, Carus says Y" quietly asserts
 * something that is often untrue. Listing what each one reached for asserts
 * only what is on the page, and reads better besides — four people circling
 * one thing is a more interesting picture than two people contradicting each
 * other. */
const QUESTION_TEMPLATES = [
  (words) => `${words.map((w) => w.word).join(". ")}. One chapter, ${words.length} readings. Which is yours this week?`,
  (words) =>
    words.map((w) => `${w.name} reaches for ${w.word}`).join(". ") +
    ". Same lines, every time. What are they all circling?",
  (words) => `Nobody agrees about this one. ${words.map((w) => w.word).join(", ")} — which can you live with?`,
  (words) => `${words.map((w) => w.word).join(" · ")}\n\nFour hands, one chapter. Which word is doing the most work?`,
];

function buildQuestion(entries, chapter, distinctive, frequency) {
  const keyed = entries
    .map((entry) => ({
      slug: entry.slug,
      name: entry.name.split(" ").slice(-1)[0],
      word: keyWord(entry, chapter, distinctive, frequency),
    }))
    .filter((row) => row.word);

  if (keyed.length < 2) {
    /* Every translator used the same words. That is a real answer about this
     * chapter, and it is worth saying rather than papering over. */
    return "Four translators, and barely a word between them. What is this chapter so sure about?";
  }

  return QUESTION_TEMPLATES[chapter % QUESTION_TEMPLATES.length](keyed);
}

/* Alt text carries the whole chapter where it fits, because a screen reader
 * is the only way some people will read it at all. Where it does not fit, it
 * stops at a word rather than mid-syllable and says that it was cut, which is
 * more use than a sentence that simply stops. */
const ALT_TEXT_MAX = 1000;

function altText(entry, chapter, text) {
  const prefix =
    `Chapter ${chapter} of the Daodejing translated by ${entry.name} in ${entry.year}, ` +
    `set in dark blue type on cream. It reads: `;
  const room = ALT_TEXT_MAX - prefix.length;
  if (text.length <= room) {
    return prefix + text;
  }
  const cut = text.slice(0, room - 2);
  return prefix + cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function buildCaption(chapter, row, entries) {
  const slugs = entries.map((entry) => entry.slug).join(",");
  const agreed = row.shared.length;
  return [
    `Chapter ${chapter}, in ${entries.length} hands.`,
    "",
    agreed
      ? `They agree on ${agreed} word${agreed === 1 ? "" : "s"}. Everything else is a decision somebody made.`
      : "They do not share a single content word. Every word here is somebody's decision.",
    "",
    "Swipe to read all of them. Which one is yours?",
    "",
    `Read this chapter in thirteen translations at daod.rip/?ch=${chapter}&t=${slugs}`,
    "",
    "#daodejing #taoteching #laozi #translation #philosophy #taoism",
  ].join("\n");
}

export function compose(chapter, entries, row) {
  const frequency = documentFrequency(entries);
  const slides = entries.map((entry) => {
    const text = dao[entry.name][chapter - 1];
    return {
      kind: "translation",
      slug: entry.slug,
      translator: entry.name,
      year: entry.year,
      chars: text.length,
      keyWord: keyWord(entry, chapter, row.distinctive, frequency),
      altText: altText(entry, chapter, text),
    };
  });

  slides.push({
    kind: "question",
    text: buildQuestion(entries, chapter, row.distinctive, frequency),
    altText: "A closing question, set in dark blue type on cream.",
  });

  return {
    chapter,
    divergence: row.divergence,
    agreedOn: row.shared,
    slides,
    caption: buildCaption(chapter, row, entries),
    link: `https://daod.rip/?ch=${chapter}&t=${entries.map((e) => e.slug).join(",")}`,
  };
}

/* Which chapters have already been spoken for. Reading the queue directory
 * rather than keeping a separate ledger means the queue is the only state
 * there is: delete a file and that chapter comes back round. */
async function usedChapters(dir) {
  try {
    const files = await readdir(dir);
    const chapters = [];
    for (const file of files.filter((name) => name.endsWith(".json"))) {
      const body = JSON.parse(await readFile(path.join(dir, file), "utf8"));
      if (Number.isInteger(body.chapter)) {
        chapters.push(body.chapter);
      }
    }
    return new Set(chapters);
  } catch {
    return new Set();
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      args[arg.slice(2)] = argv[++i];
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const entries = quotableEntries();
  const ranked = rankChapters(entries);

  let chosen;
  if (args.ch) {
    const chapter = parseInt(args.ch, 10);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > totalChapters) {
      throw new Error(`--ch must be between 1 and ${totalChapters}`);
    }
    chosen = ranked.find((row) => row.chapter === chapter);
  } else {
    const used = await usedChapters(path.resolve(ROOT, args.used || args.out || "queue"));
    chosen = ranked.find(
      (row) => !used.has(row.chapter) && row.longest <= MAX_CARD_CHARS
    );
    if (!chosen) {
      throw new Error(
        `every chapter that fits a card has been composed already. ` +
          `Clear the queue directory to start the cycle again.`
      );
    }
  }

  if (chosen.longest > MAX_CARD_CHARS) {
    console.warn(
      `warning: chapter ${chosen.chapter} runs to ${chosen.longest} characters, over the ` +
        `${MAX_CARD_CHARS} a card can hold legibly. Check it with ` +
        `node tools/render.mjs --ch ${chosen.chapter} --all --strict`
    );
  }

  const post = compose(chosen.chapter, entries, chosen);

  if (!args.out) {
    console.log(JSON.stringify(post, null, 2));
    return;
  }

  const dir = path.resolve(ROOT, args.out);
  await mkdir(dir, { recursive: true });
  const date = args.date || new Date().toISOString().slice(0, 10);
  const file = path.join(dir, `${date}.json`);
  await writeFile(file, JSON.stringify(post, null, 2) + "\n");
  console.log(
    `${path.relative(ROOT, file)}  chapter ${post.chapter}  ` +
      `divergence ${post.divergence}  ${post.slides.length} slides`
  );
}

main().catch((error) => {
  console.error("compose failed: " + error.message);
  process.exit(1);
});
