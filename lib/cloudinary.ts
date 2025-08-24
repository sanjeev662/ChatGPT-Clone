import { v2 as cloudinary } from 'cloudinary'

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  original_filename: string
  bytes: number
  format: string
  resource_type: string
}

export async function uploadFile(
  file: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
    format?: string
    originalName?: string
    mimeType?: string
  } = {}
): Promise<UploadResult> {
  try {
    let fileToUpload: string
    
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to base64 data URL with proper MIME type
      const mimeType = options.mimeType || 'application/octet-stream'
      const base64 = file.toString('base64')
      fileToUpload = `data:${mimeType};base64,${base64}`
    } else {
      fileToUpload = file
    }

    const result = await cloudinary.uploader.upload(fileToUpload, {
      folder: options.folder || 'chatgpt-clone',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto',
      format: options.format,
      // Use original filename if provided
      ...(options.originalName && { original_filename: options.originalName }),
    })

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      original_filename: result.original_filename || options.originalName || '',
      bytes: result.bytes,
      format: result.format,
      resource_type: result.resource_type,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

export async function deleteFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file from Cloudinary')
  }
}

export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    fetch_format: 'auto',
  })
}

export default cloudinary
