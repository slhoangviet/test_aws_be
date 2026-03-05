import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Express } from 'express';

const PRESIGNED_URL_EXPIRES_IN = 3600; // 1 giờ

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = process.env.AWS_S3_BUCKET;

    if (!accessKeyId || !secretAccessKey || !bucket) {
      // eslint-disable-next-line no-console
      console.warn(
        '[UploadService] Missing AWS env vars: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_BUCKET',
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
    });

    await this.s3Client.send(putCommand);

    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    const url = await getSignedUrl(this.s3Client, getCommand, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });
    return { url, key };
  }
}
