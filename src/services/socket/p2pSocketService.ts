import socketService, { SocketService } from './socketService';
import env from '../../env';
import CredentialsService from '../CredentialsService';
import SocketEventNames from '../../enums/SocketEventNames';
import io from 'socket.io-client';

function connect(this: SocketService): Promise<void> {
  return new Promise((resolve, reject) => {
    this.socket = io.connect(`${env.SERVER_ENDPOINT}/rooms-p2p`);

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

    this.socket.on('disconnect', () => {
      console.error('Client disconnected');
      reject({
        message: 'Not authorized to join class',
      });
    });

    this.socket.on(SocketEventNames.AUTHORIZED, resolve);
  });
}

export default socketService(connect);
