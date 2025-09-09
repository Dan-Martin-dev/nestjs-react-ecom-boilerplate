import React from 'react'
import { Outlet } from 'react-router-dom'

/**
 * CartLayout
 * - Small wrapper for cart and checkout flows. Place cart-specific banners, promos, or wrappers here.
 */
const CartLayout: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Outlet />
    </div>
  )
}

export default CartLayout
