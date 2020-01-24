chrome.runtime.onMessage.addListener((request, sender, callback) => {
    try {
        if(request.type === "login")
            getAuthuser().then(payload => callback({payload}));
        else if(request.type === "fetch-playlists")
            fetchUserPlaylists(request.data)
                .then(response => response.json())
                .then(async (response) => formatPlaylists(response))
                .then(response => {
                    if(response.error){
                        callback({error: response.error});
                        return;
                    }

                    callback({payload: response});
                });
        else if(request.type === "create-playlist")
            createNewPlaylist(request.data)
                .then(response => response.json())
                .then(response => {
                    if(response.error){
                        callback({error: response.error});
                        return;
                    }

                    callback({payload: formatPlaylist(response)});
                });
        else if(request.type === "add-videos-to-playlist")
            addVideosToPlaylist(request.data, callback);
    } catch (error) {
        callback({error});
    }

    return true;
});

function getAuthuser(){
    return new Promise(resolve => {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            if (chrome.runtime.lastError) {
                console.log("\n\n [QUEUER DEBUGGER] Error authenticating user: ", chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message, true);
                return;
            }
    
            resolve(token);
        });
    });
}

const API_KEY = "AIzaSyB77YFMNsw4t9oV4YMUnjfj5nf5h8Izw7k";

function fetchUserPlaylists(token){
    return fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50&key=${API_KEY}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
}

function createNewPlaylist({title, token}){
    const playlistData = {
        snippet: { title },
        status: {privacyStatus: "private"}
    };

    return fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,status&key=${API_KEY}`, {
        method: 'post',
        body: JSON.stringify(playlistData),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
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

function formatPlaylists(playlistReponse){
    return new Promise(resolve => {
        if(!playlistReponse.items || playlistReponse.error)
            resolve(playlistReponse);

        const playlists = playlistReponse.items.map(playlist => formatPlaylist(playlist));
        resolve(playlists);
    })
}

function formatPlaylist(playlist){
    if(!playlist.snippet)
        return playlist;

    return {
        id: playlist.id,
        title: playlist.snippet.title,
        image: playlist.snippet.thumbnails.medium.url,
        publishedAt: playlist.snippet.publishedAt,
        "other": "asfafa"
    }
}