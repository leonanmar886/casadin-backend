// DEPRECATED: Este guard foi removido porque o papel do usuário agora é relativo a cada casamento
// Use WeddingPermissionsGuard em src/modules/weddings/guards/wedding-permissions.guard.ts

import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

interface User {
  id: number;
  name: string;
  email: string;
}

interface RequestWithUser extends Request {
  user: User;
}

export const Roles = (...roles: string[]) => SetMetadata("roles", roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Este guard não é mais usado - o papel é verificado por casamento
    return true;
  }
}
