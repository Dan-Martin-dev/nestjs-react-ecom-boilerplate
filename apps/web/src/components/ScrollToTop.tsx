import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component
 * - scrolls window to top on route pathname changes
 * - safe for SSR because it guards window usage
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    try {
      // 'instant' isn't a standard ScrollBehavior, but some browsers accept it.
      // Fallback to the simple scrollTo if it throws.
      window.scrollTo({ top: 0, left: 0 })
    } catch {
      try {
        window.scrollTo(0, 0)
      } catch {
        // ignore
      }
    }
  }, [pathname])

  return null
}
