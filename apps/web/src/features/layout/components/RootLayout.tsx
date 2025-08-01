import { Outlet } from '@tanstack/react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { Toaster } from '../../../components/ui/toast'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
