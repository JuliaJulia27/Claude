import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, toneAccuracyStats } from '../db/db'
import { TONE_LABELS, TONES } from '../domain/types'
import { TONE_COLORS } from '../components/ToneCurve'
import { useSettings } from '../hooks/useSettings'

export function ProgressScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof toneAccuracyStats>> | null>(null)
  const [totals, setTotals] = useState({ reviewed: 0, attempts: 0 })

  useEffect(() => {
    toneAccuracyStats().then(setStats)
    Promise.all([db.progress.count(), db.attempts.count()]).then(([reviewed, attempts]) =>
      setTotals({ reviewed, attempts }),
    )
  }, [])

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totals.reviewed}</p>
          <p className="text-xs text-slate-500">{uiLang === 'ru' ? 'фраз в изучении' : 'phrases en apprentissage'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totals.attempts}</p>
          <p className="text-xs text-slate-500">{uiLang === 'ru' ? 'всего попыток' : 'tentatives au total'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="mb-3 text-sm font-semibold">
          {uiLang === 'ru' ? 'Точность по тонам (тренажёр)' : 'Précision par ton (entraîneur)'}
        </p>
        <div className="space-y-2">
          {TONES.map((tone) => {
            const s = stats?.[tone]
            const pct = s?.avgScore ?? 0
            return (
              <div key={tone}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span>{TONE_LABELS[tone][uiLang]}</span>
                  <span className="text-slate-500">{s?.total ? `${pct}% · ${s.total}` : '—'}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: TONE_COLORS[tone] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Link to="/settings" className="block rounded-xl border border-slate-800 bg-slate-900 p-4 text-center text-sm">
        ⚙️ {uiLang === 'ru' ? 'Настройки и данные' : 'Paramètres et données'}
      </Link>
    </div>
  )
}
