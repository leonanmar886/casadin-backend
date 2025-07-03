import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { AuthenticationService } from "./authentication.service";
import { AuthResponse, LoginDto, RegisterDto } from "./dto/authentication.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post("login")
  @ApiOperation({ summary: "Fazer login no sistema" })
  @ApiResponse({
    status: 200,
    description: "Login realizado com sucesso",
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: "Credenciais inválidas",
  })
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post("register")
  @ApiOperation({ summary: "Registrar novo usuário" })
  @ApiResponse({
    status: 201,
    description: "Usuário registrado com sucesso",
    type: AuthResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos ou email já existe",
  })
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Obter perfil do usuário autenticado" })
  @ApiResponse({
    status: 200,
    description: "Perfil do usuário",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        name: { type: "string", example: "João Silva" },
        email: { type: "string", example: "joao@example.com" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }
}
