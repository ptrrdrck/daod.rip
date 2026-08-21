# Dao Drip

Read English translations of the Dàodéjīng ("Dow Duh Jeang") side by side.

## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [Local development](#local-development)
- [Contributing](#contributing)

## Introduction

Dao Drip is a browser application that allows a user to read several English translations of the Daodejing side by side. To start, the app selects the same random chapter from three different translations. A user's reading history, selected translations, and settings are saved locally in the broswer so they can pick up right where they left off.

## Usage

Use the "Drip" buttons to display a new random chapter.
![image](./img/readme/drip-button-1.png)

![image](./img/readme/drip-button-2.png)

Navigate your reading history with the arrow buttons.
![image](./img/readme/history.png)

Choose a new color theme for the site.
![image](./img/readme/theme-changer.png)

Use the type-in field and arrow buttons to manually "View" a specific chapter (1-81).
![image](./img/readme/view-chapter-button.png)

Use the unread chapter links to view a chapter that has not been displayed for you yet. Use the "Reset" button to show all chapter links again.
![image](./img/readme/unread-chapter-links.png)

Use the checkboxes to select your preferred translations and toggle their display.
![image](./img/readme/translation-selection.png)

Translations are displayed in a randomly shuffled order by default. Toggle this setting to have them display in a consistent order.
![image](./img/readme/shuffle-control.png)

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
npm test     # drives index.html and about.html in headless Chromium
npm run lint # catches undefined references, which module scope now enforces
```

`npm test` starts its own static server on a free port, so nothing needs to be
running first.

## Contributing

Contributions are welcome! If you would like to add a new translation, new theme, or improve the code, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m "Add feature"`.
4. Push to your forked repository: `git push origin feature-name`.
5. Open a pull request.

If you identify a bug, translation typo, or want to suggest a new feature please [open an issue](https://github.com/ptrrdrck/daod.rip/issues/new) or feel free to follow the steps above and work on it yourself.
