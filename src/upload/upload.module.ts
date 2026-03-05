import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileRepository } from './file.repository';

@Module({
  controllers: [UploadController],
  providers: [UploadService, FileRepository],
  exports: [UploadService, FileRepository],
})
export class UploadModule {}
