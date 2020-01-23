// document.addEventListener('DOMContentLoaded', function () {
//     const bg = chrome.extension.getBackgroundPage();
//     console.log("Bg task: ", bg.playlist, bg.access_token);
// });
document.querySelector("#closeButton").onclick = (e) => closePopup(e);
// document.querySelector("#playlistFetchButton").onclick = (e) => fetchPlaylists(e);
document.querySelector("#existingPlaylistForm").onsubmit = (e) => saveVideosToPlaylists(e);
document.querySelector("#newPlaylistForm").onsubmit = (e) => createPlaylist(e);

function createPlaylist(e){
    e.preventDefault();
    emitMessage("create-playlist", e.target.playlist.value);
}

function fetchPlaylists(e){
    e.preventDefault();
    emitMessage("fetch-playlists");
}

function saveVideosToPlaylists(e){
    e.preventDefault();
    emitMessage("fetch-playlists");
}

function closePopup(e){
    e.preventDefault();
    emitMessage("close-popup");
}

function emitMessage(action, payload){
    const message = {sender: "QUEUER-IFRAME", action, payload};
    window.parent.postMessage(message, "*");
}

window.addEventListener("message", function(e){
    console.log("n\n [QUEUER DEBUGGER] Message from parent: ", e);
    // console.log("n\n [QUEUER DEBUGGER] Message to popup: ", e);
})