import React, { useContext, useMemo } from 'react';
import {
  ClassRoomContext,
  ConferenceContext,
} from '../../../providers/context';
import CredentialsService from '../../../services/CredentialsService';
import VideoTrack from '../VideoTrack';

const OthersVideos: React.FC<any> = (props) => {
  const { roomUsers } = useContext(ClassRoomContext);
  const { streams } = useContext(ConferenceContext);

  const filteredRoomUsers = useMemo(
    () =>
      roomUsers.filter(
        (roomUser) => roomUser._id !== CredentialsService.userid,
      ),
    [roomUsers],
  );

  return (
    <div>
      {filteredRoomUsers.map((roomUser) => (
        <VideoTrack key={roomUser._id} stream={(streams[roomUser._id] || [])[0]} />
      ))}
    </div>
  );
};

export default OthersVideos;
