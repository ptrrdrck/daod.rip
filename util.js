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
  white: {
    "--primaryColor": "#fff",
    "--primaryTrans": "#ffffff2a",
    "--secondaryColor": "#fff",
    "--tertiaryColor": "#fff",
    "--accentDark": "#000",
    "--accentLight": "#fff",
    "--fontColor": "#000",
    "--borderColor": "#fff",
    "--shadowColor": "#00000028",
    "--filterColor": "grayscale(100%)",
  },
  black: {
    "--primaryColor": "#000",
    "--primaryTrans": "#0000002a",
    "--secondaryColor": "#000",
    "--tertiaryColor": "#000",
    "--accentDark": "#fff",
    "--accentLight": "#000",
    "--fontColor": "#fff",
    "--borderColor": "#000",
    "--shadowColor": "#ffffff28",
    "--filterColor": "grayscale(100%)",
  },
  gray: {
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
  ocean: {
    "--primaryColor": "#e0f2f1",
    "--primaryTrans": "#4dd0e12a",
    "--secondaryColor": "#b2dfdb",
    "--tertiaryColor": "#b2dfdb",
    "--accentDark": "#004d40",
    "--accentLight": "#80cbc4",
    "--fontColor": "#004d40",
    "--borderColor": "#4db6ac",
    "--shadowColor": "#004d4028",
    "--filterColor": "sepia(100%) hue-rotate(140deg) saturate(120%)",
  },
  forest: {
    "--primaryColor": "#e8f5e8",
    "--primaryTrans": "#4caf502a",
    "--secondaryColor": "#c8e6c9",
    "--tertiaryColor": "#c8e6c9",
    "--accentDark": "#1b5e20",
    "--accentLight": "#81c784",
    "--fontColor": "#1b5e20",
    "--borderColor": "#66bb6a",
    "--shadowColor": "#1b5e2028",
    "--filterColor": "sepia(100%) hue-rotate(90deg) saturate(140%)",
  },
  sunset: {
    "--primaryColor": "#fff3e0",
    "--primaryTrans": "#ff98022a",
    "--secondaryColor": "#ffe0b2",
    "--tertiaryColor": "#ffe0b2",
    "--accentDark": "#e65100",
    "--accentLight": "#ffab40",
    "--fontColor": "#e65100",
    "--borderColor": "#ff8f00",
    "--shadowColor": "#e6510028",
    "--filterColor": "sepia(100%) hue-rotate(30deg) saturate(160%)",
  },
  lavender: {
    "--primaryColor": "#f3e5f5",
    "--primaryTrans": "#ba68c82a",
    "--secondaryColor": "#e1bee7",
    "--tertiaryColor": "#e1bee7",
    "--accentDark": "#4a148c",
    "--accentLight": "#ce93d8",
    "--fontColor": "#4a148c",
    "--borderColor": "#ab47bc",
    "--shadowColor": "#4a148c28",
    "--filterColor": "sepia(100%) hue-rotate(270deg) saturate(130%)",
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
  localStorage.getItem("theme") != 4 &&
  localStorage.getItem("theme") != 5 &&
  localStorage.getItem("theme") != 6 &&
  localStorage.getItem("theme") != 7 &&
  localStorage.getItem("theme") != 8 &&
  localStorage.getItem("theme") != 9
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
  localStorage.getItem("theme") != 4 &&
  localStorage.getItem("theme") != 5 &&
  localStorage.getItem("theme") != 6 &&
  localStorage.getItem("theme") != 7 &&
  localStorage.getItem("theme") != 8 &&
  localStorage.getItem("theme") != 9
) {
  activateLightMode();
}

window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => e.matches && activateLightMode());

/* Font size */
const fontSizeScales = [0.85, 1, 1.15, 1.3];
const fontSizeLabels = ["Small", "Normal", "Large", "X-Large"];
var fontSizeIndex = 1;

const fontSizeDecreaseButton = document.getElementById(
  "font-size-decrease-button"
);
const fontSizeIncreaseButton = document.getElementById(
  "font-size-increase-button"
);
const fontSizeLabelEl = document.getElementById("font-size-label");

function changeFontSize(index) {
  document
    .querySelector(":root")
    .style.setProperty("--fontSizeScale", fontSizeScales[index]);
  fontSizeLabelEl.textContent = fontSizeLabels[index];
  fontSizeDecreaseButton.disabled = index <= 0;
  fontSizeIncreaseButton.disabled = index >= fontSizeScales.length - 1;
}

if (localStorage.getItem("fontSizeIndex")) {
  fontSizeIndex = parseInt(localStorage.getItem("fontSizeIndex"), 10);
} else {
  localStorage.setItem("fontSizeIndex", fontSizeIndex);
}
changeFontSize(fontSizeIndex);

fontSizeDecreaseButton.addEventListener("click", () => {
  if (fontSizeIndex > 0) {
    fontSizeIndex--;
    changeFontSize(fontSizeIndex);
    localStorage.setItem("fontSizeIndex", fontSizeIndex);
  }
});

fontSizeIncreaseButton.addEventListener("click", () => {
  if (fontSizeIndex < fontSizeScales.length - 1) {
    fontSizeIndex++;
    changeFontSize(fontSizeIndex);
    localStorage.setItem("fontSizeIndex", fontSizeIndex);
  }
});

/* View mode */
var viewMode = "grid";

const viewGridButton = document.getElementById("view-grid-button");
const viewStackedButton = document.getElementById("view-stacked-button");
const displayEl = document.getElementById("display");

function changeViewMode(mode) {
  displayEl.classList.remove("view-grid", "view-stacked");
  displayEl.classList.add("view-" + mode);
  viewGridButton.classList.toggle("active", mode === "grid");
  viewGridButton.setAttribute("aria-pressed", mode === "grid");
  viewStackedButton.classList.toggle("active", mode === "stacked");
  viewStackedButton.setAttribute("aria-pressed", mode === "stacked");
}

if (localStorage.getItem("viewMode")) {
  viewMode = localStorage.getItem("viewMode");
} else {
  localStorage.setItem("viewMode", viewMode);
}
changeViewMode(viewMode);

viewGridButton.addEventListener("click", () => {
  viewMode = "grid";
  changeViewMode(viewMode);
  localStorage.setItem("viewMode", viewMode);
});

viewStackedButton.addEventListener("click", () => {
  viewMode = "stacked";
  changeViewMode(viewMode);
  localStorage.setItem("viewMode", viewMode);
});
