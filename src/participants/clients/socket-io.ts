import { Server } from 'socket.io';

export class SocketIO {
  readonly server: Server;
  constructor(apiServer) {
    this.server = apiServer;
  }

  async emit(message: string, data: any) {
    this.server.emit(message, data);
  }

  async receive(message: string, callback) {
    this.server.on(message, (input) => callback(input));
  }
}
