import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import ScrollToTop from '../../../components/ScrollToTop'
import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default RootLayout
