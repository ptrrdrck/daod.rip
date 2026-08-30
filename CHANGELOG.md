# Changelog

## Versioning

Dao Drip is a website, not a library, so semantic versioning's usual meaning —
breaking changes to an API someone depends on — does not map cleanly. The
digits mean this here:

- **MAJOR** — a redesign, or a change that discards what readers have saved.
- **MINOR** — a reader can do something they could not do before, or an
  existing feature now behaves differently: the same action gives a different
  result.
- **PATCH** — everything else, and most versions are patches. Fixes,
  restyling, copy, documentation, tooling.

What separates the last two is whether the site *does* something different, not
whether anyone would notice. A change can be plainly visible — a new colour, a
different layout, text on a card instead of on the page — and still be a patch,
because a reader carries out the same actions and gets the same results.

`master` is what publishes to daod.rip, so every merge to it is a version —
patches included, with no exemption for documentation or tooling changes. Two
different things hang off that:

- **A tag** is the record. Every version gets one: `git checkout v1.0.0` gives
  back exactly what shipped.
- **A GitHub Release** is an announcement on top of a tag, worth creating only
  for notable versions. A patch normally gets a tag and nothing more.

The same number appears in `package.json` and in `APP_VERSION` in
`js/settings.js`, which is what the footer displays; the smoke test fails if the
page and `package.json` ever disagree. Because the footer shows it, no bump is
invisible.

`storageEpoch` in `js/settings.js` is a **separate number** and is expected to
differ. It counts how many times the shape of stored data has changed, and
changing it wipes every reader's saved state. It is not a release version and
should never be synced to this one.

## 1.5.0 — 2026-08-29

### Added

- Every translation now carries its rights: the year, the publisher, the
  citation, and whether it is public domain or still in copyright. A card
  prints that line under the citation, so a reader can see who owns the words
  they are reading and a publisher who finds the site finds their own name on
  the same line as their text. One of the ten — Legge, 1891 — is free to
  republish; the other nine are not. There are two statuses rather than three:
  a draft had a third for translations published after 1930 and never checked
  for renewal, which described Lin Yutang (1948) exactly, but it behaved
  identically to `restricted` everywhere it mattered and printed a hedge on
  the card that a reader could do nothing with. Unverified means in copyright
  until shown otherwise. `RIGHTS.md` records the one search that would settle
  it and why it is worth ten minutes.
- `quotableInFull` in `js/catalog.js`, which is the only question anything
  outside the site is allowed to ask before reproducing a translation. It
  answers `true` for public-domain entries and nothing else. Putting the check
  in the corpus rather than in each caller means a caller has to go out of its
  way to be careless rather than merely forget to be careful. `RIGHTS.md`
  explains what the site relies on for the other nine and why a feed, a print
  run or an export does not get to rely on the same thing.
- `tools/ingest.mjs`, run as `npm run corpus`. With `--verify` it checks what
  is here — that dao.js and the catalog agree on which translations exist,
  that each has 81 non-empty chapters, that no slug is used twice, and that
  nothing claims public domain with a date after the 1930 cutoff. Given a
  candidate file it checks a translation before it joins the corpus and prints
  the blocks to paste in. It refuses anything still in copyright: adding one of
  those is a decision to be made by hand, with the reasoning written down.
  It deliberately does not edit `js/dao.js` itself, because saving a minute of
  pasting is not worth a script that rewrites the one file the whole site is
  built on.
- `docs/permission-requests.md`: drafts asking Copper Canyon, Shambhala and
  Harper for permission to quote short excerpts with attribution and a link to
  buy the book. None have been sent.

### Changed

- The link at the foot of a card was labelled **Source** and went to Amazon,
  which is two things it was not. It is now **Buy the book**, and it goes to
  Bookshop.org, which pays a commission on the sale and splits a second one
  across independent bookshops. Public-domain translations get a **Read free**
  link to the full text alongside it. The ISBNs are the ISBN-13s of the same
  editions the old links pointed at, so a reader lands on the same book.
  Emptying `BOOKSHOP_AFFILIATE_ID` does not break them: they fall back to a
  search on the same ISBN, which reaches the same book and earns nothing.
- `js/dao.js` is the translation texts and nothing else. The `sources` export
  went with the Amazon and terebess.hu URLs it mostly held; its one surviving
  field, the citation, moved to the catalog entry beside the year, publisher
  and rights it belongs with. Every fact *about* a translation is now in one
  file, and `cards.js` reads them all from one import instead of two.
- The rights line names the translation year — "Translation © 1972 · Vintage
  Books" — because `year` records when a translation was made while the
  citation above it cites the printing consulted, and for Feng and English, Le
  Guin and Legge those are decades apart. Without the word the two lines read
  as contradicting each other. Derek Lin's year follows his citation to 1994,
  the translation, rather than the 2006 edition the ISBN points at.
- `npm run lint` covers `tools` as well as `js` and `test`.

## 1.4.6 — 2026-08-29

### Fixed

- The word "drip" sits on the middle of its button again. An earlier optical
  nudge shifted it up to answer the descender on the "p", and overshot:
  measured off the rendered glyphs at 4x, the word's ink box — ascender top to
  descender bottom — sat 1.6px above centre on a phone, 2.3px on a tablet and
  2.9px on a desktop, which reads as high on a circle. The asymmetric vertical
  padding is retuned so every breakpoint lands within 0.4px of centre. The
  padding sums are untouched, so the buttons are the same 88, 104 and 116px
  circles they were. The numbers come from measurement rather than from the
  font metrics, which disagreed with what Chromium actually drew by up to
  1.4px, and the base rule now says so.

### Changed

- The Settings labels are title case: **Font Size** and **Page Load Chapter**,
  matching Theme, View and Translation Order. The clear-storage confirmation no
  longer lists the saved theme separately, since "all other settings" already
  covers it. This shipped to `master` before this release and was never tagged,
  so it is recorded here rather than left out of the history. As in 1.4.5, only
  the visible text changes; the stored key and the button ids stay put, and the
  aria-labels stay sentence case as every other aria-label on the site is. The
  two assertions that name the setting follow the new text.
- `package-lock.json` is ignored. `npm install` writes one, but the repository
  has never tracked it: eslint and playwright exist only to run the checks, so
  nothing served from daod.rip depends on the resolved tree.

## 1.4.5 — 2026-08-28

### Changed

- The **Landing** setting is now **Page load chapter**, and it sits below
  Translation Order rather than above it. Only the label and the group's
  aria-label change: the stored key and the button ids stay as they were,
  because a reader's existing Random or Resume choice hangs on them.
- The page asks for `dao.js` and `main.js` as soon as the HTML is read. The
  browser could not discover `dao.js` until `main.js` had been fetched and
  parsed, which on a slow connection left the file that carries every
  translation unrequested for the first 600ms. Measured on a throttled
  connection, cards reach the screen about 250ms sooner, a 15% improvement.
  Nothing else about loading changes; the same bytes arrive, only earlier.

### Added

- Five assertions. Two pin the preload hints in place, since losing them would
  cost that 250ms back without anything failing. Three cover the renamed
  setting: that it carries the new label, that it sits directly below
  Translation Order, and that its buttons keep the ids a stored choice depends
  on.

## 1.4.4 — 2026-08-28

### Changed

- The About copy is shorter and plainer, and the tour of every button is gone.
  This shipped to `master` before this release and was never tagged, so it is
  recorded here rather than left out of the history.
- The three dialogs share one `setupModal` helper. Settings, Search and the
  Library each carried the same three listeners — open from a button, close
  from a close button, close when the backdrop is clicked — written out three
  times, and only what happens on open and on close actually differed. It is
  about the same number of lines either way; the point is that there is now one
  implementation to get right rather than three to keep in step.

### Added

- Sixteen assertions covering how the dialogs open and close. The suite closed
  them by calling `close()` directly, so neither of the two paths a reader
  actually uses had ever been exercised: the close button and the backdrop.
  Both are wired by one helper now, so a break in it would break all three
  dialogs at once. The new assertions also cover the guard that keeps a click
  on a dialog's own contents from closing it, and the things the three dialogs
  do differently: Search focusing its input on open and clearing its query on
  close, and Settings putting the clear-storage confirmation away.

## 1.4.3 — 2026-08-28

### Changed

- `script.js` is now ten modules under `js/`. It had reached 920 lines and held
  every concern the reading page has, so adding anything meant finding the right
  stretch of one file. Nothing a reader can do has changed.
- A naive split was not possible. Three pairs of concerns called each other in
  both directions, and six shared variables were reassigned across those
  boundaries — which a module cannot do to a binding it imports. `js/state.js`
  now owns that state, every other module reads and writes through it, and
  imports run in one direction: data, state, renderers, then the two entry
  modules.
- `util.js` and `script.js` became `js/settings.js` and `js/main.js`, named for
  the jobs they do. `setupChoiceSetting` moved to `js/util.js`, which now holds
  only helpers and runs nothing on import, so the entry modules depend on a
  library rather than on each other.
- `APP_VERSION` and `storageEpoch` moved with `settings.js`. `CLAUDE.md` and
  `README.md` name their new home; the old paths would have sent a reader to the
  wrong file.

## 1.4.2 — 2026-08-27

### Changed

- The line between MINOR and PATCH above now falls on what the site does
  rather than on what a reader would notice. It used to read "a visible change
  to how an existing one works", and *visible* turned out to cover far too
  much: the About card in 1.4.1 changed no behaviour at all and still argued
  its way to a minor bump under the old wording. Cosmetic changes are patches
  now, however obvious they are on screen. Nothing else about versioning
  moves — every merge to `master` is still a version, and patches are cheap.
- 1.4.1 shipped as 1.5.0 and was renumbered a few hours later under the rule
  above. It reached daod.rip with 1.5.0 in the footer, so a checkout of that
  commit carries the old number; the release is 1.4.1 everywhere else. There is
  no other 1.5.0, and the next minor will reuse the number.

## 1.4.1 — 2026-08-27

### Changed

- The About copy sits on a card, the same one every translation on the reading
  page sits on. It used to be set straight onto the page gradient, which made
  About look like a different site rather than the same one with different
  text. The card takes its background and border from the theme variables the
  translation cards use, so it follows all eleven themes without a rule of its
  own.

## 1.4.0 — 2026-08-23

### Added

- The Library's Translations tab now sets the order the cards appear in. Every
  row carries a pair of arrows, and the list reads the way the page does: the
  translations on screen first, in card order, then the rest alphabetically by
  the first translator's last name. The arrows cross that boundary rather than
  stopping at it — the down arrow on the last selected translation drops it
  into the unselected group, and the up arrow on an unselected one picks it up
  at the bottom of the selection.

### Changed

- "Shuffle translation display order" is now **Translation Order**, a choice
  between **Shuffled** and **Manual**. Shuffled is still the default and still
  reorders the cards on every chapter; Manual holds the order set in the
  Library. Reordering by hand switches the setting to Manual, because an order
  a reader has just set should survive the next chapter.
- Shuffled rewrites the stored order rather than only the rendered cards, so
  the Library names what is on screen after every drip instead of showing an
  order the page stopped using at load.
- Select All appends the translations that were not selected instead of
  replacing the selection, so an order already set survives it.

Readers who had turned the old shuffle checkbox off come back on Manual.
Nothing saved changes shape, so `storageEpoch` is untouched.

## 1.3.1 — 2026-08-23

### Changed

- `CLAUDE.md` now fixes the shape of the tag command a session hands over at
  the end of a release: one copy-paste line, pinned to the merge SHA rather
  than to wherever `master` points when it is run. Nothing about the site
  changes.

## 1.3.0 — 2026-08-23

### Changed

- The About copy holds the "Normal" step of the size ladder instead of
  following the size a reader last picked on the reading page. About carries no
  settings control, so a reader who had gone up to X-Large had no way to bring
  the page back down from the page itself.
- About leaves the same space under the drip button that the reading page
  leaves when it has no history to show. The copy used to start immediately
  under the button, which read as a different page rather than the same one
  with different text.

### Fixed

- The drip button on About behaves like the one on the reading page. About
  renders it as a link and the reading page as a button, and the link was
  taking three things from the browser that the button was not: the hover
  italic every other link on the site gets, its own font, and left-aligned
  text. All three are now spelled out on the button itself, so both pages draw
  the same control.

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
