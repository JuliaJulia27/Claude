import type { LineObject } from '../api/divia'
import { toHex } from '../utils/color'

export function LineList({
  lines,
  loading,
  error,
  onSelect,
}: {
  lines: LineObject[]
  loading: boolean
  error: string | null
  onSelect: (line: LineObject) => void
}) {
  if (loading) return <p className="text-sm text-slate-400">Chargement des lignes…</p>
  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (lines.length === 0) return <p className="text-sm text-slate-400">Aucune ligne trouvée.</p>

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {lines.map((line) => (
        <button
          key={line.id}
          onClick={() => onSelect(line)}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 p-3 transition hover:border-slate-500"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: toHex(line.color), color: toHex(line.text_color, '#ffffff') }}
          >
            {line.code}
          </span>
          <span className="line-clamp-2 text-center text-[11px] leading-tight text-slate-300">{line.name}</span>
        </button>
      ))}
    </div>
  )
}
