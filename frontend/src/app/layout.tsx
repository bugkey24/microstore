import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MicroStore | Premium E-Commerce',
  description: 'A microservices-powered shopping experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-20 pb-12">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
