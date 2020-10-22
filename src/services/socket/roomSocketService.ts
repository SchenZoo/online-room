import socketService, { SocketService } from './socketService';
import env from '../../env';
import CredentialsService from '../CredentialsService';
import SocketEventNames from '../../enums/SocketEventNames';
import io from 'socket.io-client';
import { Room } from '../../models/room';

function connect(this: SocketService, roomId: string): Promise<{ room: Room }> {
  return new Promise((resolve, reject) => {
    this.socket = io.connect(`${env.SERVER_ENDPOINT}/rooms`);

    Object.values(SocketEventNames).forEach((event) => {
      this.socket.on(event, (data: any) => {
        (this.consumers[event] || []).forEach((cb) => cb(data));
      });
    });

    this.socket.on('connect', () => {
      if (CredentialsService.token) {
        this.sendEvent(SocketEventNames.AUTHORIZE, CredentialsService.token);
      }
    });

    this.socket.on(SocketEventNames.AUTHORIZED, () => {
      this.sendEvent(SocketEventNames.ROOM_PARTICIPANT_JOIN, roomId);
    });

    this.socket.on('disconnect', () => {
      console.error('Client disconnected');
      reject({
        message: 'Not authorized to join class',
      });
    });

    this.socket.on(SocketEventNames.KICKED, () => {
      this.disconnect();
    });

    this.socket.once(
      SocketEventNames.ROOM_PARTICIPANT_JOIN,
      (data?: { room: Room }) => {
        if (!data) return reject('Cannot join room');
        resolve(data);
      },
    );
  });
}

export default socketService(connect);
