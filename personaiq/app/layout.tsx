import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PersonaIQ - AI Adoption Platform',
  description: 'Identify and coach AI adoption personas in your organization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
