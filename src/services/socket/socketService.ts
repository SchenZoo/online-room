import SocketEventNames from '../../enums/SocketEventNames';

export type SocketEvent = typeof SocketEventNames[keyof typeof SocketEventNames];

export type SocketService<T extends string = SocketEvent> = {
  socket: SocketIOClient.Socket;
  consumers: Partial<Record<T, Array<Function>>>;
  connect: Function;
  disconnect: Function;
  addListener: <P = any>(event: T, callback: (data: P) => void) => void;
  removeListener: (event: T, callback: Function) => void;
  removeAllListeners: Function;
  sendEvent: (event: T, payload?: any) => void;
};

export default <T extends string = SocketEvent>(connect: Function) =>
  ({
    socket: null,
    consumers: {},
    connect,
    disconnect() {
      this.removeAllListeners();
      if (this.socket) {
        this.socket.disconnect();
      }
    },
    addListener<P = any>(event: T, callback: (data: P) => void) {
      if (!this.consumers[event]) {
        this.consumers[event] = [callback];
      } else this.consumers[event].push(callback);
    },
    removeListener(event: T, callback: Function) {
      const callbackArr = this.consumers[event];
      if (!callbackArr) return;
      this.consumers[event] = callbackArr.filter((cb) => cb !== callback);
    },
    removeAllListeners() {
      Object.entries(this.consumers).forEach(([event, callbacks]) => {
        if (callbacks) {
          (callbacks as Function[]).forEach((callback) =>
            this.socket.removeListener(event, callback),
          );
        }
      });
      this.consumers = {};
    },
    sendEvent(eventName: string, eventPayload?: any) {
      if (!this.socket) {
        throw new Error('Socket has to be initialized before events are sent');
      }
      this.socket.emit(eventName, eventPayload);
    },
  } as SocketService<T>);
