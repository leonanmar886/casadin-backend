import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoLoggerService {
    private readonly logger = new Logger(DynamoLoggerService.name);
    private readonly ddbClient: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor(private readonly configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';
        const client = new DynamoDBClient({ region });
        this.ddbClient = DynamoDBDocumentClient.from(client);
        this.tableName = this.configService.get<string>('APP_CRUD_LOGS_TABLE') ?? 'AppCrudLogs';
    }

    async log(item: Record<string, any>): Promise<void> {
        try {
            if (!item.logId || !item.timestamp) {
                throw new Error('logId and timestamp are required');
            }

            const put = new PutCommand({
                TableName: this.tableName,
                Item: item,
            });

            await this.ddbClient.send(put);
        } catch (err) {
            this.logger.error('Failed to write log to DynamoDB', err as any);
        }
    }
}
