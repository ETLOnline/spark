export interface StorageAdapter {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderPath?: string
  ): Promise<string>;
}
