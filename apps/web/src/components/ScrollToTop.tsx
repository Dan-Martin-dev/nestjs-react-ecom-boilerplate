import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

type ScrollToTopProps = {
  // Optional CSS selector for a scrollable container. If provided, the container will be scrolled.
  containerSelector?: string
  // Optional offset in pixels (useful for fixed headers)
  offset?: number
  // Use smooth scroll when possible
  smooth?: boolean
  // Force scroll on page reload (default: true)
  forceOnReload?: boolean
}

/**
 * Enhanced ScrollToTop component that:
 * - Scrolls window or specified container to top on route changes AND page reload
 * - Handles hash anchors properly (scrolls to the element with that ID)
 * - Blurs active elements before scrolling (helps with mobile keyboards)
 * - Supports offset for fixed headers
 * - Uses small timeouts to ensure content is rendered before scrolling
 * - Has fallbacks for different browser implementations
 * - Handles initial page load/reload in addition to navigation
 * - Safe for SSR because it guards window usage
 */
export default function ScrollToTop({ 
  containerSelector, 
  offset = 0, 
  smooth = false,
  forceOnReload = true
}: ScrollToTopProps = {}) {
  const { pathname, hash, key } = useLocation()
  const navigationKeyRef = useRef<string | null>(null)
  const isInitialMount = useRef(true)
  
  // Use a safe version of useLayoutEffect (falls back to useEffect in SSR)
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

  // Force scroll to top function - more aggressive approach for page reloads
  const forceScrollToTop = () => {
    // First hide any mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      try { document.activeElement.blur() } catch (e) { void e }
    }
    
    // Try multiple scroll methods for maximum compatibility
    if (containerSelector) {
      try {
        const container = document.querySelector(containerSelector) as HTMLElement | null
        if (container && typeof container.scrollTo === 'function') {
          container.scrollTo(0, 0)
          container.scrollTo({ top: 0, behavior: 'auto' })
        }
      } catch (e) { void e }
    }
    
    // Try all possible scroll methods on window
    try {
      // Method 1: standard scrollTo with options object
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch (e1) { 
      try {
        // Method 2: older browsers
        window.scrollTo(0, 0)
      } catch (e2) { 
        try {
          // Method 3: direct assignment (very old browsers)
          window.pageYOffset = 0
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        } catch (e3) { void e3 }
        void e2
      }
      void e1
    }
  }

  // Immediately invoke on component mount - ensures it works on page reload
  useEffect(() => {
    if (forceOnReload && isInitialMount.current) {
      // Force scroll immediately
      forceScrollToTop()
      
      // Try again after a short delay to handle late-rendering content
      setTimeout(forceScrollToTop, 50)
      
      // Add more event listeners to ensure it works in all scenarios
      const domLoadHandler = () => setTimeout(forceScrollToTop, 10)
      const loadHandler = () => setTimeout(forceScrollToTop, 10)
      
      document.addEventListener('DOMContentLoaded', domLoadHandler)
      window.addEventListener('load', loadHandler)
      
      return () => {
        document.removeEventListener('DOMContentLoaded', domLoadHandler)
        window.removeEventListener('load', loadHandler)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOnReload]) // forceScrollToTop is deliberately omitted as it's defined in component scope
  
  // Handle page reload and initial mount separately from navigation
  useIsomorphicLayoutEffect(() => {
    // Skip if hash navigation (let the regular navigation handler deal with it)
    if (hash) return
    
    // Immediately scroll to top on first render - critical for page reload behavior
    const performInitialScroll = () => {
      if (document.activeElement instanceof HTMLElement) {
        try { document.activeElement.blur() } catch (e) { void e }
      }
      
      if (containerSelector) {
        try {
          const container = document.querySelector(containerSelector) as HTMLElement | null
          if (container && typeof container.scrollTo === 'function') {
            container.scrollTo({ top: 0, behavior: 'auto' })
            return
          }
        } catch (e) { void e }
      }
      
      try {
        window.scrollTo({ top: 0, behavior: 'auto' })
      } catch (e) {
        try { window.scrollTo(0, 0) } catch (e2) { void e2 }
        void e
      }
    }
    
    // Only run on initial mount, not on every render
    if (isInitialMount.current) {
      isInitialMount.current = false
      performInitialScroll()
      
      // Additional insurance: also trigger scroll on window.load
      const handleLoad = () => {
        setTimeout(performInitialScroll, 50)
        setTimeout(forceScrollToTop, 100)
      }
      
      if (document.readyState === 'complete') {
        setTimeout(performInitialScroll, 50)
        setTimeout(forceScrollToTop, 150)
      } else {
        window.addEventListener('load', handleLoad)
        return () => window.removeEventListener('load', handleLoad)
      }
    }
  }, [containerSelector, hash])

  // Handle navigation (route changes)
  useEffect(() => {
    // Avoid duplicate scrolls for same navigation event
    if (navigationKeyRef.current === key) return
    navigationKeyRef.current = key

    // Define scroll behavior (false = instant for better mobile UX)
    const behavior = smooth ? 'smooth' : 'auto'

    const performScrollTo = () => {
      // If hash is present, try to scroll to the element with that ID
      if (hash) {
        setTimeout(() => {
          try {
            const el = document.getElementById(hash.replace('#', ''))
            if (el) {
              const top = el.getBoundingClientRect().top + window.pageYOffset - (offset || 0)
              window.scrollTo({ top, behavior })
              return
            }
          } catch (e) {
            // If scrolling to hash fails, fall back to top
            void e
          }
          window.scrollTo({ top: 0, behavior })
        }, 60) // Small delay to ensure element is rendered
        return
      }

      // If a specific container is provided, scroll that first
      if (containerSelector) {
        try {
          const container = document.querySelector(containerSelector) as HTMLElement | null
          if (container && typeof container.scrollTo === 'function') {
            container.scrollTo({ top: 0, behavior })
            return
          }
        } catch (e) {
          // Fall back to window scroll
          void e
        }
      }

      // Blur active element to hide mobile keyboard (fixes scroll issues on many mobile browsers)
      if (document.activeElement instanceof HTMLElement) {
        try { document.activeElement.blur() } catch (e) { void e }
      }

      // Allow a small delay for lazy-rendered content before scrolling
      setTimeout(() => {
        try {
          window.scrollTo({ top: 0, behavior })
        } catch (e) {
          try { window.scrollTo(0, 0) } catch (e2) { void e2 }
          void e
        }
      }, 40)

      // Fallback: ensure position is at top after some time in case the first attempt failed
      setTimeout(() => {
        if (window.pageYOffset !== 0) window.scrollTo(0, 0)
      }, 350)
    }

    performScrollTo()
  }, [pathname, hash, key, containerSelector, offset, smooth])

  return null
}
