import React, { useEffect, useMemo, useContext } from 'react';
import './VideoTrack.styles.scss';
import classNames from 'classnames';
import StreamControls from './components/StreamControls';
import { StreamControlProps } from './components/StreamControls/StreamControls.component';
import CredentialsService from '../../../services/CredentialsService';
import { ClassRoomContext } from '../../../providers/context';
import { Participant } from '../../../models/room';
import useCallbackRef from '../../../hooks/useCallbackRef';
import api from '../../../api';

interface VideoTrackProps {
  currentParticipant: Participant;
  stream: MediaStream;
  isLocal: boolean;
  userType: 'host' | 'student';
}

const VideoTrack: React.FC<VideoTrackProps> = ({
  stream,
  currentParticipant,
  isLocal,
  userType,
}) => {
  const { roomId } = useContext(ClassRoomContext);
  const { isHost } = CredentialsService;
  // const lastAudioEnabled = useRef(currentParticipant?.isAudioEnabled);
  const [videoRef, setVideoRef] = useCallbackRef<HTMLVideoElement>();
  const { user: { name } = { name: 'Some name' } } = currentParticipant || {};

  const videoDescription = useMemo(
    () => (userType === 'host' ? `Professor: ${name}` : `${name}`),
    [name, userType],
  );

  useEffect(() => {
    if (videoRef && stream) {
      videoRef.srcObject = stream;
      videoRef.muted = isLocal;
    }
  }, [videoRef, stream, isLocal]);

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

      const safeParticipant = {
        isAudioEnabled: true,
        isVideoEnabled: true,
        hasControl: false,
        ...currentParticipant,
      };

      streamControlProps = {
        isVideoEnabled: safeParticipant.isVideoEnabled,
        isAudioEnabled: safeParticipant.isAudioEnabled,
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
        {videoDescription && <span>{videoDescription}</span>}
        {showControls && <StreamControls {...streamControlProps} />}
      </div>
    );
  }, [
    showControls,
    videoDescription,
    currentParticipant,
    isHost,
    roomId,
    isLocal,
  ]);

  const participantStatus = useMemo(() => {
    if (!currentParticipant) return 'muted';
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
      {stream && (
        <video
          autoPlay={true}
          muted={isLocal}
          ref={setVideoRef}
          className={videoClasses}
          poster="/assets/gifs/loading.gif"
        />
      )}
      {controls}
    </div>
  );
};

export default VideoTrack;
