import { BlobServiceClient } from "@azure/storage-blob"
import {
  AZURE_CONTAINER_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_STORAGE_ACCOUNT_NAME
} from "../config"

export const azureClient = () => {
  const azureConnectionString = `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    azureConnectionString
  )
  const containerClient =
    blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME)
  return containerClient
}
