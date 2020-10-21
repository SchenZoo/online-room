import React from 'react';
import LocalVideo from '../../components/conference/LocalVideo';
import Whiteboard from '../../components/UI/Whiteboard';
import ClassRoomProvider from '../../providers/ClassRoomProvider';
import ConferenceProvider from '../../providers/ConferenceProvider';
import Students from './components/Students';
import './Meet.styles.scss';

interface Props {
  roomId: string;
}

const MeetPage = (props: Props) => {
  return (
    <ConferenceProvider>
      <ClassRoomProvider {...props}>
        <div className="meet">
          <Whiteboard />
          <LocalVideo />
          <Students />
        </div>
      </ClassRoomProvider>
    </ConferenceProvider>
  );
};

export default MeetPage;
