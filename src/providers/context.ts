import { Participant, Room } from './../models/room';
import { createContext } from 'react';

type ClassRoomContextProps = {
  roomId: string;
  room: Room;
  host: Participant;
  students: Participant[];
  participants: Participant[];
};

export const ClassRoomContext = createContext<Partial<ClassRoomContextProps>>({
  students: [],
  participants: [],
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
