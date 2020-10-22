import React, { useEffect, useMemo, useContext, useRef } from 'react';
import './VideoTrack.styles.scss';
import classNames from 'classnames';
import StreamControls from './components/StreamControls';
import { StreamControlProps } from './components/StreamControls/StreamControls.component';
import CredentialsService from '../../../services/CredentialsService';
import { ClassRoomContext } from '../../../providers/context';
import toastr from 'toastr';
import { Participant } from '../../../models/room';
import useCallbackRef from '../../../hooks/useCallbackRef';
import api from '../../../api';

interface VideoTrackProps {
  currentParticipant: Participant;
  stream: MediaStream;
  isLocal: boolean;
}

const VideoTrack: React.FC<VideoTrackProps> = ({
  stream,
  currentParticipant,
  isLocal,
}) => {
  const { roomId } = useContext(ClassRoomContext);
  const { isHost } = CredentialsService;
  const lastAudioEnabled = useRef(currentParticipant.isAudioEnabled);
  const [audioRef, setAudioRef] = useCallbackRef<HTMLVideoElement>();
  const [videoRef, setVideoRef] = useCallbackRef<HTMLVideoElement>();

  const audioStream = useMemo(() => {
    if (!stream || currentParticipant.isAudioEnabled === false) return null;
    const clonedStream = stream.clone();
    clonedStream.getVideoTracks().forEach((videoTrack) => {
      clonedStream.removeTrack(videoTrack);
    });
    return clonedStream;
  }, [stream, currentParticipant]);

  const videoStream = useMemo(() => {
    if (!stream || currentParticipant.isVideoEnabled === false) return null;
    const clonedStream = stream.clone();
    clonedStream.getAudioTracks().forEach((audioTrack) => {
      clonedStream.removeTrack(audioTrack);
    });
    return clonedStream;
  }, [stream, currentParticipant]);

  useEffect(() => {
    if (videoRef && videoStream) {
      videoRef.srcObject = videoStream;
    }
  }, [videoRef, videoStream]);

  useEffect(() => {
    if (audioRef && audioStream) {
      audioRef.srcObject = audioStream;
    }
  }, [audioRef, audioStream]);

  // TODO when participant gets controll show him
  // useEffect(() => {
  //   if (isHost || !isLocal) return;
  //   if (currentParticipant.isAudioEnabled !== lastAudioEnabled.current) {
  //     lastAudioEnabled.current = currentParticipant.isAudioEnabled;
  //     if (currentParticipant.isAudioEnabled) {
  //       toastr.info('You now have control.');
  //     }
  //   }
  // }, [isHost, isLocal, currentParticipant]);

  const style = useMemo(() => {
    return isLocal
      ? `
        .video--init {
          transform-origin: top left;
          rotateY(180deg) translateX(-100%);
        }
      `
      : '';
  }, [isLocal]);

  const showControls = useMemo(() => {
    return isLocal !== isHost;
  }, [isLocal, isHost]);

  const controls = useMemo(() => {
    let streamControlProps: StreamControlProps;
    if (showControls) {
      const toggleMicEnabled = () => {
        const updateBody = {
          isAudioEnabled: !currentParticipant.isAudioEnabled,
        } as Partial<Participant>;

        if (currentParticipant.isAudioEnabled) {
          updateBody.hasControl = false;
        }

        api.rooms.updateRoomsCustomer(
          roomId,
          currentParticipant.user._id,
          updateBody,
        );
      };

      const toggleVideoEnabled = () => {
        api.rooms.updateRoomsCustomer(roomId, currentParticipant.user._id, {
          isVideoEnabled: !currentParticipant.isVideoEnabled,
        });
      };

      const safeExperienceParticipant = {
        isAudioEnabled: true,
        isVideoEnabled: true,
        hasControl: false,
        ...currentParticipant,
      };

      streamControlProps = {
        isVideoEnabled: safeExperienceParticipant.isVideoEnabled,
        isAudioEnabled: safeExperienceParticipant.isAudioEnabled,
      };

      if (isHost) {
        if (!isLocal) {
          streamControlProps.toggleMicEnabled = toggleMicEnabled;
          streamControlProps.toggleVideoEnabled = toggleVideoEnabled;
        }
      } else {
        if (isLocal) {
          streamControlProps.disableVideoControl = true;
          streamControlProps.disableVideoControlReason =
            'Host can control your camera.';
          streamControlProps.disableMicControl = true;
          streamControlProps.disableMicControlReason =
            'Raise a hand when host asks to get chance to talk';
        }
      }
    }

    return (
      <div className="stream-controls">
        {showControls && <StreamControls {...streamControlProps} />}
      </div>
    );
  }, [showControls, isLocal, currentParticipant, isHost, roomId]);

  const participantStatus = useMemo(() => {
    if (!currentParticipant) return 'muted';
    return 'muted';
    if (currentParticipant.isAudioEnabled) {
      return 'talking';
    }
    if (currentParticipant.hasControl) {
      return 'raised-hand';
    }
    return 'muted';
  }, [currentParticipant]);

  const userBorderClass = useMemo(() => {
    if (isLocal || participantStatus === 'muted') return null;
    return participantStatus === 'raised-hand'
      ? 'hand-raise'
      : 'hand-raise--accepted';
  }, [isLocal, participantStatus]);

  const videoClasses = classNames([
    'user-stream',
    {
      'user-stream--mirrored': isLocal,
    },
  ]);

  const wrapperClasses = classNames([userBorderClass, 'vt-wrapper']);

  return (
    <div className={wrapperClasses}>
      <style>{style}</style>
      {!isLocal && audioStream && (
        <video autoPlay style={{ display: 'none' }} ref={setAudioRef} />
      )}
      {videoStream ? (
        <video
          autoPlay
          ref={setVideoRef}
          className={videoClasses}
          poster="/assets/gifs/loading.gif"
        />
      ) : (
        <img alt={'Camera off'} />
      )}
      {controls}
    </div>
  );
};

export default VideoTrack;
