/**
    Dao  Drip © Peter Rodrick.
    Displays the same random chapter of the Daodejing
    from characteristically distinct translations.
**/

/**
 * Custom cursor
 */
document.body.addEventListener("mousemove", (evt) => {
  const mouseX = evt.clientX;
  const mouseY = evt.clientY;

  gsap.set(".cursor", {
    x: mouseX,
    y: mouseY,
  });
});

/**
 * Theme changing
 */
const themes = {
  light: {
    "--primaryColor": "#f2dfce",
    "--secondaryColor": "#fff1e0",
    "--tertiaryColor": "#f2dfce",
    "--accentDark": "#000f28",
    "--accentLight": "#fff1e0",
    "--fontColor": "#000f28",
    "--shadowColor": "#000f2835",
    "--cursorColor": "#000f2863",
  },
  dark: {
    "--primaryColor": "#000f28",
    "--secondaryColor": "#001436",
    "--tertiaryColor": "#000f28",
    "--accentDark": "#fff6eb",
    "--accentLight": "#001436",
    "--fontColor": "#fff6eb",
    "--shadowColor": "#fff6eb28",
    "--cursorColor": "#fff6eb63",
  },
  grayscale: {
    "--primaryColor": "#747474",
    "--secondaryColor": "#949494",
    "--tertiaryColor": "#747474",
    "--accentDark": "#ececec",
    "--accentLight": "#949494",
    "--fontColor": "#f7f7f7",
    "--shadowColor": "#ececec28",
    "--cursorColor": "#ececec63",
  },
  color: {
    "--primaryColor": "#e3cbff",
    "--secondaryColor": "#ffc489",
    "--tertiaryColor": "#cbfcfe",
    "--accentDark": "#126e5c",
    "--accentLight": "#cda4ff95",
    "--fontColor": "#240748",
    "--shadowColor": "#126e5c28",
    "--cursorColor": "#126e5c63",
  },
};

var themesIndex = 0;

function change(theme) {
  for (let prop in theme) {
    document.querySelector(":root").style.setProperty(prop, theme[prop]);
  }
}

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
