# Dao Drip

Read ten English translations of the Dàodéjīng — 🗣 *"Dow Duh Jeang"* — side by
side, at **[daod.rip](https://daod.rip)**.

One chapter at a time, rendered by several translators at once. Where the
translations agree you are probably looking at the source text; where they part
company you are looking at the translators. Eighty-one chapters, ten
translations, no account and no build step.

## Contents

- [User guide](#user-guide)
- [Translations](#translations)
- [Local development](#local-development)
- [Project layout](#project-layout)
- [Versioning](#versioning)
- [Contributing](#contributing)

## User guide

Four buttons sit across the top of the reading page — share, settings, search
and library. Everything else happens on the chapter cards themselves.

### Drip a chapter

**drip** picks one of the 81 chapters at random and lays your selected
translations out together. The yin-yang in the footer does the same thing, if it
happens to be closer to your thumb. The pick is genuinely random rather than a
walk through what you have not seen, so chapters do repeat — the Unread filter
in the library is the way to find the ones you have missed.

A first-time visitor gets three translations chosen at random. Choose your own
in the library and that choice is what comes back on the next visit.

Every card carries the chapter number, the translator, a citation, and a
**Source** link to where that translation can be read or bought.

### Star a chapter

The star on a card keeps that chapter in a list you can return to. It belongs to
the chapter rather than to the card, so starring one card stars the chapter
across all of them. Starred chapters are under **Library → Chapters → Starred**.

### Move back through what you have read

Once you have read more than one chapter, a strip of chapter numbers appears
above the text — what you read before on the left, what you read after on the
right, with arrows to step through them.

It is a log of the order you actually visited chapters in, not a sorted list, so
seeking back retraces your own path rather than counting down from 81. It
survives a reload, and it stops at either end instead of wrapping.

### Search

**Search** finds a word or phrase across all ten translations at once, from two
characters up. Results are grouped by chapter and tell you how widely the phrase
is shared — *"3 of 10 translations"* — with each match highlighted in its
surrounding sentence.

Clicking a result opens that chapter **and switches your selection to the
translators that matched it**, so you arrive looking at the renderings that
actually contain your phrase rather than ones that never mention it.

### Library

**Library** has two tabs.

**Translations** — a checkbox for each of the ten, plus Select All and Deselect
All. Two translations make a close comparison; all ten make a wide one.

**Chapters** — every chapter as a numbered link, under three filters:

| Filter | Shows |
| --- | --- |
| **All** | All 81 chapters. |
| **Unread** | The chapters you have not opened yet. **Reset** marks every chapter unread again. |
| **Starred** | The chapters you starred. |

### Settings

| Setting | What it does |
| --- | --- |
| **Theme** | Eleven of them, from plain light and dark through ocean, forest, sunset and lavender. |
| **Text size** | Four steps, Small through X-Large. |
| **View** | **Grid** flows the cards into as many columns as the window allows; **Stacked** keeps them in one column. |
| **Landing chapter** | **Random** opens a new chapter on every visit; **Resume** reopens the one you were last reading. |
| **Shuffle translation display order** | On by default, so no single translator is always the one you read first. Turn it off to keep the order fixed. |
| **Clear Local Storage** | Wipes everything listed under [What is saved](#what-is-saved-and-where). It asks before it does it. |

Until you pick a theme, the site follows your system light/dark setting and goes
on following it when that setting changes. Picking one ends that — your choice
then wins, in either direction.

### Share a chapter

The share button copies a link to the chapter you are reading with your current
translators attached, like `?ch=42&t=mitchell,leguin,redpine`. Whoever opens it
sees the same chapter in the same translations.

Worth knowing before you open someone else's link: a shared link **replaces your
own saved translation selection** with the one in the link. Your reading history
and stars are untouched; the checkboxes are not.

### What is saved, and where

Reading history, starred chapters, translation selection, theme, text size, view
mode and landing preference are all kept in `localStorage`, in your own browser.
There is no account and no server — the site is static files, and nothing you do
on it is sent anywhere.

That cuts both ways. Nothing to sign up for, and nothing to leak; but your
history does not follow you between devices or browsers, and clearing your
browsing data clears it.

## Translations

| Translator | Edition |
| --- | --- |
| James Legge | *The Tao Te Ching* (1891) |
| Lin Yutang | *The Wisdom of Laotse* — Random House (1948) |
| D. C. Lau | *Tao Te Ching* — Penguin Classics (1963) |
| Stephen Mitchell | *Tao Te Ching: A New English Version* — Harper Perennial (1988) |
| Robert G. Henricks | *Te-Tao Ching*, from the Ma-wang-tui texts — Ballantine (1989) |
| Stephen Addiss & Stanley Lombardo | *Tao Te Ching* — Hackett (1993) |
| Derek Lin | *Tao Teh Ching* (1994) |
| Red Pine (Bill Porter) | *Lao-tzu's Taoteching* — Mercury House (1996) |
| Gia-Fu Feng & Jane English | *Tao Te Ching* — Vintage Books (2011) |
| Ursula K. Le Guin | *Tao Te Ching: A Book about the Way and the Power of the Way* — Shambhala (2011) |

Nine of these are still in copyright and are reproduced under provisions 106
and 107 of Public Law 94-553, which permit limited reproduction of copyrighted
material for educational and scholarly purposes. Legge (1891) is public domain.
Every card names the translator, the year and the publisher, and links to buy
the book; the books are worth owning.

That permission covers showing the translations here, and does not stretch to
reproducing them anywhere else. [`RIGHTS.md`](RIGHTS.md) sets out where each
one stands and the check anything downstream has to pass first.

## Local development

The scripts load as ES modules, which browsers fetch under CORS rules, so
opening `index.html` straight from disk will not work — the browser blocks
`file://` module requests. Serve the folder over HTTP instead:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The site itself has no build step and no
runtime dependencies.

### Checks

There is a browser smoke test that drives the real pages and asserts on what a
reader can see. It needs the dev dependencies, which are only used for checking
the site, never for serving it:

```
npm install
npm test       # drives index.html and about.html in headless Chromium
npm run lint   # catches undefined references, which module scope now enforces
npm run corpus # checks dao.js and the catalog still agree about the corpus
```

`npm test` starts its own static server on a free port, so nothing needs to be
running first. It asserts on structure rather than on translation text, so
adding or editing a translation will not break it.

## Project layout

| File | What is in it |
| --- | --- |
| `index.html` | The reading page, including the settings, search and library dialogs. |
| `about.html` | The about page. |
| `js/main.js` | Every action and listener on the reading page: opening chapters, history, the modals, sharing, stars. |
| `js/settings.js` | Version, themes, font size, view and landing mode. Loaded by both pages. |
| `js/state.js` | What is kept between renders, and every localStorage write. |
| `js/catalog.js` | Which translations exist, how they sort, how a share link names them, their citations, and what may lawfully be done with each. |
| `js/cards.js`, `js/translation-list.js`, `js/chapter-list.js`, `js/history.js`, `js/search.js` | The renderers, one per part of the page. |
| `js/util.js` | Stateless helpers shared by both entry modules. |
| `js/dao.js` | The translation texts, exported as data and nothing else. |
| `style.css` | All of the styling, including the theme variables. |
| `test/smoke.mjs` | The smoke test. |
| `tools/ingest.mjs` | Corpus checks, and the gate a new translation passes before joining. |
| `RIGHTS.md` | What may be done with each translation, and what may not. |

## Versioning

Every merge to `master` deploys to daod.rip and takes a version.
[`CHANGELOG.md`](./CHANGELOG.md) defines what MAJOR, MINOR and PATCH mean here
and records what shipped in each one.

## Contributing

Contributions are welcome — a new translation, a new theme, a fix to the code or
to the text.

1. Fork the repository.
2. Branch for your change: `git checkout -b feature-name`.
3. Make it, and run `npm test` and `npm run lint`.
4. Commit and push to your fork.
5. Open a pull request.

If you find a bug or a typo in a translation, or want to suggest a feature,
[open an issue](https://github.com/ptrrdrck/daod.rip/issues/new) — or follow the
steps above and fix it yourself.
