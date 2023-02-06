/**
    Dao  Drip © Peter Rodrick.
    Displays the same random chapter of the Daodejing
    from characteristically distinct translations.
**/

let translations = [
  "Stephen Mitchell",
  "Gia-Fu Feng & Jane English",
  "Stephen Addiss & Stanley Lombardo",
  "Derek Lin",
];
let selectedChapter = 1;
let readChapters = JSON.parse(localStorage.getItem("readChapters")) || [];
let unreadChapters = JSON.parse(localStorage.getItem("unreadChapters")) || [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81,
];

const displayArea = document.getElementById("display");
const tablePlaceholder = document.getElementById("table-placeholder");
const dripButton = document.getElementById("drip-button");
const dripAgainButton = document.getElementById("drip-again-button");
const yinYang = document.getElementById("yin-yang");

const chapterSelectInput = document.getElementById("chapter-select-input");
const chapterSelectButton = document.getElementById("chapter-select-button");
const addButton = document.getElementById("add-button");
const subtractButton = document.getElementById("subtract-button");

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

  if (readChapters.indexOf(selectedChapter) === -1) {
    readChapters.push(selectedChapter);
  }
  localStorage.setItem("readChapters", JSON.stringify(readChapters));

  unreadChapters = unreadChapters.filter(function (item) {
    return readChapters.indexOf(item) === -1;
  });
  localStorage.setItem("unreadChapters", JSON.stringify(unreadChapters));

  displayUnreadChapters();
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
    Toggle individual translations
**/
const mitchellCheckbox = document.getElementById("mitchell-checkbox");
const fengEnglishCheckbox = document.getElementById("fengEnglish-checkbox");
const addissLombardoCheckbox = document.getElementById(
  "addissLombardo-checkbox"
);
const linCheckbox = document.getElementById("lin-checkbox");

function toggleArrayItem(array, item) {
  let i = array.indexOf(item);
  if (i === -1) {
    array.push(item);
  } else {
    array.splice(i, 1);
  }
}

mitchellCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Stephen Mitchell");
});

fengEnglishCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Gia-Fu Feng & Jane English");
});

addissLombardoCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Stephen Addiss & Stanley Lombardo");
});

linCheckbox.addEventListener("change", (event) => {
  toggleArrayItem(translations, "Derek Lin");
});
