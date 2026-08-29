# Rights

What Dao Drip may do with each translation it carries, and what anything built
on top of it may not.

This file exists because the site is about to stop being only a site. A
comparison tool that shows ten translations side by side for study is one
thing; an account that reposts excerpts somewhere else, with money somewhere in
the picture, is a different thing with a different answer. Keeping the two
apart is easier if the difference is written down.

## The three statuses

Every entry in `translationCatalog` in `js/catalog.js` carries a `rights`
value. There are three.

**`public-domain`** — published in 1930 or earlier, and therefore free of US
copyright as of 1 January 2026. This is a moving line: it advances by one year
every 1 January, and `PUBLIC_DOMAIN_CUTOFF` in `tools/ingest.mjs` is the place
that records where it currently sits.

**`restricted`** — still under copyright. The site shows it under provisions
106 and 107 of Public Law 94-553, which is the notice at the top of
`js/dao.js`. That is a narrow permission covering comparison and study on this
page. It is not permission to reproduce the text anywhere else.

**`uncertain`** — published after 1930 and never checked for renewal. Treated
exactly as `restricted` until somebody does the search. Lin Yutang (1948) is
the only one, and the entry says so on the card.

## Where the ten stand

| Translation | Year | Status |
| --- | --- | --- |
| James Legge | 1891 | `public-domain` |
| Lin Yutang | 1948 | `uncertain` |
| D. C. Lau | 1963 | `restricted` |
| Gia-Fu Feng & Jane English | 1972 | `restricted` |
| Stephen Mitchell | 1988 | `restricted` |
| Robert G. Henricks | 1989 | `restricted` |
| Stephen Addiss & Stanley Lombardo | 1993 | `restricted` |
| Red Pine (Bill Porter) | 1996 | `restricted` |
| Ursula K. Le Guin | 1997 | `restricted` |
| Derek Lin | 2006 | `restricted` |

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

The buy links go to Bookshop.org rather than Amazon, and become affiliate
links once `BOOKSHOP_AFFILIATE_ID` in `js/catalog.js` is filled in. Until it
is, they still reach the right book and simply earn nothing.

Sending readers to buy the book is the most useful thing this site can do for
the people whose work it shows, and it is worth more than the commission.

## Permission requests

Drafts to three publishers are in `docs/permission-requests.md`. **None have
been sent.** If any is granted, record the grant and its terms here, and only
then relax the status of that translation.

## Not legal advice

The statuses above are read off publication dates and the US public-domain
line. No title-by-title renewal search has been done. Anything that puts this
text on paper, or behind a price, is worth an hour of a lawyer's time first.
