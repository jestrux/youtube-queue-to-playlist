window.token = null;

document.querySelector("#closeButton").onclick = (e) => closePopup(e);
document.querySelector("#existingPlaylistsTabButton").onclick = (e) => fetchPlaylists(e);
document.querySelector("#existingPlaylistForm").onsubmit = (e) => {
    e.preventDefault();
    playlistSelected(e.target.playlist.value);
};
document.querySelector("#newPlaylistForm").onsubmit = (e) => createPlaylist(e);

function createPlaylist(e){
    e.preventDefault();
    emitMessage("create-playlist", e.target.playlist.value);
}

let playlistsFetched = false;
function fetchPlaylists(e){
    if(playlistsFetched)
        return;

    e.preventDefault();
    emitMessage("fetch-playlists");
    playlistsFetched = true;
}

function playlistSelected(playlist){
    emitMessage("playlist-selected", playlist);
}

function closePopup(e){
    e.preventDefault();
    console.log(this.$refs);
    emitMessage("close-popup");
}

function emitMessage(action, payload){
    const message = {sender: "QUEUER-IFRAME", action, payload, token: window.token};
    window.parent.postMessage(message, "*");
}

window.addEventListener("message", function(e){
    // console.log("n\n [QUEUER DEBUGGER] Message from parent: ", e);
    if(e.data && e.data.action){
        const event = new CustomEvent(e.data.action, {detail: e.data.payload})
        window.dispatchEvent(event);
    }
})