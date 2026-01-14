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

export interface DeleteFileParams {
  filePath: string
}

export interface DownloadFileParams {
  filePath: string
}

export interface DownloadFileResult {
  buffer: Buffer
  contentType: string
  fileName: string
}

export interface StorageAdapter {
  uploadFile(params: UploadFileParams): Promise<string>
  deleteFile(params: DeleteFileParams): Promise<void>
  downloadFile(params: DownloadFileParams): Promise<DownloadFileResult>
}
