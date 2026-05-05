import { useEffect, useState } from 'react'

/**
 * Custom hook that detects if the current page/tab is visible to the user
 * Returns true if visible, false if hidden (tab is in background)
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}
