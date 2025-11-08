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
          // map HTTP method to CRUD action
          const method = (req.method || '').toUpperCase();
          let actionType: string;
          switch (method) {
            case 'POST':
              actionType = 'CREATE';
              break;
            case 'GET':
              actionType = 'READ';
              break;
            case 'PUT':
              actionType = 'UPDATE';
              break;
            case 'PATCH':
              actionType = 'UPDATE';
              break;
            case 'DELETE':
              actionType = 'DELETE';
              break;
            default:
              actionType = method || 'UNKNOWN';
          }

          const res = context.switchToHttp().getResponse();
          const payload = {
            resource: req.route?.path ?? req.url,
            body,
            params: req.params,
            query: req.query,
            responseStatus: res?.statusCode,
            duration,
          };

          await this.loggingService.log(actionType, payload, { path: req.url, method });
        } catch (e) {
          // swallow logging errors to avoid breaking response flow
          // (handled inside LoggingService as well)
        }
      }),
    );
  }
}
