import {
  CreateFile,
  CreateFolder,
  GetDirectoryContents
} from "@/src/db/data-access/file-sharing/query"
import { addFileToDb } from "@/src/utils/serverHelpers"

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
  fileType: string
) {
  try {
    const uploadedFileData = await addFileToDb(
      fileName as string,
      fileB64string as string,
      process.env.S3_BUCKET_NAME as string,
      fileSize as number,
      fileType as string,
      "/spaces"
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
