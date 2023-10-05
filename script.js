/**
    Dao  Drip © Peter Rodrick.
    Displays the same random chapter of the Daodejing
    from characteristically distinct translations.
**/
const allTranslations = Object.keys(dao);

function getRandomTranslations(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

let randomTranslations = getRandomTranslations(allTranslations, 3);

let selectedTranslations =
  JSON.parse(localStorage.getItem("selectedTranslations")) ||
  randomTranslations;

localStorage.setItem(
  "selectedTranslations",
  JSON.stringify(selectedTranslations)
);

localStorage.getItem("shuffle-control") ||
  localStorage.setItem("shuffle-control", "true");

let readChapters = JSON.parse(localStorage.getItem("readChapters")) || [];

const totalChapters = dao[allTranslations[0]].length;
const tablePlaceholder = document.getElementById("table-placeholder");

function displayUnreadChapters() {
  document.getElementById("unread-chapters").remove();
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
    History control
**/
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

function newRandomChapter() {
  let message = [];
  const randomChapter = randNumb(totalChapters);
  selectedTranslations.forEach(function (translation) {
    message.push(
      `<span class="chapter-author">Chapter ${
        randomChapter + 1
      } by ${translation}:</span> ${dao[translation][randomChapter]}`
    );
  });
  if (localStorage.getItem("shuffle-control") === "true") {
    let shuffled = shuffle(message);
    let formatted = shuffled.join(
      '<br /><span class="chapter-separator">&bull;</span>'
    );
    displayArea.innerHTML = formatted;
  } else if (localStorage.getItem("shuffle-control") === "false") {
    let formatted = message.join(
      '<br /><span class="chapter-separator">&bull;</span>'
    );
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
  selectedTranslations.forEach(function (translation) {
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
  currentChapterIndex = chapter - 1;
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
    message.push(
      `<span class="chapter-author">Chapter ${
        chapter + 1
      } by ${translation}:</span> ${dao[translation][chapter]}`
    );
  });
  if (localStorage.getItem("shuffle-control") === "true") {
    let shuffled = shuffle(message);
    let formatted = shuffled.join(
      '<br /><span class="chapter-separator">&bull;</span>'
    );
    displayArea.innerHTML = formatted;
  } else if (localStorage.getItem("shuffle-control") === "false") {
    let formatted = message.join(
      '<br /><span class="chapter-separator">&bull;</span>'
    );
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
}

chapterSelectButton.addEventListener("click", () => {
  selectedChapter = chapterSelectInput.valueAsNumber;
  viewChapter(selectedChapter - 1);
});

const resetUnreadButton = document.getElementById("reset-unread-button");

resetUnreadButton.addEventListener("click", () => {
  localStorage.removeItem("readChapters");
  readChapters = [];
  displayUnreadChapters();
});

/**
    Translation control
**/
[
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
].forEach(({ checkBoxId, name }) => {
  if (selectedTranslations.includes(name)) {
    localStorage.setItem(checkBoxId, "true");
  } else {
    localStorage.setItem(checkBoxId, "false");
  }
});

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
  selectedTranslations.forEach(function (translation) {
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

[
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
].forEach(({ checkBoxId, name }) => {
  document.getElementById(checkBoxId).addEventListener("change", () => {
    toggleArrayItem(selectedTranslations, name);
    refreshCurrentChapter();
    localStorage.setItem(
      "selectedTranslations",
      JSON.stringify(selectedTranslations)
    );
  });
});
