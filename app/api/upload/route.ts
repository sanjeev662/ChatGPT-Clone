import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/cloudinary'
import { extractTextFromFile, canExtractText } from '@/utils/fileUtils'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
const ALLOWED_TYPES = process.env.ALLOWED_FILE_TYPES?.split(',') || [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await uploadFile(buffer, {
      folder: 'chatgpt-clone/uploads',
      resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
      originalName: file.name,
      mimeType: file.type,
    })

    // Extract text content from file
    let textContent = ''
    try {
      if (canExtractText(file.type)) {
        textContent = await extractTextFromFile(file)
      }
    } catch (error) {
      console.error('Error extracting text content:', error)
    }

    // Return file information with text content
    return NextResponse.json({
      id: result.public_id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: result.secure_url,
      preview: file.type.startsWith('image/') ? result.secure_url : undefined,
      cloudinaryId: result.public_id,
      textContent, // Add the extracted text content
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get('publicId')
    
    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 })
    }

    // Delete from Cloudinary
    const { deleteFile } = await import('@/lib/cloudinary')
    await deleteFile(publicId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
