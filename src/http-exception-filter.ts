import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserDashboard } from './dashboard/dashboard.controller';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: UserDashboard }>();
    const status = exception.getStatus();
    console.log('Error Occured By: ' + request?.user?.NAME);
    console.log('Error Occured At: ' + new Date().toISOString());
    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    await global.connection.rollback();
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
