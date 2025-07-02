import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "Email do usuário",
    example: "joao@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Senha do usuário",
    example: "senha123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Email do usuário",
    example: "joao@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Senha do usuário",
    example: "senha123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponse {
  @ApiProperty({
    description: "Token de acesso JWT",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    description: "Dados do usuário autenticado",
    example: {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
    },
  })
  user: {
    id: number;
    name: string;
    email: string;
  };
}
