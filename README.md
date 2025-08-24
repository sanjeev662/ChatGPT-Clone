# ChatGPT Clone - Advanced AI Chat Application

A pixel-perfect ChatGPT clone built with Next.js, featuring advanced capabilities including chat memory, file/image upload support, message editing, streaming responses, and comprehensive backend integration.

## 🚀 Features

### Core Chat Interface
- **Pixel-perfect UI/UX** - Exact replica of ChatGPT's interface
- **Dark/Light Theme** - Toggle between themes with persistent storage
- **Responsive Design** - Fully mobile-responsive and accessible (ARIA-compliant)
- **Smooth Animations** - Fluid transitions and loading states

### Advanced Chat Functionality
- **Streaming Responses** - Real-time AI response streaming using Vercel AI SDK
- **Message Editing** - Edit previous messages with automatic regeneration
- **Context Window Management** - Intelligent message truncation for model limits
- **Conversation Memory** - Persistent chat history with MongoDB storage
- **Multiple Models** - Support for various OpenAI models (GPT-3.5, GPT-4, etc.)

### File & Media Support
- **File Upload** - Support for images, documents, PDFs, and more
- **Drag & Drop** - Intuitive file upload with progress tracking
- **Cloud Storage** - Secure file storage using Cloudinary
- **Image Preview** - Inline image display in chat messages
- **File Management** - Upload progress, error handling, and file removal

### Backend & Infrastructure
- **Next.js API Routes** - Robust backend with MongoDB integration
- **Database Storage** - Conversation persistence with MongoDB
- **Authentication Ready** - Prepared for user authentication
- **Webhook Support** - External service integration capabilities
- **Error Handling** - Comprehensive error management and logging

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI Integration**: Vercel AI SDK, OpenAI API
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS with custom ChatGPT-like design
- **Icons**: Lucide React
- **Markdown**: React Markdown with syntax highlighting
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key
- Cloudinary account for file storage

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd ChatGPT-Clone
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Copy the example environment file and configure your variables:

\`\`\`bash
cp env.example .env.local
\`\`\`

Edit \`.env.local\` with your configuration:

\`\`\`env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chatgpt-clone
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/chatgpt-clone

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
\`\`\`

### 4. Database Setup

If using local MongoDB:
\`\`\`bash
# Start MongoDB service
mongod
\`\`\`

For MongoDB Atlas, ensure your connection string is correct in the environment variables.

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### OpenAI API Key
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your \`.env.local\` file

### MongoDB Setup
**Local MongoDB:**
1. Install MongoDB locally
2. Start the MongoDB service
3. Use the default connection string

**MongoDB Atlas:**
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace the MONGODB_URI in your environment file

### Cloudinary Setup
1. Create a [Cloudinary account](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from the dashboard
3. Add them to your environment file

## 📁 Project Structure

\`\`\`
ChatGPT-Clone/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completion endpoint
│   │   ├── upload/        # File upload endpoint
│   │   └── conversations/ # Conversation CRUD
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # React components
│   ├── ChatArea.tsx      # Chat message display
│   ├── FileUpload.tsx    # File upload component
│   ├── MessageBubble.tsx # Individual message display
│   ├── MessageInput.tsx  # Message input with file upload
│   └── Sidebar.tsx       # Chat history sidebar
├── hooks/                # Custom React hooks
│   └── useChat.ts        # Main chat logic hook
├── lib/                  # Utility libraries
│   ├── mongodb.ts        # MongoDB connection
│   ├── cloudinary.ts     # Cloudinary configuration
│   └── models/           # Database models
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── README.md            # This file
\`\`\`

## 🎯 Key Features Explained

### Message Editing with Regeneration
- Click the edit button on any user message
- Modify the message content
- Automatically regenerates all subsequent AI responses
- Maintains conversation context and flow

### File Upload System
- Drag and drop files or click to upload
- Real-time upload progress tracking
- Support for images, documents, and PDFs
- Secure cloud storage with Cloudinary
- Automatic file type validation and size limits

### Streaming Responses
- Real-time AI response streaming
- Smooth typing animation effect
- Proper error handling and recovery
- Context window management for long conversations

### Responsive Design
- Mobile-first responsive design
- Touch-friendly interface on mobile devices
- Collapsible sidebar for mobile screens
- Accessible keyboard navigation

## 🚀 Deployment

### Deploy to Vercel

1. **Prepare for deployment:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Vercel:**
   \`\`\`bash
   npx vercel
   \`\`\`

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all environment variables from your \`.env.local\`
   - Redeploy if necessary

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- \`OPENAI_API_KEY\`
- \`MONGODB_URI\`
- \`CLOUDINARY_CLOUD_NAME\`
- \`CLOUDINARY_API_KEY\`
- \`CLOUDINARY_API_SECRET\`
- \`NEXTAUTH_SECRET\`
- \`NEXTAUTH_URL\`

## 🔍 API Endpoints

### Chat Completion
- **POST** \`/api/chat\`
- Handles streaming chat completions
- Manages conversation context and token limits

### File Upload
- **POST** \`/api/upload\` - Upload files to Cloudinary
- **DELETE** \`/api/upload\` - Delete files from Cloudinary

### Conversations
- **GET** \`/api/conversations\` - Fetch all conversations
- **POST** \`/api/conversations\` - Create new conversation
- **PUT** \`/api/conversations\` - Update conversation
- **DELETE** \`/api/conversations\` - Delete conversation

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the model you're using is available

2. **MongoDB Connection Issues**
   - Verify MongoDB is running (if local)
   - Check connection string format
   - Ensure network access for MongoDB Atlas

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure file types are allowed

4. **Build Errors**
   - Clear \`.next\` folder and rebuild
   - Verify all environment variables are set
   - Check for TypeScript errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for the GPT models
- Vercel for the AI SDK and hosting platform
- The Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Search existing issues in the repository
3. Create a new issue with detailed information

---

**Built with ❤️ using Next.js and the Vercel AI SDK**