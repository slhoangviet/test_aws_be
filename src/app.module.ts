import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [UploadModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

