import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ReserveGiftDto {
  @ApiProperty({
    description: "Nome de quem está reservando o presente",
    example: "João Silva",
  })
  @IsString()
  @IsNotEmpty()
  reservedBy: string;
} 