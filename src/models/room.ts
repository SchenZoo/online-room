import { User } from './user';

export type Room = {
  _id: string;
  users: User[];
  name: string;
};
