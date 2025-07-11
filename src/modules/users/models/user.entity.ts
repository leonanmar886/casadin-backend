import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @ApiProperty({ description: "ID único do usuário", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Nome completo do usuário", example: "João Silva" })
  @Column()
  name: string;

  @ApiProperty({ description: "Email do usuário", example: "joao@example.com" })
  @Column()
  email: string;

  @ApiProperty({ description: "Senha do usuário (hash)", example: "hashed_password" })
  @Column()
  password: string;

  @ApiProperty({ description: "Data de criação" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "Se o usuário está ativo", example: true })
  @Column({ default: true })
  isActive: boolean;
}
