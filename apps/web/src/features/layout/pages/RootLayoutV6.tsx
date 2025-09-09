import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import BestsellersPage from '../../bestsellers/pages/BestsellersPage'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <BestsellersPage />
      </main>
      <Footer />
    </div>
  )
}

export default RootLayout
