import { BlobServiceClient } from "@azure/storage-blob";
import { StorageAdapter } from "../types/interface";
import { randomUUID } from "crypto";
import {
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_CONTAINER_NAME,
} from "../config";

const azureConnectionString = `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`;
const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString);
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

export const AzureStorageAdapter: StorageAdapter = {
  async uploadFile({
  fileBuffer,
  fileName,
  mimeType,
  folderPath = "/",
}: {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  folderPath?: string;
}) {
    const blobName = `${folderPath}${randomUUID()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload file buffer to Azure
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  },
};
