import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Handle validation errors
    if (exception instanceof HttpException && this.isValidationError(exception)) {
      const response = exception.getResponse() as any;
      const validationResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: response.message
      };

      this.logger.error(`Validation Error: ${JSON.stringify(validationResponse)}`);
      return httpAdapter.reply(ctx.getResponse(), validationResponse, HttpStatus.BAD_REQUEST);
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: this.getErrorMessage(exception)
    };

    this.logger.error(`Error: ${JSON.stringify(responseBody)}`);
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private isValidationError(exception: HttpException): boolean {
    const response = exception.getResponse();
    return (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      Array.isArray((response as any).message)
    );
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return String(exception);
  }
}