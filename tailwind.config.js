/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chat-dark': '#343541',
        'chat-darker': '#202123',
        'chat-border': '#565869',
        'chat-gray': '#40414f',
        'chat-light-gray': '#f7f7f8',
        'chat-green': '#10a37f',
        'chat-green-hover': '#0d8f72',
        'chat-red': '#ef4444',
        'chat-blue': '#3b82f6',
      },
      fontFamily: {
        'sans': ['Söhne', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      maxWidth: {
        '4xl': '56rem',
        '5xl': '64rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
