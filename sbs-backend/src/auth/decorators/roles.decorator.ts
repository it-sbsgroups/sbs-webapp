import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../auth.constants';

export type Designation =
  | 'ADMIN'
  | 'SALES'
  | 'HUMANRESOURCE'
  | 'IT'
  | 'FOUNDER'
  | 'COFOUNDER';

export const Roles = (...roles: Designation[]) => SetMetadata(ROLES_KEY, roles);
