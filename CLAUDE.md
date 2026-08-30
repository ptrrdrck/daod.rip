# Dao Drip

A static site that shows the same chapter of the Daodejing in several English
translations side by side. No build step and no runtime dependencies: the HTML,
CSS and JavaScript are served exactly as they sit in the repository.

`master` is what publishes to daod.rip through GitHub Pages, so merging to
`master` is deploying. There is no staging step.

## Versioning

Read `CHANGELOG.md` before bumping anything. It defines what MAJOR, MINOR and
PATCH mean for this project, and those definitions are not repeated here so the
two files cannot drift apart.

Every merge to `master` is a version, patches included. Two things follow from
that:

- **A tag is the record.** Every version gets one, so `git checkout v1.0.1`
  returns exactly what shipped. A GitHub Release is a separate, optional
  announcement layer, worth creating only for notable versions.
- **The release number lives in three places that must move together:**
  `APP_VERSION` in `js/settings.js`, `version` in `package.json`, and the tag.
  `test/smoke.mjs` fails if the footer and `package.json` disagree, which
  catches two of the three; the tag is on you to check.

`APP_VERSION` renders in the page footer, so there is no such thing as a silent
bump — the footer names the version a reader is looking at.

**`storageEpoch` in `js/settings.js` is a different number and must never be
synced to the release version.** It counts how many times stored data has
changed shape.
Changing it wipes every reader's saved reading history, stars, translation
selections and theme, so it moves only when stored data genuinely becomes
unreadable, and never to match a release. Its localStorage key is `"version"`
for historical reasons; renaming that key would make returning readers look like
first-time visitors and skip the wipe a bump exists to perform.

### Cutting a release from a session

Bump all three places, add the `CHANGELOG.md` entry, open a PR and merge it —
then hand the tag command to the user. **Pushing tags fails with HTTP 403 from
these sessions.** The credential covers `refs/heads/*` but not `refs/tags/*`;
branch pushes and merges through the GitHub MCP tools both work, so only the tag
step needs a human. Direct pushes to `master` are also blocked, hence the PR.

Hand the tag over as one copy-paste line, pinned to the merge commit rather
than to whatever `master` happens to point at by the time it is run:

```
git fetch origin master && git tag v1.3.0 648b560d16bdbdeb21ecaa4be0825b9509ba8b99 && git push origin v1.3.0
```

Substitute the version and the full merge SHA the merge returned. One line, in
that order, every time — the fetch is what makes the SHA resolvable in a
checkout that has not seen the merge yet.

## Running things

```
npm install     # playwright and eslint, used only for checks
npm test        # browser smoke test, starts its own server on a free port
npm run lint    # eslint with no-undef
npm run corpus  # dao.js and the catalog still agree; 81 chapters each
python3 -m http.server 8000    # to look at the site
```

The scripts are ES modules, so browsers fetch them under CORS rules and
`index.html` **cannot be opened from disk** — `file://` fails. A local HTTP
server is required.

`npm test` drives both pages in headless Chromium and asserts on structure
rather than on translation text. It is the only test coverage that exists, so
run it before pushing anything.

## Layout

`index.html` and `about.html` are the two pages. All the JavaScript is in `js/`,
and imports run in one direction — data, then state, then renderers, then the
entry modules. Nothing imports upwards, which is what keeps the graph free of
cycles.

Entry modules, loaded by a script tag:

- `js/settings.js` — both pages. `APP_VERSION`, `storageEpoch`, themes, font
  size, view mode, landing mode.
- `js/main.js` — the reading page only. Every action and every event listener:
  opening a chapter, seeking history, editing the selection, the modals,
  sharing, stars. The largest file, and the only one that composes the others.

Below them:

- `js/dao.js` — the translation texts, exported as data and nothing else.
  Large, and reproducing its text in output is not appropriate; treat it as a
  data file.
- `js/catalog.js` — everything true *about* a translation: slugs, sort order,
  chapter count, share-link parsing, and the citation, year, publisher, ISBN
  and rights status of each. Never changes as a reader uses the site.
- `js/state.js` — everything kept between renders, on one object because a
  module cannot assign to a binding it imports, plus every localStorage write
  the reading page makes.
- `js/util.js` — stateless helpers with no side effects on import.
- `js/cards.js`, `js/translation-list.js`, `js/chapter-list.js`,
  `js/history.js`, `js/search.js` — renderers. Each draws from state and
  returns; none of them calls an action, which is why none of them needs
  `main.js`.

`test/smoke.mjs` is the smoke test. `tools/ingest.mjs` checks the corpus and
gates new translations joining it.

## Adding a translation

A translation lives in **two files that must move together**, and the way they
can come apart is not obvious, so this is written down rather than left to be
rediscovered.

- `js/dao.js` holds the **text**: 81 chapters under the translator's name.
- `js/catalog.js` holds every **fact about** that text: slug, sort key, year,
  publisher, citation, rights, and the links.

`npm run corpus` is what makes the two agree, and it is not optional. A
catalog entry with no text behind it, or text with no entry, fails it.

### The rule the runtime follows

The site offers **only the translations both files agree on**. `carriedEntries`
in `js/catalog.js` is that intersection, and everything a reader can touch is
built from it: the library list, Select All, share links, search, the random
opening three, and the filtering of a stored selection. `translationCatalog`
itself is deliberately left unfiltered so `tools/ingest.mjs` can still see what
was actually written down and report the discrepancy.

This exists because a card renders `dao[name][chapter]`. Offer a library row
the text cannot back, and clicking it throws — which does not merely blank one
card. If it happens while `main.js` is still evaluating, no event listener is
ever attached and the whole page sits dead on its `Fetching translations...`
placeholder. That is a real failure that reached production, twice.

### Why the two files come apart

They reach the browser as **two separate files with independent cache
lifetimes**. A deploy that adds a translation changes both, so for as long as a
reader holds one new and one old, the pair disagrees — and `dao.js` is by far
the larger, so it is the one most likely to be served from cache while the
small `catalog.js` revalidates. The corpus check cannot see this, because in
the repository the two always agree.

The site now degrades instead of breaking: the unpaired translations are simply
not offered, and `catalog.js` logs which ones and why. **The consequence to
expect after adding a translation is that it may not appear for a returning
reader until both files refresh** — a hard reload, or GitHub Pages' cache
window. That is the designed behaviour, not a new bug.

### The checklist

1. Add the text to `js/dao.js` and the entry to `js/catalog.js`.
2. `npm run corpus` — dao and the catalog agree, 81 chapters each.
3. `npm run lint`.
4. `npm test` — includes a `/stale/` page that serves a `dao.js` three
   translations short of the catalog, which is the mismatch above reproduced on
   purpose. If those checks fail, the intersection rule has been broken.
5. Bump the version in the three places, per **Versioning** above.

### What testing this needs, and what it missed

Both production failures got through a green suite because every check started
from a **fresh profile against a matched pair of files**. Neither of the two
things that actually break is visible from there:

- **A returning reader's stored state.** A saved selection is the one piece of
  stored data that names something in the corpus, so it is the one that can go
  stale. Seed `localStorage` and reload; do not assert only on a clean boot.
- **A mismatched pair.** Serve the site with one file behind the other, which
  is what `/stale/` in `test/smoke.mjs` does.

Both are covered now. Anything that changes which translations exist, or how
they are looked up, should keep them covered.

## Rights

`RIGHTS.md` is the rule, and it is load-bearing rather than decorative. Nine of
the ten translations are still in copyright and are shown here under provisions
106 and 107; only Legge (1891) is public domain. That permission covers this
page and does not stretch to reproducing the text anywhere else.

So anything that takes a translation off this page — a card renderer, a feed,
an export, print — calls `quotableInFull` from `js/catalog.js` first and
honours the answer. Do not add a code path that reproduces a translation
without it, and do not relax a `rights` value without a written reason in
`RIGHTS.md`.
