"use server"
import {
  CreateFile,
  CreateFolder,
  GetDirectoryContents,
  DeleteFile
} from "@/src/db/data-access/file-sharing/query"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { isUserSpaceAdmin } from "@/src/utils/spaceRoleHelper"
import { getStorageClient } from "@/src/services/storage/client/storage.client"

export const CreateNewFolderAction = CreateServerAction(
  true,
  async (id: string | number, folderName: string) => {
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
      const fileBuffer = base64ToBuffer(fileB64string)
      const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        folderPath
      )

      const result = await CreateFile(id, fileName, fileSize, fileRecord.id)
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

      // Check if user is space admin
      const isSpaceAdmin = isUserSpaceAdmin(spaceId, user)
      if (!isSpaceAdmin) {
        return {
          success: false,
          error: "You don't have permission to delete files"
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
          // Continue even if storage deletion fails
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
