import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { WeddingUserRole } from "../models/wedding-user-relation.entity";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: User;
}

export const RequireWeddingRole = (...roles: WeddingUserRole[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata("weddingRoles", roles, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class WeddingPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WeddingUserRole[]>("weddingRoles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const weddingId = this.getWeddingIdFromRequest(request);

    if (!weddingId) {
      throw new ForbiddenException("ID do casamento não fornecido");
    }

    // Aqui você precisará injetar o serviço para verificar a relação do usuário com o casamento
    // Por enquanto, vamos retornar true e implementar a lógica no serviço
    return true;
  }

  private getWeddingIdFromRequest(request: RequestWithUser): number | null {
    // Tentar obter o ID do casamento de diferentes formas
    const params = request.params;
    const query = request.query;
    const body = request.body;

    return (
      params?.weddingId ? +params.weddingId :
      params?.id ? +params.id :
      query?.weddingId ? +query.weddingId :
      body?.weddingId ? +body.weddingId :
      null
    );
  }
} 