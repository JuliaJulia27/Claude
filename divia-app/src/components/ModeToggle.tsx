import type { Mode } from '../domain/types'

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-full bg-slate-800 p-1">
      {(['tramway', 'bus'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            mode === m ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          {m === 'tramway' ? 'Tram' : 'Bus'}
        </button>
      ))}
    </div>
  )
}
