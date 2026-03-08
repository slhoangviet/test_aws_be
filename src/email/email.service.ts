import {
  SESClient,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export type SendTestEmailDto = {
  to: string;
  subject?: string;
  text?: string;
};

@Injectable()
export class EmailService {
  private client: SESClient | null = null;

  private getClient(): SESClient {
    if (this.client) return this.client;
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-southeast-2';
    this.client = new SESClient({ region });
    return this.client;
  }

  private getFromAddress(): string {
    const from = process.env.SES_FROM;
    if (!from) {
      throw new HttpException(
        'SES_FROM chưa cấu hình (email/domain đã verify trong SES)',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return from;
  }

  async sendTestEmail(dto: SendTestEmailDto): Promise<{ success: boolean; messageId?: string }> {
    const ses = this.getClient();
    const from = this.getFromAddress();

    const textContent = dto.text ?? 'Đây là email test từ AWS SES (IAM).';
    const htmlContent = textContent
      ? `<p>${textContent.replace(/\n/g, '<br>')}</p>`
      : '<p>Đây là email test từ AWS SES (IAM).</p>';

    const params: SendEmailCommandInput = {
      Source: `"Test" <${from}>`,
      Destination: { ToAddresses: [dto.to] },
      Message: {
        Subject: { Data: dto.subject ?? 'Test email từ backend', Charset: 'UTF-8' },
        Body: {
          Text: { Data: textContent, Charset: 'UTF-8' },
          Html: { Data: htmlContent, Charset: 'UTF-8' },
        },
      },
    };

    const result = await ses.send(new SendEmailCommand(params));
    return { success: true, messageId: result.MessageId };
  }
}
