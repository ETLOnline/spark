import {
  StorageAdapter,
  UploadFileParams,
  DeleteFileParams
} from "../types/interface"
import { randomUUID } from "crypto"
import { azureClient } from "../client/azure.client"

export const AzureStorageAdapter: StorageAdapter = {
  async uploadFile({
    fileBuffer,
    fileName,
    mimeType,
    folderPath
  }: UploadFileParams) {
    const blobName = `${folderPath}/${randomUUID()}-${fileName}`
    const blockBlobClient = azureClient().getBlockBlobClient(blobName)

    // Upload file buffer to Azure
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType }
    })

    return blockBlobClient.url
  },

  async deleteFile({ filePath }: DeleteFileParams) {
    try {
      // Extract blob name from URL or use direct path
      let blobName = filePath

      // If it's a full URL, extract the blob name
      if (filePath.includes("blob.core.windows.net")) {
        const url = new URL(filePath)
        const pathParts = url.pathname.split("/")
        blobName = pathParts.slice(2).join("/") // Remove container name
      }

      const blockBlobClient = azureClient().getBlockBlobClient(blobName)
      await blockBlobClient.delete()
    } catch (error) {
      console.error("Error deleting file from Azure:", error)
      throw new Error("Failed to delete file from storage")
    }
  }
}
