"use server"

import * as Minio from "minio"
import { promises as fs } from "fs"
import * as path from "path"
import { randomUUID } from "crypto"
import { AddFile } from "../db/data-access/file/query"

export const uploadFileToBucket = async (
  fileName: string,
  fileBase64: string,
  bucket: string,
  folderPath: string,
  tempFolderPath = "/tmp"
) => {
  if (!process.env.S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT not set")
  }
  try {
    const s3Client = new Minio.Client({
      endPoint: process.env.S3_ENDPOINT,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY
    })
    // Create temporary file with unique name
    const bucketFileName = `${randomUUID()}-${fileName}`
    const tempFilePath = path.join(tempFolderPath, bucketFileName)
    const filePath = path.join(folderPath, bucketFileName)
    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(fileBase64.split(",")[1], "base64")
    // Write buffer to temporary file
    await fs.writeFile(tempFilePath, fileBuffer)
    // Check/create bucket
    const exists = await s3Client.bucketExists(bucket)
    if (!exists) {
      await s3Client.makeBucket(bucket, process.env.S3_REGION)
    }
    // Upload file
    await s3Client.fPutObject(bucket, filePath, tempFilePath)
    const signedUrl = await s3Client.presignedGetObject(bucket, filePath)
    const delTempFile = () => {
      fs.unlink(tempFilePath)
    }
    return { url: signedUrl, delTempFile }
  } catch (error: any) {
    throw new Error(error)
  }
}

export const addFileToDb = async (
  fileName: string,
  fileBase64: string,
  bucket: string,
  fileSize: number,
  fileType: string,
  folderPath: string,
  tempFolderPath = "/tmp"
) => {
  let delFile = () => {}
  try {
    const { url: signedUrl, delTempFile } = await uploadFileToBucket(
      fileName,
      fileBase64,
      bucket,
      folderPath,
      tempFolderPath
    )
    delFile = delTempFile
    const fileData = await AddFile({
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      file_path: signedUrl
    })
    return { ...fileData }
  } catch (error: any) {
    throw new Error(error)
  } finally {
    delFile()
  }
}
