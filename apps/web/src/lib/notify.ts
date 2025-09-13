import { toast } from 'sonner'

const shown: Record<string, number> = {}
const DEDUPE_MS = 3000

function dedupe(message?: string) {
  if (!message) return false
  const now = Date.now()
  const last = shown[message]
  if (last && now - last < DEDUPE_MS) return false
  shown[message] = now
  return true
}

export const notify = {
  success: (message?: string) => {
    if (!message) return
    if (!dedupe(message)) return
    toast.success(message)
  },
  error: (message?: string) => {
    if (!message) return
    if (!dedupe(message)) return
    toast.error(message)
  },
  info: (message?: string) => {
    if (!message) return
    if (!dedupe(message)) return
    toast(message)
  },
}

export default notify

// Format various shapes of API errors into a readable string
export function formatApiError(err: unknown): string {
  if (!err) return 'An error occurred. Please try again.'
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message

  const e = err as Record<string, unknown>
  const response = e.response as Record<string, unknown> | undefined
  const data = response?.data as Record<string, unknown> | undefined

  const maybeMessage = (data && data.message) ?? e.message
  if (!maybeMessage) return 'Server error. Try again later.'

  // message can be array, object or string
  if (Array.isArray(maybeMessage)) return maybeMessage.join('; ')
  if (typeof maybeMessage === 'object') {
    try {
      // attempt to flatten object values
      const vals = Object.values(maybeMessage as Record<string, unknown>)
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .map(String)
      return vals.join('; ')
    } catch {
      return JSON.stringify(maybeMessage)
    }
  }

  return String(maybeMessage)
}
