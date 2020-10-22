import React, { useMemo, EventHandler, MouseEvent } from 'react';
import { Popup } from 'semantic-ui-react';
import CameraIcon from '../../../../../icons/Camera.icon';
import MicrophoneIcon from '../../../../../icons/Microphone.icon';
export type StreamControlProps = Partial<{
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  disableMicControl?: boolean;
  disableMicControlReason?: string;
  disableVideoControl?: boolean;
  disableVideoControlReason?: string;
  toggleMicEnabled: EventHandler<MouseEvent<HTMLButtonElement>>;
  toggleVideoEnabled: EventHandler<MouseEvent<HTMLButtonElement>>;
}>;

const StreamControls = (props: StreamControlProps) => {
  const {
    isAudioEnabled,
    isVideoEnabled,
    disableMicControl,
    disableMicControlReason,
    disableVideoControl,
    disableVideoControlReason,
  } = props;

  const micButton = useMemo(
    () => (
      <button
        onClick={(ev) => {
          // if (!disableMicControl) toggleMicEnabled(ev);
        }}
      >
        <MicrophoneIcon crossed={!isAudioEnabled} />
      </button>
    ),
    [isAudioEnabled],
  );

  const cameraButton = useMemo(
    () => (
      <button
        onClick={(ev) => {
          // if (!disableVideoControl) toggleVideoEnabled(ev);
        }}
      >
        <CameraIcon crossed={!isVideoEnabled} />
      </button>
    ),
    [isVideoEnabled],
  );

  const micButtonFinal = useMemo(() => {
    if (disableMicControl) {
      return (
        <Popup
          inverted
          position="top left"
          pinned={true}
          className="reachabl-tooltip controls"
          offset={[20]}
          trigger={micButton}
        >
          {disableMicControlReason}
        </Popup>
      );
    } else return micButton;
  }, [disableMicControl, disableMicControlReason, micButton]);

  const cameraButtonFinal = useMemo(() => {
    if (disableVideoControl) {
      return (
        <Popup
          inverted
          position="top left"
          pinned={true}
          className="reachabl-tooltip controls"
          offset={[20]}
          trigger={cameraButton}
        >
          {disableVideoControlReason}
        </Popup>
      );
    } else return cameraButton;
  }, [disableVideoControl, disableVideoControlReason, cameraButton]);

  return (
    <div>
      {cameraButtonFinal}
      {micButtonFinal}
    </div>
  );
};

StreamControls.defaultProps = {
  disableMicControlReason:
    'You cannot turn on microphone because host turned it off',
  disableVideoControlReason:
    'You cannot turn on camera because host turned it off',
};

export default StreamControls;
