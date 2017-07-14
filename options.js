function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    instance_url: document.querySelector("#instance_url").value
  });
  browser.storage.local.set({
    window_width: document.querySelector("#window_width").value
  });
  browser.storage.local.set({
    window_height: document.querySelector("#window_height").value
  });
}

function restoreOptions() {

  function setCurrentChoiceUrl(result) {
    document.querySelector("#instance_url").value = result.instance_url || "http://semanticscuttle.sourceforge.net/";
  }

  function setCurrentChoiceWidth(result) {
    document.querySelector("#window_width").value = result.window_width || "640";
  }

  function setCurrentChoiceHeight(result) {
    document.querySelector("#window_height").value = result.window_height || "480";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var gettingUrl = browser.storage.local.get("instance_url");
  gettingUrl.then(setCurrentChoiceUrl, onError);

  var gettingWidth = browser.storage.local.get("window_width");
  gettingWidth.then(setCurrentChoiceWidth, onError);

  var gettingHeight = browser.storage.local.get("window_height");
  gettingHeight.then(setCurrentChoiceHeight, onError);

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
