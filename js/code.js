const button = document.querySelector("#dwindle-button");
const fromBox = document.querySelector("#text");
const toBox = document.querySelector("#result");
const fromCount = document.querySelector("#text-count");
const toCount = document.querySelector("#result-count");

function dwindle(text) {
  return text.replace(/ one /ig, " <span class='processed'>1</span> ");
}

button.addEventListener("click", function (e) {
  const originalText = fromBox.value.trim();
  if (originalText !== "") {
    const transformedText = dwindle(originalText);
    toBox.innerHTML = transformedText;
    toBox.classList.add("processed");
    toCount.textContent = toBox.textContent.length;
  } else {
    toBox.innerHTML = "";
    toBox.classList.remove("processed");
    toCount.textContent = "0";
  }
});

fromBox.addEventListener("input", function () {
  fromCount.textContent = fromBox.value.length;
})