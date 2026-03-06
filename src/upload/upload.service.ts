import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Express } from 'express';
import { FileRepository, type FileRecord } from './file.repository';

/** Presigned URL tối đa 7 ngày (AWS). Dùng khi list/trả URL cho FE — mỗi lần mở trang sẽ có URL mới. */
const PRESIGNED_URL_EXPIRES_IN = 3600; // 1 giờ (đủ dùng vì list lại là có URL mới)

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly fileRepository: FileRepository) {
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    const bucket = process.env.AWS_S3_BUCKET;

    if (!bucket) {
      // eslint-disable-next-line no-console
      console.warn('[UploadService] AWS_S3_BUCKET is not set; upload will fail until configured.');
    }

    // Không truyền credentials: SDK dùng default credential chain (IAM role trên EC2/ECS/Lambda, hoặc env/shared config khi chạy local).
    this.s3Client = new S3Client({ region });
    this.bucketName = bucket || '';
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

    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    const url = await this.getPresignedUrl(key);
    const row = await this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key: key,
    });
    const fileRecord: FileRecord = { ...row, s3Url: url };

    return { url, key, fileRecord };
  }

  /**
   * Tạo presigned URL on-demand. Gọi khi list files để FE luôn có URL còn hiệu lực
   * (presigned không thể vô thời hạn, tối đa 7 ngày; tạo mới mỗi lần list là hợp lý).
   */
  async getPresignedUrl(key: string): Promise<string> {
    if (!this.bucketName) throw new Error('AWS_S3_BUCKET is not configured');
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, getCommand, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });
  }

  async listFiles(): Promise<FileRecord[]> {
    const files = await this.fileRepository.findAll();
    const withFreshUrls = await Promise.all(
      files.map(async (f) => ({
        ...f,
        s3Url: await this.getPresignedUrl(f.s3Key),
      })),
    );
    return withFreshUrls;
  }
}
