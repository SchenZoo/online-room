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

export default {
  updateRoomsCustomer,
};
