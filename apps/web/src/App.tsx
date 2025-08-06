import { Providers } from './app/providers'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './globals.css'

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}

export default App
