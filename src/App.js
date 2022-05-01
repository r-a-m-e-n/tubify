import React, { useState, useEffect } from 'react';
import WebPlayback from './Webplayback'
import Login from './Login'
import Playlist from './Playlist'
import './App.css';

function App() {

  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      console.log(json.access_token);
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
      { (token === '') ? <Login/> : <Playlist token={token} /> }
    </>
  );
}

export default App;
