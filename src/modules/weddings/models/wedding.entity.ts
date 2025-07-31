import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Gift } from "./gift.entity";
import { Godparent } from "./godparent.entity";
import { WeddingUserRelation } from "./wedding-user-relation.entity";

@Entity()
export class Wedding {
  @ApiProperty({ description: "ID único do casamento", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Nome do casal", example: "João e Maria" })
  @Column()
  coupleName: string;

  @ApiProperty({ description: "Cor principal do tema", example: "#FF6B6B" })
  @Column()
  primaryColor: string;

  @ApiProperty({ description: "Data do casamento", example: "2024-12-25" })
  @Column({ type: "date" })
  weddingDate: Date;

  @ApiProperty({ description: "Local do casamento", example: "Espaço de Eventos Jardim das Flores" })
  @Column()
  weddingLocation: string;

  @ApiProperty({ description: "URLs das fotos do casal", type: [String] })
  @Column("simple-array")
  couplePhotos: string[]; // URLs das fotos

  @ApiProperty({ description: "Descrição do casamento", example: "Celebração do amor entre João e Maria" })
  @Column({ type: "text" })
  description: string;

  @ApiProperty({ description: "Lista de padrinhos", type: [Godparent] })
  @OneToMany(() => Godparent, (godparent) => godparent.wedding)
  godparents: Godparent[];

  @ApiProperty({ description: "Lista de presentes", type: [Gift] })
  @OneToMany(() => Gift, (gift) => gift.wedding)
  gifts: Gift[];

  @ApiProperty({ description: "URL da foto do rodapé", required: false })
  @Column({ nullable: true })
  footerPhoto: string; // URL da foto do footer

  @ApiProperty({ description: "Código único de convite", example: "A1B2C3D4" })
  @Column({ unique: true })
  invitationCode: string;

  @ApiProperty({ description: "Relações dos usuários com o casamento", type: [WeddingUserRelation] })
  @OneToMany(() => WeddingUserRelation, (relation) => relation.wedding, {
    cascade: true,
  })
  userRelations: WeddingUserRelation[];

  @ApiProperty({ description: "Data de criação" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "Data da última atualização" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ApiProperty({ description: "Se o casamento está ativo", example: true })
  @Column({ default: true })
  isActive: boolean;
}
