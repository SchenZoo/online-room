import { User } from './../models/user';
import { Room } from './../models/room';
import { createContext } from 'react';

type ClassRoomContextProps = {
  room: Room;
  roomUsers: User[];
};

export const ClassRoomContext = createContext<Partial<ClassRoomContextProps>>({
  roomUsers: [],
});

type ConferenceContextProps = {
  streams: {
    [key: string]: readonly MediaStream[];
  };
  localStream?: MediaStream;
  addPeerConnection: (key: string) => void;
  removePeerConnection: (key: string) => void;
};

export const ConferenceContext = createContext<ConferenceContextProps>({
  streams: {},
  addPeerConnection: () => {},
  removePeerConnection: () => {},
});
