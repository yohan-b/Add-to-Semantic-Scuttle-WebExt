function onError(error) {
    console.log(`Error: ${error}`);
}

function onRemoved() {
    console.log('Removed');
}

function onShared_remove(tab) {
    console.log('Shared');
    //var removing = tab.remove();
    //removing.then(onRemoved, onError);
}

function shareURL(selectionContent,currentTab){

    browser.storage.local.get(["instance_url","window_width","window_height","remove_querystrings","exceptUrlList"],function(item){
        instance = item["instance_url"];
        windowWidth = item["window_width"];
        windowHeight = item["window_height"];
        noQueryStrings = item["remove_querystrings"];
        exceptUrlList = item["exceptUrlList"];

        // manages Mozilla Firefox reader mode
        var rawUrl = currentTab.url;
        var partToRemove = "about:reader?url=";
        if(rawUrl.includes(partToRemove)) {
            rawUrl = rawUrl.substring(partToRemove.length);
            rawUrl = decodeURIComponent(rawUrl);
        }

        // manages URL query strings
        if (noQueryStrings == true) {
            var flagRemove = true;
            var urlList = exceptUrlList.split(/,\s*/);
            urlList.forEach(function(baseUrl) {
                if (rawUrl.startsWith(baseUrl)) {
                    flagRemove = false
                }
            });
            if (flagRemove) {rawUrl = rawUrl.split("?")[0];}
        }

        var url = instance + "/bookmarks.php?action=add&address=" + encodeURIComponent(rawUrl) + "&title=" + encodeURIComponent(currentTab.title) + "&description=" + encodeURIComponent(selectionContent);
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

function shareURL_API(selectionContent,currentTab){
    return new Promise((resolve, reject) => {

        browser.storage.local.get(["instance_url","username","password","remove_querystrings","exceptUrlList"],function(item){
            instance = item["instance_url"];
            // Build formData object.
            let formData = new FormData();
            formData.append('name', 'John');
            formData.append('password', 'John123');
            fetch(instance+'/api/posts_add.php', { method: 'POST', body: formData })
                .then(function (response) {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return Promise.reject({
                            status: response.status,
                            statusText: response.statusText
                        });
                    }
                })
                .then(function (data) {
                    console.log('success', data);
                    resolve("OK");
                })
                .catch(function (error) {
                    console.log('error', error);
                    reject("KO");
                });

        });
    })
}

browser.contextMenus.create({
    id: "semantic-scuttle",
    title: "Add to (Semantic)Scuttle",
    onclick: function(){
        browser.tabs.query({ currentWindow: true, active: true }, function(tabs) {
            tab = tabs[0];
            if((tab.url.includes("about:reader?url=") == true) || (tab.url.includes("https://addons.mozilla.org/") == true)){
                shareURL("",tab);
            }
            else
            {
                browser.tabs.sendMessage(tab.id, {method: "getSelection"}).then(response => {
                    shareURL(response.response,tab);
                }).catch(onError);
            }
        });
    },
    contexts: ["all"]
});

browser.contextMenus.create({
    id: "scuttle-session-save",
    title: "Save and close all",
    onclick: function(){
        browser.tabs.query({}, function(tabs) {
            for (let tab of tabs) {
                if((tab.url.includes("about:reader?url=") == true) || (tab.url.includes("https://addons.mozilla.org/") == true)){
                    shareURL_API("",tab).then(onShared_remove, onError);
                }
                else
                {
                    browser.tabs.sendMessage(tab.id, {method: "getSelection"})
                    .then(response => shareURL_API(response.response,tab))
                    .then(onShared_remove)
                    .catch(onError);
                }
            }
        });
    },
    contexts: ["all"]
});

browser.contextMenus.create({
    id: "scuttle-session-restore",
    title: "Select session to restore",
    onclick: function(){
        browser.tabs.query({ currentWindow: true, active: true }, function(tabs) {
            tab = tabs[0];
            if((tab.url.includes("about:reader?url=") == true) || (tab.url.includes("https://addons.mozilla.org/") == true)){
                shareURL("",tab);
            }
            else
            {
                browser.tabs.sendMessage(tab.id, {method: "getSelection"}).then(response => {
                    shareURL(response.response,tab);
                }).catch(onError);
            }
        });
    },
    contexts: ["all"]
});

browser.contextMenus.create({
    id: "scuttle-selector",
    title: "Select urls to add",
    onclick: function(){
        browser.tabs.query({ currentWindow: true, active: true }, function(tabs) {
            tab = tabs[0];
            if((tab.url.includes("about:reader?url=") == true) || (tab.url.includes("https://addons.mozilla.org/") == true)){
                shareURL("",tab);
            }
            else
            {
                browser.tabs.sendMessage(tab.id, {method: "getSelection"}).then(response => {
                    shareURL(response.response,tab);
                }).catch(onError);
            }
        });
    },
    contexts: ["all"]
});

browser.contextMenus.create({
    id: "my-scuttle",
    title: "My (Semantic)Scuttle",
    onclick: function(){
        browser.storage.local.get(["instance_url","username"],function(item){
            myurl = item["instance_url"] + "/bookmarks.php/" + item["username"];
            var creating = browser.tabs.create({url: myurl});
        })
    },
    contexts: ["all"]
});

browser.browserAction.onClicked.addListener((tab) => {
    if((tab.url.includes("about:reader?url=") == true) || (tab.url.includes("https://addons.mozilla.org/") == true)){
        shareURL("",tab);
    }
    else
    {
        browser.tabs.sendMessage(tab.id, {method: "getSelection"}).then(response => {
            shareURL(response.response,tab);
        }).catch(onError);
    }
});
