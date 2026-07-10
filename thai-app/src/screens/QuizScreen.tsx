import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PHRASES } from '../data/phrases'
import { phrasesForExercise, buildMultipleChoice } from '../services/exerciseHelpers'
import { ToneCurve } from '../components/ToneCurve'
import { logAttempt } from '../db/db'
import { useSettings } from '../hooks/useSettings'
import type { Category, Phrase } from '../domain/types'

function useRound(category: Category | null, roundKey: number) {
  const deck = useMemo(() => phrasesForExercise(category), [category])
  return useMemo(() => {
    const correct = deck[Math.floor(Math.random() * deck.length)]
    const options = buildMultipleChoice(correct, PHRASES)
    return { correct, options }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, roundKey])
}

export function QuizScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [params] = useSearchParams()
  const category = params.get('category') as Category | null

  const [round, setRound] = useState(() => ({ key: 0 }))
  const { correct, options } = useRound(category, round.key)
  const [selected, setSelected] = useState<Phrase | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  async function choose(option: Phrase) {
    if (selected) return
    setSelected(option)
    const isCorrect = option.id === correct.id
    setScore((s) => ({ right: s.right + (isCorrect ? 1 : 0), total: s.total + 1 }))
    await logAttempt({ phraseId: correct.id, type: 'multiple-choice', correct: isCorrect })
  }

  function next() {
    setSelected(null)
    setRound((r) => ({ key: r.key + 1 }))
  }

  if (!correct) return <p className="p-4">Нет фраз для этой категории.</p>

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
      <p className="text-sm text-slate-500">
        {uiLang === 'ru' ? `Счёт: ${score.right}/${score.total}` : `Score : ${score.right}/${score.total}`}
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {uiLang === 'ru' ? 'Выберите правильный перевод' : 'Choisissez la bonne traduction'}
        </p>
        <p className="mt-1 text-lg font-semibold">{uiLang === 'ru' ? correct.ru : correct.fr}</p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isCorrectOpt = opt.id === correct.id
          const showState = selected !== null
          const style = !showState
            ? 'border-slate-800 bg-slate-900'
            : isCorrectOpt
              ? 'border-emerald-500 bg-emerald-950'
              : opt.id === selected?.id
                ? 'border-red-500 bg-red-950'
                : 'border-slate-800 bg-slate-900 opacity-50'
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${style}`}
            >
              <div className="flex gap-1">
                {opt.syllables.map((s, i) => (
                  <ToneCurve key={i} tone={s.tone} size={18} />
                ))}
              </div>
              <div>
                <p className="thai-script text-slate-100">{opt.thai}</p>
                <p className="text-xs text-emerald-300">{opt.syllables.map((s) => s.cyr).join(' ')}</p>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <button onClick={next} className="w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-emerald-950">
          {uiLang === 'ru' ? 'Далее' : 'Suivant'}
        </button>
      )}
    </div>
  )
}
