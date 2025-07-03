import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateGodparentDto {
  @ApiProperty({
    description: "Nome do padrinho",
    example: "João Silva",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "URL da foto do padrinho",
    example: "https://example.com/photo.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({
    description: "Relacionamento com os noivos",
    example: "Padrinho do noivo",
    required: false,
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({
    description: "Descrição do padrinho",
    example: "Melhor amigo desde a infância",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateGiftDto {
  @ApiProperty({
    description: "Nome do presente",
    example: "Jogo de Panelas",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Descrição do presente",
    example: "Jogo de panelas antiaderente com 5 peças",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "URL da foto do presente",
    example: "https://example.com/gift.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({
    description: "Preço do presente",
    example: 299.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: "Loja onde o presente pode ser encontrado",
    example: "Magazine Luiza",
    required: false,
  })
  @IsOptional()
  @IsString()
  store?: string;
}

export class CreateWeddingDto {
  @ApiProperty({
    description: "Nome do casal",
    example: "João e Maria",
  })
  @IsString()
  coupleName: string;

  @ApiProperty({
    description: "Cor principal do tema do casamento",
    example: "#FF6B6B",
  })
  @IsString()
  primaryColor: string;

  @ApiProperty({
    description: "Data do casamento",
    example: "2024-12-25",
  })
  @IsDateString()
  weddingDate: string;

  @ApiProperty({
    description: "Local do casamento",
    example: "Espaço de Eventos Jardim das Flores",
  })
  @IsString()
  weddingLocation: string;

  @ApiProperty({
    description: "URLs das fotos do casal",
    example: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  couplePhotos: string[];

  @ApiProperty({
    description: "Descrição do casamento",
    example: "Celebração do amor entre João e Maria",
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "Lista de padrinhos",
    type: [CreateGodparentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGodparentDto)
  godparents: CreateGodparentDto[];

  @ApiProperty({
    description: "Lista de presentes",
    type: [CreateGiftDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGiftDto)
  gifts: CreateGiftDto[];

  @ApiProperty({
    description: "URL da foto do rodapé",
    example: "https://example.com/footer.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  footerPhoto?: string;
} 