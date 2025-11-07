import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoLoggerService } from './dynamo-logger.service';
import { CrudLoggerInterceptor } from '../interceptors/crud-logger.interceptor';

@Module({
    imports: [ConfigModule],
    providers: [DynamoLoggerService, CrudLoggerInterceptor],
    exports: [DynamoLoggerService, CrudLoggerInterceptor],
})
export class LoggerModule { }
