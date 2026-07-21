import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, AuthUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto);
    return { user };
  }

  // ── Admin profile (Task: editable admin profile) ───────────────────────
  @Get('profile')
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.sub);
  }

  @Put('profile')
  async updateProfile(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.authService.updateProfile(user.sub, body);
  }
}