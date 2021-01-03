const dwindle = {
  // the DOM elements needed   
  elements: {
    button: document.querySelector("#dwindle-button"),
    fromBox: document.querySelector("#text"),
    toBox: document.querySelector("#result"),
    fromCount: document.querySelector("#text-count"),
    toCount: document.querySelector("#result-count")
  },
  languages: ["en"],
  types: ["numbers", "ordinals"],
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
        fetch(`./js/${lang}/${type}.json`)
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
  // the reduction/dwindling function
  dwindle: function (text) {
    return text.replace(/ one /ig, " <span class='key' data-original='one'>1</span> ");
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

