import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./modules/authentication/authentication.module";
import { User } from "./modules/users/models/user.entity";
import { UsersModule } from "./modules/users/users.module";
import { Gift, Godparent, Wedding, WeddingUserRelation } from "./modules/weddings/models";
import { WeddingsModule } from "./modules/weddings/weddings.module";
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingModule } from './modules/logging/logging.module';
import { LoggingInterceptor } from './modules/logging/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "casadin"),
        password: configService.get("DB_PASSWORD", "casadin"),
        database: configService.get("DB_DATABASE", "casadin_db"),
        entities: [User, Wedding, Godparent, Gift, WeddingUserRelation],
        synchronize: configService.get("NODE_ENV") !== "production",
        ssl:
          configService.get("NODE_ENV") === "production"
            ? {
                rejectUnauthorized: false,
              }
            : false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthenticationModule,
    WeddingsModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
