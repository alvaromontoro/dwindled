const button = document.querySelector("#dwindle-button");
const fromBox = document.querySelector("#text");
const toBox = document.querySelector("#result");

function dwindle(text) {
  return text.replace(/ one /ig, " 1 ");
}

button.addEventListener("click", function (e) {
  const originalText = fromBox.value;
  const transformedText = dwindle(originalText);
  toBox.value = transformedText;
});