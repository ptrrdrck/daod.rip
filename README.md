# Dao Drip

a.k.a Mixed Messages

## Planning

### Topic

The philosophical text of the Daodejing.

### User story

"As a _user_, I want to _read small passages of the Daodejing_, so that _I may learn it's wisdom a little bit at a time_."

### Build notes

- Choose three English translations of the Daodejing.
  - Break up chapters into a JS object
- Create the drip message function
  - Display a random chapter
  - When called:
    - return a chapter number
    - return that chapter's text
    - return that same chapter's text from the second translation
    - return that same chapter's text from the third translation
- New random message button
  - Call drip message function
