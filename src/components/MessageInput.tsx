import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { FileAttachment } from '../types';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void; 
  placeholder?: string;
  theme?: 'light' | 'dark';
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Message ChatGPT",
  theme = 'light'
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFilesAdded = (newFiles: FileAttachment[]) => {
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setAttachments(prev => prev.filter(file => file.id !== id));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className={`px-4 pb-6 ${theme === 'dark' ? 'bg-[#343541]' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className={`relative rounded-3xl shadow-lg border ${
            theme === 'dark' 
              ? 'bg-[#40414f] border-[#565869]' 
              : 'bg-white border-gray-200'
          }`}>
            {/* File attachments display */}
            {attachments.length > 0 && (
              <div className={`px-4 pt-3 pb-2 border-b ${theme === 'dark' ? 'border-[#565869]' : 'border-gray-200'}`}>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <div key={file.id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      theme === 'dark' ? 'bg-[#565869] text-white' : 'bg-white text-gray-800'
                    }`}>
                      <span className="truncate max-w-32">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 p-3">
              {/* File Upload */}
              <div className="flex-shrink-0">
                <FileUpload
                  onFilesAdded={handleFilesAdded}
                />
              </div>
              
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`flex-1 bg-transparent border-none outline-none resize-none min-h-[24px] max-h-32 focus:outline-none ${
                  theme === 'dark' 
                    ? 'placeholder-gray-400 text-white' 
                    : 'placeholder-gray-500 text-gray-900'
                }`}
                rows={1}
              />
              
              {/* Right side buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!message.trim() && attachments.length === 0 && (
                  <button
                    type="button"
                    className={`p-2 transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                
                {(message.trim() || attachments.length > 0) && (
                  <button
                    type="submit"
                    className={`p-2 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400'
                        : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500'
                    } disabled:cursor-not-allowed`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer text */}
        <div className="text-center mt-3">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            ChatGPT can make mistakes. Check important info. 
            <button className="underline ml-1 hover:text-gray-600">
              See Cookie Preferences
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};