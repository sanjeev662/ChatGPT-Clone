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
      },
    },
  },
  plugins: [],
}
