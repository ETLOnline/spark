import * as Minio from "minio";
import { promises as fs } from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { StorageAdapter } from "./interface";

const tempFolderPath = "/tmp"; // or your preferred temp folder, adjust for Windows

export const S3StorageAdapter: StorageAdapter = {
  async uploadFile(fileBuffer, fileName, mimeType) {
    if (!process.env.S3_ENDPOINT) {
      throw new Error("S3_ENDPOINT not set");
    }

    const s3Client = new Minio.Client({
      endPoint: process.env.S3_ENDPOINT,
      accessKey: process.env.S3_ACCESS_KEY!,
      secretKey: process.env.S3_SECRET_KEY!,
    });

    const bucket = process.env.S3_BUCKET_NAME!;
    const folderPath = "/spaces"; // or pass as env or param if dynamic

    const bucketFileName = `${randomUUID()}-${fileName}`;

    const tempFilePath = path.join(tempFolderPath, bucketFileName);
    const filePath = path.join(folderPath, bucketFileName);

    await fs.writeFile(tempFilePath, fileBuffer);

    const exists = await s3Client.bucketExists(bucket);
    if (!exists) {
      await s3Client.makeBucket(bucket, process.env.S3_REGION);
    }

    await s3Client.fPutObject(bucket, filePath, tempFilePath);

    const signedUrl = await s3Client.presignedGetObject(bucket, filePath);

    await fs.unlink(tempFilePath);

    return signedUrl;
  },
};