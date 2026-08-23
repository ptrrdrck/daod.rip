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

## 1.2.0 — 2026-08-22

### Added

- The Library reopens on the tab and the chapter filter you last used. It used
  to reset to Translations every time it closed, so a reader who lives in the
  Chapters tab under Starred re-made both picks on every visit. Both rows now
  remember, across a close and across a reload, which is a default a reader sets
  by reading rather than by visiting Settings — no new controls anywhere.
- Nothing saved is reset by this. The two new stored keys fall back to
  Translations and Unread for anyone who has never picked, which is where the
  Library opened before.

### Fixed

- The ten translation labels in the Library line up on the left. At 600px and
  wider each label shrank to its text and centered itself, so the checkboxes sat
  in a ragged zigzag down the panel instead of a column. The rule that did this
  is gone rather than overridden, so the shuffle checkbox in Settings lines up
  the same way; narrow screens already looked right and are unchanged.
- Every Settings row is now a label with its controls beneath it, flush left at
  any width. The rows used to put the control at the right edge and fall back to
  stacking whenever one ran out of room, which happened at three different
  widths — View at 360px, Font size at 414px, Landing at 500px — so the modal
  rearranged itself as a window was resized. Now it does not.

## 1.1.0 — 2026-08-22

### Changed

- Picking a chapter from the Library closes the Library. It used to stay open
  over the chapter it had just opened, so every jump took a second dismissing
  tap. This applies to all three lists — All, Unread and Starred.
- Every translation font size steps down one notch. What was Large now renders
  at Normal, what was Normal renders at Small, and Small gets a new, smaller
  size below anything the ladder offered before. The old largest size is gone:
  a reader sitting on X-Large keeps that setting but sees what Large used to
  show. Nobody's saved size selection is reset — the level a reader picked is
  still the level they are on, it simply renders one step smaller.

## 1.0.2 — 2026-08-21

### Fixed

- Three typos in the text readers see. The Lin Yutang chapter 4 line read
  "whose Son it it"; the Red Pine chapter 57 line read "simplifY"; and the empty
  state under the Starred filter said "Tap the star while reading to star a
  chapter", which named the action without saying where the chapter ends up. It
  now reads "save a chapter to this list".
- Twenty-one typos in the translation texts themselves, across eighteen
  chapters, found by running the whole of `dao.js` through a spellcheck plus
  checks for doubled words, stray capitals and unbalanced punctuation. Twelve
  of those chapters are Robert G. Henricks, which suggests that source was
  transcribed by OCR: "the So of Heaven" for "the Son of Heaven" and "salture
  them which disks of jade" for "salute them with" in chapter 62, "compassions
  of death" for "companions of death" and "Whey they die" in chapter 76,
  "loard" for "lord", "thw" for "the", "crafy" for "crafty", and similar. The
  rest were "the the block" (Mitchell 28), "the the thousand things" (Henricks
  5), "Is is not true" (Yutang 39), "sick-mindness" (Yutang 71), "excresences"
  (Lau 24), "straighforward" (Lau 58) and "stay hidde" (Red Pine 15).
  Only unambiguous mechanical errors were corrected. Readings that could be a
  translator's own choice were left alone, among them Red Pine's "lost for a
  long long time" (58) and "encharged with the world" (13).

### Changed

- The About page keeps its introduction and drops the closing request for
  feedback, which pointed at an issue tracker rather than telling a reader
  anything about the app. In its place it now explains what the four buttons
  across the top of the reading page do, what the star and the history arrows
  are for, and that saved state lives in the reader's own browser with no
  account behind it. The controls had no explanation anywhere before this.
- `README.md` rewritten against the app as it now is. The old one documented a
  UI that no longer exists — a type-in field for viewing a chapter, a standalone
  theme changer, chapter links loose on the page — and illustrated it with eight
  screenshots that had gone stale. The screenshots are gone (`img/readme/` with
  them, since nothing else referenced it) and the user guide is now written out
  in text: what drip does, the star, the history strip, search, both library
  tabs, every setting, what a shared link carries, and what is kept in
  `localStorage`. It also records two behaviours that were not written down
  anywhere: opening a search result switches your selection to the translators
  that matched, and opening a shared link replaces your saved translation
  selection with the one in the link.
- The version number in the footer is no longer dimmed to 60% opacity. It names
  the version a reader is looking at, so it should be as legible as the text
  around it.

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
