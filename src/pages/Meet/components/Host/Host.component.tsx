import React, { useContext } from 'react';
import CredentialsService from '../../../../services/CredentialsService';

import {
  ClassRoomContext,
  ConferenceContext,
} from '../../../../providers/context';
import VideoTrack from '../../../../components/conference/VideoTrack';

type Props = {};
const Host: React.FC<Props> = () => {
  const { host } = useContext(ClassRoomContext);
  const { streams, localStream } = useContext(ConferenceContext);
  const { isHost } = CredentialsService;

  return (
    <VideoTrack
      currentParticipant={host}
      isLocal={isHost}
      stream={isHost ? localStream : streams[host.user._id]?.[0]}
    />
  );
};

export default Host;
