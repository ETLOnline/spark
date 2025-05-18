import { BlobServiceClient } from "@azure/storage-blob";
import { StorageAdapter } from "./interface";
import { randomUUID } from "crypto";

const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const containerName = process.env.AZURE_CONTAINER_NAME!;

const azureConnectionString = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

export const AzureStorageAdapter: StorageAdapter = {
  async uploadFile(fileBuffer, fileName, mimeType) {
    const blobName = `${randomUUID()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  },
};