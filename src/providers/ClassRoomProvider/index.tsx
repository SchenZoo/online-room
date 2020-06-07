import React, { useState, useEffect, useContext } from 'react';
import { ClassRoomContext, ConferenceContext } from '../context';
import { Room } from '../../models/room';
import api from '../../api';
import { User } from '../../models/user';
import CredentialsService from '../../services/CredentialsService';
import { SocketService } from '../../services/SocketService';
import { SocketEventNames } from '../../enums/SocketEventNames';
import toastr from 'toastr';

interface Props {
  roomName: string;
}

const ClassRoomProvider: React.FC<Props> = (props) => {
  const { children, roomName } = props;
  const { addPeerConnection, removePeerConnection } = useContext(
    ConferenceContext,
  );
  const [room, setRoom] = useState<Room>();
  const [roomId, setRoomId] = useState<string>();
  const [roomUsers, setRoomUsers] = useState<User[]>([]);

  useEffect(() => {
    if (roomName) {
      const loadRoom = async () => {
        try {
          const { data: room } = await api.rooms.joinRoom(roomName);
          setRoom(room);
          setRoomUsers(room.users);
          setRoomId(room._id);
        } catch (err) {
          toastr.error(err.response.data.message);
          setRoom(null);
        }
      };
      loadRoom();
    }
  }, [roomName]);

  useEffect(() => {
    const onUserJoinRoom = (data: { roomId: string; user: User }) => {
      if (
        roomId === data.roomId &&
        CredentialsService.userid !== data.user._id
      ) {
        console.log('user joined', data);
        setRoomUsers([...roomUsers, data.user]);
        addPeerConnection(data.user._id);
      }
    };

    const onUserLeaveRoom = (leftUserId: string) => {
      if (roomUsers.some((user) => user._id === leftUserId)) {
        setRoomUsers(
          roomUsers.filter((roomUser) => roomUser._id !== leftUserId),
        );
        removePeerConnection(leftUserId);
      }
    };
    SocketService.addListener(
      SocketEventNames.ROOM_USER_JOINED,
      onUserJoinRoom,
    );
    SocketService.addListener(SocketEventNames.ROOM_USER_LEFT, onUserLeaveRoom);
    SocketService.addListener(
      SocketEventNames.USER_DISCONNECTED,
      onUserLeaveRoom,
    );
    return () => {
      SocketService.removeListener(
        SocketEventNames.ROOM_USER_JOINED,
        onUserJoinRoom,
      );
      SocketService.removeListener(
        SocketEventNames.ROOM_USER_LEFT,
        onUserLeaveRoom,
      );
      SocketService.removeListener(
        SocketEventNames.USER_DISCONNECTED,
        onUserLeaveRoom,
      );
    };
  }, [
    roomId,
    roomUsers,
    setRoomUsers,
    addPeerConnection,
    removePeerConnection,
  ]);

  return (
    <ClassRoomContext.Provider value={{ room, roomUsers }}>
      {room === undefined ? 'Loading...' : room && children}
    </ClassRoomContext.Provider>
  );
};

ClassRoomProvider.defaultProps = {};

export default ClassRoomProvider;
