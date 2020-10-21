import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';

import { Dropdown } from 'semantic-ui-react';
import ChevronRight from '../../../../icons/ChevronRight.icon';
import Lowerhands from '../../../../icons/Lowerhands.icon';
import Raisehands from '../../../../icons/Raisehands.icon';
import Ellipsis from '../../../../icons/Ellipsis.icon';
import CredentialsService from '../../../../services/CredentialsService';
import useCallbackRef from '../../../../hooks/useCallbackRef';
import utils from '../../../../utils';

import './Students.styles.scss';
import { ClassRoomContext } from '../../../../providers/context';

type Props = {};
const Students: React.FC<Props> = () => {
  const { students, roomId } = useContext(ClassRoomContext);
  const { isHost, participant: currentParticipant } = CredentialsService;
  const [participantsEl, participantsRef] = useCallbackRef<HTMLDivElement>();

  const [width, setMaxWidth] = useState(0);
  const isFirstRun = useRef(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showRaisedHands, setShowRaisedHands] = useState(!isHost);

  useEffect(() => {
    if (participantsEl)
      setMaxWidth((16 / 9) * (participantsEl.clientHeight - 8));
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

  // useEffect(() => {
  //   setShowRaisedHands(!(isHost || currentParticipant.hasRaisedHand));
  // }, [isHost, currentParticipant]);

  // const handleHandRaiseClick = useCallback(() => {
  //   if (isHost) {
  //     api.experience.participants.editAll(roomId, {
  //       hasRaisedHand: false,
  //       isAudioEnabled: false,
  //     });
  //     return;
  //   }

  //   if (currentParticipant) {
  //     setShowRaisedHands(currentParticipant.hasRaisedHand);
  //     api.experience.participants.edit(roomId, currentParticipant._id, {
  //       hasRaisedHand: !currentParticipant.hasRaisedHand,
  //     });
  //   }
  // }, [isHost, roomId, currentParticipant]);

  return (
    <>
      <div className={classes}>
        <div className="handraise">
          <button
          // disabled={
          //   isHost &&
          //   (!joinedParticipants.length ||
          //     !joinedParticipants[0].hasRaisedHand)
          // }
          // onClick={handleHandRaiseClick}
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
          {joinedParticipants.map((student, ind) => (
            <div className="student__item" key={ind}>
              {isHost && (
                <Dropdown
                  className="student__context-menu"
                  icon={null}
                  lazyLoad
                  trigger={
                    <button>
                      <Ellipsis />
                    </button>
                  }
                >
                  <Dropdown.Menu className="left">
                    <Dropdown.Item>Warn user</Dropdown.Item>
                    <Dropdown.Item> Kick User</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {/* <UserCamera
                experienceParticipant={student}
                showStreamControls={
                  isHost || CredentialsService.participantId === student._id
                }
                userType="student"
              /> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Students;
