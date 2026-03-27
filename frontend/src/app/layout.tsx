import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EvaluateAI — LLM Evaluation Platform',
  description: 'Compare multiple language models side-by-side with automated scoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
