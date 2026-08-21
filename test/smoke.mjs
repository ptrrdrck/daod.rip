/* Browser smoke test for Dao Drip.
 *
 * There is no build step and no unit tests, so this drives the real pages in
 * a real browser and asserts on structure only. Run with `npm test`.
 */

import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const filePath = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
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
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server))
  );
}

let passed = 0;
let failed = 0;

function section(name) {
  console.log("\n" + name);
}

function check(name, ok, detail) {
  if (ok) {
    console.log("  PASS  " + name);
    passed++;
  } else {
    console.log("  FAIL  " + name + (detail ? "\n          " + detail : ""));
    failed++;
  }
}

/* Chapter currently shown in the first card, as a number. */
async function shownChapter(page) {
  const text = await page.locator("#display .chapter-number").first().innerText();
  return Number(text.replace(/\D+/g, ""));
}

/* Modals stay open after some actions, and an open dialog swallows clicks
 * aimed at the page behind it, so always start from a closed state. */
async function closeModals(page) {
  await page.evaluate(() =>
    document.querySelectorAll("dialog[open]").forEach((d) => d.close())
  );
}

async function openModal(page, buttonId) {
  await closeModals(page);
  await page.locator("#" + buttonId).click();
}

async function openLibrary(page, tab) {
  await openModal(page, "library-button");
  if (tab) await page.locator("#library-tab-" + tab).click();
}

/* The real inputs are visually hidden behind the styled .checkmark, so the
 * label is what a reader actually clicks. */
async function toggleCheckbox(page, id) {
  await page.locator('label[for="' + id + '"]').click();
}

/* The nav is a view of readOrder and historyIndex, so it can be checked
 * against them rather than against hand-written expectations. */
async function historySlotMismatches(page) {
  const model = await page.evaluate(() => ({
    readOrder: JSON.parse(localStorage.getItem("readOrder") || "[]"),
    historyIndex: Number(localStorage.getItem("historyIndex")),
  }));
  const at = (offset) => {
    const position = model.readOrder.length + model.historyIndex + offset;
    return position >= 0 && position < model.readOrder.length
      ? model.readOrder[position]
      : undefined;
  };
  const slots = [
    ["prev-ch", -1], ["prev-ch-2", -2], ["prev-ch-3", -3],
    ["next-ch", 1], ["next-ch-2", 2], ["next-ch-3", 3],
  ];
  const problems = [];
  for (const [id, offset] of slots) {
    const expected = at(offset);
    const el = page.locator("#" + id);
    const text = ((await el.textContent()) || "").trim();
    const hidden = await el.evaluate((n) => n.classList.contains("history-hide"));
    if (expected === undefined) {
      if (!hidden) problems.push(id + " should be blank, shows " + JSON.stringify(text));
    } else if (hidden) {
      problems.push(id + " should show " + expected + " but is hidden");
    } else if (text !== String(expected)) {
      problems.push(id + " shows " + JSON.stringify(text) + ", want " + expected);
    }
  }
  return problems;
}

async function run() {
  const server = await startServer();
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });
  const noErrors = (label) =>
    check(label, errors.length === 0, errors.join(" | "));

  await page.goto(base + "/index.html", { waitUntil: "networkidle" });

  section("[1] initial render");
  noErrors("loads without page errors");
  check("renders translation cards", (await page.locator("#display .translation").count()) > 0);
  check("each card has a chapter number", (await page.locator("#display .chapter-number").count()) > 0);
  check(
    "every card shows the same chapter",
    new Set(await page.locator("#display .chapter-number").allInnerTexts()).size === 1
  );
  check("cards carry non-empty translation text",
    (await page.locator("#display .translation-text").allInnerTexts()).every((t) => t.trim().length > 0));

  /* Two translator names contain an ampersand, so this catches text being
   * escaped twice and rendering as &amp; on the page. */
  await openLibrary(page, "translations");
  await page.locator("#select-all-translations-button").click();
  await closeModals(page);
  const translators = await page.locator("#display .chapter-translator").allInnerTexts();
  const ampersandNames = translators.filter((t) => t.includes("&"));
  check("translator names with an ampersand render as one character",
    ampersandNames.length === 2 && ampersandNames.every((t) => !t.includes("&amp;")),
    JSON.stringify(ampersandNames));
  check("source citations render", (await page.locator("#display .trans-ref").allInnerTexts()).every((t) => t.trim().length > 0));
  check("source links keep their href",
    (await page.locator("#display .trans-link").first().getAttribute("href") || "").startsWith("http"));

  section("[2] chapter list");
  await openLibrary(page, "chapters");
  const links = page.locator("#chapter-list .chapter-link");
  check("renders chapter links", (await links.count()) > 0);
  check("links are buttons, not javascript: anchors",
    (await links.first().evaluate((el) => el.tagName)) === "BUTTON" &&
      (await links.first().evaluate((el) => el.getAttribute("href"))) === null);

  const wanted = Number((await links.first().innerText()).trim());
  await links.first().click();
  await page.waitForTimeout(200);
  check("clicking a chapter link opens that chapter",
    (await shownChapter(page)) === wanted,
    "wanted " + wanted + ", got " + (await shownChapter(page)));

  section("[3] chapter filters");
  await openLibrary(page, "chapters");
  await page.locator("#chapter-filter-all").click();
  const allCount = await page.locator("#chapter-list .chapter-link").count();
  check("the 'all' filter lists every chapter", allCount === 81, "got " + allCount);
  await page.locator("#chapter-filter-unread").click();
  const unreadCount = await page.locator("#chapter-list .chapter-link").count();
  check("the 'unread' filter excludes read chapters", unreadCount < allCount,
    "unread=" + unreadCount + " all=" + allCount);
  await page.locator("#chapter-filter-bookmarked").click();
  check("the 'starred' filter is empty before starring",
    (await page.locator("#chapter-list .chapter-link").count()) === 0);
  await closeModals(page);

  section("[4] bookmarks");
  await page.locator("#display .bookmark-toggle").first().click();
  const starred = await shownChapter(page);
  check("starring marks every card on the chapter",
    (await page.locator("#display .bookmark-toggle.bookmarked").count()) ===
      (await page.locator("#display .bookmark-toggle").count()));
  check("star is persisted",
    JSON.parse(await page.evaluate(() => localStorage.getItem("bookmarkedChapters"))).includes(starred));
  await openLibrary(page, "chapters");
  await page.locator("#chapter-filter-bookmarked").click();
  check("starred chapter appears under the starred filter",
    (await page.locator("#chapter-list .chapter-link").allInnerTexts()).map(Number).includes(starred));
  await closeModals(page);

  section("[5] history navigation");
  for (let i = 0; i < 5; i++) {
    await page.locator("#drip-button").click();
    await page.waitForTimeout(120);
  }
  check("history nav becomes visible", await page.locator("#history-nav").isVisible());
  check("forward seeking is unavailable at the newest chapter",
    !(await page.locator("#ch-seek-fwd").isVisible()));

  let mismatches = await historySlotMismatches(page);
  check("slots match readOrder after dripping", mismatches.length === 0, mismatches.join("; "));

  const startedFrom = await shownChapter(page);
  const prevShown = Number((await page.locator("#prev-ch").textContent()).trim());
  await page.locator("#ch-seek-back").click();
  await page.waitForTimeout(150);
  check("seeking back opens the previous chapter",
    (await shownChapter(page)) === prevShown,
    "prev-ch showed " + prevShown + ", display shows " + (await shownChapter(page)));

  mismatches = await historySlotMismatches(page);
  check("slots match readOrder after seeking back", mismatches.length === 0, mismatches.join("; "));

  const nextShown = Number((await page.locator("#next-ch").textContent()).trim());
  await page.locator("#ch-seek-fwd").click();
  await page.waitForTimeout(150);
  check("seeking forward opens the next chapter",
    (await shownChapter(page)) === nextShown,
    "next-ch showed " + nextShown + ", display shows " + (await shownChapter(page)));
  check("back then forward returns to where it started",
    (await shownChapter(page)) === startedFrom,
    "started at " + startedFrom + ", ended at " + (await shownChapter(page)));

  await page.reload({ waitUntil: "networkidle" });
  mismatches = await historySlotMismatches(page);
  check("slots still match readOrder after a reload", mismatches.length === 0, mismatches.join("; "));

  /* Walk to the far end of the log. The old implementation could index
   * readOrder[0] here instead of running out, so this is where a wraparound
   * would show up. */
  const logLength = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("readOrder") || "[]").length);
  let steps = 0;
  while (await page.locator("#ch-seek-back").isVisible()) {
    await page.locator("#ch-seek-back").click();
    await page.waitForTimeout(90);
    steps++;
    if (steps > logLength + 3) break;
  }
  check("seeking back stops at the start of the log rather than wrapping",
    steps === logLength - 1, "took " + steps + " steps, log holds " + logLength);
  const oldest = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("readOrder"))[0]);
  check("the far end of the log is the oldest chapter",
    (await shownChapter(page)) === oldest,
    "oldest is " + oldest + ", display shows " + (await shownChapter(page)));
  mismatches = await historySlotMismatches(page);
  check("slots match readOrder at the far end", mismatches.length === 0, mismatches.join("; "));

  /* A separate context, so seeding a one-entry log cannot disturb this run.
   * A single chapter has nothing before it; the old arithmetic offered the
   * chapter itself as its own previous. */
  const soloContext = await browser.newContext();
  const soloPage = await soloContext.newPage();
  await soloPage.goto(base + "/index.html", { waitUntil: "networkidle" });
  await soloPage.evaluate(() => {
    localStorage.setItem("readOrder", JSON.stringify([42]));
    localStorage.setItem("historyIndex", "-1");
    localStorage.setItem("landingMode", "resume");
    localStorage.setItem("lastChapterIndex", "41");
  });
  await soloPage.reload({ waitUntil: "networkidle" });
  check("a one-chapter log offers no previous chapter",
    !(await soloPage.locator("#ch-seek-back").isVisible()));
  check("a one-chapter log offers no next chapter",
    !(await soloPage.locator("#ch-seek-fwd").isVisible()));
  check("a one-chapter log hides the nav entirely",
    !(await soloPage.locator("#history-nav").isVisible()));
  await soloContext.close();

  /* Back to the newest chapter for the sections that follow. */
  await page.locator("#drip-button").click();
  await page.waitForTimeout(150);

  section("[6] translation selection");
  const before = await page.locator("#display .translation").count();
  await openLibrary(page, "translations");
  await toggleCheckbox(page, "mitchell-checkbox");
  await page.waitForTimeout(150);
  const after = await page.locator("#display .translation").count();
  check("toggling a translation changes the card count", after !== before,
    "before=" + before + " after=" + after);
  const selectedAfterToggle = await page.evaluate(() => localStorage.getItem("selectedTranslations"));
  await page.locator("#deselect-all-translations-button").click();
  await page.waitForTimeout(150);
  check("deselecting all shows the empty state",
    (await page.locator("#display .empty-state").count()) === 1);
  await page.locator("#select-all-translations-button").click();
  await page.waitForTimeout(150);
  check("selecting all shows every translation",
    (await page.locator("#display .translation").count()) === 10,
    "got " + (await page.locator("#display .translation").count()));
  check("checkbox state matches the selection",
    (await page.locator("#library-panel-translations input[type=checkbox]:checked").count()) === 10);
  await closeModals(page);

  section("[7] selection survives a reload");
  await page.evaluate((v) => localStorage.setItem("selectedTranslations", v), selectedAfterToggle);
  await page.reload({ waitUntil: "networkidle" });
  const restored = JSON.parse(selectedAfterToggle);
  await openLibrary(page, "translations");
  const checkedIds = await page.locator("#library-panel-translations input[type=checkbox]:checked").count();
  check("restored selection re-checks the right number of boxes",
    checkedIds === restored.length, "checked=" + checkedIds + " expected=" + restored.length);
  check("restored selection renders that many cards",
    (await page.locator("#display .translation").count()) === restored.length);
  await closeModals(page);

  section("[8] search");
  await openModal(page, "search-button");
  await page.locator("#search-input").fill("a");
  await page.waitForTimeout(350);
  check("rejects a one-character query", (await page.locator(".search-status").count()) === 1);
  await page.locator("#search-input").fill("water");
  await page.waitForTimeout(400);
  const results = await page.locator(".search-result").count();
  check("returns results for a common word", results > 0, "got " + results);
  check("highlights the match", (await page.locator(".search-result mark").count()) > 0);
  const target = Number(
    (await page.locator(".search-result").first().getAttribute("data-chapter-index"))
  ) + 1;
  await page.locator(".search-result").first().click();
  await page.waitForTimeout(250);
  check("clicking a result opens that chapter", (await shownChapter(page)) === target,
    "wanted " + target + ", got " + (await shownChapter(page)));

  section("[9] settings persistence");
  await openModal(page, "settings-button");
  const swatches = page.locator("#theme-swatches .theme-swatch");
  const lastIndex = (await swatches.count()) - 1;
  await swatches.nth(lastIndex).click();
  const themeBefore = await page.evaluate(() => localStorage.getItem("theme"));
  check("last swatch selects the last theme", Number(themeBefore) === lastIndex,
    "theme=" + themeBefore + " lastIndex=" + lastIndex);
  await page.locator("#view-stacked-button").click();
  await page.locator("#landing-resume-button").click();
  await page.locator("#font-size-increase-button").click();
  const settingsBefore = await page.evaluate(() => ({
    theme: localStorage.getItem("theme"),
    viewMode: localStorage.getItem("viewMode"),
    landingMode: localStorage.getItem("landingMode"),
    fontSizeIndex: localStorage.getItem("fontSizeIndex"),
  }));
  await page.reload({ waitUntil: "networkidle" });
  const settingsAfter = await page.evaluate(() => ({
    theme: localStorage.getItem("theme"),
    viewMode: localStorage.getItem("viewMode"),
    landingMode: localStorage.getItem("landingMode"),
    fontSizeIndex: localStorage.getItem("fontSizeIndex"),
  }));
  check("theme survives reload (system scheme must not override a pick)",
    settingsBefore.theme === settingsAfter.theme,
    JSON.stringify(settingsBefore.theme) + " -> " + JSON.stringify(settingsAfter.theme));
  check("view mode survives reload", settingsBefore.viewMode === settingsAfter.viewMode);
  check("landing mode survives reload", settingsBefore.landingMode === settingsAfter.landingMode);
  check("font size survives reload", settingsBefore.fontSizeIndex === settingsAfter.fontSizeIndex);
  check("stacked view applies its class",
    await page.locator("#display.view-stacked").count() === 1);
  check("resume landing mode reopens the last chapter",
    (await shownChapter(page)) ===
      Number(await page.evaluate(() => localStorage.getItem("lastChapterIndex"))) + 1);

  section("[10] shuffle toggle");
  await openModal(page, "settings-button");
  const shuffleBefore = await page.evaluate(() => localStorage.getItem("shuffle-control"));
  await toggleCheckbox(page, "shuffle-control");
  const shuffleAfter = await page.evaluate(() => localStorage.getItem("shuffle-control"));
  check("toggling the shuffle control flips its stored value",
    shuffleBefore !== shuffleAfter, shuffleBefore + " -> " + shuffleAfter);
  await closeModals(page);
  await page.reload({ waitUntil: "networkidle" });
  await openModal(page, "settings-button");
  check("shuffle control is restored from storage",
    (await page.locator("#shuffle-control").isChecked()) === (shuffleAfter === "true"),
    "stored=" + shuffleAfter);
  await closeModals(page);

  section("[11] every theme survives a reload");
  const themeCount = await page.evaluate(() => document.querySelectorAll("#theme-swatches .theme-swatch").length);
  let themeFailures = [];
  for (let i = 0; i < themeCount; i++) {
    await openModal(page, "settings-button");
    await page.locator("#theme-swatches .theme-swatch").nth(i).click();
    await closeModals(page);
    await page.reload({ waitUntil: "networkidle" });
    const got = Number(await page.evaluate(() => localStorage.getItem("theme")));
    if (got !== i) themeFailures.push("theme " + i + " became " + got);
  }
  check("all " + themeCount + " themes persist", themeFailures.length === 0, themeFailures.join(", "));

  section("[12] shared links");
  await page.goto(base + "/index.html?ch=42&t=mitchell,legge", { waitUntil: "networkidle" });
  check("?ch= opens the shared chapter", (await shownChapter(page)) === 42,
    "got " + (await shownChapter(page)));
  check("?t= selects the shared translations",
    (await page.locator("#display .translation").count()) === 2,
    "got " + (await page.locator("#display .translation").count()));

  section("[13] about page");
  const aboutErrors = [];
  const aboutPage = await context.newPage();
  aboutPage.on("pageerror", (e) => aboutErrors.push(String(e)));
  aboutPage.on("console", (m) => {
    if (m.type() === "error") aboutErrors.push("console: " + m.text());
  });
  await aboutPage.goto(base + "/about.html", { waitUntil: "networkidle" });
  check("about.html loads without errors", aboutErrors.length === 0, aboutErrors.join(" | "));
  check("about.html gets themed",
    (await aboutPage.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--primaryColor").trim())) !== "");
  await aboutPage.close();

  noErrors("no page errors across the whole run");

  await browser.close();
  server.close();

  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
