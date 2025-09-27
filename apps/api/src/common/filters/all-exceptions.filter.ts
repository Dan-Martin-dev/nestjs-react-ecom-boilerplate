// backend/src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@repo/db';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    let httpStatus: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      // Handle standard HTTP exceptions
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? { message: response } : response;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma exceptions
      // See Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          httpStatus = HttpStatus.CONFLICT;
          message = `A record with this value already exists. Field: ${exception.meta?.target}`;
          break;
        case 'P2025': // Record to update or delete does not exist
          httpStatus = HttpStatus.NOT_FOUND;
          message = `The requested resource was not found.`;
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'An internal database error occurred.';
          break;
      }
    } else {
      // Handle all other unknown exceptions
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected internal server error occurred.';
    }

    // Log the full error for internal review, especially for 500 errors
    if (httpStatus >= 500) {
      this.logger.error(
        `HTTP Status: ${httpStatus} | Message: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(
        `HTTP Status: ${httpStatus} | Message: ${JSON.stringify(message)}`,
      );
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      method: httpAdapter.getRequestMethod(request),
      ...(typeof message === 'string' ? { message } : message),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
