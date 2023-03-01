import * as http from "http";
import cors from "@koa/cors";
import Koa from "koa";
import * as routes from "./routes";

export interface ServerConfig {
  cors?: {
    allowedOrigins: string[];
  };
}

export class ApiServer {
  /** The native Node.js HTTP server reference. */
  server: http.Server;

  /** The native Node.js HTTP server reference. */
  koa: Koa;

  /**
   * # Not supported initialization method
   * Use `Server.create` instead.
   */
  private constructor(server: http.Server, koa: Koa) {
    this.koa = koa;
    this.server = server;
  }

  /**
   * Start listening on HTTP request on a certain port.
   *
   * @param port the port for incoming HTTP requests.
   */
  async listen(port?: number, hostname = "0.0.0.0"): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.listen(port, hostname, () => {
        resolve();
      });
    });
  }

  /**
   * Gracefully close all open connections and stop listening for HTTP requests
   * and dispose the `Lms` instance.
   */
  async shutdown(): Promise<void> {
    if (!this.server.listening) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }

  /**
   * Create a new instance of the `api` Server.
   *
   * @param config server configuration
   * @returns a new `Server` instance
   */
  static create(config: ServerConfig): ApiServer {
    const koa = new Koa();

    if (config.cors) {
      const { allowedOrigins } = config.cors;
      koa.use(
        cors({
          origin: (context) => {
            if (allowedOrigins.includes("*")) {
              return "*";
            }

            const foundOrigin = allowedOrigins.find(
              (origin) => origin === context.origin
            );

            return foundOrigin || "";
          },
        })
      );
    }

    const server = http.createServer(koa.callback());

    for (const router of Object.values(routes)) {
      koa.use(router.routes()).use(router.allowedMethods());
    }

    return new ApiServer(server, koa);
  }
}
