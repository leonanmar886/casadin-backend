import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "./models/user.entity";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Listar todos os usuários" })
  @ApiResponse({
    status: 200,
    description: "Lista de usuários (sem senhas)",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number", example: 1 },
          name: { type: "string", example: "João Silva" },
          email: { type: "string", example: "joao@example.com" },
          role: { type: "string", example: "fiance" },
          createdAt: { type: "string", format: "date-time" },
          isActive: { type: "boolean", example: true },
        },
      },
    },
  })
  async findAll(): Promise<Omit<User, "password">[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    });
  }
}
