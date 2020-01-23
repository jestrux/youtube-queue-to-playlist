chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    console.log("\n\n [QUEUER DEBUGGER] Auth request received...");

    if(request.type === "login")
        getAuthuser(callback);
    else if(request.type === "fetch-playlists")
        fetchUserPlaylists(request.data, callback);
    else if(request.type === "create-playlist")
        createNewPlaylist(request.data, callback);
    else if(request.type === "add-videos-to-playlist")
        addVideosToPlaylist(request.data, callback);

    return true;
});

function getAuthuser(callback){
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        if (chrome.runtime.lastError) {
            console.log("\n\n [QUEUER DEBUGGER] Error authenticating user: ", chrome.runtime.lastError.message);
            callback(chrome.runtime.lastError.message, true);
            return;
        }

        console.log("\n\n [QUEUER DEBUGGER] Auth succeeded: ", token);
        callback(token);
    });
}

const API_KEY = "AIzaSyB77YFMNsw4t9oV4YMUnjfj5nf5h8Izw7k";

function fetchUserPlaylists(token, callback){
    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50&key=${API_KEY}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(response => formatPlaylists(response.items))
    .then(callback)
    .catch(error => callback(error, true));
}

function createNewPlaylist(data, callback){
    const {token, title, description} = data;
    const playlistData = {
        snippet: {
          title, description,
          tags: ["sample playlist", "Queuer"],
          defaultLanguage: "en"
        },
        status: {privacyStatus: "private"}
    };

    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,status&key=${API_KEY}`, {
        method: 'post',
        body: JSON.stringify(playlistData),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(formatPlaylist)
    .then(callback)
    .catch(error => callback(error, true));
}

function addVideosToPlaylist(data, callback){
    const {token, playlistId, videos} = data;
    
    try {
        recursivelyAddVideosToPlaylist(token, playlistId, videos, callback);
    } catch (error) {
        console.log("\n\n [QUEUER DEBUGGER] Error adding video to playlist: ", error);
        callback(error, true);
    }
}

function recursivelyAddVideosToPlaylist(token, playlistId, videos, callback, index = 0){
    const videoId = videos[index];
    const videoData = {
        snippet: {
            playlistId, 
            resourceId: {
                videoId, kind: "youtube#video"
            }
        }
    };
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=${API_KEY}`, {
        method: 'post',
        body: JSON.stringify(videoData),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(() => {
        if(index === videos.length - 1)
            callback();
        else
            recursivelyAddVideosToPlaylist(token, playlistId, videos, callback, index + 1);
    });
}

function formatPlaylists(playlists){
    return new Promise(resolve => {
        playlists = playlists.map(async (playlist) => {
            return await formatPlaylist(playlist);
        });

        resolve(playlists);
    })
}

function formatPlaylist(playlist){
    return new Promise(resolve => {
        resolve({
            id: playlist.id,
            title: playlist.snippet.title,
            image: playlist.snippet.thumbnails.medium.url,
            publishedAt: playlist.snippet.publishedAt
        });
    })
}