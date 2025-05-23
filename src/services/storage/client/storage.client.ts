import { S3StorageAdapter } from "../Adapters/s3.adapter";
import { AzureStorageAdapter } from "../Adapters/azure.adapter";
import { STORAGE_PROVIDER } from "../config";

export const getStorageClient = () => {
  switch (STORAGE_PROVIDER.toLowerCase()) {
    case "azure":
      return AzureStorageAdapter;
    case "s3":
    default:
      return S3StorageAdapter;
  }
};
