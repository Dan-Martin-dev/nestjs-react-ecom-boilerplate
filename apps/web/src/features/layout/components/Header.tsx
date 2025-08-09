import { Link } from 'react-router-dom'
import { ShoppingCart} from 'lucide-react'
import { Button } from '@mantine/core'

export function Header() {
  return (
    <header style={{ background: '#1976d2', color: 'white', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EcomStore</span>
        </Link>
        
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>
            Products
          </Link>
        </nav>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/cart">
            <Button variant="outline" style={{ color: 'white' }}>
              <ShoppingCart size={16} />
            </Button>
          </Link>
          
          <Link to="/auth/login">
            <Button variant="outline" style={{ color: 'white' }}>Sign In</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
