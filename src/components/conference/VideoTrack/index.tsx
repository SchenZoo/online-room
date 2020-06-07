import React, { useEffect } from 'react';
import useCallbackRef from '../../../hooks/useCallbackRef';

export type LocalVideoProps = {
  stream?: MediaStream;
};

const VideoTrack: React.FC<LocalVideoProps> = (props) => {
  const { stream } = props;
  const [videoRef, setVideoRef] = useCallbackRef<HTMLVideoElement>();

  useEffect(() => {
    if (videoRef && stream) {
      videoRef.srcObject = stream;
    }
  }, [videoRef, stream]);
  return stream ? (
    <video autoPlay muted ref={setVideoRef}></video>
  ) : (
    <p>User has no media</p>
  );
};

export default VideoTrack;
