import { Link, useParams } from 'react-router-dom'
import { LESSON_MODULES } from '../data/lessons'
import { PHRASES } from '../data/phrases'
import { PhraseDisplay } from '../components/PhraseDisplay'
import { ToneCurve } from '../components/ToneCurve'
import { TONE_LABELS, TONES } from '../domain/types'
import { useSettings } from '../hooks/useSettings'

export function LessonDetailScreen() {
  const { id } = useParams()
  const uiLang = useSettings((s) => s.uiLang)
  const module = LESSON_MODULES.find((m) => m.id === id)

  if (!module) return <p className="p-4">Урок не найден</p>

  const isTheory = module.category === 'tone-theory'
  const phrases = PHRASES.filter((p) => p.category === (isTheory ? 'tones' : module.category))

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
      <h2 className="text-xl font-bold">{module.title[uiLang]}</h2>
      <p className="text-sm text-slate-400">{module.intro[uiLang]}</p>

      {isTheory && (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
          {TONES.map((tone) => (
            <div key={tone} className="flex items-center gap-3">
              <ToneCurve tone={tone} size={28} />
              <span className="text-sm">
                <strong className="capitalize">{TONE_LABELS[tone][uiLang]}</strong>{' '}
                <span className="text-slate-500">{TONE_LABELS[tone].symbol}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {phrases.map((p) => (
          <PhraseDisplay key={p.id} phrase={p} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Link
          to={`/exercises/flashcards?category=${isTheory ? 'tones' : module.category}`}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
        >
          {uiLang === 'ru' ? 'Флеш-карточки' : 'Cartes mémoire'}
        </Link>
        <Link
          to={`/exercises/quiz?category=${isTheory ? 'tones' : module.category}`}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold"
        >
          {uiLang === 'ru' ? 'Тест' : 'Quiz'}
        </Link>
        <Link
          to={`/exercises/listening?category=${isTheory ? 'tones' : module.category}`}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold"
        >
          {uiLang === 'ru' ? 'На слух' : 'Écoute'}
        </Link>
        <Link
          to={`/tone-trainer?category=${isTheory ? 'tones' : module.category}`}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold"
        >
          🎙️ {uiLang === 'ru' ? 'Тренажёр тонов' : 'Tons'}
        </Link>
      </div>
    </div>
  )
}
