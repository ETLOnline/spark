"use server"

import * as Minio from "minio"
import { promises as fs } from "fs"
import * as path from "path"
import { randomUUID } from "crypto"

export const uploadFileToBucket = async (
  fileName: string,
  fileBase64: string
) => {
  const minioClient = new Minio.Client({
    endPoint: "minio-jwogs4w.scrumwiz.com",
    accessKey: "4DkHAY5RCdK0cPX7",
    secretKey: "yRMP7bwI55PNZivrowHq10BUxohvb2ab"
  })
  const bucket = "profile"
  // Create temporary file with unique name
  const tempFilePath = path.join("/tmp", `${randomUUID()}-${fileName}`)
  // Convert base64 to Buffer
  const fileBuffer = Buffer.from(fileBase64.split(",")[1], "base64")
  // Write buffer to temporary file
  await fs.writeFile(tempFilePath, fileBuffer)
  // Check/create bucket
  const exists = await minioClient.bucketExists(bucket)
  if (!exists) {
    await minioClient.makeBucket(bucket, "us-east-1")
  }
  // Upload file
  await minioClient.fPutObject(bucket, fileName, tempFilePath)
  const signedUrl = await minioClient.presignedGetObject(bucket, fileName)
  const delTempFile = () => {
    fs.unlink(tempFilePath)
  }
  return { url: signedUrl, delTempFile }
}
