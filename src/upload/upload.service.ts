import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { Express } from 'express';
import { FileRepository, type FileRecord } from './file.repository';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnBaseUrl: string;

  constructor(private readonly fileRepository: FileRepository) {
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    const bucket = process.env.AWS_S3_BUCKET;
    const cdnBaseUrl =
      process.env.CDN_BASE_URL || '';

    if (!bucket) {
      // eslint-disable-next-line no-console
      console.warn('[UploadService] AWS_S3_BUCKET is not set; upload will fail until configured.');
    }

    // Không truyền credentials: SDK dùng default credential chain (IAM role trên EC2/ECS/Lambda, hoặc env/shared config khi chạy local).
    this.s3Client = new S3Client({ region });
    this.bucketName = bucket || '';
    this.cdnBaseUrl = cdnBaseUrl.replace(/\/+$/, '');
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string; fileRecord: FileRecord }> {
    if (!file) {
      throw new Error('File is required');
    }

    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }

    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '-');
    const key = `uploads/${timestamp}-${sanitizedOriginalName}`;

    const contentType =
      file.mimetype && file.mimetype.startsWith('image/')
        ? file.mimetype
        : 'application/octet-stream';

    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(putCommand);

    const url = this.getPublicUrl(key);
    const row = await this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key: key,
    });
    const fileRecord: FileRecord = { ...row, s3Url: url };

    return { url, key, fileRecord };
  }

  private getPublicUrl(key: string): string {
    return `${this.cdnBaseUrl}/${key}`;
  }

  async listFiles(): Promise<FileRecord[]> {
    const files = await this.fileRepository.findAll();
    const withCdnUrls = files.map((f) => ({
      ...f,
      s3Url: this.getPublicUrl(f.s3Key),
    }));
    return withCdnUrls;
  }

  async deleteFile(id: number): Promise<void> {
    const row = await this.fileRepository.findById(id);
    if (!row) throw new Error('File not found');

    if (this.bucketName) {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: row.s3Key }),
      );
    }
    await this.fileRepository.deleteById(id);
  }
}
