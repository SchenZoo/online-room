import React from 'react';
import ClassRoomProvider from '../../providers/ClassRoomProvider';
import ConferenceProvider from '../../providers/ConferenceProvider';
import Students from './components/Students';
import Host from './components/Host';
import './Meet.styles.scss';

interface Props {
  roomId: string;
}

const MeetPage = (props: Props) => {
  return (
    <ConferenceProvider>
      <ClassRoomProvider {...props}>
        <div className="meet">
          {/* <Whiteboard /> */}
          <Host />
          <Students />
        </div>
      </ClassRoomProvider>
    </ConferenceProvider>
  );
};

export default MeetPage;
