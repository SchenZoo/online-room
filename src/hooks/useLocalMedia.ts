import { useCallback, useEffect, useState } from 'react';

export default function useLocalMedia() {
  const [localVideoTrack, setVideoTrack] = useState<MediaStreamTrack>();
  const [localAudioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [localTracks, setTracks] = useState<MediaStreamTrack[]>();
  const [localStream, setStream] = useState<MediaStream>();

  const getLocalStream = useCallback(async () => {
    const defaultVideoOptions: MediaTrackConstraints = {
      height: 1080,
      width: 1920,
    };
    const defaultAudioOptions: MediaTrackConstraints = {};

    const media = navigator.mediaDevices.getUserMedia({
      audio: defaultAudioOptions,
      video: defaultVideoOptions,
    }) as Promise<MediaStream>;

    return media
      .then((mediaStream) => {
        setVideoTrack(mediaStream.getVideoTracks()[0]);
        setAudioTrack(mediaStream.getAudioTracks()[0]);
        setTracks(mediaStream.getTracks());
        setStream(mediaStream);
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }, []);

  useEffect(() => {
    getLocalStream();
  }, [getLocalStream]);

  useEffect(() => {
    if (localTracks) {
      // :TODO emit to stop peer connection and display
      const handleStopped = () => console.log('track stopped');
      localTracks.forEach((track) => {
        track.onended = handleStopped;
      });
    }
  }, [localTracks]);

  return { localTracks, localVideoTrack, localAudioTrack, localStream };
}
