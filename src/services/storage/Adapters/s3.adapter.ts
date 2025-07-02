import { promises as fs } from "fs"
import * as path from "path"
import { randomUUID } from "crypto"
import {
  StorageAdapter,
  UploadFileParams,
  DeleteFileParams
} from "../types/interface"
import { S3_ENDPOINT, S3_BUCKET_NAME, S3_REGION } from "../config"
import { s3Client } from "../client/s3.client"
import * as os from "os"

const tempFolderPath = os.tmpdir()

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
  },

  async deleteFile({ filePath }: DeleteFileParams) {
    if (!S3_ENDPOINT) {
      throw new Error("S3_ENDPOINT not set")
    }

    const client = s3Client()
    const bucket = S3_BUCKET_NAME

    try {
      // Extract the object key from the signed URL or direct path
      let objectKey = filePath

      // If it's a signed URL, extract the object key
      if (filePath.includes(S3_ENDPOINT)) {
        const url = new URL(filePath)
        // remove the bucket name from the path
        objectKey = decodeURIComponent(url.pathname.substring(1)).replace(
          bucket,
          ""
        ) // Remove leading '/'
      }

      await client.removeObject(bucket, objectKey)
    } catch (error) {
      console.error("Error deleting file from S3:", error)
      throw new Error("Failed to delete file from storage")
    }
  }
}
