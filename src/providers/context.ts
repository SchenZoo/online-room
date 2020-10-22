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
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isAudioAvailable: boolean;
  isVideoAvailable: boolean;

  addPeerConnection: (key: string) => void;
  removePeerConnection: (key: string) => void;
  setIsAudioEnabled: (value: boolean) => void;
  setIsVideoEnabled: (value: boolean) => void;
};

export const ConferenceContext = createContext<ConferenceContextProps>({
  streams: {},
  isAudioEnabled: false,
  isVideoEnabled: false,
  isAudioAvailable: false,
  isVideoAvailable: false,

  addPeerConnection: () => {},
  removePeerConnection: () => {},
  setIsAudioEnabled: (value: boolean) => {},
  setIsVideoEnabled: (value: boolean) => {},
});
