export interface StorageAdapter {
  uploadFile: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
}