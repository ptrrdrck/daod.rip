/* © 2021 Peter Rodrick <pete@lftlc.xyz> */

/* Version checking */
const version = "8.0.0";

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

/* Theme changing */
const themes = {
  light: {
    "--primaryColor": "#f2dfce",
    "--primaryTrans": "#dec3ab2a",
    "--secondaryColor": "#fff1e0",
    "--tertiaryColor": "#f2dfce",
    "--accentDark": "#001436",
    "--accentLight": "#fff1e0",
    "--fontColor": "#001436",
    "--borderColor": "#fff1e0",
    "--shadowColor": "#00143628",
    "--filterColor": "grayscale(100%) sepia(70%)",
  },
  dark: {
    "--primaryColor": "#000f28",
    "--primaryTrans": "#040d1c2a",
    "--secondaryColor": "#001436",
    "--tertiaryColor": "#000f28",
    "--accentDark": "#fff6eb",
    "--accentLight": "#001436",
    "--fontColor": "#fff6eb",
    "--borderColor": "#001436",
    "--shadowColor": "#fff6eb28",
    "--filterColor":
      "sepia(100%) brightness(88%) hue-rotate(170deg) saturate(150%)",
  },
  grayscale: {
    "--primaryColor": "#606060",
    "--primaryTrans": "#6060602a",
    "--secondaryColor": "#808080",
    "--tertiaryColor": "#808080",
    "--accentDark": "#fbfbfb",
    "--accentLight": "#929292",
    "--fontColor": "#fbfbfb",
    "--borderColor": "#929292",
    "--shadowColor": "#fbfbfb28",
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
    "--filterColor": "grayscale(100%)",
  },
  color: {
    "--primaryColor": "#e3cbff",
    "--primaryTrans": "#937af92a",
    "--secondaryColor": "#ffc489",
    "--tertiaryColor": "#ffc489",
    "--accentDark": "#240748",
    "--accentLight": "#beaeff",
    "--fontColor": "#240748",
    "--borderColor": "#beaeff",
    "--shadowColor": "#24074828",
    "--filterColor": "sepia(100%) hue-rotate(197deg) saturate(150%)",
  },
  color2: {
    "--primaryColor": "#cbe2ff",
    "--primaryTrans": "#7aa6f92a",
    "--secondaryColor": "#9dff89",
    "--tertiaryColor": "#9dff89",
    "--accentDark": "#072348",
    "--accentLight": "#aec9ff",
    "--fontColor": "#072348",
    "--borderColor": "#aec9ff",
    "--shadowColor": "#07234828",
    "--filterColor": "sepia(100%) hue-rotate(170deg) saturate(150%)",
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
