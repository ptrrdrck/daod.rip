/* Launching Chromium, in a way that survives a browser build the installed
 * Playwright did not expect.
 *
 * Playwright pins a browser revision per release. When the image on a machine
 * carries a different revision — a prebuilt container, a CI runner, anything
 * where the browsers were installed separately from `npm install` — the
 * default launch fails with "Executable doesn't exist" and names a directory
 * that is not there.
 *
 * Rather than have each caller hardcode a path, this tries the normal launch
 * first and only goes looking if that fails. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE
 * to skip the search and name the binary outright.
 */

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

/* Where a separately installed browser tends to sit. Playwright itself reads
 * PLAYWRIGHT_BROWSERS_PATH, so if the revision matched we would never get
 * here; this is the same directory, searched by hand. */
function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) {
    return null;
  }
  const candidates = readdirSync(root)
    .filter((name) => name.startsWith("chromium"))
    /* Newest revision first: chromium-1194 beats chromium-1100, and the
     * headless shell sorts alongside the full build. */
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    .flatMap((name) => [
      path.join(root, name, "chrome-linux", "chrome"),
      path.join(root, name, "chrome-linux", "headless_shell"),
      path.join(root, name, "chrome-headless-shell-linux64", "chrome-headless-shell"),
    ]);
  return candidates.find((file) => existsSync(file)) || null;
}

export async function launchChromium(options = {}) {
  const named = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (named) {
    return chromium.launch({ ...options, executablePath: named });
  }
  try {
    return await chromium.launch(options);
  } catch (error) {
    if (!/Executable doesn't exist/.test(String(error))) {
      throw error;
    }
    const found = findChromium();
    if (!found) {
      throw error;
    }
    return chromium.launch({ ...options, executablePath: found });
  }
}
