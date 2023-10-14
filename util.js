/**
    Dao  Drip © Peter Rodrick.
    Displays the same random chapter of the Daodejing
    from characteristically distinct translations.
**/

/**
 * Current year display
 */
document.getElementById("year").innerHTML = new Date().getFullYear();

/**
 * Version checking
 */
const version = "6.0.0";

if (
  localStorage.getItem("version") === "undefined" ||
  localStorage.getItem("version") === null
) {
  localStorage.setItem("version", version);
}

if (localStorage.getItem("version") !== version) {
  localStorage.clear();
  localStorage.setItem("version", version);
}

/**
 * Theme changing
 */
const themes = {
  light: {
    "--primaryColor": "#f2dfce",
    "--primaryTrans": "#f2dfce2a",
    "--secondaryColor": "#fff1e0",
    "--tertiaryColor": "#f2dfce",
    "--accentDark": "#001436",
    "--accentLight": "#fff1e0",
    "--fontColor": "#001436",
    "--borderColor": "#fff1e0",
    "--shadowColor": "#00143628",
    "--cursorColor": "#00143663",
    "--filterColor": "grayscale(100%) sepia(70%)",
  },
  dark: {
    "--primaryColor": "#000f28",
    "--primaryTrans": "#000f282a",
    "--secondaryColor": "#001436",
    "--tertiaryColor": "#000f28",
    "--accentDark": "#fff6eb",
    "--accentLight": "#001436",
    "--fontColor": "#fff6eb",
    "--borderColor": "#001436",
    "--shadowColor": "#fff6eb28",
    "--cursorColor": "#fff6eb63",
    "--filterColor":
      "sepia(100%) brightness(88%) hue-rotate(170deg) saturate(150%)",
  },
  grayscale: {
    "--primaryColor": "#747474",
    "--primaryTrans": "#7474742a",
    "--secondaryColor": "#949494",
    "--tertiaryColor": "#747474",
    "--accentDark": "#fbfbfb",
    "--accentLight": "#a4a4a4",
    "--fontColor": "#fbfbfb",
    "--borderColor": "#a4a4a4",
    "--shadowColor": "#fbfbfb28",
    "--cursorColor": "#fbfbfb63",
    "--filterColor": "grayscale(100%)",
  },
  blackwhite: {
    "--primaryColor": "#fff",
    "--primaryTrans": "#ffffff2a",
    "--secondaryColor": "#fff",
    "--tertiaryColor": "#fff",
    "--accentDark": "#000",
    "--accentLight": "#fff",
    "--fontColor": "#000",
    "--borderColor": "#000",
    "--shadowColor": "#00000028",
    "--cursorColor": "#00000063",
    "--filterColor": "grayscale(100%)",
  },
  color: {
    "--primaryColor": "#e3cbff",
    "--primaryTrans": "#e3cbff2a",
    "--secondaryColor": "#ffc489",
    "--tertiaryColor": "#ffc489",
    "--accentDark": "#126e5c",
    "--accentLight": "#beaeff",
    "--fontColor": "#240748",
    "--borderColor": "#beaeff",
    "--shadowColor": "#24074828",
    "--cursorColor": "#126e5c63",
    "--filterColor": "sepia(100%) hue-rotate(197deg) saturate(150%)",
  },
};

var themesIndex = 0;

function change(theme) {
  for (let prop in theme) {
    document.querySelector(":root").style.setProperty(prop, theme[prop]);
  }
}

var theme = themes[Object.keys(themes)[themesIndex]];
change(theme);

document.getElementById("change").addEventListener("click", function () {
  themesIndex++;
  var themeCount = Object.keys(themes).length;
  themesIndex = themesIndex <= themeCount - 1 ? themesIndex : 0;
  var theme = themes[Object.keys(themes)[themesIndex]];
  change(theme);
  localStorage.setItem("theme", themesIndex);
});

if (localStorage.getItem("theme")) {
  themesIndex = localStorage.getItem("theme");
  var theme = themes[Object.keys(themes)[themesIndex]];
  change(theme);
} else {
  localStorage.setItem("theme", themesIndex);
}

function activateDarkMode() {
  change(themes[Object.keys(themes)[1]]);
  localStorage.setItem("theme", 1);
}

if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches &&
  localStorage.getItem("theme") != 2 &&
  localStorage.getItem("theme") != 3 &&
  localStorage.getItem("theme") != 4
) {
  activateDarkMode();
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => e.matches && activateDarkMode());

function activateLightMode() {
  change(themes[Object.keys(themes)[0]]);
  localStorage.setItem("theme", 0);
}

if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: light)").matches &&
  localStorage.getItem("theme") != 2 &&
  localStorage.getItem("theme") != 3 &&
  localStorage.getItem("theme") != 4
) {
  activateLightMode();
}

window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => e.matches && activateLightMode());
