import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class AcceptGuestDto {
  @ApiProperty({
    description: "ID do usuário convidado a ser aceito",
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
} 