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

var themeKeys = Object.keys(themes);
var themesIndex = 0;
var themeSwatchesEl = document.getElementById("theme-swatches");

/* Set to "user" as soon as a swatch is picked; until then the system colour
 * scheme drives the theme. Previously this was inferred by listing which
 * theme indices counted as a deliberate choice, and that list went stale
 * every time a theme was added. */
const THEME_SOURCE_KEY = "themeSource";

function change(theme) {
  for (let prop in theme) {
    document.querySelector(":root").style.setProperty(prop, theme[prop]);
  }
}

function humanizeThemeName(key) {
  return key
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function updateActiveSwatch() {
  if (!themeSwatchesEl) return;
  themeSwatchesEl.querySelectorAll(".theme-swatch").forEach(function (btn) {
    var isActive = Number(btn.dataset.themeIndex) === themesIndex;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function setTheme(index, source) {
  var themeCount = themeKeys.length;
  themesIndex = ((Number(index) % themeCount) + themeCount) % themeCount;
  change(themes[themeKeys[themesIndex]]);
  localStorage.setItem("theme", themesIndex);
  if (source) {
    localStorage.setItem(THEME_SOURCE_KEY, source);
  }
  updateActiveSwatch();
}

if (themeSwatchesEl) {
  themeKeys.forEach(function (key, index) {
    var t = themes[key];
    var label = humanizeThemeName(key);
    var swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "theme-swatch";
    swatch.dataset.themeIndex = String(index);
    swatch.title = label;
    swatch.setAttribute("aria-label", label + " theme");
    swatch.setAttribute("aria-pressed", "false");
    swatch.style.background =
      "linear-gradient(135deg, " +
      t["--primaryColor"] +
      " 50%, " +
      t["--accentDark"] +
      " 50%)";
    swatch.addEventListener("click", function () {
      setTheme(index, "user");
    });
    themeSwatchesEl.appendChild(swatch);
  });
}

function prefersDarkScheme() {
  return Boolean(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function applySystemTheme() {
  setTheme(prefersDarkScheme() ? 1 : 0, "system");
}

/* A theme stored before THEME_SOURCE_KEY existed is whatever the reader last
 * saw, so keep honouring it instead of overwriting it on this one load. */
if (
  localStorage.getItem("theme") !== null &&
  localStorage.getItem(THEME_SOURCE_KEY) === null
) {
  localStorage.setItem(THEME_SOURCE_KEY, "user");
}

var storedTheme = localStorage.getItem("theme");
if (localStorage.getItem(THEME_SOURCE_KEY) === "user" && storedTheme !== null) {
  setTheme(parseInt(storedTheme, 10));
} else {
  applySystemTheme();
}

if (window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function () {
      if (localStorage.getItem(THEME_SOURCE_KEY) !== "user") {
        applySystemTheme();
      }
    });
}

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
  if (!fontSizeLabelEl) return;
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

if (fontSizeDecreaseButton && fontSizeIncreaseButton) {
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
}

/* View mode */
var viewMode = "grid";

const viewGridButton = document.getElementById("view-grid-button");
const viewStackedButton = document.getElementById("view-stacked-button");
const displayEl = document.getElementById("display");

function changeViewMode(mode) {
  if (!displayEl || !viewGridButton || !viewStackedButton) return;
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

if (viewGridButton && viewStackedButton) {
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
}

/* Landing mode */
var landingMode = "random";

const landingRandomButton = document.getElementById("landing-random-button");
const landingResumeButton = document.getElementById("landing-resume-button");

function changeLandingMode(mode) {
  if (!landingRandomButton || !landingResumeButton) return;
  landingRandomButton.classList.toggle("active", mode === "random");
  landingRandomButton.setAttribute("aria-pressed", mode === "random");
  landingResumeButton.classList.toggle("active", mode === "resume");
  landingResumeButton.setAttribute("aria-pressed", mode === "resume");
}

if (localStorage.getItem("landingMode")) {
  landingMode = localStorage.getItem("landingMode");
} else {
  localStorage.setItem("landingMode", landingMode);
}
changeLandingMode(landingMode);

if (landingRandomButton && landingResumeButton) {
  landingRandomButton.addEventListener("click", () => {
    landingMode = "random";
    changeLandingMode(landingMode);
    localStorage.setItem("landingMode", landingMode);
  });

  landingResumeButton.addEventListener("click", () => {
    landingMode = "resume";
    changeLandingMode(landingMode);
    localStorage.setItem("landingMode", landingMode);
  });
}
