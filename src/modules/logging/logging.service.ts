import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly configService?: ConfigService) {
    const region =
      this.configService?.get<string>('AWS_REGION') ||
      this.configService?.get<string>('DYNAMODB_REGION') ||
      process.env.AWS_REGION ||
      process.env.DYNAMODB_REGION ||
      'us-east-1';

    this.tableName =
      this.configService?.get<string>('DDB_TABLE_NAME') ||
      this.configService?.get<string>('DYNAMODB_TABLE') ||
      process.env.DDB_TABLE_NAME ||
      process.env.DYNAMODB_TABLE ||
      'ApplicationLogs';

    const client = new DynamoDBClient({
      region,
      endpoint:
        this.configService?.get<string>('DYNAMODB_ENDPOINT') || process.env.DYNAMODB_ENDPOINT || undefined,
    });

    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  async log(actionType: string, data: any, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
  const id = typeof randomUUID === 'function' ? randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

    const item = {
      logId: id,
      actionType,
      timestamp,
      id,
      data,
      meta,
    };

    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        }),
      );

      return { id, timestamp };
    } catch (err) {
      this.logger.error('Failed to write log to DynamoDB', err as any);
      return null;
    }
  }
}
