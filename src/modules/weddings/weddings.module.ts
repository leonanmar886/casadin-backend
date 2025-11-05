import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/models/user.entity";
import { Gift } from "./models/gift.entity";
import { Godparent } from "./models/godparent.entity";
import { WeddingUserRelation } from "./models/wedding-user-relation.entity";
import { Wedding } from "./models/wedding.entity";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./services/payments.service";
import { UploadService } from "./services/upload.service";
import { WeddingsController } from "./weddings.controller";
import { WeddingsService } from "./weddings.service";

@Module({
  imports: [TypeOrmModule.forFeature([Wedding, Godparent, Gift, User, WeddingUserRelation])],
  controllers: [WeddingsController, PaymentsController],
  providers: [WeddingsService, UploadService, PaymentsService],
  exports: [WeddingsService, UploadService, PaymentsService],
})
export class WeddingsModule {}
