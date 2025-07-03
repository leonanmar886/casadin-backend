import { ApiProperty } from "@nestjs/swagger";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Wedding } from "./wedding.entity";

@Entity()
export class Godparent {
  @ApiProperty({ description: "ID único do padrinho", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Nome do padrinho", example: "João Silva" })
  @Column()
  name: string;

  @ApiProperty({ description: "URL da foto do padrinho", required: false })
  @Column({ nullable: true })
  photo: string; // URL da foto do padrinho

  @ApiProperty({ description: "Relacionamento com os noivos", example: "Padrinho do noivo", required: false })
  @Column({ nullable: true })
  relationship: string; // Ex: "Padrinho", "Madrinha", "Amigo dos noivos"

  @ApiProperty({ description: "Descrição do padrinho", example: "Melhor amigo desde a infância", required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: "Casamento ao qual o padrinho pertence", type: () => Wedding })
  @ManyToOne(() => Wedding, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "weddingId" })
  wedding: Wedding;

  @ApiProperty({ description: "ID do casamento", example: 1 })
  @Column()
  weddingId: number;

  @ApiProperty({ description: "Data de criação" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ApiProperty({ description: "Se o padrinho está ativo", example: true })
  @Column({ default: true })
  isActive: boolean;
}
