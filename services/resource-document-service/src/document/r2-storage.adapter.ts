import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2StorageAdapter {
  private readonly logger = new Logger(R2StorageAdapter.name);
  private s3Client: S3Client;
  private readonly bucketName = process.env.R2_BUCKET_NAME || 'odos-docs';

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || 'https://<account-id>.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || 'dummy-key',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'dummy-secret',
      },
    });
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      this.logger.debug(`File uploaded successfully to R2: ${key}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload file ${key} to R2: ${error.message}`);
      throw error;
    }
  }

  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: any) {
      this.logger.error(`Failed to generate presigned URL for ${key}: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.debug(`File deleted successfully from R2: ${key}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete file ${key} from R2: ${error.message}`);
      throw error;
    }
  }
}
