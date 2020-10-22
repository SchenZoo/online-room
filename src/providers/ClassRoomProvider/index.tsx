import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ClassRoomContext, ConferenceContext } from '../context';
import { Participant, Room } from '../../models/room';
import toastr from 'toastr';
import roomSocketService from '../../services/socket/roomSocketService';
import SocketEventNames from '../../enums/SocketEventNames';
import { Loader } from 'semantic-ui-react';
import CredentialsService from '../../services/CredentialsService';

interface Props {
  roomId: string;
}

const ClassRoomProvider: React.FC<Props> = (props) => {
  const { children, roomId } = props;
  const {
    addPeerConnection,
    removePeerConnection,
    setIsVideoEnabled,
    setIsAudioEnabled,
  } = useContext(ConferenceContext);

  const [room, setRoom] = useState<Room>();
  const [host, setHost] = useState<Participant>();
  const [students, setStudents] = useState<Participant[]>([]);

  const participants = useMemo(() => [host, ...students], [host, students]);

  const currentStudent = useMemo(
    () =>
      students.find(
        (student) => student.user._id === CredentialsService.userid,
      ),
    [students],
  );

  useEffect(() => {
    if (CredentialsService.isHost) {
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
    } else {
      if (currentStudent) {
        setIsVideoEnabled(currentStudent.isVideoEnabled);
        setIsAudioEnabled(currentStudent.isAudioEnabled);
      }
    }
  }, [currentStudent, setIsAudioEnabled, setIsVideoEnabled]);

  useEffect(() => {
    if (roomId) {
      const loadRoom = async () => {
        try {
          const { room } = await roomSocketService.connect(roomId);
          setHost(room.host);
          setStudents(room.customers);
          setRoom(room);
        } catch (err) {
          toastr.error(err.message);
          setRoom(null);
        }
      };
      loadRoom();

      return () => {
        roomSocketService.disconnect();
      };
    }
  }, [roomId]);

  useEffect(() => {
    const onUserJoinRoom = (data: { participant: Participant }) => {
      addPeerConnection(data.participant.user._id);
    };

    const onUserLeaveRoom = (leftUserId: string) => {
      removePeerConnection(leftUserId);
    };

    const onParticipantChange = (data: { room: Room }) => {
      const {
        room: { customers },
      } = data;
      setStudents(customers);
    };

    const onHostChange = (data: { room: Room }) => {
      const {
        room: { host },
      } = data;
      setHost(host);
    };

    const onOvertakeChange = (data: { room: Room }) => {
      const { room } = data;
      setRoom(room);
    };

    roomSocketService.addListener(
      SocketEventNames.ROOM_PARTICIPANT_JOINED,
      onUserJoinRoom,
    );
    roomSocketService.addListener(
      SocketEventNames.ROOM_PARTICIPANT_LEFT,
      onUserLeaveRoom,
    );

    roomSocketService.addListener(
      SocketEventNames.ROOM_PARTICIPANT_CHANGED,
      onParticipantChange,
    );

    roomSocketService.addListener(
      SocketEventNames.ROOM_OVERTAKING_CHANGED,
      onOvertakeChange,
    );

    roomSocketService.addListener(
      SocketEventNames.ROOM_HOST_CHANGED,
      onHostChange,
    );

    return () => {
      roomSocketService.removeListener(
        SocketEventNames.ROOM_PARTICIPANT_JOINED,
        onUserJoinRoom,
      );
      roomSocketService.removeListener(
        SocketEventNames.ROOM_PARTICIPANT_LEFT,
        onUserLeaveRoom,
      );

      roomSocketService.removeListener(
        SocketEventNames.ROOM_PARTICIPANT_CHANGED,
        onParticipantChange,
      );

      roomSocketService.removeListener(
        SocketEventNames.ROOM_HOST_CHANGED,
        onHostChange,
      );

      roomSocketService.removeListener(
        SocketEventNames.ROOM_OVERTAKING_CHANGED,
        onOvertakeChange,
      );
    };
  }, [roomId, students, setStudents, addPeerConnection, removePeerConnection]);

  return (
    <ClassRoomContext.Provider
      value={{ roomId, room, host, students, participants }}
    >
      {room === undefined ? <Loader active /> : room && children}
    </ClassRoomContext.Provider>
  );
};

ClassRoomProvider.defaultProps = {};

export default ClassRoomProvider;
