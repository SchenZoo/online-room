// import React, { useEffect } from 'react';
// import useCallbackRef from '../../../hooks/useCallbackRef';

// export type LocalVideoProps = {
//   stream?: MediaStream;
// };

// const VideoTrack: React.FC<LocalVideoProps> = (props) => {
//   const { stream } = props;
//   const [videoRef, setVideoRef] = useCallbackRef<HTMLVideoElement>();

//   useEffect(() => {
//     if (videoRef && stream) {
//       videoRef.srcObject = stream;
//     }
//   }, [videoRef, stream]);
//   return stream ? (
//     <video autoPlay muted ref={setVideoRef}></video>
//   ) : (
//     <p>User has no media</p>
//   );
// };

// export default VideoTrack;

import React, { useEffect, useMemo, useContext, useRef } from 'react';
import './VideoTrack.styles.scss';
import classNames from 'classnames';
import StreamControls from './components/StreamControls';
import { StreamControlProps } from './components/StreamControls/StreamControls.component';
import CredentialsService from '../../../services/CredentialsService';
import { ClassRoomContext } from '../../../providers/context';
import toastr from 'toastr';
import { Participant } from '../../../models/room';

interface VideoTrackProps {
  isLocal: boolean;
  currentParticipant: Participant;
  stream: MediaStream;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

export type VideoTrackRef = {
  setIsVideoFullScreen: (value: boolean) => void;
};

const VideoTrack: React.RefForwardingComponent<
  VideoTrackRef,
  VideoTrackProps
> = ({
  stream,
  currentParticipant,
  isLocal,
  hasAudio = true,
  hasVideo = true,
}) => {
  const { roomId } = useContext(ClassRoomContext);
  const { isHost } = CredentialsService;
  const lastAudioEnabled = useRef(currentParticipant.isAudioEnabled);

  useEffect(() => {
    if (isHost || !isLocal) return;
    if (currentParticipant.isAudioEnabled !== lastAudioEnabled.current) {
      lastAudioEnabled.current = currentParticipant.isAudioEnabled;
      if (currentParticipant.isAudioEnabled) {
        toastr.info('You now have control.');
      }
    }
  }, [isHost, isLocal, currentParticipant]);

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
    return isLocal || isHost;
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

        // api.experience.participants.edit(
        //   roomId,
        //   currentParticipant._id,
        //   updateBody,
        // );
      };

      const toggleVideoEnabled = () => {
        // api.experience.participants.edit(
        //   roomId,
        //   currentParticipant._id,
        //   { isVideoEnabled: !currentParticipant.isVideoEnabled },
        // );
      };

      const safeExperienceParticipant = currentParticipant || {
        isAudioEnabled: false,
        isVideoEnabled: true,
        hasControl: false,
      };

      streamControlProps = isHost
        ? !isLocal && {
            toggleMicEnabled,
            toggleVideoEnabled,
            isVideoEnabled: hasVideo,
            isAudioEnabled: hasAudio,
            disableVideoControl:
              !hasVideo && safeExperienceParticipant.isVideoEnabled,
            disableVideoControlReason: !safeExperienceParticipant.isVideoEnabled
              ? 'You disabled camera.'
              : 'User turned off the camera himself you cannot activate it.',
            disableMicControl:
              !hasAudio && !safeExperienceParticipant.hasControl,
            disableMicControlReason: !safeExperienceParticipant.hasControl
              ? 'User must raise hand before you enable his mic.'
              : 'User muted himself you cannot unmute him.',
          }
        : isLocal && {
            isAudioEnabled: hasAudio,
            isVideoEnabled: hasVideo,
            disableVideoControl: !safeExperienceParticipant.isVideoEnabled,
            disableVideoControlReason: 'Host turned off your camera.',
            disableMicControl: !safeExperienceParticipant.isAudioEnabled,
            disableMicControlReason: 'Raise a hand to get a word',
          };
    }
    return (
      <div className="stream-controls">
        {showControls && <StreamControls {...streamControlProps} />}
      </div>
    );
  }, [showControls, isLocal, hasVideo, hasAudio, currentParticipant, isHost]);

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
      {stream && hasVideo ? (
        <video className={videoClasses} poster="/assets/gifs/loading.gif" />
      ) : (
        <img src="/assets/images/logo.png" alt={'customer4'} />
      )}
      {controls}
    </div>
  );
};

export default VideoTrack;
