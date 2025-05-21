import { StorageAdapter, UploadFileParams } from "../types/interface";
import { randomUUID } from "crypto";
import { azureClient } from "../client/azure.client";


export const AzureStorageAdapter: StorageAdapter = {
  async uploadFile({
  fileBuffer,
  fileName,
  mimeType,
  folderPath,
}: UploadFileParams) {
    const blobName = `${folderPath}/${randomUUID()}-${fileName}`;
    const blockBlobClient = azureClient().getBlockBlobClient(blobName);

    // Upload file buffer to Azure
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  },
};
