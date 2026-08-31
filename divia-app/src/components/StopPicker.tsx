import { useMemo, useState } from 'react'
import type { StopAreaObject } from '../api/divia'

export function StopPicker({
  stops,
  loading,
  error,
  onSelect,
  onBack,
}: {
  stops: StopAreaObject[]
  loading: boolean
  error: string | null
  onSelect: (stop: StopAreaObject) => void
  onBack: () => void
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stops
    return stops.filter((s) => s.name.toLowerCase().includes(q))
  }, [stops, query])

  return (
    <div className="flex flex-col gap-3">
      <button onClick={onBack} className="self-start text-sm text-slate-400 hover:text-white">
        ← Changer de ligne
      </button>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un arrêt…"
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
      />
      {loading && <p className="text-sm text-slate-400">Chargement des arrêts…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && (
        <ul className="flex max-h-80 flex-col divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800">
          {filtered.map((stop) => (
            <li key={stop.id}>
              <button
                onClick={() => onSelect(stop)}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                {stop.name}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-slate-500">Aucun arrêt ne correspond à « {query} ».</li>
          )}
        </ul>
      )}
    </div>
  )
}
