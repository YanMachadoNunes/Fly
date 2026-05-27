'use client'

import { useEffect } from 'react'
import { useFlyStore } from '@/lib/store'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const { triggerInputFocus } = useFlyStore()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K ou Cmd+K → foca o input de nova tarefa (inline, sem modal)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        triggerInputFocus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerInputFocus])

  return <>{children}</>
}
