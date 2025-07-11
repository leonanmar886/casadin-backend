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
export class Gift {
  @ApiProperty({ description: "ID único do presente", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Nome do presente", example: "Jogo de Panelas" })
  @Column()
  name: string;

  @ApiProperty({ description: "Descrição do presente", required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: "URL da foto do presente", required: false })
  @Column({ nullable: true })
  photo: string; // URL da foto do presente

  @ApiProperty({ description: "Preço do presente", example: 299.99, required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiProperty({ description: "Loja onde o presente pode ser encontrado", required: false })
  @Column({ nullable: true })
  store: string; // Loja onde o presente pode ser encontrado

  @ApiProperty({ description: "Valor total já pago pelos convidados", example: 150.00 })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  amountPaid: number; // Valor total já pago pelos convidados

  @ApiProperty({ description: "Valor restante para completar o presente", example: 149.99 })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  amountRemaining: number; // Valor restante para completar o presente

  @ApiProperty({ description: "Se o presente foi totalmente pago", example: false })
  @Column({ default: false })
  isFullyPaid: boolean; // Se o presente foi totalmente pago

  @ApiProperty({ description: "Data quando o presente foi totalmente pago", required: false })
  @Column({ nullable: true })
  paidAt: Date; // Data quando o presente foi totalmente pago

  @ApiProperty({ description: "Status do pagamento", enum: ["pending", "completed", "failed"], example: "pending" })
  @Column({ default: "pending" })
  paymentStatus: "pending" | "completed" | "failed"; // Status do pagamento

  @ApiProperty({ description: "Casamento ao qual o presente pertence", type: () => Wedding })
  @ManyToOne(() => Wedding, { onDelete: "CASCADE" })
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

  @ApiProperty({ description: "Se o presente está ativo", example: true })
  @Column({ default: true })
  isActive: boolean;
}
