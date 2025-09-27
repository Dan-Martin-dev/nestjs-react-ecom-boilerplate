import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, format, transports, Logger } from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor(private configService: ConfigService) {
    const logFormat = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    );

    this.logger = createLogger({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: logFormat,
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
        // Add file transport for production
        ...(this.configService.get('NODE_ENV') === 'production'
          ? [
              new transports.File({
                filename: 'logs/error.log',
                level: 'error',
              }),
              new transports.File({ filename: 'logs/combined.log' }),
            ]
          : []),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
