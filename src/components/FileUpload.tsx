import React, { useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { FileAttachment } from '../types';
import { processFiles } from '../utils/fileUtils';

interface FileUploadProps {
  onFilesAdded: (files: FileAttachment[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAdded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (validFiles.length > 0) {
      const attachments = await processFiles(validFiles);
      onFilesAdded(attachments);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Attach files"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {dragActive && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-white p-8 rounded-lg border-2 border-dashed border-blue-400">
            <p className="text-lg font-medium">Drop files here to upload</p>
          </div>
        </div>
      )}
    </div>
  );
};