import { useCallback, useEffect, useState, useMemo } from 'react';

export default function useLocalMedia(
  isAudioEnabled: boolean,
  isVideoEnabled: boolean,
) {
  const [localVideoTrack, setVideoTrack] = useState<MediaStreamTrack>();
  const [localAudioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [localTracks, setTracks] = useState<MediaStreamTrack[]>();
  const [localStream, setStream] = useState<MediaStream>();
  const [isMediaLoaded, setIsMediaLoaded] = useState<boolean>(false);

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
        const videoTrack = mediaStream.getVideoTracks()[0];
        const audioTrack = mediaStream.getAudioTracks()[0];

        setVideoTrack(videoTrack);
        setAudioTrack(audioTrack);

        setTracks(mediaStream.getTracks());
        setStream(mediaStream);
      })
      .catch((err) => {
        console.log(err);
        return null;
      })
      .then(() => {
        if (!isMediaLoaded) {
          setIsMediaLoaded(true);
        }
      });
  }, [isMediaLoaded]);

  useEffect(() => {
    getLocalStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localAudioTrack) {
      localAudioTrack.enabled = isAudioEnabled;
    }
  }, [localAudioTrack, isAudioEnabled]);

  useEffect(() => {
    if (localVideoTrack) {
      console.log(isVideoEnabled);
      localVideoTrack.enabled = isVideoEnabled;
    }
  }, [localVideoTrack, isVideoEnabled]);

  const isAudioAvailable = useMemo(() => !!localAudioTrack, [localAudioTrack]);
  const isVideoAvailable = useMemo(() => !!localVideoTrack, [localVideoTrack]);

  return {
    localTracks,
    localVideoTrack,
    localAudioTrack,
    localStream,
    isMediaLoaded,
    isAudioAvailable,
    isVideoAvailable,
  };
}
