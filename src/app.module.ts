import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { I18nModule } from './i18n/i18n.module';
import { I18nExceptionFilter } from './common/filters/i18n-exception.filter';

@Module({
  imports: [I18nModule, UploadModule, EmailModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: I18nExceptionFilter },
  ],
})
export class AppModule {}

