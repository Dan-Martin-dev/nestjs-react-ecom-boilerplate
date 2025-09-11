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
