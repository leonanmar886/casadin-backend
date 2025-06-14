import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION", "1h"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: "JWT_SECRET_CHECK",
      useFactory: (configService: ConfigService) => {
        const logger = new Logger("JWT_CONFIG");
        logger.log(
          `JWT Secret configurado: ${configService.get("JWT_SECRET") ? "Sim" : "Não"}`,
        );
        logger.log(
          `JWT Expiration: ${configService.get("JWT_EXPIRATION", "1h")}`,
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
