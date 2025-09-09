import React from 'react'
import { Suspense } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'

export default function Loadable({ children, fallback = <div className="p-8 text-center">Loading...</div> }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
