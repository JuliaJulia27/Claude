import { useCallback, useEffect, useRef, useState } from 'react'
import { getSchedules } from '../api/divia'
import type { ScheduleObject } from '../api/divia'

const POLL_MS = 30_000

export function useSchedules(lineId: string | null, stopId: string | null) {
  const [schedules, setSchedules] = useState<ScheduleObject[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const requestId = useRef(0)

  const fetchNow = useCallback(async () => {
    if (!lineId || !stopId) return
    const id = ++requestId.current
    setLoading(true)
    try {
      const data = await getSchedules(lineId, stopId)
      if (id !== requestId.current) return
      setSchedules(data)
      setError(null)
      setUpdatedAt(Date.now())
    } catch (err) {
      if (id !== requestId.current) return
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [lineId, stopId])

  useEffect(() => {
    setSchedules(null)
    setError(null)
    setUpdatedAt(null)
    if (!lineId || !stopId) return
    fetchNow()
    const timer = setInterval(fetchNow, POLL_MS)
    return () => clearInterval(timer)
  }, [lineId, stopId, fetchNow])

  return { schedules, error, loading, updatedAt, refresh: fetchNow }
}
