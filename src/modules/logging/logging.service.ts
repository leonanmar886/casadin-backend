import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const region = process.env.AWS_REGION || process.env.DYNAMODB_REGION || 'us-east-1';
    this.tableName = process.env.DDB_TABLE_NAME || process.env.DYNAMODB_TABLE || 'ApplicationLogs';

    const client = new DynamoDBClient({
      region,
      // If running local DynamoDB for dev, DYNAMODB_ENDPOINT can be set in env
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    });

    // Configure the DocumentClient to remove undefined values when marshalling
    // to avoid errors like: "Pass options.removeUndefinedValues=true to remove undefined values"
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  /**
   * Log an action to DynamoDB.
   * actionType: partition key
   * data: object with relevant data (IDs, payload summary)
   * meta: optional additional metadata
   */
  async log(actionType: string, data: any, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
  // use Node's built-in crypto.randomUUID() to avoid ESM/CommonJS import issues
  const id = typeof randomUUID === 'function' ? randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

    const item = {
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
      // Do not crash the application because of logging failures.
      this.logger.error('Failed to write log to DynamoDB', err as any);
      return null;
    }
  }
}
