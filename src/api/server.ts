import * as http from 'http';
import cors from '@koa/cors';
import Koa, { Context } from 'koa';
import { RouterContext } from '@koa/router';
import * as routes from './routes';
import { EdcManagerError, EdcManagerErrorType } from '../core';
import koaBodyparser from 'koa-bodyparser';

export interface ServerConfig {
  cors?: {
    allowedOrigins: string[];
  };
}

export type ApiRouterContext = RouterContext;
export class ApiServer {
  /** The native Node.js HTTP server reference. */
  server: http.Server;

  /** The native Node.js HTTP server reference. */
  public readonly koa: Koa;

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
      koa.use(
        koaBodyparser({
          enableTypes: ['json'],
        })
      );
    }

    const server = http.createServer(koa.callback());
    koa.use(async (context: Context, next: () => Promise<void>) => {
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

    return new ApiServer(server, koa);
  }
}
