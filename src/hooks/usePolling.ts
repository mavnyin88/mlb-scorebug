import { useEffect, useRef, useState } from 'react'

interface UsePollingOptions {
  interval: number
  enabled: boolean
}

interface UsePollingResult<T> {
  data: T | null
  isPending: boolean
  error: string | null
  lastUpdated: Date | null
}

/**
 * Custom hook for polling an async function at regular intervals
 * Handles cleanup, prevents memory leaks, and implements exponential backoff on errors
 */
export const usePolling = <T,>(
  callback: () => Promise<T>,
  { interval, enabled }: UsePollingOptions
): UsePollingResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const backoffRef = useRef(0) // 0 = no backoff, 1 = 20s, 2 = 40s, 3 = 60s max

  const fetch = async () => {
    setIsPending(true)
    try {
      const result = await callback()
      setData(result)
      setError(null)
      setLastUpdated(new Date())
      backoffRef.current = 0 // Reset backoff on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Increment backoff: 0 → 1 → 2 → 3 (max 60s)
      backoffRef.current = Math.min(backoffRef.current + 1, 3)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Fetch immediately on enable
    fetch().then(() => {
      // Schedule next fetch
      const backoffMultiplier = backoffRef.current === 0 ? 0 : Math.pow(2, backoffRef.current - 1)
      const backoffDelay = backoffMultiplier * 10000 // 0, 10s, 20s, 40s
      const nextInterval = interval + backoffDelay

      timeoutRef.current = setTimeout(() => {
        fetch()
      }, nextInterval)
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [enabled, interval])

  return { data, isPending, error, lastUpdated }
}
