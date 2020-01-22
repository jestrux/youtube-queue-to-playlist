window.access_token = [];
window.playlist = [];
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    const items = request;
    window.playlist = request;
    console.log("\n\n [QUEUER DEBUGGER] Save playlist request: ", items, chrome.identity);

    // console.log("\n\n [QUEUER DEBUGGER] Mini player expanded, videos: ", items, chrome);
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.log("\n\n [QUEUER DEBUGGER] Error in bg task: ", token, chrome.runtime.lastError);
            chrome.runtime.sendMessage({"error": chrome.runtime.lastError});
            return;
        }
        else{
            console.log("\n\n [QUEUER DEBUGGER] Auth succeeded: ", token);
        }

        window.access_token = token;
        chrome.tabs.create({url: 'popup.html'});
        // requestStart();
    });
});