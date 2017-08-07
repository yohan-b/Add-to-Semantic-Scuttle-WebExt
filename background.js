function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
	instance = item["instance_url"];
	windowWidth = item["window_width"];
	windowHeight = item["window_height"];
	noQueryStrings = item["remove_querystrings"];
}

function shareURL(donnees){
	browser.tabs.query({active: true},function(tabs){

		browser.storage.local.get(["instance_url","window_width","window_height","remove_querystrings"],function(item){

		let instance = item["instance_url"];
		let windowWidth = item["window_width"];
		let windowHeight = item["window_height"];
		let noQueryStrings = item["remove_querystrings"];

		let tab = tabs[0];

		// manages Mozilla Firefox reader mode
		let rawUrl = tab.url;
		let partToRemove = "about:reader?url=";
		if(rawUrl.includes(partToRemove)) {
		rawUrl = rawUrl.substring(partToRemove.length);
		rawUrl = decodeURIComponent(rawUrl);
	  }

		// manages URL query strings
		if (noQueryStrings == true) {
			rawUrl = rawUrl.split("?")[0];
		}

		let url = instance + "/bookmarks.php?action=add&address=" + encodeURIComponent(rawUrl) + "&title=" + encodeURIComponent(tabs[0].title) + "&description=" + encodeURIComponent(donnees);
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
});
}

browser.contextMenus.create({
	id: "semantic-scuttle",
	title: "Add to (Semantic)Scuttle",
	onclick: function(){
		shareURL();
	},
	contexts: ["all"]
});

browser.browserAction.onClicked.addListener((tab) => {
	browser.tabs.sendMessage(tab.id, {method: "getSelection"}).then(response => {
	shareURL(response.response);
  }).catch(onError);
});
