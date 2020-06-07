import React from 'react';
import ClassRoomProvider from '../../providers/ClassRoomProvider';
import ConferenceProvider from '../../providers/ConferenceProvider';
import LocalVideo from '../../components/conference/LocalVideo';
import CredentialsService from '../../services/CredentialsService';
import OthersVideos from '../../components/conference/OthersVideos';

const ClassRoomPage: React.FC<any> = (props) => {
  const {
    match: {
      params: { roomName },
    },
  } = props;

  return (
    <ConferenceProvider>
      <ClassRoomProvider roomName={roomName}>
        <div>
          <h1>Welcome to class room: {roomName} ({CredentialsService.userid})</h1>
          <LocalVideo/>
          <OthersVideos/>
        </div>
      </ClassRoomProvider>
    </ConferenceProvider>
  );
};

export default ClassRoomPage;
