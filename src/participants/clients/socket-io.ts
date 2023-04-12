import { ApiServer } from 'api';
import { Server } from 'socket.io';

export class SocketIO {
  readonly server: Server;
  constructor(apiServer: ApiServer) {
    this.server = apiServer.io;
  }

  async emit(message: string, data: any) {
    this.server.emit(message, data);
  }

  async receive(message: string, callback) {
    this.server.on(message, (input) => callback(input));
  }
}
