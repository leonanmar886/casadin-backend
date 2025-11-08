import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoggingService } from './logging.service';

@Controller('log-test')
export class LoggingTestController {
  constructor(private readonly loggingService: LoggingService) {}

  @Post()
  @HttpCode(200)
  async test(@Body() body: any) {
    const payload = body && Object.keys(body).length ? body : { test: true };
    const result = await this.loggingService.log('TEST', payload, { source: 'log-test-endpoint' });
    return { ok: !!result, result };
  }
}
