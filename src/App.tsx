import React, { useState, useEffect } from 'react';
import CredentialsService from './services/CredentialsService';
import api from './api';
import 'webrtc-adapter';
import Meet from './pages/Meet';
import { Loader } from 'semantic-ui-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState<string>();

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const { data } = await api.auth.loginWithToken(token);
      setRoomId(data.roomId);
      CredentialsService.saveAuthBody(data);
      setIsLoading(false);
    };
    init();
  }, [setIsLoading]);

  return isLoading ? <Loader active /> : <Meet roomId={roomId} />;
}

export default App;
