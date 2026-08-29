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

- `js/dao.js` — the translations and their sources, exported as data. Large, and
  reproducing its text in output is not appropriate; treat it as a data file.
- `js/catalog.js` — which translations exist, their slugs, sort order, chapter
  count, and share-link parsing. Never changes as a reader uses the site.
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
