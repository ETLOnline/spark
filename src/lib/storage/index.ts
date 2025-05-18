import { StorageAdapter } from "./interface";
import { S3StorageAdapter } from "./s3.adapter";
import { AzureStorageAdapter } from "./azure.adapter";

export function getStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER;

  switch (provider) {
    case "s3":
      return S3StorageAdapter;
    case "azure":
      return AzureStorageAdapter;
    default:
      throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`);
  }
}