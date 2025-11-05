import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'ID do presente' })
  @IsNumber()
  giftId: number;

  @ApiProperty({ example: 50.00, description: 'Valor da contribuição' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'pix', enum: ['pix', 'card'], description: 'Método de pagamento' })
  @IsEnum(['pix', 'card'])
  method: 'pix' | 'card';

  @ApiProperty({ example: 'token_gerado_no_front', required: false })
  @IsOptional()
  @IsString()
  cardToken?: string;

  @ApiProperty({ example: 'comprador@email.com' })
  @IsString()
  payerEmail: string;
} 