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
    for (let x = 0; x < dwindle.languages.length; x++) {
      const lang = dwindle.languages[x];
      for (let y = 0; y < dwindle.types.length; y++) {
        const type = dwindle.types[y];
        console.info(`Loading ${lang}/${type}...`);
        fetch(`./data/${lang}/${type}.json`)
          .then(response => {
            return response.json();
          })
          .then(data => {
            if (!dwindle.data[lang]) { dwindle.data[lang] = {} }
            dwindle.data[lang][type] = data;
            dwindle.loaded++;
            if (dwindle.loaded === dwindle.languages.length * dwindle.types.length) {
              console.groupEnd();
              console.info("%cAll data loaded successfully!", "color:green;");
            }
          });
      }
    }
  },
  // actual replacement function!
  replace: function (text, language, type) {
    if (dwindle.data && dwindle.data[language] && dwindle.data[language][type]) {
      const dictionary = dwindle.data[language][type];
      if (dictionary) {
        const keys = Object.keys(dictionary);
        for (let x = 0; x < keys.length; x++) {
          const group = "([ \\r\\n\\s\\.\\-\\+\\?!¡¿@#$%^&*,])";
          const pattern = `${group}${keys[x]}${group}`;
          const regexp = new RegExp(pattern, "gi");
          text = text.replace(regexp, function (match, group1, group2) {
            return `${group1}${dictionary[keys[x]]}${group2}`;
          });
        }
      }
    }
    return text;
  },
  // the reduction/dwindling function
  dwindle: function (text) {
    text = ` ${text} `;
    for (let x = 0; x < dwindle.types.length; x++) {
      if (text.length > 280) {
        text = dwindle.replace(text, dwindle.language, dwindle.types[x]);
      }
    }
    return text.trim();
  },
  // component initialization: add events, load data, etc.
  init: function () {
    dwindle.loadData();

    dwindle.elements.button.addEventListener("click", function (e) {
      const originalText = dwindle.elements.fromBox.value.trim();
      if (originalText !== "") {
        const transformedText = dwindle.dwindle(originalText);
        dwindle.elements.toBox.innerHTML = transformedText;
        dwindle.elements.toBox.classList.add("processed");
        dwindle.elements.toCount.textContent = dwindle.elements.toBox.textContent.length;
        dwindle.elements.toBox.focus();
      } else {
        dwindle.elements.toBox.innerHTML = "";
        dwindle.elements.toBox.classList.remove("processed");
        dwindle.elements.toCount.textContent = "0";
      }
    });

    dwindle.elements.fromBox.addEventListener("input", function () {
      dwindle.elements.fromCount.textContent = dwindle.elements.fromBox.value.length;
    })
  }
}

// initialize the object
dwindle.init();

