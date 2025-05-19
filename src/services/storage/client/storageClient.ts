import { S3StorageAdapter } from "../Adapters/s3.adapter";
import { AzureStorageAdapter } from "../Adapters/azure.adapter";
import { STORAGE_PROVIDER } from "../config";

// Create a function that returns the correct storage adapter
export const getStorageAdapter = () => {
  switch (STORAGE_PROVIDER.toLowerCase()) {
    case "azure":
      return AzureStorageAdapter;
    case "s3":
    default:
      return S3StorageAdapter;
  }
};
