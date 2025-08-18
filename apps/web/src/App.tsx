import { Providers } from './app/providers'
import { RouterProvider } from 'react-router-dom'
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
