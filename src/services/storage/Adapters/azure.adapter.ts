import {
  StorageAdapter,
  UploadFileParams,
  DeleteFileParams,
  DownloadFileParams,
  DownloadFileResult
} from "../types/interface"
import { randomUUID } from "crypto"
import { azureClient } from "../client/azure.client"
import { Readable } from "stream"

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
      blobHTTPHeaders: {
        blobContentType: mimeType
      }
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
  },

  async downloadFile({
    filePath
  }: DownloadFileParams): Promise<DownloadFileResult> {
    try {
      // Extract blob name from URL or use direct path
      let blobName = filePath

      // If it's a full URL, extract the blob name
      if (filePath.includes("blob.core.windows.net")) {
        const url = new URL(filePath)
        const pathParts = url.pathname.split("/").filter(Boolean)

        if (pathParts.length > 1) {
          blobName = decodeURIComponent(pathParts.slice(1).join("/"))
        } else {
          throw new Error(
            `Invalid blob URL: missing blob path. URL: ${filePath}`
          )
        }
      }

      const containerClient = azureClient()
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)

      const exists = await blockBlobClient.exists()
      if (!exists) {
        throw new Error(`Blob does not exist: ${blobName}`)
      }

      const downloadResponse = await blockBlobClient.download(0)

      if (!downloadResponse.readableStreamBody) {
        throw new Error("Failed to download blob: no stream body")
      }

      // Convert Node.js ReadableStream to buffer
      const stream = downloadResponse.readableStreamBody as Readable
      const chunks: Buffer[] = []

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk))
      }

      const buffer = Buffer.concat(chunks)

      // Get content type from blob properties or default
      const contentType =
        downloadResponse.contentType || "application/octet-stream"

      // Extract filename from blob name (handle URL encoding)
      const fileName = decodeURIComponent(blobName.split("/").pop() || "file")

      return {
        buffer,
        contentType,
        fileName
      }
    } catch (error: any) {
      console.error("Azure download error:", {
        error: error.message,
        stack: error.stack,
        filePath
      })
      throw new Error(error.message || "Failed to download file from storage")
    }
  }
}
