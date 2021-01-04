const dwindle = {
  // the DOM elements needed   
  elements: {
    button: document.querySelector("#dwindle-button"),
    fromBox: document.querySelector("#text"),
    toBox: document.querySelector("#result"),
    fromCount: document.querySelector("#text-count"),
    toCount: document.querySelector("#result-count")
  },
  language: "en",
  languages: ["en"],
  types: ["numbers", "ordinals", "popular", "corporations"],
  loaded: 0,
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
  // actual replacement function!
  replace: function (text, language, type) {
    if (this.data && this.data[language] && this.data[language][type]) {
      const dictionary = this.data[language][type];
      if (dictionary) {
        const keys = Object.keys(dictionary);
        for (let x = 0; x < keys.length; x++) {
          const group = "([ \\r\\n\\s\\.\\-\\+\\?¡¿!@#$%^&*,])";
          const pattern = `${group}${keys[x]}${group}`;
          const regexp = new RegExp(pattern, "gi");
          text = text.replace(regexp, function (match, group1, group2) {
            const remediate = match.substring(group1.length, match.length - group1.length - group2.length + 1);
            return `${group1}<span class="key" data-original="${remediate}" data-change="${dictionary[keys[x]]}">${dictionary[keys[x]]}</span>${group2}`;
          });
        }
      }
    }
    return text;
  },
  // the reduction/dwindling function
  dwindle: function (text) {
    text = ` ${text} `;
    for (let x = 0; x < this.types.length; x++) {
      if (text.length > 280) {
        text = this.replace(text, this.language, this.types[x]);
      }
    }
    return text.trim();
  },
  // component initialization: add events, load data, etc.
  init: function () {
    this.loadData();

    this.elements.button.addEventListener("click", () => {
      const originalText = this.elements.fromBox.value.trim();
      if (originalText !== "") {
        const transformedText = this.dwindle(originalText);
        this.elements.toBox.innerHTML = transformedText;
        this.elements.toBox.classList.add("processed");
        this.elements.toCount.textContent = this.elements.toBox.textContent.length;
        this.elements.toBox.focus();
      } else {
        this.elements.toBox.innerHTML = "";
        this.elements.toBox.classList.remove("processed");
        this.elements.toCount.textContent = "0";
      }
    });

    this.elements.fromBox.addEventListener("input", () => {
      this.elements.fromCount.textContent = this.elements.fromBox.value.length;
    })
  }
}

// initialize the object
dwindle.init();

