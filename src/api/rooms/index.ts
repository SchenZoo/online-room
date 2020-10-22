import { Room, Participant } from './../../models/room';
import HttpClient from '../../services/HttpClient';
import { AxiosResponse } from 'axios';

const updateRoomsCustomer = (
  roomId: string,
  customerId: string,
  partialCustomer: Partial<Participant>,
) => {
  return HttpClient.patch<any, AxiosResponse<Room>>(
    `rooms/${roomId}/customers/${customerId}`,
    partialCustomer,
  );
};

const updateRoom = (roomId: string, patch: Partial<Room>) => {
  return HttpClient.patch(`rooms/${roomId}`, patch);
};

const takeControl = (roomId: string, takeControl: boolean) => {
  return HttpClient.patch(`rooms/${roomId}/customers/control`, {
    takeControl,
  });
};

export default {
  updateRoomsCustomer,
  updateRoom,
  takeControl,
};
