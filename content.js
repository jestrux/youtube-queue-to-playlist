var miniPlayer;
var popup;
var popupWindow;
var queueVideos;

window.onload = function(){
    miniPlayer = document.querySelector("ytd-miniplayer");
    var observer = new MutationObserver(function(mutations) {
        const playlistActiveAttributes = mutations.filter(({attributeName}) => attributeName === "active");
        const isExpanded = playlistActiveAttributes.length > 0;

        if(isExpanded){
            const queueItems = document.querySelectorAll("ytd-playlist-panel-video-renderer > a");

            if(queueItems && queueItems.length > 0)
                addSavePlaylistButton();
        }
    });
    
    if(miniPlayer){
        observer.observe(miniPlayer, {attributes: true});
        setupPopup();
    }
    else
        console.log("\n\n [QUEUER DEBUGGER] Mini player not found, maybe from background task \n\n ");
}

function setupPopup(){
    popup = document.createElement ("iframe");
    popup.src  = chrome.extension.getURL("popup.htm");
    popup.id = "QUEUER-IFRAME";
    document.body.appendChild(popup);
    popupWindow = popup.contentWindow;
}

window.addEventListener("message", function(e){
    const data = e.data;
    if(data && data.sender === "QUEUER-IFRAME"){
        const { action, payload, token } = data;

        switch (data.action) {
            case "close-popup":
                popup.classList.remove("visible");
                break;
            case "fetch-playlists":
                fetchUserPlaylists(token);
                break;
            case "create-playlist":
                createNewPlaylist(token, payload);
                break;
            case "playlist-selected":
                addVideosToPlaylist(token, payload, queueVideos);
                break;
            default:
                console.log("n\n [QUEUER DEBUGGER] Message from popup: ", action, payload);
                break;
        }
    }
});

function emitMessage(action, payload){
    const message = {action, payload};
    popupWindow.postMessage(message, chrome.runtime.getURL(""));
}

function addSavePlaylistButton(){
    const button = document.createElement("button");
    button.innerText = "SAVE PLAYLIST";
    button.classList.add("queue-playlist-saver");

    button.onclick = (e) => handleSaveButtonClicked(e);

    const queueActions = document.querySelector("ytd-playlist-panel-renderer #end-actions");
    if(queueActions){
        if(queueActions.querySelector(".queue-playlist-saver")){
            console.log("\n\n [QUEUER DEBUGGER] Save playlist button was already created");
            return;
        }

        queueActions.prepend(button);
    }
    else
        console.log("\n\n [QUEUER DEBUGGER] QueueActions not found");
}

async function handleSaveButtonClicked(e){
    e.stopPropagation();
    const queueItems = document.querySelectorAll("ytd-playlist-panel-video-renderer > a");
    let queueLinks = Array.from(queueItems).map(a => (
        {
            title: a.querySelector("#video-title").innerText,
            image: a.querySelector("img").src,
            url: a.href.split('&list')[0] 
        }
    ));
    queueLinks = queueLinks.filter((_, index) => index < queueLinks.length / 2);
    queueVideos = queueLinks.map(({url}) => url.split("watch?v=")[1]);

    popup.classList.add("visible");
    
    try {
        const token = await authenticateUser();
        emitMessage('auth-success', token);
    } catch (error) {
        emitMessage('auth-error', error);
        console.log("\n\n [QUEUER DEBUGGER] Auth failed: ", error);
    }
}

function authenticateUser(){
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: "login"}, ({payload, error}) => {
            if(error)
                reject(error)
            else
                resolve(payload);
        });
    });
}

function fetchUserPlaylists(token){
    const message = {
        type: "fetch-playlists", 
        data: token
    };
    chrome.runtime.sendMessage(message, ({payload, error}) => {
        if(error)
            console.log("\n\n [QUEUER DEBUGGER] Error fetching user playlists, ", error)
        else
            emitMessage("playlists-fetched", payload);
    });
}

function createNewPlaylist(token, title){
    const message = {
        type: "create-playlist", 
        data: {token, title}
    };
    chrome.runtime.sendMessage(message, ({payload, error}) => {
        if(error)
            console.log("\n\n [QUEUER DEBUGGER] Error creating playlist, ", error)
        else{
            if(!payload.title && payload.snippet)
                payload.title = payload.snippet.title;
                
            emitMessage("playlist-created", payload);
        }
    });
}

function addVideosToPlaylist(token, playlistId, videos){
    const message = {
        type: "add-videos-to-playlist", 
        data: {token, playlistId, videos}
    };
    chrome.runtime.sendMessage(message, ({payload, error}) => {
        if(error)
            console.log("\n\n [QUEUER DEBUGGER] Error adding videos to playlist, ", error)
        else{
            emitMessage("videos-added");
        }
    });
}