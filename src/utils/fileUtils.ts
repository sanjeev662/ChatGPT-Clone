import { FileAttachment } from '../types';

export const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
};

export const isDocumentFile = (type: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/json'
  ];
  return documentTypes.includes(type);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (isImageFile(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      resolve('');
    }
  });
};

export const processFiles = async (files: File[]): Promise<FileAttachment[]> => {
  const attachments: FileAttachment[] = [];
  
  for (const file of files) {
    const preview = await createFilePreview(file);
    const attachment: FileAttachment = {
      id: Date.now().toString() + Math.random().toString(36),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      preview
    };
    attachments.push(attachment);
  }
  
  return attachments;
};