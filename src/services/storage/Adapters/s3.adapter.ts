import * as Minio from "minio"
import { promises as fs } from "fs"
import * as path from "path"
import { randomUUID } from "crypto"
import { StorageAdapter, UploadFileParams } from "../types/interface"
import {
  S3_ENDPOINT,
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_BUCKET_NAME,
  S3_REGION
} from "../config"
import { s3Client } from "../client/s3.client"

const tempFolderPath = "/tmp" // Adjust if Windows or else

export const S3StorageAdapter: StorageAdapter = {
  async uploadFile({
    fileBuffer,
    fileName,
    mimeType,
    folderPath = "/"
  }: UploadFileParams) {
    if (!S3_ENDPOINT) {
      throw new Error("S3_ENDPOINT not set")
    }

    const client = s3Client()

    const bucket = S3_BUCKET_NAME
    const folder = folderPath.startsWith("/") ? folderPath.slice(1) : folderPath
    const bucketFileName = `${randomUUID()}-${fileName}`
    const filePath = path.posix.join(folder, bucketFileName)
    const tempFilePath = path.join(tempFolderPath, bucketFileName)

    // Write buffer to temp file
    await fs.writeFile(tempFilePath, fileBuffer)

    // Ensure bucket exists
    const exists = await client.bucketExists(bucket)
    if (!exists) {
      await client.makeBucket(bucket, S3_REGION)
    }

    // Upload file
    await client.fPutObject(bucket, filePath, tempFilePath)

    // Generate signed URL
    const signedUrl = await client.presignedGetObject(bucket, filePath)

    // Clean temp file
    await fs.unlink(tempFilePath)

    return signedUrl
  }
}
