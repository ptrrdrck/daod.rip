# Rights

What Dao Drip may do with each translation it carries, and what anything built
on top of it may not.

This file exists because the site is about to stop being only a site. A
comparison tool that shows thirteen translations side by side for study is one
thing; an account that reposts excerpts somewhere else, with money somewhere in
the picture, is a different thing with a different answer. Keeping the two
apart is easier if the difference is written down.

## The two statuses

Every entry in `translationCatalog` in `js/catalog.js` carries a `rights`
value. There are two.

**`public-domain`** — published in 1930 or earlier, and therefore free of US
copyright as of 1 January 2026. This is a moving line: it advances by one year
every 1 January, and `PUBLIC_DOMAIN_CUTOFF` in `tools/ingest.mjs` is the place
that records where it currently sits.

**`restricted`** — everything else. The site shows it under provisions 106 and
107 of Public Law 94-553, which is the notice at the top of `js/dao.js`. That
is a narrow permission covering comparison and study on this page. It is not
permission to reproduce the text anywhere else.

There is deliberately no third status for "probably in copyright but nobody
has checked". It would behave identically to `restricted` everywhere that
matters, and printing the doubt on a card gives a reader nothing they can act
on. Unverified means in copyright until shown otherwise.

### The one that was worth checking

Lin Yutang's *The Wisdom of Laotse* (Modern Library, 1948) is `restricted`,
and that is now a determined answer rather than a safe reading.

A US book published in 1948 kept its copyright only if a renewal was filed in
the 28th year, which for 1948 means 1975 or 1976. **It was filed.** Searched on
30 August 2026, in the renewals section of the *Catalog of Copyright Entries*,
Third Series, Part 1 (Books and Pamphlets), January–June 1976:

> **R624226.** The Wisdom of Laotse. Editor, introd., translation & notes:
> Yutang Lin. NM: introd., translation & notes. © 20Dec48; A28447. Yutang Lin
> (A); 14Jan76; R624226.

The original registration is A28447 of 20 December 1948; Lin Yutang renewed it
himself on 14 January 1976, claiming the introduction, translation and notes as
new matter. A renewed 1948 book runs 95 years from publication, so this one
enters the public domain on 1 January 2044. It stays out of the quotable corpus
until then.

The two signs that pointed this way were both right: Random House ran a working
renewals desk, and the 1979 Greenwood reissue is exactly what a live copyright
looks like.

**A note on the source.** RIGHTS.md named the Stanford Copyright Renewal
Database as the search to do and the Catalog of Copyright Entries as the
fallback. It was the fallback that answered: `exhibits.stanford.edu` sits behind
a JavaScript anti-bot challenge that a scripted fetch cannot pass, so the CCE
volumes on archive.org were searched directly instead. That is the same records
Stanford indexes, one step closer to the source, and the renewal number can be
checked against either.

## Where the thirteen stand

| Translation | Year | Status |
| --- | --- | --- |
| James Legge | 1891 | `public-domain` |
| Walter Gorn Old | 1904 | `public-domain` |
| Paul Carus | 1913 | `public-domain` |
| Dwight Goddard | 1919 | `public-domain` |
| Lin Yutang | 1948 | `restricted` (renewed 14 Jan 1976 — see above) |
| D. C. Lau | 1963 | `restricted` |
| Gia-Fu Feng & Jane English | 1972 | `restricted` |
| Stephen Mitchell | 1988 | `restricted` |
| Robert G. Henricks | 1989 | `restricted` |
| Stephen Addiss & Stanley Lombardo | 1993 | `restricted` |
| Derek Lin | 1994 | `restricted` |
| Red Pine (Bill Porter) | 1996 | `restricted` |
| Ursula K. Le Guin | 1997 | `restricted` |

Four of thirteen are free to republish, up from one. That is the difference
between an Instagram account that can run and one that cannot.

### Where the public-domain text came from

sacred-texts.com is unreachable from a scripted fetch — it sits behind a
Cloudflare challenge — and the Wayback Machine could not be reached either. All
three new translations were therefore parsed from page scans on archive.org,
which is OCR rather than a transcription, so each was checked rather than
trusted:

- **Carus (1913)** was parsed from one scan and then compared word by word
  against a second, independent scan of the same edition. Seventeen
  disagreements remained; in every one of them the second scan was the one in
  error. Note that the 1913 *Canon of Reason and Virtue* is a genuine revision
  of Carus's 1898 translation, not a reprint — chapter 2 is rewritten — so 1913
  is the date recorded.
- **Old (1904)** was parsed from the cleaner of two scans. Its commentary is set
  in a narrower measure than the translation, which is what separates the two;
  every one of the 81 break points was checked by eye against the line that
  triggered it.
- **Goddard (1919)** survives in a single scan of that edition, so there was
  nothing to diff it against. Its OCR damage is a small, repeating set of
  letter-shape confusions (`ll` read as `U`, `li` as `h`, `un` as `im`), and
  each was repaired only where exactly one candidate was a word the dictionary
  knew; the rest were read off the scan by hand. This one rests on a spell audit
  rather than on a second witness, which is a weaker guarantee — worth knowing
  if a reading ever looks wrong.

### The two that are not here yet

**Isabella Mears (1916)** and **Balfour (1884)** were attempted and left out.

Mears's 1916 scan loses 26 of its 81 chapter numerals, and several chapters run
together with no recoverable boundary; her own revised 1922 edition scans better
but interleaves marginal Chinese glosses into the text. Balfour prints the
Chinese alongside the English, which OCRs as columns of stray glyphs, and his
smaller-type remarks are not reliably marked in the text layer, so commentary
leaks into the chapters.

Both are recoverable from the hOCR layer, which carries font size and position
and would separate translation from commentary properly. Neither was worth
guessing at: a chapter boundary placed by eye is a silent way to put the wrong
words under the right number, and the whole point of this corpus is that it can
be trusted.

## The rule for anything downstream

**Nothing reproduces a translation away from this page without asking
`quotableInFull` first.**

```js
import { quotableInFull } from "./js/catalog.js";
```

It returns `true` only for `public-domain`. Card renderers, feeds, exports,
print work — anything that takes the text somewhere the fair-use posture above
does not reach — calls it and honours the answer. The point of putting the
check in the corpus rather than in each caller is that a caller cannot forget
to be careful; it has to go out of its way to be careless.

This is not a hypothetical. The intended first consumer is a renderer that
turns chapters into images for an Instagram account. Republishing an in-print
translation at a daily cadence, with revenue anywhere nearby, is weaker on
both the commercial-purpose and the market-effect factors than this site is,
and the takedown process on that platform is fast and offers no forum for
argument. So that pipeline runs on public-domain text only, and the corpus
enforces it rather than trusting a habit.

## Adding a translation

Run it past the gate first:

```
node tools/ingest.mjs candidate.json
```

It refuses anything that is not public domain, anything dated after the
cutoff, anything that is not exactly 81 chapters, and anything with markup or
stray whitespace left in the text. If it passes, it prints the blocks to paste
into `js/dao.js` and `js/catalog.js`.

Adding a translation that is still in copyright is a deliberate decision made
by hand, not something this script will do for you. If it happens, the
reasoning belongs in this file.

## Attribution and sales

Every card names the translator, the year and the publisher, and carries a
link to buy the book. Public-domain entries also carry a link to read the text
for nothing.

The buy links go to Bookshop.org rather than Amazon, as affiliate links under
id `127992`. Emptying `BOOKSHOP_AFFILIATE_ID` in `js/catalog.js` does not
break them: they fall back to a search on the same ISBN, which reaches the
same book and earns nothing.

Sending readers to buy the book is the most useful thing this site can do for
the people whose work it shows, and it is worth more than the commission.

## Permission requests

Drafts to three publishers are in `docs/permission-requests.md`. **None have
been sent.** If any is granted, record the grant and its terms here, and only
then relax the status of that translation.

## Not legal advice

The statuses above are read off publication dates and the US public-domain
line, plus the one renewal search that could have changed an answer — Lin
Yutang, settled above and settled against us. Anything that puts this text on
paper, or behind a price, is worth an hour of a lawyer's time first.
