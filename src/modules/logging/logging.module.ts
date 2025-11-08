import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggingTestController } from './logging-test.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [LoggingTestController],
  providers: [LoggingService, LoggingInterceptor],
  exports: [LoggingService],
})
export class LoggingModule {}
