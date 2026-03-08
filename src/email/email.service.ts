import * as nodemailer from 'nodemailer';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export type SendTestEmailDto = {
  to: string;
  subject?: string;
  text?: string;
};

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new HttpException(
        'SMTP chưa cấu hình (SMTP_HOST, SMTP_USER, SMTP_PASS)',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const from = process.env.SMTP_FROM || user;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: true },
    });

    return this.transporter;
  }

  async sendTestEmail(dto: SendTestEmailDto): Promise<{ success: boolean; messageId?: string }> {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `"Test" <${from}>`,
      to: dto.to,
      subject: dto.subject ?? 'Test email từ backend',
      text: dto.text ?? 'Đây là email test từ AWS SES SMTP.',
      html: dto.text
        ? `<p>${dto.text.replace(/\n/g, '<br>')}</p>`
        : '<p>Đây là email test từ AWS SES SMTP.</p>',
    });

    return { success: true, messageId: info.messageId };
  }
}
