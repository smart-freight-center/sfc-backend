import * as http from 'http';
import cors from '@koa/cors';
import Koa from 'koa';
import * as routes from './routes';
import { EdcManager, EdcManagerError, EdcManagerErrorType } from '../core';
import { ApiRouterContext } from './context';

export interface ServerConfig {
  edcManager: EdcManager;
  cors?: {
    allowedOrigins: string[];
  };
}

export class ApiServer {
  /** The native Node.js HTTP server reference. */
  server: http.Server;

  /** The native Node.js HTTP server reference. */
  public readonly koa: Koa;

  edcManager: EdcManager;
  /**
   * # Not supported initialization method
   * Use `Server.create` instead.
   */
  private constructor(server: http.Server, edcManager: EdcManager, koa: Koa) {
    this.edcManager = edcManager;
    this.koa = koa;
    this.server = server;
  }

  /**
   * Start listening on HTTP request on a certain port.
   *
   * @param port the port for incoming HTTP requests.
   */
  listen(port?: number, hostname = '0.0.0.0'): Promise<void> {
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
    const { edcManager } = config;

    const koa = new Koa();

    if (config.cors) {
      const { allowedOrigins } = config.cors;
      koa.use(
        cors({
          origin: (context) => {
            if (allowedOrigins.includes('*')) {
              return '*';
            }

            const foundOrigin = allowedOrigins.find(
              (origin) => origin === context.origin
            );

            return foundOrigin || '';
          },
        })
      );
    }

    const server = http.createServer(koa.callback());
    koa
      .use(async (context: ApiRouterContext, next: () => Promise<void>) => {
        const edcManagerContext = edcManager.createContext();

        context.state = {
          ...context.state,
          edcManager,
          edcManagerContext,
        };

        await next();
      })
      .use(async (context: ApiRouterContext, next: () => Promise<void>) => {
        try {
          await next();
        } catch (error) {
          if (error instanceof EdcManagerError) {
            context.set('Content-type', 'application/json');
            switch (error.type) {
              case EdcManagerErrorType.NotFound: {
                context.status = 404;
                context.body = {
                  code: error.type,
                  message: error.message,
                };
                break;
              }
              case EdcManagerErrorType.Duplicate: {
                context.status = 409;
                context.body = {
                  code: error.type,
                  message: error.message,
                };
                break;
              }
              case EdcManagerErrorType.Unknown:
              default: {
                context.status = 500;
                context.body = {
                  code: error.type,
                  message: error.message,
                };
                break;
              }
            }

            return;
          }

          context.status = 500;
          context.body = {
            code: 'Unknown',
            error,
          };
        }
      });

    for (const router of Object.values(routes)) {
      koa.use(router.routes()).use(router.allowedMethods());
    }

    return new ApiServer(server, edcManager, koa);
  }
}
