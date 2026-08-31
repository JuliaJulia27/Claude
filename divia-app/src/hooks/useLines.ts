import { useEffect, useState } from 'react'
import { listLines } from '../api/divia'
import type { LineObject } from '../api/divia'
import type { Mode } from '../domain/types'

export function useLines(mode: Mode) {
  const [lines, setLines] = useState<LineObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listLines(mode)
      .then((data) => {
        if (cancelled) return
        const sorted = [...data].sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }))
        setLines(sorted)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode])

  return { lines, loading, error }
}
