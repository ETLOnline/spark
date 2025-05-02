import { db } from "@/src/db"
import {
  checkFileInDirectory,
  CreateFile,
  CreateFolder,
  deleteFileFromDirectory,
  GetDirectoryContents
} from "@/src/db/data-access/file-sharing/query"
import { getFileById } from "@/src/db/data-access/file/query"
import { filesTable, spaceFileDirectoryTable } from "@/src/db/schema"
import {
  addFileToDb,
  deleteFileFromDb,
  deleteFileFromS3
} from "@/src/utils/serverHelpers"
import { and, eq } from "drizzle-orm"

export async function CreateNewFolderAction(
  id: string | number,
  folderName: string
) {
  try {
    const result = await CreateFolder(id, folderName)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating folder:", error)
    return {
      success: false,
      error: "Failed to create folder"
    }
  }
}

export async function CreateNewFileAction(
  id: string | number,
  fileName: string,
  fileSize: number,
  fileB64string: string,
  fileType: string,
  created_by: string
) {
  try {
    const uploadedFileData = await addFileToDb(
      fileName as string,
      fileB64string as string,
      process.env.S3_BUCKET_NAME as string,
      fileSize as number,
      fileType as string,
      "/spaces",
      created_by as string
    )
    const result = await CreateFile(
      id,
      fileName,
      fileSize,
      uploadedFileData[0].id
    )
    return {
      success: true,
      data: { ...result[0], url: uploadedFileData[0].file_path }
    }
  } catch (error) {
    console.error("Error creating file:", error)
    return {
      success: false,
      error: "Failed to create file"
    }
  }
}

export const deleteFileAction = async (
  fileId: number,
  userId: string,
  isAdmin: boolean
) => {
  try {
    const file = await getFileById(fileId)

    if (!isAdmin && file.created_by !== userId) {
      throw new Error(
        "Unauthorized: You can only delete your own files or be an admin."
      )
    }

    const s3DeletionResult = await deleteFileFromS3(
      file.file_path,
      process.env.S3_BUCKET_NAME as string
    )

    if (!s3DeletionResult.success) {
      throw new Error(s3DeletionResult.message)
    }

    const dbDeletionResult = await deleteFileFromDb(fileId)

    if (!dbDeletionResult.success) {
      throw new Error(dbDeletionResult.message)
    }

    const fileInDirectory = await checkFileInDirectory(fileId)

    if (!fileInDirectory) {
      throw new Error("File not found in directory structure")
    }
    const dirDeletionResult = await deleteFileFromDirectory(fileId)

    if (!dirDeletionResult.success) {
      throw new Error("Failed to delete file from directory structure")
    }

    return {
      success: true,
      message: "File deleted successfully",
      data: dbDeletionResult.data
    }
  } catch (error: any) {
    console.error("Error deleting file:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function GetDirectoryContentsAction(id: string | number) {
  try {
    const results = await GetDirectoryContents(id)
    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error("Error fetching directory contents:", error)
    return {
      success: false,
      error: "Failed to fetch directory contents"
    }
  }
}
