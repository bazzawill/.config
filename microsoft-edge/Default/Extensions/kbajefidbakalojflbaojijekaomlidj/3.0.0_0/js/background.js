"use strict";
importScripts("/js/welcome.js");
class BackgroundPage {
    initialize() {
        chrome.action.onClicked.addListener(() => {
            chrome.tabs.create({
                url: "main.html",
            });
        });
    }
}
new BackgroundPage().initialize();
//# sourceMappingURL=background.js.map