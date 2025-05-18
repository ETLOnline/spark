'use server'
import {
  CreateFile,
  CreateFolder,
  GetDirectoryContents
} from "@/src/db/data-access/file-sharing/query"
import { getStorageAdapter } from "@/src/lib/storage"
import { CreateServerAction } from ".."
import { AddFile } from "@/src/db/data-access/file/query" // Your DB insert function
import { randomUUID } from "crypto"

export const CreateNewFolderAction = CreateServerAction(true, async(
  id: string | number,
  folderName: string
)=>{
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
})

export const CreateNewFileAction = CreateServerAction(true, async(
  id: string | number,
  fileName: string,
  fileSize: number,
  fileB64string: string,
  fileType: string
)=>{
  try {
    const fileBuffer = Buffer.from(fileB64string.split(",")[1], "base64")

    const adapter = getStorageAdapter()

    const uniqueFileName = `${randomUUID()}-${fileName}`
    const fileUrl = await adapter.uploadFile(fileBuffer, uniqueFileName, fileType)
    const uploadedFileData = await AddFile({
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      file_path: fileUrl,
    })

    // 6. Link file to folder or parent entity
    const result = await CreateFile(
      id,
      fileName,
      fileSize,
      uploadedFileData[0].id
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
})

export const GetDirectoryContentsAction = CreateServerAction(true, async(id: string | number)=>{
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
})
