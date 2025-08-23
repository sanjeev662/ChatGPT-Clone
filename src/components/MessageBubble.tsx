import React, { useState } from 'react';
import { Edit2, Copy, RotateCcw, Check, X, User, Bot, Image, File, ThumbsUp, ThumbsDown, Share } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { formatFileSize, isImageFile } from '../utils/fileUtils';

interface MessageBubbleProps {
  message: Message;
  onEdit: (messageId: string, newContent: string) => void;
  onToggleEdit: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  theme?: 'light' | 'dark';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onEdit,
  onToggleEdit,
  onRegenerate,
  theme = 'light'
}) => {
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const handleSaveEdit = () => {
    onEdit(message.id, editContent);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    onToggleEdit(message.id);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`px-4 py-3 ${theme === 'dark' ? 'bg-[#343541]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {/* Message Content */}
          <div className={`max-w-2xl ${isUser ? 'order-first' : 'order-last'}`}>
            <div className={`rounded-2xl px-3 py-2 ${
              isUser 
                ? (theme === 'dark' 
                    ? 'bg-[#444654] text-white' 
                    : 'bg-[#f1f1f1] text-gray-800'
                  )
                : (theme === 'dark' 
                    ? 'bg-transparent text-white' 
                    : 'bg-white text-gray-800'
                  )
            }`}>
              {message.isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={`w-full p-3 border rounded-lg resize-none min-h-[100px] ${
                      theme === 'dark' 
                        ? 'bg-[#40414f] border-[#565869] text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {message.attachments.map((file) => (
                        <div key={file.id} className={`border rounded-lg p-2 ${
                          theme === 'dark' ? 'border-[#565869] bg-[#40414f]' : 'border-gray-200 bg-gray-50'
                        }`}>
                          {isImageFile(file.type) && file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded mb-1"
                            />
                          ) : (
                            <div className={`w-full h-24 flex items-center justify-center rounded mb-1 ${
                              theme === 'dark' ? 'bg-[#565869]' : 'bg-gray-100'
                            }`}>
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <p className={`text-xs font-medium truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>{file.name}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`prose prose-sm max-w-none ${
                    theme === 'dark' 
                      ? 'prose-invert text-white [&_*]:text-white' 
                      : 'text-gray-800'
                  }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={theme === 'dark' ? oneDark : oneLight}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons - Only for GPT messages - Aligned with message bubble */}
            {!message.isEditing && !isUser && (
              <div className="flex items-center gap-1 mt-2 px-4">
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-[#565869]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Copy"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-[#565869]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-[#565869]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                
                {onRegenerate && (
                  <button
                    onClick={() => onRegenerate(message.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-white hover:bg-[#565869]' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-[#565869]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Share"
                >
                  <Share className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Edit Button - Only for User messages */}
            {!message.isEditing && isUser && (
              <div className="flex items-center gap-1 mt-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleEdit(message.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-[#565869]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Edit message"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};