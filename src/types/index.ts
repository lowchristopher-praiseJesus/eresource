export type ResourceCategory = 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'PICTURE'
export type ResourceType = 'FILE' | 'YOUTUBE'

export interface PresignResponse {
  url: string
  key: string
}

export interface PresignRequest {
  filename: string
  contentType: string
  fileSizeBytes: number
}
