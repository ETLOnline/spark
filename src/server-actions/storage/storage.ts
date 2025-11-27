"use server"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { CreateServerAction } from ".."

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
