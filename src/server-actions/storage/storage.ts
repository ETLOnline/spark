"use server"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { CreateServerAction } from ".."
import { getStorageClient } from "@/src/services/storage/client/storage.client"

export const AddImageToStorageAction = CreateServerAction(
  true,
  async (
    fileName: string,
    fileB64string: string,
    fileType: string,
    folder: string
  ) => {
    try {
      const fileBuffer = base64ToBuffer(fileB64string)

      const { fileUrl } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        folder
      )

      return { success: true, data: fileUrl }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DownloadImageFromStorageAction = CreateServerAction(
  true,
  async (filePath: string) => {
    try {
      const storageClient = getStorageClient()
      const result = await storageClient.downloadFile({ filePath })

      // Convert buffer to base64 data URL
      const base64 = result.buffer.toString("base64")
      const dataUrl = `data:${result.contentType};base64,${base64}`

      return {
        success: true,
        data: {
          dataUrl,
          fileName: result.fileName,
          contentType: result.contentType
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to download file"
      }
    }
  }
)
