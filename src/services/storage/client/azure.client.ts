import { BlobServiceClient } from "@azure/storage-blob"
import { DefaultAzureCredential } from "@azure/identity"
import {
  AZURE_CONTAINER_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_STORAGE_ACCOUNT_NAME
} from "../config"

export const azureClient = () => {
  let blobServiceClient: BlobServiceClient
  if (AZURE_STORAGE_ACCOUNT_KEY) {
    // Use connection string if key is present (local/dev)
    const azureConnectionString = `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`
    blobServiceClient = BlobServiceClient.fromConnectionString(
      azureConnectionString
    )
  } else {
    // Use Managed Identity (DefaultAzureCredential) in Azure
    const accountUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
    blobServiceClient = new BlobServiceClient(
      accountUrl,
      new DefaultAzureCredential()
    )
  }
  const containerClient =
    blobServiceClient?.getContainerClient(AZURE_CONTAINER_NAME)
  return containerClient
}
