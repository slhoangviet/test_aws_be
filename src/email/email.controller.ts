import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService, SendTestEmailDto } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-test')
  async sendTest(@Body() body: SendTestEmailDto) {
    const email = typeof body.to === 'string' ? body.to.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new HttpException('Email người nhận không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.emailService.sendTestEmail({
        to: email,
        subject: body.subject,
        text: body.text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gửi email thất bại';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
