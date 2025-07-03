import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UploadImagesDto {
  @ApiProperty({
    description: "URLs das fotos do casal",
    type: [String],
    required: false,
    example: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  couplePhotos?: string[];

  @ApiProperty({
    description: "URL da foto do rodapé",
    required: false,
    example: "https://example.com/footer.jpg",
  })
  @IsOptional()
  @IsString()
  footerPhoto?: string;

  @ApiProperty({
    description: "URL da foto do padrinho",
    required: false,
    example: "https://example.com/godparent.jpg",
  })
  @IsOptional()
  @IsString()
  godparentPhoto?: string;

  @ApiProperty({
    description: "URL da foto do presente",
    required: false,
    example: "https://example.com/gift.jpg",
  })
  @IsOptional()
  @IsString()
  giftPhoto?: string;
} 