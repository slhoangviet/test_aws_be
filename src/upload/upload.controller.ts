import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new HttpException('Only image files are allowed', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.uploadService.uploadImage(file);
      return {
        success: true,
        url: result.url,
        key: result.key,
        file: result.fileRecord,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Upload error:', error);
      throw new HttpException('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('files')
  async listFiles() {
    const files = await this.uploadService.listFiles();
    return {
      success: true,
      items: files,
    };
  }

  @Delete('files/:id')
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.uploadService.deleteFile(id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      if (message === 'File not found') {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
