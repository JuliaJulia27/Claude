import { useEffect, useState } from 'react'
import { listStops } from '../api/divia'
import type { StopAreaObject } from '../api/divia'

export function useStops(lineId: string | null) {
  const [stops, setStops] = useState<StopAreaObject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lineId) {
      setStops([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    listStops(lineId)
      .then((data) => {
        if (cancelled) return
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        setStops(sorted)
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
  }, [lineId])

  return { stops, loading, error }
}
