import React, { useContext } from 'react';
import VideoTrack from '../VideoTrack';
import { ConferenceContext } from '../../../providers/context';

const LocalVideo: React.FC<any> = (props) => {
  const { localStream } = useContext(ConferenceContext);

  return <VideoTrack stream={localStream} />;
};

export default LocalVideo;
