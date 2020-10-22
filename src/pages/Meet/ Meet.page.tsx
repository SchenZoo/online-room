import React from 'react';
import ClassRoomProvider from '../../providers/ClassRoomProvider';
import ConferenceProvider from '../../providers/ConferenceProvider';
import Students from './components/Students';
import Host from './components/Host';
import './Meet.styles.scss';
import Whiteboard from './components/Whiteboard';
import Header from './components/Header';
import Chat from './components/Chat';

interface Props {
  roomId: string;
}

const MeetPage = (props: Props) => {
  return (
    <ConferenceProvider>
      <ClassRoomProvider {...props}>
        <div className="meet">
          <Header />
          <Whiteboard />
          <div className="right">
            <Host />
            <Chat />
          </div>
          <Students />
        </div>
      </ClassRoomProvider>
    </ConferenceProvider>
  );
};

export default MeetPage;
