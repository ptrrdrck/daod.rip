/* Chapters out, PNG cards in.
 *
 *   node tools/render.mjs --ch 11 --t legge
 *   node tools/render.mjs --ch 11 --all            every quotable translation
 *   node tools/render.mjs --ch 11 --t legge --out cards/
 *   node tools/render.mjs --audit                 what fits, across the corpus
 *
 * The card itself is tools/card.html, a real page this drives in a real
 * browser, so what ships is what a designer sees when they open that file.
 *
 * Two things this refuses to do, both on purpose:
 *
 *   - Render a translation that is still in copyright. `quotableInFull` in
 *     js/catalog.js decides, not this file and not the caller. See RIGHTS.md.
 *   - Ship a card whose text had to shrink below the legibility floor. A
 *     1080px card is shown around 430pt wide on a phone, so type under about
 *     32px there arrives at roughly 12pt. Below the floor this warns; with
 *     --strict it fails, which is what a scheduled job should use.
 */

import http from "node:http";
import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import process from "node:process";

import { dao } from "../js/dao.js";
import { catalogEntry, quotableInFull, totalChapters } from "../js/catalog.js";
import { launchChromium } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Below this, a card is full but not readable at the size Instagram serves
 * it. It is a judgement rather than a measurement, and it is written down here
 * so that changing it is a decision somebody makes on purpose. */
const LEGIBLE_MIN_PX = 32;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(filePath);
      res.writeHead(200, {
        "content-type": MIME[path.extname(filePath)] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

function parseArgs(argv) {
  const args = { out: "cards", size: "1080x1350" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--all") {
      args.all = true;
    } else if (arg === "--audit") {
      args.audit = true;
    } else if (arg === "--strict") {
      args.strict = true;
    } else if (arg.startsWith("--")) {
      args[arg.slice(2)] = argv[++i];
    }
  }
  return args;
}

function quotableSlugs() {
  return Object.keys(dao)
    .map(catalogEntry)
    .filter((entry) => entry && quotableInFull(entry.name))
    .map((entry) => entry.slug);
}

function resolveSlug(slug) {
  const entry = Object.keys(dao)
    .map(catalogEntry)
    .find((e) => e && e.slug === slug);
  if (!entry) {
    throw new Error(`unknown translation slug "${slug}"`);
  }
  /* The gate. A caller that wants a card out of an in-copyright translation
   * has to change the corpus and say why in RIGHTS.md, not pass a flag. */
  if (!quotableInFull(entry.name)) {
    throw new Error(
      `"${entry.name}" is ${entry.rights} and may not be rendered to a card. ` +
        `Quotable: ${quotableSlugs().join(", ")}. See RIGHTS.md.`
    );
  }
  return entry;
}


/* Every quotable chapter measured, and nothing written. The composer that
 * picks tomorrow's chapter needs to know which ones a card can hold before it
 * picks one, and measuring is cheap when there is no screenshot at the end. */
async function audit(page, port, width, height) {
  const entries = quotableSlugs().map(resolveSlug);
  const tight = [];
  let total = 0;

  for (const entry of entries) {
    for (let chapter = 1; chapter <= totalChapters; chapter++) {
      const url =
        `http://127.0.0.1:${port}/tools/card.html` +
        `?ch=${chapter}&t=${entry.slug}&w=${width}&h=${height}`;
      await page.goto(url, { waitUntil: "load" });
      await page.waitForFunction(() => document.documentElement.dataset.ready === "1");
      const fitted = await page.evaluate(() =>
        Number(document.documentElement.dataset.fitted || 0)
      );
      total++;
      if (fitted < LEGIBLE_MIN_PX) {
        tight.push({ slug: entry.slug, chapter, fitted });
      }
    }
  }

  console.log(`${total} cards measured across ${entries.length} translations.`);
  if (!tight.length) {
    console.log(`all of them fit at ${LEGIBLE_MIN_PX}px or better.`);
    return;
  }
  console.log(`${tight.length} below the ${LEGIBLE_MIN_PX}px floor:`);
  for (const row of tight) {
    console.log(`  ch${row.chapter} ${row.slug}  ${row.fitted}px`);
  }
}


/* The vendored font carries Google's "latin" subset and no more. A chapter
 * containing anything outside it renders as a blank box, which a screenshot
 * captures perfectly happily — so check before drawing rather than discover it
 * in a published post. The ranges are the ones in the subset the woff2 files
 * were taken from. */
function outsideLatinSubset(text) {
  const covered = (p) =>
    p <= 0xff ||
    p === 0x131 ||
    (p >= 0x152 && p <= 0x153) ||
    (p >= 0x2bb && p <= 0x2bc) ||
    p === 0x2c6 ||
    p === 0x2da ||
    p === 0x2dc ||
    p === 0x304 ||
    p === 0x308 ||
    p === 0x329 ||
    (p >= 0x2000 && p <= 0x206f) ||
    p === 0x20ac ||
    p === 0x2122 ||
    p === 0x2191 ||
    p === 0x2193 ||
    p === 0x2212 ||
    p === 0x2215;
  const found = new Set();
  for (const ch of text) {
    if (!covered(ch.codePointAt(0))) {
      found.add(`${ch} (U+${ch.codePointAt(0).toString(16).toUpperCase()})`);
    }
  }
  return [...found];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const chapter = parseInt(args.ch || "1", 10);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > totalChapters) {
    throw new Error(`--ch must be between 1 and ${totalChapters}`);
  }

  const slugs = args.all ? quotableSlugs() : [args.t || "legge"];
  const entries = args.audit ? [] : slugs.map(resolveSlug);

  const [width, height] = args.size.split("x").map((n) => parseInt(n, 10));
  if (!width || !height) {
    throw new Error(`--size must look like 1080x1350, got "${args.size}"`);
  }

  const outDir = path.resolve(ROOT, args.out);
  if (!args.audit) {
    await mkdir(outDir, { recursive: true });
  }

  const server = await startServer();
  const port = server.address().port;
  const browser = await launchChromium();
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });

  let tight = 0;
  const written = [];

  try {
    if (args.audit) {
      await audit(page, port, width, height);
      return;
    }
    for (const entry of entries) {
      const url =
        `http://127.0.0.1:${port}/tools/card.html` +
        `?ch=${chapter}&t=${entry.slug}&w=${width}&h=${height}`;
      const missing = outsideLatinSubset(dao[entry.name][chapter - 1]);
      if (missing.length) {
        throw new Error(
          `chapter ${chapter} of ${entry.name} uses characters the vendored font ` +
            `does not carry: ${missing.join(", ")}. They would render as blank boxes.`
        );
      }

      await page.goto(url, { waitUntil: "load" });
      await page.waitForFunction(() => document.documentElement.dataset.ready === "1");

      const state = await page.evaluate(() => ({
        refused: document.documentElement.dataset.refused === "true",
        fitted: Number(document.documentElement.dataset.fitted || 0),
      }));

      /* The page has its own copy of the rights check. If it ever disagrees
       * with the one above, that is a bug worth stopping for rather than
       * rendering past. */
      if (state.refused) {
        throw new Error(
          `card.html refused ${entry.slug} that render.mjs allowed — the two rights checks disagree`
        );
      }

      const file = path.join(outDir, `ch${String(chapter).padStart(2, "0")}-${entry.slug}.png`);
      await page.locator(".card").screenshot({ path: file });
      written.push({ file, entry, fitted: state.fitted });

      if (state.fitted < LEGIBLE_MIN_PX) {
        tight++;
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const { file, entry, fitted } of written) {
    const flag = fitted < LEGIBLE_MIN_PX ? `  ← ${fitted}px, below the ${LEGIBLE_MIN_PX}px floor` : "";
    console.log(
      `${path.relative(ROOT, file)}  ${entry.name} ${entry.year}  ${fitted}px${flag}`
    );
  }

  if (tight) {
    const message =
      `${tight} of ${written.length} card(s) fitted below ${LEGIBLE_MIN_PX}px. ` +
      `Chapter ${chapter} is long in these translations; split it across a carousel ` +
      `or choose a shorter chapter.`;
    if (args.strict) {
      throw new Error(message);
    }
    console.warn("\nwarning: " + message);
  }
}

main().catch((error) => {
  console.error("render failed: " + error.message);
  process.exit(1);
});
