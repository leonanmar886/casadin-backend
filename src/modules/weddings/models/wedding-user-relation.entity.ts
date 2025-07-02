import { ApiProperty } from "@nestjs/swagger";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/models/user.entity";
import { Wedding } from "./wedding.entity";

export enum WeddingUserRole {
  FIANCE = "fiance", // Noivo
  GUEST = "guest", // Convidado
}

@Entity()
export class WeddingUserRelation {
  @ApiProperty({ description: "ID único da relação", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Casamento da relação", type: () => Wedding })
  @ManyToOne(() => Wedding, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "weddingId" })
  wedding: Wedding;

  @ApiProperty({ description: "ID do casamento", example: 1 })
  @Column()
  weddingId: number;

  @ApiProperty({ description: "Usuário da relação", type: () => User })
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ApiProperty({ description: "ID do usuário", example: 1 })
  @Column()
  userId: number;

  @ApiProperty({ description: "Papel do usuário no casamento", enum: WeddingUserRole, example: WeddingUserRole.FIANCE })
  @Column({ type: "enum", enum: WeddingUserRole })
  role: WeddingUserRole;

  @ApiProperty({ description: "Se o convidado foi aceito pelos noivos", example: false })
  @Column({ default: false })
  isAccepted: boolean; // Se o convidado foi aceito pelos noivos

  @ApiProperty({ description: "Data quando foi aceito", required: false })
  @Column({ nullable: true })
  acceptedAt: Date; // Data quando foi aceito

  @ApiProperty({ description: "ID do noivo que aceitou", required: false })
  @Column({ nullable: true })
  acceptedBy: number; // ID do noivo que aceitou

  @ApiProperty({ description: "Data de criação" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ApiProperty({ description: "Se a relação está ativa", example: true })
  @Column({ default: true })
  isActive: boolean;
}
