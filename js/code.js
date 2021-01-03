const dwindle = {
  // the DOM elements needed   
  elements: {
    button: document.querySelector("#dwindle-button"),
    fromBox: document.querySelector("#text"),
    toBox: document.querySelector("#result"),
    fromCount: document.querySelector("#text-count"),
    toCount: document.querySelector("#result-count")
  },
  // the reduction/dwindling function
  dwindle: function (text) {
    return text.replace(/ one /ig, " <span class='key' data-original='one'>1</span> ");
  },
  // component initialization: add events, load data, etc.
  init: function () {
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

dwindle.init();
