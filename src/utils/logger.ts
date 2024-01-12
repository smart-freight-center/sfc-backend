import winston from 'winston';

const { createLogger, format, transports } = winston;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const _winstonLogger = createLogger({
  levels: logLevels,
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.prettyPrint(),
    format.errors({ stack: true })
  ),
  transports: [new transports.Console({ handleExceptions: true })],
});

export class AppLogger {
  private serviceName: string;
  constructor(name: string) {
    this.serviceName = name;
  }

  public info(msg: string, extra?: Record<string, unknown>) {
    _winstonLogger.info(msg, {
      ...extra,
      service: this.serviceName,
    });
  }

  public error(msg: string, extra?: Record<string, unknown>) {
    _winstonLogger.error(msg, {
      ...extra,
      service: this.serviceName,
    });
  }

  public warn(msg: string, extra?: Record<string, unknown>) {
    _winstonLogger.warn(msg, {
      service: this.serviceName,
      ...extra,
    });
  }

  public debug(msg: string, extra?: Record<string, unknown>) {
    _winstonLogger.debug(msg, {
      service: this.serviceName,
      ...extra,
    });
  }

  public static createLogger(moduleName: string) {
    const logger = new AppLogger(moduleName);
    return logger;
  }
}
