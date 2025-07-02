import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class JoinWeddingDto {
  @ApiProperty({
    description: "Código de convite do casamento",
    example: "A1B2C3D4",
  })
  @IsString()
  @IsNotEmpty()
  invitationCode: string;
} 