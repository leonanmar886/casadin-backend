import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateGiftPaymentDto {
  @ApiProperty({
    description: "Valor da contribuição para o presente",
    example: 50.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number; // Valor da contribuição

  @ApiProperty({
    description: "Status do pagamento",
    enum: ["pending", "completed", "failed"],
    example: "completed",
    required: false,
  })
  @IsOptional()
  @IsEnum(["pending", "completed", "failed"])
  paymentStatus?: "pending" | "completed" | "failed";
} 