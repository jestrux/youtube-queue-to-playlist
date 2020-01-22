document.addEventListener('DOMContentLoaded', function () {
    const bg = chrome.extension.getBackgroundPage();
    console.log("Bg task: ", bg.playlist, bg.access_token);
});