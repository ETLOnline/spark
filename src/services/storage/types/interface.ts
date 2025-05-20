export interface StorageAdapter {
  uploadFile(params: {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    folderPath?: string;
  }): Promise<string>;
}
