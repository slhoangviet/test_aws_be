import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from '../../i18n/i18n.service';
import { getLocaleFromRequest } from '../decorators/locale.decorator';

@Catch(HttpException)
@Injectable()
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ headers: Record<string, string | undefined> }>();
    const status = exception.getStatus();
    let message = exception.getResponse();
    if (typeof message === 'object' && message !== null && 'message' in message) {
      message = (message as { message: string | string[] }).message;
    }
    const msgStr = Array.isArray(message) ? message[0] : String(message);
    const locale = getLocaleFromRequest(req.headers ?? {});
    const isKey = typeof msgStr === 'string' && (msgStr.startsWith('error.') || msgStr.startsWith('message.'));
    const output = isKey ? this.i18n.t(msgStr, locale) : msgStr;

    res.status(status).json({
      statusCode: status,
      message: output,
      error: status === HttpStatus.BAD_REQUEST ? 'Bad Request' : status === HttpStatus.NOT_FOUND ? 'Not Found' : 'Internal Server Error',
    });
  }
}
