/**
    Dao  Drip © Peter Rodrick.
    Displays the same random chapter of the Daodejing
    from characteristically distinct translations.
**/

let translations = JSON.parse(localStorage.getItem("translations")) || [
  "Stephen Addiss & Stanley Lombardo",
  "Gia-Fu Feng & Jane English",
  "Derek Lin",
  "Stephen Mitchell",
];

localStorage.setItem("translations", JSON.stringify(translations));

let currentChapterIndex;
let selectedChapter = 1;
let readChapters = JSON.parse(localStorage.getItem("readChapters")) || [];
let unreadChapters = JSON.parse(localStorage.getItem("unreadChapters")) || [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81,
];
let readOrder = JSON.parse(localStorage.getItem("readOrder")) || [];
let historyIndex = -1;
let prevChapter =
  readOrder[(historyIndex + readOrder.length - 1) % readOrder.length];
let prevChapterTwo;
let prevChapterThree;
let nextChapter = readOrder[(historyIndex + 1) % readOrder.length];
let nextChapterTwo;
let nextChapterThree;

const displayArea = document.getElementById("display");
const tablePlaceholder = document.getElementById("table-placeholder");
const dripButton = document.getElementById("drip-button");
const dripAgainButton = document.getElementById("drip-again-button");
const yinYang = document.getElementById("yin-yang");

const chapterSelectInput = document.getElementById("chapter-select-input");
const chapterSelectButton = document.getElementById("chapter-select-button");
const addButton = document.getElementById("add-button");
const subtractButton = document.getElementById("subtract-button");

const prevChapterDisplay = document.getElementById("prev-ch");
const prevChapterTwoDisplay = document.getElementById("prev-ch-2");
const prevChapterThreeDisplay = document.getElementById("prev-ch-3");
const nextChapterDisplay = document.getElementById("next-ch");
const nextChapterTwoDisplay = document.getElementById("next-ch-2");
const nextChapterThreeDisplay = document.getElementById("next-ch-3");
const seekBackButton = document.getElementById("ch-seek-back");
const seekFwdButton = document.getElementById("ch-seek-fwd");
const historyDisplay = document.getElementById("history-nav");

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

function displayUnreadChapters() {
  document.getElementById("unread-chapters").remove();
  let x = document.createElement("TABLE");
  x.setAttribute("id", "unread-chapters");
  tablePlaceholder.appendChild(x);
  for (var unreadChapter of unreadChapters) {
    let y = document.createElement("TD");
    let w = document.createElement("A");
    w.setAttribute(
      "href",
      `javascript:selectedChapter = ${unreadChapter}; viewChapter(${unreadChapter} - 1);`
    );
    w.classList.add("chapter-link");
    w.innerText = `${unreadChapter}`;
    y.appendChild(w);
    document.getElementById("unread-chapters").appendChild(y);
  }
}

function hideUndefinedHistory() {
  var historyChapters = document.getElementsByClassName("history");
  for (var i = 0; i < historyChapters.length; i++) {
    var historyChapter = historyChapters[i];
    if (historyChapter.innerText == "undefined") {
      historyChapter.classList.add("history-hide");
    } else {
      historyChapter.classList.remove("history-hide");
    }
  }
  if (
    prevChapter === undefined &&
    prevChapterTwo === undefined &&
    prevChapterThree === undefined
  ) {
    seekBackButton.style.display = "none";
  } else {
    seekBackButton.style.display = "inline-block";
  }
  if (
    nextChapter === undefined &&
    nextChapterTwo === undefined &&
    nextChapterThree === undefined
  ) {
    seekFwdButton.style.display = "none";
  } else {
    seekFwdButton.style.display = "inline-block";
  }
  if (
    prevChapter === undefined &&
    prevChapterTwo === undefined &&
    prevChapterThree === undefined &&
    nextChapter === undefined &&
    nextChapterTwo === undefined &&
    nextChapterThree === undefined
  ) {
    historyDisplay.style.display = "none";
  } else {
    historyDisplay.style.display = "flex";
  }
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

/**
    Random chapter selection
**/
function newRandomChapter() {
  let message = [];
  let rand = randNumb(dao["Stephen Mitchell"].length);

  translations.forEach(function (translation) {
    message.push(
      `<span class="chapter-author">Chapter ${
        rand + 1
      } by ${translation}:</span> ${dao[translation][rand]}`
    );
  });

  let shuffled = shuffle(message);
  let formatted = shuffled.join(
    '<br /><span class="chapter-separator">&bull;</span>'
  );
  displayArea.innerHTML = formatted;

  if (readChapters.indexOf(rand + 1) === -1) {
    readChapters.push(rand + 1);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));

  unreadChapters = unreadChapters.filter(function (item) {
    return readChapters.indexOf(item) === -1;
  });
  localStorage.setItem("unreadChapters", JSON.stringify(unreadChapters));
  displayUnreadChapters();

  readOrder.push(rand + 1);
  localStorage.setItem("readOrder", JSON.stringify(readOrder));
  updateHistory();

  currentChapterIndex = rand;
}

newRandomChapter();

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

/**
    History chapter selection
**/
function getHistoryChapter(chapter) {
  let message = [];
  translations.forEach(function (translation) {
    message.push(
      `<span class="chapter-author">Chapter ${chapter} by ${translation}:</span> ${
        dao[translation][chapter - 1]
      }`
    );
  });
  let formatted = message.join(
    '<br /><span class="chapter-separator">&bull;</span>'
  );
  displayArea.innerHTML = formatted;

  currentChapterIndex = chapter;
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

/**
    Manual chapter selection
**/
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

  translations.forEach(function (translation) {
    message.push(
      `<span class="chapter-author">Chapter ${
        chapter + 1
      } by ${translation}:</span> ${dao[translation][chapter]}`
    );
  });

  let shuffled = shuffle(message);
  let formatted = shuffled.join(
    '<br /><span class="chapter-separator">&bull;</span>'
  );
  displayArea.innerHTML = formatted;
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (readChapters.indexOf(chapter + 1) === -1) {
    readChapters.push(chapter + 1);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));

  unreadChapters = unreadChapters.filter(function (item) {
    return readChapters.indexOf(item) === -1;
  });
  localStorage.setItem("unreadChapters", JSON.stringify(unreadChapters));
  displayUnreadChapters();

  readOrder.push(chapter + 1);
  localStorage.setItem("readOrder", JSON.stringify(readOrder));
  updateHistory();

  currentChapterIndex = chapter;
}

chapterSelectButton.addEventListener("click", () => {
  viewChapter(selectedChapter - 1);
});

const resetUnreadButton = document.getElementById("reset-unread-button");

resetUnreadButton.addEventListener("click", () => {
  localStorage.removeItem("readChapters");
  localStorage.removeItem("unreadChapters");
  readChapters = [];
  unreadChapters = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81,
  ];
  displayUnreadChapters();
});

/**
    Translation control
**/
const mitchellCheckbox = document.getElementById("mitchell-checkbox");
const fengEnglishCheckbox = document.getElementById("fengEnglish-checkbox");
const addissLombardoCheckbox = document.getElementById(
  "addissLombardo-checkbox"
);
const linCheckbox = document.getElementById("lin-checkbox");

if (!localStorage.getItem("addissLombardo-checkbox")) {
  localStorage.setItem("addissLombardo-checkbox", "true");
}

if (!localStorage.getItem("fengEnglish-checkbox")) {
  localStorage.setItem("fengEnglish-checkbox", "true");
}

if (!localStorage.getItem("lin-checkbox")) {
  localStorage.setItem("lin-checkbox", "true");
}

if (!localStorage.getItem("mitchell-checkbox")) {
  localStorage.setItem("mitchell-checkbox", "true");
}

function checkBoxes() {
  var boxes = document.querySelectorAll("input[type='checkbox']");
  for (var i = 0; i < boxes.length; i++) {
    var box = boxes[i];
    if (box.hasAttribute("store")) {
      setupBox(box);
    }
  }

  function setupBox(box) {
    var storageId = box.getAttribute("store");
    var oldVal = localStorage.getItem(storageId);
    box.checked = oldVal === "true" ? true : false;

    box.addEventListener("change", function () {
      localStorage.setItem(storageId, this.checked);
    });
  }
}

checkBoxes();

function toggleArrayItem(array, item) {
  let i = array.indexOf(item);
  if (i === -1) {
    array.push(item);
  } else {
    array.splice(i, 1);
  }
}

function refreshCurrentChapter() {
  let message = [];
  translations.forEach(function (translation) {
    message.push(
      `<span class="chapter-author">Chapter ${
        currentChapterIndex + 1
      } by ${translation}:</span> ${dao[translation][currentChapterIndex]}`
    );
  });
  let formatted = message.join(
    '<br /><span class="chapter-separator">&bull;</span>'
  );
  displayArea.innerHTML = formatted;
}

mitchellCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Stephen Mitchell");
  refreshCurrentChapter();
  localStorage.setItem("translations", JSON.stringify(translations));
});

fengEnglishCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Gia-Fu Feng & Jane English");
  refreshCurrentChapter();
  localStorage.setItem("translations", JSON.stringify(translations));
});

addissLombardoCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Stephen Addiss & Stanley Lombardo");
  refreshCurrentChapter();
  localStorage.setItem("translations", JSON.stringify(translations));
});

linCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Derek Lin");
  refreshCurrentChapter();
  localStorage.setItem("translations", JSON.stringify(translations));
});
