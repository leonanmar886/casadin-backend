import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AuthResponse, LoginDto, RegisterDto } from "./dto/authentication.dto";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.logger.log(
      `JWT Secret: ${process.env.JWT_SECRET ? "Definido" : "Não definido"}`,
    );
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.usersService.findByEmail(email);
    this.logger.debug(`Tentativa de login para email: ${email}`);

    if (
      user &&
      (await this.usersService.validatePassword(password, user.password))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      this.logger.warn(`Login falhou para email: ${loginDto.email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.logger.debug(
      `Token gerado para usuário ${user.email}: ${token.substring(0, 20)}...`,
    );

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      this.logger.warn(
        `Tentativa de registro com email já existente: ${registerDto.email}`,
      );
      throw new UnauthorizedException("Email already exists");
    }

    const user = await this.usersService.create(registerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.logger.debug(
      `Token gerado para novo usuário ${user.email}: ${token.substring(0, 20)}...`,
    );

    return {
      access_token: token,
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
      },
    };
  }
}
