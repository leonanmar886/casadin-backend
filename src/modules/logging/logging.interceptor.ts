import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const action = `${req.method} ${req.route?.path ?? req.url}`;
    const body = req.body;
    const start = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - start;
        try {
          await this.loggingService.log(
            'HTTP_ACTION',
            { action, body, responseStatus: context.switchToHttp().getResponse().statusCode, duration },
            { path: req.url },
          );
        } catch (e) {
          // swallow logging errors to avoid breaking response flow
          // (handled inside LoggingService as well)
        }
      }),
    );
  }
}
