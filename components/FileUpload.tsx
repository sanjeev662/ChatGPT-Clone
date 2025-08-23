'use client'

import React, { useRef } from 'react'
import { Paperclip } from 'lucide-react'
import { FileAttachment } from '@/types'
import { generateId } from '@/utils/storage'
import { createFilePreview } from '@/utils/fileUtils'

interface FileUploadProps {
  onFilesAdded: (files: FileAttachment[]) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedTypes?: string[]
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAdded,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', '.pdf', '.txt', '.doc', '.docx']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`)
        return false
      }
      return true
    }).slice(0, maxFiles)

    // Convert to FileAttachment objects
    const fileAttachments: FileAttachment[] = await Promise.all(
      validFiles.map(async (file) => {
        const preview = await createFilePreview(file)
        return {
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          preview
        }
      })
    )

    onFilesAdded(fileAttachments)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Attach files"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </>
  )
}
