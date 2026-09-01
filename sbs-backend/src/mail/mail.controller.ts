import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async testEmail(@Body('email') email: string) {
    await this.mailService.sendTestEmail(
      email || 'it.sbsgroups@gmail.com',
      '✅ Test Email from SBS Groups',
      'Hello!\n\nThis is a test email from your SBS Groups backend.\n\nYour email configuration is working perfectly! ✅\n\nRegards,\nSBS Groups System',
    );
    return { success: true, message: `Test email sent to ${email || 'it.sbsgroups@gmail.com'}` };
  }
}