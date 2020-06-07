import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { history } from './common/history';
import ClassRoomPage from './pages/ClassRoomPage';
import CredentialsService from './services/CredentialsService';
import api from './api';
import { SocketService } from './services/SocketService';
import 'webrtc-adapter';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await api.auth.login({
        username:localStorage.getItem('username') || 'admin',
        password:'asdlolasd'
      });
      CredentialsService.saveAuthBody(data);
      SocketService.connect();
      setIsLoading(false);
    };
    init();
    return ()=>{
      SocketService.disconnect();
    }
  }, [setIsLoading]);

  return isLoading ? (
    <p>Loading..</p>
  ) : (
    <Router history={history}>
      <Switch>
        <Route path="/class-room/:roomName" exact component={ClassRoomPage} />
        <Route path="" exact render={() => <Redirect to="/class-room/maths" />} />
      </Switch>
    </Router>
  );
}

export default App;
