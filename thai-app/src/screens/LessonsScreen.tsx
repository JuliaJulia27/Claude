import { Link } from 'react-router-dom'
import { LESSON_MODULES } from '../data/lessons'
import { useSettings } from '../hooks/useSettings'

export function LessonsScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  return (
    <div className="mx-auto max-w-lg space-y-3 px-4 py-5">
      {LESSON_MODULES.map((m, i) => (
        <Link
          key={m.id}
          to={`/lessons/${m.id}`}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-emerald-600"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-emerald-300">
            {i}
          </span>
          <div>
            <p className="font-semibold">{m.title[uiLang]}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{m.intro[uiLang]}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
