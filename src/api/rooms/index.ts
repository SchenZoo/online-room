import { Room } from './../../models/room';
import HttpClient from '../../services/HttpClient';
import { AxiosResponse } from 'axios';

const joinRoom = (roomName: string) => {
  return HttpClient.post<any, AxiosResponse<Room>>(`rooms/${roomName}/join`);
};

export default {
  joinRoom,
};
