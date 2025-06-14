import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { AuthenticationService } from "./authentication.service";
import { AuthResponse, LoginDto, RegisterDto } from "./dto/authentication.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post("login")
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post("register")
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }
}
