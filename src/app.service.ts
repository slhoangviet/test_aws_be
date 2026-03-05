import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Express } from 'express';

@Injectable()
export class AppService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = process.env.AWS_S3_BUCKET;

    if (!accessKeyId || !secretAccessKey || !bucket) {
      // Trong demo này chỉ log cảnh báo, thực tế nên dùng ConfigModule và validate env
      // eslint-disable-next-line no-console
      console.warn(
        '[AppService] Missing AWS env vars: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_BUCKET',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });

    this.bucketName = bucket || '';
    this.publicBaseUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com`;
  }

  getHello(): string {
    return 'Hello from NestJS backend!';
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; key: string }> {
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
      ACL: 'public-read',
    });

    await this.s3Client.send(putCommand);

    const url = `${this.publicBaseUrl}/${key}`;
    return { url, key };
  }
}

