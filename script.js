/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 * Dao Drip
 * Displays the same random chapter of the Daodejing
 * from characteristically distinct translations.
 */

const allTranslations = Object.keys(dao);

function getRandomTranslations(arr, num) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

const translationCheckboxes = [
  { checkBoxId: "mitchell-checkbox", name: "Stephen Mitchell" },
  { checkBoxId: "fengEnglish-checkbox", name: "Gia-Fu Feng & Jane English" },
  {
    checkBoxId: "addissLombardo-checkbox",
    name: "Stephen Addiss & Stanley Lombardo",
  },
  { checkBoxId: "lin-checkbox", name: "Derek Lin" },
  { checkBoxId: "legge-checkbox", name: "James Legge" },
  { checkBoxId: "leguin-checkbox", name: "Ursula K. Le Guin" },
  { checkBoxId: "lau-checkbox", name: "D. C. Lau" },
  { checkBoxId: "yutang-checkbox", name: "Lin Yutang" },
  { checkBoxId: "henricks-checkbox", name: "Robert G. Henricks" },
  { checkBoxId: "redpine-checkbox", name: "Red Pine (Bill Porter)" },
];

const slugToName = Object.fromEntries(
  translationCheckboxes.map(({ checkBoxId, name }) => [
    checkBoxId.replace("-checkbox", ""),
    name,
  ])
);
const nameToSlug = Object.fromEntries(
  translationCheckboxes.map(({ checkBoxId, name }) => [
    name,
    checkBoxId.replace("-checkbox", ""),
  ])
);

function getSharedTranslationsFromUrl() {
  const t = new URLSearchParams(window.location.search).get("t");
  if (!t) {
    return null;
  }
  const names = t
    .split(",")
    .map((slug) => slugToName[slug])
    .filter(Boolean);
  return names.length ? names : null;
}

let selectedTranslations =
  getSharedTranslationsFromUrl() ||
  JSON.parse(localStorage.getItem("selectedTranslations")) ||
  getRandomTranslations(allTranslations, 3);

localStorage.setItem(
  "selectedTranslations",
  JSON.stringify(selectedTranslations)
);

localStorage.getItem("shuffle-control") ||
  localStorage.setItem("shuffle-control", "true");

let readChapters = JSON.parse(localStorage.getItem("readChapters")) || [];

const totalChapters = dao[allTranslations[0]].length;
const tablePlaceholder = document.getElementById("table-placeholder");

function getSharedChapterFromUrl() {
  const ch = parseInt(new URLSearchParams(window.location.search).get("ch"), 10);
  return Number.isInteger(ch) && ch >= 1 && ch <= totalChapters ? ch : null;
}

const sharedChapter = getSharedChapterFromUrl();

function displayUnreadChapters() {
  const unreadChapters = document.getElementById("unread-chapters");
  if (unreadChapters) {
    unreadChapters.remove();
  }
  const root = document.createElement("TABLE");
  root.setAttribute("id", "unread-chapters");
  tablePlaceholder.appendChild(root);
  for (let unreadChapter = 1; unreadChapter <= totalChapters; unreadChapter++) {
    if (!readChapters.includes(unreadChapter)) {
      const w = document.createElement("A");
      w.setAttribute(
        "href",
        `javascript:selectedChapter = ${unreadChapter}; viewChapter(${unreadChapter} - 1);`
      );
      w.classList.add("chapter-link");
      w.innerText = `${unreadChapter}`;
      const y = document.createElement("TD");
      y.appendChild(w);
      root.appendChild(y);
    }
  }
}

/**
 * History control
 */

let readOrder = JSON.parse(localStorage.getItem("readOrder")) || [];
let historyIndex = -1;
let prevChapter =
  readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
let prevChapterTwo;
let prevChapterThree;
let nextChapter = readOrder[(historyIndex + 1) % readOrder.length];
let nextChapterTwo;
let nextChapterThree;

const prevChapterDisplay = document.getElementById("prev-ch");
const prevChapterTwoDisplay = document.getElementById("prev-ch-2");
const prevChapterThreeDisplay = document.getElementById("prev-ch-3");
const nextChapterDisplay = document.getElementById("next-ch");
const nextChapterTwoDisplay = document.getElementById("next-ch-2");
const nextChapterThreeDisplay = document.getElementById("next-ch-3");
const seekBackButton = document.getElementById("ch-seek-back");
const seekFwdButton = document.getElementById("ch-seek-fwd");
const historyDisplay = document.getElementById("history-nav");

function hideUndefinedHistory() {
  const historyChapters = document.getElementsByClassName("history");
  for (let i = 0; i < historyChapters.length; i++) {
    const historyChapter = historyChapters[i];
    if (historyChapter.innerText == "undefined") {
      historyChapter.classList.add("history-hide");
    } else {
      historyChapter.classList.remove("history-hide");
    }
  }
  seekBackButton.style.display =
    prevChapter === undefined &&
    prevChapterTwo === undefined &&
    prevChapterThree === undefined
      ? "none"
      : "inline-block";
  seekFwdButton.style.display =
    nextChapter === undefined &&
    nextChapterTwo === undefined &&
    nextChapterThree === undefined
      ? "none"
      : "inline-block";
  historyDisplay.style.display =
    prevChapter === undefined &&
    prevChapterTwo === undefined &&
    prevChapterThree === undefined &&
    nextChapter === undefined &&
    nextChapterTwo === undefined &&
    nextChapterThree === undefined
      ? "none"
      : "flex";
}

hideUndefinedHistory();

function updatePreviousChapters() {
  if (readOrder.length == 2) {
    prevChapter =
      readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
    [prevChapterTwo, prevChapterThree] = [undefined, undefined];
    prevChapterDisplay.innerHTML = prevChapter;
  } else if (readOrder.length == 3) {
    prevChapter =
      readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
    prevChapterTwo =
      readOrder[(historyIndex + readOrder.length - 2) % readOrder.length];
    prevChapterThree = undefined;
    prevChapterDisplay.innerHTML = prevChapter;
    prevChapterTwoDisplay.innerHTML = prevChapterTwo;
  } else if (readOrder.length > 3) {
    prevChapter =
      readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
    prevChapterTwo =
      readOrder[(historyIndex + readOrder.length - 2) % readOrder.length];
    prevChapterThree =
      readOrder[(historyIndex + readOrder.length - 3) % readOrder.length];
    prevChapterDisplay.innerHTML = prevChapter;
    prevChapterTwoDisplay.innerHTML = prevChapterTwo;
    prevChapterThreeDisplay.innerHTML = prevChapterThree;
  }
}

function updateNextChapters() {
  if (historyIndex == -1) {
    [nextChapter, nextChapterTwo, nextChapterThree] = [
      undefined,
      undefined,
      undefined,
    ];
  } else if (historyIndex == -2) {
    nextChapter =
      readOrder[(historyIndex + readOrder.length + 1) % readOrder.length];
    [nextChapterTwo, nextChapterThree] = [undefined, undefined];
  } else if (historyIndex == -3) {
    nextChapter =
      readOrder[(historyIndex + readOrder.length + 1) % readOrder.length];
    nextChapterTwo =
      readOrder[(historyIndex + readOrder.length + 2) % readOrder.length];
    nextChapterThree = undefined;
  } else {
    nextChapter =
      readOrder[(historyIndex + readOrder.length + 1) % readOrder.length];
    nextChapterTwo =
      readOrder[(historyIndex + readOrder.length + 2) % readOrder.length];
    nextChapterThree =
      readOrder[(historyIndex + readOrder.length + 3) % readOrder.length];
  }
  nextChapterDisplay.innerHTML = nextChapter;
  nextChapterTwoDisplay.innerHTML = nextChapterTwo;
  nextChapterThreeDisplay.innerHTML = nextChapterThree;
}

function updateHistory() {
  historyIndex = -1;
  updatePreviousChapters();
  updateNextChapters();
  hideUndefinedHistory();
}

/* Random chapter selection */

let currentChapterIndex;

const displayArea = document.getElementById("display");
const dripButton = document.getElementById("drip-button");
const dripAgainButton = document.getElementById("drip-again-button");
const yinYang = document.getElementById("yin-yang");

function randNumb(num) {
  return Math.floor(Math.random() * num);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildTranslationCard(translation, chapterIndex) {
  return (
    `<div class="translation">` +
    `<div class="translation-header">` +
    `<span class="chapter-number">Chapter ${chapterIndex + 1}</span>` +
    `<span class="chapter-translator">${translation}</span>` +
    `</div>` +
    `<p class="translation-text">${dao[translation][chapterIndex]}</p>` +
    `<div class="trans-info">` +
    `<span class="trans-ref">${sources[translation][2]}</span><br />` +
    `<a href="${sources[translation][1]}" class="trans-link" target="_blank">Source</a>` +
    `</div>` +
    `</div>`
  );
}

function newRandomChapter() {
  let message = [];
  const randomChapter = randNumb(totalChapters);
  selectedTranslations.forEach(function (translation) {
    message.push(buildTranslationCard(translation, randomChapter));
  });
  if (localStorage.getItem("shuffle-control") === "true") {
    let shuffled = shuffle(message);
    let formatted = shuffled.join("");
    displayArea.innerHTML = formatted;
  } else if (localStorage.getItem("shuffle-control") === "false") {
    let formatted = message.join("");
    displayArea.innerHTML = formatted;
  }
  if (readChapters.indexOf(randomChapter + 1) === -1) {
    readChapters.push(randomChapter + 1);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));
  displayUnreadChapters();
  readOrder.push(randomChapter + 1);
  localStorage.setItem("readOrder", JSON.stringify(readOrder));
  updateHistory();
  currentChapterIndex = randomChapter;
  localStorage.setItem("lastChapterIndex", randomChapter);
}

function resumeChapter(chapter) {
  let message = [];
  selectedTranslations.forEach(function (translation) {
    message.push(buildTranslationCard(translation, chapter));
  });
  if (localStorage.getItem("shuffle-control") === "true") {
    let shuffled = shuffle(message);
    let formatted = shuffled.join("");
    displayArea.innerHTML = formatted;
  } else if (localStorage.getItem("shuffle-control") === "false") {
    let formatted = message.join("");
    displayArea.innerHTML = formatted;
  }
  currentChapterIndex = chapter;
  localStorage.setItem("lastChapterIndex", chapter);
  displayUnreadChapters();
  updateHistory();
}

const storedLastChapterIndex = localStorage.getItem("lastChapterIndex");
if (sharedChapter !== null) {
  viewChapter(sharedChapter - 1);
} else if (
  localStorage.getItem("landingMode") === "resume" &&
  storedLastChapterIndex !== null
) {
  resumeChapter(parseInt(storedLastChapterIndex, 10));
} else {
  newRandomChapter();
}

dripButton.addEventListener("click", () => {
  newRandomChapter();
});

dripAgainButton.addEventListener("click", () => {
  newRandomChapter();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

yinYang.addEventListener("click", () => {
  newRandomChapter();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* History chapter selection */

function getHistoryChapter(chapter) {
  let message = [];
  selectedTranslations.forEach(function (translation) {
    message.push(buildTranslationCard(translation, chapter - 1));
  });
  let formatted = message.join("");
  displayArea.innerHTML = formatted;
  currentChapterIndex = chapter - 1;
  localStorage.setItem("lastChapterIndex", chapter - 1);
}

function seekBack() {
  historyIndex--;
  updatePreviousChapters();
  updateNextChapters();
  hideUndefinedHistory();
}

function seekFwd() {
  historyIndex++;
  updatePreviousChapters();
  updateNextChapters();
  hideUndefinedHistory();
}

seekBackButton.addEventListener("click", () => {
  getHistoryChapter(prevChapter);
  seekBack();
});

seekFwdButton.addEventListener("click", () => {
  getHistoryChapter(nextChapter);
  seekFwd();
});

/* Manual chapter selection */

let selectedChapter = 1;

const chapterSelectInput = document.getElementById("chapter-select-input");
const chapterSelectButton = document.getElementById("chapter-select-button");
const addButton = document.getElementById("add-button");
const subtractButton = document.getElementById("subtract-button");

const handleValueChange = (value) => {
  if (value <= 1) {
    subtractButton.setAttribute("disabled", true);
  } else if (value < 81) {
    subtractButton.removeAttribute("disabled");
    addButton.removeAttribute("disabled");
  } else if ((value = 81)) {
    addButton.setAttribute("disabled", true);
  } else {
    subtractButton.setAttribute("disabled", true);
  }
};

if (sharedChapter !== null) {
  chapterSelectInput.value = sharedChapter;
  selectedChapter = sharedChapter;
  handleValueChange(sharedChapter);
}

addButton.addEventListener("click", () => {
  chapterSelectInput.value = +chapterSelectInput.value + 1;
  selectedChapter = chapterSelectInput.valueAsNumber;
  handleValueChange(chapterSelectInput.value);
});

subtractButton.addEventListener("click", () => {
  chapterSelectInput.value = +chapterSelectInput.value - 1;
  selectedChapter = chapterSelectInput.valueAsNumber;
  handleValueChange(chapterSelectInput.value);
});

chapterSelectInput.addEventListener("click", function (e) {
  chapterSelectInput.value = "";
});

chapterSelectInput.addEventListener("input", function (e) {
  if (this.value > 81) {
    this.value = 81;
  }
  if (this.value < 1) {
    this.value = 1;
  }
  selectedChapter = e.target.valueAsNumber;
  handleValueChange(e.target.value);
});

chapterSelectInput.addEventListener("change", function (e) {
  selectedChapter = e.target.valueAsNumber;
});

function viewChapter(chapter) {
  let message = [];
  selectedTranslations.forEach(function (translation) {
    message.push(buildTranslationCard(translation, chapter));
  });
  if (localStorage.getItem("shuffle-control") === "true") {
    let shuffled = shuffle(message);
    let formatted = shuffled.join("");
    displayArea.innerHTML = formatted;
  } else if (localStorage.getItem("shuffle-control") === "false") {
    let formatted = message.join("");
    displayArea.innerHTML = formatted;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (readChapters.indexOf(chapter + 1) === -1) {
    readChapters.push(chapter + 1);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));
  displayUnreadChapters();
  readOrder.push(chapter + 1);
  localStorage.setItem("readOrder", JSON.stringify(readOrder));
  updateHistory();
  currentChapterIndex = chapter;
  localStorage.setItem("lastChapterIndex", chapter);
}

chapterSelectInput.onkeydown = function (e) {
  if (e.keyCode == 13) {
    selectedChapter = chapterSelectInput.valueAsNumber;
    viewChapter(selectedChapter - 1);
  }
};

chapterSelectButton.addEventListener("click", () => {
  selectedChapter = chapterSelectInput.valueAsNumber;
  viewChapter(selectedChapter - 1);
});

/* Share link */

const topShareButton = document.getElementById("top-share-button");
const topShareButtonIcon = topShareButton.innerHTML;
const topShareButtonCheckIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>';

topShareButton.addEventListener("click", async () => {
  const params = new URLSearchParams();
  params.set("ch", currentChapterIndex + 1);
  params.set(
    "t",
    selectedTranslations.map((name) => nameToSlug[name]).join(",")
  );
  const shareUrl = `${location.origin}${location.pathname}?${params.toString()}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    topShareButton.innerHTML = topShareButtonCheckIcon;
    setTimeout(() => (topShareButton.innerHTML = topShareButtonIcon), 1500);
  } catch {
    window.prompt("Copy this link:", shareUrl);
  }
});

/* Settings modal */

const settingsButton = document.getElementById("settings-button");
const settingsModal = document.getElementById("settings-modal");
const settingsCloseButton = document.getElementById("settings-close-button");

settingsButton.addEventListener("click", () => {
  settingsModal.showModal();
});

settingsCloseButton.addEventListener("click", () => {
  settingsModal.close();
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.close();
  }
});

const resetUnreadButton = document.getElementById("reset-unread-button");

resetUnreadButton.addEventListener("click", () => {
  localStorage.removeItem("readChapters");
  readChapters = [];
  displayUnreadChapters();
});

/* Translation control */

translationCheckboxes.forEach(({ checkBoxId, name }) => {
  if (selectedTranslations.includes(name)) {
    localStorage.setItem(checkBoxId, "true");
  } else {
    localStorage.setItem(checkBoxId, "false");
  }
});

function checkBoxes() {
  const boxes = document.querySelectorAll("input[type='checkbox']");
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    if (box.hasAttribute("store")) {
      setupBox(box);
    }
  }
  function setupBox(box) {
    const storageId = box.getAttribute("store");
    const oldVal = localStorage.getItem(storageId);
    box.checked = oldVal === "true" ? true : false;

    box.addEventListener("change", function () {
      localStorage.setItem(storageId, this.checked);
    });
  }
}

checkBoxes();

function toggleArrayItem(array, item) {
  const i = array.indexOf(item);
  if (i === -1) {
    array.push(item);
  } else {
    array.splice(i, 1);
  }
}

function refreshCurrentChapter() {
  let message = [];
  selectedTranslations.forEach(function (translation) {
    message.push(buildTranslationCard(translation, currentChapterIndex));
  });
  let formatted = message.join("");
  displayArea.innerHTML = formatted;
}

translationCheckboxes.forEach(({ checkBoxId, name }) => {
  document.getElementById(checkBoxId).addEventListener("change", () => {
    toggleArrayItem(selectedTranslations, name);
    refreshCurrentChapter();
    localStorage.setItem(
      "selectedTranslations",
      JSON.stringify(selectedTranslations)
    );
  });
});
