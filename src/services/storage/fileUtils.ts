// services/storage/fileUtils.ts
import { randomUUID } from "crypto";
import { getStorageAdapter } from "@/src/services/storage/client/storageClient";
import { AddFile } from "@/src/db/data-access/file/query";

// Utility function to handle file upload
export const uploadFileAndSaveMetadata = async (
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  folderPath: string = "/"
) => {
  try {
    const uniqueFileName = `${randomUUID()}-${fileName}`;

    const adapter = getStorageAdapter();

    const fileUrl = await adapter.uploadFile(fileBuffer, uniqueFileName, fileType, folderPath);

    const fileRecord = await AddFile({
      file_name: fileName,
      file_size: fileBuffer.length,
      file_type: fileType,
      file_path: fileUrl,
    });

    return { fileUrl, fileRecord };
  } catch (error :any) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};
