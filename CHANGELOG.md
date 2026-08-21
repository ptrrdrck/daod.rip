# Changelog

## Versioning

Dao Drip is a website, not a library, so semantic versioning's usual meaning —
breaking changes to an API someone depends on — does not map cleanly. The
digits mean this here:

- **MAJOR** — a redesign, or a change that discards what readers have saved.
- **MINOR** — a new feature, or a visible change to how an existing one works.
- **PATCH** — a fix or an internal change a reader would not notice.

`master` is what publishes to daod.rip, so every merge to it is a version —
patches included, with no exemption for documentation or tooling changes. Two
different things hang off that:

- **A tag** is the record. Every version gets one: `git checkout v1.0.0` gives
  back exactly what shipped.
- **A GitHub Release** is an announcement on top of a tag, worth creating only
  for notable versions. A patch normally gets a tag and nothing more.

The same number appears in `package.json` and in `APP_VERSION` in `util.js`,
which is what the footer displays; the smoke test fails if the page and
`package.json` ever disagree. Because the footer shows it, no bump is invisible.

`storageEpoch` in `util.js` is a **separate number** and is expected to differ.
It counts how many times the shape of stored data has changed, and changing it
wipes every reader's saved state. It is not a release version and should never
be synced to this one.

## 1.0.1 — 2026-08-21

### Added

- `CLAUDE.md`, so the versioning convention, the separation between the release
  version and `storageEpoch`, and how to run the checks survive into sessions
  that were not present when they were decided.

### Changed

- `## Versioning` above now separates a tag from a GitHub Release, and states
  that every merge to `master` is a version. An earlier draft would have
  exempted documentation and tooling changes from bumping at all, which
  contradicted the PATCH definition already written here; this release is itself
  that kind of change, and takes a patch number accordingly.

## 1.0.0 — 2026-08-21

First tagged release. The project has been live and in use since 2023; this
marks the point where releases started being recorded rather than assigning it
any new significance.

The release also contains a substantial JavaScript overhaul:

### Fixed

- A chosen theme was silently overwritten by the system colour scheme. The
  override guarded theme indices 2 through 9 by listing them literally, so
  `color2` (index 10) never survived a reload, and an explicit light or dark
  pick never won against a conflicting system setting.
- The initial translation shuffle was biased. Over 200k trials the first
  translation appeared in the opening slot 19.4% of the time against an ideal
  10%, so a first-time reader's three translations skewed toward the head of
  the list.
- A reader who had seen exactly one chapter was offered a back button that
  re-showed the chapter they were already on.

### Changed

- Scripts load as ES modules, so dependencies between files are declared rather
  than implied by the order of the script tags. Opening `index.html` from disk
  no longer works; a local static server is needed.
- Chapter links are buttons with a delegated handler instead of `javascript:`
  URLs, which no longer required `viewChapter` to be a global.
- The history navigation derives from the reading log rather than mirroring it
  into six variables.
- View mode and landing mode share one helper instead of being the same block
  written twice.
- Translation selection is recorded once, as an array, instead of also being
  stored per checkbox.
- Values interpolated into a translation card are escaped.
- The footer shows the release version.

### Added

- A browser smoke test covering both pages, and eslint. Neither is needed to
  serve the site.

### Storage

- `storageEpoch` moved to 9.0.0, so readers returning from an earlier visit had
  their reading history, stars, translation selections and theme cleared once.

## Before 1.0.0

No releases were tagged between the first commit on 2023-01-16 and this one, so
there is no version history to reconstruct and none has been invented. What
does exist is the record of storage-shape changes, listed here because the dates
and commits are real — but these were never releases, and the numbers below are
unrelated to the release versions above.

| storageEpoch | date | note |
| --- | --- | --- |
| 2.0.0 | 2023-09-15 | the check was introduced |
| 3.0.0 | 2023-09-16 | |
| 4.0.0 | 2023-09-19 | |
| 5.0.0 | 2023-09-23 | |
| 6.0.0 | 2023-10-13 | |
| 7.0.0 | 2023-10-27 | |
| 8.0.0 | 2023-10-30 | stood for 1026 days |
| 9.0.0 | 2026-08-21 | released in 1.0.0 |
