import { Message } from '../types';

export const generateAIResponse = async (
  messages: Message[], 
  onChunk: (chunk: string) => void,
  onComplete: () => void
): Promise<void> => {
  const lastMessage = messages[messages.length - 1];

  let response = '';

  if (lastMessage.content.toLowerCase().includes('hello') || lastMessage.content.toLowerCase().includes('hi')) {
    response = "Hello! I'm Claude, an AI assistant created by Anthropic. I'm here to help you with a wide variety of tasks. What would you like to know or discuss today?";
  } else if (lastMessage.content.toLowerCase().includes('code')) {
    response = `I'd be happy to help you with coding! Here's a simple example:

\`\`\`javascript
function greetUser(name) {
  return \`Hello, \${name}! Welcome to our ChatGPT clone.\`;
}

console.log(greetUser("Developer"));
\`\`\`

This function demonstrates basic JavaScript syntax with template literals. Would you like me to explain any specific programming concepts or help with a particular coding challenge?`;
  } else if (lastMessage.attachments && lastMessage.attachments.length > 0) {
    const fileTypes = lastMessage.attachments.map(att => att.type).join(', ');
    response = `I can see you've uploaded ${lastMessage.attachments.length} file(s) with types: ${fileTypes}. While I can see the file information, I should note that this is a demo implementation. In a full implementation, I would be able to analyze the content of your files and provide detailed insights about them.`;
  } else {
    response = `That's an interesting question! Based on your message about "${lastMessage.content.slice(0, 50)}...", I can provide you with helpful information. This is a demonstration of how a ChatGPT-style interface works with streaming responses. The interface includes features like message editing, file uploads, conversation history, and responsive design optimized for both mobile and desktop use.`;
  }
  
  const words = response.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    const chunk = i === 0 ? words[i] : ' ' + words[i];
    onChunk(chunk);
  }
  
  onComplete();
};