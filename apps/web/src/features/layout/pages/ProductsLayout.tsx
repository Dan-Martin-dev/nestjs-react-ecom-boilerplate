import React from 'react'
import { Outlet } from 'react-router-dom'

/**
 * ProductsLayout
 * - Provides a small wrapper and consistent container for all product-related routes
 * - Use this file to add product-listing specific scaffolding (filters, sidebars, etc.)
 */
const ProductsLayout: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* future: add filters/sidebar/header for product pages here */}
      <Outlet />
    </div>
  )
}

export default ProductsLayout
