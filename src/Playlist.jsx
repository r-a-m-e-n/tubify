import React, { useState, useEffect } from 'react';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function Playlist(props) {

    const [sPlayer, setSPlayer] = useState(undefined);
    const [yPlayer, setYPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(true);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);
    const [sData, setSData] = useState(new Array(0));
    const [yData, setYData] = useState(new Array(0));
    const [playlist, setPlaylist] = useState([]);
    const [device, setDevice] = useState('');
    const [source, setSource] = useState('');
    var startCheck = 0;
    const [current, setCurrent] = useState(0);
    const apiKey = "AIzaSyALDJ1k8Fv_vr2EQDxVqjcmZOs7jaEDXyU";

    useEffect(() => {
        //youtube
        


        //spotify

        const sScript = document.createElement("script");
        sScript.src = "https://sdk.scdn.co/spotify-player.js";
        sScript.async = true;
    
        document.body.appendChild(sScript);
    
        window.onSpotifyWebPlaybackSDKReady = () => {
    
            const sPlayer = new window.Spotify.Player({
                name: 'tubify',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });
            setSPlayer(sPlayer);
    
            sPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDevice(device_id);
            });
    
            sPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            sPlayer.addListener('player_state_changed', ( state => {

                if (!state) {
                    return;
                }
            
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                
                sPlayer.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });
                

            
            }));

            sPlayer.addListener('player_state_changed', (state) => {
                if (
                  state.position == 0 && state.paused
                  ) {
                  startCheck++;
                  if (startCheck === 1) {
                    console.log('Track ended', current, playlist.length);
                    console.log(state);
                    document.getElementById("next").click();
                  }

                }
                if(state.position > 1 && state.position < state.duration && !state.paused) {
                    startCheck = 0
                }

              });
    
            sPlayer.connect();
    
        };
    }, []);


    async function spotifySearch(info) {
        if (info.length == 0) {
            setSData([]);
            return;
        }
        fetch("https://api.spotify.com/v1/search?q=" + info + "&type=track&limit=5", {headers: {Authorization: "Bearer " + props.token}})
        .then(res => res.json())
        .then(data => setSData(Object.entries(data.tracks.items).map(( [k, v] ) => ({ [k]: v }))))
      }

      async function youtubeSearch(info) {
        if (info.length == 0) {
            setYData([]);
            return;
        }
        fetch("https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=" + info + "&type=video&key=" + apiKey)
        .then(res => res.json())
        .then(data => setYData(data.items))
      }

    async function start() {
        if (playlist[0].type === "spotify") {
            setSource("");
            fetch("https://api.spotify.com/v1/me/player/play?device_id=" + device, {method: 'PUT', body: JSON.stringify({ uris: [playlist[0].uri] }), headers: {Authorization: "Bearer " + props.token}})
        .then(res => {setCurrent(0); console.log(current, playlist)});
        }
        else {
            fetch("https://api.spotify.com/v1/me/player/pause", {method: 'PUT', headers: {Authorization: "Bearer " + props.token}})
            setSource("https://www.youtube.com/embed/" + playlist[0].uri + "?autoplay=1&controls=0");
            setCurrent(0);
            setPaused(false);
        }
    }

    async function play() {
        if (playlist[current].type !== "spotify") {
            //iframe.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
            return;
            console.log("x");
        }
        sPlayer.togglePlay()
    }

    async function next() {
        if (playlist[(current + 1)%playlist.length].type === "spotify") {
            setSource("");
            fetch("https://api.spotify.com/v1/me/player/play?device_id=" + device, {method: 'PUT', body: JSON.stringify({ uris: [playlist[(current + 1)%playlist.length].uri] }), headers: {Authorization: "Bearer " + props.token}})
                .then(res => {setCurrent((current + 1)%playlist.length); console.log(current, playlist)});
        }
        else {
            fetch("https://api.spotify.com/v1/me/player/pause", {method: 'PUT', headers: {Authorization: "Bearer " + props.token}})
            setSource("https://www.youtube.com/embed/" + playlist[(current + 1)%playlist.length].uri + "?autoplay=1&controls=0");
            setCurrent((current + 1)%playlist.length);
            setPaused(false);
        }
    }

    async function previous() {
        if (playlist[(current - 1 + playlist.length)%playlist.length].type === "spotify") {
            setSource("");
            fetch("https://api.spotify.com/v1/me/player/play?device_id=" + device, {method: 'PUT', body: JSON.stringify({ uris: [playlist[(current - 1 + playlist.length)%playlist.length].uri] }), headers: {Authorization: "Bearer " + props.token}})
            .then(res => {setCurrent((current - 1 + playlist.length)%playlist.length); console.log(current, playlist)});
        }
        else {
            fetch("https://api.spotify.com/v1/me/player/pause", {method: 'PUT', headers: {Authorization: "Bearer " + props.token}})
            setSource("https://www.youtube.com/embed/" + playlist[(current - 1 + playlist.length)%playlist.length].uri + "?autoplay=1&controls=0");
            current = (current - 1 + playlist.length)%playlist.length;
            setPaused(false);
        }
    }

    return (
        <>
        <div className="Main">
        <div className="Left">
            
            <div className="player">
        { (playlist.length > 0 && playlist[current].type === 'youtube') ? <iframe width="0" height="0" id="youtube"
        src={source}>
        </iframe> : <></> }
        <button onClick={() => { start() }} >
                        start/restart
                    </button>
        <button onClick={() => { previous() }} >
                        &lt;&lt;
                    </button>

                    <button id='play' onClick={() => { play() }} >
                        { is_paused ? "continue" : "pause" }
                    </button>

                    <button id="next" onClick={() => { next() }} >
                        &gt;&gt;
                    </button>
                    </div>
                    currently playing: 
            {(playlist.length > 0 && !is_paused)? <div><div>{playlist[current].name}</div><img src={playlist[current].cover}/></div>: <>None</>}
                    <div>
        </div>
        </div>
        
        <div className="Right">
            <div className="SSearch">
        <input type="text" id="youtubeSearch" placeholder="Search on Youtube"  onChange={event => youtubeSearch(event.target.value)}></input>
        <div className="results">
        {
            yData.map((post, index) => {
                return(
                    <div>
                <button className="add" onClick={()=>{ playlist.push({type: "youtube", name: post.snippet.title, uri: post.id.videoId, artist: post.snippet.channelTitle, cover:post.snippet.thumbnails.default.url}) }}> add to queue </button>
                <div className="info" key={index}>
                    <p>{post.snippet.title}</p>
                </div>
                </div>
                )
            })
            }
        </div>
        </div>
        <div className="YSearch">
        <input type="text" id="spotifySearch"  placeholder="Search on Spotify" onChange={event => spotifySearch(event.target.value)}></input>
        <div  className="results">
        {
            sData.map((post, index) => {
                return(
                    <div>
                <button className="add" onClick={()=>{ playlist.push({type: "spotify", name: post[index].name, uri: post[index].uri, artist: post[index].artists[0].name, cover:post[index].album.images[0].url}) }}> add to queue </button>
                <div className="info" key={index}>
                    <p>{post[index].name}</p>
                </div>
                </div>
                )
            })
            }
        </div>
        </div>
        </div>
        </div>
        </>
    );
}
export default Playlist