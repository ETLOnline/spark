"use server"

import * as Minio from "minio"
import { promises as fs } from "fs"
import * as path from "path"
import { randomUUID } from "crypto"
import { AddFile } from "../db/data-access/file/query"
import { db } from "../db"
import { filesTable } from "../db/schema"
import { eq } from "drizzle-orm"

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
  created_by: string,
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
      file_path: signedUrl,
      created_by: created_by
    })
    return { ...fileData }
  } catch (error: any) {
    throw new Error(error)
  } finally {
    delFile()
  }
}

// Helper function to extract the file key from the URL
const extractFileKey = (fileUrl: string): string => {
  try {
    // Use the URL object to parse the URL and get the path
    const url = new URL(fileUrl);
    return url.pathname.replace(/^\/spark-dev\//, ''); // Remove any unwanted prefix, adjust if necessary
  } catch (error) {
    console.error("Error extracting file key from URL:", error);
    throw new Error("Invalid file URL");
  }
};

// Updated deleteFileFromS3 function
export const deleteFileFromS3 = async (filePath: string, bucket: string) => {
  if (!process.env.S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT not set")
  }

  try {
    const s3Client = new Minio.Client({
      endPoint: process.env.S3_ENDPOINT,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY
    });

    // Extract the file key if filePath is a full URL
    const fileKey = extractFileKey(filePath);

    // Delete the object from the S3 bucket using the correct file key
    await s3Client.removeObject(bucket, fileKey);

    return { success: true, message: "File deleted from S3 successfully" };
  } catch (error: any) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};


export const deleteFileFromDb = async (fileId: number) => {
  try {
    const deletedResult = await db
      .delete(filesTable)
      .where(eq(filesTable.id, fileId))
      .returning()

    if (deletedResult.length === 0) {
      throw new Error("File not found in database")
    }

    return {
      success: true,
      message: "File deleted from database successfully",
      data: deletedResult
    }
  } catch (error: any) {
    console.error("Error deleting file from database:", error)
    throw new Error("Failed to delete file from database")
  }
}
