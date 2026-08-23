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
  `APP_VERSION` in `util.js`, `version` in `package.json`, and the tag.
  `test/smoke.mjs` fails if the footer and `package.json` disagree, which
  catches two of the three; the tag is on you to check.

`APP_VERSION` renders in the page footer, so there is no such thing as a silent
bump — the footer names the version a reader is looking at.

**`storageEpoch` in `util.js` is a different number and must never be synced to
the release version.** It counts how many times stored data has changed shape.
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
python3 -m http.server 8000    # to look at the site
```

The scripts are ES modules, so browsers fetch them under CORS rules and
`index.html` **cannot be opened from disk** — `file://` fails. A local HTTP
server is required.

`npm test` drives both pages in headless Chromium and asserts on structure
rather than on translation text. It is the only test coverage that exists, so
run it before pushing anything.

## Layout

- `index.html`, `about.html` — the two pages
- `script.js` — reading, history, search, library and bookmarks; imports `dao.js`
- `util.js` — version, themes, and the settings controls; loaded by both pages
- `dao.js` — the translations and their sources, exported as data. Large, and
  reproducing its text in output is not appropriate; treat it as a data file.
- `test/smoke.mjs` — the smoke test
