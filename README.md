# ChatGPT Clone

A responsive ChatGPT-style interface built with React, TypeScript, and Tailwind CSS. This project replicates the core functionality and design of ChatGPT with features like conversation management, file uploads, message editing, and streaming responses.

![ChatGPT Clone](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.2-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-cyan)

## ✨ Features

### 🎨 User Interface
- **Pixel-perfect ChatGPT design** - Authentic recreation of the ChatGPT interface
- **Dark/Light theme support** - Toggle between themes with persistent storage
- **Responsive design** - Optimized for desktop, tablet, and mobile devices
- **Collapsible sidebar** - Space-efficient navigation with expand/collapse functionality
- **Smooth animations** - Polished transitions and hover effects

### 💬 Chat Functionality
- **Real-time streaming responses** - Simulated AI responses with typing animation
- **Message editing** - Edit and update sent messages
- **Conversation management** - Create, select, and delete conversations
- **Persistent storage** - Conversations saved in localStorage
- **Message actions** - Copy, like/dislike, share, and regenerate responses

### 📁 File Handling
- **File upload support** - Drag & drop or click to upload files
- **Image previews** - Visual previews for uploaded images
- **Multiple file types** - Support for documents, images, and various file formats
- **File size formatting** - Human-readable file size display

### 🎯 Advanced Features
- **Markdown rendering** - Rich text formatting with ReactMarkdown
- **Syntax highlighting** - Code blocks with Prism.js highlighting
- **Auto-resizing input** - Dynamic textarea that grows with content
- **Keyboard shortcuts** - Enter to send, Shift+Enter for new line
- **Mobile-optimized** - Touch-friendly interface for mobile devices

## 🛠️ Technologies Used

### Frontend Framework
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development with full TypeScript support
- **Vite 5.4.2** - Fast build tool and development server

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework for rapid styling
- **Lucide React 0.344.0** - Beautiful, customizable SVG icons
- **PostCSS & Autoprefixer** - CSS processing and vendor prefixing

### Rich Text & Code
- **React Markdown 10.1.0** - Markdown rendering with GitHub Flavored Markdown
- **React Syntax Highlighter 15.6.3** - Syntax highlighting for code blocks
- **Remark GFM 4.0.1** - GitHub Flavored Markdown support

### Development Tools
- **ESLint 9.9.1** - Code linting with React-specific rules
- **TypeScript ESLint 8.3.0** - TypeScript-aware linting
- **Vite React Plugin** - Optimized React development experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatGPT-Clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ChatArea.tsx     # Main chat display area
│   ├── FileUpload.tsx   # File upload component
│   ├── MessageBubble.tsx # Individual message display
│   ├── MessageInput.tsx  # Message input with file upload
│   └── Sidebar.tsx      # Navigation sidebar
├── hooks/               # Custom React hooks
│   └── useChat.ts       # Chat state management hook
├── types/               # TypeScript type definitions
│   └── index.ts         # Core interfaces and types
├── utils/               # Utility functions
│   ├── aiSimulator.ts   # AI response simulation
│   ├── fileUtils.ts     # File processing utilities
│   └── storage.ts       # LocalStorage management
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## 🎯 Key Components

### `useChat` Hook
Central state management for:
- Conversation management
- Message handling
- Theme switching
- Local storage persistence

### `MessageBubble`
Renders individual messages with:
- Markdown and code syntax highlighting
- File attachment display
- Edit functionality
- Action buttons (copy, like, share)

### `Sidebar`
Navigation component featuring:
- Conversation list
- Theme toggle
- Collapsible design
- User profile section

### `MessageInput`
Input component with:
- Auto-resizing textarea
- File upload integration
- Keyboard shortcuts
- Send button with state management

## 🎨 Design Features

- **Authentic ChatGPT styling** with custom color schemes
- **Smooth transitions** and hover effects
- **Mobile-first responsive design**
- **Dark mode** with proper contrast ratios
- **Loading states** and streaming animations
- **Accessible UI** with proper ARIA labels and keyboard navigation

## 🔧 Configuration

### Tailwind CSS
Custom configuration for ChatGPT-specific colors and utilities.

### Vite
Optimized build configuration with React plugin and dependency exclusions.

### TypeScript
Strict type checking with modern ES features enabled.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspiration from OpenAI's ChatGPT interface
- Icons provided by Lucide React
- Syntax highlighting powered by Prism.js
- Built with the amazing React and TypeScript ecosystem

---

**Note**: This is a demonstration project that simulates AI responses. For production use, integrate with actual AI APIs like OpenAI's GPT models or other language model services.
