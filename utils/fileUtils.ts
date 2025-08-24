export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isImageFile = (type: string): boolean => {
  return type.startsWith('image/')
}

export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file.type)) {
      resolve('')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase()
  
  try {
    if (fileType === 'text/plain') {
      // Handle text files
      return await file.text()
    } else if (fileType === 'application/json') {
      // Handle JSON files
      const content = await file.text()
      return `JSON Content:\n${JSON.stringify(JSON.parse(content), null, 2)}`
    } else if (fileType.includes('text/') || fileType === 'text/csv') {
      // Handle other text-based files
      return await file.text()
    } else if (fileType === 'application/pdf') {
      // For PDF files, we'll need to use a PDF parser
      // For now, return a placeholder - we'll implement PDF parsing separately
      return `[PDF File: ${file.name} - Content extraction not yet implemented. Please describe what's in this PDF file.]`
    } else if (fileType.includes('image/')) {
      // For images, return description prompt
      return `[Image File: ${file.name} - Please analyze this image and describe what you see.]`
    } else {
      // For other file types
      return `[File: ${file.name} (${fileType}) - Please let me know what you'd like me to help you with regarding this file.]`
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    return `[Error reading file: ${file.name}]`
  }
}

export const canExtractText = (fileType: string): boolean => {
  const extractableTypes = [
    'text/plain',
    'application/json',
    'text/csv',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'text/xml',
    'application/xml'
  ]
  
  return extractableTypes.includes(fileType.toLowerCase()) || fileType.startsWith('text/')
}

export const getFileDescription = (file: File): string => {
  const fileType = file.type.toLowerCase()
  const fileName = file.name
  const fileSize = formatFileSize(file.size)
  
  if (fileType.includes('image/')) {
    return `Image: ${fileName} (${fileSize})`
  } else if (fileType === 'application/pdf') {
    return `PDF Document: ${fileName} (${fileSize})`
  } else if (fileType.includes('text/') || canExtractText(fileType)) {
    return `Text Document: ${fileName} (${fileSize})`
  } else {
    return `File: ${fileName} (${fileSize}, ${fileType})`
  }
}
