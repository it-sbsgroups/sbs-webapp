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

  // ── Admin profile (Task: editable admin profile) ───────────────────────
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found.');
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; image?: string; designation?: string; currentPassword?: string; newPassword?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found.');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.designation !== undefined) updateData.designation = data.designation;

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new UnauthorizedException('That email is already in use.');
      }
      updateData.email = data.email;
    }

    if (data.newPassword) {
      const currentMatches = await bcrypt.compare(data.currentPassword || '', user.password);
      if (!currentMatches) {
        throw new UnauthorizedException('Current password is incorrect.');
      }
      if (data.newPassword.length < 8) {
        throw new UnauthorizedException('New password must be at least 8 characters.');
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data: updateData });
    const { password, ...safeUser } = updated;
    return safeUser;
  }
}