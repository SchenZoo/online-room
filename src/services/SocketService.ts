import io from 'socket.io-client';
import { SocketEventNames } from '../enums/SocketEventNames';
import CredentialsService from './CredentialsService';
import env from '../env';

class SocketService {
  static socket: SocketIOClient.Socket;
  static eventTypes = Object.values(SocketEventNames);

  /** @param consumers, stores data about callbacks that need to be executed */
  private static consumers: {
    [event: string]: Array<(data: any) => void>;
  } = {};

  static connect() {
    if (!SocketService.socket) {
      SocketService.socket = io.connect(`${env.SERVER_ENDPOINT}`, {
        secure: true,
        rejectUnauthorized: false,
      });

      SocketService.eventTypes.forEach((event) => {
        SocketService.socket.on(event, (data: any) => {
          (SocketService.consumers[event] || []).forEach((cb) => cb(data));
        });
      });

      SocketService.socket.on('connect', () => {
        if (CredentialsService.token) {
          SocketService.sendEvent(
            SocketEventNames.AUTHORIZE,
            CredentialsService.token,
          );
        }
      });
    }
  }

  static disconnect() {
    if (SocketService.socket.connected) {
      SocketService.socket.disconnect();
    }
  }

  static addListener<T = any>(event: string, callback: (data: T) => void) {
    if (!SocketService.consumers[event]) {
      SocketService.consumers[event] = [callback];
    } else SocketService.consumers[event].push(callback);
  }

  static removeListener(event: string, callback: (data: any) => void) {
    const callbackArr = SocketService.consumers[event];
    if (!callbackArr) return;
    SocketService.consumers[event] = callbackArr.filter(
      (cb) => cb !== callback,
    );
  }

  static removeAllListeners() {
    Object.entries(SocketService.consumers).forEach(([event, callbacks]) => {
      if (callbacks) {
        callbacks.forEach((callback) =>
          SocketService.socket.removeListener(event, callback),
        );
      }
    });
    SocketService.consumers = {};
  }

  /**
   * Emit event to socket server with given name and payload
   * @param {string} eventName
   * @param {any} eventPayload
   */
  static sendEvent(eventName: string, eventPayload?: any) {
    if (!SocketService.socket) {
      throw new Error('Socket has to be initialized before events are sent');
    }
    SocketService.socket.emit(eventName, eventPayload);
  }
}

export { SocketService };
