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

    button.onclick = (e) => createPlaylist(e);

    const queueActions = document.querySelector("ytd-playlist-panel-renderer #end-actions");
    if(queueActions)
        queueActions.prepend(button);
    else
        console.log("\n\n [QUEUER DEBUGGER] QueueActions not found");
}

function createPlaylist(e){
    e.stopPropagation();
    console.log("\n\n [QUEUER DEBUGGER] creating playlist button clicked....");
    const queueItems = document.querySelectorAll("ytd-playlist-panel-video-renderer > a");
    const queueLinks = Array.from(queueItems).map(a => (
        {
            title: a.querySelector("#video-title").innerText,
            image: a.querySelector("img").src,
            url: a.href.split('&list')[0] 
        }
    ));
    const playlist = queueLinks.filter((_, index) => index < queueLinks.length / 2);
    savePlaylist(playlist);
    return true;
}

function savePlaylist(items){
    // console.log("\n\n [QUEUER DEBUGGER] Mini player expanded, videos: ", items, chrome);
    // chrome.identity.getAccounts((accounts) => {
    //     console.log("\n\n [QUEUER DEBUGGER] Chrome user accounts: ", accounts);
    // })

    chrome.runtime.sendMessage(items);

    chrome.runtime.onMessage.addListener(function (err) {
        console.log("\n\n [QUEUER DEBUGGER] Error in bg task: ", err);
        // handlePlaylistSave(err);
    });
}

function handlePlaylistSave(res){
    console.log("\n\n [QUEUER DEBUGGER] Playlist saved: ", res);
}