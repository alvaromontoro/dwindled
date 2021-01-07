const dwindle = {
  // the DOM elements needed   
  elements: {
    button: document.querySelector("#dwindle-button"),
    fromBox: document.querySelector("#text"),
    toBox: document.querySelector("#result"),
    fromCount: document.querySelector("#text-count"),
    toCount: document.querySelector("#result-count"),
    bubble: document.querySelector("#replacement-info"),
    termOriginal: document.querySelector("#replacement-info-original"),
    termChange: document.querySelector("#replacement-info-change"),
    screenreader: document.querySelector("#screen-reader"),
    tweetButton: document.querySelector("#tweet-button-container")
  },
  language: "en",
  languages: ["en"],
  types: [
    "popular", "contractions", "corporations", 
    "numbers", "ordinals", "sports", "emojis"
  ],
  settings: {
    aggressive: true,
    numbers: true,
    ordinals: true,
    popular: true,
    corporations: true,
    sports: true,
    contractions: true,
    emojis: true
  },
  loaded: 0,
  activeKey: null,
  activeMenu: -1,
  data: {},
  // load ALL the data from the JSON files
  loadData: function () {
    // I was going to use for...of, but it doesn't work on IE
    console.group("Loading replacement data");
    for (let x = 0; x < this.languages.length; x++) {
      const lang = this.languages[x];
      for (let y = 0; y < this.types.length; y++) {
        const type = this.types[y];
        console.info(`Loading ${lang}/${type}...`);
        fetch(`./data/${lang}/${type}.json`)
          .then(response => {
            return response.json();
          })
          .then(data => {
            if (!this.data[lang]) { this.data[lang] = {} }
            this.data[lang][type] = data;
            this.loaded++;
            if (this.loaded === this.languages.length * this.types.length) {
              console.groupEnd();
              console.info("%cAll data loaded successfully!", "color:green;");
            }
          });
      }
    }
  },
  updateLink: function () {
    if (this.elements.toBox.textContent.length <= 280) {
      this.elements.tweetButton.querySelector("a").setAttribute("href", `https://twitter.com/intent/tweet?text=${encodeURI(this.elements.toBox.textContent.trim())}&url=`);
      this.elements.tweetButton.style.visibility = "visible";
      this.speak("The dwindled text is ready to be tweeted");
    } else {
      this.elements.tweetButton.style.visibility = "hidden";
      this.speak("The text is still too long to be tweeted")
    }
  },
  // actual replacement function!
  replace: function (text, language, type) {
    if (this.data && this.data[language] && this.data[language][type]) {
      const dictionary = this.data[language][type];
      if (dictionary) {
        const keys = Object.keys(dictionary);
        for (let x = 0; x < keys.length; x++) {
          const group = "([ \\r\\n\\s\\.\\-\\+\\?:¡¿!@#$%^&*,])";
          const pattern = `${group}${keys[x]}${group}`;
          const regexp = new RegExp(pattern, "gi");
          text = text.replace(regexp, function (match, group1, group2) {
            const remediate = match.substring(group1.length, match.length - group1.length - group2.length + 1);
            return `${group1}<button class="key" 
                                     aria-haspopup="menu"
                                     tabindex="0"
                                     data-original="${remediate}" 
                                     data-change="${dictionary[keys[x]]}">${dictionary[keys[x]]}</button>${group2}`;
          });
        }
      }
    }
    return text;
  },
  speak: function (text) {
    this.elements.screenreader.textContent = text;
    setTimeout(() => { this.elements.screenreader.textContent = ""; }, 1000);
  },
  hideBubble: function (force = false) {
    this.elements.bubble.style = "";
    
    if (this.activeKey && !force) {
      this.activeKey.focus();
      this.activeKey = null;
    }

    this.activeMenu = -1;
    const menu = this.elements.bubble.querySelector(".focused");
    if (menu) {
      menu.classList.remove("focused");
    }
  },
  // the reduction/dwindling function
  dwindle: function (text) {
    let newText = ` ${text.replace(/\</g, "&lt;").replace(/\>/g, "&gt;")} `;
    for (let x = 0; x < this.types.length; x++) {
      let textSanitized = newText.replace(/(<([^>]+)>)/ig, "").trim();
      if (textSanitized.length > 280 || this.settings.aggressive) {
        if (this.settings[this.types[x]]) {
          newText = this.replace(newText, this.language, this.types[x]);
        }
      }
    }
    return newText.trim();
  },
  // component initialization: add events, load data, etc.
  init: function () {
    this.loadData();

    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    for (let x = 0; x < checkboxes.length; x++) {
      checkboxes[x].addEventListener("change", () => {
        const id = checkboxes[x].id.replace("dictionary-", "");
        this.settings[id] = checkboxes[x].checked;
      })
    }

    this.elements.button.addEventListener("click", () => {
      const originalText = this.elements.fromBox.value.trim();
      if (originalText !== "") {
        const transformedText = this.dwindle(originalText);
        this.elements.toBox.innerHTML = transformedText;
        this.elements.toBox.classList.add("processed");
        this.elements.toCount.textContent = this.elements.toBox.textContent.length;
        this.elements.toBox.focus();
        this.updateLink();
      } else {
        this.elements.toBox.innerHTML = "";
        this.elements.toBox.classList.remove("processed");
        this.elements.toCount.textContent = "0";
        this.elements.tweetButton.style.visibility = "hidden";
      }
    });

    this.elements.fromBox.addEventListener("input", () => {
      this.elements.fromCount.textContent = this.elements.fromBox.value.length;
    });

    this.elements.toBox.addEventListener('click', (e) => {
      if (e.target.className.toLowerCase() === 'key') {
        const key = e.target;
        this.activeKey = key;
        const coordinates = key.getBoundingClientRect();
        this.elements.bubble.querySelector("#replacement-info-original").textContent = key.dataset.original;
        this.elements.bubble.querySelector("#replacement-info-change").textContent = key.dataset.change;
        this.elements.bubble.style = `top: ${coordinates.top + window.scrollY}px; left: ${coordinates.left}px; display: block;`;
        this.speak(this.elements.bubble.textContent);

        e.target.onblur = (event) => {
          if (event.relatedTarget && event.relatedTarget.className.toLowerCase() !== "term") {
            this.hideBubble(true);
          }
          e.target.onblur = "";
          e.target.onkeydown = "";
        }

        e.target.onkeydown = (event) => {
          if (this.activeKey) {
            switch (event.key) {
              case "Esc":
              case "Escape":
                this.hideBubble();
                break;
              case "Enter":
              case "Space":
                event.preventDefault();
                if (this.activeMenu > 0) {
                  const focused = this.elements.bubble.querySelector(`button:nth-of-type(${this.activeMenu})`);
                  this.activeKey.textContent = focused.textContent;
                  this.activeKey.dataset.isoriginal = this.activeMenu === 1;
                  this.elements.toCount.textContent = this.elements.toBox.textContent.length;
                  this.speak(`Selected ${focused.textContent} (${this.activeMenu === 1 ? "original" : "new"} value)`);
                  this.updateLink();
                  this.hideBubble();
                }
                this.hideBubble();
                break;
              case "Up":
              case "ArrowUp":
              case "Down":
              case "ArrowDown":
                event.preventDefault();
                const focused = this.elements.bubble.querySelector(".focused");
                if (focused) {
                  focused.classList.remove("focused");
                }
                this.activeMenu = this.activeMenu === 1 ? 2 : 1;
                const newFocused = this.elements.bubble.querySelector(`button:nth-of-type(${this.activeMenu})`);
                newFocused.classList.add("focused");
                this.speak(`${newFocused.textContent} (${this.activeMenu === 1 ? "original" : "new"} value)`);
                break;
            }
          }
        }
      }
    });

    this.elements.termChange.addEventListener("click", () => {
      this.activeKey.textContent = this.activeKey.dataset.change;
      this.activeKey.dataset.isoriginal = false;
      this.elements.toCount.textContent = this.elements.toBox.textContent.length;
      this.updateLink();
      this.hideBubble();
    });

    this.elements.termOriginal.addEventListener("click", () => {
      this.activeKey.textContent = this.activeKey.dataset.original;
      this.activeKey.dataset.isoriginal = true;
      this.elements.toCount.textContent = this.elements.toBox.textContent.length;
      this.updateLink();
      this.hideBubble();
    });


    window.addEventListener("click", (e) => {
      if (e.target.className.toLowerCase() !== 'key') {
        this.hideBubble(true);
      }
    });

    this.elements.toBox.addEventListener("scroll", () => { this.hideBubble(); });
    window.addEventListener("scroll", () => { this.hideBubble(); });
    window.addEventListener("resize", () => { this.hideBubble(); });
  }
}

// initialize the object
dwindle.init();

// initizalize service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("Service worker registered"))
      .catch(err => console.log("Service worker not registered", err));
  });
}
