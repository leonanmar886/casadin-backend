import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./modules/users/users.module";
import { AuthenticationService } from "./modules/authentication/authentication.service";
import { AuthenticationModule } from "./modules/authentication/authentication.module";
import { AuthenticationController } from "./modules/authentication/authentication.controller";
import { UsersController } from "./modules/users/users.controller";
import { UsersService } from "./modules/users/users.service";
import { User } from "./modules/users/models/user.entity";

@Module({
  imports: [UsersModule, AuthenticationModule],
  controllers: [AppController, AuthenticationController, UsersController],
  providers: [AppService, AuthenticationService, UsersService],
})
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "casadin",
      password: "casadin",
      database: "casadin_db",
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
