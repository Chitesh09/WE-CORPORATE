import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Storage Configuration (Cloudflare R2 or S3 Compatible)
const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
export const BUCKET_NAME = process.env.R2_BUCKET_NAME || "we-corporate-storage";

// S3 Client configured for Cloudflare R2 endpoint
export const s3Client = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export interface IStorageService {
  getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<string>;
  getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  copyFile(sourceKey: string, destinationKey: string): Promise<void>;
  deleteFile(key: string): Promise<void>;
}

export class CloudflareR2StorageService implements IStorageService {
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 900 // 15 minutes
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds = 900 // 15 minutes
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });
    await s3Client.send(command);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  }
}

export const storageService = new CloudflareR2StorageService();
