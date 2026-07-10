import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { phrasesForExercise } from '../services/exerciseHelpers'
import { PhraseDisplay } from '../components/PhraseDisplay'
import { reviewPhrase, logAttempt } from '../db/db'
import { useSettings } from '../hooks/useSettings'
import type { Category } from '../domain/types'

const RATINGS = [
  { quality: 0 as const, label: { ru: 'Забыл', fr: 'Oublié' }, color: 'bg-red-500' },
  { quality: 3 as const, label: { ru: 'Трудно', fr: 'Difficile' }, color: 'bg-orange-500' },
  { quality: 4 as const, label: { ru: 'Хорошо', fr: 'Bien' }, color: 'bg-emerald-500' },
  { quality: 5 as const, label: { ru: 'Легко', fr: 'Facile' }, color: 'bg-sky-500' },
]

export function FlashcardsScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [params] = useSearchParams()
  const category = params.get('category') as Category | null
  const deck = useMemo(() => phrasesForExercise(category), [category])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)

  const phrase = deck[index % deck.length]

  async function rate(quality: 0 | 3 | 4 | 5) {
    await reviewPhrase(phrase.id, quality)
    await logAttempt({ phraseId: phrase.id, type: 'flashcard', correct: quality >= 3 })
    setDone((d) => d + 1)
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  if (deck.length === 0) return <p className="p-4">Нет фраз для этой категории.</p>

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
      <p className="text-sm text-slate-500">
        {uiLang === 'ru' ? `Карточка ${(index % deck.length) + 1} из ${deck.length} · пройдено ${done}` : `Carte ${(index % deck.length) + 1}/${deck.length} · faites ${done}`}
      </p>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="mb-3 text-lg font-semibold">{uiLang === 'ru' ? phrase.ru : phrase.fr}</p>
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold"
          >
            {uiLang === 'ru' ? 'Показать ответ' : 'Afficher la réponse'}
          </button>
        ) : (
          <PhraseDisplay phrase={phrase} showMeaning={false} />
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.quality}
              onClick={() => rate(r.quality)}
              className={`rounded-lg ${r.color} px-2 py-2 text-xs font-semibold text-slate-950`}
            >
              {r.label[uiLang]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
