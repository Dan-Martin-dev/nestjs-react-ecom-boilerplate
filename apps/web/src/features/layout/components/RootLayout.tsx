import { Outlet } from '@tanstack/react-router'
import { Header } from './Header'

export function RootLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </main>
      <footer style={{ background: '#666', color: 'white', padding: '1rem' }}>
        <p>&copy; 2025 EcomStoreee</p>
      </footer>
    </div>
  )
}
