import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { DynamoLoggerService } from '../logger/dynamo-logger.service';

@Injectable()
export class CrudLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(CrudLoggerInterceptor.name);

    constructor(private readonly dynamoLogger: DynamoLoggerService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<any>();
        const now = new Date().toISOString();

        const method = req?.method ?? 'UNKNOWN';
        const path = req?.path ?? req?.url ?? 'unknown';

        const action = this.mapMethodToAction(method);

        // try to infer entity and entityId from the URL and params
        const pathParts = path.split('/').filter(Boolean);
        const entity = pathParts.length > 0 ? pathParts[0] : 'unknown';

        // attempt to get an entity id from params (common names) or first param value
        let entityId: string | undefined;
        if (req?.params) {
            const paramValues = Object.values(req.params);
            if (paramValues.length > 0) entityId = String(paramValues[0]);
        }

        // user if present (from auth)
        const userId = req?.user?.id ?? req?.user?.sub ?? undefined;

        const baseLog = {
            logId: randomUUID(),
            timestamp: now,
            action,
            method,
            path,
            entity,
            entityId,
            userId,
            requestBody: req?.body ? this.safeStringify(req.body) : undefined,
        } as Record<string, any>;

        return next.handle().pipe(
            tap((response) => {
                const item = {
                    ...baseLog,
                    success: true,
                    response: this.safeStringify(response),
                };
                // fire-and-forget
                void this.dynamoLogger.log(item);
            }),
            catchError((err) => {
                const item = {
                    ...baseLog,
                    success: false,
                    errorMessage: err?.message ?? String(err),
                };
                void this.dynamoLogger.log(item);
                throw err;
            }),
        );
    }

    private mapMethodToAction(method: string) {
        switch (method.toUpperCase()) {
            case 'POST':
                return 'CREATE';
            case 'GET':
                return 'READ';
            case 'PUT':
            case 'PATCH':
                return 'UPDATE';
            case 'DELETE':
                return 'DELETE';
            default:
                return 'OTHER';
        }
    }

    private safeStringify(obj: any): string | undefined {
        try {
            if (obj === undefined) return undefined;
            return JSON.stringify(obj);
        } catch (err) {
            this.logger.warn('failed to stringify object for logging');
            return undefined;
        }
    }
}
