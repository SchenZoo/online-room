import { User } from './user';

export type Participant = {
  _id: string;
  user: User;
  token: string;
  hasJoined: boolean;
  hasControl?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
};

export type Room = {
  _id: string;
  host: Participant;
  customers: Participant[];
  name: string;
};
