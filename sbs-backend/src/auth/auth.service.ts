import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const DUMMY_HASH =
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8i6/pV0vR2qhxXY9q1z2NkVHrXz5R6';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.password ?? DUMMY_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Never return the password hash to the caller.
    const { password, ...safeUser } = user;
    return safeUser;
  }
}