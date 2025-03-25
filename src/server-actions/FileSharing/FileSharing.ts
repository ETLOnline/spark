import {
  CreateFolder,
  GetDirectoryContents
} from "@/src/db/data-access/file-sharing/query"

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
