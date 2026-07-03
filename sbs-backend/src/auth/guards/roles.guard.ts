import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY, isAuthDisabled } from '../auth.constants';
import { AuthUser } from '../decorators/current-user.decorator';
import { Designation } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Designation[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    if (isAuthDisabled()) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: AuthUser }).user;

    if (!user?.designation || !required.includes(user.designation as Designation)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }
    return true;
  }
}
