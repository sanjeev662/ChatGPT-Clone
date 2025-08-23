# ChatGPT Clone - Next.js

A modern ChatGPT clone built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Modern UI**: Clean, responsive design matching ChatGPT's interface
- 🌓 **Dark/Light Mode**: Toggle between themes
- 💬 **Real-time Chat**: Simulated AI responses with typing animation
- 📁 **File Uploads**: Support for images and documents
- 💾 **Persistent Storage**: Conversations saved in localStorage
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Markdown**: React Markdown with syntax highlighting
- **State Management**: React hooks (useState, useEffect)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatgpt-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chatgpt-nextjs/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ChatArea.tsx      # Main chat interface
│   ├── FileUpload.tsx    # File upload component
│   ├── MessageBubble.tsx # Individual message display
│   ├── MessageInput.tsx  # Message input form
│   └── Sidebar.tsx       # Navigation sidebar
├── hooks/                 # Custom React hooks
│   └── useChat.ts        # Chat state management
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
├── utils/                 # Utility functions
│   ├── aiSimulator.ts    # AI response simulation
│   ├── fileUtils.ts      # File handling utilities
│   └── storage.ts        # localStorage utilities
└── public/               # Static assets
```

## Features in Detail

### Chat Interface
- Clean, modern design inspired by ChatGPT
- Message bubbles with proper styling for user and AI messages
- Markdown support with syntax highlighting for code blocks
- Copy, edit, and regenerate message functionality

### Sidebar Navigation
- Collapsible sidebar with conversation history
- Search functionality (UI ready)
- Theme toggle between light and dark modes
- User profile section

### File Handling
- Drag and drop file uploads
- Image preview support
- File size and type validation
- Multiple file attachments per message

### Responsive Design
- Mobile-first approach
- Adaptive sidebar behavior
- Touch-friendly interface
- Optimized for all screen sizes

## Customization

### Themes
The app supports light and dark themes. You can customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'chat-dark': '#343541',
      'chat-darker': '#202123',
      'chat-border': '#565869',
      // Add your custom colors
    },
  },
}
```

### AI Responses
Modify the AI response simulation in `utils/aiSimulator.ts` to:
- Add more response variations
- Implement context-aware responses
- Connect to real AI APIs (OpenAI, Anthropic, etc.)

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by OpenAI's ChatGPT interface
- Built with modern React and Next.js best practices
- Icons provided by Lucide React
