import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';

import ChevronRight from '../../../../icons/ChevronRight.icon';
import Lowerhands from '../../../../icons/Lowerhands.icon';
import Raisehands from '../../../../icons/Raisehands.icon';
import CredentialsService from '../../../../services/CredentialsService';
import useCallbackRef from '../../../../hooks/useCallbackRef';
import utils from '../../../../utils';

import './Students.styles.scss';
import {
  ClassRoomContext,
  ConferenceContext,
} from '../../../../providers/context';
import VideoTrack from '../../../../components/conference/VideoTrack';
import api from 'api';

type Props = {};
const Students: React.FC<Props> = () => {
  const {
    students,
    roomId,
    room: { allowOvertaking },
    currentStudent: currentParticipant,
  } = useContext(ClassRoomContext);
  const { streams, localStream } = useContext(ConferenceContext);
  const { isHost } = CredentialsService;
  const [participantsEl, participantsRef] = useCallbackRef<HTMLDivElement>();

  const [width, setMaxWidth] = useState(0);
  const isFirstRun = useRef(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showRaisedHands, setShowRaisedHands] = useState(!isHost);

  useEffect(() => {
    if (participantsEl) {
      setMaxWidth((16 / 9) * (participantsEl.clientHeight - 50));
    }
  }, [participantsEl]);

  useEffect(() => {
    if (participantsEl) {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        const el = participantsEl;
        setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth);
        setShowLeftArrow(el.scrollLeft > 0);
      }

      const handler = utils.debounce((event: Event) => {
        const el = event.target as HTMLDivElement;

        setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth);
        setShowLeftArrow(el.scrollLeft > 0);
      }, 50);

      participantsEl.addEventListener('scroll', handler);
      return () => {
        participantsEl.removeEventListener('scroll', handler);
      };
    }
  }, [participantsEl]);

  const scrollHorizontal = useCallback(
    (times: number, isLeft = false) => {
      participantsEl.scrollTo({
        behavior: 'smooth',
        left:
          participantsEl.scrollLeft + (isLeft ? -times * width : times * width),
      });
    },
    [participantsEl, width],
  );

  const classes = classNames(['students']);

  const joinedParticipants = useMemo(
    () => students.filter((p) => p.hasJoined),
    [students],
  );

  useEffect(() => {
    setShowRaisedHands(
      isHost ? !allowOvertaking : !currentParticipant?.hasRequestedControl,
    );
  }, [isHost, allowOvertaking, currentParticipant]);

  const handleHandRaiseClick = useCallback(() => {
    if (isHost) {
      api.rooms.updateRoom(roomId, {
        allowOvertaking: !allowOvertaking,
      });
    } else {
      api.rooms.takeControl(roomId, !currentParticipant?.hasControl);
    }
  }, [isHost, roomId, allowOvertaking, currentParticipant]);

  return (
    <>
      <div className={classes}>
        <div className="handraise">
          <button
            onClick={handleHandRaiseClick}
            disabled={!isHost && !allowOvertaking}
          >
            {!showRaisedHands ? <Lowerhands /> : <Raisehands />}
          </button>
        </div>
        <div className="student-list" ref={participantsRef}>
          {showLeftArrow && (
            <button
              onClick={() => scrollHorizontal(2, true)}
              className="student-list__scroll student-list__scroll--left"
            >
              <ChevronRight />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scrollHorizontal(2)}
              className="student-list__scroll student-list__scroll--right"
            >
              <ChevronRight />
            </button>
          )}
          <style>
            {`
          .students {
              --flexWidth: ${width}px;
          }`}
          </style>
          {joinedParticipants.map((participant, ind) => (
            <div className="student__item" key={ind}>
              <VideoTrack
                currentParticipant={participant}
                isLocal={participant.user._id === currentParticipant?.user._id}
                stream={
                  participant.user._id === currentParticipant?.user._id
                    ? localStream
                    : streams[participant.user._id]?.[0]
                }
                userType="student"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Students;
