import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A ChatGPT clone built with Next.js, React, and Tailwind CSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
