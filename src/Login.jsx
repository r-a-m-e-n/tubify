import React from 'react';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
                tubify
                <div className="subtitle">
                playlists for youtube and spotify
                </div>
                    <button  className="btn-spotify">
                        <a href="/auth/login" >
                            Login with Spotify
                        </a> 
                    </button>
            </header>
        </div>
    );
}

export default Login;