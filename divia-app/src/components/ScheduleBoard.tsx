import { useEffect, useMemo, useState } from 'react'
import type { ScheduleObject } from '../api/divia'
import { formatClock, formatRelative } from '../utils/time'
import { toHex } from '../utils/color'

interface DirectionGroup {
  id: string
  label: string
  color: string
  textColor: string
  schedule: ScheduleObject
}

export function ScheduleBoard({
  schedules,
  loading,
  error,
  updatedAt,
  onRefresh,
}: {
  schedules: ScheduleObject[] | null
  loading: boolean
  error: string | null
  updatedAt: number | null
  onRefresh: () => void
}) {
  // Réévalue "dans N min" régulièrement, sans attendre le prochain appel réseau.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(t)
  }, [])

  const groups: DirectionGroup[] = useMemo(() => {
    if (!schedules) return []
    return schedules.map((s) => ({
      id: s.route.direction.id,
      label: s.display_informations.direction || s.route.direction.name,
      color: toHex(s.display_informations.color),
      textColor: toHex(s.display_informations.text_color, '#ffffff'),
      schedule: s,
    }))
  }, [schedules])

  // Filtre par direction choisie par l'utilisateur ; ne se réinitialise que
  // si cette direction a disparu (nouvel arrêt/ligne), pas à chaque rafraîchissement.
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(null)
  useEffect(() => {
    if (selectedDirectionId && !groups.some((g) => g.id === selectedDirectionId)) {
      setSelectedDirectionId(null)
    }
  }, [groups, selectedDirectionId])

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
        {error}
        <button onClick={onRefresh} className="mt-2 block text-red-200 underline">
          Réessayer
        </button>
      </div>
    )
  }

  if (loading && !schedules) {
    return <p className="text-sm text-slate-400">Chargement des horaires…</p>
  }

  if (!schedules || groups.length === 0) {
    return <p className="text-sm text-slate-400">Aucun passage prévu pour le moment à cet arrêt.</p>
  }

  const visibleGroups = selectedDirectionId ? groups.filter((g) => g.id === selectedDirectionId) : groups

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{updatedAt ? `Mis à jour à ${formatClock(new Date(updatedAt))}` : ''}</span>
        <button onClick={onRefresh} disabled={loading} className="text-sky-400 hover:text-sky-300 disabled:opacity-50">
          {loading ? 'Actualisation…' : 'Actualiser'}
        </button>
      </div>

      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDirectionId(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              selectedDirectionId === null ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Toutes les directions
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedDirectionId(g.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                selectedDirectionId === g.id ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {visibleGroups.map((g) => (
        <div key={g.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: g.color, color: g.textColor }}
            >
              Direction
            </span>
            <h3 className="text-sm font-semibold text-white">{g.label}</h3>
          </div>
          {g.schedule.date_times.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun passage à venir.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {g.schedule.date_times.slice(0, 6).map((dt, i) => (
                <div key={i} className="flex min-w-[76px] flex-col items-center rounded-lg bg-slate-800 px-3 py-2">
                  <span className="text-lg font-bold text-white">{formatRelative(dt.date_time, now)}</span>
                  <span className="text-[11px] text-slate-400">{formatClock(dt.date_time)}</span>
                  {dt.data_freshness === 'realtime' ? (
                    <span className="mt-1 text-[10px] font-medium text-emerald-400">temps réel</span>
                  ) : (
                    <span className="mt-1 text-[10px] text-slate-500">théorique</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
