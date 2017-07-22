var instance
var windowWidth
var windowHeight

function shareURL(){
	browser.tabs.query({active: true},function(tabs){

		var gettingUrl = browser.storage.local.get("instance_url");
		gettingUrl.then(onGotUrl, onError);
		var gettingWidth = browser.storage.local.get("window_width");
		gettingWidth.then(onGotWidth, onError);
		var gettingHeight = browser.storage.local.get("window_height");
		gettingHeight.then(onGotHeight, onError);

		var tab = tabs[0];

		// manages Mozilla Firefox reader mode
		var rawUrl = tab.url;
		var partToRemove = partToRemove = "about:reader?url=";
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

function onGotUrl(item) {
	if (item.instance_url) {
	    instance = item.instance_url;
	  }
}

function onGotWidth(item) {
	if (item.window_width) {
	    windowWidth = item.window_width;
	  }
}

function onGotHeight(item) {
	if (item.window_height) {
	    windowHeight = item.window_height;
	  }
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
