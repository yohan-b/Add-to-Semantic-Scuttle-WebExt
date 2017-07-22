var instance
var windowWidth
var windowHeight

// prefs are not loaded once before shareURL it won't work on first click.
var gettingPrefs = browser.storage.local.get(["instance_url","window_width","window_height"]);
gettingPrefs.then(onGot,onError);

function shareURL(){
	browser.tabs.query({active: true},function(tabs){

		// prefs are loaded again when the function is called to manage changes in the options page.
		let gettingPrefs = browser.storage.local.get(["instance_url","window_width","window_height"]);
		gettingPrefs.then(onGot,onError);

		var tab = tabs[0];

		// manages Mozilla Firefox reader mode
		var rawUrl = tab.url;
		var partToRemove = "about:reader?url=";
		if(rawUrl.includes(partToRemove)) {
		rawUrl = rawUrl.substring(partToRemove.length);
		rawUrl = decodeURIComponent(rawUrl);
	  }

		var url = instance + "/bookmarks.php?action=add&address=" + encodeURIComponent(rawUrl) + "&title=" + encodeURIComponent(tabs[0].title);
		widthInt = Number(windowWidth);
		heightInt = Number(windowHeight);

		browser.windows.create({
			url: url,
			width: widthInt,
			height: heightInt,
			type: "popup"
		},(win)=>{
			browser.tabs.onUpdated.addListener((tabId,changeInfo) =>{
				if(tabId === win.tabs[0].id){
					if(changeInfo.url){
						var new_url
						new_url = changeInfo.url
						if((new_url.includes("action=add") == false) && (new_url.includes("edit.php") == false)){
							browser.windows.remove(win.id);
						}
					}
				}
			});
		});
	});
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
	instance = item["instance_url"];
	windowWidth = item["window_width"];
	windowHeight = item["window_height"];
}

browser.contextMenus.create({
	id: "semantic-scuttle",
	title: "Add to (Semantic)Scuttle",
	onclick: function(){
		shareURL();
	},
	contexts: ["all"]
});

browser.browserAction.onClicked.addListener(() => {
	shareURL();
});
