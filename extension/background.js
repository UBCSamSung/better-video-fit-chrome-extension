'use strict';

let options = [
    '',
    'fill',
    'cover',
    'none'
]

function updateIcon(tabId) {
    console.log(tabId);
    let key = `number-${tabId}`;
    chrome.storage.sync.get(
        key,
        (data) => {
            let current = data[key];
            if (current == null) return;
            chrome.tabs.executeScript({
                code: `[...document.getElementsByTagName("video")].forEach(e=>{e.style.setProperty("object-fit", "${options[current % options.length]}", "important");});`
            }, e => console.log(tabId, e));
            // TODO: Find workaround for YouTube's reassignment of css property when toggling fullscreen
            chrome.tabs.executeScript({
                code: `[...document.getElementsByTagName("video")].forEach(e=>{e.style.setProperty("width", "100%", "important");e.style.setProperty("left", "0", "important");});`
            }, e => console.log(tabId, e));
            chrome.browserAction.setBadgeText({ text: options[current % options.length], tabId: tabId });
        }
    );
}

function incrementNumber(tabId) {
    console.log(tabId);
    let key = `number-${tabId}`;
    chrome.storage.sync.get(key, function (data) {
        let current = data[key];
        if (current == null) current = 1;
        current = (current + 1) % options.length;
        chrome.storage.sync.set({ [key]: current }, null);
        updateIcon(tabId);
    });
}

function resetNumber(tabId) {
    let key = `number-${tabId}`;
    chrome.storage.sync.set({ [key]: 0 }, null);
}

function isValidTab(tab) {
    if (!tab) return false;
    let url = tab.pendingUrl ? tab.pendingUrl : tab.url;
    if (!url) return false;
    console.log(url);
    let banned_prefix = [
        "chrome://",
        "https://chrome.google.com/webstore/"
    ];
    for (let prefix of banned_prefix) {
        if (url.startsWith(prefix))
            return false;
    }
    return true;
}

chrome.browserAction.onClicked.addListener((tab) => {
    if (!isValidTab(tab)) return;
    incrementNumber(tab.id)
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!isValidTab(tab)) return;
    if (changeInfo.url) resetNumber(tabId);
    updateIcon(tabId)
});

chrome.tabs.onCreated.addListener((tabId, changeInfo, tab) => {
    if (!isValidTab(tab)) return;
    if (changeInfo.url) resetNumber(tabId);
    updateIcon(tabId)
});