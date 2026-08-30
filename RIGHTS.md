# Rights

What Dao Drip may do with each translation it carries, and what anything built
on top of it may not.

This file exists because the site is about to stop being only a site. A
comparison tool that shows ten translations side by side for study is one
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

### The one worth checking

Lin Yutang's *The Wisdom of Laotse* (Modern Library, 1948) is recorded as
`restricted`, and that is the safe reading rather than a determined one.

A US book published in 1948 kept its copyright only if a renewal was filed in
the 28th year, which for 1948 means 1975 or 1976. If no renewal was filed, the
translation is public domain and could join the quotable corpus — a real gain,
since it would be the only modern-voiced translation the Instagram pipeline
could use.

Settling it takes one search that has not been done: the **Stanford Copyright
Renewal Database** (`exhibits.stanford.edu/copyrightrenewals`), which indexes
Class A book renewals received between 1950 and 1992. The Catalog of Copyright
Entries at `onlinebooks.library.upenn.edu/cce/` is the fallback.

Two things point at a renewal having been filed, so do not expect a win:
Random House was a large publisher with a working renewals desk, and Greenwood
Press reissued the book in 1979, which is hard to explain if the copyright had
lapsed three years earlier. Check anyway — the cost is ten minutes and the
upside is a translation.

If the search comes back empty, change the status here and in
`js/catalog.js`, and record the date of the search and what was found.

## Where the ten stand

| Translation | Year | Status |
| --- | --- | --- |
| James Legge | 1891 | `public-domain` |
| Lin Yutang | 1948 | `restricted` (renewal unsearched — see above) |
| D. C. Lau | 1963 | `restricted` |
| Gia-Fu Feng & Jane English | 1972 | `restricted` |
| Stephen Mitchell | 1988 | `restricted` |
| Robert G. Henricks | 1989 | `restricted` |
| Stephen Addiss & Stanley Lombardo | 1993 | `restricted` |
| Derek Lin | 1994 | `restricted` |
| Red Pine (Bill Porter) | 1996 | `restricted` |
| Ursula K. Le Guin | 1997 | `restricted` |

One of ten is unambiguously free to republish. That number is the reason the
next section exists.

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
line. The only title where a renewal search would change the answer is Lin
Yutang, and that search has not been done. Anything that puts this text on
paper, or behind a price, is worth an hour of a lawyer's time first.
