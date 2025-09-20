"use server"
import {
  CreateFile,
  CreateFolder,
  GetDirectoryContents,
  DeleteFile,
  searchFoldersBySlug
} from "@/src/db/data-access/file-sharing/query"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { getStorageClient } from "@/src/services/storage/client/storage.client"
import { db } from "@/src/db"
import { spaceFileDirectoryTable } from "@/src/db/schema"
import { eq } from "drizzle-orm"

export const CreateNewFolderAction = CreateServerAction(
  true,
  async (id: string | number, folderName: string, folderSlug: string) => {
    try {
      const result = await CreateFolder(id, folderName, folderSlug)
      return { success: true, data: result[0] }
    } catch (error) {
      console.error("Error creating folder:", error)
      return {
        success: false,
        error: "Failed to create folder"
      }
    }
  }
)

export const SearchFolderBySlugAction = CreateServerAction(
  true,
  async (id: string | number, slug: string, isRoot: boolean) => {
    try {
      const result = await searchFoldersBySlug(id, slug, isRoot)
      return { success: true, data: result }
    } catch (error) {
      console.error("Error searching folder:", error)
      return {
        success: false,
        error: "Failed to search folder"
      }
    }
  }
)

export const CreateNewFileAction = CreateServerAction(
  true,
  async (
    id: string | number,
    fileName: string,
    fileSize: number,
    fileB64string: string,
    fileType: string,
    folderPath: string
  ) => {
    try {
      const user = await AuthUserAction()
      if (!user) {
        return {
          success: false,
          error: "Unauthorized"
        }
      }
      const fileBuffer = base64ToBuffer(fileB64string)
      const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        folderPath
      )

      const result = await CreateFile(
        id,
        fileName,
        fileSize,
        fileRecord.id,
        user.unique_id
      )
      return {
        success: true,
        data: { ...result[0], url: fileUrl }
      }
    } catch (error) {
      console.error("Error creating file:", error)
      return {
        success: false,
        error: "Failed to create file"
      }
    }
  }
)

export const GetDirectoryContentsAction = CreateServerAction(
  true,
  async (id: string | number) => {
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
)

export const DeleteFileAction = CreateServerAction(
  true,
  async (directoryId: number, spaceId: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) {
        return {
          success: false,
          error: "Unauthorized"
        }
      }

      // Check if user owns the file
      const fileEntry = await db.query.spaceFileDirectoryTable.findFirst({
        where: eq(spaceFileDirectoryTable.id, directoryId),
        with: {
          file: true
        }
      })
      if (!fileEntry || fileEntry.entity_type !== "file") {
        return {
          success: false,
          error: "File not found"
        }
      }
      if (fileEntry.created_by !== user.unique_id) {
        return {
          success: false,
          error: "You can only delete files that you uploaded"
        }
      }

      // Delete from database
      const deletedEntry = await DeleteFile(directoryId)

      // Delete from storage if file exists
      if (deletedEntry.file?.file_path) {
        try {
          const storageClient = getStorageClient()
          await storageClient.deleteFile({
            filePath: deletedEntry.file.file_path
          })
        } catch (storageError) {
          console.error("Error deleting file from storage:", storageError)
        }
      }

      return {
        success: true,
        data: deletedEntry
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      return {
        success: false,
        error: "Failed to delete file"
      }
    }
  }
)
