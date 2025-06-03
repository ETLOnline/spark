export interface CreateFilePostParams {
  type: string
  fileSize: number
  fileName: string
  fileType: string
  fileBase64: string
  content?: string
  category?: string
  entityType?: string
  entityId?: string
  folderPath?: string
}

export interface UploadFileParams {
  fileBuffer: Buffer
  fileName: string
  mimeType: string
  folderPath?: string
}

export interface StorageAdapter {
  uploadFile(params: UploadFileParams): Promise<string>
}
