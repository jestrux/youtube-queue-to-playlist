var miniPlayer;
window.onload = function(){
    miniPlayer = document.querySelector("ytd-miniplayer");
    console.log("\n\n [QUEUER DEBUGGER] window loaded\n\n ");
    // console.log("Mini player: ", miniPlayer);

    var observer = new MutationObserver(function(mutations) {
        // console.log("Mini player changed", mutations);
        const playlistActiveAttributes = mutations.filter(({attributeName}) => attributeName === "active");
        const isExpanded = playlistActiveAttributes.length > 0;

        if(isExpanded){
            const queueItems = document.querySelectorAll("ytd-playlist-panel-video-renderer > a");

            if(queueItems && queueItems.length > 0)
                addSavePlaylistButton();
        }
    });
    
    if(miniPlayer)
        observer.observe(miniPlayer, {attributes: true});
    else
        console.log("\n\n [QUEUER DEBUGGER] Mini player not found, maybe from background task \n\n ");
}

function addSavePlaylistButton(){
    console.log("\n\n [QUEUER DEBUGGER] Creating playlist save button....");
    const button = document.createElement("button");
    button.style.height = "37px";
    button.style.marginRight = "0.4rem";
    button.style.marginTop = "0.671rem";
    button.style.fontSize = "1.4rem";
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.padding = "0.7em 0.57em";
    button.style.background = "transparent";
    button.style.border = "none";
    button.style.fontFamily = "Roboto";
    button.style.fontWeight = 500;
    button.style.color = "#606060";
    button.style.outline = "none";
    button.style.cursor = "pointer";

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
    console.log("\n\n [QUEUER DEBUGGER] creating playlist button clicked....");
    const queueItems = document.querySelectorAll("ytd-playlist-panel-video-renderer > a");
    let queueLinks = Array.from(queueItems).map(a => (
        {
            title: a.querySelector("#video-title").innerText,
            image: a.querySelector("img").src,
            url: a.href.split('&list')[0] 
        }
    ));
    queueLinks = queueLinks.filter((_, index) => index < queueLinks.length / 2);
    const queueVideos = queueLinks.map(({url}) => url.split("watch?v=")[1]);    
    console.log("\n\n [QUEUER DEBUGGER] Queue videi ids: ", queueVideos);
}

// saveVideosToPlaylist();

async function saveVideosToPlaylist(videos){
    try {
        const token = await authenticateUser();
        const playlistId = await getPrefferedPlaylist(token);
        // const playlistId = "PLaEj9pMixBr0fLN-vBFvTVe4wTs4rTbrJ";
        // const videos = ["id28fCyYgIU", "QN0THk3z-eg"];
        addVideosToPlaylist(token, playlistId, videos);
    } catch (error) {
        console.log("\n\n [QUEUER DEBUGGER] Failed to save videos to playlist: ", error);
    }
}

function getPrefferedPlaylist(token){
    return new Promise(async (resolve, reject) => {
        // fetchUserPlaylists(token);
        // createNewPlaylist(token, playlistName);
    });
}

function authenticateUser(){
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: "login"}, (payload, error) => {
            if(error)
                reject(payload)
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
    chrome.runtime.sendMessage(message, (payload, error) => {
        if(error)
            console.log("\n\n [QUEUER DEBUGGER] Error fetching user playlists, ", payload)
        else
            console.log("\n\n [QUEUER DEBUGGER] User playlists fetched", payload);
    });
}

function createNewPlaylist(token, title, description = ""){
    const message = {
        type: "create-playlist", 
        data: {token, title, description}
    };
    chrome.runtime.sendMessage(message, (payload, error) => {
        if(error)
            console.log("\n\n [QUEUER DEBUGGER] Error creating playlist, ", payload)
        else
            console.log("\n\n [QUEUER DEBUGGER] Playlist created", payload);
    });
}

function addVideosToPlaylist(token, playlistId, videos){
    const message = {
        type: "add-videos-to-playlist", 
        data: {token, playlistId, videos}
    };
    chrome.runtime.sendMessage(message, (payload, error) => {
        if(error)
            console.log("\n\n [QUEUER DEBUGGER] Error adding videos to playlist, ", payload)
        else
            console.log("\n\n [QUEUER DEBUGGER] Videos added to playlist", payload);
    });
}