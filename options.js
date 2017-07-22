function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    instance_url: document.querySelector("#instance_url").value ,
    window_width: document.querySelector("#window_width").value ,
    window_height: document.querySelector("#window_height").value
  });
}

function restoreOptions() {

  function setCurrentChoices(result) {
    document.querySelector("#instance_url").value = result["instance_url"] || "http://semanticscuttle.sourceforge.net/";
    document.querySelector("#window_width").value = result["window_width"] || "640";
    document.querySelector("#window_height").value = result["window_height"] || "480";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get(["instance_url","window_width","window_height"]);
  getting.then(setCurrentChoices, onError);

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
