'use client'

import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, Image, FileText, Loader2, AlertCircle, Paperclip } from 'lucide-react'
import { FileAttachment, UploadProgress } from '@/types'

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  theme?: 'light' | 'dark'
  disabled?: boolean
  mode?: 'button' | 'dropzone'
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    // Images
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/*',           // All images
    
    // Documents  
    'application/pdf',   // PDF files
    'application/msword', // .doc files
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
    
    // Text files
    'text/plain',        // .txt files
    'text/*',           // All text files
    
    // Other formats
    'application/json',  // .json files
    'text/csv',         // .csv files
  ],
  theme = 'light',
  disabled = false,
  mode = 'dropzone'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<FileAttachment> => {
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Initialize progress
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: { fileId, progress: 0, status: 'uploading' }
    }))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Update progress to completed
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { fileId, progress: 100, status: 'completed' }
      }))

      return result
    } catch (error) {
      // Update progress to error
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { 
          fileId, 
          progress: 0, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        }
      }))
      throw error
    }
  }

  const processFiles = useCallback(async (files: File[]) => {
    if (disabled) return

    const filesToUpload = files.slice(0, maxFiles - uploadedFiles.length)
    
    try {
      const uploadPromises = filesToUpload.map(uploadFile)
      const uploadedFileResults = await Promise.all(uploadPromises)
      
      const newFiles = [...uploadedFiles, ...uploadedFileResults]
      setUploadedFiles(newFiles)
      onFilesUploaded(newFiles)
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({})
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }, [disabled, maxFiles, uploadedFiles, onFilesUploaded])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles)
  }, [processFiles])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await processFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = async (index: number) => {
    const fileToRemove = uploadedFiles[index]
    
    // Delete from Cloudinary if it has a cloudinaryId
    if (fileToRemove.cloudinaryId) {
      try {
        await fetch(`/api/upload?publicId=${fileToRemove.cloudinaryId}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting file:', error)
      }
    }
    
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesUploaded(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    disabled,
    noClick: mode === 'button'
  })

  const getFileIcon = (file: FileAttachment) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const hasActiveUploads = Object.values(uploadProgress).some(p => p.status === 'uploading')

  // Button mode (for MessageInput)
  if (mode === 'button') {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || hasActiveUploads}
          className={`p-2 transition-colors ${
            disabled || hasActiveUploads
              ? 'text-gray-300 cursor-not-allowed'
              : theme === 'dark'
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Attach files"
        >
          {hasActiveUploads ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>
      </>
    )
  }

  // Dropzone mode
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled 
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer'
        } ${
          isDragActive
            ? theme === 'dark'
              ? 'border-chat-green bg-chat-green/10'
              : 'border-chat-green bg-chat-green/5'
            : theme === 'dark'
            ? 'border-chat-border hover:border-chat-green'
            : 'border-gray-300 hover:border-chat-green'
        }`}
      >
        <input {...getInputProps()} />
        {hasActiveUploads ? (
          <Loader2 className={`w-8 h-8 mx-auto mb-2 animate-spin ${theme === 'dark' ? 'text-chat-green' : 'text-chat-green'}`} />
        ) : (
          <Upload className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
        )}
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {hasActiveUploads
            ? 'Uploading files...'
            : isDragActive
            ? 'Drop files here...'
            : disabled
            ? 'File upload disabled'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB each
        </p>
      </div>

      {/* Upload Progress */}
      {Object.values(uploadProgress).map((progress) => (
        <div
          key={progress.fileId}
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            theme === 'dark'
              ? 'border-chat-border bg-chat-gray'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          {progress.status === 'uploading' && (
            <Loader2 className="w-4 h-4 animate-spin text-chat-green" />
          )}
          {progress.status === 'error' && (
            <AlertCircle className="w-4 h-4 text-chat-red" />
          )}
          <div className="flex-1">
            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {progress.status === 'uploading' && 'Uploading...'}
              {progress.status === 'error' && `Error: ${progress.error}`}
            </p>
            {progress.status === 'uploading' && (
              <div className={`w-full bg-gray-200 rounded-full h-1 mt-1 ${
                theme === 'dark' ? 'bg-chat-border' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-chat-green h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={file.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                theme === 'dark'
                  ? 'border-chat-border bg-chat-gray'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {file.name}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {file.preview && (
                <img 
                  src={file.preview} 
                  alt={`Preview of ${file.name}`}
                  className="w-10 h-10 object-cover rounded"
                />
              )}
              <button
                onClick={() => removeFile(index)}
                className={`p-1 rounded-full hover:bg-opacity-80 ${
                  theme === 'dark'
                    ? 'hover:bg-chat-border text-gray-400'
                    : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}